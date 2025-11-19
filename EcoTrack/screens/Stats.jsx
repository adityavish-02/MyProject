import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "react-native-vector-icons/Feather";
import { useAppTheme } from "../android/app/utils/theme";

const { width } = Dimensions.get("window");

function Stats() {
  // --- All Hooks must be defined at the top level, unconditionally. ---
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [isLoading, setIsLoading] = useState(false);
  // -------------------------------------------------------------------

  // Sample weekly stats (3.5 kg is average target)
  const weeklyData = [
    { day: "M", value: 5.2, status: 'over' },
    { day: "T", value: 3.5, status: 'on' },
    { day: "W", value: 4.2, status: 'over' },
    { day: "T", value: 3.9, status: 'over' },
    { day: "F", value: 2.8, status: 'under' },
    { day: "S", value: 3.1, status: 'under' },
    { day: "S", value: 2.5, status: 'under' },
  ];

  const categoryBreakdown = [
    { category: "Transport", amount: 12.4, percentage: 45, icon: "truck", color: colors.blue },
    { category: "Energy", amount: 8.7, percentage: 32, icon: "zap", color: colors.orange },
    { category: "Diet", amount: 6.3, percentage: 23, icon: "coffee", color: colors.green },
  ];

  const achievements = [
    {
      title: "Best Week Ever!",
      description: "Lowest weekly footprint: 27.5 kg CO₂",
      date: "This Week",
      icon: "trending-down",
      color: colors.success,
      accent: colors.green,
    },
    {
      title: "Green Streak",
      description: "15 consecutive days below target",
      date: "Nov 15",
      icon: "target",
      color: colors.gold,
      accent: colors.yellow,
    },
    {
      title: "Eco Milestone",
      description: "Reduced 100 kg CO₂ total",
      date: "Nov 10",
      icon: "leaf",
      color: colors.tertiary,
      accent: colors.secondary,
    },
  ];

  const maxValue = Math.max(...weeklyData.map((d) => d.value), 5.5); // Max 5.5 for scaling

  // ------------------------------ HEADER ------------------------------
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={[styles.title, { color: colors.primary }]}>
        Carbon Footprint Dashboard
      </Text>
      <Text style={[styles.subtitle, { color: colors.secondary }]}>
        Analyze your impact and celebrate your progress
      </Text>
    </View>
  );

  // ------------------------------ PERIOD SELECTOR ------------------------------
  const renderPeriodSelector = () => (
    <View style={styles.periodSelectorWrapper}>
      <View
        style={[
          styles.periodSelectorBar,
          { backgroundColor: colors.surfaceVariant, borderColor: colors.borderLight },
        ]}
      >
        {["week", "month", "year"].map((period) => {
          const isSelected = selectedPeriod === period;
          return (
            <TouchableOpacity
              key={period}
              onPress={() => setSelectedPeriod(period)}
              style={[
                styles.periodButton,
                isSelected && { backgroundColor: colors.green },
              ]}
            >
              <Text
                style={[
                  styles.periodText,
                  { color: isSelected ? colors.surface : colors.primary },
                ]}
              >
                {period.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // ------------------------------ OVERVIEW CARDS ------------------------------
  const renderOverviewCards = () => (
    <View style={styles.cardRow}>
      {/* This Week */}
      <View style={[styles.overviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.overviewCardHeader}>
          <Feather name="bar-chart" size={20} color={colors.green} />
          <Text style={[styles.overviewCardSubtitle, { color: colors.secondary }]}>Total {selectedPeriod.toUpperCase()}</Text>
        </View>

        <Text style={[styles.overviewCardValue, { color: colors.primary }]}>
          27.5 <Text style={styles.unitText}>kg CO₂</Text>
        </Text>

        <View style={styles.overviewCardFooter}>
          <Feather name="arrow-down-right" size={14} color={colors.success} />
          <Text style={[styles.overviewCardTrend, { color: colors.success }]}>18% below target</Text>
        </View>
      </View>

      {/* Monthly Goal */}
      <View style={[styles.overviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.overviewCardHeader}>
          <Feather name="target" size={20} color={colors.blue} />
          <Text style={[styles.overviewCardSubtitle, { color: colors.secondary }]}>Monthly Goal Status</Text>
        </View>

        <Text style={[styles.overviewCardValue, { color: colors.primary }]}>
          85%
        </Text>

        <View style={styles.overviewCardFooter}>
          <Feather name="check-circle" size={14} color={colors.success} />
          <Text style={[styles.overviewCardTrend, { color: colors.success }]}>On track!</Text>
        </View>
      </View>
    </View>
  );

  // ------------------------------ CHART ------------------------------
  const getBarColor = (status) => {
    switch (status) {
      case 'over': return colors.error; // Red/error for exceeding target
      case 'under': return colors.success; // Green for under target
      case 'on': return colors.blue; // Blue for hitting target
      default: return colors.secondary;
    }
  };

  const renderChart = () => (
    <View style={styles.chartWrapper}>
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>
        Daily Footprint (kg CO₂)
      </Text>

      <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.barContainer}>
          {/* Target Line (Dotted) */}
          <View style={[styles.targetLine, { borderColor: colors.tertiary }]}>
            <Text style={[styles.targetLabel, { color: colors.tertiary }]}>Avg Target 3.5</Text>
          </View>

          {weeklyData.map((item, index) => {
            const height = (item.value / maxValue) * 100;
            const barColor = getBarColor(item.status);

            return (
              <View key={index} style={styles.barColumn}>
                <View style={[styles.barValueWrapper, { top: `${100 - height}%` }]}>
                  <Text style={[styles.barValueText, { color: colors.primary }]}>
                    {item.value.toFixed(1)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${height}%`,
                      backgroundColor: barColor,
                    },
                  ]}
                />
                <Text style={[styles.barLabel, { color: colors.secondary, fontWeight: '600' }]}>
                  {item.day}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.chartFooter}>
          <Text style={[styles.chartFooterText, { color: colors.secondary }]}>
            Current {selectedPeriod} Average: 3.8 kg CO₂
          </Text>
        </View>
      </View>
    </View>
  );

  // ------------------------------ CATEGORY BREAKDOWN ------------------------------
  const renderCategoryBreakdown = () => (
    <View style={styles.breakdownWrapper}>
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>
        Category Breakdown
      </Text>

      {categoryBreakdown.map((cat, idx) => (
        <View
          key={idx}
          style={[styles.breakdownCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={styles.breakdownHeader}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: cat.color + '20' }, // 20% opacity
              ]}
            >
              <Feather name={cat.icon} size={20} color={cat.color} />
            </View>

            <View style={styles.breakdownTextGroup}>
              <Text style={[styles.breakdownCategory, { color: colors.primary }]}>
                {cat.category}
              </Text>
              <Text style={[styles.breakdownAmount, { color: colors.primary }]}>
                {cat.amount} kg CO₂
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarWrapper}>
            <View
              style={[
                styles.progressBarTrack,
                { backgroundColor: colors.borderLight },
              ]}
            >
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${cat.percentage}%`,
                    backgroundColor: cat.color,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressBarPercent, { color: colors.secondary }]}>{cat.percentage}%</Text>
          </View>
        </View>
      ))}
    </View>
  );

  // ------------------------------ ACHIEVEMENTS ------------------------------
  const renderAchievements = () => (
    <View style={styles.achievementsWrapper}>
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>
        Recent Achievements 🏅
      </Text>

      {achievements.map((a, idx) => (
        <View
          key={idx}
          style={[styles.achievementCard, { backgroundColor: colors.surface, borderColor: a.accent + '30' }]}
        >
          <View
            style={[
              styles.achievementIconCircle,
              { backgroundColor: a.accent + '20' },
            ]}
          >
            <Feather name={a.icon} size={24} color={a.accent} />
          </View>

          <View style={styles.achievementTextGroup}>
            <Text style={[styles.achievementTitle, { color: colors.primary }]}>
              {a.title}
            </Text>
            <Text style={[styles.achievementDescription, { color: colors.secondary }]}>{a.description}</Text>
          </View>
          <Text style={[styles.achievementDate, { color: a.accent }]}>{a.date}</Text>
        </View>
      ))}
    </View>
  );

  // -----------------------------------------------------------------------

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Wrap everything in a check for loading/error state if needed, 
          but for now, we just render the content. */}
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 40 }}
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

// ------------------------------ STYLES ------------------------------

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  basePadding: {
    paddingHorizontal: 20,
  },

  // Header
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },

  // Section Title
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },

  // Period Selector
  periodSelectorWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  periodSelectorBar: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  periodText: {
    fontSize: 14,
    fontWeight: "700",
  },

  // Overview Cards
  cardRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  overviewCard: {
    flex: 1,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    // Soft shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  overviewCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  overviewCardSubtitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  overviewCardValue: {
    fontSize: 32,
    fontWeight: "800",
  },
  unitText: {
    fontSize: 16,
    fontWeight: '500',
  },
  overviewCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 4,
  },
  overviewCardTrend: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Chart (Bar Chart)
  chartWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  chartCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  barContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 150, // Increased height for better visualization
    marginBottom: 16,
    position: 'relative',
  },
  barColumn: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 30, // Wider bars
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: '#4CAF50',
  },
  barValueWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 5,
  },
  barValueText: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 5,
  },
  barLabel: {
    fontSize: 12,
  },
  targetLine: {
    position: 'absolute',
    top: '36.3%', // Represents 3.5 kg on a 5.5 max scale (1 - (3.5/5.5)) * 100%
    left: 0,
    right: 0,
    borderBottomWidth: 1.5,
    borderStyle: 'dotted',
    zIndex: 10,
  },
  targetLabel: {
    position: 'absolute',
    right: 0,
    top: -16,
    fontSize: 10,
    fontWeight: '700',
  },
  chartFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginTop: 10,
  },
  chartFooterText: {
    textAlign: "center",
    fontSize: 13,
  },

  // Category Breakdown
  breakdownWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  breakdownCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  breakdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  breakdownTextGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  breakdownCategory: {
    fontSize: 16,
    fontWeight: "700",
  },
  breakdownAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  progressBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  progressBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressBarPercent: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'right',
  },

  // Achievements
  achievementsWrapper: {
    paddingHorizontal: 20,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 5, // Accent stripe on the left
  },
  achievementIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  achievementTextGroup: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  achievementDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  achievementDate: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 10,
  }
});

export default Stats;