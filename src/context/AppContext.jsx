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
  isLoading: true,
  error: null,
  dataLoaded: false
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
        error: null,
        dataLoaded: true
      };
    
    case 'RESET_DATA':
      return {
        ...initialState,
        isLoading: false,
        dataLoaded: false
      };
    
    case 'MOVE_TASK':
      const updatedTasks = state.tasks.map(task =>
        task.id === action.taskId ? { ...task, status: action.newStatus } : task
      );
      // Sync with Supabase
      if (action.taskId !== 'welcome-task') {
        const task = updatedTasks.find(t => t.id === action.taskId);
        supabaseService.updateTask(action.taskId, task).catch(console.error);
      }
      return { ...state, tasks: updatedTasks };
    
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
      
      // Sync with Supabase
      supabaseService.addTask(newTask)
        .then(serverTask => {
          if (serverTask && serverTask.id !== newTask.id) {
            // Update with server ID if needed
            console.log('Task synced with server:', serverTask.id);
          }
        })
        .catch(console.error);
      
      return { ...state, tasks: [newTask, ...state.tasks] };
    
    case 'UPDATE_TASK':
      const taskUpdates = state.tasks.map(task =>
        task.id === action.taskId ? { ...task, ...action.updates } : task
      );
      
      // Sync with Supabase
      if (action.taskId !== 'welcome-task') {
        const updatedTask = taskUpdates.find(t => t.id === action.taskId);
        supabaseService.updateTask(action.taskId, updatedTask).catch(console.error);
      }
      
      return { ...state, tasks: taskUpdates };
    
    case 'DELETE_TASK':
      const filteredTasks = state.tasks.filter(task => task.id !== action.taskId);
      
      // Sync with Supabase
      if (action.taskId !== 'welcome-task') {
        supabaseService.deleteTask(action.taskId).catch(console.error);
      }
      
      return { ...state, tasks: filteredTasks };
    
    case 'ADD_TASK_COMMENT':
      const tasksWithComment = state.tasks.map(task =>
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
      );
      
      // Sync with Supabase
      if (action.taskId !== 'welcome-task') {
        const updatedTask = tasksWithComment.find(t => t.id === action.taskId);
        supabaseService.updateTask(action.taskId, updatedTask).catch(console.error);
      }
      
      return { ...state, tasks: tasksWithComment };
    
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
      
      // Sync with Supabase
      supabaseService.addContact(newContact)
        .then(serverContact => {
          if (serverContact && serverContact.id !== newContact.id) {
            console.log('Contact synced with server:', serverContact.id);
          }
        })
        .catch(console.error);
      
      return { ...state, contacts: [newContact, ...state.contacts] };
    
    case 'UPDATE_CONTACT':
      const updatedContacts = state.contacts.map(contact =>
        contact.id === action.contactId ? { ...contact, ...action.updates } : contact
      );
      
      // Sync with Supabase
      const updatedContact = updatedContacts.find(c => c.id === action.contactId);
      supabaseService.updateContact(action.contactId, updatedContact).catch(console.error);
      
      return { ...state, contacts: updatedContacts };
    
    case 'DELETE_CONTACT':
      const filteredContacts = state.contacts.filter(contact => contact.id !== action.contactId);
      
      // Sync with Supabase
      supabaseService.deleteContact(action.contactId).catch(console.error);
      
      return { ...state, contacts: filteredContacts };
    
    case 'ADD_CONTACT_NOTE':
      const contactsWithNote = state.contacts.map(contact =>
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
      );
      
      // Sync with Supabase
      const contactWithNewNote = contactsWithNote.find(c => c.id === action.contactId);
      supabaseService.updateContact(action.contactId, contactWithNewNote).catch(console.error);
      
      return { ...state, contacts: contactsWithNote };
    
    case 'ADD_CHAT_MESSAGE':
      const newMessage = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        author: action.author,
        content: action.content,
        timestamp: new Date().toISOString(),
        edited: false,
        deleted: false
      };
      
      // Sync with Supabase
      if (newMessage.id !== 'welcome-message') {
        supabaseService.addChatMessage(newMessage).catch(console.error);
      }
      
      return {
        ...state,
        chatMessages: [...state.chatMessages, newMessage]
      };
    
    case 'EDIT_CHAT_MESSAGE':
      const editedMessages = state.chatMessages.map(msg =>
        msg.id === action.messageId
          ? { ...msg, content: action.content, edited: true }
          : msg
      );
      
      // Sync with Supabase
      if (action.messageId !== 'welcome-message') {
        const editedMessage = editedMessages.find(m => m.id === action.messageId);
        supabaseService.updateChatMessage(action.messageId, editedMessage).catch(console.error);
      }
      
      return { ...state, chatMessages: editedMessages };
    
    case 'DELETE_CHAT_MESSAGE':
      const deletedMessages = state.chatMessages.map(msg =>
        msg.id === action.messageId
          ? { ...msg, deleted: true, content: '' }
          : msg
      );
      
      // Sync with Supabase
      if (action.messageId !== 'welcome-message') {
        const deletedMessage = deletedMessages.find(m => m.id === action.messageId);
        supabaseService.updateChatMessage(action.messageId, deletedMessage).catch(console.error);
      }
      
      return { ...state, chatMessages: deletedMessages };
    
    case 'ADD_TEAM_MEMBER':
      const newMember = { 
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: action.member.name,
        email: action.member.email,
        role: action.member.role,
        avatar: action.member.avatar,
        status: action.member.status || 'online'
      };
      
      // Sync with Supabase
      supabaseService.addTeamMember(newMember)
        .then(serverMember => {
          if (serverMember && serverMember.id !== newMember.id) {
            console.log('Team member synced with server:', serverMember.id);
          }
        })
        .catch(console.error);
      
      return { ...state, teamMembers: [newMember, ...state.teamMembers] };
    
    case 'UPDATE_TEAM_MEMBER':
      const updatedMembers = state.teamMembers.map(member =>
        member.id === action.memberId ? { ...member, ...action.updates } : member
      );
      
      // Sync with Supabase
      if (action.memberId !== 'current-user') {
        const updatedMember = updatedMembers.find(m => m.id === action.memberId);
        supabaseService.updateTeamMember(action.memberId, updatedMember).catch(console.error);
      }
      
      return { ...state, teamMembers: updatedMembers };
    
    case 'REMOVE_TEAM_MEMBER':
      const filteredMembers = state.teamMembers.filter(member => member.id !== action.memberId);
      
      // Sync with Supabase
      if (action.memberId !== 'current-user') {
        supabaseService.removeTeamMember(action.memberId).catch(console.error);
      }
      
      return { ...state, teamMembers: filteredMembers };
    
    case 'SET_TYPING_USERS':
      return { ...state, typingUsers: action.users };
    
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user, loading: authLoading } = useAuth();

  // Load user data when authenticated
  useEffect(() => {
    if (!user) {
      // Clear data when user logs out
      dispatch({ type: 'RESET_DATA' });
      return;
    }

    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    console.log('📊 Loading user data from Supabase...');
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Load all user data in parallel
      const [tasks, contacts, teamMembers, chatMessages] = await Promise.all([
        supabaseService.getTasks(),
        supabaseService.getContacts(),
        supabaseService.getTeamMembers(),
        supabaseService.getChatMessages()
      ]);

      // If no data exists, use initial data
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
      console.log('✅ User data loaded successfully');

    } catch (error) {
      console.warn('⚠️ Failed to load user data, using fallback:', error.message);
      
      // Use fallback data if server fails
      const fallbackData = getInitialData(user);
      dispatch({ type: 'INITIALIZE_DATA', payload: fallbackData });
    }
  };

  const value = {
    state,
    dispatch,
    refreshData: loadUserData
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