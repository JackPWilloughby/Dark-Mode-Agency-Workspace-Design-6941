import React, { useState } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import useStore from '../../store/useStore'

const { FiX, FiCalendar, FiUser, FiTrash2 } = FiIcons

const TaskModal = ({ onClose, onSave, task }) => {
  const { deleteTask, users } = useStore()
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    due_date: task?.due_date || '',
    assignee_id: task?.assignee_id || '',
    priority: task?.priority || 'medium'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Find assigned user details
    const assignedUser = users.find(u => u.id === formData.assignee_id)
    const taskData = {
      ...formData,
      assignee_name: assignedUser?.name || null
    }
    
    console.log('💾 Saving task:', taskData)
    onSave(taskData)
  }

  const handleDelete = () => {
    if (task && window.confirm('Are you sure you want to delete this task?')) {
      console.log('🗑️ Deleting task:', task.id)
      deleteTask(task.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-dark-surface rounded-default border border-dark-border w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <h2 className="text-lg font-semibold text-dark-text-primary">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <div className="flex items-center space-x-2">
            {task && (
              <button
                onClick={handleDelete}
                className="p-2 text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiTrash2} className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-dark-bg rounded-lg transition-colors"
            >
              <SafeIcon icon={FiX} className="text-dark-text-secondary" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-text-primary mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
              placeholder="Enter task title..."
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text-primary mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
              placeholder="Add a description..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-text-primary mb-2">
                Due Date
              </label>
              <div className="relative">
                <SafeIcon icon={FiCalendar} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-muted" />
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-text-primary mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text-primary mb-2">
              Assign To
            </label>
            <div className="relative">
              <SafeIcon icon={FiUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-muted" />
              <select
                value={formData.assignee_id}
                onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                className="w-full pl-10 pr-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
              >
                <option value="">Unassigned</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-dark-text-secondary hover:text-dark-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent-blue hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default TaskModal