import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Menu,
  MenuItem,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  InputBase,
  alpha
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  Explore as ExploreIcon,
  Chat as ChatIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useQueryClient } from 'react-query';
import api from '../../utils/api';
import { useSocket } from '../../contexts/SocketContext';
import SafeImage from '../SafeImage';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);  const [searchQuery, setSearchQuery] = useState('');

  const { data: notificationData } = useQuery(
    'notificationCount',
    () => api.get('/notifications/count'),
    {
      refetchInterval: 30000, 
      enabled: !!user,
      retry: false,
      onError: () => {
        // Silently handle notification errors
      }
    }
  );

  React.useEffect(() => {
    if (socket) {
      const handleNewNotification = () => {
        // Invalidate notification count query to refetch
        queryClient.invalidateQueries('notificationCount');
      };

      socket.on('new_notification', handleNewNotification);
      
      return () => {
        socket.off('new_notification', handleNewNotification);
      };
    }
  }, [socket, queryClient]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleMenuClose();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Explore', icon: <ExploreIcon />, path: '/explore' },
    { text: 'Chat', icon: <ChatIcon />, path: '/chat' },
    { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications' },
    { text: 'Profile', icon: <PersonIcon />, path: `/profile/${user?.username}` },
  ];

  const drawer = (
    <Box sx={{ width: 280, pt: 2 }}>
      <Box sx={{ px: 2, mb: 3 }}>
        <Typography variant="h6" color="primary" fontWeight="bold">
          Social Media
        </Typography>
      </Box>
      
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              if (isMobile) setMobileOpen(false);
            }}
            sx={{
              mx: 1,
              borderRadius: 2,
              backgroundColor: location.pathname === item.path ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
              }
            }}
          >
            <ListItemIcon 
              sx={{ 
                color: 'inherit',
                minWidth: 40 
              }}
            >
              {item.text === 'Notifications' ? (
                <Badge 
                  badgeContent={notificationData?.data?.unreadCount || 0} 
                  color="error"
                  max={99}
                >
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: location.pathname === item.path ? 600 : 400
              }}
            />
          </ListItem>
        ))}
      </List>

      {user && (
        <Box sx={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 2,
              cursor: 'pointer'
            }}
            onClick={() => navigate(`/profile/${user.username}`)}
          >            <SafeImage
              component="avatar"
              src={user.avatar}
              sx={{ width: 40, height: 40, mr: 2 }}
            >
              {user.fullName?.charAt(0).toUpperCase()}
            </SafeImage>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>
                {user.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                @{user.username}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - 280px)` },
          ml: { md: `280px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Search Bar */}
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              position: 'relative',
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.common.black, 0.05),
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.black, 0.08),
              },
              mr: 2,
              ml: 0,
              width: '100%',
              maxWidth: 400,
            }}
          >
            <Box
              sx={{
                padding: theme.spacing(0, 2),
                height: '100%',
                position: 'absolute',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SearchIcon />
            </Box>
            <InputBase
              placeholder="Search users, posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                color: 'inherit',
                width: '100%',
                '& .MuiInputBase-input': {
                  padding: theme.spacing(1, 1, 1, 0),
                  paddingLeft: `calc(1em + ${theme.spacing(4)})`,
                  transition: theme.transitions.create('width'),
                  width: '100%',
                },
              }}
            />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Notifications */}
          <IconButton
            color="inherit"
            onClick={() => navigate('/notifications')}
            sx={{ mr: 1 }}
          >
            <Badge 
              badgeContent={notificationData?.data?.unreadCount || 0} 
              color="error"
              max={99}
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* User Menu */}
          <IconButton
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ p: 0 }}
          >            <SafeImage
              component="avatar"
              src={user?.avatar}
              sx={{ width: 32, height: 32 }}
            >
              {user?.fullName?.charAt(0).toUpperCase()}
            </SafeImage>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => navigate(`/profile/${user?.username}`)}>
              <PersonIcon sx={{ mr: 2 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={() => navigate('/settings')}>
              <SettingsIcon sx={{ mr: 2 }} />
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 2 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: 280 }, flexShrink: { md: 0 } }}
        aria-label="navigation"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 280px)` },
          mt: { xs: 7, md: 8 },
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
