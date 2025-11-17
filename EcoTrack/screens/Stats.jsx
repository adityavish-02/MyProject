import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/Feather";
import { useAppTheme } from "../android/app/utils/theme";   // IMPORTANT: correct CLI import

const { width } = Dimensions.get("window");

 function Stats() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  // Sample weekly stats
  const weeklyData = [
    { day: "Mon", value: 5.2 },
    { day: "Tue", value: 4.8 },
    { day: "Wed", value: 4.2 },
    { day: "Thu", value: 3.9 },
    { day: "Fri", value: 4.5 },
    { day: "Sat", value: 3.1 },
    { day: "Sun", value: 2.8 },
  ];

  const categoryBreakdown = [
    { category: "Transport", amount: 12.4, percentage: 45, icon: "car", color: colors.blue },
    { category: "Energy", amount: 8.7, percentage: 32, icon: "flash", color: colors.yellow },
    { category: "Diet", amount: 6.3, percentage: 23, icon: "silverware", color: colors.green },
  ];

  const achievements = [
    {
      title: "Best Week Ever!",
      description: "Lowest weekly footprint: 27.5 kg CO₂",
      date: "This Week",
      icon: "trend-down",
      color: colors.success,
    },
    {
      title: "Green Streak",
      description: "15 consecutive days below target",
      date: "Nov 15",
      icon: "target",
      color: colors.green,
    },
    {
      title: "Eco Milestone",
      description: "Saved 100 kg CO₂ this month",
      date: "Nov 10",
      icon: "leaf",
      color: colors.orange,
    },
  ];

  const maxValue = Math.max(...weeklyData.map((d) => d.value));

  //------------------------------ HEADER ------------------------------
  const renderHeader = () => (
    <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "600", color: colors.primary }}>
        Your Carbon Stats 📊
      </Text>
      <Text style={{ fontSize: 14, color: colors.secondary }}>
        Track your environmental impact over time
      </Text>
    </View>
  );

  //------------------------------ PERIOD SELECTOR ------------------------------
  const renderPeriodSelector = () => (
    <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 4,
        }}
      >
        {["week", "month", "year"].map((period) => (
          <TouchableOpacity
            key={period}
            onPress={() => setSelectedPeriod(period)}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 8,
              backgroundColor: selectedPeriod === period ? colors.green : "transparent",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: selectedPeriod === period ? "#fff" : colors.secondary,
                textAlign: "center",
              }}
            >
              {period.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  //------------------------------ OVERVIEW CARDS ------------------------------
  const renderOverviewCards = () => (
    <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
        {/* This Week */}
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
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <MaterialCommunityIcons name="leaf" size={20} color={colors.green} />
            <Text style={{ marginLeft: 8, color: colors.secondary }}>This Week</Text>
          </View>

          <Text style={{ fontSize: 24, fontWeight: "600", color: colors.primary }}>
            27.5 <Text style={{ fontSize: 14 }}>kg CO₂</Text>
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
            <MaterialCommunityIcons name="trending-down" size={12} color={colors.success} />
            <Text style={{ marginLeft: 4, color: colors.success }}>18% below target</Text>
          </View>
        </View>

        {/* Monthly Goal */}
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
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <MaterialCommunityIcons name="target" size={20} color={colors.blue} />
            <Text style={{ marginLeft: 8, color: colors.secondary }}>Monthly Goal</Text>
          </View>

          <Text style={{ fontSize: 24, fontWeight: "600", color: colors.primary }}>
            85%
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
            <MaterialCommunityIcons name="trending-up" size={12} color={colors.success} />
            <Text style={{ marginLeft: 4, color: colors.success }}>On track!</Text>
          </View>
        </View>
      </View>
    </View>
  );

  //------------------------------ CHART ------------------------------
  const renderChart = () => (
    <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "600", color: colors.primary, marginBottom: 16 }}>
        Daily Carbon Footprint
      </Text>

      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-between",
            height: 120,
            marginBottom: 16,
          }}
        >
          {weeklyData.map((item, index) => {
            const height = (item.value / maxValue) * 100;
            const isToday = item.day === "Wed";

            return (
              <View key={index} style={{ alignItems: "center", flex: 1 }}>
                <View
                  style={{
                    width: 20,
                    height: `${height}%`,
                    backgroundColor: isToday ? colors.green : colors.greenLight,
                    borderRadius: 10,
                    marginBottom: 8,
                  }}
                />
                <Text style={{ color: isToday ? colors.primary : colors.secondary }}>
                  {item.day}
                </Text>
                <Text style={{ fontSize: 10, color: colors.secondary }}>{item.value}</Text>
              </View>
            );
          })}
        </View>

        <Text style={{ textAlign: "center", color: colors.secondary }}>
          Average: 3.9 kg/day • Target: 5.0
        </Text>
      </View>
    </View>
  );

  //------------------------------ CATEGORY BREAKDOWN ------------------------------
  const renderCategoryBreakdown = () => (
    <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "600", color: colors.primary, marginBottom: 16 }}>
        Category Breakdown
      </Text>

      {categoryBreakdown.map((cat, idx) => (
        <View
          key={idx}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: `${cat.color}20`,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                {/* <MaterialCommunityIcons name={cat.icon} size={18} color={cat.color} /> */}
              </View>

              <Text style={{ fontSize: 16, fontWeight: "600", color: colors.primary }}>
                {cat.category}
              </Text>
            </View>

            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.primary }}>
              {cat.amount} kg
            </Text>
          </View>

          {/* Bar */}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
            <View
              style={{
                flex: 1,
                height: 6,
                backgroundColor: colors.border,
                borderRadius: 3,
                marginRight: 12,
              }}
            >
              <View
                style={{
                  width: `${cat.percentage}%`,
                  backgroundColor: cat.color,
                  height: "100%",
                  borderRadius: 3,
                }}
              />
            </View>
            <Text style={{ fontSize: 12, color: colors.secondary }}>{cat.percentage}%</Text>
          </View>
        </View>
      ))}
    </View>
  );

  //------------------------------ ACHIEVEMENTS ------------------------------
  const renderAchievements = () => (
    <View style={{ paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "600", color: colors.primary, marginBottom: 16 }}>
        Recent Achievements 🏆
      </Text>

      {achievements.map((a, idx) => (
        <View
          key={idx}
          style={{
            backgroundColor: colors.surface,
            padding: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: "row" }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: `${a.color}20`,
                marginRight: 12,
              }}
            >
              {/* <MaterialCommunityIcons name={a.icon} size={20} color={a.color} /> */}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "600", color: colors.primary }}>
                {a.title}
              </Text>
              <Text style={{ fontSize: 14, color: colors.secondary }}>{a.description}</Text>
              <Text style={{ fontSize: 12, color: a.color }}>{a.date}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  //-----------------------------------------------------------------------

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderPeriodSelector()}
        {renderOverviewCards()}
        {renderChart()}
        {renderCategoryBreakdown()}
        {renderAchievements()}
      </ScrollView>
    </View>
  );
}
export default Stats;
