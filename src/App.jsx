import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/layout/Sidebar';
import TaskBoard from './components/tasks/TaskBoard';
import ContactList from './components/contacts/ContactList';
import TeamChat from './components/chat/TeamChat';
import TeamPage from './components/team/TeamPage';
import SearchModal from './components/common/SearchModal';
import { AppProvider } from './context/AppContext';

function App() {
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

  return (
    <AppProvider>
      <Router>
        <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
          <Sidebar 
            currentView={currentView}
            setCurrentView={setCurrentView}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
          />
          
          <main className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? 'ml-16' : 'ml-16 lg:ml-64'
          }`}>
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
    </AppProvider>
  );
}

export default App;