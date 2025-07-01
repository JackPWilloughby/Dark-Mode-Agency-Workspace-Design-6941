import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiAlertTriangle, FiRefreshCw } = FiIcons;

function ErrorScreen({ error }) {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <SafeIcon icon={FiAlertTriangle} className="w-8 h-8 text-red-400" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Connection Error</h2>
        <p className="text-gray-400 mb-6">
          Unable to load your workspace data. Please check your connection and try again.
        </p>
        
        <div className="bg-gray-800 rounded-xl p-4 mb-6">
          <p className="text-red-400 text-sm font-mono">{error}</p>
        </div>
        
        <motion.button
          onClick={handleRefresh}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors mx-auto"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <SafeIcon icon={FiRefreshCw} className="w-4 h-4" />
          <span>Try Again</span>
        </motion.button>
      </div>
    </div>
  );
}

export default ErrorScreen;