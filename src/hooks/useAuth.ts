import { useState, useEffect, useRef } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization in React 18 Strict Mode
    if (initializedRef.current) {
      console.log('Auth already initialized, skipping');
      return;
    }

    initializedRef.current = true;
    let mounted = true;
    let initialLoadComplete = false;

    const init = async () => {
      setLoading(true);
      try {
        console.log('Initializing auth...');
        const userResp = await supabase.auth.getUser();
        const currentUser = userResp?.data?.user ?? null;

        console.log('Current user:', currentUser?.id);

        if (!mounted) {
          console.log('Component unmounted, aborting init');
          return;
        }

        if (currentUser) {
          try {
            await fetchOrCreateUserProfile(currentUser);
            console.log('Profile fetch/create completed');
          } catch (profileError) {
            console.error('Profile error (non-blocking):', profileError);
            // Set a minimal user object so app can continue
            if (mounted) {
              setUser({
                id: currentUser.id,
                email: currentUser.email || '',
                name: currentUser.email?.split('@')[0] || 'User',
                role: 'developer',
                title: 'Team Member',
                created_at: new Date().toISOString()
              } as User);
            }
          }
        } else {
          console.log('No current user, setting user to null');
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          console.log('Auth loading complete, setting loading to false');
          setLoading(false);
          initialLoadComplete = true;
        }
      }
    };

    init();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);

      // Don't process during unmount or initial load
      if (!mounted) return;

      // Skip SIGNED_IN event during initial load to prevent double profile fetch
      if (event === 'SIGNED_IN' && !initialLoadComplete) {
        console.log('Skipping SIGNED_IN during initial load');
        return;
      }

      try {
        const currentUser = session?.user ?? null;
        if (currentUser) {
          try {
            await fetchOrCreateUserProfile(currentUser);
          } catch (profileError) {
            console.error('Profile error in auth change (non-blocking):', profileError);
            // Set minimal user so app continues
            setUser({
              id: currentUser.id,
              email: currentUser.email || '',
              name: currentUser.email?.split('@')[0] || 'User',
              role: 'developer',
              title: 'Team Member',
              created_at: new Date().toISOString()
            } as User);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state change handler error:', error);
        setUser(null);
      }
    });

    return () => {
      console.log('Auth cleanup - resetting initialized flag');
      mounted = false;
      initializedRef.current = false; // Reset so it can initialize again on remount
      // listener may have different shapes across supabase client versions
      try {
        // v2 shape: listener?.subscription?.unsubscribe()
        // v1 shape: listener?.unsubscribe()
        const listenerObj = listener as { subscription?: { unsubscribe: () => void }; unsubscribe?: () => void };
        if (listenerObj?.subscription?.unsubscribe) {
          listenerObj.subscription.unsubscribe();
        } else if (listenerObj?.unsubscribe) {
          listenerObj.unsubscribe();
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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data?.user) {
        console.log('Sign in successful, user:', data.user.id);
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

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });

      console.log('Supabase auth.signUp response:', { data, error });

      if (error) {
        console.error('Supabase auth error:', error);
        throw error;
      }

      if (data?.user) {
        console.log('User created in auth.users, now creating profile...');

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
      const redirectTo = `${window.location.origin}/auth/callback`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Immediately clear user state for instant UI feedback
      setUser(null);

      // Then perform actual sign out in background
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error (non-blocking):', error);
        // Don't throw - user is already logged out from UI perspective
      }
    } catch (error) {
      console.error('Sign out error:', error);
      // Don't throw - user state is already cleared
    } finally {
      setLoading(false);
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
