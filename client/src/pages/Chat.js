import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  TextField,
  IconButton,
  Badge,
  Grid,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
  Group as GroupIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  Add as AddIcon,
  Close as CloseIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import api from '../utils/api';
import SafeImage from '../components/SafeImage';

const Chat = () => {
  const { user } = useAuth();
  const { socket, joinChat, sendMessage: sendSocketMessage } = useSocket();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollTimeoutRef = useRef(null);
  
  // New chat dialog states
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [groupName, setGroupName] = useState('');
  const messagesEndRef = useRef(null);

  // Function definitions first
  const fetchChats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/chat');

      if (response.data) {
        // Handle both array response and object with chats property
        const chatsList = Array.isArray(response.data) ? response.data : (response.data.chats || []);
        setChats(chatsList);
        // Only auto-select first chat on desktop
        if (chatsList.length > 0 && !selectedChat && !isMobile) {
          setSelectedChat(chatsList[0]);
        }
      }    } catch (error) {
      console.error('Error fetching chats:', error);
      setChats([]); // Ensure chats is always an array
    } finally {
      setLoading(false);
    }
  }, [selectedChat, isMobile]);

  const handleMessageSent = useCallback((data) => {
    // Optional: Handle message delivery confirmation
  }, []);

  const handleNewMessage = useCallback((message) => {
    if (selectedChat && message.chat === selectedChat._id) {
      setMessages(prev => Array.isArray(prev) ? [...prev, message] : [message]);
    }
    
    // Update chat list with latest message
    setChats(prev => Array.isArray(prev) ? prev.map(chat => 
      chat._id === message.chat 
        ? { ...chat, lastMessage: message }
        : chat
    ) : []);
  }, [selectedChat]);

  const handleUserOnline = (userId) => {
    setOnlineUsers(prev => [...prev.filter(id => id !== userId), userId]);
  };
  const handleUserOffline = (userId) => {
    setOnlineUsers(prev => prev.filter(id => id !== userId));
  };  const fetchMessages = useCallback(async (chatId) => {
    try {
      const response = await api.get(`/chat/${chatId}/messages`);

      if (response.data) {
        const messagesList = Array.isArray(response.data) ? response.data : (response.data.messages || []);
        setMessages(messagesList);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  }, []);

  // useEffects after function definitions
  useEffect(() => {
    fetchChats();    if (socket) {
      socket.on('new_message', handleNewMessage);
      socket.on('message_sent', handleMessageSent);
      socket.on('user_online', handleUserOnline);
      socket.on('user_offline', handleUserOffline);
      
      return () => {
        socket.off('new_message');
        socket.off('message_sent');
        socket.off('user_online');
        socket.off('user_offline');
      };
    }
  }, [socket, fetchChats, handleNewMessage, handleMessageSent]);  useEffect(() => {
    if (selectedChat) {
      // Reset scroll state when switching chats
      setShowScrollButton(false);
      
      fetchMessages(selectedChat._id);
      if (joinChat) {
        joinChat(selectedChat._id);
      }
    }
  }, [selectedChat, joinChat, fetchMessages]);  // Only auto-scroll on initial message load or chat switch
  useEffect(() => {
    if (selectedChat?._id) {
      // Only scroll to bottom when switching to a new chat
      const timer = setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ 
            behavior: "auto",
            block: "end"
          });
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [selectedChat?._id]); // Only trigger on chat change

  // Simplified scroll handler
  const handleScroll = (e) => {
    const element = e.target;
    const { scrollTop, scrollHeight, clientHeight } = element;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // Show/hide scroll button
    setShowScrollButton(distanceFromBottom > 100 && messages.length > 0);
    
    // Clear timeout
    clearTimeout(scrollTimeoutRef.current);
  };  // Manual scroll to bottom function
  const scrollToBottomManually = () => {
    setShowScrollButton(false);
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth",
        block: "end"
      });
    }
  };
  // Clean up timeout on unmount
  useEffect(() => {
    const timeoutRef = scrollTimeoutRef.current;
    return () => {
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
    };
  }, []);

  // Utility functions for chat display
  const getChatName = (chat) => {
    if (!chat) return 'Unknown Chat';
    if (chat.isGroupChat) {
      return chat.name || 'Group Chat';
    }
    // For direct chats, show the other participant's name
    const otherParticipant = chat.participants?.find(p => p._id !== user?._id);
    return otherParticipant?.fullName || otherParticipant?.username || 'Unknown User';
  };

  const getChatAvatar = (chat) => {
    if (!chat) return '';
    if (chat.isGroupChat) {
      return chat.avatar || '';
    }
    // For direct chats, show the other participant's avatar
    const otherParticipant = chat.participants?.find(p => p._id !== user?._id);
    return otherParticipant?.avatar || '';
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const messageData = {
      chatId: selectedChat._id,
      content: newMessage.trim(),
      tempId: Date.now() // For tracking message status
    };

    // Send via Socket.IO for real-time delivery
    if (sendSocketMessage) {
      sendSocketMessage(messageData);
      setNewMessage('');
    } else {
      // Fallback to API if socket not available
      try {
        const response = await api.post('/chat/message', messageData);
        
        if (response.data) {
          const message = response.data;
          setMessages(prev => Array.isArray(prev) ? [...prev, message] : [message]);
          setNewMessage('');
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  // New chat functions
  const fetchAvailableUsers = async () => {
    try {
      const [usersResponse, followersResponse, followingResponse] = await Promise.allSettled([
        api.get('/users/search?limit=50'),
        api.get('/users/followers'),
        api.get('/users/following')
      ]);

      let allUsers = [];

      if (usersResponse.status === 'fulfilled' && usersResponse.value.data) {
        const users = Array.isArray(usersResponse.value.data) ? 
          usersResponse.value.data : 
          (usersResponse.value.data.users || []);
        allUsers = [...allUsers, ...users];
      }

      if (followersResponse.status === 'fulfilled' && followersResponse.value.data) {
        const followers = followersResponse.value.data.followers || [];
        allUsers = [...allUsers, ...followers];
      }

      if (followingResponse.status === 'fulfilled' && followingResponse.value.data) {
        const following = followingResponse.value.data.following || [];
        allUsers = [...allUsers, ...following];
      }      const uniqueUsers = allUsers
        .filter((u, index, self) => 
          u && u._id && 
          u._id !== user?._id && 
          index === self.findIndex(otherUser => otherUser._id === u._id)
        );

      setAvailableUsers(uniqueUsers);
      
      if (uniqueUsers.length === 0) {
        try {
          const broadResponse = await api.get('/users/search?limit=100&includeAll=true');
          if (broadResponse.data) {
            const broadUsers = Array.isArray(broadResponse.data) ? 
              broadResponse.data : 
              (broadResponse.data.users || []);
            const filteredBroad = broadUsers.filter(u => u && u._id && u._id !== user?._id);
            setAvailableUsers(filteredBroad);
          }
        } catch (broadError) {
          console.error('Broad search failed:', broadError);
          setAvailableUsers([]);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      try {
        const response = await api.get('/users/search?limit=20');        if (response.data) {
          const users = Array.isArray(response.data) ? response.data : (response.data.users || []);
          setAvailableUsers(users.filter(u => u._id !== user._id));
        }
      } catch (fallbackError) {
        console.error('Fallback user fetch failed:', fallbackError);
        setAvailableUsers([]);
      }
    }
  };
  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user to chat with');
      return;
    }

    if (!isGroupChat && selectedUsers.length > 1) {
      alert('For single user chats, please select only one user');
      return;
    }

    if (isGroupChat && selectedUsers.length < 2) {
      alert('Group chats require at least 2 participants');
      return;
    }

    try {      const chatData = {
        participantIds: selectedUsers.map(u => u._id),
        isGroupChat: isGroupChat || selectedUsers.length > 1,
        groupName: isGroupChat ? groupName : undefined
      };

      const response = await api.post('/chat/create', chatData);

      if (response.data) {
        const newChat = response.data.chat || response.data;
        setChats(prev => [newChat, ...prev]);
        setSelectedChat(newChat);
        setNewChatOpen(false);
        setSelectedUsers([]);
        setGroupName('');
        setIsGroupChat(false);
        
        // Fetch messages for the new chat
        fetchMessages(newChat._id);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Failed to create chat. Please try again.');
    }
  };

  const handleOpenNewChat = () => {
    setNewChatOpen(true);
    fetchAvailableUsers();
  };

  const handleCloseNewChat = () => {
    setNewChatOpen(false);
    setSelectedUsers([]);
    setIsGroupChat(false);
    setGroupName('');
  };
  const handleUserSelect = (userIdOrUser) => {
    // Handle both user ID and user object
    const selectedUser = typeof userIdOrUser === 'string' 
      ? availableUsers.find(u => u._id === userIdOrUser)
      : userIdOrUser;
    
    if (!selectedUser) return;
    
    const userId = selectedUser._id;
    setSelectedUsers(prev => {
      const isAlreadySelected = prev.find(u => u._id === userId);
      
      if (isAlreadySelected) {
        return prev.filter(u => u._id !== userId);
      } else {
        // For single user chats, replace the selection instead of adding
        if (!isGroupChat) {
          return [selectedUser];
        } else {
          return [...prev, selectedUser];
        }
      }
    });
  };

  const filteredUsers = availableUsers.filter(user => 
    user.fullName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );
  const filteredChats = Array.isArray(chats) ? chats.filter(chat =>    getChatName(chat).toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (    <Container maxWidth="xl">
      <Box sx={{ 
        mt: { xs: 1, md: 2 }, 
        height: { 
          xs: 'calc(100vh - 80px)', // Taller on mobile
          md: 'calc(100vh - 120px)' 
        } 
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            display: { xs: 'none', md: 'block' } // Hide title on mobile to save space
          }}
        >
          Chat
        </Typography>
        
        <Grid container spacing={2} sx={{ height: '100%' }}>          {/* Chat List */}
          <Grid 
            item 
            xs={12} 
            md={4}
            sx={{
              display: { 
                xs: selectedChat ? 'none' : 'block', // Hide on mobile when chat is selected
                md: 'block' 
              }
            }}
          >
            <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: { xs: 1, md: 2 }, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search chats..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <IconButton 
                    color="primary" 
                    onClick={handleOpenNewChat}
                    sx={{ flexShrink: 0 }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </Box>
              
              <List sx={{ flex: 1, overflow: 'auto' }}>
                {filteredChats.length === 0 ? (
                  <ListItem>
                    <ListItemText 
                      primary="No chats found" 
                      secondary="Start a conversation with someone!"
                    />
                  </ListItem>
                ) : (
                  filteredChats.map((chat) => {
                    const otherUser = chat.participants?.find(p => p._id !== user._id);
                    const isOnline = !chat.isGroupChat && otherUser && isUserOnline(otherUser._id);
                    
                    return (
                      <ListItem
                        key={chat._id}
                        button
                        selected={selectedChat?._id === chat._id}
                        onClick={() => setSelectedChat(chat)}
                        sx={{
                          borderRadius: 1,
                          mx: 1,
                          mb: 0.5,
                          '&.Mui-selected': {
                            backgroundColor: 'primary.light',
                            color: 'primary.contrastText'
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Badge
                            variant="dot"
                            color="success"
                            invisible={!isOnline}
                            anchorOrigin={{
                              vertical: 'bottom',
                              horizontal: 'right',
                            }}
                          >                            <SafeImage
                              component="avatar"
                              src={getChatAvatar(chat)}
                            >
                              {chat.isGroupChat ? (
                                <GroupIcon />
                              ) : (
                                getChatName(chat).charAt(0)
                              )}
                            </SafeImage>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1">
                                {getChatName(chat)}
                              </Typography>
                              {chat.isGroupChat && (
                                <Chip size="small" label="Group" icon={<GroupIcon />} />
                              )}
                            </Box>
                          }
                          secondary={
                            chat.lastMessage ? (
                              <Typography variant="body2" noWrap>
                                {chat.lastMessage.sender?.username}: {chat.lastMessage.content}
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No messages yet
                              </Typography>
                            )
                          }
                        />
                      </ListItem>
                    );
                  })
                )}
              </List>
            </Paper>
          </Grid>          {/* Chat Messages */}
          <Grid 
            item 
            xs={12} 
            md={8}
            sx={{
              display: { 
                xs: selectedChat ? 'block' : 'none', // Show only when chat is selected on mobile
                md: 'block' 
              }
            }}
          >
            {selectedChat ? (
              <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Chat Header */}
                <Box sx={{ 
                  p: { xs: 1, md: 2 }, 
                  borderBottom: 1, 
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>                  {/* Back button for mobile */}
                  <IconButton
                    sx={{ 
                      display: { xs: 'flex', md: 'none' },
                      mr: 1
                    }}
                    onClick={() => {
                      setSelectedChat(null);
                    }}
                    aria-label="Back to chat list"
                  >
                    <ArrowBackIcon />
                  </IconButton>
                    <SafeImage
                    component="avatar"
                    src={getChatAvatar(selectedChat)}
                  >
                    {selectedChat.isGroupChat ? (
                      <GroupIcon />
                    ) : (
                      getChatName(selectedChat).charAt(0)
                    )}
                  </SafeImage>
                  <Box>
                    <Typography variant="h6">
                      {getChatName(selectedChat)}
                    </Typography>
                    {selectedChat.isGroupChat ? (
                      <Typography variant="body2" color="text.secondary">
                        {selectedChat.participants?.length} members
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {(() => {
                          const otherUser = selectedChat.participants?.find(p => p._id !== user._id);
                          return otherUser && isUserOnline(otherUser._id) ? 'Online' : 'Offline';
                        })()}
                      </Typography>
                    )}
                  </Box>
                </Box>                {/* Messages */}                <Box 
                  sx={{ 
                    flex: 1, 
                    overflow: 'auto', 
                    p: { xs: 0.5, md: 1 },
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    minHeight: 0 // Important for flex child with overflow
                  }}
                  onScroll={handleScroll}
                >
                  {!Array.isArray(messages) || messages.length === 0 ? (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      height: '100%'
                    }}>
                      <Typography variant="body1" color="text.secondary">
                        No messages yet. Start the conversation!
                      </Typography>
                    </Box>
                  ) : (
                    Array.isArray(messages) && messages.map((message, index) => {
                      const isOwn = message.sender?._id === user._id;
                      const showAvatar = index === 0 || 
                        messages[index - 1].sender?._id !== message.sender?._id;
                      
                      return (
                        <Box
                          key={message._id || index}
                          sx={{
                            display: 'flex',
                            justifyContent: isOwn ? 'flex-end' : 'flex-start',
                            mb: 1,
                            alignItems: 'flex-end'
                          }}
                        >                          {!isOwn && showAvatar && (
                            <SafeImage
                              component="avatar"
                              src={message.sender?.avatar}
                              sx={{ 
                                width: { xs: 28, md: 32 }, 
                                height: { xs: 28, md: 32 }, 
                                mr: 1 
                              }}
                            >
                              {message.sender?.fullName?.charAt(0) || message.sender?.username?.charAt(0)}
                            </SafeImage>
                          )}
                          
                          {!isOwn && !showAvatar && (
                            <Box sx={{ width: { xs: 36, md: 40 } }} />
                          )}
                            <Card
                            sx={{
                              maxWidth: { xs: '85%', md: '70%' }, // Wider on mobile
                              backgroundColor: isOwn ? 'primary.main' : 'grey.100',
                              color: isOwn ? 'primary.contrastText' : 'text.primary'
                            }}
                          >
                            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                              {!isOwn && selectedChat.isGroupChat && showAvatar && (
                                <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                                  {message.sender?.fullName || message.sender?.username}
                                </Typography>
                              )}
                              <Typography variant="body2">
                                {message.content}
                              </Typography>
                              <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.7 }}>
                                {new Date(message.createdAt).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </Typography>
                            </CardContent>                          </Card>
                        </Box>                      );
                    })                  )}
                  <div ref={messagesEndRef} />
                  
                  {/* Scroll to Bottom Button */}
                  {showScrollButton && (
                    <IconButton
                      onClick={scrollToBottomManually}
                      sx={{
                        position: 'absolute',
                        bottom: 80,
                        right: 20,
                        backgroundColor: 'primary.main',
                        color: 'white',
                        width: 48,
                        height: 48,
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                        boxShadow: 3,
                        zIndex: 1000
                      }}
                      size="medium"
                    >
                      <KeyboardArrowDownIcon />
                    </IconButton>
                  )}
                </Box>                {/* Message Input */}
                <Box sx={{ p: { xs: 1, md: 2 }, borderTop: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                    <TextField
                      fullWidth
                      multiline
                      maxRows={4}                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      size={isMobile ? "small" : "medium"}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" sx={{ display: { xs: 'none', md: 'inline-flex' } }}>
                              <AttachFileIcon />
                            </IconButton>
                            <IconButton size="small" sx={{ display: { xs: 'none', md: 'inline-flex' } }}>
                              <EmojiIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <IconButton
                      color="primary"
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      sx={{ mb: 0.5 }}
                    >
                      <SendIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>            ) : (
              <Paper sx={{ 
                height: '100%', 
                display: { xs: 'none', md: 'flex' }, // Hide on mobile when no chat selected
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    Select a chat to start messaging
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Choose a conversation from the list to begin chatting
                  </Typography>
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>        {/* New Chat Dialog */}
        <Dialog
          open={newChatOpen}
          onClose={handleCloseNewChat}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile} // Full screen on mobile
        >
          <DialogTitle>
            <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AddIcon color="action" />
              New Chat
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Group Name"
                variant="outlined"
                size="small"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}                disabled={!isGroupChat}
              />
            </Box>

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Chat Type</InputLabel>
              <Select
                value={isGroupChat ? 'group' : 'single'}
                onChange={(e) => setIsGroupChat(e.target.value === 'group')}
                label="Chat Type"
              >
                <MenuItem value="single">Single User</MenuItem>
                <MenuItem value="group">Group Chat</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label={isGroupChat ? "Add Participants" : "Search Users"}
                variant="outlined"
                size="small"
                placeholder={isGroupChat ? "Search and select users" : "Search for a user to chat with"}
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
              />
              
              <Paper sx={{ maxHeight: 200, overflow: 'auto', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <List>
                  {filteredUsers.length === 0 ? (
                    <ListItem>
                      <ListItemText primary="No users found" secondary="Try adjusting your search." />
                    </ListItem>
                  ) : (
                    filteredUsers.map((user) => (
                      <ListItem
                        key={user._id}
                        button
                        onClick={() => handleUserSelect(user._id)}
                        sx={{
                          borderRadius: 1,
                          mx: 1,
                          mb: 0.5,
                          '&.Mui-selected': {
                            backgroundColor: 'primary.light',
                            color: 'primary.contrastText'
                          }
                        }}
                      >                        <ListItemAvatar>
                          <SafeImage
                            component="avatar"
                            src={user.avatar}
                          >
                            {user.fullName?.charAt(0) || user.username?.charAt(0)}
                          </SafeImage>
                        </ListItemAvatar>
                        <ListItemText
                          primary={user.fullName || user.username}
                          secondary={user.username}
                        />
                        <ListItemText
                          primary={
                            <Chip 
                              label={selectedUsers.find(u => u._id === user._id) ? "Selected" : "Select"}
                              size="small"
                              color={selectedUsers.find(u => u._id === user._id) ? "primary" : "default"}
                              variant={selectedUsers.find(u => u._id === user._id) ? "filled" : "outlined"}
                            />
                          }
                          sx={{ textAlign: 'right', minWidth: 100 }}
                        />
                      </ListItem>
                    ))
                  )}
                </List>
              </Paper>
            </Box>            {isGroupChat && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Note: Select multiple users to create a group chat.
              </Typography>
            )}

            {!isGroupChat && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Note: Select one user to start a private conversation.
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseNewChat} color="inherit" startIcon={<CloseIcon />}>
              Cancel
            </Button>            <Button 
              onClick={handleCreateChat} 
              color="primary" 
              variant="contained"
              startIcon={<SendIcon />}
              disabled={selectedUsers.length === 0}
            >
              {isGroupChat ? 'Create Group' : 'Start Chat'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Chat;
