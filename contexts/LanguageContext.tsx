import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage, getCurrentLanguage, getLanguageName, getSupportedLanguages } from '../i18n';

interface LanguageContextType {
  currentLanguage: string;
  currentLanguageName: string;
  supportedLanguages: Array<{ code: string; name: string }>;
  changeLanguage: (language: string) => Promise<void>;
  t: (key: string, options?: any) => string;
  isReady: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [isReady, setIsReady] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en'); // Default fallback

  useEffect(() => {
    let isMounted = true;
    let initTimeout: NodeJS.Timeout;

    const initializeLanguage = async () => {
      try {
        // Set a timeout to ensure we don't wait forever
        initTimeout = setTimeout(() => {
          if (isMounted) {
            console.warn('i18n initialization timeout, proceeding with current language');
            setCurrentLanguage(getCurrentLanguage());
            setIsReady(true);
          }
        }, 3000);

        // Wait for i18n to be ready
        if (i18n.isInitialized) {
          // Try to load additional namespaces, but don't block on failure
          try {
            await i18n.loadNamespaces(['common', 'navigation', 'camera', 'chat', 'devices', 'controls', 'network', 'settings', 'auth', 'ar']);
          } catch (nsError) {
            console.warn('Some namespaces failed to load:', nsError);
          }
          
          if (isMounted) {
            clearTimeout(initTimeout);
            setCurrentLanguage(getCurrentLanguage());
            setIsReady(true);
          }
        } else {
          // Wait for i18n to initialize
          const handleInitialized = () => {
            if (isMounted) {
              clearTimeout(initTimeout);
              setCurrentLanguage(getCurrentLanguage());
              setIsReady(true);
            }
            i18n.off('initialized', handleInitialized);
          };
          
          i18n.on('initialized', handleInitialized);
        }
      } catch (error) {
        console.error('Failed to initialize language:', error);
        if (isMounted) {
          clearTimeout(initTimeout);
          setIsReady(true);
        }
      }
    };

    initializeLanguage();

    return () => {
      isMounted = false;
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
    };
  }, []);

  const handleLanguageChange = async (language: string) => {
    try {
      await changeLanguage(language);
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const value: LanguageContextType = {
    currentLanguage,
    currentLanguageName: getLanguageName(currentLanguage),
    supportedLanguages: getSupportedLanguages(),
    changeLanguage: handleLanguageChange,
    t,
    isReady,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};