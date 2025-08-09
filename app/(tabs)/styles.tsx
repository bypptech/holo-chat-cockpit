import { StyleSheet } from 'react-native';

// Common styles shared across all tabs
export const createCommonStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  // Base Layout
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
  
  // Header Components
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
  
  // Auth Status
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
  
  // Scrolling
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  // Sections
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'NotoSansJP-SemiBold',
    marginBottom: 16,
  },
  sectionContent: {
    gap: 4,
  },
  
  // Modal Components
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
  modalContent: {
    padding: 20,
  },
  
  // Card Components
  card: {
    borderRadius: 16,
    padding: 20,
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
  
  // Button Components
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-SemiBold',
    color: '#fff',
  },
  
  // Icon Components
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    position: 'relative',
  },
  
  // Status Indicators
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  // Input Components
  inputLabel: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Regular',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'NotoSansJP-Regular',
  },
});

// AR-specific styles
export const createArStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  // AR-specific styles would go here if different from common
  // Currently AR uses all common styles
});

// Button-specific styles
export const createButtonStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  // Scroll Content
  scrollContent: {
    flexGrow: 1,
  },
  
  // Control Cards
  controlCard: {
    borderRadius: 20,
    marginBottom: 24,
    overflow: 'hidden',
  },
  controlHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  controlTitle: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-SemiBold',
    marginLeft: 8,
  },
  
  // Drive Button
  driveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
    marginBottom: 16,
  },
  driveButtonText: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-SemiBold',
    color: '#fff',
  },
  countdownText: {
    fontSize: 24,
    fontFamily: 'NotoSansJP-Bold',
  },
  
  // Status Display
  statusContainer: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-SemiBold',
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Regular',
    lineHeight: 16,
  },
  
  // Info Card
  infoCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-SemiBold',
    marginLeft: 8,
  },
  infoList: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Regular',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Medium',
  },
});

// Chat-specific styles  
export const createChatStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  // Features Section
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
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
  chatFeaturesSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  chatFeaturesScroll: {
    flexDirection: 'row',
  },
  chatFeatureCard: {
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    width: 200,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chatFeatureBlur: {
    padding: 16,
  },
  chatFeatureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chatFeatureIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatSelectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatSelectedBadgeText: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Bold',
    color: '#fff',
  },
  chatFeatureName: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-SemiBold',
    marginBottom: 8,
  },
  
  // Chat Container
  chatContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 16,
  },
  chatMessagesContainer: {
    flex: 1,
    marginBottom: 16,
  },
  
  // Messages
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
  chatMessageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  chatUserMessage: {
    justifyContent: 'flex-end',
  },
  chatBotMessage: {
    justifyContent: 'flex-start',
  },
  chatBotAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  chatUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginTop: 4,
  },
  chatMessageContent: {
    flex: 1,
    maxWidth: '75%',
  },
  chatMessageBlur: {
    borderRadius: 16,
    padding: 12,
    overflow: 'hidden',
  },
  chatMessageText: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-Regular',
    lineHeight: 22,
  },
  chatMessageFooter: {
    marginTop: 4,
  },
  chatTimestamp: {
    fontSize: 10,
    fontFamily: 'NotoSansJP-Regular',
  },
  
  // Input Container
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
  sendButton: {
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
  chatInputContainer: {
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
  chatTextInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'NotoSansJP-Regular',
    maxHeight: 80,
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 8,
  },
  chatSendButton: {
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
  
  // Typing Indicator
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
  chatTypingIndicator: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  chatTypingBlur: {
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  chatTypingDots: {
    flexDirection: 'row',
    marginRight: 8,
  },
  chatDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
  },
  chatDot1: {
    opacity: 0.4,
  },
  chatDot2: {
    opacity: 0.7,
  },
  chatDot3: {
    opacity: 1,
  },
  chatTypingText: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Regular',
  },
});

