import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import supabaseService from '../../services/supabaseService';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiChevronDown, FiPlus, FiUsers, FiMail, FiCheck, FiX, FiSettings } = FiIcons;

function WorkspaceSelector({ onWorkspaceChange }) {
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const [current, accessible] = await Promise.all([
        supabaseService.getCurrentWorkspace(),
        supabaseService.getAccessibleWorkspaces()
      ]);
      
      setCurrentWorkspace(current);
      setWorkspaces(accessible);
    } catch (error) {
      console.error('Failed to load workspaces:', error);
      setError('Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkspaceSwitch = async (workspaceId) => {
    try {
      setLoading(true);
      await supabaseService.switchWorkspace(workspaceId);
      await loadWorkspaces();
      setShowDropdown(false);
      onWorkspaceChange?.();
    } catch (error) {
      console.error('Failed to switch workspace:', error);
      setError('Failed to switch workspace');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      setLoading(true);
      setError('');
      await supabaseService.inviteUserToWorkspace(inviteEmail.trim(), inviteRole);
      setSuccess(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setInviteRole('member');
      setTimeout(() => {
        setShowInviteModal(false);
        setSuccess('');
      }, 2000);
    } catch (error) {
      console.error('Failed to invite user:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !currentWorkspace) {
    return (
      <div className="p-3 bg-gray-800 border border-gray-700 rounded-xl animate-pulse">
        <div className="h-4 bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <motion.button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {currentWorkspace?.name?.charAt(0)?.toUpperCase() || 'W'}
              </span>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white truncate">
                {currentWorkspace?.name || 'Loading...'}
              </p>
              <p className="text-xs text-gray-400">
                {currentWorkspace?.workspace_members_pulse_2024?.length || 0} members
              </p>
            </div>
          </div>
          <SafeIcon 
            icon={FiChevronDown} 
            className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} 
          />
        </motion.button>

        <AnimatePresence>
          {showDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-full left-0 right-0 mt-2 bg-gray-700 rounded-xl shadow-xl border border-gray-600 overflow-hidden z-20"
              >
                {/* Current Workspace Info */}
                <div className="p-4 border-b border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-white">Current Workspace</h3>
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="p-1 hover:bg-gray-600 rounded transition-colors"
                      title="Invite members"
                    >
                      <SafeIcon icon={FiPlus} className="w-4 h-4 text-blue-400" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">
                    {currentWorkspace?.is_personal ? 'Personal workspace' : 'Team workspace'}
                  </p>
                </div>

                {/* Workspace List */}
                <div className="py-2">
                  {workspaces.map((workspace) => (
                    <button
                      key={workspace.id}
                      onClick={() => handleWorkspaceSwitch(workspace.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-600 transition-colors ${
                        workspace.id === currentWorkspace?.id ? 'bg-gray-600' : ''
                      }`}
                    >
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-xs">
                          {workspace.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm text-white truncate">{workspace.name}</p>
                        <p className="text-xs text-gray-400">
                          {workspace.memberRole} • {workspace.is_personal ? 'Personal' : 'Team'}
                        </p>
                      </div>
                      {workspace.id === currentWorkspace?.id && (
                        <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-400" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-gray-600">
                  <p className="text-xs text-gray-500 text-center">
                    Switch between workspaces to access different data
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white">Invite to Workspace</h2>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleInviteUser} className="p-6 space-y-6">
                {success && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                    <p className="text-green-400 text-sm text-center">{success}</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    <p className="text-red-400 text-sm text-center">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiMail} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      placeholder="Enter email address"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Members can view and edit data. Admins can also invite users.
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 px-4 py-3 text-gray-400 hover:text-white transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !inviteEmail.trim()}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-xl font-medium transition-colors"
                  >
                    {loading ? 'Sending...' : 'Send Invite'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default WorkspaceSelector;