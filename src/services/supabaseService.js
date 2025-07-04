import supabase from '../lib/supabase';

class SupabaseService {
  constructor() {
    this.retryCount = 3;
    this.retryDelay = 1000;
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
        return null;
      }
      
      if (!user) {
        console.warn('⚠️ No authenticated user found');
        return null;
      }
      
      return user.id;
    } catch (error) {
      console.error('❌ Exception getting current user:', error);
      return null;
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

  // Tasks with enhanced error handling
  async getTasks() {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        console.warn('⚠️ No user ID for getTasks');
        return [];
      }

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
            console.warn('📋 Tasks table does not exist yet');
            return [];
          }
          throw error;
        }

        console.log(`📋 Retrieved ${data?.length || 0} tasks`);
        return data || [];
      };

      return await this.withRetry(operation, 'getTasks');

    } catch (error) {
      this.handleError(error, 'getTasks', { userId: await this.getCurrentUserId() });
      return []; // Return empty array as fallback
    }
  }

  async addTask(task) {
    try {
      this.validateTaskData(task);
      
      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('No authenticated user');
      }

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
      
      console.log('✅ Task added successfully:', result.id);
      return {
        id: result.id,
        title: result.title,
        description: result.description,
        status: result.status,
        assignee: result.assignee,
        dueDate: result.due_date,
        comments: result.comments || []
      };

    } catch (error) {
      this.handleError(error, 'addTask', { task: task.title });
      return task; // Return original task as fallback
    }
  }

  async updateTask(taskId, updates) {
    try {
      if (!taskId) {
        throw new Error('Task ID is required');
      }

      this.validateTaskData(updates);
      
      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('No authenticated user');
      }

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
      
      console.log('✅ Task updated successfully:', taskId);
      return result;

    } catch (error) {
      this.handleError(error, 'updateTask', { taskId, updates });
      return updates; // Return updates as fallback
    }
  }

  async deleteTask(taskId) {
    try {
      if (!taskId) {
        throw new Error('Task ID is required');
      }
      
      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('No authenticated user');
      }

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
      
      console.log('✅ Task deleted successfully:', taskId);
      return true;

    } catch (error) {
      this.handleError(error, 'deleteTask', { taskId });
      return true; // Return true to allow local deletion
    }
  }

  // Contacts with enhanced error handling
  async getContacts() {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        console.warn('⚠️ No user ID for getContacts');
        return [];
      }

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
            console.warn('👥 Contacts table does not exist yet');
            return [];
          }
          throw error;
        }

        console.log(`👥 Retrieved ${data?.length || 0} contacts`);
        return data || [];
      };

      return await this.withRetry(operation, 'getContacts');

    } catch (error) {
      this.handleError(error, 'getContacts', { userId: await this.getCurrentUserId() });
      return [];
    }
  }

  async addContact(contact) {
    try {
      this.validateContactData(contact);
      
      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('No authenticated user');
      }

      const contactData = {
        name: contact.name.trim(),
        email: contact.email.trim().toLowerCase(),
        phone: contact.phone?.trim() || '',
        company: contact.company.trim(),
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
      
      console.log('✅ Contact added successfully:', result.id);
      return {
        id: result.id,
        name: result.name,
        email: result.email,
        phone: result.phone,
        company: result.company,
        status: result.status,
        notes: result.notes || []
      };

    } catch (error) {
      this.handleError(error, 'addContact', { contact: contact.name });
      return contact;
    }
  }

  async updateContact(contactId, updates) {
    try {
      if (!contactId) {
        throw new Error('Contact ID is required');
      }

      this.validateContactData(updates);
      
      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('No authenticated user');
      }

      const updateData = {
        name: updates.name.trim(),
        email: updates.email.trim().toLowerCase(),
        phone: updates.phone?.trim() || '',
        company: updates.company.trim(),
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
      
      console.log('✅ Contact updated successfully:', contactId);
      return result;

    } catch (error) {
      this.handleError(error, 'updateContact', { contactId, updates });
      return updates;
    }
  }

  async deleteContact(contactId) {
    try {
      if (!contactId) {
        throw new Error('Contact ID is required');
      }
      
      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('No authenticated user');
      }

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
      
      console.log('✅ Contact deleted successfully:', contactId);
      return true;

    } catch (error) {
      this.handleError(error, 'deleteContact', { contactId });
      return true;
    }
  }

  // Team Members
  async getTeamMembers() {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        console.warn('⚠️ No user ID for getTeamMembers');
        return [];
      }

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
            console.warn('👨‍👩‍👧‍👦 Team members table does not exist yet');
            return [];
          }
          throw error;
        }

        console.log(`👨‍👩‍👧‍👦 Retrieved ${data?.length || 0} team members`);
        return data || [];
      };

      return await this.withRetry(operation, 'getTeamMembers');

    } catch (error) {
      this.handleError(error, 'getTeamMembers', { userId: await this.getCurrentUserId() });
      return [];
    }
  }

  async addTeamMember(member) {
    try {
      if (!member.name || !member.email || !member.role) {
        throw new Error('Name, email, and role are required for team members');
      }
      
      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('No authenticated user');
      }

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
      
      console.log('✅ Team member added successfully:', result.id);
      return {
        id: result.id,
        name: result.name,
        email: result.email,
        role: result.role,
        avatar: result.avatar,
        status: result.status
      };

    } catch (error) {
      this.handleError(error, 'addTeamMember', { member: member.name });
      return member;
    }
  }

  async updateTeamMember(memberId, updates) {
    try {
      if (!memberId) {
        throw new Error('Member ID is required');
      }
      
      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('No authenticated user');
      }

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
      
      console.log('✅ Team member updated successfully:', memberId);
      return result;

    } catch (error) {
      this.handleError(error, 'updateTeamMember', { memberId, updates });
      return updates;
    }
  }

  async removeTeamMember(memberId) {
    try {
      if (!memberId) {
        throw new Error('Member ID is required');
      }
      
      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('No authenticated user');
      }

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
      
      console.log('✅ Team member removed successfully:', memberId);
      return true;

    } catch (error) {
      this.handleError(error, 'removeTeamMember', { memberId });
      return true;
    }
  }

  // Chat Messages
  async getChatMessages() {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        console.warn('⚠️ No user ID for getChatMessages');
        return [];
      }

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
            console.warn('💬 Chat messages table does not exist yet');
            return [];
          }
          throw error;
        }

        console.log(`💬 Retrieved ${data?.length || 0} chat messages`);
        return data || [];
      };

      return await this.withRetry(operation, 'getChatMessages');

    } catch (error) {
      this.handleError(error, 'getChatMessages', { userId: await this.getCurrentUserId() });
      return [];
    }
  }

  async addChatMessage(message) {
    try {
      if (!message.author || !message.content) {
        throw new Error('Author and content are required for chat messages');
      }
      
      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('No authenticated user');
      }

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
      
      console.log('✅ Chat message added successfully:', result.id);
      return {
        id: result.id,
        author: result.author,
        content: result.content,
        timestamp: result.created_at,
        edited: result.edited,
        deleted: result.deleted
      };

    } catch (error) {
      this.handleError(error, 'addChatMessage', { message: message.content });
      return message;
    }
  }

  async updateChatMessage(messageId, updates) {
    try {
      if (!messageId) {
        throw new Error('Message ID is required');
      }
      
      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('No authenticated user');
      }

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
      
      console.log('✅ Chat message updated successfully:', messageId);
      return result;

    } catch (error) {
      this.handleError(error, 'updateChatMessage', { messageId, updates });
      return updates;
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
      
      if (error) {
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