// Devices-specific styles
export const createDevicesStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  // Overview Section
  devicesOverviewSection: {
    marginBottom: 24,
  },
  devicesOverviewCard: {
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  devicesOverviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  devicesOverviewTitle: {
    fontSize: 18,
    fontFamily: 'NotoSansJP-SemiBold',
    marginLeft: 12,
  },
  devicesOverviewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  devicesOverviewItem: {
    alignItems: 'center',
  },
  devicesOverviewNumber: {
    fontSize: 24,
    fontFamily: 'NotoSansJP-Bold',
    marginBottom: 4,
  },
  devicesOverviewLabel: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Regular',
  },
  
  // Actions Grid
  devicesActionsSection: {
    marginBottom: 24,
  },
  devicesActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  devicesQuickAction: {
    flex: 1,
    minWidth: '30%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  devicesActionBlur: {
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  devicesActionText: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-SemiBold',
    textAlign: 'center',
  },
  devicesActionTarget: {
    fontSize: 10,
    fontFamily: 'NotoSansJP-Regular',
    textAlign: 'center',
  },
  
  // Device Cards
  devicesCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  devicesCardMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  devicesCardInfo: {
    flex: 1,
  },
  devicesCardMeta: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Regular',
    marginBottom: 2,
  },
  devicesCardAddress: {
    fontSize: 10,
    fontFamily: 'NotoSansJP-Regular',
  },
  
  // Device Status
  devicesStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  devicesSignalContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  devicesSignalBar: {
    width: 3,
    borderRadius: 1,
  },
  devicesChatIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devicesControllerIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devicesExpansionButtonContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Device Controls
  devicesControls: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  devicesControlSection: {
    marginBottom: 16,
  },
  devicesControlSectionTitle: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-SemiBold',
    marginBottom: 12,
  },
});

