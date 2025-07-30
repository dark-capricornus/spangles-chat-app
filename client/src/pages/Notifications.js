import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,  Avatar,
  Card,
  Chip,
  IconButton,
  Badge,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
  PersonAdd as PersonAddIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  Circle as CircleIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import api from '../utils/api';
import { useSocket } from '../contexts/SocketContext';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Real-time notification listening
  useEffect(() => {
    if (socket) {
      const handleNewNotification = (notification) => {
        console.log('New real-time notification received:', notification);
        setNotifications(prev => [notification, ...prev]);
      };

      socket.on('new_notification', handleNewNotification);
      
      return () => {
        socket.off('new_notification', handleNewNotification);
      };
    }
  }, [socket]);const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      console.log('Notifications API response:', response.data);

      if (response.data) {
        // Handle both array response and object with notifications property
        const notificationsList = Array.isArray(response.data) ? response.data : (response.data.notifications || []);
        console.log('Processed notifications list:', notificationsList);
        setNotifications(notificationsList);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]); // Ensure notifications is always an array
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });      setNotifications(prev => 
        Array.isArray(prev) ? prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, read: true }
            : notif
        ) : []
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });      setNotifications(prev => 
        Array.isArray(prev) ? prev.filter(notif => notif._id !== notificationId) : []
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <FavoriteIcon color="error" />;
      case 'comment':
        return <CommentIcon color="primary" />;
      case 'follow':
        return <PersonAddIcon color="success" />;
      case 'mention':
        return <ShareIcon color="warning" />;
      default:
        return <CircleIcon />;    }  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'like':
        return 'error';
      case 'comment':
        return 'primary';
      case 'follow':
        return 'success';
      case 'mention':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Notifications
        </Typography>
        
        {notifications.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No notifications yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              When people like, comment, or follow you, you'll see it here!
            </Typography>
          </Paper>        ) : (
          <Card sx={{ mt: 2 }}>            <List>
              {Array.isArray(notifications) && notifications.map((notification, index) => (
                <React.Fragment key={notification._id}>
                  <ListItem
                    sx={{
                      backgroundColor: notification.read ? 'inherit' : 'action.hover',
                      '&:hover': {
                        backgroundColor: 'action.selected'
                      }
                    }}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => deleteNotification(notification._id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                    onClick={() => !notification.read && markAsRead(notification._id)}
                  >
                    <ListItemAvatar>
                      <Badge
                        variant="dot"
                        color="primary"
                        invisible={notification.read}
                        anchorOrigin={{
                          vertical: 'top',
                          horizontal: 'left',
                        }}
                      >
                        <Avatar src={notification.sender?.avatar}>
                          {notification.sender?.fullName?.charAt(0) || 
                           notification.sender?.username?.charAt(0)}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                      <ListItemText
                      primary={`${notification.sender?.fullName || notification.sender?.username}`}
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Chip
                              icon={getNotificationIcon(notification.type)}
                              label={notification.type}
                              size="small"
                              color={getNotificationColor(notification.type)}
                              variant="outlined"
                            />
                            {!notification.read && (
                              <Chip
                                label="New"
                                size="small"
                                color="primary"
                                variant="filled"
                              />
                            )}
                          </Box>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(notification.createdAt))} ago
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>                  
                  {index < ((notifications?.length || 0) - 1) && <Divider />}                </React.Fragment>
              ))}
            </List>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default Notifications;
