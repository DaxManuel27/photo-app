import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';

function generateJoinCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i += 1) {
    const idx = Math.floor(Math.random() * alphabet.length);
    result += alphabet[idx];
  }
  return result;
}

export default function GenerateCodeScreen() {
  const code = useMemo(() => generateJoinCode(), []);
  const [groupName, setGroupName] = useState('');

  const canCreate = groupName.trim().length > 0;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <Text style={styles.heading}>Create a new group</Text>
        
        <Text style={styles.label}>Group name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter group name"
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={groupName}
          onChangeText={setGroupName}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
        />

        {canCreate && (
          <>
            <Text style={styles.codeLabel}>Your join code</Text>
            <Text style={styles.code}>{code}</Text>
            <Text style={styles.hint}>Share this code with others to join "{groupName}".</Text>
            <TouchableOpacity
              style={styles.copyButton}
              activeOpacity={0.85}
              onPress={async () => {
                await Clipboard.setStringAsync(code);
                Alert.alert('Copied', 'Join code copied to clipboard');
              }}
            >
              <Text style={styles.copyButtonText}>Copy code</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  heading: { color: '#fff', fontSize: 28, fontWeight: '700', marginBottom: 24, letterSpacing: 0.3 },
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
    marginBottom: 20,
  },
  codeLabel: { color: '#fff', fontSize: 18, opacity: 0.8, marginBottom: 8, textAlign: 'center' },
  code: { color: '#fff', fontSize: 40, fontWeight: '800', letterSpacing: 4, marginBottom: 12, textAlign: 'center' },
  hint: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 16, textAlign: 'center' },
  copyButton: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10, alignSelf: 'center' },
  copyButtonText: { color: '#000', fontSize: 16, fontWeight: '700' },
});
