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
  ScrollView,
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
import { Principal } from '@dfinity/principal';

interface ICPSession {
  principal: string;
  expiresAt: Date;
  network: 'local' | 'mainnet';
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
  const [selectedNetwork, setSelectedNetwork] = useState<'local' | 'mainnet'>('local');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [balanceCurrency, setBalanceCurrency] = useState<'ICP' | 'ckUSDC'>('ICP');
  const [balance, setBalance] = useState('');
  const [showBalancePicker, setShowBalancePicker] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [gasFee, setGasFee] = useState('');
  const [totalAmount, setTotalAmount] = useState("");
  const [isTransferButtonEnabled, setIsTransferButtonEnabled] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
 
  const paymentService = PaymentOperationService.getInstance();

  // Get recipient balance helper function
  const getRecipientBalance = async (currency: string) => {
    if (!recipientAddress) return 'N/A';
    try {
      // Create a temporary service instance to check recipient balance
      const tempService = PaymentOperationService.getInstance();
      await tempService.setNetwork(selectedNetwork);
      
      // Note: This requires a method to check balance of a specific address
      // For now, we'll return 'Not available' as the current service doesn't support this
      return 'Not available';
    } catch (error) {
      return 'Error';
    }
  };

  // Calculate total amount when transfer amount or gas fee changes
  const calculateTotalAmount = (amount: string, fee: string) => {
    if (!amount || !fee) return '';
    const amountNum = parseFloat(amount);
    const feeNum = parseFloat(fee);
    if (isNaN(amountNum) || isNaN(feeNum)) return '';
    return (amountNum + feeNum).toString();
  };

  // Format total amount to 4 decimal places
  const formatTotalAmount = (amount: string) => {
    if (!amount) return '';
    const num = parseFloat(amount);
    if (isNaN(num)) return amount;
    return num.toFixed(4);
  };

