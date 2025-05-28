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
    title: "Lalibela",
    description:
      "Famous for its rock-hewn monolithic churches, a UNESCO World Heritage Site.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945", // Placeholder: Lalibela
    type: "Religious Sites",
  },
  {
    id: 2,
    title: "Abune Aregawi Monastery",
    description:
      "A historic monastery with stunning views and spiritual significance.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945", // Placeholder: Monastery
    type: "Religious Sites",
  },
];

const ReligiousSitesScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Religious Sites in Amhara</Text>

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

export default ReligiousSitesScreen;
