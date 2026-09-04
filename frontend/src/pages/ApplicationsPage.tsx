import React, { useState, useEffect } from 'react';
import {
  Award,
  XCircle,
  Clock,
  UploadCloud,
  Lock,
  Calendar,
  ArrowLeft,
  Building2,
} from 'lucide-react';
import { getMyApplications, resubmitApplicationDocument } from '../api/applications';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { formatCurrency, formatDate } from '../utils/cn';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { ScholarshipAwardCertificateModal } from '../components/common/ScholarshipAwardCertificateModal';
import { ExamSchedulePermitModal } from '../components/common/ExamSchedulePermitModal';

// Real-time 5-Day Countdown Timer Component (Phase 4 Sub-Flow)
const CountdownTimer: React.FC<{ submissionDate?: string }> = ({ submissionDate }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number; expired: boolean }>({
    days: 4,
    hours: 23,
    minutes: 59,
    seconds: 59,
    expired: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const baseDate = submissionDate ? new Date(submissionDate) : new Date();
      // 5-day grace period
      const deadline = new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000);
      const diff = deadline.getTime() - new Date().getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, expired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [submissionDate]);

  if (timeLeft.expired) {
    return (
      <span className="bg-rose-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
        🔴 Window Expired
      </span>
    );
  }

  const isUrgent = timeLeft.days === 0;
  const isModerate = timeLeft.days <= 2;

  return (
    <span
      className={`font-extrabold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs ${
        isUrgent
          ? 'bg-rose-600 text-white animate-pulse'
          : isModerate
          ? 'bg-amber-600 text-white'
          : 'bg-emerald-600 text-white'
      }`}
    >
      <Clock className="h-3 w-3" />
      <span>
        Remaining: {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
      </span>
    </span>
  );
};

