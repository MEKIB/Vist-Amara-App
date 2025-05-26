import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';

const backgroundImage =
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=1932&q=80';
const ALL_LOCATIONS = 'All Locations';
const ALL_FACILITY_TYPES = 'All Facility Types';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x200?text=No+Image+Available';
const BASE_URL =
  Platform.OS === 'android' && !Platform.isEmulator
    ? 'http://192.168.213.208:2000'
    : 'http://localhost:2000';


const FilterHotel = ({ navigation }) => {
  const locations = [ALL_LOCATIONS, 'Bahir Dar', 'Gondar', 'Lalibela', 'Axum', 'Debre Markos'];
  const facilityTypes = [ALL_FACILITY_TYPES, 'Hotels', 'Lodges', 'Resorts', 'Guest Houses', 'Restaurants'];
  const [selectedLocation, setSelectedLocation] = useState(ALL_LOCATIONS);
  const [selectedFacilityType, setSelectedFacilityType] = useState(ALL_FACILITY_TYPES);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleApplyFilters = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (selectedLocation !== ALL_LOCATIONS) params.location = selectedLocation;
      if (selectedFacilityType !== ALL_FACILITY_TYPES) params.facilityType = selectedFacilityType;

      console.log('Fetching hotels:', { url: `${BASE_URL}/api/hotels`, params });
      const response = await axios.get(`${BASE_URL}/api/hotels`, { params });

      console.log('API response:', response.data);
      const filteredHotels = response.data.data?.map((hotel) => ({
        id: hotel._id || '',
        name: hotel.name || 'Unnamed Hotel',
        location: hotel.location || 'Unknown Location',
        image: hotel.images?.[0]?.url
          ? `${BASE_URL}${hotel.images[0].url}`
          : PLACEHOLDER_IMAGE,
        rating: hotel.rating || 4.5,
        HotelAdminId: hotel.HotelAdminId || '',
        description: hotel.description || 'No description available',
        latitude: hotel.latitude || 0,
        longitude: hotel.longitude || 0,
      })) || [];

      if (filteredHotels.length === 0) {
        Alert.alert('No Hotels Found', 'No hotels match your filters. Try different options.');
      }

      console.log('Navigating to FilteredHotels with:', filteredHotels);
      navigation.navigate('FilteredHotels', { filteredHotels });
    } catch (error) {
      console.error('Hotel fetch error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch hotels.';
      Alert.alert('Error', errorMessage);
      navigation.navigate('FilteredHotels', { filteredHotels: [] });
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item, onSelect, currentValue, closeModal }) => (
    <TouchableOpacity
      style={[styles.modalItem, item === currentValue && styles.selectedItem]}
      onPress={() => {
        onSelect(item);
        closeModal();
      }}
    >
      <Text style={styles.modalItemText}>{item}</Text>
      {item === currentValue && <MaterialIcons name="check" size={24} color="#00ADB5" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.statusBarBackground} />
      <ImageBackground source={{ uri: backgroundImage }} style={styles.backgroundImage} resizeMode="cover">
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Find Your Perfect Stay</Text>

            <Text style={styles.label}>Location</Text>
            <TouchableOpacity style={styles.selector} onPress={() => setShowLocationModal(true)}>
              <Text style={styles.selectorText}>{selectedLocation}</Text>
              <MaterialIcons name="arrow-drop-down" size={24} color="#EEEEEE" />
            </TouchableOpacity>

            <Text style={styles.label}>Facility Type</Text>
            <TouchableOpacity style={styles.selector} onPress={() => setShowFacilityModal(true)}>
              <Text style={styles.selectorText}>{selectedFacilityType}</Text>
              <MaterialIcons name="arrow-drop-down" size={24} color="#EEEEEE" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.searchButton, isLoading && styles.disabledButton]}
              onPress={handleApplyFilters}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#EEEEEE" />
              ) : (
                <>
                  <Text style={styles.searchButtonText}>Search Hotels</Text>
                  <MaterialIcons name="search" size={24} color="#EEEEEE" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Modal
          visible={showLocationModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowLocationModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <FlatList
                data={locations}
                keyExtractor={(item) => item}
                renderItem={({ item }) =>
                  renderItem({
                    item,
                    onSelect: setSelectedLocation,
                    currentValue: selectedLocation,
                    closeModal: () => setShowLocationModal(false),
                  })
                }
              />
            </View>
          </View>
        </Modal>

        <Modal
          visible={showFacilityModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowFacilityModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <FlatList
                data={facilityTypes}
                keyExtractor={(item) => item}
                renderItem={({ item }) =>
                  renderItem({
                    item,
                    onSelect: setSelectedFacilityType,
                    currentValue: selectedFacilityType,
                    closeModal: () => setShowFacilityModal(false),
                  })
                }
              />
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#222831',
  },
  statusBarBackground: {
    height: StatusBar.currentHeight || 44,
    backgroundColor: '#222831',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  backgroundImage: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 25,
    borderRadius: 16,
    backgroundColor: 'rgba(57, 62, 70, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(238, 238, 238, 0.1)',
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ADB5',
    textAlign: 'center',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: '#EEEEEE',
    fontWeight: '500',
    marginBottom: 8,
    marginLeft: 5,
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00ADB5',
    borderRadius: 4,
    padding: 12,
    marginBottom: 20,
    backgroundColor: 'rgba(34, 40, 49, 0.7)',
  },
  selectorText: {
    color: '#EEEEEE',
    fontSize: 16,
  },
  searchButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00ADB5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
  },
  searchButtonText: {
    color: '#EEEEEE',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    maxHeight: '60%',
    backgroundColor: '#393E46',
    borderRadius: 10,
    padding: 20,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(238, 238, 238, 0.1)',
  },
  modalItemText: {
    color: '#EEEEEE',
    fontSize: 16,
  },
  selectedItem: {
    backgroundColor: 'rgba(0, 173, 181, 0.2)',
  },
});

export default FilterHotel;