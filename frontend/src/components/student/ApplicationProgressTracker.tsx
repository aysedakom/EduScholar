import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Clock, XCircle, FileText, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { getMyApplications } from '../../api/applications';
import { Link } from 'react-router-dom';
import { clearActiveStudentApplication } from '../../utils/scholarshipPrograms';
import { useWebSocket } from '../../context/WebSocketContext';

export interface StudentApplicationItem {
  refNumber: string;
  dateFiled: string;
  category: string;
  yearLevel: string;
  semester: string;
  statusStage: number; // 1 to 6
  statusLabel: string;
  statusType: 'in_progress' | 'approved' | 'rejected';
  validationRemark: string;
  progressPercent: number;
}

// 6 Official Scholarship Milestones
const MILESTONES = [
  { step: 1, name: 'Application', desc: 'Form Filed & Encoded' },
  { step: 2, name: 'Document Review', desc: 'Vault OCR Verification' },
  { step: 3, name: 'Eligibility', desc: 'GWA & Residency Check' },
  { step: 4, name: 'Assessment', desc: 'QCYDO Board Scoring' },
  { step: 5, name: 'Approval', desc: 'Board Final Decision' },
  { step: 6, name: 'Confirmation', desc: 'Stipend Remittance' },
];

/**
 * Maps live database status & progress to the 6 official scholarship stages
 * confirming transitions across Student, Coordinator, Supervisor, Admin, and Treasury.
 */
function resolveApplicationStage(app: any): {
  stage: number;
  label: string;
  type: 'in_progress' | 'approved' | 'rejected';
  remark: string;
  progress: number;
} {
  const status = String(app.status || '').toLowerCase().trim();
  const remarks = app.remarks || app.notes || '';

  // 1. Stage 6: Paid / Disbursed / Remitted (Confirmed by City Treasury)
  if (
    status === 'paid' ||
    status === 'disbursed' ||
    status === 'completed' ||
    status === 'released' ||
    status === 'confirmed & disbursed' ||
    status === 'transferred & credited'
  ) {
    return {
      stage: 6,
      label: 'Confirmed & Disbursed',
      type: 'approved',
      remark: remarks || 'Educational grant and semestral stipend remitted directly to scholar e-wallet / Landbank card by City Treasury.',
      progress: 100,
    };
  }

  // 2. Stage 6 (In-progress remittance): Approved / Granted (Passed Stage 5 Board Approval, advanced to Treasury Remittance)
  if (status === 'approved' || status === 'granted') {
    return {
      stage: 6,
      label: 'Approved / Granted',
      type: 'approved',
      remark: remarks || 'Congratulations! Your scholarship application has been officially approved by the QCYDO Board and advanced to Confirmation & Stipend Remittance.',
      progress: 90,
    };
  }

  if (status === 'rejected' || status === 'disapproved' || status === 'denied') {
    return {
      stage: 5,
      label: 'Disapproved',
      type: 'rejected',
      remark: remarks || 'Application disapproved due to non-fulfillment of GWA minimum threshold or incomplete requirements.',
      progress: 83,
    };
  }

  // 3. Stage 4: Assessment / Supervisor Evaluation / Board Scoring
  if (
    status === 'interview scheduled' ||
    status === 'assessment' ||
    status === 'assessment phase' ||
    status === 'screening' ||
    status === 'shortlisted' ||
    status === 'evaluated' ||
    status.includes('assess') ||
    status.includes('evaluat') ||
    status.includes('board scoring')
  ) {
    return {
      stage: 4,
      label: 'Assessment Phase',
      type: 'in_progress',
      remark: remarks || 'QCYDO Evaluation Board and Supervisor assessing financial need scoring and semestral grant allocation.',
      progress: 66,
    };
  }

  // 4. Stage 3: Eligibility & School Endorsement (Confirmed by School Coordinator)
  if (
    status === 'eligibility' ||
    status === 'eligible' ||
    status === 'eligibility verified' ||
    status === 'school endorsed' ||
    status.includes('endorse') ||
    status.includes('school')
  ) {
    return {
      stage: 3,
      label: 'Eligibility & School Endorsed',
      type: 'in_progress',
      remark: remarks || 'Academic standing, enrolled units, and QC residency officially verified and endorsed by the School Coordinator.',
      progress: 50,
    };
  }

  // 5. Stage 2: Document Review / Under Review / Pending Screening
  if (
    status === 'under review' ||
    status === 'pending' ||
    status === 'in review' ||
    status === 'reviewing' ||
    status === 'document review'
  ) {
    return {
      stage: 2,
      label: 'Under Document Review',
      type: 'in_progress',
      remark: remarks || 'Application submitted. Documents and uploaded credentials are currently queued for verification by the QCYDO Screening Committee.',
      progress: 33,
    };
  }

  // 6. Stage 1: Application Form Encoded / Submitted
  return {
    stage: 1,
    label: 'Application Encoded',
    type: 'in_progress',
    remark: remarks || 'Application form successfully submitted and encoded into the system database.',
    progress: 16,
  };
}

