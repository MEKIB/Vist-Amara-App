import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image } from 'react-native';

const apiKey = 'AIzaSyAxVrT0sVLTwHaUPMQtTsL8r38ma7oG_Oo';

const systemPrompt = `
You are Luma, an AI assistant for the Visit Amhara tourism system. Your role is to:
1. Only answer questions related to tourism in the Amhara region of Ethiopia
2. Provide information about destinations, hotels, flights, and tourist facilities
3. Help with bookings and travel planning within this system
4. Politely decline to answer any questions not related to this tourism system

Response Guidelines:
- Keep answers concise (1-2 paragraphs max)
- Always mention if information requires checking current availability
- For bookings, direct users to the appropriate section of the website
- For VR/AR features, explain how to access them
`;

const systemKnowledge = `
Visit Amhara Tourism System Features:
- VR/AR previews of destinations
- Hotel and flight bookings
- World Heritage Site information
- Cultural event calendars
- Tourist facility directory
- Multi-language support

Key Destinations:
- Lalibela: Rock-hewn churches (UNESCO site)
- Gondar: Fasil Ghebbi castles (UNESCO site)
- Simien Mountains: National Park (UNESCO site)
- Bahir Dar: Lake Tana monasteries and Blue Nile Falls
- Debre Damo: Ancient monastery
- Axum: Historic obelisks (near Amhara region)

Booking Information:
- Hotels can be booked with credit card or mobile payment
- Flights available from Addis Ababa to Bahir Dar, Gondar, and Lalibela
- Tour packages include transportation and guides
`;

const knowledgeBase = {
  "how do i book a hotel": "You can book hotels by visiting our 'Hotels and Lodges' section, selecting your preferred hotel, and completing the booking form. We accept major credit cards and mobile payments.",
  "what are popular destinations": "Top destinations in Amhara include:\n1. Lalibela's rock-hewn churches\n2. Simien Mountains National Park\n3. Lake Tana's monasteries\n4. Blue Nile Falls\n5. Gondar's royal enclave",
  "how do i get to lalibela": "Options to reach Lalibela:\n1. Flight: Daily flights from Addis Ababa (1hr)\n2. Road: Scenic 2-day drive from Bahir Dar\n3. Tour: Book a guided tour package",
  "what world heritage sites are there": "Amhara has 3 UNESCO sites:\n1. Rock-Hewn Churches of Lalibela\n2. Simien Mountains National Park\n3. Fasil Ghebbi in Gondar",
  "what is your name": "I'm Luma, your AI guide for Visit Amhara tourism system!",
  "help": "I can help with:\n- Destination information\n- Hotel/flight bookings\n- Heritage site details\n- Travel planning\n- VR previews of locations",
  "how does vr work": "Our VR feature lets you explore destinations in 360°:\n1. Go to any destination page\n2. Click 'VR Preview'\n3. Use mouse or mobile to look around",
  "what events are happening": "Check our Events calendar for:\n- Timket (Epiphany) in Gondar\n- Meskel celebrations\n- Lalibela's Christmas (Genna)\n- Cultural festivals",
  "what can you do": "I can help with:\n- Tourism information for Amhara region\n- Hotel and flight bookings\n- Heritage site details\n- Travel planning\n- VR previews of locations\n\nJust ask about anything related to visiting Amhara!",
};

