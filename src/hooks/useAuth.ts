import { useState, useEffect, useRef } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User } from '../types';

// Global state to persist across component remounts
let globalUser: User | null = null;
let globalInitialized = false;

export function useAuth() {
  const [user, setUser] = useState<User | null>(globalUser);
  const [loading, setLoading] = useState(!globalInitialized);
  const initializedRef = useRef(globalInitialized);
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Prevent double initialization in React 18 Strict Mode
    if (initializedRef.current && globalInitialized) {
      console.log('Auth already initialized globally, using cached state');
      setUser(globalUser);
      setLoading(false);
      return;
    }

    initializedRef.current = true;
    let mounted = true;
    let authStateListener: { subscription?: { unsubscribe: () => void }; unsubscribe?: () => void } | null = null;

    const init = async () => {
      try {
        // If we have global user, use it immediately
        if (globalUser && globalInitialized) {
          console.log('Using cached global user:', globalUser.email);
          setUser(globalUser);
          setLoading(false);
          return;
        }

        setLoading(true);
        console.log('Initializing auth...');

        // Add timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          console.log('Auth initialization timeout - forcing loading to false');
          if (mounted) {
            setLoading(false);
            if (!globalUser) {
              setUser(null);
            }
          }
        }, 5000); // 5 second timeout

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        // Clear timeout if we got a response
        clearTimeout(timeoutId);
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          // Don't sign out immediately - might be temporary network issue
          console.warn('Session error detected, but keeping user logged in if we have cached state');
          if (globalUser) {
            setUser(globalUser);
            setLoading(false);
            return;
          }
          await supabase.auth.signOut();
          setUser(null);
          globalUser = null;
          setLoading(false);
          return;
        }

        if (!mounted) {
          setLoading(false);
          return;
        }

        const currentUser = sessionData?.session?.user ?? null;
        if (currentUser) {
          console.log('User session found:', currentUser.email);
          const userObj = {
            id: currentUser.id,
            email: currentUser.email || '',
            name: currentUser.email?.split('@')[0] || 'User',
            role: 'developer',
            title: 'Team Member',
            created_at: new Date().toISOString()
          } as User;
          
          setUser(userObj);
          globalUser = userObj; // Cache globally
          globalInitialized = true;
          setLoading(false);

          try {
            await fetchOrCreateUserProfile(currentUser);
          } catch (profileError) {
            console.warn('Profile fetch/create failed:', profileError);
          }
        } else {
          console.log('No session found, checking for user...');
          const userResp = await supabase.auth.getUser();
          const fetchedUser = userResp?.data?.user ?? null;
          if (fetchedUser) {
            console.log('User found:', fetchedUser.email);
            const userObj = {
              id: fetchedUser.id,
              email: fetchedUser.email || '',
              name: fetchedUser.email?.split('@')[0] || 'User',
              role: 'developer',
              title: 'Team Member',
              created_at: new Date().toISOString()
            } as User;
            
            setUser(userObj);
            globalUser = userObj; // Cache globally
            globalInitialized = true;
            setLoading(false);
            
            try {
              await fetchOrCreateUserProfile(fetchedUser);
            } catch (profileError) {
              console.warn('Profile fetch/create failed:', profileError);
            }
          } else {
            console.log('No user found - user is logged out');
            setUser(null);
            globalUser = null;
            globalInitialized = true;
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          // Keep cached user if available
          if (globalUser) {
            console.warn('Error during auth init, but keeping cached user');
            setUser(globalUser);
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      }
    };

    init();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);

      // Don't process during unmount
      if (!mounted) return;

      try {
        const currentUser = session?.user ?? null;

        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setUser(null);
          globalUser = null;
          globalInitialized = false;
          currentUserIdRef.current = null;
          setLoading(false);
          return;
        }

        if (currentUser) {
          // Skip if this is the same user we already processed
          if (currentUserIdRef.current === currentUser.id && event === 'SIGNED_IN') {
            console.log('Skipping duplicate profile fetch for same user');
            setLoading(false); // Ensure loading is false
            return;
          }

          // Handle email confirmation
          if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
            currentUserIdRef.current = currentUser.id;
            const userObj = {
              id: currentUser.id,
              email: currentUser.email || '',
              name: currentUser.email?.split('@')[0] || 'User',
              role: 'developer',
              title: 'Team Member',
              created_at: new Date().toISOString()
            } as User;
            
            setUser(userObj);
            globalUser = userObj; // Update global cache
            globalInitialized = true;
            setLoading(false);
            
            try {
              await fetchOrCreateUserProfile(currentUser);
            } catch (profileError) {
              console.warn('Profile error in auth change:', profileError);
            }
          }
        } else {
          setUser(null);
          globalUser = null;
          currentUserIdRef.current = null;
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth state change handler error:', error);
        if (mounted) {
          setUser(null);
          currentUserIdRef.current = null;
          setLoading(false);
        }
      }
    });

    authStateListener = listener;

    return () => {
      console.log('Auth cleanup');
      mounted = false;
      // DON'T reset initializedRef - keep global state
      // initializedRef.current = false;
      currentUserIdRef.current = null;
      // Ensure loading is reset on cleanup to prevent stuck loading state
      setLoading(false);
      // listener may have different shapes across supabase client versions
      try {
        if (authStateListener) {
          const listenerObj = authStateListener as { subscription?: { unsubscribe: () => void }; unsubscribe?: () => void };
          if (listenerObj?.subscription?.unsubscribe) {
            listenerObj.subscription.unsubscribe();
          } else if (listenerObj?.unsubscribe) {
            listenerObj.unsubscribe();
          }
        }
      } catch {
        // ignore cleanup errors
      }
    };
  }, []);

  const fetchOrCreateUserProfile = async (supabaseUserObj: SupabaseUser) => {
    try {
      console.log('Fetching profile for user:', supabaseUserObj.id);

      // Create basic user object immediately to prevent blocking
      const basicUser: User = {
        id: supabaseUserObj.id,
        email: supabaseUserObj.email || '',
        name: supabaseUserObj.email?.split('@')[0] || 'User',
        avatar: undefined,
        role: 'developer',
        title: 'Team Member',
        created_at: new Date().toISOString(),
      };

      // Set user immediately so app can continue
      setUser(basicUser);

      // Fetch existing profile with timeout (non-blocking)
      const fetchPromise = supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUserObj.id)
        .maybeSingle();

      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 3000);
      });

      let existingProfile;
      let fetchError;
      
      try {
        const result = await Promise.race([
          fetchPromise,
          timeoutPromise
        ]);
        existingProfile = (result as any)?.data;
        fetchError = (result as any)?.error;
      } catch (timeoutError) {
        console.warn('Profile fetch timed out, using basic user');
        return;
      }

      // If error or no profile, keep the basic user
      if (fetchError) {
        console.warn('Error fetching user profile (using basic user):', fetchError);
        return;
      }

      if (existingProfile) {
        console.log('Profile found, updating user:', existingProfile);
        setUser(existingProfile as User);
        return;
      }

      console.log('No profile found, creating new one...');

      // Profile doesn't exist, create it
      const metadata = supabaseUserObj.user_metadata as Record<string, unknown>;
      const profile: Partial<User> = {
        id: supabaseUserObj.id,
        email: supabaseUserObj.email || '',
        name:
          (metadata?.full_name as string) ||
          (metadata?.name as string) ||
          supabaseUserObj.email?.split('@')[0] ||
          'User',
        avatar: (metadata?.avatar_url as string) ||
          (metadata?.picture as string) ||
          undefined,
        role: 'developer',
        title: 'Team Member',
        created_at: new Date().toISOString(),
      };

      console.log('Creating user profile:', profile);

      // Try to insert with timeout (non-blocking)
      const insertPromise = supabase
        .from('users')
        .insert([profile])
        .select()
        .maybeSingle();

      const insertTimeout = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Profile insert timeout')), 3000);
      });

      try {
        const result = await Promise.race([
          insertPromise,
          insertTimeout
        ]);
        const inserted = (result as any)?.data;
        const insertError = (result as any)?.error;

        if (insertError) {
          console.warn('Error inserting profile (keeping basic user):', insertError);
          return;
        }

        if (inserted) {
          console.log('User profile created successfully:', inserted);
          setUser(inserted as User);
        }
      } catch (timeoutError) {
        console.warn('Profile insert timed out, keeping basic user');
      }
    } catch (error: unknown) {
      console.warn('Error in fetchOrCreateUserProfile (using basic user):', error);
      // User is already set with basic info at the start
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Signing in user...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        console.error('Sign in error:', error);

        // Provide user-friendly error messages
        if (error.message.includes('Invalid login credentials') || error.message.includes('Invalid email or password')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        }

        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please confirm your email address before signing in. Check your inbox for the confirmation link.');
        }

        if (error.message.includes('too many requests')) {
          throw new Error('Too many login attempts. Please wait a few minutes and try again.');
        }

        throw new Error(error.message || 'Failed to sign in. Please try again.');
      }

      if (data?.user) {
        console.log('Sign in successful, user:', data.user.id);

        // Check if email is confirmed
        if (!data.user.email_confirmed_at && data.user.email) {
          console.warn('User email not confirmed');
        }

        try {
          await fetchOrCreateUserProfile(data.user);
        } catch (profileError) {
          console.warn('Profile fetch/create failed, but user is authenticated:', profileError);
          // Don't throw - user can still use the app
        }
      }

      return data;
    } catch (error: unknown) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      setLoading(true);
      console.log('Starting signup process...', { email, name });

      const origin = window.location.origin;
      const emailRedirectTo = `${origin}/auth/callback`;

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: name
          },
          emailRedirectTo: emailRedirectTo,
          // Skip captcha verification for better UX
          captchaToken: undefined,
        }
      });

      console.log('Supabase auth.signUp response:', { data, error });

      if (error) {
        console.error('Supabase auth error:', error);

        // Handle captcha error specifically
        if (error.message.includes('captcha') || error.message.includes('CAPTCHA')) {
          throw new Error('Security verification failed. Please disable CAPTCHA in Supabase Dashboard under Authentication > Settings > Security');
        }

        // Provide more helpful error messages
        if (error.message.includes('already registered') || error.message.includes('already exists') || error.message.includes('User already registered')) {
          throw new Error('This email is already registered. Please sign in instead.');
        }

        if (error.message.includes('Password')) {
          throw new Error('Password does not meet requirements. Please use a stronger password.');
        }

        if (error.message.includes('Invalid email')) {
          throw new Error('Please enter a valid email address.');
        }

        throw new Error(error.message || 'Failed to create account. Please try again.');
      }

      if (data?.user) {
        console.log('User created in auth.users:', data.user.id);
        console.log('Email confirmation required:', !data.session);

        // If there's no session, it means email confirmation is required
        if (!data.session) {
          console.log('Email confirmation required. User will receive confirmation email.');
          // Don't try to create profile yet - it will be created after email confirmation
          return data;
        }

        // If there's a session, user is auto-confirmed (email confirmation disabled)
        try {
          await fetchOrCreateUserProfile(data.user);
          console.log('Profile created successfully!');
        } catch (profileError: unknown) {
          console.error('Profile creation failed:', profileError);
          // Don't throw - user is authenticated, profile can be created later
          console.warn('User authenticated but profile creation failed. This can be fixed later.');
        }
      }
      return data;
    } catch (error: unknown) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Get the current origin or use production URL
      const origin = window.location.origin;
      const redirectTo = `${origin}/auth/callback`;

      console.log('Google OAuth redirect URL:', redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account', // Changed from 'consent' to allow account selection
          },
          skipBrowserRedirect: false, // Ensure browser redirect happens
        }
      });

      if (error) {
        console.error('Google OAuth error:', error);
        throw new Error(error.message || 'Failed to initiate Google sign-in');
      }

      return data;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting sign out...');
      
      // Perform actual sign out first
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
      
      // Clear all auth-related localStorage items
      localStorage.removeItem('skipWorkspace');
      localStorage.removeItem('demoMode');
      localStorage.removeItem('currentWorkspace');
      
      // Clear user state (both local and global)
      setUser(null);
      globalUser = null;
      globalInitialized = false;
      setLoading(false);
      currentUserIdRef.current = null;
      
      console.log('Sign out complete');
      
      // Redirect to login page
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      // Clear state and redirect even on error
      setUser(null);
      globalUser = null;
      globalInitialized = false;
      setLoading(false);
      // Clear all auth-related localStorage items
      localStorage.removeItem('skipWorkspace');
      localStorage.removeItem('demoMode');
      localStorage.removeItem('currentWorkspace');
      // Redirect to login page
      window.location.href = '/';
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };
}
