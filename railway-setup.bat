@echo off
title Spangles Chat App - Railway Backend Setup
color 0F

echo.
echo ===============================================
echo           SPANGLES CHAT APP
echo           Railway Backend Deployment
echo ===============================================
echo.

echo 🔍 Checking Railway CLI...
railway --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Railway CLI is not installed
    echo.
    echo Installing Railway CLI...
    npm install -g @railway/cli
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Railway CLI
        echo Please install manually: npm install -g @railway/cli
        pause
        exit /b 1
    )
) else (
    echo ✅ Railway CLI is installed
    railway --version
)

echo.
echo 🔑 Logging into Railway...
railway whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo Please login to Railway:
    railway login
) else (
    echo ✅ Already logged into Railway
    railway whoami
)

echo.
echo 🚂 Creating new Railway project...
railway new

if %errorlevel% neq 0 (
    echo ❌ Failed to create Railway project
    pause
    exit /b 1
)

echo.
echo ✅ Railway project created!

echo.
echo 🗄️ Adding MongoDB database...
railway add --database mongodb

echo.
echo 🔧 Setting up environment variables...

echo Setting NODE_ENV=production...
railway variables set NODE_ENV=production

echo.
set /p JWT_SECRET="Enter JWT secret (leave blank to auto-generate): "
if "%JWT_SECRET%"=="" (
    echo Generating secure JWT secret...
    set JWT_SECRET=SpanglesChatApp2025_Railway_%RANDOM%%RANDOM%%RANDOM%%RANDOM%_Production_%date:~-4,4%
)
railway variables set JWT_SECRET=%JWT_SECRET%

echo.
echo 📊 MongoDB URI will be automatically provided by Railway
echo Setting up additional variables...

railway variables set PORT=3000
railway variables set CLIENT_URL=https://your-app.vercel.app

echo.
echo ✅ Environment variables configured!

echo.
echo 🚀 Deploying backend to Railway...
echo This may take 2-3 minutes...

railway up

if %errorlevel% neq 0 (
    echo ❌ Railway deployment failed
    echo.
    echo Try these troubleshooting steps:
    echo 1. Check railway logs
    echo 2. Verify server directory structure
    echo 3. Retry deployment: railway up
    pause
    exit /b 1
)

echo.
echo ===============================================
echo         🎉 BACKEND DEPLOYMENT SUCCESSFUL! 🎉
echo ===============================================
echo.

echo ✅ Your backend is now live on Railway!

echo.
echo 🌐 Getting your Railway app URL...
railway status

echo.
echo 📊 Current variables:
railway variables

echo.
echo 🔗 Your backend API URL format:
echo https://your-project-name.railway.app/api

echo.
echo 📝 Copy your Railway URL for the next step:
echo 1. Note your Railway app URL from above
echo 2. Run vercel-setup.bat
echo 3. Choose option 1 (Railway) 
echo 4. Enter your Railway URL when prompted

echo.
echo 💡 Useful Railway Commands:
echo - View logs: railway logs
echo - Check status: railway status  
echo - View variables: railway variables
echo - Redeploy: railway up
echo.

echo 🎯 Next Step: Run vercel-setup.bat to deploy your frontend!

pause
