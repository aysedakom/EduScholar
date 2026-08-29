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
import { ALL_SCHOLARSHIP_PROGRAMS } from '../../utils/scholarshipPrograms';
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
}

export interface ApplicationReviewQueuePageProps {
  initialProgramFilter?: string | null;
  onClearProgramFilter?: () => void;
  onBackToPrograms?: () => void;
}

const INITIAL_REVIEW_QUEUE: ReviewApplication[] = [];

function mapDbApplicationToReview(app: Application): ReviewApplication {
  const formData = app.form_data || {};
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
      }))
    : [];

  let status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' = 'Submitted';
  const rawStatus = String(app.status || '');
  if (app.status === 'Approved' || app.status === 'Paid') {
    status = 'Approved';
  } else if (app.status === 'Rejected') {
    status = 'Rejected';
  } else if (app.status === 'Under Review' || app.status === 'Interview Scheduled' || rawStatus.includes('Endorsed') || rawStatus.includes('Verified')) {
    status = 'Under Review';
  }

  const isSchoolEndorsed = rawStatus.toLowerCase().includes('endorse') || rawStatus.toLowerCase().includes('verified');

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
    amount: Number(app.amount) || 20000,
    submissionDate: parseIsoDateStr(app.submission_date || app.submissionDate),
    status: status,
    complianceFlags: complianceFlags,
    documentsUploaded: documentsUploaded,
    notes: app.notes || 'Submitted through E-SCHOLAR Portal with complete attachments.',
    schoolEndorsed: isSchoolEndorsed,
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'flagged' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected'>('all');
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
      statusFilter === 'all' ||
      (statusFilter === 'flagged' && app.complianceFlags.length > 0) ||
      app.status === statusFilter;

    const matchesProg = matchesProgram(app, programFilter);

    return matchesSearch && matchesStatus && matchesProg;
  });

  const handleApprove = async (id: string) => {
    const approvedNotes = reviewNotes || 'All documentary attachments verified and approved by QCYDO Review Committee.';
    const appRecord = applications.find(a => a.id === id);

    if (appRecord?.dbId) {
      try {
        await updateApplicationStatus(appRecord.dbId, 'Approved', approvedNotes, approvedNotes);
        toast.success(`Application ${id} APPROVED in database!`);
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
        toast.error(`Application ${id} REJECTED in database!`);
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
              {applications.filter((a) => a.status !== 'Approved' && a.status !== 'Rejected').length} Total Pending
            </Badge>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Review student eligibility credentials, verify document compliance flags, and render approval decisions.
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
              { id: 'all', label: 'All Status' },
              { id: 'flagged', label: 'Flagged' },
              { id: 'Submitted', label: 'Submitted' },
              { id: 'Under Review', label: 'Under Review' },
              { id: 'Approved', label: 'Approved' },
              { id: 'Rejected', label: 'Rejected' },
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
                  <th className="p-3">Grant Value</th>
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
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" /> School Endorsed
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
                      <td className="p-3 font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(app.amount)}</td>
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
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDocViewerApp(selectedApp)}
                className="font-bold text-xs"
                leftIcon={<FileText className="h-4 w-4" />}
              >
                Inspect All {selectedApp.documentsUploaded.length} Attachments
              </Button>
              <div className="flex gap-2">
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
                <span className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-bold block">Award Value</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(selectedApp.amount)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-bold block">Current Status</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{selectedApp.status}</span>
              </div>
            </div>

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
    </div>
  );
};

export default ApplicationReviewQueuePage;
