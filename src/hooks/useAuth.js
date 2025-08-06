// src/hooks/useAuth.js
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
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
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Helper function to get avatar URL with fallback hierarchy and cache busting
  const getAvatarUrl = useCallback((userData, profileData, forceRefresh = false) => {
    console.log('🦋 Getting avatar URL with fallback hierarchy');
    console.log('📊 Profile data:', {
      hasProfile: !!profileData,
      avatarUrl: profileData?.avatar_url ? 'EXISTS' : 'NULL'
    });
    console.log('📊 User metadata:', {
      hasUser: !!userData,
      avatarUrl: userData?.user_metadata?.avatar_url ? 'EXISTS' : 'NULL'
    });

    // Priority order: database avatar_url → user_metadata avatar_url → default
    let finalUrl = null;
    
    if (profileData?.avatar_url) {
      finalUrl = profileData.avatar_url;
      console.log('✅ Using database avatar URL');
    } else if (userData?.user_metadata?.avatar_url) {
      finalUrl = userData.user_metadata.avatar_url;
      console.log('✅ Using user metadata avatar URL');
    } else {
      console.log('ℹ️ No avatar URL found, will use default');
      return null;
    }

    // Add cache busting parameter to prevent stale images
    if (finalUrl && forceRefresh) {
      try {
        const url = new URL(finalUrl);
        url.searchParams.set('t', Date.now());
        finalUrl = url.toString();
        console.log('🔄 Added cache busting parameter');
      } catch (e) {
        console.warn('⚠️ Failed to add cache busting parameter:', e);
      }
    }

    console.log('🎯 Final avatar URL:', finalUrl ? 'SET' : 'NULL');
    return finalUrl;
  }, []);

  // Helper function to load user profile with avatar
  const loadUserProfile = useCallback(async (userId) => {
    try {
      console.log('🦋 Loading user profile for:', userId);
      
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('❌ Profile error:', profileError);
        return null;
      }

      if (userProfile) {
        console.log('✅ Profile loaded:', {
          id: userProfile.id,
          avatar_url: userProfile.avatar_url ? 'EXISTS' : 'NULL',
          display_name: userProfile.display_name,
          email: userProfile.email
        });
        return userProfile;
      }

      console.log('ℹ️ No profile found for user');
      return null;
    } catch (error) {
      console.error('💥 Error loading user profile:', error);
      return null;
    }
  }, []);

  // Helper function to create user profile
  const createUserProfile = useCallback(async (userData) => {
    try {
      console.log('🦋 Creating user profile for:', userData.email);
      console.log('🦋 User metadata:', userData.user_metadata);
      
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: userData.id,
          email: userData.email,
          username: userData.user_metadata?.username || userData.email?.split('@')[0] || 'user',
          full_name: userData.user_metadata?.full_name || userData.user_metadata?.username || userData.email?.split('@')[0] || 'User',
          display_name: userData.user_metadata?.username || userData.email?.split('@')[0] || 'User',
          avatar_url: userData.user_metadata?.avatar_url || null, // Include avatar from metadata if available
          wings_balance: 0,
          current_week_wings: 0,
          week_start_date: new Date().toISOString(),
          role: 'user',
          clothing_size: userData.user_metadata?.clothing_size || null
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating profile:', createError);
        return null;
      }

      console.log('✅ User profile created:', {
        id: newProfile.id,
        avatar_url: newProfile.avatar_url ? 'EXISTS' : 'NULL'
      });
      return newProfile;
    } catch (createErr) {
      console.error('💥 Error creating profile:', createErr);
      return null;
    }
  }, []);

  // Function to update avatar URL in context
  const updateAvatarUrl = useCallback((newAvatarUrl) => {
    console.log('🔄 Updating avatar URL in context:', newAvatarUrl ? 'SET' : 'NULL');
    setAvatarUrl(newAvatarUrl);
  }, []);

  // Function to refresh avatar URL with cache busting
  const refreshAvatarUrl = useCallback(() => {
    const newAvatarUrl = getAvatarUrl(user, profile, true);
    console.log('🔄 Refreshing avatar URL with cache busting');
    setAvatarUrl(newAvatarUrl);
  }, [user, profile, getAvatarUrl]);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          console.log('🦋 Session found for user:', session.user.id);
          setUser(session.user);
          
          // Load or create user profile
          let userProfile = await loadUserProfile(session.user.id);
          
          if (!userProfile) {
            userProfile = await createUserProfile(session.user);
          }
          
          setProfile(userProfile);
          
          // Set avatar URL with fallback hierarchy
          const avatarUrl = getAvatarUrl(session.user, userProfile);
          setAvatarUrl(avatarUrl);
          
        } else {
          console.log('🦋 No session found');
          setUser(null);
          setProfile(null);
          setAvatarUrl(null);
        }
      } catch (error) {
        console.error('💥 Error fetching session:', error);
        setUser(null);
        setProfile(null);
        setAvatarUrl(null);
      } finally {
        setLoading(false);
      }
    };

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ Auth loading timeout - forcing completion');
      setLoading(false);
    }, 5000); // 5 second timeout

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          console.log('🔄 Auth state change:', event, session?.user?.id);
          
          if (event === 'SIGNED_OUT') {
            // Comprehensive cleanup on sign out
            setUser(null);
            setProfile(null);
            setAvatarUrl(null);
            
            // Perform comprehensive cleanup
            await performAuthCleanup();
            
            console.log('✅ Auth state cleared on sign out');
          } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (session?.user) {
              console.log('🦋 User signed in/refreshed:', session.user.id);
              setUser(session.user);
              
              // Load or create user profile
              let userProfile = await loadUserProfile(session.user.id);
              
              if (!userProfile) {
                userProfile = await createUserProfile(session.user);
              }
              
              setProfile(userProfile);
              
              // Set avatar URL with fallback hierarchy
              const avatarUrl = getAvatarUrl(session.user, userProfile);
              setAvatarUrl(avatarUrl);
              
            } else {
              setUser(null);
              setProfile(null);
              setAvatarUrl(null);
            }
          }
        } catch (error) {
          console.error('💥 Error in auth state change:', error);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => {
      clearTimeout(timeoutId);
      authListener.subscription.unsubscribe();
    };
  }, [loadUserProfile, createUserProfile, getAvatarUrl]);

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clear local state immediately for better UX
      setUser(null);
      setProfile(null);
      setAvatarUrl(null);
      
      // Perform quick cleanup in background
      const cleanupPromise = performAuthCleanup();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Sign out error:', error);
        throw error;
      }
      
      // Wait for cleanup to complete but with timeout
      try {
        await Promise.race([
          cleanupPromise,
          new Promise(resolve => setTimeout(resolve, 2000)) // 2 second timeout
        ]);
      } catch (cleanupError) {
        console.warn('⚠️ Cleanup timeout or error:', cleanupError);
      }
      
      console.log('✅ Successfully signed out');
      return { success: true };
    } catch (error) {
      console.error('💥 Error during sign out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      console.log('🔄 Refreshing profile for user:', user.id);
      const userProfile = await loadUserProfile(user.id);
      setProfile(userProfile);
      
      // Update avatar URL with fresh data
      const newAvatarUrl = getAvatarUrl(user, userProfile, true);
      setAvatarUrl(newAvatarUrl);
      
      console.log('✅ Profile refreshed:', userProfile ? 'SUCCESS' : 'FAILED');
    } catch (error) {
      console.error('💥 Error refreshing profile:', error);
    }
  };

  const value = {
    user,
    profile,
    loading,
    avatarUrl, // Add avatar URL to context
    isAdmin: profile?.role === 'admin',
    signOut,
    refreshProfile,
    updateAvatarUrl, // Function to update avatar URL
    refreshAvatarUrl, // Function to refresh with cache busting
    getAvatarUrl, // Export helper function
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
}; 