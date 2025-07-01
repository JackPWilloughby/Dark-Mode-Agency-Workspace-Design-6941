import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth.jsx';
import AddContactModal from './AddContactModal';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiX, FiMail, FiPhone, FiBuilding, FiSend, FiEdit3, FiTrash2 } = FiIcons;

function ContactPanel({ contact, onClose }) {
  const { state, dispatch } = useApp();
  const { profile } = useAuth();
  const [newNote, setNewNote] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currentUser = profile?.full_name || 'You';
  const currentContact = state.contacts.find(c => c.id === contact.id) || contact;

  const handleAddNote = () => {
    if (newNote.trim()) {
      dispatch({
        type: 'ADD_CONTACT_NOTE',
        contactId: contact.id,
        content: newNote.trim(),
        author: currentUser
      });
      setNewNote('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddNote();
    }
  };

  const handleEditContact = () => {
    setShowEditModal(true);
  };

  const handleDeleteContact = () => {
    dispatch({
      type: 'DELETE_CONTACT',
      contactId: contact.id
    });
    onClose();
  };

  return (
    <>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed right-0 top-0 h-full w-full lg:w-96 bg-gray-800 border-l border-gray-700 shadow-2xl z-40 flex flex-col"
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold text-white">Contact Details</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleEditContact}
              className="p-2 hover:bg-gray-700 rounded-xl transition-colors"
            >
              <SafeIcon icon={FiEdit3} className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 hover:bg-gray-700 rounded-xl transition-colors"
            >
              <SafeIcon icon={FiTrash2} className="w-5 h-5 text-red-400" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-xl transition-colors"
            >
              <SafeIcon icon={FiX} className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-2xl mx-auto mb-4">
              {currentContact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">{currentContact.name}</h3>
            <p className="text-gray-400">{currentContact.company}</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white mt-2 ${
              currentContact.status === 'Lead' ? 'bg-yellow-500' :
              currentContact.status === 'Prospect' ? 'bg-blue-500' :
              currentContact.status === 'Client' ? 'bg-green-500' : 'bg-gray-500'
            }`}>
              {currentContact.status}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-300">
              <SafeIcon icon={FiMail} className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{currentContact.email}</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-300">
              <SafeIcon icon={FiPhone} className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{currentContact.phone}</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-300">
              <SafeIcon icon={FiBuilding} className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{currentContact.company}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base sm:text-lg font-semibold text-white">Notes History</h4>
              <span className="text-xs text-gray-500">
                {currentContact.notes ? currentContact.notes.length : 0} notes
              </span>
            </div>

            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {currentContact.notes && currentContact.notes.length > 0 ? (
                [...currentContact.notes].reverse().map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-700 rounded-xl p-3 sm:p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{note.author}</span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(note.timestamp), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{note.content}</p>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No notes yet</p>
                  <p className="text-xs mt-1">Add your first note below</p>
                </div>
              )}
            </div>

            <div className="space-y-3 border-t border-gray-700 pt-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                rows={3}
                placeholder="Add a note about this contact..."
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Enter to send • Shift + Enter for new line</span>
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
                >
                  <SafeIcon icon={FiSend} className="w-4 h-4" />
                  <span>Add Note</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full border border-gray-700"
            >
              <h3 className="text-lg font-bold text-white mb-2">Delete Contact</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete {currentContact.name}? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
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
      </motion.div>

      {showEditModal && (
        <AddContactModal
          contact={currentContact}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}

export default ContactPanel;