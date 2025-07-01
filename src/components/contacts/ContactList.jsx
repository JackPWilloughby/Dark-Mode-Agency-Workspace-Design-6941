import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ContactRow from './ContactRow';
import ContactPanel from './ContactPanel';
import AddContactModal from './AddContactModal';
import { useApp } from '../../context/AppContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiSearch, FiFilter, FiPlus } = FiIcons;

const statusColors = {
  'Lead': 'bg-yellow-500',
  'Prospect': 'bg-blue-500',
  'Client': 'bg-green-500',
  'Inactive': 'bg-gray-500'
};

function ContactList() {
  const { state } = useApp();
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showPanel, setShowPanel] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredContacts = state.contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || contact.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    setShowPanel(true);
  };

  const handleClosePanel = () => {
    setShowPanel(false);
    setTimeout(() => setSelectedContact(null), 300);
  };

  const handleAddContact = () => {
    setShowAddModal(true);
  };

  return (
    <div className="h-full flex bg-gray-900">
      <div className={`flex-1 flex flex-col transition-all duration-300 ${showPanel ? 'lg:mr-96' : ''}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 sm:p-6 border-b border-gray-700 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Contacts</h1>
            <p className="text-gray-400 mt-1 text-sm sm:text-base">Manage your client relationships</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 w-full sm:w-64"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Status</option>
              <option value="Lead">Lead</option>
              <option value="Prospect">Prospect</option>
              <option value="Client">Client</option>
              <option value="Inactive">Inactive</option>
            </select>
            
            <motion.button
              onClick={handleAddContact}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
              <span>Add Contact</span>
            </motion.button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6">
            <div className="bg-gray-800 rounded-2xl overflow-hidden">
              {/* Desktop Table Header */}
              <div className="hidden lg:grid grid-cols-12 gap-4 p-4 border-b border-gray-700 text-sm font-medium text-gray-400">
                <div className="col-span-3">Name</div>
                <div className="col-span-3">Company</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Contact</div>
                <div className="col-span-2">Last Note</div>
              </div>
              
              <div className="divide-y divide-gray-700">
                {filteredContacts.map((contact) => (
                  <ContactRow
                    key={contact.id}
                    contact={contact}
                    onClick={() => handleContactClick(contact)}
                    statusColors={statusColors}
                  />
                ))}
              </div>
              
              {filteredContacts.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <p>No contacts found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPanel && selectedContact && (
          <ContactPanel
            contact={selectedContact}
            onClose={handleClosePanel}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && (
          <AddContactModal
            onClose={() => setShowAddModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default ContactList;