// frontend/src/api/integrations.ts
import api from './axios';

export interface QcCitizenRecord {
  qcitizen_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  full_name: string;
  birthdate: string;
  gender: string;
  civil_status: string;
  address: string;
  barangay: string;
  district: string;
  residency_years: number;
  is_qc_resident: boolean;
  is_registered_voter: boolean;
  precinct_number: string;
  voter_status: string;
  monthly_household_income: number;
  indigency_certified: boolean;
  issued_at: string;
  expires_at: string;
  verification_status: string;
  risk_level: string;
}

export interface QcVerificationResponse {
  success: boolean;
  verified: boolean;
  confidence_score: string;
  qc_id: string;
  resident: QcCitizenRecord;
  eligibility_checklist: {
    rule: string;
    passed: boolean;
    details: string;
  }[];
  security_audit: {
    timestamp: string;
    verified_by: string;
    certificate_hash: string;
    fraud_risk: string;
  };
}

export interface SchoolSyncStudentResponse {
  success: boolean;
  authenticated: boolean;
  timestamp: string;
  institution_gateway: string;
  student_record: {
    student_id: string;
    school_name: string;
    school_code: string;
    full_name: string;
    degree_program: string;
    year_level: string;
    current_term: string;
    enrollment_status: string;
    units_enrolled: number;
    gwa: number;
    academic_standing: string;
    good_moral_cleared: boolean;
    registrar_officer: string;
    statement_of_account: {
      tuition_fee: number;
      misc_fee: number;
      laboratory_fee: number;
      total_assessment: number;
      payments_applied: number;
      outstanding_balance: number;
      soa_reference: string;
    };
    enrolled_courses: {
      code: string;
      title: string;
      units: number;
      grade: string;
    }[];
  };
  verification_summary: {
    is_officially_enrolled: boolean;
    units_valid: boolean;
    gwa_threshold_met: boolean;
    good_moral_verified: boolean;
    clearance_token: string;
  };
}

export const getQcCitizenDirectory = (query?: string) => {
  return api.get<{ success: boolean; count: number; data: QcCitizenRecord[] }>('/qcid/directory', {
    params: { query },
  });
};

export const lookupQcCitizen = (idNumber: string) => {
  return api.get<{ success: boolean; data: QcCitizenRecord }>(`/qcid/lookup/${idNumber}`);
};

export const verifyQcCitizen = (payload: {
  qcitizen_id?: string;
  full_name?: string;
  barangay?: string;
  program_type?: string;
}) => {
  return api.post<QcVerificationResponse>('/qcid/verify', payload);
};

export const verifySchoolEnrollment = (schoolCode: string, studentId: string) => {
  return api.get<SchoolSyncStudentResponse>(`/schools-sync/verify/${schoolCode}/${studentId}`);
};

export const getSchoolSoa = (schoolCode: string, studentId: string) => {
  return api.get(`/schools-sync/soa/${schoolCode}/${studentId}`);
};

export const submitGrantRemittance = (payload: {
  student_id: string;
  student_name: string;
  school_code: string;
  amount: number;
  voucher_id?: string;
  program_name?: string;
}) => {
  return api.post('/schools-sync/remit', payload);
};
