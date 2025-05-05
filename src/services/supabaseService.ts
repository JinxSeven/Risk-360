import { supabase } from '@/integrations/supabase/client';
import {
  Policy,
  ComplianceRequirement,
  WhistleblowingReport,
  User,
  Notification,
  Company
} from './mockData';
import { isSupabaseConnected } from '@/integrations/supabase/client';
import { getMockData } from '@/lib/supabase';

// Helper function to determine if we should use mock data
const useMockData = async () => {
  const connected = await isSupabaseConnected();
  return !connected;
};

// User Profile
export const getUserProfile = async (userId?: string) => {
  // Check if we should use mock data
  if (await useMockData()) {
    return getMockData('user_profiles');
  }

  const user = userId || (await supabase.auth.getUser()).data.user?.id;
  
  if (!user) return null;
  
  try {
    // First get the user profile
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return null;
    }

    // Then get the user's email from auth
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Error fetching user email:', authError);
      return null;
    }

    // Combine the data
    return {
      ...profileData,
      email: authUser?.email
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Simplified functions for now, these will be implemented properly when tables exist
export const getAllUsers = async () => {
  try {
    // First get the current user's ID
    const { data: { user: currentUser }, error: currentUserError } = await supabase.auth.getUser();
    
    if (currentUserError) {
      console.error('Error getting current user:', currentUserError);
      return [];
    }

    // Then get all user profiles except the current user
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('*')
      .neq('user_id', currentUser?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    // For now, just return the profiles without emails
    return profiles.map(profile => ({
      id: profile.user_id,
      name: profile.name,
      email: '', // We'll add email support later
      role: profile.role,
      department: profile.department,
      lastLogin: profile.last_login || profile.created_at
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const updateUserProfile = async (userId: string, updates: {
  name?: string;
  department?: string;
  role?: string;
}) => {
  if (await useMockData()) {
    const mockUser = getMockData('user_profiles');
    return { ...mockUser, ...updates };
  }
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
};

// Policies
export const getPolicies = async () => {
  if (await useMockData()) {
    return getMockData('policies') || [];
  }
  
  try {
    console.log("Would fetch policies");
    return getMockData('policies') || [];
  } catch (error) {
    console.error('Error fetching policies:', error);
    return [];
  }
};

// Additional functions would follow the same pattern
// They will check if we should use mock data first
// Later they would be updated to use the real database tables
// For brevity, I'm not including all of them here

// Company information
export const getCompany = async () => {
  if (await useMockData()) {
    return getMockData('company');
  }
  
  try {
    console.log("Would fetch company");
    return getMockData('company');
  } catch (error) {
    console.error('Error fetching company:', error);
    return null;
  }
};

export const updateCompany = async (company: Company) => {
  if (await useMockData()) {
    const mockCompany = getMockData('company');
    return { ...mockCompany, ...company };
  }
  
  try {
    console.log("Would update company");
    return getMockData('company');
  } catch (error) {
    console.error('Error updating company:', error);
    return null;
  }
};

// Notifications
export const getNotifications = async () => {
  if (await useMockData()) {
    return getMockData('notifications') || [];
  }
  
  try {
    console.log("Would fetch notifications");
    return getMockData('notifications') || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const addNotification = async (notification: Omit<Notification, 'id' | 'date' | 'read'>) => {
  if (await useMockData()) {
    const mockNotification = getMockData('notifications');
    return { ...mockNotification, ...notification };
  }
  
  try {
    console.log("Would add notification");
    return getMockData('notifications');
  } catch (error) {
    console.error('Error adding notification:', error);
    return null;
  }
};

export const markNotificationAsRead = async (id: string) => {
  if (await useMockData()) {
    console.log("Would mark notification as read");
    return true;
  }
  
  try {
    console.log("Would mark notification as read");
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

export const markAllNotificationsAsRead = async () => {
  if (await useMockData()) {
    console.log("Would mark all notifications as read");
    return;
  }
  
  try {
    console.log("Would mark all notifications as read");
    return;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
};

// Compliance Requirements
export const getComplianceRequirements = async () => {
  if (await useMockData()) {
    return [];
  }

  try {
    console.log("Would fetch compliance requirements");
    return [];
  } catch (error) {
    console.error('Error fetching compliance requirements:', error);
    return [];
  }
};

// Whistleblowing Reports
export const getWhistleblowingReports = async () => {
    try {
        const { data, error } = await supabase
            .from('whistleblowing_reports')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching whistleblowing reports:', error);
        return [];
    }
};

export const createWhistleblowingReport = async (report: {
    title: string;
    description: string;
    category: string;
    priority: 'Low' | 'Medium' | 'High';
    isAnonymous: boolean;
}) => {
    try {
        console.log('Starting report submission...', { report });
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
            console.error('Error getting user:', userError);
            throw userError;
        }
        
        console.log('User authenticated:', { userId: user?.id });
        
        const reportData = {
            title: report.title,
            description: report.description,
            category: report.category,
            priority: report.priority,
            is_anonymous: report.isAnonymous,
            submitted_by: report.isAnonymous ? null : user?.id,
            status: 'Pending',
            created_at: new Date().toISOString()
        };
        
        console.log('Inserting report into database:', reportData);
        
        const { data, error } = await supabase
            .from('whistleblowing_reports')
            .insert([reportData])
            .select()
            .single();

        if (error) {
            console.error('Error creating whistleblowing report:', error);
            throw error;
        }

        console.log('Report successfully created:', data);
        return data;
    } catch (error) {
        console.error('Error in createWhistleblowingReport:', error);
        throw error;
    }
};

export const updateWhistleblowingReport = async (reportId: string, updates: Partial<WhistleblowingReport>) => {
    try {
        const { data, error } = await supabase
            .from('whistleblowing_reports')
            .update(updates)
            .eq('id', reportId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating whistleblowing report:', error);
        throw error;
    }
};

export const getPolicy = async (id: string) => {
  if (await useMockData()) {
    return getMockData('policies');
  }
  
  try {
    console.log("Would fetch policy");
    return getMockData('policies');
  } catch (error) {
    console.error('Error fetching policy:', error);
    return null;
  }
};

export const createPolicy = async (policy: Omit<Policy, 'id' | 'createdAt'>) => {
  if (await useMockData()) {
    return getMockData('policies');
  }
  
  try {
    console.log("Would create policy");
    return getMockData('policies');
  } catch (error) {
    console.error('Error creating policy:', error);
    return null;
  }
};
