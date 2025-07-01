import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useApp } from '../../context/AppContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiX, FiSend, FiMessageSquare, FiCalendar, FiUser } = FiIcons;

function TaskCommentsModal({ task, onClose }) {
  const { state, dispatch } = useApp();
  const [newComment, setNewComment] = useState('');

  // Get updated task from state to reflect real-time changes
  const currentTask = state.tasks.find(t => t.id === task.id) || task;

  const handleAddComment = () => {
    if (newComment.trim()) {
      dispatch({
        type: 'ADD_TASK_COMMENT',
        taskId: task.id,
        content: newComment.trim()
      });
      setNewComment('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleAddComment();
    }
  };

  const getStatusColor = () => {
    switch (currentTask.status) {
      case 'todo': return 'bg-gray-500';
      case 'doing': return 'bg-blue-500';
      case 'done': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] shadow-2xl border border-gray-700 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiMessageSquare} className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">Task Comments</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-xl transition-colors"
          >
            <SafeIcon icon={FiX} className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Task Info */}
        <div className="p-4 sm:p-6 border-b border-gray-700">
          <h3 className="font-semibold text-white mb-2 line-clamp-2">
            {currentTask.title}
          </h3>
          {currentTask.description && (
            <p className="text-sm text-gray-400 mb-3 line-clamp-3">
              {currentTask.description}
            </p>
          )}
          <div className="flex items-center space-x-4 text-sm">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor()}`}>
              {currentTask.status.charAt(0).toUpperCase() + currentTask.status.slice(1)}
            </span>
            {currentTask.assignee && (
              <div className="flex items-center space-x-1 text-gray-400">
                <SafeIcon icon={FiUser} className="w-4 h-4" />
                <span>{currentTask.assignee}</span>
              </div>
            )}
            {currentTask.dueDate && (
              <div className="flex items-center space-x-1 text-gray-400">
                <SafeIcon icon={FiCalendar} className="w-4 h-4" />
                <span>{format(new Date(currentTask.dueDate), 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base sm:text-lg font-semibold text-white">Comments</h4>
            <span className="text-xs text-gray-500">
              {currentTask.comments ? currentTask.comments.length : 0} comments
            </span>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {currentTask.comments && currentTask.comments.length > 0 ? (
              [...currentTask.comments].reverse().map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-700 rounded-xl p-3 sm:p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{comment.author}</span>
                    <span className="text-xs text-gray-400">
                      {format(new Date(comment.timestamp), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{comment.content}</p>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <SafeIcon icon={FiMessageSquare} className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No comments yet</p>
                <p className="text-xs mt-1">Start the conversation below</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Comment */}
        <div className="p-4 sm:p-6 border-t border-gray-700">
          <div className="space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
              rows={3}
              placeholder="Add a comment..."
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Cmd/Ctrl + Enter to send</span>
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
              >
                <SafeIcon icon={FiSend} className="w-4 h-4" />
                <span>Add Comment</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default TaskCommentsModal;