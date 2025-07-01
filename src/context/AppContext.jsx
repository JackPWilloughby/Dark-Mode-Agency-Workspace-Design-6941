import React, { createContext, useContext, useReducer, useEffect } from 'react';
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
      comments: [
        { id: '1', author: 'John Doe', content: 'Started working on wireframes', timestamp: new Date().toISOString() }
      ]
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
        { id: '1', content: 'Initial consultation call scheduled', timestamp: '2024-01-08T10:00:00Z', author: 'John Doe' },
        { id: '2', content: 'Sent project proposal and timeline', timestamp: '2024-01-09T14:30:00Z', author: 'Sarah Chen' }
      ]
    },
    {
      id: '2',
      name: 'Marcus Thompson',
      company: 'StartupXYZ',
      status: 'Prospect',
      email: 'marcus@startupxyz.com',
      phone: '+1 (555) 987-6543',
      notes: [
        { id: '1', content: 'Interested in full rebrand package', timestamp: '2024-01-07T16:15:00Z', author: 'John Doe' }
      ]
    },
    {
      id: '3',
      name: 'Lisa Wang',
      company: 'GrowthCorp',
      status: 'Lead',
      email: 'lisa@growthcorp.com',
      phone: '+1 (555) 456-7890',
      notes: [
        { id: '1', content: 'Found us through LinkedIn, needs website audit', timestamp: '2024-01-06T11:20:00Z', author: 'Sarah Chen' }
      ]
    }
  ],
  chatMessages: [
    {
      id: '1',
      author: 'John Doe',
      content: 'Hey team, just finished the client call. They loved the initial concepts!',
      timestamp: '2024-01-10T09:15:00Z',
      edited: false
    },
    {
      id: '2',
      author: 'Sarah Chen',
      content: 'That\'s awesome! Should I start working on the detailed mockups?',
      timestamp: '2024-01-10T09:17:00Z',
      edited: false
    },
    {
      id: '3',
      author: 'John Doe',
      content: 'Yes, let\'s move forward with the homepage design first',
      timestamp: '2024-01-10T09:18:00Z',
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
  currentUser: 'John Doe',
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
        tasks: [action.task, ...state.tasks]
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
                comments: [...(task.comments || []), {
                  id: Date.now().toString(),
                  author: state.currentUser,
                  content: action.content,
                  timestamp: new Date().toISOString()
                }]
              }
            : task
        )
      };
    
    case 'ADD_CONTACT':
      return {
        ...state,
        contacts: [action.contact, ...state.contacts]
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
                notes: [...(contact.notes || []), {
                  id: Date.now().toString(),
                  content: action.content,
                  timestamp: new Date().toISOString(),
                  author: state.currentUser
                }]
              }
            : contact
        )
      };
    
    case 'ADD_CHAT_MESSAGE':
      return {
        ...state,
        chatMessages: [...state.chatMessages, {
          id: Date.now().toString(),
          author: state.currentUser,
          content: action.content,
          timestamp: new Date().toISOString(),
          edited: false
        }]
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
      return {
        ...state,
        typingUsers: action.users
      };
    
    case 'ADD_TEAM_MEMBER':
      return {
        ...state,
        teamMembers: [action.member, ...state.teamMembers]
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
async function enhancedDispatch(dispatch, action, state) {
  try {
    // If offline, just update local state
    if (state.isOffline) {
      dispatch(action);
      return;
    }

    switch (action.type) {
      case 'ADD_TASK':
        try {
          const newTask = await supabaseService.addTask(action.task);
          dispatch({ type: 'ADD_TASK', task: newTask });
        } catch (error) {
          // Fallback to local state
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
          const newContact = await supabaseService.addContact(action.contact);
          dispatch({ type: 'ADD_CONTACT', contact: newContact });
        } catch (error) {
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
            author: state.currentUser
          });
        } catch (error) {
          console.warn('Failed to add note in Supabase, adding locally');
        }
        dispatch(action);
        break;
      
      case 'ADD_TEAM_MEMBER':
        try {
          const newMember = await supabaseService.addTeamMember(action.member);
          dispatch({ type: 'ADD_TEAM_MEMBER', member: newMember });
        } catch (error) {
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
            author: state.currentUser,
            content: action.content
          });
        } catch (error) {
          console.warn('Failed to add chat message in Supabase, adding locally');
        }
        dispatch({ type: 'ADD_CHAT_MESSAGE', content: action.content });
        break;
      
      default:
        dispatch(action);
    }
  } catch (error) {
    console.error('Enhanced dispatch error:', error);
    // Don't show error for every action, just continue with local state
    dispatch(action);
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Enhanced dispatch function
  const enhancedDispatchFunc = (action) => {
    enhancedDispatch(dispatch, action, state);
  };

  // Load initial data from Supabase with fallback
  useEffect(() => {
    async function loadInitialData() {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Test connection with timeout
        const connectionPromise = supabaseService.testConnection();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 5000)
        );
        
        const connected = await Promise.race([connectionPromise, timeoutPromise]);
        
        if (!connected) {
          throw new Error('Connection test failed');
        }

        // Load all data in parallel with timeout
        const dataPromise = Promise.all([
          supabaseService.getTasks(),
          supabaseService.getContacts(),
          supabaseService.getTeamMembers(),
          supabaseService.getChatMessages()
        ]);
        
        const dataTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Data loading timeout')), 10000)
        );

        const [tasks, contacts, teamMembers, chatMessages] = await Promise.race([
          dataPromise, 
          dataTimeoutPromise
        ]);

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
        console.log('✅ Data loaded successfully from Supabase');
        
      } catch (error) {
        console.warn('⚠️ Supabase connection failed, using fallback data:', error.message);
        
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
  }, []);

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