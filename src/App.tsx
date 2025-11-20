import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout/Layout';
import { LoginForm } from './components/Auth/LoginForm';
import { ProfileSetup } from './components/Auth/ProfileSetup';
import { GroupJoin } from './components/Group/GroupJoin';
import { AuthCallback } from './pages/AuthCallback';
import { LandingPage } from './pages/LandingPage';
import { TermsAndConditions } from './pages/TermsAndConditions';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Careers } from './pages/Careers';
import { Contact } from './pages/Contact';
import { FullPageLoader } from './components/Shared/LoadingAnimation';
import { useAuth } from './hooks/useAuth';
import { useGroup } from './hooks/useGroup';
import { useDemoMode } from './hooks/useDemoMode';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { Tasks } from './pages/Tasks';
import { Team } from './pages/Team';
import { Documents } from './pages/Documents';
import { Calendar } from './pages/Calendar';
import { Notifications } from './pages/Notifications';
import { Analytics } from './pages/Analytics';
import { AIAssistant } from './pages/AIAssistant';
import { Settings } from './pages/Settings';

function App() {
  const { user, loading: authLoading } = useAuth();
  const { currentGroup, loading: groupLoading } = useGroup(!authLoading);
  const { isDemoMode } = useDemoMode();
  const [showProfileSetup, setShowProfileSetup] = React.useState(false);
  const [showLanding, setShowLanding] = React.useState(true);
  const [forceShowApp, setForceShowApp] = React.useState(false);

  // Safety timeout - if loading takes too long, force show the app
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (authLoading || groupLoading) {
        console.warn('Loading timeout - forcing app to show');
        setForceShowApp(true);
      }
    }, 5000); // 5 second max

    return () => clearTimeout(timeout);
  }, [authLoading, groupLoading]);

  // Comprehensive mobile optimizations
  React.useEffect(() => {
    // Prevent horizontal scroll
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.maxWidth = '100vw';
    document.documentElement.style.maxWidth = '100vw';

    // Prevent pull-to-refresh on mobile
    document.body.style.overscrollBehavior = 'none';

    // Add touch-action for better mobile performance
    document.body.style.touchAction = 'pan-y pinch-zoom';

    // Handle orientation change
    const handleOrientationChange = () => {
      // Force recalculation of viewport height
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Initial calculation
    handleOrientationChange();

    // Listen for orientation changes and resize
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Prevent zoom on double tap for iOS
    let lastTouchEnd = 0;
    const preventDoubleTapZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchend', preventDoubleTapZoom, { passive: false });

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
      document.removeEventListener('touchend', preventDoubleTapZoom);
    };
  }, []);

  // Add console logging to debug
  React.useEffect(() => {
    console.log('App state:', {
      user: user?.email,
      currentGroup: currentGroup?.name,
      authLoading,
      groupLoading
    });
  }, [user, currentGroup, authLoading, groupLoading]);

  // Check if user needs to complete profile (Google OAuth users might have minimal info)
  React.useEffect(() => {
    if (user && !user.title && !user.position) {
      // User signed in but hasn't completed profile - show setup
      setShowProfileSetup(true);
    }
  }, [user]);

  // If user is authenticated or in demo mode, don't show landing page
  React.useEffect(() => {
    if (user || isDemoMode) {
      console.log('✅ User authenticated or demo mode, hiding landing page');
      setShowLanding(false);
    } else {
      console.log('❌ No user and not in demo mode, may show landing page');
    }
  }, [user, isDemoMode]);

  // Show loading spinner while checking auth (with timeout protection)
  if (authLoading && !forceShowApp) {
    console.log('🔄 Auth loading, showing loader...');
    return <FullPageLoader message="Loading ORBIT LIVE..." />;
  }
  
  console.log('✅ Auth ready, user:', user?.email || 'none', 'forceShowApp:', forceShowApp);

  // User not logged in and not in demo mode - show landing page or login
  if (!user && !isDemoMode) {
    return (
      <Router>
        <Routes>
          {/* Auth callback route - must be accessible even when not logged in */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Public routes */}
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="*"
            element={
              <>
                {showLanding ? (
                  <LandingPage onGetStarted={() => setShowLanding(false)} />
                ) : (
                  <LoginForm onBackToLanding={() => setShowLanding(true)} />
                )}
              </>
            }
          />
        </Routes>
        <Toaster position="top-right" />
      </Router>
    );
  }

  // User is logged in or in demo mode - show loading while checking workspace (but with timeout protection)
  // Only show loading if auth is ready and we're actually checking workspace
  if (groupLoading && !authLoading && !forceShowApp && !isDemoMode) {
    console.log('Group loading, showing workspace setup message...');
    return <FullPageLoader message="Setting up your workspace..." />;
  }
  
  // If auth is still loading and not in demo mode, show auth loading message
  if (authLoading && !forceShowApp && !isDemoMode) {
    return <FullPageLoader message="Loading ORBIT LIVE..." />;
  }

  // Check if user wants to skip workspace setup (stored in localStorage)
  const hasSkippedWorkspace = localStorage.getItem('skipWorkspace') === 'true';
  
  // Check if we have a cached workspace that's being verified
  const hasCachedWorkspace = localStorage.getItem('currentWorkspace') !== null;

  // Wrap everything in Router since we need navigation everywhere
  return (
    <Router>
      <Routes>
        {/* Auth callback route */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Show profile setup if needed */}
        {showProfileSetup ? (
          <Route path="*" element={<ProfileSetup onComplete={() => setShowProfileSetup(false)} />} />
        ) : !currentGroup && !hasSkippedWorkspace && !hasCachedWorkspace && !isDemoMode ? (
          /* User needs to join/create a workspace OR can skip */
          <Route path="*" element={<GroupJoin />} />
        ) : (
          /* User is authenticated (with or without workspace) or in demo mode - show main app */
          <>
            <Route path="/" element={<Layout><Dashboard /></Layout>} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/projects" element={<Layout><Projects /></Layout>} />
            <Route path="/tasks" element={<Layout><Tasks /></Layout>} />
            <Route path="/team" element={<Layout><Team /></Layout>} />
            <Route path="/documents" element={<Layout><Documents /></Layout>} />
            <Route path="/calendar" element={<Layout><Calendar /></Layout>} />
            <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
            <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
            <Route path="/ai" element={<Layout><AIAssistant /></Layout>} />
            <Route path="/settings" element={<Layout><Settings /></Layout>} />
            <Route path="*" element={<Layout><Dashboard /></Layout>} />
          </>
        )}
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;