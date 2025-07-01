import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiEdit3, FiCheck, FiX, FiTrash2, FiMoreVertical } = FiIcons;

function ChatMessage({ 
  message, 
  isCurrentUser, 
  isEditing, 
  editingContent, 
  setEditingContent, 
  onEdit, 
  onSaveEdit, 
  onCancelEdit,
  onDelete 
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSaveEdit();
    }
    if (e.key === 'Escape') {
      onCancelEdit();
    }
  };

  const handleDeleteMessage = () => {
    onDelete(message.id);
    setShowDeleteConfirm(false);
    setShowMenu(false);
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  // If message is deleted, show placeholder
  if (message.deleted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} group`}
      >
        <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-2' : 'order-1'}`}>
          {!isCurrentUser && (
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-medium text-gray-300">{message.author}</span>
              <span className="text-xs text-gray-500">
                {format(new Date(message.timestamp), 'h:mm a')}
              </span>
            </div>
          )}
          
          <div className={`px-4 py-3 rounded-2xl ${
            isCurrentUser ? 'bg-gray-700' : 'bg-gray-700'
          } border border-gray-600`}>
            <div className="flex items-center space-x-2 text-gray-400">
              <SafeIcon icon={FiTrash2} className="w-4 h-4" />
              <span className="text-sm italic">This message was deleted</span>
            </div>
          </div>

          {isCurrentUser && (
            <div className="flex items-center justify-end space-x-2 mt-1">
              <span className="text-xs text-gray-500">
                {format(new Date(message.timestamp), 'h:mm a')}
              </span>
              <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                <SafeIcon icon={FiCheck} className="w-2 h-2 text-white" />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} group relative`}
    >
      <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-2' : 'order-1'}`}>
        {!isCurrentUser && (
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-gray-300">{message.author}</span>
            <span className="text-xs text-gray-500">
              {format(new Date(message.timestamp), 'h:mm a')}
            </span>
          </div>
        )}

        <div className={`relative px-4 py-3 rounded-2xl ${
          isCurrentUser ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100'
        } ${isEditing ? 'ring-2 ring-blue-500' : ''}`}>
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full bg-transparent border-none outline-none resize-none text-white placeholder-gray-300"
                autoFocus
              />
              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={onCancelEdit}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-4 h-4" />
                </button>
                <button
                  onClick={onSaveEdit}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <SafeIcon icon={FiCheck} className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="leading-relaxed">{message.content}</p>
              {message.edited && (
                <span className="text-xs opacity-70 ml-2">(edited)</span>
              )}
            </>
          )}

          {/* Menu button for current user messages */}
          {isCurrentUser && !isEditing && (
            <div className="relative">
              <button
                onClick={handleMenuClick}
                className="absolute -left-8 top-1/2 transform -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-600 rounded transition-all"
              >
                <SafeIcon icon={FiMoreVertical} className="w-4 h-4 text-gray-400" />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowMenu(false)} 
                  />
                  
                  {/* Menu */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -left-32 top-0 bg-gray-700 rounded-xl shadow-lg border border-gray-600 py-2 z-20 min-w-32"
                  >
                    <button
                      onClick={() => {
                        onEdit(message.id, message.content);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-600 flex items-center space-x-2 transition-colors"
                    >
                      <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                      <span className="text-sm">Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-600 flex items-center space-x-2 transition-colors"
                    >
                      <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                      <span className="text-sm">Delete</span>
                    </button>
                  </motion.div>
                </>
              )}
            </div>
          )}
        </div>

        {isCurrentUser && (
          <div className="flex items-center justify-end space-x-2 mt-1">
            <span className="text-xs text-gray-500">
              {format(new Date(message.timestamp), 'h:mm a')}
            </span>
            <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
              <SafeIcon icon={FiCheck} className="w-2 h-2 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full border border-gray-700"
          >
            <h3 className="text-lg font-bold text-white mb-2">Delete Message</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this message? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMessage}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default ChatMessage;