import React from 'react'
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import useStore from '../../store/useStore'
import ContactCard from './ContactCard'
import ContactColumn from './ContactColumn'

const { FiPlus, FiSearch, FiList, FiColumns } = FiIcons

const CONTACT_STAGES = [
  { id: 'lead', title: 'Leads', color: 'bg-yellow-500' },
  { id: 'prospect', title: 'Prospects', color: 'bg-blue-500' },
  { id: 'client', title: 'Clients', color: 'bg-green-500' },
  { id: 'inactive', title: 'Inactive', color: 'bg-gray-500' }
]

const ContactKanban = ({ contacts, onAddContact, onViewModeChange, localSearch, onLocalSearchChange, onEditContact, onSelectContact }) => {
  const { updateContact } = useStore()
  const [activeContact, setActiveContact] = React.useState(null)

  const handleDragStart = (event) => {
    const { active } = event
    const contact = contacts.find(c => c.id === active.id)
    setActiveContact(contact)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveContact(null)

    if (!over) return

    const contactId = active.id
    const newStatus = over.id

    if (contacts.find(c => c.id === contactId)?.status !== newStatus) {
      updateContact(contactId, { status: newStatus })
    }
  }

  const getContactsByStatus = (status) => {
    return contacts.filter(contact => contact.status === status)
  }

  return (
    <div className="h-full p-3 sm:p-6 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-dark-text-primary">CRM</h1>
        <div className="flex items-center space-x-2">
          {/* View Toggle */}
          <div className="flex bg-dark-surface border border-dark-border rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('list')}
              className="p-2 rounded transition-colors text-dark-text-muted hover:text-dark-text-primary"
            >
              <SafeIcon icon={FiList} className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('kanban')}
              className="p-2 rounded transition-colors bg-accent-blue text-white"
            >
              <SafeIcon icon={FiColumns} className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={onAddContact}
            className="flex items-center px-3 sm:px-4 py-2 bg-accent-blue hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
          >
            <SafeIcon icon={FiPlus} className="mr-1 sm:mr-2 w-4 h-4" />
            <span className="hidden sm:inline">Add Contact</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-muted w-4 h-4" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => onLocalSearchChange(e.target.value)}
            placeholder="Search contacts..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-dark-surface border border-dark-border rounded-lg text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
          />
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCorners}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 h-full">
            {CONTACT_STAGES.map(stage => (
              <ContactColumn
                key={stage.id}
                stage={stage}
                contacts={getContactsByStatus(stage.id)}
                onEdit={onEditContact}
                onSelect={onSelectContact}
              />
            ))}
          </div>

          <DragOverlay>
            {activeContact && (
              <div className="opacity-95">
                <ContactCard contact={activeContact} isDragging />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}

export default ContactKanban