import React from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiCalendar, FiUser, FiMessageSquare, FiClock, FiEdit3, FiTrash2 } = FiIcons;

function TaskCard({ task, onClick, onEdit, onDelete, isDragging = false }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const today = startOfDay(new Date());
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && isBefore(dueDate, today);
  const isDueToday = dueDate && format(dueDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

  const getDueDateColor = () => {
    if (isOverdue) return 'text-red-400 bg-red-400/10';
    if (isDueToday) return 'text-yellow-400 bg-yellow-400/10';
    return 'text-gray-400 bg-gray-400/10';
  };

  const getStatusColor = () => {
    switch (task.status) {
      case 'todo': return 'border-l-gray-500';
      case 'doing': return 'border-l-blue-500';
      case 'done': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  // Handle click for comments
  const handleCommentsClick = (e) => {
    if (!isDragging && !isSortableDragging) {
      e.stopPropagation();
      onClick(task);
    }
  };

  // Handle edit click
  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit(task);
  };

  // Handle delete click
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(task);
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-gray-750 hover:bg-gray-700 border-l-4 ${getStatusColor()} rounded-2xl p-4 cursor-pointer transition-all duration-200 group relative ${
        isDragging || isSortableDragging 
          ? 'opacity-50 shadow-2xl scale-105' 
          : 'hover:shadow-lg backdrop-blur-sm'
      }`}
      whileHover={{ y: -2 }}
      layout
    >
      {/* Action buttons */}
      <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={handleEditClick}
          className="p-1.5 hover:bg-gray-600 rounded-lg transition-all"
        >
          <SafeIcon icon={FiEdit3} className="w-3.5 h-3.5 text-gray-400 hover:text-blue-400" />
        </button>
        {onDelete && (
          <button
            onClick={handleDeleteClick}
            className="p-1.5 hover:bg-gray-600 rounded-lg transition-all"
          >
            <SafeIcon icon={FiTrash2} className="w-3.5 h-3.5 text-gray-400 hover:text-red-400" />
          </button>
        )}
      </div>

      {/* Clickable area for comments */}
      <div onClick={handleCommentsClick} className="space-y-3 cursor-pointer pr-16">
        <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-2">
          {task.title}
        </h4>

        {task.description && (
          <p className="text-sm text-gray-400 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {task.assignee && (
              <div className="flex items-center space-x-1 text-xs text-gray-400">
                <SafeIcon icon={FiUser} className="w-3 h-3" />
                <span>{task.assignee}</span>
              </div>
            )}
            {task.comments && task.comments.length > 0 && (
              <div className="flex items-center space-x-1 text-xs text-gray-400 hover:text-blue-400 transition-colors">
                <SafeIcon icon={FiMessageSquare} className="w-3 h-3" />
                <span>{task.comments.length}</span>
              </div>
            )}
          </div>

          {task.dueDate && (
            <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-lg ${getDueDateColor()}`}>
              <SafeIcon icon={isOverdue ? FiClock : FiCalendar} className="w-3 h-3" />
              <span>{format(new Date(task.dueDate), 'MMM d')}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default TaskCard;