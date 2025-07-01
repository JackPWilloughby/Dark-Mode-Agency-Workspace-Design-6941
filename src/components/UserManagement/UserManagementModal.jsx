import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'

const { 
  FiX, FiPlus, FiMail, FiUserPlus, FiTrash2, FiEdit2, FiShield, 
  FiUser, FiCrown, FiLoader, FiCheck, FiAlertCircle, FiCopy 
} = FiIcons

const UserManagementModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('members')
  const [workspaceMembers, setWorkspaceMembers] = useState([])
  const [pendingInvitations, setPendingInvitations] = useState([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')

  // Invite form state
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'member'
  })

  // Mock profile for demonstration
  const mockProfile = {
    id: 'dev-user-1',
    name: 'Development User',
    email: 'dev@pulsehq.com',
    role: 'owner'
  }

  // Mock data for demonstration
  useEffect(() => {
    loadMockData()
  }, [])

  const loadMockData = () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setWorkspaceMembers([
        {
          id: mockProfile.id,
          name: mockProfile.name,
          email: mockProfile.email,
          role: mockProfile.role,
          created_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString()
        },
        {
          id: 'user2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'admin',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          last_sign_in_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'user3',
          name: 'Bob Johnson',
          email: 'bob@example.com',
          role: 'member',
          created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          last_sign_in_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        }
      ])

      setPendingInvitations([
        {
          id: 'inv1',
          email: 'alice@example.com',
          role: 'member',
          created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          expires_at: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
          invited_by: mockProfile.id,
          inviter: { name: mockProfile.name },
          token: 'invitation-token-123'
        }
      ])
      setLoading(false)
    }, 1000)
  }

  const handleInviteUser = async (e) => {
    e.preventDefault()
    setActionLoading(true)
    setMessage('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Check if user already exists
      const existingMember = workspaceMembers.find(m => m.email === inviteData.email)
      const existingInvitation = pendingInvitations.find(i => i.email === inviteData.email)

      if (existingMember || existingInvitation) {
        setMessage('User is already invited or is a member of this workspace')
        setMessageType('error')
        setActionLoading(false)
        return
      }

      // Create new invitation
      const newInvitation = {
        id: Date.now().toString(),
        email: inviteData.email.toLowerCase().trim(),
        role: inviteData.role,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        invited_by: mockProfile.id,
        inviter: { name: mockProfile.name },
        token: `invitation-${Date.now()}`
      }

      setPendingInvitations(prev => [newInvitation, ...prev])
      setMessage(`Invitation sent to ${inviteData.email}`)
      setMessageType('success')
      setInviteData({ email: '', role: 'member' })
      setShowInviteForm(false)

      // Clear message after 5 seconds
      setTimeout(() => setMessage(''), 5000)
    } catch (error) {
      console.error('Error inviting user:', error)
      setMessage('Failed to send invitation')
      setMessageType('error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateUserRole = async (userId, newRole) => {
    if (mockProfile.role !== 'owner' && newRole === 'owner') {
      setMessage('Only workspace owners can assign owner role')
      setMessageType('error')
      setTimeout(() => setMessage(''), 5000)
      return
    }

    setActionLoading(true)
    setMessage('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setWorkspaceMembers(prev =>
        prev.map(member =>
          member.id === userId ? { ...member, role: newRole } : member
        )
      )

      setMessage('User role updated successfully')
      setMessageType('success')
      setTimeout(() => setMessage(''), 5000)
    } catch (error) {
      console.error('Error updating user role:', error)
      setMessage('Failed to update user role')
      setMessageType('error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRemoveUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to remove ${userName} from the workspace?`)) {
      return
    }

    setActionLoading(true)
    setMessage('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setWorkspaceMembers(prev => prev.filter(member => member.id !== userId))
      setMessage(`${userName} has been removed from the workspace`)
      setMessageType('success')
      setTimeout(() => setMessage(''), 5000)
    } catch (error) {
      console.error('Error removing user:', error)
      setMessage('Failed to remove user')
      setMessageType('error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelInvitation = async (invitationId, email) => {
    setActionLoading(true)
    setMessage('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setPendingInvitations(prev => prev.filter(inv => inv.id !== invitationId))
      setMessage(`Invitation to ${email} has been cancelled`)
      setMessageType('success')
      setTimeout(() => setMessage(''), 5000)
    } catch (error) {
      console.error('Error cancelling invitation:', error)
      setMessage('Failed to cancel invitation')
      setMessageType('error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCopyInviteLink = async (invitation) => {
    const inviteLink = `${window.location.origin}/invite/${invitation.token}`
    try {
      await navigator.clipboard.writeText(inviteLink)
      setMessage('Invitation link copied to clipboard')
      setMessageType('success')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Failed to copy:', error)
      setMessage('Failed to copy invitation link')
      setMessageType('error')
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner': return FiCrown
      case 'admin': return FiShield
      default: return FiUser
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner': return 'text-yellow-400'
      case 'admin': return 'text-blue-400'
      default: return 'text-dark-text-muted'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-dark-surface rounded-default border border-dark-border w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <div>
            <h2 className="text-xl font-semibold text-dark-text-primary">User Management</h2>
            <p className="text-sm text-dark-text-secondary">
              Manage workspace members and invitations
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowInviteForm(true)}
              className="flex items-center px-3 py-2 bg-accent-blue hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
            >
              <SafeIcon icon={FiUserPlus} className="w-4 h-4 mr-2" />
              Invite User
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-dark-bg rounded-lg transition-colors"
            >
              <SafeIcon icon={FiX} className="text-dark-text-secondary" />
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`px-6 py-3 border-b border-dark-border ${
            messageType === 'success' 
              ? 'bg-accent-green/10 text-accent-green border-accent-green/20' 
              : messageType === 'error'
              ? 'bg-accent-red/10 text-accent-red border-accent-red/20'
              : 'bg-accent-blue/10 text-accent-blue border-accent-blue/20'
          }`}>
            <div className="flex items-center space-x-2">
              <SafeIcon icon={messageType === 'success' ? FiCheck : FiAlertCircle} className="w-4 h-4" />
              <span className="text-sm">{message}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-dark-border">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'members'
                ? 'border-accent-blue text-accent-blue'
                : 'border-transparent text-dark-text-muted hover:text-dark-text-primary'
            }`}
          >
            Members ({workspaceMembers.length})
          </button>
          <button
            onClick={() => setActiveTab('invitations')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'invitations'
                ? 'border-accent-blue text-accent-blue'
                : 'border-transparent text-dark-text-muted hover:text-dark-text-primary'
            }`}
          >
            Pending Invitations ({pendingInvitations.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <SafeIcon icon={FiLoader} className="w-6 h-6 animate-spin text-accent-blue" />
            </div>
          ) : (
            <>
              {/* Members Tab */}
              {activeTab === 'members' && (
                <div className="space-y-4">
                  {workspaceMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 bg-dark-bg rounded-lg border border-dark-border"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-accent-blue rounded-full flex items-center justify-center text-white font-medium">
                          {member.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-dark-text-primary">{member.name}</h3>
                            <SafeIcon icon={getRoleIcon(member.role)} className={`w-4 h-4 ${getRoleColor(member.role)}`} />
                          </div>
                          <p className="text-sm text-dark-text-secondary">{member.email}</p>
                          <p className="text-xs text-dark-text-muted">
                            Last active: {formatDate(member.last_sign_in_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Role selector */}
                        {member.id !== mockProfile.id && (mockProfile.role === 'owner' || member.role !== 'owner') && (
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateUserRole(member.id, e.target.value)}
                            disabled={actionLoading}
                            className="px-3 py-1 bg-dark-surface border border-dark-border rounded text-sm text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                            {mockProfile.role === 'owner' && <option value="owner">Owner</option>}
                          </select>
                        )}

                        {/* Remove user button */}
                        {member.id !== mockProfile.id && member.role !== 'owner' && (
                          <button
                            onClick={() => handleRemoveUser(member.id, member.name)}
                            disabled={actionLoading}
                            className="p-2 text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {workspaceMembers.length === 0 && (
                    <div className="text-center py-8 text-dark-text-muted">
                      <SafeIcon icon={FiUser} className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No members found</p>
                    </div>
                  )}
                </div>
              )}

              {/* Invitations Tab */}
              {activeTab === 'invitations' && (
                <div className="space-y-4">
                  {pendingInvitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-4 bg-dark-bg rounded-lg border border-dark-border"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-dark-text-muted rounded-full flex items-center justify-center text-white">
                          <SafeIcon icon={FiMail} className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-dark-text-primary">{invitation.email}</h3>
                          <p className="text-sm text-dark-text-secondary">
                            Invited as {invitation.role} • Expires {formatDate(invitation.expires_at)}
                          </p>
                          <p className="text-xs text-dark-text-muted">
                            Invited by {invitation.inviter?.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleCopyInviteLink(invitation)}
                          className="p-2 text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-colors"
                          title="Copy invitation link"
                        >
                          <SafeIcon icon={FiCopy} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCancelInvitation(invitation.id, invitation.email)}
                          disabled={actionLoading}
                          className="p-2 text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <SafeIcon icon={FiX} className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {pendingInvitations.length === 0 && (
                    <div className="text-center py-8 text-dark-text-muted">
                      <SafeIcon icon={FiMail} className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No pending invitations</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Invite Form Modal */}
        {showInviteForm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dark-surface rounded-default border border-dark-border w-full max-w-md"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-dark-text-primary mb-4">
                  Invite User
                </h3>

                <form onSubmit={handleInviteUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-text-primary mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={inviteData.email}
                      onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                      placeholder="user@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-text-primary mb-2">
                      Role
                    </label>
                    <select
                      value={inviteData.role}
                      onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                      className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowInviteForm(false)}
                      className="flex-1 px-4 py-2 text-dark-text-secondary hover:text-dark-text-primary transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2 bg-accent-blue hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center"
                    >
                      {actionLoading ? (
                        <SafeIcon icon={FiLoader} className="w-4 h-4 animate-spin" />
                      ) : (
                        'Send Invite'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default UserManagementModal