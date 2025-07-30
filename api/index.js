const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Don't use process.exit in serverless functions - it kills the function
const validateEnvironment = () => {
  const missing = [];
  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
  if (!process.env.MONGODB_URI) missing.push('MONGODB_URI');
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
};

// Validate environment on startup
try {
  validateEnvironment();
  console.log('✅ Environment variables validated');
} catch (error) {
  console.error('❌ Environment validation failed:', error.message);
  throw error;
}

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

// Connect to database and mount routes
const setupRoutes = async () => {
  await connectToDatabase();
};

// Mount routes with database connection
app.use('/auth', async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', message: error.message });
  }
}, authRoutes);

app.use('/users', async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', message: error.message });
  }
}, userRoutes);

app.use('/posts', async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', message: error.message });
  }
}, postRoutes);

app.use('/chat', async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', message: error.message });
  }
}, chatRoutes);

app.use('/notifications', async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', message: error.message });
  }
}, notificationRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = app;
