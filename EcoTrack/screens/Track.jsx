import React, { useState } from "react";
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 1. IMPORT 'Feather' icons
import Icon from "react-native-vector-icons/Feather";

// Import theme
import { useAppTheme } from "../android/app/utils/theme";

// 2. IMPORT the new modular Firebase functions
import { getFirestore, collection, addDoc, serverTimestamp } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';

// 3. GET the instances once
const auth = getAuth();
const firestore = getFirestore();

const Track = () => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();

  const [activeTab, setActiveTab] = useState("travel");
  const [isLoading, setIsLoading] = useState(false);

  const [travelData, setTravelData] = useState({
    mode: "",
    distance: "",
    description: "",
  });

  const [energyData, setEnergyData] = useState({
    electricity: "",
    heating: "",
    description: "",
  });

  const [dietData, setDietData] = useState({
    mealType: "",
    description: "",
  });

  // Using Feather icon names
  const travelModes = [
    { id: "car", label: "Car", icon: "truck", factor: 0.21 },
    { id: "bus", label: "Bus", icon: "navigation", factor: 0.089 },
    { id: "bike", label: "Bike", icon: "bike", factor: 0 },
    { id: "walk", label: "Walk", icon: "watch", factor: 0 },
    { id: "airplane", label: "Plane", icon: "send", factor: 0.255 },
  ];

  const mealTypes = [
    { id: "meat", label: "Meat-based", co2: 3.3 },
    { id: "vegetarian", label: "Vegetarian", co2: 1.7 },
    { id: "vegan", label: "Vegan", co2: 1.0 },
    { id: "pescatarian", label: "Pescatarian", co2: 2.3 },
  ];

  const calculateTravelEmissions = () => {
    if (!travelData.mode || !travelData.distance) return 0;
    const mode = travelModes.find((m) => m.id === travelData.mode);
    return (parseFloat(travelData.distance) * mode.factor).toFixed(2);
  };

  // --- 4. HANDLE SAVE TRAVEL (Modular Syntax) ---
  const handleSaveTravel = () => {
    if (!travelData.mode || !travelData.distance) {
      Alert.alert("Missing Data", "Select a transport mode and enter distance.");
      return;
    }
    const currentUser = auth.currentUser; // Get user from auth instance
    if (!currentUser) return Alert.alert("Error", "You must be logged in.");

    setIsLoading(true);
    const emissions = calculateTravelEmissions();
    
    const logData = {
      userId: currentUser.uid,
      mode: travelData.mode,
      distance: parseFloat(travelData.distance),
      emissions: parseFloat(emissions),
      createdAt: serverTimestamp(), // Use modular timestamp
    };

    addDoc(collection(firestore, 'travel_logs'), logData) // Use modular 'addDoc'
      .then(() => {
        Alert.alert("Travel Logged!", `${emissions} kg CO₂ added.`, [
          { text: "OK", onPress: () => setTravelData({ mode: "", distance: "", description: "" }) }
        ]);
      })
      .catch(error => {
        console.error("Error saving travel log: ", error);
        Alert.alert("Error", "There was a problem saving your log.");
      })
      .finally(() => setIsLoading(false));
  };

  // --- 5. HANDLE SAVE ENERGY (Modular Syntax) ---
  const handleSaveEnergy = () => {
    if (!energyData.electricity && !energyData.heating) {
      Alert.alert("Missing Data", "Please enter electricity or heating usage.");
      return;
    }
    const currentUser = auth.currentUser;
    if (!currentUser) return Alert.alert("Error", "You must be logged in.");

    setIsLoading(true);

    const logData = {
      userId: currentUser.uid,
      electricity: parseFloat(energyData.electricity || 0),
      heating: parseFloat(energyData.heating || 0),
      // Example calculation (replace with a real one later)
      emissions: (parseFloat(energyData.electricity || 0) * 0.5) + (parseFloat(energyData.heating || 0) * 0.2), 
      createdAt: serverTimestamp(),
    };

    addDoc(collection(firestore, 'energy_logs'), logData) // Save to new 'energy_logs' collection
      .then(() => {
        Alert.alert("Energy Logged!", "Your energy usage has been saved.", [
          { text: "OK", onPress: () => setEnergyData({ electricity: "", heating: "", description: "" }) }
        ]);
      })
      .catch(error => {
        console.error("Error saving energy log: ", error);
        Alert.alert("Error", "There was a problem saving your log.");
      })
      .finally(() => setIsLoading(false));
  };

  // --- 6. HANDLE SAVE DIET (Modular Syntax) ---
  const handleSaveDiet = () => {
    if (!dietData.mealType) {
      Alert.alert("Missing Data", "Please select a meal type.");
      return;
    }
    const currentUser = auth.currentUser;
    if (!currentUser) return Alert.alert("Error", "You must be logged in.");

    const meal = mealTypes.find((m) => m.id === dietData.mealType);
    if (!meal) return Alert.alert("Error", "Invalid meal type selected.");

    setIsLoading(true);

    const logData = {
      userId: currentUser.uid,
      mealType: dietData.mealType,
      emissions: meal.co2,
      createdAt: serverTimestamp(),
    };

    addDoc(collection(firestore, 'diet_logs'), logData) // Save to new 'diet_logs' collection
      .then(() => {
        Alert.alert("Meal Logged!", `${meal.co2} kg CO₂ added.`, [
          { text: "OK", onPress: () => setDietData({ mealType: "", description: "" }) }
        ]);
      })
      .catch(error => {
        console.error("Error saving diet log: ", error);
        Alert.alert("Error", "There was a problem saving your log.");
      })
      .finally(() => setIsLoading(false));
  };

  // --- RENDER FUNCTIONS ---
  
  const renderTabHeader = () => (
    <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "600", color: colors.primary, marginBottom: 16 }}>
        Track Your Impact 📊
      </Text>

      <View style={{ flexDirection: "row", backgroundColor: colors.surface, borderRadius: 12, padding: 4 }}>
        {["travel", "energy", "diet"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 8,
              backgroundColor: activeTab === tab ? colors.green : "transparent",
            }}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "600",
                color: activeTab === tab ? (isDark ? "#000" : "#fff") : colors.secondary,
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // -------------------- Travel Tab ------------------------
  const renderTravelTab = () => (
    <View style={{ paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "600", color: colors.primary, marginBottom: 16 }}>
        Transport Mode
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        {travelModes.map((mode) => {
          const isSelected = travelData.mode === mode.id;
          return (
           <TouchableOpacity
              key={mode.id}
              style={{
                backgroundColor: isSelected ? colors.greenLight : colors.surface,
                borderRadius: 16,
                padding: 16,
                alignItems: "center",
                minWidth: 90,
                borderWidth: 2,
                borderColor: isSelected ? colors.green : colors.border,
              }}
              // 1. onPress is now a prop, inside the tag
              // 2. Fixed the 'mode..id' typo
              onPress={() => setTravelData({ ...travelData, mode: mode.id, description: "" })}
            >
              {/* This icon is now correctly inside the button */}
              <Icon name={mode.icon} size={24} color={isSelected ? colors.green : colors.secondary} />
              <Text style={{ color: isSelected ? colors.green : colors.secondary, marginTop: 8 }}>
                {mode.label}
              </Text>
              {mode.factor === 0 && (
                <Text style={{ fontSize: 10, color: colors.success, marginTop: 4 }}>Zero CO₂</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.primary, marginBottom: 8 }}>
        Distance (km)
      </Text>

      <TextInput
        placeholder="Enter distance"
        placeholderTextColor={colors.placeholder}
        keyboardType="numeric"
        value={travelData.distance}
        onChangeText={(t) => setTravelData({ ...travelData, distance: t })}
        style={{
          backgroundColor: colors.surface,
          padding: 16,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: 16,
          color: colors.primary,
        }}
      />

      {travelData.mode && travelData.distance && (
        <View style={{ backgroundColor: colors.greenLight, padding: 16, borderRadius: 12, marginBottom: 20 }}>
          <Text style={{ color: colors.primary, fontWeight: "500" }}>
            Estimated CO₂: {calculateTravelEmissions()} kg
          </Text>
        </View>
      )}

      <TouchableOpacity
        onPress={handleSaveTravel}
        disabled={isLoading} 
        style={{
          backgroundColor: isLoading ? colors.secondary : colors.green,
          padding: 16,
          borderRadius: 12,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        {isLoading && activeTab === 'travel' ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Icon name="plus" color={isDark ? "#000" : "#fff"} size={20} />
            <Text style={{ marginLeft: 8, color: isDark ? "#000" : "#fff", fontWeight: "600" }}>
              Log Travel
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  // -------------------- Energy Tab ------------------------
  const renderEnergyTab = () => (
    <View style={{ paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "600", color: colors.primary, marginBottom: 16 }}>
        Energy Usage
      </Text>

      <Text style={{ marginBottom: 8, color: colors.primary, fontSize: 16 }}>
        <Icon name="zap" size={18} color={colors.blue} /> Electricity (kWh)
      </Text>
      <TextInput
        placeholder="Enter electricity usage"
        placeholderTextColor={colors.placeholder}
        keyboardType="numeric"
        value={energyData.electricity}
        onChangeText={(t) => setEnergyData({ ...energyData, electricity: t })}
        style={{
          backgroundColor: colors.surface,
          padding: 16,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: 20,
          color: colors.primary,
        }}
      />

      <Text style={{ marginBottom: 8, color: colors.primary, fontSize: 16 }}>
        <Icon name="home" size={18} color={colors.orange} /> Heating/Cooling (kWh)
      </Text>
      <TextInput
        placeholder="Enter heating usage"
        placeholderTextColor={colors.placeholder}
        keyboardType="numeric"
        value={energyData.heating}
        onChangeText={(t) => setEnergyData({ ...energyData, heating: t })}
        style={{
          backgroundColor: colors.surface,
          padding: 16,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: 20,
          color: colors.primary,
        }}
      />

      <TouchableOpacity
        onPress={handleSaveEnergy}
        disabled={isLoading}
        style={{
          backgroundColor: isLoading ? colors.secondary : colors.blue,
          padding: 16,
          borderRadius: 12,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        {isLoading && activeTab === 'energy' ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Icon name="zap" size={20} color={isDark ? "#000" : "#fff"} />
            <Text style={{ marginLeft: 8, color: isDark ? "#000" : "#fff", fontWeight: "600" }}>
              Log Energy
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  // -------------------- Diet Tab ------------------------
  const renderDietTab = () => (
    <View style={{ paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "600", color: colors.primary, marginBottom: 16 }}>
        Meal Type
      </Text>

      {mealTypes.map((meal) => {
        const isSelected = dietData.mealType === meal.id;

        return (
          <TouchableOpacity
            key={meal.id}
            onPress={() => setDietData({ ...dietData, mealType: meal.id, description: "" })}
            style={{
              backgroundColor: isSelected ? colors.greenLight : colors.surface,
              borderWidth: 2,
              borderColor: isSelected ? colors.green : colors.border,
              padding: 16,
              borderRadius: 16,
              marginBottom: 12,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Icon
                name="package" // Feather's 'package' icon
                size={22}
                color={isSelected ? colors.green : colors.secondary}
              />
              <Text
                style={{
                  marginLeft: 12,
                  fontSize: 16,
                  color: isSelected ? colors.green : colors.primary,
                }}
              >
                {meal.label}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ color: colors.secondary }}>{meal.co2} kg CO₂</Text>
              {isSelected && <Icon name="check" size={18} color={colors.green} />}
            </View>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        onPress={handleSaveDiet}
        disabled={isLoading}
        style={{
          backgroundColor: isLoading ? colors.secondary : colors.green,
          padding: 16,
          borderRadius: 12,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 10,
        }}
      >
        {isLoading && activeTab === 'diet' ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Icon name="package" size={20} color={isDark ? "#000" : "#fff"} />
            <Text
              style={{
                marginLeft: 8,
                color: isDark ? "#000" : "#fff",
                fontWeight: "600",
              }}
            >
              Log Meal
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  // -------------------- MAIN RENDER ------------------------
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 120 }} // No insets.top
        showsVerticalScrollIndicator={false}
      >
        {renderTabHeader()}

        {activeTab === "travel" && renderTravelTab()}
        {activeTab === "energy" && renderEnergyTab()}
        {activeTab === "diet" && renderDietTab()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
export default Track;