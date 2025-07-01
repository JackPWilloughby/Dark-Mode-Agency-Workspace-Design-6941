import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiSearch, FiGrid, FiUsers, FiMessageSquare, FiUser } = FiIcons;

function SearchModal({ onClose }) {
  const { state } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchResults = [];
    const lowercaseQuery = query.toLowerCase();

    // Search tasks
    state.tasks.forEach(task => {
      if (task.title.toLowerCase().includes(lowercaseQuery) ||
          task.description.toLowerCase().includes(lowercaseQuery)) {
        searchResults.push({
          type: 'task',
          id: task.id,
          title: task.title,
          subtitle: task.description,
          icon: FiGrid,
          action: () => navigate('/tasks')
        });
      }
    });

    // Search contacts
    state.contacts.forEach(contact => {
      if (contact.name.toLowerCase().includes(lowercaseQuery) ||
          contact.company.toLowerCase().includes(lowercaseQuery) ||
          contact.email.toLowerCase().includes(lowercaseQuery)) {
        searchResults.push({
          type: 'contact',
          id: contact.id,
          title: contact.name,
          subtitle: contact.company,
          icon: FiUsers,
          action: () => navigate('/contacts')
        });
      }
    });

    // Search team members
    state.teamMembers.forEach(member => {
      if (member.name.toLowerCase().includes(lowercaseQuery) ||
          member.role.toLowerCase().includes(lowercaseQuery) ||
          member.email.toLowerCase().includes(lowercaseQuery)) {
        searchResults.push({
          type: 'team',
          id: member.id,
          title: member.name,
          subtitle: member.role,
          icon: FiUser,
          action: () => navigate('/team')
        });
      }
    });

    // Search chat messages
    state.chatMessages.forEach(message => {
      if (message.content.toLowerCase().includes(lowercaseQuery)) {
        searchResults.push({
          type: 'message',
          id: message.id,
          title: `Message from ${message.author}`,
          subtitle: message.content.substring(0, 60) + '...',
          icon: FiMessageSquare,
          action: () => navigate('/chat')
        });
      }
    });

    setResults(searchResults.slice(0, 10));
  }, [query, state, navigate]);

  const handleResultClick = (result) => {
    result.action();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-32 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <SafeIcon icon={FiSearch} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-lg"
              placeholder="Search tasks, contacts, team members..."
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <div className="p-2">
              {results.map((result) => (
                <motion.button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full flex items-center space-x-4 p-4 hover:bg-gray-700 rounded-xl transition-colors text-left"
                  whileHover={{ x: 4 }}
                >
                  <div className="p-2 bg-gray-600 rounded-lg">
                    <SafeIcon icon={result.icon} className="w-5 h-5 text-gray-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{result.title}</p>
                    <p className="text-sm text-gray-400 truncate">{result.subtitle}</p>
                  </div>
                  <div className="text-xs text-gray-500 capitalize">{result.type}</div>
                </motion.button>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="p-8 text-center text-gray-500">
              <SafeIcon icon={FiSearch} className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <SafeIcon icon={FiSearch} className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Start typing to search...</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Press Escape to close</span>
            <span>Cmd/Ctrl + K to search</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default SearchModal;