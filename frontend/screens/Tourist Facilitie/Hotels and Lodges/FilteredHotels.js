import React from 'react';
import { View, Text, StyleSheet, FlatList, ImageBackground, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const backgroundImage =
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=1932&q=80';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x200?text=No+Image+Available';

const FilteredHotels = ({ route, navigation }) => {
  const { filteredHotels = [] } = route.params || {};

  console.log('FilteredHotels received:', filteredHotels);

  const handleImageError = (e, hotelName) => {
    console.warn(`Image failed to load for ${hotelName}:`, e.nativeEvent.error);
  };

  const renderHotelItem = ({ item }) => (
    <TouchableOpacity
      style={styles.hotelCard}
      onPress={() => {
        console.log('Navigating to HotelLodges with hotel:', item);
        navigation.navigate('HotelLodges', { hotel: item });
      }}
    >
      <Image
        source={{ uri: item.image || PLACEHOLDER_IMAGE }}
        style={styles.hotelImage}
        onError={(e) => handleImageError(e, item.name)}
      />
      <View style={styles.hotelInfo}>
        <Text style={styles.hotelName}>{item.name}</Text>
        <Text style={styles.hotelLocation}>{item.location}</Text>
        <View style={styles.ratingContainer}>
          <MaterialIcons name="star" size={20} color="#00ADB5" />
          <Text style={styles.ratingText}>{item.rating?.toFixed(1) || 'N/A'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ImageBackground source={{ uri: backgroundImage }} style={styles.backgroundImage} resizeMode="cover">
      <View style={styles.container}>
        <Text style={styles.header}>Filtered Hotels</Text>
        {filteredHotels.length > 0 ? (
          <FlatList
            data={filteredHotels}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            renderItem={renderHotelItem}
            contentContainerStyle={styles.listContent}
            initialNumToRender={10}
          />
        ) : (
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>No hotels found matching your criteria.</Text>
          </View>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(34, 40, 49, 0.8)',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ADB5',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  hotelCard: {
    backgroundColor: '#393E46',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 5,
  },
  hotelImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  hotelInfo: {
    padding: 15,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ADB5',
    marginBottom: 5,
  },
  hotelLocation: {
    fontSize: 14,
    color: '#EEEEEE',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#EEEEEE',
    marginLeft: 5,
    fontSize: 14,
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 18,
    color: '#EEEEEE',
    textAlign: 'center',
  },
});

export default FilteredHotels;