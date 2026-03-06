import React from 'react';
import { TouchableOpacity, Platform, View, StyleSheet, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAppTheme } from "../android/app/utils/theme";

// 1. Import 'Feather' icons
import Icon from 'react-native-vector-icons/Feather'; 

// Import all your screens
import Dashboard from '../screens/Dashboard';
import Track from '../screens/Track';
import Coach from '../screens/Coach';
import Community from '../screens/Community';
import Stats from '../screens/Stats';

const Tab = createBottomTabNavigator();

// Custom Tab Button Component - Updated Shape
const CustomTabIcon = ({ focused, color, name, label }) => {
  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      width: 60, // Fixed width for stability
    }}>
      <View style={{
        width: 44, // Slightly larger for the squircle shape
        height: 44,
        borderRadius: 14, // CHANGED: 14 creates a "Squircle" (Rounded Rectangle), 22 would be a Circle
        // Show color background only when focused
        backgroundColor: focused ? color : 'transparent', 
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
      }}>
        <Icon 
            name={name} 
            size={22} 
            color={focused ? '#FFFFFF' : '#9E9E9E'} // White icon when active, Gray when inactive
        />
      </View>
      <Text style={{ 
        color: focused ? color : '#9E9E9E', 
        fontSize: 10, 
        fontWeight: focused ? '700' : '500' 
      }}>
        {label}
      </Text>
    </View>
  );
};

export default function TabLayout() {
  const { colors, isDark } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ navigation }) => ({
        headerShown: true, 
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0, 
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.text || '#333',
        headerTitleAlign: 'center',
        headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.openDrawer()} 
            style={{ marginLeft: 20, padding: 4 }}
          >
            <Icon name="menu" size={24} color={colors.text || '#333'} />
          </TouchableOpacity>
        ),
        // --- STANDARD TAB BAR STYLES ---
        tabBarShowLabel: false, // We handle labels inside CustomTabIcon for better control
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 90 : 75, // Standard height
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          elevation: 0, 
          // Added top rounding for a smoother "sheet" look
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          title: "Dashboard",
          tabBarIcon: ({ focused }) => (
            <CustomTabIcon 
                focused={focused} 
                name="grid" 
                color="#42A5F5" // Blue
                label="Home" 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Track"
        component={Track}
        options={{
          title: "Track",
          tabBarIcon: ({ focused }) => (
            <CustomTabIcon 
                focused={focused} 
                name="plus-circle" 
                color="#FFA726" // Orange
                label="Track" 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Coach"
        component={Coach}
        options={{
          title: "EcoBuddy",
          tabBarIcon: ({ focused }) => (
            <CustomTabIcon 
                focused={focused} 
                name="message-circle" 
                color="#66BB6A" // Green
                label="Coach" 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Community"
        component={Community}
        options={{
          title: "Community",
          tabBarIcon: ({ focused }) => (
            <CustomTabIcon 
                focused={focused} 
                name="users" 
                color="#AB47BC" // Purple
                label="Community" 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Stats"
        component={Stats}
        options={{
          title: "Stats",
          tabBarIcon: ({ focused }) => (
            <CustomTabIcon 
                focused={focused} 
                name="bar-chart-2" 
                color="#EF5350" // Red
                label="Stats" 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}