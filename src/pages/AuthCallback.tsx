import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Authenticating...');

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const handleCallback = async () => {
      try {
        if (!mounted) return;
        
        setStatus('Verifying your credentials...');
        console.log('🔐 AuthCallback: Starting authentication...');

        // Add timeout protection
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.error('⏱️ AuthCallback timeout - redirecting to login');
            toast.error('Authentication timed out. Please try again.');
            window.location.href = '/';
          }
        }, 15000); // 15 second timeout

        // Check for error in URL params (OAuth errors)
        const params = new URLSearchParams(window.location.search);
        const errorParam = params.get('error');
        const errorDescription = params.get('error_description');

        if (errorParam) {
          console.error('❌ OAuth error:', errorParam, errorDescription);
          const friendlyError = errorDescription || 'Authentication failed. Please try again.';
          toast.error(friendlyError, { duration: 5000 });
          setError(friendlyError);
          clearTimeout(timeoutId);
          setTimeout(() => window.location.href = '/', 2000);
          return;
        }

        // Get the session from Supabase
        console.log('📡 Getting session from Supabase...');
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (!mounted) return;

        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          toast.error('Authentication failed. Please try again.');
          clearTimeout(timeoutId);
          setTimeout(() => window.location.href = '/', 2000);
          return;
        }

        if (!data?.session?.user) {
          console.log('❌ No session found');
          toast.error('No session found. Please sign in again.');
          clearTimeout(timeoutId);
          setTimeout(() => window.location.href = '/', 2000);
          return;
        }

        const user = data.session.user;
        console.log('✅ User authenticated:', user.email);
        
        if (!mounted) return;
        setStatus('Creating your profile...');

        // Try to create/get profile (non-blocking)
        try {
          const { data: existingProfile } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();

          if (!existingProfile) {
            console.log('📝 Creating user profile...');
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

            await supabase.from('users').insert([profile]);
            console.log('✅ Profile created');
          } else {
            console.log('✅ Profile exists');
          }
        } catch (profileError) {
          console.warn('⚠️ Profile creation failed (non-blocking):', profileError);
          // Continue anyway - profile can be created later
        }

        if (!mounted) return;
        setStatus('Redirecting to dashboard...');
        
        clearTimeout(timeoutId);
        
        // Redirect immediately
        console.log('🚀 Redirecting to dashboard...');
        toast.success('Welcome to ORBIT LIVE!');
        
        // Use window.location for clean redirect
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);

      } catch (err) {
        console.error('❌ Unexpected error in auth callback:', err);
        if (mounted) {
          const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
          setError(errorMsg);
          toast.error(errorMsg);
          clearTimeout(timeoutId);
          setTimeout(() => window.location.href = '/', 2000);
        }
      }
    };

    handleCallback();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
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
