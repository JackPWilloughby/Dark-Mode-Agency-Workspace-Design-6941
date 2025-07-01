import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    (set, get) => ({
      // UI State
      currentView: 'kanban',
      sidebarCollapsed: false,
      inspectorOpen: false,
      crmViewMode: 'list', // 'list' | 'kanban'
      searchQuery: '',
      localSearch: '',

      // Data
      tasks: [],
      contacts: [],
      messages: [],
      users: [],
      notes: [],
      
      // Selected items
      selectedTask: null,
      selectedContact: null,

      // UI Actions
      setCurrentView: (view) => set({ currentView: view }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setInspectorOpen: (open) => set({ inspectorOpen: open }),
      setCrmViewMode: (mode) => set({ crmViewMode: mode }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setLocalSearch: (search) => set({ localSearch: search }),

      // Selection Actions
      setSelectedTask: (task) => set({ selectedTask: task }),
      setSelectedContact: (contact) => set({ selectedContact: contact }),

      // Task Actions
      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, {
          ...task,
          id: Date.now().toString(),
          created_at: new Date().toISOString()
        }]
      })),
      
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(task => 
          task.id === id ? { ...task, ...updates } : task
        )
      })),
      
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(task => task.id !== id),
        selectedTask: state.selectedTask?.id === id ? null : state.selectedTask
      })),

      // Contact Actions
      addContact: (contact) => set((state) => ({
        contacts: [...state.contacts, {
          ...contact,
          id: Date.now().toString(),
          created_at: new Date().toISOString()
        }]
      })),
      
      updateContact: (id, updates) => set((state) => ({
        contacts: state.contacts.map(contact => 
          contact.id === id ? { ...contact, ...updates } : contact
        )
      })),
      
      deleteContact: (id) => set((state) => ({
        contacts: state.contacts.filter(contact => contact.id !== id),
        selectedContact: state.selectedContact?.id === id ? null : state.selectedContact
      })),

      // Message Actions
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, {
          ...message,
          id: Date.now().toString(),
          created_at: new Date().toISOString()
        }]
      })),

      // Note Actions
      addNote: (note) => set((state) => ({
        notes: [...state.notes, {
          ...note,
          id: Date.now().toString(),
          created_at: new Date().toISOString()
        }]
      })),
      
      updateNote: (id, updates) => set((state) => ({
        notes: state.notes.map(note => 
          note.id === id ? { ...note, ...updates } : note
        )
      })),

      // Initialize with sample data
      initializeData: () => set({
        tasks: [
          {
            id: '1',
            title: 'Design new landing page',
            description: 'Create mockups and wireframes for the new product landing page',
            status: 'todo',
            priority: 'high',
            assignee_id: 'user1',
            assignee_name: 'John Doe',
            due_date: '2024-01-25',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            title: 'Client presentation prep',
            description: 'Prepare slides for quarterly business review with Acme Corp',
            status: 'doing',
            priority: 'medium',
            assignee_id: 'user2',
            assignee_name: 'Jane Smith',
            due_date: '2024-01-20',
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '3',
            title: 'Update API documentation',
            description: 'Refresh the API docs with latest endpoints and examples',
            status: 'done',
            priority: 'low',
            assignee_id: 'user3',
            assignee_name: 'Bob Johnson',
            due_date: '2024-01-15',
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        
        contacts: [
          {
            id: '1',
            name: 'Sarah Wilson',
            email: 'sarah@acmecorp.com',
            phone: '+1 (555) 123-4567',
            company: 'Acme Corporation',
            status: 'client',
            assigned_to: 'John Doe',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            name: 'Michael Chen',
            email: 'mike@techstart.io',
            phone: '+1 (555) 987-6543',
            company: 'TechStart Inc',
            status: 'prospect',
            assigned_to: 'Jane Smith',
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '3',
            name: 'Emily Rodriguez',
            email: 'emily@innovate.com',
            phone: '+1 (555) 456-7890',
            company: 'Innovate Solutions',
            status: 'lead',
            assigned_to: 'Bob Johnson',
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        
        messages: [
          {
            id: '1',
            sender_id: 'user1',
            body: 'Great progress on the project everyone! 🎉 The client is really happy with what we\'ve delivered so far.',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            sender_id: 'user2',
            body: 'Thanks John! I\'ll have the presentation ready by tomorrow. Should we schedule a quick review session?',
            created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '3',
            sender_id: 'user3',
            body: 'API docs are now updated with all the latest changes. Check it out when you have a moment.',
            created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
          }
        ],
        
        users: [
          {
            id: 'user1',
            name: 'John Doe',
            email: 'john@pulsehq.com',
            role: 'owner'
          },
          {
            id: 'user2',
            name: 'Jane Smith',
            email: 'jane@pulsehq.com',
            role: 'admin'
          },
          {
            id: 'user3',
            name: 'Bob Johnson',
            email: 'bob@pulsehq.com',
            role: 'member'
          }
        ],
        
        notes: [
          {
            id: '1',
            task_id: '1',
            author_id: 'user1',
            body: 'Started working on the wireframes. Initial concepts look promising.',
            created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            contact_id: '1',
            author_id: 'user2',
            body: 'Had a great call with Sarah. She\'s interested in expanding the contract for Q2.',
            created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
          }
        ]
      })
    }),
    {
      name: 'pulsehq-storage',
      partialize: (state) => ({
        tasks: state.tasks,
        contacts: state.contacts,
        messages: state.messages,
        users: state.users,
        notes: state.notes,
        sidebarCollapsed: state.sidebarCollapsed,
        crmViewMode: state.crmViewMode,
        currentView: state.currentView
      })
    }
  )
)

export default useStore