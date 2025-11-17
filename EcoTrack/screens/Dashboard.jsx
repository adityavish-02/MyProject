import React, { useState, useEffect } from "react";
import { useAppTheme } from "../android/app/utils/theme";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  StyleSheet, // 1. IMPORT STYLESHEET
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/Feather";

const { width } = Dimensions.get("window");

// 2. ACCEPT THE 'navigation' PROP
const Dashboard = ({ }) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();

  const [treeGrowth] = useState(new Animated.Value(0.7));
  const [dailyQuote, setDailyQuote] = useState("");

  // (All your existing state and data is here)
  const userData = {
    name: "Sarah",
    level: 3,
    xp: 1250,
    xpToNext: 500,
    todayFootprint: 4.2,
    weeklyAverage: 5.1,
    streak: 12,
    badges: ["Eco Starter", "Green Commuter"],
    rank: 15,
  };

  const ecoQuotes = [
    "The Earth does not belong to us; we belong to the Earth. 🌍",
    "Small acts, multiplied by millions, can transform the world. 🌱",
    "Be the change you wish to see in the world. 💚",
    "Every day is Earth Day when you live sustainably. 🌿",
    "The future depends on what you do today. 🌟",
  ];

  useEffect(() => {
    const today = new Date().getDate();
    setDailyQuote(ecoQuotes[today % ecoQuotes.length]);
  }, []);

  // 3. ADD THE NEW APP HEADER (WITH MENU BUTTON)
  

  // ---------- "Hello Sarah" HEADER ----------
  const renderHeader = () => (
    <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "600", color: colors.primary }}>
        Hello, {userData.name} 👋
      </Text>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "400",
          color: colors.secondary,
          marginTop: 4,
        }}
      >
        {dailyQuote}
      </Text>
    </View>
  );

  // ---------- TREE VISUAL ----------
  const renderTreeVisualization = () => (
    <View
      style={{
        marginHorizontal: 20,
        backgroundColor: colors.greenLight,
        borderRadius: 24,
        padding: 24,
        alignItems: "center",
        marginBottom: 20,
      }}
    >
      <View
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: colors.surface,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 16,
          elevation: 8,
        }}
      >
        <MaterialCommunityIcons name="award" size={60} color={colors.green} />
      </View>
      <Text style={{ fontSize: 18, fontWeight: "600", color: colors.primary }}>
        Your Eco Tree
      </Text>
      <Text style={{ fontSize: 14, color: colors.secondary }}>
        Level {userData.level} • {userData.xp}/{userData.xp + userData.xpToNext} XP
      </Text>
      <View
        style={{
          width: "100%",
          height: 8,
          backgroundColor: colors.border,
          borderRadius: 4,
          marginTop: 12,
        }}
      >
        <View
          style={{
            width: `${(userData.xp /
              (userData.xp + userData.xpToNext)) *
              100}%`,
            height: "100%",
            backgroundColor: colors.green,
            borderRadius: 4,
          }}
        />
      </View>
    </View>
  );

  // ---------- TODAY STATS ----------
  const renderTodayStats = () => (
    <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "600", color: colors.primary }}>
        Today’s Impact
      </Text>
      <View style={{ flexDirection: "row", marginTop: 16, gap: 12 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialCommunityIcons name="leaf" size={20} color={colors.green} />
            <Text
              style={{
                marginLeft: 8,
                fontSize: 14,
                color: colors.secondary,
              }}
            >
              Carbon Footprint
            </Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: "600", color: colors.primary }}>
            {userData.todayFootprint}{" "}
            <Text style={{ fontSize: 14 }}>kg CO₂</Text>
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialCommunityIcons name="target" size={20} color={colors.orange} />
            <Text
              style={{
                marginLeft: 8,
                fontSize: 14,
                color: colors.secondary,
              }}
            >
              Daily Streak
            </Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: "600", color: colors.primary }}>
            {userData.streak}
            <Text style={{ fontSize: 14 }}> days</Text>
          </Text>
        </View>
      </View>
    </View>
  );

  // ---------- QUICK ACTIONS ----------
  const renderQuickActions = () => (
    <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "600", color: colors.primary }}>
        Quick Actions
      </Text>
      <View style={{ flexDirection: "row", marginTop: 16, gap: 12 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: colors.blueLight,
            borderRadius: 16,
            padding: 16,
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons name="zap" size={24} color={colors.blue} />
          <Text style={{ marginTop: 8, color: colors.primary }}>Log Energy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: colors.orangeLight,
            borderRadius: 16,
            padding: 16,
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons name="truck" size={24} color={colors.orange} />
          <Text style={{ marginTop: 8, color: colors.primary }}>Track Travel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: colors.yellowLight,
            borderRadius: 16,
            padding: 16,
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons name="package" size={24} color={colors.yellow} />
          <Text style={{ marginTop: 8, color: colors.primary }}>Add Meal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ---------- BADGES ----------
  const renderBadges = () => (
    <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "600", color: colors.primary }}>
        Recent Achievements
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }}>
        {userData.badges.map((badge, index) => (
          <View
            key={index}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              marginRight: 12,
              alignItems: "center",
              minWidth: 100,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <MaterialCommunityIcons name="award" size={24} color={colors.gold} />
            <Text style={{ marginTop: 8, color: colors.primary }}>{badge}</Text>
          </View>
        ))}
        <TouchableOpacity
          style={{
            backgroundColor: colors.surfaceVariant,
            borderRadius: 16,
            padding: 16,
            alignItems: "center",
            minWidth: 100,
            borderWidth: 1,
            borderColor: colors.border,
            borderStyle: "dashed",
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons name="star" size={24} color={colors.placeholder} />
          <Text style={{ marginTop: 8, color: colors.placeholder }}>Next Badge</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // ---------- WEEKLY PROGRESS ----------
  const renderWeeklyProgress = () => (
    <View style={{ marginHorizontal: 20 }}>
      <TouchableOpacity
        style={{
          backgroundColor: colors.surface,
          borderRadius: 20,
          padding: 20,
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.primary }}>
            Weekly Progress
          </Text>
          <Text style={{ fontSize: 14, color: colors.secondary }}>
            Avg: {userData.weeklyAverage} kg CO₂/day
          </Text>
          <Text style={{ fontSize: 12, color: colors.success, marginTop: 4 }}>
            18% below target 📉
          </Text>
        </View>
        <MaterialCommunityIcons name="trending-down" size={32} color={colors.green} />
      </TouchableOpacity>
    </View>
  );

  // ---------- MAIN UI ----------
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* 4. CALL THE NEW HEADER */}
      

      <ScrollView
        paddingTop={insets.top} // KEEP THIS PADDING TOP HERE
        style={{ flex: 1 }}
        contentContainerStyle={{
          // 5. REMOVED paddingTop: insets.top FROM HERE
          paddingBottom: 100, // Make sure padding is high enough
        }}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderTreeVisualization()}
        {renderTodayStats()}
        {renderQuickActions()}
        {renderBadges()}
        {renderWeeklyProgress()}
      </ScrollView>
    </View>
  );
}

// 6. ADD THE NEW STYLES


export default Dashboard;