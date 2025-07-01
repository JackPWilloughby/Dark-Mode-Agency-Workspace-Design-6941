import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import TaskCard from './TaskCard';

function TaskColumn({ column, tasks, onTaskClick }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-800 rounded-2xl p-4 h-full transition-all duration-200 ${
        isOver ? 'ring-2 ring-blue-500 bg-gray-750' : ''
      }`}
    >
      <div className="flex items-center space-x-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
        <h3 className="font-semibold text-white">{column.title}</h3>
        <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-lg text-xs font-medium">
          {tasks.length}
        </span>
      </div>

      <div className="space-y-3 max-h-full overflow-y-auto">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
          />
        ))}
        
        {tasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-500"
          >
            <p className="text-sm">No tasks yet</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default TaskColumn;