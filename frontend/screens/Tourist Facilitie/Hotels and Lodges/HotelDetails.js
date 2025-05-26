import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  Platform,
  FlatList,
  TextInput,
  Dimensions,
  SafeAreaView,
  Alert,
  StatusBar,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import axios from 'axios';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_URL =
  Platform.OS === 'android' && !Platform.isEmulator
    ? 'http://192.168.232.208:2000'
    : 'http://localhost:2000';

// Create Axios instance with interceptors
const api = axios.create({
  baseURL: BASE_URL,
});

// Request interceptor to add token to headers
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('jwtToken');
      console.log('Axios Request - Token:', token);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('No token found in SecureStore');
      }
      return config;
    } catch (error) {
      console.error('Axios Request Interceptor - SecureStore Error:', error);
      return config;
    }
  },
  (error) => {
    console.error('Axios Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401/403 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('Axios Response Error:', error.response?.status, error.response?.data);
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('Unauthorized or Forbidden - Clearing storage');
      try {
        await SecureStore.deleteItemAsync('jwtToken');
        await SecureStore.deleteItemAsync('user');
        console.log('SecureStore cleared successfully');
      } catch (storageError) {
        console.error('Error clearing SecureStore:', storageError);
      }
      error.needsLoginRedirect = true;
    }
    return Promise.reject(error);
  }
);

