import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// 1. UNCOMMENTED the icon import
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

// Replace alias with relative path
import { useAppTheme } from "../android/app/utils/theme";

// 2. Changed to an arrow function for consistency
const Community = () => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();

  const [activeTab, setActiveTab] = useState("challenges");

  // Sample community data --------------------------------
  const leaderboard = [
    { id: 1, name: "Sydney Sweeney", score: 2450, avatar: "👩‍🦰", rank: 1, badge: "Planet Protector" },
    { id: 2, name: "Nobita", score: 2380, avatar: "👨‍🦱", rank: 2, badge: "Green Hero" },
    { id: 3, name: "Nitish", score: 2150, avatar: "👩‍💼", rank: 3, badge: "Eco Warrior" },
    { id: 4, name: "Mike Forest", score: 1980, avatar: "👨‍🦲", rank: 4, badge: "Carbon Saver" },
    { id: 5, name: "Lisa Eco", score: 1850, avatar: "👩‍🦳", rank: 5, badge: "Green Starter" },
  ];

  const challenges = [
    {
      id: 1,
      title: "Car-Free Week Challenge",
      description: "Avoid using a car for 7 days straight",
      participants: 1247,
      daysLeft: 5,
      reward: "500 XP + Tree Badge",
      progress: 68,
      type: "travel",
      color: colors.blue,
    },
    {
      id: 2,
      title: "Plant-Based November",
      description: "30 days of vegetarian meals",
      participants: 892,
      daysLeft: 12,
      reward: "750 XP + Leaf Badge",
      progress: 43,
      type: "diet",
      color: colors.green,
    },
    {
      id: 3,
      title: "Energy Saver Month",
      description: "Reduce home energy usage by 20%",
      participants: 634,
      daysLeft: 18,
      reward: "600 XP + Lightning Badge",
      progress: 25,
      type: "energy",
      color: colors.yellow,
    },
  ];

  const communityPosts = [
    {
      id: 1,
      user: "Sydney Sweeney",
      avatar: "👩‍🦰",
      time: "2h ago",
      content:
        "Just completed my 50th bike commute this year! 🚲 Saved over 180kg CO₂ so far.",
      likes: 23,
      comments: 7,
    },
    {
      id: 2,
      user: "Alex Rivers",
      avatar: "👨‍🦱",
      time: "4h ago",
      content:
        "Amazing progress this week! Our community has collectively saved 2.3 tons of CO₂.",
      likes: 41,
      comments: 12,
    },
    {
      id: 3,
      user: "Mike Forest",
      avatar: "👨‍🦲",
      time: "6h ago",
      content: "Planted 5 trees today! 🌳 Each will absorb ~22kg CO₂ per year.",
      likes: 35,
      comments: 9,
      image: true,
    },
  ];

  // Helpers ---------------------------------------------
  // 3. UNCOMMENTED this entire helper function
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return (
          <MaterialCommunityIcons
            name="crown"
            size={20}
            color={colors.gold}
          />
        );
      case 2:
        return (
          <MaterialCommunityIcons
            name="medal"
            size={20}
            color={colors.silver}
          />
        );
      case 3:
        return (
          <MaterialCommunityIcons
            name="medal-outline"
            size={20}
            color={colors.bronze}
          />
        );
      default:
        return (
          <MaterialCommunityIcons
            name="trophy-outline"
            size={18}
            color={colors.secondary}
          />
        );
    }
  };

  // 4. IMPROVED challenge icons for consistency
  const getChallengeIcon = (type) => {
    switch (type) {
      case "travel":
        return "car-off"; // More specific for "Car-Free"
      case "diet":
        return "leaf"; // Thematic for "Plant-Based"
      case "energy":
        return "flash"; // Consistent with other screens
      default:
        return "target";
    }
  };

  // UI Sections -----------------------------------------

  const renderHeader = () => (
    <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "600", color: colors.primary }}>
        EcoTrack Community 🌍
      </Text>
      <Text style={{ fontSize: 14, color: colors.secondary }}>
        Join 12,847 eco-warriors making a difference
      </Text>
    </View>
  );

  const renderTabSelector = () => (
    <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 4,
        }}
      >
        {[
          { id: "challenges", label: "Challenges" },
          { id: "leaderboard", label: "Leaderboard" },
          { id: "feed", label: "Feed" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 8,
              backgroundColor:
                activeTab === tab.id ? colors.green : "transparent",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: 14,
                fontWeight: "500",
                color:
                  activeTab === tab.id
                    ? isDark
                      ? "#000"
                      : "#fff"
                    : colors.secondary,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderChallenges = () => (
    <View style={{ paddingHorizontal: 20 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          color: colors.primary,
          marginBottom: 16,
        }}
      >
        Active Challenges 🎯
      </Text>

      {challenges.map((challenge) => (
        <View
          key={challenge.id}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 20,
            padding: 20,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View style={{ flexDirection: "row", marginBottom: 12 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: `${challenge.color}20`,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              {/* 5. UNCOMMENTED challenge icon */}
              <MaterialCommunityIcons
                name={getChallengeIcon(challenge.type)}
                size={20}
                color={challenge.color}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "600", color: colors.primary }}>
                {challenge.title}
              </Text>
              <Text style={{ fontSize: 14, color: colors.secondary, lineHeight: 20 }}>
                {challenge.description}
              </Text>
            </View>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, color: colors.secondary }}>
              Progress: {challenge.progress}%
            </Text>
            <View
              style={{
                width: "100%",
                height: 6,
                backgroundColor: colors.border,
                marginTop: 4,
                borderRadius: 3,
              }}
            >
              <View
                style={{
                  width: `${challenge.progress}%`,
                  height: "100%",
                  backgroundColor: challenge.color,
                  borderRadius: 3,
                }}
              />
            </View>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View>
              <Text style={{ color: colors.secondary, fontSize: 12 }}>
                {challenge.participants} participants
              </Text>
              <Text style={{ color: challenge.color, fontSize: 12 }}>
                Reward: {challenge.reward}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => Alert.alert("Joined!", `You joined ${challenge.title}`)}
              style={{
                backgroundColor: challenge.color,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: isDark ? "#000" : "#fff", fontWeight: "600" }}>
                Join
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderLeaderboard = () => (
    <View style={{ paddingHorizontal: 20 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          color: colors.primary,
          marginBottom: 16,
        }}
      >
        Weekly Leaderboard 🏆
      </Text>

      {leaderboard.map((user) => (
        <View
          key={user.id}
          style={{
            backgroundColor: user.name.includes("You")
              ? colors.greenLight
              : colors.surface,
            borderRadius: 16,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: user.name.includes("You")
              ? colors.green
              : colors.border,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {/* This call now works because getRankIcon is uncommented */}
          {getRankIcon(user.rank)}

          <Text style={{ marginLeft: 8, width: 30, fontSize: 16, color: colors.primary }}>
            #{user.rank}
          </Text>

          <Text style={{ fontSize: 28, marginRight: 10 }}>{user.avatar}</Text>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.primary }}>
              {user.name}
            </Text>
            <Text style={{ fontSize: 12, color: colors.secondary }}>
              {user.badge}
            </Text>
          </View>

          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.green }}>
            {user.score} XP
          </Text>
        </View>
      ))}
    </View>
  );

  const renderFeed = () => (
    <View style={{ paddingHorizontal: 20 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          color: colors.primary,
          marginBottom: 16,
        }}
      >
        Community Feed 📢
      </Text>

      {communityPosts.map((post) => (
        <View
          key={post.id}
          style={{
            backgroundColor: colors.surface,
            padding: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: "row", marginBottom: 12 }}>
            <Text style={{ fontSize: 32, marginRight: 10 }}>{post.avatar}</Text>

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.primary }}>
                {post.user}
              </Text>
              <Text style={{ fontSize: 12, color: colors.secondary }}>
                {post.time}
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 14, color: colors.primary, marginBottom: 16 }}>
            {post.content}
          </Text>

          {post.image && (
            <View
              style={{
                backgroundColor: colors.greenLight,
                padding: 20,
                borderRadius: 12,
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <MaterialCommunityIcons
                name="pine-tree"
                size={40}
                color={colors.green}
              />
              <Text style={{ color: colors.green, marginTop: 6 }}>
                Tree Planting Photo
              </Text>
            </View>
          )}

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", gap: 20 }}>
              <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }}>
                {/* 5. UNCOMMENTED feed icon */}
                <MaterialCommunityIcons name="heart-outline" size={18} color={colors.secondary} />
                <Text style={{ marginLeft: 4, color: colors.secondary }}>
                  {post.likes}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }}>
                {/* 5. UNCOMMENTED feed icon */}
                <MaterialCommunityIcons name="message-outline" size={18} color={colors.secondary} />
                <Text style={{ marginLeft: 4, color: colors.secondary }}>
                  {post.comments}
                </Text>
              </TouchableOpacity>
            </View>
            {/* 5. UNCOMMENTED feed icon */}
            <MaterialCommunityIcons name="share-outline" size={18} color={colors.secondary} />
          </View>
        </View>
      ))}
    </View>
  );

  // RETURN UI -------------------------------------------

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top,
          // 6. Make sure there's enough padding to not be hidden by the tab bar
          paddingBottom: 120, 
        }}
      >
        {renderHeader()}
        {renderTabSelector()}

        {activeTab === "challenges" && renderChallenges()}
        {activeTab === "leaderboard" && renderLeaderboard()}
        {activeTab === "feed" && renderFeed()}
      </ScrollView>
    </View>
  );
}; // <-- This was missing

export default Community; // <-- This was missing