import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiMail, FiPhone } = FiIcons;

function ContactRow({ contact, onClick, statusColors }) {
  const latestNote = contact.notes && contact.notes.length > 0 
    ? contact.notes[contact.notes.length - 1] 
    : null;

  return (
    <motion.div
      onClick={() => onClick(contact)}
      className="p-4 hover:bg-gray-700 cursor-pointer transition-colors group"
      whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.5)' }}
    >
      {/* Mobile Layout */}
      <div className="lg:hidden space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-lg">
            {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white group-hover:text-blue-400 transition-colors truncate">
              {contact.name}
            </p>
            <p className="text-sm text-gray-300 truncate">{contact.company}</p>
          </div>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${statusColors[contact.status]}`}>
            {contact.status}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 text-gray-400">
            <div className="flex items-center space-x-1">
              <SafeIcon icon={FiMail} className="w-4 h-4" />
              <span className="truncate max-w-[120px]">{contact.email}</span>
            </div>
            {contact.phone && (
              <div className="flex items-center space-x-1">
                <SafeIcon icon={FiPhone} className="w-4 h-4" />
              </div>
            )}
          </div>
          
          {latestNote && (
            <div className="text-right">
              <p className="text-xs text-gray-500">
                {format(new Date(latestNote.timestamp), 'MMM d')}
              </p>
            </div>
          )}
        </div>
        
        {latestNote && (
          <p className="text-sm text-gray-400 truncate">
            Latest: {latestNote.content}
          </p>
        )}
        
        {contact.notes && contact.notes.length > 0 && (
          <div className="text-xs text-gray-500">
            {contact.notes.length} note{contact.notes.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:grid grid-cols-12 gap-4 items-center">
        <div className="col-span-3 flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
            {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-white group-hover:text-blue-400 transition-colors truncate">
              {contact.name}
            </p>
          </div>
        </div>
        
        <div className="col-span-3 flex items-center">
          <p className="text-gray-300 truncate">{contact.company}</p>
        </div>
        
        <div className="col-span-2 flex items-center">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${statusColors[contact.status]}`}>
            {contact.status}
          </span>
        </div>
        
        <div className="col-span-2 flex items-center space-x-2 text-sm text-gray-400">
          <SafeIcon icon={FiMail} className="w-4 h-4" />
          <SafeIcon icon={FiPhone} className="w-4 h-4" />
        </div>
        
        <div className="col-span-2 flex items-center">
          {latestNote ? (
            <div className="text-sm min-w-0 flex-1">
              <p className="text-gray-300 truncate">{latestNote.content}</p>
              <p className="text-xs text-gray-500">
                {format(new Date(latestNote.timestamp), 'MMM d')} • {contact.notes?.length || 0} notes
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No notes</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ContactRow;