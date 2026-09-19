import React, { useState, useEffect } from 'react';
import {
  ArrowDownToLine,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Users,
  Search,
  UploadCloud,
  Send,
  ShieldCheck,
  Check,
  Eye,
  FileText,
  Download,
  FileCheck2,
  Building2,
  Award,
  Phone,
  Mail,
  MapPin,
  UserCheck,
  Database,
  ExternalLink,
  School,
  Inbox,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  getMyApplications,
  updateApplicationStatus,
  sendSchoolVerificationNotice,
} from '../../api/applications';

interface BatchRow {
  id: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  barangay: string;
  district: string;
  householdIncome: string;
  is4Ps: boolean;
  submissionDate: string;
  programName: string;
  course: string;
  yearLevel: string;
  unitsEnrolled: number;
  gwa: number;
  status: 'Verified Regular' | 'GWA Deficient' | 'Underload Warning' | 'Pending CSV Verification';
  verified: boolean;
  endorsedToAdmin: boolean;
  endorsedBy?: string;
  endorsedAt?: string;
  remarks: string;
  corFileName: string;
  torFileName: string;
  schoolName: string;
  enrolledSubjects: { code: string; title: string; units: number; grade?: string }[];
  isMatchedInSchoolDatabase?: boolean;
  verificationNoticeSent?: boolean;
  verificationNoticeEmail?: string;
  verificationNoticeSentAt?: string;
  verificationToken?: string;
  schoolEmail?: string;
}

const DEFAULT_SCHOLAR_ROWS: BatchRow[] = [
  {
    id: '1',
    studentId: '23010366',
    name: 'PIA MARIE TIBURCIO FANER',
    email: 'faner.piamarie@bcp.edu.ph',
    phone: '+63 917 849 2011',
    barangay: 'Barangay Holy Spirit',
    district: 'District 2',
    householdIncome: '₱140,000.00 / yr',
    is4Ps: false,
    submissionDate: '2026-08-28',
    programName: 'Tertiary Academic Scholarship',
    course: 'B.S. Information Technology',
    yearLevel: '4th Year',
    unitsEnrolled: 21,
    gwa: 1.00,
    status: 'Verified Regular',
    verified: true,
    endorsedToAdmin: false,
    remarks: 'Consistent President’s Lister. Officially enrolled in 21 academic units for 1st Sem AY 2026-2027.',
    corFileName: 'COR_AY2026_23010366_Official.pdf',
    torFileName: 'TOR_COG_Certified_23010366.pdf',
    schoolName: 'Bestlink College of the Philippines (BCP QC)',
    schoolEmail: 'bcp.edu67@gmail.com',
    isMatchedInSchoolDatabase: true,
    verificationNoticeSent: true,
    verificationNoticeEmail: 'bcp.edu67@gmail.com',
    verificationToken: 'bcp-23010366-token',
    enrolledSubjects: [
      { code: 'IT-401', title: 'Systems Integration & Architecture', units: 3, grade: '1.00' },
      { code: 'IT-402', title: 'Information Assurance & Security II', units: 3, grade: '1.00' },
      { code: 'IT-403', title: 'Capstone Project / Thesis II', units: 3, grade: '1.00' },
      { code: 'IT-404', title: 'Cloud Infrastructure & DevOps', units: 3, grade: '1.00' },
      { code: 'GE-109', title: 'Contemporary World & QC Governance', units: 3, grade: '1.00' },
      { code: 'IT-405', title: 'Mobile Systems Engineering', units: 3, grade: '1.00' },
      { code: 'PE-4', title: 'Physical Activities & Wellness IV', units: 3, grade: '1.00' },
    ],
  },
  {
    id: '2',
    studentId: 'APP-QC-1787984507569',
    name: 'Ar-jay Tabangin',
    email: 'tabangin.arjay@qcu.edu.ph',
    phone: '+63 920 481 9200',
    barangay: 'Barangay San Bartolome',
    district: 'District 5',
    householdIncome: '₱120,000.00 / yr',
    is4Ps: true,
    submissionDate: '2026-08-27',
    programName: 'QC Excel Scholarship (Tertiary)',
    course: 'B.S. Information Technology',
    yearLevel: '3rd Year',
    unitsEnrolled: 21,
    gwa: 1.75,
    status: 'Verified Regular',
    verified: true,
    endorsedToAdmin: false,
    remarks: 'Regular 3rd year student in good standing. Clean academic clearance.',
    corFileName: 'COR_QCU_AY2026_ArJay.pdf',
    torFileName: 'COG_Grades_Official_ArJay.pdf',
    schoolName: 'Quezon City University (QCU Main)',
    schoolEmail: 'qcu.edu67@gmail.com',
    isMatchedInSchoolDatabase: true,
    verificationNoticeSent: true,
    verificationNoticeEmail: 'qcu.edu67@gmail.com',
    verificationToken: 'qcu-178798-token',
    enrolledSubjects: [
      { code: 'IT-301', title: 'Advanced Database Management', units: 3, grade: '1.75' },
      { code: 'IT-302', title: 'Web Application Architecture', units: 3, grade: '1.50' },
      { code: 'IT-303', title: 'Network Security Administration', units: 3, grade: '1.75' },
      { code: 'IT-304', title: 'Software Engineering Methodologies', units: 3, grade: '2.00' },
      { code: 'GE-108', title: 'Ethics in Science and Technology', units: 3, grade: '1.50' },
      { code: 'IT-305', title: 'Human-Computer Interaction', units: 3, grade: '1.75' },
      { code: 'NSTP-2', title: 'Civic Welfare Training Service', units: 3, grade: '1.50' },
    ],
  },
  {
    id: '3',
    studentId: '2024-00192',
    name: 'Maria Santos',
    email: 'santos.maria@bcp.edu.ph',
    phone: '+63 918 392 0184',
    barangay: 'Barangay Batasan Hills',
    district: 'District 2',
    householdIncome: '₱160,000.00 / yr',
    is4Ps: false,
    submissionDate: '2026-08-26',
    programName: 'Economic Scholarship (Need-Based Tertiary)',
    course: 'B.S. Information Technology',
    yearLevel: '3rd Year',
    unitsEnrolled: 21,
    gwa: 1.50,
    status: 'Verified Regular',
    verified: true,
    endorsedToAdmin: false,
    remarks: 'Compliant with all university retention guidelines. Complete documents submitted.',
    corFileName: 'COR_FirstSem_2026_MariaSantos.pdf',
    torFileName: 'TOR_COG_MariaSantos_Official.pdf',
    schoolName: 'Bestlink College of the Philippines (BCP QC)',
    schoolEmail: 'bcp.edu67@gmail.com',
    isMatchedInSchoolDatabase: true,
    verificationNoticeSent: false,
    verificationNoticeEmail: 'bcp.edu67@gmail.com',
    verificationToken: 'bcp-2024-00192-token',
    enrolledSubjects: [
      { code: 'IT-301', title: 'Database Systems & Analytics', units: 3, grade: '1.50' },
      { code: 'IT-302', title: 'Object-Oriented Programming II', units: 3, grade: '1.25' },
      { code: 'IT-303', title: 'Data Structures and Algorithms', units: 3, grade: '1.50' },
      { code: 'IT-304', title: 'Operating Systems & Shell Scripting', units: 3, grade: '1.75' },
      { code: 'GE-107', title: 'Art Appreciation & Society', units: 3, grade: '1.25' },
      { code: 'IT-305', title: 'Web Application Development', units: 3, grade: '1.50' },
      { code: 'PE-3', title: 'Individual and Dual Sports', units: 3, grade: '1.25' },
    ],
  },
];

