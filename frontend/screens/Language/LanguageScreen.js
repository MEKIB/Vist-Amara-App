import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const colors = {
  primary: '#222831',
  secondary: '#393E46',
  accent: '#00ADB5',
  background: '#EEEEEE',
};

const languages = [
  { id: 1, name: 'English', code: 'US', selected: true },
  { id: 2, name: 'Amharic', code: 'ET', selected: false },
  { id: 3, name: 'French', code: 'FR', selected: false },
  { id: 4, name: 'Spanish', code: 'ES', selected: false },
];

const LanguageScreen = ({ navigation }) => {
  const [languageList, setLanguageList] = useState(languages);

  const selectLanguage = (id) => {
    setLanguageList(languageList.map(lang => ({
      ...lang,
      selected: lang.id === id
    })));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Select Language</Text>
      <Text style={styles.subtitle}>Choose your preferred language for the app</Text>
      
      <View style={styles.languagesContainer}>
        {languageList.map((language) => (
          <TouchableOpacity
            key={language.id}
            style={[
              styles.languageItem,
              language.selected && styles.selectedLanguageItem
            ]}
            onPress={() => selectLanguage(language.id)}
          >
            <MaterialCommunityIcons 
              name="earth" 
              size={24} 
              color={language.selected ? '#fff' : colors.accent} 
            />
            <Text style={[
              styles.languageName,
              language.selected && styles.selectedLanguageText
            ]}>
              {language.name}
            </Text>
            {language.selected && (
              <MaterialCommunityIcons 
                name="check" 
                size={24} 
                color="#fff" 
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.secondary,
    marginBottom: 30,
  },
  languagesContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  selectedLanguageItem: {
    backgroundColor: colors.accent,
  },
  languageName: {
    flex: 1,
    fontSize: 16,
    color: colors.primary,
    marginLeft: 15,
  },
  selectedLanguageText: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: colors.accent,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default LanguageScreen;