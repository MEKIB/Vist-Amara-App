import React from "react";
import { View, StyleSheet, Text, ScrollView, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const colors = {
  primary: "#222831",
  secondary: "#393E46",
  accent: "#00ADB5",
  background: "#EEEEEE",
};

const DestinationDetailsScreen = ({ route }) => {
  const { destination } = route.params || {};

  if (!destination) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No destination data available</Text>
      </View>
    );
  }

  const { title, description, image, type } = destination;

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: image } || require("../../assets/icon.png")}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.typeContainer}>
          <MaterialCommunityIcons
            name="map-marker"
            size={20}
            color={colors.accent}
          />
          <Text style={styles.type}>{type}</Text>
        </View>
        <Text style={styles.description}>{description}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  image: {
    width: "100%",
    height: 250,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  content: {
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 10,
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  type: {
    fontSize: 16,
    color: colors.secondary,
    marginLeft: 8,
  },
  description: {
    fontSize: 16,
    color: colors.secondary,
    lineHeight: 24,
  },
  errorText: {
    fontSize: 18,
    color: colors.primary,
    textAlign: "center",
    marginTop: 50,
  },
});

export default DestinationDetailsScreen;
