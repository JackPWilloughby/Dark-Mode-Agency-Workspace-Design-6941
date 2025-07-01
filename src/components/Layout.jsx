import React from 'react'
import { motion } from 'framer-motion'
import { FiCheck, FiUsers, FiMessageCircle, FiUserCheck, FiLogOut, FiMenu, FiX } from 'react-icons/fi'
import useStore from '../store/useStore'
import { supabase } from '../lib/supabase'

const Layout = ({ children }) => {
  const { currentView, setCurrentView, sidebarOpen, setSidebarOpen, setUser } = useStore()

  const navigation = [
    { id: 'tasks', label: 'Tasks', icon: FiCheck },
    { id: 'crm', label: 'CRM', icon: FiUsers },
    { id: 'chat', label: 'Chat', icon: FiMessageCircle },
    { id: 'team', label: 'Team', icon: FiUserCheck }
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {sidebarOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        className="fixed lg:relative bg-white w-70 h-full shadow-lg z-40 lg:z-auto"
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">PulseHQ</h1>
          
          <nav className="space-y-2">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="mr-3" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiLogOut className="mr-3" />
            Sign Out
          </button>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden lg:ml-0">
        {children}
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default Layout