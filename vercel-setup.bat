@echo off
title Spangles Chat App - Vercel Setup
color 0D

echo.
echo ===============================================
echo           SPANGLES CHAT APP
echo           Vercel Deployment Setup
echo ===============================================
echo.

echo 🔍 Checking Vercel CLI...
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI is not installed
    echo.
    echo Installing Vercel CLI...
    npm install -g vercel
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Vercel CLI
        echo Please install manually: npm install -g vercel
        pause
        exit /b 1
    )
) else (
    echo ✅ Vercel CLI is installed
    vercel --version
)

echo.
echo 🔑 Logging into Vercel...
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo Please login to Vercel:
    vercel login
) else (
    echo ✅ Already logged into Vercel
    vercel whoami
)

echo.
echo 📝 Backend Configuration...
echo.
echo For Vercel deployment, you need a backend server running.
echo Choose your backend deployment option:
echo.
echo 1. Railway (Recommended - Free tier)
echo 2. Heroku (Free tier available)
echo 3. Render (Free tier)
echo 4. I already have a backend deployed
echo.

set /p backend_choice="Enter your choice (1-4): "

if "%backend_choice%"=="1" (
    echo.
    echo 🚂 Setting up Railway deployment...
    echo.
    echo Please:
    echo 1. Install Railway CLI: npm install -g @railway/cli
    echo 2. Run: railway login
    echo 3. Run: railway new
    echo 4. Run: railway add --database mongodb
    echo 5. Set environment variables:
    echo    railway variables set NODE_ENV=production
    echo    railway variables set JWT_SECRET=your_secure_jwt_secret
    echo    railway variables set MONGODB_URI=your_mongodb_uri
    echo 6. Deploy: railway up
    echo.
    set /p railway_url="Enter your Railway app URL (e.g., https://your-app.railway.app): "
    set BACKEND_URL=%railway_url%
)

if "%backend_choice%"=="2" (
    echo.
    echo 🟣 Using Heroku deployment...
    echo Run heroku-setup.bat first to deploy your backend.
    echo.
    set /p heroku_url="Enter your Heroku app URL (e.g., https://your-app.herokuapp.com): "
    set BACKEND_URL=%heroku_url%
)

if "%backend_choice%"=="3" (
    echo.
    echo 🎨 Setting up Render deployment...
    echo.
    echo Please:
    echo 1. Go to https://render.com
    echo 2. Create new Web Service
    echo 3. Connect your GitHub repository
    echo 4. Set root directory: server
    echo 5. Build command: npm install
    echo 6. Start command: npm start
    echo 7. Add environment variables
    echo.
    set /p render_url="Enter your Render app URL (e.g., https://your-app.onrender.com): "
    set BACKEND_URL=%render_url%
)

if "%backend_choice%"=="4" (
    set /p BACKEND_URL="Enter your backend URL (e.g., https://your-api.com): "
)

echo.
echo ✅ Backend URL: %BACKEND_URL%
echo.

echo 📦 Preparing client for Vercel deployment...

echo Updating client environment variables...
cd client

:: Create production environment file
echo REACT_APP_API_URL=%BACKEND_URL%/api > .env.production
echo REACT_APP_SOCKET_URL=%BACKEND_URL% >> .env.production

echo ✅ Environment variables configured:
echo REACT_APP_API_URL=%BACKEND_URL%/api
echo REACT_APP_SOCKET_URL=%BACKEND_URL%

echo.
echo 🔨 Testing client build...
set CI=false
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Client build failed
    echo Please fix build errors before deploying
    cd ..
    pause
    exit /b 1
)

echo ✅ Client build successful!

cd ..

echo.
echo 🚀 Deploying to Vercel...
echo.

echo Deploying with production settings...
vercel --prod --confirm

if %errorlevel% neq 0 (
    echo ❌ Vercel deployment failed
    echo.
    echo Try these troubleshooting steps:
    echo 1. Check vercel logs
    echo 2. Verify build settings
    echo 3. Retry deployment: vercel --prod
    pause
    exit /b 1
)

echo.
echo ===============================================
echo          🎉 DEPLOYMENT SUCCESSFUL! 🎉
echo ===============================================
echo.

echo ✅ Your Spangles Chat App frontend is now live on Vercel!
echo.

echo 🌐 Getting your app URL...
vercel ls

echo.
echo 🔧 Setting environment variables in Vercel...
vercel env add REACT_APP_API_URL production
echo %BACKEND_URL%/api

vercel env add REACT_APP_SOCKET_URL production  
echo %BACKEND_URL%

echo.
echo ✅ Environment variables set!

echo.
echo 📊 Final Configuration:
echo 📱 Frontend: Your Vercel app URL
echo 🖥️  Backend: %BACKEND_URL%
echo 🗄️  Database: MongoDB Atlas
echo.

echo 🎯 Next Steps:
echo 1. Test your app functionality
echo 2. Set up custom domain (optional)
echo 3. Monitor performance
echo 4. Share your app with users!
echo.

echo 💡 Useful Commands:
echo - View deployment: vercel ls
echo - View logs: vercel logs
echo - Environment vars: vercel env ls
echo - Redeploy: vercel --prod
echo.

pause
