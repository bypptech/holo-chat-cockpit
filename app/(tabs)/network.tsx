import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Wifi, 
  WifiOff, 
  Bluetooth, 
  Globe, 
  Shield, 
  Signal, 
  RefreshCw, 
  Settings as SettingsIcon, 
  Activity, 
  Zap, 
  CircleCheck as CheckCircle, 
  Circle as XCircle, 
  TriangleAlert as AlertTriangle,
  Router,
  Server,
  Cloud,
  User,
  LogOut,
  Copy,
  X,
  ChevronRight
} from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface NetworkSettings {
  wifi: boolean;
  bluetooth: boolean;
  websocket: boolean;
  autoConnect: boolean;
}

interface ICPSession {
  principal: string;
  expiresAt: Date;
  network: 'local' | 'testnet' | 'ic';
}

interface NetworkStatus {
  wifi: {
    connected: boolean;
    ssid: string;
    strength: number;
    speed: string;
  };
  blockchain: {
    connected: boolean;
    network: string;
    latency: number;
  };
  bluetooth: {
    connected: boolean;
    devices: number;
  };
  websocket: {
    status: 'connected' | 'disconnected' | 'connecting';
    uptime: string;
    reconnects: number;
  };
}

export default function NetworkScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  
  const [networkSettings, setNetworkSettings] = useState<NetworkSettings>({
    wifi: true,
    bluetooth: true,
    websocket: true,
    autoConnect: true,
  });

  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    wifi: {
      connected: true,
      ssid: 'MyNetwork-5G',
      strength: 85,
      speed: '150 Mbps'
    },
    blockchain: {
      connected: true,
      network: 'Local',
      latency: 125
    },
    bluetooth: {
      connected: true,
      devices: 3
    },
    websocket: {
      status: 'connected',
      uptime: '99.9%',
      reconnects: 0
    }
  });

  // ICP Connection State
  const [currentSession, setCurrentSession] = useState<ICPSession | null>({
    principal: 'rdmx6-jaaaa-aaaah-qcaaa-cai-1234567890',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    network: 'local'
  });
  const [selectedNetwork, setSelectedNetwork] = useState<'local' | 'testnet' | 'ic'>('local');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCanisterModal, setShowCanisterModal] = useState(false);
  const [canisterIds, setCanisterIds] = useState({
    backend: 'rdmx6-jaaaa-aaaah-qcaaa-cai',
    frontend: 'rrkah-fqaaa-aaaah-qcuwa-cai'
  });

  useEffect(() => {
    updateNetworkStatus();
    const interval = setInterval(updateNetworkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const updateNetworkStatus = async () => {
    // Simulate network status updates
    setNetworkStatus(prev => ({
      ...prev,
      wifi: {
        ...prev.wifi,
        connected: navigator.onLine && networkSettings.wifi,
        strength: 80 + Math.random() * 20
      },
      bluetooth: {
        ...prev.bluetooth,
        connected: networkSettings.bluetooth
      },
      websocket: {
        ...prev.websocket,
        status: networkSettings.websocket ? 'connected' : 'disconnected'
      }
    }));
  };

  const toggleSetting = (key: keyof NetworkSettings) => {
    const newValue = !networkSettings[key];
    setNetworkSettings(prev => ({ ...prev, [key]: newValue }));
    
    // Show feedback to user
    const settingNames = {
      wifi: 'WiFi',
      bluetooth: 'Bluetooth',
      websocket: 'WebSocket',
      autoConnect: 'Auto Connect'
    };
    
    Alert.alert(
      'Network Setting Updated',
      `${settingNames[key]} has been ${newValue ? 'enabled' : 'disabled'}`,
      [{ text: 'OK' }]
    );

    // Update network status immediately
    setTimeout(updateNetworkStatus, 100);
  };

  const getStatusColor = (status: string | boolean) => {
    if (typeof status === 'boolean') {
      return status ? colors.success : colors.error;
    }
    switch (status) {
      case 'connected': return colors.success;
      case 'disconnected': return colors.error;
      case 'connecting': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  const handleICPConnect = () => {
    setShowLoginModal(true);
  };

  const handleICPLogin = async (network: 'local' | 'testnet' | 'ic') => {
    // Simulate authentication
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockPrincipal = `rdmx6-jaaaa-aaaah-qcaaa-cai-${Date.now()}`;
    const session: ICPSession = {
      principal: mockPrincipal,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      network
    };
    
    setCurrentSession(session);
    setSelectedNetwork(network);
    setNetworkStatus(prev => ({
      ...prev,
      blockchain: {
        ...prev.blockchain,
        connected: true,
        network: network === 'local' ? 'Local' : network === 'ic' ? 'Mainnet' : 'Testnet'
      }
    }));
    setShowLoginModal(false);
    Alert.alert(t('network:alerts.connected'), t('network:alerts.connectedMessage', { network }));
  };

  const handleICPLogout = () => {
    Alert.alert(
      t('network:alerts.logout'),
      t('network:alerts.logoutMessage'),
      [
        { text: t('common:cancel'), style: 'cancel' },
        {
          text: t('controls:authentication.logout'),
          style: 'destructive',
          onPress: () => {
            setCurrentSession(null);
            setNetworkStatus(prev => ({
              ...prev,
              blockchain: {
                ...prev.blockchain,
                connected: false
              }
            }));
          }
        }
      ]
    );
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      Alert.alert(t('network:alerts.copied'), t('network:alerts.copiedMessage'));
    }
  };

  // Render setting button using the same design as Settings tab
  const renderSettingButton = (item: any) => {
    const IconComponent = item.icon;
    
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
          <View style={[styles.settingIcon, { backgroundColor: colors.primary + '20' }]}>
            <IconComponent size={20} color={colors.primary} />
          </View>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>
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

  const styles = createStyles(colors, isDark);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={isDark ? ['#000428', '#004e92'] : ['#667eea', '#764ba2']} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t('navigation:screens.networkCenter')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('network:subtitle')}</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Network Status Panels */}
          <View style={styles.statusSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('network:networkStatus')}</Text>
            <View style={styles.statusGrid}>
              {/* WiFi Panel */}
              <BlurView intensity={isDark ? 80 : 60} tint={isDark ? "dark" : "light"} style={styles.statusPanel}>
                <View style={[styles.statusIcon, { backgroundColor: getStatusColor(networkStatus.wifi.connected) + '20' }]}>
                  {networkStatus.wifi.connected ? (
                    <Wifi size={24} color={getStatusColor(networkStatus.wifi.connected)} />
                  ) : (
                    <WifiOff size={24} color={getStatusColor(networkStatus.wifi.connected)} />
                  )}
                </View>
                <Text style={[styles.statusTitle, { color: colors.text }]}>{t('network:wifi')}</Text>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(networkStatus.wifi.connected) }]} />
                {networkStatus.wifi.connected && (
                  <Text style={[styles.statusDetail, { color: colors.textSecondary }]}>
                    {Math.round(networkStatus.wifi.strength)}%
                  </Text>
                )}
              </BlurView>

              {/* Blockchain Panel */}
              <BlurView intensity={isDark ? 80 : 60} tint={isDark ? "dark" : "light"} style={styles.statusPanel}>
                <View style={[styles.statusIcon, { backgroundColor: getStatusColor(networkStatus.blockchain.connected) + '20' }]}>
                  <Cloud size={24} color={getStatusColor(networkStatus.blockchain.connected)} />
                </View>
                <Text style={[styles.statusTitle, { color: colors.text }]}>{t('network:blockchain')}</Text>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(networkStatus.blockchain.connected) }]} />
                {networkStatus.blockchain.connected && (
                  <Text style={[styles.statusDetail, { color: colors.textSecondary }]}>
                    {networkStatus.blockchain.network}
                  </Text>
                )}
              </BlurView>

              {/* Bluetooth Panel */}
              <BlurView intensity={isDark ? 80 : 60} tint={isDark ? "dark" : "light"} style={styles.statusPanel}>
                <View style={[styles.statusIcon, { backgroundColor: getStatusColor(networkStatus.bluetooth.connected) + '20' }]}>
                  <Bluetooth size={24} color={getStatusColor(networkStatus.bluetooth.connected)} />
                </View>
                <Text style={[styles.statusTitle, { color: colors.text }]}>{t('network:bluetooth')}</Text>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(networkStatus.bluetooth.connected) }]} />
                {networkStatus.bluetooth.connected && (
                  <Text style={[styles.statusDetail, { color: colors.textSecondary }]}>
                    {networkStatus.bluetooth.devices} devices
                  </Text>
                )}
              </BlurView>

              {/* WebSocket Panel */}
              <BlurView intensity={isDark ? 80 : 60} tint={isDark ? "dark" : "light"} style={styles.statusPanel}>
                <View style={[styles.statusIcon, { backgroundColor: getStatusColor(networkStatus.websocket.status) + '20' }]}>
                  <Zap size={24} color={getStatusColor(networkStatus.websocket.status)} />
                </View>
                <Text style={[styles.statusTitle, { color: colors.text }]}>{t('network:webSocket')}</Text>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(networkStatus.websocket.status) }]} />
                <Text style={[styles.statusDetail, { color: colors.textSecondary }]}>
                  {networkStatus.websocket.uptime}
                </Text>
              </BlurView>
            </View>
          </View>

          {/* Blockchain Connection Management */}
          <View style={styles.blockchainSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('network:blockchainConnection')}</Text>
            
            {/* ICP Connection */}
            <BlurView intensity={isDark ? 80 : 60} tint={isDark ? "dark" : "light"} style={styles.blockchainCard}>
              <View style={styles.blockchainHeader}>
                <Text style={[styles.blockchainTitle, { color: colors.text }]}>Internet Computer</Text>
                <View style={[styles.protocolBadge, { backgroundColor: '#8B5CF6' + '20' }]}>
                  <Text style={[styles.protocolBadgeText, { color: '#8B5CF6' }]}>ICP</Text>
                </View>
              </View>
              
              {currentSession ? (
                <>
                  {/* Connected State */}
                  <View style={styles.connectedHeader}>
                    <View style={styles.connectedIndicator}>
                      <View style={[styles.connectedDot, { backgroundColor: colors.success }]} />
                      <Text style={[styles.connectedText, { color: colors.text }]}>{t('network:icpConnected')}</Text>
                    </View>
                    <Text style={[styles.networkBadge, { backgroundColor: colors.primary + '20', color: colors.primary }]}>
                      {currentSession.network === 'local' ? t('network:networks.local') :
                       currentSession.network === 'ic' ? t('network:networks.mainnet') : t('network:networks.testnet')}
                    </Text>
                  </View>

                  <View style={styles.principalContainer}>
                    <User size={16} color={colors.textSecondary} />
                    <Text style={[styles.principalText, { color: colors.textSecondary }]}>
                      {currentSession.principal.slice(0, 20)}...
                    </Text>
                    <TouchableOpacity onPress={() => copyToClipboard(currentSession.principal)}>
                      <Copy size={16} color={colors.primary} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.blockchainActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: colors.primary }]}
                      onPress={() => setShowLoginModal(true)}
                    >
                      <Globe size={16} color="#fff" />
                      <Text style={styles.actionButtonText}>{t('network:switchNetwork')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: colors.secondary }]}
                      onPress={() => setShowCanisterModal(true)}
                    >
                      <Server size={16} color="#fff" />
                      <Text style={styles.actionButtonText}>{t('network:canisterIds')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: colors.error }]}
                      onPress={handleICPLogout}
                    >
                      <LogOut size={16} color="#fff" />
                      <Text style={styles.actionButtonText}>{t('controls:authentication.logout')}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  {/* Disconnected State */}
                  <View style={styles.disconnectedContainer}>
                    <Cloud size={48} color={colors.textSecondary} />
                    <Text style={[styles.disconnectedTitle, { color: colors.text }]}>{t('network:connectToIcp')}</Text>
                    <Text style={[styles.disconnectedSubtitle, { color: colors.textSecondary }]}>
                      {t('network:connectToIcpSubtitle')}
                    </Text>
                  </View>

                  <TouchableOpacity 
                    style={[styles.connectButton, { backgroundColor: colors.primary }]}
                    onPress={handleICPConnect}
                  >
                    <Shield size={20} color="#fff" />
                    <Text style={styles.connectButtonText}>{t('network:connectWithInternetIdentity')}</Text>
                  </TouchableOpacity>
                </>
              )}
            </BlurView>

          </View>

          {/* Network Settings - Using Setting Button Design */}
          <View style={styles.settingsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('network:networkSettings')}</Text>
            <View style={styles.sectionContent}>
              {[
                {
                  icon: Wifi,
                  title: t('network:settings.wifi.title'),
                  subtitle: t('network:settings.wifi.subtitle'),
                  type: 'switch',
                  key: 'wifi',
                  value: networkSettings.wifi,
                },
                {
                  icon: Bluetooth,
                  title: t('network:settings.bluetooth.title'),
                  subtitle: t('network:settings.bluetooth.subtitle'),
                  type: 'switch',
                  key: 'bluetooth',
                  value: networkSettings.bluetooth,
                },
                {
                  icon: Zap,
                  title: t('network:settings.webSocket.title'),
                  subtitle: t('network:settings.webSocket.subtitle'),
                  type: 'switch',
                  key: 'websocket',
                  value: networkSettings.websocket,
                },
                {
                  icon: RefreshCw,
                  title: t('network:settings.autoConnect.title'),
                  subtitle: t('network:settings.autoConnect.subtitle'),
                  type: 'switch',
                  key: 'autoConnect',
                  value: networkSettings.autoConnect,
                },
              ].map(renderSettingButton)}
            </View>
          </View>

          {/* Network Performance */}
          <View style={styles.performanceSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('network:networkPerformance')}</Text>
            <BlurView intensity={isDark ? 80 : 60} tint={isDark ? "dark" : "light"} style={styles.performanceCard}>
              <View style={styles.performanceGrid}>
                <View style={styles.performanceItem}>
                  <Text style={[styles.performanceNumber, { color: colors.primary }]}>
                    {Math.round(networkStatus.wifi.strength)}%
                  </Text>
                  <Text style={[styles.performanceLabel, { color: colors.textSecondary }]}>{t('network:wifiSignal')}</Text>
                </View>
                <View style={styles.performanceItem}>
                  <Text style={[styles.performanceNumber, { color: colors.primary }]}>
                    {networkStatus.blockchain.latency}ms
                  </Text>
                  <Text style={[styles.performanceLabel, { color: colors.textSecondary }]}>{t('network:latency')}</Text>
                </View>
                <View style={styles.performanceItem}>
                  <Text style={[styles.performanceNumber, { color: colors.primary }]}>
                    {networkStatus.websocket.uptime}
                  </Text>
                  <Text style={[styles.performanceLabel, { color: colors.textSecondary }]}>{t('network:uptime')}</Text>
                </View>
              </View>
            </BlurView>
          </View>
        </ScrollView>

        {/* ICP Login Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showLoginModal}
          onRequestClose={() => setShowLoginModal(false)}
        >
          <View style={styles.modalOverlay}>
            <BlurView intensity={90} tint={isDark ? "dark" : "light"} style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{t('network:connectToIcp')}</Text>
                <TouchableOpacity onPress={() => setShowLoginModal(false)}>
                  <X size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.networkOptions}>
                {[
                  { value: 'local' as const, label: t('network:networks.local'), color: colors.warning },
                  { value: 'testnet' as const, label: t('network:networks.testnet'), color: colors.primary },
                  { value: 'ic' as const, label: t('network:networks.mainnet'), color: colors.success }
                ].map((network) => (
                  <TouchableOpacity
                    key={network.value}
                    style={[styles.networkOption, { borderColor: network.color }]}
                    onPress={() => handleICPLogin(network.value)}
                  >
                    <Globe size={20} color={network.color} />
                    <Text style={[styles.networkOptionText, { color: colors.text }]}>{network.label}</Text>
                    <ChevronRight size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            </BlurView>
          </View>
        </Modal>

        {/* Canister ID Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showCanisterModal}
          onRequestClose={() => setShowCanisterModal(false)}
        >
          <View style={styles.modalOverlay}>
            <BlurView intensity={90} tint={isDark ? "dark" : "light"} style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{t('network:canisterIds')}</Text>
                <TouchableOpacity onPress={() => setShowCanisterModal(false)}>
                  <X size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.canisterList}>
                <View style={styles.canisterItem}>
                  <Text style={[styles.canisterLabel, { color: colors.textSecondary }]}>{t('network:backendCanister')}</Text>
                  <View style={styles.canisterRow}>
                    <Text style={[styles.canisterId, { color: colors.text }]}>{canisterIds.backend}</Text>
                    <TouchableOpacity onPress={() => copyToClipboard(canisterIds.backend)}>
                      <Copy size={16} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.canisterItem}>
                  <Text style={[styles.canisterLabel, { color: colors.textSecondary }]}>{t('network:frontendCanister')}</Text>
                  <View style={styles.canisterRow}>
                    <Text style={[styles.canisterId, { color: colors.text }]}>{canisterIds.frontend}</Text>
                    <TouchableOpacity onPress={() => copyToClipboard(canisterIds.frontend)}>
                      <Copy size={16} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </BlurView>
          </View>
        </Modal>
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
  title: {
    fontSize: 32,
    fontFamily: 'NotoSansJP-Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-Regular',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'NotoSansJP-SemiBold',
    marginBottom: 16,
  },
  
  // Network Status Panels
  statusSection: {
    marginBottom: 24,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusPanel: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    overflow: 'hidden',
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-SemiBold',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusDetail: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Regular',
  },

  // Blockchain Connection
  blockchainSection: {
    marginBottom: 24,
  },
  blockchainCard: {
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  blockchainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  blockchainTitle: {
    fontSize: 18,
    fontFamily: 'NotoSansJP-SemiBold',
  },
  protocolBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  protocolBadgeText: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Bold',
  },
  connectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  connectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  connectedText: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-SemiBold',
  },
  networkBadge: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Medium',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  principalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  principalText: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Regular',
    flex: 1,
  },
  blockchainActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-SemiBold',
    color: '#fff',
  },
  disconnectedContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  disconnectedTitle: {
    fontSize: 18,
    fontFamily: 'NotoSansJP-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  disconnectedSubtitle: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Regular',
    textAlign: 'center',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  connectButtonText: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-SemiBold',
    color: '#fff',
  },

  // Settings Section - Using Setting Button Design
  settingsSection: {
    marginBottom: 24,
  },
  sectionContent: {
    gap: 4, // Same tight spacing as Settings tab
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 72, // Fixed height for all buttons
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-SemiBold',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    fontFamily: 'NotoSansJP-Regular',
    lineHeight: 18,
  },
  settingRight: {
    marginLeft: 16,
  },

  // Performance
  performanceSection: {
    marginBottom: 32,
  },
  performanceCard: {
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  performanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  performanceItem: {
    alignItems: 'center',
  },
  performanceNumber: {
    fontSize: 24,
    fontFamily: 'NotoSansJP-Bold',
    marginBottom: 4,
  },
  performanceLabel: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Regular',
    textAlign: 'center',
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    borderRadius: 20,
    padding: 0,
    marginHorizontal: 20,
    maxWidth: 400,
    width: '100%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'NotoSansJP-Bold',
  },
  networkOptions: {
    padding: 20,
    gap: 12,
  },
  networkOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  networkOptionText: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-Medium',
    flex: 1,
  },
  canisterList: {
    padding: 20,
    gap: 16,
  },
  canisterItem: {
    gap: 8,
  },
  canisterLabel: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Medium',
  },
  canisterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  canisterId: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Regular',
    flex: 1,
  },
});