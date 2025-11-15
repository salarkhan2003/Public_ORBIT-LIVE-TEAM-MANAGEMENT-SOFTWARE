import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Group, GroupMember } from '../types';

export function useGroup(authReady: boolean = true) {
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false); // Start with false, not true
  const initializedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  // Load workspace from localStorage on mount - DO THIS FIRST
  useEffect(() => {
    const savedWorkspace = localStorage.getItem('currentWorkspace');
    if (savedWorkspace) {
      try {
        const workspace = JSON.parse(savedWorkspace);
        console.log('✅ Restored workspace from localStorage:', workspace.name);
        setCurrentGroup(workspace);
        // Don't set loading here - let the auth check handle it
      } catch (error) {
        console.error('Failed to restore workspace:', error);
        localStorage.removeItem('currentWorkspace');
      }
    }
  }, []);

  // Save workspace to localStorage whenever it changes
  useEffect(() => {
    if (currentGroup) {
      localStorage.setItem('currentWorkspace', JSON.stringify(currentGroup));
      console.log('Workspace saved to localStorage:', currentGroup.name);
    } else {
      localStorage.removeItem('currentWorkspace');
    }
  }, [currentGroup]);

  const fetchGroupMembers = useCallback(async (groupId: string) => {
    try {
      console.log('🔄 Fetching members for group:', groupId);

      // Simple query - get member IDs first (MUST include id, joined_at for proper React keys)
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select('id, user_id, role, group_id, joined_at')
        .eq('group_id', groupId);

      if (memberError) {
        console.error('❌ Error fetching group members:', memberError);
        setGroupMembers([]);
        return;
      }

      if (!memberData || memberData.length === 0) {
        console.log('ℹ️ No members found for group');
        setGroupMembers([]);
        return;
      }

      console.log('📊 Found', memberData.length, 'member records');

      // Then fetch user details separately
      const userIds = memberData.map(m => m.user_id);

      const { data: userDataResult, error: userError } = await supabase
        .from('users')
        .select('*')
        .in('id', userIds);

      if (userError) {
        console.error('⚠️ Error fetching user data:', userError);
        // Still set members even if user fetch fails
        const membersWithoutUsers = memberData.map(member => ({
          ...member,
          users: {
            id: member.user_id,
            email: `user-${member.user_id.slice(0, 8)}@temp.local`,
            name: `User ${member.user_id.slice(0, 8)}`,
            role: 'developer',
            created_at: new Date().toISOString()
          }
        }));
        setGroupMembers(membersWithoutUsers as GroupMember[]);
        return;
      }

      const userData = userDataResult || [];
      console.log('✅ Fetched', userData.length, 'user profiles');

      // Combine the data - ALWAYS create member objects
      const members = memberData.map(member => {
        const userProfile = userData.find(u => u.id === member.user_id);

        return {
          ...member,
          users: userProfile || {
            id: member.user_id,
            email: `user-${member.user_id.slice(0, 8)}@temp.local`,
            name: `User ${member.user_id.slice(0, 8)}`,
            role: 'developer',
            created_at: new Date().toISOString()
          }
        };
      });

      console.log('✅ Setting', members.length, 'members with profiles');
      setGroupMembers(members as GroupMember[]);
    } catch (error) {
      console.error('❌ Error in fetchGroupMembers:', error);
      setGroupMembers([]);
    }
  }, []);

  const checkUserGroup = useCallback(async () => {
    try {
      setLoading(true);
      const userResp = await supabase.auth.getUser();
      const user = userResp?.data?.user ?? null;

      console.log('🔍 Checking user group for:', user?.id);

      if (!user) {
        console.log('❌ No user found, stopping group check');
        setCurrentGroup(null);
        setGroupMembers([]);
        setLoading(false);
        return;
      }

      // Check if we have a cached workspace in localStorage
      const savedWorkspace = localStorage.getItem('currentWorkspace');
      if (savedWorkspace) {
        try {
          const workspace = JSON.parse(savedWorkspace);
          console.log('📦 Found cached workspace:', workspace.name);

          // Verify user is still member of this workspace
          const { data: membership } = await supabase
            .from('group_members')
            .select('group_id, role, user_id')
            .eq('user_id', user.id)
            .eq('group_id', workspace.id)
            .maybeSingle();

          if (membership) {
            console.log('✅ Cached workspace verified, user is still member');
            setCurrentGroup(workspace);
            await fetchGroupMembers(workspace.id);
            setLoading(false);
            return;
          } else {
            console.log('⚠️ User no longer member of cached workspace, clearing cache');
            localStorage.removeItem('currentWorkspace');
          }
        } catch (err) {
          console.error('Error validating cached workspace:', err);
          localStorage.removeItem('currentWorkspace');
        }
      }

      // Check if user is member of any group - SIMPLE QUERY (no recursion)
      const { data: membership, error } = await supabase
        .from('group_members')
        .select('group_id, role, user_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching group membership:', error);
        setCurrentGroup(null);
        setGroupMembers([]);
        setLoading(false);
        return;
      }

      console.log('📊 Group membership data:', membership);

      if (membership && membership.group_id) {
        // Fetch the group details separately
        const { data: grp, error: groupError } = await supabase
          .from('groups')
          .select('*')
          .eq('id', membership.group_id)
          .single();

        if (groupError) {
          console.error('❌ Error fetching group:', groupError);
          setCurrentGroup(null);
          setGroupMembers([]);
          setLoading(false);
          return;
        }

        if (grp) {
          console.log('✅ User is member of group:', grp.name);
          setCurrentGroup(grp as Group);
          await fetchGroupMembers(grp.id);
          setLoading(false);
          return;
        } else {
          console.log('⚠️ Group not found even though membership exists');
          setCurrentGroup(null);
          setGroupMembers([]);
          setLoading(false);
        }
      } else {
        console.log('ℹ️ User is not a member of any group');
        setCurrentGroup(null);
        setGroupMembers([]);
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error in checkUserGroup:', error);
      setCurrentGroup(null);
      setGroupMembers([]);
      setLoading(false);
    } finally {
      // SAFETY: Always ensure loading is false
      console.log('🏁 checkUserGroup complete, ensuring loading is false');
      setLoading(false);
    }
  }, [fetchGroupMembers]);

  useEffect(() => {
    // Get current user to detect user changes
    const checkUser = async () => {
      if (!authReady) {
        console.log('Auth not ready, waiting...');
        setLoading(true);
        return;
      }

      const userResp = await supabase.auth.getUser();
      const currentUserId = userResp?.data?.user?.id || null;

      // If user changed (logged out/logged in as different user), reset initialization
      if (currentUserId !== lastUserIdRef.current) {
        console.log('User changed from', lastUserIdRef.current, 'to', currentUserId, '- resetting workspace check');
        initializedRef.current = false;
        lastUserIdRef.current = currentUserId;

        // If user logged out, clear workspace
        if (!currentUserId) {
          setCurrentGroup(null);
          setGroupMembers([]);
          setLoading(false);
          return;
        }
      }

      // Prevent double initialization for the same user
      if (initializedRef.current && currentUserId === lastUserIdRef.current) {
        console.log('Group already initialized for current user, skipping');
        // Make sure loading is false if already initialized
        if (loading) {
          setLoading(false);
        }
        return;
      }

      if (currentUserId) {
        console.log('Initializing workspace check for user:', currentUserId);
        initializedRef.current = true;
        await checkUserGroup();
      } else {
        // No user, set loading to false
        setLoading(false);
      }
    };

    checkUser();

    // Real-time subscription for group changes
    const subscription = supabase
      .channel('group-membership-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'group_members' },
        () => {
          console.log('Group membership changed, refreshing...');
          checkUserGroup();
        }
      )
      .subscribe();

    return () => {
      console.log('Group cleanup - maintaining user state');
      subscription.unsubscribe();
    };
  }, [authReady, checkUserGroup]);


  const joinGroup = async (groupCode: string) => {
    setLoading(true);
    try {
      const userResp = await supabase.auth.getUser();
      const user = userResp?.data?.user ?? null;
      if (!user) throw new Error('Not authenticated');

      console.log('Joining group with code:', groupCode);

      // Find group by code - case insensitive
      const normalizedCode = groupCode.toUpperCase().trim();
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .ilike('join_code', normalizedCode)
        .maybeSingle();

      if (groupError) {
        console.error('Group lookup error:', groupError);
        throw new Error('Failed to lookup group. Please try again.');
      }

      if (!group) {
        console.error('No group found with code:', normalizedCode);
        throw new Error('Invalid group code. Please check and try again.');
      }

      console.log('Found group:', group.name);

      // Check if user is already a member - SIMPLE QUERY
      const { data: anyMembership } = await supabase
        .from('group_members')
        .select('group_id, user_id, role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (anyMembership) {
        console.log('User already in a group');

        // If same group, just return it
        if (anyMembership.group_id === group.id) {
          // Fetch full group details
          const { data: existingGroup } = await supabase
            .from('groups')
            .select('*')
            .eq('id', anyMembership.group_id)
            .single();

          if (existingGroup) {
            setCurrentGroup(existingGroup as Group);
            await fetchGroupMembers(existingGroup.id);
            setLoading(false);
            return existingGroup;
          }
        }

        // Different group - not allowed
        throw new Error('You are already a member of another workspace');
      }

      console.log('User not in any group, adding to:', group.name);

      // Add user to group with upsert to handle race conditions
      const { error: memberError } = await supabase
        .from('group_members')
        .upsert(
          {
            group_id: group.id,
            user_id: user.id,
            role: 'member'
          },
          {
            onConflict: 'group_id,user_id',
            ignoreDuplicates: false
          }
        )
        .select()
        .single();

      if (memberError) {
        console.error('Error adding member:', memberError);
        // If it's a duplicate key error, fetch the existing membership
        if (memberError.code === '23505') {
          console.log('Duplicate detected, fetching group');
          setCurrentGroup(group as Group);
          await fetchGroupMembers(group.id);
          setLoading(false);
          return group;
        }
        throw memberError;
      }

      console.log('Successfully added to group');

      // Update the state
      setCurrentGroup(group as Group);
      await fetchGroupMembers(group.id);

      // CRITICAL: Set loading to false before returning
      setLoading(false);

      // Save to localStorage
      localStorage.setItem('currentWorkspace', JSON.stringify(group));

      return group;
    } catch (error) {
      console.error('Error joining group:', error);
      setLoading(false);
      throw error;
    } finally {
      // SAFETY: Always ensure loading is false
      setLoading(false);
    }
  };

  const createGroup = async (name: string, description: string) => {
    setLoading(true);
    try {
      const userResp = await supabase.auth.getUser();
      const user = userResp?.data?.user ?? null;
      if (!user) throw new Error('Not authenticated');

      // Check if user is already in a group - SIMPLE QUERY
      const { data: existingMembership } = await supabase
        .from('group_members')
        .select('group_id, user_id, role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingMembership && existingMembership.group_id) {
        console.log('User already in group');
        // Fetch the group details separately
        const { data: existingGroup } = await supabase
          .from('groups')
          .select('*')
          .eq('id', existingMembership.group_id)
          .single();

        if (existingGroup) {
          throw new Error('You are already a member of a workspace. Please leave your current workspace first.');
        }
      }

      const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      console.log('Creating group with:', { name, description, joinCode });

      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          name,
          description,
          group_owner_id: user.id,
          join_code: joinCode
        })
        .select()
        .single();

      if (groupError || !group) {
        console.error('Group creation error:', groupError);
        throw groupError || new Error('Failed to create group');
      }

      console.log('Group created:', group);

      // Add creator as admin with upsert
      const { error: memberError } = await supabase
        .from('group_members')
        .upsert(
          {
            group_id: group.id,
            user_id: user.id,
            role: 'admin'
          },
          {
            onConflict: 'group_id,user_id',
            ignoreDuplicates: false
          }
        );

      if (memberError && memberError.code !== '23505') {
        console.error('Member insert error:', memberError);
        throw memberError;
      }

      console.log('Creator added as admin');

      setCurrentGroup(group as Group);
      await fetchGroupMembers(group.id);

      // Save to localStorage
      localStorage.setItem('currentWorkspace', JSON.stringify(group));

      setLoading(false);
      return group;
    } catch (error) {
      console.error('Error creating group:', error);
      setLoading(false);
      throw error;
    } finally {
      // SAFETY: Always ensure loading is false
      setLoading(false);
    }
  };

  const leaveGroup = async () => {
    try {
      const userResp = await supabase.auth.getUser();
      const user = userResp?.data?.user ?? null;
      if (!user || !currentGroup) throw new Error('Not authenticated or no group');

      // Delete user's membership
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', currentGroup.id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Clear local state
      setCurrentGroup(null);
      setGroupMembers([]);

      return true;
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  };

  return {
    currentGroup,
    groupMembers,
    loading,
    joinGroup,
    createGroup,
    leaveGroup,
    refreshGroup: checkUserGroup,
  };
}