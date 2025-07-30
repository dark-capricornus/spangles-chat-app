const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('../server/routes/auth');
const userRoutes = require('../server/routes/users');
const postRoutes = require('../server/routes/posts');
const chatRoutes = require('../server/routes/chat');
const notificationRoutes = require('../server/routes/notifications');

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://spangles-chat-app.vercel.app',
  'https://*.vercel.app',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        const pattern = allowedOrigin.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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

app.use('/api/auth', async (req, res, next) => {
  await connectToDatabase();
  authRoutes(req, res, next);
});

app.use('/api/users', async (req, res, next) => {
  await connectToDatabase();
  userRoutes(req, res, next);
});

app.use('/api/posts', async (req, res, next) => {
  await connectToDatabase();
  postRoutes(req, res, next);
});

app.use('/api/chat', async (req, res, next) => {
  await connectToDatabase();
  chatRoutes(req, res, next);
});

app.use('/api/notifications', async (req, res, next) => {
  await connectToDatabase();
  notificationRoutes(req, res, next);
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    }
  });
}

module.exports = app;
