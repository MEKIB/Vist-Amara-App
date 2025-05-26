import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Divider } from 'react-native-elements';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const AskRefundScreen = () => {
  const [bookingCode, setBookingCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [refunds, setRefunds] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [notification, setNotification] = useState({
    visible: false,
    message: '',
    type: 'success',
  });
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const BACKEND_API_URL =
    Platform.OS === 'android' && !Platform.isEmulator
      ? 'http://192.168.213.185:2000'
      : 'http://localhost:2000';

  // Check authentication
  const fetchUserData = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('jwtToken');
      const storedUser = await SecureStore.getItemAsync('user');
      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser.user || parsedUser);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      setAuthChecked(true);
    } catch (e) {
      console.error('Error fetching user data:', e);
      showNotification('Failed to load user data. Please log in again.', 'error');
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Fetch refunds
  const fetchRefunds = async () => {
    if (!isLoggedIn) return;

    try {
      const response = await axios.get(`${BACKEND_API_URL}/api/refunds/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Refunds fetched:', response.data.data);
      setRefunds(response.data.data || []);
    } catch (err) {
      console.error('Error fetching refunds:', err);
      showNotification(
        err.response?.data?.message || 'Failed to fetch refunds',
        'error'
      );
    }
  };

  useEffect(() => {
    if (activeTab === 1 && authChecked) {
      fetchRefunds();
    }
  }, [activeTab, isLoggedIn, authChecked]);

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      showNotification('Please log in to request a refund', 'error');
      return;
    }

    if (!bookingCode || typeof bookingCode !== 'string') {
      showNotification('Please enter a valid booking code', 'error');
      return;
    }

    try {
      setLoading(true);

      // Fetch booking details
      const bookingResponse = await axios.get(
        `${BACKEND_API_URL}/api/booking/${bookingCode}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const booking = bookingResponse.data.data;

      // Check booking status
      if (booking.status === 'checked-in') {
        showNotification('You have already used the booking', 'error');
        return;
      }

      // Submit refund request
      await axios.post(
        `${BACKEND_API_URL}/api/askrefunds`,
        {
          userId: user.id,
          bookingCode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showNotification('Refund request submitted successfully', 'success');
      setBookingCode('');
      if (activeTab === 1) {
        await fetchRefunds();
      }
    } catch (err) {
      console.error('Error processing refund request:', err);
      showNotification(
        err.response?.data?.message || 'Failed to process refund request.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ visible: true, message, type });
    setTimeout(() => {
      setNotification({ ...notification, visible: false });
    }, 3000);
  };

  const filteredRefunds = refunds
    .filter((refund) => (activeTab === 0 ? refund.status === 'pending' : refund.status === 'refunded'))
    .sort((a, b) => {
      const dateA = new Date(activeTab === 0 ? a.createdAt : a.updatedAt || a.createdAt);
      const dateB = new Date(activeTab === 0 ? b.createdAt : b.updatedAt || b.createdAt);
      return activeTab === 0 ? dateA - dateB : dateB - dateA; // Oldest first for Pending, Newest first for Refunded
    });

  const renderRefundItem = ({ item }) => (
    <View style={styles.refundItem}>
      <View style={styles.refundRow}>
        <Text style={styles.refundLabel}>Booking Code:</Text>
        <Text style={styles.refundValue}>{item.bookingCode}</Text>
      </View>
      <View style={styles.refundRow}>
        <Text style={styles.refundLabel}>Total Price:</Text>
        <Text style={styles.refundValue}>${item.totalPrice.toFixed(2)}</Text>
      </View>
      <View style={styles.refundRow}>
        <Text style={styles.refundLabel}>Status:</Text>
        <Text
          style={[
            styles.refundValue,
            { color: item.status === 'pending' ? '#FFA500' : '#4CAF50' },
          ]}
        >
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
      </View>
    </View>
  );

  if (!authChecked) {
    return (
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Refund Management</Text>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 0 && styles.activeTab]}
            onPress={() => setActiveTab(0)}
          >
            <Text style={[styles.tabText, activeTab === 0 && styles.activeTabText]}>
              Request Refund
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 1 && styles.activeTab]}
            onPress={() => setActiveTab(1)}
          >
            <Text style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>
              Refund History
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 0 && (
          <View style={styles.refundForm}>
            <Text style={styles.formTitle}>Enter your booking code to request a refund</Text>
            <TextInput
              style={styles.input}
              placeholder="Booking Code"
              placeholderTextColor="#888"
              value={bookingCode}
              onChangeText={setBookingCode}
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.submitButton, (loading || !bookingCode) && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading || !bookingCode}
            >
              <MaterialCommunityIcons
                name={loading ? 'loading' : 'receipt'}
                size={20}
                color="#EEEEEE"
              />
              <Text style={styles.submitButtonText}>
                {loading ? 'Submitting...' : 'Submit Refund Request'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 1 && (
          <View style={styles.refundHistory}>
            <Text style={styles.historyTitle}>Refund History</Text>
            {filteredRefunds.length === 0 ? (
              <Text style={styles.emptyText}>
                No {activeTab === 0 ? 'pending refunds' : 'refunded payments'} found.
              </Text>
            ) : (
              <FlatList
                data={filteredRefunds}
                renderItem={renderRefundItem}
                keyExtractor={(item) => item.bookingCode}
                contentContainerStyle={styles.refundList}
              />
            )}
          </View>
        )}
      </ScrollView>

      {notification.visible && (
        <View
          style={[
            styles.notification,
            notification.type === 'success'
              ? styles.successNotification
              : styles.errorNotification,
          ]}
        >
          <Text style={styles.notificationText}>{notification.message}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222831',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00ADB5',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#393E46',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#393E46',
  },
  tabText: {
    color: '#EEEEEE',
    fontSize: 16,
  },
  activeTabText: {
    color: '#00ADB5',
    fontWeight: 'bold',
  },
  refundForm: {
    padding: 15,
    backgroundColor: '#393E46',
    borderRadius: 10,
    margin: 15,
  },
  formTitle: {
    color: '#EEEEEE',
    fontSize: 18,
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#222831',
    color: '#EEEEEE',
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#00ADB5',
    marginBottom: 15,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00ADB5',
    padding: 15,
    borderRadius: 5,
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  submitButtonText: {
    color: '#EEEEEE',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  refundHistory: {
    padding: 15,
  },
  historyTitle: {
    color: '#00ADB5',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  refundList: {
    paddingBottom: 20,
  },
  refundItem: {
    backgroundColor: '#393E46',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  refundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  refundLabel: {
    color: '#EEEEEE',
    fontSize: 14,
    fontWeight: 'bold',
  },
  refundValue: {
    color: '#EEEEEE',
    fontSize: 14,
  },
  emptyText: {
    color: '#EEEEEE',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  notification: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  successNotification: {
    backgroundColor: '#4CAF50',
  },
  errorNotification: {
    backgroundColor: '#F44336',
  },
  notificationText: {
    color: '#EEEEEE',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AskRefundScreen;