// Test function to debug AWS S3 issues
import { testAWSSetup } from './s3-debug';

export const runAWSDiagnostic = async () => {
  console.log('🧪 Starting AWS Diagnostic Test...');
  try {
    await testAWSSetup();
    console.log('✅ AWS Diagnostic completed - check console for results');
  } catch (error) {
    console.error('❌ AWS Diagnostic failed:', error);
  }
};
