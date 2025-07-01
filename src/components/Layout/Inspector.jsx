import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import useStore from '../../store/useStore'
import ContactHistory from '../CRM/ContactHistory'
import TaskInspector from '../Kanban/TaskInspector'

const { FiX } = FiIcons

const Inspector = () => {
  const { inspectorOpen, setInspectorOpen, selectedContact, selectedTask } = useStore()

  const getTitle = () => {
    if (selectedContact) return 'Contact History'
    if (selectedTask) return 'Task Details'
    return 'Inspector'
  }

  const renderContent = () => {
    if (selectedContact) {
      return <ContactHistory contact={selectedContact} />
    }
    if (selectedTask) {
      return <TaskInspector task={selectedTask} />
    }
    return (
      <div className="p-8 text-center text-dark-text-muted">
        <p>Select a contact or task to view details</p>
      </div>
    )
  }

  return (
    <AnimatePresence>
      {inspectorOpen && (
        <>
          {/* Mobile overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setInspectorOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />

          {/* Inspector panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-dark-surface border-l border-dark-border z-50 lg:relative lg:max-w-none lg:w-80 xl:w-96 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-dark-border bg-dark-surface flex-shrink-0">
              <h2 className="text-lg font-semibold text-dark-text-primary">
                {getTitle()}
              </h2>
              <button
                onClick={() => setInspectorOpen(false)}
                className="p-2 hover:bg-dark-bg rounded-lg transition-colors"
              >
                <SafeIcon icon={FiX} className="text-dark-text-secondary" />
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden">
              {renderContent()}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Inspector