import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Alert } from 'react-native';

// 1. IMPORT the new modular functions
import { getAuth, onAuthStateChanged, signOut } from '@react-native-firebase/auth';

import MainAppNavigator from './MainAppNavigator.jsx'; 
import AuthScreen from './screens/AuthScreen.jsx'; 

const Stack = createStackNavigator();

// 2. GET the auth instance once
const auth = getAuth();

const App = () => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // 3. USE the new onAuthStateChanged syntax
    const subscriber = onAuthStateChanged(auth, (userState) => {
      setUser(userState);
      if (initializing) {
        setInitializing(false);
      }
    });
    return subscriber; // unsubscribe on unmount
  }, [initializing]);

  if (initializing) {
    return null; // or a loading spinner
  }

  const handleLogout = () => {
    // 4. USE the new signOut syntax
    signOut(auth).then(() => {
      console.log('User signed out!');
    });
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="MainApp">
            {(props) => <MainAppNavigator {...props} onLogout={handleLogout} user={user} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;