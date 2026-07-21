import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.paramedicstudio.simulator',
  appName: 'ParaMedic Studio',
  webDir: 'dist',
  server: {
    iosScheme: 'https',
  },
};

export default config;