  // Check if transfer button should be enabled and update state
  const updateTransferButtonState = () => {
    if (isTransferring || !transferAmount || !gasFee || !totalAmount || !balance || !recipientAddress) {
      setIsTransferButtonEnabled(false);
      return;
    }

    const transferAmountNum = parseFloat(transferAmount);
    const gasFeeNum = parseFloat(gasFee);
    const totalAmountNum = parseFloat(totalAmount);
    const balanceNum = parseFloat(balance);
    const price = parseFloat(paymentService.getPrice(balanceCurrency));

    // Check if any values are invalid
    if (isNaN(transferAmountNum) || isNaN(gasFeeNum) || isNaN(totalAmountNum) || isNaN(balanceNum) || isNaN(price)) {
      setIsTransferButtonEnabled(false);
      return;
    }

    // Validate recipient address format
    try {
      Principal.fromText(recipientAddress);
    } catch (error) {
      setIsTransferButtonEnabled(false);
      return;
    }

    // Check if total amount is valid
    const isValid =  price <= (transferAmountNum + gasFeeNum)  && totalAmountNum <= balanceNum;
    setIsTransferButtonEnabled(isValid);
  };

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  // Update transfer button state when relevant values change
  useEffect(() => {
    updateTransferButtonState();
  }, [transferAmount, gasFee, totalAmount, balance, recipientAddress, isTransferring]);

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
    setRecipientAddress("");
    setTransferAmount("");
    setGasFee("");
    setTotalAmount("");
    setBalance("");
    if (icpAuthenticated && userPrincipal) {
      new Promise(async () => {
        await paymentService.setNetwork(selectedNetwork);
        setRecipientAddress(paymentService.getPaymentAddress());
        setTransferAmount(paymentService.getPrice(currency));
        setGasFee(paymentService.getFee(currency));
        setTotalAmount(paymentService.getTotalAmount(currency));
        const result = await paymentService.getBalance(currency);
        if (result.success && balanceCurrency == currency) {
          setBalance(result.balance!);
        }
        // Update debug info
        await updateDebugInfo();
      }).catch(() => {
        // TODO error handling
      });
    }
  }, [icpAuthenticated, userPrincipal, selectedNetwork, balanceCurrency]);

  // Responsive breakpoints
  const isTablet = screenDimensions.width >= 768;
  const isLargeScreen = screenDimensions.width >= 1024;
  const isSmallScreen = screenDimensions.width < 480;

  const handleLogin = async (network: 'local' | 'mainnet' = 'local') => {
    setLoginLoading(true);
    try {
      console.log('Internet Identity login started for network:', network);

      // Use real ICP authentication, mapping mainnet to 'ic' for compatibility
      const icpNetwork = network === 'mainnet' ? 'ic' : network;
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



   // Debug info states
  const [debugInfo, setDebugInfo] = useState({
    paymentAddress: '',
    priceICP: '',
    priceUSDC: '',
    feeICP: '',
    feeUSDC: '',
    totalAmountICP: '',
    totalAmountUSDC: '',
    balanceICP: '',
    balanceUSDC: '',
    recipientBalanceICP: '',
    recipientBalanceUSDC: '',
    lastUpdated: null as Date | null,
  });

  // Debug info update function
  const updateDebugInfo = async () => {
    if (!icpAuthenticated || !userPrincipal) return;
    
    try {
      await paymentService.setNetwork(selectedNetwork);
      
      const [balanceICP, balanceUSDC, recipientBalanceICP, recipientBalanceUSDC] = await Promise.all([
        paymentService.getBalance('ICP'),
        paymentService.getBalance('ckUSDC'),
        getRecipientBalance('ICP'),
        getRecipientBalance('ckUSDC'),
      ]);
      
      setDebugInfo({
        paymentAddress: paymentService.getPaymentAddress(),
        priceICP: paymentService.getPrice('ICP'),
        priceUSDC: paymentService.getPrice('ckUSDC'),
        feeICP: paymentService.getFee('ICP'),
        feeUSDC: paymentService.getFee('ckUSDC'),
        totalAmountICP: paymentService.getTotalAmount('ICP'),
        totalAmountUSDC: paymentService.getTotalAmount('ckUSDC'),
        balanceICP: balanceICP.success ? balanceICP.balance! : 'Error',
        balanceUSDC: balanceUSDC.success ? balanceUSDC.balance! : 'Error',
        recipientBalanceICP: recipientBalanceICP,
        recipientBalanceUSDC: recipientBalanceUSDC,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error('Debug info update failed:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={isDark ? ['#000428', '#004e92'] : ['#667eea', '#764ba2']} style={styles.gradient}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {userPrincipal && (
              <View style={styles.indexPrincipalContainer}>
                <User size={16} color={colors.text} />
                {registeredUsername ? (
                  <Text style={[styles.indexUsernameText, { color: colors.text }]}>
                    {registeredUsername}
                  </Text>
                ) : (
                  <Text style={[styles.indexPrincipalText, { color: colors.text }]}>
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
                style={[styles.indexLogoutButton, { backgroundColor: colors.error + '20', borderColor: colors.error }]}
                onPress={handleLogout}
              >
                <LogOut size={16} color={colors.error} />
                <Text style={[styles.indexLogoutButtonText, { color: colors.error }]}>{t('controls:authentication.logout')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView 
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Blockchain Connection Section */}
          {userPrincipal && (
          <View style={styles.indexBlockchainSection}>
            <BlurView intensity={isDark ? 80 : 60} tint={isDark ? "dark" : "light"} style={styles.blockchainCard}>
              {/* Wallet Cards Section */}
              <View style={styles.indexWalletCardsContainer}>
                {/* Child Card 1: Wallet Status */}
                <View style={[styles.indexWalletCard, { backgroundColor: colors.card, zIndex: 10002 }]}>
                  <Text style={[styles.indexWalletCardTitle, { color: colors.text }]}>{t('index:walletStatus')}</Text>
                  
                  {/* Wallet Address with Copy */}
                  <View style={styles.indexAddressSection}>
                    <Text style={[styles.indexAddressLabel, { color: colors.textSecondary }]}>{t('index:walletAddress')}</Text>
                    <TouchableOpacity 
                      style={styles.indexAddressContainer}
                      onPress={async () => {
                        await Clipboard.setStringAsync(userPrincipal);
                        Alert.alert(t('index:alerts.copied'), t('index:alerts.addressCopied'));
                      }}
                    >
                      <Text style={[styles.indexAddressText, { color: colors.text }]}>
                        {userPrincipal.slice(0, 12)}...{userPrincipal.slice(-12)}
                      </Text>
                      <Copy size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  {/* Balance with Currency Toggle */}
                  <View style={[styles.indexBalanceSection, { zIndex: 10000 }]}>
                    <Text style={[styles.indexBalanceLabel, { color: colors.textSecondary }]}>{t('index:balance')}</Text>
                    <View style={[styles.indexBalanceRow, { zIndex: 10001 }]}>
                      <Text style={[styles.indexBalanceAmount, { color: colors.text }]}>{balance}</Text>
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
                      <Text style={[styles.indexBalanceUsd, { color: colors.textSecondary }]}>≈ $0.00 USD</Text>
                    )}
                  </View>
                </View>

                {/* Child Card 2: New Transfer */}
                <View style={[styles.indexWalletCard, { backgroundColor: colors.card }]}>
                  <Text style={[styles.indexWalletCardTitle, { color: colors.text }]}>{t('index:newTransfer')}</Text>
                  
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
                        onChangeText={(text) => {
                          setTransferAmount(text);
                          setTotalAmount(calculateTotalAmount(text, gasFee));
                        }}
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
                      <Text style={[styles.totalAmount, { color: colors.text }]}>{formatTotalAmount(totalAmount)}</Text>
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
                      style={[
                        styles.transferButton, 
                        { 
                          backgroundColor: isTransferButtonEnabled ? colors.primary : colors.textSecondary,
                          opacity: isTransferButtonEnabled ? 1 : 0.6 
                        }
                      ]}
                      disabled={!isTransferButtonEnabled}
                      onPress={async () => {
                        if (!isTransferButtonEnabled) return;
                        
                        // 送信ボタンを無効化
                        setIsTransferring(true);
                        
                        try {
                          const recipientPrincipal = Principal.fromText(recipientAddress);
                          const transferResult = await paymentService.transfer(balanceCurrency, recipientPrincipal, parseFloat(transferAmount));
                          
                          if (transferResult.success) {
                            // Update balance after successful transfer
                            const balanceResult = await paymentService.getBalance(balanceCurrency);
                            if (balanceResult.success) {
                              setBalance(balanceResult.balance!);
                            }
                            
                            // Update debug info
                            await updateDebugInfo();
                                                                                    
                            Alert.alert(
                              t('common:success'),
                              `Transfer completed! Block index: ${transferResult.blockIndex?.toString()}`
                            );
                          } else {
                            Alert.alert(t('common:error'), transferResult.error || 'Transfer failed');
                          }
                        } catch (error) {
                          console.error('Transfer error:', error);
                          Alert.alert(t('common:error'), error instanceof Error ? error.message : 'Transfer failed');
                        } finally {
                          // 送信ボタンを有効化
                          setIsTransferring(false);
                        }
                      }}
                    >
                      {isTransferring ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Text style={styles.transferButtonText}>{t('index:send')}</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </BlurView>
          </View>
        )}

        {/* Debug Section */}
        {userPrincipal && (
          <View style={[styles.indexBlockchainSection, { marginTop: 20 }]}>
            <BlurView intensity={isDark ? 80 : 60} tint={isDark ? "dark" : "light"} style={styles.blockchainCard}>
              <View style={styles.indexWalletCard}>
                <Text style={[styles.indexWalletCardTitle, { color: colors.text }]}>デバッグ情報</Text>
                
                {debugInfo.lastUpdated && (
                  <Text style={[styles.indexAddressLabel, { color: colors.textSecondary, textAlign: 'center', marginBottom: 16 }]}>
                    最終更新: {debugInfo.lastUpdated.toLocaleTimeString()}
                  </Text>
                )}

                <View style={{ gap: 16, marginBottom: 20 }}>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={[styles.indexAddressLabel, { color: colors.text, fontSize: 14, fontWeight: 'bold' }]}>Payment Address (getPaymentAddress)</Text>
                    <Text style={[styles.indexAddressLabel, { color: colors.textSecondary, fontSize: 12, marginLeft: 8 }]}>{debugInfo.paymentAddress || 'N/A'}</Text>
                  </View>

                  <View style={{ marginBottom: 12 }}>
                    <Text style={[styles.indexAddressLabel, { color: colors.text, fontSize: 14, fontWeight: 'bold' }]}>Prices (getPrice)</Text>
                    <Text style={[styles.indexAddressLabel, { color: colors.textSecondary, fontSize: 12, marginLeft: 8 }]}>ICP: {debugInfo.priceICP || 'N/A'}</Text>
                    <Text style={[styles.indexAddressLabel, { color: colors.textSecondary, fontSize: 12, marginLeft: 8 }]}>ckUSDC: {debugInfo.priceUSDC || 'N/A'}</Text>
                  </View>

                  <View style={{ marginBottom: 12 }}>
                    <Text style={[styles.indexAddressLabel, { color: colors.text, fontSize: 14, fontWeight: 'bold' }]}>Fees (getFee)</Text>
                    <Text style={[styles.indexAddressLabel, { color: colors.textSecondary, fontSize: 12, marginLeft: 8 }]}>ICP: {debugInfo.feeICP || 'N/A'}</Text>
                    <Text style={[styles.indexAddressLabel, { color: colors.textSecondary, fontSize: 12, marginLeft: 8 }]}>ckUSDC: {debugInfo.feeUSDC || 'N/A'}</Text>
                  </View>

                  <View style={{ marginBottom: 12 }}>
                    <Text style={[styles.indexAddressLabel, { color: colors.text, fontSize: 14, fontWeight: 'bold' }]}>Total Amounts (getTotalAmount)</Text>
                    <Text style={[styles.indexAddressLabel, { color: colors.textSecondary, fontSize: 12, marginLeft: 8 }]}>ICP: {debugInfo.totalAmountICP || 'N/A'}</Text>
                    <Text style={[styles.indexAddressLabel, { color: colors.textSecondary, fontSize: 12, marginLeft: 8 }]}>ckUSDC: {debugInfo.totalAmountUSDC || 'N/A'}</Text>
                  </View>

                  <View style={{ marginBottom: 12 }}>
                    <Text style={[styles.indexAddressLabel, { color: colors.text, fontSize: 14, fontWeight: 'bold' }]}>Balances (getBalance)</Text>
                    <Text style={[styles.indexAddressLabel, { color: colors.textSecondary, fontSize: 12, marginLeft: 8 }]}>ICP: {debugInfo.balanceICP || 'N/A'}</Text>
                    <Text style={[styles.indexAddressLabel, { color: colors.textSecondary, fontSize: 12, marginLeft: 8 }]}>ckUSDC: {debugInfo.balanceUSDC || 'N/A'}</Text>
                  </View>

                  <View style={{ marginBottom: 12 }}>
                    <Text style={[styles.indexAddressLabel, { color: colors.text, fontSize: 14, fontWeight: 'bold' }]}>Recipient Balances</Text>
                    <Text style={[styles.indexAddressLabel, { color: colors.textSecondary, fontSize: 12, marginLeft: 8 }]}>Address: {recipientAddress || 'No address'}</Text>
                    <Text style={[styles.indexAddressLabel, { color: colors.textSecondary, fontSize: 12, marginLeft: 8 }]}>ICP: {debugInfo.recipientBalanceICP || 'N/A'}</Text>
                    <Text style={[styles.indexAddressLabel, { color: colors.textSecondary, fontSize: 12, marginLeft: 8 }]}>ckUSDC: {debugInfo.recipientBalanceUSDC || 'N/A'}</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.transferButton, { backgroundColor: colors.primary, width: '100%', alignSelf: 'center' }]}
                  onPress={updateDebugInfo}
                >
                  <Text style={styles.transferButtonText}>最新情報更新</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        )}
        </ScrollView>

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
                    onPress={() => handleLogin('mainnet')}
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

