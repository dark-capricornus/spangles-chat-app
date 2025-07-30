import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Chip,
  Grid,
  TextField,
  InputAdornment,
  Tab,
  Tabs,
  CircularProgress,
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  TrendingUp as TrendingIcon,
  People as PeopleIcon,
  Tag as TagIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import SafeImage from '../components/SafeImage';

const Explore = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExploreData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (tabValue === 0) {
        // Fetch popular posts
        const response = await api.get(`/posts/explore?search=${searchTerm}`);
        
        if (response.data) {
          setPosts(response.data.posts || []);
        }
      } else if (tabValue === 1) {
        // Fetch users
        const response = await api.get(`/users/search?q=${searchTerm}`);
        
        if (response.data) {
          setUsers(response.data.users || []);
        }
      } else if (tabValue === 2) {
        // Fetch trending hashtags
        const response = await api.get('/posts/hashtags/trending');
        
        if (response.data) {
          setHashtags(response.data.hashtags || []);
        }
      }
    } catch (error) {
      console.error('Error fetching explore data:', error);
    } finally {
      setLoading(false);
    }
  }, [tabValue, searchTerm]);
  useEffect(() => {
    fetchExploreData();
  }, [tabValue, searchTerm, fetchExploreData]);
  const handleLikePost = async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/like`);

      if (response.data) {
        // Update local state
        setPosts(prev => prev.map(post => 
          post._id === postId 
            ? { 
                ...post, 
                likes: post.likes?.includes(user._id) 
                  ? post.likes.filter(id => id !== user._id)
                  : [...(post.likes || []), user._id]
              }
            : post
        ));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };
  const handleFollowUser = async (userId) => {
    try {
      const response = await api.post('/users/follow', { userId });

      if (response.data) {
        // Update local state
        setUsers(prev => prev.map(u => 
          u._id === userId 
            ? { ...u, isFollowing: true }
            : u
        ));
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const PostCard = ({ post }) => {
    const isLiked = post.likes?.includes(user?._id);
    
    return (
      <Card sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent>          <Box display="flex" alignItems="center" mb={2}>
            <SafeImage
              component="avatar"
              src={post.author?.avatar} 
              sx={{ mr: 2, cursor: 'pointer' }}
              onClick={() => navigate(`/profile/${post.author?.username}`)}
            >
              {post.author?.fullName?.charAt(0)}
            </SafeImage>
            <Box>
              <Typography 
                variant="subtitle1" 
                fontWeight="bold"
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/profile/${post.author?.username}`)}
              >
                {post.author?.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                @{post.author?.username} • {formatDistanceToNow(new Date(post.createdAt))} ago
              </Typography>
            </Box>
          </Box>

          <Typography variant="body1" mb={2}>
            {post.content}
          </Typography>

          {post.hashtags?.length > 0 && (
            <Box mb={2}>
              {post.hashtags.map((tag, index) => (
                <Chip 
                  key={index}
                  label={`#${tag}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          )}
        </CardContent>

        {post.images?.length > 0 && (
          <CardMedia
            component="img"
            height="300"
            image={post.images[0]}
            alt="Post image"
            sx={{ objectFit: 'cover' }}
          />
        )}        {post.video && (
          <SafeImage
            component="video"
            height="300"
            src={post.video}
            controls
            sx={{ objectFit: 'cover' }}
          />
        )}

        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <IconButton 
                onClick={() => handleLikePost(post._id)}
                color={isLiked ? "error" : "default"}
              >
                {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              <Typography variant="caption" sx={{ mr: 2 }}>
                {post.likes?.length || 0}
              </Typography>

              <IconButton>
                <CommentIcon />
              </IconButton>
              <Typography variant="caption" sx={{ mr: 2 }}>
                {post.comments?.length || 0}
              </Typography>

              <IconButton>
                <ShareIcon />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const UserCard = ({ user: userData }) => (
    <Card sx={{ mb: 2 }}>      <CardContent sx={{ textAlign: 'center' }}>
        <SafeImage
          component="avatar"
          src={userData.avatar}
          sx={{ width: 80, height: 80, mx: 'auto', mb: 2, cursor: 'pointer' }}
          onClick={() => navigate(`/profile/${userData.username}`)}
        >
          {userData.fullName?.charAt(0)}
        </SafeImage>
        <Typography variant="h6" gutterBottom>
          {userData.fullName}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          @{userData.username}
        </Typography>
        {userData.bio && (
          <Typography variant="body2" sx={{ mb: 2 }}>
            {userData.bio}
          </Typography>
        )}
        <Button
          variant={userData.isFollowing ? "outlined" : "contained"}
          size="small"
          onClick={() => handleFollowUser(userData._id)}
          disabled={userData._id === user?._id}
        >
          {userData._id === user?._id ? 'You' : userData.isFollowing ? 'Following' : 'Follow'}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Explore
        </Typography>
        
        <TextField
          fullWidth
          placeholder="Search posts, users, or hashtags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)} 
          sx={{ mb: 3 }}
        >
          <Tab icon={<TrendingIcon />} label="Posts" />
          <Tab icon={<PeopleIcon />} label="People" />
          <Tab icon={<TagIcon />} label="Hashtags" />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {tabValue === 0 && (
              <Box>
                {posts.length === 0 ? (
                  <Typography variant="body1" color="text.secondary" textAlign="center">
                    No posts found. Try a different search term.
                  </Typography>
                ) : (
                  posts.map(post => <PostCard key={post._id} post={post} />)
                )}
              </Box>
            )}

            {tabValue === 1 && (
              <Grid container spacing={2}>
                {users.length === 0 ? (
                  <Grid item xs={12}>
                    <Typography variant="body1" color="text.secondary" textAlign="center">
                      No users found. Try a different search term.
                    </Typography>
                  </Grid>
                ) : (
                  users.map(userData => (
                    <Grid item xs={12} sm={6} md={4} key={userData._id}>
                      <UserCard user={userData} />
                    </Grid>
                  ))
                )}
              </Grid>
            )}

            {tabValue === 2 && (
              <Box>
                {hashtags.length === 0 ? (
                  <Typography variant="body1" color="text.secondary" textAlign="center">
                    No trending hashtags found.
                  </Typography>
                ) : (
                  <Grid container spacing={1}>
                    {hashtags.map((hashtag, index) => (
                      <Grid item key={index}>
                        <Chip
                          label={`#${hashtag.tag}`}
                          color="primary"
                          variant="outlined"
                          size="medium"
                          sx={{ mb: 1 }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default Explore;
