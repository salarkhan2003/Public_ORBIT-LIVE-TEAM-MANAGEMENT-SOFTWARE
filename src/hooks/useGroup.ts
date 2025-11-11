import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Group, GroupMember } from '../types';

export function useGroup(authReady: boolean = true) {
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

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
      console.log('Group cleanup - resetting initialized flag');
      subscription.unsubscribe();
      // initializedRef.current = false; // Removed to prevent resetting on re-login
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
        setLoading(false);
        return;
      }

      // Check if user is member of any group
      const { data: membership, error } = await supabase
        .from('group_members')
        .select(`
          *,
          groups (*)
        `)
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching group membership:', error);
        throw error;
      }

      console.log('Group membership data:', membership);

      if (membership && membership.groups) {
        const grp = membership.groups as Group;
        console.log('User is member of group:', grp.name);
        setCurrentGroup(grp);
        await fetchGroupMembers(grp.id);
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
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          users (*)
        `)
        .eq('group_id', groupId);

      if (error) throw error;
      setGroupMembers((data as GroupMember[]) || []);
    } catch (error) {
      console.error('Error fetching group members:', error);
    }
  };

  const joinGroup = async (groupCode: string) => {
    setLoading(true);
    try {
      const userResp = await supabase.auth.getUser();
      const user = userResp?.data?.user ?? null;
      if (!user) throw new Error('Not authenticated');

      // Find group by code
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('join_code', groupCode)
        .single();

      if (groupError || !group) throw new Error('Invalid group code');

      // Check if user is already a member of this group
      const { data: existingMembership } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', (group as any).id)
        .eq('user_id', user.id)
        .maybeSingle();

      // If user is already a member, just update state and return
      if (existingMembership) {
        setCurrentGroup(group as Group);
        await fetchGroupMembers((group as any).id);
        setLoading(false);
        return group;
      }

      // Add user to group
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: (group as any).id,
          user_id: user.id,
          role: 'member'
        });

      if (memberError) throw memberError;

      // Immediately update the state
      setCurrentGroup(group as Group);
      await fetchGroupMembers((group as any).id);

      // Also trigger a full re-check to ensure everything is synchronized
      await checkUserGroup();

      return group;
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (name: string, description: string) => {
    setLoading(true);
    try {
      const userResp = await supabase.auth.getUser();
      const user = userResp?.data?.user ?? null;
      if (!user) throw new Error('Not authenticated');

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

      // Add creator as admin
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: (group as any).id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) {
        console.error('Member insert error:', memberError);
        throw memberError;
      }

      console.log('Creator added as admin');

      setCurrentGroup(group as Group);
      await fetchGroupMembers((group as any).id);

      return group;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    } finally {
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