import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/layout/Sidebar';
import TaskBoard from './components/tasks/TaskBoard';
import ContactList from './components/contacts/ContactList';
import TeamChat from './components/chat/TeamChat';
import TeamPage from './components/team/TeamPage';
import SearchModal from './components/common/SearchModal';
import LoadingScreen from './components/common/LoadingScreen';
import { AppProvider, useApp } from './context/AppContext';

function AppContent() {
  const { state } = useApp();
  const [currentView, setCurrentView] = useState('tasks');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Show loading screen while data is loading
  if (state.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
        {state.isOffline && (
          <div className="fixed top-0 left-0 right-0 bg-yellow-600 text-white text-center py-2 text-sm z-50">
            ⚠️ Working in offline mode - Changes will not be saved to cloud
          </div>
        )}
        
        <Sidebar 
          currentView={currentView}
          setCurrentView={setCurrentView}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
        
        <main className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-16 lg:ml-64'
        } ${state.isOffline ? 'mt-10' : ''}`}>
          <Routes>
            <Route path="/" element={<TaskBoard />} />
            <Route path="/tasks" element={<TaskBoard />} />
            <Route path="/contacts" element={<ContactList />} />
            <Route path="/chat" element={<TeamChat />} />
            <Route path="/team" element={<TeamPage />} />
          </Routes>
        </main>

        <AnimatePresence>
          {showSearch && (
            <SearchModal onClose={() => setShowSearch(false)} />
          )}
        </AnimatePresence>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;