import React, { useState, useEffect } from 'react';
import { AlertCircle, Award, Sparkles, Download, CheckCircle2 } from 'lucide-react';
import { getMyApplications } from '../api/applications';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { formatCurrency, formatDate } from '../utils/cn';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ScholarshipAwardCertificateModal } from '../components/common/ScholarshipAwardCertificateModal';

export const ApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [certificateApp, setCertificateApp] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
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
          status: (app.status === 'Approved' ? 'approved' : app.status === 'Paid' ? 'approved' : app.status === 'Rejected' ? 'rejected' : app.status === 'Under Review' ? 'pending' : (app.status || 'pending')) as any,
          submissionDate: app.submissionDate ?? app.submitted_at?.split('T')[0] ?? new Date().toISOString().split('T')[0],
          requirementsCount: app.requirementsCount ?? 5,
          completedRequirements: app.completedRequirements ?? 5,
          notes: app.notes ?? 'All requirements attached & verified. In review by QCYDO evaluation desk.',
        }));

        if (mounted) {
          if (apiData.length > 0) {
            const apiMapped = apiData.map((app: any) => ({
              id: app.id ?? `app-${Math.random()}`,
              scholarshipId: app.reference_id ?? '',
              scholarshipTitle: app.title ?? app.program_name ?? 'Application',
              amount: app.amount ?? 0,
              status: (app.status === 'Approved' ? 'approved' : app.status === 'Paid' ? 'approved' : app.status === 'Rejected' ? 'rejected' : app.status === 'Under Review' ? 'pending' : 'pending') as any,
              submissionDate: app.submission_date ?? app.submitted_at ?? app.created_at ?? new Date().toISOString().split('T')[0],
              requirementsCount: app.requirements_count ?? 0,
              completedRequirements: app.completed_requirements ?? 0,
              notes: app.notes ?? '',
            }));
            setApplications([...apiMapped, ...localMapped.filter((l: any) => !apiMapped.some((a: any) => String(a.id) === String(l.id)))]);
          } else {
            setApplications(localMapped);
          }
        }
      } catch {
        const savedApps = JSON.parse(localStorage.getItem('student_applications') || '[]');
        const localMapped = savedApps.map((app: any) => ({
          id: app.id ?? `app-${Math.random()}`,
          scholarshipId: app.scholarshipId || 'SCH-QCSP-2026',
          scholarshipTitle: app.scholarshipTitle || 'Quezon City Scholarship Program (QCSP) 2026-2027',
          amount: app.amount ?? 10000,
          status: (app.status === 'Approved' ? 'approved' : app.status === 'Paid' ? 'approved' : app.status === 'Rejected' ? 'rejected' : app.status === 'Under Review' ? 'pending' : (app.status || 'pending')) as any,
          submissionDate: app.submissionDate ?? app.submitted_at?.split('T')[0] ?? new Date().toISOString().split('T')[0],
          requirementsCount: app.requirementsCount ?? 5,
          completedRequirements: app.completedRequirements ?? 5,
          notes: app.notes ?? 'All requirements attached & verified. In review by QCYDO evaluation desk.',
        }));
        if (mounted) {
          setApplications(localMapped);
        }
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-soft border border-slate-200">
        <div>
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-slate-900">
            Application Progress & Document Vault Tracker
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Track real-time status of submitted scholarship applications, review verification stages, and manage required document vault uploads.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/documents')}>
            Document Vault
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/apply/scholarship')} className="font-bold">
            Apply for Scholarship
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {applications.map((app) => (
          <Card key={app.id} hoverEffect className="overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-base text-foreground">{app.scholarshipTitle}</h3>
                    <Badge
                      variant={
                        app.status === 'approved'
                          ? 'success'
                          : app.status === 'pending'
                            ? 'info'
                            : 'warning'
                      }
                    >
                      {app.status === 'approved' && 'Approved'}
                      {app.status === 'pending' && 'Under Review'}
                      {app.status === 'action_required' && 'Action Required'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Submitted on {formatDate(app.submissionDate || app.submission_date || new Date().toISOString())} • Reference ID: {app.id}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Award Amount</span>
                  <span className="font-heading font-extrabold text-xl text-primary">{formatCurrency(app.amount)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-slate-500 font-semibold block">Requirements Completed</span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      {app.completedRequirements ?? app.completed_requirements ?? 4} / {app.requirementsCount ?? app.requirements_count ?? 4}
                    </span>
                    <span className="text-[11px] text-blue-600 font-semibold">
                      {Math.round(((app.completedRequirements ?? app.completed_requirements ?? 4) / (app.requirementsCount ?? app.requirements_count ?? 4)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${Math.min(100, Math.round(((app.completedRequirements ?? app.completed_requirements ?? 4) / (app.requirementsCount ?? app.requirements_count ?? 4)) * 100))}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-slate-500 font-semibold block">Disbursement Date</span>
                  <p className="font-bold text-slate-900">
                    {(app.disbursementDate || app.disbursement_date) ? formatDate(app.disbursementDate || app.disbursement_date || '') : 'Pending Final Sign-Off'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-slate-500 font-semibold block">Reviewer Notes</span>
                  <p className="text-slate-600 text-[11px] line-clamp-2">{app.notes}</p>
                </div>
              </div>

              {app.status === 'approved' && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs shrink-0">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-emerald-950 text-xs">
                          Official Government Scholar Qualification Conferred
                        </span>
                        <Badge variant="success" className="text-[9px] py-0 px-1.5">
                          QCSP Certified
                        </Badge>
                      </div>
                      <p className="text-[11px] text-emerald-800 mt-0.5 font-medium">
                        Your official Certificate of Scholarship Award has been generated and validated by the Quezon City Youth Development Office.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setCertificateApp(app)}
                    leftIcon={<Award className="h-4 w-4" />}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 shadow-xs"
                  >
                    View & Download Certificate
                  </Button>
                </div>
              )}

              {app.status === 'action_required' && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <span>Upload your official transcript to proceed with review.</span>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => navigate('/documents')}>
                    Upload Document
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

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
    </div>
  );
};
