import React, { useState, useEffect } from 'react';
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
  Platform,
} from 'react-native';
import { MaterialCommunityIcons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { Badge, Divider } from 'react-native-elements';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import AskRefundScreen from './AskRefundScreen'; // Adjust the path based on your file structure

const { width } = Dimensions.get('window');

const defaultHotelImage = require('../../assets/icon.png');

const determineBookingStatus = (booking) => {
  const now = new Date();
  const checkIn = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);

  if (booking.status === 'cancelled') {
    return 'cancelled';
  }

  if (checkOut > now && (booking.status === 'confirmed' || booking.status === 'check-in')) {
    return 'upcoming';
  }

  if (checkOut <= now && (booking.status === 'checked-out' || booking.status === 'checked-in')) {
    return 'completed';
  }

  if (checkIn <= now && checkOut > now) {
    return 'ongoing';
  }

  return booking.status;
};

const BookingScreen = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [notification, setNotification] = useState({
    visible: false,
    message: '',
    type: 'success',
  });
  const [timeRange, setTimeRange] = useState('month');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const BACKEND_API_URL =
    Platform.OS === 'android' && !Platform.isEmulator
      ? 'http://192.168.170.185:2000'
      : 'http://localhost:2000';

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
        setError('Please log in to view your bookings.');
      }
      setAuthChecked(true);
    } catch (e) {
      console.error('Error fetching user data:', e);
      setError('Failed to load user data. Please log in again.');
      showNotification('Failed to load user data. Please log in again.', 'error');
    }
  };

  const fetchBookings = async () => {
    if (!authChecked || !isLoggedIn) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_API_URL}/api/bookingHistory/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const fetchedBookings = response.data.data || [];
      const validBookings = fetchedBookings
        .filter((booking) => {
          const isValid = booking.bookingCode && typeof booking.bookingCode === 'string';
          if (!isValid) {
            console.warn('Invalid booking filtered out:', booking);
          }
          return isValid;
        })
        .map((booking) => ({
          ...booking,
          id: booking._id || booking.bookingCode,
          checkIn: new Date(booking.checkIn || booking.checkInDate || Date.now()),
          checkOut: new Date(booking.checkOut || booking.checkOutDate || Date.now()),
          createdAt: new Date(booking.createdAt || Date.now()),
          status: determineBookingStatus(booking),
        }));

      setBookings(validBookings);
      setError('');
    } catch (err) {
      console.error('Error fetching booking history:', err);
      setError(err.response?.data?.message || 'Failed to fetch booking history.');
      showNotification(
        err.response?.data?.message || 'Failed to fetch booking history.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [authChecked, isLoggedIn, token]);

  const handleCancelBooking = async (booking) => {
    if (!booking.bookingCode) {
      showNotification('Invalid booking code.', 'error');
      return;
    }
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    try {
      const url = `${BACKEND_API_URL}/api/bookingHistory/${encodeURIComponent(
        selectedBooking.bookingCode
      )}/cancel`;
      await axios.patch(
        url,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookings((prev) =>
        prev.map((b) =>
          b.bookingCode === selectedBooking.bookingCode
            ? { ...b, status: 'cancelled' }
            : b
        )
      );
      showNotification(
        `Booking for ${selectedBooking.hotelName} has been cancelled`,
        'success'
      );
    } catch (err) {
      console.error('Error cancelling booking:', err);
      showNotification(
        err.response?.data?.message || 'Failed to cancel booking',
        'error'
      );
    } finally {
      setShowCancelModal(false);
      setSelectedBooking(null);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ visible: true, message, type });
    setTimeout(() => {
      setNotification({ ...notification, visible: false });
    }, 3000);
  };

  const getStatusBadge = (booking) => {
    const status = determineBookingStatus(booking);
    let backgroundColor, icon;

    switch (status) {
      case 'cancelled':
        backgroundColor = '#F44336';
        icon = 'cancel';
        break;
      case 'upcoming':
        backgroundColor = '#FFA500';
        icon = 'clock';
        break;
      case 'completed':
        backgroundColor = '#4CAF50';
        icon = 'check-circle';
        break;
      case 'ongoing':
        backgroundColor = '#2196F3';
        icon = 'hotel';
        break;
      default:
        backgroundColor = '#9E9E9E';
        icon = 'help-circle';
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor }]}>
        <MaterialIcons name={icon} size={16} color="white" />
        <Text style={styles.statusText}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
      </View>
    );
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateTotalSpending = () => {
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case 'week':
        startDate = new Date();
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(0);
    }

    return bookings
      .filter((booking) => {
        const status = determineBookingStatus(booking);
        return booking.checkIn >= startDate && status !== 'cancelled';
      })
      .reduce((total, booking) => total + booking.totalPrice, 0);
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'week':
        return 'Last Week';
      case 'month':
        return 'Last Month';
      case 'year':
        return 'Last Year';
      default:
        return 'All Time';
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const status = determineBookingStatus(booking);

    if (activeTab === 0) return true;
    if (activeTab === 1) return status === 'upcoming';
    if (activeTab === 2) return status === 'completed';
    if (activeTab === 3) return status === 'cancelled';
    return true;
  });

  const sortedFilteredBookings = [...filteredBookings].sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  const renderBookingItem = ({ item }) => {
    const status = determineBookingStatus(item);
    const isUpcoming = status === 'upcoming';
    const isCompleted = status === 'completed';
    const isCancelled = status === 'cancelled';

    return (
      <View style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <Image
            source={item.image ? { uri: item.image } : defaultHotelImage}
            style={styles.hotelImage}
          />
          <View style={styles.hotelInfo}>
            <Text style={styles.hotelName}>{item.hotelName}</Text>
            <Text style={styles.roomType}>{item.roomType}</Text>
            {getStatusBadge(item)}
            {item.rating && (
              <View style={styles.ratingContainer}>
                <FontAwesome name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            )}
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="door" size={20} color="#00ADB5" />
            <Text style={styles.detailText}>Room {item.roomNumber}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="account-group" size={20} color="#00ADB5" />
            <Text style={styles.detailText}>
              {item.guests} Guest{item.guests > 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="calendar-arrow-right" size={20} color="#00ADB5" />
            <Text style={styles.detailText}>Check-in: {formatDate(item.checkIn)}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="calendar-arrow-left" size={20} color="#00ADB5" />
            <Text style={styles.detailText}>Check-out: {formatDate(item.checkOut)}</Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.bookingFooter}>
          <View style={styles.priceContainer}>
            <MaterialCommunityIcons name="receipt" size={20} color="#00ADB5" />
            <Text style={styles.priceText}>${item.totalPrice?.toFixed(2) || '0.00'}</Text>
          </View>

          {isUpcoming && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => handleCancelBooking(item)}
              >
                <MaterialIcons name="cancel" size={18} color="white" />
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
          {isCompleted && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.bookAgainButton]}
                onPress={() => showNotification('Book again feature coming soon', 'info')}
              >
                <MaterialIcons name="repeat" size={18} color="white" />
                <Text style={styles.buttonText}>Book Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.reviewButton]}
                onPress={() => showNotification('Review feature coming soon', 'info')}
              >
                <MaterialIcons name="rate-review" size={18} color="#00ADB5" />
                <Text style={[styles.buttonText, { color: '#00ADB5' }]}>Review</Text>
              </TouchableOpacity>
            </View>
          )}
          {isCancelled && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.bookAgainButton]}
                onPress={() => showNotification('Book again feature coming soon', 'info')}
              >
                <MaterialIcons name="repeat" size={18} color="white" />
                <Text style={styles.buttonText}>Book Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderAnalytics = () => (
    <View style={styles.analyticsContainer}>
      <View style={styles.timeRangeSelector}>
        <TouchableOpacity
          style={[styles.timeRangeButton, timeRange === 'week' && styles.activeTimeRange]}
          onPress={() => setTimeRange('week')}
        >
          <Text
            style={[styles.timeRangeText, timeRange === 'week' && styles.activeTimeRangeText]}
          >
            Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timeRangeButton, timeRange === 'month' && styles.activeTimeRange]}
          onPress={() => setTimeRange('month')}
        >
          <Text
            style={[styles.timeRangeText, timeRange === 'month' && styles.activeTimeRangeText]}
          >
            Month
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timeRangeButton, timeRange === 'year' && styles.activeTimeRange]}
          onPress={() => setTimeRange('year')}
        >
          <Text
            style={[styles.timeRangeText, timeRange === 'year' && styles.activeTimeRangeText]}
          >
            Year
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.analyticsCard}>
        <View style={styles.analyticsHeader}>
          <MaterialCommunityIcons name="calendar-range" size={24} color="#00ADB5" />
          <Text style={styles.analyticsTitle}>{getTimeRangeLabel()} Spending</Text>
        </View>
        <Text style={styles.analyticsAmount}>${calculateTotalSpending().toFixed(2)}</Text>
        <Text style={styles.analyticsSubtitle}>Total across all completed bookings</Text>
      </View>

      <View style={styles.analyticsCard}>
        <View style={styles.analyticsHeader}>
          <MaterialCommunityIcons name="chart-line" size={24} color="#00ADB5" />
          <Text style={styles.analyticsTitle}>Booking Trends</Text>
        </View>
        <Text style={styles.analyticsSubtitle}>
          {timeRange === 'week' && 'Weekly spending analytics coming soon'}
          {timeRange === 'month' && 'Monthly booking trends coming soon'}
          {timeRange === 'year' && 'Annual booking patterns coming soon'}
        </Text>
      </View>
    </View>
  );

  if (!authChecked) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Bookings</Text>
        </View>

        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 0 && styles.activeTab]}
              onPress={() => setActiveTab(0)}
            >
              <Text style={[styles.tabText, activeTab === 0 && styles.activeTabText]}>
                All
              </Text>
              <Badge
                value={bookings.length}
                status="primary"
                containerStyle={styles.badgeContainer}
                textStyle={styles.badgeText}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 1 && styles.activeTab]}
              onPress={() => setActiveTab(1)}
            >
              <Text style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>
                Upcoming
              </Text>
              <Badge
                value={bookings.filter((b) => determineBookingStatus(b) === 'upcoming').length}
                status="primary"
                containerStyle={styles.badgeContainer}
                textStyle={styles.badgeText}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 2 && styles.activeTab]}
              onPress={() => setActiveTab(2)}
            >
              <Text style={[styles.tabText, activeTab === 2 && styles.activeTabText]}>
                Completed
              </Text>
              <Badge
                value={bookings.filter((b) => determineBookingStatus(b) === 'completed').length}
                status="primary"
                containerStyle={styles.badgeContainer}
                textStyle={styles.badgeText}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 3 && styles.activeTab]}
              onPress={() => setActiveTab(3)}
            >
              <Text style={[styles.tabText, activeTab === 3 && styles.activeTabText]}>
                Cancelled
              </Text>
              <Badge
                value={bookings.filter((b) => determineBookingStatus(b) === 'cancelled').length}
                status="primary"
                containerStyle={styles.badgeContainer}
                textStyle={styles.badgeText}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 4 && styles.activeTab]}
              onPress={() => setActiveTab(4)}
            >
              <Text style={[styles.tabText, activeTab === 4 && styles.activeTabText]}>
                Request Refund
              </Text>
              <MaterialCommunityIcons
                name="receipt"
                size={20}
                color={activeTab === 4 ? '#00ADB5' : '#393E46'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 5 && styles.activeTab]}
              onPress={() => setActiveTab(5)}
            >
              <Text style={[styles.tabText, activeTab === 5 && styles.activeTabText]}>
                Analytics
              </Text>
              <MaterialCommunityIcons
                name="chart-bar"
                size={20}
                color={activeTab === 5 ? '#00ADB5' : '#393E46'}
              />
            </TouchableOpacity>
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading bookings...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{error}</Text>
          </View>
        ) : activeTab === 4 ? (
          <AskRefundScreen />
        ) : activeTab === 5 ? (
          renderAnalytics()
        ) : sortedFilteredBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="hotel" size={50} color="#393E46" />
            <Text style={styles.emptyText}>No bookings found</Text>
          </View>
        ) : (
          <FlatList
            data={sortedFilteredBookings}
            renderItem={renderBookingItem}
            keyExtractor={(item) => item.bookingCode}
            scrollEnabled={false}
            contentContainerStyle={styles.bookingList}
          />
        )}
      </ScrollView>

      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Cancellation</Text>
            <Text style={styles.modalText}>
              Are you sure you want to cancel your booking at {selectedBooking?.hotelName}?
            </Text>
            <Text style={styles.modalText}>
              Cancellation fees may apply depending on the hotel's policy.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={styles.modalButtonText}>Go Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmModalButton]}
                onPress={confirmCancel}
              >
                <Text style={styles.modalButtonText}>Confirm Cancellation</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {notification.visible && (
        <View
          style={[
            styles.notification,
            notification.type === 'success'
              ? styles.successNotification
              : notification.type === 'error'
              ? styles.errorNotification
              : styles.infoNotification,
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#393E46',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
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
  badgeContainer: {
    marginLeft: 5,
  },
  badgeText: {
    fontSize: 12,
    color: '#EEEEEE',
  },
  bookingList: {
    padding: 15,
  },
  bookingCard: {
    backgroundColor: '#393E46',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  bookingHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  hotelImage: {
    width: 100,
    height: 80,
    borderRadius: 8,
  },
  hotelInfo: {
    flex: 1,
    marginLeft: 15,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ADB5',
    marginBottom: 5,
  },
  roomType: {
    fontSize: 14,
    color: '#EEEEEE',
    marginBottom: 5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 5,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 5,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#FFD700',
    fontSize: 14,
    marginLeft: 5,
  },
  divider: {
    backgroundColor: '#00ADB5',
    marginVertical: 10,
    height: 1,
  },
  bookingDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    color: '#EEEEEE',
    fontSize: 14,
    marginLeft: 10,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    color: '#EEEEEE',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  bookAgainButton: {
    backgroundColor: '#4CAF50',
  },
  reviewButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#00ADB5',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 5,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#EEEEEE',
    fontSize: 18,
    marginTop: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#EEEEEE',
    fontSize: 18,
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
  cancelModalButton: {
    backgroundColor: '#393E46',
    borderWidth: 1,
    borderColor: '#00ADB5',
  },
  confirmModalButton: {
    backgroundColor: '#F44336',
  },
  modalButtonText: {
    color: '#EEEEEE',
    fontSize: 14,
    fontWeight: 'bold',
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
  infoNotification: {
    backgroundColor: '#0288D1',
  },
  notificationText: {
    color: '#EEEEEE',
    fontSize: 16,
    fontWeight: 'bold',
  },
  analyticsContainer: {
    padding: 15,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  timeRangeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeTimeRange: {
    backgroundColor: '#00ADB5',
  },
  timeRangeText: {
    color: '#EEEEEE',
    fontSize: 14,
  },
  activeTimeRangeText: {
    fontWeight: 'bold',
  },
  analyticsCard: {
    backgroundColor: '#393E46',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
  },
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  analyticsTitle: {
    color: '#00ADB5',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  analyticsAmount: {
    color: '#EEEEEE',
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  analyticsSubtitle: {
    color: '#EEEEEE',
    fontSize: 14,
  },
});

export default BookingScreen;