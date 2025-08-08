import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { createTabStyles } from './styles';
import { 
  Bell, 
  Eye, 
  Shield, 
  Palette, 
  Volume2, 
  CircleHelp as HelpCircle, 
  Info, 
  ChevronRight,
  ChevronDown,
  Camera,
  Moon,
  Sun,
  Monitor,
  Globe,
  Trash2,
  RefreshCw,
  Battery,
  Settings as SettingsIcon,
  Activity,
  Wifi,
  Bluetooth,
  Zap
} from 'lucide-react-native';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SettingsScreen() {
  const { isDark, colors, toggleTheme, setTheme } = useTheme();
  const { t, currentLanguage, supportedLanguages, changeLanguage } = useLanguage();
  
  const [settings, setSettings] = useState({
    // AR Detection Settings
    autoDetection: true,
    detectionSensitivity: 'medium',
    
    // Feedback Settings
    notifications: true,
    soundEffects: false,
    
    // Device Settings (moved from Devices tab)
    autoConnect: true,
    lowPowerMode: false,
    secureMode: true,
    backgroundSync: false,
    
    // Network Settings
    wifiEnabled: true,
    bluetoothEnabled: true,
    websocketEnabled: true,
    autoNetworkConnect: true,
    
    // Privacy Settings
    privacy: true,
  });

  const [selectedThemeMode, setSelectedThemeMode] = useState<'light' | 'dark' | 'system'>(
    isDark ? 'dark' : 'light'
  );

  // Expandable states
  const [expandedTheme, setExpandedTheme] = useState(false);
  const [expandedLanguage, setExpandedLanguage] = useState(false);

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    setSelectedThemeMode(mode);
    
    if (mode === 'system') {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark);
    } else {
      setTheme(mode === 'dark');
    }
    setExpandedTheme(false);
  };

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await changeLanguage(languageCode);
      Alert.alert(
        t('settings:alerts.languageChanged'),
        t('settings:alerts.languageChangedMessage', { 
          language: supportedLanguages.find(lang => lang.code === languageCode)?.name 
        })
      );
      setExpandedLanguage(false);
    } catch (error) {
      Alert.alert(t('common:error'), 'Failed to change language');
    }
  };

  const handleDataClear = () => {
    Alert.alert(
      t('settings:privacy.dataClear.confirmTitle'),
      t('settings:privacy.dataClear.confirmMessage'),
      [
        {
          text: t('common:cancel'),
          style: 'cancel',
        },
        {
          text: t('settings:privacy.dataClear.confirmButton'),
          style: 'destructive',
          onPress: () => {
            // Clear localStorage and reset settings
            if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.clear();
            }
            // Reset settings to defaults
            setSettings({
              autoDetection: true,
              detectionSensitivity: 'medium',
              notifications: true,
              soundEffects: false,
              autoConnect: true,
              lowPowerMode: false,
              secureMode: true,
              backgroundSync: false,
              wifiEnabled: true,
              bluetoothEnabled: true,
              websocketEnabled: true,
              autoNetworkConnect: true,
              privacy: true,
            });
            setSelectedThemeMode('system');
            Alert.alert(t('common:success'), t('settings:privacy.dataClear.successMessage'));
          },
        },
      ]
    );
  };

  const renderThemeSelector = () => (
    <View style={[styles.selector, { backgroundColor: colors.surface }]}>
      <View style={styles.selectorOptions}>
        <TouchableOpacity
          style={[
            styles.selectorOption,
            { 
              backgroundColor: selectedThemeMode === 'light' ? colors.primary : colors.card,
              borderColor: colors.border 
            }
          ]}
          onPress={() => handleThemeChange('light')}
        >
          <Sun 
            size={20} 
            color={selectedThemeMode === 'light' ? '#fff' : colors.textSecondary} 
          />
          <Text style={[
            styles.selectorOptionText,
            { 
              color: selectedThemeMode === 'light' ? '#fff' : colors.textSecondary 
            }
          ]}>
            {t('settings:appearance.theme.light')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.selectorOption,
            { 
              backgroundColor: selectedThemeMode === 'dark' ? colors.primary : colors.card,
              borderColor: colors.border 
            }
          ]}
          onPress={() => handleThemeChange('dark')}
        >
          <Moon 
            size={20} 
            color={selectedThemeMode === 'dark' ? '#fff' : colors.textSecondary} 
          />
          <Text style={[
            styles.selectorOptionText,
            { 
              color: selectedThemeMode === 'dark' ? '#fff' : colors.textSecondary 
            }
          ]}>
            {t('settings:appearance.theme.dark')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.selectorOption,
            { 
              backgroundColor: selectedThemeMode === 'system' ? colors.primary : colors.card,
              borderColor: colors.border 
            }
          ]}
          onPress={() => handleThemeChange('system')}
        >
          <Monitor 
            size={20} 
            color={selectedThemeMode === 'system' ? '#fff' : colors.textSecondary} 
          />
          <Text style={[
            styles.selectorOptionText,
            { 
              color: selectedThemeMode === 'system' ? '#fff' : colors.textSecondary 
            }
          ]}>
            {t('settings:appearance.theme.system')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLanguageSelector = () => (
    <View style={[styles.selector, { backgroundColor: colors.surface }]}>
      <View style={styles.languageGrid}>
        {supportedLanguages.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageOption,
              { 
                backgroundColor: currentLanguage === language.code ? colors.primary : colors.card,
                borderColor: colors.border 
              }
            ]}
            onPress={() => handleLanguageChange(language.code)}
          >
            <Text style={[
              styles.languageText,
              { 
                color: currentLanguage === language.code ? '#fff' : colors.text 
              }
            ]}>
              {language.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSettingButton = (item: any) => {
    const IconComponent = item.icon;
    
    if (item.type === 'theme-selector') {
      return (
        <View key={item.title}>
          <TouchableOpacity 
            style={[styles.settingButton, { backgroundColor: colors.card }]}
            onPress={() => setExpandedTheme(!expandedTheme)}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.primary + '20' }]}>
                <IconComponent size={20} color={colors.primary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
              </View>
            </View>
            {expandedTheme ? (
              <ChevronDown size={20} color={colors.textSecondary} />
            ) : (
              <ChevronRight size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
          {expandedTheme && renderThemeSelector()}
        </View>
      );
    }

    if (item.type === 'language-selector') {
      return (
        <View key={item.title}>
          <TouchableOpacity 
            style={[styles.settingButton, { backgroundColor: colors.card }]}
            onPress={() => setExpandedLanguage(!expandedLanguage)}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.primary + '20' }]}>
                <IconComponent size={20} color={colors.primary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
              </View>
            </View>
            {expandedLanguage ? (
              <ChevronDown size={20} color={colors.textSecondary} />
            ) : (
              <ChevronRight size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
          {expandedLanguage && renderLanguageSelector()}
        </View>
      );
    }
    
    return (
      <TouchableOpacity
        key={item.title}
        style={[styles.settingButton, { backgroundColor: colors.card }]}
        onPress={() => {
          if (item.type === 'switch') {
            toggleSetting(item.key);
          } else if (item.type === 'action') {
            item.action();
          }
        }}
      >
        <View style={styles.settingLeft}>
          <View style={[
            styles.settingIcon, 
            { 
              backgroundColor: item.destructive ? '#FF0000' + '20' : colors.primary + '20' 
            }
          ]}>
            <IconComponent 
              size={20} 
              color={item.destructive ? '#FF0000' : colors.primary} 
            />
          </View>
          <View style={styles.settingInfo}>
            <Text style={[
              styles.settingTitle, 
              { 
                color: item.destructive ? '#FF0000' : colors.text 
              }
            ]}>
              {item.title}
            </Text>
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
              {item.subtitle}
            </Text>
          </View>
        </View>
        
        <View style={styles.settingRight}>
          {item.type === 'switch' ? (
            <Switch
              value={item.value}
              onValueChange={() => toggleSetting(item.key)}
              trackColor={{ false: '#E5E7EB', true: '#E5E7EB' }}
              thumbColor={item.value ? '#00FF88' : '#fff'}
            />
          ) : (
            <ChevronRight size={20} color={colors.textSecondary} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Settings organized by sections
  const settingSections = [
    {
      title: t('settings:sections.appearance'),
      items: [
        {
          icon: Palette,
          title: t('settings:appearance.theme.title'),
          subtitle: t('settings:appearance.theme.subtitle', { 
            mode: selectedThemeMode === 'system' ? t('common:system') : 
                  selectedThemeMode === 'dark' ? t('common:dark') : t('common:light')
          }),
          type: 'theme-selector',
        },
        {
          icon: Globe,
          title: t('settings:appearance.language.title'),
          subtitle: t('settings:appearance.language.subtitle', { 
            language: supportedLanguages.find(lang => lang.code === currentLanguage)?.name 
          }),
          type: 'language-selector',
        },
      ]
    },
    {
      title: t('settings:sections.detection'),
      items: [
        {
          icon: Camera,
          title: t('settings:detection.autoDetection.title'),
          subtitle: t('settings:detection.autoDetection.subtitle'),
          type: 'switch',
          key: 'autoDetection',
          value: settings.autoDetection,
        },
        {
          icon: Eye,
          title: t('settings:detection.sensitivity.title'),
          subtitle: t('settings:detection.sensitivity.subtitle'),
          type: 'navigation',
        },
      ]
    },
    {
      title: t('settings:sections.feedback'),
      items: [
        {
          icon: Bell,
          title: t('settings:feedback.notifications.title'),
          subtitle: t('settings:feedback.notifications.subtitle'),
          type: 'switch',
          key: 'notifications',
          value: settings.notifications,
        },
        {
          icon: Volume2,
          title: t('settings:feedback.soundEffects.title'),
          subtitle: t('settings:feedback.soundEffects.subtitle'),
          type: 'switch',
          key: 'soundEffects',
          value: settings.soundEffects,
        },
      ]
    },
    {
      title: 'Device Management',
      items: [
        {
          icon: RefreshCw,
          title: 'Auto Connect Devices',
          subtitle: 'Automatically connect to known devices',
          type: 'switch',
          key: 'autoConnect',
          value: settings.autoConnect,
        },
        {
          icon: Battery,
          title: 'Low Power Mode',
          subtitle: 'Reduce power consumption for battery devices',
          type: 'switch',
          key: 'lowPowerMode',
          value: settings.lowPowerMode,
        },
        {
          icon: Shield,
          title: 'Secure Mode',
          subtitle: 'Enhanced security protocols for all connections',
          type: 'switch',
          key: 'secureMode',
          value: settings.secureMode,
        },
        {
          icon: Activity,
          title: 'Background Sync',
          subtitle: 'Sync device data in background',
          type: 'switch',
          key: 'backgroundSync',
          value: settings.backgroundSync,
        },
      ]
    },
    {
      title: 'Network Settings',
      items: [
        {
          icon: Wifi,
          title: 'WiFi',
          subtitle: 'Enable WiFi connectivity',
          type: 'switch',
          key: 'wifiEnabled',
          value: settings.wifiEnabled,
        },
        {
          icon: Bluetooth,
          title: 'Bluetooth',
          subtitle: 'Enable Bluetooth networking',
          type: 'switch',
          key: 'bluetoothEnabled',
          value: settings.bluetoothEnabled,
        },
        {
          icon: Zap,
          title: 'WebSocket',
          subtitle: 'Enable WebSocket connections',
          type: 'switch',
          key: 'websocketEnabled',
          value: settings.websocketEnabled,
        },
        {
          icon: RefreshCw,
          title: 'Auto Connect Networks',
          subtitle: 'Automatically connect to known networks',
          type: 'switch',
          key: 'autoNetworkConnect',
          value: settings.autoNetworkConnect,
        },
      ]
    },
    {
      title: t('settings:sections.privacy'),
      items: [
        {
          icon: Shield,
          title: t('settings:privacy.privacyMode.title'),
          subtitle: t('settings:privacy.privacyMode.subtitle'),
          type: 'switch',
          key: 'privacy',
          value: settings.privacy,
        },
        {
          icon: Trash2,
          title: t('settings:privacy.dataClear.title'),
          subtitle: t('settings:privacy.dataClear.subtitle'),
          type: 'action',
          action: handleDataClear,
          destructive: true,
        },
      ]
    },
    {
      title: t('settings:sections.support'),
      items: [
        {
          icon: HelpCircle,
          title: t('settings:support.help.title'),
          subtitle: t('settings:support.help.subtitle'),
          type: 'navigation',
        },
        {
          icon: Info,
          title: t('settings:support.about.title'),
          subtitle: t('settings:support.about.subtitle'),
          type: 'navigation',
        },
      ]
    },
  ];

  const renderSection = (section: any) => (
    <View key={section.title} style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
      <View style={styles.sectionContent}>
        {section.items.map(renderSettingButton)}
      </View>
    </View>
  );

  const allStyles = createTabStyles(colors, isDark);
  const styles = { ...allStyles.common, ...allStyles.settings };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? ['#000428', '#004e92'] : ['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Setting</Text>
            <Text style={[styles.subtitle, { color: isDark ? colors.textSecondary : colors.text }]}>{t('settings:subtitle')}</Text>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {settingSections.map(renderSection)}
            
            <View style={styles.versionInfo}>
              <BlurView intensity={isDark ? 60 : 40} tint={isDark ? "dark" : "light"} style={styles.versionCard}>
                <Text style={[styles.versionText, { color: colors.text }]}>{t('settings:version')}</Text>
                <Text style={[styles.versionSubtext, { color: colors.textSecondary }]}>{t('settings:builtWith')}</Text>
              </BlurView>
            </View>
          </ScrollView>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

