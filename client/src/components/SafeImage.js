import React, { useState } from 'react';
import { Avatar, CardMedia, Box, Typography } from '@mui/material';

const SafeImage = ({ 
  src, 
  alt, 
  component = 'img',
  fallback = null,
  onError,
  ...props 
}) => {
  const [hasError, setHasError] = useState(false);

  // Utility function to handle image URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) {
      return `${process.env.REACT_APP_SERVER_URL}${imagePath}`;
    }
    return imagePath;
  };
  const handleError = (e) => {
    setHasError(true);
    if (onError) onError(e);
  };

  const handleLoad = () => {
    // Video/image loaded successfully
  };

  const imageUrl = getImageUrl(src);

  // If there's an error or no src, show fallback or hide
  if (hasError || !imageUrl) {
    return fallback || null;
  }

  // Render based on component type
  if (component === 'avatar') {
    return (
      <Avatar
        {...props}
        src={imageUrl}
        onError={handleError}
        onLoad={handleLoad}
      >
        {props.children}
      </Avatar>
    );
  }
  if (component === 'cardmedia') {
    return (
      <CardMedia
        {...props}
        image={imageUrl}
        onError={handleError}
        onLoad={handleLoad}
      />
    );
  }  if (component === 'video') {
    if (hasError || !imageUrl) {
      return (
        <Box
          sx={{
            height: props.height || 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'grey.100',
            color: 'text.secondary',
            borderRadius: 1,
            ...props.sx
          }}
        >
          <Typography variant="body2">
            Video unavailable
          </Typography>
        </Box>
      );
    }
    
    return (
      <CardMedia
        {...props}
        component="video"
        src={imageUrl}
        onError={handleError}
        onLoadedData={handleLoad}
        onCanPlay={handleLoad}
      />
    );
  }

  // Default img element
  return (
    <img
      {...props}
      src={imageUrl}
      alt={alt}
      onError={handleError}
      onLoad={handleLoad}
      style={{
        display: hasError ? 'none' : 'block',
        ...props.style
      }}
    />
  );
};

export default SafeImage;
