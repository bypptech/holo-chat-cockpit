import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, Eye, EyeOff } from 'lucide-react-native';
import MindARPanel from '@/components/MindARPanel';
import { ICPAuth } from '@/components/auth/ICPAuth';
import { useInternetIdentity } from '@/contexts/InternetIdentityContext';
import { useTranslation } from 'react-i18next';

export default function MindAROnlyScreen() {
  const [showAuth, setShowAuth] = useState(false);
  const { isAuthenticated, principal } = useInternetIdentity();
  const { t } = useTranslation();

  const toggleAuthPanel = () => {
    setShowAuth(!showAuth);
  };

  const handleAuthChange = (authenticated: boolean, data?: { principal: string }) => {
    console.log('Authentication changed:', authenticated, data);
    if (authenticated) {
      setShowAuth(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Show MindARPanel only when authenticated */}
      {isAuthenticated ? (
        <MindARPanel />
      ) : (
        <View style={styles.unauthenticatedContainer}>
          <Text style={styles.unauthenticatedText}>
            {t('ar:requireAuth')}
          </Text>
        </View>
      )}
      
      {/* Floating Auth Button */}
      <TouchableOpacity style={styles.authButton} onPress={toggleAuthPanel}>
        <Shield size={24} color={isAuthenticated ? "#00FF88" : "#007AFF"} />
        {isAuthenticated && (
          <Text style={styles.authButtonText}>
            {principal?.slice(0, 6)}...
          </Text>
        )}
      </TouchableOpacity>

      {/* Toggle Auth Panel Button */}
      <TouchableOpacity style={styles.toggleButton} onPress={toggleAuthPanel}>
        {showAuth ? (
          <EyeOff size={20} color="#fff" />
        ) : (
          <Eye size={20} color="#fff" />
        )}
      </TouchableOpacity>

      {/* Auth Panel Overlay */}
      {showAuth && (
        <View style={styles.authOverlay}>
          <ICPAuth onAuthChange={handleAuthChange} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  unauthenticatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  unauthenticatedText: {
    fontSize: 18,
    fontFamily: 'NotoSansJP-Medium',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 26,
  },
  authButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    zIndex: 1000,
  },
  authButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#00FF88',
  },
  toggleButton: {
    position: 'absolute',
    top: 110,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 16,
    zIndex: 1000,
  },
  authOverlay: {
    position: 'absolute',
    top: 160,
    right: 20,
    left: 20,
    zIndex: 999,
  },
});