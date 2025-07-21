import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';

interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  primary: string;
  secondary: string;
  accent: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

interface ThemeContextType {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F8F9FA',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  primary: '#007AFF',
  secondary: '#5856D6',
  accent: '#FF6B35',
  border: '#E5E7EB',
  success: '#00FF88',
  warning: '#FFD700',
  error: '#FF6B35',
};

const darkColors: ThemeColors = {
  background: '#000428',
  surface: '#1A1A2E',
  card: '#16213E',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  primary: '#007AFF',
  secondary: '#5856D6',
  accent: '#FF6B35',
  border: '#374151',
  success: '#00FF88',
  warning: '#FFD700',
  error: '#FF6B35',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(true); // Default to dark mode

  useEffect(() => {
    // Load saved theme preference
    if (Platform.OS === 'web') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        setIsDark(savedTheme === 'dark');
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDark(prefersDark);
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    // Save theme preference
    if (Platform.OS === 'web') {
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    }
  };

  const setTheme = (dark: boolean) => {
    setIsDark(dark);
    
    // Save theme preference
    if (Platform.OS === 'web') {
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    }
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};