#!/bin/bash

# Spangles Chat App Deployment Script

echo "🚀 Starting Spangles Chat App Deployment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install server dependencies"
    exit 1
fi

# Install client dependencies
echo "📦 Installing client dependencies..."
cd ../client
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install client dependencies"
    exit 1
fi

# Build client for production
echo "🔨 Building client for production..."
CI=false npm run build
if [ $? -ne 0 ]; then
    echo "❌ Failed to build client"
    exit 1
fi

echo "✅ Client built successfully!"

# Copy build files to server public directory
echo "📁 Copying build files to server..."
mkdir -p ../server/public
cp -r build/* ../server/public/

echo "✅ Build files copied to server"

# Start the production server
echo "🚀 Starting production server..."
cd ../server
NODE_ENV=production npm start

echo "🎉 Deployment complete! Access your app at http://localhost:5000"
