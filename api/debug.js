// Simple diagnostic API to check environment variables
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      vercelUrl: process.env.VERCEL_URL,
      environmentVariables: {
        NODE_ENV: !!process.env.NODE_ENV,
        JWT_SECRET: !!process.env.JWT_SECRET,
        JWT_SECRET_LENGTH: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
        MONGODB_URI: !!process.env.MONGODB_URI,
        MONGODB_URI_PREVIEW: process.env.MONGODB_URI ? 
          process.env.MONGODB_URI.substring(0, 60) + '...' : 'undefined',
        REACT_APP_API_URL: process.env.REACT_APP_API_URL,
        REACT_APP_SOCKET_URL: process.env.REACT_APP_SOCKET_URL
      },
      request: {
        method: req.method,
        url: req.url,
        headers: req.headers
      }
    };

    res.status(200).json({
      status: 'success',
      message: 'Diagnostic endpoint working',
      data: diagnostics
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
