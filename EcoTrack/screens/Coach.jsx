// NEW: Import useRef and ActivityIndicator
import React, { useState, useRef } from "react"; 
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator, // NEW: Added for the typing indicator
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useAppTheme } from "../android/app/utils/theme";

const Coach = () => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  
  // NEW: Add a state for loading and a ref for scrolling
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello Sarah! 🌱 I'm EcoBuddy, your personal carbon companion.",
      isBot: true,
      timestamp: "9:30 AM",
    },
    {
      id: 2,
      text: "Today you've used 4.2 kg CO₂, 18% below your weekly average. Great job! 🎉",
      isBot: true,
      timestamp: "9:30 AM",
    },
  ]);

  const dailyTips = [
    {
      id: 1,
      category: "Travel",
      tip: "You traveled 8 km by bus today. Try walking 1 short trip tomorrow!",
      icon: "trending-up",
      color: colors.blue,
    },
    {
      id: 2,
      category: "Diet",
      tip: "Try one vegetarian meal to reduce 1.6kg CO₂.",
      icon: "target",
      color: colors.green,
    },
    {
      id: 3,
      category: "Energy",
      tip: "Energy usage decreased by 12% this week. Keep going!",
      icon: "star-shooting",
      color: colors.yellow,
    },
  ];

  const quickReplies = [
    "How can I reduce my carbon footprint?",
    "Show my weekly progress",
    "Give me today's challenge",
    "Tips for sustainable travel",
  ];

  // NEW: The handleSendMessage function is now async to handle the API call
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: message,
      isBot: false,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    };

    // Add user message and set loading
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);
    
    // NEW: Scroll to bottom after sending
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    // --- NEW: API Call ---
    try {
      // ❗❗❗ IMPORTANT ❗❗❗
      // Replace this with your computer's IP address
      const response = await fetch("http://100.115.130.16:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: userMessage.text }),
      });

      if (!response.ok) {
        throw new Error("Something went wrong");
      }

      const data = await response.json(); // Gets { "reply": "..." }
      const botReply = data.reply;

      const botMessage = {
        id: messages.length + 2, // Use +2 because we already added the user message
        text: botReply,
        isBot: true,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
      };
      
      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error(error);
      // Show an error message in the chat
      const errorMessage = {
        id: messages.length + 2,
        text: "Sorry, I'm having trouble connecting right now. 😔",
        isBot: true,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      // NEW: Stop loading and scroll to bottom
      setIsLoading(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
    // --- End of API Call ---
  };

  // NEW: This function is now DELETED. 
  // All this logic is on your server.
  // const generateBotReply = (msg) => { ... };

  const renderHeader = () => (
    <View
      style={{
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        marginTop: insets.top,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.greenLight,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <MaterialCommunityIcons
            name="robot-outline"
            size={24}
            color={colors.green}
          />
        </View>
        <View>
          <Text style={{ fontSize: 18, fontWeight: "600", color: colors.primary }}>
            EcoBuddy
          </Text>
          <Text style={{ fontSize: 14, color: colors.success }}>
            Online • Ready to help! 🌿
          </Text>
        </View>
      </View>
    </View>
  );

  const renderDailyTips = () => (
    <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: colors.primary,
          marginBottom: 12,
        }}
      >
        Today's Insights 💡
      </Text>
      {dailyTips.map((tip) => (
        <TouchableOpacity
          key={tip.id}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: "row" }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: `${tip.color}20`,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              <MaterialCommunityIcons name={tip.icon} size={18} color={tip.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: tip.color }}>{tip.category}</Text>
              <Text style={{ fontSize: 14, color: colors.primary, lineHeight: 20 }}>
                {tip.tip}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMessage = (msg) => (
    <View
      key={msg.id}
      style={{
        paddingHorizontal: 20,
        marginBottom: 16,
        alignItems: msg.isBot ? "flex-start" : "flex-end",
      }}
    >
      <View
        style={{
          maxWidth: "80%",
          backgroundColor: msg.isBot ? colors.surface : colors.green,
          padding: 14,
          borderRadius: 18,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            color: msg.isBot ? colors.primary : "#fff",
            lineHeight: 20,
          }}
        >
          {msg.text}
        </Text>
      </View>
      <Text style={{ fontSize: 12, color: colors.secondary, marginTop: 4 }}>
        {msg.timestamp}
      </Text>
    </View>
  );

  // NEW: A function to render the "is typing" bubble
  const renderTypingIndicator = () => {
    if (!isLoading) return null;
    return (
      <View style={{ paddingHorizontal: 20, marginBottom: 16, alignItems: 'flex-start' }}>
        <View style={{
          backgroundColor: colors.surface,
          paddingHorizontal: 14,
          paddingVertical: 10, // Gives it a nice bubble shape
          borderRadius: 18,
        }}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </View>
    );
  };

  const renderQuickReplies = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border }}
    >
      {quickReplies.map((reply, idx) => (
        <TouchableOpacity
          key={idx}
          onPress={() => setMessage(reply)}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 20,
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: colors.border,
            marginRight: 8,
          }}
        >
          <Text style={{ fontSize: 12, color: colors.secondary }}>{reply}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderInput = () => (
    <View
      style={{
        paddingHorizontal: 20,
        paddingVertical: 12,
        paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          backgroundColor: colors.background,
          borderRadius: 24,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: "flex-end",
        }}
      >
        <TextInput
          style={{
            flex: 1,
            fontSize: 14,
            color: colors.primary,
            paddingVertical: 8, 
            paddingTop: 8, 
          }}
          placeholder="Ask EcoBuddy anything..."
          placeholderTextColor={colors.placeholder}
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity
          // NEW: Disable button when no message or when loading
          disabled={!message.trim() || isLoading}
          onPress={handleSendMessage}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            // NEW: Change color when disabled
            backgroundColor: (message.trim() && !isLoading) ? colors.green : colors.surfaceVariant,
            justifyContent: "center",
            alignItems: "center",
            marginLeft: 8,
            bottom: 4, 
          }}
        >
          <MaterialCommunityIcons
            name="send"
            size={18}
            color={(message.trim() && !isLoading) ? "#fff" : colors.placeholder}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0} 
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      {renderHeader()}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        // NEW: Attach the ref here
        ref={scrollViewRef}
      >
        {renderDailyTips()}
        <View
          style={{
            height: 1,
            backgroundColor: colors.border,
            marginHorizontal: 20,
            marginVertical: 8,
          }}
        />
        {messages.map(renderMessage)}
        
        {/* NEW: Add the typing indicator to the end of the list */}
        {renderTypingIndicator()}
      </ScrollView>

      {renderQuickReplies()}
      {renderInput()}
    </KeyboardAvoidingView>
  );
}; 
export default Coach;