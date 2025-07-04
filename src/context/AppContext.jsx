import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import supabaseService from '../services/supabaseService';

const AppContext = createContext();

// Minimal fallback data for new users
const getInitialData = (user) => ({
  tasks: [
    {
      id: 'welcome-task',
      title: 'Welcome to PulseHQ!',
      description: 'Create your first task by clicking the New Task button.',
      status: 'todo',
      assignee: '',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      comments: []
    }
  ],
  contacts: [],
  chatMessages: [
    {
      id: 'welcome-message',
      author: 'System',
      content: `Welcome ${user?.email?.split('@')[0] || 'User'}! Your workspace is ready.`,
      timestamp: new Date().toISOString(),
      edited: false,
      deleted: false
    }
  ],
  teamMembers: [
    {
      id: 'current-user',
      name: user?.email?.split('@')[0] || 'You',
      role: 'Team Lead',
      email: user?.email || 'you@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      status: 'online'
    }
  ]
});

const initialState = {
  tasks: [],
  contacts: [],
  chatMessages: [],
  teamMembers: [],
  typingUsers: [],
  isLoading: false,
  error: null,
  dataLoaded: false,
  isSigningOut: false,
  lastSync: null,
  syncErrors: []
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_SIGNING_OUT':
      return { ...state, isSigningOut: action.payload };
    
    case 'SET_ERROR':
      console.error('❌ App error:', action.payload);
      return { 
        ...state, 
        error: action.payload, 
        isLoading: false,
        syncErrors: [...state.syncErrors, {
          error: action.payload,
          timestamp: new Date().toISOString()
        }].slice(-10) // Keep last 10 errors
      };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'INITIALIZE_DATA':
      console.log('🎯 Initializing app data...');
      return {
        ...state,
        tasks: action.payload.tasks || [],
        contacts: action.payload.contacts || [],
        teamMembers: action.payload.teamMembers || [],
        chatMessages: action.payload.chatMessages || [],
        isLoading: false,
        error: null,
        dataLoaded: true,
        isSigningOut: false,
        lastSync: new Date().toISOString()
      };
    
    case 'RESET_DATA':
      console.log('🔄 Resetting app data...');
      return {
        ...initialState,
        dataLoaded: false,
        isSigningOut: false
      };
    
    case 'UPDATE_SYNC_STATUS':
      return {
        ...state,
        lastSync: action.success ? new Date().toISOString() : state.lastSync,
        syncErrors: action.error ? 
          [...state.syncErrors, {
            error: action.error,
            operation: action.operation,
            timestamp: new Date().toISOString()
          }].slice(-10) : state.syncErrors
      };

    // Enhanced task operations with better error handling
    case 'MOVE_TASK':
      try {
        const updatedTasks = state.tasks.map(task =>
          task.id === action.taskId ? { ...task, status: action.newStatus } : task
        );
        
        // Async sync with error handling
        if (action.taskId !== 'welcome-task') {
          const task = updatedTasks.find(t => t.id === action.taskId);
          supabaseService.updateTask(action.taskId, task)
            .then(() => console.log('✅ Task move synced:', action.taskId))
            .catch(error => {
              console.error('❌ Task move sync failed:', error);
              // Could dispatch UPDATE_SYNC_STATUS here
            });
        }
        
        return { ...state, tasks: updatedTasks };
      } catch (error) {
        console.error('❌ Move task failed:', error);
        return { ...state, error: error.message };
      }
    
    case 'ADD_TASK':
      try {
        if (!action.task?.title?.trim()) {
          throw new Error('Task title is required');
        }

        const newTask = { 
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          title: action.task.title.trim(),
          description: action.task.description?.trim() || '',
          status: action.task.status || 'todo',
          assignee: action.task.assignee?.trim() || '',
          dueDate: action.task.dueDate || '',
          comments: action.task.comments || [],
          created_at: new Date().toISOString()
        };
        
        // Async sync
        supabaseService.addTask(newTask)
          .then(serverTask => {
            if (serverTask && serverTask.id !== newTask.id) {
              console.log('✅ Task synced with server:', serverTask.id);
            }
          })
          .catch(error => {
            console.error('❌ Task sync failed:', error);
          });
        
        return { ...state, tasks: [newTask, ...state.tasks] };
      } catch (error) {
        console.error('❌ Add task failed:', error);
        return { ...state, error: error.message };
      }
    
    case 'UPDATE_TASK':
      try {
        if (!action.taskId) {
          throw new Error('Task ID is required');
        }

        const taskUpdates = state.tasks.map(task =>
          task.id === action.taskId ? { 
            ...task, 
            ...action.updates,
            updated_at: new Date().toISOString() 
          } : task
        );
        
        // Async sync
        if (action.taskId !== 'welcome-task') {
          const updatedTask = taskUpdates.find(t => t.id === action.taskId);
          supabaseService.updateTask(action.taskId, updatedTask)
            .then(() => console.log('✅ Task update synced:', action.taskId))
            .catch(error => console.error('❌ Task update sync failed:', error));
        }
        
        return { ...state, tasks: taskUpdates };
      } catch (error) {
        console.error('❌ Update task failed:', error);
        return { ...state, error: error.message };
      }
    
    case 'DELETE_TASK':
      try {
        if (!action.taskId) {
          throw new Error('Task ID is required');
        }

        const filteredTasks = state.tasks.filter(task => task.id !== action.taskId);
        
        // Async sync
        if (action.taskId !== 'welcome-task') {
          supabaseService.deleteTask(action.taskId)
            .then(() => console.log('✅ Task deletion synced:', action.taskId))
            .catch(error => console.error('❌ Task deletion sync failed:', error));
        }
        
        return { ...state, tasks: filteredTasks };
      } catch (error) {
        console.error('❌ Delete task failed:', error);
        return { ...state, error: error.message };
      }
    
    case 'ADD_TASK_COMMENT':
      try {
        if (!action.taskId || !action.content?.trim()) {
          throw new Error('Task ID and comment content are required');
        }

        const tasksWithComment = state.tasks.map(task =>
          task.id === action.taskId
            ? {
                ...task,
                comments: [
                  ...(task.comments || []),
                  {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    author: action.author || 'Anonymous',
                    content: action.content.trim(),
                    timestamp: new Date().toISOString()
                  }
                ]
              }
            : task
        );
        
        // Async sync
        if (action.taskId !== 'welcome-task') {
          const updatedTask = tasksWithComment.find(t => t.id === action.taskId);
          supabaseService.updateTask(action.taskId, updatedTask)
            .then(() => console.log('✅ Task comment synced:', action.taskId))
            .catch(error => console.error('❌ Task comment sync failed:', error));
        }
        
        return { ...state, tasks: tasksWithComment };
      } catch (error) {
        console.error('❌ Add task comment failed:', error);
        return { ...state, error: error.message };
      }
    
    // Enhanced contact operations
    case 'ADD_CONTACT':
      try {
        if (!action.contact?.name?.trim() || !action.contact?.email?.trim()) {
          throw new Error('Contact name and email are required');
        }

        const newContact = { 
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: action.contact.name.trim(),
          email: action.contact.email.trim(),
          phone: action.contact.phone?.trim() || '',
          company: action.contact.company?.trim() || '',
          status: action.contact.status || 'Lead',
          notes: action.contact.notes || [],
          created_at: new Date().toISOString()
        };
        
        // Async sync
        supabaseService.addContact(newContact)
          .then(serverContact => {
            if (serverContact && serverContact.id !== newContact.id) {
              console.log('✅ Contact synced with server:', serverContact.id);
            }
          })
          .catch(error => console.error('❌ Contact sync failed:', error));
        
        return { ...state, contacts: [newContact, ...state.contacts] };
      } catch (error) {
        console.error('❌ Add contact failed:', error);
        return { ...state, error: error.message };
      }
    
    case 'UPDATE_CONTACT':
      try {
        if (!action.contactId) {
          throw new Error('Contact ID is required');
        }

        const updatedContacts = state.contacts.map(contact =>
          contact.id === action.contactId ? { 
            ...contact, 
            ...action.updates,
            updated_at: new Date().toISOString() 
          } : contact
        );
        
        // Async sync
        const updatedContact = updatedContacts.find(c => c.id === action.contactId);
        supabaseService.updateContact(action.contactId, updatedContact)
          .then(() => console.log('✅ Contact update synced:', action.contactId))
          .catch(error => console.error('❌ Contact update sync failed:', error));
        
        return { ...state, contacts: updatedContacts };
      } catch (error) {
        console.error('❌ Update contact failed:', error);
        return { ...state, error: error.message };
      }
    
    case 'DELETE_CONTACT':
      try {
        if (!action.contactId) {
          throw new Error('Contact ID is required');
        }

        const filteredContacts = state.contacts.filter(contact => contact.id !== action.contactId);
        
        // Async sync
        supabaseService.deleteContact(action.contactId)
          .then(() => console.log('✅ Contact deletion synced:', action.contactId))
          .catch(error => console.error('❌ Contact deletion sync failed:', error));
        
        return { ...state, contacts: filteredContacts };
      } catch (error) {
        console.error('❌ Delete contact failed:', error);
        return { ...state, error: error.message };
      }
    
    case 'ADD_CONTACT_NOTE':
      try {
        if (!action.contactId || !action.content?.trim()) {
          throw new Error('Contact ID and note content are required');
        }

        const contactsWithNote = state.contacts.map(contact =>
          contact.id === action.contactId
            ? {
                ...contact,
                notes: [
                  ...(contact.notes || []),
                  {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    content: action.content.trim(),
                    timestamp: new Date().toISOString(),
                    author: action.author || 'Anonymous'
                  }
                ]
              }
            : contact
        );
        
        // Async sync
        const contactWithNewNote = contactsWithNote.find(c => c.id === action.contactId);
        supabaseService.updateContact(action.contactId, contactWithNewNote)
          .then(() => console.log('✅ Contact note synced:', action.contactId))
          .catch(error => console.error('❌ Contact note sync failed:', error));
        
        return { ...state, contacts: contactsWithNote };
      } catch (error) {
        console.error('❌ Add contact note failed:', error);
        return { ...state, error: error.message };
      }
    
    // Enhanced chat operations
    case 'ADD_CHAT_MESSAGE':
      try {
        if (!action.content?.trim() || !action.author?.trim()) {
          throw new Error('Message content and author are required');
        }

        const newMessage = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          author: action.author.trim(),
          content: action.content.trim(),
          timestamp: new Date().toISOString(),
          edited: false,
          deleted: false
        };
        
        // Async sync
        if (newMessage.id !== 'welcome-message') {
          supabaseService.addChatMessage(newMessage)
            .then(() => console.log('✅ Chat message synced:', newMessage.id))
            .catch(error => console.error('❌ Chat message sync failed:', error));
        }
        
        return {
          ...state,
          chatMessages: [...state.chatMessages, newMessage]
        };
      } catch (error) {
        console.error('❌ Add chat message failed:', error);
        return { ...state, error: error.message };
      }
    
    case 'EDIT_CHAT_MESSAGE':
      try {
        if (!action.messageId || !action.content?.trim()) {
          throw new Error('Message ID and content are required');
        }

        const editedMessages = state.chatMessages.map(msg =>
          msg.id === action.messageId
            ? { 
                ...msg, 
                content: action.content.trim(), 
                edited: true,
                updated_at: new Date().toISOString()
              }
            : msg
        );
        
        // Async sync
        if (action.messageId !== 'welcome-message') {
          const editedMessage = editedMessages.find(m => m.id === action.messageId);
          supabaseService.updateChatMessage(action.messageId, editedMessage)
            .then(() => console.log('✅ Chat message edit synced:', action.messageId))
            .catch(error => console.error('❌ Chat message edit sync failed:', error));
        }
        
        return { ...state, chatMessages: editedMessages };
      } catch (error) {
        console.error('❌ Edit chat message failed:', error);
        return { ...state, error: error.message };
      }
    
    case 'DELETE_CHAT_MESSAGE':
      try {
        if (!action.messageId) {
          throw new Error('Message ID is required');
        }

        const deletedMessages = state.chatMessages.map(msg =>
          msg.id === action.messageId
            ? { 
                ...msg, 
                deleted: true, 
                content: '',
                updated_at: new Date().toISOString()
              }
            : msg
        );
        
        // Async sync
        if (action.messageId !== 'welcome-message') {
          const deletedMessage = deletedMessages.find(m => m.id === action.messageId);
          supabaseService.updateChatMessage(action.messageId, deletedMessage)
            .then(() => console.log('✅ Chat message deletion synced:', action.messageId))
            .catch(error => console.error('❌ Chat message deletion sync failed:', error));
        }
        
        return { ...state, chatMessages: deletedMessages };
      } catch (error) {
        console.error('❌ Delete chat message failed:', error);
        return { ...state, error: error.message };
      }
    
    // Enhanced team member operations
    case 'ADD_TEAM_MEMBER':
      try {
        if (!action.member?.name?.trim() || !action.member?.email?.trim()) {
          throw new Error('Team member name and email are required');
        }

        const newMember = { 
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: action.member.name.trim(),
          email: action.member.email.trim(),
          role: action.member.role?.trim() || 'Member',
          avatar: action.member.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          status: action.member.status || 'online',
          created_at: new Date().toISOString()
        };
        
        // Async sync
        supabaseService.addTeamMember(newMember)
          .then(serverMember => {
            if (serverMember && serverMember.id !== newMember.id) {
              console.log('✅ Team member synced with server:', serverMember.id);
            }
          })
          .catch(error => console.error('❌ Team member sync failed:', error));
        
        return { ...state, teamMembers: [newMember, ...state.teamMembers] };
      } catch (error) {
        console.error('❌ Add team member failed:', error);
        return { ...state, error: error.message };
      }
    
    case 'UPDATE_TEAM_MEMBER':
      try {
        if (!action.memberId) {
          throw new Error('Member ID is required');
        }

        const updatedMembers = state.teamMembers.map(member =>
          member.id === action.memberId ? { 
            ...member, 
            ...action.updates,
            updated_at: new Date().toISOString() 
          } : member
        );
        
        // Async sync
        if (action.memberId !== 'current-user') {
          const updatedMember = updatedMembers.find(m => m.id === action.memberId);
          supabaseService.updateTeamMember(action.memberId, updatedMember)
            .then(() => console.log('✅ Team member update synced:', action.memberId))
            .catch(error => console.error('❌ Team member update sync failed:', error));
        }
        
        return { ...state, teamMembers: updatedMembers };
      } catch (error) {
        console.error('❌ Update team member failed:', error);
        return { ...state, error: error.message };
      }
    
    case 'REMOVE_TEAM_MEMBER':
      try {
        if (!action.memberId) {
          throw new Error('Member ID is required');
        }

        const filteredMembers = state.teamMembers.filter(member => member.id !== action.memberId);
        
        // Async sync
        if (action.memberId !== 'current-user') {
          supabaseService.removeTeamMember(action.memberId)
            .then(() => console.log('✅ Team member removal synced:', action.memberId))
            .catch(error => console.error('❌ Team member removal sync failed:', error));
        }
        
        return { ...state, teamMembers: filteredMembers };
      } catch (error) {
        console.error('❌ Remove team member failed:', error);
        return { ...state, error: error.message };
      }
    
    case 'SET_TYPING_USERS':
      return { ...state, typingUsers: action.users };
    
    default:
      console.warn('⚠️ Unknown action type:', action.type);
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user, loading: authLoading, authError } = useAuth();

  // Load user data when authenticated
  useEffect(() => {
    if (authLoading) {
      console.log('⏳ Auth still loading...');
      return;
    }

    if (!user) {
      console.log('❌ No user, resetting data after delay...');
      // Add a small delay before resetting data to prevent flash
      setTimeout(() => {
        if (!document.querySelector('[data-auth-loading]')) {
          dispatch({ type: 'RESET_DATA' });
        }
      }, 100);
      return;
    }

    console.log('✅ User authenticated, loading data for:', user.email);
    loadUserDataWithRetry();
  }, [user, authLoading]);

  // Handle auth errors
  useEffect(() => {
    if (authError) {
      dispatch({ type: 'SET_ERROR', payload: `Authentication Error: ${authError}` });
    }
  }, [authError]);

  const loadUserDataWithRetry = async (retryCount = 0) => {
    const maxRetries = 3;
    
    if (!user) return;

    console.log(`📊 Loading user data from Supabase... (attempt ${retryCount + 1})`);
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Test connection first
      const connectionOk = await supabaseService.testConnection();
      if (!connectionOk && retryCount < maxRetries) {
        console.log('🔄 Connection failed, retrying...');
        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
        return loadUserDataWithRetry(retryCount + 1);
      }

      // Load all user data in parallel with individual timeouts
      const dataPromises = [
        supabaseService.getTasks().catch(error => {
          console.warn('⚠️ Tasks load failed:', error.message);
          return [];
        }),
        
        supabaseService.getContacts().catch(error => {
          console.warn('⚠️ Contacts load failed:', error.message);
          return [];
        }),
        
        supabaseService.getTeamMembers().catch(error => {
          console.warn('⚠️ Team members load failed:', error.message);
          return [];
        }),
        
        supabaseService.getChatMessages().catch(error => {
          console.warn('⚠️ Chat messages load failed:', error.message);
          return [];
        })
      ];

      // Set overall timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Overall data loading timeout')), 15000)
      );

      const [tasks, contacts, teamMembers, chatMessages] = await Promise.race([
        Promise.all(dataPromises),
        timeoutPromise
      ]);

      console.log('📈 Data loaded successfully:', {
        tasks: tasks.length,
        contacts: contacts.length,
        teamMembers: teamMembers.length,
        chatMessages: chatMessages.length
      });

      // Use initial data if no data exists
      let userData = {
        tasks: tasks.length > 0 ? tasks : getInitialData(user).tasks,
        contacts: contacts.length > 0 ? contacts : [],
        teamMembers: teamMembers.length > 0 ? teamMembers : getInitialData(user).teamMembers,
        chatMessages: chatMessages.length > 0 ? chatMessages : getInitialData(user).chatMessages
      };

      // Transform server data to match client format
      userData.tasks = userData.tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        status: task.status,
        assignee: task.assignee || '',
        dueDate: task.due_date || task.dueDate || '',
        comments: task.comments || []
      }));

      userData.chatMessages = userData.chatMessages.map(msg => ({
        id: msg.id,
        author: msg.author,
        content: msg.content,
        timestamp: msg.created_at || msg.timestamp,
        edited: msg.edited || false,
        deleted: msg.deleted || false
      }));

      dispatch({ type: 'INITIALIZE_DATA', payload: userData });
      dispatch({ type: 'UPDATE_SYNC_STATUS', success: true });
      console.log('✅ User data initialized successfully');

    } catch (error) {
      console.error('❌ Failed to load user data:', error);
      
      if (retryCount < maxRetries) {
        console.log(`🔄 Retrying data load (${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
        return loadUserDataWithRetry(retryCount + 1);
      }
      
      console.warn('⚠️ Using fallback data after all retries failed');
      const fallbackData = getInitialData(user);
      dispatch({ type: 'INITIALIZE_DATA', payload: fallbackData });
      dispatch({ type: 'SET_ERROR', payload: `Failed to load data: ${error.message}` });
    }
  };

  const refreshData = async () => {
    console.log('🔄 Manual data refresh requested');
    dispatch({ type: 'CLEAR_ERROR' });
    await loadUserDataWithRetry();
  };

  const value = {
    state,
    dispatch,
    refreshData,
    isOnline: navigator.onLine,
    lastSync: state.lastSync,
    syncErrors: state.syncErrors
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}