import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  ActivityIndicator,
  Alert,
  Dimensions 
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { usePhotoUpload } from './usePhotoUpload';
import { getGroupPhotos, Photo } from '../lib/photos';

type Props = NativeStackScreenProps<RootStackParamList, 'Group'>;

// Using Photo interface from photos.ts

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 48) / 2; // 2 columns with padding

export default function GroupScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const { takeAndUploadPhotoToGroup, uploading } = usePhotoUpload();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get group info from route params
  const groupId = route.params?.groupId;
  const groupName = route.params?.groupName || 'Group';

  useEffect(() => {
    if (groupId) {
      fetchGroupPhotos();
    }
  }, [groupId]);

  const fetchGroupPhotos = async () => {
    try {
      setLoading(true);
      const result = await getGroupPhotos(groupId);
      
      if (result.success && result.photos) {
        setPhotos(result.photos);
      } else {
        console.error('Error fetching photos:', result.error);
        Alert.alert('Error', 'Failed to load photos');
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
      Alert.alert('Error', 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to take photos');
      return;
    }

    if (!groupId) {
      Alert.alert('Error', 'Group not found');
      return;
    }

    try {
      const result = await takeAndUploadPhotoToGroup(groupId, user.id);
      
      if (result.success) {
        Alert.alert('Success', 'Photo uploaded successfully!');
        // Refresh photos
        fetchGroupPhotos();
      } else {
        Alert.alert('Error', result.error || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const renderPhoto = ({ item }: { item: Photo }) => {
    // Construct S3 URL from bucket name and S3 key
    const bucketName = process.env.EXPO_PUBLIC_S3_BUCKET_NAME;
    const region = process.env.EXPO_PUBLIC_AWS_REGION;
    const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${item.s3_key}`;
    
    return (
      <TouchableOpacity style={styles.photoContainer} activeOpacity={0.8}>
        <Image 
          source={{ uri: s3Url }} 
          style={styles.photo}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📸</Text>
      <Text style={styles.emptyTitle}>No photos yet</Text>
      <Text style={styles.emptySubtitle}>Be the first to add a photo to this group!</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.groupTitle}>{groupName}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Photos Grid */}
      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading photos...</Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhoto}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.photosContainer}
          columnWrapperStyle={styles.photoRow}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Camera Button */}
      <TouchableOpacity
        style={styles.cameraButton}
        onPress={handleTakePhoto}
        activeOpacity={0.8}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#000" size="small" />
        ) : (
          <Text style={styles.cameraButtonIcon}>📷</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  groupTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40,
  },
  photosContainer: {
    padding: 16,
    paddingBottom: 100, // Space for camera button
  },
  photoRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  photoContainer: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginTop: 16,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cameraButtonIcon: {
    fontSize: 24,
  },
});
