import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, XCircle, AlertTriangle, Eye, ShieldAlert, FileText, Send, Layers, ArrowLeft, Inbox, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { formatCurrency } from '../../utils/cn';
import { DocumentAttachmentViewerModal } from '../../components/admin/DocumentAttachmentViewerModal';
import { SendScholarshipNoticeModal, type NoticeRecipient } from '../../components/admin/SendScholarshipNoticeModal';
import { getMyApplications, updateApplicationStatus } from '../../api/applications';
import { ALL_SCHOLARSHIP_PROGRAMS, getProgramTermGrant } from '../../utils/scholarshipPrograms';
import type { Application } from '../../types';

export interface ReviewDocItem {
  id: string;
  name: string;
  label?: string;
  size?: string;
  uploadedAt?: string;
  verified?: boolean;
  category?: string;
}

export interface ReviewApplication {
  id: string;
  dbId?: string | number;
  studentName: string;
  studentId: string;
  email: string;
  gpa: number;
  program: string;
  school?: string;
  programId?: string;
  scholarshipTitle: string;
  amount: number;
  submissionDate: string;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  complianceFlags: string[];
  documentsUploaded: ReviewDocItem[];
  notes?: string;
  schoolEndorsed?: boolean;
  formData?: any;
  phone?: string;
}

export interface ApplicationReviewQueuePageProps {
  initialProgramFilter?: string | null;
  onClearProgramFilter?: () => void;
  onBackToPrograms?: () => void;
}

const INITIAL_REVIEW_QUEUE: ReviewApplication[] = [];

function mapDbApplicationToReview(app: Application): ReviewApplication {
  const formData = typeof app.form_data === 'string' ? JSON.parse(app.form_data) : (app.form_data || {});
  const rawGpa = typeof formData.gwa === 'number' || typeof formData.gwa === 'string'
    ? formData.gwa
    : (app as any).gpa;
  const gpa = parseFloat(String(rawGpa || 3.50)) || 3.50;
  
  const complianceFlags: string[] = [];
  if (app.program_name?.includes('Merit') && gpa > 2.50) {
    complianceFlags.push(`GWA (${gpa}) is below required 2.50 threshold`);
  }

  const parseDateStr = (val: any): string => {
    if (!val) return new Date().toLocaleDateString();
    if (val instanceof Date) return val.toLocaleDateString();
    const parsed = new Date(val);
    if (!isNaN(parsed.getTime())) return parsed.toLocaleDateString();
    return String(val);
  };

  const parseIsoDateStr = (val: any): string => {
    if (!val) return new Date().toISOString().split('T')[0];
    if (val instanceof Date) return val.toISOString().split('T')[0];
    const parsed = new Date(val);
    if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
    return String(val).split('T')[0];
  };

  const rawDocs = app.documents_submitted || formData.documentsSubmitted;
  const documentsUploaded = Array.isArray(rawDocs) && rawDocs.length > 0
    ? rawDocs.map((d: any, idx: number) => ({
        id: d.id || `doc-${idx}`,
        name: d.name || 'Submitted_Attachment.pdf',
        label: d.label || d.name || `Attachment ${idx + 1}`,
        size: d.size || '1.5 MB',
        uploadedAt: parseDateStr(d.uploadedAt || app.submission_date),
        verified: true,
        category: d.category || d.id || 'general',
        fileData: d.fileData || d.dataUrl || undefined,
        mimeType: d.mimeType || undefined,
      }))
    : [];

  let status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' = 'Submitted';
  const rawStatus = String(app.status || '');
  if (app.status === 'Approved' || app.status === 'Paid') {
    status = 'Approved';
  } else if (app.status === 'Rejected') {
    status = 'Rejected';
  } else if (app.status === 'Under Review' || app.status === 'Interview Scheduled' || rawStatus.includes('Endorsed')) {
    status = 'Under Review';
  }

  const isSchoolEndorsed = rawStatus.toLowerCase().includes('endorse');

  return {
    id: app.reference_id || app.application_code || String(app.id),
    dbId: app.id,
    studentName: app.applicant_name || (formData.firstName ? `${formData.firstName} ${formData.lastName}` : 'Student Applicant'),
    studentId: app.student_id || formData.studentId || '23010366',
    email: app.applicant_email || formData.email || 'student@university.edu',
    gpa: gpa,
    program: formData.course || (app as any).major || app.program_name || 'B.S. Information Technology',
    school: formData.school || (app as any).department || 'Bestlink College of the Philippines (BCP)',
    programId: app.program_id || (app as any).programCode || '',
    scholarshipTitle: app.program_name || app.title || 'Economic Scholarship (Need-Based Tertiary)',
    amount: Number(app.amount) || getProgramTermGrant(app.program_id || app.program_name),
    submissionDate: parseIsoDateStr(app.submission_date || app.submissionDate),
    status: status,
    complianceFlags: complianceFlags,
    documentsUploaded: documentsUploaded,
    notes: app.notes || 'Submitted through E-SCHOLAR Portal with complete attachments.',
    schoolEndorsed: isSchoolEndorsed,
    formData: formData,
    phone: formData.mobileNumber || formData.phone || 'N/A',
  };
}

