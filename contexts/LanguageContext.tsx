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
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());

  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // Wait for i18n to be ready
        await i18n.loadNamespaces(['common', 'navigation', 'camera', 'chat', 'devices', 'controls', 'network', 'settings']);
        setCurrentLanguage(getCurrentLanguage());
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize language:', error);
        setIsReady(true); // Set ready even on error to prevent infinite loading
      }
    };

    initializeLanguage();
  }, [i18n]);

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