// Index (Home)-specific styles
export const createIndexStyles = (colors: any, isDark: boolean, screenDimensions: any, isTablet: boolean, isLargeScreen: boolean, isSmallScreen: boolean) => StyleSheet.create({
  // Header Responsive (overrides common header for index)
  header: {
    flexDirection: isSmallScreen ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isTablet ? 40 : isSmallScreen ? 16 : 20,
    paddingVertical: isTablet ? 32 : isSmallScreen ? 16 : 24,
    gap: isSmallScreen ? 16 : 0,
  },
  headerLeft: {
    flex: isSmallScreen ? 0 : 1,
    width: isSmallScreen ? '100%' : 'auto',
    alignItems: isSmallScreen ? 'center' : 'flex-start',
  },
  headerCenter: {
    flex: isSmallScreen ? 0 : 1,
    width: isSmallScreen ? '100%' : 'auto',
    alignItems: 'center',
  },
  headerRight: {
    flex: isSmallScreen ? 0 : 1,
    width: isSmallScreen ? '100%' : 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: isSmallScreen ? 'center' : 'flex-end',
  },
  indexHeader: {
    flexDirection: isSmallScreen ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isTablet ? 40 : isSmallScreen ? 16 : 20,
    paddingVertical: isTablet ? 32 : isSmallScreen ? 16 : 24,
    gap: isSmallScreen ? 16 : 0,
  },
  indexHeaderLeft: {
    flex: isSmallScreen ? 0 : 1,
    width: isSmallScreen ? '100%' : 'auto',
    alignItems: isSmallScreen ? 'center' : 'flex-start',
  },
  indexHeaderCenter: {
    flex: isSmallScreen ? 0 : 1,
    width: isSmallScreen ? '100%' : 'auto',
    alignItems: 'center',
  },
  indexHeaderRight: {
    flex: isSmallScreen ? 0 : 1,
    width: isSmallScreen ? '100%' : 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: isSmallScreen ? 'center' : 'flex-end',
  },
  
  // Responsive Typography
  indexTitle: {
    fontSize: isLargeScreen ? 40 : isTablet ? 36 : isSmallScreen ? 28 : 32,
    fontFamily: 'NotoSansJP-Bold',
    marginBottom: 8,
    textAlign: isSmallScreen ? 'center' : 'left',
  },
  
  // Principal/User Info
  indexPrincipalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indexPrincipalText: {
    fontSize: isTablet ? 14 : isSmallScreen ? 10 : 12,
    fontFamily: 'NotoSansJP-Regular',
  },
  indexUsernameText: {
    fontSize: isTablet ? 16 : isSmallScreen ? 12 : 14,
    fontFamily: 'NotoSansJP-SemiBold',
  },
  
  // Buttons
  indexLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: isTablet ? 20 : isSmallScreen ? 12 : 16,
    paddingVertical: isTablet ? 12 : isSmallScreen ? 6 : 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: isSmallScreen ? 120 : 'auto',
  },
  indexLoginButtonText: {
    fontSize: isTablet ? 16 : isSmallScreen ? 12 : 14,
    fontFamily: 'NotoSansJP-SemiBold',
  },
  indexLogoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: isTablet ? 20 : isSmallScreen ? 12 : 16,
    paddingVertical: isTablet ? 12 : isSmallScreen ? 6 : 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: isSmallScreen ? 120 : 'auto',
  },
  indexLogoutButtonText: {
    fontSize: isTablet ? 16 : isSmallScreen ? 12 : 14,
    fontFamily: 'NotoSansJP-SemiBold',
  },
  
  // Blockchain Section
  indexBlockchainSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  
  // Wallet Cards
  indexWalletCardsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  indexWalletCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'visible',
  },
  indexWalletCardTitle: {
    fontSize: isTablet ? 20 : isSmallScreen ? 16 : 18,
    fontFamily: 'NotoSansJP-Bold',
    marginBottom: 20,
  },
  
  // Address Section
  indexAddressSection: {
    marginBottom: 20,
  },
  indexAddressLabel: {
    fontSize: isTablet ? 14 : isSmallScreen ? 10 : 12,
    fontFamily: 'NotoSansJP-Regular',
    marginBottom: 8,
  },
  indexAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 8,
  },
  indexAddressText: {
    fontSize: isTablet ? 14 : isSmallScreen ? 10 : 12,
    fontFamily: 'NotoSansJP-Medium',
    flex: 1,
  },
  
  // Balance Section
  indexBalanceSection: {
    marginBottom: 0,
    overflow: 'visible',
  },
  indexBalanceLabel: {
    fontSize: isTablet ? 14 : isSmallScreen ? 10 : 12,
    fontFamily: 'NotoSansJP-Regular',
    marginBottom: 8,
  },
  indexBalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
    overflow: 'visible',
  },
  indexBalanceAmount: {
    fontSize: isLargeScreen ? 42 : isTablet ? 38 : isSmallScreen ? 28 : 36,
    fontFamily: 'NotoSansJP-Bold',
  },
  indexBalanceUsd: {
    fontSize: isTablet ? 16 : isSmallScreen ? 12 : 14,
    fontFamily: 'NotoSansJP-Regular',
  },
  
  // Additional styles specific to index
  blockchainCard: {
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  networkButton: {
    flex: isSmallScreen ? 0 : 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: isTablet ? 16 : isSmallScreen ? 10 : 12,
    paddingHorizontal: isTablet ? 20 : isSmallScreen ? 12 : 16,
    borderRadius: 8,
  },
  networkButtonText: {
    fontSize: isTablet ? 16 : isSmallScreen ? 12 : 14,
    fontFamily: 'NotoSansJP-SemiBold',
    color: 'white',
  },
  networkNote: {
    fontSize: isTablet ? 14 : isSmallScreen ? 10 : 12,
    fontFamily: 'NotoSansJP-Regular',
    textAlign: 'center',
    marginBottom: 16,
  },
  networkOptions: {
    flexDirection: isSmallScreen ? 'column' : 'row',
    gap: 12,
    marginBottom: 16,
    width: '100%',
  },
  loginIconContainer: {
    marginBottom: isTablet ? 20 : isSmallScreen ? 12 : 16,
  },
  loginTitle: {
    fontSize: isTablet ? 28 : isSmallScreen ? 20 : 24,
    fontFamily: 'NotoSansJP-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  loginDescription: {
    fontSize: isTablet ? 18 : isSmallScreen ? 14 : 16,
    fontFamily: 'NotoSansJP-Regular',
    textAlign: 'center',
    marginBottom: isTablet ? 28 : isSmallScreen ? 20 : 24,
  },
  closeButton: {
    padding: 4,
  },
  currencyDropdown: {
    position: 'relative',
    borderRadius: 8,
    minWidth: 90,
    borderWidth: 1,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownArrow: {
    fontSize: 10,
    marginLeft: 4,
  },
  dropdownOptions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    zIndex: 9999999,
    elevation: 99999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownOptionText: {
    fontSize: isTablet ? 14 : isSmallScreen ? 10 : 12,
    fontFamily: 'NotoSansJP-Medium',
  },
  currencyText: {
    fontSize: isTablet ? 14 : isSmallScreen ? 10 : 12,
    fontFamily: 'NotoSansJP-SemiBold',
  },
  currencyDisplay: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  amountInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  amountInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: isTablet ? 14 : isSmallScreen ? 10 : 12,
    fontFamily: 'NotoSansJP-Regular',
  },
  addressInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: isTablet ? 14 : isSmallScreen ? 10 : 12,
    fontFamily: 'NotoSansJP-Regular',
  },
  transferActions: {
    flexDirection: 'row',
    gap: 12,
  },
  transferButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  transferButtonText: {
    fontSize: isTablet ? 16 : isSmallScreen ? 12 : 14,
    fontFamily: 'NotoSansJP-SemiBold',
    color: '#fff',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  resetButtonText: {
    fontSize: isTablet ? 16 : isSmallScreen ? 12 : 14,
    fontFamily: 'NotoSansJP-Medium',
  },
  totalSection: {
    marginTop: 16,
    paddingTop: 16,
    marginBottom: 24,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: isTablet ? 14 : isSmallScreen ? 10 : 12,
    fontFamily: 'NotoSansJP-Regular',
    marginBottom: 8,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalAmount: {
    fontSize: isTablet ? 24 : isSmallScreen ? 18 : 20,
    fontFamily: 'NotoSansJP-Bold',
  },
  totalCurrency: {
    fontSize: isTablet ? 16 : isSmallScreen ? 12 : 14,
    fontFamily: 'NotoSansJP-SemiBold',
  },
  inputSection: {
    marginBottom: 20,
  },
});

