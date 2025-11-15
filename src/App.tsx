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
  const [showProfileSetup, setShowProfileSetup] = React.useState(false);
  const [showLanding, setShowLanding] = React.useState(true);

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

  // If user is authenticated, don't show landing page
  React.useEffect(() => {
    if (user) {
      setShowLanding(false);
    }
  }, [user]);

  // Show loading spinner while checking auth
  if (authLoading) {
    return <FullPageLoader message="Loading ORBIT LIVE..." />;
  }

  // User not logged in - show landing page or login
  if (!user) {
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

  // User is logged in - show loading while checking workspace (but with timeout protection)
  if (groupLoading) {
    console.log('Group loading, showing workspace setup message...');
    return <FullPageLoader message="Setting up your workspace..." />;
  }

  // Check if user wants to skip workspace setup (stored in localStorage)
  const hasSkippedWorkspace = localStorage.getItem('skipWorkspace') === 'true';

  // Wrap everything in Router since we need navigation everywhere
  return (
    <Router>
      <Routes>
        {/* Auth callback route */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Show profile setup if needed */}
        {showProfileSetup ? (
          <Route path="*" element={<ProfileSetup onComplete={() => setShowProfileSetup(false)} />} />
        ) : !currentGroup && !hasSkippedWorkspace ? (
          /* User needs to join/create a workspace OR can skip */
          <Route path="*" element={<GroupJoin />} />
        ) : (
          /* User is authenticated (with or without workspace) - show main app */
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