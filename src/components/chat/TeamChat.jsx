import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth.jsx';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiSend, FiSmile, FiPaperclip } = FiIcons;

function TeamChat() {
  const { state, dispatch } = useApp();
  const { profile } = useAuth();
  const [message, setMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const currentUser = profile?.full_name || 'You';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.chatMessages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        content: message.trim(),
        author: currentUser
      });
      setMessage('');
    }
  };

  const handleEditMessage = (messageId, content) => {
    setEditingMessageId(messageId);
    setEditingContent(content);
  };

  const handleSaveEdit = () => {
    if (editingContent.trim() && editingMessageId) {
      dispatch({
        type: 'EDIT_CHAT_MESSAGE',
        messageId: editingMessageId,
        content: editingContent.trim()
      });
      setEditingMessageId(null);
      setEditingContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent('');
  };

  const handleDeleteMessage = (messageId) => {
    dispatch({
      type: 'DELETE_CHAT_MESSAGE',
      messageId: messageId
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editingMessageId) {
        handleSaveEdit();
      } else {
        handleSendMessage();
      }
    }
    
    if (e.key === 'Escape') {
      handleCancelEdit();
    }
    
    if (e.key === 'ArrowUp' && !message && !editingMessageId) {
      const lastUserMessage = [...state.chatMessages]
        .reverse()
        .find(msg => msg.author === currentUser && !msg.deleted);
      if (lastUserMessage) {
        handleEditMessage(lastUserMessage.id, lastUserMessage.content);
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-gray-700 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Team Chat</h1>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">Real-time collaboration space</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {state.teamMembers.map((member) => (
            <div key={member.id} className="relative">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-gray-600"
              />
              <div className={`absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 rounded-full border-2 border-gray-800 ${
                member.status === 'online' ? 'bg-green-400' : 'bg-gray-500'
              }`}></div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <AnimatePresence>
          {state.chatMessages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isCurrentUser={msg.author === currentUser}
              isEditing={editingMessageId === msg.id}
              editingContent={editingContent}
              setEditingContent={setEditingContent}
              onEdit={handleEditMessage}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              onDelete={handleDeleteMessage}
            />
          ))}
        </AnimatePresence>

        {state.typingUsers.length > 0 && (
          <TypingIndicator users={state.typingUsers} />
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 sm:p-6 border-t border-gray-700">
        {editingMessageId && (
          <div className="mb-3 px-4 py-2 bg-blue-600/20 border border-blue-600/30 rounded-xl text-blue-400 text-sm">
            Editing message - Press Enter to save, Escape to cancel
          </div>
        )}

        <div className="flex items-end space-x-3 sm:space-x-4">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={editingMessageId ? editingContent : message}
              onChange={(e) => editingMessageId ? setEditingContent(e.target.value) : setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 pr-16 sm:pr-24 bg-gray-800 border border-gray-700 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none max-h-32"
              placeholder={editingMessageId ? "Edit your message..." : "Type a message..."}
              rows={1}
            />
            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
              <button className="p-1 sm:p-2 hover:bg-gray-700 rounded-xl transition-colors">
                <SafeIcon icon={FiPaperclip} className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              </button>
              <button className="p-1 sm:p-2 hover:bg-gray-700 rounded-xl transition-colors">
                <SafeIcon icon={FiSmile} className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              </button>
            </div>
          </div>

          <motion.button
            onClick={editingMessageId ? handleSaveEdit : handleSendMessage}
            disabled={editingMessageId ? !editingContent.trim() : !message.trim()}
            className="p-2 sm:p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-2xl transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SafeIcon icon={FiSend} className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
        </div>

        <div className="mt-2 text-xs text-gray-500 hidden sm:block">
          Press Enter to send • Shift + Enter for new line • ↑ to edit last message
        </div>
      </div>
    </div>
  );
}

export default TeamChat;