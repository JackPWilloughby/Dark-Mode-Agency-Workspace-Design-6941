import React from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiCalendar, FiUser, FiMessageSquare, FiClock } = FiIcons;

function TaskCard({ task, onClick, isDragging = false }) {
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
  const dueDate = new Date(task.dueDate);
  const isOverdue = isBefore(dueDate, today);
  const isDueToday = format(dueDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

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

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-gray-750 hover:bg-gray-700 border-l-4 ${getStatusColor()} rounded-2xl p-4 cursor-pointer transition-all duration-200 group ${
        isDragging || isSortableDragging ? 'opacity-50 shadow-2xl scale-105' : 'hover:shadow-lg backdrop-blur-sm'
      }`}
      whileHover={{ y: -2 }}
      layout
    >
      <div className="space-y-3">
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
              <div className="flex items-center space-x-1 text-xs text-gray-400">
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