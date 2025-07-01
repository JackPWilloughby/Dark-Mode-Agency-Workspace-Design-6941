import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
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
  ],
  currentUser: 'John Doe',
  typingUsers: []
};

function appReducer(state, action) {
  switch (action.type) {
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
        tasks: [...state.tasks, { ...action.task, id: Date.now().toString() }]
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
                comments: [...task.comments, {
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
        contacts: [...state.contacts, { ...action.contact, id: Date.now().toString() }]
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
                notes: [...contact.notes, {
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
        teamMembers: [...state.teamMembers, { ...action.member, id: Date.now().toString() }]
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

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

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