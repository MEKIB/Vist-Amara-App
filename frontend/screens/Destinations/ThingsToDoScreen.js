import React from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const colors = {
  primary: "#222831",
  secondary: "#393E46",
  accent: "#00ADB5",
  background: "#EEEEEE",
};

const activities = [
  {
    title: "Horseback Riding",
    description:
      "With the decoration, they put in their horse, and with a heated and fierce horse galloping event hosted annually attending the horsing events in the Amhara region is a lifetime experience.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c", // Placeholder
    type: "Outdoor Activity",
  },
  {
    title: "Community Tourism",
    description:
      "With the unique welcoming culture and attribute of the Amhara people, community tourism is one of the special experience one has to do in this part of Ethiopia.",
    image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846", // Placeholder
    type: "Cultural Experience",
  },
  {
    title: "Biking",
    description:
      "Thanks to pristine new roads developing in Ethiopia, the Amhara region is now an exciting destination for cyclists with tough climbs, friendly people, and endless views.",
    image: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7", // Placeholder
    type: "Adventure",
  },
  {
    title: "Fishing",
    description:
      "Fishing in the Amhara region is moving back in time to the period of the Ancient Egyptians. Discover Amhara and be in awe of how old fishing is in this part of Ethiopia.",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2", // Placeholder
    type: "Outdoor Activity",
  },
  {
    title: "Bird Watching",
    description:
      "Host some of the rare and endemic bird species like Lammergeyer and Ankober Serin, birding in this part of Ethiopia will make your binocular restive.",
    image: "https://images.unsplash.com/photo-1444464666168-49d633b86736", // Placeholder
    type: "Wildlife",
  },
  {
    title: "Hiking and Trekking",
    description:
      "The region that dominated by mountainous topography and vistas, the Amhara region retains world class destinations for Hiking and trekking.",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306", // Placeholder
    type: "Adventure",
  },
];

const ThingsToDoScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Things to Do in Amhara</Text>

      {activities.map((activity, index) => (
        <TouchableOpacity
          key={index}
          style={styles.card}
          onPress={() =>
            navigation.navigate("DestinationDetailsScreen", {
              destination: activity,
            })
          }
        >
          <Image
            source={{ uri: activity.image }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{activity.title}</Text>
            <Text style={styles.cardDescription}>{activity.description}</Text>
            <View style={styles.cardFooter}>
              <MaterialCommunityIcons
                name="map-marker"
                size={16}
                color={colors.accent}
              />
              <Text style={styles.cardType}>{activity.type}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: 180,
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardType: {
    fontSize: 14,
    color: colors.secondary,
    marginLeft: 5,
  },
});

export default ThingsToDoScreen;
