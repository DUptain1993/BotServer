@echo off
REM Hacker Bot Matrix - Android APK Build Script for Windows
echo 🚀 Building Hacker Bot Matrix APK...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Check if Android SDK is available
if "%ANDROID_HOME%"=="" (
    echo ⚠️  ANDROID_HOME is not set. Please set your Android SDK path.
    echo    set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
)

echo 📦 Installing dependencies...
call npm install

echo 🔨 Building Next.js application...
call npm run build

echo 📱 Setting up Capacitor...
call npx cap add android

echo 🔄 Syncing with Android project...
call npx cap sync android

echo 🏗️  Building Android APK...
cd android

REM Check if gradlew exists
if not exist "gradlew.bat" (
    echo ❌ Gradle wrapper not found. Please run 'npx cap add android' first.
    pause
    exit /b 1
)

REM Build debug APK
echo 📱 Building debug APK...
call gradlew.bat assembleDebug

REM Check if build was successful
if errorlevel 1 (
    echo ❌ Debug APK build failed!
    pause
    exit /b 1
) else (
    echo ✅ Debug APK built successfully!
    echo 📁 APK location: android\app\build\outputs\apk\debug\app-debug.apk
)

REM Build release APK (unsigned)
echo 📱 Building release APK...
call gradlew.bat assembleRelease

REM Check if build was successful
if errorlevel 1 (
    echo ❌ Release APK build failed!
    pause
    exit /b 1
) else (
    echo ✅ Release APK built successfully!
    echo 📁 APK location: android\app\build\outputs\apk\release\app-release-unsigned.apk
)

cd ..

echo 🎉 Build completed successfully!
echo.
echo 📱 APK Files:
echo    Debug: android\app\build\outputs\apk\debug\app-debug.apk
echo    Release: android\app\build\outputs\apk\release\app-release-unsigned.apk
echo.
echo 📋 Next steps:
echo    1. Install the APK on your Android device
echo    2. For release, sign the APK with your keystore
echo    3. Upload to Google Play Store
echo.
echo 🔧 To open in Android Studio:
echo    npm run capacitor:open
echo.
pause
