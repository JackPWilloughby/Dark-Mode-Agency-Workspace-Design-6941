import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiPlus, FiMail, FiUser, FiEdit, FiTrash2 } from 'react-icons/fi'
import useStore from '../store/useStore'

const TeamMemberModal = ({ member, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: member?.name || '',
    email: member?.email || '',
    role: member?.role || ''
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
          {member ? 'Edit Team Member' : 'Add Team Member'}
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
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full p-2 border rounded-lg"
              placeholder="e.g., Designer, Developer, Manager"
              required
            />
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

const Team = () => {
  const { teamMembers, setTeamMembers } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [editingMember, setEditingMember] = useState(null)

  const handleSaveMember = (memberData) => {
    if (editingMember) {
      setTeamMembers(teamMembers.map(member => 
        member.id === editingMember.id ? { ...member, ...memberData } : member
      ))
    } else {
      setTeamMembers([...teamMembers, { ...memberData, id: Date.now().toString() }])
    }
  }

  const handleEditMember = (member) => {
    setEditingMember(member)
    setShowModal(true)
  }

  const handleDeleteMember = (id) => {
    setTeamMembers(teamMembers.filter(member => member.id !== id))
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingMember(null)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Team</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FiPlus className="mr-2" />
          Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamMembers.map((member) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FiUser className="text-blue-600" size={20} />
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleEditMember(member)}
                  className="p-1 text-gray-400 hover:text-blue-600"
                >
                  <FiEdit size={14} />
                </button>
                <button
                  onClick={() => handleDeleteMember(member.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 mb-1">{member.name}</h3>
            <p className="text-sm text-blue-600 mb-3">{member.role}</p>
            
            <div className="flex items-center text-sm text-gray-600">
              <FiMail className="mr-2" size={14} />
              {member.email}
            </div>
          </motion.div>
        ))}
      </div>

      {teamMembers.length === 0 && (
        <div className="text-center py-12">
          <FiUser className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">No team members yet. Add your first team member to get started.</p>
        </div>
      )}

      {showModal && (
        <TeamMemberModal
          member={editingMember}
          onClose={handleCloseModal}
          onSave={handleSaveMember}
        />
      )}
    </div>
  )
}

export default Team