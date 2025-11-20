#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting production deployment..."

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install --production=false

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install --production
cd ..

# Set proper permissions
echo "🔒 Setting file permissions..."
chmod -R 755 dist
chmod -R 755 server

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "ℹ️  Please edit the .env file with your production values and run this script again."
    exit 1
fi

# Start the server
echo "🚀 Starting production server..."
NODE_ENV=production node server/index.js

echo "✅ Deployment complete!"
