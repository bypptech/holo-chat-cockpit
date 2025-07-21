import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useInternetIdentity } from '../../contexts/InternetIdentityContext';
import { Actor, HttpAgent } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import {
  X,
  User,
  LogOut,
  Zap,
  CheckCircle,
  Clock,
  Fingerprint,
  Globe,
  Cloud
} from "lucide-react-native";

const { width } = Dimensions.get('window');

const CANISTER_ID = process.env.EXPO_PUBLIC_ICP_MAINNET_CANISTER_ID_DRIVE_GACHA;
const token = process.env.EXPO_PUBLIC_ICP_MAINNET_CANISTER_ID_DRIVE_GACHA_SECRET_TOKEN;

export default function ButtonControlScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isAuthenticated, principal, login, logout, isLoading: icpLoading, error } = useInternetIdentity();
  const [deviceLoading, setDeviceLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const styles = createStyles(colors);

  const callBackendCanister = async (text: string): Promise<any> => {
    try {
      if (!isAuthenticated) {
        throw new Error('Not authenticated with Internet Identity');
      }

      let agent: HttpAgent;
      let retryCount = 0;
      
      while (retryCount < 3) {
        try {
          const { AuthClient } = await import('@dfinity/auth-client');
          const authClient = await AuthClient.create();
          const identity = authClient.getIdentity();
          agent = new HttpAgent({
            identity,
            host: process.env.EXPO_PUBLIC_ICP_MAINNET_URL
          });
          break;
        } catch (error) {
          retryCount++;
          if (retryCount < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            throw new Error('Failed to initialize ICP agent after multiple attempts');
          }
        }
      }

      const idlFactory = () =>
        IDL.Service({
          'gacha_drive_request': IDL.Func([IDL.Text], [IDL.Text], []),
        });

      const actor = Actor.createActor(idlFactory, {
        agent: agent!,
        canisterId: CANISTER_ID,
      });

      const result = await actor.gacha_drive_request(text);
      return result;
    } catch (error) {
      throw new Error(`Backend canister call failed: ${error}`);
    }
  };

  const handleLogin = async (network: 'local' | 'ic' = 'local') => {
    setLoginLoading(true);
    try {
      await login(network);
      Alert.alert(
        t('controls:authentication.loginSuccessful'),
        t('controls:authentication.loginSuccessfulMessage', { principal: principal?.slice(0, 20) })
      );
    } catch (error) {
      Alert.alert(t('controls:authentication.loginError'), error instanceof Error ? error.message : t('controls:authentication.loginFailed'));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('controls:authentication.logoutConfirm'),
      t('controls:authentication.logoutConfirmMessage'),
      [
        { text: t('common:cancel'), style: 'cancel' },
        {
          text: t('controls:authentication.logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {}
          }
        }
      ]
    );
  };

  const handleDeviceAction = async () => {
    if (!isAuthenticated) {
      Alert.alert(t('controls:esp32.authenticationRequired'), t('controls:esp32.authenticationRequiredMessage'));
      return;
    }

    setDeviceLoading(true);
    try {
      const requestText = token;
      const canisterResult = await callBackendCanister(requestText);

      Alert.alert(t('controls:device.operationComplete'), t('controls:device.operationCompleteMessage', { response: canisterResult }));

      setCountdown(10);
      let seconds = 10;
      const timer = setInterval(() => {
        seconds -= 1;
        setCountdown(seconds);
        if (seconds <= 0) {
          clearInterval(timer);
          setCountdown(null);
          setDeviceLoading(false);
        }
      }, 1000);
    } catch (error) {
      Alert.alert(t('controls:device.operationFailed'), t('controls:device.operationFailedMessage', { error: error instanceof Error ? error.message : 'Unknown error' }));
      setDeviceLoading(false);
      setCountdown(null);
    }
  };

  if (icpLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t('controls:device.checkingAuth')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{t('controls:device.operation')}</Text>
          {principal && (
            <View style={styles.principalContainer}>
              <User size={30} color="#666" />
              <Text style={styles.principalText}>
                {principal.slice(0, 20)}...
              </Text>
            </View>
          )}
        </View>
        <View style={styles.headerRight}>
          {isAuthenticated && (
            <TouchableOpacity
              style={[styles.logoutButton, { borderWidth: 1, borderColor: 'red' }]}
              onPress={handleLogout}
            >
              <LogOut size={20} color="#FF6B6B" />
              <Text style={styles.logoutButtonText}>{t('controls:authentication.logout')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {!isAuthenticated && (
          <View style={styles.loginSection}>
            <View style={styles.loginPanel}>
              <View style={styles.loginIconContainer}>
                <Fingerprint size={60} color="#007AFF" />
              </View>
              <Text style={styles.loginTitle}>Internet Identity</Text>
              <Text style={styles.loginDescription}>
                {t('controls:authentication.internetIdentitySubtitle')}
              </Text>
              <View style={styles.networkOptions}>
                <TouchableOpacity
                  style={[styles.networkButton, styles.localButton]}
                  onPress={() => handleLogin('local')}
                  disabled={loginLoading}
                >
                  <Globe size={20} color="white" />
                  <Text style={styles.networkButtonText}>{t('controls:authentication.localNetwork')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.networkButton, styles.icButton]}
                  onPress={() => handleLogin('ic')}
                  disabled={loginLoading}
                >
                  <Cloud size={20} color="white" />
                  <Text style={styles.networkButtonText}>{t('controls:authentication.mainnet')}</Text>
                </TouchableOpacity>
              </View>
              {loginLoading && (
                <ActivityIndicator size="large" color="#007AFF" style={styles.loginSpinner} />
              )}
            </View>
          </View>
        )}

        {isAuthenticated && (
          <View style={styles.connectionStatus}>
            <View style={styles.connectionHeader}>
              <View style={styles.connectionIndicator}>
                <View style={styles.connectedDot} />
                <Text style={styles.connectionTitle}>{t('controls:esp32.connected')}</Text>
              </View>
              <Text style={styles.networkBadge}>
                {t('controls:esp32.connected')}
              </Text>
            </View>
            {principal && (
              <View style={styles.principalContainer}>
                <Text style={styles.principalLabel}>{t('controls:device.principal')}</Text>
                <Text style={styles.principalId} numberOfLines={1}>
                  {principal}
                </Text>
              </View>
            )}
          </View>
        )}

        {isAuthenticated && (
          <View style={styles.controlSection}>
            <Text style={styles.controlSectionTitle}>{t('controls:esp32.deviceControl')}</Text>
            <Text style={styles.controlSectionDescription}>
              {t('controls:device.operationDescription')}
            </Text>
            <View style={styles.controlButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.esp32Button,
                  styles.esp32ButtonLarge,
                  deviceLoading && styles.esp32ButtonDisabled
                ]}
                onPress={handleDeviceAction}
                disabled={deviceLoading}
              >
                <Text style={styles.esp32ButtonLabel}>
                  {deviceLoading
                    ? countdown !== null
                      ? t('controls:device.waitSeconds', { seconds: countdown })
                      : t('controls:device.communicating')
                    : t('controls:device.operationButton')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  principalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  principalText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  principalLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  principalId: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFD6D6',
  },
  logoutButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  scrollView: {
    flex: 1,
  },
  loginSection: {
    padding: 20,
  },
  loginPanel: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginIconContainer: {
    marginBottom: 16,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  loginDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  networkOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  networkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 120,
    justifyContent: 'center',
  },
  localButton: {
    backgroundColor: '#34C759',
  },
  icButton: {
    backgroundColor: '#007AFF',
  },
  networkButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  loginSpinner: {
    marginTop: 8,
  },
  connectionStatus: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  connectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  connectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  connectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  networkBadge: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  controlSection: {
    padding: 20,
    alignItems: 'center',
  },
  controlSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  controlSectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  controlButtonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  esp32Button: {
    width: 200,
    height: 120,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  esp32ButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowColor: '#CCCCCC',
  },
  esp32ButtonLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 14,
    color: '#FF6B35',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  esp32ButtonLarge: {
    width: 240,
    height: 90,
    borderRadius: 20,
  },
});