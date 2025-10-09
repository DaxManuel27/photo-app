import AWS from 'aws-sdk';

console.log('🔧 AWS Configuration Debug:');
console.log('Access Key ID length:', process.env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID?.length);
console.log('Secret Key length:', process.env.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY?.length);
console.log('Region:', process.env.EXPO_PUBLIC_AWS_REGION);
console.log('Bucket:', process.env.EXPO_PUBLIC_S3_BUCKET_NAME);

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  region: process.env.EXPO_PUBLIC_AWS_REGION!,
});

const s3 = new AWS.S3();

export interface UploadResult {
  success: boolean;
  url?: string;
  s3Key?: string;
  error?: string;
}

export const uploadImageToS3 = async (
  imageUri: string,
  fileName: string,
  bucketName: string = process.env.EXPO_PUBLIC_S3_BUCKET_NAME!
): Promise<UploadResult> => {
  try {
    // Convert image URI to blob for upload
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // Create unique filename with timestamp
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${fileName}`;
    const s3Key = `photos/${uniqueFileName}`;
    
    // Set expiration date to 7 days from now
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);
    
    const params = {
      Bucket: bucketName,
      Key: s3Key,
      Body: blob,
      ContentType: blob.type || 'image/jpeg',
      Expires: expirationDate,
      Metadata: {
        'expires-at': expirationDate.toISOString(),
        'auto-delete': 'true'
      }
     // ACL: 'public-read', // Make images publicly accessible
    };

    const result = await s3.upload(params).promise();
    
    return {
      success: true,
      url: result.Location,
      s3Key: s3Key, // Return the S3 key for database storage
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

export const deleteImageFromS3 = async (
  imageKey: string,
  bucketName: string = process.env.EXPO_PUBLIC_S3_BUCKET_NAME!
): Promise<boolean> => {
  try {
    await s3.deleteObject({
      Bucket: bucketName,
      Key: imageKey,
    }).promise();
    
    return true;
  } catch (error) {
    console.error('Error deleting from S3:', error);
    return false;
  }
};

export const generatePresignedUrl = async (
  imageKey: string,
  bucketName: string = process.env.EXPO_PUBLIC_S3_BUCKET_NAME!,
  expiresIn: number = 3600 // 1 hour
): Promise<string | null> => {
  try {
    const url = await s3.getSignedUrlPromise('getObject', {
      Bucket: bucketName,
      Key: imageKey,
      Expires: expiresIn,
    });
    
    return url;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return null;
  }
};

export { s3 };
