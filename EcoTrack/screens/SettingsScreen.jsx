import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../android/app/utils/theme'; 
import Icon from "react-native-vector-icons/Feather";
import { v4 as uuidv4 } from 'uuid'; // Correct import - requires installation

// --- FIREBASE IMPORTS (NATIVE SDK) ---
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// --- Vehicle Configuration Constants (Emission Factors: kg CO2/km) ---
const VEHICLE_OPTIONS = [
    { id: 'petrol', label: 'Petrol Car', icon: 'truck', factor: 0.21 },
    { id: 'diesel', label: 'Diesel Car', icon: 'truck', factor: 0.17 },
    { id: 'cng', label: 'CNG Car', icon: 'truck', factor: 0.12 },
    { id: 'electric', label: 'Electric Car', icon: 'battery-charging', factor: 0.05 }, // Factor for grid electricity usage
    { id: 'motorcycle', label: 'Motorcycle', icon: 'flag', factor: 0.09 }, 
];

const SettingsScreen = () => {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  
  const [user, setUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [newVehicleName, setNewVehicleName] = useState('');
  const [selectedFuelType, setSelectedFuelType] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // --- Auth Listener ---
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((u) => {
        setUser(u);
        if (u) {
            setupVehicleListener(u.uid);
        } else {
            // Sign in anonymously if not logged in
            auth().signInAnonymously().catch(error => {
                console.error("Auth failed:", error);
            });
            setIsDataLoading(false);
        }
    });
    return subscriber; 
  }, []);

  // --- Firestore Listener for User Vehicles ---
  const setupVehicleListener = (uid) => {
    const userRef = firestore().collection('users').doc(uid);

    return userRef.onSnapshot(docSnapshot => {
        setIsDataLoading(false);
        if (docSnapshot.exists) {
            const data = docSnapshot.data();
            // Vehicles are stored as an array under the 'vehicles' field
            setVehicles(data.vehicles || []);
        } else {
            // Document doesn't exist yet, create it with an empty vehicle array
            // NOTE: The listener will fire again after this set() succeeds
            userRef.set({ vehicles: [] }, { merge: true }).catch(err => console.error("Error creating initial user doc:", err));
        }
    }, error => {
        console.error("Firestore listener error:", error);
        setIsDataLoading(false);
    });
  };

  // --- Handlers ---

  const handleAddVehicle = async () => {
    if (!user || !selectedFuelType || !newVehicleName.trim()) {
        return Alert.alert("Missing Info", "Please name your vehicle and select a fuel type.");
    }

    setIsSaving(true);
    const selectedOption = VEHICLE_OPTIONS.find(opt => opt.id === selectedFuelType);

    const newVehicle = {
        id: uuidv4(), // Unique ID for keying/deletion
        name: newVehicleName.trim(),
        fuel: selectedOption.id,
        fuelLabel: selectedOption.label,
        factor: selectedOption.factor,
    };
    
    const userRef = firestore().collection('users').doc(user.uid);

    try {
        // 1. Check if the 'vehicles' field exists to avoid update/arrayUnion errors on initial creation
        const doc = await userRef.get();
        
        if (doc.exists && doc.data()?.vehicles) {
            // Document exists and 'vehicles' array exists: Use arrayUnion
            await userRef.update({
                vehicles: firestore.FieldValue.arrayUnion(newVehicle)
            });
        } else {
            // Document either doesn't exist or 'vehicles' array is missing: Use set to guarantee creation
            await userRef.set({
                vehicles: [newVehicle]
            }, { merge: true });
        }

        Alert.alert("Success", `${newVehicle.name} (${newVehicle.fuelLabel}) added!`);
        setNewVehicleName('');
        setSelectedFuelType(null);

    } catch (error) {
        console.error("Error adding vehicle:", error);
        Alert.alert("Error", "Could not save vehicle data: " + error.message);
    } finally {
        setIsSaving(false);
    }
  };

  const handleRemoveVehicle = async (vehicleId) => {
    if (!user) return;

    // Find the vehicle object to remove
    const vehicleToRemove = vehicles.find(v => v.id === vehicleId);

    if (!vehicleToRemove) return;

    setIsSaving(true);
    try {
        const userRef = firestore().collection('users').doc(user.uid);
        // Use arrayRemove to safely remove the exact object
        await userRef.update({
            vehicles: firestore.FieldValue.arrayRemove(vehicleToRemove)
        });
        Alert.alert("Removed", `${vehicleToRemove.name} has been deleted.`);
    } catch (error) {
        console.error("Error removing vehicle:", error);
        Alert.alert("Error", "Could not delete vehicle.");
    } finally {
        setIsSaving(false);
    }
  };
  
  // --- Render Sections ---

  const renderProfileInfo = () => (
    <View style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>User Profile</Text>
        <Text style={[styles.infoText, { color: colors.secondary }]}>
            <Text style={{ fontWeight: '600', color: colors.text }}>User ID:</Text> {user?.uid || 'N/A (Authenticating...)'}
        </Text>
        <Text style={[styles.infoText, { color: colors.secondary }]}>
            <Text style={{ fontWeight: '600', color: colors.text }}>Name:</Text> Sarah (Mocked)
        </Text>
        <Text style={[styles.infoText, { color: colors.secondary }]}>
            <Text style={{ fontWeight: '600', color: colors.text }}>App Version:</Text> 1.0.0
        </Text>
    </View>
  );

  const renderAddVehicleForm = () => (
    <View style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Add New Vehicle</Text>

        <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            placeholder="Vehicle Name (e.g., My Sedan, Work Scooter)"
            placeholderTextColor={colors.secondary}
            value={newVehicleName}
            onChangeText={setNewVehicleName}
            editable={!isSaving}
        />

        <Text style={[styles.inputLabel, { color: colors.text }]}>Select Fuel/Type:</Text>
        <View style={styles.fuelGrid}>
            {VEHICLE_OPTIONS.map((option) => (
                <TouchableOpacity
                    key={option.id}
                    style={[
                        styles.fuelChip,
                        { borderColor: colors.border, backgroundColor: colors.surface },
                        selectedFuelType === option.id && { borderColor: colors.green, backgroundColor: colors.greenLight }
                    ]}
                    onPress={() => setSelectedFuelType(option.id)}
                    disabled={isSaving}
                >
                    <Icon name={option.icon} size={16} color={selectedFuelType === option.id ? colors.green : colors.secondary} />
                    <Text style={[styles.fuelChipText, { color: colors.text }, selectedFuelType === option.id && { color: colors.green }]}>
                        {option.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>

        <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.green }]}
            onPress={handleAddVehicle}
            disabled={isSaving || !selectedFuelType || !newVehicleName.trim()}
        >
            {isSaving ? (
                <ActivityIndicator color={colors.surface} />
            ) : (
                <Text style={styles.addButtonText}>Add Vehicle</Text>
            )}
        </TouchableOpacity>
    </View>
  );

  const renderVehicleList = () => (
    <View style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>My Saved Vehicles ({vehicles.length})</Text>

        {isDataLoading ? (
            <ActivityIndicator style={{marginTop: 10}} size="small" color={colors.primary} />
        ) : vehicles.length === 0 ? (
            <Text style={{ color: colors.secondary, marginTop: 10 }}>No vehicles added yet. Add one above to start tracking accurately.</Text>
        ) : (
            vehicles.map(v => (
                <View key={v.id} style={[styles.vehicleRow, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                    <View style={styles.vehicleInfo}>
                        {/* Try to find the specific icon, default to 'truck' */}
                        <Icon name={VEHICLE_OPTIONS.find(opt => opt.id === v.fuel)?.icon || 'truck'} size={20} color={colors.text} />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={[styles.vehicleName, { color: colors.text }]}>{v.name}</Text>
                            <Text style={[styles.vehicleDetail, { color: colors.secondary }]}>
                                {v.fuelLabel} • Factor: {v.factor} kg/km
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity 
                        onPress={() => handleRemoveVehicle(v.id)} 
                        disabled={isSaving}
                        style={[styles.deleteButton, { backgroundColor: colors.error }]}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color={colors.surface} />
                        ) : (
                            <Icon name="trash-2" size={16} color={colors.surface} />
                        )}
                    </TouchableOpacity>
                </View>
            ))
        )}
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }}>
      <Text style={[styles.screenTitle, { color: colors.primary }]}>App Settings</Text>
      
      {renderProfileInfo()}
      
      {renderAddVehicleForm()}
      
      {renderVehicleList()}

      <View style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Other Options</Text>
        <Text style={{ color: colors.secondary }}>
            Notification preferences, privacy settings, and logout options would be placed here.
        </Text>
      </View>
    </ScrollView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  screenTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF', // Use fixed white for contrast in settings
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    marginBottom: 15 
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  fuelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 8,
  },
  fuelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    width: '48%',
  },
  fuelChipText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  addButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  vehicleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
  },
  vehicleDetail: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 10,
  }
});

export default SettingsScreen;