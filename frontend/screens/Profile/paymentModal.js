import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ToastAndroid,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PaymentModal = ({ visible, onClose, bookingDetails, onPaymentSuccess }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const validateInputs = () => {
    const newErrors = {};
    if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Enter a valid 16-digit card number';
    }
    if (!expiryDate || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
      newErrors.expiryDate = 'Enter valid expiry date (MM/YY)';
    }
    if (!cvv || cvv.length !== 3) {
      newErrors.cvv = 'Enter a valid 3-digit CVV';
    }
    if (!cardHolderName || cardHolderName.trim().length < 2) {
      newErrors.cardHolderName = 'Enter a valid cardholder name';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateInputs()) {
      ToastAndroid.show('Please correct the errors in the form', ToastAndroid.SHORT);
      return;
    }

    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const isSuccess = Math.random() > 0.2;
      if (!isSuccess) {
        throw new Error('Payment failed. Please try again.');
      }
      if (bookingDetails?.reservationId && bookingDetails?.title) {
        onPaymentSuccess(bookingDetails.reservationId, bookingDetails.title);
      }
      ToastAndroid.show('Payment successful!', ToastAndroid.LONG);
      onClose();
    } catch (error) {
      console.error('Payment error:', error);
      ToastAndroid.show(error.message || 'Payment failed. Please try again.', ToastAndroid.LONG);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned
      .match(/.{1,4}/g)
      ?.join(' ')
      .substring(0, 19) || '';
    return formatted;
  };

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <Text style={styles.modalTitle}>Payment Details</Text>
              <TouchableOpacity onPress={onClose} disabled={isProcessing}>
                <MaterialCommunityIcons name="close" size={24} color="#EEEEEE" />
              </TouchableOpacity>
            </View>

            {bookingDetails && (
              <View style={styles.bookingSummary}>
                <Text style={styles.summaryTitle}>{bookingDetails.hotelName}</Text>
                <View style={styles.summaryRow}>
                  <MaterialCommunityIcons name="bed-king" size={20} color="#00ADB5" />
                  <Text style={styles.summaryText}>{bookingDetails.roomType}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <MaterialCommunityIcons name="door" size={20} color="#00ADB5" />
                  <Text style={styles.summaryText}>
                    Rooms: {bookingDetails.roomNumbers?.join(', ') || 'N/A'}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <MaterialCommunityIcons name="calendar-arrow-right" size={20} color="#00ADB5" />
                  <Text style={styles.summaryText}>Check-in: {bookingDetails.checkInDate}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <MaterialCommunityIcons name="calendar-arrow-left" size={20} color="#00ADB5" />
                  <Text style={styles.summaryText}>Check-out: {bookingDetails.checkOutDate}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <MaterialCommunityIcons name="cash" size={20} color="#00ADB5" />
                  <Text style={styles.summaryText}>Total: ${bookingDetails.totalPrice}</Text>
                </View>
              </View>
            )}

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="credit-card" size={20} color="#00ADB5" style={styles.icon} />
                <TextInput
                  style={[styles.input, errors.cardNumber && styles.inputError]}
                  placeholder="Card Number"
                  placeholderTextColor="#888"
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  keyboardType="numeric"
                  maxLength={19}
                  editable={!isProcessing}
                />
              </View>
              {errors.cardNumber && <Text style={styles.errorText}>{errors.cardNumber}</Text>}

              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <MaterialCommunityIcons name="calendar" size={20} color="#00ADB5" style={styles.icon} />
                  <TextInput
                    style={[styles.input, errors.expiryDate && styles.inputError]}
                    placeholder="MM/YY"
                    placeholderTextColor="#888"
                    value={expiryDate}
                    onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                    keyboardType="numeric"
                    maxLength={5}
                    editable={!isProcessing}
                  />
                </View>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <MaterialCommunityIcons name="lock" size={20} color="#00ADB5" style={styles.icon} />
                  <TextInput
                    style={[styles.input, errors.cvv && styles.inputError]}
                    placeholder="CVV"
                    placeholderTextColor="#888"
                    value={cvv}
                    onChangeText={(text) => setCvv(text.replace(/\D/g, '').substring(0, 3))}
                    keyboardType="numeric"
                    maxLength={3}
                    editable={!isProcessing}
                  />
                </View>
              </View>
              {errors.expiryDate && <Text style={styles.errorText}>{errors.expiryDate}</Text>}
              {errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}

              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="account" size={20} color="#00ADB5" style={styles.icon} />
                <TextInput
                  style={[styles.input, errors.cardHolderName && styles.inputError]}
                  placeholder="Cardholder Name"
                  placeholderTextColor="#888"
                  value={cardHolderName}
                  onChangeText={setCardHolderName}
                  autoCapitalize="words"
                  editable={!isProcessing}
                />
              </View>
              {errors.cardHolderName && <Text style={styles.errorText}>{errors.cardHolderName}</Text>}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={isProcessing}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.payButton, isProcessing && styles.disabledButton]}
                onPress={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#EEEEEE" />
                ) : (
                  <Text style={styles.buttonText}>Pay Now</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#393E46',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ADB5',
  },
  bookingSummary: {
    backgroundColor: 'rgba(0, 173, 181, 0.1)',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EEEEEE',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryText: {
    color: '#EEEEEE',
    fontSize: 14,
    marginLeft: 8,
  },
  formContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222831',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#00ADB5',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#EEEEEE',
  },
  inputError: {
    borderColor: '#F44336',
  },
  icon: {
    marginRight: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#00ADB5',
  },
  payButton: {
    backgroundColor: '#00ADB5',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#EEEEEE',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentModal;