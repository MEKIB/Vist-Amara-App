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

const sites = [
  {
    id: 1,
    title: "Lake Tana",
    description:
      "The largest lake in Ethiopia, home to numerous islands with monasteries.",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791", // Placeholder: Lake
    type: "Lake",
  },
  {
    id: 2,
    title: "Blue Nile Falls",
    description:
      "A stunning waterfall known as Tis Issat, offering breathtaking views.",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470", // Placeholder: Waterfall
    type: "Waterfalls",
  },
  {
    id: 3,
    title: "Hot Springs of Wondogenet",
    description:
      "Natural hot springs perfect for relaxation and therapeutic baths.",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470", // Placeholder: Hot spring
    type: "Hot Springs",
  },
];

const LakesHotSpringsWaterfallsScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Lakes, Hot Springs & Waterfalls in Amhara
      </Text>

      {sites.map((site, index) => (
        <TouchableOpacity
          key={index}
          style={styles.card}
          onPress={() =>
            navigation.navigate("DestinationDetailsScreen", {
              destination: site,
            })
          }
        >
          <Image
            source={{ uri: site.image }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{site.title}</Text>
            <Text style={styles.cardDescription}>{site.description}</Text>
            <View style={styles.cardFooter}>
              <MaterialCommunityIcons
                name="map-marker"
                size={16}
                color={colors.accent}
              />
              <Text style={styles.cardType}>{site.type}</Text>
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

export default LakesHotSpringsWaterfallsScreen;
