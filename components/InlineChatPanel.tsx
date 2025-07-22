import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface InlineChatPanelProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  targetDevice?: string;
  parameters?: Record<string, any>;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'device' | 'icp' | 'gacha';
}

export const InlineChatPanel: React.FC<InlineChatPanelProps> = ({
  title,
  subtitle,
  actionLabel,
  targetDevice,
  parameters,
  onConfirm,
  onCancel,
  type = 'device'
}) => {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();

  const getIcon = () => {
    switch (type) {
      case 'device':
        return '🎮';
      case 'icp':
        return '🌐';
      case 'gacha':
        return '🎰';
      default:
        return '📋';
    }
  };

  const styles = createStyles(colors, isDark);

  return (
    <BlurView intensity={isDark ? 60 : 40} tint={isDark ? "dark" : "light"} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>{getIcon()}</Text>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
          )}
        </View>
      </View>

      {targetDevice && (
        <View style={styles.infoSection}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            {t('controls:inlinePanel.target')}
          </Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{targetDevice}</Text>
        </View>
      )}

      {actionLabel && (
        <View style={styles.infoSection}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            {t('controls:inlinePanel.action')}
          </Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{actionLabel}</Text>
        </View>
      )}

      {parameters && Object.keys(parameters).length > 0 && (
        <View style={styles.paramSection}>
          {Object.entries(parameters).map(([key, value]) => (
            <View key={key} style={styles.paramRow}>
              <Text style={[styles.paramKey, { color: colors.textSecondary }]}>
                {key}:
              </Text>
              <Text style={[styles.paramValue, { color: colors.text }]}>
                {value}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton, { backgroundColor: colors.surface }]}
          onPress={onCancel}
        >
          <XCircle size={16} color={colors.error} />
          <Text style={[styles.buttonText, { color: colors.error }]}>
            {t('common:cancel')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.confirmButton, { backgroundColor: colors.primary }]}
          onPress={onConfirm}
        >
          <CheckCircle size={16} color="#fff" />
          <Text style={[styles.buttonText, { color: '#fff' }]}>
            {t('controls:inlinePanel.execute')}
          </Text>
        </TouchableOpacity>
      </View>
    </BlurView>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.surface + '60',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-SemiBold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Regular',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Regular',
    marginRight: 8,
    minWidth: 60,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Medium',
    flex: 1,
  },
  paramSection: {
    marginTop: 8,
    marginBottom: 12,
    paddingLeft: 16,
  },
  paramRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  paramKey: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Regular',
    marginRight: 8,
    minWidth: 80,
  },
  paramValue: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Regular',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelButton: {},
  confirmButton: {},
  buttonText: {
    fontSize: 13,
    fontFamily: 'NotoSansJP-SemiBold',
  },
});