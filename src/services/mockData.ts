
// Types
export interface Company {
  id: string;
  name: string;
  industry: string;
  location: string;
  size: string;
  createdAt: string;
}

export interface Policy {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  status: 'Active' | 'Draft' | 'Archived';
  lastUpdated: string;
  createdAt: string;
  assignedTo: string[];
}

export interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: 'Completed' | 'Pending' | 'Overdue';
  priority: 'Low' | 'Medium' | 'High';
  category: string;
  assignedTo: string[];
  createdAt: string;
  lastUpdated: string;
}

export interface WhistleblowingReport {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  status: 'Pending' | 'Investigating' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High';
  isAnonymous: boolean;
  submittedBy?: string;
  notes?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  department: string;
  lastLogin: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'policy' | 'compliance' | 'whistleblowing' | 'system';
}

// Mock Data
export const mockCompany: Company = {
  id: '1',
  name: 'Acme Corp',
  industry: 'Technology',
  location: 'United States',
  size: '50-100',
  createdAt: '2023-01-15T10:30:00Z'
};
