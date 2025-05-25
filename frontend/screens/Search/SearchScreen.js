import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const colors = {
  primary: '#222831',
  secondary: '#393E46',
  accent: '#00ADB5',
  background: '#EEEEEE',
};

const searchData = [
  { id: 1, name: 'Hotels and Locations', type: 'Category' },
  { id: 2, name: 'Unison Hotel', type: 'Hotel' },
  { id: 3, name: 'Lalibela', type: 'Destination' },
  { id: 4, name: 'Timket Festival', type: 'Event' },
  { id: 5, name: 'Simien Mountains', type: 'Destination' },
  { id: 6, name: 'Tour Guides', type: 'Service' },
];

const SearchScreen = ({ route, navigation }) => {
  const [searchQuery, setSearchQuery] = useState(route.params?.query || '');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = searchData.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults(searchData);
    }
  }, [searchQuery]);

  const getIconName = (type) => {
    switch (type) {
      case 'Hotel': return 'hotel';
      case 'Destination': return 'map-marker';
      case 'Event': return 'calendar';
      case 'Service': return 'account-tie';
      default: return 'magnify';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
        <MaterialCommunityIcons 
          name="magnify" 
          size={24} 
          color={colors.accent} 
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => navigation.navigate(item.type, { item })}
          >
            <MaterialCommunityIcons 
              name={getIconName(item.type)} 
              size={24} 
              color={colors.accent} 
              style={styles.resultIcon}
            />
            <View>
              <Text style={styles.resultName}>{item.name}</Text>
              <Text style={styles.resultType}>{item.type}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.resultsContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 20,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  resultsContainer: {
    paddingBottom: 20,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
  },
  resultIcon: {
    marginRight: 15,
  },
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  resultType: {
    fontSize: 14,
    color: colors.secondary,
  },
});

export default SearchScreen;