export const ApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [certificateApp, setCertificateApp] = useState<any | null>(null);
  const [examPermitApp, setExamPermitApp] = useState<any | null>(null);

  // 5-Day Targeted Amendment Resubmission Modal State (Phase 4)
  const [resubmitModalApp, setResubmitModalApp] = useState<any | null>(null);
  const [resubmitFile, setResubmitFile] = useState<File | null>(null);
  const [resubmitCategory, setResubmitCategory] = useState('Proof of Income / Indigency');
  const [isSubmittingDoc, setIsSubmittingDoc] = useState(false);

  const load = async () => {
    try {
      const res = await getMyApplications();
      const apiData = res.data || [];
      const savedApps = JSON.parse(localStorage.getItem('student_applications') || '[]');

      const localMapped = savedApps.map((app: any) => ({
        id: app.id ?? `app-${Math.random()}`,
        scholarshipId: app.scholarshipId || 'SCH-QCSP-2026',
        scholarshipTitle: app.scholarshipTitle || 'Quezon City Scholarship Program (QCSP) 2026-2027',
        amount: app.amount ?? 10000,
        status: (app.status === 'Approved' ? 'approved' : app.status === 'Paid' ? 'approved' : app.status === 'Rejected' ? 'rejected' : app.status === 'Needs Revision' ? 'action_required' : app.status === 'Under Review' ? 'pending' : (app.status || 'pending')) as any,
        submissionDate: app.submissionDate ?? app.submitted_at?.split('T')[0] ?? new Date().toISOString().split('T')[0],
        requirementsCount: app.requirementsCount ?? 5,
        completedRequirements: app.completedRequirements ?? 5,
        notes: app.notes ?? 'All requirements attached & verified. In review by QCYDO evaluation desk.',
      }));

      if (apiData.length > 0) {
        const apiMapped = apiData.map((app: any) => {
          const rawStatus = String(app.status || '');
          let mappedStatus: 'approved' | 'rejected' | 'pending' | 'action_required' = 'pending';
          if (rawStatus === 'Approved' || rawStatus === 'Paid') mappedStatus = 'approved';
          else if (rawStatus === 'Rejected') mappedStatus = 'rejected';
          else if (rawStatus === 'Needs Revision' || rawStatus === 'Incomplete' || rawStatus === 'action_required') mappedStatus = 'action_required';
          
          const refId =
            app.reference_id ||
            app.application_code ||
            (app.id ? `APP-QC-2026-${String(app.id).padStart(4, '0')}` : 'APP-QC-2026');

          return {
            id: app.id ?? `app-${Math.random()}`,
            referenceId: refId,
            scholarshipId: refId,
            scholarshipTitle: app.title ?? app.program_name ?? 'Quezon City Scholarship Program',
            amount: app.amount ?? 0,
            status: mappedStatus,
            submissionDate: app.submission_date ?? app.submitted_at ?? app.created_at ?? new Date().toISOString().split('T')[0],
            requirementsCount: app.requirements_count ?? 4,
            completedRequirements: app.completed_requirements ?? 4,
            notes: app.notes ?? '',
          };
        });
        setApplications([...apiMapped, ...localMapped.filter((l: any) => !apiMapped.some((a: any) => String(a.id) === String(l.id)))]);
      } else {
        setApplications(localMapped);
      }
    } catch {
      const savedApps = JSON.parse(localStorage.getItem('student_applications') || '[]');
      const localMapped = savedApps.map((app: any) => ({
        id: app.id ?? `app-${Math.random()}`,
        scholarshipId: app.scholarshipId || 'SCH-QCSP-2026',
        scholarshipTitle: app.scholarshipTitle || 'Quezon City Scholarship Program (QCSP) 2026-2027',
        amount: app.amount ?? 10000,
        status: (app.status === 'Approved' ? 'approved' : app.status === 'Paid' ? 'approved' : app.status === 'Rejected' ? 'rejected' : app.status === 'Needs Revision' ? 'action_required' : app.status === 'Under Review' ? 'pending' : (app.status || 'pending')) as any,
        submissionDate: app.submissionDate ?? app.submitted_at?.split('T')[0] ?? new Date().toISOString().split('T')[0],
        requirementsCount: app.requirementsCount ?? 5,
        completedRequirements: app.completedRequirements ?? 5,
        notes: app.notes ?? 'All requirements attached & verified. In review by QCYDO evaluation desk.',
      }));
      setApplications(localMapped);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (f.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds 10MB limit');
        return;
      }
      setResubmitFile(f);
    }
  };

  const handleExecuteResubmission = async () => {
    if (!resubmitModalApp) return;
    if (!resubmitFile) {
      toast.error('Please select the replacement document file first.');
      return;
    }

    setIsSubmittingDoc(true);
    try {
      // Convert to DataUrl for preview storage
      const reader = new FileReader();
      reader.onload = async () => {
        const fileData = reader.result as string;
        try {
          await resubmitApplicationDocument(resubmitModalApp.id, {
            documentId: resubmitCategory.toLowerCase().replace(/\s+/g, '_'),
            name: resubmitFile.name,
            size: `${(resubmitFile.size / (1024 * 1024)).toFixed(2)} MB`,
            fileData,
            category: resubmitCategory,
          });

          toast.success('Document Resubmitted Successfully!', {
            description: `Your ${resubmitCategory} has been re-uploaded. Application status returned to "Under Review".`,
            duration: 8000,
          });

          setResubmitModalApp(null);
          setResubmitFile(null);
          load();
        } catch (apiErr: any) {
          toast.error(apiErr.response?.data?.message || 'Failed to submit document. Please try again.');
        } finally {
          setIsSubmittingDoc(false);
        }
      };
      reader.readAsDataURL(resubmitFile);
    } catch (err: any) {
      toast.error('File reading failed: ' + err.message);
      setIsSubmittingDoc(false);
    }
  };

  const isStaffOrCoordinator = user?.role === 'school_coordinator' || user?.role === 'admin' || user?.role === 'system_admin' || user?.role === 'supervisor';
  const partnerSchoolRoute = user?.role === 'school_coordinator' ? '/school/partner-schools' : '/admin/partner-schools';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-soft border border-slate-200 dark:border-slate-800">
        <div>
          {/* Breadcrumb Navigation Matching Exact Design */}
          {isStaffOrCoordinator && (
            <div className="flex items-center gap-2 mb-1.5">
              <Link
                to={partnerSchoolRoute}
                className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Partner School Database
              </Link>
              <span className="text-slate-400 text-xs">/</span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Applications & Document Tracker</span>
            </div>
          )}
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-slate-900 dark:text-white">
            Application Progress & Document Vault Tracker
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
            Track real-time status of submitted scholarship applications, review verification stages, and manage required document vault uploads.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isStaffOrCoordinator && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(partnerSchoolRoute)}
              className="font-bold text-xs border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950"
              leftIcon={<Building2 className="h-4 w-4" />}
            >
              Partner Schools
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => navigate('/documents')}>
            Document Vault
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/scholar-prog-available')} className="font-bold">
            Apply for Scholarship
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {applications.length === 0 ? (
          <Card className="p-8 text-center bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="max-w-md mx-auto space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto text-xl font-bold">
                📋
              </div>
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">No Submitted Applications Found</h3>
              <p className="text-xs text-slate-500">
                You haven't submitted any scholarship applications for the current academic year yet.
              </p>
              <Button variant="primary" size="sm" onClick={() => navigate('/scholar-prog-available')} className="font-bold">
                Browse Open Programs
              </Button>
            </div>
          </Card>
        ) : (
          applications.map((app) => (
            <Card key={app.id} hoverEffect className="overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <div className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">{app.scholarshipTitle}</h3>
                      <Badge
                        variant={
                          app.status === 'approved'
                            ? 'success'
                            : app.status === 'rejected'
                              ? 'destructive'
                              : app.status === 'action_required'
                                ? 'warning'
                                : 'info'
                        }
                      >
                        {app.status === 'approved' && 'Approved & Verified'}
                        {app.status === 'rejected' && 'Not Approved'}
                        {app.status === 'pending' && 'Under Review'}
                        {app.status === 'action_required' && '5-Day Amendment Requested'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                      <span>Submitted on {formatDate(app.submissionDate || app.submission_date || new Date().toISOString())}</span>
                      <span>•</span>
                      <span>Reference ID:</span>
                      <code className="font-mono font-bold text-[11px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                        {app.referenceId || app.scholarshipId || app.reference_id || (app.id ? `APP-QC-2026-${app.id}` : 'APP-QC-2026')}
                      </code>
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Award Amount</span>
                    <span className="font-heading font-extrabold text-xl text-primary dark:text-blue-400">{formatCurrency(app.amount)}</span>
                  </div>
                </div>

                {/* Status-specific Alerts and Action Banners */}
                {/* Phase 4: Dedicated 5-Day Amendment Banner */}
                {app.status === 'action_required' && (
                  <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-600 text-white shadow-xs shrink-0 mt-0.5">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-amber-950 dark:text-amber-200 text-xs">
                            Targeted Amendment Required (5-Day Correction Window)
                          </span>
                          <CountdownTimer submissionDate={app.submissionDate || app.submission_date} />
                        </div>
                        <p className="text-xs text-amber-900 dark:text-amber-300 mt-0.5">
                          {app.notes || 'The review committee flagged an incomplete or unclear document. Please resubmit the requested item.'}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setResubmitModalApp(app);
                        setResubmitFile(null);
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 shadow-xs flex items-center gap-1.5"
                    >
                      <UploadCloud className="h-4 w-4" />
                      Resubmit Missing Document
                    </Button>
                  </div>
                )}

                {/* Phase 5: State Locking & Award Conferred Banner */}
                {app.status === 'approved' && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs shrink-0 mt-0.5">
                        <Award className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-emerald-950 dark:text-emerald-200 text-xs">
                            Official Government Scholar Qualification Conferred
                          </span>
                          <Badge variant="success" className="text-[9px] py-0 px-1.5">
                            QCSP Certified
                          </Badge>
                          <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                            <Lock className="h-3 w-3" /> Record Locked
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-800 dark:text-emerald-300/90 mt-0.5 font-medium">
                          Your profile is locked for Treasury Batch Settlement. For amendments, raise a ticket via Messages.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Examination Permit for Merit Programs */}
                      {String(app.scholarshipTitle).toLowerCase().includes('merit') || String(app.scholarshipTitle).toLowerCase().includes('academic') ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setExamPermitApp(app)}
                          leftIcon={<Calendar className="h-4 w-4 text-blue-600" />}
                          className="font-bold text-xs bg-white dark:bg-slate-800 border-blue-200 text-blue-700 dark:text-blue-300"
                        >
                          Exam Permit
                        </Button>
                      ) : null}

                      {/* Official Certificate */}
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setCertificateApp(app)}
                        leftIcon={<Award className="h-4 w-4" />}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                      >
                        View Certificate
                      </Button>
                    </div>
                  </div>
                )}

                {/* Rejected Banner */}
                {app.status === 'rejected' && (
                  <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-rose-600 text-white shadow-xs shrink-0">
                        <XCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-rose-950 dark:text-rose-200 text-xs">
                            Application Evaluation Decision: Not Approved
                          </span>
                          <Badge variant="destructive" className="text-[9px] py-0 px-1.5">
                            Ineligible for Current Term
                          </Badge>
                        </div>
                        <p className="text-[11px] text-rose-800 dark:text-rose-300/90 mt-0.5 font-medium">
                          {app.notes || 'Documentary requirements or academic threshold criteria were not met. You are welcome to submit updated documents in the next application window.'}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/scholar-prog-available')}
                      className="border-rose-300 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 font-bold text-xs shrink-0"
                    >
                      Browse Other Programs
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold block">Requirements Completed</span>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {app.completedRequirements ?? 4} / {app.requirementsCount ?? 4}
                      </span>
                      <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                        {Math.round(((app.completedRequirements ?? 4) / (app.requirementsCount ?? 4)) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${Math.min(100, Math.round(((app.completedRequirements ?? 4) / (app.requirementsCount ?? 4)) * 100))}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold block">Disbursement Channel</span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      Direct Tuition / Landbank ATM Payroll
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold block">Reviewer Notes</span>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] line-clamp-2">{app.notes || 'Under review by QCYDO Secretariat.'}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Phase 4: Dedicated 5-Day Document Amendment Upload Modal */}
      {resubmitModalApp && (
        <Modal
          isOpen={!!resubmitModalApp}
          onClose={() => setResubmitModalApp(null)}
          title="Dedicated Correction Dashboard (Phase 4 Sub-Flow)"
          description={`Application Code: ${resubmitModalApp.id} • Retains all prior entries; upload replacement only`}
          footer={
            <div className="flex items-center justify-end gap-2 w-full pt-2">
              <Button variant="outline" size="sm" onClick={() => setResubmitModalApp(null)} disabled={isSubmittingDoc}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleExecuteResubmission}
                disabled={isSubmittingDoc || !resubmitFile}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
              >
                {isSubmittingDoc ? 'Uploading & Verifying...' : 'Submit Replacement Document'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200">
              <p className="font-bold">Evaluator Request:</p>
              <p className="text-[11px] mt-0.5">
                {resubmitModalApp.notes || 'Please upload a clearer, certified copy of the requested document to proceed with evaluation.'}
              </p>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-200">Requirement Category *</label>
              <select
                value={resubmitCategory}
                onChange={(e) => setResubmitCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Proof of Income / Indigency">Proof of Income / Indigency (ITR or Barangay Certificate)</option>
                <option value="Academic Transcript / Certified Grades">Academic Transcript / Certified Grades (COG / Form 137)</option>
                <option value="Valid School ID / QC Resident ID">Valid School ID / QC Resident ID</option>
                <option value="Barangay Certificate of Residency">Barangay Certificate of Residency</option>
                <option value="Certificate of Enrollment">Certificate of Enrollment (Unlisted School)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-200">Select Replacement File (PDF, PNG, JPG - Max 10MB) *</label>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none cursor-pointer"
              />
              {resubmitFile && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                  Selected: {resubmitFile.name} ({(resubmitFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Official Certificate of Scholarship Award Modal */}
      {certificateApp && (
        <ScholarshipAwardCertificateModal
          isOpen={!!certificateApp}
          onClose={() => setCertificateApp(null)}
          applicationId={certificateApp.id}
          applicantName={user?.name || 'Pia Marie T. Faner'}
          applicantEmail={user?.email || 'piamariefaner2004@gmail.com'}
          studentId={user?.student_id || '23010366'}
          programTitle={certificateApp.scholarshipTitle}
          awardAmount={certificateApp.amount}
          school={user?.department || 'Bestlink College of the Philippines (BCP)'}
          course={user?.major || 'B.S. Information Technology'}
          gpa={user?.gpa || 1.50}
        />
      )}

      {/* Official Examination Schedule & Testing Permit Modal (Phase 5) */}
      {examPermitApp && (
        <ExamSchedulePermitModal
          isOpen={!!examPermitApp}
          onClose={() => setExamPermitApp(null)}
          applicantName={user?.name || 'Pia Marie T. Faner'}
          studentId={user?.student_id || '23010366'}
          programTitle={examPermitApp.scholarshipTitle}
          applicationCode={`QCSP-${examPermitApp.id}`}
        />
      )}
    </div>
  );
};