export const ApplicationProgressTracker: React.FC = () => {
  const { user } = useAuth();
  const { subscribeToTable } = useWebSocket();
  const [appData, setAppData] = useState<StudentApplicationItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  const fetchApplicationData = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      // 1. Fetch live data directly from PostgreSQL Backend API
      const res = await getMyApplications();
      const apps = Array.isArray(res?.data) ? res.data : [];

      if (apps.length > 0) {
        const latest = apps[0];
        const stageInfo = resolveApplicationStage(latest);

        setAppData({
          refNumber: latest.reference_id || latest.application_code || (latest.id ? `APP-QC-${latest.id}` : 'APP-QC-2026'),
          dateFiled: latest.submission_date || latest.submissionDate || (latest.created_at ? latest.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
          category: latest.program_name || latest.title || 'Quezon City Scholarship Program',
          yearLevel: user?.basicProfile?.yearLevel || 'Enrolled Student',
          semester: '1st Semester AY 2026-2027',
          statusStage: stageInfo.stage,
          statusLabel: stageInfo.label,
          statusType: stageInfo.type,
          validationRemark: stageInfo.remark,
          progressPercent: stageInfo.progress,
        });
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        return;
      }

      // 2. Server returned 0 applications: Database is verified empty!
      // Purge any stale client-side cache so fake/static data is NEVER shown
      clearActiveStudentApplication(user?.email);
      setAppData(null);
    } catch (err) {
      console.warn('[ApplicationProgressTracker] Real-time fetch error:', err);
      // In case of network error, do NOT resurrect stale local storage records
      // Ground truth resides on the server
      clearActiveStudentApplication(user?.email);
      setAppData(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    fetchApplicationData(true);
  }, [fetchApplicationData]);

  // 1. Instant WebSocket Real-time Push (0ms delay across all devices)
  useEffect(() => {
    const unsubscribe = subscribeToTable('applications', (event) => {
      console.log('[ApplicationProgressTracker] ⚡ Instant WebSocket application event:', event.action);
      fetchApplicationData(false);
    });
    return () => unsubscribe();
  }, [subscribeToTable, fetchApplicationData]);

  // 2. Instant Cross-Tab BroadcastChannel (0ms delay between open tabs)
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('eduscholar_app_sync');
      channel.onmessage = (e) => {
        if (e.data?.type === 'APPLICATION_UPDATED') {
          console.log('[ApplicationProgressTracker] ⚡ Instant BroadcastChannel application update received');
          fetchApplicationData(false);
        }
      };
      return () => channel.close();
    }
  }, [fetchApplicationData]);

  // 3. Instant Window/Tab Focus & Visibility Event (0ms delay on tab switch)
  useEffect(() => {
    const onFocus = () => {
      fetchApplicationData(false);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchApplicationData(false);
      }
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [fetchApplicationData]);

  // 4. Background Polling Fallback (every 4 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchApplicationData(false);
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchApplicationData]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchApplicationData(false);
  };

  if (isLoading) {
    return (
      <Card className="border border-slate-200 dark:border-slate-800 p-8 text-center bg-white dark:bg-slate-900 shadow-sm rounded-3xl">
        <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-semibold">
          <Clock className="h-4 w-4 animate-spin text-blue-600" />
          <span>Synchronizing application records in real time...</span>
        </div>
      </Card>
    );
  }

  // If no application has been submitted yet by this student
  if (!appData) {
    return (
      <Card className="border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs rounded-3xl">
        <div className="p-8 text-center max-w-xl mx-auto space-y-4">
          <div className="h-14 w-14 rounded-3xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-xs">
            <FileText className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">
              No Active Scholarship Application Found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              You do not have an active scholarship or educational grant application filed under this account. Choose an accredited program track to apply.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/scholar-prog-available">
              <Button variant="primary" size="md" className="font-extrabold shadow-md shadow-blue-600/30 gap-2 cursor-pointer">
                <span>Select Scholarship Program & Apply</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  const currentStage = appData.statusStage;
  const progressPercent = appData.progressPercent;

  return (
    <div className="space-y-6">
      {/* 6 Progress Milestones Card */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 overflow-hidden rounded-3xl">
        {/* Header */}
        <CardHeader className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="primary" className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-[10px] font-bold">
                  QC LGU Scholarship Pipeline
                </Badge>
                <Badge variant="success" className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[10px] font-bold">
                  Ref: {appData.refNumber}
                </Badge>
              </div>
              <CardTitle className="text-xl font-extrabold text-white flex items-center gap-2">
                <span>Application Progress Milestones</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-300 mt-0.5">
                Real-time tracking across all 6 official scholarship evaluation stages.
              </CardDescription>
            </div>

            {/* Real-time Status Badge & Live Sync (Replaces Set Stage) */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 bg-slate-800/90 px-3.5 py-2 rounded-2xl border border-slate-700/80 shadow-xs">
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    appData.statusType === 'rejected' ? 'bg-rose-400' : 'bg-emerald-400'
                  }`} />
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    appData.statusType === 'rejected' ? 'bg-rose-500' : 'bg-emerald-500'
                  }`} />
                </span>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-none">
                    Live Status
                  </span>
                  <span className="text-xs font-extrabold text-white mt-0.5">
                    {appData.statusLabel}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleManualRefresh}
                title={`Last synced: ${lastSyncTime}. Click to re-sync with database.`}
                className="h-9 w-9 flex items-center justify-center rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer shadow-xs"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Progress Bar Track */}
          <div className="mt-5 space-y-2 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300 flex items-center gap-2">
                <span>Stage {currentStage} of 6:</span>
                <strong className="text-blue-300 font-extrabold">
                  {progressPercent === 100 ? 'Confirmation & Disbursed' : MILESTONES[currentStage - 1]?.name}
                </strong>
              </span>
              <span className="text-emerald-400 font-extrabold">{progressPercent}% Completed</span>
            </div>

            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </CardHeader>

        {/* 6 Milestones Grid */}
        <CardContent className="p-5 sm:p-6 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {MILESTONES.map(m => {
              const isDisbursed = progressPercent === 100 || appData.statusLabel === 'Confirmed & Disbursed';
              const isPassed = isDisbursed ? true : currentStage > m.step;
              const isCurrent = !isDisbursed && currentStage === m.step;
              const isRejected = isCurrent && appData.statusType === 'rejected';

              return (
                <div
                  key={m.step}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 space-y-1.5 ${
                    isRejected
                      ? 'border-rose-300 dark:border-rose-800 bg-rose-50/90 dark:bg-rose-950/40 shadow-sm ring-2 ring-rose-500/20'
                      : isCurrent
                      ? 'border-blue-400 dark:border-blue-700 bg-blue-50/90 dark:bg-blue-950/40 shadow-md ring-2 ring-blue-500/20'
                      : isPassed
                      ? 'border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/60 dark:bg-emerald-950/30'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 font-mono">
                      0{m.step}
                    </span>
                    {isRejected ? (
                      <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    ) : isPassed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : isCurrent ? (
                      <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-pulse" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-heading font-extrabold text-xs text-slate-900 dark:text-white">
                      {m.name}
                    </h5>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                      {m.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Validation & Officer Remarks Box */}
          <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-start gap-3 shadow-xs">
            <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                  Current Validation State & Secretariat Review Notes:
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  Synced: {lastSyncTime}
                </span>
              </div>
              <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                {appData.validationRemark}
              </p>

              {/* Dynamic Status / Expected Timeline Banner */}
              {currentStage >= 6 ? (
                <div className="pt-2 flex items-center justify-between flex-wrap gap-2 text-xs border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Official Approval & Remittance Status:</span>
                  </div>
                  <Badge variant="success" size="sm" className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-[10px]">
                    {progressPercent === 100
                      ? 'Grant Disbursed & Released by City Treasury'
                      : 'Officially Approved — Queued for Treasury Remittance'}
                  </Badge>
                </div>
              ) : appData.statusType === 'rejected' ? (
                <div className="pt-2 flex items-center justify-between flex-wrap gap-2 text-xs border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-bold">
                    <XCircle className="h-3.5 w-3.5 text-rose-600" />
                    <span>Evaluation Decision:</span>
                  </div>
                  <Badge variant="destructive" size="sm" className="bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-mono font-bold text-[10px]">
                    Application Disapproved
                  </Badge>
                </div>
              ) : (
                <div className="pt-2 flex items-center justify-between flex-wrap gap-2 text-xs border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-bold">
                    <Clock className="h-3.5 w-3.5 text-blue-600" />
                    <span>Expected Verification Status:</span>
                  </div>
                  <Badge variant="primary" size="sm" className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono font-bold text-[10px]">
                    7–10 Business Days (Within {new Date(new Date(appData.dateFiled).getTime() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
