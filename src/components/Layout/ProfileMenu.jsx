import React, { useState } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import UserManagementModal from '../UserManagement/UserManagementModal'

const { FiUser, FiLogOut, FiCamera, FiSave, FiX, FiUsers } = FiIcons

const ProfileMenu = ({ user, onClose, onSignOut, onUpdateProfile, collapsed }) => {
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showUserManagement, setShowUserManagement] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })

  const handleSaveProfile = () => {
    onUpdateProfile(profileData)
    setShowEditProfile(false)
    onClose()
  }

  const handleUserManagement = () => {
    setShowUserManagement(true)
    onClose()
  }

  if (showEditProfile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={`absolute ${collapsed ? 'left-16 bottom-0' : 'left-0 bottom-16'} bg-dark-surface border border-dark-border rounded-lg shadow-xl z-50 w-72 p-4`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-dark-text-primary">Edit Profile</h3>
          <button
            onClick={() => setShowEditProfile(false)}
            className="p-1 hover:bg-dark-bg rounded transition-colors"
          >
            <SafeIcon icon={FiX} className="w-4 h-4 text-dark-text-muted" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-accent-blue rounded-full flex items-center justify-center text-white font-medium">
              {profileData.name?.[0] || 'U'}
            </div>
            <button className="flex items-center text-xs text-accent-blue hover:text-blue-400 transition-colors">
              <SafeIcon icon={FiCamera} className="w-3 h-3 mr-1" />
              Change Photo
            </button>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-dark-text-primary mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-dark-bg border border-dark-border rounded-lg text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-dark-text-primary mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-dark-bg border border-dark-border rounded-lg text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
              disabled
            />
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              onClick={() => setShowEditProfile(false)}
              className="flex-1 px-3 py-2 text-sm text-dark-text-secondary hover:text-dark-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              className="flex-1 px-3 py-2 text-sm bg-accent-blue hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              <SafeIcon icon={FiSave} className="w-3 h-3 mr-1" />
              Save
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={`absolute ${collapsed ? 'left-16 bottom-0' : 'left-0 bottom-16'} bg-dark-surface border border-dark-border rounded-lg shadow-xl z-50 w-48`}
      >
        <div className="p-2">
          <button
            onClick={() => setShowEditProfile(true)}
            className="w-full flex items-center px-3 py-2 text-sm text-dark-text-secondary hover:bg-dark-bg hover:text-dark-text-primary rounded-lg transition-colors"
          >
            <SafeIcon icon={FiUser} className="w-4 h-4 mr-3" />
            Edit Profile
          </button>

          <button
            onClick={handleUserManagement}
            className="w-full flex items-center px-3 py-2 text-sm text-dark-text-secondary hover:bg-dark-bg hover:text-dark-text-primary rounded-lg transition-colors"
          >
            <SafeIcon icon={FiUsers} className="w-4 h-4 mr-3" />
            Users
          </button>

          <hr className="my-2 border-dark-border" />

          <button
            onClick={onSignOut}
            className="w-full flex items-center px-3 py-2 text-sm text-dark-text-secondary hover:bg-dark-bg hover:text-accent-red rounded-lg transition-colors"
          >
            <SafeIcon icon={FiLogOut} className="w-4 h-4 mr-3" />
            Sign Out
          </button>
        </div>
      </motion.div>

      {/* User Management Modal */}
      {showUserManagement && (
        <UserManagementModal onClose={() => setShowUserManagement(false)} />
      )}
    </>
  )
}

export default ProfileMenu