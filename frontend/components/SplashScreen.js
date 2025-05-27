import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Easing, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SplashScreen = ({ navigation }) => {
  const spinValue = new Animated.Value(0);
  const scaleValue = new Animated.Value(1);
  const fadeValue = new Animated.Value(0);

  useEffect(() => {
    // Spin animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade in animation
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    // Navigate after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace('Main');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={['#121212', '#1a1a2e', '#16213e']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Animated.View
        style={[
          styles.backgroundCircle,
          {
            transform: [{ scale: scaleValue }],
            opacity: fadeValue,
          },
        ]}
      >
        <LinearGradient
          colors={['#FF5733', '#33FF57', '#3357FF']}
          style={styles.circleGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <Animated.Image
        source={require('./assets/logo/logo.png')}
        style={[
          styles.logo,
          {
            transform: [{ rotate: spin }, { scale: scaleValue }],
            opacity: fadeValue,
          },
        ]}
        resizeMode="contain"
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
  backgroundCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  circleGradient: {
    flex: 1,
    borderRadius: 150,
    opacity: 0.3,
  },
});

export default SplashScreen;