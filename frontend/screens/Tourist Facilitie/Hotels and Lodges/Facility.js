import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet,Platform, ScrollView } from 'react-native';
import { Divider, List } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Facility = ({ hotelAdminId }) => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 const BASE_URL =
   Platform.OS === 'android' && !Platform.isEmulator
     ? 'http://192.168.232.208:2000'
     : 'http://localhost:2000';
  // Fetch amenities from the backend
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/amenities/by-hotel?hotelAdminId=${hotelAdminId}`);
        const result = await response.json();
        
        if (response.ok) {
          // Assuming the API returns an array of amenities in result.data
          setFacilities(result.data || []);
        } else {
          setError(result.message || 'Failed to fetch amenities');
        }
      } catch (err) {
        setError('Network error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (hotelAdminId) {
      fetchAmenities();
    } else {
      setError('Hotel Admin ID is missing');
      setLoading(false);
    }
  }, [hotelAdminId]);

  // Group facilities by category
  const groupedFacilities = facilities.reduce((acc, facility) => {
    const category = facility.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(facility);
    return acc;
  }, {});

  const iconMap = {
    wifi: 'wifi',
    pool: 'pool',
    restaurant: 'restaurant',
    laundry: 'local-laundry-service',
    air: 'ac-unit',
    parking: 'local-parking',
    fitness: 'fitness-center',
    gym: 'fitness-center',
    tv: 'tv',
    kitchen: 'kitchen',
    bathroom: 'bathtub',
    breakfast: 'free-breakfast',
    bar: 'local-bar',
    spa: 'spa',
    desk: 'desk',
  };

  const getIconName = (facilityName = '') => {
    const lowerName = facilityName.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lowerName.includes(key)) {
        return icon;
      }
    }
    return 'help'; // default icon
  };

  const renderItem = ({ item }) => (
    <List.Item
      title={item.name}
      description={item.description || ''}
      left={() => (
        <Icon name={getIconName(item.name)} size={24} color="#00ADB5" style={styles.icon} />
      )}
      titleStyle={styles.itemTitle}
      descriptionStyle={styles.itemDescription}
    />
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Hotel Facilities</Text>
        <Text style={styles.loadingText}>Loading amenities...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Hotel Facilities</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Hotel Facilities</Text>
      <ScrollView>
        {Object.entries(groupedFacilities).length > 0 ? (
          Object.entries(groupedFacilities).map(([category, items]) => (
            <View key={category} style={styles.categoryContainer}>
              <Text style={styles.categoryTitle}>{category}</Text>
              <View style={styles.listContainer}>
                <FlatList
                  data={items}
                  renderItem={renderItem}
                  scrollEnabled={false}
                  keyExtractor={(item, index) => index.toString()}
                  ItemSeparatorComponent={() => <Divider style={styles.divider} />}
                />
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.errorText}>No amenities available</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#222831',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ADB5',
    marginBottom: 16,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    color: '#00ADB5',
    marginBottom: 8,
  },
  listContainer: {
    backgroundColor: '#393E46',
    borderRadius: 8,
    overflow: 'hidden',
  },
  itemTitle: {
    color: '#EEEEEE',
    fontSize: 16,
  },
  itemDescription: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  icon: {
    marginRight: 8,
    alignSelf: 'center',
  },
  divider: {
    backgroundColor: '#EEEEEE20',
    height: 1,
    marginHorizontal: 16,
  },
  loadingText: {
    color: '#EEEEEE',
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF5555',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Facility;