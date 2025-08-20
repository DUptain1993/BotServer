import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.telegrambot.platform',
  appName: 'Telegram Bot Platform',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: [
      '*.supabase.co',
      '*.telegram.org',
      'localhost:*',
      '127.0.0.1:*'
    ]
  },
          android: {
          buildOptions: {
            keystorePath: undefined,
            keystoreAlias: undefined,
            keystorePassword: undefined,
          }
        },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#1e293b",
      showSpinner: true,
      spinnerColor: "#3b82f6"
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#1e293b"
    }
  }
};

export default config;
