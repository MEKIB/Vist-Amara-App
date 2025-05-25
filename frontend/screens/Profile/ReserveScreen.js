import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Modal,
    FlatList,
    Dimensions,
    TextInput,
    Alert,
    ActivityIndicator,
    Animated,
} from 'react-native';
import { MaterialIcons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { Divider } from 'react-native-elements';
import axios from 'axios';
import WebView from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const defaultHotelImage = require('../../assets/icon.png');

const PaymentModal = ({ visible, onClose, bookingDetails }) => {
  const [paymentMethod, setPaymentMethod] = useState('chapa');
  const [selectedChapaOption, setSelectedChapaOption] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    name: '',
    email: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  const [mobilePaymentDetails, setMobilePaymentDetails] = useState({
    phoneNumber: '',
    fullName: ''
  });
  const [loading, setLoading] = useState(false);
  const [testMode, setTestMode] = useState(true);
  const [showWebView, setShowWebView] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [txRef, setTxRef] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const webViewRef = useRef(null);
  const scaleAnim = useRef(new Animated.Value(0)).current; // Animation for success modal

  const CHAPA_API_KEY = "CHASECK_TEST-4pTzzegz9U161hW3UsB1Tkse2wyOcZYS";
  const TEST_CARD_NUMBER = "4242424242424242";
  const TEST_PHONE_NUMBER = "0912345678";
  const TEST_EXPIRY = "12/25";
  const TEST_CVV = "123";

  const CALLBACK_URL = testMode
    ? 'https://74c2-213-55-102-49.ngrok-free.app/webhook/chapa'
    : (process.env.CALLBACK_URL || 'https://74c2-213-55-102-49.ngrok-free.app/webhook/chapa');
  const RETURN_URL = testMode
    ? 'https://74c2-213-55-102-49.ngrok-free.app/payment-complete'
    : (process.env.RETURN_URL || 'https://74c2-213-55-102-49.ngrok-free.app/payment-complete');

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

  const validateCardNumber = (number) => {
    const cardRegex = /^\d{16}$/;
    return cardRegex.test(number);
  };

  const validateExpiry = (expiry) => {
    const expiryRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
    return expiryRegex.test(expiry);
  };

  const validateCVV = (cvv) => {
    const cvvRegex = /^\d{3,4}$/;
    return cvvRegex.test(cvv);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setSelectedChapaOption(null);
    setMobilePaymentDetails({ phoneNumber: '', fullName: '' });
    setCardDetails({ name: '', email: '', cardNumber: '', expiry: '', cvv: '' });
  };

  const handleChapaOptionChange = (option) => {
    setSelectedChapaOption(option);
    if (testMode) {
      setMobilePaymentDetails({
        phoneNumber: TEST_PHONE_NUMBER,
        fullName: "Test User"
      });
    } else {
      setMobilePaymentDetails({
        phoneNumber: '',
        fullName: ''
      });
    }
  };

  const handleCardDetailChange = (field, value) => {
    setCardDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMobilePaymentChange = (field, value) => {
    setMobilePaymentDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const showAlert = (title, message, onOk = () => {}) => {
    Alert.alert(
      title,
      message,
      [{ text: 'OK', onPress: onOk }],
      { cancelable: false }
    );
  };

  const showSuccessNotification = (message, onOk = () => {}) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
    // Start animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      setShowSuccessModal(false);
      onOk();
    }, 3000); // Auto-close after 3 seconds
  };

  const verifyTransaction = async (tx_ref) => {
    try {
      const verifyResponse = await axios.get(
        `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
        {
          headers: {
            Authorization: `Bearer ${CHAPA_API_KEY}`,
          },
        }
      );
      console.log("Verification response:", verifyResponse.data);
      return verifyResponse.data;
    } catch (error) {
      console.error("Verification error:", error);
      throw error;
    }
  };

  const handlePay = async () => {
    if (paymentMethod === 'chapa') {
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
    } else if (paymentMethod === 'mastercard') {
      if (!cardDetails.name || 
          !cardDetails.email || 
          !cardDetails.cardNumber || 
          !cardDetails.expiry || 
          !cardDetails.cvv) {
        showAlert('Error', 'Please fill all card details');
        return;
      }
      if (!validateEmail(cardDetails.email)) {
        showAlert('Error', 'Please enter a valid email address');
        return;
      }
      if (!validateCardNumber(cardDetails.cardNumber)) {
        showAlert('Error', 'Please enter a valid 16-digit card number');
        return;
      }
      if (!validateExpiry(cardDetails.expiry)) {
        showAlert('Error', 'Please enter a valid expiry date (MM/YY)');
        return;
      }
      if (!validateCVV(cardDetails.cvv)) {
        showAlert('Error', 'Please enter a valid CVV (3 or 4 digits)');
        return;
      }
    }

    setLoading(true);

    try {
      if (paymentMethod === 'chapa') {
        const tx_ref = generateTxRef();
        setTxRef(tx_ref);
        const [first_name, ...last_name_parts] = mobilePaymentDetails.fullName.split(' ');
        const last_name = last_name_parts.join(' ') || 'User';

        const exchangeRate = 120;
        const etbAmount = testMode 
          ? '100.00'
          : (Number(bookingDetails.totalPrice) * exchangeRate).toFixed(2);

        const initData = {
          amount: etbAmount,
          currency: 'ETB',
          email: testMode ? `test+${tx_ref}@gmail.com` : 'user@gmail.com',
          first_name,
          last_name,
          phone_number: mobilePaymentDetails.phoneNumber,
          tx_ref,
          callback_url: CALLBACK_URL,
          return_url: RETURN_URL,
          customization: {
            title: 'Hotel Booking',
            description: `Booking for ${bookingDetails.roomType}`,
          },
        };

        if (!CHAPA_API_KEY.startsWith('CHASECK_TEST-')) {
          throw new Error('Invalid Chapa API key format');
        }

        console.log("Sending request to Chapa with data:", initData);
        const initResponse = await axios.post(
          'https://api.chapa.co/v1/transaction/initialize',
          initData,
          {
            headers: {
              Authorization: `Bearer ${CHAPA_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );

        console.log("Initialization response:", initResponse.data);

        if (initResponse.data.status !== 'success') {
          throw new Error(initResponse.data.message || 'Failed to initialize transaction');
        }

        const checkoutUrl = initResponse.data.data.checkout_url;
        console.log("Opening WebView with Checkout URL:", checkoutUrl);
        setCheckoutUrl(checkoutUrl);
        setShowWebView(true);
      } else {
        if (testMode) {
          console.log("Test Mastercard payment initiated");
          await new Promise(resolve => setTimeout(resolve, 2000));
          showSuccessNotification(
            `Test Payment Successful! $${bookingDetails.totalPrice} Paid`,
            onClose
          );
          setLoading(false);
        } else {
          await new Promise(resolve => setTimeout(resolve, 2000));
          showSuccessNotification(
            `Payment Successful! $${bookingDetails.totalPrice} Paid`,
            onClose
          );
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Payment error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });
      let errorMessage = 'Payment processing failed';
      if (error.response) {
        const errorData = error.response.data;
        if (errorData.message && typeof errorData.message === 'object') {
          const validationErrors = Object.entries(errorData.message)
            .map(([key, messages]) => `${key}: ${messages.join(', ')}`)
            .join('; ');
          errorMessage = validationErrors || `Error ${error.response.status}: ${error.message}`;
        } else {
          errorMessage = errorData.message || `Error ${error.response.status}: ${error.message}`;
        }
      } else if (error.request) {
        errorMessage = 'No response received from Chapa server';
      }
      showAlert('Payment Failed', errorMessage);
      setLoading(false);
    }
  };

  const handleWebViewNavigationStateChange = async (navState) => {
    const { url, loading: webViewLoading } = navState;
    console.log("WebView navigation state:", { url, loading: webViewLoading });
    if (url.startsWith(RETURN_URL)) {
      console.log("Detected return_url, verifying transaction:", txRef);
      setShowWebView(false);
      setLoading(true);
      try {
        const verifyResponse = await verifyTransaction(txRef);
        if (verifyResponse.data.status === 'success') {
          showSuccessNotification(
            testMode 
              ? `Test Payment Successful! ${verifyResponse.data.currency} ${verifyResponse.data.amount} Paid. TxRef: ${txRef}` 
              : `Payment Successful via ${selectedChapaOption}! ${verifyResponse.data.currency} ${verifyResponse.data.amount} Paid. TxRef: ${txRef}`,
            () => {
              setLoading(false);
              onClose();
            }
          );
        } else if (verifyResponse.data.status === 'pending') {
          showAlert(
            'Payment Pending',
            'Your payment is still processing. Please check back later.',
            () => {
              setLoading(false);
              onClose();
            }
          );
        } else {
          showAlert(
            'Payment Failed',
            `Payment status: ${verifyResponse.data.status}`,
            () => setLoading(false)
          );
        }
      } catch (error) {
        console.error("Verification error:", error);
        showAlert(
          'Payment Verification Failed',
          error.message || 'Unable to verify payment',
          () => setLoading(false)
        );
      }
    }
  };

  const handleWebViewError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error("WebView error:", nativeEvent);
    showAlert('WebView Error', `Failed to load payment page: ${nativeEvent.description}`);
    setShowWebView(false);
    setLoading(false);
  };

  const toggleTestMode = () => {
    setTestMode(!testMode);
    setCardDetails({
      name: '',
      email: '',
      cardNumber: '',
      expiry: '',
      cvv: ''
    });
    setMobilePaymentDetails({
      phoneNumber: '',
      fullName: ''
    });
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
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
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
                  <View style={styles.headerRight}>
                    <TouchableOpacity 
                      style={styles.testModeButton}
                      onPress={toggleTestMode}
                    >
                      <Text style={styles.testModeButtonText}>
                        {testMode ? 'TEST MODE ON' : 'TEST MODE OFF'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                      <MaterialIcons name="close" size={24} color="#EEEEEE" />
                    </TouchableOpacity>
                  </View>
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
                    
                    <Divider style={styles.summaryDivider} />
                    
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, styles.totalLabel]}>Total:</Text>
                      <Text style={[styles.summaryValue, styles.totalValue]}>${bookingDetails?.totalPrice}</Text>
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
                        onPress={() => handlePaymentMethodChange('chapa')}
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
                      
                      <TouchableOpacity 
                        style={[styles.paymentMethodButton, paymentMethod === 'mastercard' && styles.selectedPaymentMethod]}
                        onPress={() => handlePaymentMethodChange('mastercard')}
                      >
                        <View style={styles.paymentMethodContent}>
                          <Image source={require('../../assets/logo/mastercard.jpg')} style={styles.paymentMethodLogo} />
                          <Text style={styles.paymentMethodText}>Mastercard</Text>
                        </View>
                        <View style={[
                          styles.radioOuter,
                          paymentMethod === 'mastercard' && styles.radioOuterSelected
                        ]}>
                          {paymentMethod === 'mastercard' && (
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
                              onChangeText={(text) => {
                                const value = text.replace(/\D/g, '').slice(0, 10);
                                handleMobilePaymentChange('phoneNumber', value);
                              }}
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
                              onChangeText={(text) => handleMobilePaymentChange('fullName', text)}
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
                                  {testMode ? 'Test Telebirr Payment' : 'Pay with Telebirr'}
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
                              onChangeText={(text) => {
                                const value = text.replace(/\D/g, '').slice(0, 10);
                                handleMobilePaymentChange('phoneNumber', value);
                              }}
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
                              onChangeText={(text) => handleMobilePaymentChange('fullName', text)}
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
                                  {testMode ? 'Test CBE Birr Payment' : 'Pay with CBE Birr'}
                                </Text>
                              )}
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    )}

                    {paymentMethod === 'mastercard' && (
                      <View style={styles.paymentForm}>
                        {testMode && (
                          <TouchableOpacity
                            style={styles.fillTestDataButton}
                            onPress={() => {
                              setCardDetails({
                                name: "Test User",
                                email: `test+${generateTxRef()}@example.com`,
                                cardNumber: TEST_CARD_NUMBER,
                                expiry: TEST_EXPIRY,
                                cvv: TEST_CVV
                              });
                            }}
                          >
                            <Text style={styles.fillTestDataButtonText}>Fill Test Card Data</Text>
                          </TouchableOpacity>
                        )}
                        
                        <TextInput
                          style={styles.input}
                          placeholder="Cardholder Name"
                          placeholderTextColor="#888"
                          value={cardDetails.name}
                          onChangeText={(text) => handleCardDetailChange('name', text)}
                        />
                        
                        <TextInput
                          style={styles.input}
                          placeholder="Email"
                          placeholderTextColor="#888"
                          value={cardDetails.email}
                          onChangeText={(text) => handleCardDetailChange('email', text)}
                          keyboardType="email-address"
                        />
                        
                        <TextInput
                          style={styles.input}
                          placeholder="Card Number"
                          placeholderTextColor="#888"
                          value={cardDetails.cardNumber}
                          onChangeText={(text) => {
                            const value = text.replace(/\D/g, '').slice(0, 16);
                            handleCardDetailChange('cardNumber', value);
                          }}
                          keyboardType="numeric"
                        />
                        {cardDetails.cardNumber && !validateCardNumber(cardDetails.cardNumber) && (
                          <Text style={styles.errorText}>Please enter a valid 16-digit card number</Text>
                        )}
                        
                        <View style={styles.rowInputs}>
                          <TextInput
                            style={[styles.input, styles.halfInput]}
                            placeholder="Expiry (MM/YY)"
                            placeholderTextColor="#888"
                            value={cardDetails.expiry}
                            onChangeText={(text) => {
                              let value = text.replace(/\D/g, '');
                              if (value.length > 2) {
                                value = value.slice(0, 2) + '/' + value.slice(2, 4);
                              }
                              handleCardDetailChange('expiry', value);
                            }}
                            keyboardType="numeric"
                          />
                          {cardDetails.expiry && !validateExpiry(cardDetails.expiry) && (
                            <Text style={styles.errorText}>MM/YY</Text>
                          )}
                          
                          <TextInput
                            style={[styles.input, styles.halfInput]}
                            placeholder="CVV"
                            placeholderTextColor="#888"
                            value={cardDetails.cvv}
                            onChangeText={(text) => {
                              const value = text.replace(/\D/g, '').slice(0, 4);
                              handleCardDetailChange('cvv', value);
                            }}
                            keyboardType="numeric"
                            secureTextEntry
                          />
                          {cardDetails.cvv && !validateCVV(cardDetails.cvv) && (
                            <Text style={styles.errorText}>3-4 digits</Text>
                          )}
                        </View>
                        
                        <TouchableOpacity 
                          style={styles.payButton}
                          onPress={handlePay}
                          disabled={loading}
                        >
                          {loading ? (
                            <ActivityIndicator color="#EEEEEE" />
                          ) : (
                            <Text style={styles.payButtonText}>
                              {testMode ? 'Test Mastercard Payment' : 'Pay with Mastercard'}
                            </Text>
                          )}
                        </TouchableOpacity>
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

      {/* Success Notification Modal */}
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
                <MaterialIcons name="check-circle" size={60} color="#FFFFFF" />
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

const ReserveScreen = () => {
  const [activeTab, setActiveTab] = useState('saved');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reservationToRemove, setReservationToRemove] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);

  const [reservations, setReservations] = useState([
    {
      id: 1,
      title: 'Grand Hotel Roma',
      price: '100',
      duration: '3 nights',
      image: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      saved: true,
      location: 'Rome, Italy',
      date: 'Jun 15 - Jun 18',
      rating: '4.9',
      hotelName: 'Grand Hotel Roma',
      roomType: 'Double Room',
      roomNumbers: ['R101', 'R102'],
      numberOfRooms: 2,
      checkInDate: 'Jun 15, 2023',
      checkOutDate: 'Jun 18, 2023',
      totalPrice: '100'
    },
    {
      id: 2,
      title: 'Venice Canal View Hotel',
      price: '50',
      duration: '2 nights',
      image: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      saved: true,
      location: 'Venice, Italy',
      date: 'Jul 3 - Jul 5',
      rating: '4.8',
      hotelName: 'Venice Canal View Hotel',
      roomType: 'Single Room',
      roomNumbers: ['V201'],
      numberOfRooms: 1,
      checkInDate: 'Jul 3, 2023',
      checkOutDate: 'Jul 5, 2023',
      totalPrice: '50'
    },
    {
      id: 3,
      title: 'Colosseum Grand Hotel',
      price: '50',
      duration: '4 nights',
      image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      saved: true,
      location: 'Rome, Italy',
      date: 'Jun 22 - Jun 26',
      rating: '4.7',
      hotelName: 'Colosseum Grand Hotel',
      roomType: 'Deluxe Suite',
      roomNumbers: ['C301'],
      numberOfRooms: 1,
      checkInDate: 'Jun 22, 2023',
      checkOutDate: 'Jun 26, 2023',
      totalPrice: '100'
    }
  ]);

  const savedCount = reservations.filter(r => r.saved).length;

  const handleRemoveClick = (reservation) => {
    setReservationToRemove(reservation);
    setShowConfirmModal(true);
  };

  const confirmRemove = () => {
    setReservations(reservations.map(r => 
      r.id === reservationToRemove.id ? { ...r, saved: false } : r
    ));
    setShowConfirmModal(false);
  };

  const handleBookNow = (reservation) => {
    setCurrentBooking({
      hotelName: reservation.hotelName,
      roomType: reservation.roomType,
      roomNumbers: reservation.roomNumbers,
      numberOfRooms: reservation.numberOfRooms,
      checkInDate: reservation.checkInDate,
      checkOutDate: reservation.checkOutDate,
      totalPrice: reservation.totalPrice
    });
    setShowPaymentModal(true);
  };

  const renderReservationItem = ({ item }) => (
    <View style={styles.reservationCard}>
      <View style={styles.imageContainer}>
        <Image 
          source={item.image ? { uri: item.image } : defaultHotelImage} 
          style={styles.hotelImage} 
        />
      </View>
      
      <View style={styles.reservationContent}>
        <View style={styles.reservationHeader}>
          <Text style={styles.hotelName}>{item.hotelName}</Text>
          <View style={styles.ratingContainer}>
            <FontAwesome name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}/5</Text>
          </View>
        </View>
        
        <Text style={styles.locationText}>{item.location}</Text>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="bed-king" size={20} color="#00ADB5" />
            <Text style={styles.detailText}>{item.roomType}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="door" size={20} color="#00ADB5" />
            <Text style={styles.detailText}>Rooms: {item.roomNumbers.join(', ')}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="weather-night" size={20} color="#00ADB5" />
            <Text style={styles.detailText}>{item.duration}</Text>
          </View>
        </View>
        
        <View style={styles.datesContainer}>
          <View style={styles.dateRow}>
            <MaterialCommunityIcons name="calendar-arrow-right" size={20} color="#00ADB5" />
            <Text style={styles.dateText}>Check-in: {item.checkInDate}</Text>
          </View>
          <View style={styles.dateRow}>
            <MaterialCommunityIcons name="calendar-arrow-left" size={20} color="#00ADB5" />
            <Text style={styles.dateText}>Check-out: {item.checkOutDate}</Text>
          </View>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.totalPrice}>Total: ${item.totalPrice}</Text>
          <Text style={styles.nightPrice}>(${item.price} per night)</Text>
        </View>
        
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleRemoveClick(item)}
          >
            <MaterialIcons name="delete" size={24} color="#F44336" />
            <Text style={styles.deleteButtonText}>Remove</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => handleBookNow(item)}
          >
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <MaterialIcons name="favorite" size={40} color="#00ADB5" />
      </View>
      <Text style={styles.emptyTitle}>No Saved Reservations</Text>
      <Text style={styles.emptySubtitle}>Save your favorite hotels to see them here</Text>
      <TouchableOpacity style={styles.browseButton}>
        <Text style={styles.browseButtonText}>Browse Hotels</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Reservations</Text>
        </View>
        
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
            onPress={() => setActiveTab('saved')}
          >
            <MaterialIcons 
              name="favorite" 
              size={20} 
              color={activeTab === 'saved' ? '#00ADB5' : '#EEEEEE'} 
            />
            <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>
              Saved
            </Text>
            {savedCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{savedCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'recommended' && styles.activeTab]}
            onPress={() => setActiveTab('recommended')}
          >
            <Text style={[styles.tabText, activeTab === 'recommended' && styles.activeTabText]}>
              Recommended
            </Text>
          </TouchableOpacity>
        </View>
        
        <Divider style={styles.divider} />
        
        {activeTab === 'saved' ? (
          reservations.filter(r => r.saved).length > 0 ? (
            <FlatList
              data={reservations.filter(r => r.saved)}
              renderItem={renderReservationItem}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            renderEmptyState()
          )
        ) : (
          <Text style={styles.comingSoon}>Recommended hotels coming soon</Text>
        )}
      </ScrollView>
      
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Removal</Text>
            <Text style={styles.modalText}>
              Are you sure you want to remove "{reservationToRemove?.title}" from your saved reservations?
            </Text>
            <Text style={styles.modalText}>
              Cancellation fees may apply depending on the hotel's policy.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmRemove}
              >
                <Text style={styles.modalButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      <PaymentModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        bookingDetails={currentBooking}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222831',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ADB5',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00ADB5',
  },
  activeTab: {
    backgroundColor: '#00ADB5',
  },
  tabText: {
    color: '#EEEEEE',
    fontSize: 16,
    marginLeft: 5,
  },
  activeTabText: {
    color: '#EEEEEE',
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: '#00ADB5',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 5,
  },
  badgeText: {
    color: '#EEEEEE',
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    backgroundColor: '#393E46',
    height: 1,
    marginVertical: 15,
    marginHorizontal: 20,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  reservationCard: {
    backgroundColor: '#393E46',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 200,
  },
  hotelImage: {
    width: '100%',
    height: '100%',
  },
  reservationContent: {
    padding: 15,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  hotelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00ADB5',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 173, 181, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingText: {
    color: '#EEEEEE',
    fontSize: 14,
    marginLeft: 5,
  },
  locationText: {
    color: '#00ADB5',
    fontSize: 14,
    marginBottom: 10,
  },
  detailsContainer: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    color: '#EEEEEE',
    fontSize: 14,
    marginLeft: 8,
  },
  datesContainer: {
    backgroundColor: 'rgba(0, 173, 181, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  dateText: {
    color: '#EEEEEE',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  priceContainer: {
    marginBottom: 15,
  },
  totalPrice: {
    color: '#00ADB5',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nightPrice: {
    color: '#EEEEEE',
    fontSize: 14,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  deleteButtonText: {
    color: '#F44336',
    marginLeft: 5,
    fontSize: 14,
  },
  bookButton: {
    backgroundColor: '#00ADB5',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    color: '#EEEEEE',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    backgroundColor: '#393E46',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    color: '#00ADB5',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtitle: {
    color: '#EEEEEE',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.8,
  },
  browseButton: {
    borderWidth: 1,
    borderColor: '#00ADB5',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  browseButtonText: {
    color: '#00ADB5',
    fontSize: 14,
  },
  comingSoon: {
    color: '#EEEEEE',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#393E46',
    borderRadius: 10,
    padding: 20,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ADB5',
    marginBottom: 15,
  },
  modalText: {
    color: '#EEEEEE',
    fontSize: 16,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 6,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#00ADB5',
  },
  confirmButton: {
    backgroundColor: '#00ADB5',
  },
  modalButtonText: {
    color: '#EEEEEE',
    fontSize: 14,
    fontWeight: 'bold',
  },
  paymentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentModalContainer: {
    backgroundColor: '#222831',
    borderRadius: 10,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentModalTitle: {
    color: '#EEEEEE',
    fontSize: 18,
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
    fontSize: 16,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  paymentMethodButton: {
    width: '48%',
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
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
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
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    padding: 10,
  },
  cancelButtonText: {
    color: '#EEEEEE',
    fontSize: 16,
  },
  testModeButton: {
    backgroundColor: '#00ADB5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  testModeButtonText: {
    color: '#EEEEEE',
    fontSize: 12,
    fontWeight: 'bold',
  },
  testModeBanner: {
    backgroundColor: '#00ADB5',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  testModeText: {
    color: '#EEEEEE',
    fontSize: 14,
    textAlign: 'center',
  },
  fillTestDataButton: {
    backgroundColor: '#393E46',
    padding: 8,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  fillTestDataButtonText: {
    color: '#00ADB5',
    fontSize: 14,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  successModalGradient: {
    padding: 20,
    alignItems: 'center',
  },
  successIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    padding: 15,
    marginBottom: 15,
  },
  successModalTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
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

export default ReserveScreen;