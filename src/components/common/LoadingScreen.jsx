import React from 'react';
import { motion } from 'framer-motion';

function LoadingScreen() {
  return (
    <div className="h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <span className="text-white font-bold text-2xl">P</span>
        </motion.div>
        
        <h2 className="text-2xl font-bold text-white mb-2">PulseHQ</h2>
        <p className="text-gray-400 mb-6">Loading your workspace...</p>
        
        <div className="flex space-x-2 justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-blue-500 rounded-full"
              animate={{
                y: [-10, 0, -10],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
        
        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 text-xs text-gray-600">
            <p>Initializing authentication...</p>
            <p>Loading user data...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoadingScreen;