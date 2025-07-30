# Spangles Chat App - Production Deployment

This application is now ready for production deployment. Follow these steps:

## Quick Start (Development)

1. **Run the development servers:**
   ```bash
   # On Windows
   double-click start-dev.bat
   
   # On macOS/Linux
   chmod +x deploy.sh
   ```

## Production Deployment

1. **Run the deployment script:**
   ```bash
   # On Windows
   double-click deploy.bat
   
   # On macOS/Linux
   chmod +x deploy.sh
   ./deploy.sh
   ```

## Manual Deployment Steps

If the scripts don't work, follow these manual steps:

### 1. Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Build for Production
```bash
# In client directory
cd client
set CI=false  # On Windows
export CI=false  # On macOS/Linux
npm run build
```

### 3. Configure Environment
Create production environment files:

**server/.env**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
```

### 4. Deploy

#### Option A: Serve React build from Express server
```bash
# Copy build files to server
cp -r client/build/* server/public/

# Start server (serves both API and React app)
cd server
npm start
```

#### Option B: Deploy separately
- Deploy React build to Vercel/Netlify
- Deploy Node.js server to Heroku/Railway/DigitalOcean

## Environment Variables

### Production Environment Variables
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/spangles_production
JWT_SECRET=your_very_secure_jwt_secret_here
```

### Client Environment Variables
```env
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_SOCKET_URL=https://your-api-domain.com
```

## Deployment Platforms

### Heroku
```bash
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
git push heroku main
```

### Railway
```bash
railway login
railway new
railway add --database mongodb
railway up
```

### DigitalOcean App Platform
1. Connect your GitHub repository
2. Configure build settings
3. Add environment variables
4. Deploy

## MongoDB Setup

### Local MongoDB
```bash
# Install MongoDB Community Edition
# Start MongoDB service
mongod --dbpath /path/to/data/directory
```

### MongoDB Atlas (Cloud)
1. Create account at mongodb.com/atlas
2. Create cluster
3. Get connection string
4. Update MONGODB_URI in .env

## SSL Certificate (Production)

For HTTPS in production:
```bash
# Using Let's Encrypt
sudo certbot --nginx -d yourdomain.com
```

## Monitoring & Logs

### PM2 (Process Manager)
```bash
npm install -g pm2
pm2 start server/index.js --name "spangles-chat"
pm2 logs spangles-chat
pm2 restart spangles-chat
```

### Health Check Endpoint
The server includes a health check at `/api/health`

## Security Checklist

- ✅ Environment variables secured
- ✅ JWT secret is strong and unique
- ✅ CORS configured for production domains
- ✅ MongoDB connection secured
- ✅ File upload validation enabled
- ✅ Rate limiting implemented
- ✅ Input validation in place

## Performance Optimization

- ✅ React build optimized
- ✅ Static files served efficiently
- ✅ Database queries optimized
- ✅ Socket.IO configured for production
- ✅ Gzip compression enabled

## Troubleshooting

### Build Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Connection Issues
- Check MongoDB connection string
- Verify environment variables
- Check firewall settings
- Ensure ports are open (3000, 5000)

### Socket.IO Issues
- Verify CORS settings
- Check WebSocket support
- Test fallback to HTTP polling

## Support

- Check logs for errors
- Verify all environment variables
- Test API endpoints manually
- Check database connectivity

---

**Your Spangles Chat App is ready for production! 🚀**
