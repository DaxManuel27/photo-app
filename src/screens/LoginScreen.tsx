import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { supabase } from '../lib/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (isSignUp && !name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);
    
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: {
              display_name: name.trim(),
            }
          }
        });
        
        if (error) {
          Alert.alert('Sign Up Error', error.message);
        } else if (data.user) {
          console.log('✅ User created with display_name:', name.trim());
          Alert.alert('Success', 'Account created! Please check your email for verification.');
          setIsSignUp(false);
          setName(''); // Clear name field
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        
        if (error) {
          Alert.alert('Login Error', error.message);
        } else {
          // Navigation will be handled automatically by auth state change
          // No need to manually navigate - the AppNavigator will show protected routes
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const canContinue = email.trim().length > 0 && password.trim().length > 0 && (!isSignUp || name.trim().length > 0);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Text style={styles.heading}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
          
          {isSignUp && (
            <TextInput
              style={styles.input}
              placeholder="Your Name"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
            />
          )}
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            returnKeyType="next"
          />
          
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Password"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleAuth}
          />
          
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.button, !canContinue && styles.buttonDisabled]}
            disabled={!canContinue || loading}
            onPress={handleAuth}
          >
            <Text style={[styles.buttonText, (!canContinue || loading) && styles.buttonTextDisabled]}>
              {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Login')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsSignUp(!isSignUp)}
            disabled={loading}
          >
            <Text style={styles.switchText}>
              {isSignUp ? 'Already have an account? Login' : "Don't have an account? Create one"}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  heading: { 
    color: '#fff', 
    fontSize: 28, 
    fontWeight: '700', 
    marginBottom: 32, 
    letterSpacing: 0.3,
    textAlign: 'center'
  },
  input: {
    backgroundColor: '#000',
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    marginBottom: 16,
  },
  passwordInput: {
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: { opacity: 0.25 },
  buttonText: { 
    color: '#000', 
    fontSize: 17, 
    fontWeight: '700', 
    letterSpacing: 0.4 
  },
  buttonTextDisabled: { color: 'rgba(0,0,0,0.6)' },
  switchButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
