import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Carousel from 'react-native-reanimated-carousel';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';

// Import local images with unique names
import bahirdarImage1 from '../../assets/homepage/bahirdar.jpg';
import gonderImage1 from '../../assets/homepage/gonder.jpg';
import fallbackImage from '../../assets/homepage/gonder1.jpg';
import gonderImage2 from '../../assets/homepage/gonder2.jpg';
import lalibelaImage1 from '../../assets/homepage/lalibela.jpg';
import lalibelaImage2 from '../../assets/homepage/lalibela1.jpg';
import lalibelaImage3 from '../../assets/homepage/lalibela2.jpg';
import tanaImage1 from '../../assets/homepage/tana.jpg';
import tanaImage2 from '../../assets/homepage/tana1.jpg';
import tisabayImage1 from '../../assets/homepage/tisabay.jpg';
import tisabayImage2 from '../../assets/homepage/tisabay1.jpg';
import tisabayImage3 from '../../assets/homepage/tisabay2.jpg';

const { width: viewportWidth } = Dimensions.get('window');

const colors = {
  primary: '#222831',
  secondary: '#393E46',
  accent: '#00ADB5',
  background: '#EEEEEE',
  white: '#FFFFFF',
  whereInput: '#393E46',
  whenInput: '#4E535B',
  searchButton: '#00ADB5',
};

const backgroundImage =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';

const carouselImages = [
  {
    id: 1,
    src: lalibelaImage1,
    title: 'Lalibela',
    description: 'Explore the ancient rock-hewn churches of Lalibela, a UNESCO World Heritage Site.',
  },
  {
    id: 2,
    src: tanaImage1,
    title: 'Lake Tana',
    description: 'Discover the serene beauty of Lake Tana and its historic monasteries.',
  },
  {
    id: 3,
    src: gonderImage1,
    title: 'Gondar',
    description: "Visit the castles of Gondar, known as the 'Camelot of Africa'.",
  },
  {
    id: 4,
    src: gonderImage2,
    title: 'Gondar Castles',
    description: 'Another view of the historic castles in the city of Gondar.',
  },
  {
    id: 5,
    src: lalibelaImage2,
    title: 'Lalibela Churches',
    description: 'More stunning views of Lalibela’s rock-hewn churches.',
  },
  {
    id: 6,
    src: lalibelaImage3,
    title: 'Lalibela Heritage',
    description: 'Explore the spiritual and architectural heritage of Lalibela.',
  },
  {
    id: 7,
    src: tanaImage2,
    title: 'Lake Tana Monasteries',
    description: 'Visit the historic monasteries on the islands of Lake Tana.',
  },
  {
    id: 8,
    src: tisabayImage1,
    title: 'Blue Nile Falls',
    description: 'Witness the majestic beauty of the Blue Nile Falls at Tis Abay.',
  },
  {
    id: 9,
    src: tisabayImage2,
    title: 'Tis Abay Falls',
    description: 'Another view of the stunning Blue Nile Falls.',
  },
  {
    id: 10,
    src: tisabayImage3,
    title: 'Tis Abay Landscape',
    description: 'Explore the natural beauty surrounding Tis Abay.',
  },
  {
    id: 11,
    src: bahirdarImage1,
    title: 'Bahir Dar',
    description: 'Experience the vibrant culture and lakeside charm of Bahir Dar.',
  },
];

const testimonials = [
  {
    id: 1,
    text: 'An unforgettable experience! The churches are truly a wonder.',
    author: 'Visitor 1',
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791',
  },
  {
    id: 2,
    text: 'The hospitality and beauty left me speechless. Must visit!',
    author: 'Visitor 2',
    image: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f',
  },
];

const hiddenGems = [
  {
    id: 1,
    name: 'Simien Mountains',
    description: 'UNESCO World Heritage site with dramatic landscapes',
    image: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f',
  },
  {
    id: 2,
    name: 'Fasil Ghebbi',
    description: 'Fortress-city showcasing Ethiopian architecture',
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791',
  },
];