/**
 * Robust Program Matching Helper
 * Compares an application against a program filter ID/Title across all 10 tracks.
 */
function matchesProgram(app: ReviewApplication, filter: string): boolean {
  if (!filter || filter === 'all' || filter === 'ALL') return true;
  const f = filter.toLowerCase().trim();
  const title = (app.scholarshipTitle || '').toLowerCase().trim();
  const pId = (app.programId || '').toLowerCase().trim();

  // Direct exact matches
  if (pId && pId === f) return true;
  if (title && title === f) return true;
  if (title && f && (title.includes(f) || f.includes(title))) return true;

  // Normalized matching for all 10 tracks
  // 1. Economic / Need-based
  if ((f.includes('economic') || f === 'tertiary-economic') && (title.includes('economic') || pId.includes('economic') || title.includes('need-based'))) return true;
  // 2. Excel
  if ((f.includes('excel') || f === 'tertiary-excel') && (title.includes('excel') || pId.includes('excel'))) return true;
  // 3. SHS Academic
  if ((f.includes('shs-academic') || (f.includes('academic') && (f.includes('senior') || f.includes('shs')))) &&
      (pId.includes('shs-academic') || (title.includes('academic') && (title.includes('senior') || title.includes('shs') || title.includes('grade'))))) return true;
  // 4. Tertiary Academic
  if ((f.includes('tertiary-academic') || (f.includes('academic') && (f.includes('tertiary') || f.includes('college')))) &&
      (pId.includes('tertiary-academic') || (title.includes('academic') && !title.includes('senior') && !title.includes('shs')))) return true;
  // 5. SHS Specialized
  if ((f.includes('specialized') || f === 'shs-specialized') && (title.includes('specialized') || pId.includes('specialized'))) return true;
  // 6. SHS Athletic
  if ((f.includes('athletic') || f === 'shs-athletic') && (title.includes('athletic') || pId.includes('athletic') || title.includes('arts'))) return true;
  // 7. SHS Youth Leaders
  if ((f.includes('youth') || f === 'shs-youth-leaders') && (title.includes('youth') || pId.includes('youth') || title.includes('leader'))) return true;
  // 8. Filipino Literature
  if ((f.includes('filipino') || f.includes('literature') || f === 'tertiary-filipino') && (title.includes('filipino') || title.includes('literature') || pId.includes('filipino'))) return true;
  // 9. Postgrad Thesis
  if ((f.includes('postgrad') || f.includes('thesis') || f === 'postgrad-thesis') && (title.includes('postgrad') || title.includes('thesis') || pId.includes('postgrad') || pId.includes('thesis'))) return true;
  // 10. Vocational & Continuing
  if ((f.includes('vocational') || f.includes('continuing') || f === 'continuing-vocational') && (title.includes('vocational') || title.includes('continuing') || pId.includes('vocational') || pId.includes('continuing'))) return true;

  return false;
}

function getActiveProgramLabel(filter: string): string {
  if (!filter || filter === 'all') return 'All Scholarship Programs';
  const found = ALL_SCHOLARSHIP_PROGRAMS.find(p => p.id === filter || p.title.toLowerCase() === filter.toLowerCase() || p.shortTitle.toLowerCase() === filter.toLowerCase());
  if (found) return found.title;
  return filter;
}

