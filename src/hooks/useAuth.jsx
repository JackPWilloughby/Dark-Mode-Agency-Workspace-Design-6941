import { useState, useEffect, createContext, useContext } from 'react';
import supabase from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;

    // Check session immediately
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔐 Auth event:', event);
        
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  async function checkSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user);
      }
    } catch (error) {
      console.log('Session check failed, continuing...');
    } finally {
      setLoading(false);
    }
  }

  async function loadUserProfile(user) {
    try {
      // Try to get existing profile
      let { data: profile, error } = await supabase
        .from('user_profiles_pulse_2024')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const newProfile = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          avatar_url: user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          role: 'user'
        };

        const { data, error: insertError } = await supabase
          .from('user_profiles_pulse_2024')
          .insert([newProfile])
          .select()
          .single();

        if (insertError) {
          console.warn('Failed to create profile, using fallback');
          profile = newProfile;
        } else {
          profile = data;
        }
      } else if (error) {
        console.warn('Profile load error, using fallback');
        profile = {
          id: user.id,
          email: user.email,
          full_name: user.email?.split('@')[0] || 'User',
          avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          role: 'user'
        };
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
      // Update in Supabase
      const { data, error } = await supabase
        .from('user_profiles_pulse_2024')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email, password) {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  }

  const value = {
    user,
    profile,
    loading,
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