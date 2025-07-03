import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import Sidebar from './components/layout/Sidebar';
import TaskBoard from './components/tasks/TaskBoard';
import ContactList from './components/contacts/ContactList';
import TeamChat from './components/chat/TeamChat';
import TeamPage from './components/team/TeamPage';
import SearchModal from './components/common/SearchModal';
import LoadingScreen from './components/common/LoadingScreen';
import LoginPage from './components/auth/LoginPage';
import { AppProvider, useApp } from './context/AppContext';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { state } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);
  const [showSearch, setShowSearch] = useState(false);

  // Handle keyboard shortcuts
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

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show loading screen only when auth is loading OR when we have a user but data isn't loaded yet
  const isLoading = authLoading || (user && !state.dataLoaded && state.isLoading);

  console.log('🔄 App state:', {
    authLoading,
    hasUser: !!user,
    dataLoaded: state.dataLoaded,
    appLoading: state.isLoading,
    isLoading,
    isSigningOut: state.isSigningOut
  });

  // Show loading screen with auth loading indicator
  if (isLoading) {
    return (
      <div data-auth-loading="true">
        <LoadingScreen />
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return <LoginPage />;
  }

  // Main app interface
  return (
    <Router>
      <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
        <Sidebar 
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
  );
}

function AppWithProviders() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

function App() {
  return <AppWithProviders />;
}

export default App;