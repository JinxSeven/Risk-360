import { supabase, isSupabaseConnected } from '@/integrations/supabase/client';

// Auth helper functions
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { data, error };
  } catch (error: any) {
    console.error("Authentication error:", error);
    return { 
      data: null, 
      error: { message: "Authentication failed. Please check your credentials and try again." } 
    };
  }
};

export const signUp = async (
  email: string, 
  password: string, 
  userData: { 
    name: string, 
    department: string, 
    role?: string 
  },
  adminCreated: boolean = false
) => {
  try {
    // Only allow sign up if admin is creating the account
    if (!adminCreated) {
      return { 
        data: null, 
        error: { message: "Direct registration is disabled. Please contact an administrator to create an account." } 
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          role: userData.role || 'employee'
        },
      },
    });
    
    if (!error && data.user) {
      // Create user profile with the correct role
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([
          {
            user_id: data.user.id,
            name: userData.name,
            role: userData.role || 'employee',
            department: userData.department
          }
        ]);

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        return { 
          data: null, 
          error: { message: "User created but failed to create profile. Please try again." } 
        };
      }
      
      return { data, error: null };
    }
    
    return { data, error };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { 
      data: null, 
      error: { message: error.message || "Registration failed. Please try again." } 
    };
  }
};

export const signOut = async () => {
  try {
    localStorage.removeItem('userRole');
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error("Sign out error:", error);
    return { error: null }; // Return success anyway since we cleared local storage
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
};

// Get user role from database
export const getUserRole = async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  
  // Check if we are in demo mode
  const connected = await isSupabaseConnected();
  if (!connected) {
    return localStorage.getItem('userRole') || 'admin'; // Default to admin in demo mode
  }
  
  try {
    // Get user profile from the database
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }

    return profile?.role || 'employee';
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

// Initialize user role in localStorage whenever a user logs in
export const initUserSession = async () => {
  const user = await getCurrentUser();
  if (!user) {
    localStorage.removeItem('userRole');
    return null;
  }
  
  // Check if we are in demo mode
  const connected = await isSupabaseConnected();
  if (!connected) {
    const demoRole = 'admin'; // Default to admin in demo mode
    localStorage.setItem('userRole', demoRole);
    return {
      role: demoRole,
      name: 'Demo User',
      department: 'IT'
    };
  }
  
  try {
    // Get user profile from the database
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    // Set the role in localStorage
    const role = profile?.role || 'employee';
    localStorage.setItem('userRole', role);
    
    return {
      role,
      name: profile?.name || user.user_metadata?.name || 'User',
      department: profile?.department || 'General'
    };
  } catch (error) {
    console.error('Error initializing user session:', error);
    return null;
  }
};

// Admin-only function to create a new user
export const adminCreateUser = async (
  email: string, 
  password: string, 
  userData: { 
    name: string, 
    department: string, 
    role: string 
  }
) => {
  // Check if the current user is an admin
  const userRole = await getUserRole();
  if (userRole !== 'admin') {
    return { 
      data: null, 
      error: { message: "Only administrators can create new users." } 
    };
  }

  // Create the user with the admin flag set to true
  return signUp(email, password, userData, true);
};

// Function to check if current user is admin
export const isUserAdmin = async (): Promise<boolean> => {
  const role = await getUserRole();
  return role === 'admin';
};

// Mock data functions - these will be used only when Supabase is not connected
type MockData = Record<string, any>;

// Function to get mock data based on table name
export const getMockData = (tableName: string): any => {
  const mockDataMap: MockData = {
    user_profiles: {
      user_id: 'mock-user-id',
      name: 'Demo User',
      department: 'IT',
      role: 'admin'
    },
    company: {
      id: 1,
      name: 'Demo Company',
      industry: 'Technology',
      location: 'San Francisco, CA',
      size: '50-100'
    },
    policies: [
      {
        id: 1,
        title: 'Privacy Policy',
        description: 'Company privacy guidelines',
        category: 'Legal',
        content: 'This is a mock privacy policy content.',
        status: 'active',
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        policy_assignments: []
      }
    ],
    notifications: [
      {
        id: 1,
        title: 'Welcome',
        message: 'Welcome to RISK 360',
        created_at: new Date().toISOString(),
        read: false,
        type: 'info'
      }
    ],
    whistleblowing_reports: [
      {
        id: '1',
        title: 'Workplace Safety Concern',
        description: 'There are safety hazards in the manufacturing area that need immediate attention.',
        category: 'Safety',
        date: new Date().toISOString(),
        status: 'Pending',
        priority: 'High',
        isAnonymous: true,
        notes: []
      },
      {
        id: '2',
        title: 'Financial Irregularity',
        description: 'Suspicious financial transactions in the accounting department.',
        category: 'Finance',
        date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        status: 'Investigating',
        priority: 'Medium',
        isAnonymous: false,
        notes: ['Initial investigation started']
      },
      {
        id: '3',
        title: 'Harassment Report',
        description: 'Employee reported experiencing workplace harassment.',
        category: 'HR',
        date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        status: 'Resolved',
        priority: 'High',
        isAnonymous: false,
        notes: ['Investigation completed', 'Appropriate action taken']
      }
    ]
  };
  
  return mockDataMap[tableName] || null;
};
