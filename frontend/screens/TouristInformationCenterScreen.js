import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const colors = {
  primary: "#222831",
  secondary: "#393E46",
  accent: "#00ADB5",
  background: "#EEEEEE",
};

const touristInfoData = [
  {
    destination: "Bahir Dar",
    centers: [
      {
        name: "Tisabay Tourist Information Center",
        contacts: [
          {
            person: "Tesfa Asmare",
            mobile: "+251937342603",
            phone: "+2515822370054",
          },
          { person: "Dagnet", mobile: "0991801262", phone: "+2515822370054" },
        ],
      },
      {
        name: "Bahirdar Airport Tourist Information Center",
        contacts: [
          {
            person: "Saleamlak Tilaye",
            mobile: "+25193449802",
            phone: "0991801262",
          },
          {
            person: "Wudeneh Betew",
            mobile: "+25191275111",
            phone: "0991801262",
          },
        ],
      },
    ],
  },
  {
    destination: "Gondar",
    centers: [
      {
        name: "Gonder Airport Tourist Information Center",
        contacts: [
          {
            person: "Aseged Tesfaye",
            mobile: "+251983154066",
            phone: "0991801262",
          },
          {
            person: "Abyot Gebeyehu",
            mobile: "+251918164710",
            phone: "0991801262",
          },
        ],
      },
      {
        name: "Gonder Betemengist Tourist Information Center",
        contacts: [
          { person: "Serkie", mobile: "+251918030878", phone: "+251581110022" },
          { person: "Getahun", mobile: "0991801262", phone: "+251581115138" },
        ],
      },
    ],
  },
  {
    destination: "Lalibela",
    centers: [
      {
        name: "Lalibela Airport Tourist Information Center",
        contacts: [
          {
            person: "Asnake Tadese",
            mobile: "+251910388588",
            phone: "0991801262",
          },
          {
            person: "Zemenu Iyew",
            mobile: "+251920049527",
            phone: "0991801262",
          },
        ],
      },
      {
        name: "Lalibela Churches Tourist Information Center",
        contacts: [
          { person: "Habtamu", mobile: "+251985259780", phone: "0991801262" },
        ],
      },
    ],
  },
  {
    destination: "Debark",
    centers: [
      {
        name: "Semien Mountain National Park Tourist Information Center",
        contacts: [
          { person: "Azanaw", mobile: "+251918381153", phone: "+251581170016" },
        ],
      },
    ],
  },
  {
    destination: "Combolcha",
    centers: [
      {
        name: "Combolcha Airport Tourist Information Center",
        contacts: [
          {
            person: "Endalew Alem",
            mobile: "+251933046025",
            phone: "0991801262",
          },
          {
            person: "Asnakew Hafez",
            mobile: "+251934449802",
            phone: "0991801262",
          },
        ],
      },
    ],
  },
];

const TouristInformationCenterScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Image
          source={{ uri: "https://via.placeholder.com/400x200" }} // Replace with actual asset path or URL
          style={styles.heroImage}
          resizeMode="cover"
        />
        <Text style={styles.heroTitle}>Tourist Information Centers</Text>
      </View>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      {/* Tourist Information Content */}
      {touristInfoData.map((destinationData, index) => (
        <View key={index} style={styles.destinationContainer}>
          <Text style={styles.destinationTitle}>
            {destinationData.destination}
          </Text>
          {destinationData.centers.map((center, centerIndex) => (
            <View key={centerIndex} style={styles.centerContainer}>
              <Text style={styles.centerName}>{center.name}</Text>
              {center.contacts.map((contact, contactIndex) => (
                <View key={contactIndex} style={styles.contactItem}>
                  <Text style={styles.contactLabel}>Contact Person:</Text>
                  <Text style={styles.contactText}>{contact.person}</Text>
                  <Text style={styles.contactLabel}>Mobile:</Text>
                  <Text style={styles.contactText}>{contact.mobile}</Text>
                  <Text style={styles.contactLabel}>Phone:</Text>
                  <Text style={styles.contactText}>{contact.phone || "-"}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(34, 40, 49, 0.8)",
    padding: 15,
  },
  hero: {
    position: "relative",
    width: "100%",
    height: 200,
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroTitle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    color: "#00ADB5",
    fontSize: 24,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    textAlign: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#393E46",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },
  destinationContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "rgba(57, 62, 70, 0.8)",
    borderRadius: 16,
  },
  destinationTitle: {
    color: "#00ADB5",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  centerContainer: {
    marginBottom: 15,
  },
  centerName: {
    color: "#EEEEEE",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  contactItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "rgba(34, 40, 49, 0.8)",
    borderRadius: 8,
  },
  contactLabel: {
    color: "#00ADB5",
    fontSize: 14,
    fontWeight: "bold",
  },
  contactText: {
    color: "#EEEEEE",
    fontSize: 14,
    marginBottom: 5,
  },
});

export default TouristInformationCenterScreen;
