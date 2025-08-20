# Android APK Build Guide

This guide will help you compile the Telegram Bot Platform into an Android APK.

## Prerequisites

### 1. Install Node.js and npm
```bash
# Download from https://nodejs.org/
# Or use package manager
sudo apt install nodejs npm  # Ubuntu/Debian
brew install node            # macOS
```

### 2. Install Android Development Tools

#### Option A: Android Studio (Recommended)
1. Download [Android Studio](https://developer.android.com/studio)
2. Install Android SDK through Android Studio
3. Set environment variables:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

#### Option B: Command Line Only
```bash
# Install Android SDK Command Line Tools
wget https://dl.google.com/android/repository/commandlinetools-linux-8512546_latest.zip
unzip commandlinetools-linux-8512546_latest.zip
mkdir -p $HOME/Android/Sdk/cmdline-tools
mv cmdline-tools $HOME/Android/Sdk/cmdline-tools/latest

export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Install required SDK packages
sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"
```

### 3. Install Java Development Kit (JDK)
```bash
# Ubuntu/Debian
sudo apt install openjdk-11-jdk

# macOS
brew install openjdk@11

# Windows
# Download from https://adoptium.net/
```

## Build Process

### Quick Build (Automated)
```bash
# Make the build script executable
chmod +x build-android.sh

# Run the automated build
./build-android.sh
```

### Manual Build (Step by Step)

1. **Install Dependencies**
```bash
npm install
```

2. **Build Next.js Application**
```bash
npm run build
```

3. **Add Android Platform**
```bash
npx cap add android
```

4. **Sync with Android Project**
```bash
npx cap sync android
```

5. **Build APK**
```bash
# Debug APK
npm run android:debug

# Release APK (unsigned)
npm run android:apk
```

## APK Locations

After successful build, you'll find the APK files at:
- **Debug APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

## Installing the APK

### On Android Device
1. Enable "Unknown Sources" in Settings > Security
2. Transfer the APK to your device
3. Tap the APK file to install

### Using ADB
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## Development

### Open in Android Studio
```bash
npm run capacitor:open
```

### Live Reload Development
```bash
# Terminal 1: Start Next.js dev server
npm run dev

# Terminal 2: Run on Android device
npx cap run android
```

## Troubleshooting

### Common Issues

1. **"ANDROID_HOME not set"**
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

2. **"Gradle wrapper not found"**
```bash
npx cap add android
npx cap sync android
```

3. **"Build tools not found"**
```bash
sdkmanager "build-tools;33.0.0"
```

4. **"Java version incompatible"**
```bash
# Use Java 11
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
```

### Build Errors

1. **Memory Issues**: Increase Gradle memory
```bash
# Add to android/gradle.properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m
```

2. **Network Issues**: Use local server
```bash
# Update capacitor.config.ts
server: {
  url: 'http://192.168.1.100:3000'
}
```

## Signing APK for Release

1. **Generate Keystore**
```bash
keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000
```

2. **Sign APK**
```bash
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore app-release-unsigned.apk alias_name
```

3. **Optimize APK**
```bash
zipalign -v 4 app-release-unsigned.apk app-release.apk
```

## Features

The Android APK includes:
- ✅ Cross-platform bot deployment
- ✅ Real-time monitoring dashboard
- ✅ Bot management interface
- ✅ File upload capabilities
- ✅ Offline support (basic)
- ✅ Push notifications (configurable)

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review Capacitor documentation: https://capacitorjs.com/
3. Check Android Studio logs for detailed error messages