const religiousSites = [
  {
    id: 1,
    name: 'Lalibela Churches',
    description: '11 medieval monolithic cave churches',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    type: 'religious',
  },
  {
    id: 2,
    name: 'Debre Berhan Selassie',
    description: 'Famous for its ceiling of angel faces',
    image: 'https://images.unsplash.com/photo-1580130732478-4e339fb3376f',
    type: 'religious',
  },
  {
    id: 3,
    name: 'Ura Kidane Mehret',
    description: 'Beautiful circular church on Lake Tana',
    image: 'https://images.unsplash.com/photo-1579613832125-5d34a13ffe2a',
    type: 'religious',
  },
  {
    id: 4,
    name: 'Axum Stelae',
    description: 'Ancient obelisks in the historic city of Axum',
    image: 'https://images.unsplash.com/photo-1580130732478-4e339fb3376f',
    type: 'religious',
  },
  {
    id: 5,
    name: 'Debre Damo',
    description: 'Ancient monastery accessible only by rope climb',
    image: 'https://images.unsplash.com/photo-1579613832125-5d34a13ffe2a',
    type: 'religious',
  },
  {
    id: 6,
    name: "St. George's Church",
    description: 'Cross-shaped church carved from rock',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    type: 'religious'
  },
  {
    id: 7,
    name: "Na'akuto La'ab",
    description: 'Cave church with dripping holy water',
    image: 'https://images.unsplash.com/photo-1580130732478-4e339fb3376f',
    type: 'religious'
  },
  {
    id: 8,
    name: 'Yemrehanna Kristos',
    description: 'Beautiful church built in Aksumite style',
    image: 'https://images.unsplash.com/photo-1579613832125-5d34a13ffe2a',
    type: 'religious'
  },
  {
    id: 9,
    name: 'Bete Maryam',
    description: "One of Lalibela's most revered churches",
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    type: 'religious'
  },
  {
    id: 10,
    name: 'Bete Giyorgis',
    description: "Most famous of Lalibela's rock-hewn churches",
    image: 'https://images.unsplash.com/photo-1580130732478-4e339fb3376f',
    type: 'religious'
  },
];

const hotels = [
  {
    id: 1,
    name: 'Gheralta Lodge',
    description: 'Eco-lodge with stunning views of the Gheralta mountains',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    type: 'hotel',
  },
  {
    id: 2,
    name: 'Lalibela Lodge',
    description: 'Comfortable accommodation near the rock-hewn churches',
    image: 'https://images.unsplash.com/photo-1580130732478-4e339fb3376f',
    type: 'hotel',
  },
  {
    id: 3,
    name: 'Kuriftu Resort & Spa',
    description: 'Luxury resort on the shores of Lake Tana',
    image: 'https://images.unsplash.com/photo-1579613832125-5d34a13ffe2a',
    type: 'hotel',
  },
  {
    id: 4,
    name: 'Simien Lodge',
    description: "Africa's highest hotel with breathtaking views",
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    type: 'hotel'
  },
  {
    id: 5,
    name: 'Tana Hotel',
    description: 'Comfortable stay in Bahir Dar with lake views',
    image: 'https://images.unsplash.com/photo-1580130732478-4e339fb3376f',
    type: 'hotel'
  },
  {
    id: 6,
    name: 'Goha Hotel',
    description: 'Panoramic views of Gondar from this hilltop hotel',
    image: 'https://images.unsplash.com/photo-1579613832125-5d34a13ffe2a',
    type: 'hotel'
  },
  {
    id: 7,
    name: 'Blue Nile Hotel',
    description: 'Modern amenities in the heart of Bahir Dar',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    type: 'hotel'
  },
  {
    id: 8,
    name: 'Roha Hotel',
    description: 'Mid-range option in Lalibela with great service',
    image: 'https://images.unsplash.com/photo-1580130732478-4e339fb3376f',
    type: 'hotel'
  },
  {
    id: 9,
    name: 'Fasil Lodge',
    description: "Charming accommodation near Gondar's castles",
    image: 'https://images.unsplash.com/photo-1579613832125-5d34a13ffe2a',
    type: 'hotel'
  },
  {
    id: 10,
    name: 'Sabean International Hotel',
    description: 'Quality hotel in Axum with historic ambiance',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    type: 'hotel'
  },
];

