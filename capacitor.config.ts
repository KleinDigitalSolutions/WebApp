import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'de.kleindigitalsolutions.trackfood',
  appName: 'TrackFood',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    cleartext: true
  },
  ios: {
    scheme: 'App',
    contentInset: 'always',
    limitsNavigationsToAppBoundDomains: true
  }
}

export default config
