import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Dimensions,
  StatusBar
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { generatePresignedUrl } from '../lib/s3-debug';
import { Photo } from '../lib/photos';

type Props = NativeStackScreenProps<RootStackParamList, 'PhotoDetail'>;

const { width, height } = Dimensions.get('window');

export default function PhotoDetailScreen({ navigation, route }: Props) {
  const { photo } = route.params;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(true);
  
  // Generate presigned URL for secure access
  useEffect(() => {
    const loadImageUrl = async () => {
      try {
        setLoadingImage(true);
        const presignedUrl = await generatePresignedUrl(photo.s3_key);
        if (presignedUrl) {
          setImageUrl(presignedUrl);
        } else {
          // Fallback to direct S3 URL
          const bucketName = process.env.EXPO_PUBLIC_S3_BUCKET_NAME;
          const region = process.env.EXPO_PUBLIC_AWS_REGION;
          const fallbackUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${photo.s3_key}`;
          setImageUrl(fallbackUrl);
        }
      } catch (error) {
        console.error('Error generating presigned URL:', error);
        // Fallback to direct S3 URL
        const bucketName = process.env.EXPO_PUBLIC_S3_BUCKET_NAME;
        const region = process.env.EXPO_PUBLIC_AWS_REGION;
        const fallbackUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${photo.s3_key}`;
        setImageUrl(fallbackUrl);
      } finally {
        setLoadingImage(false);
      }
    };
    
    loadImageUrl();
  }, [photo.s3_key]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Photo</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Photo Container */}
      <View style={styles.photoContainer}>
        {loadingImage ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Loading photo...</Text>
          </View>
        ) : imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.photo}
            resizeMode="contain"
            onError={(error) => {
              console.error('❌ Error loading image:', imageUrl);
              console.error('Error details:', error.nativeEvent.error);
            }}
            onLoad={() => {
              console.log('✅ Image loaded successfully:', imageUrl);
            }}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>📷</Text>
            <Text style={styles.errorText}>Failed to load photo</Text>
          </View>
        )}
      </View>

      {/* Photo Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.uploadDate}>
          Uploaded on {formatDate(photo.uploaded_at)}
        </Text>
        <Text style={styles.photoId}>
          Photo ID: {photo.id}
        </Text>
      </View>
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
  headerTitle: {
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
  photoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  photo: {
    width: width - 32,
    height: height * 0.6,
    maxWidth: '100%',
    maxHeight: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
  },
  infoContainer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  uploadDate: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  photoId: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
});
