// components/Footer.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Footer = ({ navigation }) => {
  return (
    <View style={styles.footerContainer}>
    
      {/* Copyright section */}
      <View style={styles.copyrightContainer}>
        <Text style={styles.copyrightText}>
          © {new Date().getFullYear()} Visit Amhara. All rights Reserved.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    backgroundColor: '#222831',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#00ADB5',
  },
  footerContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  footerColumn: {
    width: '30%',
    minWidth: 150,
    marginBottom: 20,
  },
  footerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  footerText: {
    color: '#EEEEEE',
    fontSize: 14,
    marginBottom: 10,
    opacity: 0.8,
  },
  footerLink: {
    color: '#EEEEEE',
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  copyrightContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 20,
  },
  copyrightText: {
    color: '#EEEEEE',
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
  },
});

export default Footer;