import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Infinity, Shield } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useInternetIdentity } from '@/contexts/InternetIdentityContext';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import MindARPanel from '@/components/MindARPanel';

export default function MindAROnlyScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useTranslation();
  const { isAuthenticated, login, isLoading: authLoading } = useInternetIdentity();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      router.push('/');
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Unknown error');
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
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={[styles.title, { color: colors.text }]}>
                {t('ar:title')}
              </Text>
              <Text style={[styles.subtitle, { color: isDark ? colors.textSecondary : colors.text }]}>
                {t('ar:ui.subtitle')}
              </Text>
            </View>

            {/* Auth Status Badge */}
            <View style={styles.authStatus}>
              {isAuthenticated ? (
                <View style={[styles.authBadge, { backgroundColor: colors.success + '20' }]}>
                  <Shield size={12} color={colors.success} />
                  <Text style={[styles.authText, { color: colors.success }]}>
                    {t('chat:ui.authenticated')}
                  </Text>
                </View>
              ) : (
                <View style={[styles.authBadge, { backgroundColor: colors.warning + '20' }]}>
                  <Shield size={12} color={colors.warning} />
                  <Text style={[styles.authText, { color: colors.warning }]}>
                    {t('chat:ui.notAuthenticated')}
                  </Text>
                </View>
              )}
            </View>
          </View>

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
                  {t('ar:loginRequired')}
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
                      {t('ar:loginButton')}
                    </Text>
                  )}
                </TouchableOpacity>
              </BlurView>
            </View>
          ) : (
            <MindARPanel />
          )}
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
    fontSize: 32,
    fontFamily: 'NotoSansJP-Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
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
});