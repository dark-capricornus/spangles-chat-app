const express = require('express');
const cors = require('cors');

// Simple test endpoint to check if environment variables are loaded
const app = express();

app.use(cors());
app.use(express.json());

// Test endpoint to check environment variables
app.get('/api/test', (req, res) => {
  res.json({
    status: 'API is working',
    environment: process.env.NODE_ENV,
    jwtSecretDefined: !!process.env.JWT_SECRET,
    jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
    mongoUriDefined: !!process.env.MONGODB_URI,
    mongoUriPreview: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 50) + '...' : 'undefined',
    timestamp: new Date().toISOString()
  });
});

// Simple auth test without database
app.post('/api/auth/test', (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not defined');
    }
    
    res.json({
      status: 'Auth test successful',
      jwtSecretAvailable: true,
      message: 'Environment variables are loaded correctly'
    });
  } catch (error) {
    res.status(500).json({
      status: 'Auth test failed',
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = app;
