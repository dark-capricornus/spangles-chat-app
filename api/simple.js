const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// CORS configuration
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
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple test endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb_uri_exists: !!process.env.MONGODB_URI,
    jwt_secret_exists: !!process.env.JWT_SECRET
  });
});

app.get('/test', (req, res) => {
  res.json({
    message: 'API is working!',
    endpoint: '/api/test',
    timestamp: new Date().toISOString()
  });
});

// MongoDB connection for testing
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Test MongoDB connection
app.get('/db-test', async (req, res) => {
  try {
    await connectToDatabase();
    res.json({
      status: 'success',
      message: 'MongoDB connection successful',
      database: mongoose.connection.db.databaseName,
      readyState: mongoose.connection.readyState
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'MongoDB connection failed',
      error: error.message
    });
  }
});

// Basic auth test without database
app.post('/auth/test', (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }
    
    res.json({
      status: 'success',
      message: 'Auth endpoint working',
      jwtConfigured: true
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = app;
