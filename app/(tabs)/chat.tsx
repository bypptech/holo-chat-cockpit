import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';

import { LinearGradient } from 'expo-linear-gradient';
import { Send, Bot, User, Smartphone, Settings as SettingsIcon, Shield, Infinity } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInternetIdentity } from '@/contexts/InternetIdentityContext';
import { useChatDevice } from '@/contexts/ChatDeviceContext';
import { analyzeUserIntent, generateAIResponse, DeviceCommand } from '@/components/services/gemini';
import { executeDeviceCommand, getDeviceState } from '@/components/services/deviceControl';
import DriveOperationService from '@/components/services/driveOperationService';
// Temporarily skip Supabase imports
// import { logChatInteraction } from '@/components/services/supabase';

interface ChatSession {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
}
import { ConfirmationPanel } from '@/components/ConfirmationPanel';
import { InlineChatPanel } from '@/components/InlineChatPanel';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  operationData?: any;
  deviceCommand?: DeviceCommand;
  confidence?: number;
  showInlinePanel?: boolean;
  inlinePanelData?: {
    type: 'device' | 'icp' | 'gacha';
    title: string;
    subtitle?: string;
    actionLabel?: string;
    targetDevice?: string;
    parameters?: Record<string, any>;
  };
}

interface AvailableFeature {
  id: string;
  name: string;
  description: string;
  operations: string[];
  examples: string[];
  icon: any;
  color: string;
}

