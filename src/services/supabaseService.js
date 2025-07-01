import supabase from '../lib/supabase';

class SupabaseService {
  // Helper method to handle errors gracefully
  handleError(error, operation) {
    console.error(`❌ Error in ${operation}:`, error);
    throw error;
  }

  // Get current user ID safely
  async getCurrentUserId() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Tasks
  async getTasks() {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return [];

      const { data, error } = await supabase
        .from('tasks_pulse_2024')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('⚠️ Failed to get tasks:', error.message);
      return [];
    }
  }

  async addTask(task) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('No user ID');

      const taskData = {
        title: task.title,
        description: task.description || '',
        status: task.status || 'todo',
        assignee: task.assignee || '',
        due_date: task.dueDate || null,
        comments: task.comments || [],
        user_id: userId
      };

      const { data, error } = await supabase
        .from('tasks_pulse_2024')
        .insert([taskData])
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        status: data.status,
        assignee: data.assignee,
        dueDate: data.due_date,
        comments: data.comments || []
      };
    } catch (error) {
      this.handleError(error, 'addTask');
    }
  }

  async updateTask(taskId, updates) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('No user ID');

      const updateData = {
        title: updates.title,
        description: updates.description,
        status: updates.status,
        assignee: updates.assignee,
        due_date: updates.dueDate,
        comments: updates.comments,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('tasks_pulse_2024')
        .update(updateData)
        .eq('id', taskId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error, 'updateTask');
    }
  }

  async deleteTask(taskId) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('No user ID');

      const { error } = await supabase
        .from('tasks_pulse_2024')
        .delete()
        .eq('id', taskId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      this.handleError(error, 'deleteTask');
    }
  }

  // Contacts
  async getContacts() {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return [];

      const { data, error } = await supabase
        .from('contacts_pulse_2024')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('⚠️ Failed to get contacts:', error.message);
      return [];
    }
  }

  async addContact(contact) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('No user ID');

      const contactData = {
        name: contact.name,
        email: contact.email,
        phone: contact.phone || '',
        company: contact.company,
        status: contact.status,
        notes: contact.notes || [],
        user_id: userId
      };

      const { data, error } = await supabase
        .from('contacts_pulse_2024')
        .insert([contactData])
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        status: data.status,
        notes: data.notes || []
      };
    } catch (error) {
      this.handleError(error, 'addContact');
    }
  }

  async updateContact(contactId, updates) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('No user ID');

      const updateData = {
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
        company: updates.company,
        status: updates.status,
        notes: updates.notes,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('contacts_pulse_2024')
        .update(updateData)
        .eq('id', contactId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error, 'updateContact');
    }
  }

  async deleteContact(contactId) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('No user ID');

      const { error } = await supabase
        .from('contacts_pulse_2024')
        .delete()
        .eq('id', contactId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      this.handleError(error, 'deleteContact');
    }
  }

  // Team Members
  async getTeamMembers() {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return [];

      const { data, error } = await supabase
        .from('team_members_pulse_2024')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('⚠️ Failed to get team members:', error.message);
      return [];
    }
  }

  async addTeamMember(member) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('No user ID');

      const memberData = {
        name: member.name,
        email: member.email,
        role: member.role,
        avatar: member.avatar,
        status: member.status || 'online',
        user_id: userId
      };

      const { data, error } = await supabase
        .from('team_members_pulse_2024')
        .insert([memberData])
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: data.avatar,
        status: data.status
      };
    } catch (error) {
      this.handleError(error, 'addTeamMember');
    }
  }

  async updateTeamMember(memberId, updates) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('No user ID');

      const updateData = {
        name: updates.name,
        email: updates.email,
        role: updates.role,
        avatar: updates.avatar,
        status: updates.status,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('team_members_pulse_2024')
        .update(updateData)
        .eq('id', memberId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error, 'updateTeamMember');
    }
  }

  async removeTeamMember(memberId) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('No user ID');

      const { error } = await supabase
        .from('team_members_pulse_2024')
        .delete()
        .eq('id', memberId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      this.handleError(error, 'removeTeamMember');
    }
  }

  // Chat Messages
  async getChatMessages() {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return [];

      const { data, error } = await supabase
        .from('chat_messages_pulse_2024')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('⚠️ Failed to get chat messages:', error.message);
      return [];
    }
  }

  async addChatMessage(message) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('No user ID');

      const messageData = {
        author: message.author,
        content: message.content,
        edited: false,
        deleted: false,
        user_id: userId
      };

      const { data, error } = await supabase
        .from('chat_messages_pulse_2024')
        .insert([messageData])
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        author: data.author,
        content: data.content,
        timestamp: data.created_at,
        edited: data.edited,
        deleted: data.deleted
      };
    } catch (error) {
      this.handleError(error, 'addChatMessage');
    }
  }

  async updateChatMessage(messageId, updates) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('No user ID');

      const updateData = {
        content: updates.content,
        edited: updates.edited,
        deleted: updates.deleted,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('chat_messages_pulse_2024')
        .update(updateData)
        .eq('id', messageId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error, 'updateChatMessage');
    }
  }

  // Test connection with better error handling
  async testConnection() {
    try {
      console.log('🔍 Testing Supabase connection...');
      
      // Use a simple query that should work even with empty tables
      const { error } = await supabase
        .from('user_profiles_pulse_2024')
        .select('id')
        .limit(1);

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
}

export default new SupabaseService();