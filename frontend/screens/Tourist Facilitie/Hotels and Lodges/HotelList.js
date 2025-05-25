import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import FilterHotel from '../../FilterHotel';

const ALL_LOCATIONS = 'All Locations';
const ALL_FACILITY_TYPES = 'All Facility Types';

const HotelList = ({ navigation }) => {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data
    const mockHotels = [
      {
        id: 1,
        name: "Unison Hotel",
        location: "Bahir Dar",
        facilityType: "Hotels",
        image: require('../../../assets/unison.jpg'),
        rating: 4.7,
        description: "Luxurious hotel with excellent amenities"
      },
      {
        id: 2,
        name: "Sky Resort",
        location: "Bahir Dar",
        facilityType: "Hotels",
        image: require('../../../assets/sky-resort.jpeg'),
        rating: 4.5,
        description: "Beautiful resort with amazing views"
      },
      {
        id: 3,
        name: "Gondar Palace Hotel",
        location: "Gondar",
        facilityType: "Hotels",
        image: require('../../../assets/gondar-palace.jpg'),
        rating: 4.2,
        description: "Historical hotel with royal ambiance"
      },
      {
        id: 4,
        name: "Lalibela Lodge",
        location: "Lalibela",
        facilityType: "Lodges",
        image: require('../../../assets/lalibela-lodge.jpg'),
        rating: 4.8,
        description: "Cozy lodge near the rock-hewn churches"
      },
      {
        id: 5,
        name: "Blue Nile Restaurant",
        location: "Bahir Dar",
        facilityType: "Restaurants",
        image: require('../../../assets/blue-nile.jpg'),
        rating: 4.3,
        description: "Fine dining with Nile views"
      }
    ];
    
    setHotels(mockHotels);
    setFilteredHotels(mockHotels);
    setLoading(false);
  }, []);

  const handleFilterSubmit = (location, facilityType) => {
    let filtered = hotels;

    if (location !== ALL_LOCATIONS) {
      filtered = filtered.filter((hotel) => hotel.location === location);
    }

    if (facilityType !== ALL_FACILITY_TYPES) {
      filtered = filtered.filter((hotel) => hotel.facilityType === facilityType);
    }

    setFilteredHotels(filtered);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading hotels...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FilterHotel onApply={handleFilterSubmit} />
      
      <FlatList
        data={filteredHotels}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.hotelCard}
            onPress={() => navigation.navigate('HotelDetails', { hotel: item })}
          >
            <Image source={item.image} style={styles.hotelImage} />
            <View style={styles.hotelInfo}>
              <Text style={styles.hotelName}>{item.name}</Text>
              <Text style={styles.hotelLocation}>{item.location}</Text>
              <View style={styles.ratingContainer}>
                <MaterialIcons name="star" size={20} color="#FFD700" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hotels found matching your criteria.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222831',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222831',
  },
  loadingText: {
    color: '#EEEEEE',
    fontSize: 18,
  },
  hotelCard: {
    backgroundColor: '#393E46',
    borderRadius: 10,
    margin: 10,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  hotelImage: {
    width: '100%',
    height: 200,
  },
  hotelInfo: {
    padding: 15,
  },
  hotelName: {
    color: '#00ADB5',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  hotelLocation: {
    color: '#EEEEEE',
    fontSize: 14,
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#EEEEEE',
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#EEEEEE',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default HotelList;