// Network-specific styles
export const createNetworkStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  // Network Status Panels
  networkStatusSection: {
    marginBottom: 24,
  },
  networkStatusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  networkStatusPanel: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    overflow: 'hidden',
  },
  networkStatusIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  networkStatusTitle: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-SemiBold',
    marginBottom: 8,
  },
  networkStatusDetail: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Regular',
  },
  
  // Blockchain Connection
  networkBlockchainSection: {
    marginBottom: 24,
  },
  networkBlockchainTitle: {
    fontSize: 18,
    fontFamily: 'NotoSansJP-SemiBold',
  },
  networkProtocolBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  networkProtocolBadgeText: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Bold',
  },
  networkConnectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  networkConnectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkConnectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  networkConnectedText: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-SemiBold',
  },
  networkNetworkBadge: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Medium',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  // Performance
  networkPerformanceSection: {
    marginBottom: 32,
  },
  networkPerformanceCard: {
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  networkPerformanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  networkPerformanceItem: {
    alignItems: 'center',
  },
  networkPerformanceNumber: {
    fontSize: 24,
    fontFamily: 'NotoSansJP-Bold',
    marginBottom: 4,
  },
  networkPerformanceLabel: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Regular',
    textAlign: 'center',
  },
});

// Settings-specific styles
export const createSettingsStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  // Section
  section: {
    marginBottom: 24,
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingsSectionTitle: {
    fontSize: 18,
    fontFamily: 'NotoSansJP-SemiBold',
    marginBottom: 12,
  },
  sectionContent: {
    gap: 4,
  },
  settingsSectionContent: {
    gap: 4,
  },
  
  // Setting Buttons
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
    minHeight: 72,
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
    lineHeight: 16,
  },
  settingRight: {
    marginLeft: 16,
  },
  settingsButton: {
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
    minHeight: 72,
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingsInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  settingsTitle: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-SemiBold',
    marginBottom: 2,
  },
  settingsSubtitle: {
    fontSize: 13,
    fontFamily: 'NotoSansJP-Regular',
    lineHeight: 18,
  },
  settingsRight: {
    marginLeft: 16,
  },
  
  // Selectors
  selector: {
    marginHorizontal: 0,
    marginTop: 4,
    marginBottom: 0,
    borderRadius: 12,
    padding: 16,
  },
  selectorOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  selectorOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  selectorOptionText: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Medium',
  },
  languageGrid: {
    gap: 8,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  languageText: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-Medium',
  },
  settingsSelector: {
    marginHorizontal: 0,
    marginTop: 4,
    marginBottom: 0,
    borderRadius: 12,
    padding: 16,
  },
  settingsSelectorOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  settingsSelectorOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  settingsSelectorOptionText: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Medium',
  },
  settingsLanguageGrid: {
    gap: 8,
  },
  settingsLanguageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  settingsLanguageText: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-Medium',
  },
  
  // Version Info
  versionInfo: {
    marginBottom: 32,
  },
  versionCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  versionText: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-SemiBold',
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Regular',
  },
  settingsVersionInfo: {
    marginBottom: 32,
  },
  settingsVersionCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  settingsVersionText: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-SemiBold',
    marginBottom: 4,
  },
  settingsVersionSubtext: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Regular',
  },
});

// Master function that returns all styles
export const createTabStyles = (
  colors: any, 
  isDark: boolean, 
  screenDimensions?: any, 
  isTablet?: boolean, 
  isLargeScreen?: boolean, 
  isSmallScreen?: boolean
) => ({
  common: createCommonStyles(colors, isDark),
  ar: createArStyles(colors, isDark),
  button: createButtonStyles(colors, isDark),
  chat: createChatStyles(colors, isDark),
  devices: createDevicesStyles(colors, isDark),
  index: createIndexStyles(colors, isDark, screenDimensions, isTablet, isLargeScreen, isSmallScreen),
  network: createNetworkStyles(colors, isDark),
  settings: createSettingsStyles(colors, isDark),
});