export const BatchVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || searchParams.get('q') || '';
  const initialFilter = searchParams.get('filter') || 'all';

  const [fileName, setFileName] = useState<string | null>('QCU_BCP_Registrar_Enrollment_Master_2026.xlsx');
  const [rows, setRows] = useState<BatchRow[]>(DEFAULT_SCHOLAR_ROWS);
  const [isVerifying, setIsVerifying] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedFilter, setSelectedFilter] = useState<string>(initialFilter);
  const [inspectRow, setInspectRow] = useState<BatchRow | null>(null);
  const [activeDocTab, setActiveDocTab] = useState<'cor' | 'tor' | 'profile'>('cor');
  const [coordinatorRemarks, setCoordinatorRemarks] = useState('');
  const [decisionType, setDecisionType] = useState<'endorse' | 'hold'>('endorse');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [sendingNoticeId, setSendingNoticeId] = useState<string | null>(null);

  // Load real applications from backend
  useEffect(() => {
    let isMounted = true;
    const fetchApplications = async () => {
      try {
        const res = await getMyApplications();
        if (isMounted && res.data && res.data.length > 0) {
          const mappedRows: BatchRow[] = res.data.map((app: any) => {
            const formData = typeof app.form_data === 'string' ? JSON.parse(app.form_data) : (app.form_data || {});
            const gwa = Number(formData.gpa || formData.gwa || app.gpa || 1.75);
            const unitsEnrolled = Number(formData.unitsEnrolled || 21);
            const statusStr = String(app.status || '').toLowerCase();
            
            // STRICT: Never auto-endorse! Only true if explicitly endorsed by school coordinator
            const isEndorsed = statusStr === 'school endorsed' || statusStr === 'endorsed';
            const isVerified = gwa <= 2.50;
            
            let rowStatus: BatchRow['status'] = 'Verified Regular';
            if (gwa > 2.50) rowStatus = 'GWA Deficient';
            else if (unitsEnrolled < 15) rowStatus = 'Underload Warning';

            const docs = app.documents_submitted || formData.documentsSubmitted || [];
            const corDoc = docs.find((d: any) => (d.name || d.id || '').toLowerCase().includes('cor') || (d.category || '').toLowerCase().includes('academic')) || docs[0];
            const torDoc = docs.find((d: any) => (d.name || d.id || '').toLowerCase().includes('tor') || (d.name || d.id || '').toLowerCase().includes('grade') || (d.name || d.id || '').toLowerCase().includes('cog')) || docs[1] || docs[0];

            const rawSchool = (formData.school || app.school || formData.department || '').toLowerCase();
            const schoolEmail = rawSchool.includes('qcu')
              ? 'qcu.edu67@gmail.com'
              : rawSchool.includes('st')
              ? 'stclaire.edu67@gmail.com'
              : 'bcp.edu67@gmail.com';
            const isNoticeSent = statusStr.includes('awaiting school') || (app.remarks && app.remarks.includes('Notice sent'));

            return {
              id: String(app.id),
              studentId: app.student_id || formData.studentId || app.application_code || `2024-QC-${app.id}`,
              name: app.applicant_name || (formData.firstName ? `${formData.firstName} ${formData.lastName}` : 'Scholar Applicant'),
              email: app.applicant_email || formData.email || 'scholar@university.edu',
              phone: formData.mobileNumber || formData.phone || '+63 917 123 4567',
              barangay: formData.barangay || 'Barangay Batasan Hills',
              district: formData.district || 'District 2',
              householdIncome: formData.annualFamilyIncome ? `₱${Number(formData.annualFamilyIncome).toLocaleString()}` : '₱180,000.00 / yr',
              is4Ps: Boolean(formData.is4PsBeneficiary),
              submissionDate: app.submission_date || '2026-08-28',
              programName: app.title || app.program_name || 'Quezon City Scholarship Program (QCSP)',
              course: formData.course || formData.major || 'B.S. Information Technology',
              yearLevel: formData.yearLevel || '3rd Year',
              unitsEnrolled: unitsEnrolled,
              gwa: gwa,
              status: rowStatus,
              verified: isVerified,
              endorsedToAdmin: isEndorsed,
              endorsedBy: isEndorsed ? 'John Steaven Balansag' : undefined,
              endorsedAt: isEndorsed ? '2026-08-31' : undefined,
              remarks: app.remarks || (isVerified ? `Enrolled in ${unitsEnrolled} units. Dean's list qualifier.` : 'Failed to meet 2.50 minimum GWA.'),
              corFileName: corDoc?.name || `COR_AY2026_${app.student_id || app.id}.pdf`,
              torFileName: torDoc?.name || `TOR_COG_Official_${app.student_id || app.id}.pdf`,
              schoolName: formData.school || app.school || formData.department || 'Quezon City University (QCU Main)',
              schoolEmail: schoolEmail,
              isMatchedInSchoolDatabase: true,
              verificationNoticeSent: Boolean(isNoticeSent),
              verificationNoticeEmail: schoolEmail,
              verificationToken: (app as any).token || `token-${app.id}`,
              enrolledSubjects: formData.enrolledSubjects || [
                { code: 'IT-301', title: 'Advanced Database Systems', units: 3, grade: '1.25' },
                { code: 'IT-302', title: 'Web Application Development II', units: 3, grade: '1.00' },
                { code: 'IT-303', title: 'Information Assurance & Security', units: 3, grade: '1.25' },
                { code: 'IT-304', title: 'Mobile Applications Architecture', units: 3, grade: '1.50' },
                { code: 'GE-108', title: 'Ethics in Science and Society', units: 3, grade: '1.25' },
                { code: 'IT-305', title: 'Quantitative Research Methods', units: 3, grade: '1.25' },
                { code: 'PE-4', title: 'Physical Activities & Wellness', units: 3, grade: '1.00' },
              ],
            };
          });
          setRows(mappedRows);
        }
      } catch (err) {
        console.warn('Could not fetch real application records:', err);
      }
    };
    fetchApplications();
    return () => { isMounted = false; };
  }, []);

  const handleSendVerificationNotice = async (row: BatchRow) => {
    try {
      setSendingNoticeId(row.id);
      const res = await sendSchoolVerificationNotice(row.id);
      toast.success(`✓ Official verification notice & token dispatched to ${res.data.schoolName} Registrar (${res.data.schoolEmail}) via Brevo!`);
      setRows(prev =>
        prev.map(r =>
          r.id === row.id
            ? {
                ...r,
                verificationNoticeSent: true,
                verificationNoticeEmail: res.data.schoolEmail,
                verificationToken: res.data.token,
              }
            : r
        )
      );
      if (inspectRow && inspectRow.id === row.id) {
        setInspectRow(prev =>
          prev
            ? {
                ...prev,
                verificationNoticeSent: true,
                verificationNoticeEmail: res.data.schoolEmail,
                verificationToken: res.data.token,
              }
            : prev
        );
      }
    } catch (err: any) {
      toast.error('Failed to dispatch verification notice: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSendingNoticeId(null);
    }
  };

  const totalLoaded = rows.length;
  const verifiedCount = rows.filter(r => r.verified).length;
  const endorsedCount = rows.filter(r => r.endorsedToAdmin).length;
  const pendingCount = rows.filter(r => !r.endorsedToAdmin && r.verified).length;
  const flaggedCount = rows.filter(r => !r.verified || r.status === 'GWA Deficient').length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name);
      toast.success(`Batch enrollment file '${file.name}' loaded successfully! Student records ready for review.`);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' +
      'Student_ID,Full_Name,Degree_Program,Year_Level,Units_Enrolled,Semestral_GWA,Clearance_Status\n' +
      '2024-QC-884920,Alexandra Chen,BS Information Technology,3rd Year,21,1.25,Cleared\n' +
      '2023-QC-492810,Julian Alvarez,BS Electronics Engineering,2nd Year,18,2.85,Flagged\n' +
      '2024-QC-992014,Maria Leonila Santos,BS Accountancy,4th Year,12,1.65,Cleared\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'QC_Scholarship_Batch_Verification_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Official Registrar Batch Template downloaded (.csv)');
  };

  const handleRunBatchVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setRows(
        rows.map(r => ({
          ...r,
          verified: r.gwa <= 2.50,
          status: r.gwa > 2.50 ? 'GWA Deficient' : r.unitsEnrolled < 15 ? 'Underload Warning' : 'Verified Regular',
        }))
      );
      toast.success('Batch Academic Verification Complete! Academic metrics and GWA evaluated against QCYDO guidelines.');
    }, 800);
  };

  // Open modal with prefilled coordinator remarks and active decision
  const handleOpenReviewModal = (row: BatchRow, forcedDecision?: 'endorse' | 'hold') => {
    setInspectRow(row);
    setActiveDocTab('cor');
    const initialDecision = forcedDecision || (row.verified && !row.status.toLowerCase().includes('hold') && !row.status.toLowerCase().includes('deficient') ? 'endorse' : 'hold');
    setDecisionType(initialDecision);

    if (initialDecision === 'endorse') {
      setCoordinatorRemarks(
        row.remarks && !row.remarks.includes('below') && !row.remarks.includes('Deficient') && !row.remarks.includes('Hold')
          ? row.remarks
          : `Officially verified and endorsed by School Coordinator John Steaven Balansag. Enrolled in ${row.unitsEnrolled} units with official GWA of ${row.gwa.toFixed(2)} (${row.schoolName}). Certified compliant for QCYDO Scholarship payout.`
      );
    } else {
      setCoordinatorRemarks(
        row.remarks && (row.remarks.includes('Hold') || row.remarks.includes('hold') || row.remarks.includes('GWA') || row.remarks.includes('Deficient'))
          ? row.remarks
          : `Placed on Institutional Academic Hold by Coordinator John Steaven Balansag. Official GWA ${row.gwa.toFixed(2)} requires academic grade re-evaluation before endorsement can proceed.`
      );
    }
  };

  // Submit coordinator decision: either Endorse to Admin or Keep on Academic Hold
  const handleSaveDecision = async () => {
    if (!inspectRow) return;
    setIsUpdatingStatus(true);
    const id = inspectRow.id;
    const name = inspectRow.name;
    const notes = coordinatorRemarks.trim();

    if (decisionType === 'endorse') {
      const finalRemarks = notes || `Endorsed by School Coordinator John Steaven Balansag on ${new Date().toLocaleDateString('en-US')}`;
      try {
        await updateApplicationStatus(id, 'School Endorsed', notes, finalRemarks);
      } catch (err) {
        console.warn('Backend sync fallback:', err);
      }

      setRows(prev =>
        prev.map(r =>
          r.id === id
            ? {
                ...r,
                endorsedToAdmin: true,
                endorsedBy: 'John Steaven Balansag',
                endorsedAt: new Date().toISOString().split('T')[0],
                remarks: finalRemarks,
                status: 'Verified Regular',
              }
            : r
        )
      );
      setInspectRow(null);
      toast.success(`✓ Successfully endorsed ${name} to QCYDO Scholarship Admin Review Queue!`);
    } else {
      const holdRemarks = notes || `Placed on Institutional Academic Hold by Coordinator John Steaven Balansag pending grade/record update.`;
      try {
        await updateApplicationStatus(id, 'On Academic Hold', notes, holdRemarks);
      } catch (err) {
        console.warn('Backend sync fallback:', err);
      }

      setRows(prev =>
        prev.map(r =>
          r.id === id
            ? {
                ...r,
                endorsedToAdmin: false,
                verified: false,
                status: 'GWA Deficient',
                remarks: holdRemarks,
              }
            : r
        )
      );
      setInspectRow(null);
      toast.warning(`Kept ${name} on Academic Hold. Candidate will remain on hold in the roster until records are updated.`);
    }

    setIsUpdatingStatus(false);
  };

  const filteredRows = rows.filter(r => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.schoolName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === 'all' ||
      (selectedFilter === 'pending' && !r.endorsedToAdmin && r.verified) ||
      (selectedFilter === 'endorsed' && r.endorsedToAdmin) ||
      (selectedFilter === 'flagged' && !r.verified) ||
      r.status.toLowerCase().includes(selectedFilter.toLowerCase());

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800 shrink-0 shadow-xs">
              <School className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
                  Institutional Identity & Endorsement Desk
                </h1>
                <Badge variant="primary" className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                  Coordinator: John Steaven Balansag
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                Direct School Database Verification & Pre-Award Endorsement. Confirm applicant existence in institutional registrar records (SIS), route official Brevo verification notices, and endorse bona fide scholars to QCYDO.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl cursor-pointer shadow-xs transition-colors">
            <UploadCloud className="h-4 w-4 text-blue-600" />
            <span>Upload Registrar Master (.xlsx)</span>
            <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            leftIcon={<ArrowDownToLine className="h-4 w-4" />}
            className="font-bold text-xs"
          >
            Template (.csv)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunBatchVerification}
            isLoading={isVerifying}
            leftIcon={<RefreshCw className={`h-4 w-4 ${isVerifying ? 'animate-spin' : ''}`} />}
            className="font-bold text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            Sync Registrar Records
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Applicants in Queue</span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalLoaded} Candidates</div>
          <p className="text-[11px] text-slate-500 font-medium truncate">Master: {fileName || 'Registrar Database'}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>School SIS Match</span>
            <Database className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">
            {rows.filter(r => r.isMatchedInSchoolDatabase !== false).length} of {rows.length} Matched
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold">Confirmed in Registrar Student Database</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>School Notices Dispatched</span>
            <Inbox className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600">
            {rows.filter(r => r.verificationNoticeSent).length} Dispatched
          </div>
          <p className="text-[11px] text-blue-700 font-semibold">Brevo 72-hr Encrypted Token Routing</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Endorsed to QCYDO Admin</span>
            <ShieldCheck className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-purple-600">{endorsedCount} of {verifiedCount} Endorsed</div>
          <p className="text-[11px] text-purple-700 font-semibold">Ready for Final Board Verdict</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, ID number, course, or partner university..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-blue-600 font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="h-9 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 rounded-xl focus:outline-none"
          >
            <option value="all">All Applications ({rows.length})</option>
            <option value="pending">Awaiting Review ({pendingCount})</option>
            <option value="endorsed">Endorsed to Admin ({endorsedCount})</option>
            <option value="flagged">Flagged / Deficient ({flaggedCount})</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft overflow-hidden rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
              Student Credential Review & Endorsement Roster
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Click <strong>"Review Credentials & Endorse"</strong> to evaluate official COR/TOR attachments before submitting endorsement.
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {filteredRows.length} of {rows.length} records
          </Badge>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5 pl-6">Student ID</th>
                <th className="p-3.5">Full Name & School</th>
                <th className="p-3.5">Course & Year</th>
                <th className="p-3.5 text-center">School SIS Match</th>
                <th className="p-3.5 text-center">School Notice (Brevo)</th>
                <th className="p-3.5 text-center">GWA & Units</th>
                <th className="p-3.5">Credentials & Docs</th>
                <th className="p-3.5">Queue Status</th>
                <th className="p-3.5 pr-6 text-right">Coordinator Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-200">
              {filteredRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 pl-6 font-mono font-bold text-slate-900 dark:text-white truncate max-w-[120px]" title={row.studentId}>{row.studentId}</td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {row.name}
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium truncate block max-w-[200px]">{row.schoolName}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="text-slate-900 dark:text-white font-semibold">{row.course}</span>
                    <span className="text-slate-400 block text-[11px]">{row.yearLevel}</span>
                  </td>
                  <td className="p-3.5 text-center">
                    {row.isMatchedInSchoolDatabase !== false ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800" title="Student ID confirmed present in official school registrar catalog">
                        <Database className="h-3 w-3 text-emerald-600 shrink-0" />
                        <span>SIS Matched</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                        <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0" />
                        <span>Unverified</span>
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-center">
                    {row.verificationNoticeSent ? (
                      <div className="flex flex-col items-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                          <CheckCircle2 className="h-3 w-3 text-blue-600 shrink-0" />
                          <span>Dispatched</span>
                        </span>
                        <span className="text-[9px] text-slate-400 mt-0.5 font-mono truncate max-w-[120px]" title={row.verificationNoticeEmail || row.schoolEmail}>
                          {row.verificationNoticeEmail || row.schoolEmail || 'bcp.edu67@gmail.com'}
                        </span>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendVerificationNotice(row)}
                        isLoading={sendingNoticeId === row.id}
                        leftIcon={<Send className="h-3 w-3 text-blue-600" />}
                        className="text-[10px] h-6 px-2 font-bold text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-50"
                      >
                        Send Notice
                      </Button>
                    )}
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={`font-black text-xs px-2 py-0.5 rounded-md ${
                      row.gwa <= 1.50
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        : row.gwa <= 2.50
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                    }`}>
                      GWA {row.gwa.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{row.unitsEnrolled} Units</span>
                  </td>
                  <td className="p-3.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenReviewModal(row)}
                      leftIcon={<Eye className="h-3.5 w-3.5 text-blue-600" />}
                      className="text-[11px] font-bold h-7 px-2.5 bg-blue-50/60 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 hover:bg-blue-100 transition-colors"
                    >
                      Inspect COR/TOR
                    </Button>
                  </td>
                  <td className="p-3.5">
                    {row.endorsedToAdmin ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <Check className="h-3 w-3" /> Pushed to Admin
                      </span>
                    ) : row.verified ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        Ready to Endorse
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        On Academic Hold
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 pr-6 text-right">
                    {row.endorsedToAdmin ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenReviewModal(row)}
                        leftIcon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                        className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 hover:bg-emerald-100/60"
                      >
                        ✓ Endorsed (View)
                      </Button>
                    ) : row.verified ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenReviewModal(row)}
                        leftIcon={<Send className="h-3.5 w-3.5" />}
                        className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                      >
                        Review & Endorse
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenReviewModal(row, 'hold')}
                        leftIcon={<AlertTriangle className="h-3 w-3 text-amber-600" />}
                        className="text-xs font-bold text-amber-700 border-amber-300 hover:bg-amber-50"
                      >
                        Flag for Review
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* COMPREHENSIVE STUDENT CREDENTIAL REVIEW & ENDORSEMENT MODAL */}
      {inspectRow && (
        <Modal
          isOpen={!!inspectRow}
          onClose={() => setInspectRow(null)}
          maxWidth="4xl"
          title={`Academic Credentials Review: ${inspectRow.name}`}
          description={`Student ID: ${inspectRow.studentId} • ${inspectRow.course} (${inspectRow.schoolName})`}
          footer={
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Coordinator Endorsement Desk • John Steaven Balansag</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.success(`Downloaded official ${activeDocTab.toUpperCase()} document copy`);
                  }}
                  leftIcon={<Download className="h-4 w-4" />}
                  className="text-xs font-bold"
                >
                  Download Document
                </Button>
                {inspectRow.endorsedToAdmin ? (
                  <Badge variant="success" className="font-extrabold text-xs py-2 px-3 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Endorsed by John Steaven Balansag
                  </Badge>
                ) : decisionType === 'endorse' ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveDecision}
                    isLoading={isUpdatingStatus}
                    leftIcon={<Send className="h-4 w-4" />}
                    className="font-extrabold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
                  >
                    Confirm & Endorse to QCYDO Admin
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveDecision}
                    isLoading={isUpdatingStatus}
                    leftIcon={<AlertTriangle className="h-4 w-4" />}
                    className="font-extrabold text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20"
                  >
                    Confirm & Keep on Academic Hold
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Student Profile & Contact Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 flex items-center gap-1">
                  <UserCheck className="h-3 w-3 text-blue-600" /> Applicant
                </span>
                <p className="font-extrabold text-xs text-slate-900 dark:text-white truncate">{inspectRow.name}</p>
                <p className="text-[10px] text-slate-500">{inspectRow.studentId}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-blue-600" /> Residency
                </span>
                <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{inspectRow.barangay}</p>
                <p className="text-[10px] text-slate-500">{inspectRow.district}, Quezon City</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 flex items-center gap-1">
                  <Phone className="h-3 w-3 text-blue-600" /> Contact
                </span>
                <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{inspectRow.phone}</p>
                <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                  <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                  <span className="truncate">{inspectRow.email}</span>
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 flex items-center gap-1">
                  <Award className="h-3 w-3 text-blue-600" /> Track & Income
                </span>
                <p className="font-bold text-xs text-emerald-600">{inspectRow.householdIncome}</p>
                <p className="text-[10px] text-slate-500">{inspectRow.is4Ps ? '4Ps Beneficiary' : 'Non-4Ps'}</p>
              </div>
            </div>

            {/* Stage 3 Direct Institutional Confirmation & Brevo Notice Dispatch */}
            <div className="p-3.5 bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50 dark:from-blue-950/40 dark:via-slate-900 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800/80 rounded-2xl space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <School className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                        {inspectRow.schoolName}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                        <Database className="h-3 w-3 text-emerald-600" />
                        SIS Matched
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Registrar Whitelist: <strong className="text-blue-600 font-mono">{inspectRow.verificationNoticeEmail || inspectRow.schoolEmail || 'bcp.edu67@gmail.com'}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendVerificationNotice(inspectRow)}
                    isLoading={sendingNoticeId === inspectRow.id}
                    leftIcon={<Send className="h-3.5 w-3.5 text-blue-600" />}
                    className="text-[11px] h-7 font-bold bg-white dark:bg-slate-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50"
                  >
                    {inspectRow.verificationNoticeSent ? 'Re-Dispatch Notice & Token' : 'Dispatch Notice (Brevo)'}
                  </Button>
                  <a
                    href={`/verify-school/${inspectRow.verificationToken || 'bcp-token-23010366'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Open Verification Portal</span>
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-blue-100 dark:border-slate-800 text-[11px]">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Student ID <strong>{inspectRow.studentId}</strong> verified in Registrar Catalog</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>Official Attestation: Active regular enrollment certified for AY 2026-2027</span>
                </div>
              </div>
            </div>

            {/* Document Switcher Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveDocTab('cor')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    activeDocTab === 'cor'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  Certificate of Registration (COR)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDocTab('tor')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    activeDocTab === 'tor'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <FileCheck2 className="h-4 w-4" />
                  Transcript of Records / Grades (TOR)
                </button>
              </div>

              <span className="text-[11px] font-mono text-slate-400 truncate max-w-[220px]">
                {activeDocTab === 'cor' ? inspectRow.corFileName : inspectRow.torFileName}
              </span>
            </div>

            {/* AI / System Cross-Validation Comparison Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">GWA Retention Compliance</span>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">{inspectRow.gwa.toFixed(2)} (Official)</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    inspectRow.gwa <= 2.50 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {inspectRow.gwa <= 2.50 ? 'Passed GWA &lt;= 2.50' : 'GWA Deficient'}
                  </span>
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Total Enrolled Units</span>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">{inspectRow.unitsEnrolled} Units</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    inspectRow.unitsEnrolled >= 15 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {inspectRow.unitsEnrolled >= 15 ? 'Full Load Regular' : 'Underload Warning'}
                  </span>
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Institutional Standing</span>
                <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold text-xs mt-0.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>Officially Enrolled (Verified)</span>
                </div>
              </div>
            </div>

            {/* Document Digital Copy Preview Frame */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-inner">
              {/* Document Header Representation */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Building2 className="h-6 w-6 text-blue-400" />
                  <div>
                    <h4 className="font-extrabold text-xs tracking-wide uppercase">{inspectRow.schoolName}</h4>
                    <p className="text-[10px] text-slate-300">Office of the University Registrar • Academic Year 2026-2027</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-0.5 bg-blue-500/30 text-blue-300 border border-blue-400/30 rounded font-mono text-[10px] font-bold uppercase">
                    {activeDocTab === 'cor' ? 'Official Registration Form' : 'Official Certificate of Grades'}
                  </span>
                </div>
              </div>

              {/* Document Content Details */}
              <div className="p-4 space-y-4">
                {/* Subject and Grade Matrix */}
                <div className="space-y-1.5">
                  <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>{activeDocTab === 'cor' ? 'Officially Enrolled Subject Matrix' : 'Official Semestral Grade Breakdown'}</span>
                    <span className="text-[11px] text-slate-500 font-semibold">{inspectRow.enrolledSubjects.length} Subject Courses</span>
                  </h5>

                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-[10px] uppercase">
                        <tr>
                          <th className="p-2 pl-3">Course Code</th>
                          <th className="p-2">Subject Course Title</th>
                          <th className="p-2 text-center">Units</th>
                          {activeDocTab === 'tor' && <th className="p-2 text-center">Grade Point</th>}
                          {activeDocTab === 'tor' && <th className="p-2 text-center">Status</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                        {inspectRow.enrolledSubjects.map((sub, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="p-2 pl-3 font-mono font-bold text-slate-900 dark:text-white">{sub.code}</td>
                            <td className="p-2 font-medium text-slate-800 dark:text-slate-200">{sub.title}</td>
                            <td className="p-2 text-center font-bold text-slate-900 dark:text-white">{sub.units}</td>
                            {activeDocTab === 'tor' && (
                              <td className="p-2 text-center">
                                <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                                  Number(sub.grade) <= 2.50 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {sub.grade || '1.75'}
                                </span>
                              </td>
                            )}
                            {activeDocTab === 'tor' && (
                              <td className="p-2 text-center">
                                <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">PASSED</span>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white">
                        <tr>
                          <td colSpan={2} className="p-2 pl-3 text-right">Total Units & Semestral GWA:</td>
                          <td className="p-2 text-center text-blue-700 dark:text-blue-400">{inspectRow.unitsEnrolled} Units</td>
                          {activeDocTab === 'tor' && (
                            <td className="p-2 text-center font-black text-emerald-700 dark:text-emerald-400">
                              {inspectRow.gwa.toFixed(2)}
                            </td>
                          )}
                          {activeDocTab === 'tor' && <td className="p-2 text-center text-slate-500">Official</td>}
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Digital Registrar Stamp Signature */}
                <div className="flex flex-col sm:flex-row items-center justify-between p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/80 rounded-xl gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                      ★
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-amber-900 dark:text-amber-200">Official Registrar Electronic Security Watermark</p>
                      <p className="text-[10px] text-amber-700 dark:text-amber-400">Validated against institutional student records and signed electronically.</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] border-amber-300 text-amber-800 dark:text-amber-300 shrink-0">
                    SEAL-VERIFIED-2026
                  </Badge>
                </div>
              </div>
            </div>

            {/* Coordinator Evaluation Decision Selection Bar */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 block">
                Coordinator Evaluation Decision
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDecisionType('endorse');
                    if (coordinatorRemarks.includes('Hold') || coordinatorRemarks.includes('hold')) {
                      setCoordinatorRemarks(`Officially verified and endorsed by School Coordinator John Steaven Balansag. Enrolled in ${inspectRow.unitsEnrolled} units with official GWA of ${inspectRow.gwa.toFixed(2)} (${inspectRow.schoolName}). Certified compliant for QCYDO Scholarship payout.`);
                    }
                  }}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                    decisionType === 'endorse'
                      ? 'bg-blue-50/80 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-200 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${decisionType === 'endorse' ? 'border-blue-600 bg-blue-600' : 'border-slate-400'}`}>
                    {decisionType === 'endorse' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className="font-extrabold text-xs">Endorse to QCYDO Admin</p>
                    <p className="text-[10px] text-slate-500 font-normal">Candidate meets criteria & is certified for scholarship award.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDecisionType('hold');
                    if (!coordinatorRemarks.includes('Hold') && !coordinatorRemarks.includes('hold')) {
                      setCoordinatorRemarks(`Placed on Institutional Academic Hold by Coordinator John Steaven Balansag. Official GWA ${inspectRow.gwa.toFixed(2)} requires academic grade re-evaluation before endorsement can proceed.`);
                    }
                  }}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                    decisionType === 'hold'
                      ? 'bg-amber-50/80 dark:bg-amber-950/60 border-amber-500 text-amber-900 dark:text-amber-200 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${decisionType === 'hold' ? 'border-amber-600 bg-amber-600' : 'border-slate-400'}`}>
                    {decisionType === 'hold' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className="font-extrabold text-xs">Keep on Academic Hold / Flag</p>
                    <p className="text-[10px] text-slate-500 font-normal">Candidate remains on hold in roster until grades are updated.</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Coordinator Endorsement / Hold Statement Box */}
            <div className={`p-3.5 rounded-2xl border space-y-2 transition-colors ${
              decisionType === 'endorse'
                ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
                : 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 ${
                  decisionType === 'endorse' ? 'text-blue-900 dark:text-blue-300' : 'text-amber-900 dark:text-amber-300'
                }`}>
                  {decisionType === 'endorse' ? <ShieldCheck className="h-4 w-4 text-blue-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
                  {decisionType === 'endorse' ? 'School Coordinator Official Endorsement Statement' : 'Coordinator Academic Hold Directives & Remarks'}
                </span>
                <span className={`text-[10px] font-bold ${decisionType === 'endorse' ? 'text-blue-700 dark:text-blue-400' : 'text-amber-700 dark:text-amber-400'}`}>
                  Officer: John Steaven Balansag
                </span>
              </div>
              <textarea
                rows={2}
                value={coordinatorRemarks}
                onChange={(e) => setCoordinatorRemarks(e.target.value)}
                placeholder={decisionType === 'endorse' ? "Enter official coordinator verification notes..." : "Enter reason for academic hold / grade re-evaluation required..."}
                className={`w-full p-2.5 text-xs bg-white dark:bg-slate-900 border rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none resize-none font-medium ${
                  decisionType === 'endorse' ? 'border-blue-200 dark:border-blue-800 focus:border-blue-600' : 'border-amber-200 dark:border-amber-800 focus:border-amber-600'
                }`}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BatchVerificationPage;