const HotelDetails = ({ hotel, hotelAdminId, navigation }) => {
  const [userToken, setUserToken] = useState(null);
  const [userName, setUserName] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '', user: '' });
  const [mapReady, setMapReady] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load user token and name from SecureStore on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = await SecureStore.getItemAsync('jwtToken');
        const userData = await SecureStore.getItemAsync('user');
        console.log('Retrieved from SecureStore - Token:', token);
        console.log('Retrieved from SecureStore - User Data:', userData);
        const user = userData ? JSON.parse(userData) : null;
        setUserToken(token);
        setUserName(user?.firstName || '');
        setNewReview((prev) => ({ ...prev, user: user?.firstName || '' }));
      } catch (error) {
        console.error('Error loading user data from SecureStore:', error);
        Alert.alert('Error', 'Failed to load user data. Please try logging in again.');
      }
    };
    loadUserData();
  }, []);

  // Fetch reviews and user's existing review
  useEffect(() => {
    console.log('HotelDetails props:', { hotel, hotelAdminId });
    const fetchData = async () => {
      try {
        // Fetch all reviews
        const reviewsResponse = await api.get(`/api/reviews/${hotelAdminId}`, {
          params: { hotelAdminId },
        });
        console.log('Fetched Reviews:', reviewsResponse.data.data);
        setReviews(reviewsResponse.data.data || []);

        // Fetch user's review if logged in
        if (userToken) {
          try {
            const userReviewResponse = await api.get(`/api/reviews/user/${hotelAdminId}`);
            console.log('Fetched User Review:', userReviewResponse.data.data);
            setUserReview(userReviewResponse.data.data);
            if (userReviewResponse.data.data) {
              setNewReview({
                rating: userReviewResponse.data.data.rating,
                comment: userReviewResponse.data.data.comment,
                user: userReviewResponse.data.data.user,
              });
            }
          } catch (error) {
            if (error.response?.status !== 404) {
              console.error('User review fetch error:', error.response?.data || error);
              if (error.needsLoginRedirect && navigation) {
                Alert.alert('Session Invalid', 'Please log in again.', [
                  { text: 'OK', onPress: () => navigation.navigate('Login') },
                ]);
              }
            }
          }
        }
      } catch (error) {
        console.error('Review fetch error:', error.response?.data || error);
        if (error.needsLoginRedirect && navigation) {
          Alert.alert('Session Invalid', 'Please log in again.', [
            { text: 'OK', onPress: () => navigation.navigate('Login') },
          ]);
        } else {
          Alert.alert('Error', 'Failed to fetch reviews. Please try again.');
        }
      }
    };
    fetchData();
  }, [hotel?.id, hotelAdminId, userToken, navigation]);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 2);

  const handleAddOrUpdateReview = async () => {
    console.log('handleAddOrUpdateReview - Checking token...');
    if (!navigation) {
      console.warn('Navigation not available');
      Alert.alert('Error', 'Navigation is not available. Please try again.');
      return;
    }

    // Re-fetch token from SecureStore to ensure it's still valid
    let token;
    try {
      token = await SecureStore.getItemAsync('jwtToken');
      console.log('handleAddOrUpdateReview - Retrieved userToken:', token);
    } catch (error) {
      console.error('Error retrieving token from SecureStore:', error);
      Alert.alert('Error', 'Failed to verify session. Please log in again.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }

    if (!token) {
      console.log('No userToken found, redirecting to Login');
      Alert.alert('Please Log In', 'You must be logged in to submit a review.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }

    if (newReview.rating === 0 || newReview.comment.trim() === '') {
      console.log('Invalid review input - Rating:', newReview.rating, 'Comment:', newReview.comment);
      Alert.alert('Invalid Input', 'Please provide a rating and comment.');
      return;
    }

    setLoading(true);
    try {
      if (userReview) {
        // Update existing review
        console.log('Updating review:', { id: userReview._id, ...newReview });
        const response = await api.put(`/api/reviews/${userReview._id}`, {
          user: newReview.user || userName || 'Anonymous',
          rating: newReview.rating,
          comment: newReview.comment,
        });
        console.log('Updated Review Response:', response.data.data);
        setReviews(reviews.map((r) => (r._id === userReview._id ? response.data.data : r)));
        setUserReview(response.data.data);
        Alert.alert('Success', 'Review updated successfully.');
      } else {
        // Submit new review
        const review = {
          hotelId: hotel.id,
          hotelAdminId,
          user: newReview.user || userName || 'Anonymous',
          rating: newReview.rating,
          comment: newReview.comment,
          date: new Date().toISOString().split('T')[0],
        };
        console.log('Submitting new review:', review);
        const response = await api.post('/api/reviews', review);
        console.log('New Review Response:', response.data.data);
        setReviews([...reviews, response.data.data]);
        setUserReview(response.data.data);
        Alert.alert('Success', 'Review submitted successfully.');
      }
    } catch (error) {
      console.error('Review submission error:', error.response?.data || error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('Unauthorized or Forbidden, redirecting to Login');
        try {
          await SecureStore.deleteItemAsync('jwtToken');
          await SecureStore.deleteItemAsync('user');
          console.log('SecureStore cleared successfully');
        } catch (storageError) {
          console.error('Error clearing SecureStore:', storageError);
        }
        Alert.alert('Session Invalid', 'Please log in again.', [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]);
        return;
      }
      if (error.response?.status === 400 && error.response.data.reviewId) {
        console.log('Existing review found, updating instead:', error.response.data.reviewId);
        try {
          const response = await api.put(`/api/reviews/${error.response.data.reviewId}`, {
            user: newReview.user || userName || 'Anonymous',
            rating: newReview.rating,
            comment: newReview.comment,
          });
          console.log('Updated Review Response:', response.data.data);
          setReviews(reviews.map((r) => (r._id === error.response.data.reviewId ? response.data.data : r)));
          setUserReview(response.data.data);
          Alert.alert('Success', 'Review updated successfully.');
        } catch (updateError) {
          console.error('Update review error:', updateError.response?.data || updateError);
          Alert.alert('Error', updateError.response?.data?.message || 'Failed to update review.');
        }
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Failed to submit/update review.');
      }
    } finally {
      setLoading(false);
      setNewReview({ rating: 0, comment: '', user: userName || '' });
      setShowReviewModal(false);
    }
  };

  const renderRatingStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <FontAwesome
          key={`star-${rating}-${i}`}
          name={
            i < Math.floor(rating)
              ? 'star'
              : i === Math.floor(rating) && rating % 1 >= 0.5
              ? 'star-half-full'
              : 'star-o'
          }
          size={16}
          color="#FFD700"
        />
      ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.statusBarBackground} />
      <ImageBackground
        source={{ uri: hotel?.image }}
        style={styles.headerImage}
        resizeMode="cover"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.navigate('Home') || console.warn('Navigation not available')}
        >
          <MaterialIcons name="arrow-back" size={24} color="#EEEEEE" />
        </TouchableOpacity>
      </ImageBackground>

      <ScrollView style={styles.content}>
        <View style={styles.hotelHeader}>
          <Text style={styles.hotelName}>{hotel?.name || 'Hotel'}</Text>
          <View style={styles.ratingContainer}>
            <View style={styles.starContainer}>{renderRatingStars(averageRating)}</View>
            <Text style={styles.ratingText}>{averageRating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({reviews.length} reviews)</Text>
          </View>
        </View>

        <View style={styles.locationContainer}>
          <MaterialIcons name="location-on" size={20} color="#00ADB5" />
          <Text style={styles.locationText}>{hotel?.location || 'Unknown Location'}</Text>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>About This Hotel</Text>
          <Text style={styles.descriptionText}>{hotel?.description || 'No description available'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gallery</Text>
          <FlatList
            horizontal
            data={hotel?.image ? [hotel.image] : []}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setSelectedImage(item)}>
                <Image source={{ uri: item }} style={styles.galleryImage} />
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => `gallery-image-${index}`}
            contentContainerStyle={styles.gallery}
          />
        </View>

        {hotel?.latitude !== 0 && hotel?.longitude !== 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.mapContainer}>
              {!mapReady && (
                <View style={styles.mapPlaceholder}>
                  <Text>Loading map...</Text>
                </View>
              )}
              <MapView
                style={[styles.map, !mapReady && styles.hiddenMap]}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                  latitude: hotel.latitude,
                  longitude: hotel.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01 * (SCREEN_WIDTH / SCREEN_HEIGHT),
                }}
                onMapReady={() => setMapReady(true)}
              >
                <Marker coordinate={{ latitude: hotel.latitude, longitude: hotel.longitude }}>
                  <View style={styles.marker}>
                    <MaterialIcons name="hotel" size={30} color="#00ADB5" />
                  </View>
                </Marker>
              </MapView>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Guest Reviews</Text>
            <TouchableOpacity onPress={() => setShowAllReviews(!showAllReviews)}>
              <Text style={styles.seeAllText}>
                {showAllReviews ? 'Show Less' : `See All (${reviews.length})`}
              </Text>
            </TouchableOpacity>
          </View>

          {displayedReviews.map((review, index) => (
            <View key={review._id || `review-${index}`} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewUser}>{review.user}</Text>
                <View style={styles.reviewRating}>{renderRatingStars(review.rating)}</View>
              </View>
              <Text style={styles.reviewDate}>{review.date}</Text>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}

          <TouchableOpacity
            style={styles.addReviewButton}
            onPress={() => setShowReviewModal(true)}
          >
            <Text style={styles.addReviewButtonText}>
              {userReview ? 'Update Your Review' : 'Add Your Review'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={selectedImage !== null} transparent>
        <View style={styles.imageModal}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedImage(null)}>
            <MaterialIcons name="close" size={30} color="#EEEEEE" />
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />
        </View>
      </Modal>

      <Modal visible={showReviewModal} animationType="slide">
        <SafeAreaView style={styles.reviewModal}>
          <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
          <View style={styles.statusBarBackground} />
          <View style={styles.reviewModalHeader}>
            <Text style={styles.reviewModalTitle}>
              {userReview ? 'Update Your Review' : 'Share Your Experience'}
            </Text>
            <TouchableOpacity onPress={() => setShowReviewModal(false)}>
              <MaterialIcons name="close" size={24} color="#00ADB5" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.reviewModalContent}>
            <View style={styles.ratingInput}>
              <Text style={styles.ratingLabel}>Your Rating</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={`rating-star-${star}`}
                    onPress={() => setNewReview({ ...newReview, rating: star })}
                  >
                    <FontAwesome
                      name={star <= newReview.rating ? 'star' : 'star-o'}
                      size={32}
                      color="#FFD700"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Your Name (optional)"
              value={newReview.user}
              onChangeText={(text) => setNewReview({ ...newReview, user: text })}
              placeholderTextColor="#AAAAAA"
            />

            <TextInput
              style={[styles.input, styles.commentInput]}
              placeholder="Share details of your experience..."
              multiline
              value={newReview.comment}
              onChangeText={(text) => setNewReview({ ...newReview, comment: text })}
              placeholderTextColor="#AAAAAA"
            />

            <TouchableOpacity
              style={[
                styles.submitButton,
                (newReview.rating === 0 || !newReview.comment.trim() || loading) &&
                  styles.disabledButton,
              ]}
              onPress={handleAddOrUpdateReview}
              disabled={newReview.rating === 0 || !newReview.comment.trim() || loading}
            >
              <Text style={styles.submitButtonText}>
                {loading
                  ? 'Submitting...'
                  : userReview
                  ? 'Update Review'
                  : 'Submit Review'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222831',
  },
  statusBarBackground: {
    height: StatusBar.currentHeight || 24,
    backgroundColor: '#222831',
  },
  headerImage: {
    width: '100%',
    height: 250,
  },
  backButton: {
    marginTop: (StatusBar.currentHeight || 24) + 20,
    marginLeft: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 10,
  },
  hotelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  hotelName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ADB5',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    flexDirection: 'row',
    marginRight: 5,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EEEEEE',
    marginRight: 5,
  },
  reviewCount: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationText: {
    fontSize: 16,
    color: '#EEEEEE',
    marginLeft: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ADB5',
    marginBottom: 15,
  },
  descriptionContainer: {
    marginBottom: 25,
  },
  descriptionText: {
    fontSize: 15,
    color: '#EEEEEE',
    lineHeight: 22,
  },
  gallery: {
    gap: 10,
  },
  galleryImage: {
    width: 150,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  mapContainer: {
    height: 250,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#393E46',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  hiddenMap: {
    opacity: 0,
  },
  mapPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#393E46',
  },
  marker: {
    backgroundColor: '#222831',
    padding: 5,
    borderRadius: 20,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    color: '#00ADB5',
    fontSize: 14,
  },
  reviewCard: {
    backgroundColor: '#393E46',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  reviewUser: {
    fontWeight: 'bold',
    color: '#00ADB5',
    fontSize: 16,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewDate: {
    fontSize: 12,
    color: '#AAAAAA',
    marginBottom: 10,
  },
  reviewComment: {
    color: '#EEEEEE',
    lineHeight: 20,
  },
  addReviewButton: {
    backgroundColor: '#00ADB5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  addReviewButtonText: {
    color: '#EEEEEE',
    fontWeight: 'bold',
    fontSize: 16,
  },
  imageModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  fullImage: {
    width: SCREEN_WIDTH - 40,
    height: '70%',
  },
  reviewModal: {
    flex: 1,
    backgroundColor: '#222831',
  },
  reviewModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#393E46',
  },
  reviewModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ADB5',
  },
  reviewModalContent: {
    padding: 20,
  },
  ratingInput: {
    marginBottom: 25,
  },
  ratingLabel: {
    color: '#EEEEEE',
    fontSize: 16,
    marginBottom: 15,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
  },
  input: {
    backgroundColor: '#393E46',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    color: '#EEEEEE',
    fontSize: 16,
  },
  commentInput: {
    height: 150,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#00ADB5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#EEEEEE',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#AAAAAA',
  },
});

export default HotelDetails;