import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../android/app/utils/theme'; // Adjust this path if needed
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SettingsScreen = () => {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Text style={[styles.title, { color: colors.primary }]}>Settings</Text>
      <Text style={{ color: colors.secondary }}>
        App preferences, notification settings, and other options would go here.
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

export default SettingsScreen;