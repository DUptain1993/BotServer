# Telegram Bot Platform - Android APK

This repository contains a comprehensive Telegram bot deployment platform that can be compiled into an Android APK.

## 🚀 Quick Start

### Option 1: Automated Build (Recommended)

1. **Push to GitHub** - The APK will be built automatically via GitHub Actions
2. **Download APK** - Go to Actions tab and download the built APK
3. **Install** - Enable "Unknown Sources" and install on your Android device

### Option 2: Local Build

#### Prerequisites
- Node.js 18+ and npm
- Android Studio or Android SDK
- Java JDK 11

#### Build Commands
```bash
# Windows
build-android.bat

# Linux/macOS
chmod +x build-android.sh
./build-android.sh
```

## 📱 APK Features

### Core Features
- ✅ **Cross-platform bot deployment** (Linux, Android, Windows)
- ✅ **Real-time monitoring dashboard** with live metrics
- ✅ **Bot management interface** with start/stop/restart
- ✅ **File upload capabilities** for bot.py and requirements.txt
- ✅ **Resource management** with CPU/memory limits
- ✅ **Health monitoring** with automatic restart on failure
- ✅ **Multi-bot support** (up to 3 bots simultaneously)

### Technical Features
- 🔧 **Docker containerization** for each bot
- 📊 **Prometheus metrics** integration
- 🔄 **Auto-restart** on failure
- 📈 **Performance monitoring** with charts
- 🔐 **Authentication** with Supabase
- 📱 **Responsive design** for mobile devices

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Android APK   │    │   Web Platform  │    │   Bot Containers│
│                 │    │                 │    │                 │
│ • UI Interface  │◄──►│ • Next.js App   │◄──►│ • Docker        │
│ • File Upload   │    │ • API Routes    │    │ • Python Bots   │
│ • Monitoring    │    │ • Database      │    │ • Health Checks │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Requirements

### For Local Development
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Android Studio**: Latest version
- **Java JDK**: Version 11
- **Android SDK**: API level 33+

### For Bot Deployment
- **Docker**: For containerization
- **Python**: 3.11+ for bot execution
- **Memory**: 256MB+ per bot
- **Storage**: 1GB+ per bot

## 🔧 Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
```bash
# Create .env.local file
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### 3. Build APK
```bash
# Automated build
npm run android:apk

# Or step by step
npm run build
npx cap add android
npx cap sync android
cd android && ./gradlew assembleDebug
```

## 📊 Monitoring Features

### Real-time Dashboard
- **System Resources**: CPU, Memory, Storage usage
- **Bot Status**: Running, Stopped, Error states
- **Performance Metrics**: Response times, message counts
- **Error Tracking**: Automatic error detection and logging

### Metrics Available
- Total messages processed
- Bot uptime and availability
- Memory and CPU usage per bot
- Error rates and types
- Network connectivity status

## 🔒 Security Features

- **Authentication**: Supabase Auth integration
- **File Validation**: Secure file upload with type checking
- **Resource Limits**: CPU and memory constraints
- **Container Isolation**: Each bot runs in separate container
- **Token Security**: Encrypted bot token storage

## 🚀 Deployment Options

### 1. Local Server
```bash
npm run dev
# Access at http://localhost:3000
```

### 2. Docker Deployment
```bash
docker-compose up -d
# Access at http://localhost:3000
```

### 3. Cloud Deployment
- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod`
- **Railway**: Connect GitHub repository

### 4. Android APK
- **Debug**: For testing and development
- **Release**: For production distribution

## 📱 APK Installation

### On Android Device
1. Enable "Unknown Sources" in Settings > Security
2. Download APK file
3. Tap APK to install
4. Launch app and configure

### Using ADB
```bash
adb install app-debug.apk
```

## 🔧 Configuration

### Bot Configuration
```json
{
  "name": "My Bot",
  "token": "1234567890:ABCdefGHIjklMNOpqrsTUVwxyz",
  "platform": "linux",
  "resources": {
    "memory": "256m",
    "cpu": "0.5",
    "storage": "1g"
  }
}
```

### Platform Options
- **Linux**: Best performance, recommended
- **Android**: ARM optimized, mobile-friendly
- **Windows**: Windows-specific dependencies

## 🐛 Troubleshooting

### Common Issues

1. **"npm not found"**
   ```bash
   # Install Node.js from https://nodejs.org/
   ```

2. **"ANDROID_HOME not set"**
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   ```

3. **"Gradle build failed"**
   ```bash
   # Increase memory in android/gradle.properties
   org.gradle.jvmargs=-Xmx4096m
   ```

4. **"Bot deployment failed"**
   - Check bot token format
   - Verify Python code syntax
   - Check requirements.txt format

### Build Errors
- **Memory Issues**: Increase Gradle memory allocation
- **Network Issues**: Configure local server URL
- **SDK Issues**: Update Android SDK tools

## 📈 Performance

### Resource Usage
- **APK Size**: ~50-100MB
- **Memory**: 256MB per bot container
- **CPU**: 0.5 cores per bot
- **Storage**: 1GB per bot

### Scalability
- **Max Bots**: 3 per user (configurable)
- **Concurrent Users**: Unlimited
- **Message Processing**: Real-time

## 🔄 Updates

### Auto-updates
- GitHub Actions builds on every push
- Automatic APK generation
- Release notes included

### Manual Updates
```bash
git pull origin main
npm install
npm run android:apk
```

## 📞 Support

### Documentation
- [Setup Guide](SETUP_GUIDE.md)
- [Android Build Guide](ANDROID_BUILD.md)
- [API Documentation](API_DOCS.md)

### Community
- GitHub Issues: Report bugs and feature requests
- Discussions: Ask questions and share ideas
- Wiki: Additional documentation

### Contact
- Email: support@telegrambotplatform.com
- Discord: Join our community server
- Twitter: Follow for updates

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🎯 Roadmap

### Upcoming Features
- [ ] Push notifications
- [ ] Offline mode
- [ ] Bot templates
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Cloud backup

### Planned Improvements
- [ ] Performance optimization
- [ ] UI/UX enhancements
- [ ] Security hardening
- [ ] Documentation expansion

---

**Built with ❤️ for the Telegram bot community**
