import { useState, useEffect } from 'react';
import { Group } from '../types';
import { useAuth } from './useAuth';

// Demo workspace data
const DEMO_WORKSPACE: Group = {
  id: 'demo-workspace-id',
  name: 'Demo Workspace',
  description: 'Explore ORBIT LIVE TEAM features without signing up',
  join_code: 'DEMO01',
  group_owner_id: 'demo-user-id',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Demo user data
const DEMO_USER = {
  id: 'demo-user-id',
  email: 'demo@example.com',
  name: 'Demo User',
  role: 'developer',
  title: 'Team Member',
  created_at: new Date().toISOString(),
};

export function useDemoMode() {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoWorkspace, setDemoWorkspace] = useState<Group | null>(null);
  const { signOut } = useAuth();

  // Check if demo mode is active
  useEffect(() => {
    const demoFlag = localStorage.getItem('demoMode') === 'true';
    const skipWorkspace = localStorage.getItem('skipWorkspace') === 'true';
    
    if (demoFlag || skipWorkspace) {
      setIsDemoMode(true);
      setDemoWorkspace(DEMO_WORKSPACE);
    }
  }, []);

  // Activate demo mode
  const activateDemoMode = () => {
    localStorage.setItem('demoMode', 'true');
    localStorage.setItem('skipWorkspace', 'true');
    setIsDemoMode(true);
    setDemoWorkspace(DEMO_WORKSPACE);
  };

  // Deactivate demo mode and sign out
  const deactivateDemoMode = async () => {
    localStorage.removeItem('demoMode');
    localStorage.removeItem('skipWorkspace');
    localStorage.removeItem('currentWorkspace');
    setIsDemoMode(false);
    setDemoWorkspace(null);
    // Sign out to ensure clean state
    await signOut();
  };

  return {
    isDemoMode,
    demoWorkspace,
    demoUser: DEMO_USER,
    activateDemoMode,
    deactivateDemoMode,
  };
}