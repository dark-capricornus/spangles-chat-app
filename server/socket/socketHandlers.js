const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

// Store active users
const activeUsers = new Map();

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};

const handleConnection = (io) => {
  io.use(socketAuth);

  io.on('connection', async (socket) => {
    activeUsers.set(socket.userId, {
      socketId: socket.id,
      user: socket.user,
      lastSeen: new Date()
    });

    await User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      lastSeen: new Date()
    });

    // Join user's personal room
    socket.join(socket.userId);

    // Join user's chat rooms
    try {
      const userChats = await Chat.find({
        participants: socket.userId,
        isActive: true
      }).select('_id');

      userChats.forEach(chat => {
        socket.join(chat._id.toString());
      });
    } catch (error) {
      console.error('Error joining chat rooms:', error);
    }

    // Emit user online status to contacts
    socket.broadcast.emit('user_online', {
      userId: socket.userId,
      username: socket.user.username,
      isOnline: true
    });

    // Handle joining specific chat room
    socket.on('join_chat', async (chatId) => {
      try {
        const chat = await Chat.findOne({
          _id: chatId,
          participants: socket.userId
        });

        if (chat) {
          socket.join(chatId);
          socket.emit('joined_chat', { chatId });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Handle leaving chat room
    socket.on('leave_chat', (chatId) => {
      socket.leave(chatId);
      socket.emit('left_chat', { chatId });
    });

    // Handle sending message
    socket.on('send_message', async (data) => {
      try {
        const { chatId, content, messageType = 'text', replyTo } = data;

        // Verify user is participant in chat
        const chat = await Chat.findOne({
          _id: chatId,
          participants: socket.userId
        });

        if (!chat) {
          return socket.emit('error', { message: 'Chat not found or access denied' });
        }

        // Extract mentions
        const mentions = content.match(/@[\w]+/g)?.map(mention => mention.slice(1)) || [];
        const mentionedUsers = await User.find({ 
          username: { $in: mentions } 
        }).select('_id username');

        // Create message
        const message = new Message({
          chat: chatId,
          sender: socket.userId,
          content,
          messageType,
          replyTo,
          mentions: mentionedUsers.map(user => user._id)
        });

        await message.save();
        await message.populate('sender', 'username fullName avatar');
        await message.populate('replyTo', 'content sender');

        // Update chat's last message and activity
        chat.lastMessage = message._id;
        chat.lastActivity = new Date();
        await chat.save();

        // Emit to all participants in the chat
        io.to(chatId).emit('new_message', message);

        // Send delivery status to sender
        socket.emit('message_sent', {
          tempId: data.tempId,
          message
        });

        // Create notifications for mentioned users
        if (mentionedUsers.length > 0) {
          const Notification = require('../models/Notification');
          const notifications = mentionedUsers
            .filter(user => user._id.toString() !== socket.userId)
            .map(user => ({
              recipient: user._id,
              sender: socket.userId,
              type: 'mention',
              message: `${socket.user.fullName} mentioned you in ${chat.isGroupChat ? chat.groupName : 'a chat'}`,
              relatedChat: chatId
            }));
          
          if (notifications.length > 0) {
            await Notification.insertMany(notifications);
            
            // Emit notification to mentioned users
            notifications.forEach(notification => {
              io.to(notification.recipient.toString()).emit('new_notification', notification);
            });
          }
        }

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing_start', (data) => {
      const { chatId } = data;
      socket.to(chatId).emit('user_typing', {
        userId: socket.userId,
        username: socket.user.username,
        chatId
      });
    });

    socket.on('typing_stop', (data) => {
      const { chatId } = data;
      socket.to(chatId).emit('user_stop_typing', {
        userId: socket.userId,
        chatId
      });
    });

    // Handle message read status
    socket.on('mark_messages_read', async (data) => {
      try {
        const { chatId, messageIds } = data;

        await Message.updateMany(
          {
            _id: { $in: messageIds },
            chat: chatId,
            sender: { $ne: socket.userId },
            'readBy.user': { $ne: socket.userId }
          },
          {
            $addToSet: {
              readBy: {
                user: socket.userId,
                readAt: new Date()
              }
            }
          }
        );

        // Emit read status to chat participants
        socket.to(chatId).emit('messages_read', {
          messageIds,
          readBy: socket.userId,
          readAt: new Date()
        });

      } catch (error) {
        console.error('Mark messages read error:', error);
      }
    });

    // Handle video call events
    socket.on('call_user', (data) => {
      const { targetUserId, offer, callType } = data;
      socket.to(targetUserId).emit('incoming_call', {
        from: socket.userId,
        fromUser: socket.user,
        offer,
        callType
      });
    });

    socket.on('answer_call', (data) => {
      const { targetUserId, answer } = data;
      socket.to(targetUserId).emit('call_answered', {
        from: socket.userId,
        answer
      });
    });

    socket.on('reject_call', (data) => {
      const { targetUserId } = data;
      socket.to(targetUserId).emit('call_rejected', {
        from: socket.userId
      });
    });

    socket.on('end_call', (data) => {
      const { targetUserId } = data;
      socket.to(targetUserId).emit('call_ended', {
        from: socket.userId
      });
    });

    socket.on('ice_candidate', (data) => {
      const { targetUserId, candidate } = data;
      socket.to(targetUserId).emit('ice_candidate', {
        from: socket.userId,
        candidate
      });
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${socket.user.username} disconnected`);

      // Remove from active users
      activeUsers.delete(socket.userId);

      // Update user offline status
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date()
      });

      // Emit user offline status
      socket.broadcast.emit('user_offline', {
        userId: socket.userId,
        username: socket.user.username,
        isOnline: false,
        lastSeen: new Date()
      });
    });

    // Send list of online users
    socket.emit('online_users', Array.from(activeUsers.values()).map(u => ({
      userId: u.user._id,
      username: u.user.username,
      fullName: u.user.fullName,
      avatar: u.user.avatar
    })));
  });
};

module.exports = handleConnection;
