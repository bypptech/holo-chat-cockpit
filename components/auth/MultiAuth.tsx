import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { Shield, Globe, AlertCircle, Infinity } from 'lucide-react-native';
import { ICPAuth } from './ICPAuth';
import { useInternetIdentity } from '@/contexts/InternetIdentityContext';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';

interface MultiAuthProps {
  onAuthChange?: (
    type: 'icp', 
    authenticated: boolean, 
    data?: { principal: string }
  ) => void;
}

export function MultiAuth({ onAuthChange }: MultiAuthProps) {
  const [selectedAuth, setSelectedAuth] = useState<'none' | 'icp'>('none');
  const { isAuthenticated: icpAuthenticated, principal, error: icpError } = useInternetIdentity();
  const { t } = useTranslation();
  const { isDark } = useTheme();

  // Check if any authentication method is active
  const isAnyAuthenticated = icpAuthenticated;

  const handleICPAuthChange = (authenticated: boolean, data?: { principal: string }) => {
    onAuthChange?.('icp', authenticated, data);
  };

  if (selectedAuth === 'icp') {
    return (
      <View style={styles.authContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setSelectedAuth('none')}
        >
          <Text style={styles.backButtonText}>← {t('auth:back')}</Text>
        </TouchableOpacity>
        <ICPAuth onAuthChange={handleICPAuthChange} />
      </View>
    );
  }

  return (
    <BlurView intensity={80} tint="dark" style={styles.container}>
      <View style={styles.header}>
        <Shield size={24} color="#007AFF" />
        <Text style={styles.title}>{t('auth:selectMethod')}</Text>
      </View>

      {/* Show current authentication status */}
      {isAnyAuthenticated && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>{t('auth:authenticated')}</Text>
          {icpAuthenticated && (
            <View style={styles.statusItem}>
              <Infinity size={16} color={isDark ? "#fff" : "#00FF88"} />
              <Text style={styles.statusText}>
                {t('auth:internetIdentity')}: {principal?.slice(0, 8)}...{principal?.slice(-6)}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Show errors if any */}
      {icpError && (
        <View style={styles.errorContainer}>
          <AlertCircle size={16} color="#FF6B35" />
          <Text style={styles.errorText}>{icpError}</Text>
        </View>
      )}

      <Text style={styles.description}>
        {isAnyAuthenticated 
          ? t('auth:manageAuth')
          : t('auth:pleaseLogin')
        }
      </Text>

      <View style={styles.authOptions}>
        <TouchableOpacity
          style={[
            styles.authOption, 
            styles.icpOption,
            icpAuthenticated && styles.authenticatedOption
          ]}
          onPress={() => setSelectedAuth('icp')}
        >
          <Infinity size={32} color={isDark ? "#fff" : (icpAuthenticated ? "#00FF88" : "#007AFF")} />
          <Text style={styles.optionTitle}>{t('auth:internetIdentity')}</Text>
          <Text style={styles.optionDescription}>
            {icpAuthenticated ? t('auth:authenticatedManage') : t('auth:loginWithII')}
          </Text>
          {icpAuthenticated && (
            <View style={styles.authenticatedBadge}>
              <Text style={styles.authenticatedBadgeText}>✓</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  authContainer: {
    flex: 1,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-Medium',
    color: '#007AFF',
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
  statusContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  statusTitle: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-SemiBold',
    color: '#00FF88',
    marginBottom: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Regular',
    color: '#fff',
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Regular',
    color: '#FF6B35',
    marginLeft: 8,
    flex: 1,
  },
  description: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Regular',
    color: '#B0B0B0',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  authOptions: {
    gap: 16,
  },
  authOption: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    position: 'relative',
  },
  icpOption: {
    borderColor: 'rgba(0, 122, 255, 0.3)',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  authenticatedOption: {
    borderColor: 'rgba(0, 255, 136, 0.5)',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-SemiBold',
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Regular',
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: 16,
  },
  authenticatedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00FF88',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authenticatedBadgeText: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Bold',
    color: '#000',
  },
});
