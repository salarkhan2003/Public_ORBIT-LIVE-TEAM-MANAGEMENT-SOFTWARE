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
      setLoading(true); // Keep loading while waiting for auth
      return;
    }

    initializedRef.current = true;
    checkUserGroup();

    return () => {
      console.log('Group cleanup - resetting initialized flag');
      initializedRef.current = false; // Reset so it can initialize again on remount
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
        .limit(1);

      if (error) {
        console.error('Error fetching group membership:', error);
        throw error;
      }

      console.log('Group membership data:', membership);

      if (membership && membership.length > 0 && membership[0]?.groups) {
        const grp = membership[0].groups as Group;
        console.log('User is member of group:', grp.name);
        setCurrentGroup(grp);
        await fetchGroupMembers(grp.id);
      } else {
        console.log('User is not member of any group');
        setCurrentGroup(null);
      }
    } catch (error) {
      console.error('Error checking user group:', error);
      setCurrentGroup(null);
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
      const { data: existingMembership, error: membershipError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', (group as any).id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (membershipError) throw membershipError;

      // If user is already a member, just update state and return
      if (existingMembership) {
        setCurrentGroup(group as Group);
        await fetchGroupMembers((group as any).id);
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

      setCurrentGroup(group as Group);
      await fetchGroupMembers((group as any).id);

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

      // Generate a short join code and ensure minimal collision handling could be added later
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

      // Update state immediately
      setCurrentGroup(group as Group);
      await fetchGroupMembers((group as any).id);

      console.log('State updated, returning group');
      return group;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    currentGroup,
    groupMembers,
    loading,
    joinGroup,
    createGroup,
    refreshGroup: checkUserGroup,
    refreshMembers: () => currentGroup && fetchGroupMembers(currentGroup.id)
  };
}