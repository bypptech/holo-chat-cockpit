import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { useInternetIdentity } from '@/contexts/InternetIdentityContext';
import DriveOperationService from '@/components/services/driveOperationService';
import { 
  Shield,
  Play,
  Globe,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle,
  Infinity
} from 'lucide-react-native';

export default function TouchUIScreen() {
  const { t } = useTranslation();
  const { isDark, colors } = useTheme();
  const { isAuthenticated, principal, login, logout, isLoading: authLoading } = useInternetIdentity();
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));
  const router = useRouter(); 
  // Device operation states
  const [deviceLoading, setDeviceLoading] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [operationStatus, setOperationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const driveService = DriveOperationService.getInstance();
  const token = process.env.EXPO_PUBLIC_ICP_MAINNET_CANISTER_ID_DRIVE_GACHA_SECRET_TOKEN || '';
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  // Responsive breakpoints
  const isTablet = screenDimensions.width >= 768;
  const isLargeScreen = screenDimensions.width >= 1024;
  const isSmallScreen = screenDimensions.width < 480;

  // Get responsive styles
  const responsiveStyles = {
    titleSize: 32,
    subtitleSize: 14,
    cardPadding: isTablet ? 40 : isSmallScreen ? 16 : 20,
    containerPadding: isTablet ? 40 : isSmallScreen ? 16 : 20,
  };
  
  const handleLogin = async () => {
    try {
      router.push('/');
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setLastResult(null);
      setOperationStatus('idle');
      setCountdown(null);
    } catch (error) {
      Alert.alert('Logout Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleDeviceAction = async () => {
    if (!isAuthenticated || !principal) {
      Alert.alert('Authentication Required', 'Please login with Internet Identity first');
      return;
    }

    if (deviceLoading || countdown !== null) {
      return; // Operation already in progress
    }

    setDeviceLoading(true);
    setOperationStatus('loading');
    setLastResult(null);

    try {
      await driveService.executeDriveOperation(
        token,
        {
          onSuccess: (canisterResponse: string) => {
            setLastResult(canisterResponse);
            setOperationStatus('success');
            Alert.alert('Operation Complete', `Response: ${canisterResponse}`);
          },
          onError: (error: string) => {
            setLastResult(`Error: ${error}`);
            setOperationStatus('error');
            Alert.alert('Operation Failed', error);
          },
          onCountdownUpdate: (seconds: number) => {
            setCountdown(seconds);
          },
          onComplete: () => {
            setDeviceLoading(false);
            setCountdown(null);
          }
        }
      );
    } catch (error) {
      setOperationStatus('error');
      setLastResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setDeviceLoading(false);
      setCountdown(null);
      Alert.alert('Operation Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const getStatusColor = () => {
    switch (operationStatus) {
      case 'success': return colors.success;
      case 'error': return colors.error;
      case 'loading': return colors.primary;
      default: return colors.textSecondary;
    }
  };

  const getStatusIcon = () => {
    switch (operationStatus) {
      case 'success': return CheckCircle;
      case 'error': return AlertCircle;
      case 'loading': return Clock;
      default: return Settings;
    }
  };

  const styles = createStyles(colors, isDark);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? ['#000428', '#004e92'] : ['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <View style={styles.contentWrapper}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={[
                styles.title, 
                { fontSize: responsiveStyles.titleSize, color: colors.text }
              ]}>
                {t('button:title')}
              </Text>
              <Text style={[
                styles.subtitle,
                { fontSize: responsiveStyles.subtitleSize, color: isDark ? colors.textSecondary : colors.text }
              ]}>
                {t('button:subtitle')}
              </Text>
            </View>

            {/* Auth Status Badge */}
            <View style={styles.authStatus}>
              {isAuthenticated ? (
                <View style={[styles.authBadge, { backgroundColor: colors.success + '20' }]}>
                  <Shield size={12} color={colors.success} />
                  <Text style={[styles.authText, { color: colors.success }]}>
                    {t('button:ui.authenticated')}
                  </Text>
                </View>
              ) : (
                <View style={[styles.authBadge, { backgroundColor: colors.warning + '20' }]}>
                  <Shield size={12} color={colors.warning} />
                  <Text style={[styles.authText, { color: colors.warning }]}>
                    {t('button:ui.notAuthenticated')}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <ScrollView 
            contentContainerStyle={[
              styles.scrollContent,
              { padding: responsiveStyles.containerPadding }
            ]}
            showsVerticalScrollIndicator={false}
          >
            {!isAuthenticated ? (
              /* Login Required */
              <View style={styles.loginRequiredContainer}>
                <BlurView
                  intensity={isDark ? 80 : 60}
                  tint={isDark ? "dark" : "light"}
                  style={styles.loginRequiredBlur}
                >
                  <Infinity size={48} color={isDark ? "#fff" : colors.primary} />
                  <Text style={[styles.loginRequiredTitle, { color: colors.text }]}>
                    {t('button:session.loginRequired')}
                  </Text>
                  <TouchableOpacity
                    style={[styles.loginButton, { backgroundColor: colors.primary }]}
                    onPress={handleLogin}
                    disabled={authLoading}
                  >
                    {authLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.loginButtonText}>
                        {t('button:session.loginButton')}
                      </Text>
                    )}
                  </TouchableOpacity>
                </BlurView>
              </View>
            ) : (
              <>
                {/* Device Control Card */}
                <BlurView
                  intensity={isDark ? 80 : 60}
                  tint={isDark ? "dark" : "light"}
                  style={[styles.controlCard, { padding: responsiveStyles.cardPadding }]}
                >
                  <View style={styles.controlHeader}>
                    <Play size={20} color={colors.primary} />
                    <Text style={[styles.controlTitle, { color: colors.text }]}>
                      {t('button:device.control.title')}
                    </Text>
                  </View>

                  {/* Main Drive Button */}
                  <TouchableOpacity
                    style={[
                      styles.driveButton,
                      { 
                        backgroundColor: deviceLoading || countdown !== null 
                          ? colors.surface 
                          : colors.primary 
                      }
                    ]}
                    onPress={handleDeviceAction}
                    disabled={deviceLoading || countdown !== null}
                  >
                    {deviceLoading && countdown === null ? (
                      <ActivityIndicator size="large" color={colors.textSecondary} />
                    ) : countdown !== null ? (
                      <>
                        <Clock size={24} color={colors.textSecondary} />
                        <Text style={[styles.countdownText, { color: colors.textSecondary }]}>
                          {countdown}s
                        </Text>
                      </>
                    ) : (
                      <>
                        <Play size={24} color="#fff" />
                        <Text style={styles.driveButtonText}>
                          {t('button:device.control.executeOperation')}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Status Display */}
                  {(operationStatus !== 'idle' || lastResult) && (
                    <View style={styles.statusContainer}>
                      <View style={styles.statusHeader}>
                        {React.createElement(getStatusIcon(), { 
                          size: 16, 
                          color: getStatusColor() 
                        })}
                        <Text style={[styles.statusTitle, { color: getStatusColor() }]}>
                          {operationStatus === 'loading' ? t('button:device.status.processing') :
                           operationStatus === 'success' ? t('button:device.status.success') :
                           operationStatus === 'error' ? t('button:device.status.error') : t('button:device.status.idle')}
                        </Text>
                      </View>
                      {lastResult && (
                        <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                          {lastResult}
                        </Text>
                      )}
                    </View>
                  )}
                </BlurView>

                {/* Device Info Card */}
                <BlurView
                  intensity={isDark ? 80 : 60}
                  tint={isDark ? "dark" : "light"}
                  style={[styles.infoCard, { padding: responsiveStyles.cardPadding }]}
                >
                  <View style={styles.infoHeader}>
                    <Settings size={20} color={colors.primary} />
                    <Text style={[styles.infoTitle, { color: colors.text }]}>
                      {t('button:device.info.title')}
                    </Text>
                  </View>
                  
                  <View style={styles.infoList}>
                    <View style={styles.infoItem}>
                      <Text style={[styles.infoLabel, { color: colors.text }]}>
                        {t('button:device.info.targetDevice')}
                      </Text>
                      <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                        {t('button:device.info.deviceName')}
                      </Text>
                    </View>
                    
                    <View style={styles.infoItem}>
                      <Text style={[styles.infoLabel, { color: colors.text }]}>
                        {t('button:device.info.connectionStatus')}
                      </Text>
                      <Text style={[styles.infoValue, { color: colors.success }]}>
                        {t('button:device.info.connectionValue')}
                      </Text>
                    </View>
                    
                    <View style={styles.infoItem}>
                      <Text style={[styles.infoLabel, { color: colors.text }]}>
                        {t('button:device.info.cooldownPeriod')}
                      </Text>
                      <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                        {t('button:device.info.cooldownValue')}
                      </Text>
                    </View>
                  </View>
                </BlurView>
              </>
            )}
          </ScrollView>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  headerContent: {
    marginBottom: 12,
  },
  title: {
    fontFamily: 'NotoSansJP-Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'NotoSansJP-Regular',
    lineHeight: 20,
  },
  authStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  authText: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-SemiBold',
  },
  scrollContent: {
    flexGrow: 1,
  },
  loginRequiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loginRequiredBlur: {
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    overflow: 'hidden',
  },
  loginRequiredTitle: {
    fontSize: 20,
    fontFamily: 'NotoSansJP-SemiBold',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  loginButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-SemiBold',
    color: '#fff',
  },
  controlCard: {
    borderRadius: 20,
    marginBottom: 24,
    overflow: 'hidden',
  },
  controlHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  controlTitle: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-SemiBold',
    marginLeft: 8,
  },
  driveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
    marginBottom: 16,
  },
  driveButtonText: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-SemiBold',
    color: '#fff',
  },
  countdownText: {
    fontSize: 24,
    fontFamily: 'NotoSansJP-Bold',
  },
  statusContainer: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-SemiBold',
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Regular',
    lineHeight: 16,
  },
  infoCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-SemiBold',
    marginLeft: 8,
  },
  infoList: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Regular',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Medium',
  },
});