import { useState, useEffect, createContext, useContext } from 'react';
import supabase from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth event:', event, session ? 'Session exists' : 'No session');
        
        if (!mounted) return;

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

  async function getInitialSession() {
    try {
      console.log('🔍 Checking initial session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Session error:', error);
        setLoading(false);
        return;
      }

      if (session?.user) {
        console.log('✅ Found existing session for:', session.user.email);
        setUser(session.user);
        await loadUserProfile(session.user);
      } else {
        console.log('ℹ️ No existing session found');
      }
    } catch (error) {
      console.error('❌ Error getting session:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadUserProfile(user) {
    try {
      console.log('👤 Loading profile for user:', user.email);
      
      // Create a basic profile from user data
      const basicProfile = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        avatar_url: user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        role: 'user'
      };

      try {
        // Try to get profile from database
        let { data: profile, error } = await supabase
          .from('user_profiles_pulse_2024')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code === 'PGRST116') {
          // Profile doesn't exist, try to create it
          console.log('📝 Creating new profile...');
          const { data, error: insertError } = await supabase
            .from('user_profiles_pulse_2024')
            .insert([basicProfile])
            .select()
            .single();

          if (insertError) {
            console.warn('⚠️ Could not create profile in database:', insertError.message);
            profile = basicProfile; // Use basic profile as fallback
          } else {
            console.log('✅ Profile created successfully');
            profile = data;
          }
        } else if (error) {
          console.warn('⚠️ Error loading profile from database:', error.message);
          profile = basicProfile; // Use basic profile as fallback
        } else {
          console.log('✅ Profile loaded from database');
        }

        setProfile(profile);
      } catch (dbError) {
        console.warn('⚠️ Database not accessible, using basic profile:', dbError.message);
        setProfile(basicProfile);
      }
    } catch (error) {
      console.error('❌ Error in loadUserProfile:', error);
      // Create fallback profile
      setProfile({
        id: user.id,
        email: user.email,
        full_name: user.email?.split('@')[0] || 'User',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        role: 'user'
      });
    }
  }

  async function updateProfile(updates) {
    try {
      if (!user?.id) {
        throw new Error('No user logged in');
      }

      console.log('👤 Updating profile...');
      
      // Update local profile immediately
      const updatedProfile = {
        ...profile,
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      setProfile(updatedProfile);

      // Try to update in database
      try {
        const { data, error } = await supabase
          .from('user_profiles_pulse_2024')
          .update({
            full_name: updates.full_name,
            avatar_url: updates.avatar_url,
            role: updates.role,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .select()
          .single();

        if (error) {
          console.warn('⚠️ Could not update profile in database:', error.message);
        } else {
          console.log('✅ Profile updated in database');
          setProfile(data);
        }
      } catch (dbError) {
        console.warn('⚠️ Database not accessible for profile update:', dbError.message);
      }

      return { data: updatedProfile, error: null };
    } catch (error) {
      console.error('❌ Error in updateProfile:', error);
      return { data: null, error };
    }
  }

  async function signUp(email, password, fullName) {
    try {
      setLoading(true);
      console.log('📝 Signing up user:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) throw error;
      
      console.log('✅ Sign up successful');
      return { data, error: null };
    } catch (error) {
      console.error('❌ Error signing up:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email, password) {
    try {
      setLoading(true);
      console.log('🔐 Signing in user:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      console.log('✅ Sign in successful');
      return { data, error: null };
    } catch (error) {
      console.error('❌ Error signing in:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    try {
      setLoading(true);
      console.log('🚪 Signing out...');
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('❌ Error signing out:', error);
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