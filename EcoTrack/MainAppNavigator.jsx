import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/Feather'; // Using Feather

// Import our navigators and screens
import TabLayout from './navigation/tabs.js'; 
import ProfileScreen from './screens/ProfileScreen.jsx'; 
import SettingsScreen from './screens/SettingsScreen.jsx'; 
import { useAppTheme } from './android/app/utils/theme'; 

const Drawer = createDrawerNavigator();

// --- CUSTOM MENU ---
// 1. Accept the 'user' prop
function CustomDrawerContent(props) {
  const { colors } = useAppTheme();
  // 2. Get 'user' from props
  const { navigation, onLogout, user } = props; 

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: colors.surface }}>
      
      {/* 3. UPDATE THE ACCOUNT DETAILS HEADER */}
      <View style={styles.headerContainer}>
        <Icon name="user" size={50} color={colors.primary} />
        <Text style={[styles.headerName, { color: colors.primary }]}>
          {/* Use the user's real name (or a default) */}
          {user?.displayName || 'EcoTrack User'}
        </Text>
        <Text style={[styles.headerEmail, { color: colors.secondary }]}>
          {/* Use the user's real email */}
          {user?.email}
        </Text>
      </View>

      <View style={[styles.separator, { backgroundColor: colors.border, marginLeft: 0, marginRight: 0 }]} />

      {/* Menu items (no change here) */}
      <TouchableOpacity 
        style={styles.drawerItem} 
        onPress={() => navigation.navigate('Home')}>
        <Icon name="home" size={22} color={colors.secondary} />
        <Text style={[styles.drawerText, { color: colors.primary }]}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.drawerItem} 
        onPress={() => navigation.navigate('Profile')}>
        <Icon name="user" size={22} color={colors.secondary} />
        <Text style={[styles.drawerText, { color: colors.primary }]}>My Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.drawerItem} 
        onPress={() => navigation.navigate('Settings')}>
        <Icon name="settings" size={22} color={colors.secondary} />
        <Text style={[styles.drawerText, { color: colors.primary }]}>Settings</Text>
      </TouchableOpacity>
      <View style={[styles.separator, { backgroundColor: colors.border }]} />
      <TouchableOpacity style={styles.drawerItem} onPress={onLogout}>
        <Icon name="log-out" size={22} color={colors.secondary} />
        <Text style={[styles.drawerText, { color: colors.primary }]}>Logout</Text>
      </TouchableOpacity>
      
    </DrawerContentScrollView>
  );
}

// --- DRAWER NAVIGATOR ---
// 4. Accept the 'user' prop here
const MainAppNavigator = ({ onLogout, user }) => {
  const { colors } = useAppTheme();

  return (
    <Drawer.Navigator
      // 5. Pass the 'user' prop down to the custom content
      drawerContent={(props) => <CustomDrawerContent {...props} onLogout={onLogout} user={user} />}
      screenOptions={{
        headerTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.background, elevation: 0, shadowOpacity: 0 },
        drawerActiveBackgroundColor: colors.greenLight,
        drawerActiveTintColor: colors.green,
        drawerInactiveTintColor: colors.secondary,
        drawerLabelStyle: { marginLeft: -20 },
      }}
    >
      {/* Screens (no change here) */}
      <Drawer.Screen 
        name="Home" 
        component={TabLayout} 
        options={{
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
          title: 'Home'
        }}
      />
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="user" size={size} color={color} />
          ),
          title: 'My Profile'
        }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="settings" size={size} color={color} />
          ),
          title: 'Settings'
        }}
      />
    </Drawer.Navigator>
  );
};

// Styles (no change here)
const styles = StyleSheet.create({
  headerContainer: {
    padding: 20,
    paddingTop: 30,
    alignItems: 'center',
  },
  headerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  headerEmail: {
    fontSize: 14,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  drawerText: {
    fontSize: 16,
    marginLeft: 20,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    marginVertical: 10,
    marginHorizontal: 20,
  },
});

export default MainAppNavigator;