import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { testAWSSetup } from '../lib/s3-debug';

export const AWSTestButton = () => {
  const runDiagnostic = async () => {
    try {
      console.log('🧪 Starting AWS Diagnostic...');
      await testAWSSetup();
      Alert.alert('Test Complete', 'Check console for detailed results');
    } catch (error) {
      console.error('Diagnostic failed:', error);
      Alert.alert('Test Failed', 'Check console for error details');
    }
  };

  return (
    <TouchableOpacity style={styles.testButton} onPress={runDiagnostic}>
      <Text style={styles.testButtonText}>🧪 Test AWS</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  testButton: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    zIndex: 1000,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
