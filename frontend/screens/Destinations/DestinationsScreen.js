import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const colors = {
  primary: '#222831',
  secondary: '#393E46',
  accent: '#00ADB5',
  background: '#EEEEEE',
};

const destinations = [
  {
    id: 1,
    name: 'Lalibela',
    image: require('../../assets/icon.png'),
    type: 'Religious Sites',
  },
  {
    id: 2,
    name: 'Simien Mountains',
    image: require('../../assets/icon.png'),
    type: 'National Parks',
  },
  {
    id: 3,
    name: 'Blue Nile Falls',
    image: require('../../assets/icon.png'),
    type: 'Waterfalls',
  },
  {
    id: 4,
    name: 'Gondar',
    image: require('../../assets/icon.png'),
    type: 'Historical Landmarks',
  },
];

const DestinationsScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Popular Destinations</Text>
      
      {destinations.map((destination) => (
        <TouchableOpacity 
          key={destination.id}
          style={styles.card}
          onPress={() => navigation.navigate('DestinationDetail', { destination })}
        >
          <Image source={destination.image} style={styles.cardImage} />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{destination.name}</Text>
            <View style={styles.cardFooter}>
              <MaterialCommunityIcons 
                name="map-marker" 
                size={16} 
                color={colors.accent} 
              />
              <Text style={styles.cardType}>{destination.type}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardType: {
    fontSize: 14,
    color: colors.secondary,
    marginLeft: 5,
  },
});

export default DestinationsScreen;