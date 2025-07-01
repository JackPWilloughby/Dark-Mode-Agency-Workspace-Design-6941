import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskColumn from './TaskColumn';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import { useApp } from '../../context/AppContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiPlus, FiSearch } = FiIcons;

const columns = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-600' },
  { id: 'doing', title: 'Doing', color: 'bg-blue-600' },
  { id: 'done', title: 'Done', color: 'bg-green-600' }
];

function TaskBoard() {
  const { state, dispatch } = useApp();
  const [activeTask, setActiveTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Configure sensors to require minimum distance for drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const filteredTasks = state.tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDragStart = (event) => {
    const task = state.tasks.find(t => t.id === event.active.id);
    setActiveTask(task);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;

    if (state.tasks.find(t => t.id === taskId)?.status !== newStatus) {
      dispatch({ type: 'MOVE_TASK', taskId, newStatus });
    }
  };

  const handleNewTask = () => {
    setSelectedTask(null);
    setShowTaskModal(true);
  };

  const handleTaskClick = (task) => {
    console.log('Task clicked:', task); // Debug log
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleCloseModal = () => {
    setShowTaskModal(false);
    setTimeout(() => setSelectedTask(null), 100);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !e.target.matches('input, textarea')) {
        e.preventDefault();
        handleNewTask();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-gray-700 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Task Board</h1>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">Manage your team's workflow</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 w-full sm:w-64"
            />
          </div>
          
          <motion.button
            onClick={handleNewTask}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>New Task</span>
          </motion.button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 p-4 sm:p-6 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 h-full">
            {columns.map((column) => {
              const columnTasks = filteredTasks.filter(task => task.status === column.id);
              
              return (
                <SortableContext
                  key={column.id}
                  id={column.id}
                  items={columnTasks.map(task => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <TaskColumn
                    column={column}
                    tasks={columnTasks}
                    onTaskClick={handleTaskClick}
                  />
                </SortableContext>
              );
            })}
          </div>
        </div>

        <DragOverlay>
          {activeTask && (
            <TaskCard
              task={activeTask}
              isDragging
              onClick={() => {}}
            />
          )}
        </DragOverlay>
      </DndContext>

      <AnimatePresence>
        {showTaskModal && (
          <TaskModal
            task={selectedTask}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default TaskBoard;