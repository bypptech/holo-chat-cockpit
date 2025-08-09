import React from 'react';
import { View, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useInternetIdentity } from '@/contexts/InternetIdentityContext';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import MindARPanel from '@/components/MindARPanel';
import ICPLoginRequire from '@/components/auth/icp-login-require';
import { createTabStyles } from './styles';

export default function MindAROnlyScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useTranslation();
  const { isAuthenticated } = useInternetIdentity();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      router.push('/');
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const allStyles = createTabStyles(colors, isDark);
  const styles = { ...allStyles.common, ...allStyles.ar };

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
            <ICPLoginRequire 
              titleKey={t('ar:loginRequired')}
              buttonKey={t('ar:loginButton')}
              onCustomLogin={handleLogin}
            />
          ) : (
            <MindARPanel />
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