const lakes = [
  {
    id: 1,
    name: 'Lake Tana',
    description: 'Source of the Blue Nile with historic island monasteries',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    type: 'lake',
  },
  {
    id: 2,
    name: 'Lake Hayk',
    description: 'Scenic lake near Dessie with birdwatching opportunities',
    image: 'https://images.unsplash.com/photo-1580130732478-4e339fb3376f',
    type: 'lake',
  },
  {
    id: 3,
    name: 'Lake Ashenge',
    description: 'High-altitude lake with stunning mountain backdrop',
    image: 'https://images.unsplash.com/photo-1579613832125-5d34a13ffe2a',
    type: 'lake',
  },
  {
    id: 4,
    name: 'Lake Ardibo',
    description: 'Small crater lake near Woldia',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    type: 'lake'
  },
  {
    id: 5,
    name: 'Lake Zengena',
    description: 'Crater lake near Bahir Dar with unique ecosystem',
    image: 'https://images.unsplash.com/photo-1580130732478-4e339fb3376f',
    type: 'lake'
  },
  {
    id

: 6,
    name: 'Lake Chomen',
    description: 'Wetland area important for bird conservation',
    image: 'https://images.unsplash.com/photo-1579613832125-5d34a13ffe2a',
    type: 'lake'
  },
  {
    id: 7,
    name: 'Lake Tana Biosphere Reserve',
    description: 'Protected area encompassing Lake Tana and its wetlands',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    type: 'lake'
  },
  {
    id: 8,
    name: 'Lake Wonchi',
    description: 'Crater lake with hot springs and waterfalls',
    image: 'https://images.unsplash.com/photo-1580130732478-4e339fb3376f',
    type: 'lake'
  },
  {
    id: 9,
    name: 'Lake Alemaya',
    description: 'Freshwater lake near Harar (eastern edge of Amhara)',
    image: 'https://images.unsplash.com/photo-1579613832125-5d34a13ffe2a',
    type: 'lake'
  },
  {
    id: 10,
    name: 'Lake Tana Islands',
    description: '37 islands with monasteries and unique wildlife',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    type: 'lake'
  },
];

const PaginationItem = ({ animValue, index, length }) => {
  const width = 8;

  const animStyle = useAnimatedStyle(() => {
    let inputRange = [index - 1, index, index + 1];
    if (index === 0 && animValue?.value > length - 1) {
      inputRange = [length - 1, length, length + 1];
    }

    const opacity = interpolate(animValue.value, inputRange, [0.5, 1, 0.5], 'clamp');

    return {
      opacity,
    };
  }, [animValue, index, length]);

  return (
    <Animated.View
      style={[
        {
          width,
          height: width,
          borderRadius: width / 2,
          backgroundColor: colors.white,
          margin: 4,
        },
        animStyle,
      ]}
    />
  );
};

