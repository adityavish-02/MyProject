import React from 'react';
import { TouchableOpacity, Platform } from 'react-native';
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
        headerTintColor: colors.primary,
        headerTitleAlign: 'center',
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.openDrawer()} 
            style={{ marginLeft: 20 }}
          >
            {/* 2. 'menu' icon (Feather) */}
            <Icon name="menu" size={26} color={colors.primary} />
          </TouchableOpacity>
        ),
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 8,
          paddingBottom: 4,
          height: Platform.OS === 'ios' ? 90 : 70,
        },
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.secondary,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
          marginTop: 4,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          title: "Dashboard",
          // 3. Changed icon names to 'Feather'
          tabBarIcon: ({ color }) => <Icon name="grid" color={color} size={24} />,
        }}
      />
      <Tab.Screen
        name="Track"
        component={Track}
        options={{
          title: "Track",
          tabBarIcon: ({ color }) => <Icon name="plus-circle" color={color} size={24} />,
        }}
      />
      <Tab.Screen
        name="Coach"
        component={Coach}
        options={{
          title: "EcoBuddy",
          tabBarIcon: ({ color }) => <Icon name="message-circle" color={color} size={24} />, 
        }}
      />
      <Tab.Screen
        name="Community"
        component={Community}
        options={{
          title: "Community",
          tabBarIcon: ({ color }) => <Icon name="users" color={color} size={24} />,
        }}
      />
      <Tab.Screen
        name="Stats"
        component={Stats}
        options={{
          title: "Stats",
          tabBarIcon: ({ color }) => <Icon name="bar-chart-2" color={color} size={24} />,
        }}
      />
    </Tab.Navigator>
  );
}