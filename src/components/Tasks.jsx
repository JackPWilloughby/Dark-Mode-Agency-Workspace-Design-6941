import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiPlus, FiEdit, FiTrash2, FiUser, FiCalendar } from 'react-icons/fi'
import useStore from '../store/useStore'

const TaskModal = ({ task, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    assignee: task?.assignee || '',
    dueDate: task?.dueDate || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg w-full max-w-md p-6"
      >
        <h2 className="text-xl font-semibold mb-4">
          {task ? 'Edit Task' : 'New Task'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded-lg"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Assignee</label>
            <input
              type="text"
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

const Tasks = () => {
  const { tasks, addTask, updateTask, deleteTask } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  const statusColumns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-100' },
    { id: 'done', title: 'Done', color: 'bg-green-100' }
  ]

  const handleSaveTask = (taskData) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData)
    } else {
      addTask(taskData)
    }
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingTask(null)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FiPlus className="mr-2" />
          New Task
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {statusColumns.map((column) => (
          <div key={column.id} className={`${column.color} rounded-lg p-4`}>
            <h2 className="font-semibold text-gray-900 mb-4">
              {column.title} ({tasks.filter(task => task.status === column.id).length})
            </h2>
            
            <div className="space-y-3">
              {tasks
                .filter(task => task.status === column.id)
                .map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditTask(task)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <FiEdit size={14} />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      
                      <div className="flex items-center space-x-2 text-gray-500">
                        {task.assignee && (
                          <div className="flex items-center">
                            <FiUser size={12} className="mr-1" />
                            {task.assignee}
                          </div>
                        )}
                        {task.dueDate && (
                          <div className="flex items-center">
                            <FiCalendar size={12} className="mr-1" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <TaskModal
          task={editingTask}
          onClose={handleCloseModal}
          onSave={handleSaveTask}
        />
      )}
    </div>
  )
}

export default Tasks