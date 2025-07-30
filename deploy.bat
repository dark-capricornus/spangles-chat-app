@echo off
echo 🚀 Starting Spangles Chat App Deployment...

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

:: Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

:: Install server dependencies
echo 📦 Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install server dependencies
    pause
    exit /b 1
)

:: Install client dependencies
echo 📦 Installing client dependencies...
cd ..\client
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install client dependencies
    pause
    exit /b 1
)

:: Build client for production
echo 🔨 Building client for production...
set CI=false
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build client
    pause
    exit /b 1
)

echo ✅ Client built successfully!

:: Copy build files to server public directory
echo 📁 Copying build files to server...
if not exist "..\server\public" mkdir "..\server\public"
xcopy "build\*" "..\server\public\" /E /Y

echo ✅ Build files copied to server

:: Start the production server
echo 🚀 Starting production server...
cd ..\server
set NODE_ENV=production
call npm start

echo 🎉 Deployment complete! Access your app at http://localhost:5000
pause
