@echo off
echo Accepting Android SDK licenses...

echo y | "%ANDROID_HOME%\cmdline-tools\latest\bin\sdkmanager.bat" --licenses

echo Licenses accepted!
pause
