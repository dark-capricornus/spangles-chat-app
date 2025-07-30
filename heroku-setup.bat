@echo off
title Spangles Chat App - Heroku Setup
color 0B

echo.
echo ===============================================
echo           SPANGLES CHAT APP
echo           Heroku Deployment Setup
echo ===============================================
echo.

echo 🔍 Checking Heroku CLI...
heroku --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Heroku CLI is not installed
    echo.
    echo Please install Heroku CLI first:
    echo https://devcenter.heroku.com/articles/heroku-cli
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Heroku CLI is installed
    heroku --version
)

echo.
echo 🔑 Logging into Heroku...
heroku auth:whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo Please login to Heroku:
    heroku login
) else (
    echo ✅ Already logged into Heroku
    heroku auth:whoami
)

echo.
echo 📝 App Configuration...
echo.

set /p APP_NAME="Enter your Heroku app name (leave blank for random): "
echo.

if "%APP_NAME%"=="" (
    echo Creating Heroku app with random name...
    heroku create
) else (
    echo Creating Heroku app: %APP_NAME%...
    heroku create %APP_NAME%
)

if %errorlevel% neq 0 (
    echo ❌ Failed to create Heroku app
    echo App name might already exist. Try a different name.
    pause
    exit /b 1
)

echo.
echo ✅ Heroku app created successfully!
echo.

echo 🔧 Setting up environment variables...

echo Setting NODE_ENV=production...
heroku config:set NODE_ENV=production

echo.
set /p JWT_SECRET="Enter JWT secret (leave blank to auto-generate): "
if "%JWT_SECRET%"=="" (
    echo Generating secure JWT secret...
    set JWT_SECRET=SpanglesChatApp2025_%RANDOM%%RANDOM%%RANDOM%%RANDOM%%RANDOM%_%date:~-4,4%%time:~0,2%%time:~3,2%_ProductionSecure
    heroku config:set JWT_SECRET=!JWT_SECRET!
) else (
    heroku config:set JWT_SECRET=%JWT_SECRET%
)

echo.
echo 📊 MongoDB Setup Required
echo.
echo You need a MongoDB database. Choose an option:
echo 1. I already have MongoDB Atlas URI
echo 2. Help me set up MongoDB Atlas (opens website)
echo.

set /p mongo_choice="Enter your choice (1-2): "

if "%mongo_choice%"=="2" (
    echo Opening MongoDB Atlas signup page...
    start https://cloud.mongodb.com/
    echo.
    echo Please:
    echo 1. Create a free account
    echo 2. Create a free M0 cluster
    echo 3. Create a database user
    echo 4. Add IP whitelist: 0.0.0.0/0
    echo 5. Get your connection string
    echo.
    pause
)

echo.
set /p MONGODB_URI="Enter your MongoDB URI: "
heroku config:set MONGODB_URI=%MONGODB_URI%

echo.
echo ✅ Environment variables configured!
echo.

echo 🔧 Current configuration:
heroku config

echo.
echo 📦 Building client application...
cd client
echo Building React app...
set CI=false
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Client build failed
    cd ..
    pause
    exit /b 1
)

echo ✅ Client build successful!

echo.
echo 📁 Copying build files to server...
cd ..
if not exist "server\public" mkdir "server\public"
xcopy "client\build\*" "server\public\" /E /Y /Q

echo ✅ Build files copied!

echo.
echo 📤 Preparing for deployment...

git status >nul 2>&1
if %errorlevel% neq 0 (
    echo Initializing Git repository...
    git init
    git add .
    git commit -m "Initial commit - Spangles Chat App"
) else (
    echo Adding files to Git...
    git add .
    git commit -m "Production build for Heroku deployment"
)

echo.
echo 🚀 Deploying to Heroku...
echo This may take a few minutes...
echo.

git push heroku main

if %errorlevel% neq 0 (
    echo ❌ Deployment failed
    echo.
    echo Check the error messages above.
    echo You can try again with: git push heroku main
    pause
    exit /b 1
)

echo.
echo ===============================================
echo           🎉 DEPLOYMENT SUCCESSFUL! 🎉
echo ===============================================
echo.

echo ✅ Your Spangles Chat App is now live!
echo.

echo 🌐 Opening your app...
heroku open

echo.
echo 📊 Useful commands:
echo - View logs: heroku logs --tail
echo - App info: heroku info
echo - Config vars: heroku config
echo.

echo 🔗 App URLs:
heroku info -s | findstr web_url

echo.
echo 🎯 Next Steps:
echo 1. Test your app functionality
echo 2. Set up custom domain (optional)
echo 3. Monitor logs for any issues
echo 4. Share your app with users!
echo.

pause
