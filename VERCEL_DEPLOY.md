# Spangles Chat App - Vercel Deployment Guide

Deploy your Spangles Chat App frontend to Vercel and backend to Railway/Heroku for optimal performance.

## 🚀 Deployment Architecture

- **Frontend**: Vercel (React app)
- **Backend**: Railway/Heroku (Node.js API + Socket.IO)
- **Database**: MongoDB Atlas (Cloud)

## 📦 Frontend Deployment (Vercel)

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from Root Directory**
   ```bash
   cd /path/to/spangles-chat-app
   vercel --prod
   ```

4. **Configure Environment Variables**
   ```bash
   # Set your backend API URL
   vercel env add REACT_APP_API_URL
   # Enter: https://your-backend-app.herokuapp.com/api
   
   vercel env add REACT_APP_SOCKET_URL
   # Enter: https://your-backend-app.herokuapp.com
   ```

### Method 2: GitHub Integration

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Deploy to Vercel"
   git branch -M main
   git remote add origin https://github.com/yourusername/spangles-chat-app.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Connect your GitHub repository
   - Configure build settings:
     - **Framework**: Create React App
     - **Root Directory**: `client`
     - **Build Command**: `npm run build`
     - **Output Directory**: `build`

3. **Set Environment Variables**
   In Vercel dashboard → Project → Settings → Environment Variables:
   ```
   REACT_APP_API_URL = https://your-backend-domain.com/api
   REACT_APP_SOCKET_URL = https://your-backend-domain.com
   ```

## 🌐 Backend Deployment Options

### Option A: Railway (Recommended for Node.js)

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy**
   ```bash
   railway login
   railway new
   railway add --database mongodb
   railway up
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set JWT_SECRET=your_secure_jwt_secret
   railway variables set MONGODB_URI=your_mongodb_uri
   ```

### Option B: Heroku (Alternative)

1. **Use Existing Heroku Setup**
   ```bash
   # Run your existing setup
   heroku-setup.bat
   ```

2. **Get Heroku App URL**
   ```bash
   heroku info -s | findstr web_url
   ```

### Option C: Render (Free Alternative)

1. **Connect GitHub Repository**
   - Go to [render.com](https://render.com)
   - Create new Web Service
   - Connect your GitHub repo
   - Set root directory to `server`
   - Build command: `npm install`
   - Start command: `npm start`

## 📱 Client Configuration for Vercel

Update your client environment variables:

**client/.env.production**
```env
REACT_APP_API_URL=https://your-backend-domain.com/api
REACT_APP_SOCKET_URL=https://your-backend-domain.com
```

**client/.env.development**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## 🔧 Vercel Configuration

The `vercel.json` file is already configured with:
- Build settings for React
- Route handling for SPA
- Environment variable support
- Static file serving

## 🚀 One-Click Vercel Deploy

Click this button after setting up your backend:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/spangles-chat-app&env=REACT_APP_API_URL,REACT_APP_SOCKET_URL)

## 📊 Domain Configuration

### Custom Domain (Optional)

1. **In Vercel Dashboard**
   - Go to Project → Settings → Domains
   - Add your custom domain
   - Configure DNS records

2. **SSL Certificate**
   - Automatic with Vercel
   - No configuration needed

## 🔍 Testing Deployment

1. **Test Frontend**
   ```bash
   # Your Vercel URL
   https://your-app.vercel.app
   ```

2. **Test API Connection**
   ```bash
   # Check if frontend can reach backend
   curl https://your-backend-domain.com/api/health
   ```

3. **Test Real-time Features**
   - Open multiple browser tabs
   - Test chat functionality
   - Verify Socket.IO connection

## ⚡ Performance Optimization

### Vercel Edge Functions (Optional)

Create `client/api/health.js`:
```javascript
export default function handler(request, response) {
  response.status(200).json({
    message: 'Frontend is healthy',
    timestamp: new Date().toISOString()
  });
}
```

### CDN Optimization
- Vercel automatically handles CDN
- Global edge locations
- Automatic image optimization

## 🔧 Environment Variables Setup

**Backend (Railway/Heroku)**
```env
NODE_ENV=production
JWT_SECRET=your_secure_jwt_secret
MONGODB_URI=mongodb+srv://...
CLIENT_URL=https://your-app.vercel.app
CORS_ORIGIN=https://your-app.vercel.app
```

**Frontend (Vercel)**
```env
REACT_APP_API_URL=https://your-backend.railway.app/api
REACT_APP_SOCKET_URL=https://your-backend.railway.app
```

## 🚨 CORS Configuration

Update your backend CORS settings:

```javascript
// In server/index.js
const allowedOrigins = [
  'https://your-app.vercel.app',
  'https://your-app-*.vercel.app', // Preview deployments
  'http://localhost:3000' // Development
];
```

## ✅ Deployment Checklist

- [ ] Backend deployed (Railway/Heroku)
- [ ] MongoDB Atlas configured
- [ ] Environment variables set
- [ ] CORS configured for Vercel domain
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set in Vercel
- [ ] Custom domain configured (optional)
- [ ] Testing completed

## 🎯 Final URLs

After deployment:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.railway.app`
- **API**: `https://your-backend.railway.app/api`

Your Spangles Chat App will be live with:
- ⚡ Ultra-fast frontend (Vercel Edge Network)
- 🌐 Scalable backend (Railway/Heroku)
- 🔄 Real-time features (Socket.IO)
- 📱 Mobile-responsive design

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**
   ```javascript
   // Add Vercel domain to backend CORS
   CLIENT_URL=https://your-app.vercel.app
   ```

2. **Environment Variables**
   ```bash
   # Check Vercel variables
   vercel env ls
   
   # Check backend variables
   railway variables
   ```

3. **Build Failures**
   ```bash
   # Test build locally
   cd client && npm run build
   ```

---

**Ready to deploy? Choose your backend platform and let's get started! 🚀**
