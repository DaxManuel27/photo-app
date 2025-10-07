import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Name'>;

export default function NameScreen({ navigation }: Props) {
  const { user, setUserName } = useAuth();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // No need to load from AsyncStorage anymore
    // The name will be saved directly to the database
  }, []);

  const canContinue = name.trim().length > 0;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Text style={styles.heading}>What's your name?</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
          />
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.button, !canContinue && styles.buttonDisabled]}
            disabled={!canContinue || loading}
            onPress={async () => {
              const trimmed = name.trim();
              if (!user) {
                Alert.alert('Error', 'You must be logged in to set your name');
                return;
              }

              try {
                setLoading(true);
                
                // Save name to database
                const { error } = await supabase
                  .from('users')
                  .upsert({
                    id: user.id,
                    name: trimmed,
                    created_at: new Date().toISOString()
                  });

                if (error) {
                  console.error('Error saving name to database:', error);
                  Alert.alert('Error', 'Failed to save name. Please try again.');
                  return;
                }

                // Update the auth context
                setUserName(trimmed);
                
                console.log('✅ Name saved successfully to database');
                navigation.navigate('Home');
              } catch (error) {
                console.error('Error saving name:', error);
                Alert.alert('Error', 'Failed to save name. Please try again.');
              } finally {
                setLoading(false);
              }
            }}
          >
            <Text style={[styles.buttonText, (!canContinue || loading) && styles.buttonTextDisabled]}>{loading ? 'Saving…' : 'Continue'}</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  heading: { color: '#fff', fontSize: 28, fontWeight: '700', marginBottom: 16, letterSpacing: 0.3 },
  input: {
    backgroundColor: '#000',
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.25 },
  buttonText: { color: '#000', fontSize: 17, fontWeight: '700', letterSpacing: 0.4 },
  buttonTextDisabled: { color: 'rgba(0,0,0,0.6)' },
});


