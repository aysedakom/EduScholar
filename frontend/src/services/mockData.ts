import type { User, Scholarship, Application, VaultDocument, AppNotification } from '../types';

export const MOCK_USERS: Record<string, User> = {
  student: {
    id: '8',
    name: 'Pia Marie T. Faner',
    email: 'piamariefaner2004@gmail.com',
    role: 'student',
    studentId: '23010366',
    department: 'Bestlink College of the Philippines (BCP)',
    major: 'B.S. Information Technology',
    gpa: 1.50,
    financialAidYear: '2026-2027',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    hasCompletedBasicForm: true,
  },
  admin: {
    id: '2',
    name: 'Hon. Roberto Cruz',
    email: 'support.edu2026@gmail.com',
    role: 'admin',
    department: 'QCYDO Scholarship Board',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    hasCompletedBasicForm: true,
  },
  supervisor: {
    id: '3',
    name: 'Elena Ramirez',
    email: 'supervisor@demo.edu',
    role: 'supervisor',
    department: 'Student Affairs & Academic Services',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    hasCompletedBasicForm: true,
  },
  school_coordinator: {
    id: '4',
    name: 'Dr. Aris Ramos',
    email: 'school@demo.edu',
    role: 'school_coordinator',
    department: 'Quezon City University (QCU)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    hasCompletedBasicForm: true,
  },
  treasury: {
    id: '5',
    name: 'Officer Del Rosario',
    email: 'treasury@demo.edu',
    role: 'treasury',
    department: 'QC Financial & Treasury Office',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
    hasCompletedBasicForm: true,
  },
  system_admin: {
    id: '6',
    name: 'Engr. Alex Mercado',
    email: 'sysadmin@demo.edu',
    role: 'system_admin',
    department: 'IT Development Department (ITDD)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    hasCompletedBasicForm: true,
  },
};

export const MOCK_SCHOLARSHIPS: Scholarship[] = [];
export const MOCK_APPLICATIONS: Application[] = [];
export const MOCK_DOCUMENTS: VaultDocument[] = [];
export const MOCK_NOTIFICATIONS: AppNotification[] = [];
