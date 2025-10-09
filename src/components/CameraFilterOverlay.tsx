import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Platform,
} from 'react-native';

// Get screen dimensions for responsive scaling
const { width: screenWidth } = Dimensions.get('window');

interface CameraFilterOverlayProps {
  imageUri: string;
  style?: any;
}

const CameraFilterOverlay: React.FC<CameraFilterOverlayProps> = ({
  imageUri,
  style,
}) => {
  console.log('🎥 CameraFilterOverlay rendering with imageUri:', imageUri);
  
  // State for current date and time
  const [currentDateTime, setCurrentDateTime] = useState<string>('');

  // Update date and time every second
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      
      setCurrentDateTime(`${year}.${month}.${day} ${hours}:${minutes}`);
    };

    // Update immediately
    updateDateTime();
    
    // Set up interval to update every second
    const interval = setInterval(updateDateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);


  // Handle missing imageUri
  if (!imageUri) {
    console.warn('⚠️ CameraFilterOverlay: No imageUri provided');
    return (
      <View style={[styles.container, style]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No image provided</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Main image with warm/retro filter */}
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        resizeMode="cover"
        onError={(error) => {
          console.error('❌ CameraFilterOverlay: Image load error:', error);
        }}
        onLoad={() => {
          console.log('✅ CameraFilterOverlay: Image loaded successfully');
        }}
      />
      
      {/* Date and time overlay in bottom-right corner */}
      <View style={styles.dateOverlay}>
        <Text style={styles.dateText}>{currentDateTime}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  
  // Main image container with responsive scaling
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  
  // Date overlay positioned at bottom-right with no background
  dateOverlay: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    // No background - just transparent overlay
  },
  
  // Date text styling with orange color and monospaced font
  dateText: {
    color: '#FFA500', // Orange color as specified
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', // Monospaced font for digital clock aesthetic
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: {
      width: 1,
      height: 1,
    },
    textShadowRadius: 2,
  },
  
  // Error container styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CameraFilterOverlay;
