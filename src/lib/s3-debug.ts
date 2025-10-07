import AWS from 'aws-sdk';

// Enhanced AWS Configuration Debug
console.log('🔧 ===== AWS CONFIGURATION DEBUG =====');
console.log('Access Key ID length:', process.env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID?.length);
console.log('Secret Key length:', process.env.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY?.length);
console.log('Region:', process.env.EXPO_PUBLIC_AWS_REGION);
console.log('Bucket:', process.env.EXPO_PUBLIC_S3_BUCKET_NAME);

// Check for missing environment variables
const missingVars = [];
if (!process.env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID) missingVars.push('EXPO_PUBLIC_AWS_ACCESS_KEY_ID');
if (!process.env.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY) missingVars.push('EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY');
if (!process.env.EXPO_PUBLIC_AWS_REGION) missingVars.push('EXPO_PUBLIC_AWS_REGION');
if (!process.env.EXPO_PUBLIC_S3_BUCKET_NAME) missingVars.push('EXPO_PUBLIC_S3_BUCKET_NAME');

if (missingVars.length > 0) {
  console.error('❌ Missing environment variables:', missingVars);
} else {
  console.log('✅ All environment variables present');
}

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

// Test function to diagnose AWS setup
export const testAWSSetup = async (): Promise<void> => {
  console.log('🧪 ===== AWS SETUP DIAGNOSTIC TEST =====');
  
  try {
    // Test 1: Environment Variables
    console.log('📋 Test 1: Environment Variables Check');
    const accessKey = process.env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID!;
    const secretKey = process.env.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY!;
    const region = process.env.EXPO_PUBLIC_AWS_REGION!;
    const bucket = process.env.EXPO_PUBLIC_S3_BUCKET_NAME!;
    
    console.log('  - Access Key length:', accessKey.length, '(should be 20)');
    console.log('  - Secret Key length:', secretKey.length, '(should be 40)');
    console.log('  - Access Key starts with AKIA:', accessKey.startsWith('AKIA'));
    console.log('  - Region:', region);
    console.log('  - Bucket:', bucket);
    
    // Validate credential format
    if (accessKey.length !== 20) {
      console.error('❌ Access Key should be exactly 20 characters');
    }
    if (secretKey.length !== 40) {
      console.error('❌ Secret Key should be exactly 40 characters');
    }
    if (!accessKey.startsWith('AKIA')) {
      console.error('❌ Access Key should start with AKIA');
    }
    
    // Test 2: AWS Credentials Test
    console.log('🔑 Test 2: AWS Credentials Test');
    try {
      const result = await s3.listBuckets().promise();
      console.log('✅ AWS credentials are valid');
      console.log('  - Available buckets:', result.Buckets?.map(b => b.Name));
    } catch (error: any) {
      console.error('❌ AWS credentials test failed:');
      console.error('  - Error code:', error.code);
      console.error('  - Error message:', error.message);
      console.error('  - Status code:', error.statusCode);
      
      if (error.code === 'SignatureDoesNotMatch') {
        console.error('🔍 SIGNATURE ERROR DETECTED:');
        console.error('  - Your AWS credentials are incorrect');
        console.error('  - Check Access Key ID and Secret Access Key');
        console.error('  - Verify no spaces in .env file');
        console.error('  - Check if region matches your bucket location');
      }
      throw error;
    }
    
    // Test 3: Bucket Access Test
    console.log('🪣 Test 3: Bucket Access Test');
    try {
      await s3.headBucket({ Bucket: bucket }).promise();
      console.log('✅ Bucket access successful');
    } catch (error: any) {
      console.error('❌ Bucket access failed:');
      console.error('  - Error code:', error.code);
      console.error('  - Error message:', error.message);
      
      if (error.code === 'NoSuchBucket') {
        console.error('🔍 BUCKET NOT FOUND:');
        console.error('  - Bucket name:', bucket);
        console.error('  - Check if bucket exists');
        console.error('  - Verify bucket name spelling');
      } else if (error.code === 'AccessDenied') {
        console.error('🔍 ACCESS DENIED:');
        console.error('  - You don\'t have permission to access this bucket');
        console.error('  - Check IAM permissions for S3 access');
      } else if (error.code === 'SignatureDoesNotMatch') {
        console.error('🔍 SIGNATURE ERROR:');
        console.error('  - Wrong AWS credentials');
        console.error('  - Wrong region (bucket might be in different region)');
      }
      throw error;
    }
    
    console.log('✅ ===== ALL TESTS PASSED =====');
    
  } catch (error: any) {
    console.error('❌ ===== DIAGNOSTIC TEST FAILED =====');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Status Code:', error.statusCode);
  }
};

