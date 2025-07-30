const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const { uploadMultiple, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Create a post
router.post('/', auth, uploadMultiple, handleUploadError, [
  body('content')
    .notEmpty()
    .withMessage('Post content is required')
    .isLength({ max: 1000 })
    .withMessage('Post content must be less than 1000 characters')
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

    const { content, video, visibility = 'public' } = req.body;

    // Process uploaded images
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    // Extract hashtags and mentions
    const hashtags = content.match(/#[\w]+/g)?.map(tag => tag.slice(1)) || [];
    const mentions = content.match(/@[\w]+/g)?.map(mention => mention.slice(1)) || [];

    // Find mentioned users
    const mentionedUsers = await User.find({ 
      username: { $in: mentions } 
    }).select('_id');

    const post = new Post({
      author: req.user._id,
      content,
      images,
      video,
      visibility,
      hashtags,
      mentions: mentionedUsers.map(user => user._id)
    });

    await post.save();
    await post.populate('author', 'username fullName avatar');

    // Create notifications for mentioned users
    if (mentionedUsers.length > 0) {
      const notifications = mentionedUsers.map(user => ({
        recipient: user._id,
        sender: req.user._id,
        type: 'mention',
        message: `${req.user.fullName} mentioned you in a post`,
        relatedPost: post._id
      }));
      
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get feed (posts from followed users)
router.get('/feed', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const currentUser = await User.findById(req.user._id).select('following');
    const followingIds = [...(currentUser.following || []), req.user._id]; // Include own posts and handle undefined following

    const posts = await Post.find({ 
      author: { $in: followingIds },
      visibility: { $in: ['public', 'followers'] }
    })
    .populate('author', 'username fullName avatar verified')
    .populate({
      path: 'comments',
      populate: {
        path: 'author',
        select: 'username fullName avatar'
      },
      options: { limit: 3, sort: { createdAt: -1 } }
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Post.countDocuments({ 
      author: { $in: followingIds },
      visibility: { $in: ['public', 'followers'] }
    });

    res.json({
      posts,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get explore posts (public posts from all users)
router.get('/explore', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const posts = await Post.find({ visibility: 'public' })
      .populate('author', 'username fullName avatar verified')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username fullName avatar'
        },
        options: { limit: 3, sort: { createdAt: -1 } }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments({ visibility: 'public' });

    res.json({
      posts,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get explore posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's posts
router.get('/user/:username', auth, async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const user = await User.findOne({ username }).select('_id');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await Post.find({ author: user._id })
      .populate('author', 'username fullName avatar verified')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username fullName avatar'
        },
        options: { limit: 3, sort: { createdAt: -1 } }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments({ author: user._id });

    res.json({
      posts,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single post
router.get('/:postId', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await Post.findById(postId)
      .populate('author', 'username fullName avatar verified')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username fullName avatar'
        },
        options: { sort: { createdAt: -1 } }
      });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike post
router.post('/:postId/like', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.findIndex(
      like => like.user.toString() === req.user._id.toString()
    );

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
      await post.save();
      
      res.json({ 
        message: 'Post unliked successfully',
        isLiked: false,
        likeCount: post.likes.length
      });
    } else {
      // Like
      post.likes.push({ user: req.user._id });
      await post.save();

      // Create notification for post author (if not own post)
      if (post.author.toString() !== req.user._id.toString()) {
        await new Notification({
          recipient: post.author,
          sender: req.user._id,
          type: 'like',
          message: `${req.user.fullName} liked your post`,
          relatedPost: post._id
        }).save();
      }
      
      res.json({ 
        message: 'Post liked successfully',
        isLiked: true,
        likeCount: post.likes.length
      });
    }
  } catch (error) {
    console.error('Like/Unlike post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to post
router.post('/:postId/comments', auth, [
  body('content')
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 500 })
    .withMessage('Comment must be less than 500 characters')
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

    const { postId } = req.params;
    const { content } = req.body;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Extract mentions
    const mentions = content.match(/@[\w]+/g)?.map(mention => mention.slice(1)) || [];
    const mentionedUsers = await User.find({ 
      username: { $in: mentions } 
    }).select('_id');

    const comment = new Comment({
      post: postId,
      author: req.user._id,
      content,
      mentions: mentionedUsers.map(user => user._id)
    });

    await comment.save();
    await comment.populate('author', 'username fullName avatar');

    // Add comment to post
    post.comments.push(comment._id);
    await post.save();

    // Create notification for post author (if not own post)
    if (post.author.toString() !== req.user._id.toString()) {
      await new Notification({
        recipient: post.author,
        sender: req.user._id,
        type: 'comment',
        message: `${req.user.fullName} commented on your post`,
        relatedPost: post._id,
        relatedComment: comment._id
      }).save();
    }

    // Create notifications for mentioned users
    if (mentionedUsers.length > 0) {
      const notifications = mentionedUsers.map(user => ({
        recipient: user._id,
        sender: req.user._id,
        type: 'mention',
        message: `${req.user.fullName} mentioned you in a comment`,
        relatedPost: post._id,
        relatedComment: comment._id
      }));
      
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      message: 'Comment added successfully',
      comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post
router.delete('/:postId', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Delete associated comments
    await Comment.deleteMany({ post: postId });
    
    // Delete the post
    await Post.findByIdAndDelete(postId);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like a post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'fullName username');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already liked the post
    const isLiked = post.likes.includes(req.user._id);
    
    if (isLiked) {
      // Unlike the post
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      // Like the post
      post.likes.push(req.user._id);
      
      // Create notification for post author (if not liking own post)
      if (post.author._id.toString() !== req.user._id.toString()) {
        const notification = new Notification({
          type: 'like',
          sender: req.user._id,
          recipient: post.author._id,
          relatedPost: post._id,
          message: `${req.user.fullName} liked your post`
        });
        
        await notification.save();
        
        // Emit real-time notification
        const io = req.app.get('io');
        if (io) {
          io.to(post.author._id.toString()).emit('new_notification', {
            ...notification.toObject(),
            sender: {
              _id: req.user._id,
              fullName: req.user.fullName,
              username: req.user.username,
              avatar: req.user.avatar
            }
          });
        }
      }
    }

    await post.save();
    
    res.json({ 
      liked: !isLiked,
      likeCount: post.likes.length 
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Follow/Unfollow user
router.post('/users/:id/follow', auth, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);
    
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToFollow._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const isFollowing = currentUser.following.includes(userToFollow._id);
    
    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(id => id.toString() !== userToFollow._id.toString());
      userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== req.user._id.toString());
    } else {
      // Follow
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(req.user._id);
      
      // Create notification
      const notification = new Notification({
        type: 'follow',
        sender: req.user._id,
        recipient: userToFollow._id,
        message: `${req.user.fullName} started following you`
      });
      
      await notification.save();
      
      // Emit real-time notification
      const io = req.app.get('io');
      if (io) {
        io.to(userToFollow._id.toString()).emit('new_notification', {
          ...notification.toObject(),
          sender: {
            _id: req.user._id,
            fullName: req.user.fullName,
            username: req.user.username,
            avatar: req.user.avatar
          }
        });
      }
    }

    await currentUser.save();
    await userToFollow.save();
    
    res.json({ 
      following: !isFollowing,
      followerCount: userToFollow.followers.length 
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
