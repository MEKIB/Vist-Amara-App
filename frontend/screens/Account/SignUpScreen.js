import React, { useState, useEffect } from 'react';
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
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';

const SignUpScreen = ({ navigation, setIsLoggedIn, setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    confirmPassword: '',
    passportOrId: null,
    showPassword: false,
    showConfirmPassword: false,
    acceptedTerms: false,
  });

  const [validation, setValidation] = useState({
    minLength: false,
    hasNumber: false,
    hasSpecialChar: false,
    hasUpperCase: false,
    hasLowerCase: false,
    passwordsMatch: false,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Debug navigation props
  useEffect(() => {
    console.log('SignUpScreen - Navigation props:', { navigation, setIsLoggedIn, setUser });
  }, []);

  // Debug acceptedTerms
  useEffect(() => {
    console.log('SignUpScreen - formData.acceptedTerms:', formData.acceptedTerms);
    if (formData.acceptedTerms === undefined) {
      console.warn('Warning: acceptedTerms is undefined!');
      setFormData((prev) => ({ ...prev, acceptedTerms: false }));
    }
  }, [formData.acceptedTerms]);

  const validatePassword = (password = '', confirmPassword = '') => {
    const newValidation = {
      minLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      passwordsMatch: password === confirmPassword && password !== '',
    };
    setValidation(newValidation);
    return newValidation;
  };

  useEffect(() => {
    validatePassword(password, formData.confirmPassword);
  }, [password, formData.confirmPassword]);

  const handleSignupChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
      });

      if (!result.canceled) {
        setFormData((prev) => ({
          ...prev,
          passportOrId: result.assets[0],
        }));
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  const getStrengthColor = () => {
    const strength = Object.values(validation || {}).filter(Boolean).length;
    if (strength < 2) return '#ff3e1d';
    if (strength < 4) return '#ffaa00';
    return '#00c853';
  };

  const renderPasswordRequirement = (condition, text) => (
    <View style={styles.requirementRow}>
      <MaterialIcons
        name={condition ? 'check-circle' : 'error'}
        size={16}
        color={condition ? '#00c853' : '#ff3e1d'}
      />
      <Text style={[styles.requirementText, { color: condition ? '#00c853' : '#ff3e1d' }]}>
        {text}
      </Text>
    </View>
  );

  const handleSignupAuth = async () => {
    setIsLoading(true);
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    const phoneRegex = /^\+?[0-9]{7,15}$/;

    console.log('handleSignupAuth - formData:', formData);

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!emailRegex.test(email)) newErrors.email = 'Invalid email format';
    if (!phoneRegex.test(formData.phone)) newErrors.phone = 'Invalid phone number';
    if (!formData.passportOrId) newErrors.passportOrId = 'Passport or ID is required';
    if (!formData.acceptedTerms) newErrors.acceptedTerms = 'You must accept the terms';

    const passwordValid = Object.values(validation).every(Boolean);
    if (!passwordValid) newErrors.password = 'Password does not meet requirements';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const formDataToSend = new FormData();
        formDataToSend.append('firstName', formData.firstName || '');
        formDataToSend.append('middleName', formData.middleName || '');
        formDataToSend.append('lastName', formData.lastName || '');
        formDataToSend.append('email', email || '');
        formDataToSend.append('phone', formData.phone || '');
        formDataToSend.append('password', password || '');
        formDataToSend.append('confirmPassword', formData.confirmPassword || '');
        formDataToSend.append('acceptedTerms', formData.acceptedTerms ? 'true' : 'false');

        if (formData.passportOrId) {
          formDataToSend.append('passportOrId', {
            uri: formData.passportOrId.uri,
            type: formData.passportOrId.mimeType || 'application/octet-stream',
            name: formData.passportOrId.name || 'passportOrId',
          });
        }

        const BASE_URL =
          Platform.OS === 'android' && !Platform.isEmulator
            ? 'http://192.168.232.208:2000'
            : 'http://localhost:2000';
        console.log('Signup URL:', `${BASE_URL}/register`);
        const response = await axios.post(`${BASE_URL}/register`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('Response:', response.data);
        setIsLoggedIn(true);
        setUser({
          id: response.data.user?.id || 'unknown',
          email: response.data.user?.email || email,
          name: `${formData.firstName} ${formData.lastName}`,
          role: response.data.user?.role || 'user',
          profileImage: require('../../assets/11.png'),
        });

        Alert.alert('Success', 'Registration successful! Please log in.');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } catch (error) {
        console.error('Signup error details:', {
          message: error.message,
          response: error.response ? error.response.data : null,
          status: error.response ? error.response.status : null,
        });
        let errorMessage = 'Registration failed. Please try again.';
        if (error.response) {
          errorMessage = error.response.data.message || errorMessage;
        } else if (error.request) {
          errorMessage = 'Network error. Please check your connection.';
        }
        Alert.alert('Error', errorMessage);
      }
    }
    setIsLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/logo/logo.png')} style={styles.logo} />
        </View>

        <View style={styles.authContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>

          <View style={styles.nameRow}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <MaterialCommunityIcons
                name="account"
                size={20}
                color="#00ADB5"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor="#888"
                value={formData.firstName}
                onChangeText={(text) => handleSignupChange('firstName', text)}
                onBlur={() => handleBlur('firstName')}
                editable={!isLoading}
              />
            </View>
            {touched.firstName && errors.firstName && (
              <Text style={styles.errorText}>{errors.firstName}</Text>
            )}
          </View>

          <View style={styles.nameRow}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <MaterialCommunityIcons
                name="account"
                size={20}
                color="#00ADB5"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Middle Name"
                placeholderTextColor="#888"
                value={formData.middleName}
                onChangeText={(text) => handleSignupChange('middleName', text)}
                onBlur={() => handleBlur('middleName')}
                editable={!isLoading}
              />
            </View>
          </View>

          <View style={styles.nameRow}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <MaterialCommunityIcons
                name="account"
                size={20}
                color="#00ADB5"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                placeholderTextColor="#888"
                value={formData.lastName}
                onChangeText={(text) => handleSignupChange('lastName', text)}
                onBlur={() => handleBlur('lastName')}
                editable={!isLoading}
              />
            </View>
            {touched.lastName && errors.lastName && (
              <Text style={styles.errorText}>{errors.lastName}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="email" size={20} color="#00ADB5" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              onBlur={() => handleBlur('email')}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>
          {touched.email && errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="phone" size={20} color="#00ADB5" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#888"
              value={formData.phone}
              onChangeText={(text) => handleSignupChange('phone', text)}
              onBlur={() => handleBlur('phone')}
              keyboardType="phone-pad"
              editable={!isLoading}
            />
          </View>
          {touched.phone && errors.phone && (
            <Text style={styles.errorText}>{errors.phone}</Text>
          )}

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="lock" size={20} color="#00ADB5" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              onBlur={() => handleBlur('password')}
              secureTextEntry={!formData.showPassword}
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={() => handleSignupChange('showPassword', !formData.showPassword)}
            >
              <MaterialCommunityIcons
                name={formData.showPassword ? 'eye-off' : 'eye'}
                size={20}
                color="#00ADB5"
              />
            </TouchableOpacity>
          </View>
          {touched.password && errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          <View style={styles.passwordStrengthContainer}>
            <View style={styles.strengthBarContainer}>
              <View
                style={[
                  styles.strengthBar,
                  {
                    width: `${Object.values(validation || {}).filter(Boolean).length * 20}%`,
                    backgroundColor: getStrengthColor(),
                  },
                ]}
              />
            </View>
            <View style={styles.requirementsContainer}>
              {renderPasswordRequirement(validation.minLength, '8+ characters')}
              {renderPasswordRequirement(validation.hasUpperCase, 'Uppercase letter')}
              {renderPasswordRequirement(validation.hasLowerCase, 'Lowercase letter')}
              {renderPasswordRequirement(validation.hasNumber, 'Number')}
              {renderPasswordRequirement(validation.hasSpecialChar, 'Special character')}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="lock" size={20} color="#00ADB5" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#888"
              value={formData.confirmPassword}
              onChangeText={(text) => handleSignupChange('confirmPassword', text)}
              onBlur={() => handleBlur('confirmPassword')}
              secureTextEntry={!formData.showConfirmPassword}
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={() => handleSignupChange('showConfirmPassword', !formData.showConfirmPassword)}
            >
              <MaterialCommunityIcons
                name={formData.showConfirmPassword ? 'eye-off' : 'eye'}
                size={20}
                color="#00ADB5"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.passwordMatchContainer}>
            <MaterialIcons
              name={validation.passwordsMatch ? 'check-circle' : 'error'}
              size={16}
              color={validation.passwordsMatch ? '#00c853' : '#ff3e1d'}
            />
            <Text
              style={[
                styles.passwordMatchText,
                { color: validation.passwordsMatch ? '#00c853' : '#ff3e1d' },
              ]}
            >
              {validation.passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
            </Text>
          </View>

          <View style={styles.documentPickerContainer}>
            <Text style={styles.documentLabel}>Passport / ID (Image or PDF)</Text>
            <TouchableOpacity
              style={styles.documentPickerButton}
              onPress={pickDocument}
              disabled={isLoading}
            >
              <MaterialCommunityIcons
                name="file-document"
                size={20}
                color="#00ADB5"
                style={styles.icon}
              />
              <Text style={styles.documentPickerText}>
                {formData.passportOrId ? formData.passportOrId.name : 'Choose file'}
              </Text>
            </TouchableOpacity>
            {touched.passportOrId && errors.passportOrId && (
              <Text style={styles.errorText}>{errors.passportOrId}</Text>
            )}
          </View>

          <View style={styles.termsContainer}>
            <TouchableOpacity
              onPress={() =>
                handleSignupChange('acceptedTerms', !formData.acceptedTerms)
              }
              style={styles.checkboxContainer}
            >
              <View
                style={[styles.checkbox, formData.acceptedTerms && styles.checkboxChecked]}
              >
                {formData.acceptedTerms && (
                  <MaterialIcons name="check" size={16} color="#222831" />
                )}
              </View>
              <Text style={styles.termsText}>
                I accept the{' '}
                <Text style={styles.termsLink} onPress={() => navigation.navigate('Terms')}>
                  Terms and Conditions
                </Text>
              </Text>
            </TouchableOpacity>
            {errors.acceptedTerms && (
              <Text style={styles.errorText}>{errors.acceptedTerms}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.authButton, isLoading && styles.disabledButton]}
            onPress={handleSignupAuth}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#EEEEEE" />
            ) : (
              <Text style={styles.authButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchModeButton}
            onPress={() => navigation.navigate('Login')}
            disabled={isLoading}
          >
            <Text style={styles.switchModeText}>
              Already have an account?{' '}
              <Text style={styles.switchModeActionText}>Login</Text>
            </Text>
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
  nameRow: {
    marginBottom: 16,
  },
  errorText: {
    color: '#ff3e1d',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  },
  passwordStrengthContainer: {
    marginBottom: 16,
  },
  strengthBarContainer: {
    height: 6,
    backgroundColor: '#222831',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 3,
  },
  requirementsContainer: {
    marginLeft: 8,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 12,
    marginLeft: 4,
  },
  passwordMatchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginLeft: 8,
  },
  passwordMatchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginLeft: 8,
  },
  passwordMatchText: {
    fontSize: 12,
    marginLeft: 4,
  },
  documentPickerContainer: {
    marginBottom: 16,
  },
  documentLabel: {
    color: '#EEEEEE',
    fontSize: 14,
    marginBottom: 8,
  },
  documentPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222831',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#00ADB5',
  },
  documentPickerText: {
    color: '#EEEEEE',
    fontSize: 16,
    marginLeft: 10,
  },
  termsContainer: {
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#00ADB5',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#00ADB5',
  },
  termsText: {
    color: '#EEEEEE',
    fontSize: 14,
  },
  termsLink: {
    color: '#00ADB5',
    fontWeight: 'bold',
  },
});

export default SignUpScreen;