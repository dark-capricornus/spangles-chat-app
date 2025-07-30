@echo off
title Spangles Chat App - Set Vercel Environment Variables
color 0A

echo.
echo ===============================================
echo           SPANGLES CHAT APP
echo      Set Vercel Environment Variables
echo ===============================================
echo.

echo 🔑 Setting up environment variables for Vercel deployment...
echo.

echo Setting NODE_ENV...
vercel env add NODE_ENV production

echo.
echo Setting JWT_SECRET...
vercel env add JWT_SECRET SpanglesChatApp2025_VercelProduction_SecureKey_B7mK9nP2xQ8wR5tY1uI3oE6rT4yW7vZ0aS2dF5gH8jK1lM4nP7qR0tY3uI6oE9rT2yW5vZ8aS1dF4gH7jK0lM3nP6qR9tY2uI5oE8rT1yW4vZ7aS0d

echo.
echo Setting MONGODB_URI...
vercel env add MONGODB_URI mongodb+srv://admin:admin@social-media-app.gobsapk.mongodb.net/

echo.
echo Setting REACT_APP_API_URL...
vercel env add REACT_APP_API_URL https://spangles-chat-app.vercel.app/api

echo.
echo Setting REACT_APP_SOCKET_URL...
vercel env add REACT_APP_SOCKET_URL https://spangles-chat-app.vercel.app

echo.
echo ✅ Environment variables set! Redeploying...
vercel --prod

echo.
echo 🎉 Deployment complete! Check your app at:
echo https://spangles-chat-app.vercel.app
echo.
pause
