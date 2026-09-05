import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { formatDate } from '../../utils/cn';
import { getMyApplications, updateApplicationStatus } from '../../api/applications';

interface EnrollmentRecord {
  id: string;
  dbId?: number | string;
  studentName: string;
  studentId: string;
  school: string;
  course: string;
  yearLevel: string;
  corDocument: string;
  submissionDate: string;
  status: 'Pending Verification' | 'Verified' | 'Rejected';
  rejectionReason?: string;
}

export const EnrollmentVerificationPage: React.FC = () => {
  const [records, setRecords] = useState<EnrollmentRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending Verification' | 'Verified' | 'Rejected'>('all');

  // Modal State
  const [targetRecord, setTargetRecord] = useState<EnrollmentRecord | null>(null);
  const [actionType, setActionType] = useState<'confirm' | 'reject'>('confirm');
  const [rejectionReason, setRejectionReason] = useState('');

  const loadRecords = async () => {
    try {
      const res = await getMyApplications();
      const apps = Array.isArray(res?.data) ? res.data : [];
      if (apps.length > 0) {
        const liveRecords: EnrollmentRecord[] = apps.map((app: any) => {
          const formData = typeof app.form_data === 'string' ? JSON.parse(app.form_data) : (app.form_data || {});
          const sLower = String(app.status || '').toLowerCase();
          const isVerified =
            sLower.includes('assess') ||
            sLower.includes('evaluat') ||
            sLower === 'approved' ||
            sLower === 'disbursed';
          const isRejected = sLower === 'rejected' || sLower === 'disapproved';
          return {
            id: app.application_code || `ENR-${app.id}`,
            dbId: app.id,
            studentName:
              app.applicant_name ||
              `${formData.firstName || ''} ${formData.lastName || ''}`.trim() ||
              'Student Applicant',
            studentId: app.student_id || formData.studentId || `2026-${String(app.id).padStart(5, '0')}`,
            school: formData.school || 'Quezon City University',
            course: formData.course || app.program_name || 'BS Information Technology',
            yearLevel: formData.yearLevel || '1st Year',
            corDocument: `COR_2026_${(app.applicant_name || 'Scholar').replace(/\s+/g, '')}.pdf`,
            submissionDate: app.submission_date || new Date().toISOString().split('T')[0],
            status: isVerified ? 'Verified' : isRejected ? 'Rejected' : 'Pending Verification',
          };
        });
        setRecords(liveRecords);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.warn('Could not load live applications for supervisor verification:', err);
      setRecords([]);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleProcessAction = async () => {
    if (!targetRecord) return;

    const newStatus = actionType === 'confirm' ? 'Assessment Phase' : 'Rejected';
    const notes =
      actionType === 'confirm'
        ? 'Enrollment credentials verified and endorsed by Supervisor.'
        : rejectionReason || 'Invalid Certificate of Registration';

    if (targetRecord.dbId) {
      try {
        await updateApplicationStatus(targetRecord.dbId, newStatus, notes, notes);
      } catch (err) {
        console.warn('Supervisor verification update warning:', err);
      }
    }

    setRecords((prev) =>
      prev.map((r) =>
        r.id === targetRecord.id
          ? {
              ...r,
              status: actionType === 'confirm' ? 'Verified' : 'Rejected',
              rejectionReason: actionType === 'reject' ? rejectionReason || 'Invalid Certificate of Registration' : undefined,
            }
          : r
      )
    );

    toast.success(
      `Enrollment for ${targetRecord.studentName} ${actionType === 'confirm' ? 'VERIFIED & TRANSITIONED TO ASSESSMENT' : 'REJECTED'}!`
    );
    setTargetRecord(null);
    setRejectionReason('');
  };

  const pendingCount = records.filter((r) => r.status === 'Pending Verification').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-foreground">Enrollment Verification Portal</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Verify official University Certificate of Registration (COR) documents and confirm active student status.
          </p>
        </div>

        <Badge variant="warning" size="md">
          {pendingCount} Pending Verifications
        </Badge>
      </div>

      {/* Roster Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search student or university..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary shadow-xs"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All Records' },
              { id: 'Pending Verification', label: 'Pending' },
              { id: 'Verified', label: 'Verified' },
              { id: 'Rejected', label: 'Rejected' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  statusFilter === tab.id
                    ? 'bg-primary text-white shadow-md border border-transparent font-bold'
                    : 'bg-white text-slate-700 border border-slate-200 shadow-xs hover:bg-slate-50'
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
              <thead className="bg-slate-50 text-slate-500 uppercase group-label border-b border-border">
                <tr>
                  <th className="p-3">Record ID & Student</th>
                  <th className="p-3">University / School</th>
                  <th className="p-3">Course & Year Level</th>
                  <th className="p-3">Submitted COR</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70">
                    <td className="p-3">
                      <div>
                        <span className="font-mono font-bold text-primary block">{r.id}</span>
                        <span className="font-bold text-slate-900">{r.studentName}</span>
                        <span className="text-[11px] text-slate-400 block">{r.studentId}</span>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-slate-800">{r.school}</td>
                    <td className="p-3">
                      <span className="font-medium text-slate-800 block">{r.course}</span>
                      <span className="text-[11px] text-slate-500">{r.yearLevel}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-blue-600 underline cursor-pointer">{r.corDocument}</span>
                      <span className="text-[10px] text-slate-400 block">{formatDate(r.submissionDate)}</span>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={r.status === 'Verified' ? 'success' : r.status === 'Pending Verification' ? 'warning' : 'destructive'}
                      >
                        {r.status}
                      </Badge>
                      {r.rejectionReason && (
                        <p className="text-[10px] text-rose-600 mt-1 max-w-[140px]">{r.rejectionReason}</p>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {r.status === 'Pending Verification' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => { setTargetRecord(r); setActionType('reject'); }}
                            leftIcon={<XCircle className="h-3.5 w-3.5" />}
                          >
                            Reject
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => { setTargetRecord(r); setActionType('confirm'); }}
                            leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                            className="font-bold"
                          >
                            Confirm
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      {targetRecord && (
        <Modal
          isOpen={!!targetRecord}
          onClose={() => setTargetRecord(null)}
          title={`${actionType === 'confirm' ? 'Confirm' : 'Reject'} Enrollment: ${targetRecord.studentName}`}
          description={`School: ${targetRecord.school} (${targetRecord.course})`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setTargetRecord(null)}>
                Cancel
              </Button>
              <Button
                variant={actionType === 'confirm' ? 'primary' : 'destructive'}
                size="sm"
                onClick={handleProcessAction}
                className="font-bold"
              >
                Confirm {actionType === 'confirm' ? 'Enrollment Status' : 'Rejection'}
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Submitted Document:</span>
                <span className="font-bold text-blue-600">{targetRecord.corDocument}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Submission Date:</span>
                <span className="font-bold text-slate-800">{formatDate(targetRecord.submissionDate)}</span>
              </div>
            </div>

            {actionType === 'reject' && (
              <div>
                <label className="block font-bold text-slate-800 mb-1">Rejection Reason</label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why the certificate of registration was rejected..."
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary resize-none shadow-xs"
                />
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
