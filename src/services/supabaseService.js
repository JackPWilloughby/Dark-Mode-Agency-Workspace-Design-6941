import supabase from '../lib/supabase';

class SupabaseService {
  constructor() {
    this.retryCount = 3;
    this.retryDelay = 1000;
    
    // Test connection on initialization
    this.testConnection()
      .then(connected => {
        if (connected) {
          console.log('🟢 Supabase service initialized successfully');
        } else {
          console.warn('🟡 Supabase service initialized with connection issues');
        }
      })
      .catch(err => {
        console.error('🔴 Supabase service initialization failed:', err);
      });
  }

  // Enhanced error handling
  handleError(error, operation, context = {}) {
    console.error(`❌ Error in ${operation}:`, {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      context
    });

    // Return a standardized error
    return {
      message: error.message || `Failed to ${operation}`,
      code: error.code,
      operation,
      timestamp: new Date().toISOString()
    };
  }

  // Enhanced retry mechanism
  async withRetry(operation, operationName, maxRetries = this.retryCount) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempting ${operationName} (${attempt}/${maxRetries})`);
        const result = await operation();
        if (attempt > 1) {
          console.log(`✅ ${operationName} succeeded on attempt ${attempt}`);
        }
        return result;
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ ${operationName} failed on attempt ${attempt}:`, error.message);
        
        if (attempt < maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`⏳ Retrying ${operationName} in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  // Get current user ID with validation
  async getCurrentUserId() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('❌ Error getting current user:', error);
        throw error;
      }
      if (!user) {
        throw new Error('No authenticated user found');
      }
      return user.id;
    } catch (error) {
      console.error('❌ Exception getting current user:', error);
      throw error;
    }
  }

  // Enhanced data validation
  validateTaskData(task) {
    if (!task.title || typeof task.title !== 'string' || task.title.trim().length === 0) {
      throw new Error('Task title is required and must be a non-empty string');
    }
    if (task.status && !['todo', 'doing', 'done'].includes(task.status)) {
      throw new Error('Invalid task status. Must be: todo, doing, or done');
    }
    if (task.dueDate && isNaN(new Date(task.dueDate).getTime())) {
      throw new Error('Invalid due date format');
    }
    return true;
  }

  validateContactData(contact) {
    if (!contact.name || typeof contact.name !== 'string' || contact.name.trim().length === 0) {
      throw new Error('Contact name is required and must be a non-empty string');
    }
    if (!contact.email || typeof contact.email !== 'string' || !contact.email.includes('@')) {
      throw new Error('Valid email address is required');
    }
    if (contact.status && !['Lead', 'Prospect', 'Client', 'Inactive'].includes(contact.status)) {
      throw new Error('Invalid contact status');
    }
    return true;
  }

  // Tasks - SUPABASE ONLY
  async getTasks() {
    const userId = await this.getCurrentUserId();
    
    const operation = async () => {
      const { data, error } = await Promise.race([
        supabase
          .from('tasks_pulse_2024')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Tasks query timeout')), 10000)
        )
      ]);

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.warn('📋 Tasks table does not exist yet - creating...');
          await this.createTasksTable();
          return [];
        }
        throw error;
      }

      console.log(`📋 Retrieved ${data?.length || 0} tasks from Supabase`);
      return data || [];
    };

    return await this.withRetry(operation, 'getTasks');
  }

  async addTask(task) {
    this.validateTaskData(task);
    const userId = await this.getCurrentUserId();

    const taskData = {
      title: task.title.trim(),
      description: task.description?.trim() || '',
      status: task.status || 'todo',
      assignee: task.assignee?.trim() || '',
      due_date: task.dueDate || null,
      comments: Array.isArray(task.comments) ? task.comments : [],
      user_id: userId,
      created_at: new Date().toISOString()
    };

    const operation = async () => {
      const { data, error } = await Promise.race([
        supabase
          .from('tasks_pulse_2024')
          .insert([taskData])
          .select()
          .single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Add task timeout')), 8000)
        )
      ]);

      if (error) throw error;
      return data;
    };

    const result = await this.withRetry(operation, 'addTask');
    console.log('✅ Task added successfully to Supabase:', result.id);
    
    return {
      id: result.id,
      title: result.title,
      description: result.description,
      status: result.status,
      assignee: result.assignee,
      dueDate: result.due_date,
      comments: result.comments || []
    };
  }

  async updateTask(taskId, updates) {
    if (!taskId) throw new Error('Task ID is required');
    this.validateTaskData(updates);
    const userId = await this.getCurrentUserId();

    const updateData = {
      title: updates.title?.trim(),
      description: updates.description?.trim() || '',
      status: updates.status,
      assignee: updates.assignee?.trim() || '',
      due_date: updates.dueDate || null,
      comments: Array.isArray(updates.comments) ? updates.comments : [],
      updated_at: new Date().toISOString()
    };

    const operation = async () => {
      const { data, error } = await Promise.race([
        supabase
          .from('tasks_pulse_2024')
          .update(updateData)
          .eq('id', taskId)
          .eq('user_id', userId)
          .select()
          .single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Update task timeout')), 8000)
        )
      ]);

      if (error) throw error;
      return data;
    };

    const result = await this.withRetry(operation, 'updateTask');
    console.log('✅ Task updated successfully in Supabase:', taskId);
    return result;
  }

  async deleteTask(taskId) {
    if (!taskId) throw new Error('Task ID is required');
    const userId = await this.getCurrentUserId();

    const operation = async () => {
      const { error } = await Promise.race([
        supabase
          .from('tasks_pulse_2024')
          .delete()
          .eq('id', taskId)
          .eq('user_id', userId),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Delete task timeout')), 8000)
        )
      ]);

      if (error) throw error;
    };

    await this.withRetry(operation, 'deleteTask');
    console.log('✅ Task deleted successfully from Supabase:', taskId);
    return true;
  }

  // Contacts - SUPABASE ONLY
  async getContacts() {
    const userId = await this.getCurrentUserId();

    const operation = async () => {
      const { data, error } = await Promise.race([
        supabase
          .from('contacts_pulse_2024')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Contacts query timeout')), 10000)
        )
      ]);

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.warn('👥 Contacts table does not exist yet - creating...');
          await this.createContactsTable();
          return [];
        }
        throw error;
      }

      console.log(`👥 Retrieved ${data?.length || 0} contacts from Supabase`);
      return data || [];
    };

    return await this.withRetry(operation, 'getContacts');
  }

  async addContact(contact) {
    this.validateContactData(contact);
    const userId = await this.getCurrentUserId();

    const contactData = {
      name: contact.name.trim(),
      email: contact.email.trim().toLowerCase(),
      phone: contact.phone?.trim() || '',
      company: contact.company?.trim() || '',
      status: contact.status,
      notes: Array.isArray(contact.notes) ? contact.notes : [],
      user_id: userId,
      created_at: new Date().toISOString()
    };

    const operation = async () => {
      const { data, error } = await Promise.race([
        supabase
          .from('contacts_pulse_2024')
          .insert([contactData])
          .select()
          .single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Add contact timeout')), 8000)
        )
      ]);

      if (error) throw error;
      return data;
    };

    const result = await this.withRetry(operation, 'addContact');
    console.log('✅ Contact added successfully to Supabase:', result.id);
    
    return {
      id: result.id,
      name: result.name,
      email: result.email,
      phone: result.phone,
      company: result.company,
      status: result.status,
      notes: result.notes || []
    };
  }

  async updateContact(contactId, updates) {
    if (!contactId) throw new Error('Contact ID is required');
    this.validateContactData(updates);
    const userId = await this.getCurrentUserId();

    const updateData = {
      name: updates.name?.trim(),
      email: updates.email?.trim().toLowerCase(),
      phone: updates.phone?.trim() || '',
      company: updates.company?.trim() || '',
      status: updates.status,
      notes: Array.isArray(updates.notes) ? updates.notes : [],
      updated_at: new Date().toISOString()
    };

    const operation = async () => {
      const { data, error } = await Promise.race([
        supabase
          .from('contacts_pulse_2024')
          .update(updateData)
          .eq('id', contactId)
          .eq('user_id', userId)
          .select()
          .single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Update contact timeout')), 8000)
        )
      ]);

      if (error) throw error;
      return data;
    };

    const result = await this.withRetry(operation, 'updateContact');
    console.log('✅ Contact updated successfully in Supabase:', contactId);
    return result;
  }

  async deleteContact(contactId) {
    if (!contactId) throw new Error('Contact ID is required');
    const userId = await this.getCurrentUserId();

    const operation = async () => {
      const { error } = await Promise.race([
        supabase
          .from('contacts_pulse_2024')
          .delete()
          .eq('id', contactId)
          .eq('user_id', userId),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Delete contact timeout')), 8000)
        )
      ]);

      if (error) throw error;
    };

    await this.withRetry(operation, 'deleteContact');
    console.log('✅ Contact deleted successfully from Supabase:', contactId);
    return true;
  }

  // Team Members - SUPABASE ONLY
  async getTeamMembers() {
    const userId = await this.getCurrentUserId();

    const operation = async () => {
      const { data, error } = await Promise.race([
        supabase
          .from('team_members_pulse_2024')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Team members query timeout')), 10000)
        )
      ]);

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.warn('👨‍👩‍👧‍👦 Team members table does not exist yet - creating...');
          await this.createTeamMembersTable();
          return [];
        }
        throw error;
      }

      console.log(`👨‍👩‍👧‍👦 Retrieved ${data?.length || 0} team members from Supabase`);
      return data || [];
    };

    return await this.withRetry(operation, 'getTeamMembers');
  }

  async addTeamMember(member) {
    if (!member.name || !member.email || !member.role) {
      throw new Error('Name, email, and role are required for team members');
    }
    const userId = await this.getCurrentUserId();

    const memberData = {
      name: member.name.trim(),
      email: member.email.trim().toLowerCase(),
      role: member.role.trim(),
      avatar: member.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      status: member.status || 'online',
      user_id: userId,
      created_at: new Date().toISOString()
    };

    const operation = async () => {
      const { data, error } = await Promise.race([
        supabase
          .from('team_members_pulse_2024')
          .insert([memberData])
          .select()
          .single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Add team member timeout')), 8000)
        )
      ]);

      if (error) throw error;
      return data;
    };

    const result = await this.withRetry(operation, 'addTeamMember');
    console.log('✅ Team member added successfully to Supabase:', result.id);
    
    return {
      id: result.id,
      name: result.name,
      email: result.email,
      role: result.role,
      avatar: result.avatar,
      status: result.status
    };
  }

  async updateTeamMember(memberId, updates) {
    if (!memberId) throw new Error('Member ID is required');
    const userId = await this.getCurrentUserId();

    const updateData = {
      name: updates.name?.trim(),
      email: updates.email?.trim().toLowerCase(),
      role: updates.role?.trim(),
      avatar: updates.avatar,
      status: updates.status,
      updated_at: new Date().toISOString()
    };

    const operation = async () => {
      const { data, error } = await Promise.race([
        supabase
          .from('team_members_pulse_2024')
          .update(updateData)
          .eq('id', memberId)
          .eq('user_id', userId)
          .select()
          .single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Update team member timeout')), 8000)
        )
      ]);

      if (error) throw error;
      return data;
    };

    const result = await this.withRetry(operation, 'updateTeamMember');
    console.log('✅ Team member updated successfully in Supabase:', memberId);
    return result;
  }

  async removeTeamMember(memberId) {
    if (!memberId) throw new Error('Member ID is required');
    const userId = await this.getCurrentUserId();

    const operation = async () => {
      const { error } = await Promise.race([
        supabase
          .from('team_members_pulse_2024')
          .delete()
          .eq('id', memberId)
          .eq('user_id', userId),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Remove team member timeout')), 8000)
        )
      ]);

      if (error) throw error;
    };

    await this.withRetry(operation, 'removeTeamMember');
    console.log('✅ Team member removed successfully from Supabase:', memberId);
    return true;
  }

  // Chat Messages - SUPABASE ONLY
  async getChatMessages() {
    const userId = await this.getCurrentUserId();

    const operation = async () => {
      const { data, error } = await Promise.race([
        supabase
          .from('chat_messages_pulse_2024')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Chat messages query timeout')), 10000)
        )
      ]);

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.warn('💬 Chat messages table does not exist yet - creating...');
          await this.createChatMessagesTable();
          return [];
        }
        throw error;
      }

      console.log(`💬 Retrieved ${data?.length || 0} chat messages from Supabase`);
      return data || [];
    };

    return await this.withRetry(operation, 'getChatMessages');
  }

  async addChatMessage(message) {
    if (!message.author || !message.content) {
      throw new Error('Author and content are required for chat messages');
    }
    const userId = await this.getCurrentUserId();

    const messageData = {
      author: message.author.trim(),
      content: message.content.trim(),
      edited: false,
      deleted: false,
      user_id: userId,
      created_at: new Date().toISOString()
    };

    const operation = async () => {
      const { data, error } = await Promise.race([
        supabase
          .from('chat_messages_pulse_2024')
          .insert([messageData])
          .select()
          .single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Add chat message timeout')), 8000)
        )
      ]);

      if (error) throw error;
      return data;
    };

    const result = await this.withRetry(operation, 'addChatMessage');
    console.log('✅ Chat message added successfully to Supabase:', result.id);
    
    return {
      id: result.id,
      author: result.author,
      content: result.content,
      timestamp: result.created_at,
      edited: result.edited,
      deleted: result.deleted
    };
  }

  async updateChatMessage(messageId, updates) {
    if (!messageId) throw new Error('Message ID is required');
    const userId = await this.getCurrentUserId();

    const updateData = {
      content: updates.content?.trim(),
      edited: updates.edited,
      deleted: updates.deleted,
      updated_at: new Date().toISOString()
    };

    const operation = async () => {
      const { data, error } = await Promise.race([
        supabase
          .from('chat_messages_pulse_2024')
          .update(updateData)
          .eq('id', messageId)
          .eq('user_id', userId)
          .select()
          .single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Update chat message timeout')), 8000)
        )
      ]);

      if (error) throw error;
      return data;
    };

    const result = await this.withRetry(operation, 'updateChatMessage');
    console.log('✅ Chat message updated successfully in Supabase:', messageId);
    return result;
  }

  // Table creation methods
  async createTasksTable() {
    const { error } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'tasks_pulse_2024',
      table_sql: `
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'doing', 'done')),
        assignee TEXT,
        due_date DATE,
        comments JSONB DEFAULT '[]',
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      `
    });

    if (error) {
      console.error('Failed to create tasks table:', error);
    } else {
      console.log('✅ Tasks table created successfully');
    }
  }

  async createContactsTable() {
    const { error } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'contacts_pulse_2024',
      table_sql: `
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        company TEXT,
        status TEXT DEFAULT 'Lead' CHECK (status IN ('Lead', 'Prospect', 'Client', 'Inactive')),
        notes JSONB DEFAULT '[]',
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      `
    });

    if (error) {
      console.error('Failed to create contacts table:', error);
    } else {
      console.log('✅ Contacts table created successfully');
    }
  }

  async createTeamMembersTable() {
    const { error } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'team_members_pulse_2024',
      table_sql: `
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL,
        avatar TEXT,
        status TEXT DEFAULT 'online',
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      `
    });

    if (error) {
      console.error('Failed to create team members table:', error);
    } else {
      console.log('✅ Team members table created successfully');
    }
  }

  async createChatMessagesTable() {
    const { error } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'chat_messages_pulse_2024',
      table_sql: `
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        author TEXT NOT NULL,
        content TEXT NOT NULL,
        edited BOOLEAN DEFAULT FALSE,
        deleted BOOLEAN DEFAULT FALSE,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      `
    });

    if (error) {
      console.error('Failed to create chat messages table:', error);
    } else {
      console.log('✅ Chat messages table created successfully');
    }
  }

  // Connection and health checks
  async testConnection() {
    try {
      console.log('🔍 Testing Supabase connection...');
      const { error } = await Promise.race([
        supabase
          .from('user_profiles_pulse_2024')
          .select('id')
          .limit(1),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection test timeout')), 5000)
        )
      ]);

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Supabase connection test failed:', error);
        return false;
      }

      console.log('✅ Supabase connection successful');
      return true;
    } catch (error) {
      console.error('❌ Supabase connection test error:', error);
      return false;
    }
  }

  async healthCheck() {
    try {
      console.log('🏥 Running health check...');
      const checks = {
        connection: await this.testConnection(),
        auth: !!(await this.getCurrentUserId()),
        timestamp: new Date().toISOString()
      };

      console.log('🏥 Health check results:', checks);
      return checks;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return {
        connection: false,
        auth: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

export default new SupabaseService();