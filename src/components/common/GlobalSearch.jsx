import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from './SafeIcon'
import useStore from '../../store/useStore'
import { useHotkeys } from 'react-hotkeys-hook'

const { FiSearch, FiX, FiColumns, FiUsers, FiMessageSquare } = FiIcons

const GlobalSearch = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { tasks, contacts, messages } = useStore()

  useHotkeys('meta+k,ctrl+k', (e) => {
    e.preventDefault()
    setIsOpen(true)
  })

  useHotkeys('escape', () => {
    setIsOpen(false)
    setQuery('')
  })

  const searchResults = React.useMemo(() => {
    if (!query.trim()) return []

    const results = []
    const searchTerm = query.toLowerCase()

    // Search tasks
    tasks.forEach(task => {
      if (task.title.toLowerCase().includes(searchTerm) || 
          task.description?.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'task',
          icon: FiColumns,
          title: task.title,
          subtitle: task.description,
          item: task
        })
      }
    })

    // Search contacts
    contacts.forEach(contact => {
      if (contact.name.toLowerCase().includes(searchTerm) || 
          contact.company?.toLowerCase().includes(searchTerm) || 
          contact.email?.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'contact',
          icon: FiUsers,
          title: contact.name,
          subtitle: contact.company || contact.email,
          item: contact
        })
      }
    })

    // Search messages
    messages.forEach(message => {
      if (message.body.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'message',
          icon: FiMessageSquare,
          title: message.body.substring(0, 50) + '...',
          subtitle: 'in #general',
          item: message
        })
      }
    })

    return results.slice(0, 10) // Limit results
  }, [query, tasks, contacts, messages])

  const handleSelect = (result) => {
    switch (result.type) {
      case 'task':
        onNavigate('kanban')
        break
      case 'contact':
        onNavigate('crm')
        break
      case 'message':
        onNavigate('chat')
        break
    }
    setIsOpen(false)
    setQuery('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-[10vh] z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="bg-dark-surface border border-dark-border rounded-default w-full max-w-2xl mx-4 overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center p-4 border-b border-dark-border">
              <SafeIcon icon={FiSearch} className="text-dark-text-muted mr-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks, contacts, messages..."
                className="flex-1 bg-transparent text-sm sm:text-base text-dark-text-primary placeholder-dark-text-muted focus:outline-none"
                autoFocus
              />
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-dark-bg rounded transition-colors"
              >
                <SafeIcon icon={FiX} className="text-dark-text-muted" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="p-2">
                  {searchResults.map((result, index) => (
                    <button
                      key={`${result.type}-${index}`}
                      onClick={() => handleSelect(result)}
                      className="w-full flex items-center p-3 hover:bg-dark-bg rounded-lg transition-colors text-left"
                    >
                      <SafeIcon icon={result.icon} className="text-dark-text-muted mr-3" />
                      <div className="flex-1">
                        <div className="font-medium text-dark-text-primary line-clamp-1 text-sm sm:text-base">
                          {result.title}
                        </div>
                        {result.subtitle && (
                          <div className="text-xs sm:text-sm text-dark-text-secondary line-clamp-1">
                            {result.subtitle}
                          </div>
                        )}
                      </div>
                      <div className="px-2 py-1 bg-dark-border text-xs text-dark-text-muted rounded capitalize">
                        {result.type}
                      </div>
                    </button>
                  ))}
                </div>
              ) : query.trim() ? (
                <div className="p-6 sm:p-8 text-center text-dark-text-muted">
                  <span className="text-sm sm:text-base">No results found for "{query}"</span>
                </div>
              ) : (
                <div className="p-6 sm:p-8 text-center text-dark-text-muted">
                  <span className="text-sm sm:text-base">Start typing to search across tasks, contacts, and messages</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-dark-border text-xs text-dark-text-muted">
              <div className="flex items-center justify-between">
                <span>Press ↑↓ to navigate</span>
                <span>Press Enter to select</span>
                <span>Press Esc to close</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default GlobalSearch