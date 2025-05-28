import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Platform,
  Alert,
} from "react-native";
import axios from "axios";

// Configurable backend URL based on environment
const getBackendUrl = () => {
  if (Platform.OS === "android") {
    return "http://192.168.54.46:2000/chat"; // Android emulator
  } else if (Platform.OS === "ios") {
    return "http://localhost:2000/chat"; // iOS simulator
  }
  return "http://192.168.54.46:2000/chat"; // Default for physical device; replace with your host IP
};

// Fallback IP (replace with your host IP if 10.0.2.2 fails)
const FALLBACK_IP = "http://1192.168.54.46:2000/chat"; // Adjust this to your host IP

const ChatbotLogic = () => {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Lal: Hello! I’m your Amhara tourism assistant. Ask me about destinations, hotels, or travel planning in the Amhara region of Ethiopia.",
    },
  ]);
  const [isVisible, setIsVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState(null);
  const abortController = useRef(new AbortController());
  const flatListRef = useRef(null);
  const [inputText, setInputText] = useState("");

  const toggleChatbot = () => setIsVisible((prev) => !prev);

  const sendMessage = async () => {
    const now = Date.now();
    if (lastMessageTime && now - lastMessageTime < 1000) {
      return; // Rate limiting: 1 second between messages
    }
    setLastMessageTime(now);

    const message = inputText.trim();
    if (!message) return;
    if (message.length < 2) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Lal: Please ask a complete question about Amhara tourism.",
        },
      ]);
      flatListRef.current?.scrollToEnd({ animated: true });
      return;
    }

    // Add user message and a placeholder for the bot's response
    setMessages((prev) => [
      ...prev,
      { role: "user", text: message },
      { role: "bot", text: "Lal: ..." },
    ]);
    setInputText("");
    setIsTyping(true);
    flatListRef.current?.scrollToEnd({ animated: true });

    try {
      const url = getBackendUrl();
      console.log("Attempting request to:", url);

      const response = await axios.post(
        url,
        { message },
        {
          signal: abortController.current.signal,
          timeout: 15000, // Increased to 15 seconds for slower networks
        }
      );

      console.log("Backend Response Data:", response.data);

      if (response.data && response.data.reply) {
        let botReply = response.data.reply;

        // Ensure the response is prefixed with "Lal:"
        if (!botReply.startsWith("Lal:")) {
          botReply = `Lal: ${botReply}`;
        }

        // Replace the placeholder with the actual reply
        setMessages((prev) => [
          ...prev.slice(0, -1), // Remove the placeholder
          { role: "bot", text: botReply },
        ]);
      } else {
        throw new Error(
          "Invalid response format from backend: 'reply' field missing"
        );
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Chatbot Error:", {
          message: error.message,
          code: error.code,
          request: error.request,
          response: error.response?.data,
          config: error.config?.url,
        });
        // Try fallback IP if initial request fails
        if (!error.response && error.code === "ECONNREFUSED") {
          console.log("Trying fallback IP:", FALLBACK_IP);
          try {
            const fallbackResponse = await axios.post(
              FALLBACK_IP,
              { message },
              {
                signal: abortController.current.signal,
                timeout: 15000,
              }
            );
            if (fallbackResponse.data && fallbackResponse.data.reply) {
              let botReply = fallbackResponse.data.reply;
              if (!botReply.startsWith("Lal:")) {
                botReply = `Lal: ${botReply}`;
              }
              setMessages((prev) => [
                ...prev.slice(0, -1),
                { role: "bot", text: botReply },
              ]);
              return;
            }
          } catch (fallbackError) {
            console.error("Fallback Error:", fallbackError);
          }
        }
        // Display detailed error message
        const errorMessage = error.response
          ? `Lal: I’m having trouble connecting to our services. Server responded with: ${
              error.response.status
            } - ${JSON.stringify(error.response.data)}. Please try again later.`
          : `Lal: I’m having trouble connecting to our services. Error: ${
              error.message
            } (Code: ${
              error.code || "unknown"
            }). Please check your network, ensure the server is running at ${getBackendUrl()}, or contact support.`;
        setMessages((prev) => [
          ...prev.slice(0, -1), // Remove the placeholder
          { role: "bot", text: errorMessage },
        ]);
        flatListRef.current?.scrollToEnd({ animated: true });
      }
    } finally {
      setIsTyping(false);
      abortController.current = new AbortController();
    }
  };

  const renderMessage = ({ item }) => (
    <View style={item.role === "user" ? styles.userMessage : styles.botMessage}>
      {item.role === "bot" && <Text style={styles.lalText}>Lal:</Text>}
      <Text style={styles.messageText}>{item.text.replace("Lal:", "")}</Text>
    </View>
  );

  return (
    <>
      <TouchableOpacity style={styles.chatbotIcon} onPress={toggleChatbot}>
        <Image
          source={require("../../assets/chatbot.webp")}
          style={styles.chatbotIconImage}
        />
      </TouchableOpacity>

      {isVisible && (
        <View style={styles.chatbotContainer}>
          <View style={styles.chatbotHeader}>
            <Text style={styles.headerText}>Chat with Lal!</Text>
            <TouchableOpacity onPress={toggleChatbot}>
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chatbotBody}>
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item, index) => index.toString()}
              style={styles.messageList}
              contentContainerStyle={styles.messageListContent}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
            />
            {isTyping && (
              <View style={styles.typingIndicator}>
                <Text style={styles.lalText}>Lal:</Text>
                <Text style={styles.typingText}> is typing...</Text>
              </View>
            )}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type your message..."
                placeholderTextColor="#888"
                onSubmitEditing={sendMessage}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={styles.abortButton}
                onPress={() => abortController.current.abort()}
              >
                <Text style={styles.abortButtonText}>▬</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  chatbotIcon: {
    position: "absolute",
    bottom: 80,
    right: 20,
    width: 50,
    height: 50,
    zIndex: 1000,
  },
  chatbotIconImage: {
    width: "100%",
    height: "100%",
  },
  chatbotContainer: {
    position: "absolute",
    bottom: 80,
    right: 20,
    width: 250,
    height: 330,
    backgroundColor: "#222831",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  chatbotHeader: {
    backgroundColor: "#2d7ded",
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  headerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  closeButton: {
    color: "#fff",
    fontSize: 18,
  },
  chatbotBody: {
    flex: 1,
    padding: 10,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingBottom: 10,
  },
  userMessage: {
    backgroundColor: "#143D60",
    alignSelf: "flex-end",
    padding: 8,
    margin: 5,
    borderRadius: 5,
    maxWidth: "80%",
  },
  botMessage: {
    backgroundColor: "#393E46",
    alignSelf: "flex-start",
    padding: 8,
    margin: 5,
    borderRadius: 5,
    maxWidth: "80%",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  lalText: {
    color: "#FFAB5B",
    fontWeight: "bold",
  },
  messageText: {
    color: "#fff",
  },
  typingIndicator: {
    backgroundColor: "#393E46",
    padding: 8,
    margin: 5,
    borderRadius: 5,
    alignSelf: "flex-start",
    flexDirection: "row",
  },
  typingText: {
    color: "#fff",
    fontStyle: "italic",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    marginTop: 5,
    paddingRight: 40,
  },
  abortButton: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  abortButtonText: {
    color: "#e94560",
    fontSize: 18,
  },
});

export default ChatbotLogic;
