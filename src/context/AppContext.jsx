import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import supabaseService from '../services/supabaseService';

const AppContext = createContext();

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
      console.log('🎯 Initializing app data from Supabase...');
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
        syncErrors: action.error ? [...state.syncErrors, {
          error: action.error,
          operation: action.operation,
          timestamp: new Date().toISOString()
        }].slice(-10) : state.syncErrors
      };

    // Task operations - Direct Supabase sync only
    case 'MOVE_TASK':
      // Optimistic update
      const updatedTasks = state.tasks.map(task =>
        task.id === action.taskId ? { ...task, status: action.newStatus } : task
      );

      // Sync with Supabase immediately
      const taskToUpdate = updatedTasks.find(t => t.id === action.taskId);
      supabaseService.updateTask(action.taskId, taskToUpdate)
        .then(() => {
          console.log('✅ Task move synced to Supabase:', action.taskId);
        })
        .catch(error => {
          console.error('❌ Task move sync failed:', error);
          // Revert optimistic update on failure
          window.location.reload();
        });

      return { ...state, tasks: updatedTasks };

    case 'ADD_TASK':
      if (!action.task?.title?.trim()) {
        return { ...state, error: 'Task title is required' };
      }

      // Create temporary task for optimistic update
      const tempTask = {
        id: `temp_${Date.now()}`,
        title: action.task.title.trim(),
        description: action.task.description?.trim() || '',
        status: action.task.status || 'todo',
        assignee: action.task.assignee?.trim() || '',
        dueDate: action.task.dueDate || '',
        comments: [],
        created_at: new Date().toISOString()
      };

      // Add to Supabase immediately
      supabaseService.addTask(tempTask)
        .then(serverTask => {
          console.log('✅ Task added to Supabase:', serverTask.id);
          // Replace temp task with server task
          action.dispatch({
            type: 'REPLACE_TEMP_TASK',
            tempId: tempTask.id,
            serverTask
          });
        })
        .catch(error => {
          console.error('❌ Failed to add task to Supabase:', error);
          action.dispatch({
            type: 'REMOVE_TEMP_TASK',
            tempId: tempTask.id
          });
          action.dispatch({
            type: 'SET_ERROR',
            payload: 'Failed to add task. Please try again.'
          });
        });

      return { ...state, tasks: [tempTask, ...state.tasks] };

    case 'REPLACE_TEMP_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.tempId ? action.serverTask : task
        )
      };

    case 'REMOVE_TEMP_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.tempId)
      };

    case 'UPDATE_TASK':
      if (!action.taskId) {
        return { ...state, error: 'Task ID is required' };
      }

      // Optimistic update
      const taskUpdates = state.tasks.map(task =>
        task.id === action.taskId ? {
          ...task,
          ...action.updates,
          updated_at: new Date().toISOString()
        } : task
      );

      // Sync with Supabase immediately
      const updatedTask = taskUpdates.find(t => t.id === action.taskId);
      supabaseService.updateTask(action.taskId, updatedTask)
        .then(() => {
          console.log('✅ Task update synced to Supabase:', action.taskId);
        })
        .catch(error => {
          console.error('❌ Task update sync failed:', error);
          window.location.reload();
        });

      return { ...state, tasks: taskUpdates };

    case 'DELETE_TASK':
      if (!action.taskId) {
        return { ...state, error: 'Task ID is required' };
      }

      // Optimistic update
      const filteredTasks = state.tasks.filter(task => task.id !== action.taskId);

      // Sync with Supabase immediately
      supabaseService.deleteTask(action.taskId)
        .then(() => {
          console.log('✅ Task deletion synced to Supabase:', action.taskId);
        })
        .catch(error => {
          console.error('❌ Task deletion sync failed:', error);
          window.location.reload();
        });

      return { ...state, tasks: filteredTasks };

    case 'ADD_TASK_COMMENT':
      if (!action.taskId || !action.content?.trim()) {
        return { ...state, error: 'Task ID and comment content are required' };
      }

      const newComment = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        author: action.author || 'Anonymous',
        content: action.content.trim(),
        timestamp: new Date().toISOString()
      };

      // Optimistic update
      const tasksWithComment = state.tasks.map(task =>
        task.id === action.taskId ? {
          ...task,
          comments: [...(task.comments || []), newComment]
        } : task
      );

      // Sync with Supabase immediately
      const taskWithNewComment = tasksWithComment.find(t => t.id === action.taskId);
      supabaseService.updateTask(action.taskId, taskWithNewComment)
        .then(() => {
          console.log('✅ Task comment synced to Supabase:', action.taskId);
        })
        .catch(error => {
          console.error('❌ Task comment sync failed:', error);
          window.location.reload();
        });

      return { ...state, tasks: tasksWithComment };

    // Contact operations - Direct Supabase sync only
    case 'ADD_CONTACT':
      if (!action.contact?.name?.trim() || !action.contact?.email?.trim()) {
        return { ...state, error: 'Contact name and email are required' };
      }

      const tempContact = {
        id: `temp_${Date.now()}`,
        name: action.contact.name.trim(),
        email: action.contact.email.trim(),
        phone: action.contact.phone?.trim() || '',
        company: action.contact.company?.trim() || '',
        status: action.contact.status || 'Lead',
        notes: [],
        created_at: new Date().toISOString()
      };

      // Add to Supabase immediately
      supabaseService.addContact(tempContact)
        .then(serverContact => {
          console.log('✅ Contact added to Supabase:', serverContact.id);
          action.dispatch({
            type: 'REPLACE_TEMP_CONTACT',
            tempId: tempContact.id,
            serverContact
          });
        })
        .catch(error => {
          console.error('❌ Failed to add contact to Supabase:', error);
          action.dispatch({
            type: 'REMOVE_TEMP_CONTACT',
            tempId: tempContact.id
          });
          action.dispatch({
            type: 'SET_ERROR',
            payload: 'Failed to add contact. Please try again.'
          });
        });

      return { ...state, contacts: [tempContact, ...state.contacts] };

    case 'REPLACE_TEMP_CONTACT':
      return {
        ...state,
        contacts: state.contacts.map(contact =>
          contact.id === action.tempId ? action.serverContact : contact
        )
      };

    case 'REMOVE_TEMP_CONTACT':
      return {
        ...state,
        contacts: state.contacts.filter(contact => contact.id !== action.tempId)
      };

    case 'UPDATE_CONTACT':
      if (!action.contactId) {
        return { ...state, error: 'Contact ID is required' };
      }

      // Optimistic update
      const updatedContacts = state.contacts.map(contact =>
        contact.id === action.contactId ? {
          ...contact,
          ...action.updates,
          updated_at: new Date().toISOString()
        } : contact
      );

      // Sync with Supabase immediately
      const updatedContact = updatedContacts.find(c => c.id === action.contactId);
      supabaseService.updateContact(action.contactId, updatedContact)
        .then(() => {
          console.log('✅ Contact update synced to Supabase:', action.contactId);
        })
        .catch(error => {
          console.error('❌ Contact update sync failed:', error);
          window.location.reload();
        });

      return { ...state, contacts: updatedContacts };

    case 'DELETE_CONTACT':
      if (!action.contactId) {
        return { ...state, error: 'Contact ID is required' };
      }

      // Optimistic update
      const filteredContacts = state.contacts.filter(contact => contact.id !== action.contactId);

      // Sync with Supabase immediately
      supabaseService.deleteContact(action.contactId)
        .then(() => {
          console.log('✅ Contact deletion synced to Supabase:', action.contactId);
        })
        .catch(error => {
          console.error('❌ Contact deletion sync failed:', error);
          window.location.reload();
        });

      return { ...state, contacts: filteredContacts };

    case 'ADD_CONTACT_NOTE':
      if (!action.contactId || !action.content?.trim()) {
        return { ...state, error: 'Contact ID and note content are required' };
      }

      const newNote = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        content: action.content.trim(),
        timestamp: new Date().toISOString(),
        author: action.author || 'Anonymous'
      };

      // Optimistic update
      const contactsWithNote = state.contacts.map(contact =>
        contact.id === action.contactId ? {
          ...contact,
          notes: [...(contact.notes || []), newNote]
        } : contact
      );

      // Sync with Supabase immediately
      const contactWithNewNote = contactsWithNote.find(c => c.id === action.contactId);
      supabaseService.updateContact(action.contactId, contactWithNewNote)
        .then(() => {
          console.log('✅ Contact note synced to Supabase:', action.contactId);
        })
        .catch(error => {
          console.error('❌ Contact note sync failed:', error);
          window.location.reload();
        });

      return { ...state, contacts: contactsWithNote };

    // Chat operations - Direct Supabase sync only
    case 'ADD_CHAT_MESSAGE':
      if (!action.content?.trim() || !action.author?.trim()) {
        return { ...state, error: 'Message content and author are required' };
      }

      const tempMessage = {
        id: `temp_${Date.now()}`,
        author: action.author.trim(),
        content: action.content.trim(),
        timestamp: new Date().toISOString(),
        edited: false,
        deleted: false
      };

      // Add to Supabase immediately
      supabaseService.addChatMessage(tempMessage)
        .then(serverMessage => {
          console.log('✅ Chat message added to Supabase:', serverMessage.id);
          action.dispatch({
            type: 'REPLACE_TEMP_MESSAGE',
            tempId: tempMessage.id,
            serverMessage
          });
        })
        .catch(error => {
          console.error('❌ Failed to add chat message to Supabase:', error);
          action.dispatch({
            type: 'REMOVE_TEMP_MESSAGE',
            tempId: tempMessage.id
          });
          action.dispatch({
            type: 'SET_ERROR',
            payload: 'Failed to send message. Please try again.'
          });
        });

      return { ...state, chatMessages: [...state.chatMessages, tempMessage] };

    case 'REPLACE_TEMP_MESSAGE':
      return {
        ...state,
        chatMessages: state.chatMessages.map(msg =>
          msg.id === action.tempId ? action.serverMessage : msg
        )
      };

    case 'REMOVE_TEMP_MESSAGE':
      return {
        ...state,
        chatMessages: state.chatMessages.filter(msg => msg.id !== action.tempId)
      };

    case 'EDIT_CHAT_MESSAGE':
      if (!action.messageId || !action.content?.trim()) {
        return { ...state, error: 'Message ID and content are required' };
      }

      // Optimistic update
      const editedMessages = state.chatMessages.map(msg =>
        msg.id === action.messageId ? {
          ...msg,
          content: action.content.trim(),
          edited: true,
          updated_at: new Date().toISOString()
        } : msg
      );

      // Sync with Supabase immediately
      const editedMessage = editedMessages.find(m => m.id === action.messageId);
      supabaseService.updateChatMessage(action.messageId, editedMessage)
        .then(() => {
          console.log('✅ Chat message edit synced to Supabase:', action.messageId);
        })
        .catch(error => {
          console.error('❌ Chat message edit sync failed:', error);
          window.location.reload();
        });

      return { ...state, chatMessages: editedMessages };

    case 'DELETE_CHAT_MESSAGE':
      if (!action.messageId) {
        return { ...state, error: 'Message ID is required' };
      }

      // Optimistic update
      const deletedMessages = state.chatMessages.map(msg =>
        msg.id === action.messageId ? {
          ...msg,
          deleted: true,
          content: '',
          updated_at: new Date().toISOString()
        } : msg
      );

      // Sync with Supabase immediately
      const deletedMessage = deletedMessages.find(m => m.id === action.messageId);
      supabaseService.updateChatMessage(action.messageId, deletedMessage)
        .then(() => {
          console.log('✅ Chat message deletion synced to Supabase:', action.messageId);
        })
        .catch(error => {
          console.error('❌ Chat message deletion sync failed:', error);
          window.location.reload();
        });

      return { ...state, chatMessages: deletedMessages };

    // Team member operations - Direct Supabase sync only
    case 'ADD_TEAM_MEMBER':
      if (!action.member?.name?.trim() || !action.member?.email?.trim()) {
        return { ...state, error: 'Team member name and email are required' };
      }

      const tempMember = {
        id: `temp_${Date.now()}`,
        name: action.member.name.trim(),
        email: action.member.email.trim(),
        role: action.member.role?.trim() || 'Member',
        avatar: action.member.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        status: action.member.status || 'online',
        created_at: new Date().toISOString()
      };

      // Add to Supabase immediately
      supabaseService.addTeamMember(tempMember)
        .then(serverMember => {
          console.log('✅ Team member added to Supabase:', serverMember.id);
          action.dispatch({
            type: 'REPLACE_TEMP_MEMBER',
            tempId: tempMember.id,
            serverMember
          });
        })
        .catch(error => {
          console.error('❌ Failed to add team member to Supabase:', error);
          action.dispatch({
            type: 'REMOVE_TEMP_MEMBER',
            tempId: tempMember.id
          });
          action.dispatch({
            type: 'SET_ERROR',
            payload: 'Failed to add team member. Please try again.'
          });
        });

      return { ...state, teamMembers: [tempMember, ...state.teamMembers] };

    case 'REPLACE_TEMP_MEMBER':
      return {
        ...state,
        teamMembers: state.teamMembers.map(member =>
          member.id === action.tempId ? action.serverMember : member
        )
      };

    case 'REMOVE_TEMP_MEMBER':
      return {
        ...state,
        teamMembers: state.teamMembers.filter(member => member.id !== action.tempId)
      };

    case 'UPDATE_TEAM_MEMBER':
      if (!action.memberId) {
        return { ...state, error: 'Member ID is required' };
      }

      // Optimistic update
      const updatedMembers = state.teamMembers.map(member =>
        member.id === action.memberId ? {
          ...member,
          ...action.updates,
          updated_at: new Date().toISOString()
        } : member
      );

      // Sync with Supabase immediately
      const updatedMember = updatedMembers.find(m => m.id === action.memberId);
      supabaseService.updateTeamMember(action.memberId, updatedMember)
        .then(() => {
          console.log('✅ Team member update synced to Supabase:', action.memberId);
        })
        .catch(error => {
          console.error('❌ Team member update sync failed:', error);
          window.location.reload();
        });

      return { ...state, teamMembers: updatedMembers };

    case 'REMOVE_TEAM_MEMBER':
      if (!action.memberId) {
        return { ...state, error: 'Member ID is required' };
      }

      // Optimistic update
      const filteredMembers = state.teamMembers.filter(member => member.id !== action.memberId);

      // Sync with Supabase immediately
      supabaseService.removeTeamMember(action.memberId)
        .then(() => {
          console.log('✅ Team member removal synced to Supabase:', action.memberId);
        })
        .catch(error => {
          console.error('❌ Team member removal sync failed:', error);
          window.location.reload();
        });

      return { ...state, teamMembers: filteredMembers };

    case 'SET_TYPING_USERS':
      return { ...state, typingUsers: action.users };

    case 'REFRESH_FROM_SUPABASE':
      // Reload all data from Supabase
      return { ...state, isLoading: true };

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
      console.log('❌ No user, resetting data...');
      dispatch({ type: 'RESET_DATA' });
      return;
    }

    console.log('✅ User authenticated, loading data from Supabase for:', user.email);
    loadUserDataFromSupabase();
  }, [user, authLoading]);

  // Handle auth errors
  useEffect(() => {
    if (authError) {
      dispatch({ type: 'SET_ERROR', payload: `Authentication Error: ${authError}` });
    }
  }, [authError]);

  const loadUserDataFromSupabase = async (retryCount = 0) => {
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
        return loadUserDataFromSupabase(retryCount + 1);
      }

      // Load all user data from Supabase only
      const dataPromises = [
        supabaseService.getTasks(),
        supabaseService.getContacts(),
        supabaseService.getTeamMembers(),
        supabaseService.getChatMessages()
      ];

      // Set overall timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Data loading timeout')), 15000)
      );

      const [tasks, contacts, teamMembers, chatMessages] = await Promise.race([
        Promise.all(dataPromises),
        timeoutPromise
      ]);

      console.log('📈 Data loaded successfully from Supabase:', {
        tasks: tasks.length,
        contacts: contacts.length,
        teamMembers: teamMembers.length,
        chatMessages: chatMessages.length
      });

      // Transform server data to match client format
      const userData = {
        tasks: tasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          status: task.status,
          assignee: task.assignee || '',
          dueDate: task.due_date || task.dueDate || '',
          comments: task.comments || []
        })),
        contacts: contacts.map(contact => ({
          id: contact.id,
          name: contact.name,
          email: contact.email,
          phone: contact.phone || '',
          company: contact.company || '',
          status: contact.status,
          notes: contact.notes || []
        })),
        teamMembers: teamMembers.map(member => ({
          id: member.id,
          name: member.name,
          email: member.email,
          role: member.role,
          avatar: member.avatar,
          status: member.status || 'online'
        })),
        chatMessages: chatMessages.map(msg => ({
          id: msg.id,
          author: msg.author,
          content: msg.content,
          timestamp: msg.created_at || msg.timestamp,
          edited: msg.edited || false,
          deleted: msg.deleted || false
        }))
      };

      dispatch({ type: 'INITIALIZE_DATA', payload: userData });
      dispatch({ type: 'UPDATE_SYNC_STATUS', success: true });
      console.log('✅ User data initialized successfully from Supabase');

    } catch (error) {
      console.error('❌ Failed to load user data from Supabase:', error);
      
      if (retryCount < maxRetries) {
        console.log(`🔄 Retrying data load (${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
        return loadUserDataFromSupabase(retryCount + 1);
      }

      dispatch({ type: 'SET_ERROR', payload: `Failed to load data: ${error.message}` });
    }
  };

  const refreshData = async () => {
    console.log('🔄 Manual data refresh requested - reloading from Supabase');
    dispatch({ type: 'CLEAR_ERROR' });
    await loadUserDataFromSupabase();
  };

  // Enhanced dispatch to pass dispatch function to actions for temp item handling
  const enhancedDispatch = (action) => {
    dispatch({ ...action, dispatch: enhancedDispatch });
  };

  const value = {
    state,
    dispatch: enhancedDispatch,
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