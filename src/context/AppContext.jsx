import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import supabaseService from '../services/supabaseService';

const AppContext = createContext();

// Fallback data for when Supabase is not available
const fallbackData = {
  tasks: [
    {
      id: '1',
      title: 'Design new landing page',
      description: 'Create mockups for the client homepage redesign',
      status: 'todo',
      assignee: 'Sarah Chen',
      dueDate: '2024-01-15',
      comments: []
    },
    {
      id: '2',
      title: 'Client meeting prep',
      description: 'Prepare presentation materials for quarterly review',
      status: 'doing',
      assignee: 'John Doe',
      dueDate: '2024-01-12',
      comments: []
    },
    {
      id: '3',
      title: 'Update brand guidelines',
      description: 'Finalize new color palette and typography rules',
      status: 'done',
      assignee: 'Sarah Chen',
      dueDate: '2024-01-10',
      comments: []
    }
  ],
  contacts: [
    {
      id: '1',
      name: 'Emily Rodriguez',
      company: 'TechFlow Inc',
      status: 'Client',
      email: 'emily@techflow.com',
      phone: '+1 (555) 123-4567',
      notes: [
        {
          id: '1',
          content: 'Initial consultation call scheduled',
          timestamp: '2024-01-08T10:00:00Z',
          author: 'John Doe'
        }
      ]
    },
    {
      id: '2',
      name: 'Marcus Thompson',
      company: 'StartupXYZ',
      status: 'Prospect',
      email: 'marcus@startupxyz.com',
      phone: '+1 (555) 987-6543',
      notes: []
    }
  ],
  chatMessages: [
    {
      id: '1',
      author: 'John Doe',
      content: 'Welcome to PulseHQ! Let\'s start collaborating.',
      timestamp: '2024-01-10T09:15:00Z',
      edited: false
    },
    {
      id: '2',
      author: 'Sarah Chen',
      content: 'Great! Looking forward to working together.',
      timestamp: '2024-01-10T09:17:00Z',
      edited: false
    }
  ],
  teamMembers: [
    {
      id: '1',
      name: 'John Doe',
      role: 'Creative Director',
      email: 'john@pulsehq.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      status: 'online'
    },
    {
      id: '2',
      name: 'Sarah Chen',
      role: 'Senior Designer',
      email: 'sarah@pulsehq.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c3d3?w=150&h=150&fit=crop&crop=face',
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
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'SET_CONTACTS':
      return { ...state, contacts: action.payload };
    case 'SET_TEAM_MEMBERS':
      return { ...state, teamMembers: action.payload };
    case 'SET_CHAT_MESSAGES':
      return { ...state, chatMessages: action.payload };
    case 'MOVE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.taskId
            ? { ...task, status: action.newStatus }
            : task
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
          task.id === action.taskId
            ? { ...task, ...action.updates }
            : task
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
          contact.id === action.contactId
            ? { ...contact, ...action.updates }
            : contact
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
    case 'SET_TYPING_USERS':
      return { ...state, typingUsers: action.users };
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
          member.id === action.memberId
            ? { ...member, ...action.updates }
            : member
        )
      };
    case 'REMOVE_TEAM_MEMBER':
      return {
        ...state,
        teamMembers: state.teamMembers.filter(member => member.id !== action.memberId)
      };
    default:
      return state;
  }
}

