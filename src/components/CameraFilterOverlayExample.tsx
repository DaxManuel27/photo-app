import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import CameraFilterOverlay from './CameraFilterOverlay';

// Example usage of CameraFilterOverlay component
const CameraFilterOverlayExample: React.FC = () => {
  // Example image URI - replace with actual image
  const exampleImageUri = 'https://picsum.photos/400/600';

  return (
    <View style={styles.container}>
      <CameraFilterOverlay 
        imageUri={exampleImageUri}
        style={styles.overlay}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    width: '100%',
    height: '100%',
  },
});

export default CameraFilterOverlayExample;
