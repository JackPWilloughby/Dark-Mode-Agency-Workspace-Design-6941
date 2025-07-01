import React, { useState } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import useStore from '../../store/useStore'

const { FiX, FiUser, FiBuilding, FiMail, FiPhone, FiTrash2, FiGlobe, FiUserCheck } = FiIcons

const ContactModal = ({ onClose, contact }) => {
  const { addContact, updateContact, deleteContact } = useStore()
  const [formData, setFormData] = useState({
    name: contact?.name || '',
    company: contact?.company || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    website: contact?.website || '',
    assigned_to: contact?.assigned_to || '',
    status: contact?.status || 'lead'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (contact) {
      updateContact(contact.id, formData)
    } else {
      addContact({
        id: Date.now().toString(),
        ...formData,
        created_at: new Date().toISOString()
      })
    }
    onClose()
  }

  const handleDelete = () => {
    if (contact && window.confirm('Are you sure you want to delete this contact?')) {
      deleteContact(contact.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-dark-surface rounded-default border border-dark-border w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <h2 className="text-lg font-semibold text-dark-text-primary">
            {contact ? 'Edit Contact' : 'Add Contact'}
          </h2>
          <div className="flex items-center space-x-2">
            {contact && (
              <button
                onClick={handleDelete}
                className="p-2 text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiTrash2} className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-dark-bg rounded-lg transition-colors"
            >
              <SafeIcon icon={FiX} className="text-dark-text-secondary" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-text-primary mb-2">
              Name *
            </label>
            <div className="relative">
              <SafeIcon icon={FiUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-muted" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                placeholder="Contact name"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text-primary mb-2">
              Company
            </label>
            <div className="relative">
              <SafeIcon icon={FiBuilding} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-muted" />
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full pl-10 pr-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                placeholder="Company name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text-primary mb-2">
              Email
            </label>
            <div className="relative">
              <SafeIcon icon={FiMail} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-muted" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text-primary mb-2">
              Phone
            </label>
            <div className="relative">
              <SafeIcon icon={FiPhone} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-muted" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                placeholder="Phone number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text-primary mb-2">
              Website
            </label>
            <div className="relative">
              <SafeIcon icon={FiGlobe} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-muted" />
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full pl-10 pr-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text-primary mb-2">
              Assigned To
            </label>
            <div className="relative">
              <SafeIcon icon={FiUserCheck} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-muted" />
              <input
                type="text"
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                className="w-full pl-10 pr-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                placeholder="Team member name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text-primary mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
            >
              <option value="lead">Lead</option>
              <option value="prospect">Prospect</option>
              <option value="client">Client</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-dark-text-secondary hover:text-dark-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent-blue hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              {contact ? 'Update Contact' : 'Add Contact'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default ContactModal