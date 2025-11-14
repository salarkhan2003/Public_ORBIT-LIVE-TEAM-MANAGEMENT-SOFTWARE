import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Group, GroupMember } from '../types';

export function useGroup(authReady: boolean = true) {
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  // Load workspace from localStorage on mount
  useEffect(() => {
    const savedWorkspace = localStorage.getItem('currentWorkspace');
    if (savedWorkspace) {
      try {
        const workspace = JSON.parse(savedWorkspace);
        console.log('Restored workspace from localStorage:', workspace.name);
        setCurrentGroup(workspace);
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

  useEffect(() => {
    // Prevent double initialization in React 18 Strict Mode
    if (initializedRef.current) {
      console.log('Group already initialized, skipping');
      return;
    }

    // Wait for auth to be ready before checking group
    if (!authReady) {
      setLoading(true);
      return;
    }

    initializedRef.current = true;
    checkUserGroup();

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
      console.log('Group cleanup - keeping initialized flag for persistence');
      subscription.unsubscribe();
      // Don't reset initializedRef to maintain workspace state across re-logins
    };
  }, [authReady]);

  const checkUserGroup = async () => {
    setLoading(true);
    try {
      const userResp = await supabase.auth.getUser();
      const user = userResp?.data?.user ?? null;

      console.log('Checking user group for:', user?.id);

      if (!user) {
        console.log('No user found, stopping group check');
        setCurrentGroup(null);
        setLoading(false);
        return;
      }

      // Check if user is member of any group - SIMPLE QUERY (no recursion)
      const { data: membership, error } = await supabase
        .from('group_members')
        .select('group_id, role, user_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching group membership:', error);
        // Don't throw - just log and continue
        setCurrentGroup(null);
        setLoading(false);
        return;
      }

      console.log('Group membership data:', membership);

      if (membership && membership.group_id) {
        // Fetch the group details separately
        const { data: grp, error: groupError } = await supabase
          .from('groups')
          .select('*')
          .eq('id', membership.group_id)
          .single();

        if (groupError) {
          console.error('Error fetching group:', groupError);
          setCurrentGroup(null);
          setLoading(false);
          return;
        }

        if (grp) {
          console.log('User is member of group:', grp.name);
          setCurrentGroup(grp as Group);
          await fetchGroupMembers(grp.id);
        } else {
          console.log('Group not found');
          setCurrentGroup(null);
          setGroupMembers([]);
        }
      } else {
        console.log('User is not member of any group');
        setCurrentGroup(null);
        setGroupMembers([]);
      }
    } catch (error) {
      console.error('Error checking user group:', error);
      setCurrentGroup(null);
      setGroupMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupMembers = async (groupId: string) => {
    try {
      // Simple query - get member IDs first
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select('user_id, role, group_id')
        .eq('group_id', groupId);

      if (memberError) {
        console.error('Error fetching group members:', memberError);
        return;
      }

      if (!memberData || memberData.length === 0) {
        setGroupMembers([]);
        return;
      }

      // Then fetch user details separately
      const userIds = memberData.map(m => m.user_id);
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .in('id', userIds);

      if (userError) {
        console.error('Error fetching user data:', userError);
        setGroupMembers([]);
        return;
      }

      // Combine the data
      const members = memberData.map(member => ({
        ...member,
        users: userData?.find(u => u.id === member.user_id)
      }));

      setGroupMembers((members as GroupMember[]) || []);
    } catch (error) {
      console.error('Error fetching group members:', error);
      setGroupMembers([]);
    }
  };

  const joinGroup = async (groupCode: string) => {
    setLoading(true);
    try {
      const userResp = await supabase.auth.getUser();
      const user = userResp?.data?.user ?? null;
      if (!user) throw new Error('Not authenticated');

      console.log('Joining group with code:', groupCode);

      // Find group by code
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('join_code', groupCode)
        .single();

      if (groupError) {
        console.error('Group lookup error:', groupError);
        throw new Error('Invalid group code');
      }

      if (!group) {
        throw new Error('Group not found');
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


      setLoading(false);
      return group;
    } catch (error) {
      console.error('Error joining group:', error);
      setLoading(false);
      throw error;
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

      setLoading(false);
      return group;
    } catch (error) {
      console.error('Error creating group:', error);
      setLoading(false);
      throw error;
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