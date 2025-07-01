import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth.jsx';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiLogOut, FiChevronDown, FiEdit } = FiIcons;

function UserDropdown() {
  const { profile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const handleEditProfile = () => {
    setIsOpen(false);
    // Add edit profile functionality here if needed
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors w-full group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative">
          <img
            src={profile?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'}
            alt={profile?.full_name || 'User'}
            className="w-8 h-8 rounded-full border-2 border-gray-600 group-hover:border-blue-500 transition-colors"
          />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-700"></div>
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-white truncate group-hover:text-blue-300 transition-colors">
            {profile?.full_name || 'User'}
          </p>
          <p className="text-xs text-gray-400 truncate">
            {profile?.role || 'Member'}
          </p>
        </div>
        <SafeIcon
          icon={FiChevronDown}
          className={`w-4 h-4 text-gray-400 transition-all duration-200 ${
            isOpen ? 'rotate-180 text-blue-400' : 'group-hover:text-gray-300'
          }`}
        />
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
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 right-0 mb-2 bg-gray-700 rounded-xl shadow-xl border border-gray-600 overflow-hidden z-20"
            >
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-gray-600 bg-gray-750">
                <div className="flex items-center space-x-3">
                  <img
                    src={profile?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'}
                    alt={profile?.full_name || 'User'}
                    className="w-10 h-10 rounded-full border-2 border-gray-600"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {profile?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {profile?.email || 'user@example.com'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={handleEditProfile}
                  className="w-full px-4 py-2.5 text-left text-gray-300 hover:bg-gray-600 hover:text-white flex items-center space-x-3 transition-colors"
                >
                  <SafeIcon icon={FiEdit} className="w-4 h-4" />
                  <span className="text-sm">Edit Profile</span>
                </button>
              </div>

              {/* Logout Section */}
              <div className="border-t border-gray-600 py-2">
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-2.5 text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center space-x-3 transition-colors group"
                >
                  <SafeIcon icon={FiLogOut} className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>

              {/* Status Indicator */}
              <div className="px-4 py-2 border-t border-gray-600 bg-gray-800">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-gray-400">Online</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default UserDropdown;