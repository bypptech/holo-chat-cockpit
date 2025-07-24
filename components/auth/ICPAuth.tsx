
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { Globe, Shield, User, LogOut, RefreshCw, Infinity } from 'lucide-react-native';
import { useInternetIdentity } from '@/contexts/InternetIdentityContext';
import { useTheme } from '@/contexts/ThemeContext';

interface ICPAuthProps {
  onAuthChange?: (authenticated: boolean, data?: { principal: string }) => void;
}

export function ICPAuth({ onAuthChange }: ICPAuthProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<'local' | 'ic'>('ic');
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
      await login(selectedNetwork);
      onAuthChange?.(true, principal ? { principal } : undefined);
      Alert.alert('Success', 'Successfully authenticated with Internet Identity!');
    } catch (error) {
      console.error('Authentication failed:', error);
      Alert.alert('Error', 'Authentication failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onAuthChange?.(false);
      Alert.alert('Success', 'Successfully logged out.');
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Error', 'Logout failed. Please try again.');
    }
  };

  const networks = [
    { value: 'ic' as const, label: 'Mainnet', color: '#00FF88' },
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
            <Text style={styles.authButtonText}>
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
            <Text style={styles.authButtonText}>
              {isLoading ? 'Disconnecting...' : 'Disconnect'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </BlurView>
  );
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
