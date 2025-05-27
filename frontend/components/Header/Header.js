import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const colors = {
  primary: '#222831',
  secondary: '#393E46',
  accent: '#00ADB5',
  background: '#EEEEEE',
};

const Header = ({ navigation, isLoggedIn, user }) => {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.leftIcons}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <MaterialIcons name="menu" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.logoContainer}
          onPress={() => navigation.navigate('Home')}
        >
          <Image 
            source={require('../../assets/logo/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.headerText}>Visit Amhara</Text>
        </TouchableOpacity>

        <View style={styles.rightIcon}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            {isLoggedIn && user?.passportOrId ? (
              <Image 
                source={{ 
                  uri: `http://192.168.170.185:2000/${user.passportOrId}`
                }} 
                style={styles.profileImage} 
                onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
              />
            ) : (
              <MaterialCommunityIcons name="account" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    paddingTop: 35,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    height: 60,
  },
  leftIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 70,
    height: 50,
    marginRight: 10,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  rightIcon: {
    flex: 1,
    alignItems: 'flex-end',
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fff',
  },
});

export default Header;