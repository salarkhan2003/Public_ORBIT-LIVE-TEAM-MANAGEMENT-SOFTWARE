import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout/Layout';
import { LoginForm } from './components/Auth/LoginForm';
import { ProfileSetup } from './components/Auth/ProfileSetup';
import { GroupJoin } from './components/Group/GroupJoin';
import { AuthCallback } from './pages/AuthCallback';
import { LandingPage } from './pages/LandingPage';
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

  // Add console logging to debug
  React.useEffect(() => {
    console.log('App state:', { user, currentGroup, authLoading, groupLoading });
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

  // Show loading spinner while checking auth and group
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your account...</p>
        </div>
      </div>
    );
  }

  // User not logged in - show landing page or login
  if (!user) {
    return (
      <>
        {showLanding ? (
          <LandingPage onGetStarted={() => setShowLanding(false)} />
        ) : (
          <LoginForm onBackToLanding={() => setShowLanding(true)} />
        )}
        <Toaster position="top-right" />
      </>
    );
  }

  // Show loading while checking group membership
  if (groupLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Setting up workspace...</p>
        </div>
      </div>
    );
  }

  // Wrap everything in Router since we need navigation everywhere
  return (
    <Router>
      <Routes>
        {/* Auth callback route */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Show profile setup if needed */}
        {showProfileSetup ? (
          <Route path="*" element={<ProfileSetup onComplete={() => setShowProfileSetup(false)} />} />
        ) : !currentGroup ? (
          /* User needs to join/create a workspace */
          <Route path="*" element={<GroupJoin />} />
        ) : (
          /* User is authenticated and has a workspace - show main app */
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