import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import ContactCard from './ContactCard'

const ContactColumn = ({ stage, contacts, onEdit, onSelect }) => {
  const { setNodeRef } = useDroppable({ id: stage.id })

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center mb-3 sm:mb-4">
        <div className={`w-3 h-3 rounded-full ${stage.color} mr-2 sm:mr-3`} />
        <h2 className="font-semibold text-dark-text-primary text-sm sm:text-base">{stage.title}</h2>
        <span className="ml-2 px-2 py-1 bg-dark-bg text-dark-text-muted text-xs rounded-full">
          {contacts.length}
        </span>
      </div>

      <div 
        ref={setNodeRef} 
        className="flex-1 overflow-y-auto space-y-2 sm:space-y-3 min-h-[200px] p-2 rounded-lg border-2 border-dashed border-transparent hover:border-dark-border transition-colors"
      >
        <SortableContext items={contacts.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {contacts.map(contact => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={onEdit}
              onSelect={onSelect}
            />
          ))}
        </SortableContext>

        {contacts.length === 0 && (
          <div className="flex items-center justify-center h-24 sm:h-32 text-dark-text-muted text-xs sm:text-sm">
            Drop contacts here
          </div>
        )}
      </div>
    </div>
  )
}

export default ContactColumn