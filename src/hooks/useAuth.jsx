import { useState, useEffect, createContext, useContext } from 'react';
import supabase from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let mounted = true;
    let profileTimeout = null;

    // Initialize auth state immediately
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔐 Auth event:', event, session?.user?.email);
        setAuthError(null); // Clear any previous auth errors
        
        if (event === 'SIGNED_OUT') {
          console.log('🚪 User signed out - clearing state');
          setUser(null);
          setProfile(null);
          setLoading(false);
          setInitializing(false);
          return;
        }
        
        if (session?.user) {
          console.log('👤 User authenticated:', session.user.email);
          setUser(session.user);
          
          // Clear any existing profile timeout
          if (profileTimeout) {
            clearTimeout(profileTimeout);
          }
          
          // Load profile with retry mechanism
          await loadUserProfileWithRetry(session.user);
        } else {
          console.log('❌ No user session');
          setUser(null);
          setProfile(null);
        }
        
        setLoading(false);
        setInitializing(false);
      }
    );

    return () => {
      mounted = false;
      if (profileTimeout) {
        clearTimeout(profileTimeout);
      }
      subscription?.unsubscribe();
    };
  }, []);

  async function initializeAuth() {
    try {
      console.log('🚀 Initializing auth...');
      setAuthError(null);
      
      // Get current session with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth initialization timeout')), 10000)
      );
      
      const authPromise = supabase.auth.getSession();
      
      const { data: { session }, error } = await Promise.race([
        authPromise,
        timeoutPromise
      ]);
      
      if (error) {
        console.error('❌ Session error:', error);
        setAuthError(error.message);
        setLoading(false);
        setInitializing(false);
        return;
      }

      if (session?.user) {
        console.log('✅ Found existing session for:', session.user.email);
        setUser(session.user);
        await loadUserProfileWithRetry(session.user);
      } else {
        console.log('ℹ️ No existing session found');
      }
      
    } catch (error) {
      console.error('❌ Auth initialization failed:', error);
      setAuthError(error.message);
    } finally {
      setLoading(false);
      setInitializing(false);
    }
  }

  async function loadUserProfileWithRetry(user, retryCount = 0) {
    const maxRetries = 3;
    
    try {
      console.log(`👤 Loading profile for: ${user.email} (attempt ${retryCount + 1})`);
      
      // Set timeout for profile loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile loading timeout')), 8000)
      );
      
      // Try to get existing profile
      const profilePromise = supabase
        .from('user_profiles_pulse_2024')
        .select('*')
        .eq('id', user.id)
        .single();
      
      let profile;
      let error;
      
      try {
        const result = await Promise.race([profilePromise, timeoutPromise]);
        profile = result.data;
        error = result.error;
      } catch (timeoutError) {
        console.warn('⏰ Profile loading timed out');
        if (retryCount < maxRetries) {
          console.log(`🔄 Retrying profile load (${retryCount + 1}/${maxRetries})`);
          return await loadUserProfileWithRetry(user, retryCount + 1);
        }
        throw timeoutError;
      }

      if (error && error.code === 'PGRST116') {
        console.log('📝 Creating new profile...');
        profile = await createUserProfile(user);
      } else if (error) {
        console.warn('⚠️ Profile load error:', error.message);
        if (retryCount < maxRetries) {
          console.log(`🔄 Retrying profile load (${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
          return await loadUserProfileWithRetry(user, retryCount + 1);
        }
        // Use fallback profile
        profile = createFallbackProfile(user);
      } else {
        console.log('✅ Profile loaded successfully');
      }

      setProfile(profile);
      return profile;
      
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      
      if (retryCount < maxRetries) {
        console.log(`🔄 Retrying profile load (${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return await loadUserProfileWithRetry(user, retryCount + 1);
      }
      
      // Final fallback
      const fallbackProfile = createFallbackProfile(user);
      setProfile(fallbackProfile);
      return fallbackProfile;
    }
  }

  async function createUserProfile(user) {
    try {
      const newProfile = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        avatar_url: user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        role: 'user',
        created_at: new Date().toISOString()
      };

      const { data, error: insertError } = await Promise.race([
        supabase
          .from('user_profiles_pulse_2024')
          .insert([newProfile])
          .select()
          .single(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Profile creation timeout')), 5000))
      ]);

      if (insertError) {
        console.warn('⚠️ Failed to create profile in database:', insertError.message);
        return newProfile; // Return the profile anyway for local use
      }

      console.log('✅ Profile created successfully');
      return data;
      
    } catch (error) {
      console.warn('⚠️ Profile creation failed:', error.message);
      return createFallbackProfile(user);
    }
  }

  function createFallbackProfile(user) {
    return {
      id: user.id,
      email: user.email || 'user@example.com',
      full_name: user.email?.split('@')[0] || 'User',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      role: 'user',
      created_at: new Date().toISOString()
    };
  }

  async function updateProfile(updates) {
    if (!user?.id) {
      const error = new Error('No user logged in');
      console.error('❌ Update profile failed:', error.message);
      return { data: null, error };
    }

    try {
      console.log('🔄 Updating profile for:', user.email);
      
      // Update in Supabase with timeout and retry
      const { data, error } = await Promise.race([
        supabase
          .from('user_profiles_pulse_2024')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', user.id)
          .select()
          .single(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Profile update timeout')), 8000))
      ]);

      if (error) {
        console.warn('⚠️ Profile update failed:', error.message);
        // Update local state anyway for better UX
        const updatedProfile = { ...profile, ...updates };
        setProfile(updatedProfile);
        return { data: updatedProfile, error: null };
      }

      console.log('✅ Profile updated successfully');
      setProfile(data);
      return { data, error: null };
      
    } catch (error) {
      console.error('❌ Profile update exception:', error);
      // Update local state anyway
      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile);
      return { data: updatedProfile, error: null };
    }
  }

  async function signUp(email, password, fullName) {
    try {
      setLoading(true);
      setAuthError(null);
      console.log('📝 Signing up user:', email);
      
      const { data, error } = await Promise.race([
        supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim()
            }
          }
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Signup timeout - please try again')), 15000))
      ]);
      
      if (error) {
        console.error('❌ Sign up error:', error);
        setAuthError(error.message);
        return { data: null, error };
      }
      
      console.log('✅ Sign up successful');
      return { data, error: null };
      
    } catch (error) {
      console.error('❌ Sign up exception:', error);
      const errorMessage = error.message || 'Sign up failed - please try again';
      setAuthError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email, password) {
    try {
      setLoading(true);
      setAuthError(null);
      console.log('🔑 Signing in user:', email);
      
      const { data, error } = await Promise.race([
        supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Sign in timeout - please try again')), 15000))
      ]);
      
      if (error) {
        console.error('❌ Sign in error:', error);
        setAuthError(error.message);
        return { data: null, error };
      }
      
      console.log('✅ Sign in successful');
      return { data, error: null };
      
    } catch (error) {
      console.error('❌ Sign in exception:', error);
      const errorMessage = error.message || 'Sign in failed - please try again';
      setAuthError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    try {
      console.log('👋 Signing out user...');
      setAuthError(null);
      
      // Sign out with timeout
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Sign out timeout')), 5000))
      ]);
      
      console.log('✅ Sign out successful');
      
    } catch (error) {
      console.error('❌ Sign out error:', error);
      // Force clear state even if sign out fails
      setUser(null);
      setProfile(null);
    }
  }

  // Test connection function
  async function testConnection() {
    try {
      console.log('🔍 Testing Supabase connection...');
      const { error } = await supabase
        .from('user_profiles_pulse_2024')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('❌ Connection test failed:', error);
        return false;
      }
      
      console.log('✅ Connection test successful');
      return true;
    } catch (error) {
      console.error('❌ Connection test error:', error);
      return false;
    }
  }

  const value = {
    user,
    profile,
    loading: loading || initializing,
    authError,
    signUp,
    signIn,
    signOut,
    updateProfile,
    testConnection
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}