#!/bin/bash

# Firebase Deployment Script for Redbow E-commerce
# This script handles complete deployment including rules and hosting

set -e  # Exit on any error

echo "🚀 Starting Redbow deployment..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if user is logged in or has CI token
if [ -z "$FIREBASE_TOKEN" ]; then
    echo "🔐 No FIREBASE_TOKEN found. Attempting login..."
    if ! firebase login --reauth; then
        echo "❌ Authentication failed. Please set FIREBASE_TOKEN environment variable"
        echo "   Generate token with: firebase login:ci"
        exit 1
    fi
else
    echo "✅ Using FIREBASE_TOKEN for authentication"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy everything
echo "🚀 Deploying to Firebase..."

if [ -n "$FIREBASE_TOKEN" ]; then
    # Use CI token for deployment
    firebase deploy \
        --only hosting,firestore:rules,firestore:indexes,storage:rules \
        --project redbow-24723 \
        --token "$FIREBASE_TOKEN"
else
    # Interactive deployment
    firebase deploy \
        --only hosting,firestore:rules,firestore:indexes,storage:rules \
        --project redbow-24723
fi

echo "✅ Deployment completed successfully!"
echo "🌐 Your site is live at: https://redbow-24723.web.app"