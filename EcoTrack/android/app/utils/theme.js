import { useColorScheme } from "react-native";

export const useAppTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return {
    isDark,
    colors: {
      // Background colors
      background: isDark ? "#0A0F0A" : "#F8FBF8",
      surface: isDark ? "#1A1F1A" : "#FFFFFF",
      surfaceVariant: isDark ? "#2A2F2A" : "#F0F4F0",

      // Text colors
      primary: isDark ? "#E8F5E8" : "#0A0F0A",
      secondary: isDark ? "#B8D4B8" : "#4A6B4A",
      tertiary: isDark ? "#88A888" : "#2E4A2E",
      placeholder: isDark ? "#6B8A6B" : "#A5C4A5",

      // Border colors
      border: isDark ? "#2E4A2E" : "#D4E8D4",
      borderLight: isDark ? "#3A5A3A" : "#E2F0E2",

      // UI element colors
      dragHandle: isDark ? "#4A6B4A" : "#B8D4B8",

      // Eco-themed accent colors
      green: isDark ? "#4CAF50" : "#2E7D32",
      greenLight: isDark ? "#1B3E1B" : "#E8F5E8",
      blue: isDark ? "#42A5F5" : "#1976D2",
      blueLight: isDark ? "#1A2E3E" : "#E3F2FD",
      orange: isDark ? "#FF7043" : "#E64A19",
      orangeLight: isDark ? "#3E251A" : "#FFF3E0",
      yellow: isDark ? "#FFCA28" : "#F57F17",
      yellowLight: isDark ? "#3E3518" : "#FFFDE7",
      brown: isDark ? "#8D6E63" : "#5D4037",
      brownLight: isDark ? "#2E211E" : "#EFEBE9",

      // Gamification colors
      gold: isDark ? "#FFD700" : "#FFC107",
      silver: isDark ? "#C0C0C0" : "#9E9E9E",
      bronze: isDark ? "#CD7F32" : "#795548",

      // Status colors
      success: isDark ? "#4CAF50" : "#2E7D32",
      warning: isDark ? "#FF9800" : "#F57C00",
      error: isDark ? "#F44336" : "#C62828",
    },
  };
};