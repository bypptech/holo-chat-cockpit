import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, Bot, User, Smartphone, Settings as SettingsIcon, Shield, Radio, Zap, Globe, MessageCircle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInternetIdentity } from '@/contexts/InternetIdentityContext';
import { useChatDevice } from '@/contexts/ChatDeviceContext';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  operationData?: any;
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
  const { t, currentLanguage } = useLanguage();
  const { isAuthenticated, principal } = useInternetIdentity();
  const { getChatEnabledDevices } = useChatDevice();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // C.C.C. 利用可能機能
  const availableFeatures: AvailableFeature[] = [
    {
      id: 'device-control',
      name: currentLanguage === 'ja' ? 'デバイス制御' : 'Device Control',
      description: currentLanguage === 'ja' ? 'IoTデバイスをシンプルな操作語で制御' : 'Control IoT devices with simple operation words',
      operations: ['power', 'volume', 'temperature', 'mode'],
      examples: [
        currentLanguage === 'ja' ? 'power on' : 'power on',
        currentLanguage === 'ja' ? 'volume 50' : 'volume 50',
        currentLanguage === 'ja' ? 'temperature 25' : 'temperature 25'
      ],
      icon: Smartphone,
      color: '#4CAF50'
    },
    {
      id: 'icp-explorer',
      name: currentLanguage === 'ja' ? 'ICPエクスプローラー' : 'ICP Explorer',
      description: currentLanguage === 'ja' ? 'Internet Computer ネットワーク情報の確認' : 'Check Internet Computer network information',
      operations: ['principal', 'canister', 'network'],
      examples: [
        'principal info',
        'network status',
        'canister info'
      ],
      icon: Globe,
      color: '#2196F3'
    },
    {
      id: 'ar-gacha',
      name: currentLanguage === 'ja' ? 'ARガチャ操作' : 'AR Gacha Control',
      description: currentLanguage === 'ja' ? 'ARガチャマシンの操作と制御' : 'Control AR gacha machine operations',
      operations: ['gacha', 'capsule', 'reward'],
      examples: [
        'gacha start',
        'capsule receive',
        'reward check'
      ],
      icon: SettingsIcon,
      color: '#FF9800'
    }
  ];

  const connectedDevices = getChatEnabledDevices();

  useEffect(() => {
    if (isAuthenticated && principal) {
      setMessages([{
        id: '1',
        content: currentLanguage === 'ja' 
          ? `こんにちは！ 操作語を入力してください\n\nPrincipal ID: ${principal.slice(0, 8)}...${principal.slice(-6)}`
          : `Hello! Please enter operation words\n\nPrincipal ID: ${principal.slice(0, 8)}...${principal.slice(-6)}`,
        isUser: false,
        timestamp: new Date()
      }]);
    } else {
      setMessages([{
        id: '1',
        content: currentLanguage === 'ja' 
          ? 'Internet Identityでログインしてください'
          : 'Please login with Internet Identity',
        isUser: false,
        timestamp: new Date()
      }]);
    }
  }, [isAuthenticated, principal, currentLanguage]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleFeatureSelect = (featureId: string) => {
    setSelectedFeature(featureId);
    const feature = availableFeatures.find(f => f.id === featureId);
    if (feature) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: currentLanguage === 'ja' 
          ? `${feature.name}が選択されました。\n利用可能な操作語: ${feature.operations.join(', ')}\n\n例:\n${feature.examples.map(ex => `• ${ex}`).join('\n')}`
          : `${feature.name} selected.\nAvailable operations: ${feature.operations.join(', ')}\n\nExamples:\n${feature.examples.map(ex => `• ${ex}`).join('\n')}`,
        isUser: false,
        timestamp: new Date()
      }]);
    }
  };

  const processOperationWord = async (input: string): Promise<Message> => {
    const selectedFeatureData = availableFeatures.find(f => f.id === selectedFeature);
    
    if (!selectedFeatureData) {
      return {
        id: Date.now().toString(),
        content: currentLanguage === 'ja' 
          ? '機能を選択してください'
          : 'Please select a feature',
        isUser: false,
        timestamp: new Date()
      };
    }

    // デバイス制御の処理
    if (selectedFeature === 'device-control') {
      if (input.startsWith('power')) {
        const action = input.split(' ')[1] || 'toggle';
        return {
          id: Date.now().toString(),
          content: currentLanguage === 'ja' 
            ? `電源を${action === 'on' ? 'オン' : action === 'off' ? 'オフ' : '切り替え'}しました`
            : `Power ${action === 'on' ? 'turned on' : action === 'off' ? 'turned off' : 'toggled'}`,
          isUser: false,
          timestamp: new Date(),
          operationData: { type: 'power', action, devices: connectedDevices.length }
        };
      }
      
      if (input.startsWith('volume')) {
        const level = input.split(' ')[1] || '50';
        return {
          id: Date.now().toString(),
          content: currentLanguage === 'ja' 
            ? `音量を${level}に設定しました`
            : `Volume set to ${level}`,
          isUser: false,
          timestamp: new Date(),
          operationData: { type: 'volume', level, devices: connectedDevices.length }
        };
      }

      if (input.startsWith('temperature')) {
        const temp = input.split(' ')[1] || '25';
        return {
          id: Date.now().toString(),
          content: currentLanguage === 'ja' 
            ? `温度を${temp}°Cに設定しました`
            : `Temperature set to ${temp}°C`,
          isUser: false,
          timestamp: new Date(),
          operationData: { type: 'temperature', value: temp, devices: connectedDevices.length }
        };
      }
    }

    // ICP Explorer の処理
    if (selectedFeature === 'icp-explorer') {
      if (input.startsWith('principal')) {
        return {
          id: Date.now().toString(),
          content: currentLanguage === 'ja' 
            ? `Principal ID: ${principal}\n\n✅ Internet Identity認証済み\n🌐 ICPネットワーク接続中`
            : `Principal ID: ${principal}\n\n✅ Internet Identity authenticated\n🌐 Connected to ICP network`,
          isUser: false,
          timestamp: new Date(),
          operationData: { type: 'principal', id: principal }
        };
      }

      if (input.startsWith('network')) {
        return {
          id: Date.now().toString(),
          content: currentLanguage === 'ja' 
            ? '🌐 ICPネットワーク状態:\n• ステータス: オンライン\n• レイテンシ: ~200ms\n• ノード数: 接続中'
            : '🌐 ICP Network Status:\n• Status: Online\n• Latency: ~200ms\n• Nodes: Connected',
          isUser: false,
          timestamp: new Date(),
          operationData: { type: 'network', status: 'online' }
        };
      }
    }

    // ARガチャの処理
    if (selectedFeature === 'ar-gacha') {
      if (input.startsWith('gacha')) {
        return {
          id: Date.now().toString(),
          content: currentLanguage === 'ja' 
            ? '🎰 ガチャを開始しました！\n\nESP32に信号を送信中...\n📱 ARカメラでガチャマシンを確認してください'
            : '🎰 Gacha started!\n\nSending signal to ESP32...\n📱 Check gacha machine with AR camera',
          isUser: false,
          timestamp: new Date(),
          operationData: { type: 'gacha', action: 'start', esp32: true }
        };
      }

      if (input.startsWith('capsule')) {
        return {
          id: Date.now().toString(),
          content: currentLanguage === 'ja' 
            ? '🎁 カプセルを受信しました！\n\n✨ レアアイテムが当たりました\n📦 インベントリに追加されました'
            : '🎁 Capsule received!\n\n✨ Rare item obtained\n📦 Added to inventory',
          isUser: false,
          timestamp: new Date(),
          operationData: { type: 'capsule', received: true, item: 'rare' }
        };
      }
    }

    // 認識できない操作語
    return {
      id: Date.now().toString(),
      content: currentLanguage === 'ja' 
        ? `操作語「${input}」は認識できません。\n\n利用可能な操作語:\n${selectedFeatureData.operations.map(op => `• ${op}`).join('\n')}`
        : `Operation word "${input}" not recognized.\n\nAvailable operations:\n${selectedFeatureData.operations.map(op => `• ${op}`).join('\n')}`,
      isUser: false,
      timestamp: new Date()
    };
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
      content: currentLanguage === 'ja' ? '処理中...' : 'Processing...',
      isUser: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      // 操作語の処理
      const responseMessage = await processOperationWord(currentInput);
      
      setMessages(prev => [
        ...prev.slice(0, prev.length - 1),
        responseMessage
      ]);

    } catch (error) {
      console.error('Operation processing error:', error);
      setMessages(prev => [
        ...prev.slice(0, prev.length - 1),
        {
          id: Date.now().toString(),
          content: currentLanguage === 'ja' 
            ? 'エラーが発生しました。もう一度お試しください。'
            : 'An error occurred. Please try again.',
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
                {currentLanguage === 'ja' ? '操作完了' : 'Operation Complete'}
              </Text>
              <Text style={[styles.operationDetails, { color: colors.textSecondary }]}>
                {currentLanguage === 'ja' 
                  ? `種類: ${message.operationData.type}` 
                  : `Type: ${message.operationData.type}`}
              </Text>
            </View>
          )}
          
          <View style={styles.messageFooter}>
            <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </BlurView>
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
          isSelected && { borderColor: feature.color },
          { backgroundColor: colors.surface + '80' }
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
          <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
            {feature.description}
          </Text>
          
          <View style={styles.operationsContainer}>
            <Text style={[styles.operationsLabel, { color: colors.primary }]}>
              {currentLanguage === 'ja' ? '操作語:' : 'Operations:'}
            </Text>
            <Text style={[styles.operationsList, { color: colors.textSecondary }]}>
              {feature.operations.join(', ')}
            </Text>
          </View>
        </BlurView>
      </TouchableOpacity>
    );
  };

  const styles = createStyles(colors, isDark);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? ['#000428', '#004e92'] : ['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: colors.text }]}>C.C.C.</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {currentLanguage === 'ja' 
                ? 'シンプルに繋がる、言葉で操作する、あなたのための対話型オペレーター'
                : 'Chat. Control. Connect. - Your conversational operator'}
            </Text>
          </View>
          
          {/* 認証状態 */}
          <View style={styles.authStatus}>
            {isAuthenticated ? (
              <View style={[styles.authBadge, { backgroundColor: colors.success + '20' }]}>
                <Shield size={12} color={colors.success} />
                <Text style={[styles.authText, { color: colors.success }]}>
                  {currentLanguage === 'ja' ? '認証済み' : 'Authenticated'}
                </Text>
              </View>
            ) : (
              <View style={[styles.authBadge, { backgroundColor: colors.warning + '20' }]}>
                <Shield size={12} color={colors.warning} />
                <Text style={[styles.authText, { color: colors.warning }]}>
                  {currentLanguage === 'ja' ? '未認証' : 'Not Authenticated'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 機能選択エリア */}
        {!selectedFeature && isAuthenticated && (
          <View style={styles.featuresSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {currentLanguage === 'ja' ? '利用する機能をチェックしてください' : 'Please select a feature to use'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuresScroll}>
              {availableFeatures.map(renderFeatureCard)}
            </ScrollView>
          </View>
        )}

        {/* 選択された機能の表示 */}
        {selectedFeature && (
          <View style={styles.selectedFeatureSection}>
            <View style={[styles.selectedFeatureCard, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.selectedFeatureText, { color: colors.primary }]}>
                {currentLanguage === 'ja' ? '選択中の機能: ' : 'Selected Feature: '}
                {availableFeatures.find(f => f.id === selectedFeature)?.name}
              </Text>
              <TouchableOpacity 
                style={styles.changeFeatureButton}
                onPress={() => setSelectedFeature(null)}
              >
                <Text style={[styles.changeFeatureText, { color: colors.primary }]}>
                  {currentLanguage === 'ja' ? '変更' : 'Change'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* チャットエリア */}
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
                    {currentLanguage === 'ja' ? '処理中...' : 'Processing...'}
                  </Text>
                </BlurView>
              </View>
            )}
          </ScrollView>

          {/* 入力エリア */}
          <BlurView intensity={isDark ? 90 : 70} tint={isDark ? "dark" : "light"} style={styles.inputContainer}>
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              value={inputText}
              onChangeText={setInputText}
              placeholder={currentLanguage === 'ja' ? '操作語を入力...' : 'Enter operation word...'}
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
    borderWidth: 2,
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
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 20,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'NotoSansJP-Regular',
    maxHeight: 80,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});