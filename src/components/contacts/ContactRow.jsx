import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useApp } from '../../context/AppContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiMail, FiPhone, FiMoreVertical, FiEdit3, FiTrash2 } = FiIcons;

function ContactRow({ contact, onClick, statusColors }) {
  const { dispatch } = useApp();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const latestNote = contact.notes && contact.notes.length > 0 ? contact.notes[contact.notes.length - 1] : null;

  const handleDeleteContact = () => {
    dispatch({ type: 'DELETE_CONTACT', contactId: contact.id });
    setShowDeleteConfirm(false);
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onClick(contact);
    setShowMenu(false);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
    setShowMenu(false);
  };

  return (
    <motion.div
      onClick={() => onClick(contact)}
      className="p-4 hover:bg-gray-700 cursor-pointer transition-colors group relative"
      whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.5)' }}
    >
      {/* Mobile Layout */}
      <div className="lg:hidden space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-lg">
            {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white group-hover:text-blue-400 transition-colors truncate">
              {contact.name}
            </p>
            <p className="text-sm text-gray-300 truncate">{contact.company}</p>
          </div>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${statusColors[contact.status]}`}>
            {contact.status}
          </span>
          <div className="relative">
            <button
              onClick={handleMenuClick}
              className="p-2 hover:bg-gray-600 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
              <SafeIcon icon={FiMoreVertical} className="w-4 h-4 text-gray-400" />
            </button>
            
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 top-full mt-1 bg-gray-700 rounded-xl shadow-lg border border-gray-600 py-2 z-10"
              >
                <button
                  onClick={handleEditClick}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-600 flex items-center space-x-2"
                >
                  <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-600 flex items-center space-x-2"
                >
                  <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 text-gray-400">
            <div className="flex items-center space-x-1">
              <SafeIcon icon={FiMail} className="w-4 h-4" />
              <span className="truncate max-w-[120px]">{contact.email}</span>
            </div>
            {contact.phone && (
              <div className="flex items-center space-x-1">
                <SafeIcon icon={FiPhone} className="w-4 h-4" />
              </div>
            )}
          </div>
          {latestNote && (
            <div className="text-right">
              <p className="text-xs text-gray-500">
                {format(new Date(latestNote.timestamp), 'MMM d')}
              </p>
            </div>
          )}
        </div>
        
        {latestNote && (
          <p className="text-sm text-gray-400 truncate">
            Latest: {latestNote.content}
          </p>
        )}
        
        {contact.notes && contact.notes.length > 0 && (
          <div className="text-xs text-gray-500">
            {contact.notes.length} note{contact.notes.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:grid grid-cols-12 gap-4 items-center">
        <div className="col-span-3 flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
            {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-white group-hover:text-blue-400 transition-colors truncate">
              {contact.name}
            </p>
          </div>
        </div>
        
        <div className="col-span-3 flex items-center">
          <p className="text-gray-300 truncate">{contact.company}</p>
        </div>
        
        <div className="col-span-2 flex items-center">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${statusColors[contact.status]}`}>
            {contact.status}
          </span>
        </div>
        
        <div className="col-span-2 flex items-center space-x-2 text-sm text-gray-400">
          <SafeIcon icon={FiMail} className="w-4 h-4" />
          <SafeIcon icon={FiPhone} className="w-4 h-4" />
        </div>
        
        <div className="col-span-1 flex items-center justify-end">
          <div className="relative">
            <button
              onClick={handleMenuClick}
              className="p-2 hover:bg-gray-600 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
              <SafeIcon icon={FiMoreVertical} className="w-4 h-4 text-gray-400" />
            </button>
            
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 top-full mt-1 bg-gray-700 rounded-xl shadow-lg border border-gray-600 py-2 z-10"
              >
                <button
                  onClick={handleEditClick}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-600 flex items-center space-x-2 whitespace-nowrap"
                >
                  <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-600 flex items-center space-x-2 whitespace-nowrap"
                >
                  <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
        
        <div className="col-span-1 flex items-center">
          {latestNote ? (
            <div className="text-sm min-w-0 flex-1">
              <p className="text-gray-300 truncate">{latestNote.content}</p>
              <p className="text-xs text-gray-500">
                {format(new Date(latestNote.timestamp), 'MMM d')} • {contact.notes?.length || 0} notes
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No notes</p>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-2">Delete Contact</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete <strong>{contact.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteContact}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Backdrop for menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowMenu(false)} 
        />
      )}
    </motion.div>
  );
}

export default ContactRow;