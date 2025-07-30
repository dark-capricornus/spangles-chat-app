const express = require('express');
const { body, validationResult } = require('express-validator');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's chats
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const chats = await Chat.find({
      participants: req.user._id,
      isActive: true
    })
    .populate('participants', 'username fullName avatar isOnline lastSeen')
    .populate('lastMessage')
    .populate('creator', 'username fullName avatar')
    .populate('admins', 'username fullName avatar')
    .sort({ lastActivity: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Chat.countDocuments({
      participants: req.user._id,
      isActive: true
    });

    res.json({
      chats,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or get existing chat
router.post('/create', auth, [
  body('participantIds')
    .isArray({ min: 1 })
    .withMessage('At least one participant is required'),
  body('isGroupChat')
    .optional()
    .isBoolean()
    .withMessage('isGroupChat must be a boolean'),
  body('groupName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Group name must be less than 100 characters')
    .trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { participantIds, isGroupChat = false, groupName, groupDescription } = req.body;
    
    // Add current user to participants if not already included
    const allParticipants = [...new Set([req.user._id.toString(), ...participantIds])];
    
    // Validate participants exist
    const validParticipants = await User.find({
      _id: { $in: allParticipants }
    }).select('_id');
    
    if (validParticipants.length !== allParticipants.length) {
      return res.status(400).json({ message: 'One or more participants not found' });
    }

    let chat;

    if (isGroupChat) {
      // Create group chat
      if (!groupName) {
        return res.status(400).json({ message: 'Group name is required for group chats' });
      }

      chat = new Chat({
        participants: allParticipants,
        isGroupChat: true,
        groupName,
        groupDescription,
        creator: req.user._id,
        admins: [req.user._id]
      });
    } else {
      // For 1-to-1 chat, check if chat already exists
      if (allParticipants.length !== 2) {
        return res.status(400).json({ message: 'One-to-one chat must have exactly 2 participants' });
      }

      const existingChat = await Chat.findOne({
        participants: { $all: allParticipants, $size: 2 },
        isGroupChat: false
      });

      if (existingChat) {
        await existingChat.populate('participants', 'username fullName avatar isOnline lastSeen');
        return res.json({
          message: 'Chat already exists',
          chat: existingChat
        });
      }

      chat = new Chat({
        participants: allParticipants,
        isGroupChat: false
      });
    }

    await chat.save();
    await chat.populate('participants', 'username fullName avatar isOnline lastSeen');
    await chat.populate('creator', 'username fullName avatar');
    await chat.populate('admins', 'username fullName avatar');

    res.status(201).json({
      message: 'Chat created successfully',
      chat
    });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get chat messages
router.get('/:chatId/messages', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    // Check if user is participant in the chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user._id
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or access denied' });
    }

    const messages = await Message.find({
      chat: chatId,
      $or: [
        { isDeleted: false },
        { isDeleted: true, deletedFor: { $ne: req.user._id } }
      ]
    })
    .populate('sender', 'username fullName avatar')
    .populate('replyTo', 'content sender')
    .populate('mentions', 'username fullName')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Message.countDocuments({
      chat: chatId,
      $or: [
        { isDeleted: false },
        { isDeleted: true, deletedFor: { $ne: req.user._id } }
      ]
    });

    res.json({
      messages: messages.reverse(), // Reverse to show oldest first
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message
router.post('/:chatId/messages', auth, [
  body('content')
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: 2000 })
    .withMessage('Message must be less than 2000 characters')
    .trim(),
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'video', 'file', 'voice'])
    .withMessage('Invalid message type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { chatId } = req.params;
    const { content, messageType = 'text', fileUrl, fileName, fileSize, replyTo } = req.body;
    
    // Check if user is participant in the chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user._id
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or access denied' });
    }

    // Extract mentions
    const mentions = content.match(/@[\w]+/g)?.map(mention => mention.slice(1)) || [];
    const mentionedUsers = await User.find({ 
      username: { $in: mentions } 
    }).select('_id');

    const message = new Message({
      chat: chatId,
      sender: req.user._id,
      content,
      messageType,
      fileUrl,
      fileName,
      fileSize,
      replyTo,
      mentions: mentionedUsers.map(user => user._id)
    });

    await message.save();
    await message.populate('sender', 'username fullName avatar');
    await message.populate('replyTo', 'content sender');
    await message.populate('mentions', 'username fullName');

    // Update chat's last message and activity
    chat.lastMessage = message._id;
    chat.lastActivity = new Date();
    await chat.save();

    // Emit socket event for real-time messaging
    const io = req.app.get('io');
    if (io) {
      io.to(chatId).emit('new_message', message);
    }

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
router.put('/:chatId/read', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { messageIds } = req.body;
    
    // Check if user is participant in the chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user._id
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or access denied' });
    }

    // Update read status for messages
    await Message.updateMany(
      {
        _id: { $in: messageIds },
        chat: chatId,
        sender: { $ne: req.user._id },
        'readBy.user': { $ne: req.user._id }
      },
      {
        $addToSet: {
          readBy: {
            user: req.user._id,
            readAt: new Date()
          }
        }
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete message
router.delete('/:chatId/messages/:messageId', auth, async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const { deleteForEveryone = false } = req.body;
    
    const message = await Message.findOne({
      _id: messageId,
      chat: chatId
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (deleteForEveryone) {
      // Only sender can delete for everyone
      if (message.sender.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete for everyone' });
      }
      
      message.isDeleted = true;
      message.deletedAt = new Date();
      message.content = 'This message was deleted';
    } else {
      // Delete for current user only
      if (!message.deletedFor.includes(req.user._id)) {
        message.deletedFor.push(req.user._id);
      }
    }

    await message.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave group chat
router.post('/:chatId/leave', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user._id,
      isGroupChat: true
    });

    if (!chat) {
      return res.status(404).json({ message: 'Group chat not found or access denied' });
    }

    // Remove user from participants
    chat.participants.pull(req.user._id);
    
    // Remove from admins if they were admin
    chat.admins.pull(req.user._id);
    
    // If creator is leaving, assign another admin as creator
    if (chat.creator.toString() === req.user._id.toString() && chat.admins.length > 0) {
      chat.creator = chat.admins[0];
    }

    await chat.save();

    res.json({ message: 'Left group chat successfully' });
  } catch (error) {
    console.error('Leave group chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add participant to group chat
router.post('/:chatId/add-participant', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.body;
    
    const chat = await Chat.findOne({
      _id: chatId,
      isGroupChat: true,
      admins: req.user._id
    });

    if (!chat) {
      return res.status(404).json({ message: 'Group chat not found or you are not an admin' });
    }

    // Check if user exists
    const userToAdd = await User.findById(userId);
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a participant
    if (chat.participants.includes(userId)) {
      return res.status(400).json({ message: 'User is already a participant' });
    }

    // Add user to participants
    chat.participants.push(userId);
    await chat.save();

    await chat.populate('participants', 'username fullName avatar');

    res.json({ 
      message: 'User added to group successfully', 
      chat 
    });
  } catch (error) {
    console.error('Add participant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove participant from group chat
router.post('/:chatId/remove-participant', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.body;
    
    const chat = await Chat.findOne({
      _id: chatId,
      isGroupChat: true,
      admins: req.user._id
    });

    if (!chat) {
      return res.status(404).json({ message: 'Group chat not found or you are not an admin' });
    }

    // Cannot remove the creator
    if (chat.creator.toString() === userId) {
      return res.status(400).json({ message: 'Cannot remove the group creator' });
    }

    // Remove user from participants
    chat.participants.pull(userId);
    
    // Remove from admins if they were admin
    chat.admins.pull(userId);
    
    await chat.save();

    await chat.populate('participants', 'username fullName avatar');

    res.json({ 
      message: 'User removed from group successfully', 
      chat 
    });
  } catch (error) {
    console.error('Remove participant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Make user admin in group chat
router.post('/:chatId/make-admin', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.body;
    
    const chat = await Chat.findOne({
      _id: chatId,
      isGroupChat: true,
      creator: req.user._id
    });

    if (!chat) {
      return res.status(404).json({ message: 'Group chat not found or you are not the creator' });
    }

    // Check if user is a participant
    if (!chat.participants.includes(userId)) {
      return res.status(400).json({ message: 'User is not a participant' });
    }

    // Check if user is already an admin
    if (chat.admins.includes(userId)) {
      return res.status(400).json({ message: 'User is already an admin' });
    }

    // Add user to admins
    chat.admins.push(userId);
    await chat.save();

    res.json({ message: 'User promoted to admin successfully' });
  } catch (error) {
    console.error('Make admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
