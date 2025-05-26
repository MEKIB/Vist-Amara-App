import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const LoginScreen = ({ navigation, setIsLoggedIn, setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const BASE_URL = Platform.OS === 'android' && !Platform.isEmulator ? 'http://192.168.213.185:2000' : 'http://localhost:2000';
  
  console.log('BASE_URL:', BASE_URL);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLoginAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Log the request being sent
      console.log('Sending login request to:', `${BASE_URL}/login`);
      console.log('Request body:', { email, password });

      const response = await axios.post(`${BASE_URL}/login`, {
        email,
        password,
      });

      console.log('Login response:', response.data);

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error('Invalid response: token or user data missing');
      }

      // Store token and user data in SecureStore
      try {
        await SecureStore.setItemAsync('jwtToken', token);
        await SecureStore.setItemAsync('user', JSON.stringify(user));
        console.log('Data stored in SecureStore successfully');
      } catch (storeError) {
        console.error('SecureStore save error:', storeError);
        Alert.alert('Error', 'Failed to store data securely. Proceeding with login.');
      }

      // Retrieve stored token and user data
      let storedToken = null;
      let storedUser = null;
      try {
        storedToken = await SecureStore.getItemAsync('jwtToken');
        storedUser = await SecureStore.getItemAsync('user');
        console.log('Retrieved from SecureStore - Token:', storedToken);
        console.log('Retrieved from SecureStore - User:', storedUser ? JSON.parse(storedUser) : null);
      } catch (retrieveError) {
        console.error('SecureStore retrieve error:', retrieveError);
        Alert.alert('Error', 'Failed to retrieve stored data. Using response data instead.');
      }

      // Use response data as fallback if SecureStore retrieval fails
      const displayToken = storedToken || token;
      const displayUser = storedUser ? JSON.parse(storedUser) : user;

      // Log to console
      console.log('Displayed Token:', displayToken);
      console.log('Displayed User:', displayUser);

      // Show in an alert
      Alert.alert(
        'Login Successful',
        `Token: ${displayToken}\nUser: ${JSON.stringify(displayUser, null, 2)}`,
        [{ text: 'OK', onPress: () => console.log('Alert closed') }]
      );

      setIsLoggedIn(true);
      setUser(user);

      navigation.reset({
        index: 0,
        routes: [{ name: 'Profile' }],
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred. Please try again.';
      console.error('Auth error:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/logo/logo.png')} style={styles.logo} />
        </View>

        <View style={styles.authContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to access your account</Text>

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="email" size={20} color="#00ADB5" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="lock" size={20} color="#00ADB5" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.authButton, isLoading && styles.disabledButton]}
            onPress={handleLoginAuth}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#EEEEEE" />
            ) : (
              <Text style={styles.authButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchModeButton}
            onPress={() => navigation.navigate('Signup')}
            disabled={isLoading}
          >
            <Text style={styles.switchModeText}>
              Don't have an account?{' '}
              <Text style={styles.switchModeActionText}>Sign Up</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={() => navigation.navigate('ForgotPassword')}
            disabled={isLoading}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222831',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  authContainer: {
    backgroundColor: '#393E46',
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EEEEEE',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222831',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#00ADB5',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#EEEEEE',
  },
  authButton: {
    backgroundColor: '#00ADB5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#00ADB5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  authButtonText: {
    color: '#EEEEEE',
    fontWeight: 'bold',
    fontSize: 16,
  },
  switchModeButton: {
    alignItems: 'center',
    marginBottom: 8,
  },
  switchModeText: {
    color: '#888',
    fontSize: 14,
  },
  switchModeActionText: {
    color: '#00ADB5',
    fontWeight: 'bold',
  },
  forgotPasswordButton: {
    alignItems: 'center',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#00ADB5',
    fontSize: 14,
  },
});

export default LoginScreen;