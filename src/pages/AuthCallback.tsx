import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Authenticating...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setStatus('Verifying your credentials...');

        // Check for error in URL params (OAuth errors)
        const params = new URLSearchParams(window.location.search);
        const errorParam = params.get('error');
        const errorDescription = params.get('error_description');

        if (errorParam) {
          console.error('OAuth error:', errorParam, errorDescription);
          toast.error(errorDescription || 'Authentication failed');
          navigate('/', { replace: true });
          return;
        }

        // Get the session from Supabase
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          toast.error('Authentication failed. Please try again.');
          navigate('/', { replace: true });
          return;
        }

        if (!data?.session?.user) {
          console.log('No session found, redirecting to login');
          toast.error('No session found. Please sign in again.');
          navigate('/', { replace: true });
          return;
        }

        const user = data.session.user;
        console.log('OAuth user authenticated:', user.id);
        setStatus('Creating your profile...');

        // Check if user profile exists
        const { data: existingProfile, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (fetchError && !fetchError.message.includes('no rows')) {
          console.error('Error checking user profile:', fetchError);
          toast.error('Failed to verify profile. Please try again.');
          await supabase.auth.signOut();
          navigate('/', { replace: true });
          return;
        }

        // If no profile exists, create one
        if (!existingProfile) {
          console.log('Creating user profile for OAuth user...');
          setStatus('Setting up your workspace...');

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

            // Check if it's a duplicate key error (profile already exists)
            if (insertError.message.includes('duplicate key') || insertError.code === '23505') {
              console.log('Profile already exists (race condition), continuing...');
            } else {
              // Real error - sign user out and redirect
              setError('Failed to create user profile. Please contact support.');
              toast.error('Failed to complete sign up. Please try again.');
              await supabase.auth.signOut();
              navigate('/', { replace: true });
              return;
            }
          } else {
            console.log('User profile created successfully');
          }
        } else {
          console.log('User profile already exists');
        }

        // Success! Redirect to dashboard
        setStatus('Success! Redirecting...');
        toast.success('Welcome to ORBIT LIVE TEAM!');

        // Small delay to show success message
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1000);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {error ? (
          <>
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-white text-xl mb-2 font-semibold">Authentication Error</p>
            <p className="text-gray-400 text-sm mb-6">{error}</p>
            <button
              onClick={() => navigate('/', { replace: true })}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
            >
              Back to Login
            </button>
          </>
        ) : (
          <>
            <div className="mb-6 relative">
              <div className="w-20 h-20 mx-auto">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-700 border-t-blue-500"></div>
              </div>
            </div>
            <p className="text-white text-2xl font-bold mb-2">{status}</p>
            <p className="text-gray-400 text-sm">Please wait, this won't take long...</p>

            {/* Progress steps */}
            <div className="mt-8 space-y-2 text-left">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-gray-300 text-sm">Verifying credentials</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${status.includes('profile') || status.includes('workspace') || status.includes('Success') ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                <span className="text-gray-300 text-sm">Creating profile</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${status.includes('Success') ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                <span className="text-gray-300 text-sm">Redirecting to dashboard</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
