import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import CameraFilterOverlay from './CameraFilterOverlay';

// Test component to verify CameraFilterOverlay works
const CameraFilterTest: React.FC = () => {
  // Test with a sample image
  const testImageUri = 'https://picsum.photos/400/600';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Camera Filter Test</Text>
      
      <View style={styles.imageContainer}>
        <CameraFilterOverlay 
          imageUri={testImageUri}
          style={styles.overlay}
        />
      </View>
      
      <Text style={styles.description}>
        You should see:
        {'\n'}• Image with camera overlay
        {'\n'}• Blinking red "REC ●" indicator (top-left)
        {'\n'}• Live timestamp in orange (bottom-left)
        {'\n'}• Digital camera aesthetic
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  overlay: {
    width: '100%',
    height: '100%',
  },
  description: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});

export default CameraFilterTest;
