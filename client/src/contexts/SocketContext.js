import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const socketRef = useRef(null);  useEffect(() => {
    if (user && token) {
      // Determine server URL based on access method and environment
      const getServerUrl = () => {
        console.log('🔍 Socket connection from:', window.location.hostname);
        
        // Production mode
        if (process.env.NODE_ENV === 'production') {
          if (process.env.REACT_APP_SOCKET_URL) {
            return process.env.REACT_APP_SOCKET_URL;
          }
          // Use same origin for production
          return window.location.origin;
        }
        
        // Global/Public IP access in development
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
          // Check if we have a global socket URL configured
          if (process.env.REACT_APP_GLOBAL_SOCKET_URL) {
            console.log('🌍 Using global Socket URL');
            return process.env.REACT_APP_GLOBAL_SOCKET_URL;
          }
          
          // For public IP access, use the same host but port 5000
          const currentHost = window.location.hostname;
          const serverUrl = `http://${currentHost}:5000`;
          console.log('🌐 Public IP access, connecting to same host backend:', serverUrl);
          return serverUrl;
        }
        
        // Localhost development
        if (process.env.REACT_APP_SOCKET_URL) {
          return process.env.REACT_APP_SOCKET_URL;
        }
        
        return 'http://localhost:5000';
      };
      
      const serverUrl = getServerUrl();
      console.log('🔗 Attempting Socket.IO connection to:', serverUrl);
      
      const newSocket = io(serverUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000
      });

      socketRef.current = newSocket;
      setSocket(newSocket);      // Connection events
      newSocket.on('connect', () => {
        console.log('✅ Socket.IO connected to server', serverUrl);
        console.log('🔗 Socket ID:', newSocket.id);
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 Socket.IO disconnected from server');
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket.IO connection error:', error.message);
        console.error('🔧 Server URL:', serverUrl);
        console.error('🔧 Auth token present:', !!token);
      });

      // User presence events
      newSocket.on('online_users', (users) => {
        setOnlineUsers(users);
      });

      newSocket.on('user_online', (userData) => {
        setOnlineUsers(prev => {
          const existing = prev.find(u => u.userId === userData.userId);
          if (existing) {
            return prev.map(u => 
              u.userId === userData.userId 
                ? { ...u, isOnline: true }
                : u
            );
          }
          return [...prev, userData];
        });
      });

      newSocket.on('user_offline', (userData) => {
        setOnlineUsers(prev => 
          prev.map(u => 
            u.userId === userData.userId 
              ? { ...u, isOnline: false, lastSeen: userData.lastSeen }
              : u
          )
        );
      });

      // Typing events
      newSocket.on('user_typing', ({ userId, username, chatId }) => {
        setTypingUsers(prev => ({
          ...prev,
          [chatId]: {
            ...prev[chatId],
            [userId]: { username, timestamp: Date.now() }
          }
        }));
      });      newSocket.on('user_stop_typing', ({ userId, chatId }) => {
        setTypingUsers(prev => {
          const chatTyping = { ...prev[chatId] };
          delete chatTyping[userId];
          return {
            ...prev,
            [chatId]: chatTyping
          };
        });
      });

      // Add debug listeners for message events
      newSocket.on('new_message', (message) => {
        console.log('📥 Received new message via Socket.IO:', message);
      });

      newSocket.on('message_sent', (data) => {
        console.log('✅ Message delivery confirmed:', data);
      });

      newSocket.on('error', (error) => {
        console.error('⚠️ Socket error:', error);
      });

      // Clean up typing indicators after timeout
      const typingInterval = setInterval(() => {
        const now = Date.now();
        setTypingUsers(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(chatId => {
            Object.keys(updated[chatId]).forEach(userId => {
              if (now - updated[chatId][userId].timestamp > 3000) {
                delete updated[chatId][userId];
              }
            });
            if (Object.keys(updated[chatId]).length === 0) {
              delete updated[chatId];
            }
          });
          return updated;
        });
      }, 1000);

      // Cleanup on unmount
      return () => {
        clearInterval(typingInterval);
        newSocket.close();
        setSocket(null);
        socketRef.current = null;
      };
    }
  }, [user, token]);

  // Socket helper functions
  const joinChat = (chatId) => {
    if (socket) {
      socket.emit('join_chat', chatId);
    }
  };

  const leaveChat = (chatId) => {
    if (socket) {
      socket.emit('leave_chat', chatId);
    }
  };
  const sendMessage = (messageData) => {
    if (socket) {
      console.log('📤 Sending message via Socket.IO:', messageData);
      socket.emit('send_message', messageData);
    } else {
      console.error('❌ Cannot send message: Socket not connected');
    }
  };

  const startTyping = (chatId) => {
    if (socket) {
      socket.emit('typing_start', { chatId });
    }
  };

  const stopTyping = (chatId) => {
    if (socket) {
      socket.emit('typing_stop', { chatId });
    }
  };

  const markMessagesRead = (chatId, messageIds) => {
    if (socket) {
      socket.emit('mark_messages_read', { chatId, messageIds });
    }
  };

  // Video call functions
  const callUser = (targetUserId, offer, callType = 'video') => {
    if (socket) {
      socket.emit('call_user', { targetUserId, offer, callType });
    }
  };

  const answerCall = (targetUserId, answer) => {
    if (socket) {
      socket.emit('answer_call', { targetUserId, answer });
    }
  };

  const rejectCall = (targetUserId) => {
    if (socket) {
      socket.emit('reject_call', { targetUserId });
    }
  };

  const endCall = (targetUserId) => {
    if (socket) {
      socket.emit('end_call', { targetUserId });
    }
  };

  const sendIceCandidate = (targetUserId, candidate) => {
    if (socket) {
      socket.emit('ice_candidate', { targetUserId, candidate });
    }
  };

  // Event listener helper
  const addEventListener = (event, handler) => {
    if (socket) {
      socket.on(event, handler);
      return () => socket.off(event, handler);
    }
    return () => {};
  };

  const value = {
    socket,
    onlineUsers,
    typingUsers,
    joinChat,
    leaveChat,
    sendMessage,
    startTyping,
    stopTyping,
    markMessagesRead,
    callUser,
    answerCall,
    rejectCall,
    endCall,
    sendIceCandidate,
    addEventListener
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
