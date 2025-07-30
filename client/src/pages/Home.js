import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  Chip,
  TextField,
  Button,
  Paper,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  Add as AddIcon,
  Send as SendIcon,
  DataObject as DataIcon,  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { formatDistanceToNow } from 'date-fns';
import api from '../utils/api';
import SafeImage from '../components/SafeImage';

const Home = () => {
  const { user } = useAuth();  const { socket } = useSocket();
  const queryClient = useQueryClient();  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);  // Helper function to get proper image URL  // Fetch feed posts
  const { data: feedData, isLoading, error } = useQuery(
    'feed',
    () => api.get('/posts/feed'),
    {
      enabled: !!user,
      refetchOnWindowFocus: false
    }
  );
  // Create post mutation
  const createPostMutation = useMutation(
    (postData) => {
      const formData = new FormData();
      formData.append('content', postData.content);
      
      // Add images if any
      if (postData.images && postData.images.length > 0) {
        postData.images.forEach((image) => {
          formData.append('images', image);
        });
      }
      
      return api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('feed');
        setCreatePostOpen(false);
        setNewPostContent('');
        setSelectedImages([]);
        setImagePreviews([]);
        
        // Emit real-time new post event
        if (socket && response.data) {
          socket.emit('new_post', response.data);
        }
      }
    }
  );

  // Like post mutation
  const likePostMutation = useMutation(
    (postId) => api.post(`/posts/${postId}/like`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('feed');
      }
    }
  );
  // Demo data creation mutation
  const createDemoDataMutation = useMutation(
    () => api.post('/demo/create-data'),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('feed');
      }
    }
  );
  const handleCreatePost = () => {
    if (newPostContent.trim() || selectedImages.length > 0) {
      createPostMutation.mutate({
        content: newPostContent.trim(),
        images: selectedImages
      });
    }
  };

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValidType) {
        alert(`${file.name} is not a valid image file.`);
        return false;
      }
      
      if (!isValidSize) {
        alert(`${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      
      return true;
    });

    // Limit to 5 images total
    const newImages = [...selectedImages, ...validFiles].slice(0, 5);
    setSelectedImages(newImages);

    // Create previews
    const newPreviews = newImages.map(file => {
      if (file instanceof File) {
        return URL.createObjectURL(file);
      }
      return file; // In case of existing URLs
    });
    
    setImagePreviews(newPreviews);
  };

  const handleRemoveImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    // Revoke object URL to prevent memory leaks
    if (imagePreviews[index] && imagePreviews[index].startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviews[index]);
    }
    
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleLike = (postId) => {
    likePostMutation.mutate(postId);
  };

  const PostCard = ({ post }) => {
    const isLiked = post.likes?.some(like => like.user === user?._id);
    
    return (
      <Card sx={{ mb: 2, borderRadius: 2 }}>
        {/* Post Header */}
        <CardContent>          <Box display="flex" alignItems="center" mb={2}>
            <SafeImage
              component="avatar"
              src={post.author?.avatar} 
              sx={{ mr: 2 }}
            >
              {post.author?.fullName?.charAt(0)}
            </SafeImage>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {post.author?.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                @{post.author?.username} • {formatDistanceToNow(new Date(post.createdAt))} ago
              </Typography>
            </Box>
          </Box>

          {/* Post Content */}
          <Typography variant="body1" mb={2}>
            {post.content}
          </Typography>

          {/* Hashtags */}
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
        </CardContent>        {/* Post Images */}
        {post.images?.length > 0 && (
          <Box sx={{ px: 0 }}>            {post.images.length === 1 ? (
              <SafeImage
                component="cardmedia"
                height="400"
                src={post.images[0]}
                alt="Post content"
                sx={{ objectFit: 'cover' }}
              />
            ) : (
              <Box 
                sx={{ 
                  display: 'grid',
                  gridTemplateColumns: post.images.length === 2 ? '1fr 1fr' : 
                                     post.images.length === 3 ? '1fr 1fr 1fr' :
                                     '1fr 1fr',
                  gridTemplateRows: post.images.length > 2 ? 'repeat(2, 200px)' : '300px',
                  gap: 1,
                  p: 0
                }}
              >
                {post.images.slice(0, 4).map((image, index) => (
                  <Box 
                    key={index}
                    sx={{ 
                      position: 'relative',
                      overflow: 'hidden',
                      gridColumn: post.images.length === 3 && index === 0 ? 'span 2' : 'span 1'
                    }}
                  >                    <SafeImage
                      src={image}
                      alt={`Post content ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        cursor: 'pointer'
                      }}
                    />
                    {index === 3 && post.images.length > 4 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '1.5rem',
                          fontWeight: 'bold'
                        }}
                      >
                        +{post.images.length - 4}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}        {/* Post Videos */}
        {post.video && (
          <SafeImage
            component="video"
            height="400"
            src={post.video}
            controls
            sx={{ objectFit: 'cover' }}
          />
        )}

        {/* Post Actions */}
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <IconButton 
                onClick={() => handleLike(post._id)}
                color={isLiked ? "error" : "default"}
              >
                {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              <Typography variant="caption" sx={{ mr: 2 }}>
                {post.likeCount || 0}
              </Typography>

              <IconButton>
                <CommentIcon />
              </IconButton>
              <Typography variant="caption" sx={{ mr: 2 }}>
                {post.commentCount || 0}
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

  const LoadingSkeleton = () => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
          <Box>
            <Skeleton variant="text" width={150} />
            <Skeleton variant="text" width={100} />
          </Box>
        </Box>
        <Skeleton variant="text" width="100%" height={60} />
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 2 }} />
      </CardContent>
    </Card>
  );

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => {
        if (preview && preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [imagePreviews]);

  if (error) {
    return (
      <Container maxWidth="md">
        <Box textAlign="center" mt={4}>
          <Typography variant="h6" color="error" gutterBottom>
            Unable to load feed
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {error.response?.data?.message || 'Something went wrong'}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => createDemoDataMutation.mutate()}
            disabled={createDemoDataMutation.isLoading}
          >
            {createDemoDataMutation.isLoading ? 'Creating...' : 'Create Demo Data'}
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">      {/* Welcome Section */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Welcome back, {user?.fullName}! 👋
            </Typography>
            <Typography variant="body1">
              Stay connected with your friends and discover what's happening in your network.
            </Typography>
          </Box>
            {(!feedData?.data?.posts || feedData.data.posts.length === 0) && (
            <Button
              variant="outlined"
              startIcon={<DataIcon />}
              onClick={() => createDemoDataMutation.mutate()}
              disabled={createDemoDataMutation.isLoading}
              sx={{ 
                color: 'white', 
                borderColor: 'white',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.8)',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              {createDemoDataMutation.isLoading ? 'Creating...' : 'Load Demo Data'}
            </Button>
          )}
        </Box>
        
        {(!feedData?.data?.posts || feedData.data.posts.length === 0) && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              🚀 <strong>Get Started:</strong> Click "Load Demo Data" to populate your feed with realistic posts, users, and conversations for demo purposes.
            </Typography>
            <Typography variant="caption">
              This will create sample users, posts with images, comments, likes, follows, and chat messages.
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Create Post FAB */}
      <Fab
        color="primary"
        aria-label="create post"
        sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
        onClick={() => setCreatePostOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Posts Feed */}
      {isLoading ? (
        Array.from({ length: 3 }).map((_, index) => (
          <LoadingSkeleton key={index} />
        ))      ) : feedData?.data?.posts?.length > 0 ? (
        feedData.data.posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))
      ) : (
        <Box textAlign="center" mt={4}>
          <Typography variant="h6" gutterBottom>
            No posts in your feed yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Start following users or create demo data to see posts here!
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => createDemoDataMutation.mutate()}
            disabled={createDemoDataMutation.isLoading}
            startIcon={<AddIcon />}
          >
            {createDemoDataMutation.isLoading ? 'Creating Demo Data...' : 'Create Demo Data'}
          </Button>
        </Box>
      )}

      {/* Create Post Dialog */}
      <Dialog 
        open={createPostOpen} 
        onClose={() => setCreatePostOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Post</DialogTitle>        <DialogContent>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            placeholder="What's on your mind?"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            sx={{ mt: 1 }}
          />
          
          {/* Image Upload Section */}
          <Box mt={2}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="image-upload"
              multiple
              type="file"
              onChange={handleImageSelect}
            />
            <label htmlFor="image-upload">
              <Button 
                component="span" 
                startIcon={<PhotoCameraIcon />} 
                variant="outlined" 
                size="small"
                disabled={selectedImages.length >= 5}
              >
                Add Photos ({selectedImages.length}/5)
              </Button>
            </label>
          </Box>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                Selected Images:
              </Typography>
              <Box 
                display="flex" 
                flexWrap="wrap" 
                gap={1}
                sx={{ maxHeight: 200, overflowY: 'auto' }}
              >
                {imagePreviews.map((preview, index) => (
                  <Box 
                    key={index} 
                    position="relative" 
                    sx={{ 
                      width: 80, 
                      height: 80,
                      borderRadius: 1,
                      overflow: 'hidden',
                      border: '1px solid #ddd'
                    }}
                  >
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveImage(index)}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.7)'
                        }
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreatePostOpen(false)}>
            Cancel
          </Button>          <Button 
            onClick={handleCreatePost}
            variant="contained"
            disabled={(!newPostContent.trim() && selectedImages.length === 0) || createPostMutation.isLoading}
            startIcon={<SendIcon />}
          >
            {createPostMutation.isLoading ? 'Posting...' : 'Post'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Home;
