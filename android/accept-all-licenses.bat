@echo off
echo Accepting all Android SDK licenses...

set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk

echo 24333f8a63b6825ea9c5514f83c2829b004d1fee > "%ANDROID_HOME%\licenses\android-sdk-license"
echo 84831b9409646a918e30573bab4c9c91346d8abd > "%ANDROID_HOME%\licenses\android-sdk-preview-license"
echo d56f5187479451eabf01fb78af6dfcb131a6481e > "%ANDROID_HOME%\licenses\intel-android-extra-license"
echo 24333f8a63b6825ea9c5514f83c2829b004d1fee > "%ANDROID_HOME%\licenses\android-sdk-build-tools-license"
echo 24333f8a63b6825ea9c5514f83c2829b004d1fee > "%ANDROID_HOME%\licenses\android-sdk-platform-license"

echo All licenses accepted!
pause
