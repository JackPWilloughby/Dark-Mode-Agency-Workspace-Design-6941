import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'

const { FiBuilding, FiEdit2 } = FiIcons

const STATUS_COLORS = {
  lead: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/20',
  prospect: 'bg-blue-500/20 text-blue-400 border-blue-400/20',
  client: 'bg-green-500/20 text-green-400 border-green-400/20',
  inactive: 'bg-gray-500/20 text-gray-400 border-gray-400/20'
}

const ContactCard = ({ contact, isDragging, onEdit, onSelect }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({ id: contact.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleCardClick = (e) => {
    e.stopPropagation()
    console.log('Contact card clicked:', contact.id)
    if (onSelect) {
      onSelect(contact)
    }
  }

  const handleEditClick = (e) => {
    e.stopPropagation()
    console.log('Contact edit clicked:', contact.id)
    if (onEdit) {
      onEdit(contact)
    }
  }

  // Separate drag listeners from click handlers
  const dragHandleProps = {
    ...attributes,
    ...listeners
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      whileHover={{ scale: 1.02 }}
      className={`
        group bg-dark-surface border rounded-default cursor-pointer transition-all duration-120 hover:shadow-lg hover:border-accent-blue/50
        ${isDragging || isSortableDragging ? 'opacity-95 shadow-xl' : 'border-dark-border'}
      `}
    >
      {/* Drag Handle - Top area for dragging */}
      <div {...dragHandleProps} className="px-3 sm:px-4 pt-3 pb-2 cursor-grab active:cursor-grabbing">
        <div className="flex items-center justify-between">
          <div className="w-2 h-2 bg-dark-text-muted rounded-full opacity-50" />
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-dark-text-muted rounded-full opacity-30" />
            <div className="w-1 h-1 bg-dark-text-muted rounded-full opacity-30" />
            <div className="w-1 h-1 bg-dark-text-muted rounded-full opacity-30" />
          </div>
          <button
            onClick={handleEditClick}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-dark-bg rounded transition-all"
          >
            <SafeIcon icon={FiEdit2} className="w-3 h-3 text-dark-text-muted" />
          </button>
        </div>
      </div>

      {/* Clickable Content Area */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3" onClick={handleCardClick}>
        {/* Status Tag */}
        <div className="flex justify-end">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[contact.status]}`}>
            {contact.status}
          </span>
        </div>

        {/* Contact Info */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-accent-blue rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
            {contact.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-dark-text-primary text-sm truncate">
              {contact.name}
            </h3>
            {contact.company && (
              <div className="flex items-center mt-1 text-xs text-dark-text-secondary">
                <SafeIcon icon={FiBuilding} className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">{contact.company}</span>
              </div>
            )}
          </div>
        </div>

        {/* Assigned To */}
        {contact.assigned_to && (
          <div className="flex items-center pt-2 border-t border-dark-border">
            <div className="w-5 h-5 bg-accent-green rounded-full flex items-center justify-center text-white text-xs mr-2">
              {contact.assigned_to[0]}
            </div>
            <span className="text-xs text-dark-text-muted">Assigned to {contact.assigned_to}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default ContactCard