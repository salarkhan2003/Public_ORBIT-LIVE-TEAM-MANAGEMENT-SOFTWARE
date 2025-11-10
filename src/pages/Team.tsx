import React, { useState } from 'react';
import { Users, Mail, Phone, MapPin, Calendar, Edit, Plus, Crown, Shield, MessageCircle, Video, UserCheck } from 'lucide-react';
import { useGroup } from '../hooks/useGroup';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';

export function Team() {
  const { currentGroup, groupMembers } = useGroup();
  const { user } = useAuth();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const isAdmin = groupMembers.find(member => 
    member.user_id === user?.id && member.role === 'admin'
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {currentGroup?.name} • {groupMembers.length} members
          </p>
        </div>
        
        {isAdmin && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Invite Member</span>
          </button>
        )}
      </div>

      {/* Group Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {currentGroup?.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {currentGroup?.description || 'No description provided'}
            </p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Join Code: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">{currentGroup?.join_code}</code></span>
              {currentGroup?.created_at && (
                <span>Created {format(new Date(currentGroup.created_at), 'MMM dd, yyyy')}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groupMembers.map((member) => (
          <div key={member.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative">
                <img
                  src={member.users?.avatar || `https://ui-avatars.com/api/?name=${member.users?.name}&background=3B82F6&color=fff`}
                  alt={member.users?.name}
                  className="w-16 h-16 rounded-full"
                />
                {member.role === 'admin' && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Crown className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {member.users?.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    member.role === 'admin' 
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                  }`}>
                    {member.role === 'admin' ? 'Admin' : 'Member'}
                  </span>
                  {member.users?.role && (
                    <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                      {member.users.role}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {member.users?.title && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Shield className="w-4 h-4" />
                  <span>{member.users.title}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <span>{member.users?.email}</span>
              </div>

              {member.users?.phone && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span>{member.users.phone}</span>
                </div>
              )}

              {member.users?.location && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>{member.users.location}</span>
                </div>
              )}

              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Joined {format(new Date(member.joined_at || ''), 'MMM dd, yyyy')}</span>
              </div>

              {member.users?.skills && member.users.skills.length > 0 && (
                <div className="pt-2">
                  <div className="flex flex-wrap gap-1">
                    {member.users.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {member.users.skills.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                        +{member.users.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {member.user_id === user?.id ? (
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedMember(member)}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>View Profile</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span>Message</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteModal
          onClose={() => setShowInviteModal(false)}
          groupCode={currentGroup?.join_code || ''}
        />
      )}

      {/* Member Profile Modal */}
      {selectedMember && (
        <MemberProfileModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
}

interface InviteModalProps {
  onClose: () => void;
  groupCode: string;
}

function InviteModal({ onClose, groupCode }: InviteModalProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(groupCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Invite Team Members
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Share this join code with your team members to invite them to the group.
          </p>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <code className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
                {groupCode}
              </code>
              <button
                onClick={copyToClipboard}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MemberProfileModalProps {
  member: any;
  onClose: () => void;
}

function MemberProfileModal({ member, onClose }: MemberProfileModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              <img
                src={member.users?.avatar || `https://ui-avatars.com/api/?name=${member.users?.name}&background=3B82F6&color=fff`}
                alt={member.users?.name}
                className="w-20 h-20 rounded-full"
              />
              {member.role === 'admin' && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {member.users?.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {member.users?.title || 'Team Member'}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  member.role === 'admin' 
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                }`}>
                  {member.role === 'admin' ? 'Admin' : 'Member'}
                </span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Online</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {member.users?.bio && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About</h3>
              <p className="text-gray-600 dark:text-gray-400">{member.users.bio}</p>
            </div>
          )}

          {/* Contact Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{member.users?.email}</p>
                </div>
              </div>
              
              {member.users?.phone && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Phone</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{member.users.phone}</p>
                  </div>
                </div>
              )}
              
              {member.users?.location && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Location</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{member.users.location}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Joined</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {format(new Date(member.joined_at || ''), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          {member.users?.skills && member.users.skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {member.users.skills.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
            <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
              <MessageCircle className="w-4 h-4" />
              <span>Send Message</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}