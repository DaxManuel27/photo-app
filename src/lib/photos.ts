import { supabase } from './supabase';

export interface Photo {
  id: string;
  group_id: string;
  user_id: string | null;
  s3_key: string;
  uploaded_at: string;
  expires_at: string;
}

export interface PhotoUploadResult {
  success: boolean;
  photo?: Photo;
  error?: string;
}

export interface GetPhotosResult {
  success: boolean;
  photos?: Photo[];
  error?: string;
}

/**
 * Upload a photo to a group and save the record to the database
 */
export const uploadPhotoToGroup = async (
  groupId: string,
  userId: string,
  s3Key: string,
  expiresAt?: Date
): Promise<PhotoUploadResult> => {
  try {
    console.log('📸 Uploading photo to group:', { groupId, userId, s3Key });
    
    if (!groupId || !userId || !s3Key) {
      return {
        success: false,
        error: 'Missing required parameters: groupId, userId, or s3Key'
      };
    }

    // Set default expiration to 7 days from now
    const defaultExpiration = new Date();
    defaultExpiration.setDate(defaultExpiration.getDate() + 7);
    const expirationDate = expiresAt || defaultExpiration;

    // Insert photo record into database
    const { data: photo, error } = await supabase
      .from('photos')
      .insert({
        group_id: groupId,
        user_id: userId,
        s3_key: s3Key,
        expires_at: expirationDate.toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error saving photo to database:', error);
      return {
        success: false,
        error: error.message
      };
    }

    console.log('✅ Photo saved successfully:', photo);
    return {
      success: true,
      photo: photo
    };

  } catch (error) {
    console.error('❌ Unexpected error uploading photo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Get all photos for a specific group
 */
export const getGroupPhotos = async (groupId: string): Promise<GetPhotosResult> => {
  try {
    console.log('📸 Fetching photos for group:', groupId);
    
    if (!groupId) {
      return {
        success: false,
        error: 'Group ID is required'
      };
    }

    const { data: photos, error } = await supabase
      .from('photos')
      .select('*')
      .eq('group_id', groupId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching photos:', error);
      return {
        success: false,
        error: error.message
      };
    }

    console.log('✅ Photos fetched successfully:', photos?.length || 0);
    return {
      success: true,
      photos: photos || []
    };

  } catch (error) {
    console.error('❌ Unexpected error fetching photos:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Delete a photo from both database and S3
 */
export const deletePhoto = async (
  photoId: string,
  s3Key: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🗑️ Deleting photo:', { photoId, s3Key });
    
    // Delete from database first
    const { error: dbError } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId);

    if (dbError) {
      console.error('❌ Error deleting photo from database:', dbError);
      return {
        success: false,
        error: dbError.message
      };
    }

    console.log('✅ Photo deleted successfully');
    return { success: true };

  } catch (error) {
    console.error('❌ Unexpected error deleting photo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Get photos uploaded by a specific user
 */
export const getUserPhotos = async (userId: string): Promise<GetPhotosResult> => {
  try {
    console.log('📸 Fetching photos for user:', userId);
    
    const { data: photos, error } = await supabase
      .from('photos')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching user photos:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      photos: photos || []
    };

  } catch (error) {
    console.error('❌ Unexpected error fetching user photos:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
