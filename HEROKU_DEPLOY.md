# Spangles Chat App - Heroku Deployment Guide

This guide will help you deploy your Spangles Chat App to Heroku in just a few steps!

## 🚀 Quick Heroku Deployment

### Prerequisites
- Heroku CLI installed ([Download here](https://devcenter.heroku.com/articles/heroku-cli))
- Git installed
- Heroku account ([Sign up here](https://signup.heroku.com/))

### Step 1: Install Heroku CLI
```bash
# Windows (using installer)
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# macOS
brew tap heroku/brew && brew install heroku

# Ubuntu
sudo snap install --classic heroku
```

### Step 2: Login to Heroku
```bash
heroku login
```

### Step 3: Initialize Git Repository (if not already done)
```bash
cd /path/to/spangles-chat-app
git init
git add .
git commit -m "Initial commit - Spangles Chat App"
```

### Step 4: Create Heroku App
```bash
# Create app with a custom name (replace 'your-app-name' with your preferred name)
heroku create your-spangles-chat-app

# Or let Heroku generate a random name
heroku create
```

### Step 5: Add MongoDB Database
```bash
# Option A: MongoDB Atlas (Recommended - Free tier available)
# Go to https://cloud.mongodb.com/ and create a free cluster
# Get your connection string and set it as environment variable

# Option B: mLab MongoDB Add-on (if available)
heroku addons:create mongolab:sandbox
```

### Step 6: Set Environment Variables
```bash
# Required environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_super_secure_jwt_secret_key_here_make_it_long_and_random
heroku config:set MONGODB_URI=your_mongodb_connection_string_here

# Optional: Set a custom client URL if deploying frontend separately
heroku config:set CLIENT_URL=https://your-frontend-domain.com
```

### Step 7: Deploy to Heroku
```bash
git push heroku main
```

### Step 8: Open Your App
```bash
heroku open
```

## 🔧 Environment Variables Setup

### Required Variables
```bash
# JWT Secret (generate a strong secret)
heroku config:set JWT_SECRET=$(openssl rand -base64 64)

# MongoDB URI (from MongoDB Atlas)
heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/spangles-chat?retryWrites=true&w=majority"

# Production environment
heroku config:set NODE_ENV=production
```

### Optional Variables
```bash
# Custom port (Heroku sets this automatically)
# heroku config:set PORT=5000

# Custom client URL for CORS
# heroku config:set CLIENT_URL=https://your-frontend.vercel.app
```

## 💾 MongoDB Atlas Setup (Free Database)

1. **Create Account**: Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. **Create Cluster**: Choose "Free" tier (M0 Sandbox)
3. **Create Database User**: 
   - Go to Database Access
   - Add new user with username/password
4. **Whitelist IP**: 
   - Go to Network Access
   - Add IP: `0.0.0.0/0` (allows all IPs)
5. **Get Connection String**:
   - Go to Clusters → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database user password

## 🎯 Deployment Scripts

### One-Click Heroku Deploy
Create this file as `deploy-heroku.bat`:

```batch
@echo off
echo 🚀 Deploying Spangles Chat App to Heroku...
echo.

echo 📦 Building client...
cd client
call npm run build
cd ..

echo 📁 Copying build to server...
if not exist "server\public" mkdir "server\public"
xcopy "client\build\*" "server\public\" /E /Y /Q

echo 📤 Committing changes...
git add .
git commit -m "Deploy: Update build files"

echo 🌐 Pushing to Heroku...
git push heroku main

echo ✅ Deployment complete!
heroku open
pause
```

### Quick Setup Script
Create this file as `heroku-setup.bat`:

```batch
@echo off
echo 🚀 Setting up Heroku deployment...

set /p APP_NAME="Enter your Heroku app name (or press Enter for random): "
set /p JWT_SECRET="Enter JWT secret (or press Enter to generate): "
set /p MONGODB_URI="Enter MongoDB URI: "

if "%APP_NAME%"=="" (
    heroku create
) else (
    heroku create %APP_NAME%
)

if "%JWT_SECRET%"=="" (
    echo Generating JWT secret...
    heroku config:set JWT_SECRET=%RANDOM%%RANDOM%%RANDOM%%RANDOM%
) else (
    heroku config:set JWT_SECRET=%JWT_SECRET%
)

heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=%MONGODB_URI%

echo ✅ Heroku app configured!
echo Run 'git push heroku main' to deploy
pause
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Build Fails
```bash
# Check build logs
heroku logs --tail

# Common fix: Clear cache and rebuild
heroku repo:purge_cache -a your-app-name
git commit --allow-empty -m "Empty commit to redeploy"
git push heroku main
```

#### 2. App Crashes After Deploy
```bash
# Check logs
heroku logs --tail

# Common causes:
# - Missing environment variables
# - MongoDB connection issues
# - Port configuration issues
```

#### 3. MongoDB Connection Issues
```bash
# Verify MongoDB URI
heroku config:get MONGODB_URI

# Test connection locally with the same URI
```

#### 4. CORS Issues
```bash
# Add your Heroku app URL to allowed origins
heroku config:set CLIENT_URL=https://your-app-name.herokuapp.com
```

## 📊 Monitoring & Maintenance

### View Logs
```bash
# Real-time logs
heroku logs --tail

# Last 1000 lines
heroku logs -n 1000
```

### App Information
```bash
# App info
heroku info

# Config variables
heroku config
```

### Scaling (if needed)
```bash
# Scale to more dynos (costs money)
heroku ps:scale web=2

# Scale back to free tier
heroku ps:scale web=1
```

## 💰 Cost Estimation

### Free Tier Limits
- **Dyno Hours**: 550 hours/month (free)
- **Database**: MongoDB Atlas M0 (512MB - free)
- **Bandwidth**: No limit on free tier

### Paid Upgrades (Optional)
- **Hobby Dyno**: $7/month (sleeps after 30min inactivity)
- **Standard 1X**: $25/month (never sleeps)
- **MongoDB Atlas M2**: $9/month (2GB)

## 🔗 Custom Domain (Optional)

```bash
# Add custom domain
heroku domains:add your-domain.com

# Configure DNS (point to Heroku DNS target)
# Add CNAME record: your-domain.com → your-app-name.herokuapp.com

# Add SSL certificate (automatic with paid dynos)
heroku certs:auto:enable
```

## ✅ Final Checklist

- [ ] Heroku CLI installed
- [ ] Git repository initialized
- [ ] MongoDB Atlas cluster created
- [ ] Environment variables set
- [ ] Client build copied to server/public
- [ ] App deployed successfully
- [ ] Database connected
- [ ] Real-time features working

## 🚀 Deploy Now!

Run this command to deploy:

```bash
git push heroku main
```

Your Spangles Chat App will be live at: `https://your-app-name.herokuapp.com`

---

**Need help?** Check the [Heroku Dev Center](https://devcenter.heroku.com/) or run `heroku help`
