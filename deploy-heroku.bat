@echo off
title Spangles Chat App - Deploy to Heroku
color 0C

echo.
echo ===============================================
echo           SPANGLES CHAT APP
echo             Deploy to Heroku
echo ===============================================
echo.

echo 🔍 Checking prerequisites...

heroku auth:whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Not logged into Heroku
    echo Please run heroku-setup.bat first
    pause
    exit /b 1
) else (
    echo ✅ Logged into Heroku as:
    heroku auth:whoami
)

git status >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Not a Git repository
    echo Please run heroku-setup.bat first
    pause
    exit /b 1
) else (
    echo ✅ Git repository detected
)

echo.
echo 📦 Building latest version...

echo Building React client...
cd client
set CI=false
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed
    cd ..
    pause
    exit /b 1
)

echo ✅ Build successful!

echo.
echo 📁 Updating server files...
cd ..
if not exist "server\public" mkdir "server\public"
xcopy "client\build\*" "server\public\" /E /Y /Q

echo ✅ Files updated!

echo.
echo 📤 Committing changes...
git add .
git commit -m "Deploy: %date% %time%"

echo.
echo 🚀 Deploying to Heroku...
echo This may take 2-3 minutes...
echo.

git push heroku main

if %errorlevel% neq 0 (
    echo ❌ Deployment failed
    echo.
    echo Try these troubleshooting steps:
    echo 1. Check heroku logs --tail
    echo 2. Verify environment variables: heroku config
    echo 3. Retry deployment: git push heroku main --force
    pause
    exit /b 1
)

echo.
echo ===============================================
echo          🎉 DEPLOYMENT SUCCESSFUL! 🎉
echo ===============================================
echo.

echo ✅ Your app has been updated!
echo.

echo 🌐 Opening your app...
heroku open

echo.
echo 📊 Quick status check:
heroku ps

echo.
echo 🔗 Your app URL:
heroku info -s | findstr web_url

echo.
echo 💡 Pro Tips:
echo - Monitor logs: heroku logs --tail
echo - Check app status: heroku ps
echo - View config: heroku config
echo - Restart app: heroku restart
echo.

pause
