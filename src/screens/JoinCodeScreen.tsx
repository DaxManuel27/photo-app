import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { joinGroup } from '../lib/groups';

type Props = NativeStackScreenProps<RootStackParamList, 'JoinCode'>;

export default function JoinCodeScreen({ navigation }: Props) {
  const { userName, user } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Get display name with fallbacks
  const displayName = userName || user?.email?.split('@')[0] || 'Friend';

  const normalized = code.toUpperCase();
  const canJoin = normalized.trim().length > 0 && !loading;

  const handleJoinGroup = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to join a group');
      return;
    }

    if (!normalized.trim()) {
      Alert.alert('Error', 'Please enter a join code');
      return;
    }

    setLoading(true);

    try {
      const result = await joinGroup(normalized.trim(), user.id);
      
      if (result.success && result.group) {
        Alert.alert('Success', `Successfully joined "${result.group.group_name}"!`, [
          { text: 'OK', onPress: () => navigation.replace('Home') }
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to join group');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Text style={styles.subtle}>Welcome</Text>
          <Text style={styles.name}>{displayName}</Text>

          <Text style={styles.label}>Enter join code</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. ABC123"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={normalized}
            onChangeText={t => setCode(t.toUpperCase())}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="go"
            keyboardType="ascii-capable"
            maxLength={12}
          />

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.button, !canJoin && styles.buttonDisabled]}
            disabled={!canJoin}
            onPress={handleJoinGroup}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={[styles.buttonText, !canJoin && styles.buttonTextDisabled]}>Join</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => navigation.navigate('GenerateCode')}
            style={styles.linkButton}
            activeOpacity={0.8}
          >
            <Text style={styles.linkText}>Create a new join code</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  subtle: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 4 },
  name: { color: '#fff', fontSize: 26, fontWeight: '700', marginBottom: 24, letterSpacing: 0.3 },
  label: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 10 },
  input: {
    backgroundColor: '#000',
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    letterSpacing: 1,
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
  linkButton: { paddingVertical: 16, alignItems: 'center' },
  linkText: { color: 'rgba(255,255,255,0.85)', textDecorationLine: 'underline', fontSize: 15 },
});


