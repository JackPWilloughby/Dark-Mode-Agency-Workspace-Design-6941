import React, { useState } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import useStore from '../../store/useStore'
import ContactModal from './ContactModal'
import { useHotkeys } from 'react-hotkeys-hook'

const { FiPlus, FiSearch, FiFilter, FiUser, FiBuilding, FiEdit2, FiMail, FiPhone } = FiIcons

const STATUS_COLORS = {
  lead: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/20',
  prospect: 'bg-blue-500/20 text-blue-400 border-blue-400/20',
  client: 'bg-green-500/20 text-green-400 border-green-400/20',
  inactive: 'bg-gray-500/20 text-gray-400 border-gray-400/20'
}

const ContactList = () => {
  const { contacts, setSelectedContact } = useStore()
  const [showContactModal, setShowContactModal] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [localSearch, setLocalSearch] = useState('')

  // Keyboard shortcuts
  useHotkeys('meta+shift+n,ctrl+shift+n', () => setShowContactModal(true))

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(localSearch.toLowerCase()) ||
                         contact.company?.toLowerCase().includes(localSearch.toLowerCase()) ||
                         contact.email?.toLowerCase().includes(localSearch.toLowerCase())
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleContactClick = (contact) => {
    console.log('Contact clicked from list:', contact.id)
    setSelectedContact(contact)
  }

  const handleEditContact = (contact) => {
    setEditingContact(contact)
    setShowContactModal(true)
  }

  const handleAddContact = () => {
    setEditingContact(null)
    setShowContactModal(true)
  }

  const handleCloseModal = () => {
    setShowContactModal(false)
    setEditingContact(null)
  }

  return (
    <div className="h-full p-4 sm:p-6 flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-dark-text-primary">CRM</h1>
        <button
          onClick={handleAddContact}
          className="flex items-center justify-center px-4 py-2 bg-accent-blue hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <SafeIcon icon={FiPlus} className="mr-2 w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <div className="relative flex-1">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-muted w-4 h-4" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search contacts..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-dark-surface border border-dark-border rounded-lg text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
          />
        </div>
        <div className="relative min-w-[140px]">
          <SafeIcon icon={FiFilter} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-muted w-4 h-4" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 text-sm bg-dark-surface border border-dark-border rounded-lg text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent appearance-none"
          >
            <option value="all">All Status</option>
            <option value="lead">Lead</option>
            <option value="prospect">Prospect</option>
            <option value="client">Client</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Contact List - Desktop Table Style */}
      <div className="flex-1 overflow-y-auto">
        <div className="hidden lg:block">
          <div className="bg-dark-surface rounded-lg border border-dark-border overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-dark-border bg-dark-bg text-xs font-medium text-dark-text-muted uppercase tracking-wide">
              <div className="col-span-3">Contact</div>
              <div className="col-span-2">Company</div>
              <div className="col-span-2">Email</div>
              <div className="col-span-2">Phone</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Actions</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-dark-border">
              {filteredContacts.map(contact => (
                <motion.div
                  key={contact.id}
                  whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                  onClick={() => handleContactClick(contact)}
                  className="grid grid-cols-12 gap-4 p-4 cursor-pointer hover:bg-accent-blue/5 transition-colors"
                >
                  <div className="col-span-3 flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent-blue rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                      {contact.name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-dark-text-primary text-sm truncate">
                        {contact.name}
                      </div>
                      {contact.assigned_to && (
                        <div className="text-xs text-dark-text-muted truncate">
                          Assigned to {contact.assigned_to}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    <div className="text-sm text-dark-text-secondary truncate">
                      {contact.company || '-'}
                    </div>
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    <div className="text-sm text-dark-text-secondary truncate">
                      {contact.email || '-'}
                    </div>
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    <div className="text-sm text-dark-text-secondary truncate">
                      {contact.phone || '-'}
                    </div>
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[contact.status]}`}>
                      {contact.status}
                    </span>
                  </div>
                  
                  <div className="col-span-1 flex items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditContact(contact)
                      }}
                      className="p-1.5 hover:bg-dark-bg rounded-lg transition-colors"
                    >
                      <SafeIcon icon={FiEdit2} className="w-4 h-4 text-dark-text-muted" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Card Layout */}
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredContacts.map(contact => (
            <motion.div
              key={contact.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleContactClick(contact)}
              className="group bg-dark-surface border border-dark-border rounded-lg p-4 cursor-pointer hover:border-accent-blue/50 hover:shadow-lg transition-all duration-200"
            >
              {/* Contact Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-accent-blue rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                    {contact.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-dark-text-primary text-sm truncate">
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
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditContact(contact)
                  }}
                  className="p-1.5 hover:bg-dark-bg rounded-lg transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                >
                  <SafeIcon icon={FiEdit2} className="w-3 h-3 text-dark-text-muted" />
                </button>
              </div>

              {/* Status Tag */}
              <div className="mb-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[contact.status]}`}>
                  {contact.status}
                </span>
              </div>

              {/* Contact Info */}
              <div className="space-y-1 text-xs">
                {contact.email && (
                  <div className="flex items-center text-dark-text-muted">
                    <SafeIcon icon={FiMail} className="w-3 h-3 mr-2 flex-shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center text-dark-text-muted">
                    <SafeIcon icon={FiPhone} className="w-3 h-3 mr-2 flex-shrink-0" />
                    <span className="truncate">{contact.phone}</span>
                  </div>
                )}
              </div>

              {/* Assigned To */}
              {contact.assigned_to && (
                <div className="flex items-center pt-3 border-t border-dark-border mt-3">
                  <div className="w-5 h-5 bg-accent-green rounded-full flex items-center justify-center text-white text-xs mr-2 flex-shrink-0">
                    {contact.assigned_to[0]}
                  </div>
                  <span className="text-xs text-dark-text-muted truncate">
                    Assigned to {contact.assigned_to}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredContacts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <SafeIcon icon={FiUser} className="w-12 h-12 text-dark-text-muted mb-4" />
            <h3 className="text-lg font-medium text-dark-text-primary mb-2">
              {contacts.length === 0 ? 'No contacts yet' : 'No contacts found'}
            </h3>
            <p className="text-dark-text-muted mb-4 max-w-sm">
              {contacts.length === 0 
                ? 'Add your first contact to start building your CRM database.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {contacts.length === 0 && (
              <button
                onClick={handleAddContact}
                className="px-4 py-2 bg-accent-blue hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Add Contact
              </button>
            )}
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <ContactModal
          onClose={handleCloseModal}
          contact={editingContact}
        />
      )}
    </div>
  )
}

export default ContactList