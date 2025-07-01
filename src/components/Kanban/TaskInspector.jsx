import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import useStore from '../../store/useStore'
import { format } from 'date-fns'
import TaskModal from './TaskModal'

const { FiSend, FiEdit2, FiCalendar, FiUser, FiX, FiSave, FiSettings } = FiIcons

const TaskInspector = ({ task }) => {
  const { updateTask, notes, addNote, updateNote } = useStore()
  const [isEditing, setIsEditing] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || '',
    due_date: task.due_date || '',
    status: task.status
  })
  const [newNote, setNewNote] = useState('')
  const [editingNote, setEditingNote] = useState(null)
  const [editingText, setEditingText] = useState('')
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const taskNotes = notes
    .filter(note => note.task_id === task.id)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [taskNotes])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px'
    }
  }, [newNote])

  const handleSaveTask = () => {
    updateTask(task.id, editData)
    setIsEditing(false)
  }

  const handleAddNote = (e) => {
    e.preventDefault()
    if (!newNote.trim()) return

    addNote({
      id: Date.now().toString(),
      task_id: task.id,
      author_id: 'current-user',
      body: newNote,
      created_at: new Date().toISOString()
    })
    setNewNote('')
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleEditNote = (note) => {
    setEditingNote(note.id)
    setEditingText(note.body)
  }

  const handleSaveEdit = () => {
    if (editingText.trim()) {
      updateNote(editingNote, { body: editingText.trim() })
    }
    setEditingNote(null)
    setEditingText('')
  }

  const handleCancelEdit = () => {
    setEditingNote(null)
    setEditingText('')
  }

  const formatNoteBody = (body) => {
    return body
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-dark-bg px-1 rounded">$1</code>')
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-accent-blue hover:underline">$1</a>')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Task Header - Fixed */}
      <div className="flex-shrink-0 p-4 border-b border-dark-border bg-dark-surface">
        <div className="space-y-4">
          {/* Task Title & Actions */}
          <div className="flex items-start justify-between">
            <div className="flex-1 mr-4">
              {isEditing ? (
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full text-base font-medium bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                />
              ) : (
                <h3 className="text-base font-medium text-dark-text-primary">{task.title}</h3>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                task.status === 'todo' ? 'bg-dark-text-muted/20 text-dark-text-muted' :
                task.status === 'doing' ? 'bg-accent-blue/20 text-accent-blue' :
                'bg-accent-green/20 text-accent-green'
              }`}>
                {task.status === 'todo' ? 'To-Do' : 
                 task.status === 'doing' ? 'In Progress' : 'Done'}
              </div>
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className="p-2 hover:bg-dark-bg rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiSettings} className="w-4 h-4 text-dark-text-muted" />
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 hover:bg-dark-bg rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiEdit2} className="w-4 h-4 text-dark-text-muted" />
                  </button>
                </>
              ) : (
                <div className="flex space-x-1">
                  <button
                    onClick={handleSaveTask}
                    className="p-2 bg-accent-blue hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiSave} className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-2 hover:bg-dark-bg rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiX} className="w-4 h-4 text-dark-text-muted" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Task Details */}
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                placeholder="Task description..."
                className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent resize-none text-sm"
                rows={2}
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-dark-text-primary mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editData.due_date}
                    onChange={(e) => setEditData({ ...editData, due_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-dark-bg border border-dark-border rounded-lg text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dark-text-primary mb-1">Status</label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-dark-bg border border-dark-border rounded-lg text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                  >
                    <option value="todo">To-Do</option>
                    <option value="doing">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {task.description && (
                <p className="text-sm text-dark-text-secondary">{task.description}</p>
              )}
              <div className="flex items-center space-x-4 text-xs text-dark-text-muted">
                {task.due_date && (
                  <div className="flex items-center space-x-1">
                    <SafeIcon icon={FiCalendar} className="w-3 h-3" />
                    <span>Due {format(new Date(task.due_date), 'MMM d, yyyy')}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <SafeIcon icon={FiUser} className="w-3 h-3" />
                  <span>{task.assignee_name || 'Unassigned'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Notes - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {taskNotes.map((note, index) => {
          const showAvatar = index === 0 || taskNotes[index - 1].author_id !== note.author_id ||
            (new Date(note.created_at) - new Date(taskNotes[index - 1].created_at)) > 300000

          return (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex space-x-3 ${showAvatar ? 'mt-4' : 'mt-1'}`}
            >
              {showAvatar ? (
                <div className="w-6 h-6 bg-accent-blue rounded-full flex items-center justify-center text-white text-xs">
                  U
                </div>
              ) : (
                <div className="w-6" />
              )}

              <div className="flex-1">
                {showAvatar && (
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-dark-text-primary text-sm">You</span>
                    <span className="text-xs text-dark-text-muted">
                      {format(new Date(note.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                )}

                <div className="group relative">
                  {editingNote === note.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent resize-none text-sm"
                        rows={3}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSaveEdit()
                          } else if (e.key === 'Escape') {
                            handleCancelEdit()
                          }
                        }}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          className="px-2 py-1 bg-accent-blue hover:bg-blue-600 text-white text-xs rounded transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-2 py-1 text-dark-text-muted hover:text-dark-text-primary text-xs transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className="text-dark-text-secondary leading-relaxed text-sm"
                        dangerouslySetInnerHTML={{ __html: formatNoteBody(note.body) }}
                      />
                      <button
                        onClick={() => handleEditNote(note)}
                        className="absolute -right-6 top-0 opacity-0 group-hover:opacity-100 p-1 hover:bg-dark-surface rounded transition-all"
                      >
                        <SafeIcon icon={FiEdit2} className="w-3 h-3 text-dark-text-muted" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}

        <div ref={messagesEndRef} />

        {taskNotes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-dark-text-muted text-sm">No updates yet</p>
            <p className="text-xs text-dark-text-muted mt-1">
              Add your first update below
            </p>
          </div>
        )}
      </div>

      {/* Note Input - Fixed at Bottom */}
      <div className="flex-shrink-0 p-4 border-t border-dark-border bg-dark-surface">
        <form onSubmit={handleAddNote}>
          <div className="flex space-x-3 items-end">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a task update... (supports **bold**, *italic*, `code`, and links)"
                className="w-full px-3 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent resize-none text-sm leading-relaxed"
                rows={1}
                style={{ minHeight: '40px', maxHeight: '100px' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleAddNote(e)
                  }
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!newNote.trim()}
              className="px-3 py-2.5 bg-accent-blue hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center"
              style={{ minHeight: '40px' }}
            >
              <SafeIcon icon={FiSend} className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-dark-text-muted mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </form>
      </div>

      {showTaskModal && (
        <TaskModal
          task={task}
          onClose={() => setShowTaskModal(false)}
          onSave={(taskData) => {
            updateTask(task.id, taskData)
            setShowTaskModal(false)
          }}
        />
      )}
    </div>
  )
}

export default TaskInspector