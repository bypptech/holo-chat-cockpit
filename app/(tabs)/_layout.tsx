import { Tabs } from 'expo-router';
import { Camera, Settings, Smartphone, MessageCircle, Infinity, Wifi, Pointer } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TabLayout() {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 10,
        },
      }}>
        <Tabs.Screen
          name="index"
          options={{
            title: t('navigation:tabs.index'),
            tabBarIcon: ({ size, color }) => (
              <Infinity size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="button"
          options={{
            title: t('navigation:tabs.button'),
            tabBarIcon: ({ size, color }) => (
              <Pointer size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="ar"
          options={{
            title: t('navigation:tabs.camera'),
            tabBarIcon: ({ size, color }) => (
              <Camera size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: t('navigation:tabs.chat'),
            tabBarIcon: ({ size, color }) => (
              <MessageCircle size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="devices"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="network"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: t('navigation:tabs.settings'),
            tabBarIcon: ({ size, color }) => (
              <Settings size={size} color={color} />
            ),
          }}
        />
    </Tabs>
  );
}