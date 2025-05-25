import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { ScrollView, StyleSheet, View } from 'react-native';

import DrawerContent from './components/Drawer/DrawerContent';
import HomeScreen from './screens/Home Page/HomeScreen';
import ProfileScreen from './screens/Profile/ProfileScreen';
import LoginScreen from './screens/Account/LoginScreen';
import SignupScreen from './screens/Account/SignUpScreen';
import ProfileSettingsScreen from './screens/Profile/ProfileSettingsScreen';
import Header from './components/Header/Header';
import DestinationScreen from './screens/Destinations/DestinationsScreen';
import FacilityScreen from './screens/FacilityScreen';
import AboutScreen from './screens/About/AboutScreen';
import EventsScreen from './screens/Events/EventsScreen';
import SearchScreen from './screens/Search/SearchScreen';
import FilterHotel from './screens/Tourist Facilitie/Hotels and Lodges/FilterHotel';
import FilteredHotels from './screens/Tourist Facilitie/Hotels and Lodges/FilteredHotels';
import HotelLodges from './screens/Tourist Facilitie/Hotels and Lodges/HotelLodges';
import BookingScreen from './screens/Profile/BookingScreen';
import ReserveScreen from './screens/Profile/ReserveScreen';
import Footer from './screens/Footer/Footer';
import ChatbotLogic from './screens/Chatbot/ChatbotLogic';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const ScreenWrapper = ({ Component, navigation, useScrollView = true, ...props }) => {
  console.log(`Rendering screen: ${Component.name}`);
  const Content = (
    <View style={styles.container}>
      <Component {...props} navigation={navigation} />
      <Footer navigation={navigation} />
    </View>
  );

  return useScrollView ? (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {Content}
    </ScrollView>
  ) : (
    Content
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#222831',
  },
  container: {
    flex: 1,
  },
});

const MainStack = ({ isLoggedIn, user, setIsLoggedIn, setUser }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        header: ({ navigation, route }) => (
          <Header
            navigation={navigation}
            route={route}
            isLoggedIn={isLoggedIn}
            user={user}
          />
        ),
        cardStyle: { backgroundColor: '#222831' },
      }}
    >
      <Stack.Screen name="Home" options={{ title: 'Visit Amhara' }}>
        {(props) => (
          <ScreenWrapper
            Component={HomeScreen}
            {...props}
            isLoggedIn={isLoggedIn}
            user={user}
            useScrollView={true}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Profile" options={{ title: 'My Profile' }}>
        {(props) => (
          <ScreenWrapper
            Component={ProfileScreen}
            {...props}
            isLoggedIn={isLoggedIn}
            user={user}
            setIsLoggedIn={setIsLoggedIn}
            setUser={setUser}
            useScrollView={true}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Login" options={{ headerShown: true, title: 'Login' }}>
        {(props) => (
          <ScreenWrapper
            Component={LoginScreen}
            {...props}
            setIsLoggedIn={setIsLoggedIn}
            setUser={setUser}
            useScrollView={true}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Signup" options={{ headerShown: true, title: 'Sign Up' }}>
        {(props) => (
          <ScreenWrapper
            Component={SignupScreen}
            {...props}
            setIsLoggedIn={setIsLoggedIn}
            setUser={setUser}
            useScrollView={true}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="ProfileSettingsScreen" options={{ title: 'Profile Settings' }}>
        {(props) => (
          <ScreenWrapper
            Component={ProfileSettingsScreen}
            {...props}
            user={user}
            setUser={setUser}
            useScrollView={true}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="BookingScreen" options={{ title: 'My Booking' }}>
        {(props) => (
          <ScreenWrapper
            Component={BookingScreen}
            {...props}
            user={user}
            setUser={setUser}
            useScrollView={true}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="ReserveScreen" options={{ title: 'Reservation' }}>
        {(props) => (
          <ScreenWrapper
            Component={ReserveScreen}
            {...props}
            user={user}
            setUser={setUser}
            useScrollView={true}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Destination" options={{ title: 'Destinations' }}>
        {(props) => (
          <ScreenWrapper Component={DestinationScreen} {...props} useScrollView={false} />
        )}
      </Stack.Screen>
      <Stack.Screen name="Facility" options={{ title: 'Tourist Facilities' }}>
        {(props) => (
          <ScreenWrapper Component={FacilityScreen} {...props} useScrollView={false} />
        )}
      </Stack.Screen>
      <Stack.Screen name="FilterHotel" options={{ title: 'Hotel Filters' }}>
        {(props) => (
          <ScreenWrapper Component={FilterHotel} {...props} useScrollView={false} />
        )}
      </Stack.Screen>
      <Stack.Screen name="FilteredHotels" options={{ title: 'Filtered Hotels' }}>
        {(props) => (
          <ScreenWrapper Component={FilteredHotels} {...props} useScrollView={false} />
        )}
      </Stack.Screen>
      <Stack.Screen name="HotelLodges" options={{ title: 'Hotel Details' }}>
        {(props) => (
          <ScreenWrapper Component={HotelLodges} {...props} useScrollView={true} />
        )}
      </Stack.Screen>
      <Stack.Screen name="About" options={{ title: 'About Us' }}>
        {(props) => (
          <ScreenWrapper Component={AboutScreen} {...props} useScrollView={true} />
        )}
      </Stack.Screen>
      <Stack.Screen name="Events" options={{ title: 'Events' }}>
        {(props) => (
          <ScreenWrapper Component={EventsScreen} {...props} useScrollView={false} />
        )}
      </Stack.Screen>
      <Stack.Screen name="Search" options={{ title: 'Search Results' }}>
        {(props) => (
          <ScreenWrapper Component={SearchScreen} {...props} useScrollView={false} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  return (
    <View style={styles.container}>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="#222831" />
        <Drawer.Navigator
          drawerContent={(props) => (
            <DrawerContent
              {...props}
              isLoggedIn={isLoggedIn}
              user={user}
              setIsLoggedIn={setIsLoggedIn}
              setUser={setUser}
            />
          )}
          drawerStyle={{
            width: 300,
            backgroundColor: '#222831',
          }}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Drawer.Screen name="Main" options={{ title: 'Visit Amhara' }}>
            {(props) => (
              <MainStack
                {...props}
                isLoggedIn={isLoggedIn}
                user={user}
                setIsLoggedIn={setIsLoggedIn}
                setUser={setUser}
              />
            )}
          </Drawer.Screen>
        </Drawer.Navigator>
      </NavigationContainer>
      <ChatbotLogic />
    </View>
  );
}