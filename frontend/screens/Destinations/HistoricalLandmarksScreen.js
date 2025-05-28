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

const landmarks = [
  {
    title: "Guzara Castle",
    description:
      "Guzara is a place which ushers a new period of urban development and permanent seat construction for the Ethiopian empire during the medieval period.",
    image: "https://images.unsplash.com/photo-1580130732478-4e339fb3376f", // Placeholder
    type: "Historical Site",
  },
  {
    title: "Yisma Nigus",
    description:
      "Yisma Nigus is one of the iconic places in Ethiopia in relation to the Battle of Adwa. A museum dedicated to the history of the area is recently installed.",
    image: "https://images.unsplash.com/photo-1579613832125-5d34a13ffe2a", // Placeholder
    type: "Historical Site",
  },
  {
    title: "Ayiteyef Adarash (Dining Hall)",
    description:
      "Ayiteyef is one of the big historical dining halls in Ethiopia. The dining hall can accommodate 3000 guests at one time and as its name implies, the king, the nobles, the clergy, and the ordinary people were served equally.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945", // Placeholder
    type: "Historical Site",
  },
  {
    title: "Maqedela Ridge",
    description:
      "Meqedela Amba is a place where the aspiration and the zeal of Emperor Tewodros for the modernization of Ethiopia came to an end.",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306", // Placeholder
    type: "Historical Site",
  },
  {
    title: "Shonke Village",
    description:
      "The Shonke Village is an old and mesmerizing mountain with a 900-year unabated settlement with enthralling homes and alleyways.",
    image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846", // Placeholder
    type: "Historical Village",
  },
  {
    title: "Ankober Lodge",
    description:
      "The medieval town of Ankober is one of the best accomplished day trip destinations in the vicinity of Addis Ababa.",
    image: "https://images.unsplash.com/photo-1579613832125-5d34a13ffe2a", // Placeholder
    type: "Historical Site",
  },
];

const HistoricalLandmarksScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Historical Landmarks in Amhara</Text>

      {landmarks.map((landmark, index) => (
        <TouchableOpacity
          key={index}
          style={styles.card}
          onPress={() =>
            navigation.navigate("DestinationDetailsScreen", {
              destination: landmark,
            })
          }
        >
          <Image
            source={{ uri: landmark.image }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{landmark.title}</Text>
            <Text style={styles.cardDescription}>{landmark.description}</Text>
            <View style={styles.cardFooter}>
              <MaterialCommunityIcons
                name="map-marker"
                size={16}
                color={colors.accent}
              />
              <Text style={styles.cardType}>{landmark.type}</Text>
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

export default HistoricalLandmarksScreen;
