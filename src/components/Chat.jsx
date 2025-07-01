import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiSend } from 'react-icons/fi'
import useStore from '../store/useStore'

const Chat = () => {
  const { messages, addMessage, user } = useStore()
  const [newMessage, setNewMessage] = useState('')

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    addMessage({
      author: user?.user_metadata?.name || user?.email || 'You',
      content: newMessage,
      timestamp: new Date().toISOString()
    })
    setNewMessage('')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b bg-white">
        <h1 className="text-2xl font-bold text-gray-900">Team Chat</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">{message.author}</span>
              <span className="text-xs text-gray-500">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-gray-700">{message.content}</p>
          </motion.div>
        ))}
        
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t">
        <form onSubmit={handleSendMessage} className="flex space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <FiSend />
          </button>
        </form>
      </div>
    </div>
  )
}

export default Chat