import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { usePhotoUpload } from './usePhotoUpload';

type Props = { route: { params?: { name?: string } } };

export default function HomeScreen({ route }: Props) {
  const name = route?.params?.name ?? 'Friend';
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const { takeAndUploadPhoto, uploading } = usePhotoUpload();

  const handleTakePhoto = async () => {
    const result = await takeAndUploadPhoto();
    if (result.success && result.url) {
      setUploadedImages(prev => [...prev, result.url!]);
      Alert.alert('Success', 'Photo uploaded successfully!');
    } else {
      Alert.alert('Error', result.error || 'Failed to upload photo');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.heading}>You're in 🎉</Text>
        <Text style={styles.subheading}>Welcome, {name}</Text>
      </View>

      <TouchableOpacity
        style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
        onPress={handleTakePhoto}
        disabled={uploading}
      >
        <Text style={styles.uploadButtonText}>
          {uploading ? 'Uploading...' : '📸 Take Photo'}
        </Text>
      </TouchableOpacity>

      {uploadedImages.length > 0 && (
        <View style={styles.photosContainer}>
          <Text style={styles.photosTitle}>Your Photos</Text>
          <View style={styles.photosGrid}>
            {uploadedImages.map((imageUrl, index) => (
              <Image
                key={index}
                source={{ uri: imageUrl }}
                style={styles.photo}
                resizeMode="cover"
              />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  contentContainer: {
    padding: 24,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  heading: { 
    color: '#fff', 
    fontSize: 28, 
    fontWeight: '800', 
    marginBottom: 8 
  },
  subheading: { 
    color: 'rgba(255,255,255,0.85)', 
    fontSize: 18 
  },
  uploadButton: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 30,
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  uploadButtonText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  photosContainer: {
    width: '100%',
  },
  photosTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photo: {
    width: '48%',
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
  },
});


