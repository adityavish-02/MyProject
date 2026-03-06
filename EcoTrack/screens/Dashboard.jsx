import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { useAppTheme } from "../android/app/utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";

// --- FIREBASE IMPORTS (NATIVE SDK) ---
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const Dashboard = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();

  const [user, setUser] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dailyQuote, setDailyQuote] = useState("");

  // New state to hold the real-time aggregated totals for today
  const [dailyEmissions, setDailyEmissions] = useState({
    travel: 0,
    energy: 0,
    diet: 0,
  });

  // Main Dashboard Data Structure, now includes live XP and Footprint
  const [dashboardData, setDashboardData] = useState({
    name: "TestUser", 
    level: 1,
    xp: 0,
    xpToNext: 500,
    todayFootprint: 0, // This will be calculated from dailyEmissions
    weeklyAverage: 5.1,
    streak: 12,
    badges: ["Eco Starter", "Green Commuter"],
    rank: 15,
  });

  const ecoQuotes = [
    "The Earth does not belong to us; we belong to the Earth. 🌍",
    "Small acts, multiplied by millions, can transform the world. 🌱",
    "Be the change you wish to see in the world. 💚",
    "Every day is Earth Day when you live sustainably. 🌿",
    "The future depends on what you do today. 🌟",
  ];

  // Helper to determine the start and end of "today" in Firestore timestamps
  const getTodayRange = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);
    
    return { 
        startTimestamp: firestore.Timestamp.fromDate(start), 
        endTimestamp: firestore.Timestamp.fromDate(end) 
    };
  };

  // --- 1. Calculate Total Footprint from Aggregated Emissions ---
  useEffect(() => {
    const total = dailyEmissions.travel + dailyEmissions.energy + dailyEmissions.diet;
    setDashboardData(prevData => ({
        ...prevData,
        todayFootprint: parseFloat(total.toFixed(2)),
    }));
  }, [dailyEmissions]);


  // --- 2. Auth & Data Listeners ---
  useEffect(() => {
    const today = new Date().getDate();
    setDailyQuote(ecoQuotes[today % ecoQuotes.length]);
    
    // Auth Listener
    const authSubscriber = auth().onAuthStateChanged((u) => {
        setUser(u);
        if (!u && !auth().currentUser) {
            auth().signInAnonymously().catch(error => {
                console.error("Auth failed:", error);
            });
        }
    });

    return () => authSubscriber(); 
  }, []);
  
  // 3. Firestore Listeners (XP and Daily Logs)
  useEffect(() => {
    if (!user) {
        setIsDataLoading(true);
        return;
    }

    const userId = user.uid;
    const userDocRef = firestore().collection('users').doc(userId);
    const { startTimestamp, endTimestamp } = getTodayRange();
    let unsubscribes = [];

    // --- A. XP/Level Listener ---
    const unsubscribeXP = userDocRef.onSnapshot(docSnapshot => {
      setIsDataLoading(false);
      if (docSnapshot.exists) {
        const data = docSnapshot.data();
        setDashboardData(prevData => ({
          ...prevData,
          level: data.level || 1, 
          xp: data.xp || 0,      
        }));
      } else {
         // Create initial document if missing
         userDocRef.set({ xp: 0, level: 1, xpToNext: 500, name: dashboardData.name }, { merge: true });
      }
    }, error => {
      console.error("Firestore XP snapshot error:", error);
    });
    unsubscribes.push(unsubscribeXP);
    
    // --- B. Real-time Daily Log Listeners ---
    const logCollections = [
        { name: 'travel_logs', key: 'travel' },
        { name: 'energy_logs', key: 'energy' },
        { name: 'diet_logs', key: 'diet' },
    ];

    const setupLogListeners = () => {
        const listeners = logCollections.map(collection => {
            const logQuery = userDocRef
                .collection(collection.name)
                .where('createdAt', '>=', startTimestamp)
                .where('createdAt', '<=', endTimestamp);
                
            const unsubscribe = logQuery.onSnapshot(snapshot => {
                // Calculate the sum of emissions for this specific collection
                const totalEmissions = snapshot.docs.reduce((sum, doc) => {
                    return sum + (doc.data().emissions || 0);
                }, 0);
                
                // Update the state for this category's total emission
                // This triggers the first useEffect to recalculate the grand total
                setDailyEmissions(prev => ({
                    ...prev,
                    [collection.key]: totalEmissions,
                }));
            }, error => {
                console.error(`Firestore ${collection.name} listener error:`, error);
            });
            return unsubscribe;
        });
        return listeners;
    };
    
    const logUnsubscribers = setupLogListeners();
    unsubscribes.push(...logUnsubscribers);

    return () => unsubscribes.forEach(unsub => unsub()); // Cleanup all listeners

  }, [user]); // Re-run when user changes

  // ---------- RENDER FUNCTIONS (Uses live data) ----------

  const renderHeader = () => (
    <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "600", color: colors.primary }}>
        Hello, {dashboardData.name} 👋
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

  const renderTreeVisualization = () => {
    // Calculate progress (handle potential division by zero)
    const totalXPForLevel = dashboardData.xpToNext;
    const currentLevelXP = dashboardData.xp % dashboardData.xpToNext; 
    const progress = (currentLevelXP / totalXPForLevel) || 0;
    const progressWidth = `${progress * 100}%`;

    return (
      <View
        style={{
          marginHorizontal: 20,
          backgroundColor: colors.greenLight || '#E8F5E9',
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
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          }}
        >
          <Icon name="award" size={60} color={colors.green || '#2E7D32'} />
        </View>
        <Text style={{ fontSize: 18, fontWeight: "600", color: colors.primary }}>
          Your Eco Tree
        </Text>
        <Text style={{ fontSize: 14, color: colors.secondary }}>
          Level {dashboardData.level} • {currentLevelXP}/{totalXPForLevel} XP to next level
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
              width: progressWidth,
              height: "100%",
              backgroundColor: colors.green || '#2E7D32',
              borderRadius: 4,
            }}
          />
        </View>
      </View>
    );
  };

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
            <Icon name="feather" size={20} color={colors.green} />
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
            {dashboardData.todayFootprint.toFixed(2)}{" "}
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
            <Icon name="target" size={20} color={colors.orange || '#FFA726'} />
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
            {dashboardData.streak}
            <Text style={{ fontSize: 14 }}> days</Text>
          </Text>
        </View>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "600", color: colors.primary }}>
        Quick Actions
      </Text>
      <View style={{ flexDirection: "row", marginTop: 16, gap: 12 }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Track')} // Example Navigation
          style={{
            flex: 1,
            backgroundColor: colors.blueLight || '#E3F2FD',
            borderRadius: 16,
            padding: 16,
            alignItems: "center",
          }}
        >
          <Icon name="zap" size={24} color={colors.blue || '#42A5F5'} />
          <Text style={{ marginTop: 8, color: colors.primary, fontSize: 12 }}>Log Energy</Text>
        </TouchableOpacity>
        <TouchableOpacity
           onPress={() => navigation.navigate('Track')}
          style={{
            flex: 1,
            backgroundColor: colors.orangeLight || '#FFF3E0',
            borderRadius: 16,
            padding: 16,
            alignItems: "center",
          }}
        >
          <Icon name="truck" size={24} color={colors.orange || '#FFA726'} />
          <Text style={{ marginTop: 8, color: colors.primary, fontSize: 12 }}>Track Travel</Text>
        </TouchableOpacity>
        <TouchableOpacity
           onPress={() => navigation.navigate('Track')}
          style={{
            flex: 1,
            backgroundColor: colors.yellowLight || '#FFFDE7',
            borderRadius: 16,
            padding: 16,
            alignItems: "center",
          }}
        >
          <Icon name="package" size={24} color={colors.yellow || '#FDD835'} />
          <Text style={{ marginTop: 8, color: colors.primary, fontSize: 12 }}>Add Meal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBadges = () => (
    <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "600", color: colors.primary }}>
        Recent Achievements
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }}>
        {dashboardData.badges.map((badge, index) => (
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
            <Icon name="award" size={24} color={colors.gold || '#FFD700'} />
            <Text style={{ marginTop: 8, color: colors.primary, fontSize: 12 }}>{badge}</Text>
          </View>
        ))}
        <TouchableOpacity
          style={{
            backgroundColor: colors.surfaceVariant || '#F5F5F5',
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
          <Icon name="star" size={24} color={colors.placeholder || '#B0BEC5'} />
          <Text style={{ marginTop: 8, color: colors.placeholder || '#B0BEC5', fontSize: 12 }}>Next Badge</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

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
            Avg: {dashboardData.weeklyAverage} kg CO₂/day
          </Text>
          <Text style={{ fontSize: 12, color: colors.success || '#4CAF50', marginTop: 4 }}>
            18% below target 📉
          </Text>
        </View>
        <Icon name="trending-down" size={32} color={colors.green || '#4CAF50'} />
      </TouchableOpacity>
    </View>
  );

  if (isDataLoading) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
             <ActivityIndicator size="large" color={colors.primary} />
             <Text style={{marginTop: 10, color: colors.secondary}}>Loading Eco Profile...</Text>
        </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top,
          paddingBottom: 100,
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
};

export default Dashboard;