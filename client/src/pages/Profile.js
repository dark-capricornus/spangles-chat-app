import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Tab,
  Tabs,
  Badge,
  Tooltip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  CardActions,
  Menu,
  MenuItem,
  Skeleton
} from '@mui/material';
import {
  Edit as EditIcon,
  CalendarToday as CalendarIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Message as MessageIcon,
  MoreVert as MoreVertIcon,
  Verified as VerifiedIcon,
  Lock as LockIcon,
  PhotoCamera as PhotoCameraIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import SafeImage from '../components/SafeImage';

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
};

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const { username } = useParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    bio: '',
    avatar: '',
    coverPhoto: ''
  });
  
  const isOwnProfile = !username || username === user?.username;

  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const targetUsername = username || user?.username;
      
      if (!targetUsername) {
        setLoading(false);        return;
      }

      const userResponse = await api.get(`/users/profile/${targetUsername}`);
      const userData = userResponse.data;
      
      setProfileUser(userData);
      setEditForm({
        fullName: userData.fullName || '',
        bio: userData.bio || '',
        avatar: userData.avatar || '',
        coverPhoto: userData.coverPhoto || ''
      });
      setIsFollowing(userData.isFollowing || false);
      try {
        const postsResponse = await api.get(`/posts/user/${targetUsername}`);
        const postsList = Array.isArray(postsResponse.data) ? postsResponse.data : (postsResponse.data.posts || []);
        setPosts(postsList);      } catch (error) {
        
      } finally {
      }    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  }, [username, user?.username]);

  const fetchFollowers = async () => {
    try {
      const response = await api.get(`/users/${profileUser._id}/followers`);
      setFollowers(response.data.followers || []);    } catch (error) {
      
    }
  };

  const fetchFollowing = async () => {
    try {
      const response = await api.get(`/users/${profileUser._id}/following`);
      setFollowing(response.data.following || []);    } catch (error) {
      
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await api.post('/users/unfollow', { userId: profileUser._id });
        setIsFollowing(false);
        setProfileUser(prev => ({
          ...prev,
          followerCount: (prev.followerCount || 0) - 1
        }));
      } else {
        await api.post('/users/follow', { userId: profileUser._id });
        setIsFollowing(true);
        setProfileUser(prev => ({
          ...prev,
          followerCount: (prev.followerCount || 0) + 1
        }));
      }    } catch (error) {
      
    }
  };
  const handleEditProfile = async () => {
    try {
      const response = await api.put('/users/profile', editForm);
      setProfileUser(prev => ({ ...prev, ...response.data.user }));
      updateUser(response.data.user);
      setEditDialogOpen(false);    } catch (error) {
      
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');    } catch (error) {
      
    }
  };

  const handleLikePost = async (postId, isLiked) => {
    try {
      if (isLiked) {
        await api.delete(`/posts/${postId}/like`);
      } else {
        await api.post(`/posts/${postId}/like`);
      }      
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? {
              ...post,
              likes: isLiked 
                ? post.likes.filter(like => like.user !== user._id)
                : [...post.likes, { user: user._id }],
              isLiked: !isLiked
            }
          : post
      ));} catch (error) {
      
    }
  };

  const handleStartChat = () => {
    navigate(`/chat?user=${profileUser.username}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="md">        <Box sx={{ mt: 3 }}>
          <Paper sx={{ p: 0, mb: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Skeleton variant="rectangular" height={200} />
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Skeleton variant="circular" width={100} height={100} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" height={40} width="60%" />
                    <Skeleton variant="text" height={24} width="40%" />
                    <Skeleton variant="text" height={60} width="80%" />
                  </Box>
                </Box>
              </Box>
            </Box>          </Paper>
          
          {[1, 2, 3].map((item) => (
            <Card key={item} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ ml: 2, flex: 1 }}>
                    <Skeleton variant="text" height={24} width="30%" />
                    <Skeleton variant="text" height={20} width="50%" />
                  </Box>
                </Box>
                <Skeleton variant="text" height={80} />
                <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    );
  }

  if (!profileUser) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="h5">User not found</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">      <Box sx={{ mt: 3 }}>        <Paper sx={{ mb: 3, overflow: 'hidden' }}>
          <Box
            sx={{ 
              height: 200, 
              backgroundImage: profileUser.coverPhoto ? `url(${profileUser.coverPhoto})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative'
            }}
          >
            {isOwnProfile && (
              <IconButton
                sx={{ 
                  position: 'absolute', 
                  top: 16, 
                  right: 16, 
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                }}                onClick={() => {
                  
                }}
              >
                <PhotoCameraIcon />
              </IconButton>
            )}
          </Box>          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <Box sx={{ position: 'relative' }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    profileUser.isOnline ? (
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: 'success.main',
                          border: '2px solid white'
                        }}
                      />
                    ) : null
                  }
                >                  <SafeImage
                    component="avatar"
                    src={profileUser.avatar}
                    sx={{ 
                      width: 100, 
                      height: 100,
                      border: '4px solid white',
                      fontSize: '2rem'
                    }}
                  >
                    {profileUser.fullName?.charAt(0)?.toUpperCase()}
                  </SafeImage>
                </Badge>
                
                {isOwnProfile && (
                  <IconButton
                    sx={{ 
                      position: 'absolute', 
                      bottom: 0, 
                      right: 0,
                      backgroundColor: 'primary.main',
                      color: 'white',
                      width: 32,
                      height: 32,
                      '&:hover': { backgroundColor: 'primary.dark' }
                    }}                    onClick={() => {
                      
                    }}
                  >
                    <PhotoCameraIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                )}              </Box>

              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h4" component="h1">
                    {profileUser.fullName}
                  </Typography>
                  {profileUser.verified && (
                    <Tooltip title="Verified Account">
                      <VerifiedIcon color="primary" />
                    </Tooltip>
                  )}
                  {profileUser.isPrivate && (
                    <Tooltip title="Private Account">
                      <LockIcon color="action" fontSize="small" />
                    </Tooltip>
                  )}
                </Box>
                
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  @{profileUser.username}
                </Typography>

                {profileUser.bio && (
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {profileUser.bio}
                  </Typography>
                )}

                {/* Stats */}
                <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                  <Button
                    variant="text"
                    onClick={() => {
                      fetchFollowers();
                      setFollowersDialogOpen(true);
                    }}
                  >
                    <Typography variant="body2">
                      <strong>{profileUser.followerCount || 0}</strong> Followers
                    </Typography>
                  </Button>
                  
                  <Button
                    variant="text"
                    onClick={() => {
                      fetchFollowing();
                      setFollowingDialogOpen(true);
                    }}
                  >
                    <Typography variant="body2">
                      <strong>{profileUser.followingCount || 0}</strong> Following
                    </Typography>
                  </Button>
                  
                  <Typography variant="body2">
                    <strong>{profileUser.postCount || posts.length}</strong> Posts
                  </Typography>
                </Box>

                {/* Join Date */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CalendarIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Joined {formatDate(profileUser.createdAt)}
                  </Typography>
                </Box>

                {/* Last Seen */}
                {!profileUser.isOnline && profileUser.lastSeen && (              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Last seen {formatTime(profileUser.lastSeen)}
                </Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {isOwnProfile ? (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => setEditDialogOpen(true)}
                    >
                      Edit Profile
                    </Button>                    <Button
                      variant="outlined"
                      startIcon={<SettingsIcon />}
                      onClick={() => navigate('/settings')}
                    >
                      Settings
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<LogoutIcon />}
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant={isFollowing ? "outlined" : "contained"}
                      startIcon={isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
                      onClick={handleFollow}
                    >
                      {isFollowing ? 'Unfollow' : 'Follow'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<MessageIcon />}
                      onClick={handleStartChat}
                    >
                      Message
                    </Button>
                    <IconButton
                      onClick={(e) => setMenuAnchor(e.currentTarget)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </>
                )}
              </Box>
            </Box>
          </Box>        </Paper>

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            aria-label="profile tabs"
            variant="fullWidth"
          >
            <Tab label={`Posts (${posts.length})`} />
            <Tab label="Media" />
            <Tab label="Likes" />
          </Tabs>        </Paper>        <TabPanel value={tabValue} index={0}>
          {posts.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                {isOwnProfile ? "You haven't posted anything yet" : "No posts yet"}
              </Typography>
            </Paper>
          ) : (
            posts.map((post) => (
              <Card key={post._id} sx={{ mb: 2 }}>
                <CardContent>                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SafeImage
                      component="avatar"
                      src={post.author?.avatar}
                      sx={{ mr: 2 }}
                    >
                      {post.author?.fullName?.charAt(0)}
                    </SafeImage>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {post.author?.fullName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        @{post.author?.username} • {formatTime(post.createdAt)}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {post.content}
                  </Typography>

                  {post.image && (
                    <CardMedia
                      component="img"
                      image={post.image}
                      alt="Post image"
                      sx={{ borderRadius: 1, mb: 2 }}
                    />
                  )}

                  {post.hashtags && post.hashtags.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      {post.hashtags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={`#${tag}`}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                          onClick={() => navigate(`/explore?hashtag=${tag}`)}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button
                    startIcon={post.isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    onClick={() => handleLikePost(post._id, post.isLiked)}
                    color={post.isLiked ? "error" : "inherit"}
                  >
                    {post.likes?.length || 0}
                  </Button>
                  
                  <Button
                    startIcon={<CommentIcon />}
                    onClick={() => navigate(`/post/${post._id}`)}
                  >
                    {post.comments?.length || 0}
                  </Button>
                  
                  <Button startIcon={<ShareIcon />}>
                    Share
                  </Button>
                </CardActions>
              </Card>
            ))
          )}
        </TabPanel>        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={1}>
            {posts
              .filter(post => post.image)
              .map((post) => (
                <Grid item xs={4} key={post._id}>
                  <Card sx={{ aspectRatio: '1/1' }}>
                    <CardMedia
                      component="img"
                      image={post.image}
                      alt="Post media"
                      sx={{ height: '100%', objectFit: 'cover' }}
                      onClick={() => navigate(`/post/${post._id}`)}
                    />
                  </Card>
                </Grid>
              ))}
          </Grid>
          
          {posts.filter(post => post.image).length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No media posts yet
              </Typography>
            </Paper>
          )}
        </TabPanel>        <TabPanel value={tabValue} index={2}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Liked posts feature coming soon
            </Typography>
          </Paper>        </TabPanel>

        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Full Name"
              value={editForm.fullName}
              onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Bio"
              multiline
              rows={4}
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              margin="normal"
              helperText={`${editForm.bio.length}/500 characters`}
            />
            <TextField
              fullWidth
              label="Avatar URL"
              value={editForm.avatar}
              onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Cover Photo URL"
              value={editForm.coverPhoto}
              onChange={(e) => setEditForm({ ...editForm, coverPhoto: e.target.value })}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditProfile} variant="contained">Save</Button>
          </DialogActions>        </Dialog>

        <Dialog open={followersDialogOpen} onClose={() => setFollowersDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Followers</DialogTitle>
          <DialogContent>
            <List>
              {followers.map((follower) => (
                <ListItem key={follower._id}>
                  <ListItemButton onClick={() => navigate(`/profile/${follower.username}`)}>                    <ListItemAvatar>
                      <SafeImage
                        component="avatar"
                        src={follower.avatar}
                      >
                        {follower.fullName?.charAt(0)}
                      </SafeImage>
                    </ListItemAvatar>
                    <ListItemText
                      primary={follower.fullName}
                      secondary={`@${follower.username}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            {followers.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                No followers yet
              </Typography>
            )}
          </DialogContent>        </Dialog>

        <Dialog open={followingDialogOpen} onClose={() => setFollowingDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Following</DialogTitle>
          <DialogContent>
            <List>
              {following.map((followed) => (
                <ListItem key={followed._id}>
                  <ListItemButton onClick={() => navigate(`/profile/${followed.username}`)}>                    <ListItemAvatar>
                      <SafeImage
                        component="avatar"
                        src={followed.avatar}
                      >
                        {followed.fullName?.charAt(0)}
                      </SafeImage>
                    </ListItemAvatar>
                    <ListItemText
                      primary={followed.fullName}
                      secondary={`@${followed.username}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            {following.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                Not following anyone yet
              </Typography>
            )}
          </DialogContent>        </Dialog>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem onClick={() => setMenuAnchor(null)}>
            Report User
          </MenuItem>
          <MenuItem onClick={() => setMenuAnchor(null)}>
            Block User
          </MenuItem>
        </Menu>
      </Box>
    </Container>
  );
};

export default Profile;
