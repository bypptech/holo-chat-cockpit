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

// Get device locale
const getDeviceLocale = (): string => {
  if (Platform.OS === 'web') {
    return navigator.language.split('-')[0] || 'en';
  }
  return Localization.locale.split('-')[0] || 'en';
};

// Supported languages
const supportedLanguages = ['en', 'ja'];

// Get fallback locale
const getFallbackLocale = (locale: string): string => {
  return supportedLanguages.includes(locale) ? locale : 'en';
};

// Get stored language preference
const getStoredLanguage = (): string | null => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('language');
  }
  return null; // For native, we'll use AsyncStorage later if needed
};

// Store language preference
export const storeLanguage = (language: string): void => {
  if (Platform.OS === 'web') {
    localStorage.setItem('language', language);
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
        'ar'
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
          ar: enAr
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
          ar: jaAr
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

// Initialize and export
initI18n();

export default i18n;