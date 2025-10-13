@echo off
REM Google Cloud Deployment Script for Windows
REM This script automates the deployment process

echo.
echo ====================================
echo  Google Cloud Deployment Script
echo ====================================
echo.

REM Step 1: Check Firebase CLI
echo [Step 1] Checking Firebase CLI...
where firebase >nul 2>nul
if %errorlevel% neq 0 (
    echo Firebase CLI not found. Installing...
    npm install -g firebase-tools
) else (
    echo Firebase CLI is installed.
)
echo.

REM Step 2: Build production version
echo [Step 2] Building production version...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed! Please fix errors and try again.
    pause
    exit /b 1
)
echo Build successful!
echo.

REM Step 3: Check Firebase login
echo [Step 3] Checking Firebase authentication...
firebase projects:list >nul 2>nul
if %errorlevel% neq 0 (
    echo Not logged in. Please login to Firebase...
    firebase login
)
echo.

REM Step 4: Display project info
echo [Step 4] Project Information
echo --------------------------------
echo Project ID: assignment-cfc8f
echo Hosting URL: https://assignment-cfc8f.web.app
echo.

REM Step 5: Deploy
echo [Step 5] Deploying to Firebase Hosting...
firebase deploy --only hosting

if %errorlevel% equ 0 (
    echo.
    echo ====================================
    echo  Deployment Successful!
    echo ====================================
    echo.
    echo Your application is now live at:
    echo https://assignment-cfc8f.web.app
    echo https://assignment-cfc8f.firebaseapp.com
    echo.
    echo Firebase Console:
    echo https://console.firebase.google.com/project/assignment-cfc8f/hosting
    echo.
) else (
    echo Deployment failed! Check the errors above.
    pause
    exit /b 1
)

pause





