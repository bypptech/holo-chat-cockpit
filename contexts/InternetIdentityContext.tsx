import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface InternetIdentityContextType {
  isAuthenticated: boolean;
  principal: string | null;
  login: (network?: 'local' | 'ic') => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

interface InternetIdentityProviderProps {
  children: ReactNode;
}

const InternetIdentityContext = createContext<InternetIdentityContextType | undefined>(undefined);

export const InternetIdentityProvider: React.FC<InternetIdentityProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if we're in a web environment
  const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';

  const login = async (network: 'local' | 'ic' = 'ic') => {
    if (!isWeb) {
      throw new Error('Internet Identity is only available in web environment');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Dynamic import for web compatibility
      const { AuthClient } = await import('@dfinity/auth-client');

      const authClient = await AuthClient.create({
        idleOptions: {
          disableIdle: true,
          disableDefaultIdleCallback: true
        }
      });

      const identityProvider = network === 'local' 
        ? process.env.EXPO_PUBLIC_ICP_LOCAL_LOGIN_URL
        : process.env.EXPO_PUBLIC_ICP_MAINNET_LOGIN_URL;

      console.log('ICP Login - Network:', network);
      console.log('ICP Login - Identity Provider:', identityProvider);
      console.log('Environment variables:', {
        local: process.env.EXPO_PUBLIC_ICP_LOCAL_LOGIN_URL,
        mainnet: process.env.EXPO_PUBLIC_ICP_MAINNET_LOGIN_URL
      });

      await new Promise<void>((resolve, reject) => {
        authClient.login({
          identityProvider,
          maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days
          onSuccess: () => {
            const identity = authClient.getIdentity();
            const principalId = identity.getPrincipal().toString();

            setIsAuthenticated(true);
            setPrincipal(principalId);

            console.log('Internet Identity login successful:', principalId);
            resolve();
          },
          onError: (error) => {
            console.error('Internet Identity login failed:', error);
            setError('Login failed. Please try again.');
            reject(error);
          },
        });
      });
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please check your connection and try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Dynamic import for web compatibility
      const { AuthClient } = await import('@dfinity/auth-client');

      const authClient = await AuthClient.create();
      await authClient.logout();

      setIsAuthenticated(false);
      setPrincipal(null);

      console.log('Internet Identity logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      setError('Logout failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: InternetIdentityContextType = {
    isAuthenticated,
    principal,
    login,
    logout,
    isLoading,
    error,
  };

  return (
    <InternetIdentityContext.Provider value={value}>
      {children}
    </InternetIdentityContext.Provider>
  );
};

export const useInternetIdentity = (): InternetIdentityContextType => {
  const context = useContext(InternetIdentityContext);
  if (context === undefined) {
    throw new Error('useInternetIdentity must be used within an InternetIdentityProvider');
  }
  return context;
};