const HomeScreen = ({ navigation }) => {
  const [whereTo, setWhereTo] = useState('');
  const [when, setWhen] = useState('');
  const [activeFilter, setActiveFilter] = useState('religious');
  const progressValue = useSharedValue(0);

  // Log data to verify
  console.log('Carousel Images:', carouselImages);
  console.log('Hidden Gems:', hiddenGems);
  console.log('Testimonials:', testimonials);

  const renderCarouselItem = ({ item }) => {
    return (
      <View style={styles.carouselItem}>
        <Image source={item.src} style={styles.carouselImage} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.carouselGradient}
        >
          <Text style={styles.carouselTitle}>{item.title}</Text>
          <Text style={styles.carouselDescription}>{item.description}</Text>
        </LinearGradient>
      </View>
    );
  };

  const renderTestimonial = ({ item }) => {
    return (
      <View style={styles.testimonialCard}>
        <Image source={{ uri: item.image }} style={styles.testimonialImage} />
        <Text style={styles.testimonialText}>"{item.text}"</Text>
        <Text style={styles.testimonialAuthor}>- {item.author}</Text>
      </View>
    );
  };

  const renderGem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.gemCard}
        onPress={() => navigation.navigate('Destination', { destination: item })}
      >
        <Image source={{ uri: item.image }} style={styles.gemImage} resizeMode="cover" />
        <View style={styles.gemTextContainer}>
          <Text style={styles.gemTitle}>{item.name}</Text>
          <Text style={styles.gemDescription}>{item.description}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilteredContent = () => {
    let data = [];
    switch (activeFilter) {
      case 'religious':
        data = religiousSites;
        break;
      case 'hotels':
        data = hotels;
        break;
      case 'lakes':
        data = lakes;
        break;
      default:
        data = religiousSites;
    }

    return (
      <FlatList
        data={data}
        renderItem={renderGem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.gemsContainer}
      />
    );
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={{ uri: backgroundImage }} style={styles.backgroundImage} blurRadius={3}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.overlay} />

          {/* Hero Carousel */}
          <View style={styles.carouselContainer}>
            <Carousel
              width={viewportWidth}
              height={350}
              data={carouselImages}
              scrollAnimationDuration={1000}
              onProgressChange={(_, absoluteProgress) => {
                progressValue.value = absoluteProgress;
              }}
              renderItem={renderCarouselItem}
              autoPlay
              autoPlayInterval={3000}
            />
            <View style={styles.paginationContainer}>
              {carouselImages.map((_, index) => (
                <PaginationItem
                  animValue={progressValue}
                  index={index}
                  key={index}
                  length={carouselImages.length}
                />
              ))}
            </View>

            {/* Search Bar */}
            <View style={styles.searchBarContainer}>
              <View style={[styles.searchInputWrapper, { backgroundColor: colors.whereInput }]}>
                <MaterialIcons name="location-on" size={20} color={colors.white} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Where to?"
                  placeholderTextColor={colors.background}
                  value={whereTo}
                  onChangeText={setWhereTo}
                />
              </View>
              <View style={[styles.searchInputWrapper, { backgroundColor: colors.whenInput }]}>
                <MaterialIcons name="calendar-today" size={20} color={colors.white} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="When?"
                  placeholderTextColor={colors.background}
                  value={when}
                  onChangeText={setWhen}
                />
              </View>
              <TouchableOpacity
                style={[styles.searchButton, { backgroundColor: colors.searchButton }]}
                
              >
                <MaterialIcons name="search" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Why Book Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Why Book with Visit Amhara?</Text>
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <MaterialCommunityIcons name="headset" size={30} color={colors.accent} />
                <Text style={styles.featureTitle}>24/7 Support</Text>
                <Text style={styles.featureText}>We're here for you anytime</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialCommunityIcons name="gift" size={30} color={colors.accent} />
                <Text style={styles.featureTitle}>Earn Rewards</Text>
                <Text style={styles.featureText}>Travel more, earn more</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialCommunityIcons name="thumb-up" size={30} color={colors.accent} />
                <Text style={styles.featureTitle}>Trusted Reviews</Text>
                <Text style={styles.featureText}>Verified reviews to guide you</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialCommunityIcons name="credit-card" size={30} color={colors.accent} />
                <Text style={styles.featureTitle}>Flexible Plans</Text>
                <Text style={styles.featureText}>Free cancellation options</Text>
              </View>
            </View>
          </View>

          {/* Hidden Gems */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Explore Amhara's Hidden Gems</Text>
            <FlatList
              data={hiddenGems}
              renderItem={renderGem}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.gemsContainer}
            />
          </View>

          {/* Filter Buttons */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, activeFilter === 'hotels' && styles.activeFilter]}
              onPress={() => setActiveFilter('hotels')}
            >
              <Text
                style={[styles.filterText, activeFilter === 'hotels' && styles.activeFilterText]}
              >
                Hotels
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, activeFilter === 'religious' && styles.activeFilter]}
              onPress={() => setActiveFilter('religious')}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === 'religious' && styles.activeFilterText,
                ]}
              >
                Religious Sites
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, activeFilter === 'lakes' && styles.activeFilter]}
              onPress={() => setActiveFilter('lakes')}
            >
              <Text
                style={[styles.filterText, activeFilter === 'lakes' && styles.activeFilterText]}
              >
                Lakes
              </Text>
            </TouchableOpacity>
          </View>

          {/* Filtered Content */}
          <View style={styles.filteredContent}>
            <Text style={styles.contentTitle}>
              {activeFilter === 'religious' && 'Religious Sites in Amhara'}
              {activeFilter === 'hotels' && 'Hotels in Amhara'}
              {activeFilter === 'lakes' && 'Lakes in Amhara'}
            </Text>
            {renderFilteredContent()}
          </View>

          {/* Testimonials */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>What Our Visitors Say</Text>
            <FlatList
              data={testimonials}
              renderItem={renderTestimonial}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.testimonialsContainer}
            />
          </View>

          {/* Call to Action */}
          <View style={styles.ctaContainer}>
            <Text style={styles.ctaTitle}>Ready to Explore Amhara?</Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('Destinations')}
            >
              <Text style={styles.ctaButtonText}>Book Your Trip Now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: -1,
  },
  carouselContainer: {
    height: 350,
    position: 'relative',
  },
  carouselItem: {
    width: viewportWidth,
    height: 350,
    position: 'relative',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  carouselGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    height: '40%',
    justifyContent: 'flex-end',
  },
  carouselTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  carouselDescription: {
    color: colors.white,
    fontSize: 16,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 100,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  searchBarContainer: {
    position: 'absolute',
    bottom: 110,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 40,
    marginRight: 10,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 10,
    color: colors.white,
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionContainer: {
    padding: 15,
    marginTop: 20,
    backgroundColor: colors.primary,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 15,
    textAlign: 'center',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '48%',
    backgroundColor: colors.secondary,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    marginVertical: 5,
  },
  featureText: {
    fontSize: 14,
    color: colors.white,
    textAlign: 'center',
  },
  gemsContainer: {
    paddingHorizontal: 10,
  },
  gemCard: {
    width: 200,
    marginRight: 15,
    backgroundColor: colors.secondary,
    borderRadius: 10,
    overflow: 'hidden',
  },
  gemImage: {
    width: '100%',
    height: 120,
  },
  gemTextContainer: {
    padding: 10,
  },
  gemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 5,
  },
  gemDescription: {
    fontSize: 14,
    color: colors.white,
  },
  testimonialCard: {
    width: 250,
    backgroundColor: colors.secondary,
    borderRadius: 10,
    padding: 20,
    marginRight: 15,
  },
  testimonialImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignSelf: 'center',
    marginBottom: 10,
  },
  testimonialText: {
    fontSize: 14,
    color: colors.white,
    fontStyle: 'italic',
    marginBottom: 10,
    textAlign: 'center',
  },
  testimonialAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.accent,
    textAlign: 'right',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginVertical: 20,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: colors.secondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  activeFilter: {
    backgroundColor: colors.accent,
  },
  filterText: {
    color: colors.white,
  },
  activeFilterText: {
    color: colors.white,
  },
  filteredContent: {
    padding: 20,
    backgroundColor: colors.primary,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 15,
  },
  testimonialsContainer: {
    paddingHorizontal: 10,
  },
  ctaContainer: {
    backgroundColor: colors.accent,
    padding: 30,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 15,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  ctaButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HomeScreen;