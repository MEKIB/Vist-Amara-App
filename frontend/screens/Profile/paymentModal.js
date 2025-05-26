import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Modal,
    TextInput,
    Alert,
    ActivityIndicator,
    Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import WebView from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store'; // Add this import

const PaymentModal = ({ visible, onClose, bookingDetails, user, onPaymentSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('chapa');
  const [selectedChapaOption, setSelectedChapaOption] = useState(null);
  const [mobilePaymentDetails, setMobilePaymentDetails] = useState({
    phoneNumber: user?.phone || '',
    fullName: user?.firstName && user?.middleName 
      ? `${user.firstName} ${user.middleName}` 
      : user?.firstName || '',
  });
  const [loading, setLoading] = useState(false);
  const [testMode] = useState(true); // Fixed to test mode
  const [showWebView, setShowWebView] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [txRef, setTxRef] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const webViewRef = useRef(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const BACKEND_API_URL = 'http://192.168.213.185:2000'; // Adjust based on your setup
  const CALLBACK_URL = 'https://74c2-213-55-102-49.ngrok-free.app/webhook/chapa';
  const RETURN_URL = 'https://74c2-213-55-102-49.ngrok-free.app/payment-complete';

  const generateTxRef = (options = {}) => {
    const { prefix = 'TX', size = 15, removePrefix = false } = options;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < size; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return removePrefix ? result : `${prefix}-${result}`;
  };

  const validatePhoneNumber = (phone) => {
    const ethiopianPhoneRegex = /^09\d{8}$/;
    return ethiopianPhoneRegex.test(phone);
  };

  const handleChapaOptionChange = (option) => {
    setSelectedChapaOption(option);
    const fullName = user?.firstName && user?.middleName 
      ? `${user.firstName} ${user.middleName}` 
      : user?.firstName || '';
    setMobilePaymentDetails({
      phoneNumber: user?.phone || '',
      fullName,
    });
  };

  const showAlert = (title, message, onOk = () => {}) => {
    Alert.alert(title, message, [{ text: 'OK', onPress: onOk }], { cancelable: false });
  };

  const showSuccessNotification = (message, onOk = () => {}) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      setShowSuccessModal(false);
      onOk();
    }, 3000);
  };

  const createBookingHistory = async (tx_ref) => {
    try {
      const token = await SecureStore.getItemAsync('jwtToken');
      if (!user?.id) {
        throw new Error('User ID not found');
      }

      if (!bookingDetails.hotelAdminId) {
        throw new Error('Hotel Admin ID not provided');
      }

      const bookingHistoryData = {
        userId: user.id,
        hotelAdminId: bookingDetails.hotelAdminId,
        hotelName: bookingDetails.hotelName,
        roomType: bookingDetails.roomType,
        roomNumber: bookingDetails.roomNumbers[0],
        checkInDate: bookingDetails.checkInDate,
        checkOutDate: bookingDetails.checkOutDate,
        totalPrice: parseFloat(bookingDetails.totalPrice),
        image: bookingDetails.image || 'https://via.placeholder.com/500x180?text=No+Image',
        guests: bookingDetails.numberOfRooms || 1,
        tx_ref,
      };

      const response = await axios.post(
        `${BACKEND_API_URL}/api/bookingHistory/create`,
        bookingHistoryData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Booking history created:', response.data);
      if (bookingDetails.reservationId && bookingDetails.title) {
        onPaymentSuccess(bookingDetails.reservationId, bookingDetails.title);
      }
    } catch (error) {
      console.error('Error creating booking history:', error);
      showAlert('Error', error.response?.data?.message || 'Failed to save booking history');
    }
  };

  const verifyTransaction = async (tx_ref) => {
    try {
      const verifyResponse = await axios.get(
        `${BACKEND_API_URL}/api/chapa/verify/${tx_ref}`
      );
      console.log('Verification response:', verifyResponse.data);
      return verifyResponse.data;
    } catch (error) {
      console.error('Verification error:', error);
      throw error;
    }
  };

  const handlePay = async () => {
    if (!selectedChapaOption) {
      showAlert('Error', 'Please select a payment option');
      return;
    }
    if (!mobilePaymentDetails.phoneNumber || !mobilePaymentDetails.fullName) {
      showAlert('Error', 'Please fill all required fields for mobile payment');
      return;
    }
    if (!validatePhoneNumber(mobilePaymentDetails.phoneNumber)) {
      showAlert('Error', 'Please enter a valid Ethiopian phone number (09XXXXXXXX)');
      return;
    }

    setLoading(true);

    try {
      const tx_ref = generateTxRef();
      setTxRef(tx_ref);
      const [first_name, ...last_name_parts] = mobilePaymentDetails.fullName.split(' ');
      const last_name = last_name_parts.join(' ') || 'User';

      const etbAmount = Number(bookingDetails.totalPrice).toFixed(2);

      const initData = {
        amount: etbAmount,
        currency: 'ETB',
        email: user?.email || `test+${tx_ref}@gmail.com`,
        first_name,
        last_name,
        phone_number: mobilePaymentDetails.phoneNumber,
        tx_ref,
        callback_url: CALLBACK_URL,
        return_url: `${RETURN_URL}?tx_ref=${tx_ref}`,
        customization: {
          title: 'VISIT AMHARA',
          description: `Booking for ${bookingDetails.roomType}`,
        },
      };

      console.log('Sending request to backend with data:', initData);
      const initResponse = await axios.post(
        `${BACKEND_API_URL}/api/chapa/initialize`,
        initData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Initialization response:', initResponse.data);

      if (initResponse.data.status !== 'success') {
        throw new Error(initResponse.data.message || 'Failed to initialize transaction');
      }

      const checkoutUrl = initResponse.data.data.checkout_url;
      console.log('Opening WebView with Checkout URL:', checkoutUrl);
      setCheckoutUrl(checkoutUrl);
      setShowWebView(true);
    } catch (error) {
      console.error('Payment error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      let errorMessage = 'Payment processing failed';
      if (error.response) {
        errorMessage = error.response.data.message || `Error ${error.response.status}: ${error.message}`;
      } else if (error.request) {
        errorMessage = 'No response received from server';
      }
      showAlert('Payment Failed', errorMessage);
      setLoading(false);
    }
  };

  const handleWebViewNavigationStateChange = async (navState) => {
    const { url } = navState;
    if (url.startsWith(RETURN_URL)) {
      console.log('Detected return_url, verifying transaction:', txRef);
      setShowWebView(false);
      setLoading(true);
      try {
        const verifyResponse = await verifyTransaction(txRef);
        if (verifyResponse.data.status === 'success') {
          showSuccessNotification(
            `Test payment successful! ${verifyResponse.data.currency} ${verifyResponse.data.amount} paid. Transaction: ${txRef}`,
            () => {
              createBookingHistory(txRef);
              setTimeout(() => {
                setLoading(false);
                onClose();
              }, 500);
            }
          );
        } else if (verifyResponse.data.status === 'pending') {
          showAlert('Payment Pending', 'Payment is still pending. Please check back later.', () => {
            setLoading(false);
          });
        } else {
          showAlert('Payment Failed', `Payment failed: ${verifyResponse.data.status}`, () => {
            setLoading(false);
          });
        }
      } catch (error) {
        console.error('Verification error:', error);
        showAlert('Payment failed', error.response?.data?.message || 'Verification failed', () => {
          setLoading(false);
        });
      }
    }
  };

  const handleWebViewError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    showAlert('WebView Error', `Failed to load payment page: ${nativeEvent.description}`);
    setShowWebView(false);
    setLoading(false);
  };

  if (!bookingDetails) return null;

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.paymentModalOverlay}>
          <View style={styles.paymentModalContainer}>
            {showWebView ? (
              <View style={styles.webViewContainer}>
                <WebView
                  ref={webViewRef}
                  source={{ uri: checkoutUrl }}
                  style={styles.webView}
                  onNavigationStateChange={handleWebViewNavigationStateChange}
                  onError={handleWebViewError}
                  startInLoadingState={true}
                  renderLoading={() => (
                    <ActivityIndicator size="large" color="#00ADB5" style={styles.webViewLoading} />
                  )}
                />
                <TouchableOpacity
                  style={styles.closeWebViewButton}
                  onPress={() => {
                    setShowWebView(false);
                    setLoading(false);
                  }}
                >
                  <MaterialIcons name="close" size={24} color="#EEEEEE" />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.paymentModalHeader}>
                  <Text style={styles.paymentModalTitle}>Complete Your Booking</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <MaterialIcons name="close" size={24} color="#EEEEEE" />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.paymentModalContent}>
                  {testMode && (
                    <View style={styles.testModeBanner}>
                      <Text style={styles.testModeText}>
                        You're in test mode. Transactions will appear on the Chapa dashboard but won't process real payments.
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Booking Summary</Text>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Hotel:</Text>
                      <Text style={styles.summaryValue}>{bookingDetails?.hotelName}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Room Type:</Text>
                      <Text style={styles.summaryValue}>{bookingDetails?.roomType}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Rooms:</Text>
                      <Text style={styles.summaryValue}>{bookingDetails?.roomNumbers.join(', ')}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Check-in:</Text>
                      <Text style={styles.summaryValue}>{bookingDetails?.checkInDate}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Check-out:</Text>
                      <Text style={styles.summaryValue}>{bookingDetails?.checkOutDate}</Text>
                    </View>
                    
                    <View style={styles.summaryDivider} />
                    
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, styles.totalLabel]}>Total:</Text>
                      <Text style={[styles.summaryValue, styles.totalValue]}>ETB {Number(bookingDetails?.totalPrice).toFixed(2)}</Text>
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    
                    <View style={styles.paymentMethods}>
                      <TouchableOpacity 
                        style={[
                          styles.paymentMethodButton, 
                          paymentMethod === 'chapa' && styles.selectedPaymentMethod
                        ]}
                        onPress={() => setPaymentMethod('chapa')}
                      >
                        <View style={styles.paymentMethodContent}>
                          <Image source={require('../../assets/logo/Chapa.png')} style={styles.paymentMethodLogo} />
                          <Text style={styles.paymentMethodText}>Chapa</Text>
                        </View>
                        <View style={[
                          styles.radioOuter,
                          paymentMethod === 'chapa' && styles.radioOuterSelected
                        ]}>
                          {paymentMethod === 'chapa' && (
                            <View style={styles.radioInner} />
                          )}
                        </View>
                      </TouchableOpacity>
                    </View>

                    {paymentMethod === 'chapa' && (
                      <View style={styles.chapaOptions}>
                        <Text style={styles.subtitle}>Select payment option:</Text>
                        
                        <TouchableOpacity 
                          style={[
                            styles.chapaOption,
                            selectedChapaOption === 'telebirr' && styles.selectedChapaOption
                          ]}
                          onPress={() => handleChapaOptionChange('telebirr')}
                        >
                          <Image source={require('../../assets/logo/TeleBirr.png')} style={styles.chapaOptionLogo} />
                          <Text style={styles.chapaOptionText}>Telebirr</Text>
                          <View style={[
                            styles.radioOuter,
                            selectedChapaOption === 'telebirr' && styles.radioOuterSelected
                          ]}>
                            {selectedChapaOption === 'telebirr' && (
                              <View style={styles.radioInner} />
                            )}
                          </View>
                        </TouchableOpacity>
                        
                        {selectedChapaOption === 'telebirr' && (
                          <View style={styles.paymentForm}>
                            <TextInput
                              style={styles.input}
                              placeholder="Phone Number"
                              placeholderTextColor="#888"
                              value={mobilePaymentDetails.phoneNumber}
                              editable={false}
                              keyboardType="phone-pad"
                            />
                            {mobilePaymentDetails.phoneNumber && !validatePhoneNumber(mobilePaymentDetails.phoneNumber) && (
                              <Text style={styles.errorText}>Please enter a valid Ethiopian phone number (09XXXXXXXX)</Text>
                            )}
                            
                            <TextInput
                              style={styles.input}
                              placeholder="Full Name"
                              placeholderTextColor="#888"
                              value={mobilePaymentDetails.fullName}
                              editable={false}
                            />
                            
                            <TouchableOpacity 
                              style={styles.payButton}
                              onPress={handlePay}
                              disabled={loading}
                            >
                              {loading ? (
                                <ActivityIndicator color="#EEEEEE" />
                              ) : (
                                <Text style={styles.payButtonText}>
                                  Test Telebirr Payment
                                </Text>
                              )}
                            </TouchableOpacity>
                          </View>
                        )}
                        
                        <TouchableOpacity 
                          style={[
                            styles.chapaOption,
                            selectedChapaOption === 'cbe' && styles.selectedChapaOption
                          ]}
                          onPress={() => handleChapaOptionChange('cbe')}
                        >
                          <Image source={require('../../assets/logo/CBEBirr.png')} style={styles.chapaOptionLogo} />
                          <Text style={styles.chapaOptionText}>CBE Birr</Text>
                          <View style={[
                            styles.radioOuter,
                            selectedChapaOption === 'cbe' && styles.radioOuterSelected
                          ]}>
                            {selectedChapaOption === 'cbe' && (
                              <View style={styles.radioInner} />
                            )}
                          </View>
                        </TouchableOpacity>
                        
                        {selectedChapaOption === 'cbe' && (
                          <View style={styles.paymentForm}>
                            <TextInput
                              style={styles.input}
                              placeholder="Phone Number"
                              placeholderTextColor="#888"
                              value={mobilePaymentDetails.phoneNumber}
                              editable={false}
                              keyboardType="phone-pad"
                            />
                            {mobilePaymentDetails.phoneNumber && !validatePhoneNumber(mobilePaymentDetails.phoneNumber) && (
                              <Text style={styles.errorText}>Please enter a valid Ethiopian phone number (09XXXXXXXX)</Text>
                            )}
                            
                            <TextInput
                              style={styles.input}
                              placeholder="Full Name"
                              placeholderTextColor="#888"
                              value={mobilePaymentDetails.fullName}
                              editable={false}
                            />
                            
                            <TouchableOpacity 
                              style={styles.payButton}
                              onPress={handlePay}
                              disabled={loading}
                            >
                              {loading ? (
                                <ActivityIndicator color="#EEEEEE" />
                              ) : (
                                <Text style={styles.payButtonText}>
                                  Test CBE Birr Payment
                                </Text>
                              )}
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    )}
                    
                    <View style={styles.secureBadge}>
                      <MaterialIcons name="verified" size={20} color="#00ADB5" />
                      <Text style={styles.secureBadgeText}>Secure Payment</Text>
                    </View>
                  </View>
                </ScrollView>
                
                <View style={styles.paymentModalFooter}>
                  <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="none"
      >
        <View style={styles.successModalOverlay}>
          <Animated.View style={[styles.successModalContainer, { transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient
              colors={['#00ADB5', '#4ECDC4']}
              style={styles.successModalGradient}
            >
              <View style={styles.successIconContainer}>
                <MaterialIcons name="check-circle" size={80} color="#FFFFFF" />
              </View>
              <Text style={styles.successModalTitle}>Payment Successful!</Text>
              <Text style={styles.successModalMessage}>{successMessage}</Text>
              <TouchableOpacity
                style={styles.successModalButton}
                onPress={() => setShowSuccessModal(false)}
              >
                <Text style={styles.successModalButtonText}>Continue</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  paymentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentModalContainer: {
    backgroundColor: '#222831',
    borderRadius: 15,
    width: '95%',
    height: '90%',
    overflow: 'hidden',
  },
  paymentModalHeader: {
    backgroundColor: '#393E46',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentModalTitle: {
    color: '#EEEEEE',
    fontSize: 20,
    fontWeight: 'bold',
  },
  paymentModalContent: {
    padding: 15,
  },
  paymentModalFooter: {
    backgroundColor: '#393E46',
    padding: 10,
    alignItems: 'flex-end',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#00ADB5',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    color: '#EEEEEE',
    fontSize: 16,
  },
  summaryValue: {
    color: '#EEEEEE',
    fontSize: 16,
    fontWeight: '500',
  },
  summaryDivider: {
    backgroundColor: '#00ADB5',
    height: 1,
    marginVertical: 15,
  },
  totalLabel: {
    fontWeight: 'bold',
  },
  totalValue: {
    color: '#00ADB5',
    fontWeight: 'bold',
  },
  paymentMethods: {
    marginBottom: 15,
  },
  paymentMethodButton: {
    borderWidth: 1,
    borderColor: '#393E46',
    borderRadius: 5,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedPaymentMethod: {
    backgroundColor: 'rgba(0, 173, 181, 0.1)',
    borderColor: '#00ADB5',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodLogo: {
    width: 30,
    height: 20,
    resizeMode: 'contain',
    marginRight: 10,
  },
  paymentMethodText: {
    color: '#EEEEEE',
    fontSize: 14,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#00ADB5',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00ADB5',
  },
  chapaOptions: {
    marginTop: 10,
  },
  subtitle: {
    color: '#EEEEEE',
    fontSize: 14,
    marginBottom: 10,
  },
  chapaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#393E46',
    borderRadius: 5,
    marginBottom: 10,
  },
  selectedChapaOption: {
    backgroundColor: 'rgba(0, 173, 181, 0.1)',
    borderColor: '#00ADB5',
  },
  chapaOptionLogo: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    marginRight: 10,
  },
  chapaOptionText: {
    color: '#EEEEEE',
    fontSize: 14,
    flex: 1,
  },
  paymentForm: {
    marginTop: 10,
  },
  input: {
    backgroundColor: '#393E46',
    color: '#EEEEEE',
    padding: 12,
    borderRadius: 5,
    marginBottom: 10,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginBottom: 10,
  },
  payButton: {
    backgroundColor: '#00ADB5',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  payButtonText: {
    color: '#EEEEEE',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secureBadge: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 173, 181, 0.1)',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
    justifyContent: 'center',
  },
  secureBadgeText: {
    color: '#00ADB5',
    fontSize: 14,
    marginLeft: 5,
  },
  closeButton: {
    padding: 5,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    padding: 10,
  },
  cancelButtonText: {
    color: '#EEEEEE',
    fontSize: 16,
  },
  webViewContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#222831',
  },
  webView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  webViewLoading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
  closeWebViewButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#393E46',
    borderRadius: 20,
    padding: 5,
    elevation: 5,
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContainer: {
    width: '80%',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
  },
  successModalGradient: {
    padding: 30,
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successModalTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  successModalMessage: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  successModalButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  successModalButtonText: {
    color: '#00ADB5',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentModal;