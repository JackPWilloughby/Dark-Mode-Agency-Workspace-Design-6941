import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import useStore from '../../store/useStore'
import { format } from 'date-fns'

const { FiSend, FiHash, FiEdit2, FiSmile, FiPaperclip, FiUsers } = FiIcons

const ChatRoom = () => {
  const { messages, addMessage, users } = useStore()
  const [newMessage, setNewMessage] = useState('')
  const [editingMessage, setEditingMessage] = useState(null)
  const [typingUsers, setTypingUsers] = useState([])
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px'
    }
  }, [newMessage])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    addMessage({
      id: Date.now().toString(),
      sender_id: 'current-user',
      body: newMessage,
      created_at: new Date().toISOString()
    })

    setNewMessage('')
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const formatMessageBody = (body) => {
    // Simple markdown-lite formatting
    return body
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-dark-surface px-1 rounded text-xs">$1</code>')
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-accent-blue hover:underline">$1</a>')
  }

  return (
    <div className="h-full flex flex-col bg-dark-bg">
      {/* Chat Header */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-b border-dark-border bg-dark-surface">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-accent-blue rounded-lg flex items-center justify-center mr-3">
              <SafeIcon icon={FiHash} className="text-white w-4 h-4" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-dark-text-primary">general</h1>
              <p className="text-sm text-dark-text-secondary">Team Chat • {users.length} members</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-dark-bg rounded-lg transition-colors">
              <SafeIcon icon={FiUsers} className="w-5 h-5 text-dark-text-muted" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        {messages.map((message, index) => {
          const isOwnMessage = message.sender_id === 'current-user'
          const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id

          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex space-x-3 ${showAvatar ? 'mt-6' : 'mt-1'}`}
            >
              {showAvatar ? (
                <div className="w-8 h-8 bg-accent-blue rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                  {isOwnMessage ? 'Y' : 'U'}
                </div>
              ) : (
                <div className="w-8" />
              )}

              <div className="flex-1 min-w-0">
                {showAvatar && (
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-dark-text-primary text-sm">
                      {isOwnMessage ? 'You' : 'User'}
                    </span>
                    <span className="text-xs text-dark-text-muted">
                      {format(new Date(message.created_at), 'h:mm a')}
                    </span>
                  </div>
                )}

                <div className="group relative">
                  <div
                    className="text-dark-text-secondary leading-relaxed text-sm prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: formatMessageBody(message.body) }}
                  />
                  {isOwnMessage && (
                    <button
                      onClick={() => setEditingMessage(message.id)}
                      className="absolute -right-6 top-0 opacity-0 group-hover:opacity-100 p-1 hover:bg-dark-surface rounded transition-all"
                    >
                      <SafeIcon icon={FiEdit2} className="w-3 h-3 text-dark-text-muted" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex space-x-3">
            <div className="w-8 h-8 bg-dark-text-muted rounded-full flex items-center justify-center text-white text-xs">
              U
            </div>
            <div className="flex items-center space-x-2 text-dark-text-muted">
              <span className="text-sm">typing</span>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-current rounded-full animate-bounce" />
                <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />

        {/* Empty State */}
        {messages.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-dark-surface rounded-full flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={FiHash} className="w-8 h-8 text-dark-text-muted" />
            </div>
            <h3 className="text-lg font-medium text-dark-text-primary mb-2">Welcome to #general</h3>
            <p className="text-dark-text-muted">
              This is the beginning of the #general channel. Start the conversation with your team!
            </p>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-dark-border bg-dark-surface">
        <form onSubmit={handleSendMessage}>
          <div className="bg-dark-bg border border-dark-border rounded-lg p-3">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message #general..."
              className="w-full bg-transparent text-dark-text-primary placeholder-dark-text-muted focus:outline-none resize-none text-sm leading-relaxed"
              rows={1}
              style={{ minHeight: '20px', maxHeight: '100px' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
            />
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  className="p-1.5 hover:bg-dark-surface rounded transition-colors"
                >
                  <SafeIcon icon={FiPaperclip} className="w-4 h-4 text-dark-text-muted" />
                </button>
                <button
                  type="button"
                  className="p-1.5 hover:bg-dark-surface rounded transition-colors"
                >
                  <SafeIcon icon={FiSmile} className="w-4 h-4 text-dark-text-muted" />
                </button>
              </div>
              
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-3 py-1.5 bg-accent-blue hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors font-medium flex items-center text-sm"
              >
                <SafeIcon icon={FiSend} className="w-4 h-4 mr-1" />
                Send
              </button>
            </div>
          </div>
          
          <p className="text-xs text-dark-text-muted mt-2">
            <kbd className="px-1.5 py-0.5 bg-dark-border rounded text-xs">Enter</kbd> to send, 
            <kbd className="px-1.5 py-0.5 bg-dark-border rounded text-xs ml-1">Shift + Enter</kbd> for new line
          </p>
        </form>
      </div>
    </div>
  )
}

export default ChatRoom