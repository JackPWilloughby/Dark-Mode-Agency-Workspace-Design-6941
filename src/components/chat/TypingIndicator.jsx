import React from 'react';
import { motion } from 'framer-motion';

function TypingIndicator({ users }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center space-x-2"
    >
      <div className="bg-gray-700 rounded-2xl px-4 py-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-300">
            {users.length === 1 
              ? `${users[0]} is typing...` 
              : `${users.slice(0, -1).join(', ')} and ${users[users.length - 1]} are typing...`
            }
          </span>
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-gray-400 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default TypingIndicator;