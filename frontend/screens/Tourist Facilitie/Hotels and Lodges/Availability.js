import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

const BASE_URL = 'http://localhost:2000'; // Adjust as needed
const colors = {
  dark: '#222831',
  mediumDark: '#393E46',
  primary: '#00ADB5',
  light: '#EEEEEE',
};

const Availability = ({ hotelId, navigation }) => {
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
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

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching rooms for hotel:', hotelId);
        const response = await axios.get(`${BASE_URL}/api/rooms/${hotelId}`);
        setAvailableRooms(response.data.data || []);
        console.log('Fetched rooms:', response.data.data);
      } catch (error) {
        console.error('Room fetch error:', error);
        Alert.alert('Error', 'Failed to fetch available rooms.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRooms();
  }, [hotelId]);

  const roomDetails = {
    Double: {
      bedrooms: [{ name: 'Bedroom', beds: '1 queen bed' }],
      bathrooms: 1,
      size: '40 m²',
      amenities: ['Flat-screen TV', 'Free Wifi', 'Free toiletries', 'Bathtub or shower', 'Towels'],
    },
    Single: {
      bedrooms: [{ name: 'Bedroom', beds: '1 single bed' }],
      bathrooms: 1,
      size: '25 m²',
      amenities: ['Flat-screen TV', 'Free Wifi', 'Free toiletries', 'Bathtub or shower', 'Towels'],
    },
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
    setChildrenAges(newChildren > children ? [...childrenAges, null] : childrenAges.slice(0, newChildren));
  };

  const handleRoomsChange = (delta) => {
    setRooms((prev) => Math.max(1, prev + delta));
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

  const handleRoomSelection = (roomId) => {
    if (selectedRooms.includes(roomId)) {
      setSelectedRooms(selectedRooms.filter((id) => id !== roomId));
    } else if (selectedRooms.length < rooms) {
      setSelectedRooms([...selectedRooms, roomId]);
    }
  };

  const handleReserve = async () => {
    // Check for user authentication (assuming isLoggedIn is managed in App.js)
    if (!hotelId) {
      Alert.alert('Authentication Required', 'Please log in to make a reservation.', [
        { text: 'Cancel' },
        { text: 'Log In', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }
    if (selectedRooms.length === 0) {
      Alert.alert('Error', 'Please select at least one room.');
      return;
    }
    try {
      const booking = {
        hotelId,
        roomIds: selectedRooms,
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
        adults,
        children,
        childrenAges,
      };
      console.log('Submitting booking:', booking);
      await axios.post(`${BASE_URL}/api/reservations`, reservation);
      Alert.alert('Success', `Booking confirmed for ${selectedRooms.length} ${selectedRoomType} room(s).`);
      setSelectedRooms([]);
      setShowBookingForm(false);
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to confirm booking.');
    }
  };

  const roomTypes = [...new Set(availableRooms.map((room) => room.type))];
  const filteredRooms = selectedRoomType
    ? availableRooms.filter((room) => room.type === selectedRoomType)
    : availableRooms;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Check Availability</Text>
      <Text style={styles.subHeader}>We Price Match</Text>

      <View style={styles.searchContainer}>
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

      {showBookingForm && (
        <View style={styles.bookingContainer}>
          <Text style={styles.sectionHeader}>Available Rooms</Text>
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} />
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
                    <Text style={styles.detailTitle}>Bedrooms:</Text>
                    {roomDetails[selectedRoomType]?.bedrooms.map((bedroom, index) => (
                      <Text key={index} style={styles.detailText}>
                        {bedroom.name}: {bedroom.beds}
                      </Text>
                    ))}
                    <Text style={styles.detailTitle}>Bathrooms: {roomDetails[selectedRoomType]?.bathrooms}</Text>
                    <Text style={styles.detailTitle}>Size: {roomDetails[selectedRoomType]?.size}</Text>
                    <Text style={styles.detailTitle}>Amenities:</Text>
                    {roomDetails[selectedRoomType]?.amenities.map((amenity, index) => (
                      <Text key={index} style={styles.detailText}>• {amenity}</Text>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Room Number</Text>
                <Text style={styles.selectInstructions}>Select up to {rooms} room(s)</Text>
                <View style={styles.roomList}>
                  {filteredRooms.map((room) => (
                    <TouchableOpacity
                      key={room.id}
                      style={[
                        styles.roomItem,
                        selectedRooms.includes(room.id) && styles.selectedRoomItem,
                      ]}
                      onPress={() => handleRoomSelection(room.id)}
                      disabled={!selectedRooms.includes(room.id) && selectedRooms.length >= rooms}
                    >
                      <Text
                        style={[
                          styles.roomNumber,
                          selectedRooms.includes(room.id) && styles.selectedRoomNumber,
                        ]}
                      >
                        {room.roomNumber}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {selectedRooms.length > 0 && (
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>Price:</Text>
                  {selectedRooms.map((roomId) => {
                    const room = availableRooms.find((r) => r.id === roomId);
                    return (
                      <Text key={roomId} style={styles.priceText}>
                        {room.roomNumber}: ${room.price || 'N/A'} per night
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
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
    padding: 16,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  roomItem: {
    backgroundColor: colors.dark,
    borderWidth: 1,
    borderColor: colors.mediumDark,
    borderRadius: 4,
    padding: 10,
    marginRight: 10,
    marginBottom: 10,
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
});

export default Availability;