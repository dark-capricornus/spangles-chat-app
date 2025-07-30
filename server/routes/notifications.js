const express = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();


router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    const filter = { recipient: req.user._id };
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .populate('sender', 'username fullName avatar')
      .populate('relatedPost', 'content images')
      .populate('relatedComment', 'content')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({
      notifications,
      total,
      unreadCount,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/:notificationId/read', auth, async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        recipient: req.user._id
      },
      {
        isRead: true,
        readAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user._id,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete notification
router.delete('/:notificationId', auth, async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notification count
router.get('/count', auth, async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Get notification count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notification count for specific user (admin or self only)
router.get('/count/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Only allow users to check their own notification count
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });    res.json({ unreadCount, userId });
  } catch (error) {
    console.error('Get user notification count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create sample notifications for testing (development only)
router.post('/create-samples', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.find().limit(5);
    
    if (users.length < 2) {
      return res.status(400).json({ message: 'Need at least 2 users to create sample notifications' });
    }

    const sampleNotifications = [
      {
        recipient: req.user._id,
        sender: users[1]._id,
        type: 'like',
        message: `${users[1].fullName} liked your post`,
        isRead: false
      },
      {
        recipient: req.user._id,
        sender: users[2] ? users[2]._id : users[0]._id,
        type: 'follow',
        message: `${users[2] ? users[2].fullName : users[0].fullName} started following you`,
        isRead: false
      },
      {
        recipient: req.user._id,
        sender: users[3] ? users[3]._id : users[0]._id,
        type: 'comment',
        message: `${users[3] ? users[3].fullName : users[0].fullName} commented on your post`,
        isRead: true
      }
    ];

    const notifications = await Notification.insertMany(sampleNotifications);
    res.json({ 
      message: 'Sample notifications created successfully',
      count: notifications.length,
      notifications 
    });
  } catch (error) {
    console.error('Create sample notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a test notification (for development/testing)
router.post('/create-test', auth, async (req, res) => {
  try {
    // Create a test notification
    const notification = new Notification({
      type: 'like',
      sender: req.user._id,
      recipient: req.user._id, // Send to self for testing
      message: `Test notification: Someone liked your post`,
      createdAt: new Date()
    });
    
    await notification.save();
    
    // Populate sender info
    await notification.populate('sender', 'username fullName avatar');
    
    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to(req.user._id.toString()).emit('new_notification', notification);
    }
    
    res.json({ 
      message: 'Test notification created',
      notification 
    });
  } catch (error) {
    console.error('Create test notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
