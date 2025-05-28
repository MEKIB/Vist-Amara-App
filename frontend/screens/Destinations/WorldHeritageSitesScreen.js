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
    title: "The Semien Mountains National Park",
    description:
      "Famous for its dramatic highland scenery and endemic wildlife, The Semien Mountains National Park constitutes a world heritage site.",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306", // Placeholder: Rugged mountains
    type: "World Heritage Site",
  },
  {
    title: "The Rock Hewn Churches of Lalibela",
    description:
      "Lalibela is a place where history and mystery frozen in stone, its soul alive with the rites and awe of Christianity at its most ancient and unbending.",
    image: "https://images.unsplash.com/photo-1580130732478-4e339fb3376f", // Placeholder: Rock-hewn church
    type: "World Heritage Site",
  },
  {
    title: "Fasil Ghebbi - The Camelot of Africa",
    description:
      'Often called the "Camelot of Africa", Gonder\'s royal enclosure is a reality of medieval African architecture with castles and churches dating back to the 17th century.',
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945", // Placeholder: Castle
    type: "World Heritage Site",
  },
  {
    title: "Lake Tana Biosphere Reserve",
    description:
      "A hotspot of biodiversity, internationally known as an Important Bird Area, Lake Tana Biosphere Reserve is of global importance for agricultural genetic diversity.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945", // Placeholder: Lake
    type: "World Heritage Site",
  },
];

const WorldHeritageSitesScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>World Heritage Sites in Amhara</Text>

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

export default WorldHeritageSitesScreen;
