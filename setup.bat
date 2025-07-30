@echo off
title Spangles Chat App - Final Setup Test
color 0A

echo.
echo ===============================================
echo           SPANGLES CHAT APP
echo        Final Setup & Deployment Test
echo ===============================================
echo.

echo 🔍 Checking system requirements...
echo.

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✅ Node.js is installed
    node --version
)

:: Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed
    pause
    exit /b 1
) else (
    echo ✅ npm is installed
    npm --version
)

echo.
echo 📦 Installing dependencies...
echo.

:: Install root dependencies
echo Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install root dependencies
    pause
    exit /b 1
)

:: Install server dependencies
echo Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install server dependencies
    pause
    exit /b 1
)

:: Install client dependencies
echo Installing client dependencies...
cd ..\client
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install client dependencies
    pause
    exit /b 1
)

echo.
echo ✅ All dependencies installed successfully!
echo.

echo 🔨 Testing build process...
cd ..\

:: Test client build
echo Building React client...
cd client
set CI=false
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Client build failed
    pause
    exit /b 1
) else (
    echo ✅ Client build successful!
)

echo.
echo 📋 Setup Summary:
echo ✅ Node.js and npm installed
echo ✅ All dependencies installed
echo ✅ Client build successful
echo ✅ Production deployment ready
echo.

echo 🚀 Ready to deploy! Choose an option:
echo.
echo 1. Start Development Mode (both servers)
echo 2. Build for Production
echo 3. Exit
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo 🚀 Starting development servers...
    cd ..\
    start "Backend Server" cmd /k "cd server && npm start"
    timeout /t 2 /nobreak > nul
    start "Frontend Client" cmd /k "cd client && npm start"
    echo.
    echo ✅ Servers starting...
    echo 📡 Backend: http://localhost:5000
    echo 🌐 Frontend: http://localhost:3000
    echo.
)

if "%choice%"=="2" (
    echo.
    echo 🔨 Building for production...
    
    :: Copy build to server
    if not exist "..\server\public" mkdir "..\server\public"
    echo Copying build files to server...
    xcopy "build\*" "..\server\public\" /E /Y /Q
    
    echo ✅ Production build complete!
    echo Files copied to server/public/
    echo.
    echo To deploy:
    echo 1. Set production environment variables in server/.env
    echo 2. Run: cd server && npm start
    echo 3. Access at: http://localhost:5000
    echo.
)

if "%choice%"=="3" (
    echo.
    echo 👋 Setup complete! 
    echo.
    echo Next steps:
    echo - Run start-dev.bat for development
    echo - Run deploy.bat for production
    echo - Check DEPLOYMENT.md for hosting options
    echo.
)

echo.
echo ===============================================
echo     🎉 SPANGLES CHAT APP READY! 🎉
echo ===============================================
echo.

pause
