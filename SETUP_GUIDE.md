# Complete Setup Guide for Windows

This guide will help you set up everything needed to build the Telegram Bot Platform APK on Windows.

## Step 1: Install Node.js and npm

### Option A: Download from Official Website (Recommended)
1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Download the LTS version (18.x or higher)
3. Run the installer and follow the setup wizard
4. Verify installation:
```cmd
node --version
npm --version
```

### Option B: Using Chocolatey
```cmd
# Install Chocolatey first (run as Administrator)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Node.js
choco install nodejs
```

### Option C: Using Winget
```cmd
winget install OpenJS.NodeJS
```

## Step 2: Install Android Development Tools

### Option A: Android Studio (Recommended)
1. Download [Android Studio](https://developer.android.com/studio)
2. Run the installer
3. During setup, make sure to install:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device
4. Set environment variables:
```cmd
setx ANDROID_HOME "C:\Users\%USERNAME%\AppData\Local\Android\Sdk"
setx PATH "%PATH%;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools"
```

### Option B: Command Line Only
1. Download [Android Command Line Tools](https://developer.android.com/studio#command-tools)
2. Extract to `C:\Users\%USERNAME%\AppData\Local\Android\Sdk\cmdline-tools\latest`
3. Set environment variables:
```cmd
setx ANDROID_HOME "C:\Users\%USERNAME%\AppData\Local\Android\Sdk"
setx PATH "%PATH%;%ANDROID_HOME%\cmdline-tools\latest\bin;%ANDROID_HOME%\platform-tools"
```
4. Install required packages:
```cmd
sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"
```

## Step 3: Install Java Development Kit (JDK)

### Option A: Download from Adoptium
1. Go to [https://adoptium.net/](https://adoptium.net/)
2. Download Eclipse Temurin JDK 11 for Windows
3. Run the installer
4. Set environment variable:
```cmd
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-11.0.21.9-hotspot"
```

### Option B: Using Chocolatey
```cmd
choco install temurin11
```

## Step 4: Verify Installation

Open a new Command Prompt and run:
```cmd
node --version
npm --version
java -version
echo %ANDROID_HOME%
echo %JAVA_HOME%
```

## Step 5: Build the APK

### Quick Build (Automated)
```cmd
# Run the Windows build script
build-android.bat
```

### Manual Build
```cmd
# Install dependencies
npm install

# Build Next.js application
npm run build

# Add Android platform
npx cap add android

# Sync with Android project
npx cap sync android

# Build APK
npm run android:debug
```

## Alternative: Online Build Services

If you don't want to install everything locally, you can use online build services:

### Option A: GitHub Actions
1. Push your code to GitHub
2. Create `.github/workflows/build-android.yml`:
```yaml
name: Build Android APK
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    - uses: actions/setup-java@v3
      with:
        java-version: '11'
    - name: Setup Android SDK
      uses: android-actions/setup-android@v2
    - name: Install dependencies
      run: npm install
    - name: Build APK
      run: |
        npm run build
        npx cap add android
        npx cap sync android
        cd android
        ./gradlew assembleDebug
    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: app-debug
        path: android/app/build/outputs/apk/debug/app-debug.apk
```

### Option B: Expo Build Service
If you want to convert to Expo:
```cmd
npm install -g @expo/cli
expo init TelegramBotPlatform
# Copy your components and modify for Expo
expo build:android
```

### Option C: Appetize.io
1. Build the APK locally or via CI
2. Upload to [Appetize.io](https://appetize.io/)
3. Test on virtual devices

## Troubleshooting

### Common Windows Issues

1. **"npm is not recognized"**
   - Restart Command Prompt after installing Node.js
   - Check if Node.js is in PATH: `echo %PATH%`

2. **"ANDROID_HOME not set"**
   - Set environment variable: `setx ANDROID_HOME "C:\Users\%USERNAME%\AppData\Local\Android\Sdk"`
   - Restart Command Prompt

3. **"Java not found"**
   - Install JDK 11
   - Set JAVA_HOME: `setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-11.0.21.9-hotspot"`

4. **"Gradle build failed"**
   - Increase memory: Add to `android/gradle.properties`:
     ```
     org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m
     ```

5. **"Permission denied"**
   - Run Command Prompt as Administrator

### Build Errors

1. **Memory Issues**
```cmd
# Add to android/gradle.properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m
```

2. **Network Issues**
```cmd
# Update capacitor.config.ts
server: {
  url: 'http://192.168.1.100:3000'
}
```

3. **SDK Issues**
```cmd
sdkmanager --update
sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"
```

## APK Installation

### On Android Device
1. Enable "Unknown Sources" in Settings > Security
2. Transfer APK to device
3. Tap APK to install

### Using ADB
```cmd
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

## Next Steps

After successful build:
1. Test the APK on your device
2. Sign the APK for release
3. Upload to Google Play Store
4. Distribute to users

## Support

For additional help:
1. Check the troubleshooting section
2. Review [Capacitor documentation](https://capacitorjs.com/)
3. Check Android Studio logs
4. Use online build services as alternatives
