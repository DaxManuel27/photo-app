import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToS3, UploadResult } from '../lib/s3';
import { uploadPhotoToGroup, PhotoUploadResult } from '../lib/photos';

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

  // New function to upload photo to a specific group
  const takeAndUploadPhotoToGroup = async (
    groupId: string, 
    userId: string
  ): Promise<PhotoUploadResult> => {
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

      if (!uploadResult.success || !uploadResult.s3Key) {
        return {
          success: false,
          error: uploadResult.error || 'Failed to upload to S3',
        };
      }

      // Save photo record to database
      const dbResult = await uploadPhotoToGroup(groupId, userId, uploadResult.s3Key);
      
      if (!dbResult.success) {
        return {
          success: false,
          error: dbResult.error || 'Failed to save photo to database',
        };
      }

      return {
        success: true,
        photo: dbResult.photo,
      };

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
    takeAndUploadPhotoToGroup,
    uploading,
  };
};
