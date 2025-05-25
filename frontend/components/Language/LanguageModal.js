import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const colors = {
  primary: '#222831',
  secondary: '#393E46',
  accent: '#00ADB5',
  background: '#EEEEEE',
};

const languages = [
  { name: 'English', code: 'US' },
  { name: 'Amharic', code: 'ET' },
  { name: 'French', code: 'FR' },
  { name: 'Spanish', code: 'ES' },
];

const LanguageModal = ({ visible, onClose, selectedLanguage, onSelect }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Select Language ({selectedLanguage})
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.languagesContainer}>
            {languages.map((language, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.languageButton,
                  selectedLanguage === language.name && styles.selectedLanguage,
                ]}
                onPress={() => onSelect(language.name)}
              >
                <MaterialCommunityIcons 
                  name="earth" 
                  size={24} 
                  color={selectedLanguage === language.name ? '#fff' : colors.accent} 
                />
                <Text style={[
                  styles.languageText,
                  selectedLanguage === language.name && styles.selectedLanguageText,
                ]}>
                  {language.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: colors.secondary,
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  languagesContainer: {
    padding: 15,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  selectedLanguage: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  languageText: {
    marginLeft: 15,
    color: colors.accent,
    fontSize: 16,
  },
  selectedLanguageText: {
    color: '#fff',
  },
});

export default LanguageModal;