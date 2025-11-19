import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";

// --- FIREBASE IMPORTS (NATIVE SDK) ---
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const TrackNative = () => {
  const insets = useSafeAreaInsets();
  
  // --- State ---
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("travel");
  const [isLoading, setIsLoading] = useState(false);

  const [travelData, setTravelData] = useState({ mode: "", distance: "", description: "" });
  const [energyData, setEnergyData] = useState({ electricity: "", heating: "", description: "" });
  const [dietData, setDietData] = useState({ mealType: "", description: "" });

  // --- Authentication ---
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    
    // Sign in anonymously if not logged in
    if (!auth().currentUser) {
      auth()
        .signInAnonymously()
        .catch(error => {
          console.error("Auth failed:", error);
          Alert.alert("Auth Error", "Could not sign in anonymously.");
        });
    }

    return subscriber; // unsubscribe on unmount
  }, []);

  function onAuthStateChanged(user) {
    setUser(user);
  }

  // --- Data Constants ---
  const travelModes = [
    { id: "car", label: "Car", icon: "truck", factor: 0.21 },
    { id: "bus", label: "Bus", icon: "map-pin", factor: 0.089 },
    { id: "bike", label: "Bike", icon: "wind", factor: 0 }, // Feather doesn't have 'bike', using 'wind'
    { id: "walk", label: "Walk", icon: "activity", factor: 0 },
    { id: "airplane", label: "Plane", icon: "send", factor: 0.255 },
  ];

  const mealTypes = [
    { id: "meat", label: "Meat-based", co2: 3.3, icon: "shopping-bag" },
    { id: "vegetarian", label: "Vegetarian", co2: 1.7, icon: "sun" },
    { id: "vegan", label: "Vegan", co2: 1.0, icon: "smile" },
    { id: "pescatarian", label: "Pescatarian", co2: 2.3, icon: "anchor" },
  ];

  // --- Helpers ---
  const calculateTravelEmissions = () => {
    if (!travelData.mode || !travelData.distance) return 0;
    const mode = travelModes.find((m) => m.id === travelData.mode);
    return (parseFloat(travelData.distance) * mode.factor).toFixed(2);
  };

  // --- Handlers ---
  const handleSaveTravel = async () => {
    if (!user) return Alert.alert("Please wait", "Logging in...");
    if (!travelData.mode || !travelData.distance) {
      return Alert.alert("Missing Data", "Select a transport mode and enter distance.");
    }

    setIsLoading(true);
    const emissions = calculateTravelEmissions();

    try {
      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('travel_logs')
        .add({
          userId: user.uid,
          mode: travelData.mode,
          distance: parseFloat(travelData.distance),
          emissions: parseFloat(emissions),
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      Alert.alert("Travel Logged!", `${emissions} kg CO₂ added.`);
      setTravelData({ mode: "", distance: "", description: "" });
    } catch (error) {
      console.error("Error saving travel log: ", error);
      Alert.alert("Error", "There was a problem saving your log.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEnergy = async () => {
    if (!user) return Alert.alert("Please wait", "Logging in...");
    if (!energyData.electricity && !energyData.heating) {
      return Alert.alert("Missing Data", "Please enter electricity or heating usage.");
    }

    setIsLoading(true);
    const emissions = (parseFloat(energyData.electricity || 0) * 0.5) + (parseFloat(energyData.heating || 0) * 0.2);

    try {
      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('energy_logs')
        .add({
          userId: user.uid,
          electricity: parseFloat(energyData.electricity || 0),
          heating: parseFloat(energyData.heating || 0),
          emissions: emissions,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      Alert.alert("Energy Logged!", "Your energy usage has been saved.");
      setEnergyData({ electricity: "", heating: "", description: "" });
    } catch (error) {
      console.error("Error saving energy log: ", error);
      Alert.alert("Error", "Could not save log.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDiet = async () => {
    if (!user) return Alert.alert("Please wait", "Logging in...");
    if (!dietData.mealType) {
      return Alert.alert("Missing Data", "Please select a meal type.");
    }

    const meal = mealTypes.find((m) => m.id === dietData.mealType);
    if (!meal) return Alert.alert("Error", "Invalid meal type.");

    setIsLoading(true);

    try {
      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('diet_logs')
        .add({
          userId: user.uid,
          mealType: dietData.mealType,
          emissions: meal.co2,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      Alert.alert("Meal Logged!", `${meal.co2} kg CO₂ added.`);
      setDietData({ mealType: "", description: "" });
    } catch (error) {
      console.error("Error saving diet log: ", error);
      Alert.alert("Error", "Could not save log.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Sub-Components ---
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Track Your Impact 📊</Text>
      <View style={styles.tabContainer}>
        {["travel", "energy", "diet"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && styles.tabButtonActive
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.tabTextActive
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTravelTab = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Transport Mode</Text>
      <View style={styles.gridContainer}>
        {travelModes.map((mode) => {
          const isSelected = travelData.mode === mode.id;
          return (
            <TouchableOpacity
              key={mode.id}
              style={[
                styles.card,
                isSelected && styles.cardSelected
              ]}
              onPress={() => setTravelData({ ...travelData, mode: mode.id })}
            >
              <Icon name={mode.icon} size={24} color={isSelected ? "#059669" : "#94a3b8"} />
              <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>{mode.label}</Text>
              {mode.factor === 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>ZERO CO₂</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.inputLabel}>Distance (km)</Text>
      <TextInput
        placeholder="0.0"
        keyboardType="numeric"
        value={travelData.distance}
        onChangeText={(t) => setTravelData({ ...travelData, distance: t })}
        style={styles.input}
        placeholderTextColor="#94a3b8"
      />

      {travelData.mode && travelData.distance && (
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Estimated Emission</Text>
          <Text style={styles.resultValue}>{calculateTravelEmissions()} <Text style={styles.resultUnit}>kg</Text></Text>
        </View>
      )}

      <TouchableOpacity
        onPress={handleSaveTravel}
        disabled={isLoading}
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
      >
        {isLoading ? <ActivityIndicator color="#fff" /> : <Icon name="plus" size={20} color="#fff" />}
        <Text style={styles.submitButtonText}>Log Travel</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEnergyTab = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Energy Usage</Text>
      
      <Text style={styles.inputLabel}>
        <Icon name="zap" size={16} color="#FBBF24" /> Electricity (kWh)
      </Text>
      <TextInput
        placeholder="0.0"
        keyboardType="numeric"
        value={energyData.electricity}
        onChangeText={(t) => setEnergyData({ ...energyData, electricity: t })}
        style={styles.input}
        placeholderTextColor="#94a3b8"
      />

      <Text style={styles.inputLabel}>
        <Icon name="home" size={16} color="#60A5FA" /> Heating/Cooling (kWh)
      </Text>
      <TextInput
        placeholder="0.0"
        keyboardType="numeric"
        value={energyData.heating}
        onChangeText={(t) => setEnergyData({ ...energyData, heating: t })}
        style={styles.input}
        placeholderTextColor="#94a3b8"
      />

      <TouchableOpacity
        onPress={handleSaveEnergy}
        disabled={isLoading}
        style={[styles.submitButton, { backgroundColor: '#2563EB' }, isLoading && styles.submitButtonDisabled]}
      >
        {isLoading ? <ActivityIndicator color="#fff" /> : <Icon name="zap" size={20} color="#fff" />}
        <Text style={styles.submitButtonText}>Log Energy</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDietTab = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Select Meal Type</Text>
      
      <View style={styles.listContainer}>
        {mealTypes.map((meal) => {
          const isSelected = dietData.mealType === meal.id;
          return (
            <TouchableOpacity
              key={meal.id}
              onPress={() => setDietData({ ...dietData, mealType: meal.id })}
              style={[styles.listItem, isSelected && styles.listItemSelected]}
            >
              <View style={styles.row}>
                <Icon name={meal.icon} size={20} color={isSelected ? "#059669" : "#94a3b8"} />
                <Text style={[styles.listItemText, isSelected && styles.listItemTextSelected]}>
                  {meal.label}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.co2Text}>{meal.co2} kg CO₂</Text>
                {isSelected && <Icon name="check" size={18} color="#059669" style={{ marginLeft: 8 }} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        onPress={handleSaveDiet}
        disabled={isLoading}
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
      >
        {isLoading ? <ActivityIndicator color="#fff" /> : <Icon name="package" size={20} color="#fff" />}
        <Text style={styles.submitButtonText}>Log Meal</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F8FAFC" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {activeTab === "travel" && renderTravelTab()}
        {activeTab === "energy" && renderEnergyTab()}
        {activeTab === "diet" && renderDietTab()}
      </ScrollView>
      
      {!user && (
        <View style={styles.footerAuth}>
          <Text style={styles.footerAuthText}>Authenticating...</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontWeight: "600",
    color: "#64748B",
  },
  tabTextActive: {
    color: "#059669",
  },
  sectionContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  card: {
    width: '48%',
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    elevation: 1,
  },
  cardSelected: {
    borderColor: "#059669",
    backgroundColor: "#ECFDF5",
  },
  cardLabel: {
    marginTop: 8,
    fontWeight: "500",
    color: "#475569",
  },
  cardLabelSelected: {
    color: "#047857",
  },
  badge: {
    marginTop: 4,
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 99,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#059669",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    color: "#0F172A",
  },
  resultBox: {
    backgroundColor: "#D1FAE5",
    borderColor: "#A7F3D0",
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultLabel: {
    color: "#065F46",
    fontWeight: "500",
  },
  resultValue: {
    color: "#064E3B",
    fontWeight: "bold",
    fontSize: 20,
  },
  resultUnit: {
    fontSize: 14,
    fontWeight: "normal",
  },
  submitButton: {
    backgroundColor: "#059669",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  listContainer: {
    gap: 12,
    marginBottom: 24,
  },
  listItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    elevation: 1,
  },
  listItemSelected: {
    borderColor: "#059669",
    backgroundColor: "#ECFDF5",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  listItemText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
    color: "#334155",
  },
  listItemTextSelected: {
    color: "#064E3B",
  },
  co2Text: {
    color: "#94a3b8",
    fontSize: 14,
  },
  footerAuth: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FEF3C7',
    padding: 4,
    alignItems: 'center',
  },
  footerAuthText: {
    color: '#92400E',
    fontSize: 12,
  },
});

export default TrackNative;