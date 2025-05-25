import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  FlatList,
  SectionList,
  Dimensions,
  Platform
} from 'react-native';
import { MaterialCommunityIcons, MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { Badge, Divider } from 'react-native-elements';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

const defaultHotelImage = require('../../assets/icon.png');

const BookingScreen = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [notification, setNotification] = useState({
    visible: false,
    message: '',
    type: 'success'
  });
  const [timeRange, setTimeRange] = useState('month');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('date');

  // Sample booking data
  const bookings = [
    {
      id: 1,
      hotelName: "Grand Plaza Hotel",
      roomType: "Deluxe Suite",
      checkIn: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      checkOut: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      roomNumber: "305",
      guests: 2,
      totalPrice: 1200,
      status: "completed",
      rating: 4.5,
      image: "https://source.unsplash.com/random/300x200/?hotel"
    },
    {
      id: 2,
      hotelName: "Mountain View Resort",
      roomType: "Premium Room",
      checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      checkOut: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      roomNumber: "412",
      guests: 2,
      totalPrice: 950,
      status: "upcoming",
      image: "https://source.unsplash.com/random/300x200/?resort"
    },
    {
      id: 3,
      hotelName: "Beachside Villa",
      roomType: "Ocean View Suite",
      checkIn: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      checkOut: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
      roomNumber: "208",
      guests: 4,
      totalPrice: 1800,
      status: "completed",
      rating: 5,
      image: "https://source.unsplash.com/random/300x200/?beach,villa"
    },
    {
      id: 4,
      hotelName: "City Central Hotel",
      roomType: "Executive Room",
      checkIn: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      checkOut: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      roomNumber: "710",
      guests: 1,
      totalPrice: 750,
      status: "upcoming",
      image: "https://source.unsplash.com/random/300x200/?city,hotel"
    },
    {
      id: 5,
      hotelName: "Lakeside Retreat",
      roomType: "Luxury Villa",
      checkIn: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      checkOut: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      roomNumber: "102",
      guests: 2,
      totalPrice: 1500,
      status: "completed",
      rating: 4.8,
      image: "https://source.unsplash.com/random/300x200/?lake,villa"
    }
  ];

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 0) return true; // All
    if (activeTab === 1) return booking.status === 'upcoming';
    if (activeTab === 2) return booking.status === 'completed';
    if (activeTab === 3) return booking.status === 'cancelled';
    return true;
  });

  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    showNotification(`Booking for ${selectedBooking.hotelName} has been cancelled`, 'success');
    // In a real app, you would update the booking status via API here
  };

  const showNotification = (message, type) => {
    setNotification({ visible: true, message, type });
    setTimeout(() => {
      setNotification({ ...notification, visible: false });
    }, 3000);
  };

  const getStatusBadge = (status) => {
    let backgroundColor, icon;
    switch (status) {
      case 'upcoming':
        backgroundColor = '#FFA500';
        icon = 'clock';
        break;
      case 'completed':
        backgroundColor = '#4CAF50';
        icon = 'check-circle';
        break;
      case 'cancelled':
        backgroundColor = '#F44336';
        icon = 'cancel';
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
      day: 'numeric'
    });
  };

  const calculateTotalSpending = () => {
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(0); // All time
    }

    return bookings
      .filter(booking => {
        return booking.checkIn >= startDate && booking.status !== 'cancelled';
      })
      .reduce((total, booking) => total + booking.totalPrice, 0);
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'week': return 'Last Week';
      case 'month': return 'Last Month';
      case 'year': return 'Last Year';
      default: return 'All Time';
    }
  };

  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Image 
          source={item.image ? { uri: item.image } : defaultHotelImage} 
          style={styles.hotelImage} 
        />
        <View style={styles.hotelInfo}>
          <Text style={styles.hotelName}>{item.hotelName}</Text>
          <Text style={styles.roomType}>{item.roomType}</Text>
          {getStatusBadge(item.status)}
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
          <Text style={styles.detailText}>{item.guests} Guest{item.guests > 1 ? 's' : ''}</Text>
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
          <Text style={styles.priceText}>${item.totalPrice}</Text>
        </View>

        {item.status === 'upcoming' ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleCancelBooking(item)}
            >
              <MaterialIcons name="cancel" size={18} color="white" />
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.modifyButton]}>
              <MaterialIcons name="edit" size={18} color="#00ADB5" />
              <Text style={[styles.buttonText, { color: '#00ADB5' }]}>Modify</Text>
            </TouchableOpacity>
          </View>
        ) : item.status === 'completed' ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.actionButton, styles.bookAgainButton]}>
              <MaterialIcons name="repeat" size={18} color="white" />
              <Text style={styles.buttonText}>Book Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.reviewButton]}>
              <MaterialIcons name="rate-review" size={18} color="#00ADB5" />
              <Text style={[styles.buttonText, { color: '#00ADB5' }]}>Review</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.analyticsContainer}>
      <View style={styles.timeRangeSelector}>
        <TouchableOpacity 
          style={[styles.timeRangeButton, timeRange === 'week' && styles.activeTimeRange]}
          onPress={() => setTimeRange('week')}
        >
          <Text style={[styles.timeRangeText, timeRange === 'week' && styles.activeTimeRangeText]}>
            Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.timeRangeButton, timeRange === 'month' && styles.activeTimeRange]}
          onPress={() => setTimeRange('month')}
        >
          <Text style={[styles.timeRangeText, timeRange === 'month' && styles.activeTimeRangeText]}>
            Month
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.timeRangeButton, timeRange === 'year' && styles.activeTimeRange]}
          onPress={() => setTimeRange('year')}
        >
          <Text style={[styles.timeRangeText, timeRange === 'year' && styles.activeTimeRangeText]}>
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
              <Text style={[styles.tabText, activeTab === 0 && styles.activeTabText]}>All</Text>
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
              <Text style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>Upcoming</Text>
              <Badge
                value={bookings.filter(b => b.status === 'upcoming').length}
                status="primary"
                containerStyle={styles.badgeContainer}
                textStyle={styles.badgeText}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 2 && styles.activeTab]}
              onPress={() => setActiveTab(2)}
            >
              <Text style={[styles.tabText, activeTab === 2 && styles.activeTabText]}>Completed</Text>
              <Badge
                value={bookings.filter(b => b.status === 'completed').length}
                status="primary"
                containerStyle={styles.badgeContainer}
                textStyle={styles.badgeText}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 3 && styles.activeTab]}
              onPress={() => setActiveTab(3)}
            >
              <Text style={[styles.tabText, activeTab === 3 && styles.activeTabText]}>Cancelled</Text>
              <Badge
                value={bookings.filter(b => b.status === 'cancelled').length}
                status="primary"
                containerStyle={styles.badgeContainer}
                textStyle={styles.badgeText}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 4 && styles.activeTab]}
              onPress={() => setActiveTab(4)}
            >
              <Text style={[styles.tabText, activeTab === 4 && styles.activeTabText]}>Analytics</Text>
              <MaterialCommunityIcons name="chart-bar" size={20} color={activeTab === 4 ? '#00ADB5' : '#393E46'} />
            </TouchableOpacity>
          </ScrollView>
        </View>

        {activeTab === 4 ? (
          renderAnalytics()
        ) : filteredBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="hotel" size={50} color="#393E46" />
            <Text style={styles.emptyText}>No bookings found</Text>
          </View>
        ) : (
          <FlatList
            data={filteredBookings}
            renderItem={renderBookingItem}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.bookingList}
          />
        )}
      </ScrollView>

      {/* Cancel Booking Modal */}
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

      {/* Notification */}
      {notification.visible && (
        <View style={[
          styles.notification, 
          notification.type === 'success' ? styles.successNotification : styles.errorNotification
        ]}>
          <Text style={styles.notificationText}>{notification.message}</Text>
        </View>
      )}

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode={datePickerMode}
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            // Handle date selection here
          }}
        />
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
  modifyButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#00ADB5',
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