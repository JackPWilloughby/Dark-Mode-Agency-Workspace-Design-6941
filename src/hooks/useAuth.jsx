import { useState, useEffect, createContext, useContext } from 'react';
import supabase from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Initialize auth state immediately
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔐 Auth event:', event, session?.user?.email);
        
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user);
        } else {
          setUser(null);
          setProfile(null);
        }
        
        setLoading(false);
        setInitializing(false);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  async function initializeAuth() {
    try {
      console.log('🚀 Initializing auth...');
      
      // Set timeout for auth initialization
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout')), 8000)
      );
      
      const authPromise = supabase.auth.getSession();
      
      const { data: { session }, error } = await Promise.race([
        authPromise,
        timeoutPromise
      ]);
      
      if (error) {
        console.error('Session error:', error);
        setLoading(false);
        setInitializing(false);
        return;
      }

      if (session?.user) {
        console.log('✅ Found existing session for:', session.user.email);
        setUser(session.user);
        await loadUserProfile(session.user);
      } else {
        console.log('❌ No existing session found');
      }
      
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setLoading(false);
      setInitializing(false);
    }
  }

  async function loadUserProfile(user) {
    try {
      console.log('👤 Loading profile for:', user.email);
      
      // Set timeout for profile loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile timeout')), 5000)
      );
      
      // Try to get existing profile with timeout
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
        console.warn('Profile loading timed out, using fallback');
        error = timeoutError;
      }

      if (error && error.code === 'PGRST116') {
        console.log('📝 Creating new profile...');
        
        // Profile doesn't exist, create it
        const newProfile = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          avatar_url: user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          role: 'user'
        };

        try {
          const { data, error: insertError } = await Promise.race([
            supabase
              .from('user_profiles_pulse_2024')
              .insert([newProfile])
              .select()
              .single(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Insert timeout')), 3000))
          ]);

          if (insertError) {
            console.warn('Failed to create profile, using fallback');
            profile = newProfile;
          } else {
            profile = data;
            console.log('✅ Profile created successfully');
          }
        } catch (insertTimeout) {
          console.warn('Profile creation timed out, using fallback');
          profile = newProfile;
        }
      } else if (error) {
        console.warn('Profile load error, using fallback:', error);
        profile = {
          id: user.id,
          email: user.email,
          full_name: user.email?.split('@')[0] || 'User',
          avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          role: 'user'
        };
      } else {
        console.log('✅ Profile loaded successfully');
      }

      setProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Create fallback profile
      setProfile({
        id: user.id,
        email: user.email || 'user@example.com',
        full_name: user.email?.split('@')[0] || 'User',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        role: 'user'
      });
    }
  }

  async function updateProfile(updates) {
    if (!user?.id) {
      return { data: null, error: new Error('No user logged in') };
    }

    try {
      // Update in Supabase with timeout
      const { data, error } = await Promise.race([
        supabase
          .from('user_profiles_pulse_2024')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Update timeout')), 5000))
      ]);

      if (error) throw error;

      // Update local state
      setProfile(data);
      return { data, error: null };
    } catch (error) {
      console.error('Profile update error:', error);
      // Update local state anyway
      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile);
      return { data: updatedProfile, error: null };
    }
  }

  async function signUp(email, password, fullName) {
    try {
      setLoading(true);
      console.log('📝 Signing up user:', email);
      
      const { data, error } = await Promise.race([
        supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            }
          }
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Signup timeout')), 10000))
      ]);
      
      if (error) {
        console.error('Sign up error:', error);
      } else {
        console.log('✅ Sign up successful');
      }
      
      return { data, error };
    } catch (error) {
      console.error('Sign up exception:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email, password) {
    try {
      setLoading(true);
      console.log('🔑 Signing in user:', email);
      
      const { data, error } = await Promise.race([
        supabase.auth.signInWithPassword({
          email,
          password
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Signin timeout')), 10000))
      ]);
      
      if (error) {
        console.error('Sign in error:', error);
      } else {
        console.log('✅ Sign in successful');
      }
      
      return { data, error };
    } catch (error) {
      console.error('Sign in exception:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    try {
      console.log('👋 Signing out user...');
      
      // Don't set loading to true immediately to prevent content flash
      await supabase.auth.signOut();
      
      // Clear user state
      setUser(null);
      setProfile(null);
      
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  const value = {
    user,
    profile,
    loading: loading || initializing,
    signUp,
    signIn,
    signOut,
    updateProfile
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