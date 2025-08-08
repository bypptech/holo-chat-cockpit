import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { Infinity } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useInternetIdentity } from '@/contexts/InternetIdentityContext';
import { useRouter } from 'expo-router';

interface ICPLoginRequireProps {
  titleKey: string;
  buttonKey: string;
  onCustomLogin?: () => Promise<void>;
}

export default function ICPLoginRequire({ 
  titleKey, 
  buttonKey, 
  onCustomLogin 
}: ICPLoginRequireProps) {
  const { isDark, colors } = useTheme();
  const { isLoading: authLoading } = useInternetIdentity();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      if (onCustomLogin) {
        await onCustomLogin();
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <View style={styles.loginRequiredContainer}>
      <BlurView
        intensity={isDark ? 80 : 60}
        tint={isDark ? "dark" : "light"}
        style={styles.loginRequiredBlur}
      >
        <Infinity size={48} color={isDark ? "#fff" : colors.primary} />
        <Text style={[styles.loginRequiredTitle, { color: colors.text }]}>
          {titleKey}
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
              {buttonKey}
            </Text>
          )}
        </TouchableOpacity>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
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