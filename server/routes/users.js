const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile/:username', auth, async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username })
      .populate('followers', 'username fullName avatar')
      .populate('following', 'username fullName avatar')
      .select('-password -email');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if current user follows this user
    const isFollowing = user.followers.some(
      follower => follower._id.toString() === req.user._id.toString()
    );

    // Get user's posts count
    const postCount = await Post.countDocuments({ author: user._id });

    res.json({
      ...user.toObject(),
      isFollowing,
      postCount
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, [
  body('fullName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Full name must be between 1 and 100 characters')
    .trim(),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters')
    .trim(),
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { fullName, bio, username, avatar, coverPhoto, isPrivate } = req.body;
    
    // Check if username is already taken (if being updated)
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }

    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (bio !== undefined) updateData.bio = bio;
    if (username !== undefined) updateData.username = username;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (coverPhoto !== undefined) updateData.coverPhoto = coverPhoto;
    if (isPrivate !== undefined) updateData.isPrivate = isPrivate;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Follow user
router.post('/follow', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(req.user._id);
    
    // Check if already following
    const isFollowing = currentUser.following.includes(userId);
    
    if (isFollowing) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Follow
    currentUser.following.push(userId);
    userToFollow.followers.push(req.user._id);
    await Promise.all([currentUser.save(), userToFollow.save()]);
    
    // Create notification
    const Notification = require('../models/Notification');
    await new Notification({
      recipient: userId,
      sender: req.user._id,
      type: 'follow',
      message: `${currentUser.fullName} started following you`
    }).save();
    
    res.json({ 
      message: 'User followed successfully',
      isFollowing: true
    });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check follow status - GET /follow/:userId
router.get('/follow/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const currentUser = await User.findById(req.user._id);
    const isFollowing = currentUser.following.includes(userId);
    
    res.json({ 
      isFollowing,
      userId: userId
    });
  } catch (error) {
    console.error('Check follow status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle follow/unfollow - POST /follow/:userId
router.post('/follow/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(req.user._id);
    
    // Check if already following
    const isFollowing = currentUser.following.includes(userId);
    
    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(userId);
      userToFollow.followers.pull(req.user._id);
      await Promise.all([currentUser.save(), userToFollow.save()]);
      
      res.json({ 
        message: 'User unfollowed successfully',
        isFollowing: false
      });
    } else {
      // Follow
      currentUser.following.push(userId);
      userToFollow.followers.push(req.user._id);
      await Promise.all([currentUser.save(), userToFollow.save()]);
      
      // Create notification
      const Notification = require('../models/Notification');
      await new Notification({
        recipient: userId,
        sender: req.user._id,
        type: 'follow',
        message: `${currentUser.fullName} started following you`
      }).save();
      
      res.json({ 
        message: 'User followed successfully',
        isFollowing: true
      });
    }
  } catch (error) {
    console.error('Follow/Unfollow error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unfollow user
router.post('/unfollow', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot unfollow yourself' });
    }

    const userToUnfollow = await User.findById(userId);
    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(req.user._id);
    
    // Check if not following
    const isFollowing = currentUser.following.includes(userId);
    
    if (!isFollowing) {
      return res.status(400).json({ message: 'You are not following this user' });
    }

    // Unfollow
    currentUser.following.pull(userId);
    userToUnfollow.followers.pull(req.user._id);
    await Promise.all([currentUser.save(), userToUnfollow.save()]);
    
    res.json({ 
      message: 'User unfollowed successfully',
      isFollowing: false
    });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's followers
router.get('/:username/followers', auth, async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const user = await User.findOne({ username })
      .populate({
        path: 'followers',
        select: 'username fullName avatar isOnline',
        options: {
          limit: limit * 1,
          skip: (page - 1) * limit
        }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.followers);
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's following
router.get('/:username/following', auth, async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const user = await User.findOne({ username })
      .populate({
        path: 'following',
        select: 'username fullName avatar isOnline',
        options: {
          limit: limit * 1,
          skip: (page - 1) * limit
        }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }    res.json(user.following);
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user followers
router.get('/:userId/followers', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .populate('followers', 'username fullName avatar bio')
      .select('followers');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      followers: user.followers
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user following
router.get('/:userId/following', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .populate('following', 'username fullName avatar bio')
      .select('following');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      following: user.following
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users
router.get('/search', auth, async (req, res) => {
  try {
    const { q = '', page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (q && q.trim().length > 0) {
      const searchRegex = new RegExp(q.trim(), 'i');
      query = {
        $or: [
          { username: searchRegex },
          { fullName: searchRegex }
        ]
      };
    }

    const users = await User.find(query)
    .select('username fullName avatar bio isOnline')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ username: 1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user's followers
router.get('/followers', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const user = await User.findById(req.user._id)
      .populate({
        path: 'followers',
        select: 'username fullName avatar isOnline lastSeen bio',
        options: {
          limit: limit * 1,
          skip: (page - 1) * limit
        }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      followers: user.followers,
      total: user.followers.length,
      page: parseInt(page)
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user's following
router.get('/following', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const user = await User.findById(req.user._id)
      .populate({
        path: 'following',
        select: 'username fullName avatar isOnline lastSeen bio',
        options: {
          limit: limit * 1,
          skip: (page - 1) * limit
        }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      following: user.following,
      total: user.following.length,
      page: parseInt(page)
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Server error' });  }
});

// Get user settings
router.get('/settings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('settings email username fullName');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      settings: user.settings || {},
      profile: {
        email: user.email,
        username: user.username,
        fullName: user.fullName
      }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user settings
router.put('/settings', auth, async (req, res) => {
  try {
    const { settings } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { settings } },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Settings updated successfully',
      settings: user.settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/change-password', auth, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete account
router.delete('/account', auth, [
  body('password')
    .notEmpty()
    .withMessage('Password is required for account deletion')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { password } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }

    // Delete user and related data
    await Promise.all([
      User.findByIdAndDelete(req.user._id),
      Post.deleteMany({ author: req.user._id }),
      // Remove user from all followers/following lists
      User.updateMany(
        { $or: [{ followers: req.user._id }, { following: req.user._id }] },
        { $pull: { followers: req.user._id, following: req.user._id } }
      )
    ]);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
