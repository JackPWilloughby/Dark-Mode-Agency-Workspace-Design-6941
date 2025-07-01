import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiPlus, FiEdit, FiTrash2, FiMail, FiPhone, FiHome, FiUsers } from 'react-icons/fi'
import useStore from '../store/useStore'

const ContactModal = ({ contact, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: contact?.name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    company: contact?.company || '',
    status: contact?.status || 'lead',
    assignee: contact?.assignee || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg w-full max-w-md p-6"
      >
        <h2 className="text-xl font-semibold mb-4">
          {contact ? 'Edit Contact' : 'New Contact'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Company</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="lead">Lead</option>
                <option value="prospect">Prospect</option>
                <option value="client">Client</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Assignee</label>
              <input
                type="text"
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

const CRM = () => {
  const { contacts, addContact, updateContact, deleteContact } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [editingContact, setEditingContact] = useState(null)

  const handleSaveContact = (contactData) => {
    if (editingContact) {
      updateContact(editingContact.id, contactData)
    } else {
      addContact(contactData)
    }
  }

  const handleEditContact = (contact) => {
    setEditingContact(contact)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingContact(null)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'client': return 'text-green-600 bg-green-100'
      case 'prospect': return 'text-blue-600 bg-blue-100'
      case 'lead': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">CRM</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FiPlus className="mr-2" />
          New Contact
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((contact) => (
          <motion.div
            key={contact.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(contact.status)}`}>
                  {contact.status}
                </span>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleEditContact(contact)}
                  className="p-1 text-gray-400 hover:text-blue-600"
                >
                  <FiEdit size={14} />
                </button>
                <button
                  onClick={() => deleteContact(contact.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              {contact.company && (
                <div className="flex items-center">
                  <FiHome className="mr-2" size={14} />
                  {contact.company}
                </div>
              )}
              {contact.email && (
                <div className="flex items-center">
                  <FiMail className="mr-2" size={14} />
                  {contact.email}
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center">
                  <FiPhone className="mr-2" size={14} />
                  {contact.phone}
                </div>
              )}
              {contact.assignee && (
                <div className="text-xs text-gray-500 mt-2">
                  Assigned to: {contact.assignee}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {contacts.length === 0 && (
        <div className="text-center py-12">
          <FiUsers className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">No contacts yet. Add your first contact to get started.</p>
        </div>
      )}

      {showModal && (
        <ContactModal
          contact={editingContact}
          onClose={handleCloseModal}
          onSave={handleSaveContact}
        />
      )}
    </div>
  )
}

export default CRM