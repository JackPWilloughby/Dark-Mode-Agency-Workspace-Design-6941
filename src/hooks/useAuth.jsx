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
          await loadUserProfile(session.user.id);
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
        await loadUserProfile(session.user.id);
      } else {
        console.log('ℹ️ No existing session found');
      }
    } catch (error) {
      console.error('❌ Error getting session:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadUserProfile(userId) {
    try {
      console.log('👤 Loading profile for user:', userId);
      
      // First try to get existing profile
      let { data: profile, error } = await supabase
        .from('user_profiles_pulse_2024')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        console.log('📝 Creating new profile...');
        // Profile doesn't exist, create it
        const { data: { user } } = await supabase.auth.getUser();
        
        const newProfile = {
          id: userId,
          email: user?.email,
          full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
          avatar_url: user?.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          role: 'user'
        };

        const { data, error: insertError } = await supabase
          .from('user_profiles_pulse_2024')
          .insert([newProfile])
          .select()
          .single();

        if (insertError) {
          console.error('❌ Error creating profile:', insertError);
          profile = newProfile; // Use fallback
        } else {
          console.log('✅ Profile created successfully');
          profile = data;
        }
      } else if (error) {
        console.error('❌ Error loading profile:', error);
        // Create fallback profile
        profile = {
          id: userId,
          email: user?.email || 'user@example.com',
          full_name: user?.email?.split('@')[0] || 'User',
          avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          role: 'user'
        };
      } else {
        console.log('✅ Profile loaded successfully');
      }

      setProfile(profile);
    } catch (error) {
      console.error('❌ Error in loadUserProfile:', error);
      // Create fallback profile
      setProfile({
        id: userId,
        email: 'user@example.com',
        full_name: 'User',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        role: 'user'
      });
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

      console.log('✅ Sign up successful:', data);
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

      console.log('✅ Sign in successful:', data);
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
    signOut
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