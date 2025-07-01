import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import EditMemberModal from './EditMemberModal';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiMail, FiMoreVertical, FiEdit3, FiTrash2, FiCheck } = FiIcons;

function TeamMemberCard({ member }) {
  const { dispatch } = useApp();
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleRemoveMember = () => {
    dispatch({ type: 'REMOVE_TEAM_MEMBER', memberId: member.id });
    setShowConfirmDelete(false);
  };

  const handleEditMember = () => {
    setShowEditModal(true);
    setShowMenu(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-2xl p-4 sm:p-6 hover:bg-gray-750 transition-all duration-200 group relative"
        whileHover={{ y: -2 }}
      >
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-700 rounded-xl transition-all"
          >
            <SafeIcon icon={FiMoreVertical} className="w-4 h-4 text-gray-400" />
          </button>
          
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute top-10 right-0 bg-gray-700 rounded-xl shadow-lg border border-gray-600 py-2 z-10"
              >
                <button 
                  onClick={handleEditMember}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-600 flex items-center space-x-2"
                >
                  <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    setShowConfirmDelete(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-600 flex items-center space-x-2"
                >
                  <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  <span>Remove</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center">
          <div className="relative inline-block mb-4">
            <img
              src={member.avatar}
              alt={member.name}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto"
            />
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-gray-800 ${
              member.status === 'online' ? 'bg-green-400' : 'bg-gray-500'
            }`}></div>
          </div>
          
          <h3 className="text-base sm:text-lg font-semibold text-white mb-1">{member.name}</h3>
          <p className="text-gray-400 text-sm mb-3">{member.role}</p>
          
          <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs sm:text-sm mb-3">
            <SafeIcon icon={FiMail} className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{member.email}</span>
          </div>
          
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            member.status === 'online' 
              ? 'bg-green-400/20 text-green-400' 
              : 'bg-gray-500/20 text-gray-500'
          }`}>
            {member.status === 'online' ? 'Online' : 'Offline'}
          </div>
        </div>

        <AnimatePresence>
          {showConfirmDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/90 rounded-2xl flex items-center justify-center p-4"
            >
              <div className="text-center">
                <p className="text-white mb-4 text-sm sm:text-base">Remove {member.name}?</p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowConfirmDelete(false)}
                    className="px-3 sm:px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-xl text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRemoveMember}
                    className="px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showEditModal && (
          <EditMemberModal
            member={member}
            onClose={() => setShowEditModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default TeamMemberCard;