import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const colors = {
  primary: '#222831',
  secondary: '#393E46',
  accent: '#00ADB5',
  background: '#EEEEEE',
};

const events = [
  {
    id: 1,
    title: 'Timket Festival',
    date: 'Jan 19-20, 2024',
    location: 'Gondar',
    image: require('../../assets/icon.png'),
  },
  {
    id: 2,
    title: 'Meskel Celebration',
    date: 'Sep 27, 2024',
    location: 'Addis Ababa',
    image: require('../../assets/icon.png'),
  },
  {
    id: 3,
    title: 'Irreecha Festival',
    date: 'Oct 1, 2024',
    location: 'Bishoftu',
    image: require('../../assets/icon.png'),
  },
];

const EventsScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Upcoming Events</Text>
      
      {events.map((event) => (
        <TouchableOpacity 
          key={event.id}
          style={styles.eventCard}
          onPress={() => navigation.navigate('EventDetail', { event })}
        >
          <Image source={event.image} style={styles.eventImage} />
          <View style={styles.eventContent}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <View style={styles.eventInfo}>
              <MaterialCommunityIcons name="calendar" size={16} color={colors.accent} />
              <Text style={styles.eventText}>{event.date}</Text>
            </View>
            <View style={styles.eventInfo}>
              <MaterialCommunityIcons name="map-marker" size={16} color={colors.accent} />
              <Text style={styles.eventText}>{event.location}</Text>
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
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 3,
  },
  eventImage: {
    width: '100%',
    height: 150,
  },
  eventContent: {
    padding: 15,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  eventInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  eventText: {
    fontSize: 14,
    color: colors.secondary,
    marginLeft: 5,
  },
});

export default EventsScreen;