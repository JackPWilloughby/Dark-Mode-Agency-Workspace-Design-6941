import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiEdit3, FiCheck, FiX } = FiIcons;

function ChatMessage({ 
  message, 
  isCurrentUser, 
  isEditing, 
  editingContent, 
  setEditingContent, 
  onEdit, 
  onSaveEdit, 
  onCancelEdit 
}) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSaveEdit();
    }
    if (e.key === 'Escape') {
      onCancelEdit();
    }
  };

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
        
        <div className={`relative px-4 py-3 rounded-2xl ${
          isCurrentUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-700 text-gray-100'
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
          
          {isCurrentUser && !isEditing && (
            <button
              onClick={() => onEdit(message.id, message.content)}
              className="absolute -left-8 top-1/2 transform -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-600 rounded transition-all"
            >
              <SafeIcon icon={FiEdit3} className="w-4 h-4 text-gray-400" />
            </button>
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
    </motion.div>
  );
}

export default ChatMessage;