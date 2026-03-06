import React, { useState, useRef, useEffect } from "react";
import { Snackbar } from "react-native-paper";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Image,
} from "react-native";
// 1. Import Axios
import axios from 'axios';

import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

// --- TEMP USER DATA (replace later with your real tracking data) ---
const USER_DATA = {
  travel: {
    dailyKm: 12,
    mode: "bike",
    busUse: "medium"
  },
  food: {
    diet: "non-veg",
    weeklyChicken: 3
  },
  energy: {
    electricity: 180,
    lpgYearly: 7
  }
};

const SYSTEM_PROMPT = `
You are EcoBuddy — a personalised carbon footprint reduction coach.

Here is the user's real data:
{{USER_DATA}}

Rules:
- Give specific, personalised suggestions.
- No generic advice.
- Keep tips achievable in India.
- Use small emojis 🌱🌍.
- Show numbers (e.g., "save 0.4kg CO₂/day").
- Consider their travel, food, energy, and shopping habits.
- Always stay friendly and encouraging.
`;


// --- CONFIGURATION ---
// WARNING: In a production app, restrict this key in Google Cloud Console to your Android/iOS bundle IDs.
const GEMINI_API_KEY = "AIzaSyAPKPMiher8b0eDn_yjG47FkPF5H75FmiQ"; // Your key
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// Define the bot's persona (System Instruction)
// NOTE: This persona is currently UNUSED because the API call is simplified and does not send generationConfig.
const ECOBUDDY_PERSONA = "You are EcoBuddy, a friendly, encouraging, and knowledgeable AI assistant focused on helping the user track and reduce their carbon footprint. Your responses should be short, practical, and enthusiastic, using emojis related to nature and sustainability (🌱, 🌳, 🌍). Never use overly complex technical jargon.";

// --- PROFESSIONAL THEME CONFIGURATION ---
const THEME = {
  primary: "#2E7D32", // Forest Green
  primaryLight: "#E8F5E9", // Light Mint
  accent: "#FFB74D", // Soft Orange for highlights
  background: "#F4F6F4", // Very light grey/green tint
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#757575",
  border: "#E0E0E0",
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  }
};

