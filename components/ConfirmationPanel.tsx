
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { DeviceCommand } from '@/components/services/gemini';

interface ConfirmationPanelProps {
  visible: boolean;
  command: DeviceCommand | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationPanel: React.FC<ConfirmationPanelProps> = ({
  visible,
  command,
  onConfirm,
  onCancel,
}) => {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();

  if (!command) return null;

  const getActionText = () => {
    const actionKey = `controls:confirmation.actions.${command.action}`;
    return t(actionKey, { defaultValue: command.action });
  };

  const styles = createStyles(colors, isDark);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <BlurView intensity={isDark ? 80 : 60} tint={isDark ? "dark" : "light"} style={styles.container}>
          <View style={styles.panel}>
            <View style={styles.header}>
              <AlertTriangle size={24} color={colors.warning} />
              <Text style={[styles.title, { color: colors.text }]}>
                {t('controls:confirmation.title')}
              </Text>
            </View>

            <View style={styles.commandInfo}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {t('controls:confirmation.action')}
              </Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {getActionText()}
              </Text>

              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {t('controls:confirmation.device')}
              </Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {command.target}
              </Text>

              {Object.keys(command.parameters || {}).length > 0 && (
                <>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    {t('controls:confirmation.parameters')}
                  </Text>
                  {Object.entries(command.parameters || {}).map(([key, value]) => (
                    <Text key={key} style={[styles.parameter, { color: colors.text }]}>
                      {key}: {value}
                    </Text>
                  ))}
                </>
              )}

              <Text style={[styles.explanation, { color: colors.textSecondary }]}>
                {command.explanation}
              </Text>

              <View style={styles.confidenceContainer}>
                <Text style={[styles.confidenceLabel, { color: colors.textSecondary }]}>
                  {t('controls:confirmation.confidence')}
                </Text>
                <View style={[styles.confidenceBar, { backgroundColor: colors.surface }]}>
                  <View 
                    style={[
                      styles.confidenceFill, 
                      { 
                        width: `${command.confidence * 100}%`,
                        backgroundColor: command.confidence > 0.8 ? colors.success : 
                                       command.confidence > 0.6 ? colors.warning : colors.error
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.confidenceValue, { color: colors.text }]}>
                  {Math.round(command.confidence * 100)}%
                </Text>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { backgroundColor: colors.error }]}
                onPress={onCancel}
              >
                <XCircle size={20} color="#fff" />
                <Text style={styles.buttonText}>
                  {t('common:cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.confirmButton, { backgroundColor: colors.success }]}
                onPress={onConfirm}
              >
                <CheckCircle size={20} color="#fff" />
                <Text style={styles.buttonText}>
                  {t('controls:confirmation.execute')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 400,
  },
  panel: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: 'NotoSansJP-Bold',
  },
  commandInfo: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-SemiBold',
    marginTop: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-Regular',
  },
  parameter: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Regular',
    marginLeft: 16,
  },
  explanation: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Regular',
    lineHeight: 20,
    marginTop: 12,
    fontStyle: 'italic',
  },
  confidenceContainer: {
    marginTop: 16,
  },
  confidenceLabel: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-SemiBold',
    marginBottom: 8,
  },
  confidenceBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceValue: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-SemiBold',
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelButton: {},
  confirmButton: {},
  buttonText: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-SemiBold',
    color: '#fff',
  },
});
