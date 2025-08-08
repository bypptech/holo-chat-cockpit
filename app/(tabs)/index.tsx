import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  TextInput,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { X, User, LogOut, Fingerprint, Globe, Cloud, Copy } from "lucide-react-native";
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { MultiAuth } from '@/components/auth/MultiAuth';
import { useInternetIdentity } from '@/contexts/InternetIdentityContext';
import PaymentOperationService from '@/components/services/paymentOperationService';
import { createTabStyles } from './styles';

interface ICPSession {
  principal: string;
  expiresAt: Date;
  network: 'local' | 'testnet' | 'ic';
}


export default function ControllerScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  const { login: icpLogin, logout: icpLogout, isAuthenticated: icpAuthenticated, principal: icpPrincipal, isLoading: icpLoading } = useInternetIdentity();
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));

  const [connectionStatus, setConnectionStatus] = useState({
    icp: false,
    esp32: false,
  });

  const [showCapsuleMessage, setShowCapsuleMessage] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [userPrincipal, setUserPrincipal] = useState<string | null>(null);
  const [showUsernameRegistration, setShowUsernameRegistration] = useState(false);
  const [registeredUsername, setRegisteredUsername] = useState<string | null>(null);
  const [isControlActive, setIsControlActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<ICPSession | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<'local' | 'testnet' | 'ic'>('local');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [balanceCurrency, setBalanceCurrency] = useState<'ICP' | 'ckUSDC'>('ICP');
  const [balance, setBalance] = useState('');
  const [showBalancePicker, setShowBalancePicker] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [gasFee, setGasFee] = useState('');

  const paymentService = PaymentOperationService.getInstance();

  // Calculate total amount
  const totalAmount = (parseFloat(transferAmount || '0') + parseFloat(gasFee || '0')).toFixed(2);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (userPrincipal) {
      setIsControlActive(true);
      setLastChecked(new Date());

      // Simulate periodic auth checks
      const interval = setInterval(() => {
        setLastChecked(new Date());
      }, 30000);

      return () => clearInterval(interval);
    } else {
      setIsControlActive(false);
    }
  }, [userPrincipal]);

  // Sync with ICP authentication state
  useEffect(() => {
    if (icpAuthenticated && icpPrincipal && !userPrincipal) {
      // ICP is authenticated but local state is not synced
      const session: ICPSession = {
        principal: icpPrincipal,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        network: selectedNetwork
      };
      setUserPrincipal(icpPrincipal);
      setCurrentSession(session);
      setConnectionStatus(prev => ({ ...prev, icp: true, esp32: true }));
    } else if (!icpAuthenticated && userPrincipal) {
      // ICP is logged out but local state still has user
      setUserPrincipal(null);
      setCurrentSession(null);
      setConnectionStatus(prev => ({ ...prev, icp: false, esp32: false }));
    }
  }, [icpAuthenticated, icpPrincipal, userPrincipal, selectedNetwork]);

  // Update balance
  useEffect(() => {
    const currency = balanceCurrency;
    setGasFee(paymentService.getFee(currency));
    setBalance("");
    if (icpAuthenticated && userPrincipal) {
      new Promise(async ()=>{
        const result = await paymentService.getBalance(currency);
        if (result.success && balanceCurrency == currency) {
          setBalance(result.balance!);
        }
      }).catch(()=>{
        // TODO error handling
      });
    }
  }, [icpAuthenticated, userPrincipal, selectedNetwork, balanceCurrency]);

  // Responsive breakpoints
  const isTablet = screenDimensions.width >= 768;
  const isLargeScreen = screenDimensions.width >= 1024;
  const isSmallScreen = screenDimensions.width < 480;

  const handleLogin = async (network: 'local' | 'ic' | 'testnet' = 'local') => {
    setLoginLoading(true);
    try {
      console.log('Internet Identity login started for network:', network);

      // Use real ICP authentication, treating 'testnet' as 'ic' for simplicity
      const icpNetwork = network === 'testnet' ? 'ic' : network;
      await icpLogin(icpNetwork);

      if (icpPrincipal) {
        const session: ICPSession = {
          principal: icpPrincipal,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          network
        };

        setUserPrincipal(icpPrincipal);
        setCurrentSession(session);
        setConnectionStatus(prev => ({ ...prev, icp: true, esp32: true }));
        setShowLoginModal(false);
        setSelectedNetwork(network);

        Alert.alert(
          t('controls:authentication.loginSuccessful'),
          t('controls:authentication.loginSuccessfulMessage', { principal: icpPrincipal.slice(0, 20) })
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(t('controls:authentication.loginError'), error instanceof Error ? error.message : t('controls:authentication.loginFailed'));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Call the actual Internet Identity logout
      await icpLogout();
      
      // Clear local state
      setUserPrincipal(null);
      setCurrentSession(null);
      setConnectionStatus(prev => ({ ...prev, icp: false, esp32: false }));
      setRegisteredUsername(null);
      setShowUsernameRegistration(false);
      setIsControlActive(false);
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const allStyles = createTabStyles(colors, isDark, screenDimensions, isTablet, isLargeScreen, isSmallScreen);
  const styles = { ...allStyles.common, ...allStyles.index };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={isDark ? ['#000428', '#004e92'] : ['#667eea', '#764ba2']} style={styles.gradient}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {userPrincipal && (
              <View style={styles.principalContainer}>
                <User size={16} color={colors.text} />
                {registeredUsername ? (
                  <Text style={[styles.usernameText, { color: colors.text }]}>
                    {registeredUsername}
                  </Text>
                ) : (
                  <Text style={[styles.principalText, { color: colors.text }]}>
                    {userPrincipal.slice(0, 20)}...
                  </Text>
                )}
              </View>
            )}
          </View>
          <View style={styles.headerCenter}>
            {!userPrincipal && (
              <MultiAuth/>
            )}
          </View>
          <View style={styles.headerRight}>
            {userPrincipal && (
              <TouchableOpacity
                style={[styles.logoutButton, { backgroundColor: colors.error + '20', borderColor: colors.error }]}
                onPress={handleLogout}
              >
                <LogOut size={16} color={colors.error} />
                <Text style={[styles.logoutButtonText, { color: colors.error }]}>{t('controls:authentication.logout')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Blockchain Connection Section */}
        {userPrincipal && (
          <View style={styles.blockchainSection}>
            <BlurView intensity={isDark ? 80 : 60} tint={isDark ? "dark" : "light"} style={styles.blockchainCard}>
              {/* Wallet Cards Section */}
              <View style={styles.walletCardsContainer}>
                {/* Child Card 1: Wallet Status */}
                <View style={[styles.walletCard, { backgroundColor: colors.card, zIndex: 10002 }]}>
                  <Text style={[styles.walletCardTitle, { color: colors.text }]}>{t('index:walletStatus')}</Text>
                  
                  {/* Wallet Address with Copy */}
                  <View style={styles.addressSection}>
                    <Text style={[styles.addressLabel, { color: colors.textSecondary }]}>{t('index:walletAddress')}</Text>
                    <TouchableOpacity 
                      style={styles.addressContainer}
                      onPress={async () => {
                        await Clipboard.setStringAsync(userPrincipal);
                        Alert.alert(t('index:alerts.copied'), t('index:alerts.addressCopied'));
                      }}
                    >
                      <Text style={[styles.addressText, { color: colors.text }]}>
                        {userPrincipal.slice(0, 12)}...{userPrincipal.slice(-12)}
                      </Text>
                      <Copy size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  {/* Balance with Currency Toggle */}
                  <View style={[styles.balanceSection, { zIndex: 10000 }]}>
                    <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>{t('index:balance')}</Text>
                    <View style={[styles.balanceRow, { zIndex: 10001 }]}>
                      <Text style={[styles.balanceAmount, { color: colors.text }]}>{balance}</Text>
                      <View style={[styles.currencyDropdown, { backgroundColor: colors.primary + '20', borderColor: colors.border, zIndex: 999999 }]}>
                        <TouchableOpacity
                          style={styles.dropdownHeader}
                          onPress={() => setShowBalancePicker(!showBalancePicker)}
                        >
                          <Text style={[styles.currencyText, { color: colors.primary }]}>{balanceCurrency}</Text>
                          <Text style={[styles.dropdownArrow, { color: colors.primary }]}>▼</Text>
                        </TouchableOpacity>
                        {showBalancePicker && (
                          <View style={[styles.dropdownOptions, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <TouchableOpacity
                              style={styles.dropdownOption}
                              onPress={() => {
                                setBalanceCurrency('ICP');
                                setShowBalancePicker(false);
                              }}
                            >
                              <Text style={[styles.dropdownOptionText, { color: colors.text }]}>ICP</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.dropdownOption, { borderTopWidth: 1, borderTopColor: colors.border }]}
                              onPress={() => {
                                setBalanceCurrency('ckUSDC');
                                setShowBalancePicker(false);
                              }}
                            >
                              <Text style={[styles.dropdownOptionText, { color: colors.text }]}>ckUSDC</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                    {balanceCurrency === 'ICP' && (
                      <Text style={[styles.balanceUsd, { color: colors.textSecondary }]}>≈ $0.00 USD</Text>
                    )}
                  </View>
                </View>

                {/* Child Card 2: New Transfer */}
                <View style={[styles.walletCard, { backgroundColor: colors.card }]}>
                  <Text style={[styles.walletCardTitle, { color: colors.text }]}>{t('index:newTransfer')}</Text>
                  
                  {/* Recipient Address Input */}
                  <View style={styles.inputSection}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('index:recipientAddress')}</Text>
                    <TextInput
                      style={[styles.addressInput, { 
                        backgroundColor: colors.background, 
                        color: colors.text,
                        borderColor: colors.border 
                      }]}
                      placeholder={t('index:enterAddress')}
                      placeholderTextColor={colors.textSecondary}
                      value={recipientAddress}
                      onChangeText={setRecipientAddress}
                    />
                  </View>

                  {/* Amount Input with Currency */}
                  <View style={styles.inputSection}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('index:amount')}</Text>
                    <View style={styles.amountInputContainer}>
                      <TextInput
                        style={[styles.amountInput, { 
                          backgroundColor: colors.background, 
                          color: colors.text,
                          borderColor: colors.border 
                        }]}
                        placeholder="0.00"
                        placeholderTextColor={colors.textSecondary}
                        value={transferAmount}
                        keyboardType="numeric"
                        onChangeText={setTransferAmount}
                      />
                      <View style={[styles.currencyDisplay, { backgroundColor: colors.primary + '20' }]}>
                        <Text style={[styles.currencyText, { color: colors.primary }]}>{balanceCurrency}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Gas Fee Input */}
                  <View style={styles.inputSection}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('index:gasFee')}</Text>
                    <View style={styles.amountInputContainer}>
                      <TextInput
                        style={[styles.amountInput, { 
                          backgroundColor: colors.background, 
                          color: colors.text,
                          borderColor: colors.border 
                        }]}
                        placeholderTextColor={colors.textSecondary}
                        value={gasFee}
                        editable={false}
                      />
                      <View style={[styles.currencyDisplay, { backgroundColor: colors.primary + '20' }]}>
                        <Text style={[styles.currencyText, { color: colors.primary }]}>{balanceCurrency}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Total Amount Display */}
                  <View style={[styles.totalSection, { borderTopColor: colors.border }]}>
                    <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>{t('index:totalAmount')}</Text>
                    <View style={styles.totalRow}>
                      <Text style={[styles.totalAmount, { color: colors.text }]}>{totalAmount}</Text>
                      <Text style={[styles.totalCurrency, { color: colors.text }]}>{balanceCurrency}</Text>
                    </View>
                  </View>

                  {/* Transfer Actions */}
                  <View style={styles.transferActions}>
                    <TouchableOpacity 
                      style={[styles.resetButton, { borderColor: colors.border }]}
                      onPress={() => {
                        setRecipientAddress('');
                        setTransferAmount('');
                        setGasFee('');
                      }}
                    >
                      <Text style={[styles.resetButtonText, { color: colors.text }]}>{t('index:cancel')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.transferButton, { backgroundColor: colors.primary }]}
                      onPress={() => {
                        Alert.alert(t('index:transfer'), t('index:transferInitiated'));
                      }}
                    >
                      <Text style={styles.transferButtonText}>{t('index:send')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </BlurView>
          </View>
        )}
       
        {/* Login Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showLoginModal}
          onRequestClose={() => setShowLoginModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{t('controls:authentication.internetIdentity')}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowLoginModal(false)}
                >
                  <X size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalContent}>
                <View style={styles.loginIconContainer}>
                  <Fingerprint size={60} color={colors.primary} />
                </View>
                <Text style={[styles.loginTitle, { color: colors.text }]}>{t('controls:authentication.internetIdentity')}</Text>
                <Text style={[styles.loginDescription, { color: colors.textSecondary }]}>
                  {t('controls:authentication.internetIdentitySubtitle')}
                </Text>
                <View style={styles.networkOptions}>
                  <TouchableOpacity
                    style={[styles.networkButton, { backgroundColor: colors.warning }]}
                    onPress={() => handleLogin('local')}
                    disabled={loginLoading || icpLoading}
                  >
                    <Globe size={20} color="white" />
                    <Text style={styles.networkButtonText}>{t('controls:authentication.localNetwork')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.networkButton, { backgroundColor: colors.primary }]}
                    onPress={() => handleLogin('ic')}
                    disabled={loginLoading || icpLoading}
                  >
                    <Cloud size={20} color="white" />
                    <Text style={styles.networkButtonText}>{t('controls:authentication.mainnet')}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.networkNote, { color: colors.textSecondary }]}>
                  {t('controls:authentication.localNote')}
                </Text>
                {(loginLoading || icpLoading) && (
                  <ActivityIndicator size="large" color={colors.primary} />
                )}
              </View>
            </View>
          </View>
        </Modal>
          
      </LinearGradient>
    </SafeAreaView>
  );
}

