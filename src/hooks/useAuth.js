// src/hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';
import { performAuthCleanup } from '../utils/authCleanup';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          setUser(session.user);
          const { data: userProfile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) throw profileError;
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setLoading(false);
      }
    };

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('Auth loading timeout - forcing completion');
      setLoading(false);
    }, 5000); // 5 second timeout

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          console.log('Auth state change:', event, session?.user?.id);
          
          if (event === 'SIGNED_OUT') {
            // Comprehensive cleanup on sign out
            setUser(null);
            setProfile(null);
            
            // Perform comprehensive cleanup
            await performAuthCleanup();
            
            console.log('Auth state cleared on sign out');
          } else {
            setUser(session?.user ?? null);

            if (session?.user) {
              const { data: userProfile, error: profileError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (profileError) throw profileError;
              setProfile(userProfile);
            } else {
              setProfile(null);
            }
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => {
      clearTimeout(timeoutId);
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clear local state immediately for better UX
      setUser(null);
      setProfile(null);
      
      // Perform quick cleanup in background
      const cleanupPromise = performAuthCleanup();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      
      // Wait for cleanup to complete but with timeout
      try {
        await Promise.race([
          cleanupPromise,
          new Promise(resolve => setTimeout(resolve, 2000)) // 2 second timeout
        ]);
      } catch (cleanupError) {
        console.warn('Cleanup timeout or error:', cleanupError);
      }
      
      console.log('Successfully signed out');
      return { success: true };
    } catch (error) {
      console.error('Error during sign out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
}; 