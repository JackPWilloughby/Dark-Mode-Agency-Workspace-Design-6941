import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import { format } from 'date-fns'

const { FiClock, FiUser, FiMessageCircle, FiEdit2, FiGripVertical } = FiIcons

const TaskCard = ({ task, isDragging, isSelected, onSelect, onEdit }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({ 
    id: task.id,
    data: {
      type: 'task',
      task
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date()

  const handleCardClick = (e) => {
    // Prevent click when dragging or clicking drag handle/edit button
    if (e.target.closest('.drag-handle') || e.target.closest('.edit-button')) {
      return
    }
    e.stopPropagation()
    console.log('Task card clicked:', task.id)
    if (onSelect) {
      onSelect(task.id)
    }
  }

  const handleEditClick = (e) => {
    e.stopPropagation()
    e.preventDefault()
    console.log('Task edit clicked:', task.id)
    if (onEdit) {
      onEdit(task)
    }
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      whileHover={{ scale: 1.02 }}
      className={`
        group bg-dark-bg border rounded-lg transition-all duration-200 hover:shadow-lg hover:border-accent-blue/50 min-h-[180px] flex flex-col cursor-pointer
        ${isSelected ? 'ring-2 ring-accent-blue border-accent-blue' : 'border-dark-border'}
        ${isDragging || isSortableDragging ? 'opacity-95 shadow-xl z-50' : ''}
        ${isOverdue ? 'border-l-4 border-l-accent-red' : ''}
      `}
    >
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners}
        className="drag-handle flex items-center justify-between p-3 pb-2 cursor-grab active:cursor-grabbing"
      >
        <SafeIcon icon={FiGripVertical} className="w-4 h-4 text-dark-text-muted opacity-50" />
        <button
          onClick={handleEditClick}
          className="edit-button opacity-0 group-hover:opacity-100 p-1 hover:bg-dark-surface rounded transition-all"
        >
          <SafeIcon icon={FiEdit2} className="w-3 h-3 text-dark-text-muted" />
        </button>
      </div>

      {/* Card Content - Clickable Area */}
      <div 
        className="px-3 pb-3 flex-1 flex flex-col" 
        onClick={handleCardClick}
      >
        {/* Task Title & Description */}
        <div className="flex-1 mb-3">
          <h3 className="font-medium text-dark-text-primary text-sm mb-2 line-clamp-2 leading-tight">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-xs text-dark-text-secondary line-clamp-3 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>

        {/* Task Meta */}
        <div className="space-y-2 mt-auto">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              {task.assignee_id && (
                <div className="flex items-center space-x-1 text-dark-text-muted">
                  <SafeIcon icon={FiUser} className="w-3 h-3" />
                  <span className="hidden sm:inline">Assigned</span>
                </div>
              )}
              {task.due_date && (
                <div className={`flex items-center space-x-1 ${
                  isOverdue ? 'text-accent-red' : 'text-dark-text-muted'
                }`}>
                  <SafeIcon icon={FiClock} className="w-3 h-3" />
                  <span>{format(new Date(task.due_date), 'MMM d')}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1 text-dark-text-muted">
              <SafeIcon icon={FiMessageCircle} className="w-3 h-3" />
              <span>0</span>
            </div>
          </div>

          {/* Assignee Avatar & Status */}
          <div className="flex items-center justify-between">
            <div className="flex -space-x-1">
              <div className="w-6 h-6 bg-accent-blue rounded-full flex items-center justify-center text-xs text-white border-2 border-dark-bg">
                {task.assignee_name?.[0] || 'U'}
              </div>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              task.status === 'todo' 
                ? 'bg-dark-text-muted/20 text-dark-text-muted' 
                : task.status === 'doing' 
                ? 'bg-accent-blue/20 text-accent-blue' 
                : 'bg-accent-green/20 text-accent-green'
            }`}>
              {task.status === 'todo' ? 'To-Do' : task.status === 'doing' ? 'In Progress' : 'Done'}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default TaskCard