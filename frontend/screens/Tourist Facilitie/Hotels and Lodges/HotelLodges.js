import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HotelDetails from './HotelDetails';
import Facilities from './Facility';
import Availability from './Availability';
import HouseRules from './HotelRules';

function HotelsLodges({ navigation }) {
  const route = useRoute();
  const hotel = route.params?.hotel;

  if (!hotel) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No hotel data available</Text>
      </SafeAreaView>
    );
  }

  // Ensure all required data exists with defaults
  const hotelWithData = {
    id: hotel.id || '',
    name: hotel.name || 'Hotel Name',
    image: hotel.image || 'https://via.placeholder.com/300',
    location: hotel.location || 'Location not specified',
    description: hotel.description || 'No description available',
    latitude: hotel.latitude || 0,
    longitude: hotel.longitude || 0,
    HotelAdminId: hotel.HotelAdminId || '',
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <HotelDetails
          hotel={hotelWithData}
          hotelAdminId={hotelWithData.HotelAdminId}
          navigation={navigation}
        />
        <Facilities hotelId={hotelWithData.id} hotelAdminId={hotelWithData.HotelAdminId} />
        <HouseRules hotelId={hotelWithData.id} hotelAdminId={hotelWithData.HotelAdminId} />
        
        <Availability
          hotelId={hotelWithData.id}
          hotelAdminId={hotelWithData.HotelAdminId}
          navigation={navigation} // Pass navigation prop
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222831',
  },
  errorText: {
    color: '#EEEEEE',
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
  },
});

export default HotelsLodges;