const ChatbotLogic = () => {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Luma: Hello! I'm your Amhara tourism assistant. Ask me about destinations, hotels, or travel planning in the Amhara region of Ethiopia.",
    },
  ]);
  const [isVisible, setIsVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState(null);
  const [inputText, setInputText] = useState('');
  const abortController = useRef(new AbortController());
  const flatListRef = useRef(null);

  const toggleChatbot = () => setIsVisible((prev) => !prev);

  const getFAQResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    if (knowledgeBase[lowerMessage]) {
      return knowledgeBase[lowerMessage];
    }
    for (const [key, value] of Object.entries(knowledgeBase)) {
      if (lowerMessage.includes(key)) {
        return value;
      }
    }
    return null;
  };

  const isTourismRelated = (response) => {
    const tourismKeywords = [
      'tour', 'travel', 'hotel', 'flight', 'destination',
      'amhara', 'visit', 'book', 'booking', 'lalibela',
      'simien', 'heritage', 'site', 'attraction', 'tourism',
      'guide', 'trip', 'vacation', 'holiday', 'vr', 'ar',
    ];
    return tourismKeywords.some((keyword) =>
      response.toLowerCase().includes(keyword)
    );
  };

  const sendMessage = async () => {
    const now = Date.now();
    if (lastMessageTime && now - lastMessageTime < 1000) {
      return; // Rate limiting - 1 second between messages
    }
    setLastMessageTime(now);

    const message = inputText.trim();
    if (!message) return;
    if (message.length < 2) {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: 'Luma: Please ask a complete question about Amhara tourism.' },
      ]);
      flatListRef.current?.scrollToEnd({ animated: true });
      return;
    }

    setMessages((prev) => [...prev, { role: 'user', text: message }]);
    setInputText('');
    setIsTyping(true);
    flatListRef.current?.scrollToEnd({ animated: true });

    const faqResponse = getFAQResponse(message);
    if (faqResponse) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: 'bot', text: `Luma: ${faqResponse}` }]);
        setIsTyping(false);
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 800);
      return;
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;

      const requestBody = {
        contents: [{
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n${systemKnowledge}\n\nUser Question: ${message}` }],
        }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 200,
          topP: 0.9,
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: abortController.current.signal,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        let botReply = data.candidates[0].content.parts[0].text;

        if (!isTourismRelated(botReply)) {
          botReply = "I'm sorry, I can only assist with questions about the Visit Amhara tourism system.";
        }

        setMessages((prev) => [...prev, { role: 'bot', text: `Luma: ${botReply}` }]);
        flatListRef.current?.scrollToEnd({ animated: true });
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Chatbot Error:', error);
        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            text: "Luma: I'm having trouble connecting to our services. " +
                  "Please try again later or ask a different question about Amhara tourism.",
          },
        ]);
        flatListRef.current?.scrollToEnd({ animated: true });
      }
    } finally {
      setIsTyping(false);
      abortController.current = new AbortController();
    }
  };

  const renderMessage = ({ item }) => (
    <View style={item.role === 'user' ? styles.userMessage : styles.botMessage}>
      {item.role === 'bot' && <Text style={styles.lumaText}>Luma:</Text>}
      <Text style={styles.messageText}>{item.text.replace('Luma:', '')}</Text>
    </View>
  );

  return (
    <>
      <TouchableOpacity style={styles.chatbotIcon} onPress={toggleChatbot}>
        <Image
          source={require('../../assets/chatbot.webp')}
          style={styles.chatbotIconImage}
        />
      </TouchableOpacity>

      {isVisible && (
        <View style={styles.chatbotContainer}>
          <View style={styles.chatbotHeader}>
            <Text style={styles.headerText}>Chat with Luma!</Text>
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
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
            {isTyping && (
              <View style={styles.typingIndicator}>
                <Text style={styles.lumaText}>Luma:</Text>
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
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 50,
    height: 50,
    zIndex: 1000,
  },
  chatbotIconImage: {
    width: '100%',
    height: '100%',
  },
  chatbotContainer: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 250,
    height: 330,
    backgroundColor: '#222831',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  chatbotHeader: {
    backgroundColor: '#2d7ded',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    color: '#fff',
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
    backgroundColor: '#143D60',
    alignSelf: 'flex-end',
    padding: 8,
    margin: 5,
    borderRadius: 5,
    maxWidth: '80%',
  },
  botMessage: {
    backgroundColor: '#393E46',
    alignSelf: 'flex-start',
    padding: 8,
    margin: 5,
    borderRadius: 5,
    maxWidth: '80%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  lumaText: {
    color: '#FFAB5B',
    fontWeight: 'bold',
  },
  messageText: {
    color: '#fff',
  },
  typingIndicator: {
    backgroundColor: '#393E46',
    padding: 8,
    margin: 5,
    borderRadius: 5,
    alignSelf: 'flex-start',
    flexDirection: 'row',
  },
  typingText: {
    color: '#fff',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginTop: 5,
    paddingRight: 40,
  },
  abortButton: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  abortButtonText: {
    color: '#e94560',
    fontSize: 18,
  },
});

export default ChatbotLogic;