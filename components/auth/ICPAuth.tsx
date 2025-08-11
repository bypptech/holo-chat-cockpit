
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { Globe, Shield, User, LogOut, RefreshCw, Infinity } from 'lucide-react-native';
import { useInternetIdentity } from '@/contexts/InternetIdentityContext';
import { useTheme } from '@/contexts/ThemeContext';

interface ICPAuthProps {
  onAuthChange?: (authenticated: boolean, data?: { principal: string; network?: 'local' | 'mainnet' }) => void;
  onNetworkChange?: (network: 'local' | 'mainnet') => void;
}

export function ICPAuth({ onAuthChange, onNetworkChange }: ICPAuthProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<'local' | 'mainnet'>('mainnet');
  const [currentSessionNetwork, setCurrentSessionNetwork] = useState<'local' | 'mainnet' | null>(null);
  const { 
    isAuthenticated, 
    principal, 
    login, 
    logout, 
    isLoading, 
    error 
  } = useInternetIdentity();
  const { isDark } = useTheme();

  const handleLogin = async () => {
    try {
      // Map mainnet to 'ic' for the actual login call
      const networkForLogin = selectedNetwork === 'mainnet' ? 'ic' : selectedNetwork;
      await login(networkForLogin);
      
      // Store the current session network both locally and globally
      setCurrentSessionNetwork(selectedNetwork);
      setGlobalSessionNetwork(selectedNetwork);
      
      onAuthChange?.(true, { principal: principal!, network: selectedNetwork });
      onNetworkChange?.(selectedNetwork);
      Alert.alert('Success', 'Successfully authenticated with Internet Identity!');
    } catch (error) {
      console.error('Authentication failed:', error);
      Alert.alert('Error', 'Authentication failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      
      // Clear session network both locally and globally
      setCurrentSessionNetwork(null);
      setGlobalSessionNetwork(null);
      
      onAuthChange?.(false);
      onNetworkChange?.(selectedNetwork); // Keep the selected network for next login
      Alert.alert('Success', 'Successfully logged out.');
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Error', 'Logout failed. Please try again.');
    }
  };

  const networks = [
    { value: 'mainnet' as const, label: 'Mainnet', color: '#00FF88' },
    { value: 'local' as const, label: 'Local', color: '#FFD700' }
  ];

  const formatPrincipal = (principal: string) => {
    if (principal.length > 20) {
      return `${principal.slice(0, 8)}...${principal.slice(-8)}`;
    }
    return principal;
  };

  return (
    <BlurView intensity={80} tint="dark" style={styles.container}>
      <View style={styles.header}>
        <Infinity size={24} color={isDark ? "#fff" : "#007AFF"} />
        <Text style={styles.title}>Internet Identity</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!isAuthenticated ? (
        <>
          {/* Network Selection */}
          <View style={styles.networkSection}>
            <Text style={styles.sectionTitle}>Select Network</Text>
            <View style={styles.networkGrid}>
              {networks.map((network) => (
                <TouchableOpacity
                  key={network.value}
                  style={[
                    styles.networkButton,
                    selectedNetwork === network.value && styles.selectedNetwork,
                    { borderColor: network.color }
                  ]}
                  onPress={() => setSelectedNetwork(network.value)}
                >
                  <Text style={[
                    styles.networkText,
                    selectedNetwork === network.value && { color: network.color }
                  ]}>
                    {network.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.authButton, styles.loginButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading && (
              <RefreshCw size={20} color="#fff" />
            )}
            <Text style={styles.authButtonText} numberOfLines={1} adjustsFontSizeToFit={true}>
              {isLoading ? 'Connecting...' : 'Login with Internet Identity'}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          {/* User Info */}
          <View style={styles.userInfo}>
            <View style={styles.userHeader}>
              <User size={20} color="#00FF88" />
              <Text style={styles.userLabel}>Authenticated</Text>
            </View>
            
            {principal && (
              <View style={styles.sessionInfo}>
                <Text style={styles.principalLabel}>Principal ID:</Text>
                <Text style={styles.principalText}>
                  {formatPrincipal(principal)}
                </Text>
                {currentSessionNetwork && (
                  <View style={styles.networkInfo}>
                    <Text style={styles.principalLabel}>Network:</Text>
                    <Text style={[styles.networkText, { color: currentSessionNetwork === 'mainnet' ? '#00FF88' : '#FFD700' }]}>
                      {currentSessionNetwork === 'mainnet' ? 'Mainnet' : 'Local'}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={[styles.authButton, styles.logoutButton]}
            onPress={handleLogout}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw size={20} color="#fff" />
            ) : (
              <LogOut size={20} color="#fff" />
            )}
            <Text style={styles.authButtonText} numberOfLines={1} adjustsFontSizeToFit={true}>
              {isLoading ? 'Disconnecting...' : 'Disconnect'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </BlurView>
  );
}

// Global state for session network (simple implementation)
let globalSessionNetwork: 'local' | 'mainnet' | null = null;
const sessionNetworkListeners: Array<(network: 'local' | 'mainnet' | null) => void> = [];

// Utility functions for managing global session network state
export const setGlobalSessionNetwork = (network: 'local' | 'mainnet' | null) => {
  globalSessionNetwork = network;
  sessionNetworkListeners.forEach(listener => listener(network));
};

export const getGlobalSessionNetwork = (): 'local' | 'mainnet' | null => {
  return globalSessionNetwork;
};

// Hook to get current ICP session network from external components
export function useICPSessionNetwork() {
  const [sessionNetwork, setSessionNetwork] = useState<'local' | 'mainnet' | null>(globalSessionNetwork);
  
  React.useEffect(() => {
    const listener = (network: 'local' | 'mainnet' | null) => {
      setSessionNetwork(network);
    };
    
    sessionNetworkListeners.push(listener);
    
    return () => {
      const index = sessionNetworkListeners.indexOf(listener);
      if (index > -1) {
        sessionNetworkListeners.splice(index, 1);
      }
    };
  }, []);
  
  return sessionNetwork;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: 'NotoSansJP-SemiBold',
    color: '#fff',
    marginLeft: 12,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.3)',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Regular',
    color: '#FF6B35',
    textAlign: 'center',
  },
  networkSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Medium',
    color: '#B0B0B0',
    marginBottom: 12,
  },
  networkGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  networkButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  selectedNetwork: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
  },
  networkText: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Medium',
    color: '#fff',
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    minHeight: 52,
  },
  loginButton: {
    backgroundColor: '#007AFF',
  },
  logoutButton: {
    backgroundColor: '#FF6B35',
  },
  authButtonText: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-SemiBold',
    color: '#fff',
    textAlign: 'center',
    flexShrink: 1,
  },
  userInfo: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userLabel: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-SemiBold',
    color: '#00FF88',
    marginLeft: 8,
  },
  sessionInfo: {
    gap: 4,
  },
  networkInfo: {
    marginTop: 8,
    gap: 4,
  },
  principalLabel: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Medium',
    color: '#B0B0B0',
  },
  principalText: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Regular',
    color: '#fff',
  },
});
