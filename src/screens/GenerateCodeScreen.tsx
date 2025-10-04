import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '../contexts/AuthContext';
import { createGroup } from '../lib/groups';
import { testDatabaseConnection } from '../lib/database';

export default function GenerateCodeScreen() {
  const { user } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdGroup, setCreatedGroup] = useState<{ join_code: string; group_name: string } | null>(null);

  const canCreate = groupName.trim().length > 0 && !loading;

  const handleCreateGroup = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a group');
      return;
    }

    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    setLoading(true);

    try {
      // Test database connection first
      console.log('🔍 Testing database connection...');
      const dbTest = await testDatabaseConnection();
      if (!dbTest.success) {
        Alert.alert('Database Error', `Database connection failed: ${dbTest.error}`);
        return;
      }

      console.log('✅ Database connection successful, creating group...');
      const result = await createGroup(groupName.trim(), user.id);
      
      if (result.success && result.group) {
        setCreatedGroup({
          join_code: result.group.join_code,
          group_name: result.group.group_name
        });
        Alert.alert('Success', `Group "${result.group.group_name}" created successfully!`);
      } else {
        Alert.alert('Error', result.error || 'Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <Text style={styles.heading}>Create a new group</Text>
        <Text style={styles.subheading}>Enter a name for your group and click "Create Group" to generate a join code</Text>
        
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
          editable={!loading && !createdGroup}
        />

        {!createdGroup ? (
          <TouchableOpacity
            style={[styles.createButton, !canCreate && styles.createButtonDisabled]}
            activeOpacity={0.8}
            disabled={!canCreate}
            onPress={handleCreateGroup}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={[styles.createButtonText, !canCreate && styles.createButtonTextDisabled]}>
                Create Group
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <>
            <Text style={styles.codeLabel}>Your join code</Text>
            <Text style={styles.code}>{createdGroup.join_code}</Text>
            <Text style={styles.hint}>Share this code with others to join "{createdGroup.group_name}".</Text>
            <TouchableOpacity
              style={styles.copyButton}
              activeOpacity={0.85}
              onPress={async () => {
                await Clipboard.setStringAsync(createdGroup.join_code);
                Alert.alert('Copied', 'Join code copied to clipboard');
              }}
            >
              <Text style={styles.copyButtonText}>Copy code</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.createAnotherButton}
              activeOpacity={0.8}
              onPress={() => {
                setCreatedGroup(null);
                setGroupName('');
              }}
            >
              <Text style={styles.createAnotherButtonText}>Create Another Group</Text>
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
  heading: { color: '#fff', fontSize: 28, fontWeight: '700', marginBottom: 8, letterSpacing: 0.3 },
  subheading: { color: 'rgba(255,255,255,0.7)', fontSize: 16, marginBottom: 24, textAlign: 'center', lineHeight: 22 },
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
  createButton: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  createButtonDisabled: { opacity: 0.25 },
  createButtonText: { 
    color: '#000', 
    fontSize: 17, 
    fontWeight: '700', 
    letterSpacing: 0.4 
  },
  createButtonTextDisabled: { color: 'rgba(0,0,0,0.6)' },
  codeLabel: { color: '#fff', fontSize: 18, opacity: 0.8, marginBottom: 8, textAlign: 'center' },
  code: { color: '#fff', fontSize: 40, fontWeight: '800', letterSpacing: 4, marginBottom: 12, textAlign: 'center' },
  hint: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 16, textAlign: 'center' },
  copyButton: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10, alignSelf: 'center', marginBottom: 16 },
  copyButtonText: { color: '#000', fontSize: 16, fontWeight: '700' },
  createAnotherButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  createAnotherButtonText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
