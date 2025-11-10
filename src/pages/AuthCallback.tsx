import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Handle the OAuth callback
    const handleCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          toast.error('Authentication failed. Please try again.');
          navigate('/', { replace: true });
          return;
        }

        if (data?.session?.user) {
          const user = data.session.user;
          console.log('OAuth user authenticated:', user.id);

          // Check if user profile exists
          const { data: existingProfile, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (fetchError) {
            console.error('Error checking user profile:', fetchError);
          }

          // If no profile exists, create one
          if (!existingProfile) {
            console.log('Creating user profile for OAuth user...');

            const profile = {
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.full_name ||
                    user.user_metadata?.name ||
                    user.email?.split('@')[0] ||
                    'User',
              avatar: user.user_metadata?.avatar_url ||
                      user.user_metadata?.picture ||
                      null,
              role: 'developer',
              title: 'Team Member',
              created_at: new Date().toISOString(),
            };

            const { error: insertError } = await supabase
              .from('users')
              .insert([profile]);

            if (insertError) {
              console.error('Error creating user profile:', insertError);
              // Check if it's a duplicate key error (user already exists)
              if (!insertError.message.includes('duplicate key')) {
                setError('Failed to create user profile. Please contact support.');
                toast.error('Failed to complete sign up. Please try again.');
                await supabase.auth.signOut();
                navigate('/', { replace: true });
                return;
              }
              // If duplicate, it means profile was created, continue
              console.log('Profile already exists, continuing...');
            } else {
              console.log('User profile created successfully');
            }
          } else {
            console.log('User profile already exists');
          }

          // Success! Redirect to dashboard
          toast.success('Welcome! Redirecting to dashboard...');
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 500);
        } else {
          // No session, redirect to login
          console.log('No session found, redirecting to login');
          navigate('/', { replace: true });
        }
      } catch (error: any) {
        console.error('Error in auth callback:', error);
        setError(error.message || 'An unexpected error occurred');
        toast.error('Authentication error. Please try again.');
        navigate('/', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-white text-lg mb-2">Authentication Error</p>
            <p className="text-gray-400 text-sm">{error}</p>
            <button
              onClick={() => navigate('/', { replace: true })}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Login
            </button>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Completing sign in...</p>
            <p className="text-gray-400 text-sm mt-2">Please wait while we set up your account</p>
          </>
        )}
      </div>
    </div>
  );
}
