import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useAppTheme } from "../android/app/utils/theme";

// 1. IMPORT the new modular functions
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile 
} from '@react-native-firebase/auth';

// 2. GET the auth instance once
const auth = getAuth();

const AuthScreen = () => { 
  const { colors, isDark } = useAppTheme();
  const [isLoginView, setIsLoginView] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const styles = getStyles(colors);

  const handleSignUp = () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }
    
    // 3. USE the new createUserWithEmailAndPassword syntax
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // 4. USE the new updateProfile syntax
        return updateProfile(userCredential.user, {
          displayName: name,
        });
      })
      .then(() => {
        console.log('User account created & profile updated!');
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          Alert.alert('Error', 'That email address is already in use!');
        } else if (error.code === 'auth/invalid-email') {
          Alert.alert('Error', 'That email address is invalid!');
        } else {
          Alert.alert('Error', error.message);
        }
      });
  };

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password.");
      return;
    }

    // 5. USE the new signInWithEmailAndPassword syntax
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        console.log('User signed in!');
      })
      .catch(error => {
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
          Alert.alert('Error', 'Invalid email or password.');
        } else if (error.code === 'auth/invalid-email') {
          Alert.alert('Error', 'That email address is invalid!');
        } else {
          Alert.alert('Error', "Login failed. Please try again.");
          console.log(error);
        }
      });
  };

  const handleAuth = () => {
    if (isLoginView) {
      handleLogin();
    } else {
      handleSignUp();
    }
  };

  // (The rest of your JSX and styles do not need to change)
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <Text style={styles.title}>
        {isLoginView ? "Welcome Back! 👋" : "Create Account 🌱"}
      </Text>
      <Text style={styles.subtitle}>
        {isLoginView ? "Log in to your EcoTrack account" : "Start your green journey"}
      </Text>

      {/* Inputs */}
      <View style={styles.inputContainer}>
        {!isLoginView && (
          <View style={styles.inputWrapper}>
            <Icon name="user" size={20} color={colors.secondary} style={styles.icon} />
            <TextInput
              placeholder="Full Name"
              placeholderTextColor={colors.secondary}
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          </View>
        )}
        <View style={styles.inputWrapper}>
          <Icon name="mail" size={20} color={colors.secondary} style={styles.icon} />
          <TextInput
            placeholder="Email Address"
            placeholderTextColor={colors.secondary}
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputWrapper}>
          <Icon name="lock" size={20} color={colors.secondary} style={styles.icon} />
          <TextInput
            placeholder="Password"
            placeholderTextColor={colors.secondary}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
          <Text style={styles.authButtonText}>
            {isLoginView ? "Login" : "Create Account"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsLoginView(!isLoginView)}>
          <Text style={styles.toggleText}>
            {isLoginView ? "Need an account? Sign Up" : "Have an account? Login"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// Styles (no changes here)
const getStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, justifyContent: "center", padding: 24 },
    title: { fontSize: 28, fontWeight: "bold", color: colors.primary, marginBottom: 8 },
    subtitle: { fontSize: 16, color: colors.secondary, marginBottom: 32 },
    inputContainer: { marginBottom: 24 },
    inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, marginBottom: 16 },
    icon: { marginRight: 12 },
    input: { flex: 1, height: 50, color: colors.primary, fontSize: 16 },
    forgotPassword: { color: colors.green, textAlign: "right", fontSize: 14 },
    buttonContainer: { marginTop: 16 },
    authButton: { backgroundColor: colors.green, padding: 16, borderRadius: 12, alignItems: "center", marginBottom: 20 },
    authButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
    toggleText: { color: colors.green, textAlign: "center", fontSize: 14, fontWeight: "500" },
  });

export default AuthScreen;