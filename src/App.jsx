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
import ErrorBoundary from './components/common/ErrorBoundary';
import { AppProvider, useApp } from './context/AppContext';

function AppContent() {
  const { user, loading: authLoading, authError } = useAuth();
  const { state, refreshData } = useApp();
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
      // Add refresh shortcut
      if ((e.metaKey || e.ctrlKey) && e.key === 'r' && e.shiftKey) {
        e.preventDefault();
        refreshData();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [refreshData]);

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

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('🟢 Back online - refreshing data from Supabase');
      refreshData();
    };

    const handleOffline = () => {
      console.log('🔴 Gone offline - data changes will be lost until reconnected');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshData]);

  // Show loading screen when auth is loading OR when we have a user but data isn't loaded yet
  const isLoading = authLoading || (user && !state.dataLoaded && state.isLoading);

  console.log('🔄 App state:', {
    authLoading,
    hasUser: !!user,
    dataLoaded: state.dataLoaded,
    appLoading: state.isLoading,
    isLoading,
    isSigningOut: state.isSigningOut,
    authError,
    appError: state.error
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
          {/* Error Display */}
          {state.error && (
            <div className="bg-red-500/10 border-b border-red-500/20 p-3">
              <div className="flex items-center justify-between">
                <p className="text-red-400 text-sm">{state.error}</p>
                <button
                  onClick={() => state.dispatch({ type: 'CLEAR_ERROR' })}
                  className="text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Offline Indicator */}
          {!navigator.onLine && (
            <div className="bg-yellow-500/10 border-b border-yellow-500/20 p-3">
              <p className="text-yellow-400 text-sm text-center">
                🔴 You're offline. Changes cannot be saved until connection is restored.
              </p>
            </div>
          )}

          {/* Supabase Only Indicator */}
          <div className="bg-blue-500/10 border-b border-blue-500/20 p-2">
            <p className="text-blue-400 text-xs text-center">
              🗄️ All data stored in Supabase • Last sync: {state.lastSync ? new Date(state.lastSync).toLocaleTimeString() : 'Never'}
            </p>
          </div>

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
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

function App() {
  return <AppWithProviders />;
}

export default App;