import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToS3, UploadResult } from '../lib/s3';

export const usePhotoUpload = () => {
  const [uploading, setUploading] = useState(false);

  const takeAndUploadPhoto = async (): Promise<UploadResult> => {
    try {
      // Request camera permissions
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        return {
          success: false,
          error: 'Permission to access camera is required!',
        };
      }

      // Take photo
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled) {
        return {
          success: false,
          error: 'Photo capture was canceled',
        };
      }

      setUploading(true);

      // Upload to S3
      const uploadResult = await uploadImageToS3(
        result.assets[0].uri,
        `photo_${Date.now()}.jpg`
      );

      return uploadResult;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    } finally {
      setUploading(false);
    }
  };

  return {
    takeAndUploadPhoto,
    uploading,
  };
};
