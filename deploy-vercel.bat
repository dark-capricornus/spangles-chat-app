@echo off
title Spangles Chat App - Complete Vercel Deployment
color 0A

echo.
echo ===============================================
echo           SPANGLES CHAT APP
echo           Complete Vercel Deployment
echo ===============================================
echo.

echo 🎯 This script will deploy your complete app:
echo 📱 Frontend → Vercel
echo 🖥️  Backend → Railway (recommended)
echo 🗄️  Database → MongoDB Atlas
echo.

echo 🔍 Step 1: Prerequisites Check...
echo.

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is required
    echo Please install Node.js first
    pause
    exit /b 1
) else (
    echo ✅ Node.js installed
)

:: Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is required
    pause
    exit /b 1
) else (
    echo ✅ npm installed
)

echo.
echo 🗄️ Step 2: Database Setup...
echo.
echo You need MongoDB Atlas (free). Choose an option:
echo 1. I already have MongoDB Atlas URI
echo 2. Help me set up MongoDB Atlas
echo.

set /p db_choice="Enter your choice (1-2): "

if "%db_choice%"=="2" (
    echo Opening MongoDB Atlas...
    start https://cloud.mongodb.com/
    echo.
    echo Please:
    echo 1. Create free account at MongoDB Atlas
    echo 2. Create M0 (free) cluster
    echo 3. Create database user
    echo 4. Add IP whitelist: 0.0.0.0/0
    echo 5. Get connection string
    echo.
    pause
)

set /p MONGODB_URI="Enter your MongoDB Atlas URI: "

echo.
echo 🖥️ Step 3: Backend Deployment (Railway)...
echo.

echo Would you like to deploy backend to Railway? (y/n)
set /p deploy_backend="Enter choice: "

if /i "%deploy_backend%"=="y" (
    echo.
    echo 🚂 Deploying backend to Railway...
    call railway-setup.bat
    
    echo.
    set /p BACKEND_URL="Enter your Railway app URL (from above): "
) else (
    set /p BACKEND_URL="Enter your existing backend URL: "
)

echo.
echo 📱 Step 4: Frontend Deployment (Vercel)...
echo.

echo Preparing frontend for Vercel...

:: Update client environment
cd client
echo REACT_APP_API_URL=%BACKEND_URL%/api > .env.production
echo REACT_APP_SOCKET_URL=%BACKEND_URL% >> .env.production

echo ✅ Environment configured:
echo REACT_APP_API_URL=%BACKEND_URL%/api
echo REACT_APP_SOCKET_URL=%BACKEND_URL%

echo.
echo 🔨 Building client...
set CI=false
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed
    cd ..
    pause
    exit /b 1
)

echo ✅ Build successful!

cd ..

echo.
echo 🚀 Deploying to Vercel...

:: Check Vercel CLI
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    npm install -g vercel
)

:: Login to Vercel
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    vercel login
)

:: Deploy to Vercel
vercel --prod --confirm

if %errorlevel% neq 0 (
    echo ❌ Vercel deployment failed
    pause
    exit /b 1
)

echo.
echo 🔧 Setting Vercel environment variables...

:: Set environment variables in Vercel
vercel env add REACT_APP_API_URL production
echo %BACKEND_URL%/api

vercel env add REACT_APP_SOCKET_URL production
echo %BACKEND_URL%

echo.
echo 🔄 Redeploying with environment variables...
vercel --prod

echo.
echo ===============================================
echo          🎉 DEPLOYMENT COMPLETE! 🎉
echo ===============================================
echo.

echo ✅ Your Spangles Chat App is now live!
echo.

echo 🌐 Getting your URLs...
vercel ls

echo.
echo 📊 Final Configuration:
echo 📱 Frontend: Your Vercel app URL (above)
echo 🖥️  Backend: %BACKEND_URL%
echo 🗄️  Database: MongoDB Atlas
echo.

echo 🎯 Your app includes:
echo ✅ Real-time chat functionality
echo ✅ User authentication
echo ✅ Social media features  
echo ✅ Mobile-responsive design
echo ✅ Production-ready deployment
echo.

echo 💡 Useful commands:
echo - View Vercel deployments: vercel ls
echo - View logs: vercel logs
echo - Redeploy: vercel --prod
echo.

echo 🔗 Test your app at your Vercel URL!

pause
