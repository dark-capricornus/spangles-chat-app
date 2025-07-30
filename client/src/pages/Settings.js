import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormGroup,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  Grid,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  PhotoCamera as PhotoCameraIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    fullName: '',
    username: '',
    email: '',
    bio: '',
    avatar: '',
    coverPhoto: ''
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    isPrivate: false,
    showEmail: false,
    showOnlineStatus: true,
    allowDirectMessages: true,
    showLastSeen: true
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      newFollower: true,
      newMessage: true,
      postLike: true,
      postComment: true,
      mention: true
    },
    push: {
      newFollower: true,
      newMessage: true,
      postLike: false,
      postComment: true,
      mention: true
    }
  });

  // Display settings
  const [displaySettings, setDisplaySettings] = useState({
    theme: 'system',
    language: 'en',
    timezone: 'UTC'
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  // Delete account dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const fetchSettings = async () => {
    try {
      const response = await api.get('/users/settings');
      const { settings, profile } = response.data;
      
      // Update individual settings if they exist
      if (settings?.privacy) {
        setPrivacySettings(prev => ({ ...prev, ...settings.privacy }));
      }
      if (settings?.notifications) {
        setNotificationSettings(prev => ({ ...prev, ...settings.notifications }));
      }
      if (settings?.display) {
        setDisplaySettings(prev => ({ ...prev, ...settings.display }));
      }

      if (profile) {
        setProfileData({
          fullName: profile.fullName || '',
          username: profile.username || '',
          email: profile.email || '',
          bio: profile.bio || '',
          avatar: profile.avatar || '',
          coverPhoto: profile.coverPhoto || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setMessage('Failed to load settings');
      setError('Failed to load settings');
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        coverPhoto: user.coverPhoto || ''
      });
    }
  }, [user]);

  const updateSettings = async (settingsType, data) => {
    try {
      setLoading(true);
      const settings = {
        privacy: privacySettings,
        notifications: notificationSettings,
        display: displaySettings,
        [settingsType]: data
      };

      await api.put('/users/settings', { settings });
      setMessage('Settings updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating settings:', error);
      setError('Failed to update settings');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);
      const response = await api.put('/users/profile', profileData);
      updateUser(response.data.user);
      setMessage('Profile updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await api.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setMessage('Password changed successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      setError(error.response?.data?.message || 'Failed to change password');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    try {
      setLoading(true);
      await api.delete('/users/account', { data: { password: deletePassword } });
      // Logout user after successful deletion
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (error) {
      console.error('Error deleting account:', error);
      setError(error.response?.data?.message || 'Failed to delete account');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setDeletePassword('');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>

        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ width: '100%' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="settings tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<PersonIcon />} label="Profile" />
            <Tab icon={<SecurityIcon />} label="Privacy & Security" />
            <Tab icon={<NotificationsIcon />} label="Notifications" />
            <Tab icon={<PaletteIcon />} label="Display" />
          </Tabs>

          {/* Profile Tab */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  margin="normal"
                />
                
                <TextField
                  fullWidth
                  label="Username"
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                  margin="normal"
                  helperText="This will change your profile URL"
                />
                
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  margin="normal"
                  disabled
                  helperText="Email cannot be changed"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar
                    src={profileData.avatar}
                    sx={{ width: 100, height: 100, mb: 2 }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<PhotoCameraIcon />}
                    onClick={() => {
                      // TODO: Implement image upload
                      setMessage('Image upload feature coming soon');
                    }}
                  >
                    Change Avatar
                  </Button>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  multiline
                  rows={4}
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  margin="normal"
                  helperText={`${profileData.bio.length}/500 characters`}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={updateProfile}
                disabled={loading}
              >
                Save Profile
              </Button>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Current Password"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      >
                        {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="New Password"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      >
                        {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      >
                        {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    )
                  }}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={changePassword}
                disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              >
                Change Password
              </Button>
            </Box>
          </TabPanel>

          {/* Privacy & Security Tab */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Privacy Settings
            </Typography>
            
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={privacySettings.isPrivate}
                    onChange={(e) => {
                      const newSettings = { ...privacySettings, isPrivate: e.target.checked };
                      setPrivacySettings(newSettings);
                      updateSettings('privacy', newSettings);
                    }}
                  />
                }
                label="Private Account"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                Only approved followers can see your posts
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={privacySettings.showEmail}
                    onChange={(e) => {
                      const newSettings = { ...privacySettings, showEmail: e.target.checked };
                      setPrivacySettings(newSettings);
                      updateSettings('privacy', newSettings);
                    }}
                  />
                }
                label="Show Email on Profile"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={privacySettings.showOnlineStatus}
                    onChange={(e) => {
                      const newSettings = { ...privacySettings, showOnlineStatus: e.target.checked };
                      setPrivacySettings(newSettings);
                      updateSettings('privacy', newSettings);
                    }}
                  />
                }
                label="Show Online Status"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={privacySettings.allowDirectMessages}
                    onChange={(e) => {
                      const newSettings = { ...privacySettings, allowDirectMessages: e.target.checked };
                      setPrivacySettings(newSettings);
                      updateSettings('privacy', newSettings);
                    }}
                  />
                }
                label="Allow Direct Messages"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={privacySettings.showLastSeen}
                    onChange={(e) => {
                      const newSettings = { ...privacySettings, showLastSeen: e.target.checked };
                      setPrivacySettings(newSettings);
                      updateSettings('privacy', newSettings);
                    }}
                  />
                }
                label="Show Last Seen"
              />
            </FormGroup>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" gutterBottom color="error">
              Danger Zone
            </Typography>
            
            <Card sx={{ border: '1px solid', borderColor: 'error.main' }}>
              <CardContent>
                <Typography variant="h6" color="error" gutterBottom>
                  Delete Account
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Once you delete your account, there is no going back. Please be certain.
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Notifications Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Email Notifications
            </Typography>
            
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.email.newFollower}
                    onChange={(e) => {
                      const newSettings = {
                        ...notificationSettings,
                        email: { ...notificationSettings.email, newFollower: e.target.checked }
                      };
                      setNotificationSettings(newSettings);
                      updateSettings('notifications', newSettings);
                    }}
                  />
                }
                label="New Followers"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.email.newMessage}
                    onChange={(e) => {
                      const newSettings = {
                        ...notificationSettings,
                        email: { ...notificationSettings.email, newMessage: e.target.checked }
                      };
                      setNotificationSettings(newSettings);
                      updateSettings('notifications', newSettings);
                    }}
                  />
                }
                label="New Messages"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.email.postLike}
                    onChange={(e) => {
                      const newSettings = {
                        ...notificationSettings,
                        email: { ...notificationSettings.email, postLike: e.target.checked }
                      };
                      setNotificationSettings(newSettings);
                      updateSettings('notifications', newSettings);
                    }}
                  />
                }
                label="Post Likes"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.email.postComment}
                    onChange={(e) => {
                      const newSettings = {
                        ...notificationSettings,
                        email: { ...notificationSettings.email, postComment: e.target.checked }
                      };
                      setNotificationSettings(newSettings);
                      updateSettings('notifications', newSettings);
                    }}
                  />
                }
                label="Post Comments"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.email.mention}
                    onChange={(e) => {
                      const newSettings = {
                        ...notificationSettings,
                        email: { ...notificationSettings.email, mention: e.target.checked }
                      };
                      setNotificationSettings(newSettings);
                      updateSettings('notifications', newSettings);
                    }}
                  />
                }
                label="Mentions"
              />
            </FormGroup>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Push Notifications
            </Typography>
            
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.push.newFollower}
                    onChange={(e) => {
                      const newSettings = {
                        ...notificationSettings,
                        push: { ...notificationSettings.push, newFollower: e.target.checked }
                      };
                      setNotificationSettings(newSettings);
                      updateSettings('notifications', newSettings);
                    }}
                  />
                }
                label="New Followers"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.push.newMessage}
                    onChange={(e) => {
                      const newSettings = {
                        ...notificationSettings,
                        push: { ...notificationSettings.push, newMessage: e.target.checked }
                      };
                      setNotificationSettings(newSettings);
                      updateSettings('notifications', newSettings);
                    }}
                  />
                }
                label="New Messages"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.push.postLike}
                    onChange={(e) => {
                      const newSettings = {
                        ...notificationSettings,
                        push: { ...notificationSettings.push, postLike: e.target.checked }
                      };
                      setNotificationSettings(newSettings);
                      updateSettings('notifications', newSettings);
                    }}
                  />
                }
                label="Post Likes"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.push.postComment}
                    onChange={(e) => {
                      const newSettings = {
                        ...notificationSettings,
                        push: { ...notificationSettings.push, postComment: e.target.checked }
                      };
                      setNotificationSettings(newSettings);
                      updateSettings('notifications', newSettings);
                    }}
                  />
                }
                label="Post Comments"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.push.mention}
                    onChange={(e) => {
                      const newSettings = {
                        ...notificationSettings,
                        push: { ...notificationSettings.push, mention: e.target.checked }
                      };
                      setNotificationSettings(newSettings);
                      updateSettings('notifications', newSettings);
                    }}
                  />
                }
                label="Mentions"
              />
            </FormGroup>
          </TabPanel>

          {/* Display Tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>
              Appearance
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Theme</InputLabel>
              <Select
                value={displaySettings.theme}
                onChange={(e) => {
                  const newSettings = { ...displaySettings, theme: e.target.value };
                  setDisplaySettings(newSettings);
                  updateSettings('display', newSettings);
                }}
                label="Theme"
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
                <MenuItem value="system">System Default</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Language</InputLabel>
              <Select
                value={displaySettings.language}
                onChange={(e) => {
                  const newSettings = { ...displaySettings, language: e.target.value };
                  setDisplaySettings(newSettings);
                  updateSettings('display', newSettings);
                }}
                label="Language"
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
                <MenuItem value="de">German</MenuItem>
                <MenuItem value="it">Italian</MenuItem>
                <MenuItem value="pt">Portuguese</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Timezone</InputLabel>
              <Select
                value={displaySettings.timezone}
                onChange={(e) => {
                  const newSettings = { ...displaySettings, timezone: e.target.value };
                  setDisplaySettings(newSettings);
                  updateSettings('display', newSettings);
                }}
                label="Timezone"
              >
                <MenuItem value="UTC">UTC</MenuItem>
                <MenuItem value="America/New_York">Eastern Time</MenuItem>
                <MenuItem value="America/Chicago">Central Time</MenuItem>
                <MenuItem value="America/Denver">Mountain Time</MenuItem>
                <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                <MenuItem value="Europe/London">London</MenuItem>
                <MenuItem value="Europe/Berlin">Berlin</MenuItem>
                <MenuItem value="Asia/Tokyo">Tokyo</MenuItem>
                <MenuItem value="Asia/Shanghai">Shanghai</MenuItem>
              </Select>
            </FormControl>
          </TabPanel>
        </Paper>

        {/* Delete Account Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle color="error">Delete Account</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to delete your account? This action cannot be undone.
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              All your posts, comments, and data will be permanently deleted.
            </Typography>
            <TextField
              fullWidth
              label="Enter your password to confirm"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              margin="normal"
              autoFocus
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={deleteAccount}
              color="error"
              variant="contained"
              disabled={!deletePassword || loading}
            >
              Delete Account
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Settings;