// Enhanced dispatch with Supabase integration and fallback
async function enhancedDispatch(dispatch, action, state, user) {
  try {
    // If offline or no user, just update local state
    if (state.isOffline || !user) {
      dispatch(action);
      return;
    }

    switch (action.type) {
      case 'ADD_TASK':
        try {
          const newTask = await supabaseService.addTask({ ...action.task, user_id: user.id });
          dispatch({ type: 'ADD_TASK', task: newTask });
        } catch (error) {
          console.warn('Failed to add task to Supabase, adding locally');
          const localTask = { ...action.task, id: Date.now().toString() };
          dispatch({ type: 'ADD_TASK', task: localTask });
        }
        break;

      case 'UPDATE_TASK':
        try {
          await supabaseService.updateTask(action.taskId, action.updates);
        } catch (error) {
          console.warn('Failed to update task in Supabase, updating locally');
        }
        dispatch(action);
        break;

      case 'ADD_CONTACT':
        try {
          const newContact = await supabaseService.addContact({ ...action.contact, user_id: user.id });
          dispatch({ type: 'ADD_CONTACT', contact: newContact });
        } catch (error) {
          console.warn('Failed to add contact to Supabase, adding locally');
          const localContact = { ...action.contact, id: Date.now().toString() };
          dispatch({ type: 'ADD_CONTACT', contact: localContact });
        }
        break;

      case 'UPDATE_CONTACT':
        try {
          await supabaseService.updateContact(action.contactId, action.updates);
        } catch (error) {
          console.warn('Failed to update contact in Supabase, updating locally');
        }
        dispatch(action);
        break;

      case 'ADD_CONTACT_NOTE':
        try {
          await supabaseService.addContactNote(action.contactId, {
            content: action.content,
            author: action.author
          });
        } catch (error) {
          console.warn('Failed to add note in Supabase, adding locally');
        }
        dispatch(action);
        break;

      case 'ADD_TEAM_MEMBER':
        try {
          const newMember = await supabaseService.addTeamMember({ ...action.member, user_id: user.id });
          dispatch({ type: 'ADD_TEAM_MEMBER', member: newMember });
        } catch (error) {
          console.warn('Failed to add team member to Supabase, adding locally');
          const localMember = { ...action.member, id: Date.now().toString() };
          dispatch({ type: 'ADD_TEAM_MEMBER', member: localMember });
        }
        break;

      case 'UPDATE_TEAM_MEMBER':
        try {
          await supabaseService.updateTeamMember(action.memberId, action.updates);
        } catch (error) {
          console.warn('Failed to update team member in Supabase, updating locally');
        }
        dispatch(action);
        break;

      case 'REMOVE_TEAM_MEMBER':
        try {
          await supabaseService.removeTeamMember(action.memberId);
        } catch (error) {
          console.warn('Failed to remove team member in Supabase, removing locally');
        }
        dispatch(action);
        break;

      case 'ADD_CHAT_MESSAGE':
        try {
          await supabaseService.addChatMessage({
            author: action.author,
            content: action.content,
            user_id: user.id
          });
        } catch (error) {
          console.warn('Failed to add chat message in Supabase, adding locally');
        }
        dispatch(action);
        break;

      default:
        dispatch(action);
    }
  } catch (error) {
    console.error('Enhanced dispatch error:', error);
    dispatch(action);
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user, loading: authLoading } = useAuth();

  // Enhanced dispatch function
  const enhancedDispatchFunc = (action) => {
    enhancedDispatch(dispatch, action, state, user);
  };

  // Load initial data from Supabase with fallback
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

        if (!user) {
          console.log('👤 No user found, using fallback data');
          // No user, use fallback data
          dispatch({ type: 'SET_TASKS', payload: fallbackData.tasks });
          dispatch({ type: 'SET_CONTACTS', payload: fallbackData.contacts });
          dispatch({ type: 'SET_TEAM_MEMBERS', payload: fallbackData.teamMembers });
          dispatch({ type: 'SET_CHAT_MESSAGES', payload: fallbackData.chatMessages });
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }

        console.log('🔌 Testing Supabase connection...');
        
        // Test connection with a shorter timeout
        const connectionTest = supabaseService.testConnection();
        const connectionTimeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout')), 3000)
        );

        let connected = false;
        try {
          connected = await Promise.race([connectionTest, connectionTimeout]);
        } catch (error) {
          console.warn('⚠️ Connection test failed:', error.message);
        }

        if (!connected) {
          throw new Error('Supabase connection failed');
        }

        console.log('📥 Loading data from Supabase...');
        
        // Load all data in parallel with timeout
        const dataPromise = Promise.all([
          supabaseService.getTasks(),
          supabaseService.getContacts(),
          supabaseService.getTeamMembers(),
          supabaseService.getChatMessages()
        ]);

        const dataTimeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Data loading timeout')), 8000)
        );

        const [tasks, contacts, teamMembers, chatMessages] = await Promise.race([
          dataPromise,
          dataTimeout
        ]);

        if (!mounted) return;

        // Transform data to match frontend format
        const transformedTasks = tasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          assignee: task.assignee,
          dueDate: task.due_date,
          comments: task.comments || []
        }));

        const transformedContacts = contacts.map(contact => ({
          id: contact.id,
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          company: contact.company,
          status: contact.status,
          notes: contact.notes || []
        }));

        const transformedTeamMembers = teamMembers.map(member => ({
          id: member.id,
          name: member.name,
          email: member.email,
          role: member.role,
          avatar: member.avatar,
          status: member.status
        }));

        const transformedChatMessages = chatMessages.map(message => ({
          id: message.id,
          author: message.author,
          content: message.content,
          timestamp: message.created_at,
          edited: message.edited
        }));

        dispatch({ type: 'SET_TASKS', payload: transformedTasks });
        dispatch({ type: 'SET_CONTACTS', payload: transformedContacts });
        dispatch({ type: 'SET_TEAM_MEMBERS', payload: transformedTeamMembers });
        dispatch({ type: 'SET_CHAT_MESSAGES', payload: transformedChatMessages });
        dispatch({ type: 'SET_LOADING', payload: false });
        
        console.log('✅ Workspace data loaded successfully from Supabase');
      } catch (error) {
        console.warn('⚠️ Failed to load from Supabase, using fallback data:', error.message);
        
        if (!mounted) return;
        
        // Use fallback data
        dispatch({ type: 'SET_TASKS', payload: fallbackData.tasks });
        dispatch({ type: 'SET_CONTACTS', payload: fallbackData.contacts });
        dispatch({ type: 'SET_TEAM_MEMBERS', payload: fallbackData.teamMembers });
        dispatch({ type: 'SET_CHAT_MESSAGES', payload: fallbackData.chatMessages });
        dispatch({ type: 'SET_OFFLINE', payload: true });
        dispatch({ type: 'SET_LOADING', payload: false });
        
        console.log('✅ Fallback data loaded successfully');
      }
    }

    loadInitialData();

    return () => {
      mounted = false;
    };
  }, [user, authLoading]);

  return (
    <AppContext.Provider value={{ state, dispatch: enhancedDispatchFunc }}>
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