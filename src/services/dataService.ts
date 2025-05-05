
import {
  Company,
  Policy,
  ComplianceRequirement,
  WhistleblowingReport,
  User,
  Notification,
} from './mockData';

// Initialize mock data

// Company
export function getCompany(): Company {
  const company = localStorage.getItem('company');
  return company ? JSON.parse(company) : null;
}

export function updateCompany(company: Company): void {
  localStorage.setItem('company', JSON.stringify(company));
}

// Policies
export function getPolicies(): Policy[] {
  const policies = localStorage.getItem('policies');
  return policies ? JSON.parse(policies) : [];
}

export function getPolicy(id: string): Policy | null {
  const policies = getPolicies();
  return policies.find(policy => policy.id === id) || null;
}

export function createPolicy(policy: Omit<Policy, 'id' | 'createdAt'>): Policy {
  const policies = getPolicies();
  const newPolicy: Policy = {
    ...policy,
    id: `${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  
  policies.push(newPolicy);
  localStorage.setItem('policies', JSON.stringify(policies));
  
  // Add notification
  addNotification({
    title: 'New Policy',
    message: `${newPolicy.title} has been created.`,
    type: 'policy'
  });
  
  return newPolicy;
}

export function updatePolicy(id: string, updates: Partial<Policy>): Policy | null {
  const policies = getPolicies();
  const index = policies.findIndex(policy => policy.id === id);
  
  if (index === -1) return null;
  
  policies[index] = {
    ...policies[index],
    ...updates,
    lastUpdated: new Date().toISOString()
  };
  
  localStorage.setItem('policies', JSON.stringify(policies));
  
  // Add notification
  addNotification({
    title: 'Policy Updated',
    message: `${policies[index].title} has been updated.`,
    type: 'policy'
  });
  
  return policies[index];
}

export function deletePolicy(id: string): boolean {
  const policies = getPolicies();
  const filteredPolicies = policies.filter(policy => policy.id !== id);
  
  if (filteredPolicies.length === policies.length) return false;
  
  localStorage.setItem('policies', JSON.stringify(filteredPolicies));
  return true;
}

// Compliance Requirements
export function getComplianceRequirements(): ComplianceRequirement[] {
  const requirements = localStorage.getItem('complianceRequirements');
  return requirements ? JSON.parse(requirements) : [];
}

export function getComplianceRequirement(id: string): ComplianceRequirement | null {
  const requirements = getComplianceRequirements();
  return requirements.find(req => req.id === id) || null;
}

export function createComplianceRequirement(
  requirement: Omit<ComplianceRequirement, 'id' | 'createdAt' | 'lastUpdated'>
): ComplianceRequirement {
  const requirements = getComplianceRequirements();
  const now = new Date().toISOString();
  
  const newRequirement: ComplianceRequirement = {
    ...requirement,
    id: `${Date.now()}`,
    createdAt: now,
    lastUpdated: now,
  };
  
  requirements.push(newRequirement);
  localStorage.setItem('complianceRequirements', JSON.stringify(requirements));
  
  // Add notification
  addNotification({
    title: 'New Compliance Requirement',
    message: `${newRequirement.title} has been added.`,
    type: 'compliance'
  });
  
  return newRequirement;
}

export function updateComplianceRequirement(
  id: string, 
  updates: Partial<ComplianceRequirement>
): ComplianceRequirement | null {
  const requirements = getComplianceRequirements();
  const index = requirements.findIndex(req => req.id === id);
  
  if (index === -1) return null;
  
  requirements[index] = {
    ...requirements[index],
    ...updates,
    lastUpdated: new Date().toISOString()
  };
  
  localStorage.setItem('complianceRequirements', JSON.stringify(requirements));
  
  // Add notification for status changes
  if (updates.status) {
    addNotification({
      title: 'Compliance Status Updated',
      message: `${requirements[index].title} is now ${updates.status}.`,
      type: 'compliance'
    });
  }
  
  return requirements[index];
}

export function deleteComplianceRequirement(id: string): boolean {
  const requirements = getComplianceRequirements();
  const filteredRequirements = requirements.filter(req => req.id !== id);
  
  if (filteredRequirements.length === requirements.length) return false;
  
  localStorage.setItem('complianceRequirements', JSON.stringify(filteredRequirements));
  return true;
}

// Whistleblowing Reports
export function getWhistleblowingReports(): WhistleblowingReport[] {
  const reports = localStorage.getItem('whistleblowingReports');
  return reports ? JSON.parse(reports) : [];
}

export function getWhistleblowingReport(id: string): WhistleblowingReport | null {
  const reports = getWhistleblowingReports();
  return reports.find(report => report.id === id) || null;
}

export function createWhistleblowingReport(
  report: Omit<WhistleblowingReport, 'id' | 'date' | 'status' | 'notes'>
): WhistleblowingReport {
  const reports = getWhistleblowingReports();
  
  const newReport: WhistleblowingReport = {
    ...report,
    id: `${Date.now()}`,
    date: new Date().toISOString(),
    status: 'Pending',
    notes: [],
  };
  
  reports.push(newReport);
  localStorage.setItem('whistleblowingReports', JSON.stringify(reports));
  
  // Add notification for admin
  addNotification({
    title: 'New Whistleblowing Report',
    message: 'A new whistleblowing report has been submitted.',
    type: 'whistleblowing'
  });
  
  return newReport;
}

export function updateWhistleblowingReport(
  id: string, 
  updates: Partial<WhistleblowingReport>
): WhistleblowingReport | null {
  const reports = getWhistleblowingReports();
  const index = reports.findIndex(report => report.id === id);
  
  if (index === -1) return null;
  
  // Handle adding a new note
  if (updates.notes && updates.notes.length > 0) {
    const existingNotes = reports[index].notes || [];
    updates.notes = [...existingNotes, ...updates.notes];
  }
  
  reports[index] = {
    ...reports[index],
    ...updates,
  };
  
  localStorage.setItem('whistleblowingReports', JSON.stringify(reports));
  
  return reports[index];
}

export function deleteWhistleblowingReport(id: string): boolean {
  const reports = getWhistleblowingReports();
  const filteredReports = reports.filter(report => report.id !== id);
  
  if (filteredReports.length === reports.length) return false;
  
  localStorage.setItem('whistleblowingReports', JSON.stringify(filteredReports));
  return true;
}

// Users
export function getUsers(): User[] {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
}

export function getUser(id: string): User | null {
  const users = getUsers();
  return users.find(user => user.id === id) || null;
}

export function createUser(user: Omit<User, 'id' | 'lastLogin'>): User {
  const users = getUsers();
  
  const newUser: User = {
    ...user,
    id: `${Date.now()}`,
    lastLogin: new Date().toISOString(),
  };
  
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  
  return newUser;
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const users = getUsers();
  const index = users.findIndex(user => user.id === id);
  
  if (index === -1) return null;
  
  users[index] = {
    ...users[index],
    ...updates,
  };
  
  localStorage.setItem('users', JSON.stringify(users));
  
  return users[index];
}

export function deleteUser(id: string): boolean {
  const users = getUsers();
  const filteredUsers = users.filter(user => user.id !== id);
  
  if (filteredUsers.length === users.length) return false;
  
  localStorage.setItem('users', JSON.stringify(filteredUsers));
  return true;
}

// Notifications
export function getNotifications(): Notification[] {
  const notifications = localStorage.getItem('notifications');
  return notifications ? JSON.parse(notifications) : [];
}

export function addNotification(notification: Omit<Notification, 'id' | 'date' | 'read'>): Notification {
  const notifications = getNotifications();
  
  const newNotification: Notification = {
    ...notification,
    id: `${Date.now()}`,
    date: new Date().toISOString(),
    read: false,
  };
  
  notifications.unshift(newNotification); // Add at the beginning
  localStorage.setItem('notifications', JSON.stringify(notifications));
  
  return newNotification;
}

export function markNotificationAsRead(id: string): boolean {
  const notifications = getNotifications();
  const index = notifications.findIndex(notification => notification.id === id);
  
  if (index === -1) return false;
  
  notifications[index].read = true;
  localStorage.setItem('notifications', JSON.stringify(notifications));
  
  return true;
}

export function markAllNotificationsAsRead(): void {
  const notifications = getNotifications();
  
  const updatedNotifications = notifications.map(notification => ({
    ...notification,
    read: true,
  }));
  
  localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
}

export function deleteNotification(id: string): boolean {
  const notifications = getNotifications();
  const filteredNotifications = notifications.filter(notification => notification.id !== id);
  
  if (filteredNotifications.length === notifications.length) return false;
  
  localStorage.setItem('notifications', JSON.stringify(filteredNotifications));
  return true;
}

// User Authentication (mock)
export function login(email: string, password: string): User | null {
  const users = getUsers();
  const user = users.find(user => user.email.toLowerCase() === email.toLowerCase());
  
  if (!user) return null;
  
  // In a real app, we would verify the password here
  // For demo purposes, we'll just return the user
  
  // Update last login time
  updateUser(user.id, { lastLogin: new Date().toISOString() });
  
  // Store user role in localStorage
  localStorage.setItem('userRole', user.role);
  
  return user;
}

export function logout(): void {
  localStorage.removeItem('userRole');
}

export function getCurrentUserRole(): string {
  return localStorage.getItem('userRole') || '';
}

// Audit Trail (basic implementation)
interface AuditEntry {
  id: string;
  action: string;
  entityType: 'policy' | 'compliance' | 'user' | 'whistleblowing' | 'company';
  entityId: string;
  timestamp: string;
  userId: string;
}

export function addAuditEntry(entry: Omit<AuditEntry, 'id' | 'timestamp'>): void {
  const audit = localStorage.getItem('auditTrail') 
    ? JSON.parse(localStorage.getItem('auditTrail') || '[]') 
    : [];
  
  const newEntry: AuditEntry = {
    ...entry,
    id: `${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  
  audit.push(newEntry);
  localStorage.setItem('auditTrail', JSON.stringify(audit));
}

export function getAuditTrail(): AuditEntry[] {
  const audit = localStorage.getItem('auditTrail');
  return audit ? JSON.parse(audit) : [];
}
