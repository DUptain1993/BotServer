#!/bin/bash

# Telegram Bot Platform - Android APK Build Script
echo "🚀 Building Telegram Bot Platform APK..."

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

# Check if Android SDK is available
if [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  ANDROID_HOME is not set. Please set your Android SDK path."
    echo "   export ANDROID_HOME=/path/to/android/sdk"
fi

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building Next.js application..."
npm run build

echo "📱 Setting up Capacitor..."
npx cap add android

echo "🔄 Syncing with Android project..."
npx cap sync android

echo "🏗️  Building Android APK..."
cd android

# Check if gradlew exists
if [ ! -f "./gradlew" ]; then
    echo "❌ Gradle wrapper not found. Please run 'npx cap add android' first."
    exit 1
fi

# Make gradlew executable
chmod +x ./gradlew

# Build debug APK
echo "📱 Building debug APK..."
./gradlew assembleDebug

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Debug APK built successfully!"
    echo "📁 APK location: android/app/build/outputs/apk/debug/app-debug.apk"
else
    echo "❌ APK build failed!"
    exit 1
fi

# Build release APK (unsigned)
echo "📱 Building release APK..."
./gradlew assembleRelease

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Release APK built successfully!"
    echo "📁 APK location: android/app/build/outputs/apk/release/app-release-unsigned.apk"
else
    echo "❌ Release APK build failed!"
    exit 1
fi

cd ..

echo "🎉 Build completed successfully!"
echo ""
echo "📱 APK Files:"
echo "   Debug: android/app/build/outputs/apk/debug/app-debug.apk"
echo "   Release: android/app/build/outputs/apk/release/app-release-unsigned.apk"
echo ""
echo "📋 Next steps:"
echo "   1. Install the APK on your Android device"
echo "   2. For release, sign the APK with your keystore"
echo "   3. Upload to Google Play Store"
echo ""
echo "🔧 To open in Android Studio:"
echo "   npm run capacitor:open"
