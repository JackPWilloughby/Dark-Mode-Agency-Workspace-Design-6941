import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';

const AppContext = createContext();

// Minimal fallback data for fast loading
const fallbackData = {
  tasks: [
    {
      id: '1',
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
      id: '1',
      author: 'System',
      content: 'Welcome to PulseHQ! Start by creating tasks and adding team members.',
      timestamp: new Date().toISOString(),
      edited: false,
      deleted: false
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
  isLoading: false,
  error: null,
  isOffline: false
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
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
      const newTask = { 
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: action.task.title,
        description: action.task.description || '',
        status: action.task.status || 'todo',
        assignee: action.task.assignee || '',
        dueDate: action.task.dueDate || '',
        comments: action.task.comments || []
      };
      return {
        ...state,
        tasks: [newTask, ...state.tasks]
      };
    
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.taskId ? { ...task, ...action.updates } : task
        )
      };
    
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.taskId)
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
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
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
      const newContact = { 
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: action.contact.name,
        email: action.contact.email,
        phone: action.contact.phone || '',
        company: action.contact.company,
        status: action.contact.status,
        notes: action.contact.notes || []
      };
      return {
        ...state,
        contacts: [newContact, ...state.contacts]
      };
    
    case 'UPDATE_CONTACT':
      return {
        ...state,
        contacts: state.contacts.map(contact =>
          contact.id === action.contactId ? { ...contact, ...action.updates } : contact
        )
      };
    
    case 'DELETE_CONTACT':
      return {
        ...state,
        contacts: state.contacts.filter(contact => contact.id !== action.contactId)
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
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
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
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            author: action.author,
            content: action.content,
            timestamp: new Date().toISOString(),
            edited: false,
            deleted: false
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
    
    case 'DELETE_CHAT_MESSAGE':
      return {
        ...state,
        chatMessages: state.chatMessages.map(msg =>
          msg.id === action.messageId
            ? { ...msg, deleted: true, content: '' }
            : msg
        )
      };
    
    case 'ADD_TEAM_MEMBER':
      const newMember = { 
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: action.member.name,
        email: action.member.email,
        role: action.member.role,
        avatar: action.member.avatar,
        status: action.member.status || 'online'
      };
      return {
        ...state,
        teamMembers: [newMember, ...state.teamMembers]
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

  // Load initial data immediately
  useEffect(() => {
    console.log('📊 Initializing workspace data...');
    
    // Load data immediately - no async delays
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
        content: `Welcome ${user.email?.split('@')[0] || 'User'}! Your workspace is ready.`,
        timestamp: new Date().toISOString(),
        edited: false,
        deleted: false
      }];
    }

    dispatch({ type: 'INITIALIZE_DATA', payload: workspaceData });
    console.log('✅ Workspace loaded instantly');
  }, [user]);

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