import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TeamMemberCard from './TeamMemberCard';
import AddMemberModal from './AddMemberModal';
import { useApp } from '../../context/AppContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiPlus, FiUsers, FiUserCheck } = FiIcons;

function TeamPage() {
  const { state } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  const onlineMembers = state.teamMembers.filter(member => member.status === 'online');
  const totalMembers = state.teamMembers.length;

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 sm:p-6 border-b border-gray-700 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Team</h1>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">Manage your team members</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-4 sm:space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiUsers} className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">{totalMembers} Total</span>
            </div>
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiUserCheck} className="w-4 h-4 text-green-400" />
              <span className="text-gray-300">{onlineMembers.length} Online</span>
            </div>
          </div>
          
          <motion.button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Member</span>
          </motion.button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {state.teamMembers.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
        
        {state.teamMembers.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 text-center">
            <SafeIcon icon={FiUsers} className="w-12 h-12 sm:w-16 sm:h-16 mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">No team members yet</h3>
            <p className="text-sm sm:text-base mb-4 px-4">Add your first team member to get started</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              Add First Member
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <AddMemberModal onClose={() => setShowAddModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default TeamPage;