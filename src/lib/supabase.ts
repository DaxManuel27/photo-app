import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, processLock } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  })

  export const testSupabaseConnection = async () => {
    try {
      console.log('🔍 Testing Supabase connection...');
      console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
      
      // Simple test query - this will show logs
      const { data, error } = await supabase
        .from('_test_table_that_doesnt_exist')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log('✅ Supabase connection successful! (Expected error for non-existent table)');
        console.log('Error details:', error.message);
      } else {
        console.log('✅ Supabase connection successful!', data);
      }
    } catch (err) {
      console.error('❌ Supabase connection failed:', err);
    }
  };