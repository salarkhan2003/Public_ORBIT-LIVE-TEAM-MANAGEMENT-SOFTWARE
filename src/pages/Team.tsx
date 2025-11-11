import React, { useState } from 'react';
import { Users, Mail, Calendar, Edit, Plus, Crown, Shield, Copy, Check, Tag, X, RefreshCw, Settings, UserMinus, LogOut, UserCog } from 'lucide-react';
import { useGroup } from '../hooks/useGroup';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

// Predefined role options
const PREDEFINED_ROLES = [
  'Founder', 'Co-Founder', 'CEO', 'CTO', 'CFO', 'COO',
  'Team Lead', 'Senior Developer', 'Developer', 'Junior Developer',
  'Designer', 'Product Manager', 'Project Manager',
  'Marketing Manager', 'Sales Manager', 'HR Manager',
  'Intern', 'Consultant', 'Contractor',
];

export function Team() {
  const { currentGroup, groupMembers, refreshGroup } = useGroup();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showWorkspaceSettings, setShowWorkspaceSettings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [removingMember, setRemovingMember] = useState<any>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [changingAdminFor, setChangingAdminFor] = useState<any>(null);

  const currentUserMember = groupMembers.find(m => m.user_id === user?.id);
  const isAdmin = currentUserMember?.role === 'admin';
  const isOwner = currentGroup?.group_owner_id === user?.id;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshGroup();
      toast.success('Team members refreshed!');
    } catch (error) {
      toast.error('Failed to refresh team');
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const copyJoinCode = async () => {
    if (currentGroup?.join_code) {
      await navigator.clipboard.writeText(currentGroup.join_code);
      setCopiedCode(true);
      toast.success('Join code copied to clipboard!');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleEditRoles = (member: any) => {
    setEditingMember(member);
    setShowRoleModal(true);
  };

  const handleExitTeam = async () => {
    if (!currentUserMember) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('id', currentUserMember.id);

      if (error) throw error;

      toast.success('You have left the workspace');
      setShowExitModal(false);
      // Redirect to group join page
      window.location.href = '/';
    } catch (error) {
      console.error('Error leaving workspace:', error);
      toast.error('Failed to leave workspace');
    }
  };

  const handleToggleAdmin = async (member: any) => {
    try {
      const newRole = member.role === 'admin' ? 'member' : 'admin';

      const { error } = await supabase
        .from('group_members')
        .update({ role: newRole })
        .eq('id', member.id);

      if (error) throw error;

      await refreshGroup();
      toast.success(`${member.users?.name} is now ${newRole === 'admin' ? 'an admin' : 'a member'}`);
      setChangingAdminFor(null);
    } catch (error) {
      console.error('Error changing admin status:', error);
      toast.error('Failed to change admin status');
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 rounded-3xl p-8 overflow-hidden shadow-2xl"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black text-white mb-2">Team Members 👥</h1>
              <p className="text-white/90 text-lg">{currentGroup?.name} • {groupMembers.length} members</p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Refresh Button */}
              <motion.button
                onClick={handleRefresh}
                disabled={isRefreshing}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/20 backdrop-blur-lg text-white px-4 py-3 rounded-2xl flex items-center space-x-2 hover:bg-white/30 transition-all border border-white/30 shadow-lg font-semibold disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </motion.button>

              {/* Workspace Settings Button */}
              {isAdmin && (
                <motion.button
                  onClick={() => setShowWorkspaceSettings(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/20 backdrop-blur-lg text-white px-4 py-3 rounded-2xl flex items-center space-x-2 hover:bg-white/30 transition-all border border-white/30 shadow-lg font-semibold"
                >
                  <Settings className="w-5 h-5" />
                  <span>Workspace</span>
                </motion.button>
              )}

              {/* Exit Team Button */}
              <motion.button
                onClick={() => setShowExitModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-red-500/20 backdrop-blur-lg text-white px-4 py-3 rounded-2xl flex items-center space-x-2 hover:bg-red-500/30 transition-all border border-red-300/30 shadow-lg font-semibold"
              >
                <LogOut className="w-5 h-5" />
                <span>Exit Team</span>
              </motion.button>

              {/* Invite Member Button */}
              <motion.button
                onClick={() => setShowInviteModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/20 backdrop-blur-lg text-white px-6 py-3 rounded-2xl flex items-center space-x-2 hover:bg-white/30 transition-all border border-white/30 shadow-lg font-semibold"
              >
                <Plus className="w-5 h-5" />
                <span>Invite</span>
              </motion.button>
            </div>
          </div>

          {/* Join Code Section */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium mb-2">Workspace Join Code</p>
                <div className="flex items-center space-x-3">
                  <code className="text-3xl font-black text-white tracking-wider px-4 py-2 bg-white/20 rounded-xl">
                    {currentGroup?.join_code}
                  </code>
                  <motion.button
                    onClick={copyJoinCode}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
                  >
                    {copiedCode ? <Check className="w-6 h-6 text-green-300" /> : <Copy className="w-6 h-6 text-white" />}
                  </motion.button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-sm mb-1">Share this code • Anyone can join & rejoin unlimited times</p>
                <p className="text-white text-sm">Created {currentGroup?.created_at && format(new Date(currentGroup.created_at), 'MMM dd, yyyy')}</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      </motion.div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groupMembers.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03, y: -5 }}
            className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl transition-all"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative">
                <motion.img
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  src={member.users?.avatar || `https://ui-avatars.com/api/?name=${member.users?.name}&background=3B82F6&color=fff`}
                  alt={member.users?.name}
                  className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-700 shadow-lg"
                />
                {member.role === 'admin' && (
                  <div className="absolute -top-1 -right-1 w-7 h-7 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {member.users?.name}
                  {member.user_id === user?.id && <span className="text-sm text-blue-600 dark:text-blue-400"> (You)</span>}
                  {member.user_id === currentGroup?.group_owner_id && <span className="text-sm text-purple-600 dark:text-purple-400"> 👑 Owner</span>}
                </h3>
                <div className="flex items-center space-x-2 flex-wrap gap-1 mt-1">
                  <span className={`px-3 py-1 text-xs rounded-full font-bold ${
                    member.role === 'admin' 
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                      : 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white'
                  }`}>
                    {member.role === 'admin' ? 'Admin' : 'Member'}
                  </span>
                  {member.user_id === currentGroup?.group_owner_id && (
                    <span className="px-3 py-1 text-xs rounded-full font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                      Workspace Owner
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Custom Role Tags */}
            {member.users?.custom_roles && member.users.custom_roles.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-2">
                  {member.users.custom_roles.map((role: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {member.users?.title && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Shield className="w-4 h-4" />
                  <span>{member.users.title}</span>
                </div>
              )}

              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <span className="truncate">{member.users?.email}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Joined {format(new Date(member.joined_at || ''), 'MMM dd, yyyy')}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <motion.button
                onClick={() => handleEditRoles(member)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 rounded-xl transition-all font-semibold shadow-lg"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Roles</span>
              </motion.button>

              {/* Toggle Admin Button - Only available to workspace owner */}
              {isOwner && member.user_id !== user?.id && (
                <motion.button
                  onClick={() => setChangingAdminFor(member)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm rounded-xl transition-all font-semibold shadow-lg ${
                    member.role === 'admin'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                  }`}
                >
                  <UserCog className="w-4 h-4" />
                  <span>{member.role === 'admin' ? 'Remove Admin' : 'Make Admin'}</span>
                </motion.button>
              )}

              {/* Remove Member Button - Available to ALL members except yourself */}
              {member.user_id !== user?.id && (
                <motion.button
                  onClick={() => setRemovingMember(member)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 rounded-xl transition-all font-semibold shadow-lg"
                >
                  <UserMinus className="w-4 h-4" />
                  <span>Remove Member</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modals */}
      {showInviteModal && (
        <InviteModal
          onClose={() => setShowInviteModal(false)}
          groupCode={currentGroup?.join_code || ''}
        />
      )}

      {showRoleModal && editingMember && (
        <RoleManagementModal
          member={editingMember}
          onClose={() => {
            setShowRoleModal(false);
            setEditingMember(null);
          }}
          onUpdate={() => {
            refreshGroup();
            toast.success('Roles updated successfully!');
          }}
        />
      )}

      {showWorkspaceSettings && isAdmin && (
        <WorkspaceSettingsModal
          workspace={currentGroup}
          onClose={() => setShowWorkspaceSettings(false)}
          onUpdate={() => {
            refreshGroup();
            toast.success('Workspace updated successfully!');
          }}
        />
      )}

      {removingMember && (
        <RemoveMemberModal
          member={removingMember}
          onClose={() => setRemovingMember(null)}
          onConfirm={async () => {
            try {
              const { error } = await supabase
                .from('group_members')
                .delete()
                .eq('id', removingMember.id);

              if (error) throw error;

              await refreshGroup();
              toast.success(`${removingMember.users?.name} has been removed. They can rejoin anytime with the code!`);
              setRemovingMember(null);
            } catch (error) {
              console.error('Error removing member:', error);
              toast.error('Failed to remove member');
            }
          }}
        />
      )}

      {showExitModal && (
        <ExitTeamModal
          onClose={() => setShowExitModal(false)}
          onConfirm={handleExitTeam}
          workspaceName={currentGroup?.name || ''}
        />
      )}

      {changingAdminFor && (
        <ToggleAdminModal
          member={changingAdminFor}
          onClose={() => setChangingAdminFor(null)}
          onConfirm={() => handleToggleAdmin(changingAdminFor)}
        />
      )}
    </div>
  );
}

// Invite Modal Component
interface InviteModalProps {
  onClose: () => void;
  groupCode: string;
}

function InviteModal({ onClose, groupCode }: InviteModalProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(groupCode);
    setCopied(true);
    toast.success('Join code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Invite Team Members
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Share this join code with anyone. They can join and rejoin unlimited times!
        </p>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 mb-4 border-2 border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <code className="text-3xl font-mono font-black text-blue-600 dark:text-blue-400">
              {groupCode}
            </code>
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-4">
          <p className="text-sm text-green-800 dark:text-green-200">
            <strong>✨ New:</strong> Members can rejoin anytime, even after leaving! No limits.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
}

// Exit Team Modal
interface ExitTeamModalProps {
  onClose: () => void;
  onConfirm: () => void;
  workspaceName: string;
}

function ExitTeamModal({ onClose, onConfirm, workspaceName }: ExitTeamModalProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleConfirm = async () => {
    setIsExiting(true);
    await onConfirm();
    setIsExiting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <LogOut className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
          Exit Workspace?
        </h2>

        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          Are you sure you want to leave <strong className="text-gray-900 dark:text-white">{workspaceName}</strong>?
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>💡 Good news:</strong> You can rejoin anytime using the same join code! No restrictions.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isExiting}
            className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
          <motion.button
            onClick={handleConfirm}
            disabled={isExiting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 disabled:opacity-50 transition-all font-semibold shadow-lg flex items-center justify-center space-x-2"
          >
            {isExiting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Exiting...</span>
              </>
            ) : (
              <>
                <LogOut className="w-5 h-5" />
                <span>Exit Team</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// Toggle Admin Modal
interface ToggleAdminModalProps {
  member: any;
  onClose: () => void;
  onConfirm: () => void;
}

function ToggleAdminModal({ member, onClose, onConfirm }: ToggleAdminModalProps) {
  const [isChanging, setIsChanging] = useState(false);
  const isCurrentlyAdmin = member.role === 'admin';

  const handleConfirm = async () => {
    setIsChanging(true);
    await onConfirm();
    setIsChanging(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-center mb-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isCurrentlyAdmin ? 'bg-orange-100 dark:bg-orange-900/20' : 'bg-green-100 dark:bg-green-900/20'
          }`}>
            {isCurrentlyAdmin ? (
              <Crown className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            ) : (
              <UserCog className="w-8 h-8 text-green-600 dark:text-green-400" />
            )}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
          {isCurrentlyAdmin ? 'Remove Admin Access?' : 'Grant Admin Access?'}
        </h2>

        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          {isCurrentlyAdmin
            ? `Remove admin privileges from ${member.users?.name}? They'll become a regular member.`
            : `Make ${member.users?.name} an admin? They'll have full workspace control.`
          }
        </p>

        <div className={`border rounded-xl p-4 mb-6 ${
          isCurrentlyAdmin 
            ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
            : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
        }`}>
          <p className={`text-sm ${
            isCurrentlyAdmin 
              ? 'text-orange-800 dark:text-orange-200'
              : 'text-green-800 dark:text-green-200'
          }`}>
            <strong>👑 Owner Privilege:</strong> Only the workspace creator can manage admin access for team members.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isChanging}
            className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
          <motion.button
            onClick={handleConfirm}
            disabled={isChanging}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 px-6 py-3 text-white rounded-xl disabled:opacity-50 transition-all font-semibold shadow-lg flex items-center justify-center space-x-2 ${
              isCurrentlyAdmin
                ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
            }`}
          >
            {isChanging ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <UserCog className="w-5 h-5" />
                <span>{isCurrentlyAdmin ? 'Remove Admin' : 'Make Admin'}</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// Remove Member Modal
interface RemoveMemberModalProps {
  member: any;
  onClose: () => void;
  onConfirm: () => void;
}

function RemoveMemberModal({ member, onClose, onConfirm }: RemoveMemberModalProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleConfirm = async () => {
    setIsRemoving(true);
    await onConfirm();
    setIsRemoving(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <UserMinus className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
          Remove Team Member?
        </h2>

        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          Remove <strong className="text-gray-900 dark:text-white">{member.users?.name}</strong> from the workspace?
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>💡 They can rejoin:</strong> Removed members can rejoin anytime using the join code. No restrictions!
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isRemoving}
            className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
          <motion.button
            onClick={handleConfirm}
            disabled={isRemoving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 disabled:opacity-50 transition-all font-semibold shadow-lg flex items-center justify-center space-x-2"
          >
            {isRemoving ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Removing...</span>
              </>
            ) : (
              <>
                <UserMinus className="w-5 h-5" />
                <span>Remove Member</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// Role Management Modal - Simplified version
interface RoleManagementModalProps {
  member: any;
  onClose: () => void;
  onUpdate: () => void;
}

function RoleManagementModal({ member, onClose, onUpdate }: RoleManagementModalProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(member.users?.custom_roles || []);
  const [customRole, setCustomRole] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleAddCustomRole = () => {
    if (customRole.trim() && !selectedRoles.includes(customRole.trim())) {
      setSelectedRoles(prev => [...prev, customRole.trim()]);
      setCustomRole('');
    }
  };

  const handleRemoveRole = (role: string) => {
    setSelectedRoles(prev => prev.filter(r => r !== role));
  };

  const handleSaveRoles = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ custom_roles: selectedRoles })
        .eq('id', member.user_id);

      if (error) throw error;

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating roles:', error);
      toast.error('Failed to update roles');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Tag className="w-6 h-6 mr-2 text-purple-600" />
            Manage Roles - {member.users?.name}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Selected Roles */}
        {selectedRoles.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Selected Roles ({selectedRoles.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedRoles.map((role, idx) => (
                <span key={idx} className="inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md">
                  <Tag className="w-3 h-3 mr-1.5" />
                  {role}
                  <button onClick={() => handleRemoveRole(role)} className="ml-2 p-0.5 rounded-full hover:bg-white/20">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Add Custom Role */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Add Custom Role</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomRole()}
              placeholder="Enter custom role..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
            <button onClick={handleAddCustomRole} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold shadow-lg flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Predefined Roles */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Predefined Roles</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {PREDEFINED_ROLES.map(role => (
              <button
                key={role}
                onClick={() => handleRoleToggle(role)}
                className={`px-3 py-2 text-sm rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
                  selectedRoles.includes(role) 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span>{role}</span>
                {selectedRoles.includes(role) && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold">
            Cancel
          </button>
          <button
            onClick={handleSaveRoles}
            disabled={isSaving}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-xl font-semibold shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isSaving ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>Save Roles</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Workspace Settings Modal - Simplified version
interface WorkspaceSettingsModalProps {
  workspace: any;
  onClose: () => void;
  onUpdate: () => void;
}

function WorkspaceSettingsModal({ workspace, onClose, onUpdate }: WorkspaceSettingsModalProps) {
  const [workspaceName, setWorkspaceName] = useState(workspace?.name || '');
  const [workspaceDescription, setWorkspaceDescription] = useState(workspace?.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isRegeneratingCode, setIsRegeneratingCode] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('groups')
        .update({ name: workspaceName, description: workspaceDescription })
        .eq('id', workspace.id);

      if (error) throw error;
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating workspace:', error);
      toast.error('Failed to update workspace');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerateCode = async () => {
    setIsRegeneratingCode(true);
    try {
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { error } = await supabase.from('groups').update({ join_code: newCode }).eq('id', workspace.id);
      if (error) throw error;
      toast.success('New join code generated!');
      onUpdate();
    } catch (error) {
      console.error('Error regenerating code:', error);
      toast.error('Failed to regenerate join code');
    } finally {
      setIsRegeneratingCode(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Settings className="w-6 h-6 mr-2 text-blue-600" />
            Workspace Settings
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Workspace Name</label>
            <input type="text" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea value={workspaceDescription} onChange={(e) => setWorkspaceDescription(e.target.value)} rows={3} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Join Code</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Current: <code className="font-mono font-bold text-blue-600">{workspace?.join_code}</code></p>
              </div>
              <button onClick={handleRegenerateCode} disabled={isRegeneratingCode} className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold shadow-lg flex items-center space-x-2 disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${isRegeneratingCode ? 'animate-spin' : ''}`} />
                <span>{isRegeneratingCode ? 'Generating...' : 'New Code'}</span>
              </button>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">⚠️ Old code becomes invalid</p>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button onClick={onClose} className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold">
            Cancel
          </button>
          <button onClick={handleSave} disabled={isSaving || !workspaceName.trim()} className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl disabled:opacity-50 font-semibold shadow-lg flex items-center justify-center space-x-2">
            {isSaving ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

