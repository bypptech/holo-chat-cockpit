import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Switch, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Play, 
  Chrome as Home, 
  Settings as SettingsIcon, 
  Plus, 
  CreditCard as Edit3, 
  Trash2, 
  Wifi, 
  WifiOff, 
  Bluetooth, 
  Radio, 
  Smartphone, 
  Monitor, 
  Speaker, 
  Lightbulb, 
  RefreshCw, 
  Activity, 
  Signal, 
  Battery, 
  Zap, 
  TestTube, 
  Gauge, 
  Power, 
  Volume2, 
  Thermometer, 
  X, 
  CircleCheck as CheckCircle, 
  TriangleAlert as AlertTriangle, 
  Target, 
  Cpu, 
  HardDrive, 
  Wrench,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  MessageCircle,
  Gamepad2
} from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useChatDevice } from '@/contexts/ChatDeviceContext';

interface DeviceInfo {
  id: string;
  name: string;
  type: 'wifi' | 'bluetooth' | 'zigbee' | 'matter';
  status: 'connected' | 'disconnected' | 'pairing';
  signalStrength: number;
  lastSeen: Date;
  metadata?: Record<string, any>;
  category: 'media' | 'smart-home' | 'industrial';
  // Enhanced device data
  performance?: {
    cpuUsage: number;
    memoryUsage: number;
    networkSpeed: number;
    temperature: number;
    status: 'optimal' | 'warning' | 'critical';
  };
  powerState?: {
    isOn: boolean;
    powerConsumption: number;
    canControl: boolean;
  };
  capabilities?: string[];
}

interface SignalTestResult {
  deviceId: string;
  deviceName: string;
  pingTime: number;
  signalStrength: number;
  packetLoss: number;
  status: 'excellent' | 'good' | 'poor' | 'failed';
}

