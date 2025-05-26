import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet,Platform, ActivityIndicator } from 'react-native';

const HotelRules = ({ hotelId, hotelAdminId }) => {
  const [rules, setRules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const BASE_URL =
  Platform.OS === 'android' && !Platform.isEmulator
    ? 'http://192.168.213.208:2000'
    : 'http://localhost:2000';

  useEffect(() => {
    const fetchHotelRules = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/api/hotel-rules/by-hotel?hotelAdminId=${hotelAdminId}`);
        const result = await response.json();
        
        if (response.ok) {
          setRules(result.data);
        } else {
          setError(result.message || 'Failed to fetch hotel rules');
        }
      } catch (err) {
        setError('Error fetching hotel rules');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (hotelAdminId) {
      fetchHotelRules();
    } else {
      setError('Hotel Admin ID is required');
      setLoading(false);
    }
  }, [hotelAdminId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#EEEEEE" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!rules) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No rules found for this hotel</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>House Rules</Text>
      <View style={styles.ruleSection}>
        <Text style={styles.label}>Check-in:</Text>
        <Text style={styles.text}>{rules.checkIn || 'Not specified'}</Text>
      </View>
      <View style={styles.ruleSection}>
        <Text style={styles.label}>Check-out:</Text>
        <Text style={styles.text}>{rules.checkOut || 'Not specified'}</Text>
      </View>
      <View style={styles.ruleSection}>
        <Text style={styles.label}>Cancellation Policy:</Text>
        <Text style={styles.text}>{rules.cancellationPolicy || 'Not specified'}</Text>
      </View>
      <View style={styles.ruleSection}>
        <Text style={styles.label}>Child Policies:</Text>
        {rules.childPolicies?.length > 0 ? (
          rules.childPolicies.map((policy, index) => (
            <Text key={index} style={styles.text}>- {policy}</Text>
          ))
        ) : (
          <Text style={styles.text}>Not specified</Text>
        )}
      </View>
      <View style={styles.ruleSection}>
        <Text style={styles.label}>Cot and Extra Bed Policies:</Text>
        {rules.cotAndExtraBedPolicies?.length > 0 ? (
          rules.cotAndExtraBedPolicies.map((policy, index) => (
            <Text key={index} style={styles.text}>- {policy}</Text>
          ))
        ) : (
          <Text style={styles.text}>Not specified</Text>
        )}
      </View>
      <View style={styles.ruleSection}>
        <Text style={styles.label}>Age Restriction:</Text>
        <Text style={styles.text}>
          {rules.noAgeRestriction ? 'No age restriction' : 'Age restrictions apply'}
        </Text>
      </View>
      <View style={styles.ruleSection}>
        <Text style={styles.label}>Pets:</Text>
        <Text style={styles.text}>{rules.petsAllowed ? 'Pets allowed' : 'Pets not allowed'}</Text>
      </View>
      <View style={styles.ruleSection}>
        <Text style={styles.label}>Accepted Payment Methods:</Text>
        {rules.acceptedCards?.length > 0 ? (
          rules.acceptedCards.map((card, index) => (
            <Text key={index} style={styles.text}>- {card}</Text>
          ))
        ) : (
          <Text style={styles.text}>Not specified</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#222831',
  },
  header: {
    color: '#EEEEEE',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  ruleSection: {
    marginBottom: 12,
  },
  label: {
    color: '#76ABAE',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  text: {
    color: '#EEEEEE',
    fontSize: 16,
  },
  errorText: {
    color: '#EEEEEE',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default HotelRules;