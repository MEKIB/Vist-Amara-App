import React from 'react';
import { View, StyleSheet, Text, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const FacilityScreen = ({ route }) => {
  const facilities = [
    { id: 1, name: 'Flights', icon: 'airplane' },
    { id: 2, name: 'Hotels and Lodges', icon: 'bed' },
    { id: 3, name: 'Tourist Information Centers', icon: 'information' },
    { id: 4, name: 'Other Service Providers', icon: 'account-group' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tourist Facilities</Text>
      <FlatList
        data={facilities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <MaterialCommunityIcons 
              name={item.icon} 
              size={24} 
              color="#00ADB5" 
              style={styles.icon}
            />
            <Text style={styles.itemText}>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#EEEEEE',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222831',
    marginBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  icon: {
    marginRight: 15,
  },
  itemText: {
    fontSize: 16,
    color: '#222831',
  },
});

export default FacilityScreen;