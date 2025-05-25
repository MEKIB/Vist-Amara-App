import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const colors = {
  primary: '#222831',
  secondary: '#393E46',
  accent: '#00ADB5',
  background: '#EEEEEE',
};

const facilities = [
  {
    id: 1,
    name: 'Hotels & Lodges',
    icon: 'hotel',
    screen: 'Hotels',
  },
  {
    id: 2,
    name: 'Flights',
    icon: 'airplane',
    screen: 'Flights',
  },
  {
    id: 3,
    name: 'Tour Guides',
    icon: 'account-group',
    screen: 'Guides',
  },
  {
    id: 4,
    name: 'Restaurants',
    icon: 'silverware-fork-knife',
    screen: 'Restaurants',
  },
  {
    id: 5,
    name: 'Transportation',
    icon: 'bus',
    screen: 'Transport',
  },
  {
    id: 6,
    name: 'Information Centers',
    icon: 'information',
    screen: 'InfoCenters',
  },
];

const TouristFacilitiesScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Tourist Facilities</Text>
      
      <View style={styles.grid}>
        {facilities.map((facility) => (
          <TouchableOpacity
            key={facility.id}
            style={styles.facilityCard}
            onPress={() => navigation.navigate(facility.screen)}
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons 
                name={facility.icon} 
                size={30} 
                color={colors.accent} 
              />
            </View>
            <Text style={styles.facilityName}>{facility.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  facilityCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
  },
  iconContainer: {
    backgroundColor: colors.background,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  facilityName: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default TouristFacilitiesScreen;