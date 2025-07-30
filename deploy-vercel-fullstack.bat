@echo off
title Spangles Chat App - Full Stack Vercel Deployment
color 0A

echo.
echo ===============================================
echo           SPANGLES CHAT APP
echo         Full Stack Vercel Deployment
echo ===============================================
echo.

echo 🚀 This will deploy your complete app to Vercel:
echo 📱 Frontend (React)
echo 🖥️  Backend (Node.js Serverless)
echo 🗄️  Database (MongoDB Atlas)
echo.

echo 🔍 Step 1: Prerequisites Check...
echo.

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is required
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✅ Node.js installed:
    node --version
)

:: Check Vercel CLI
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Vercel CLI
        echo Please run: npm install -g vercel
        pause
        exit /b 1
    )
) else (
    echo ✅ Vercel CLI installed:
    vercel --version
)

echo.
echo 🔑 Step 2: Vercel Authentication...
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo Please login to Vercel:
    vercel login
    if %errorlevel% neq 0 (
        echo ❌ Failed to login to Vercel
        pause
        exit /b 1
    )
) else (
    echo ✅ Logged into Vercel as:
    vercel whoami
)

echo.
echo 📦 Step 3: Building Client...
cd client
echo Building React app for production...
set CI=false
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Client build failed
    cd ..
    pause
    exit /b 1
)

echo ✅ Client build successful!
cd ..

echo.
echo 🔧 Step 4: Environment Variables Setup...
echo.
echo You need to set environment variables in Vercel dashboard.
echo Opening environment template...
type .env.vercel.template
echo.
echo 📋 Copy the above variables to Vercel dashboard:
echo 1. https://vercel.com/dashboard
echo 2. Select your project → Settings → Environment Variables
echo 3. Add each variable from the template above
echo.
echo Press any key after setting up environment variables...
pause >nul

echo.
echo 🚀 Step 5: Deploying to Vercel...
echo.

echo Deploying full-stack application...
vercel --prod

if %errorlevel% neq 0 (
    echo ❌ Deployment failed
    echo.
    echo Troubleshooting:
    echo 1. Check vercel.json configuration
    echo 2. Verify environment variables in Vercel dashboard
    echo 3. Check build logs with: vercel logs
    echo 4. Try: vercel --debug
    pause
    exit /b 1
)

echo.
echo ===============================================
echo          🎉 DEPLOYMENT SUCCESSFUL! 🎉
echo ===============================================
echo.

echo ✅ Your Spangles Chat App is now live!
echo.

echo 🌐 Your app is deployed at:
vercel ls | findstr "https"

echo.
echo 🔧 Final Steps:
echo 1. ✅ Frontend deployed
echo 2. ✅ Backend API routes deployed
echo 3. ✅ Environment variables configured
echo 4. 🌐 Test your app functionality
echo.

echo 💡 Important URLs:
echo - App: https://your-app.vercel.app
echo - API: https://your-app.vercel.app/api
echo - Dashboard: https://vercel.com/dashboard
echo.

echo 🎯 Testing Checklist:
echo □ User registration/login
echo □ Real-time chat
echo □ Posts and social features
echo □ Image uploads
echo □ Notifications
echo.

echo 🌐 Opening your live app...
start https://vercel.com/dashboard

echo.
echo 🎉 Congratulations! Your full-stack chat app is live!
echo.
pause
