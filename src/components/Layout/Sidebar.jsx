import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import useStore from '../../store/useStore'
import ProfileMenu from './ProfileMenu'

const { FiColumns, FiUsers, FiMessageSquare, FiSearch, FiChevronLeft, FiChevronRight } = FiIcons

const Sidebar = ({ currentView, onViewChange, user, onSignOut, onUpdateProfile }) => {
  const { sidebarCollapsed, setSidebarCollapsed, searchQuery, setSearchQuery } = useStore()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const navItems = [
    { id: 'kanban', label: 'Tasks', icon: FiColumns },
    { id: 'crm', label: 'CRM', icon: FiUsers },
    { id: 'chat', label: 'Chat', icon: FiMessageSquare }
  ]

  return (
    <motion.div
      animate={{ width: sidebarCollapsed ? '64px' : '280px' }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="bg-dark-surface border-r border-dark-border flex flex-col h-full relative z-10"
    >
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-dark-border">
        <div className="flex items-center justify-between">
          {!sidebarCollapsed && (
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-lg font-bold text-dark-text-primary"
            >
              PulseHQ
            </motion.h1>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-dark-bg rounded-lg transition-colors"
          >
            <SafeIcon 
              icon={sidebarCollapsed ? FiChevronRight : FiChevronLeft} 
              className="text-dark-text-secondary w-4 h-4" 
            />
          </button>
        </div>
      </div>

      {/* Search */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 p-4 overflow-hidden"
          >
            <div className="relative">
              <SafeIcon 
                icon={FiSearch} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-muted w-4 h-4" 
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search everywhere..."
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-dark-bg border border-dark-border rounded-lg text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center justify-center ${
                sidebarCollapsed ? 'px-2 py-4' : 'px-4 py-3'
              } rounded-lg transition-all duration-200 text-sm font-medium relative group`}
              title={sidebarCollapsed ? item.label : undefined}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Background highlight */}
              {currentView === item.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-accent-blue/10 rounded-lg border border-accent-blue/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}

              {/* Icon */}
              <SafeIcon
                icon={item.icon}
                className={`${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-colors duration-200 ${
                  currentView === item.id 
                    ? 'text-accent-blue' 
                    : 'text-dark-text-secondary group-hover:text-accent-blue'
                }`}
              />

              {/* Label */}
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className={`ml-3 transition-colors duration-200 ${
                      currentView === item.id 
                        ? 'text-accent-blue' 
                        : 'text-dark-text-secondary group-hover:text-accent-blue'
                    }`}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Tooltip for collapsed state */}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-dark-bg border border-dark-border rounded text-xs text-dark-text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </nav>

      {/* Profile Section */}
      <div className="flex-shrink-0 p-4 border-t border-dark-border relative">
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className={`w-full flex items-center ${
            sidebarCollapsed ? 'justify-center px-2 py-4' : 'px-3 py-3'
          } text-dark-text-secondary hover:bg-dark-bg hover:text-dark-text-primary rounded-lg transition-colors`}
          title={sidebarCollapsed ? user?.name || 'Profile' : undefined}
        >
          <div className={`${sidebarCollapsed ? 'w-8 h-8' : 'w-6 h-6'} bg-accent-blue rounded-full flex items-center justify-center text-white text-sm font-medium`}>
            {user?.name?.[0] || 'U'}
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="ml-3 flex-1 text-left"
              >
                <div className="text-sm font-medium text-dark-text-primary truncate">
                  {user?.name || 'User'}
                </div>
                <div className="text-xs text-dark-text-muted truncate">
                  {user?.email}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        <AnimatePresence>
          {showProfileMenu && (
            <ProfileMenu
              user={user}
              onClose={() => setShowProfileMenu(false)}
              onSignOut={onSignOut}
              onUpdateProfile={onUpdateProfile}
              collapsed={sidebarCollapsed}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default Sidebar