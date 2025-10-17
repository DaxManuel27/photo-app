import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './screens/LoginScreen';
import NameScreen from './screens/NameScreen';
import JoinCodeScreen from './screens/JoinCodeScreen';
import HomeScreen from './screens/HomeScreen';
import GenerateCodeScreen from './screens/GenerateCodeScreen';
import GroupScreen from './screens/GroupScreen';
import PhotoDetailScreen from './screens/PhotoDetailScreen';
import { Photo } from './lib/photos';

export type RootStackParamList = {
  Login: undefined;
  Name: undefined;
  Home: undefined;
  JoinCode: undefined;
  GenerateCode: undefined;
  Group: {
    groupId: string;
    groupName: string;
  };
  PhotoDetail: {
    photo: Photo;
  };
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
  const { user, loading, needsName } = useAuth();
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
            {needsName && (
              <Stack.Screen
                name="Name"
                component={NameScreen}
                options={{ title: 'Name', headerShown: false }}
              />
            )}
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
            <Stack.Screen
              name="Group"
              component={GroupScreen}
              options={{ title: 'Group Photos' }}
            />
            <Stack.Screen
              name="PhotoDetail"
              component={PhotoDetailScreen}
              options={{ title: 'Photo', headerShown: false }}
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
