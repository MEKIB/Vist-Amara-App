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

const categories = [
  {
    id: 1,
    name: "Things to Do",
    type: "Activities",
    image: require("../../assets/icon.png"), // Placeholder
  },
  {
    id: 2,
    name: "Religious Sites",
    type: "Spiritual",
    image: require("../../assets/icon.png"), // Placeholder
  },
  {
    id: 3,
    name: "Historical Landmarks",
    type: "History",
    image: require("../../assets/icon.png"), // Placeholder
  },
  {
    id: 4,
    name: "Lakes Hot Springs Waterfalls",
    type: "Water Bodies",
    image: require("../../assets/icon.png"), // Placeholder
  },
  {
    id: 5,
    name: "National Parks",
    type: "Nature",
    image: require("../../assets/icon.png"), // Placeholder
  },
  {
    id: 6,
    name: "World Heritage Sites",
    type: "Cultural Sites",
    image: require("../../assets/icon.png"), // Placeholder
  },
];

const DestinationCategoriesScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Explore Amhara Destinations</Text>

      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={styles.card}
          onPress={() => navigation.navigate(category.name.replace(/\s+/g, ""))}
        >
          <Image
            source={category.image}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{category.name}</Text>
            <Text style={styles.cardType}>{category.type}</Text>
            <View style={styles.cardFooter}>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={colors.accent}
              />
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
    height: 140,
  },
  cardContent: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    flex: 1,
  },
  cardType: {
    fontSize: 14,
    color: colors.secondary,
    marginLeft: 10,
    flex: 1,
  },
  cardFooter: {
    marginLeft: 10,
  },
});

export default DestinationCategoriesScreen;
