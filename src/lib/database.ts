import { supabase } from './supabase';

/**
 * Test database connection and table existence
 */
export const testDatabaseConnection = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test if we can connect to Supabase
    const { data, error } = await supabase
      .from('groups')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection error:', error);
      return {
        success: false,
        error: `Database connection failed: ${error.message}`
      };
    }
    
    console.log('✅ Database connection successful');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Unexpected database error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error'
    };
  }
};

/**
 * Check if required tables exist
 */
export const checkTablesExist = async (): Promise<{ success: boolean; missingTables?: string[]; error?: string }> => {
  try {
    const tables = ['groups', 'group_members', 'users', 'photos'];
    const missingTables: string[] = [];
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error && error.code === 'PGRST106') {
          // Table doesn't exist
          missingTables.push(table);
        } else if (error) {
          console.warn(`⚠️ Warning checking table ${table}:`, error.message);
        } else {
          console.log(`✅ Table ${table} exists`);
        }
      } catch (tableError) {
        console.warn(`⚠️ Error checking table ${table}:`, tableError);
        missingTables.push(table);
      }
    }
    
    if (missingTables.length > 0) {
      return {
        success: false,
        missingTables,
        error: `Missing tables: ${missingTables.join(', ')}`
      };
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error checking tables:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error checking tables'
    };
  }
};

/**
 * Initialize database - run this once to set up tables
 */
export const initializeDatabase = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🚀 Initializing database...');
    
    // First check if tables exist
    const tableCheck = await checkTablesExist();
    if (tableCheck.success) {
      console.log('✅ All tables already exist');
      return { success: true };
    }
    
    console.log('⚠️ Some tables are missing. Please run the SQL from db.sql in your Supabase dashboard.');
    console.log('Missing tables:', tableCheck.missingTables);
    
    return {
      success: false,
      error: `Please create the missing tables: ${tableCheck.missingTables?.join(', ')}`
    };
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error initializing database'
    };
  }
};
