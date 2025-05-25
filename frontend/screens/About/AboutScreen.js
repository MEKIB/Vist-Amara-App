import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';

const AboutScreen = ({ route }) => {
  const sections = [
    {
      title: 'Amhara Region',
      content: 'The Amhara Region is a regional state in northern Ethiopia, home to numerous historical sites and natural wonders.'
    },
    {
      title: 'The Bureau',
      content: 'The Tourism Bureau is responsible for promoting and developing tourism in the Amhara Region.'
    },
    {
      title: 'Our Management',
      content: 'Our team consists of dedicated professionals working to enhance the tourism experience in the region.'
    },
    {
      title: 'Mandate and Responsibility',
      content: 'Our mandate includes preserving cultural heritage, promoting sustainable tourism, and supporting local communities.'
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>About Visit Amhara</Text>
      {sections.map((section, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionContent}>{section.content}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#EEEEEE',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222831',
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ADB5',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 16,
    color: '#393E46',
    lineHeight: 24,
  },
});

export default AboutScreen;