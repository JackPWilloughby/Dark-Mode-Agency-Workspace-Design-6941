import React, { useState } from 'react'
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import useStore from '../../store/useStore'
import KanbanColumn from './KanbanColumn'
import TaskCard from './TaskCard'
import TaskModal from './TaskModal'
import { useHotkeys } from 'react-hotkeys-hook'

const { FiPlus } = FiIcons

const COLUMNS = [
  { id: 'todo', title: 'To-Do', color: 'bg-dark-text-muted' },
  { id: 'doing', title: 'Doing', color: 'bg-accent-blue' },
  { id: 'done', title: 'Done', color: 'bg-accent-green' }
]

const KanbanBoard = () => {
  const { tasks, addTask, updateTask, selectedTask, setSelectedTask, setInspectorOpen } = useStore()
  const [activeTask, setActiveTask] = useState(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  // Configure sensors for better drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required before drag starts
      },
    })
  )

  // Keyboard shortcuts
  useHotkeys('n', () => setShowTaskModal(true))

  const handleDragStart = (event) => {
    const { active } = event
    console.log('Drag started:', active.id)
    const task = tasks.find(t => t.id === active.id)
    if (task) {
      setActiveTask(task)
    }
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    console.log('Drag ended:', { active: active?.id, over: over?.id })
    
    setActiveTask(null)
    
    if (!over) {
      console.log('No drop target')
      return
    }

    const taskId = active.id
    const newStatus = over.id
    const currentTask = tasks.find(t => t.id === taskId)
    
    console.log('Updating task:', { taskId, currentStatus: currentTask?.status, newStatus })
    
    if (currentTask && currentTask.status !== newStatus) {
      // Validate that the new status is valid
      if (['todo', 'doing', 'done'].includes(newStatus)) {
        console.log('Updating task status from', currentTask.status, 'to', newStatus)
        updateTask(taskId, { status: newStatus })
      } else {
        console.warn('Invalid status:', newStatus)
      }
    } else {
      console.log('No update needed - same status or task not found')
    }
  }

  const handleTaskSelect = (taskId) => {
    console.log('Selecting task:', taskId)
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      setSelectedTask(task)
      setInspectorOpen(true)
    }
  }

  const handleTaskEdit = (task) => {
    console.log('Editing task:', task.id)
    setEditingTask(task)
    setShowTaskModal(true)
  }

  const handleCloseModal = () => {
    setShowTaskModal(false)
    setEditingTask(null)
  }

  const handleSaveTask = (taskData) => {
    console.log('Saving task:', taskData)
    if (editingTask) {
      updateTask(editingTask.id, taskData)
    } else {
      addTask({
        id: Date.now().toString(),
        ...taskData,
        status: 'todo',
        created_at: new Date().toISOString()
      })
    }
    handleCloseModal()
  }

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status)
  }

  console.log('Current tasks:', tasks)
  console.log('Tasks by status:', {
    todo: getTasksByStatus('todo').length,
    doing: getTasksByStatus('doing').length,
    done: getTasksByStatus('done').length
  })

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-3 sm:p-6 border-b border-dark-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-dark-text-primary">Tasks</h1>
          <button
            onClick={() => setShowTaskModal(true)}
            className="flex items-center justify-center px-3 sm:px-4 py-2 bg-accent-blue hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <SafeIcon icon={FiPlus} className="mr-1 sm:mr-2 w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden p-3 sm:p-6">
        <DndContext 
          sensors={sensors}
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd} 
          collisionDetection={closestCorners}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 h-full">
            {COLUMNS.map(column => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={getTasksByStatus(column.id)}
                onTaskSelect={handleTaskSelect}
                onTaskEdit={handleTaskEdit}
                selectedTaskId={selectedTask?.id}
              />
            ))}
          </div>
          
          <DragOverlay>
            {activeTask && (
              <div className="opacity-95 transform rotate-2">
                <TaskCard task={activeTask} isDragging />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {showTaskModal && (
        <TaskModal
          task={editingTask}
          onClose={handleCloseModal}
          onSave={handleSaveTask}
        />
      )}
    </div>
  )
}

export default KanbanBoard