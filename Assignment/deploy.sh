#!/bin/bash

# Google Cloud Deployment Script
# This script automates the deployment process

echo "🚀 Starting deployment to Google Cloud..."
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Checking dependencies..."
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
else
    echo "✅ Firebase CLI is installed"
fi
echo ""

# Step 2: Build production version
echo "🔨 Step 2: Building production version..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi
echo ""

# Step 3: Check Firebase login
echo "🔐 Step 3: Checking Firebase authentication..."
firebase projects:list > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Already logged in to Firebase"
else
    echo "⚠️  Not logged in. Please login..."
    firebase login
fi
echo ""

# Step 4: Display project info
echo "📋 Step 4: Project information"
echo "Project ID: assignment-cfc8f"
echo "Hosting URL: https://assignment-cfc8f.web.app"
echo ""

# Step 5: Deploy to Firebase Hosting
echo "🚀 Step 5: Deploying to Firebase Hosting..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "Your application is now live at:"
    echo "🌐 https://assignment-cfc8f.web.app"
    echo "🌐 https://assignment-cfc8f.firebaseapp.com"
    echo ""
    echo "You can view it in Firebase Console:"
    echo "📊 https://console.firebase.google.com/project/assignment-cfc8f/hosting"
else
    echo "❌ Deployment failed! Check the errors above."
    exit 1
fi





