import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './screens/LoginScreen';
import JoinCodeScreen from './screens/JoinCodeScreen';
import HomeScreen from './screens/HomeScreen';
import GenerateCodeScreen from './screens/GenerateCodeScreen';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  JoinCode: undefined;
  GenerateCode: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const BlackWhiteTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    text: '#fff',
    primary: '#fff',
    card: '#000',
    border: '#fff',
    notification: '#fff',
  },
};

// Loading screen component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#fff" />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

// Main navigation component with auth protection
const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer theme={BlackWhiteTheme}>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#000' },
          headerTitleStyle: { color: '#fff', fontWeight: '600' },
          headerTintColor: '#fff',
          contentStyle: { backgroundColor: '#000' },
        }}
      >
        {!user ? (
          // Unauthenticated stack - only login screen accessible
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Login', headerShown: false }}
          />
        ) : (
          // Authenticated stack - all protected screens accessible
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'Home' }}
            />
            <Stack.Screen
              name="JoinCode"
              component={JoinCodeScreen}
              options={{ title: 'Join code' }}
            />
            <Stack.Screen
              name="GenerateCode"
              component={GenerateCodeScreen}
              options={{ title: 'Create join code' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Main App component with AuthProvider
export default function App() {
  console.log('🎯 App.tsx rendering...');
  
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
});
