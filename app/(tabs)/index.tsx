import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, User, LogOut, Fingerprint, Globe, Cloud } from "lucide-react-native";
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { MultiAuth } from '@/components/auth/MultiAuth';
import { useInternetIdentity } from '@/contexts/InternetIdentityContext';


interface ICPSession {
  principal: string;
  expiresAt: Date;
  network: 'local' | 'testnet' | 'ic';
}


export default function ControllerScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  const { login: icpLogin, isAuthenticated: icpAuthenticated, principal: icpPrincipal, isLoading: icpLoading } = useInternetIdentity();
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));

  const [connectionStatus, setConnectionStatus] = useState({
    icp: false,
    esp32: false,
  });

  const [showCapsuleMessage, setShowCapsuleMessage] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [userPrincipal, setUserPrincipal] = useState<string | null>(null);
  const [showUsernameRegistration, setShowUsernameRegistration] = useState(false);
  const [registeredUsername, setRegisteredUsername] = useState<string | null>(null);
  const [isControlActive, setIsControlActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<ICPSession | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<'local' | 'testnet' | 'ic'>('local');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (userPrincipal) {
      setIsControlActive(true);
      setLastChecked(new Date());

      // Simulate periodic auth checks
      const interval = setInterval(() => {
        setLastChecked(new Date());
      }, 30000);

      return () => clearInterval(interval);
    } else {
      setIsControlActive(false);
    }
  }, [userPrincipal]);

  // Sync with ICP authentication state
  useEffect(() => {
    if (icpAuthenticated && icpPrincipal && !userPrincipal) {
      // ICP is authenticated but local state is not synced
      const session: ICPSession = {
        principal: icpPrincipal,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        network: selectedNetwork
      };
      setUserPrincipal(icpPrincipal);
      setCurrentSession(session);
      setConnectionStatus(prev => ({ ...prev, icp: true, esp32: true }));
    } else if (!icpAuthenticated && userPrincipal) {
      // ICP is logged out but local state still has user
      setUserPrincipal(null);
      setCurrentSession(null);
      setConnectionStatus(prev => ({ ...prev, icp: false, esp32: false }));
    }
  }, [icpAuthenticated, icpPrincipal, userPrincipal, selectedNetwork]);

  // Responsive breakpoints
  const isTablet = screenDimensions.width >= 768;
  const isLargeScreen = screenDimensions.width >= 1024;
  const isSmallScreen = screenDimensions.width < 480;

  const handleLogin = async (network: 'local' | 'ic' | 'testnet' = 'local') => {
    setLoginLoading(true);
    try {
      console.log('Internet Identity login started for network:', network);

      // Use real ICP authentication, treating 'testnet' as 'ic' for simplicity
      const icpNetwork = network === 'testnet' ? 'ic' : network;
      await icpLogin(icpNetwork);

      if (icpPrincipal) {
        const session: ICPSession = {
          principal: icpPrincipal,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          network
        };

        setUserPrincipal(icpPrincipal);
        setCurrentSession(session);
        setConnectionStatus(prev => ({ ...prev, icp: true, esp32: true }));
        setShowLoginModal(false);
        setSelectedNetwork(network);

        Alert.alert(
          t('controls:authentication.loginSuccessful'),
          t('controls:authentication.loginSuccessfulMessage', { principal: icpPrincipal.slice(0, 20) })
        );
      }
    } catch (error) {
      console.error('Login error:', error);
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
          onPress: () => {
            setUserPrincipal(null);
            setCurrentSession(null);
            setConnectionStatus(prev => ({ ...prev, icp: false, esp32: false }));
            setRegisteredUsername(null);
            setShowUsernameRegistration(false);
            setIsControlActive(false);
          }
        }
      ]
    );
  };

  const styles = createStyles(colors, isDark, screenDimensions, isTablet, isLargeScreen, isSmallScreen);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={isDark ? ['#000428', '#004e92'] : ['#667eea', '#764ba2']} style={styles.gradient}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {userPrincipal && (
              <View style={styles.principalContainer}>
                <User size={16} color={colors.textSecondary} />
                {registeredUsername ? (
                  <Text style={[styles.usernameText, { color: colors.primary }]}>
                    {registeredUsername}
                  </Text>
                ) : (
                  <Text style={[styles.principalText, { color: colors.textSecondary }]}>
                    {userPrincipal.slice(0, 20)}...
                  </Text>
                )}
              </View>
            )}
          </View>
          <View style={styles.headerCenter}>
            {!userPrincipal && (
              <MultiAuth/>
            )}
          </View>
          <View style={styles.headerRight}>
            {userPrincipal && (
              <TouchableOpacity
                style={[styles.logoutButton, { backgroundColor: colors.error + '20', borderColor: colors.error }]}
                onPress={handleLogout}
              >
                <LogOut size={16} color={colors.error} />
                <Text style={[styles.logoutButtonText, { color: colors.error }]}>{t('controls:authentication.logout')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

       
        {/* Login Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showLoginModal}
          onRequestClose={() => setShowLoginModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{t('controls:authentication.internetIdentity')}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowLoginModal(false)}
                >
                  <X size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalContent}>
                <View style={styles.loginIconContainer}>
                  <Fingerprint size={60} color={colors.primary} />
                </View>
                <Text style={[styles.loginTitle, { color: colors.text }]}>{t('controls:authentication.internetIdentity')}</Text>
                <Text style={[styles.loginDescription, { color: colors.textSecondary }]}>
                  {t('controls:authentication.internetIdentitySubtitle')}
                </Text>
                <View style={styles.networkOptions}>
                  <TouchableOpacity
                    style={[styles.networkButton, { backgroundColor: colors.warning }]}
                    onPress={() => handleLogin('local')}
                    disabled={loginLoading || icpLoading}
                  >
                    <Globe size={20} color="white" />
                    <Text style={styles.networkButtonText}>{t('controls:authentication.localNetwork')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.networkButton, { backgroundColor: colors.primary }]}
                    onPress={() => handleLogin('ic')}
                    disabled={loginLoading || icpLoading}
                  >
                    <Cloud size={20} color="white" />
                    <Text style={styles.networkButtonText}>{t('controls:authentication.mainnet')}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.networkNote, { color: colors.textSecondary }]}>
                  {t('controls:authentication.localNote')}
                </Text>
                {(loginLoading || icpLoading) && (
                  <ActivityIndicator size="large" color={colors.primary} />
                )}
              </View>
            </View>
          </View>
        </Modal>          
      </LinearGradient>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, isDark: boolean, screenDimensions: any, isTablet: boolean, isLargeScreen: boolean, isSmallScreen: boolean) => StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: isSmallScreen ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isTablet ? 40 : isSmallScreen ? 16 : 20,
    paddingVertical: isTablet ? 32 : isSmallScreen ? 16 : 24,
    gap: isSmallScreen ? 16 : 0,
  },
  headerLeft: {
    flex: isSmallScreen ? 0 : 1,
    width: isSmallScreen ? '100%' : 'auto',
    alignItems: isSmallScreen ? 'center' : 'flex-start',
  },
  headerCenter: {
    flex: isSmallScreen ? 0 : 1,
    width: isSmallScreen ? '100%' : 'auto',
    alignItems: 'center',
  },
  headerRight: {
    flex: isSmallScreen ? 0 : 1,
    width: isSmallScreen ? '100%' : 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: isSmallScreen ? 'center' : 'flex-end',
  },
  title: {
    fontSize: isLargeScreen ? 40 : isTablet ? 36 : isSmallScreen ? 28 : 32,
    fontFamily: 'NotoSansJP-Bold',
    marginBottom: 8,
    textAlign: isSmallScreen ? 'center' : 'left',
  },
  principalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  principalText: {
    fontSize: isTablet ? 14 : isSmallScreen ? 10 : 12,
    fontFamily: 'NotoSansJP-Regular',
  },
  usernameText: {
    fontSize: isTablet ? 16 : isSmallScreen ? 12 : 14,
    fontFamily: 'NotoSansJP-SemiBold',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: isTablet ? 20 : isSmallScreen ? 12 : 16,
    paddingVertical: isTablet ? 12 : isSmallScreen ? 6 : 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: isSmallScreen ? 120 : 'auto',
  },
  loginButtonText: {
    fontSize: isTablet ? 16 : isSmallScreen ? 12 : 14,
    fontFamily: 'NotoSansJP-SemiBold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: isTablet ? 20 : isSmallScreen ? 12 : 16,
    paddingVertical: isTablet ? 12 : isSmallScreen ? 6 : 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: isSmallScreen ? 120 : 'auto',
  },
  logoutButtonText: {
    fontSize: isTablet ? 16 : isSmallScreen ? 12 : 14,
    fontFamily: 'NotoSansJP-SemiBold',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'NotoSansJP-SemiBold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Regular',
    marginBottom: 16,
  },


  controlSection: {
    marginBottom: 24,
  },
  controlCard: {
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  controlStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Medium',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  batteryText: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Medium',
  },
  controlButtonContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  esp32Button: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  esp32ButtonLabel: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Bold',
    color: 'white',
    marginTop: 8,
    textAlign: 'center',
  },
  settingsSection: {
    gap: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Medium',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    borderRadius: 20,
    padding: 0,
    marginHorizontal: isTablet ? 40 : isSmallScreen ? 16 : 20,
    maxWidth: isLargeScreen ? 500 : isTablet ? 450 : 400,
    width: isSmallScreen ? '95%' : '100%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isTablet ? 24 : isSmallScreen ? 16 : 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
  modalTitle: {
    fontSize: isTablet ? 20 : isSmallScreen ? 16 : 18,
    fontFamily: 'NotoSansJP-Bold',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: isTablet ? 24 : isSmallScreen ? 16 : 20,
    alignItems: 'center',
  },
  loginIconContainer: {
    marginBottom: isTablet ? 20 : isSmallScreen ? 12 : 16,
  },
  loginTitle: {
    fontSize: isTablet ? 28 : isSmallScreen ? 20 : 24,
    fontFamily: 'NotoSansJP-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  loginDescription: {
    fontSize: isTablet ? 18 : isSmallScreen ? 14 : 16,
    fontFamily: 'NotoSansJP-Regular',
    textAlign: 'center',
    marginBottom: isTablet ? 28 : isSmallScreen ? 20 : 24,
  },
  networkOptions: {
    flexDirection: isSmallScreen ? 'column' : 'row',
    gap: 12,
    marginBottom: 16,
    width: '100%',
  },
  networkButton: {
    flex: isSmallScreen ? 0 : 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: isTablet ? 16 : isSmallScreen ? 10 : 12,
    paddingHorizontal: isTablet ? 20 : isSmallScreen ? 12 : 16,
    borderRadius: 8,
  },
  networkButtonText: {
    fontSize: isTablet ? 16 : isSmallScreen ? 12 : 14,
    fontFamily: 'NotoSansJP-SemiBold',
    color: 'white',
  },
  networkNote: {
    fontSize: isTablet ? 14 : isSmallScreen ? 10 : 12,
    fontFamily: 'NotoSansJP-Regular',
    textAlign: 'center',
    marginBottom: 16,
  },
  capsuleModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  capsuleCard: {
    borderRadius: 20,
    padding: isTablet ? 32 : isSmallScreen ? 20 : 24,
    alignItems: 'center',
    marginHorizontal: isTablet ? 40 : isSmallScreen ? 16 : 20,
    maxWidth: isLargeScreen ? 400 : isTablet ? 380 : 360,
    width: isSmallScreen ? '95%' : '100%',
    overflow: 'hidden',
  },
  capsuleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  capsuleTitle: {
    fontSize: 22,
    fontFamily: 'NotoSansJP-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  capsuleSubtitle: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  signalsContainer: {
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  signalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  signalText: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Medium',
    flex: 1,
  },
  testResultsHeader: {
    marginTop: 12,
    marginBottom: 8,
    width: '100%',
  },
  testResultsTitle: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-SemiBold',
  },
  testResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    width: '100%',
  },
  testResultLabel: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Regular',
  },
  testResultValue: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-SemiBold',
  },
  timestamp: {
    fontSize: 10,
    fontFamily: 'NotoSansJP-Regular',
    textAlign: 'center',
    marginTop: 8,
  },
  continueButton: {
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  continueText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'NotoSansJP-SemiBold',
  },
});