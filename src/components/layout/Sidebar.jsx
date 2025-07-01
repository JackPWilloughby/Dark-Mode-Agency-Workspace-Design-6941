import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import UserDropdown from './UserDropdown';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiGrid, FiUsers, FiMessageSquare, FiUser, FiChevronLeft, FiChevronRight } = FiIcons;

const menuItems = [
  { id: 'tasks', label: 'Tasks', icon: FiGrid, path: '/tasks' },
  { id: 'contacts', label: 'Contacts', icon: FiUsers, path: '/contacts' },
  { id: 'chat', label: 'Chat', icon: FiMessageSquare, path: '/chat' },
  { id: 'team', label: 'Team', icon: FiUser, path: '/team' }
];

function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.div
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed left-0 top-0 h-full bg-gray-800 border-r border-gray-700 z-20 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-white">PulseHQ</span>
          </motion.div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <SafeIcon
            icon={collapsed ? FiChevronRight : FiChevronLeft}
            className="w-5 h-5 text-gray-400"
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (location.pathname === '/' && item.path === '/tasks');

          return (
            <motion.button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SafeIcon icon={item.icon} className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-medium text-sm sm:text-base"
                >
                  {item.label}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* User Dropdown - Always visible */}
      <div className="p-4 border-t border-gray-700">
        {!collapsed ? (
          <UserDropdown />
        ) : (
          <motion.div
            className="flex justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <UserDropdown />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default Sidebar;