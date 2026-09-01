export type UserRole =
  | 'student'
  | 'admin'
  | 'supervisor'
  | 'school_coordinator'
  | 'treasury'
  | 'system_admin';

export interface BasicProfile {
  studentId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  major: string;
  yearLevel: string;
  gpa: string;
  barangay: string;
  address: string;
  householdIncome: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  completedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  studentId?: string;
  student_id?: string;
  applicationId?: string;
  application_id?: string;
  application_code?: string;
  reference_id?: string;
  department?: string;
  major?: string;
  gpa?: number;
  financialAidYear?: string;
  financial_aid_year?: string;
  phone?: string;
  address?: string;
  barangay?: string;
  city?: string;
  province?: string;
  zipCode?: string;
  zip_code?: string;
  isPwd?: boolean;
  isSoloParent?: boolean;
  isIndigenous?: boolean;
  is4ps?: boolean;
  isKasambahayOrToda?: boolean;
  status?: string;
  hasCompletedBasicForm?: boolean;
  basicProfile?: BasicProfile;
}

export interface Scholarship {
  id: string;
  program_code?: string;
  title: string;
  short_title?: string;
  category_id?: string;
  category_title?: string;
  level?: string;
  badge?: string;
  summary?: string;
  tuition_grant?: string;
  stipend?: string;
  total_max?: string;
  amount: number;
  deadline: string;
  category: string;
  eligibility: string;
  slots: number;
  appliedCount?: number;
  applied_count?: number;
  description: string;
  status: string;
  qualifications?: string[];
  required_documents?: any[];
}

export interface Opportunity {
  id: string;
  title: string;
  provider_name: string;
  provider_logo?: string;
  provider_type: 'Corporation' | 'Government' | 'Foundation' | 'University';
  category: 'Scholarship' | 'Bursary' | 'Grant';
  funding_type?: string;
  eligibility_badge?: string;
  deadline?: string;
  external_url?: string;
  description?: string;
  amount?: number;
  location?: string;
  status: 'open' | 'closing_soon' | 'closed';
}

export interface Bursary {
  id: string;
  title: string;
  type: string;
  amount: number;
  deadline?: string;
  eligibility?: string;
  funds_available?: number;
  description?: string;
  requirement_notes?: string;
  status: string;
}

export type ApplicationStatus =
  | 'approved'
  | 'pending'
  | 'action_required'
  | 'rejected'
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Interview Scheduled'
  | 'Approved'
  | 'Rejected'
  | 'Paid'
  | 'Renewal Processing';

export interface Application {
  id: string;
  application_code?: string;
  user_id?: string | number;
  type?: string;
  scholarshipId?: string;
  scholarshipTitle?: string;
  program_id?: string;
  program_name?: string;
  reference_id?: string;
  title?: string;
  amount: number;
  status: ApplicationStatus;
  submissionDate?: string;
  submission_date?: string;
  disbursementDate?: string;
  disbursement_date?: string;
  progress?: number;
  requirementsCount?: number;
  requirements_count?: number;
  completedRequirements?: number;
  completed_requirements?: number;
  notes?: string;
  remarks?: string;
  form_data?: any;
  applicant_name?: string;
  applicant_email?: string;
  student_id?: string;
  documents_submitted?: any[];
  created_at?: string;
  updated_at?: string;
}

export interface VaultDocument {
  id: string;
  name: string;
  category: string;
  uploadDate: string;
  status: 'verified' | 'pending' | 'rejected';
  size: string;
  file_path?: string;
  expiryDate?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date?: string;
  created_at?: string;
  read?: boolean;
  is_read?: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
}
