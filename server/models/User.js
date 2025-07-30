const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  coverPhoto: {
    type: String,
    default: ''
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  isPrivate: {
    type: Boolean,
    default: false
  },  verified: {
    type: Boolean,
    default: false
  },
  // Settings
  settings: {
    // Privacy settings
    privacy: {
      showEmail: {
        type: Boolean,
        default: false
      },
      showOnlineStatus: {
        type: Boolean,
        default: true
      },
      allowDirectMessages: {
        type: Boolean,
        default: true
      },
      showLastSeen: {
        type: Boolean,
        default: true
      }
    },
    // Notification settings
    notifications: {
      email: {
        newFollower: {
          type: Boolean,
          default: true
        },
        newMessage: {
          type: Boolean,
          default: true
        },
        postLike: {
          type: Boolean,
          default: true
        },
        postComment: {
          type: Boolean,
          default: true
        },
        mention: {
          type: Boolean,
          default: true
        }
      },
      push: {
        newFollower: {
          type: Boolean,
          default: true
        },
        newMessage: {
          type: Boolean,
          default: true
        },
        postLike: {
          type: Boolean,
          default: false
        },
        postComment: {
          type: Boolean,
          default: true
        },
        mention: {
          type: Boolean,
          default: true
        }
      }
    },
    // Theme and display settings
    display: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system'
      },
      language: {
        type: String,
        default: 'en'
      },
      timezone: {
        type: String,
        default: 'UTC'
      }
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get public profile
userSchema.methods.getPublicProfile = function() {
  const user = this.toObject();
  delete user.password;
  delete user.email;
  return user;
};

// Virtual for follower count
userSchema.virtual('followerCount').get(function() {
  return this.followers ? this.followers.length : 0;
});

// Virtual for following count
userSchema.virtual('followingCount').get(function() {
  return this.following ? this.following.length : 0;
});

userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
