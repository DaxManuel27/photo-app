import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userName: string | null;
  loading: boolean;
  needsName: boolean;
  signOut: () => Promise<void>;
  setUserName: (name: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userName: null,
  loading: true,
  needsName: false,
  signOut: async () => {},
  setUserName: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [needsName, setNeedsName] = useState(false);
  const [loading, setLoading] = useState(true);

  // Function to get user display name from database
  const getUserDisplayName = async (user: User | null) => {
    if (!user) {
      console.log('❌ No user available');
      setUserName(null);
      setNeedsName(false);
      return;
    }

    try {
      // Check if user exists in our users table
      const { data: userData, error } = await supabase
        .from('users')
        .select('name')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user data:', error);
        setNeedsName(true);
        return;
      }

      if (userData && userData.name) {
        console.log('✅ Found user name in database:', userData.name);
        setUserName(userData.name);
        setNeedsName(false);
      } else {
        console.log('⚠️ No name found in database, user needs to set name');
        setUserName(null);
        setNeedsName(true);
      }
    } catch (error) {
      console.error('Error in getUserDisplayName:', error);
      setNeedsName(true);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Get display name from database
          await getUserDisplayName(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Get display name from database when signing in
        if (event === 'SIGNED_IN') {
          await getUserDisplayName(session?.user ?? null);
        }
        
        // Clear userName and needsName when signing out
        if (event === 'SIGNED_OUT') {
          setUserName(null);
          setNeedsName(false);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
    } catch (error) {
      console.error('Error in signOut:', error);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    userName,
    loading,
    needsName,
    signOut,
    setUserName,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