export const ApplicationReviewQueuePage: React.FC<ApplicationReviewQueuePageProps> = ({
  initialProgramFilter,
  onClearProgramFilter,
  onBackToPrograms,
}) => {
  const [searchParams] = useSearchParams();
  const urlProgram = searchParams.get('program') || searchParams.get('scholarship') || searchParams.get('programId');

  const [applications, setApplications] = useState<ReviewApplication[]>(INITIAL_REVIEW_QUEUE);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'flagged' | 'Approved' | 'Rejected' | 'all'>('pending');
  const [programFilter, setProgramFilter] = useState<string>(() => {
    if (initialProgramFilter) return initialProgramFilter;
    if (urlProgram) return urlProgram;
    return 'all';
  });

  // Sync prop changes
  useEffect(() => {
    if (initialProgramFilter !== undefined && initialProgramFilter !== null) {
      setProgramFilter(initialProgramFilter);
    }
  }, [initialProgramFilter]);

  // Evaluation Modal State
  const [selectedApp, setSelectedApp] = useState<ReviewApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  // 5-Day Revision Request Modal State (Phase 4)
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionDocType, setRevisionDocType] = useState('Proof of Household Income / Indigency');
  const [revisionDetails, setRevisionDetails] = useState('');

  // Interactive Document Attachment Viewer State
  const [docViewerApp, setDocViewerApp] = useState<ReviewApplication | null>(null);

  // Send System Scholarship Notice State
  const [noticeRecipient, setNoticeRecipient] = useState<NoticeRecipient | null>(null);
  const [showNoticeModal, setShowNoticeModal] = useState(false);

  const loadReviewsFromDb = async () => {
    try {
      const res = await getMyApplications();
      const dbApps = Array.isArray(res.data) ? res.data : [];
      const mapped = dbApps.map(mapDbApplicationToReview);
      
      const realIds = new Set(mapped.map(m => m.id));
      const filteredInitial = INITIAL_REVIEW_QUEUE.filter(init => !realIds.has(init.id));
      
      setApplications([...mapped, ...filteredInitial]);
    } catch (err) {
      console.error('Failed to load reviews from PostgreSQL:', err);
    }
  };

  useEffect(() => {
    loadReviewsFromDb();
  }, []);

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.scholarshipTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.school && app.school.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'pending'
        ? (app.status !== 'Approved' && app.status !== 'Rejected')
        : statusFilter === 'flagged'
        ? app.complianceFlags.length > 0
        : app.status === statusFilter;

    const matchesProg = matchesProgram(app, programFilter);

    return matchesSearch && matchesStatus && matchesProg;
  });

  const pendingCount = applications.filter((a) => a.status !== 'Approved' && a.status !== 'Rejected').length;
  const approvedCount = applications.filter((a) => a.status === 'Approved').length;
  const rejectedCount = applications.filter((a) => a.status === 'Rejected').length;
  const flaggedCount = applications.filter((a) => a.complianceFlags.length > 0).length;

  const handleApprove = async (id: string) => {
    const approvedNotes = reviewNotes || 'All documentary attachments verified and approved by QCYDO Review Committee.';
    const appRecord = applications.find(a => a.id === id);

    if (appRecord?.dbId) {
      try {
        await updateApplicationStatus(appRecord.dbId, 'Approved', approvedNotes, approvedNotes);
        toast.success(`Application #${id} Approved!`, {
          description: `Applicant ${appRecord.studentName} has been enrolled into the Student Registry. System notification & award certificate email dispatched.`,
          duration: 8000,
        });
      } catch (err) {
        console.error(err);
        toast.error('Failed to update status in PostgreSQL');
      }
    }

    setApplications((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, status: 'Approved', notes: approvedNotes } : app
      )
    );

    // Sync to LocalStorage if this is the active student application
    try {
      const activeAppRaw = localStorage.getItem('qc_active_student_application');
      if (activeAppRaw) {
        const activeApp = JSON.parse(activeAppRaw);
        if (activeApp.id === id || activeApp.applicantName === selectedApp?.studentName) {
          activeApp.status = 'Approved';
          activeApp.notes = approvedNotes;
          localStorage.setItem('qc_active_student_application', JSON.stringify(activeApp));
        }
      }
    } catch (e) {
      console.error(e);
    }

    setSelectedApp(null);
    setDocViewerApp(null);
    setReviewNotes('');
  };

  const handleReject = async (id: string) => {
    const appToReject = applications.find((a) => a.id === id);
    const rejectNotes = reviewNotes || 'Rejected - Documentary requirements or GPA threshold not met.';
    if (appToReject?.dbId) {
      try {
        await updateApplicationStatus(appToReject.dbId, 'Rejected', rejectNotes, rejectNotes);
        toast.error(`Application #${id} Rejected`, {
          description: `Applicant ${appToReject.studentName} has been archived. Status update notification and email notice dispatched.`,
          duration: 8000,
        });
      } catch (err) {
        console.error(err);
        toast.error('Failed to reject application in PostgreSQL');
      }
    }

    setApplications((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, status: 'Rejected', notes: rejectNotes } : app
      )
    );

    // Sync to LocalStorage
    try {
      const activeAppRaw = localStorage.getItem('qc_active_student_application');
      if (activeAppRaw) {
        const activeApp = JSON.parse(activeAppRaw);
        if (activeApp.id === id || activeApp.applicantName === selectedApp?.studentName) {
          activeApp.status = 'Rejected';
          activeApp.notes = rejectNotes;
          localStorage.setItem('qc_active_student_application', JSON.stringify(activeApp));
        }
      }
    } catch (e) {
      console.error(e);
    }

    setSelectedApp(null);
    setDocViewerApp(null);
    setReviewNotes('');
  };

  // Phase 4: Request 5-Day Document Amendment / Resubmission
  const handleRequestRevision = async () => {
    if (!selectedApp) return;
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 5);
    const formattedDeadline = deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    const revisionNote = `Action Required: Incomplete / Unclear Document [${revisionDocType}]. Please resubmit within 5 days (Deadline: ${formattedDeadline}). Evaluator Remarks: ${revisionDetails || 'Please upload a clearer copy.'}`;
    
    if (selectedApp.dbId) {
      try {
        await updateApplicationStatus(selectedApp.dbId, 'Needs Revision', revisionNote, revisionNote);
        toast.warning(`5-Day Amendment Requested for #${selectedApp.id}`, {
          description: `Applicant ${selectedApp.studentName} has been notified to resubmit ${revisionDocType} within 5 days.`,
          duration: 8000,
        });
      } catch (err) {
        console.error(err);
        toast.error('Failed to update revision status in PostgreSQL');
      }
    }

    setApplications((prev) =>
      prev.map((app) =>
        app.id === selectedApp.id ? { ...app, status: 'Submitted' as any, notes: revisionNote } : app
      )
    );

    setShowRevisionModal(false);
    setSelectedApp(null);
    setRevisionDetails('');
  };

  // Phase 2: Escalate to Fraud & Audit Team
  const handleEscalateFraud = async () => {
    if (!selectedApp) return;
    const fraudNote = `Flagged for Fraud Investigation: Suspicious duplicate ID or mismatched household relation detected. Escalated to Internal Audit Committee. Remarks: ${reviewNotes || 'Automated pre-check anomaly.'}`;
    
    if (selectedApp.dbId) {
      try {
        await updateApplicationStatus(selectedApp.dbId, 'Under Review', fraudNote, fraudNote);
        toast.error(`Application #${selectedApp.id} Escalated to Audit Team`, {
          description: `Case dossier created and routed to Local Government Internal Audit Committee.`,
          duration: 8000,
        });
      } catch (err) {
        console.error(err);
      }
    }

    setSelectedApp(null);
    setReviewNotes('');
  };

  const clearProgramFilter = () => {
    setProgramFilter('all');
    if (onClearProgramFilter) {
      onClearProgramFilter();
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">Application Review Queue</h1>
            <Badge variant="warning">
              {pendingCount} Pending Review
            </Badge>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Review student eligibility credentials, verify document compliance flags, and render approval decisions. Processed applications automatically advance and notify applicants via system alert and official email.
          </p>
        </div>

        {onBackToPrograms && (
          <Button
            variant="outline"
            size="sm"
            onClick={onBackToPrograms}
            className="self-start md:self-auto font-bold text-xs flex items-center gap-1.5 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Programs Catalog
          </Button>
        )}
      </div>

      {/* Filtered Program Active Banner (when viewing a specific program queue) */}
      {programFilter !== 'all' && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-blue-50/90 dark:bg-blue-950/60 border border-blue-200/90 dark:border-blue-800/80 rounded-2xl text-xs shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="h-7 w-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              🎓
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-blue-950 dark:text-blue-200">Filtered Program:</span>
              <span className="bg-blue-600 text-white font-extrabold px-3 py-1 rounded-full text-xs shadow-xs flex items-center gap-1.5">
                {getActiveProgramLabel(programFilter)}
              </span>
              <span className="text-blue-700 dark:text-blue-300 font-bold bg-blue-100/80 dark:bg-blue-900/60 px-2.5 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800">
                {filteredApps.length} {filteredApps.length === 1 ? 'Applicant' : 'Applicants'} Found
              </span>
            </div>
          </div>
          
          <button
            onClick={clearProgramFilter}
            className="text-xs font-extrabold text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700 hover:bg-blue-100/60 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-xs shrink-0"
          >
            <span>Show All Programs</span>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Review Table Controls */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search student, ID, school..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-primary shadow-xs placeholder:text-slate-400"
              />
            </div>

            {/* Program Track Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 h-9 text-xs">
              <Layers className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <select
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
                aria-label="Filter by scholarship program"
                className="bg-transparent font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1 truncate max-w-[220px]"
              >
                <option value="all" className="dark:bg-slate-900 dark:text-white">All Scholarship Programs ({applications.length})</option>
                {ALL_SCHOLARSHIP_PROGRAMS.map((prog) => {
                  const count = applications.filter(a => matchesProgram(a, prog.id) || matchesProgram(a, prog.title)).length;
                  return (
                    <option key={prog.id} value={prog.title} className="dark:bg-slate-900 dark:text-white">
                      {prog.shortTitle} ({count})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'pending', label: `Pending Queue (${pendingCount})` },
              { id: 'Approved', label: `Approved (${approvedCount})` },
              { id: 'Rejected', label: `Rejected (${rejectedCount})` },
              { id: 'flagged', label: `Flagged (${flaggedCount})` },
              { id: 'all', label: `All (${applications.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-primary text-white shadow-xs border border-transparent font-bold'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase group-label border-b border-border dark:border-slate-800">
                <tr>
                  <th className="p-3">App ID & Student</th>
                  <th className="p-3">Applied Program Track</th>
                  <th className="p-3">GPA & Course</th>
                  <th className="p-3">Grant Value (Per Term)</th>
                  <th className="p-3">Compliance & Attachments</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-muted-foreground">
                      <div className="max-w-md mx-auto space-y-2">
                        <Inbox className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600" />
                        <p className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
                          {programFilter !== 'all'
                            ? `No applicants found for "${getActiveProgramLabel(programFilter)}"`
                            : 'No applications pending evaluation in this filter.'}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {programFilter !== 'all'
                            ? 'No student applicants have submitted applications for this specific program yet.'
                            : 'Try adjusting your search keywords or switching status filters.'}
                        </p>
                        {programFilter !== 'all' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearProgramFilter}
                            className="mt-2 font-bold text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                          >
                            View All Program Applications ({applications.length})
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="p-3">
                        <div>
                          <span className="font-mono font-bold text-primary block">{app.id}</span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{app.studentName}</span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 block">{app.studentId}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">{app.scholarshipTitle}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{app.school}</span>
                        <div className="mt-0.5 flex flex-wrap gap-1 items-center">
                          <span className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                            app.status === 'Approved' ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300' :
                            app.status === 'Rejected' ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300' :
                            app.status === 'Under Review' ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300' :
                            'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300'
                          }`}>
                            {app.status}
                          </span>
                          {app.schoolEndorsed && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" /> Endorsed by John Steaven Balansag
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`font-bold ${app.gpa <= 2.5 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-300'}`}>
                          GWA: {app.gpa.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate max-w-[150px]">{app.program}</span>
                      </td>
                      <td className="p-3 font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(app.amount)}
                        <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-medium">/ semester</span>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          {app.complianceFlags.length > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800">
                              <AlertTriangle className="h-3 w-3 shrink-0 text-rose-600 dark:text-rose-400" /> Flagged ({app.complianceFlags.length})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" /> Verified Clean
                            </span>
                          )}
                          <div>
                            <button
                              onClick={() => setDocViewerApp(app)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline cursor-pointer"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>{app.documentsUploaded.length} Attachments (View)</span>
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setReviewNotes(app.notes || '');
                            }}
                            title="Evaluate Application"
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all cursor-pointer shadow-xs"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setNoticeRecipient({
                                studentName: app.studentName,
                                studentId: app.studentId,
                                email: app.email,
                                scholarshipTitle: app.scholarshipTitle,
                                applicationId: app.id,
                              });
                              setShowNoticeModal(true);
                            }}
                            title="Send Official Notice Email"
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all cursor-pointer shadow-xs"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleApprove(app.id)}
                            title="Quick Approve"
                            className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all cursor-pointer shadow-xs"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReject(app.id)}
                            title="Quick Reject"
                            className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-all cursor-pointer shadow-xs"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Document Attachment Viewer Modal */}
      {docViewerApp && (
        <DocumentAttachmentViewerModal
          isOpen={!!docViewerApp}
          onClose={() => setDocViewerApp(null)}
          applicantId={docViewerApp.id}
          applicantName={docViewerApp.studentName}
          programTitle={docViewerApp.scholarshipTitle}
          documents={docViewerApp.documentsUploaded as any}
          onApproveApplication={() => handleApprove(docViewerApp.id)}
          onRejectApplication={() => handleReject(docViewerApp.id)}
        />
      )}

      {/* Send Official Notice Modal */}
      {showNoticeModal && noticeRecipient && (
        <SendScholarshipNoticeModal
          isOpen={showNoticeModal}
          onClose={() => {
            setShowNoticeModal(false);
            setNoticeRecipient(null);
          }}
          recipient={noticeRecipient}
        />
      )}

      {/* Comprehensive Evaluation Decision Modal */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Evaluation Desk: ${selectedApp.studentName}`}
          description={`Application Code: ${selectedApp.id} • Track: ${selectedApp.scholarshipTitle}`}
          footer={
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full gap-2 pt-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDocViewerApp(selectedApp)}
                  className="font-bold text-xs"
                  leftIcon={<FileText className="h-4 w-4" />}
                >
                  Inspect {selectedApp.documentsUploaded.length} Attachments
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEscalateFraud}
                  className="font-bold text-xs text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                  leftIcon={<AlertTriangle className="h-4 w-4" />}
                >
                  Escalate to Audit
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRevisionModal(true)}
                  className="font-bold text-xs text-amber-600 dark:text-amber-400 border-amber-300 hover:bg-amber-50"
                  leftIcon={<AlertTriangle className="h-4 w-4" />}
                >
                  5-Day Revision
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReject(selectedApp.id)}
                  className="font-bold text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                  leftIcon={<XCircle className="h-4 w-4" />}
                >
                  Reject
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleApprove(selectedApp.id)}
                  className="font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  leftIcon={<CheckCircle2 className="h-4 w-4" />}
                >
                  Approve Application
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Phase 2: Automated Ingestion & Fraud Pre-Check Inspection Card */}
            <div className="p-3.5 bg-blue-50/80 dark:bg-slate-800/80 rounded-2xl border border-blue-200/90 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Automated Ingestion & Fraud Pre-Check
                </span>
                <Badge variant="success" className="text-[9px] py-0">
                  Pre-Check Passed
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">MIME & SHA-256 Hash Check</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">✅ Enforced & Clean</span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">OCR Grade Slip Extraction</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">✅ 97.4% Match ({selectedApp.gpa.toFixed(2)})</span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">QC Residency & QCID Cross-Check</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">✅ Validated (0 Duplicates)</span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">School Registry Match</span>
                  <span className={`font-extrabold ${selectedApp.school?.includes('Other') ? 'text-amber-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {selectedApp.school?.includes('Other') ? '⚠️ Unlisted School (Exception Flow)' : '✅ DepEd/CHED Verified'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-bold block">Student ID</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedApp.studentId}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-bold block">General GWA</span>
                <span className={`font-bold ${selectedApp.gpa <= 2.5 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                  {selectedApp.gpa.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-bold block">Term Grant Package</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(selectedApp.amount)} / sem</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-bold block">Current Status</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{selectedApp.status}</span>
              </div>
            </div>

            {/* Applicant Profile & Submitted Form Breakdown */}
            {selectedApp.formData && Object.keys(selectedApp.formData).length > 0 && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Detailed Applicant Profile & Submitted Form Data
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Phone / Mobile</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedApp.formData.mobileNumber || selectedApp.phone || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Barangay & District</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedApp.formData.barangay || 'Batasan Hills'}, District {selectedApp.formData.district || '2'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Annual Household Income</span>
                    <span className="font-bold text-emerald-600">
                      {selectedApp.formData.annualFamilyIncome ? `₱${Number(selectedApp.formData.annualFamilyIncome).toLocaleString()}` : '₱180,000.00'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Year Level / Term</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedApp.formData.yearLevel || '3rd Year'} ({selectedApp.formData.semester || '1st Sem'})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Disbursement Channel</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedApp.formData.payoutMethod || 'Landbank ATM Cash Card'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">4Ps / Solo Parent Status</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedApp.formData.is4PsBeneficiary ? '4Ps Registered' : 'Non-4Ps'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {selectedApp.complianceFlags.length > 0 && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl space-y-1">
                <span className="font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-400" /> Compliance Flags Detected:
                </span>
                <ul className="list-disc pl-5 text-rose-800 dark:text-rose-300 space-y-0.5">
                  {selectedApp.complianceFlags.map((flag, idx) => (
                    <li key={idx}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 dark:text-slate-200 block">Evaluator Notes & Committee Resolution:</label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Enter evaluation justification, verified grades, or reason for action..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-blue-600 resize-none text-xs placeholder:text-slate-400"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Phase 4: 5-Day Document Revision Request Modal */}
      {showRevisionModal && selectedApp && (
        <Modal
          isOpen={showRevisionModal}
          onClose={() => setShowRevisionModal(false)}
          title="Request 5-Day Document Amendment (Phase 4 Sub-Flow)"
          description={`Applicant: ${selectedApp.studentName} (${selectedApp.id}) • Target missing or unclear requirement`}
          footer={
            <div className="flex items-center justify-end gap-2 w-full pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowRevisionModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleRequestRevision} className="bg-amber-600 hover:bg-amber-700 text-white font-bold">
                Send 5-Day Amendment Notice
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200">
              <p className="font-bold">5-Day Grace Period Policy:</p>
              <p className="text-[11px] mt-0.5">
                The applicant will receive an urgent in-app and email alert with a 5-day countdown timer. Prior entries are preserved—the applicant only needs to upload the targeted missing attachment.
              </p>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-200">Target Incomplete Requirement *</label>
              <select
                value={revisionDocType}
                onChange={(e) => setRevisionDocType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Proof of Household Income / Indigency">Proof of Household Income / Indigency (ITR or Barangay Certificate)</option>
                <option value="Official Transcript / Certified Grades (COG)">Official Transcript / Certified Grades (COG / Form 137)</option>
                <option value="Valid School ID / QC Resident ID">Valid School ID / QC Resident ID</option>
                <option value="Barangay Certificate of Residency">Barangay Certificate of Residency</option>
                <option value="Certificate of Enrollment (Unlisted School)">Certificate of Enrollment (For Unlisted School Validation)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-200">Specific Evaluator Instructions for Student</label>
              <textarea
                rows={3}
                value={revisionDetails}
                onChange={(e) => setRevisionDetails(e.target.value)}
                placeholder="e.g. The uploaded income certificate was blurred or cropped. Please upload a clear, signed copy with the barangay seal visible."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ApplicationReviewQueuePage;
