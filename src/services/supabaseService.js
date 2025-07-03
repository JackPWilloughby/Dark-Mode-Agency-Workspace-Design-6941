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

      if (error) {
        console.warn('Tasks table might not exist:', error.message);
        return [];
      }

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

      if (error) {
        console.warn('Failed to add task to database:', error.message);
        return task; // Return original task if DB fails
      }

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
      console.warn('Error adding task:', error.message);
      return task; // Return original task as fallback
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

      if (error) {
        console.warn('Failed to update task in database:', error.message);
        return updates;
      }

      return data;
    } catch (error) {
      console.warn('Error updating task:', error.message);
      return updates;
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

      if (error) {
        console.warn('Failed to delete task from database:', error.message);
      }

      return true;
    } catch (error) {
      console.warn('Error deleting task:', error.message);
      return true; // Return true to allow local deletion
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

      if (error) {
        console.warn('Contacts table might not exist:', error.message);
        return [];
      }

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

      if (error) {
        console.warn('Failed to add contact to database:', error.message);
        return contact;
      }

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
      console.warn('Error adding contact:', error.message);
      return contact;
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

      if (error) {
        console.warn('Failed to update contact in database:', error.message);
        return updates;
      }

      return data;
    } catch (error) {
      console.warn('Error updating contact:', error.message);
      return updates;
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

      if (error) {
        console.warn('Failed to delete contact from database:', error.message);
      }

      return true;
    } catch (error) {
      console.warn('Error deleting contact:', error.message);
      return true;
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

      if (error) {
        console.warn('Team members table might not exist:', error.message);
        return [];
      }

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

      if (error) {
        console.warn('Failed to add team member to database:', error.message);
        return member;
      }

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: data.avatar,
        status: data.status
      };
    } catch (error) {
      console.warn('Error adding team member:', error.message);
      return member;
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

      if (error) {
        console.warn('Failed to update team member in database:', error.message);
        return updates;
      }

      return data;
    } catch (error) {
      console.warn('Error updating team member:', error.message);
      return updates;
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

      if (error) {
        console.warn('Failed to remove team member from database:', error.message);
      }

      return true;
    } catch (error) {
      console.warn('Error removing team member:', error.message);
      return true;
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

      if (error) {
        console.warn('Chat messages table might not exist:', error.message);
        return [];
      }

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

      if (error) {
        console.warn('Failed to add chat message to database:', error.message);
        return message;
      }

      return {
        id: data.id,
        author: data.author,
        content: data.content,
        timestamp: data.created_at,
        edited: data.edited,
        deleted: data.deleted
      };
    } catch (error) {
      console.warn('Error adding chat message:', error.message);
      return message;
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

      if (error) {
        console.warn('Failed to update chat message in database:', error.message);
        return updates;
      }

      return data;
    } catch (error) {
      console.warn('Error updating chat message:', error.message);
      return updates;
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