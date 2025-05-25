import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Image, Alert, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const ProfileSettingsScreen = ({ navigation, route }) => {
  const { user, onUpdate } = route.params;
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState(user.profileImage);
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage({ uri: result.assets[0].uri });
    }
  };

  const handleSave = () => {
    if (newPassword && newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword && currentPassword !== user.password) {
      Alert.alert('Error', 'Current password is incorrect');
      return;
    }

    const updatedUser = {
      ...user,
      name,
      email,
      profileImage,
      password: newPassword || user.password
    };

    onUpdate(updatedUser);
    Alert.alert('Success', 'Profile updated successfully');
    navigation.goBack();
  };

  const handleUpdateName = () => {
    setEditingName(false);
  };

  const handleUpdateEmail = () => {
    setEditingEmail(false);
  };

  return (
    <ScrollView 
      style={styles.scrollContainer}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        {/* Profile Image Section */}
        <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
          <Image 
            source={typeof profileImage === 'string' ? { uri: profileImage } : profileImage} 
            style={styles.profileImage} 
          />
          <MaterialCommunityIcons 
            name="camera" 
            size={24} 
            color="#00ADB5" 
            style={styles.cameraIcon}
          />
        </TouchableOpacity>

        {/* Name Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          <View style={styles.inputWithEditContainer}>
            {editingName ? (
              <TextInput
                style={styles.editableInput}
                value={name}
                onChangeText={setName}
                autoFocus
                placeholder="Enter your name"
                placeholderTextColor="#393E46"
              />
            ) : (
              <Text style={styles.fieldValue}>{name}</Text>
            )}
            <TouchableOpacity 
              onPress={() => editingName ? handleUpdateName() : setEditingName(true)}
              style={styles.editButton}
            >
              <MaterialCommunityIcons 
                name={editingName ? "check" : "pencil"} 
                size={20} 
                color="#00ADB5" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Email Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Email</Text>
          <View style={styles.inputWithEditContainer}>
            {editingEmail ? (
              <TextInput
                style={styles.editableInput}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoFocus
                placeholder="Enter your email"
                placeholderTextColor="#393E46"
              />
            ) : (
              <Text style={styles.fieldValue}>{email}</Text>
            )}
            <TouchableOpacity 
              onPress={() => editingEmail ? handleUpdateEmail() : setEditingEmail(true)}
              style={styles.editButton}
            >
              <MaterialCommunityIcons 
                name={editingEmail ? "check" : "pencil"} 
                size={20} 
                color="#00ADB5" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Password Change Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Change Password</Text>
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="lock" size={20} color="#00ADB5" />
          <TextInput
            style={styles.input}
            placeholder="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            placeholderTextColor="#393E46"
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="lock-plus" size={20} color="#00ADB5" />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholderTextColor="#393E46"
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="lock-check" size={20} color="#00ADB5" />
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholderTextColor="#393E46"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#222831',
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#222831',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#00ADB5',
    backgroundColor: '#393E46',
  },
  cameraIcon: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: '#222831',
    borderRadius: 15,
    padding: 5,
    borderWidth: 1,
    borderColor: '#00ADB5',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#EEEEEE',
    marginBottom: 8,
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 16,
    color: '#EEEEEE',
    flex: 1,
    paddingVertical: 8,
  },
  inputWithEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#393E46',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#00ADB5',
  },
  editableInput: {
    flex: 1,
    fontSize: 16,
    color: '#EEEEEE',
    paddingVertical: 8,
  },
  editButton: {
    padding: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#393E46',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#00ADB5',
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#EEEEEE',
  },
  sectionHeader: {
    marginTop: 25,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#00ADB5',
    paddingBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ADB5',
  },
  saveButton: {
    backgroundColor: '#00ADB5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#EEEEEE',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProfileSettingsScreen;