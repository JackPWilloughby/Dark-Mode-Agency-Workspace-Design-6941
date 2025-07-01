import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';

const AppContext = createContext();

// Enhanced fallback data with more realistic content
const fallbackData = {
  tasks: [
    {
      id: '1',
      title: 'Welcome to PulseHQ!',
      description: 'Start by creating your first real task. You can drag tasks between columns, add comments, and assign team members.',
      status: 'todo',
      assignee: '',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      comments: [{
        id: '1',
        author: 'System',
        content: 'Welcome to your new workspace! This is how comments work.',
        timestamp: new Date().toISOString()
      }]
    },
    {
      id: '2',
      title: 'Explore the features',
      description: 'Check out contacts, team management, and chat functionality.',
      status: 'doing',
      assignee: '',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      comments: []
    }
  ],
  contacts: [
    {
      id: '1',
      name: 'Demo Contact',
      company: 'Example Corp',
      status: 'Lead',
      email: 'demo@example.com',
      phone: '+1 (555) 123-4567',
      notes: [{
        id: '1',
        content: 'This is a sample contact. You can add notes, update status, and track interactions.',
        timestamp: new Date().toISOString(),
        author: 'System'
      }]
    }
  ],
  chatMessages: [
    {
      id: '1',
      author: 'System',
      content: 'Welcome to PulseHQ! This is your team chat. You can edit messages, mention team members, and collaborate in real-time.',
      timestamp: new Date().toISOString(),
      edited: false
    }
  ],
  teamMembers: [
    {
      id: '1',
      name: 'You',
      role: 'Team Lead',
      email: 'you@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      status: 'online'
    }
  ]
};

const initialState = {
  tasks: [],
  contacts: [],
  chatMessages: [],
  teamMembers: [],
  typingUsers: [],
  isLoading: true,
  error: null,
  isOffline: false
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_OFFLINE':
      return { ...state, isOffline: action.payload, isLoading: false };
    
    case 'INITIALIZE_DATA':
      return {
        ...state,
        tasks: action.payload.tasks || [],
        contacts: action.payload.contacts || [],
        teamMembers: action.payload.teamMembers || [],
        chatMessages: action.payload.chatMessages || [],
        isLoading: false,
        error: null
      };
    
    case 'MOVE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.taskId ? { ...task, status: action.newStatus } : task
        )
      };
    
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [
          { ...action.task, id: action.task.id || Date.now().toString() },
          ...state.tasks
        ]
      };
    
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.taskId ? { ...task, ...action.updates } : task
        )
      };
    
    case 'ADD_TASK_COMMENT':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.taskId
            ? {
                ...task,
                comments: [
                  ...(task.comments || []),
                  {
                    id: Date.now().toString(),
                    author: action.author,
                    content: action.content,
                    timestamp: new Date().toISOString()
                  }
                ]
              }
            : task
        )
      };
    
    case 'ADD_CONTACT':
      return {
        ...state,
        contacts: [
          { ...action.contact, id: action.contact.id || Date.now().toString() },
          ...state.contacts
        ]
      };
    
    case 'UPDATE_CONTACT':
      return {
        ...state,
        contacts: state.contacts.map(contact =>
          contact.id === action.contactId ? { ...contact, ...action.updates } : contact
        )
      };
    
    case 'ADD_CONTACT_NOTE':
      return {
        ...state,
        contacts: state.contacts.map(contact =>
          contact.id === action.contactId
            ? {
                ...contact,
                notes: [
                  ...(contact.notes || []),
                  {
                    id: Date.now().toString(),
                    content: action.content,
                    timestamp: new Date().toISOString(),
                    author: action.author
                  }
                ]
              }
            : contact
        )
      };
    
    case 'ADD_CHAT_MESSAGE':
      return {
        ...state,
        chatMessages: [
          ...state.chatMessages,
          {
            id: Date.now().toString(),
            author: action.author,
            content: action.content,
            timestamp: new Date().toISOString(),
            edited: false
          }
        ]
      };
    
    case 'EDIT_CHAT_MESSAGE':
      return {
        ...state,
        chatMessages: state.chatMessages.map(msg =>
          msg.id === action.messageId
            ? { ...msg, content: action.content, edited: true }
            : msg
        )
      };
    
    case 'ADD_TEAM_MEMBER':
      return {
        ...state,
        teamMembers: [
          { ...action.member, id: action.member.id || Date.now().toString() },
          ...state.teamMembers
        ]
      };
    
    case 'UPDATE_TEAM_MEMBER':
      return {
        ...state,
        teamMembers: state.teamMembers.map(member =>
          member.id === action.memberId ? { ...member, ...action.updates } : member
        )
      };
    
    case 'REMOVE_TEAM_MEMBER':
      return {
        ...state,
        teamMembers: state.teamMembers.filter(member => member.id !== action.memberId)
      };
    
    case 'SET_TYPING_USERS':
      return { ...state, typingUsers: action.users };
    
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user, loading: authLoading } = useAuth();

  // Load initial data
  useEffect(() => {
    let mounted = true;

    async function loadInitialData() {
      if (authLoading) {
        console.log('⏳ Auth still loading...');
        return;
      }

      if (!mounted) return;

      try {
        console.log('📊 Loading workspace data...');
        dispatch({ type: 'SET_LOADING', payload: true });

        // Always start with fallback data for immediate functionality
        console.log('✅ Loading fallback data for immediate use');
        
        // If user is logged in, update the fallback data with their info
        let workspaceData = { ...fallbackData };
        
        if (user) {
          // Customize data for logged-in user
          workspaceData.teamMembers = [{
            id: '1',
            name: user.email?.split('@')[0] || 'You',
            role: 'Team Lead',
            email: user.email || 'you@example.com',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            status: 'online'
          }];
          
          workspaceData.chatMessages = [{
            id: '1',
            author: 'System',
            content: `Welcome to PulseHQ, ${user.email?.split('@')[0] || 'User'}! Your workspace is ready. Start by creating tasks, adding contacts, and inviting team members.`,
            timestamp: new Date().toISOString(),
            edited: false
          }];
        }

        dispatch({ type: 'INITIALIZE_DATA', payload: workspaceData });
        console.log('✅ Workspace loaded successfully');

      } catch (error) {
        console.error('❌ Error loading workspace:', error);
        dispatch({ type: 'INITIALIZE_DATA', payload: fallbackData });
      }
    }

    loadInitialData();

    return () => {
      mounted = false;
    };
  }, [user, authLoading]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
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