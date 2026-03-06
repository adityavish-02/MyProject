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
  ToastAndroid, // <--- ADDED for quick error messages
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";

// --- FIREBASE IMPORTS (NATIVE SDK) ---
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// --- ECOBUDDY INTELLIGENT TIPS ---
const ECO_TIPS = {
  travel: [
    "Did you know? 🚗 Aggressive driving (speeding, rapid acceleration) can lower your gas mileage by up to 33%!",
    "EcoBuddy Tip: Keeping your tires properly inflated can improve your gas mileage significantly.",
    "Great job tracking! 🚌 Taking the bus instead of driving just once a week cuts your carbon footprint significantly.",
    "Carpooling isn't just fun, it halves your emissions immediately! 🤝",
    "EcoBuddy says: A roof rack with cargo increases aerodynamic drag and lowers fuel economy."
  ],
  energy: [
    "Lightbulb moment! 💡 Switching to LED bulbs uses 75% less energy than incandescent lighting.",
    "EcoBuddy Tip: Unplug electronics when not in use. 'Vampire power' accounts for 10% of home energy use!",
    "Washing clothes in cold water saves huge amounts of energy used for heating. ❄️",
    "Turn down your thermostat by just 1°C to save up to 10% on your energy bill.",
    "Air drying clothes instead of using a dryer saves ~2.4kg of CO2 per load!"
  ],
  diet: [
    "Yum! 🥦 Producing 1kg of beef emits 60kg of CO2, while peas emit just 1kg.",
    "EcoBuddy Fact: Going meat-free just one day a week has a massive impact on water conservation.",
    "Eating local ingredients reduces the 'Food Miles' (transport emissions) of your meal. 🚚",
    "Food waste in landfills creates methane. Composting is a great way to fight this! 🍂",
    "Did you know? Cheese has a high carbon footprint due to the dairy processing. Try vegan alternatives!"
  ]
};

const Track = () => {
  const insets = useSafeAreaInsets();
  
  // --- State ---
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("travel");
  const [isLoading, setIsLoading] = useState(false);

  const [travelData, setTravelData] = useState({ mode: "", distance: "", description: "" });
  const [energyData, setEnergyData] = useState({ electricity: "", description: "" });
  const [dietData, setDietData] = useState({ mealType: "", description: "" });

  // --- BENCHMARKS (Averages to beat) ---
  const AVG_TRAVEL_FACTOR = 0.20; // kg CO2 per km (Approx avg car)
  const AVG_MEAL_EMISSION = 2.5;  // kg CO2 (Approx avg meat meal)
  const AVG_ENERGY_EMISSION = 5.0; // kg CO2 (Arbitrary threshold for a small log)
  const XP_REWARD = 50;

  // --- Authentication ---
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    // Sign in anonymously if not logged in
    if (!auth().currentUser) {
      auth()
        .signInAnonymously()
        .catch(error => {
          console.error("Auth failed:", error);
        });
    }
    return subscriber; 
  }, []);

  function onAuthStateChanged(user) {
    setUser(user);
  }

  // --- ECOBUDDY LOGIC ---
  const showEcoBuddySuggestion = (category, emissions) => {
    // 1. Get tips for the category
    const tips = ECO_TIPS[category] || ["Every small step counts! Keep it up! 🌍"];
    
    // 2. Pick a random one
    const randomTip = tips[Math.floor(Math.random() * tips.length)];

    // 3. Show Alert (Forces user to read the coaching tip)
    // We use Alert instead of Toast so the user actually reads the advice
    Alert.alert(
      "EcoBuddy 🤖 says:",
      `"${randomTip}"\n\n(Logged: ${emissions}kg CO₂)`,
      [{ text: "Thanks!", style: "default" }]
    );
  };

  // --- Helper: Update XP ---
  const awardXp = async () => {
    if (!user) return;
    try {
      const userRef = firestore().collection('users').doc(user.uid);
      // Use increment so we don't need to read the doc first
      await userRef.update({
        xp: firestore.FieldValue.increment(XP_REWARD)
      });
      
      // Show confirmation alert only after XP update is successful
      Alert.alert(
        "Nice Work! 🌱",
        `You beat the average! +${XP_REWARD} XP earned.\nKeep it up!`
      );
    } catch (error) {
      console.error("Error updating XP", error);
      // Fallback: create doc and award XP if it didn't exist
      await firestore().collection('users').doc(user.uid).set({
          xp: XP_REWARD,
          level: 1
      }, { merge: true });

       Alert.alert(
        "Nice Work! 🌱",
        `You beat the average! +${XP_REWARD} XP earned.\nKeep it up!`
      );
    }
  };

  // --- Data Constants ---
  const travelModes = [
    { id: "car", label: "Car", icon: "truck", factor: 0.21 },
    { id: "bus", label: "Bus", icon: "map-pin", factor: 0.089 },
    { id: "bike", label: "Bike", icon: "wind", factor: 0 },
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
    return (parseFloat(travelData.distance || 0) * mode.factor).toFixed(2);
  };

  // --- Handlers ---
  const handleSaveTravel = async () => {
    if (!user) return Alert.alert("Please wait", "Authenticating...");
    if (!travelData.mode || !travelData.distance) {
      return ToastAndroid.show("Select a transport mode and enter distance.", ToastAndroid.SHORT);
    }

    setIsLoading(true);
    const emissions = parseFloat(calculateTravelEmissions());
    const distance = parseFloat(travelData.distance || 0);
    
    // Safety check for division by zero
    const emissionPerKm = (distance > 0) ? (emissions / distance) : (travelData.mode === 'car' ? 0.21 : 0);

    try {
      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('travel_logs')
        .add({
          userId: user.uid,
          mode: travelData.mode,
          distance: distance,
          emissions: emissions,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      // Check if better than average
      if (emissionPerKm < AVG_TRAVEL_FACTOR) {
        await awardXp();
      } else {
        // TRIGGER ECOBUDDY
        showEcoBuddySuggestion('travel', emissions.toFixed(2));
      }

      setTravelData({ mode: "", distance: "", description: "" });
    } catch (error) {
      console.error("Error saving travel log: ", error);
      Alert.alert("Error", "There was a problem saving your log.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEnergy = async () => {
    if (!user) return Alert.alert("Please wait", "Authenticating...");
    
    // Ensure inputs are parsed safely
    const electricity = parseFloat(energyData.electricity || 0);
    
    if (electricity === 0 ) {
      return ToastAndroid.show("Please enter electricity usage.", ToastAndroid.SHORT);
    }

    setIsLoading(true);
    const emissions = (electricity * 0.82);

    try {
      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('energy_logs')
        .add({
          userId: user.uid,
          electricity: electricity,
          emissions: emissions,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      // After successful log, check for XP reward
      if (emissions < AVG_ENERGY_EMISSION) {
        await awardXp();
      } else {
        // TRIGGER ECOBUDDY
        showEcoBuddySuggestion('energy', emissions.toFixed(2));
      }
      
      setEnergyData({ electricity: "",  description: "" });
    } catch (error) {
      console.error("Error saving energy log: ", error);
      Alert.alert("Error", "Could not save log.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDiet = async () => {
    if (!user) return Alert.alert("Please wait", "Authenticating...");
    if (!dietData.mealType) {
      return ToastAndroid.show("Please select a meal type.", ToastAndroid.SHORT);
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

      // After successful log, check for XP reward
      if (meal.co2 < AVG_MEAL_EMISSION) {
        await awardXp();
      } else {
        // TRIGGER ECOBUDDY
        showEcoBuddySuggestion('diet', meal.co2);
      }

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
});

export default Track;