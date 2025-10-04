import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userName: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setUserName: (name: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userName: null,
  loading: true,
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
  const [loading, setLoading] = useState(true);

  // Function to get user display name from auth metadata
  const getUserDisplayName = (user: User | null) => {
    if (!user) {
      console.log('❌ No user available');
      setUserName(null);
      return;
    }

    const displayName = user.user_metadata?.display_name;
    
    if (displayName) {
      console.log('✅ Found display_name in metadata:', displayName);
      setUserName(displayName);
    } else {
      console.log('⚠️ No display_name in metadata');
      setUserName(null);
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
          
          // Get display name from user metadata
          getUserDisplayName(session?.user ?? null);
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
        
        // Get display name from user metadata when signing in
        if (event === 'SIGNED_IN') {
          getUserDisplayName(session?.user ?? null);
        }
        
        // Clear userName when signing out
        if (event === 'SIGNED_OUT') {
          setUserName(null);
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
    signOut,
    setUserName,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