const Coach = ({ user, onLogout }) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef();

  // State Management
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Initial Chat Data & History
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello Sarah! 🌱 I'm EcoBuddy. Ready to make today greener?",
      isBot: true,
      timestamp: "9:30 AM",
      role: 'model',
    },
    {
      id: 2,
      text: "You've saved 4.2 kg CO₂ today! That's like planting 2 trees. 🌳",
      isBot: true,
      timestamp: "9:30 AM",
      role: 'model',
    },
  ]);

  const dailyTips = [
    {
      id: 1,
      category: "Travel",
      title: "Walk vs Drive",
      tip: "8km by bus saved you 1.2kg CO₂.",
      icon: "walk",
      color: "#43A047",
    },
    {
      id: 2,
      category: "Diet",
      title: "Veggie Meal",
      tip: "Try a meat-free lunch today.",
      icon: "food-apple-outline",
      color: "#FB8C00",
    },
    {
      id: 3,
      category: "Energy",
      title: "Power Down",
      tip: "Unplug devices not in use.",
      icon: "lightning-bolt-outline",
      color: "#FDD835",
    },
  ];

  const quickReplies = [
    "📉 Reduce my footprint",
    "📊 Weekly Progress",
    "🔥 Today's Challenge",
    "🚲 Sustainable Travel",
  ];

  // Scroll to bottom helper
  const scrollToBottom = () => {
    // Only scroll after state update triggers rendering
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // --- BACKEND LOGIC (DIRECT GEMINI API CALL) ---
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      isBot: false,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      role: "user",
    };

    // Add user message
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);
    scrollToBottom();

    try {
      // --- PERSONALIZED API CALL ---
      const response = await axios({
        url: GEMINI_URL,
        method: "post",
        data: {
          contents: [
            {
              role: "user",
              parts: [{
                text:
                  SYSTEM_PROMPT.replace("{{USER_DATA}}", JSON.stringify(USER_DATA, null, 2)) +
                  "\n\nConversation so far:\n" +
                  messages.map(m => `${m.role}: ${m.text}`).join("\n") +
                  `\n\nUser: ${userMessage.text}`
              }]
            }
          ]
        }

      });

      const botReply = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!botReply) throw new Error("Empty Gemini response.");

      const botMessage = {
        id: Date.now() + 1,
        text: botReply,
        isBot: true,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        role: "model",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Gemini Error:", error);

      const errorMessage = {
        id: Date.now() + 2,
        text: "⚠️ EcoBuddy is having trouble connecting. Please check your API key or network.",
        isBot: true,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        role: "model",
      };

      setMessages((prev) => [...prev, errorMessage]);

    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  // --- RENDER FUNCTIONS ---

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      <View style={styles.headerContent}>
        <View style={styles.avatarContainer}>
          <MaterialCommunityIcons name="leaf" size={24} color={THEME.surface} />
        </View>
        <View>
          <Text style={styles.headerTitle}>EcoBuddy</Text>
          <View style={styles.statusContainer}>
            <View style={styles.statusDot} />
            <Text style={styles.headerSubtitle}>Active • Tracking CO₂</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.iconButton} onPress={onLogout}>
        <MaterialCommunityIcons name="logout" size={24} color={THEME.textMain} />
      </TouchableOpacity>
    </View>
  );

  const renderDailyTips = () => (
    <View style={styles.insightsContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Daily Insights</Text>
        <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color={THEME.accent} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
        {dailyTips.map((tip) => (
          <TouchableOpacity key={tip.id} style={styles.tipCard}>
            <View style={[styles.tipIcon, { backgroundColor: tip.color + '20' }]}>
              <MaterialCommunityIcons name={tip.icon} size={22} color={tip.color} />
            </View>
            <Text style={styles.tipCategory}>{tip.category}</Text>
            <Text style={styles.tipText} numberOfLines={3}>{tip.tip}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderMessage = (msg) => {
    if (msg.isBot) {
      return (
        <View key={msg.id} style={styles.botMessageRow}>
          <View style={styles.botAvatarSmall}>
            <MaterialCommunityIcons name="robot" size={16} color={THEME.primary} />
          </View>
          <View>
            <View style={styles.botBubble}>
              <Text style={styles.botText}>{msg.text}</Text>
            </View>
            <Text style={styles.timestampLeft}>{msg.timestamp}</Text>
          </View>
        </View>
      );
    }
    return (
      <View key={msg.id} style={styles.userMessageRow}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{msg.text}</Text>
        </View>
        <Text style={styles.timestampRight}>{msg.timestamp}</Text>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.botMessageRow}>
        <View style={styles.botAvatarSmall}>
          <MaterialCommunityIcons name="robot" size={16} color={THEME.primary} />
        </View>
        <View style={styles.typingBubble}>
          <ActivityIndicator size="small" color={THEME.primary} />
        </View>
      </View>
    );
  };

  const renderQuickReplies = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.quickReplyContainer}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10 }}
    >
      {quickReplies.map((reply, idx) => (
        <TouchableOpacity
          key={idx}
          onPress={() => setMessage(reply)}
          style={styles.quickReplyChip}
        >
          <Text style={styles.quickReplyText}>{reply}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <StatusBar barStyle="dark-content" backgroundColor={THEME.surface} />

      {/* Top Header */}
      {renderHeader()}

      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Sticky-ish Insights at top of scroll */}
        {renderDailyTips()}

        <View style={styles.divider}>
          <Text style={styles.dividerText}>Today</Text>
        </View>

        {/* Chat Messages */}
        <View style={styles.messageList}>
          {messages.map(renderMessage)}
          {renderTypingIndicator()}
        </View>
      </ScrollView>

      {/* Input Area */}
      <View style={[styles.inputWrapper, { paddingBottom: insets.bottom > 0 ? insets.bottom : 10 }]}>
        {renderQuickReplies()}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask EcoBuddy..."
            placeholderTextColor={THEME.textSecondary}
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity
            disabled={!message.trim() || isLoading}
            onPress={handleSendMessage}
            style={[
              styles.sendButton,
              { backgroundColor: (message.trim() && !isLoading) ? THEME.primary : THEME.border }
            ]}
          >
            <MaterialCommunityIcons
              name="arrow-up"
              size={24}
              color={(message.trim() && !isLoading) ? "#FFF" : "#FFF"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

// --- STYLES (omitted for brevity, no changes) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },

  // Header
  header: {
    backgroundColor: THEME.surface,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    ...THEME.shadow,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.textMain,
    letterSpacing: 0.5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  headerSubtitle: {
    fontSize: 12,
    color: THEME.textSecondary,
    fontWeight: '500',
  },
  iconButton: {
    padding: 8,
  },

  // Insights
  insightsContainer: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textMain,
    marginRight: 8,
  },
  tipCard: {
    backgroundColor: THEME.surface,
    width: 140,
    height: 150,
    borderRadius: 20,
    padding: 12,
    marginLeft: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...THEME.shadow,
    justifyContent: 'space-between',
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipCategory: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textSecondary,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  tipText: {
    fontSize: 13,
    color: THEME.textMain,
    fontWeight: '500',
    lineHeight: 18,
  },

  // Chat Layout
  chatContainer: {
    flex: 1,
  },
  divider: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerText: {
    fontSize: 12,
    color: '#9E9E9E',
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  messageList: {
    paddingHorizontal: 16,
  },

  // Bot Messages
  botMessageRow: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  botAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 18, // Align with text, not timestamp
  },
  botBubble: {
    backgroundColor: THEME.surface,
    padding: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 4,
    ...THEME.shadow,
  },
  botText: {
    fontSize: 15,
    color: THEME.textMain,
    lineHeight: 22,
  },
  timestampLeft: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    marginLeft: 4,
  },

  // User Messages
  userMessageRow: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    alignItems: 'flex-end',
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: THEME.primary,
    padding: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  userText: {
    fontSize: 15,
    color: '#FFF',
    lineHeight: 22,
  },
  timestampRight: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    marginRight: 4,
  },

  // Typing Indicator
  typingBubble: {
    backgroundColor: THEME.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 4,
    ...THEME.shadow,
  },

  // Input Section
  inputWrapper: {
    backgroundColor: THEME.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  quickReplyContainer: {
    marginTop: 12,
    marginBottom: 4,
  },
  quickReplyChip: {
    backgroundColor: THEME.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.1)',
  },
  quickReplyText: {
    color: THEME.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    maxHeight: 100,
    fontSize: 16,
    color: THEME.textMain,
    marginRight: 12,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Coach;