export const uploadImageToS3 = async (
  imageUri: string,
  fileName: string,
  bucketName: string = process.env.EXPO_PUBLIC_S3_BUCKET_NAME!
): Promise<UploadResult> => {
  console.log('🚀 ===== S3 UPLOAD DEBUG START =====');
  console.log('📝 Input parameters:');
  console.log('  - imageUri:', imageUri);
  console.log('  - fileName:', fileName);
  console.log('  - bucketName:', bucketName);
  
  try {
    // Step 1: Convert image URI to blob
    console.log('📸 Step 1: Converting image URI to blob...');
    const response = await fetch(imageUri);
    console.log('  - Fetch status:', response.status);
    console.log('  - Fetch ok:', response.ok);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log('  - Blob size:', blob.size, 'bytes');
    console.log('  - Blob type:', blob.type);
    
    // Step 2: Create S3 key
    console.log('🔑 Step 2: Creating S3 key...');
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${fileName}`;
    const s3Key = `photos/${uniqueFileName}`;
    console.log('  - S3 Key:', s3Key);
    
    // Step 3: Prepare upload parameters
    console.log('📋 Step 3: Preparing upload parameters...');
    const params = {
      Bucket: bucketName,
      Key: s3Key,
      Body: blob,
      ContentType: blob.type || 'image/jpeg',
     // ACL: 'public-read',
    };
    
    console.log('  - Upload params:');
    console.log('    Bucket:', params.Bucket);
    console.log('    Key:', params.Key);
    console.log('    ContentType:', params.ContentType);
    console.log('    ACL:', params.ACL);
    console.log('    Body size:', blob.size, 'bytes');
    
    // Step 4: Test bucket access before upload
    console.log('🧪 Step 4: Testing bucket access...');
    try {
      await s3.headBucket({ Bucket: bucketName }).promise();
      console.log('  - ✅ Bucket access test successful');
    } catch (testError: any) {
      console.error('  - ❌ Bucket access test failed:');
      console.error('    Error code:', testError.code);
      console.error('    Error message:', testError.message);
      console.error('    Status code:', testError.statusCode);
      console.error('    Request ID:', testError.requestId);
      throw testError;
    }
    
    // Step 5: Upload to S3
    console.log('⬆️ Step 5: Uploading to S3...');
    const result = await s3.upload(params).promise();
    
    console.log('✅ Upload successful!');
    console.log('  - Location:', result.Location);
    console.log('  - ETag:', result.ETag);
    
    return {
      success: true,
      url: result.Location,
      s3Key: s3Key,
    };
    
  } catch (error: any) {
    console.error('❌ ===== S3 UPLOAD FAILED =====');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Status code:', error.statusCode);
    console.error('Request ID:', error.requestId);
    console.error('Full error:', error);
    
    // Detailed error analysis
    if (error.code === 'SignatureDoesNotMatch') {
      console.error('🔍 SIGNATURE ERROR ANALYSIS:');
      console.error('  Your current configuration:');
      console.error('    - Access Key:', process.env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID?.substring(0, 8) + '...');
      console.error('    - Region:', process.env.EXPO_PUBLIC_AWS_REGION);
      console.error('    - Bucket:', process.env.EXPO_PUBLIC_S3_BUCKET_NAME);
      console.error('  Common causes:');
      console.error('    1. Wrong Access Key ID');
      console.error('    2. Wrong Secret Access Key');
      console.error('    3. Wrong region (bucket in different region)');
      console.error('    4. Clock skew (system time wrong)');
      console.error('    5. Spaces in .env file around = sign');
      console.error('    6. Special characters in credentials');
    } else if (error.code === 'NoSuchBucket') {
      console.error('🔍 BUCKET NOT FOUND:');
      console.error('  - Bucket name:', bucketName);
      console.error('  - Check if bucket exists');
      console.error('  - Verify bucket name spelling');
    } else if (error.code === 'AccessDenied') {
      console.error('🔍 ACCESS DENIED:');
      console.error('  - Your AWS user lacks S3 permissions');
      console.error('  - Check IAM permissions for S3 access');
    }
    
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
  } catch (error: any) {
    console.error('Error deleting from S3:', error);
    return false;
  }
};

export const generatePresignedUrl = async (
  imageKey: string,
  bucketName: string = process.env.EXPO_PUBLIC_S3_BUCKET_NAME!,
  expiresIn: number = 3600
): Promise<string | null> => {
  try {
    const url = await s3.getSignedUrlPromise('getObject', {
      Bucket: bucketName,
      Key: imageKey,
      Expires: expiresIn,
    });
    
    return url;
  } catch (error: any) {
    console.error('Error generating presigned URL:', error);
    return null;
  }
};

export { s3 };