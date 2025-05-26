import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import { MaterialIcons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { Divider } from 'react-native-elements';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import PaymentModal from './paymentModal'; // Assume this is the provided PaymentModal

const defaultHotelImage = require('../../assets/icon.png');

const ReserveScreen = () => {
  const [activeTab, setActiveTab] = useState('saved');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reservationToRemove, setReservationToRemove] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigation = useNavigation();

  // Authentication state
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const BASE_URL = Platform.OS === 'android' && !Platform.isEmulator ? 'http:/192.168.213.185:2000' : 'http://localhost:2000';

  // Fetch user data from SecureStore
  const fetchUserData = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('jwtToken');
      const storedUser = await SecureStore.getItemAsync('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Error fetching user data from SecureStore:', e);
      setError('Failed to load user data. Please log in again.');
      ToastAndroid.show('Failed to load user data. Please log in again.', ToastAndroid.LONG);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const userId = user?.id;
  const isLoggedIn = !!token && !!userId && !!user;
  const isRegularUser = isLoggedIn && user.role === 'user';

  console.log('User status:', { token, user, userId, isLoggedIn, isRegularUser });

  // Memoize user to prevent unnecessary re-renders
  const memoizedUser = useMemo(() => user, [JSON.stringify(user)]);

  // Fetch reservations
  const fetchReservations = async () => {
    if (!isLoggedIn || !isRegularUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log(`Fetching reservations for user ID: ${userId}`);
      const response = await axios.get(
        `${BASE_URL}/api/reservations/user?userId=${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const resData = response.data.data;
      const enhancedReservations = await Promise.all(
        resData.map(async (reservation) => {
          try {
            const hotelResponse = await axios.get(
              `${BASE_URL}/api/hotels/${reservation.hotelAdminId}`
            );
            const hotel = hotelResponse.data.data;

            const reviewResponse = await axios.get(
              `${BASE_URL}/api/reviews/${reservation.hotelAdminId}/average`
            );
            const { averageRating } = reviewResponse.data.data;

            const checkIn = new Date(reservation.checkInDate);
            const checkOut = new Date(reservation.checkOutDate);
            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            const duration = `${nights} night${nights !== 1 ? 's' : ''}`;
            const imageUrl = hotel.images[0]?.url
              ? `${BASE_URL}${hotel.images[0].url.startsWith('/') ? '' : '/'}${hotel.images[0].url}`
              : null;

            return {
              id: reservation._id,
              title: hotel.name,
              price: (reservation.totalPrice / nights).toFixed(2),
              duration,
              image: imageUrl,
              saved: true,
              location: hotel.location,
              date: `${checkIn.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })} - ${checkOut.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}`,
              rating: averageRating || 'N/A',
              hotelName: hotel.name,
              roomType: reservation.roomType,
              roomNumbers: [reservation.roomNumber],
              numberOfRooms: 1,
              checkInDate: checkIn.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              }),
              checkOutDate: checkOut.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              }),
              totalPrice: reservation.totalPrice.toFixed(2),
              createdAt: new Date(reservation.createdAt),
              hotelAdminId: reservation.hotelAdminId,
            };
          } catch (err) {
            console.error(`Error processing reservation ${reservation._id}:`, err);
            return null;
          }
        })
      );

      const validReservations = enhancedReservations.filter((res) => res !== null);
      setReservations(validReservations);
      if (validReservations.length === 0) {
        console.log('No reservations found for user ID:', userId);
      }
    } catch (err) {
      console.error('Reservation fetch failed:', err);
      let errorMessage = 'Failed to fetch reservations';
      if (err.response?.status === 400) {
        errorMessage = 'Invalid user ID. Please log in again.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Unauthorized. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Invalid token. Please log in again.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Reservations endpoint not found. Please contact support.';
      } else {
        errorMessage = err.response?.data?.message || 'Failed to fetch reservations';
      }
      setError(errorMessage);
      ToastAndroid.show(errorMessage, ToastAndroid.LONG);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [token, memoizedUser, isLoggedIn, isRegularUser, userId]);

  // Auto-delete reservations after 1 hour
  useEffect(() => {
    const timeouts = reservations.map((reservation) => {
      if (!reservation.createdAt) {
        console.warn(`Reservation ${reservation.id} missing createdAt timestamp`);
        return null;
      }

      const createdTime = new Date(reservation.createdAt).getTime();
      const currentTime = Date.now();
      const timeElapsed = currentTime - createdTime;
      const oneHour = 60 * 60 * 1000;

      if (timeElapsed >= oneHour) {
        deleteReservation(reservation.id, reservation.title);
        return null;
      }

      const timeRemaining = oneHour - timeElapsed;
      console.log(`Setting timeout for reservation ${reservation.id} to delete in ${timeRemaining / 1000} seconds`);
      return setTimeout(() => {
        console.log(`Auto-deleting reservation ${reservation.id} after 1 hour`);
        deleteReservation(reservation.id, reservation.title);
      }, timeRemaining);
    });

    return () => {
      timeouts.forEach((timeout) => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, [reservations]);

  // Delete reservation
  const deleteReservation = async (reservationId, title) => {
    try {
      await axios.delete(`${BASE_URL}/api/reservations/${reservationId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId },
      });
      setReservations((prev) => prev.filter((r) => r.id !== reservationId));
      setSuccess(`Reservation at ${title} cancelled successfully`);
      ToastAndroid.show(`Reservation at ${title} cancelled successfully`, ToastAndroid.LONG);
    } catch (err) {
      console.error('Failed to delete reservation:', err);
      let errorMessage = 'Failed to delete reservation';
      if (err.response?.status === 400) {
        errorMessage = 'Invalid reservation ID format. Please try again.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Unauthorized. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You are not authorized to delete this reservation.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Reservation not found.';
      } else {
        errorMessage = err.response?.data?.message || 'Failed to delete reservation';
      }
      setError(errorMessage);
      ToastAndroid.show(errorMessage, ToastAndroid.LONG);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = (reservationId, title) => {
    deleteReservation(reservationId, title);
  };

  const savedCount = reservations.filter((r) => r.saved).length;

  const handleRemoveClick = (reservation) => {
    setReservationToRemove(reservation);
    setShowConfirmModal(true);
  };

  const confirmRemove = async () => {
    if (!reservationToRemove) return;
    await deleteReservation(reservationToRemove.id, reservationToRemove.title);
    setShowConfirmModal(false);
    setReservationToRemove(null);
  };

  const cancelRemove = () => {
    setShowConfirmModal(false);
    setReservationToRemove(null);
  };

  const handleBookNow = (reservation) => {
    setCurrentBooking({
      hotelName: reservation.hotelName,
      roomType: reservation.roomType,
      roomNumbers: reservation.roomNumbers,
      numberOfRooms: reservation.numberOfRooms,
      checkInDate: reservation.checkInDate,
      checkOutDate: reservation.checkOutDate,
      totalPrice: reservation.totalPrice,
      reservationId: reservation.id,
      title: reservation.title,
      hotelAdminId: reservation.hotelAdminId,
      image: reservation.image,
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
            <MaterialCommunityIcons name="bed-king" size={24} color="#00ADB5" />
            <Text style={styles.detailText}>{item.roomType}</Text>
          </View>
          
           <View style={styles.detailRow}>
  <MaterialCommunityIcons name="door" size={24} color="#00ADB5" />
  <Text style={styles.detailText}>Rooms: {item.roomNumbers.join(', ')}</Text>
</View>
            
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="weather-night" size={24} color="#00ADB5" />
                <Text style={styles.detailText}>{item.duration}</Text>
              </View>
            </View>
            
            <View style={styles.datesContainer}>
              <View style={styles.dateRow}>
                <MaterialCommunityIcons name="calendar-arrow-right" size={24} color="#00ADB5" />
                <Text style={styles.dateText}>Check-in: {item.checkInDate}</Text>
              </View>
              <View style={styles.dateRow}>
                <MaterialCommunityIcons name="calendar-arrow-left" size={24} color="#00ADB5" />
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
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Hotels')}
          >
            <Text style={styles.browseButtonText}>Browse Hotels</Text>
          </TouchableOpacity>
        </View>
      );
      
      const renderLoginPrompt = () => (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <MaterialIcons name="favorite" size={40} color="#00ADB5" />
          </View>
          <Text style={styles.emptyTitle}>Please Log In</Text>
          <Text style={styles.emptySubtitle}>Log in to view your saved reservations</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.browseButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      );
      
      const renderAccessRestricted = () => (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <MaterialIcons name="favorite" size={40} color="#00ADB5" />
          </View>
          <Text style={styles.emptyTitle}>Access Restricted</Text>
          <Text style={styles.emptySubtitle}>Only regular users can view reservations</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.browseButtonText}>Log In as User</Text>
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
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00ADB5" />
              </View>
            ) : activeTab === 'saved' ? (
              !isLoggedIn ? (
                renderLoginPrompt()
              ) : !isRegularUser ? (
                renderAccessRestricted()
              ) : reservations.filter((r) => r.saved).length > 0 ? (
                <FlatList
                  data={reservations.filter((r) => r.saved)}
                  renderItem={renderReservationItem}
                  keyExtractor={(item) => item.id.toString()}
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
            onRequestClose={cancelRemove}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Confirm Removal</Text>
                <Text style={styles.modalText}>
                  Are you sure you want to remove "{reservationToRemove?.title}" from your saved
                  reservations?
                </Text>
                <Text style={styles.modalText}>
                  Cancellation fees may apply depending on the hotel's policy.
                </Text>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={cancelRemove}
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
            onPaymentSuccess={handlePaymentSuccess}
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
        borderRadius: 12,
        marginBottom: 15,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
      },
      imageContainer: {
        width: '100%',
        height: 200,
      },
      hotelImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
      },
      reservationContent: {
        padding: 15,
      },
      reservationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
      },
      hotelName: {
        fontSize: 18,
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
        marginBottom: 12,
      },
      detailsContainer: {
        marginBottom: 12,
      },
      detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
      },
      detailText: {
        color: '#EEEEEE',
        fontSize: 14,
        marginLeft: 8,
      },
      datesContainer: {
        backgroundColor: 'rgba(0, 173, 181, 0.1)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
      },
      dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
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
        fontSize: 'bold',
        fontWeight: 16,
      },
      nightPrice: {
        color: '#EEEE',
        fontSize: '14',
      },
      actionContainer: {
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
        borderRadius: 10,
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
        minHeight: 400,
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
        fontSize: 20,
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
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
      },
      browseButtonText: {
        color: '#00ADB5',
        fontSize: 16,
        fontWeight: '500',
      },
      comingSoon: {
        color: '#EEEEEE',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 40,
      },
      loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
      },
      modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
      },
      modalContainer: {
        backgroundColor: '#393E46',
        borderRadius: 12,
        padding: 20,
        width: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
      },
      modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#00ADB5',
        marginBottom: 12,
      },
      modalText: {
        color: '#EEEEEE',
        fontSize: 16,
        marginBottom: 12,
      },
      modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 12,
      },
      modalButton: {
        paddingHorizontal: 16,
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
        fontSize: 16,
        fontWeight: 'bold',
      },
    });
    
    export default ReserveScreen;

    