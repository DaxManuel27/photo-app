import { supabase } from './supabase';

export interface Group {
  id: string;
  join_code: string;
  group_name: string;
  created_at: string;
}

export interface CreateGroupResult {
  success: boolean;
  group?: Group;
  error?: string;
}

/**
 * Generates a unique join code for a group
 * Uses alphanumeric characters excluding confusing ones (0, O, I, 1)
 */
function generateJoinCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i += 1) {
    const idx = Math.floor(Math.random() * alphabet.length);
    result += alphabet[idx];
  }
  return result;
}

/**
 * Creates a new group with a unique join code
 */
export const createGroup = async (groupName: string, userId: string): Promise<CreateGroupResult> => {
  try {
    console.log('🚀 Creating group:', { groupName, userId });
    
    if (!groupName.trim()) {
      return {
        success: false,
        error: 'Group name is required'
      };
    }

    if (!userId) {
      return {
        success: false,
        error: 'User ID is required'
      };
    }

    // Generate a unique join code
    let joinCode: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      joinCode = generateJoinCode();
      
      // Check if this join code already exists
      const { data: existingGroup, error: checkError } = await supabase
        .from('groups')
        .select('id')
        .eq('join_code', joinCode)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        // No existing group found with this code - it's unique
        isUnique = true;
      } else if (checkError) {
        console.error('Error checking join code uniqueness:', checkError);
        return {
          success: false,
          error: 'Failed to generate unique join code'
        };
      } else {
        // Code already exists, try again
        attempts++;
      }
    }

    if (!isUnique) {
      return {
        success: false,
        error: 'Failed to generate unique join code after multiple attempts'
      };
    }

    // Create the group
    console.log('📝 Inserting group into database:', { join_code: joinCode!, group_name: groupName.trim() });
    const { data: group, error: createError } = await supabase
      .from('groups')
      .insert({
        join_code: joinCode!,
        group_name: groupName.trim()
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating group:', createError);
      return {
        success: false,
        error: createError.message
      };
    }

    console.log('✅ Group created successfully:', group);

    // Add the creator as a member of the group
    console.log('👥 Adding creator to group:', { user_id: userId, group_id: group.id });
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        user_id: userId,
        group_id: group.id
      });

    if (memberError) {
      console.error('❌ Error adding creator to group:', memberError);
      // Note: We don't fail here since the group was created successfully
      // The user can still use the group, they just won't be a member
    } else {
      console.log('✅ Creator added to group successfully');
    }

    return {
      success: true,
      group: group
    };

  } catch (error) {
    console.error('Unexpected error creating group:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
};

/**
 * Joins an existing group using a join code
 */
export const joinGroup = async (joinCode: string, userId: string): Promise<CreateGroupResult> => {
  try {
    if (!joinCode.trim()) {
      return {
        success: false,
        error: 'Join code is required'
      };
    }

    if (!userId) {
      return {
        success: false,
        error: 'User ID is required'
      };
    }

    // Find the group by join code
    const { data: group, error: findError } = await supabase
      .from('groups')
      .select('*')
      .eq('join_code', joinCode.trim().toUpperCase())
      .single();

    if (findError) {
      if (findError.code === 'PGRST116') {
        return {
          success: false,
          error: 'Invalid join code'
        };
      }
      console.error('Error finding group:', findError);
      return {
        success: false,
        error: findError.message
      };
    }

    // Check if user is already a member
    const { data: existingMember, error: memberCheckError } = await supabase
      .from('group_members')
      .select('id')
      .eq('user_id', userId)
      .eq('group_id', group.id)
      .single();

    if (memberCheckError && memberCheckError.code !== 'PGRST116') {
      console.error('Error checking existing membership:', memberCheckError);
      return {
        success: false,
        error: memberCheckError.message
      };
    }

    if (existingMember) {
      return {
        success: false,
        error: 'You are already a member of this group'
      };
    }

    // Add user to the group
    const { error: joinError } = await supabase
      .from('group_members')
      .insert({
        user_id: userId,
        group_id: group.id
      });

    if (joinError) {
      console.error('Error joining group:', joinError);
      return {
        success: false,
        error: joinError.message
      };
    }

    return {
      success: true,
      group: group
    };

  } catch (error) {
    console.error('Unexpected error joining group:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
};

/**
 * Gets all groups that a user is a member of
 */
export const getUserGroups = async (userId: string): Promise<{ success: boolean; groups?: Group[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('group_members')
      .select(`
        groups (
          id,
          join_code,
          group_name,
          created_at
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user groups:', error);
      return {
        success: false,
        error: error.message
      };
    }

    const groups = data?.map(item => item.groups).filter(Boolean) as Group[];

    return {
      success: true,
      groups: groups || []
    };

  } catch (error) {
    console.error('Unexpected error fetching user groups:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
};
