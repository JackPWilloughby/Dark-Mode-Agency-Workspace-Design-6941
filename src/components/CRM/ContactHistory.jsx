import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import useStore from '../../store/useStore'
import { format } from 'date-fns'

const { FiSend, FiEdit2 } = FiIcons

const ContactHistory = ({ contact }) => {
  const { notes, addNote, updateNote } = useStore()
  const [newNote, setNewNote] = useState('')
  const [editingNote, setEditingNote] = useState(null)
  const [editingText, setEditingText] = useState('')
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const contactNotes = notes
    .filter(note => note.contact_id === contact.id)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [contactNotes])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px'
    }
  }, [newNote])

  const handleAddNote = (e) => {
    e.preventDefault()
    if (!newNote.trim()) return

    addNote({
      id: Date.now().toString(),
      contact_id: contact.id,
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
      .replace(/`(.*?)`/g, '<code class="bg-dark-bg px-1 rounded text-xs">$1</code>')
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-accent-blue hover:underline">$1</a>')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Contact Info - Fixed Header */}
      <div className="flex-shrink-0 p-4 border-b border-dark-border bg-dark-surface">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-accent-blue rounded-full flex items-center justify-center text-white font-medium text-sm">
            {contact.name[0]}
          </div>
          <div>
            <h3 className="font-medium text-dark-text-primary text-sm">{contact.name}</h3>
            {contact.company && (
              <p className="text-xs text-dark-text-secondary">{contact.company}</p>
            )}
          </div>
        </div>
      </div>

      {/* Notes History - Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {contactNotes.map((note, index) => {
          const showAvatar = index === 0 || contactNotes[index - 1].author_id !== note.author_id ||
            (new Date(note.created_at) - new Date(contactNotes[index - 1].created_at)) > 300000

          return (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex space-x-3 ${showAvatar ? 'mt-4' : 'mt-1'}`}
            >
              {showAvatar ? (
                <div className="w-6 h-6 bg-accent-green rounded-full flex items-center justify-center text-white text-xs">
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

        {contactNotes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-dark-text-muted text-sm">No notes yet</p>
            <p className="text-xs text-dark-text-muted mt-1">
              Add your first note below
            </p>
          </div>
        )}
      </div>

      {/* Message Input - Fixed at Bottom */}
      <div className="flex-shrink-0 p-4 border-t border-dark-border bg-dark-surface">
        <form onSubmit={handleAddNote}>
          <div className="flex space-x-3 items-end">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note... (supports **bold**, *italic*, `code`, and links)"
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
    </div>
  )
}

export default ContactHistory