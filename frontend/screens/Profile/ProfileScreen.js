import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const defaultProfileImage = require('../../assets/logo/logo.png');

const ProfileScreen = ({ navigation, isLoggedIn, user, setIsLoggedIn, setUser }) => {
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    navigation.navigate('Home');
  };

  const menuItems = isLoggedIn ? [
    { id: 1, title: 'My Bookings', icon: 'book', screen: 'BookingScreen' },
    { id: 2, title: 'Reservations', icon: 'calendar-clock', screen: 'ReserveScreen' },
    { id: 3, title: 'Wishlist', icon: 'heart', screen: 'Wishlist' },
    { 
      id: 4, 
      title: 'Profile Settings', 
      icon: 'account-cog', 
      screen: 'ProfileSettingsScreen',
      params: { user, onUpdate: setUser } 
    },
    { id: 5, title: 'Help Center', icon: 'help-circle', screen: 'Help' },
  ] : [
    { id: 1, title: 'Help Center', icon: 'help-circle', screen: 'Help' }
  ];

  const handleMenuItemPress = (item) => {
    if (isLoggedIn) {
      if (item.params) {
        navigation.navigate(item.screen, item.params);
      } else {
        navigation.navigate(item.screen);
      }
    } else {
      navigation.navigate('Auth');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Image 
          source={isLoggedIn && user?.profileImage ? user.profileImage : defaultProfileImage} 
          style={styles.profileImage} 
        />
        
        {isLoggedIn ? (
          <>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </>
        ) : (
          <Text style={styles.profileName}>Guest User</Text>
        )}
        
        {!isLoggedIn ? (
          <View style={styles.authButtonsContainer}>
            <TouchableOpacity
              style={[styles.authButton, { marginRight: 10, backgroundColor: '#393E46' }]}
              onPress={() => navigation.navigate('Login', { mode: 'login' })}
            >
              <Text style={styles.authButtonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.authButton, { backgroundColor: '#00ADB5' }]}
              onPress={() => navigation.navigate('Signup', { mode: 'signup' })}
            >
              <Text style={styles.authButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.authButton, { backgroundColor: '#00ADB5' }]}
            onPress={() => navigation.navigate('ProfileSettingsScreen', { user, onUpdate: setUser })}
          >
            <Text style={styles.authButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.menuSection}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleMenuItemPress(item)}
          >
            <MaterialCommunityIcons name={item.icon} size={24} color="#00ADB5" />
            <Text style={styles.menuItemText}>{item.title}</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#393E46" />
          </TouchableOpacity>
        ))}
      </View>

      {isLoggedIn && (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222831',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#222831',
    borderBottomWidth: 1,
    borderBottomColor: '#393E46',
  },
  profileImage: {
    width: 170,
    height: 170,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: '#00ADB5',
    marginBottom: 20,
    backgroundColor: '#393E46',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#EEEEEE',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: '#00ADB5',
    marginBottom: 20,
  },
  authButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  authButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  authButtonText: {
    color: '#EEEEEE',
    fontWeight: 'bold',
    fontSize: 16,
    paddingHorizontal: 20,
  },
  menuSection: {
    backgroundColor: '#393E46',
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#222831',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#EEEEEE',
    marginLeft: 15,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    padding: 16,
    marginHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff4444',
    marginBottom: 30,
  },
  logoutButtonText: {
    color: '#ff4444',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProfileScreen;