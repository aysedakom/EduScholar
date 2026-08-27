import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  RefreshCw,
  Send,
  CheckCircle2,
  AlertCircle,
  Search,
  CreditCard,
  Wallet,
  Building2,
  ArrowLeft,
  Printer,
  Eye,
  Download,
  Users,
  GraduationCap,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { formatCurrency } from '../../utils/cn';
import { SendScholarshipNoticeModal, type NoticeRecipient } from '../../components/admin/SendScholarshipNoticeModal';
import { getScholars, updateScholarStatus } from '../../api/registry';

export interface PartnerSchoolInfo {
  schoolId: string;
  schoolName: string;
  schoolType: string;
  address: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  totalAidAllocated: number;
}

export interface StudentAidRecord {
  id: string;
  studentName: string;
  studentId: string;
  schoolId: string;
  schoolName: string;
  course: string;
  yearLevel: string;
  gpa: number;
  scholarshipTitle: string;
  lguCategory: 'Tertiary Grant' | 'STEM Merit' | 'Need-Based Aid' | 'Youth Leadership' | 'Medical Subsidy';
  amount: number;
  paymentMethod: 'GCash' | 'Bank Transfer' | 'Landbank' | 'Check';
  accountNumber: string;
  scheduledDate: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  failureReason?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export const PARTNER_SCHOOLS_LIST: PartnerSchoolInfo[] = [
  {
    schoolId: 'sch-qc-01',
    schoolName: 'Quezon City University (Main Campus)',
    schoolType: 'LGU State University',
    address: '673 Quirino Highway, San Bartolome, Novaliches, Quezon City',
    contactPerson: 'Dr. Remedios Mendoza',
    contactNumber: '(02) 8806-3000',
    email: 'registrar@qcu.edu.ph',
    totalAidAllocated: 3800000,
  },
  {
    schoolId: 'sch-qc-02',
    schoolName: 'Polytechnic University of the Philippines (QC Branch)',
    schoolType: 'State University',
    address: 'Don Fabian St., Commonwealth, Quezon City',
    contactPerson: 'Prof. Julian Cruz',
    contactNumber: '(02) 8936-7080',
    email: 'qc.branch@pup.edu.ph',
    totalAidAllocated: 2650000,
  },
  {
    schoolId: 'sch-qc-03',
    schoolName: 'Technological Institute of the Philippines (QC)',
    schoolType: 'Private HEI',
    address: '938 Aurora Blvd, Cubao, Quezon City',
    contactPerson: 'Engr. David Miller',
    contactNumber: '(02) 8911-0964',
    email: 'scholarships@tip.edu.ph',
    totalAidAllocated: 3500000,
  },
  {
    schoolId: 'sch-qc-04',
    schoolName: 'Far Eastern University (NRMF QC)',
    schoolType: 'Private Medical HEI',
    address: 'Regalado Ave, West Fairview, Quezon City',
    contactPerson: 'Dr. Clara Reyes',
    contactNumber: '(02) 8983-8000',
    email: 'aid@feu-nrmf.edu.ph',
    totalAidAllocated: 3000000,
  },
  {
    schoolId: 'sch-qc-05',
    schoolName: 'University of the Philippines Diliman',
    schoolType: 'National University',
    address: 'Diliman, Quezon City 1101 Metro Manila',
    contactPerson: 'Director Manuel Santos',
    contactNumber: '(02) 8981-8500',
    email: 'osg.upd@up.edu.ph',
    totalAidAllocated: 3875000,
  },
  {
    schoolId: 'sch-qc-06',
    schoolName: 'Trinity University of Asia',
    schoolType: 'Private University',
    address: 'Cathedral Heights, 275 E. Rodriguez Sr. Ave, New Manila, Quezon City',
    contactPerson: 'Ms. Katherine Lopez',
    contactNumber: '(02) 8702-2882',
    email: 'scholarships@tua.edu.ph',
    totalAidAllocated: 1900000,
  },
  {
    schoolId: 'sch-qc-07',
    schoolName: 'Ateneo de Manila University (QC)',
    schoolType: 'Private University',
    address: 'Katipunan Ave, Loyola Heights, Quezon City',
    contactPerson: 'Dr. Juan Carlos Ocampo',
    contactNumber: '(02) 8426-6001',
    email: 'scholarships.ls@ateneo.edu',
    totalAidAllocated: 4200000,
  },
  {
    schoolId: 'sch-qc-08',
    schoolName: 'National University (Fairview QC)',
    schoolType: 'Private HEI',
    address: 'SM City Fairview Complex, Quirino Hwy, QC',
    contactPerson: 'Dean Roberto Sanchez',
    contactNumber: '(02) 8442-7710',
    email: 'fairview.admissions@national-u.edu.ph',
    totalAidAllocated: 2100000,
  },
  {
    schoolId: 'sch-qc-09',
    schoolName: 'New Era University (Central QC)',
    schoolType: 'Private University',
    address: '9 Central Ave, New Era, Quezon City',
    contactPerson: 'Dr. Eduardo Morales',
    contactNumber: '(02) 8981-4221',
    email: 'scholarships@neu.edu.ph',
    totalAidAllocated: 2400000,
  },
  {
    schoolId: 'sch-qc-10',
    schoolName: 'Miriam College (Loyola Heights QC)',
    schoolType: 'Private College',
    address: 'Katipunan Ave, Loyola Heights, Quezon City',
    contactPerson: 'Prof. Teresa Guingona',
    contactNumber: '(02) 8930-0280',
    email: 'financialaid@mc.edu.ph',
    totalAidAllocated: 1850000,
  },
  {
    schoolId: 'sch-qc-11',
    schoolName: 'World Citi Colleges (Anonas QC)',
    schoolType: 'Private Medical HEI',
    address: '960 Aurora Blvd, Cubao, Quezon City',
    contactPerson: 'Dr. Ronald Del Rosario',
    contactNumber: '(02) 8913-8380',
    email: 'scholarships@worldciti.edu.ph',
    totalAidAllocated: 1750000,
  },
  {
    schoolId: 'sch-qc-12',
    schoolName: "St. Luke's Medical Center College of Medicine",
    schoolType: 'Private Medical HEI',
    address: 'Sta. Ignacia St, Cathedral Heights, Quezon City',
    contactPerson: 'Dr. Bernadette Valenzuela',
    contactNumber: '(02) 8723-0101',
    email: 'medschool@stlukes.edu.ph',
    totalAidAllocated: 3200000,
  },
];

export const INITIAL_STUDENT_AID_RECORDS: StudentAidRecord[] = [];

export const SchoolAidDistributionPage: React.FC = () => {
  const [disbursements, setDisbursements] = useState<StudentAidRecord[]>(INITIAL_STUDENT_AID_RECORDS);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Completed' | 'Failed'>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  
  // Modals
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchDate, setBatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewingStudent, setViewingStudent] = useState<StudentAidRecord | null>(null);

