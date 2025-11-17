import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../android/app/utils/theme'; // Adjust this path if needed
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ProfileScreen = () => {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Text style={[styles.title, { color: colors.primary }]}>My Profile</Text>
      <Text style={{ color: colors.secondary }}>
        Your account details, settings, and other information would go here.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 16 
  },
});

export default ProfileScreen;