export default function CCCChatScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  const { isAuthenticated, principal, login, logout, isLoading: authLoading } = useInternetIdentity();
  const { getChatEnabledDevices } = useChatDevice();
  const router = useRouter(); 

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingCommand, setPendingCommand] = useState<DeviceCommand | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [isSessionInitialized, setIsSessionInitialized] = useState(false);

  // C.C.C. 利用可能機能
  const availableFeatures: AvailableFeature[] = [
    {
      id: 'device-control',
      name: t('chat:features.deviceControl.name'),
      description: t('chat:features.deviceControl.description'),
      operations: ['power', 'volume', 'temperature', 'mode'],
      examples: [
        t('chat:features.deviceControl.examples.powerOn'),
        t('chat:features.deviceControl.examples.volume'),
        t('chat:features.deviceControl.examples.temperature')
      ],
      icon: Smartphone,
      color: '#4CAF50'
    },
    {
      id: 'ar-gacha',
      name: t('chat:features.arGacha.name'),
      description: t('chat:features.arGacha.description'),
      operations: ['gacha', 'capsule', 'reward'],
      examples: [
        t('chat:features.arGacha.examples.gachaStart'),
        t('chat:features.arGacha.examples.capsuleReceive'),
        t('chat:features.arGacha.examples.rewardCheck')
      ],
      icon: SettingsIcon,
      color: '#FF9800'
    }
  ];

  const connectedDevices = getChatEnabledDevices();

  useEffect(() => {
    const initializeSession = async () => {
      if (isAuthenticated && principal) {
        try {
          console.log('🚀 Initializing chat session for user:', principal.slice(0, 8) + '...');

          // Skip Supabase for now - use local session
          const mockSession = {
            id: `local-session-${Date.now()}`,
            user_id: principal,
            status: 'active',
            created_at: new Date().toISOString()
          };

          console.log('✅ Local session created successfully:', mockSession.id);

          setMessages([]);
        } catch (error) {
          console.error('❌ Failed to initialize chat session:', error);

          // Check if it's a network error
          const isNetworkError = error instanceof TypeError && 
            (error.message.includes('fetch') || error.message.includes('network'));

          if (isNetworkError) {
            setMessages([{
              id: '1',
              content: t('chat:session.networkError'),
              isUser: false,
              timestamp: new Date()
            }]);

            // Try to retry after a delay
            setTimeout(() => {
              if (isAuthenticated && principal) {
                console.log('🔄 Retrying session initialization...');
                initializeSession();
              }
            }, 3000);
          } else {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorDetails = error instanceof Error ? error.stack : JSON.stringify(error);
            console.error('Session initialization error details:', errorDetails);

            setMessages([{
              id: '1',
              content: t('chat:session.initError', { error: errorMessage }),
              isUser: false,
              timestamp: new Date()
            }]);
          }
        }
      } else {
        setMessages([{
          id: '1',
          content: t('chat:session.loginRequired'),
          isUser: false,
          timestamp: new Date()
        }]);
      }
    };

    // Prevent duplicate initialization
    if (isAuthenticated && principal && !isSessionInitialized) {
      console.log('🎯 Initializing chat session (one-time)');
      setIsSessionInitialized(true);
      initializeSession();
    }
  }, [isAuthenticated, principal, isSessionInitialized]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleLogin = async () => {
    try {
      router.push('/');
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };


  const handleFeatureSelect = (featureId: string) => {
    // Toggle selection if the same feature is tapped
    if (selectedFeature === featureId) {
      setSelectedFeature(null);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: t('chat:features.deselected'),
        isUser: false,
        timestamp: new Date()
      }]);
    } else {
      setSelectedFeature(featureId);
      const feature = availableFeatures.find(f => f.id === featureId);
      if (feature) {
        let exampleMessage = '';

        // Provide feature-specific guidance
        switch (featureId) {
          case 'device-control':
            const deviceList = connectedDevices.map(d => `• ${d.name}`).join('\n') || t('chat:features.noDevices');
            exampleMessage = `${t('chat:features.selected', { name: feature.name })}\n\n${t('chat:features.usageExample')}\n${t('chat:features.deviceControlExamples.turnOnTV')}\n${t('chat:features.deviceControlExamples.setTemperature')}\n${t('chat:features.deviceControlExamples.setVolume')}\n${t('chat:features.deviceControlExamples.makeBrighter')}\n\n${t('chat:features.connectedDevices')}\n${deviceList}`;
            break;

          case 'ar-gacha':
            exampleMessage = `${t('chat:features.selected', { name: feature.name })}\n\n${t('chat:features.usageExample')}\n${t('chat:features.arGachaExamples.startGacha')}\n${t('chat:features.arGachaExamples.receiveCapsule')}\n${t('chat:features.arGachaExamples.checkRewards')}`;
            break;

          default:
            exampleMessage = `${t('chat:features.selected', { name: feature.name })}\n${t('chat:features.availableOperations', { operations: feature.operations.join(', ') })}\n\n${t('chat:features.usageExample')}\n${feature.examples.map(ex => `• ${ex}`).join('\n')}`;
        }

        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          content: exampleMessage,
          isUser: false,
          timestamp: new Date()
        }]);
      }
    }
  };

  const processMessage = async (input: string): Promise<Message> => {
    try {
      const availableDeviceNames = connectedDevices.map(d => d.name);

      // AI応答を生成
      let aiResponse: string;
      try {
        console.log('🤖 Generating AI response for:', input.substring(0, 50) + '...');
        aiResponse = await generateAIResponse(input);
        console.log('✅ AI response generated successfully');
      } catch (geminiError) {
        console.error('❌ Gemini API error:', geminiError);
        if (geminiError instanceof Error) {
          console.error('Error details:', {
            message: geminiError.message,
            stack: geminiError.stack
          });
        }
        aiResponse = t('chat:aiResponse.geminiError', { error: geminiError instanceof Error ? geminiError.message : 'Unknown error' });
      }

      // Handle feature-specific commands based on selected feature
      let deviceCommand: DeviceCommand | null = null;
      let confidence = 0;

      if (selectedFeature) {
        switch (selectedFeature) {
          case 'device-control':
            // デバイスコマンドの解析を試行

            try {
              deviceCommand = await analyzeUserIntent(input, availableDeviceNames);
              confidence = deviceCommand?.confidence || 0;

              // If we have a high-confidence device command, show inline panel
              if (deviceCommand && confidence > 0.6) {
                // Add device command info to the AI response
                const deviceInfo = getDeviceState(deviceCommand.target);
                const statusInfo = deviceInfo 
                  ? `\n\nCurrent ${deviceCommand.target} status:\n${Object.entries(deviceInfo)
                      .map(([key, value]) => `• ${key}: ${value}`)
                      .join('\n')}`
                  : '';

                aiResponse = `${aiResponse}${t('chat:aiResponse.deviceCommandDetected', { 
                  action: deviceCommand.action, 
                  target: deviceCommand.target, 
                  confidence: (confidence * 100).toFixed(0),
                  statusInfo 
                })}`;
              }
            } catch (error) {
              console.warn('Device command analysis failed:', error);
            }
            break;


          case 'ar-gacha':
            // Handle AR Gacha commands
            if (input.toLowerCase().includes('gacha') || input.toLowerCase().includes('ガチャ')) {
              aiResponse = `${aiResponse}${t('chat:aiResponse.arGachaProcessing')}`;
            }
            break;
        }
      } else {
        // No feature selected - prompt user to select one
        aiResponse = `${aiResponse}${t('chat:aiResponse.noFeatureSelected')}`;
      }

      // Database logging will be handled in handleSendMessage

      // Create inline panel data based on feature and commands
      let inlinePanelData: Message['inlinePanelData'] = undefined;
      let showInlinePanel = false;

      if (selectedFeature === 'device-control' && deviceCommand && confidence > 0.6) {
        showInlinePanel = true;
        inlinePanelData = {
          type: 'device',
          title: t('chat:inline.deviceConfirmation'),
          subtitle: t('chat:inline.confidence', { confidence: (confidence * 100).toFixed(0) }),
          actionLabel: deviceCommand.action,
          targetDevice: deviceCommand.target,
          parameters: deviceCommand.parameters
        };
      } else if (selectedFeature === 'ar-gacha') {
        if (input.toLowerCase().includes('gacha') || input.toLowerCase().includes('ガチャ')) {
          showInlinePanel = true;
          inlinePanelData = {
            type: 'gacha',
            title: t('chat:inline.arGachaExecution'),
            subtitle: t('chat:inline.featureUnderDevelopment'),
            actionLabel: 'gacha_start',
          };
        }
      }

      return {
        id: Date.now().toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
        deviceCommand: selectedFeature === 'device-control' && deviceCommand ? deviceCommand : undefined,
        confidence: selectedFeature === 'device-control' ? confidence : 0,
        showInlinePanel,
        inlinePanelData
      };
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        id: Date.now().toString(),
        content: t('chat:errors.processing'),
        isUser: false,
        timestamp: new Date()
      };
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !isAuthenticated) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    // 思考中メッセージ
    const thinkingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: t('chat:ui.processing'),
      isUser: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      // AIによるメッセージ処理
      const responseMessage = await processMessage(currentInput);

      setMessages(prev => [
        ...prev.slice(0, prev.length - 1),
        responseMessage
      ]);

    } catch (error) {
      console.error('Message processing error:', error);
      setMessages(prev => [
        ...prev.slice(0, prev.length - 1),
        {
          id: Date.now().toString(),
          content: t('chat:errors.general'),
          isUser: false,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (message: Message) => (
    <View key={message.id} style={[
      styles.messageContainer,
      message.isUser ? styles.userMessage : styles.botMessage
    ]}>
      {!message.isUser && (
        <View style={[styles.botAvatar, { backgroundColor: colors.primary + '30' }]}>
          <Bot size={16} color={colors.primary} />
        </View>
      )}

      <View style={styles.messageContent}>
        <BlurView 
          intensity={isDark ? 60 : 40} 
          tint={isDark ? "dark" : "light"} 
          style={[
            styles.messageBlur,
            message.isUser ? styles.userMessageBlur : styles.botMessageBlur,
            {
              backgroundColor: message.isUser 
                ? colors.primary + '30' 
                : colors.surface + '80'
            }
          ]}
        >
          <Text style={[
            styles.messageText,
            { color: colors.text }
          ]}>
            {message.content}
          </Text>

          {message.operationData && (
            <View style={[styles.operationData, { borderColor: colors.success + '30' }]}>
              <Text style={[styles.operationLabel, { color: colors.success }]}>
                {t('chat:ui.operationComplete')}
              </Text>
              <Text style={[styles.operationDetails, { color: colors.textSecondary }]}>
                {t('chat:ui.operationType', { type: message.operationData.type })}
              </Text>
            </View>
          )}

          <View style={styles.messageFooter}>
            <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </BlurView>

        {/* Inline Panel */}
        {message.showInlinePanel && message.inlinePanelData && (
          <InlineChatPanel
            title={message.inlinePanelData.title}
            subtitle={message.inlinePanelData.subtitle}
            actionLabel={message.inlinePanelData.actionLabel}
            targetDevice={message.inlinePanelData.targetDevice}
            parameters={message.inlinePanelData.parameters}
            type={message.inlinePanelData.type}
            onConfirm={() => handleInlinePanelConfirm(message)}
            onCancel={() => handleInlinePanelCancel(message)}
          />
        )}
      </View>

      {message.isUser && (
        <View style={[styles.userAvatar, { backgroundColor: colors.accent + '30' }]}>
          <User size={16} color={colors.accent} />
        </View>
      )}
    </View>
  );

  const renderFeatureCard = (feature: AvailableFeature) => {
    const IconComponent = feature.icon;
    const isSelected = selectedFeature === feature.id;

    return (
      <TouchableOpacity
        key={feature.id}
        style={[
          styles.featureCard,
          isSelected && { 
            borderColor: feature.color,
            borderWidth: 2,
            backgroundColor: feature.color + '10'
          },
          !isSelected && { backgroundColor: colors.surface + '80' }
        ]}
        onPress={() => handleFeatureSelect(feature.id)}
      >
        <BlurView intensity={isDark ? 60 : 40} tint={isDark ? "dark" : "light"} style={styles.featureBlur}>
          <View style={styles.featureHeader}>
            <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
              <IconComponent size={20} color={feature.color} />
            </View>
            {isSelected && (
              <View style={[styles.selectedBadge, { backgroundColor: feature.color }]}>
                <Text style={styles.selectedBadgeText}>✓</Text>
              </View>
            )}
          </View>

          <Text style={[styles.featureName, { color: colors.text }]}>{feature.name}</Text>
        </BlurView>
      </TouchableOpacity>
    );
  };

  const handleInlinePanelConfirm = async (message: Message) => {
    if (!message.inlinePanelData || !isAuthenticated) return;

    try {
      let executionResult: any = null;
      let executionMessage: Message;

      // Handle different panel types
      switch (message.inlinePanelData.type) {
        case 'device':
          if (message.deviceCommand) {
            executionResult = await executeDeviceCommand(message.deviceCommand);

            if (executionResult.success) {
              const stateInfo = executionResult.data
                ? `\n\n📊 Updated device state:\n${Object.entries(executionResult.data)
                    .map(([key, value]) => `• ${key}: ${value}`)
                    .join('\n')}`
                : '';

              executionMessage = {
                id: Date.now().toString(),
                content: t('chat:deviceActions.success', { message: `${executionResult.message}${stateInfo}` }),
                isUser: false,
                timestamp: new Date(),
                operationData: { 
                  type: message.deviceCommand.action, 
                  target: message.deviceCommand.target,
                  executed: true,
                  result: executionResult.data
                }
              };
            } else {
              executionMessage = {
                id: Date.now().toString(),
                content: t('chat:deviceActions.error', { message: executionResult.message }),
                isUser: false,
                timestamp: new Date(),
                operationData: { 
                  type: message.deviceCommand.action, 
                  target: message.deviceCommand.target,
                  executed: false,
                  error: executionResult.error
                }
              };
            }
          }
          break;


        case 'gacha':
          // Execute Drive Operation using the same logic as Touch UI
          const driveService = DriveOperationService.getInstance();
          const token = process.env.EXPO_PUBLIC_ICP_MAINNET_CANISTER_ID_DRIVE_GACHA_SECRET_TOKEN || '';

          if (!principal) {
            executionMessage = {
              id: Date.now().toString(),
              content: t('chat:deviceActions.authRequired'),
              isUser: false,
              timestamp: new Date(),
              operationData: { 
                type: 'gacha',
                executed: false,
                error: 'NOT_AUTHENTICATED'
              }
            };
            break;
          }

          try {

            // Show initial execution message
            const initialMessage: Message = {
              id: Date.now().toString(),
              content: t('chat:deviceActions.executing'),
              isUser: false,
              timestamp: new Date(),
              operationData: { 
                type: 'gacha_drive',
                executed: true,
                inProgress: true
              }
            };

            // Add initial message immediately
            setMessages(prev => {
              const updatedMessages = prev.map(msg => 
                msg.id === message.id 
                  ? { ...msg, showInlinePanel: false } 
                  : msg
              );
              return [...updatedMessages, initialMessage];
            });

            // Execute drive operation
            await driveService.executeDriveOperation(
              token,
              {
                onSuccess: (canisterResponse: string) => {
                  const successMessage: Message = {
                    id: Date.now().toString(),
                    content: t('chat:deviceActions.complete', { response: canisterResponse }),
                    isUser: false,
                    timestamp: new Date(),
                    operationData: { 
                      type: 'gacha_drive_success',
                      executed: true,
                      canisterResponse
                    }
                  };
                  setMessages(prev => [...prev, successMessage]);
                },
                onError: (error: string) => {
                  const errorMessage: Message = {
                    id: Date.now().toString(),
                    content: t('chat:deviceActions.failed', { error }),
                    isUser: false,
                    timestamp: new Date(),
                    operationData: { 
                      type: 'gacha_drive_error',
                      executed: false,
                      error
                    }
                  };
                  setMessages(prev => [...prev, errorMessage]);
                },
                onCountdownUpdate: (seconds: number) => {
                  if (seconds > 0) {
                    const countdownMessage: Message = {
                      id: `countdown-${Date.now()}`,
                      content: t('chat:deviceActions.cooldown', { seconds }),
                      isUser: false,
                      timestamp: new Date(),
                      operationData: { 
                        type: 'gacha_countdown',
                        countdown: seconds
                      }
                    };
                    setMessages(prev => {
                      // Replace previous countdown message or add new one
                      const withoutCountdown = prev.filter(msg => !msg.operationData?.type?.includes('countdown'));
                      return [...withoutCountdown, countdownMessage];
                    });
                  }
                },
                onComplete: () => {
                  const completeMessage: Message = {
                    id: Date.now().toString(),
                    content: t('chat:deviceActions.ready'),
                    isUser: false,
                    timestamp: new Date(),
                    operationData: { 
                      type: 'gacha_complete',
                      executed: true
                    }
                  };
                  setMessages(prev => {
                    // Remove countdown messages and add completion
                    const withoutCountdown = prev.filter(msg => !msg.operationData?.type?.includes('countdown'));
                    return [...withoutCountdown, completeMessage];
                  });
                }
              }
            );

            // Don't set executionMessage here as it's handled by callbacks
            return;

          } catch (error) {
            executionMessage = {
              id: Date.now().toString(),
              content: t('chat:deviceActions.failed', { error: error instanceof Error ? error.message : 'Unknown error' }),
              isUser: false,
              timestamp: new Date(),
              operationData: { 
                type: 'gacha_drive_error',
                executed: false,
                error: error instanceof Error ? error.message : 'Unknown error'
              }
            };
          }
          break;

        default:
          return;
      }

      // Remove the inline panel from the original message and add the execution result
      setMessages(prev => {
        const updatedMessages = prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, showInlinePanel: false } 
            : msg
        );
        return [...updatedMessages, executionMessage!];
      });

    } catch (error) {
      console.error('Error executing inline panel command:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: t('chat:errors.execution'),
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => {
        const updatedMessages = prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, showInlinePanel: false } 
            : msg
        );
        return [...updatedMessages, errorMessage];
      });
    }
  };

  const handleInlinePanelCancel = (message: Message) => {
    // Remove the inline panel from the message
    setMessages(prev => prev.map(msg => 
      msg.id === message.id 
        ? { ...msg, showInlinePanel: false } 
        : msg
    ));

    // Add a cancellation message
    const cancelMessage: Message = {
      id: Date.now().toString(),
      content: t('chat:deviceActions.cancelled'),
      isUser: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, cancelMessage]);
  };

  const handleConfirmCommand = async () => {
    if (!pendingCommand || !principal) return;

    setShowConfirmation(false);

    try {
      // Execute the device command
      const result = await executeDeviceCommand(pendingCommand);

      console.log('🎮 Device command executed:', {
        action: pendingCommand.action,
        target: pendingCommand.target,
        parameters: pendingCommand.parameters,
        result: result
      });

      // Create execution message based on result
      let executionMessage: Message;

      if (result.success) {
        // Success message with device state info
        const deviceState = getDeviceState(pendingCommand.target);
        const stateInfo = deviceState && result.data
          ? `\n\n📊 Updated device state:\n${Object.entries(result.data)
              .map(([key, value]) => `• ${key}: ${value}`)
              .join('\n')}`
          : '';

        executionMessage = {
          id: Date.now().toString(),
          content: t('chat:deviceActions.success', { message: `${result.message}${stateInfo}` }),
          isUser: false,
          timestamp: new Date(),
          operationData: { 
            type: pendingCommand.action, 
            target: pendingCommand.target,
            executed: true,
            result: result.data
          }
        };
      } else {
        // Error message
        executionMessage = {
          id: Date.now().toString(),
          content: t('chat:deviceActions.error', { message: `${result.message}\n\nError code: ${result.error}` }),
          isUser: false,
          timestamp: new Date(),
          operationData: { 
            type: pendingCommand.action, 
            target: pendingCommand.target,
            executed: false,
            error: result.error
          }
        };
      }

      setMessages(prev => [...prev, executionMessage]);

    } catch (error) {
      console.error('Error executing command:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: t('chat:errors.execution'),
        isUser: false,
        timestamp: new Date()
      }]);
    }

    setPendingCommand(null);
  };

  const handleCancelCommand = async () => {
    if (!pendingCommand || !principal) return;

    setShowConfirmation(false);

    try {      // Skip Supabase device action recording for now
      console.log('❌ Device command cancelled:', {
        action: pendingCommand.action,
        target: pendingCommand.target
      });

      const cancelMessage: Message = {
        id: Date.now().toString(),
        content: t('chat:deviceActions.cancelled'),
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, cancelMessage]);

    } catch (error) {
      console.error('Error logging cancellation:', error);
    }

    setPendingCommand(null);
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
              {t('chat:title')}
            </Text>
            <Text style={[styles.subtitle, { color: isDark ? colors.textSecondary : colors.text }]}>
              {t('chat:ui.subtitle')}
            </Text>
          </View>

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
          /* Login Required Message */
          <View style={styles.loginRequiredContainer}>
            <BlurView
              intensity={isDark ? 80 : 60}
              tint={isDark ? "dark" : "light"}
              style={styles.loginRequiredBlur}
            >
              <Infinity size={48} color={isDark ? "#fff" : colors.primary} />
              <Text style={[styles.loginRequiredTitle, { color: colors.text }]}>
                {t('chat:session.loginRequired')}
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
                    {t('chat:session.loginButton')}
                  </Text>
                )}
              </TouchableOpacity>
            </BlurView>
          </View>
        ) : (
          <>
            <View style={styles.featuresSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('chat:features.selectInstruction')}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuresScroll}>
                {availableFeatures.map(renderFeatureCard)}
              </ScrollView>
            </View>

            <View style={styles.chatContainer}>
              <ScrollView 
                ref={scrollViewRef}
                style={styles.messagesContainer}
                showsVerticalScrollIndicator={false}
              >
                {messages.map(renderMessage)}

                {isLoading && (
                  <View style={styles.typingIndicator}>
                    <BlurView intensity={isDark ? 80 : 60} tint={isDark ? "dark" : "light"} style={styles.typingBlur}>
                      <View style={styles.typingDots}>
                        <View style={[styles.dot, styles.dot1, { backgroundColor: colors.primary }]} />
                        <View style={[styles.dot, styles.dot2, { backgroundColor: colors.primary }]} />
                        <View style={[styles.dot, styles.dot3, { backgroundColor: colors.primary }]} />
                      </View>
                      <Text style={[styles.typingText, { color: colors.textSecondary }]}>
                        {t('chat:ui.processing')}
                      </Text>
                    </BlurView>
                  </View>
                )}
              </ScrollView>

              <BlurView intensity={isDark ? 90 : 70} tint={isDark ? "dark" : "light"} style={styles.inputContainer}>
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder={t('chat:ui.placeholder')}
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  maxLength={100}
                  onSubmitEditing={handleSendMessage}
                  editable={isAuthenticated}
                />

                <TouchableOpacity 
                  style={[
                    styles.sendButton, 
                    { 
                      backgroundColor: inputText.trim() && isAuthenticated ? colors.primary : colors.surface 
                    }
                  ]}
                  onPress={handleSendMessage}
                  disabled={!inputText.trim() || isLoading || !isAuthenticated}
                >
                  <Send size={20} color={inputText.trim() && isAuthenticated ? "#fff" : colors.textSecondary} />
                </TouchableOpacity>
              </BlurView>
            </View>
          </>
        )}

        <ConfirmationPanel
          visible={showConfirmation}
          command={pendingCommand}
          onConfirm={handleConfirmCommand}
          onCancel={handleCancelCommand}
        />
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
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-SemiBold',
    marginBottom: 12,
  },
  featuresScroll: {
    flexDirection: 'row',
  },
  featureCard: {
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    width: 200,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  featureBlur: {
    padding: 16,
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadgeText: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Bold',
    color: '#fff',
  },
  featureName: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-SemiBold',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Regular',
    lineHeight: 16,
    marginBottom: 12,
  },
  operationsContainer: {
    marginTop: 8,
  },
  operationsLabel: {
    fontSize: 10,
    fontFamily: 'NotoSansJP-SemiBold',
    marginBottom: 4,
  },
  operationsList: {
    fontSize: 10,
    fontFamily: 'NotoSansJP-Regular',
  },
  selectedFeatureSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  selectedFeatureCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  selectedFeatureText: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-SemiBold',
  },
  changeFeatureButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  changeFeatureText: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-SemiBold',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginTop: 4,
  },
  messageContent: {
    flex: 1,
    maxWidth: '75%',
  },
  messageBlur: {
    borderRadius: 16,
    padding: 12,
    overflow: 'hidden',
  },
  userMessageBlur: {},
  botMessageBlur: {},
  messageText: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-Regular',
    lineHeight: 22,
  },
  operationData: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  operationLabel: {
    fontSize: 10,
    fontFamily: 'NotoSansJP-SemiBold',
    marginBottom: 2,
  },
  operationDetails: {
    fontSize: 10,
    fontFamily: 'NotoSansJP-Regular',
  },
  messageFooter: {
    marginTop: 4,
  },
  timestamp: {
    fontSize: 10,
    fontFamily: 'NotoSansJP-Regular',
  },
  typingIndicator: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  typingBlur: {
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  typingDots: {
    flexDirection: 'row',
    marginRight: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  typingText: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Regular',
  },
  inputContainer: {
    borderRadius: 12,
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 20,
    marginLeft: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'NotoSansJP-Regular',
    maxHeight: 80,
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 8,
  },
  sendButton:{
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
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