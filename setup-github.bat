@echo off
title Spangles Chat App - GitHub Repository Setup
color 0A

echo.
echo ===============================================
echo           SPANGLES CHAT APP
echo          GitHub Repository Setup
echo ===============================================
echo.

echo 📋 Your project is ready to be pushed to GitHub!
echo.

echo 🔍 Current Status:
git log --oneline -5
echo.

echo 📦 Repository Options:
echo.
echo 1. 🌐 Create NEW GitHub repository:
echo    - Go to: https://github.com/new
echo    - Repository name: spangles-chat-app
echo    - Description: Full-stack social media chat app with React, Node.js, MongoDB
echo    - Set to Public or Private (your choice)
echo    - DO NOT initialize with README (we already have one)
echo.

echo 2. 🔗 After creating, add the remote:
echo    git remote add origin https://github.com/YOUR_USERNAME/spangles-chat-app.git
echo    git branch -M main
echo    git push -u origin main
echo.

echo 3. 📁 OR use existing repository:
echo    git remote add origin https://github.com/YOUR_USERNAME/EXISTING_REPO.git
echo    git push -u origin main
echo.

echo 💡 Quick Setup Commands (replace YOUR_USERNAME):
echo.
echo git remote add origin https://github.com/YOUR_USERNAME/spangles-chat-app.git
echo git branch -M main  
echo git push -u origin main
echo.

echo 🎯 After GitHub setup, your repository will have:
echo ✅ Complete production-ready code
echo ✅ Vercel deployment configuration  
echo ✅ Environment variable templates
echo ✅ Deployment automation scripts
echo ✅ Comprehensive documentation
echo.

echo 🌐 Opening GitHub...
start https://github.com/new

echo.
echo 📋 Copy the commands above after creating your repository!
echo.
pause
