import { useState, useEffect, useRef } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Prevent double initialization in React 18 Strict Mode
    if (initializedRef.current) {
      console.log('Auth already initialized, skipping');
      return;
    }

    initializedRef.current = true;
    let mounted = true;
    let authStateListener: { subscription?: { unsubscribe: () => void }; unsubscribe?: () => void } | null = null;

    const init = async () => {
      try {
        setLoading(true);
        console.log('Initializing auth...');

        // Add timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          console.log('Auth initialization timeout - forcing loading to false');
          if (mounted) {
            setLoading(false);
            setUser(null);
          }
        }, 5000); // 5 second timeout

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        // Clear timeout if we got a response
        clearTimeout(timeoutId);
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          await supabase.auth.signOut();
          setUser(null);
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
          setUser({
            id: currentUser.id,
            email: currentUser.email || '',
            name: currentUser.email?.split('@')[0] || 'User',
            role: 'developer',
            title: 'Team Member',
            created_at: new Date().toISOString()
          } as User);
          setLoading(false); // Set loading false immediately

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
            setUser({
              id: fetchedUser.id,
              email: fetchedUser.email || '',
              name: fetchedUser.email?.split('@')[0] || 'User',
              role: 'developer',
              title: 'Team Member',
              created_at: new Date().toISOString()
            } as User);
            setLoading(false); // Set loading false immediately
            try {
              await fetchOrCreateUserProfile(fetchedUser);
            } catch (profileError) {
              console.warn('Profile fetch/create failed:', profileError);
            }
          } else {
            console.log('No user found - user is logged out');
            setUser(null);
            setLoading(false); // Set loading false for no user
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setUser(null);
          setLoading(false); // Always set loading false on error
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
            setUser({
              id: currentUser.id,
              email: currentUser.email || '',
              name: currentUser.email?.split('@')[0] || 'User',
              role: 'developer',
              title: 'Team Member',
              created_at: new Date().toISOString()
            } as User);
            setLoading(false); // Set loading false immediately after setting user
            try {
              await fetchOrCreateUserProfile(currentUser);
            } catch (profileError) {
              console.warn('Profile error in auth change:', profileError);
            }
          }
        } else {
          setUser(null);
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
      // Allow re-initialization (needed for React Strict Mode double-mount)
      initializedRef.current = false;
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

      // Fetch existing profile - Let Supabase handle timeout internally
      const { data: existingProfile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUserObj.id)
        .maybeSingle();

      // If error (except no rows), handle gracefully
      if (fetchError && !fetchError.message.includes('no rows')) {
        console.error('Error fetching user profile:', fetchError);
        // Don't throw - create basic user object instead
        const basicUser: User = {
          id: supabaseUserObj.id,
          email: supabaseUserObj.email || '',
          name: supabaseUserObj.email?.split('@')[0] || 'User',
          avatar: undefined,
          role: 'developer',
          title: 'Team Member',
          created_at: new Date().toISOString(),
        };
        setUser(basicUser);
        return;
      }


      if (existingProfile) {
        console.log('Profile found:', existingProfile);
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

      // Try to insert with better error handling
      const { data: inserted, error: insertError } = await supabase
        .from('users')
        .insert([profile])
        .select()
        .maybeSingle();

      if (insertError) {
        console.error('Error inserting user profile:', insertError);
        console.error('Insert error details:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        });

        // If it's a duplicate key error, try to fetch the profile
        if (insertError.code === '23505' || insertError.message.includes('duplicate key')) {
          console.log('Profile already exists (duplicate key), fetching...');
          const { data: refetched, error: refetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', supabaseUserObj.id)
            .maybeSingle();

          if (refetchError) {
            throw refetchError;
          }

          if (refetched) {
            setUser(refetched as User);
            return;
          }
        }

        // If it's a permissions error, provide a helpful message
        if (insertError.code === '42501' || insertError.message.includes('permission denied') || insertError.message.includes('policy')) {
          throw new Error('Database permission error. Please run the FIX_USER_SIGNUP_RLS.sql script in your Supabase SQL Editor to fix RLS policies.');
        }

        throw insertError;
      }

      if (inserted) {
        console.log('User profile created successfully:', inserted);
        setUser(inserted as User);
      }
    } catch (error: unknown) {
      console.warn('Error in fetchOrCreateUserProfile (non-blocking):', error);
      // Create fallback user object so app can continue
      const fallbackUser: User = {
        id: supabaseUserObj.id,
        email: supabaseUserObj.email || '',
        name: supabaseUserObj.email?.split('@')[0] || 'User',
        avatar: undefined,
        role: 'developer',
        title: 'Team Member',
        created_at: new Date().toISOString(),
      };
      setUser(fallbackUser);
      // Don't throw - let the app continue
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
      
      // Clear only skipWorkspace, keep currentWorkspace so user returns to their workspace on re-login
      localStorage.removeItem('skipWorkspace');
      // DON'T clear currentWorkspace - user is still a member
      
      // Clear user state
      setUser(null);
      setLoading(false);
      currentUserIdRef.current = null;
      
      console.log('Sign out complete');
      
      // Small delay then reload to ensure state is cleared
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } catch (error) {
      console.error('Sign out error:', error);
      // Clear state and reload even on error
      setUser(null);
      setLoading(false);
      // Only clear skipWorkspace on error, not currentWorkspace
      localStorage.removeItem('skipWorkspace');
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
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
