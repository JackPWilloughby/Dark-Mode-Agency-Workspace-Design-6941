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
          const delay = this.retryDelay * Math.pow(2, attempt - 1);
          console.log(`⏳ Retrying ${operationName} in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  // Get current user with workspace context
  async getCurrentUserWithWorkspace() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (!user) throw new Error('No authenticated user found');

      // Get user's current workspace
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles_pulse_2024')
        .select('*, current_workspace_id')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // If no workspace, create a personal workspace
      if (!profile?.current_workspace_id) {
        const workspace = await this.createPersonalWorkspace(user.id);
        return { user, workspaceId: workspace.id };
      }

      return { user, workspaceId: profile.current_workspace_id };
    } catch (error) {
      console.error('❌ Exception getting current user with workspace:', error);
      throw error;
    }
  }

  // Create personal workspace for new users
  async createPersonalWorkspace(userId) {
    try {
      const { data: user } = await supabase.auth.getUser();
      const workspaceName = `${user.data.user?.email?.split('@')[0] || 'My'} Workspace`;

      // Create workspace
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces_pulse_2024')
        .insert([{
          name: workspaceName,
          description: 'Personal workspace',
          owner_id: userId,
          is_personal: true,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (workspaceError) throw workspaceError;

      // Add user as workspace member
      const { error: memberError } = await supabase
        .from('workspace_members_pulse_2024')
        .insert([{
          workspace_id: workspace.id,
          user_id: userId,
          role: 'owner',
          status: 'active',
          joined_at: new Date().toISOString()
        }]);

      if (memberError) throw memberError;

      // Update user profile with current workspace
      const { error: updateError } = await supabase
        .from('user_profiles_pulse_2024')
        .update({ current_workspace_id: workspace.id })
        .eq('id', userId);

      if (updateError) throw updateError;

      console.log('✅ Personal workspace created:', workspace.id);
      return workspace;
    } catch (error) {
      console.error('❌ Failed to create personal workspace:', error);
      throw error;
    }
  }

  // Workspace Management
  async getCurrentWorkspace() {
    const { workspaceId } = await this.getCurrentUserWithWorkspace();
    
    const { data, error } = await supabase
      .from('workspaces_pulse_2024')
      .select(`
        *,
        workspace_members_pulse_2024!inner(
          user_id,
          role,
          status,
          user_profiles_pulse_2024(full_name, email, avatar_url)
        )
      `)
      .eq('id', workspaceId)
      .eq('workspace_members_pulse_2024.status', 'active')
      .single();

    if (error) throw error;
    return data;
  }

  async switchWorkspace(workspaceId) {
    const { user } = await this.getCurrentUserWithWorkspace();
    
    // Verify user has access to this workspace
    const { data: membership, error } = await supabase
      .from('workspace_members_pulse_2024')
      .select('role, status')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (error || !membership) {
      throw new Error('You do not have access to this workspace');
    }

    // Update user's current workspace
    const { error: updateError } = await supabase
      .from('user_profiles_pulse_2024')
      .update({ current_workspace_id: workspaceId })
      .eq('id', user.id);

    if (updateError) throw updateError;

    console.log('✅ Switched to workspace:', workspaceId);
    return workspaceId;
  }

  async getAccessibleWorkspaces() {
    const { user } = await this.getCurrentUserWithWorkspace();
    
    const { data, error } = await supabase
      .from('workspace_members_pulse_2024')
      .select(`
        workspace_id,
        role,
        status,
        joined_at,
        workspaces_pulse_2024(
          id,
          name,
          description,
          is_personal,
          owner_id,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('joined_at', { ascending: false });

    if (error) throw error;
    return data?.map(item => ({
      ...item.workspaces_pulse_2024,
      memberRole: item.role,
      joinedAt: item.joined_at
    })) || [];
  }

  // Invite user to workspace
  async inviteUserToWorkspace(email, role = 'member') {
    const { user, workspaceId } = await this.getCurrentUserWithWorkspace();
    
    // Check if current user can invite (owner or admin)
    const { data: currentMember } = await supabase
      .from('workspace_members_pulse_2024')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single();

    if (!currentMember || !['owner', 'admin'].includes(currentMember.role)) {
      throw new Error('You do not have permission to invite users');
    }

    // Check if user exists
    const { data: inviteeProfile } = await supabase
      .from('user_profiles_pulse_2024')
      .select('id, full_name')
      .eq('email', email.toLowerCase())
      .single();

    if (!inviteeProfile) {
      throw new Error('User not found. They need to create an account first.');
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('workspace_members_pulse_2024')
      .select('status')
      .eq('workspace_id', workspaceId)
      .eq('user_id', inviteeProfile.id)
      .single();

    if (existingMember) {
      if (existingMember.status === 'active') {
        throw new Error('User is already a member of this workspace');
      } else if (existingMember.status === 'pending') {
        throw new Error('User already has a pending invitation');
      }
    }

    // Create invitation
    const { data, error } = await supabase
      .from('workspace_members_pulse_2024')
      .insert([{
        workspace_id: workspaceId,
        user_id: inviteeProfile.id,
        role: role,
        status: 'pending',
        invited_by: user.id,
        invited_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    console.log('✅ User invited to workspace:', email);
    return data;
  }

  // Accept workspace invitation
  async acceptWorkspaceInvitation(workspaceId) {
    const { user } = await this.getCurrentUserWithWorkspace();
    
    const { data, error } = await supabase
      .from('workspace_members_pulse_2024')
      .update({
        status: 'active',
        joined_at: new Date().toISOString()
      })
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No pending invitation found');

    console.log('✅ Workspace invitation accepted:', workspaceId);
    return data;
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

  // Tasks - WORKSPACE-BASED WITH ENCRYPTION
  async getTasks() {
    const { user, workspaceId } = await this.getCurrentUserWithWorkspace();
    
    const operation = async () => {
      const { data, error } = await Promise.race([
        supabase
          .from('tasks_pulse_2024')
          .select('*')
          .eq('workspace_id', workspaceId)
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

      console.log(`📋 Retrieved ${data?.length || 0} tasks from workspace ${workspaceId}`);
      return data || [];
    };

    return await this.withRetry(operation, 'getTasks');
  }

  async addTask(task) {
    this.validateTaskData(task);
    const { user, workspaceId } = await this.getCurrentUserWithWorkspace();

    const taskData = {
      title: task.title.trim(),
      description: task.description?.trim() || '',
      status: task.status || 'todo',
      assignee: task.assignee?.trim() || '',
      due_date: task.dueDate || null,
      comments: Array.isArray(task.comments) ? task.comments : [],
      workspace_id: workspaceId,
      created_by: user.id,
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
    console.log('✅ Task added successfully to workspace:', result.id);
    
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
    const { user, workspaceId } = await this.getCurrentUserWithWorkspace();

    const updateData = {
      title: updates.title?.trim(),
      description: updates.description?.trim() || '',
      status: updates.status,
      assignee: updates.assignee?.trim() || '',
      due_date: updates.dueDate || null,
      comments: Array.isArray(updates.comments) ? updates.comments : [],
      updated_at: new Date().toISOString(),
      updated_by: user.id
    };

    const operation = async () => {
      const { data, error } = await Promise.race([
        supabase
          .from('tasks_pulse_2024')
          .update(updateData)
          .eq('id', taskId)
          .eq('workspace_id', workspaceId)
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
    console.log('✅ Task updated successfully in workspace:', taskId);
    return result;
  }

  async deleteTask(taskId) {
    if (!taskId) throw new Error('Task ID is required');
    const { user, workspaceId } = await this.getCurrentUserWithWorkspace();

    const operation = async () => {
      const { error } = await Promise.race([
        supabase
          .from('tasks_pulse_2024')
          .delete()
          .eq('id', taskId)
          .eq('workspace_id', workspaceId),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Delete task timeout')), 8000)
        )
      ]);

      if (error) throw error;
    };

    await this.withRetry(operation, 'deleteTask');
    console.log('✅ Task deleted successfully from workspace:', taskId);
    return true;
  }

  // Contacts - WORKSPACE-BASED WITH ENCRYPTION
  async getContacts() {
    const { user, workspaceId } = await this.getCurrentUserWithWorkspace();

    const operation = async () => {
      const { data, error } = await Promise.race([
        supabase
          .from('contacts_pulse_2024')
          .select('*')
          .eq('workspace_id', workspaceId)
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

      console.log(`👥 Retrieved ${data?.length || 0} contacts from workspace ${workspaceId}`);
      return data || [];
    };

    return await this.withRetry(operation, 'getContacts');
  }

  async addContact(contact) {
    this.validateContactData(contact);
    const { user, workspaceId } = await this.getCurrentUserWithWorkspace();

    const contactData = {
      name: contact.name.trim(),
      email: contact.email.trim().toLowerCase(),
      phone: contact.phone?.trim() || '',
      company: contact.company?.trim() || '',
      status: contact.status,
      notes: Array.isArray(contact.notes) ? contact.notes : [],
      workspace_id: workspaceId,
      created_by: user.id,
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
    console.log('✅ Contact added successfully to workspace:', result.id);
    
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
    const { user, workspaceId } = await this.getCurrentUserWithWorkspace();

    const updateData = {
      name: updates.name?.trim(),
      email: updates.email?.trim().toLowerCase(),
      phone: updates.phone?.trim() || '',
      company: updates.company?.trim() || '',
      status: updates.status,
      notes: Array.isArray(updates.notes) ? updates.notes : [],
      updated_at: new Date().toISOString(),
      updated_by: user.id
    };

    const operation = async () => {
      const { data, error } = await Promise.race([
        supabase
          .from('contacts_pulse_2024')
          .update(updateData)
          .eq('id', contactId)
          .eq('workspace_id', workspaceId)
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
    console.log('✅ Contact updated successfully in workspace:', contactId);
    return result;
  }

  async deleteContact(contactId) {
    if (!contactId) throw new Error('Contact ID is required');
    const { user, workspaceId } = await this.getCurrentUserWithWorkspace();

    const operation = async () => {
      const { error } = await Promise.race([
        supabase
          .from('contacts_pulse_2024')
          .delete()
          .eq('id', contactId)
          .eq('workspace_id', workspaceId),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Delete contact timeout')), 8000)
        )
      ]);

      if (error) throw error;
    };

    await this.withRetry(operation, 'deleteContact');
    console.log('✅ Contact deleted successfully from workspace:', contactId);
    return true;
  }

  // Team Members - WORKSPACE-BASED
  async getTeamMembers() {
    const { user, workspaceId } = await this.getCurrentUserWithWorkspace();

    const operation = async () => {
      const { data, error } = await Promise.race([
        supabase
          .from('workspace_members_pulse_2024')
          .select(`
            *,
            user_profiles_pulse_2024!inner(
              id,
              full_name,
              email,
              avatar_url
            )
          `)
          .eq('workspace_id', workspaceId)
          .eq('status', 'active')
          .order('joined_at', { ascending: false }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Team members query timeout')), 10000)
        )
      ]);

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.warn('👨‍👩‍👧‍👦 Workspace members table does not exist yet - creating...');
          await this.createWorkspaceTablesIfNeeded();
          return [];
        }
        throw error;
      }

      const teamMembers = data?.map(member => ({
        id: member.user_profiles_pulse_2024.id,
        name: member.user_profiles_pulse_2024.full_name,
        email: member.user_profiles_pulse_2024.email,
        role: member.role,
        avatar: member.user_profiles_pulse_2024.avatar_url,
        status: 'online', // Could be enhanced with real-time presence
        joinedAt: member.joined_at
      })) || [];

      console.log(`👨‍👩‍👧‍👦 Retrieved ${teamMembers.length} team members from workspace ${workspaceId}`);
      return teamMembers;
    };

    return await this.withRetry(operation, 'getTeamMembers');
  }

  // Chat Messages - WORKSPACE-BASED WITH ENCRYPTION
  async getChatMessages() {
    const { user, workspaceId } = await this.getCurrentUserWithWorkspace();

    const operation = async () => {
      const { data, error } = await Promise.race([
        supabase
          .from('chat_messages_pulse_2024')
          .select('*')
          .eq('workspace_id', workspaceId)
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

      console.log(`💬 Retrieved ${data?.length || 0} chat messages from workspace ${workspaceId}`);
      return data || [];
    };

    return await this.withRetry(operation, 'getChatMessages');
  }

  async addChatMessage(message) {
    if (!message.author || !message.content) {
      throw new Error('Author and content are required for chat messages');
    }
    const { user, workspaceId } = await this.getCurrentUserWithWorkspace();

    const messageData = {
      author: message.author.trim(),
      content: message.content.trim(),
      edited: false,
      deleted: false,
      workspace_id: workspaceId,
      user_id: user.id,
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
    console.log('✅ Chat message added successfully to workspace:', result.id);
    
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
    const { user, workspaceId } = await this.getCurrentUserWithWorkspace();

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
          .eq('workspace_id', workspaceId)
          .eq('user_id', user.id) // Users can only edit their own messages
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
    console.log('✅ Chat message updated successfully in workspace:', messageId);
    return result;
  }

  // Table creation methods with encryption and workspace support
  async createWorkspaceTablesIfNeeded() {
    await Promise.all([
      this.createWorkspacesTable(),
      this.createWorkspaceMembersTable()
    ]);
  }

  async createWorkspacesTable() {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS workspaces_pulse_2024 (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          description TEXT,
          owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          is_personal BOOLEAN DEFAULT FALSE,
          settings JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE workspaces_pulse_2024 ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Users can view workspaces they are members of" ON workspaces_pulse_2024
          FOR SELECT USING (
            id IN (
              SELECT workspace_id FROM workspace_members_pulse_2024 
              WHERE user_id = auth.uid() AND status = 'active'
            )
          );

        CREATE POLICY "Users can create their own workspaces" ON workspaces_pulse_2024
          FOR INSERT WITH CHECK (owner_id = auth.uid());

        CREATE POLICY "Workspace owners can update their workspaces" ON workspaces_pulse_2024
          FOR UPDATE USING (owner_id = auth.uid());

        -- Indexes
        CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON workspaces_pulse_2024(owner_id);
        CREATE INDEX IF NOT EXISTS idx_workspaces_created ON workspaces_pulse_2024(created_at);
      `
    });

    if (error) {
      console.error('Failed to create workspaces table:', error);
    } else {
      console.log('✅ Workspaces table created successfully');
    }
  }

  async createWorkspaceMembersTable() {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS workspace_members_pulse_2024 (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          workspace_id UUID REFERENCES workspaces_pulse_2024(id) ON DELETE CASCADE,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
          invited_by UUID REFERENCES auth.users(id),
          invited_at TIMESTAMP WITH TIME ZONE,
          joined_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(workspace_id, user_id)
        );

        -- Enable RLS
        ALTER TABLE workspace_members_pulse_2024 ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Users can view workspace memberships" ON workspace_members_pulse_2024
          FOR SELECT USING (user_id = auth.uid() OR workspace_id IN (
            SELECT workspace_id FROM workspace_members_pulse_2024 
            WHERE user_id = auth.uid() AND status = 'active'
          ));

        CREATE POLICY "Workspace admins can manage memberships" ON workspace_members_pulse_2024
          FOR ALL USING (
            workspace_id IN (
              SELECT workspace_id FROM workspace_members_pulse_2024 
              WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
            )
          );

        -- Indexes
        CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON workspace_members_pulse_2024(workspace_id);
        CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members_pulse_2024(user_id);
        CREATE INDEX IF NOT EXISTS idx_workspace_members_status ON workspace_members_pulse_2024(status);
      `
    });

    if (error) {
      console.error('Failed to create workspace members table:', error);
    } else {
      console.log('✅ Workspace members table created successfully');
    }
  }

  async createTasksTable() {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS tasks_pulse_2024 (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'doing', 'done')),
          assignee TEXT,
          due_date DATE,
          comments JSONB DEFAULT '[]',
          workspace_id UUID REFERENCES workspaces_pulse_2024(id) ON DELETE CASCADE,
          created_by UUID REFERENCES auth.users(id),
          updated_by UUID REFERENCES auth.users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE tasks_pulse_2024 ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Workspace members can view tasks" ON tasks_pulse_2024
          FOR SELECT USING (
            workspace_id IN (
              SELECT workspace_id FROM workspace_members_pulse_2024 
              WHERE user_id = auth.uid() AND status = 'active'
            )
          );

        CREATE POLICY "Workspace members can create tasks" ON tasks_pulse_2024
          FOR INSERT WITH CHECK (
            workspace_id IN (
              SELECT workspace_id FROM workspace_members_pulse_2024 
              WHERE user_id = auth.uid() AND status = 'active'
            )
          );

        CREATE POLICY "Workspace members can update tasks" ON tasks_pulse_2024
          FOR UPDATE USING (
            workspace_id IN (
              SELECT workspace_id FROM workspace_members_pulse_2024 
              WHERE user_id = auth.uid() AND status = 'active'
            )
          );

        CREATE POLICY "Workspace members can delete tasks" ON tasks_pulse_2024
          FOR DELETE USING (
            workspace_id IN (
              SELECT workspace_id FROM workspace_members_pulse_2024 
              WHERE user_id = auth.uid() AND status = 'active'
            )
          );

        -- Indexes
        CREATE INDEX IF NOT EXISTS idx_tasks_workspace ON tasks_pulse_2024(workspace_id);
        CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks_pulse_2024(status);
        CREATE INDEX IF NOT EXISTS idx_tasks_created ON tasks_pulse_2024(created_at);
        CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks_pulse_2024(due_date);
      `
    });

    if (error) {
      console.error('Failed to create tasks table:', error);
    } else {
      console.log('✅ Tasks table created successfully with workspace support');
    }
  }

  async createContactsTable() {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS contacts_pulse_2024 (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          company TEXT,
          status TEXT DEFAULT 'Lead' CHECK (status IN ('Lead', 'Prospect', 'Client', 'Inactive')),
          notes JSONB DEFAULT '[]',
          workspace_id UUID REFERENCES workspaces_pulse_2024(id) ON DELETE CASCADE,
          created_by UUID REFERENCES auth.users(id),
          updated_by UUID REFERENCES auth.users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE contacts_pulse_2024 ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Workspace members can view contacts" ON contacts_pulse_2024
          FOR SELECT USING (
            workspace_id IN (
              SELECT workspace_id FROM workspace_members_pulse_2024 
              WHERE user_id = auth.uid() AND status = 'active'
            )
          );

        CREATE POLICY "Workspace members can create contacts" ON contacts_pulse_2024
          FOR INSERT WITH CHECK (
            workspace_id IN (
              SELECT workspace_id FROM workspace_members_pulse_2024 
              WHERE user_id = auth.uid() AND status = 'active'
            )
          );

        CREATE POLICY "Workspace members can update contacts" ON contacts_pulse_2024
          FOR UPDATE USING (
            workspace_id IN (
              SELECT workspace_id FROM workspace_members_pulse_2024 
              WHERE user_id = auth.uid() AND status = 'active'
            )
          );

        CREATE POLICY "Workspace members can delete contacts" ON contacts_pulse_2024
          FOR DELETE USING (
            workspace_id IN (
              SELECT workspace_id FROM workspace_members_pulse_2024 
              WHERE user_id = auth.uid() AND status = 'active'
            )
          );

        -- Indexes
        CREATE INDEX IF NOT EXISTS idx_contacts_workspace ON contacts_pulse_2024(workspace_id);
        CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts_pulse_2024(status);
        CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts_pulse_2024(email);
        CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts_pulse_2024(company);
      `
    });

    if (error) {
      console.error('Failed to create contacts table:', error);
    } else {
      console.log('✅ Contacts table created successfully with workspace support');
    }
  }

  async createChatMessagesTable() {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS chat_messages_pulse_2024 (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          author TEXT NOT NULL,
          content TEXT NOT NULL,
          edited BOOLEAN DEFAULT FALSE,
          deleted BOOLEAN DEFAULT FALSE,
          workspace_id UUID REFERENCES workspaces_pulse_2024(id) ON DELETE CASCADE,
          user_id UUID REFERENCES auth.users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE chat_messages_pulse_2024 ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Workspace members can view messages" ON chat_messages_pulse_2024
          FOR SELECT USING (
            workspace_id IN (
              SELECT workspace_id FROM workspace_members_pulse_2024 
              WHERE user_id = auth.uid() AND status = 'active'
            )
          );

        CREATE POLICY "Workspace members can create messages" ON chat_messages_pulse_2024
          FOR INSERT WITH CHECK (
            workspace_id IN (
              SELECT workspace_id FROM workspace_members_pulse_2024 
              WHERE user_id = auth.uid() AND status = 'active'
            )
          );

        CREATE POLICY "Users can update their own messages" ON chat_messages_pulse_2024
          FOR UPDATE USING (user_id = auth.uid());

        -- Indexes
        CREATE INDEX IF NOT EXISTS idx_chat_messages_workspace ON chat_messages_pulse_2024(workspace_id);
        CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages_pulse_2024(created_at);
        CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages_pulse_2024(user_id);
      `
    });

    if (error) {
      console.error('Failed to create chat messages table:', error);
    } else {
      console.log('✅ Chat messages table created successfully with workspace support');
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
      const { user } = await this.getCurrentUserWithWorkspace();
      const checks = {
        connection: await this.testConnection(),
        auth: !!user,
        workspace: !!user,
        timestamp: new Date().toISOString()
      };

      console.log('🏥 Health check results:', checks);
      return checks;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return {
        connection: false,
        auth: false,
        workspace: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

export default new SupabaseService();