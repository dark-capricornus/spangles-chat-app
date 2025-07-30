const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Environment validation for production
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET environment variable is required');
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required');
  process.exit(1);
}

console.log('✅ Environment variables validated');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 'undefined');
console.log('MONGODB_URI defined:', !!process.env.MONGODB_URI);

const authRoutes = require('../server/routes/auth');
const userRoutes = require('../server/routes/users');
const postRoutes = require('../server/routes/posts');
const chatRoutes = require('../server/routes/chat');
const notificationRoutes = require('../server/routes/notifications');

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://spangles-chat-app.vercel.app',
  'https://spangles-chat-app-git-main-dark-capricornus-projects.vercel.app',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (origin && origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/socialmedia', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

app.use('/uploads', express.static(path.join(__dirname, '../server/uploads')));

app.use('/auth', async (req, res, next) => {
  await connectToDatabase();
  authRoutes(req, res, next);
});

app.use('/users', async (req, res, next) => {
  await connectToDatabase();
  userRoutes(req, res, next);
});

app.use('/posts', async (req, res, next) => {
  await connectToDatabase();
  postRoutes(req, res, next);
});

app.use('/chat', async (req, res, next) => {
  await connectToDatabase();
  chatRoutes(req, res, next);
});

app.use('/notifications', async (req, res, next) => {
  await connectToDatabase();
  notificationRoutes(req, res, next);
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = app;