  // Send System Scholarship Notice State
  const [noticeRecipient, setNoticeRecipient] = useState<NoticeRecipient | null>(null);
  const [showNoticeModal, setShowNoticeModal] = useState(false);

  // Sync active submitted student application from LocalStorage ONLY IF OFFICIALLY APPROVED
  useEffect(() => {
    try {
      const activeAppRaw = localStorage.getItem('qc_active_student_application');
      if (activeAppRaw) {
        const activeApp = JSON.parse(activeAppRaw);
        if (activeApp.school && (activeApp.status === 'Approved' || activeApp.status === 'Paid')) {
          const matchingSchool = PARTNER_SCHOOLS_LIST.find(
            (s) => s.schoolName.toLowerCase().includes(activeApp.school.toLowerCase()) || activeApp.school.toLowerCase().includes(s.schoolName.toLowerCase())
          ) || PARTNER_SCHOOLS_LIST[0];

          const dynamicRecord: StudentAidRecord = {
            id: `DISB-LIVE-${activeApp.id || '8820'}`,
            studentName: activeApp.applicantName || 'Student Applicant',
            studentId: activeApp.studentId || '2026-884920',
            schoolId: matchingSchool.schoolId,
            schoolName: matchingSchool.schoolName,
            course: activeApp.course || activeApp.program_name || 'BS Information Technology',
            yearLevel: '1st Year',
            gpa: parseFloat(activeApp.gpa) || 3.85,
            scholarshipTitle: activeApp.scholarshipTitle || 'Quezon City Tertiary Scholarship Program',
            lguCategory: 'Need-Based Aid',
            amount: activeApp.amount || 10000,
            paymentMethod: 'GCash',
            accountNumber: activeApp.mobile || '0917-882-9901',
            scheduledDate: new Date().toISOString().split('T')[0],
            status: activeApp.status === 'Approved' ? 'Pending' : 'Completed',
            contactEmail: activeApp.email || 'student@university.edu',
            contactPhone: activeApp.mobile || '0917-882-9901',
          };

          setDisbursements((prev) => {
            const exists = prev.some((d) => d.id === dynamicRecord.id || d.studentId === dynamicRecord.studentId);
            if (!exists) {
              return [dynamicRecord, ...prev];
            }
            return prev;
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadDisbursementsFromDb = async () => {
    try {
      const res = await getScholars();
      const scholars = Array.isArray(res.data) ? res.data : [];

      const mapped: StudentAidRecord[] = scholars.map((s) => {
        let lguCategory: 'Tertiary Grant' | 'STEM Merit' | 'Need-Based Aid' | 'Youth Leadership' | 'Medical Subsidy' =
          'Tertiary Grant';
        const progId = String(s.program_id || '').toLowerCase();
        if (progId.includes('academic')) {
          lguCategory = 'Tertiary Grant';
        } else if (progId.includes('excel') || progId.includes('specialized')) {
          lguCategory = 'STEM Merit';
        } else if (progId.includes('economic')) {
          lguCategory = 'Need-Based Aid';
        } else if (progId.includes('youth') || progId.includes('leader')) {
          lguCategory = 'Youth Leadership';
        } else if (progId.includes('medical') || progId.includes('health') || progId.includes('fellowship')) {
          lguCategory = 'Medical Subsidy';
        }

        let status: 'Pending' | 'Processing' | 'Completed' | 'Failed' = 'Pending';
        if (s.disbursement_status === 'Disbursed') {
          status = 'Completed';
        } else if (s.disbursement_status === 'Processing') {
          status = 'Processing';
        } else if (s.disbursement_status === 'Scheduled') {
          status = 'Pending';
        } else if (s.disbursement_status === 'On-Hold' || s.disbursement_status === 'Failed') {
          status = 'Failed';
        }

        const matchedSchool =
          PARTNER_SCHOOLS_LIST.find(
            (ps) =>
              ps.schoolName.toLowerCase().includes(s.school.toLowerCase()) ||
              s.school.toLowerCase().includes(ps.schoolName.toLowerCase())
          ) || PARTNER_SCHOOLS_LIST[0];

        return {
          id: `DISB-${s.student_id}`,
          studentName: s.full_name,
          studentId: s.student_id,
          schoolId: matchedSchool.schoolId,
          schoolName: s.school,
          course: s.program_name,
          yearLevel: s.scholarship_age.includes('Year 2')
            ? '2nd Year'
            : s.scholarship_age.includes('Year 3')
            ? '3rd Year'
            : s.scholarship_age.includes('Year 4')
            ? '4th Year'
            : '1st Year',
          gpa: Number(s.gwa) || 1.75,
          scholarshipTitle: s.program_name,
          lguCategory,
          amount: s.grant_amount || 10000,
          paymentMethod: 'GCash' as const,
          accountNumber: '0917-882-9901',
          scheduledDate: '2026-08-01',
          status,
          contactEmail: s.email,
          contactPhone: '0917-882-9901',
        };
      });

      setDisbursements((prev) => {
        const liveApp = prev.filter((d) => d.id.includes('DISB-LIVE'));
        const dbWithoutLive = mapped.filter((m) => !liveApp.some((la) => la.studentId === m.studentId));
        return [...liveApp, ...dbWithoutLive];
      });
    } catch (err) {
      console.error('Failed to load disbursements from registry:', err);
    }
  };

  useEffect(() => {
    loadDisbursementsFromDb();
  }, []);

  const selectedSchoolInfo = PARTNER_SCHOOLS_LIST.find((s) => s.schoolId === selectedSchoolId);

  // Filtered dataset
  const filteredDisbursements = disbursements.filter((item) => {
    // School Filter
    if (selectedSchoolId && item.schoolId !== selectedSchoolId) {
      return false;
    }

    const matchesSearch =
      item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.scholarshipTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.schoolName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCourse = courseFilter === 'all' || item.course === courseFilter;

    return matchesSearch && matchesStatus && matchesCourse;
  });

  // Calculate statistics
  const currentScopeDisbursements = selectedSchoolId
    ? disbursements.filter((d) => d.schoolId === selectedSchoolId)
    : disbursements;

  const totalScopePending = currentScopeDisbursements.filter((d) => d.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);
  const totalScopeCompleted = currentScopeDisbursements.filter((d) => d.status === 'Completed').reduce((acc, curr) => acc + curr.amount, 0);
  const totalScopeFailedCount = currentScopeDisbursements.filter((d) => d.status === 'Failed').length;
  const totalScopeApprovedAid = currentScopeDisbursements.reduce((acc, curr) => acc + curr.amount, 0);

  const handleRetryPayment = async (id: string) => {
    const studentId = id.replace('DISB-', '').replace('LIVE-', '');
    try {
      const res = await getScholars();
      const dbRecord = (res.data || []).find((s) => s.student_id === studentId);
      if (dbRecord) {
        await updateScholarStatus(dbRecord.id, dbRecord.status, 'Processing');
        toast.success(`Payout re-queued in database for ${dbRecord.full_name}!`);
      }
    } catch (err) {
      console.error(err);
    }
    setDisbursements((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'Pending', failureReason: undefined } : d))
    );
  };

  const handleSingleRelease = async (id: string) => {
    const studentId = id.replace('DISB-', '').replace('LIVE-', '');
    try {
      const res = await getScholars();
      const dbRecord = (res.data || []).find((s) => s.student_id === studentId);
      if (dbRecord) {
        await updateScholarStatus(dbRecord.id, dbRecord.status, 'Disbursed');
        toast.success(`Aid release processed in database for ${dbRecord.full_name}!`);
      }
    } catch (err) {
      console.error(err);
    }
    setDisbursements((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'Completed', scheduledDate: new Date().toISOString().split('T')[0], failureReason: undefined } : d))
    );
  };

  const handleExecuteBatch = async () => {
    try {
      const res = await getScholars();
      const dbScholars = res.data || [];
      const targetSchool = selectedSchoolInfo ? selectedSchoolInfo.schoolName : null;
      
      let count = 0;
      for (const s of dbScholars) {
        const isPending = s.disbursement_status !== 'Disbursed';
        const matchesSchool = !targetSchool || s.school.toLowerCase().includes(targetSchool.toLowerCase()) || targetSchool.toLowerCase().includes(s.school.toLowerCase());
        
        if (isPending && matchesSchool) {
          await updateScholarStatus(s.id, s.status, 'Disbursed');
          count++;
        }
      }
      toast.success(`Executed batch payout for ${count} scholars in database!`);
    } catch (err) {
      console.error(err);
    }

    if (selectedSchoolId) {
      setDisbursements((prev) =>
        prev.map((d) =>
          d.schoolId === selectedSchoolId && d.status === 'Pending'
            ? { ...d, status: 'Completed', scheduledDate: batchDate }
            : d
        )
      );
      setShowBatchModal(false);
    } else {
      setDisbursements((prev) =>
        prev.map((d) => (d.status === 'Pending' ? { ...d, status: 'Completed', scheduledDate: batchDate } : d))
      );
      setShowBatchModal(false);
    }
  };

  const handleExportCSV = () => {
    const scopeName = selectedSchoolInfo ? selectedSchoolInfo.schoolName : 'All_Partner_Schools';
    toast.success(`Exporting LGU Scholar Aid Masterlist for ${scopeName}...`);
    const headers = 'Payout ID,Student ID,Student Name,Partner School,Degree Program,Year Level,GWA,LGU Scholarship Program,Aid Amount (PHP),Payment Method,Account Number,Scheduled Date,Status\n';
    const rows = filteredDisbursements
      .map(
        (s) =>
          `"${s.id}","${s.studentId}","${s.studentName}","${s.schoolName}","${s.course}","${s.yearLevel}",${s.gpa},"${s.scholarshipTitle}",${s.amount},"${s.paymentMethod}","${s.accountNumber}","${s.scheduledDate}","${s.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${scopeName.replace(/[^a-zA-Z0-9]/g, '_')}_LGU_Aid_Roster.csv`;
    link.click();
  };

  const handlePrintVoucher = (student: StudentAidRecord) => {
    toast.info(`Generating official disbursement voucher for ${student.studentName}...`);
    window.print();
  };

  // Unique courses for filter
  const availableCourses = Array.from(new Set(currentScopeDisbursements.map((d) => d.course)));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          {selectedSchoolInfo ? (
            <div className="space-y-1">
              <button
                onClick={() => {
                  setSelectedSchoolId(null);
                  setSearchQuery('');
                  setStatusFilter('all');
                  setCourseFilter('all');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer mb-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to All Partner Schools Overview</span>
              </button>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
                  {selectedSchoolInfo.schoolName}
                </h1>
                <Badge variant="primary">{selectedSchoolInfo.schoolType}</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Exclusive Enrolled LGU Scholarship Applicants & Aid Disbursement Roster
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
                  School Aid Distribution
                </h1>
                <Badge variant="primary">LGU Disbursement Desk</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Electronic aid disbursements and exclusive student rosters for Quezon City accredited partner institutions.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="h-4 w-4 text-slate-600" />}
            className="font-bold text-xs"
          >
            Export Aid Masterlist
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowBatchModal(true)}
            leftIcon={<Send className="h-4 w-4" />}
            className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md text-xs"
          >
            {selectedSchoolInfo
              ? `Disburse ${selectedSchoolInfo.schoolName.split(' ')[0]} Batch (${formatCurrency(totalScopePending)})`
              : `Execute All Batch Payouts (${formatCurrency(totalScopePending)})`}
          </Button>
        </div>
      </div>

      {/* Partner School Database Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Partner School Database Filter
            </span>
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
              {selectedSchoolInfo ? selectedSchoolInfo.schoolName : 'All Accredited Partner Institutions (City-Wide)'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative min-w-[280px] sm:min-w-[340px]">
            <select
              id="school-database-select"
              value={selectedSchoolId || 'all'}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedSchoolId(val === 'all' ? null : val);
                setSearchQuery('');
                setStatusFilter('all');
                setCourseFilter('all');
              }}
              className="w-full h-10 pl-3.5 pr-9 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-xs appearance-none"
            >
              <option value="all">🏛️ All Partner Schools (City-Wide Database)</option>
              <optgroup label="Accredited Partner Universities & Colleges">
                {PARTNER_SCHOOLS_LIST.map((s) => {
                  const count = disbursements.filter((d) => d.schoolId === s.schoolId).length;
                  return (
                    <option key={s.schoolId} value={s.schoolId}>
                      {s.schoolName} ({count} LGU Scholars)
                    </option>
                  );
                })}
              </optgroup>
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          {selectedSchoolId && (
            <button
              onClick={() => setSelectedSchoolId(null)}
              className="h-10 px-3 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              Show All
            </button>
          )}
        </div>
      </div>

      {/* Selected School Banner Details */}
      {selectedSchoolInfo && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
            <span className="truncate"><strong>Campus:</strong> {selectedSchoolInfo.address}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Users className="h-4 w-4 text-blue-600 shrink-0" />
            <span className="truncate"><strong>Coordinator:</strong> {selectedSchoolInfo.contactPerson} ({selectedSchoolInfo.email})</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span><strong>LGU Scholarship Allocation:</strong> {formatCurrency(totalScopeApprovedAid)}</span>
          </div>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverEffect className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {selectedSchoolInfo ? 'Enrolled LGU Scholars' : 'Total LGU Scholars'}
              </p>
              <p className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white mt-0.5">
                {currentScopeDisbursements.length} Students
              </p>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
                {selectedSchoolInfo ? selectedSchoolInfo.schoolName.split(' ')[0] : 'All Accredited Colleges'}
              </p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
              <GraduationCap className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Disbursements</p>
              <p className="font-heading font-extrabold text-2xl text-amber-600 dark:text-amber-400 mt-0.5">
                {formatCurrency(totalScopePending)}
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-1">
                {currentScopeDisbursements.filter((d) => d.status === 'Pending').length} Awards Waiting
              </p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Successfully Released</p>
              <p className="font-heading font-extrabold text-2xl text-emerald-600 dark:text-emerald-400 mt-0.5">
                {formatCurrency(totalScopeCompleted)}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                {currentScopeDisbursements.filter((d) => d.status === 'Completed').length} Completed Payouts
              </p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Failed / Flagged</p>
              <p className="font-heading font-extrabold text-2xl text-rose-600 dark:text-rose-400 mt-0.5">
                {totalScopeFailedCount} Items
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Requires Account Correction</p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table & Filtering Section */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={
                selectedSchoolInfo
                  ? `Search students in ${selectedSchoolInfo.schoolName.split(' ')[0]}...`
                  : 'Search student, school, degree, or grant title...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:border-blue-600 shadow-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Degree Program Filter */}
            {availableCourses.length > 1 && (
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="h-9 px-3 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 cursor-pointer max-w-[190px]"
              >
                <option value="all">All Degree Programs</option>
                {availableCourses.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            )}

            {/* Status Tabs */}
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'all', label: 'All Records' },
                { id: 'Pending', label: 'Pending Payout' },
                { id: 'Completed', label: 'Disbursed' },
                { id: 'Failed', label: 'Failed' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-blue-600 text-white shadow-md border border-transparent font-bold'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4">Student ID & Name</th>
                <th className="p-4">Partner School</th>
                <th className="p-4">Degree Program & Year</th>
                <th className="p-4">LGU Scholarship Program</th>
                <th className="p-4">GWA</th>
                <th className="p-4">Aid Amount</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Disbursement Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
              {filteredDisbursements.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-400">
                    <GraduationCap className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                      No student aid records found
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedSchoolInfo
                        ? `No students in ${selectedSchoolInfo.schoolName} match the current search or filters.`
                        : 'Try searching with a different term or clear filters.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDisbursements.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold flex items-center justify-center text-xs shrink-0">
                          {item.studentName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{item.studentName}</span>
                          <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-semibold">{item.studentId}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => setSelectedSchoolId(item.schoolId)}
                        className="font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:underline block text-left"
                      >
                        {item.schoolName}
                      </button>
                      <span className="text-[10px] text-slate-400">{item.id}</span>
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">{item.course}</span>
                      <span className="text-[10px] text-slate-400">{item.yearLevel} • Regular</span>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">{item.scholarshipTitle}</span>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">{item.lguCategory}</span>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 text-xs">
                        {item.gpa.toFixed(2)}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="font-heading font-extrabold text-sm text-emerald-600 dark:text-emerald-400 block">
                        {formatCurrency(item.amount)}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        {item.paymentMethod === 'GCash' ? (
                          <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        ) : (
                          <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        )}
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{item.paymentMethod}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">{item.accountNumber}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="space-y-1">
                        {item.status === 'Completed' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-2.5 py-1 rounded-xl">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Disbursed
                          </span>
                        ) : item.status === 'Pending' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/80 px-2.5 py-1 rounded-xl">
                            <Clock className="h-3.5 w-3.5 text-amber-600" /> Pending Payout
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100/80 dark:bg-rose-950/80 px-2.5 py-1 rounded-xl">
                            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" /> Payout Failed
                          </span>
                        )}

                        {item.failureReason && (
                          <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium max-w-[150px] leading-tight">
                            ⚠️ {item.failureReason}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {item.status === 'Pending' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleSingleRelease(item.id)}
                            leftIcon={<Send className="h-3 w-3" />}
                            className="h-7 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2"
                          >
                            Release
                          </Button>
                        )}

                        {item.status === 'Failed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRetryPayment(item.id)}
                            leftIcon={<RefreshCw className="h-3 w-3" />}
                            className="h-7 text-xs font-bold text-amber-700 border-amber-300 hover:bg-amber-50 px-2"
                          >
                            Retry
                          </Button>
                        )}

                        <button
                          onClick={() => {
                            setNoticeRecipient({
                              studentId: item.studentId,
                              studentName: item.studentName,
                              email: item.contactEmail,
                              school: item.schoolName,
                              scholarshipTitle: item.scholarshipTitle,
                              applicationId: item.id,
                              gpa: item.gpa,
                            });
                            setShowNoticeModal(true);
                          }}
                          title="Send System Notice to Scholar"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Send className="h-4 w-4 text-blue-600" />
                        </button>

                        <button
                          onClick={() => setViewingStudent(item)}
                          title="View Full Student Aid Profile"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handlePrintVoucher(item)}
                          title="Print Official Disbursement Voucher"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Batch Execution Modal */}
      {showBatchModal && (
        <Modal
          isOpen={showBatchModal}
          onClose={() => setShowBatchModal(false)}
          title={
            selectedSchoolInfo
              ? `Execute Batch Aid Disbursement — ${selectedSchoolInfo.schoolName}`
              : 'Execute City-Wide Batch Financial Payout'
          }
          description="Schedule and process electronic financial aid transfers to all eligible LGU scholars."
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" size="sm" onClick={() => setShowBatchModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleExecuteBatch} className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white">
                Confirm & Dispatch Payout Batch ({formatCurrency(totalScopePending)})
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-1.5">
                <span className="text-slate-500 dark:text-slate-400">Target Institution:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedSchoolInfo ? selectedSchoolInfo.schoolName : 'All Accredited Partner Colleges'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-1.5">
                <span className="text-slate-500 dark:text-slate-400">Pending Awards Count:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {currentScopeDisbursements.filter((d) => d.status === 'Pending').length} Scholars
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Total Batch Value:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-heading text-sm">
                  {formatCurrency(totalScopePending)}
                </span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Official Settlement / Release Date
              </label>
              <input
                type="date"
                value={batchDate}
                onChange={(e) => setBatchDate(e.target.value)}
                className="w-full h-10 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:border-blue-600 shadow-xs"
              />
            </div>

            <p className="text-[11px] text-slate-500">
              Notice: Payouts are credited directly to scholars' registered GCash and Landbank e-wallets. Official digital receipt notifications will be sent automatically.
            </p>
          </div>
        </Modal>
      )}

      {/* Viewing Student Profile Details Modal */}
      {viewingStudent && (
        <Modal
          isOpen={!!viewingStudent}
          onClose={() => setViewingStudent(null)}
          title={`Scholar Aid Record: ${viewingStudent.studentName}`}
          description={`Student ID: ${viewingStudent.studentId} • Enrolled at ${viewingStudent.schoolName}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePrintVoucher(viewingStudent)}
                leftIcon={<Printer className="h-4 w-4" />}
              >
                Print Disbursement Voucher
              </Button>
              <Button variant="outline" size="sm" onClick={() => setViewingStudent(null)}>
                Close Record
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Degree Program</span>
                <span className="font-bold text-slate-900 dark:text-white text-xs">{viewingStudent.course}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">{viewingStudent.yearLevel}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Academic Standing</span>
                <span className="font-bold text-emerald-600 text-xs">GWA {viewingStudent.gpa.toFixed(2)}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">COR Verified ✓</span>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-2xl space-y-2">
              <div className="flex justify-between">
                <span className="text-blue-900 dark:text-blue-200">LGU Grant Program:</span>
                <span className="font-bold text-blue-950 dark:text-white">{viewingStudent.scholarshipTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-900 dark:text-blue-200">Approved Award Value:</span>
                <span className="font-bold text-emerald-600 font-heading text-sm">{formatCurrency(viewingStudent.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-900 dark:text-blue-200">Disbursement Status:</span>
                <span className="font-bold text-slate-900 dark:text-white">{viewingStudent.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-900 dark:text-blue-200">Payment Channel:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{viewingStudent.paymentMethod} ({viewingStudent.accountNumber})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-900 dark:text-blue-200">Posting Date:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingStudent.scheduledDate}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Student Contact Information</span>
              <p className="text-slate-700 dark:text-slate-300"><strong>Email:</strong> {viewingStudent.contactEmail || 'student@qc.edu.ph'}</p>
              <p className="text-slate-700 dark:text-slate-300"><strong>Mobile:</strong> {viewingStudent.contactPhone || viewingStudent.accountNumber}</p>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setNoticeRecipient({
                    studentId: viewingStudent.studentId,
                    studentName: viewingStudent.studentName,
                    email: viewingStudent.contactEmail,
                    school: viewingStudent.schoolName,
                    scholarshipTitle: viewingStudent.scholarshipTitle,
                    applicationId: viewingStudent.id,
                    gpa: viewingStudent.gpa,
                  });
                  setShowNoticeModal(true);
                }}
                leftIcon={<Send className="h-3.5 w-3.5 text-blue-600" />}
                className="font-bold text-xs"
              >
                Send System Notice to Scholar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Send Official System Notice Modal */}
      {showNoticeModal && noticeRecipient && (
        <SendScholarshipNoticeModal
          isOpen={showNoticeModal}
          onClose={() => {
            setShowNoticeModal(false);
            setNoticeRecipient(null);
          }}
          recipient={noticeRecipient}
          defaultTemplate="payout"
        />
      )}
    </div>
  );
};

export default SchoolAidDistributionPage;
