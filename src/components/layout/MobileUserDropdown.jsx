import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth.jsx';
import EditProfileModal from '../profile/EditProfileModal';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiLogOut, FiMoreVertical, FiEdit } = FiIcons;

function MobileUserDropdown() {
  const { profile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img
            src={profile?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'}
            alt={profile?.full_name || 'User'}
            className="w-8 h-8 rounded-full border-2 border-gray-600"
          />
          <SafeIcon icon={FiMoreVertical} className="w-4 h-4 text-gray-400" />
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />

              {/* Dropdown Menu */}
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-2 bg-gray-700 rounded-xl shadow-xl border border-gray-600 min-w-48 z-20"
              >
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-600">
                  <p className="text-sm font-medium text-white truncate">
                    {profile?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {profile?.email || 'user@example.com'}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={handleEditProfile}
                    className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-600 flex items-center space-x-3 transition-colors"
                  >
                    <SafeIcon icon={FiEdit} className="w-4 h-4" />
                    <span className="text-sm">Edit Profile</span>
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-600 py-2">
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/10 flex items-center space-x-3 transition-colors"
                  >
                    <SafeIcon icon={FiLogOut} className="w-4 h-4" />
                    <span className="text-sm">Sign Out</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showEditModal && (
          <EditProfileModal onClose={() => setShowEditModal(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

export default MobileUserDropdown;