import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NameScreen from './screens/NameScreen';
import JoinCodeScreen from './screens/JoinCodeScreen';
import HomeScreen from './screens/HomeScreen';
import GenerateCodeScreen from './screens/GenerateCodeScreen';
import { testSupabaseConnection } from './lib/supabase';

export type RootStackParamList = {
  Name: undefined;
  JoinCode: { name: string };
  Home: { name: string };
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

export default function App() {
  console.log('🎯 App.tsx rendering...');
  
  return (
    <NavigationContainer theme={BlackWhiteTheme}>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Name"
        screenOptions={{
          headerStyle: { backgroundColor: '#000' },
          headerTitleStyle: { color: '#fff', fontWeight: '600' },
          headerTintColor: '#fff',
          contentStyle: { backgroundColor: '#000' },
        }}
      >
        <Stack.Screen
          name="Name"
          component={NameScreen}
          options={{ title: "What's your name?" }}
        />
        <Stack.Screen
          name="JoinCode"
          component={JoinCodeScreen}
          options={{ title: 'Join code' }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Home' }}
        />
        <Stack.Screen
          name="GenerateCode"
          component={GenerateCodeScreen}
          options={{ title: 'Create join code' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
