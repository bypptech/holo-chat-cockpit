import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { Platform } from 'react-native';

// Import translation files
import enCommon from './en/common.json';
import enNavigation from './en/navigation.json';
import enCamera from './en/camera.json';
import enChat from './en/chat.json';
import enDevices from './en/devices.json';
import enControls from './en/controls.json';
import enNetwork from './en/network.json';
import enSettings from './en/settings.json';
import enAuth from './en/auth.json';
import enAr from './en/ar.json';
import enButton from './en/button.json';
import enIcp from './en/icp.json';
import enAi from './en/ai.json';
import enIndex from './en/index.json';

import jaCommon from './ja/common.json';
import jaNavigation from './ja/navigation.json';
import jaCamera from './ja/camera.json';
import jaChat from './ja/chat.json';
import jaDevices from './ja/devices.json';
import jaControls from './ja/controls.json';
import jaNetwork from './ja/network.json';
import jaSettings from './ja/settings.json';
import jaAuth from './ja/auth.json';
import jaAr from './ja/ar.json';
import jaButton from './ja/button.json';
import jaIcp from './ja/icp.json';
import jaAi from './ja/ai.json';
import jaIndex from './ja/index.json';

// Get device locale
const getDeviceLocale = (): string => {
  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      return navigator.language.split('-')[0];
    }
    // Check for Expo Localization
    if (typeof Localization !== 'undefined' && Localization.locale) {
      return Localization.locale.split('-')[0];
    }
    // Fallback for Node.js/server environment
    if (typeof process !== 'undefined' && process.env && process.env.LANG) {
      return process.env.LANG.split('.')[0].split('_')[0];
    }
  } catch (error) {
    console.error('Error getting device locale:', error);
  }
  return 'en';
};

// Supported languages
const supportedLanguages = ['en', 'ja'];

// Get fallback locale
const getFallbackLocale = (locale: string): string => {
  return supportedLanguages.includes(locale) ? locale : 'en';
};

// Get stored language preference
const getStoredLanguage = (): string | null => {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      return localStorage.getItem('language');
    }
  } catch (error) {
    console.warn('Failed to get stored language:', error);
  }
  return null; // For native, we'll use AsyncStorage later if needed
};

// Store language preference
export const storeLanguage = (language: string): void => {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('language', language);
    }
  } catch (error) {
    console.warn('Failed to store language:', error);
  }
  // For native, implement AsyncStorage storage if needed
};

// Initialize i18n
const initI18n = async () => {
  const deviceLocale = getDeviceLocale();
  const storedLanguage = getStoredLanguage();
  const initialLanguage = getFallbackLocale(storedLanguage || deviceLocale);

  await i18n
    .use(initReactI18next)
    .init({
      lng: initialLanguage,
      fallbackLng: 'en',
      debug: __DEV__,

      // Namespace configuration
      defaultNS: 'common',
      ns: [
        'common',
        'navigation',
        'camera',
        'chat',
        'devices',
        'controls',
        'network',
        'settings',
        'auth',
        'ar',
        'button',
        'icp',
        'ai',
        'index'
      ],

      // Resources
      resources: {
        en: {
          common: enCommon,
          navigation: enNavigation,
          camera: enCamera,
          chat: enChat,
          devices: enDevices,
          controls: enControls,
          network: enNetwork,
          settings: enSettings,
          auth: enAuth,
          ar: enAr,
          button: enButton,
          icp: enIcp,
          ai: enAi,
          index: enIndex
        },
        ja: {
          common: jaCommon,
          navigation: jaNavigation,
          camera: jaCamera,
          chat: jaChat,
          devices: jaDevices,
          controls: jaControls,
          network: jaNetwork,
          settings: jaSettings,
          auth: jaAuth,
          ar: jaAr,
          button: jaButton,
          icp: jaIcp,
          ai: jaAi,
          index: jaIndex
        },
      },

      // Interpolation options
      interpolation: {
        escapeValue: false, // React already escapes values
      },

      // React options
      react: {
        useSuspense: false,
      },

      // Compatibility options
      compatibilityJSON: 'v3',
    });

  return i18n;
};

// Change language function
export const changeLanguage = async (language: string): Promise<void> => {
  if (supportedLanguages.includes(language)) {
    await i18n.changeLanguage(language);
    storeLanguage(language);
  }
};

// Get current language
export const getCurrentLanguage = (): string => {
  return i18n.language || 'en';
};

// Get language name
export const getLanguageName = (code: string): string => {
  const languageNames: Record<string, string> = {
    en: 'English',
    ja: '日本語',
  };
  return languageNames[code] || 'English';
};

// Get supported languages list
export const getSupportedLanguages = () => {
  return supportedLanguages.map(code => ({
    code,
    name: getLanguageName(code),
  }));
};

// Initialize conditionally to prevent SSR issues
if (typeof window !== 'undefined') {
  initI18n();
} else {
  // For SSR, initialize synchronously with minimal config
  i18n
    .use(initReactI18next)
    .init({
      lng: 'en',
      fallbackLng: 'en',
      debug: false,
      defaultNS: 'common',
      ns: ['common'],
      resources: {
        en: {
          common: enCommon
        },
        ja: {
          common: jaCommon
        }
      },
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
      compatibilityJSON: 'v3',
    });
}

export default i18n;