export default function DevicesScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));
  const { 
    chatEnabledDevices, 
    updateDeviceChatStatus, 
    updateDeviceControllerStatus,
    isChatEnabled, 
    isControllerEnabled 
  } = useChatDevice();
  
  const [devices, setDevices] = useState<DeviceInfo[]>([
    {
      id: '1',
      name: 'Living Room TV',
      type: 'wifi',
      category: 'media',
      status: 'connected',
      signalStrength: 85,
      lastSeen: new Date(),
      metadata: {
        ipAddress: '192.168.1.100',
        macAddress: 'AA:BB:CC:DD:EE:01'
      },
      powerState: {
        isOn: true,
        powerConsumption: 120,
        canControl: true
      },
      capabilities: ['power', 'volume', 'channel']
    },
    {
      id: '2',
      name: 'Smart Thermostat',
      type: 'zigbee',
      category: 'smart-home',
      status: 'connected',
      signalStrength: 92,
      lastSeen: new Date(),
      metadata: {
        macAddress: 'BB:CC:DD:EE:FF:02'
      },
      powerState: {
        isOn: true,
        powerConsumption: 15,
        canControl: true
      },
      capabilities: ['power', 'temperature']
    },
    {
      id: '3',
      name: 'ESP32 Gacha Controller',
      type: 'wifi',
      category: 'industrial',
      status: 'connected',
      signalStrength: 78,
      lastSeen: new Date(),
      metadata: {
        ipAddress: '192.168.1.105',
        version: '1.0.0'
      },
      performance: {
        cpuUsage: 45,
        memoryUsage: 62,
        networkSpeed: 85,
        temperature: 42,
        status: 'optimal'
      },
      powerState: {
        isOn: true,
        powerConsumption: 8,
        canControl: true
      },
      capabilities: ['gacha', 'status', 'reset']
    },
    {
      id: '4',
      name: 'Kitchen Speaker',
      type: 'bluetooth',
      category: 'media',
      status: 'disconnected',
      signalStrength: 45,
      lastSeen: new Date(Date.now() - 3600000),
      powerState: {
        isOn: false,
        powerConsumption: 0,
        canControl: false
      },
      capabilities: ['power', 'volume', 'play']
    },
    {
      id: '5',
      name: 'Industrial Panel A',
      type: 'wifi',
      category: 'industrial',
      status: 'connected',
      signalStrength: 88,
      lastSeen: new Date(),
      metadata: {
        ipAddress: '192.168.1.110'
      },
      performance: {
        cpuUsage: 78,
        memoryUsage: 85,
        networkSpeed: 95,
        temperature: 58,
        status: 'warning'
      },
      powerState: {
        isOn: true,
        powerConsumption: 250,
        canControl: true
      },
      capabilities: ['power', 'status', 'emergency_stop']
    }
  ]);

  const [isScanning, setIsScanning] = useState(false);
  const [showSignalTest, setShowSignalTest] = useState(false);
  const [signalTestResults, setSignalTestResults] = useState<SignalTestResult[]>([]);
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);
  const [selectedDeviceForSettings, setSelectedDeviceForSettings] = useState<DeviceInfo | null>(null);
  const [expandedDevices, setExpandedDevices] = useState<Set<string>>(new Set());

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const isTablet = screenDimensions.width >= 768;
  const isSmallScreen = screenDimensions.width < 480;

  const scanForDevices = async () => {
    setIsScanning(true);
    try {
      // Simulate device scanning
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate finding new devices
      const newDevice: DeviceInfo = {
        id: `device_${Date.now()}`,
        name: 'New Smart Light',
        type: 'zigbee',
        category: 'smart-home',
        status: 'pairing',
        signalStrength: 75,
        lastSeen: new Date(),
        powerState: {
          isOn: false,
          powerConsumption: 0,
          canControl: true
        },
        capabilities: ['power', 'brightness']
      };
      
      setDevices(prev => [...prev, newDevice]);
      Alert.alert(t('devices:alerts.scanComplete'), `Found new device: ${newDevice.name}`);
    } catch (error) {
      Alert.alert(t('devices:alerts.scanError'), t('devices:alerts.scanErrorMessage'));
    } finally {
      setIsScanning(false);
    }
  };

  const runSignalTest = async () => {
    setShowSignalTest(true);
    setSignalTestResults([]);
    
    const connectedDevices = devices.filter(d => d.status === 'connected');
    
    if (connectedDevices.length === 0) {
      Alert.alert('No Connected Devices', 'No devices are currently connected for signal testing.');
      setShowSignalTest(false);
      return;
    }
    
    for (const device of connectedDevices) {
      // Simulate signal testing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const pingTime = 10 + Math.random() * 100;
      const signalStrength = device.signalStrength + (Math.random() - 0.5) * 10;
      const packetLoss = Math.random() * 5;
      
      let status: SignalTestResult['status'] = 'excellent';
      if (pingTime > 50 || signalStrength < 70 || packetLoss > 2) status = 'good';
      if (pingTime > 100 || signalStrength < 50 || packetLoss > 3) status = 'poor';
      if (signalStrength < 30 || packetLoss > 4) status = 'failed';
      
      const result: SignalTestResult = {
        deviceId: device.id,
        deviceName: device.name,
        pingTime: Math.round(pingTime),
        signalStrength: Math.round(signalStrength),
        packetLoss: Math.round(packetLoss * 10) / 10,
        status
      };
      
      setSignalTestResults(prev => [...prev, result]);
    }
  };

  const toggleDeviceExpansion = (deviceId: string) => {
    setExpandedDevices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(deviceId)) {
        newSet.delete(deviceId);
      } else {
        newSet.add(deviceId);
      }
      return newSet;
    });
  };

  const toggleChatEnabled = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    const newChatEnabled = !isChatEnabled(deviceId);
    updateDeviceChatStatus(deviceId, newChatEnabled);
    
    // Show feedback to user
    Alert.alert(
      t('devices:chatIntegration.title'),
      `${device.name} has been ${newChatEnabled ? 'added to' : 'removed from'} chat control.`,
      [{ text: 'OK' }]
    );
  };

  const toggleControllerEnabled = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    const newControllerEnabled = !isControllerEnabled(deviceId);
    updateDeviceControllerStatus(deviceId, newControllerEnabled);
    
    // Show feedback to user
    Alert.alert(
      'Controller Integration',
      `${device.name} has been ${newControllerEnabled ? 'added to' : 'removed from'} controller display.`,
      [{ text: 'OK' }]
    );
  };

  const handleDeviceAction = (device: DeviceInfo, action: string) => {
    switch (action) {
      case 'power_toggle':
        setDevices(prev => prev.map(d => 
          d.id === device.id 
            ? { 
                ...d, 
                powerState: { 
                  ...d.powerState!, 
                  isOn: !d.powerState!.isOn,
                  powerConsumption: !d.powerState!.isOn ? (d.powerState!.powerConsumption || 50) : 0
                } 
              }
            : d
        ));
        Alert.alert('Power Control', `${device.name} has been turned ${device.powerState?.isOn ? 'off' : 'on'}`);
        break;
      case 'gacha_start':
        Alert.alert('Gacha Control', `Starting gacha operation on ${device.name}`);
        break;
      case 'emergency_stop':
        Alert.alert('Emergency Stop', `Emergency stop activated on ${device.name}`, [
          { text: 'OK', style: 'destructive' }
        ]);
        break;
      default:
        Alert.alert('Device Action', `Executed ${action} on ${device.name}`);
    }
  };

  const openDeviceSettings = (device: DeviceInfo) => {
    setSelectedDeviceForSettings(device);
    setShowDeviceSettings(true);
  };

  const getDeviceIcon = (type: string, category: string) => {
    if (category === 'media') {
      return type === 'bluetooth' ? Speaker : Monitor;
    } else if (category === 'smart-home') {
      return type === 'zigbee' ? Lightbulb : Home;
    } else if (category === 'industrial') {
      return SettingsIcon;
    }
    return Smartphone;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'wifi': return Wifi;
      case 'bluetooth': return Bluetooth;
      case 'zigbee': return Radio;
      default: return Zap;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return colors.success;
      case 'disconnected': return colors.error;
      case 'pairing': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'media': return colors.primary;
      case 'smart-home': return colors.success;
      case 'industrial': return colors.accent;
      default: return colors.secondary;
    }
  };

  const getPerformanceStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return colors.success;
      case 'warning': return colors.warning;
      case 'critical': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const renderDeviceControls = (device: DeviceInfo) => {
    const isExpanded = expandedDevices.has(device.id);
    
    return (
      <View style={styles.deviceControls}>
        {/* Chat Integration Toggle */}
        <View style={styles.controlSection}>
          <Text style={[styles.controlSectionTitle, { color: colors.text }]}>{t('devices:chatIntegration.title')}</Text>
          <View style={styles.chatToggleRow}>
            <View style={styles.chatToggleInfo}>
              <MessageCircle size={16} color={isChatEnabled(device.id) ? colors.primary : colors.textSecondary} />
              <Text style={[styles.chatToggleLabel, { color: colors.text }]}>
                {t('devices:chatIntegration.enable')}
              </Text>
              <Text style={[styles.chatToggleDescription, { color: colors.textSecondary }]}>
                {isChatEnabled(device.id) ? t('devices:chatIntegration.enabled') : t('devices:chatIntegration.disabled')}
              </Text>
            </View>
            
            <Switch
              value={isChatEnabled(device.id)}
              onValueChange={() => toggleChatEnabled(device.id)}
              trackColor={{ false: '#E5E7EB', true: '#E5E7EB' }}
              thumbColor={isChatEnabled(device.id) ? '#00FF88' : '#fff'}
              disabled={device.status !== 'connected'}
            />
          </View>
        </View>

        {/* Controller Integration Toggle - NEW */}
        <View style={styles.controlSection}>
          <Text style={[styles.controlSectionTitle, { color: colors.text }]}>Controller Integration</Text>
          <View style={styles.chatToggleRow}>
            <View style={styles.chatToggleInfo}>
              <Gamepad2 size={16} color={isControllerEnabled(device.id) ? colors.accent : colors.textSecondary} />
              <Text style={[styles.chatToggleLabel, { color: colors.text }]}>
                Enable Controller Display
              </Text>
              <Text style={[styles.chatToggleDescription, { color: colors.textSecondary }]}>
                {isControllerEnabled(device.id) ? 'Device available in controller' : 'Device not available in controller'}
              </Text>
            </View>
            
            <Switch
              value={isControllerEnabled(device.id)}
              onValueChange={() => toggleControllerEnabled(device.id)}
              trackColor={{ false: '#E5E7EB', true: '#E5E7EB' }}
              thumbColor={isControllerEnabled(device.id) ? '#FF6B35' : '#fff'}
              disabled={device.status !== 'connected'}
            />
          </View>
        </View>

        {/* Power Control for all devices with power capability */}
        {device.capabilities?.includes('power') && device.powerState && (
          <View style={styles.controlSection}>
            <Text style={[styles.controlSectionTitle, { color: colors.text }]}>Power Control</Text>
            <View style={styles.powerControlRow}>
              <View style={styles.powerInfo}>
                <Power size={16} color={device.powerState.isOn ? colors.success : colors.textSecondary} />
                <Text style={[styles.powerStatus, { color: colors.text }]}>
                  {device.powerState.isOn ? 'ON' : 'OFF'}
                </Text>
                {device.powerState.isOn && (
                  <Text style={[styles.powerConsumption, { color: colors.textSecondary }]}>
                    {device.powerState.powerConsumption}W
                  </Text>
                )}
              </View>
              
              {device.powerState.canControl && device.status === 'connected' && (
                <TouchableOpacity
                  style={[
                    styles.powerButton,
                    { backgroundColor: device.powerState.isOn ? colors.error : colors.success }
                  ]}
                  onPress={() => handleDeviceAction(device, 'power_toggle')}
                >
                  <Text style={styles.powerButtonText}>
                    {device.powerState.isOn ? 'Turn Off' : 'Turn On'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Performance Monitor for Industrial Devices */}
        {device.category === 'industrial' && device.performance && (
          <View style={styles.controlSection}>
            <Text style={[styles.controlSectionTitle, { color: colors.text }]}>Performance Monitor</Text>
            <View style={styles.performanceGrid}>
              <View style={styles.performanceItem}>
                <Cpu size={16} color={colors.primary} />
                <Text style={[styles.performanceLabel, { color: colors.textSecondary }]}>CPU</Text>
                <Text style={[styles.performanceValue, { color: colors.text }]}>{device.performance.cpuUsage}%</Text>
                <View style={[styles.performanceBar, { backgroundColor: colors.border }]}>
                  <View 
                    style={[
                      styles.performanceBarFill, 
                      { 
                        width: `${device.performance.cpuUsage}%`,
                        backgroundColor: device.performance.cpuUsage > 80 ? colors.error : colors.primary
                      }
                    ]} 
                  />
                </View>
              </View>
              
              <View style={styles.performanceItem}>
                <HardDrive size={16} color={colors.secondary} />
                <Text style={[styles.performanceLabel, { color: colors.textSecondary }]}>Memory</Text>
                <Text style={[styles.performanceValue, { color: colors.text }]}>{device.performance.memoryUsage}%</Text>
                <View style={[styles.performanceBar, { backgroundColor: colors.border }]}>
                  <View 
                    style={[
                      styles.performanceBarFill, 
                      { 
                        width: `${device.performance.memoryUsage}%`,
                        backgroundColor: device.performance.memoryUsage > 90 ? colors.error : colors.secondary
                      }
                    ]} 
                  />
                </View>
              </View>
              
              <View style={styles.performanceItem}>
                <Thermometer size={16} color={colors.warning} />
                <Text style={[styles.performanceLabel, { color: colors.textSecondary }]}>Temp</Text>
                <Text style={[styles.performanceValue, { color: colors.text }]}>{device.performance.temperature}°C</Text>
                <View style={[styles.performanceBar, { backgroundColor: colors.border }]}>
                  <View 
                    style={[
                      styles.performanceBarFill, 
                      { 
                        width: `${Math.min(device.performance.temperature, 100)}%`,
                        backgroundColor: device.performance.temperature > 60 ? colors.error : colors.warning
                      }
                    ]} 
                  />
                </View>
              </View>
              
              <View style={styles.performanceItem}>
                <Wifi size={16} color={colors.success} />
                <Text style={[styles.performanceLabel, { color: colors.textSecondary }]}>Network</Text>
                <Text style={[styles.performanceValue, { color: colors.text }]}>{device.performance.networkSpeed} Mbps</Text>
                <View style={[styles.performanceBar, { backgroundColor: colors.border }]}>
                  <View 
                    style={[
                      styles.performanceBarFill, 
                      { 
                        width: `${Math.min(device.performance.networkSpeed, 100)}%`,
                        backgroundColor: colors.success
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>
            
            <View style={[
              styles.performanceStatus, 
              { backgroundColor: getPerformanceStatusColor(device.performance.status) + '20' }
            ]}>
              <Text style={[
                styles.performanceStatusText, 
                { color: getPerformanceStatusColor(device.performance.status) }
              ]}>
                Status: {device.performance.status.toUpperCase()}
              </Text>
            </View>
          </View>
        )}

        {/* Device-specific Actions */}
        {device.capabilities && device.capabilities.length > 0 && (
          <View style={styles.controlSection}>
            <Text style={[styles.controlSectionTitle, { color: colors.text }]}>Device Actions</Text>
            <View style={styles.actionsGrid}>
              {device.capabilities.map((capability) => {
                if (capability === 'power') return null; // Already handled above
                
                let icon, label, action;
                switch (capability) {
                  case 'gacha':
                    icon = <Zap size={16} color="#fff" />;
                    label = 'Start Gacha';
                    action = 'gacha_start';
                    break;
                  case 'emergency_stop':
                    icon = <AlertTriangle size={16} color="#fff" />;
                    label = 'E-Stop';
                    action = 'emergency_stop';
                    break;
                  case 'volume':
                    icon = <Volume2 size={16} color="#fff" />;
                    label = 'Volume';
                    action = 'volume_control';
                    break;
                  case 'temperature':
                    icon = <Thermometer size={16} color="#fff" />;
                    label = 'Temperature';
                    action = 'temp_control';
                    break;
                  default:
                    icon = <Wrench size={16} color="#fff" />;
                    label = capability;
                    action = capability;
                }
                
                return (
                  <TouchableOpacity
                    key={capability}
                    style={[
                      styles.actionButton,
                      { 
                        backgroundColor: capability === 'emergency_stop' ? colors.error : colors.primary,
                        opacity: device.status === 'connected' ? 1 : 0.5
                      }
                    ]}
                    onPress={() => handleDeviceAction(device, action)}
                    disabled={device.status !== 'connected'}
                  >
                    {icon}
                    <Text style={styles.actionButtonText}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderDeviceCard = (device: DeviceInfo) => {
    const DeviceIcon = getDeviceIcon(device.type, device.category);
    const TypeIcon = getTypeIcon(device.type);
    const categoryColor = getCategoryColor(device.category);
    const isExpanded = expandedDevices.has(device.id);
    
    return (
      <View key={device.id} style={styles.deviceCard}>
        <BlurView intensity={isDark ? 80 : 60} tint={isDark ? "dark" : "light"} style={styles.cardBlur}>
          <View style={styles.cardContent}>
            <TouchableOpacity 
              style={styles.cardHeader}
              onPress={() => toggleDeviceExpansion(device.id)}
            >
              <View style={styles.cardMainInfo}>
                <View style={[styles.iconContainer, { backgroundColor: categoryColor + '20' }]}>
                  <DeviceIcon size={24} color={categoryColor} />
                  <View style={[styles.typeIndicator, { backgroundColor: getStatusColor(device.status) }]}>
                    <TypeIcon size={12} color={colors.background} />
                  </View>
                </View>
                
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{device.name}</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                    {device.type.toUpperCase()} • {device.category.replace('-', ' ')}
                  </Text>
                  <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>
                    Signal: {device.signalStrength}% • {device.lastSeen.toLocaleTimeString()}
                  </Text>
                  {device.metadata?.ipAddress && (
                    <Text style={[styles.cardAddress, { color: colors.textSecondary }]}>IP: {device.metadata.ipAddress}</Text>
                  )}
                </View>
              </View>
              
              <View style={styles.deviceStatus}>
                <View style={styles.signalContainer}>
                  {Array.from({ length: 4 }, (_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.signalBar,
                        {
                          height: 4 + (i * 3),
                          backgroundColor: i < Math.ceil(device.signalStrength / 25) ? colors.success : colors.border,
                        },
                      ]}
                    />
                  ))}
                </View>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(device.status) }]} />
                
                {/* Chat Status Indicator */}
                {isChatEnabled(device.id) && (
                  <View style={[styles.chatIndicator, { backgroundColor: colors.primary + '20' }]}>
                    <MessageCircle size={12} color={colors.primary} />
                  </View>
                )}

                {/* Controller Status Indicator - NEW */}
                {isControllerEnabled(device.id) && (
                  <View style={[styles.controllerIndicator, { backgroundColor: colors.accent + '20' }]}>
                    <Gamepad2 size={12} color={colors.accent} />
                  </View>
                )}
                
                {/* Expansion Button - Positioned at right edge, centered with button height */}
                <View style={styles.expansionButtonContainer}>
                  {isExpanded ? (
                    <ChevronUp size={20} color={colors.textSecondary} />
                  ) : (
                    <ChevronDown size={20} color={colors.textSecondary} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </View>
          
          {/* Expanded Controls */}
          {isExpanded && renderDeviceControls(device)}
          
          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={[styles.cardActionButton, { backgroundColor: colors.primary + '20' }]}
              onPress={() => openDeviceSettings(device)}
            >
              <Edit3 size={16} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.cardActionButton, { backgroundColor: colors.error + '20' }]}>
              <Trash2 size={16} color={colors.error} />
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    );
  };

  const connectedDevices = devices.filter(d => d.status === 'connected');
  const devicesByCategory = {
    media: devices.filter(d => d.category === 'media'),
    'smart-home': devices.filter(d => d.category === 'smart-home'),
    industrial: devices.filter(d => d.category === 'industrial')
  };

  const styles = createStyles(colors, isDark);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? ['#000428', '#004e92'] : ['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t('navigation:screens.myDevices')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('devices:subtitle')}</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Device Overview */}
          <View style={styles.overviewSection}>
            <BlurView intensity={isDark ? 80 : 60} tint={isDark ? "dark" : "light"} style={styles.overviewCard}>
              <View style={styles.overviewHeader}>
                <Activity size={24} color={colors.primary} />
                <Text style={[styles.overviewTitle, { color: colors.text }]}>{t('devices:overview.title')}</Text>
              </View>
              <View style={styles.overviewGrid}>
                <View style={styles.overviewItem}>
                  <Text style={[styles.overviewNumber, { color: colors.primary }]}>{connectedDevices.length}</Text>
                  <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>{t('devices:overview.connected')}</Text>
                </View>
                <View style={styles.overviewItem}>
                  <Text style={[styles.overviewNumber, { color: colors.primary }]}>{devices.length}</Text>
                  <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>{t('devices:overview.total')}</Text>
                </View>
                <View style={styles.overviewItem}>
                  <Text style={[styles.overviewNumber, { color: colors.primary }]}>
                    {Math.round(connectedDevices.reduce((acc, d) => acc + d.signalStrength, 0) / connectedDevices.length || 0)}%
                  </Text>
                  <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>{t('devices:overview.avgSignal')}</Text>
                </View>
              </View>
            </BlurView>
          </View>

          {/* Simplified Quick Actions */}
          <View style={styles.actionsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              {/* Device Scan */}
              <TouchableOpacity style={styles.quickAction} onPress={scanForDevices}>
                <BlurView intensity={isDark ? 60 : 40} tint={isDark ? "dark" : "light"} style={styles.actionBlur}>
                  <RefreshCw size={20} color={isScanning ? colors.warning : colors.primary} />
                  <Text style={[styles.actionText, { color: colors.text }]}>
                    {isScanning ? 'Scanning...' : 'Scan Devices'}
                  </Text>
                  <Text style={[styles.actionTarget, { color: colors.textSecondary }]}>All</Text>
                </BlurView>
              </TouchableOpacity>
              
              {/* Signal Test */}
              <TouchableOpacity style={styles.quickAction} onPress={runSignalTest}>
                <BlurView intensity={isDark ? 60 : 40} tint={isDark ? "dark" : "light"} style={styles.actionBlur}>
                  <TestTube size={20} color={colors.success} />
                  <Text style={[styles.actionText, { color: colors.text }]}>Signal Test</Text>
                  <Text style={[styles.actionTarget, { color: colors.textSecondary }]}>
                    Connected ({connectedDevices.length})
                  </Text>
                </BlurView>
              </TouchableOpacity>

              {/* Add Device */}
              <TouchableOpacity style={styles.quickAction}>
                <BlurView intensity={isDark ? 60 : 40} tint={isDark ? "dark" : "light"} style={styles.actionBlur}>
                  <Plus size={20} color={colors.secondary} />
                  <Text style={[styles.actionText, { color: colors.text }]}>Add Device</Text>
                  <Text style={[styles.actionTarget, { color: colors.textSecondary }]}>New</Text>
                </BlurView>
              </TouchableOpacity>
            </View>
          </View>

          {/* Device Categories */}
          {Object.entries(devicesByCategory).map(([category, categoryDevices]) => (
            categoryDevices.length > 0 && (
              <View key={category} style={styles.categorySection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t(`devices:categories.${category === 'smart-home' ? 'smartHome' : category}`)} ({categoryDevices.length})
                </Text>
                <View style={styles.devicesList}>
                  {categoryDevices.map(renderDeviceCard)}
                </View>
              </View>
            )
          ))}
        </ScrollView>

        {/* Signal Test Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showSignalTest}
          onRequestClose={() => setShowSignalTest(false)}
        >
          <View style={styles.modalOverlay}>
            <BlurView intensity={90} tint={isDark ? "dark" : "light"} style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Signal Test Results</Text>
                <TouchableOpacity onPress={() => setShowSignalTest(false)}>
                  <X size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalContent}>
                {signalTestResults.map((result) => (
                  <View key={result.deviceId} style={[styles.testResultCard, { backgroundColor: colors.surface }]}>
                    <View style={styles.testResultHeader}>
                      <Text style={[styles.testResultName, { color: colors.text }]}>{result.deviceName}</Text>
                      <View style={[styles.testResultStatus, { backgroundColor: getStatusColor(result.status) + '20' }]}>
                        <Text style={[styles.testResultStatusText, { color: getStatusColor(result.status) }]}>
                          {result.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.testResultMetrics}>
                      <View style={styles.testMetric}>
                        <Text style={[styles.testMetricLabel, { color: colors.textSecondary }]}>Ping</Text>
                        <Text style={[styles.testMetricValue, { color: colors.text }]}>{result.pingTime}ms</Text>
                      </View>
                      <View style={styles.testMetric}>
                        <Text style={[styles.testMetricLabel, { color: colors.textSecondary }]}>Signal</Text>
                        <Text style={[styles.testMetricValue, { color: colors.text }]}>{result.signalStrength}%</Text>
                      </View>
                      <View style={styles.testMetric}>
                        <Text style={[styles.testMetricLabel, { color: colors.textSecondary }]}>Loss</Text>
                        <Text style={[styles.testMetricValue, { color: colors.text }]}>{result.packetLoss}%</Text>
                      </View>
                    </View>
                  </View>
                ))}
                
                {signalTestResults.length === 0 && (
                  <View style={styles.testingIndicator}>
                    <Activity size={32} color={colors.primary} />
                    <Text style={[styles.testingText, { color: colors.text }]}>Testing device connections...</Text>
                  </View>
                )}
              </ScrollView>
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
  overviewSection: {
    marginBottom: 24,
  },
  overviewCard: {
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  overviewTitle: {
    fontSize: 18,
    fontFamily: 'NotoSansJP-SemiBold',
    marginLeft: 12,
  },
  overviewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  overviewItem: {
    alignItems: 'center',
  },
  overviewNumber: {
    fontSize: 24,
    fontFamily: 'NotoSansJP-Bold',
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Regular',
  },
  actionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'NotoSansJP-SemiBold',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    minWidth: '30%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionBlur: {
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-SemiBold',
    textAlign: 'center',
  },
  actionTarget: {
    fontSize: 10,
    fontFamily: 'NotoSansJP-Regular',
    textAlign: 'center',
  },
  categorySection: {
    marginBottom: 24,
  },
  devicesList: {
    gap: 16,
  },
  deviceCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardBlur: {
    padding: 20,
  },
  cardContent: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    position: 'relative',
  },
  typeIndicator: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'NotoSansJP-SemiBold',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Regular',
    marginBottom: 2,
  },
  cardMeta: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Regular',
    marginBottom: 2,
  },
  cardAddress: {
    fontSize: 10,
    fontFamily: 'NotoSansJP-Regular',
  },
  deviceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  signalBar: {
    width: 3,
    borderRadius: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chatIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controllerIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expansionButtonContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Device Controls
  deviceControls: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  controlSection: {
    marginBottom: 16,
  },
  controlSectionTitle: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-SemiBold',
    marginBottom: 12,
  },
  
  // Chat Toggle
  chatToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatToggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  chatToggleLabel: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-SemiBold',
    marginBottom: 2,
    marginLeft: 20,
  },
  chatToggleDescription: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Regular',
    marginLeft: 20,
  },
  
  // Power Control
  powerControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  powerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  powerStatus: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-SemiBold',
  },
  powerConsumption: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Regular',
  },
  powerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  powerButtonText: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-SemiBold',
    color: '#fff',
  },
  
  // Performance Monitor
  performanceGrid: {
    gap: 12,
  },
  performanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  performanceLabel: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Medium',
    width: 60,
  },
  performanceValue: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Bold',
    width: 40,
  },
  performanceBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  performanceBarFill: {
    height: '100%',
  },
  performanceStatus: {
    marginTop: 12,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  performanceStatusText: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-SemiBold',
  },
  
  // Actions Grid
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
    minWidth: 80,
  },
  actionButtonText: {
    fontSize: 11,
    fontFamily: 'NotoSansJP-SemiBold',
    color: '#fff',
  },
  
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  cardActionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'NotoSansJP-Bold',
  },
  modalContent: {
    paddingTop: 20,
  },
  
  // Signal Test Styles
  testResultCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  testResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  testResultName: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-SemiBold',
    flex: 1,
  },
  testResultStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  testResultStatusText: {
    fontSize: 10,
    fontFamily: 'NotoSansJP-Bold',
  },
  testResultMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  testMetric: {
    alignItems: 'center',
  },
  testMetricLabel: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Regular',
    marginBottom: 4,
  },
  testMetricValue: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-Bold',
  },
  testingIndicator: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  testingText: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-Medium',
    marginTop: 16,
  },
});