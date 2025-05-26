import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL =
  Platform.OS === 'android' && !Platform.isEmulator
    ? 'http://192.168.213.208:2000'
    : 'http://localhost:2000';
const colors = {
  dark: '#222831',
  mediumDark: '#393E46',
  primary: '#00ADB5',
  light: '#EEEEEE',
};

const Availability = ({ hotelAdminId, navigation }) => {
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  );
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [childrenAges, setChildrenAges] = useState([]);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [ageError, setAgeError] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  // Load authentication data on mount
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        console.log('Attempting to load auth data from SecureStore');
        const storedToken = await SecureStore.getItemAsync('jwtToken');
        const storedUser = await SecureStore.getItemAsync('user');
        console.log('Retrieved from SecureStore - Token:', storedToken);
        console.log('Retrieved from SecureStore - User:', storedUser);

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          console.log('Auth data set - User ID:', parsedUser?.id);
        } else {
          console.warn('No token or user found in SecureStore');
        }
      } catch (error) {
        console.error('Error retrieving auth data from SecureStore:', error);
        Alert.alert('Error', 'Failed to load authentication data. Please try logging in again.');
      } finally {
        setAuthLoaded(true);
      }
    };
    loadAuthData();
  }, []);

  useEffect(() => {
    if (showBookingForm) {
      fetchAvailableRooms();
    }
  }, [checkInDate, checkOutDate, hotelAdminId, showBookingForm]);

  const fetchAvailableRooms = async () => {
    if (!checkInDate || !checkOutDate || !hotelAdminId) {
      Alert.alert('Error', 'Please select dates and ensure hotel ID is provided.');
      return;
    }
    try {
      setIsLoading(true);
      console.log('Fetching rooms for hotelAdminId:', hotelAdminId);
      const response = await axios.get(
        `${BASE_URL}/api/rooms/available/${hotelAdminId}`,
        {
          params: {
            checkInDate: checkInDate.toISOString(),
            checkOutDate: checkOutDate.toISOString(),
          },
        }
      );
      const rooms = response.data.data || [];
      console.log('Fetched rooms:', rooms);
      setAvailableRooms(rooms.filter((room) => room.type && room.roomNumber));
      if (rooms.length === 0) {
        Alert.alert('No Rooms', 'No valid rooms available for the selected dates.');
      }
    } catch (error) {
      console.error('Room fetch error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch available rooms.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (checkOutDate <= checkInDate) {
      Alert.alert('Invalid Dates', 'Check-out date must be after check-in date.');
      return;
    }
    console.log('Searching availability:', { checkInDate, checkOutDate, adults, children, rooms });
    setShowBookingForm(true);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const onChangeCheckIn = (event, selectedDate) => {
    setShowCheckInPicker(false);
    if (selectedDate) {
      setCheckInDate(selectedDate);
      if (checkOutDate <= selectedDate) {
        const newCheckOut = new Date(selectedDate);
        newCheckOut.setDate(selectedDate.getDate() + 1);
        setCheckOutDate(newCheckOut);
      }
    }
  };

  const onChangeCheckOut = (event, selectedDate) => {
    setShowCheckOutPicker(false);
    if (selectedDate) {
      setCheckOutDate(selectedDate);
    }
  };

  const handleAdultsChange = (delta) => {
    setAdults((prev) => Math.max(1, prev + delta));
  };

  const handleChildrenChange = (delta) => {
    const newChildren = Math.max(0, children + delta);
    setChildren(newChildren);
    setChildrenAges(
      newChildren > children
        ? [...childrenAges, null]
        : childrenAges.slice(0, newChildren)
    );
  };

  const handleRoomsChange = (delta) => {
    setRooms((prev) => Math.max(1, prev + delta));
    if (selectedRooms.length > rooms + delta) {
      setSelectedRooms(selectedRooms.slice(0, rooms + delta));
    }
  };

  const handleChildAgeChange = (index, age) => {
    const newAges = [...childrenAges];
    newAges[index] = age;
    setChildrenAges(newAges);
    setAgeError(false);
  };

  const handleRoomTypeSelection = (value) => {
    setSelectedRoomType(value);
    setSelectedRooms([]);
  };

  const handleRoomSelection = (roomNumber) => {
    if (selectedRooms.includes(roomNumber)) {
      setSelectedRooms(selectedRooms.filter((num) => num !== roomNumber));
    } else if (selectedRooms.length < rooms) {
      setSelectedRooms([...selectedRooms, roomNumber]);
    }
  };

  const handleReserve = async () => {
    if (!authLoaded) {
      Alert.alert('Loading', 'Authentication data is still loading. Please wait a moment.');
      return;
    }

    if (!token || !user?.id) {
      console.warn('Reserve attempt failed - Token:', token, 'User ID:', user?.id);
      Alert.alert(
        'Authentication Required',
        'Please log in to make a reservation.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Log In', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    if (!selectedRoomType || selectedRooms.length === 0) {
      Alert.alert('Error', 'Please select a room type and at least one room.');
      return;
    }

    const invalidRooms = selectedRooms.filter(
      (roomNumber) =>
        !availableRooms.some(
          (room) => room.roomNumber === roomNumber && room.type === selectedRoomType
        )
    );
    if (invalidRooms.length > 0) {
      Alert.alert('Error', `Invalid room numbers selected: ${invalidRooms.join(', ')}`);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Creating reservations:', {
        selectedRoomType,
        selectedRooms,
        userId: user.id,
        token,
      });

      const promises = selectedRooms.map((roomNumber) =>
        axios.post(
          `${BASE_URL}/api/reservations`,
          {
            hotelAdminId,
            userId: user.id,
            roomType: selectedRoomType,
            roomNumber,
            checkInDate: checkInDate.toISOString(),
            checkOutDate: checkOutDate.toISOString(),
            adults,
            children,
            childrenAges,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
      );

      await Promise.all(promises);
      Alert.alert('Success', `Reservation(s) confirmed for ${selectedRooms.length} ${selectedRoomType} room(s).`);
      setSelectedRooms([]);
      setSelectedRoomType('');
      setShowBookingForm(false);
      fetchAvailableRooms();
    } catch (error) {
      console.error('Reservation error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to make reservation.');
    } finally {
      setIsLoading(false);
    }
  };

  const roomTypes = [...new Set(availableRooms.map((room) => room.type))];
  const filteredRooms = selectedRoomType
    ? availableRooms.filter((room) => room.type === selectedRoomType)
    : availableRooms;

  // Data structure for FlatList to render all sections
  const sections = [
    { type: 'searchForm', key: 'searchForm' },
    ...(showBookingForm
      ? [
          { type: 'bookingSection', key: 'bookingSection' },
        ]
      : []),
  ];

  const renderSearchForm = () => (
    <View style={styles.searchContainer}>
      <Text style={styles.header}>Check Availability</Text>
      <Text style={styles.subHeader}>We Price Match</Text>
      <View style={styles.dateInputContainer}>
        <TouchableOpacity style={styles.dateInput} onPress={() => setShowCheckInPicker(true)}>
          <Text style={styles.dateText}>Check-in: {formatDate(checkInDate)}</Text>
          <Icon name="calendar-month" size={20} color={colors.primary} />
        </TouchableOpacity>
        {showCheckInPicker && (
          <DateTimePicker
            value={checkInDate}
            mode="date"
            display="spinner"
            onChange={onChangeCheckIn}
            minimumDate={new Date()}
          />
        )}

        <TouchableOpacity style={styles.dateInput} onPress={() => setShowCheckOutPicker(true)}>
          <Text style={styles.dateText}>Check-out: {formatDate(checkOutDate)}</Text>
          <Icon name="calendar-month" size={20} color={colors.primary} />
        </TouchableOpacity>
        {showCheckOutPicker && (
          <DateTimePicker
            value={checkOutDate}
            mode="date"
            display="spinner"
            onChange={onChangeCheckOut}
            minimumDate={new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000)}
          />
        )}
      </View>

      <TouchableOpacity style={styles.guestInput} onPress={() => setShowGuestModal(true)}>
        <Text style={styles.guestText}>
          {adults} Adult{adults !== 1 ? 's' : ''}, {children} Child{children !== 1 ? 'ren' : ''}, {rooms} Room{rooms !== 1 ? 's' : ''}
        </Text>
        <Icon name="arrow-drop-down" size={24} color={colors.primary} />
      </TouchableOpacity>

      <Modal visible={showGuestModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Guests and Rooms</Text>
              <TouchableOpacity onPress={() => setShowGuestModal(false)}>
                <Icon name="close" size={24} color={colors.light} />
              </TouchableOpacity>
            </View>

            <View style={styles.guestControl}>
              <Text style={styles.guestLabel}>Adults</Text>
              <View style={styles.counter}>
                <TouchableOpacity onPress={() => handleAdultsChange(-1)}>
                  <Icon name="remove" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{adults}</Text>
                <TouchableOpacity onPress={() => handleAdultsChange(1)}>
                  <Icon name="add" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.guestControl}>
              <Text style={styles.guestLabel}>Children</Text>
              <View style={styles.counter}>
                <TouchableOpacity onPress={() => handleChildrenChange(-1)}>
                  <Icon name="remove" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{children}</Text>
                <TouchableOpacity onPress={() => handleChildrenChange(1)}>
                  <Icon name="add" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {children > 0 && (
              <View style={styles.ageSelection}>
                <Text style={styles.ageLabel}>Age needed</Text>
                {childrenAges.map((age, index) => (
                  <View key={index} style={styles.ageControl}>
                    <Text style={styles.ageText}>Child {index + 1}</Text>
                    <Picker
                      selectedValue={age}
                      onValueChange={(itemValue) => handleChildAgeChange(index, itemValue)}
                      style={styles.agePicker}
                    >
                      <Picker.Item label="Select age" value={null} />
                      {[...Array(18)].map((_, i) => (
                        <Picker.Item key={i} label={`${i} years`} value={i} />
                      ))}
                    </Picker>
                  </View>
                ))}
                {ageError && (
                  <Text style={styles.errorText}>Please select age for all children</Text>
                )}
              </View>
            )}

            <View style={styles.guestControl}>
              <Text style={styles.guestLabel}>Rooms</Text>
              <View style={styles.counter}>
                <TouchableOpacity onPress={() => handleRoomsChange(-1)}>
                  <Icon name="remove" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{rooms}</Text>
                <TouchableOpacity onPress={() => handleRoomsChange(1)}>
                  <Icon name="add" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => {
                if (children > 0 && childrenAges.some((age) => age === null)) {
                  setAgeError(true);
                } else {
                  setShowGuestModal(false);
                  setAgeError(false);
                }
              }}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>Search</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBookingSection = () => (
    <View style={styles.bookingContainer}>
      <Text style={styles.sectionHeader}>Available Rooms</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : availableRooms.length === 0 ? (
        <Text style={styles.noRoomsText}>No rooms available for the selected dates.</Text>
      ) : (
        <>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Room Type</Text>
            <Picker
              selectedValue={selectedRoomType}
              onValueChange={handleRoomTypeSelection}
              style={styles.picker}
            >
              <Picker.Item label="Select Room Type" value="" />
              {roomTypes.map((type, index) => (
                <Picker.Item key={index} label={type} value={type} />
              ))}
            </Picker>
          </View>

          {selectedRoomType && (
            <View style={styles.roomDetails}>
              <Text style={styles.roomTypeHeader}>{selectedRoomType} Room Details</Text>
              <View style={styles.detailBox}>
                <Text style={styles.detailTitle}>Bathrooms:</Text>
                <Text style={styles.detailText}>
                  {availableRooms.find((r) => r.type === selectedRoomType)?.bathrooms || 1}
                </Text>
                <Text style={styles.detailTitle}>Size:</Text>
                <Text style={styles.detailText}>
                  {availableRooms.find((r) => r.type === selectedRoomType)?.size || 'Unknown'}
                </Text>
                <Text style={styles.detailTitle}>Amenities:</Text>
                {(availableRooms.find((r) => r.type === selectedRoomType)?.amenities || []).map(
                  (amenity, index) => (
                    <Text key={index} style={styles.detailText}>• {amenity.name}</Text>
                  )
                )}
              </View>
            </View>
          )}

          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Room Number</Text>
            <Text style={styles.selectInstructions}>Select up to {rooms} room(s)</Text>
            <FlatList
              data={filteredRooms}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.roomItem,
                    selectedRooms.includes(item.roomNumber) && styles.selectedRoomItem,
                  ]}
                  onPress={() => handleRoomSelection(item.roomNumber)}
                  disabled={
                    !selectedRooms.includes(item.roomNumber) && selectedRooms.length >= rooms
                  }
                >
                  <Text
                    style={[
                      styles.roomNumber,
                      selectedRooms.includes(item.roomNumber) && styles.selectedRoomNumber,
                    ]}
                  >
                    {item.roomNumber}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              numColumns={3}
              contentContainerStyle={styles.roomList}
              scrollEnabled={false} // Disable internal scrolling
            />
          </View>

          {selectedRooms.length > 0 && (
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Price:</Text>
              {selectedRooms.map((roomNumber) => {
                const room = availableRooms.find(
                  (r) => r.roomNumber === roomNumber && r.type === selectedRoomType
                );
                return (
                  <Text key={roomNumber} style={styles.priceText}>
                    {roomNumber}: ${room?.price || 'N/A'} per night
                  </Text>
                );
              })}
            </View>
          )}

          {selectedRooms.length > 0 && (
            <TouchableOpacity style={styles.reserveButton} onPress={handleReserve}>
              <Text style={styles.reserveButtonText}>I Will Reserve</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );

  const renderItem = ({ item }) => {
    switch (item.type) {
      case 'searchForm':
        return renderSearchForm();
      case 'bookingSection':
        return renderBookingSection();
      default:
        return null;
    }
  };

  return (
    <FlatList
      data={sections}
      renderItem={renderItem}
      keyExtractor={(item) => item.key}
      contentContainerStyle={styles.container}
      nestedScrollEnabled={false} // Explicitly disable nested scrolling
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dark,
    padding: 16,
    flexGrow: 1,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 14,
    color: colors.light,
    marginBottom: 20,
  },
  searchContainer: {
    marginBottom: 20,
  },
  dateInputContainer: {
    marginBottom: 12,
  },
  dateInput: {
    backgroundColor: colors.mediumDark,
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    color: colors.light,
    fontSize: 16,
  },
  guestInput: {
    backgroundColor: colors.mediumDark,
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guestText: {
    color: colors.light,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    color: colors.light,
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.mediumDark,
    margin: 20,
    borderRadius: 8,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.light,
  },
  guestControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  guestLabel: {
    fontSize: 16,
    color: colors.light,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 16,
    color: colors.light,
    marginHorizontal: 15,
  },
  ageSelection: {
    marginBottom: 20,
  },
  ageLabel: {
    fontSize: 14,
    color: colors.light,
    marginBottom: 10,
  },
  ageControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ageText: {
    fontSize: 14,
    color: colors.light,
  },
  agePicker: {
    width: 150,
    backgroundColor: colors.dark,
    color: colors.light,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  doneButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: colors.light,
    fontWeight: 'bold',
    fontSize: 16,
  },
  bookingContainer: {
    marginTop: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 15,
  },
  pickerContainer: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 16,
    color: colors.light,
    marginBottom: 8,
  },
  picker: {
    backgroundColor: colors.mediumDark,
    color: colors.light,
  },
  roomDetails: {
    marginBottom: 20,
  },
  roomTypeHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  detailBox: {
    backgroundColor: colors.dark,
    borderWidth: 1,
    borderColor: colors.mediumDark,
    borderRadius: 8,
    padding: 15,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.light,
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: colors.light,
    marginBottom: 5,
    marginLeft: 10,
  },
  selectInstructions: {
    fontSize: 12,
    color: colors.light,
    marginBottom: 10,
  },
  roomList: {
    paddingBottom: 10,
  },
  roomItem: {
    backgroundColor: colors.dark,
    borderWidth: 1,
    borderColor: colors.mediumDark,
    borderRadius: 4,
    padding: 10,
    margin: 5,
    flex: 1,
    alignItems: 'center',
    minWidth: '30%',
  },
  selectedRoomItem: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}20`,
  },
  roomNumber: {
    color: colors.light,
  },
  selectedRoomNumber: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  priceContainer: {
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.light,
    marginBottom: 5,
  },
  priceText: {
    fontSize: 14,
    color: colors.light,
    marginBottom: 3,
  },
  reserveButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  reserveButtonText: {
    color: colors.light,
    fontWeight: 'bold',
    fontSize: 16,
  },
  noRoomsText: {
    fontSize: 16,
    color: colors.light,
    textAlign: 'center',
  },
});

export default Availability;