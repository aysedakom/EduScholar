import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, Lock } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { toast } from 'sonner';

export const SchoolVerificationPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isValidToken, setIsValidToken] = useState(true);
  const [applicantData, setApplicantData] = useState<any>(null);
  const [decision, setDecision] = useState<'APPROVE' | 'REJECT' | 'REQUEST_MORE_INFO' | null>(null);
  const [coordinatorNotes, setCoordinatorNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedVerdict, setSubmittedVerdict] = useState<string | null>(null);

  useEffect(() => {
    // Validate verification token and retrieve applicant summary
    setIsLoading(true);
    setTimeout(() => {
      if (!token || token.length < 5) {
        setIsValidToken(false);
      } else {
        setApplicantData({
          token,
          referenceNumber: `APP-QC-2026-${token.slice(0, 4).toUpperCase()}`,
          studentName: 'Pia Marie T. Faner',
          studentId: '23010366',
          schoolName: 'Bestlink College of the Philippines (BCP)',
          course: 'B.S. Information Technology',
          yearLevel: '3rd Year',
          gpa: '1.50 (Unimpaired / Clear)',
          submissionDate: new Date().toISOString().split('T')[0],
          status: 'AWAITING_SCHOOL_RESPONSE',
        });
      }
      setIsLoading(false);
    }, 600);
  }, [token]);

  const handleSubmitVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision) {
      toast.error('Please select a verification decision (Approve, Reject, or Request Info).');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedVerdict(decision);
      toast.success(`Verification decision (${decision}) submitted successfully! QCYDO Admin has been notified.`);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-sm font-semibold text-slate-400">Authenticating verification token...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 bg-slate-900 border-slate-800 text-center space-y-6 rounded-3xl shadow-2xl">
          <div className="h-16 w-16 rounded-3xl bg-red-950/60 text-red-400 flex items-center justify-center mx-auto border border-red-800">
            <XCircle className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <Badge variant="destructive" size="md">Invalid or Expired Link</Badge>
            <h1 className="text-xl font-black">Verification Link Expired</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              This school verification token link is invalid, expired, or has already been consumed.
            </p>
          </div>
          <Button variant="outline" size="md" onClick={() => navigate('/')} className="w-full">
            Return to Homepage
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between selection:bg-blue-600/30">
      {/* Top Header */}
      <header className="w-full border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo-system.png" alt="GovServe Logo" className="h-9 w-9 object-contain bg-blue-900/40 p-1 rounded-xl border border-blue-800" />
            <div>
              <span className="font-heading font-extrabold text-lg leading-none block text-white">EduScholar</span>
              <span className="text-[10px] text-blue-400 font-semibold">Partner School Verification Portal</span>
            </div>
          </Link>

          <Badge variant="primary" className="bg-blue-950 text-blue-300 border-blue-800 font-mono text-xs">
            Ref: {applicantData?.referenceNumber}
          </Badge>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="max-w-3xl mx-auto w-full px-4 py-8 space-y-6">
        {/* Confidentiality Alert Box */}
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs leading-relaxed space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <Lock className="h-4 w-4" />
            <span>LEGAL & FERPA CONFIDENTIALITY NOTICE</span>
          </div>
          <p className="text-[11px] text-amber-200/90 font-mono">
            This verification link contains student education records intended solely for designated partner school officials. Authorized under Republic Act No. 10173 (Data Privacy Act of 2012).
          </p>
        </div>

        {submittedVerdict ? (
          /* Success Screen */
          <Card className="p-8 bg-slate-900 border-slate-800 text-center space-y-6 rounded-3xl shadow-xl">
            <div className="h-16 w-16 rounded-3xl bg-emerald-950 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-800">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <Badge variant="success" size="md">Coordinator Review Submitted</Badge>
              <h1 className="text-2xl font-black text-white">Verification Complete</h1>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Thank you. Your official verification verdict <strong>({submittedVerdict})</strong> has been logged for applicant <strong>{applicantData.studentName}</strong> and routed to the QCYDO Admin Board for Stage 5 Final Verdict.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
              <div>Reference: {applicantData.referenceNumber}</div>
              <div>Status Updated: PENDING_ADMIN_REVIEW</div>
              <div>Timestamp: {new Date().toLocaleString()}</div>
            </div>
          </Card>
        ) : (
          /* Verification Form */
          <Card className="p-6 sm:p-8 bg-slate-900 border-slate-800 text-white rounded-3xl shadow-xl space-y-6">
            <div className="space-y-1 pb-4 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <Badge variant="warning" className="bg-amber-950 text-amber-300 border-amber-800 font-bold text-xs">
                  Stage 4: School Coordinator Review
                </Badge>
                <span className="text-xs text-slate-400 font-mono">Expiring Token Authentication</span>
              </div>
              <h1 className="text-2xl font-black text-white pt-2">
                Enrollment & Academic Credential Verification
              </h1>
              <p className="text-xs text-slate-400">
                Please verify that the student is currently enrolled in good standing at <strong>{applicantData.schoolName}</strong>.
              </p>
            </div>

            {/* Applicant Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block font-semibold">Student Name</span>
                <span className="font-bold text-sm text-white">{applicantData.studentName}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">Student ID / LR Number</span>
                <span className="font-bold text-sm text-white font-mono">{applicantData.studentId}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">Degree Program & Year</span>
                <span className="font-semibold text-slate-300">{applicantData.course} ({applicantData.yearLevel})</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">Cumulative GWA</span>
                <span className="font-semibold text-emerald-400">{applicantData.gpa}</span>
              </div>
            </div>

            {/* Verdict Selection Buttons */}
            <form onSubmit={handleSubmitVerification} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Official Verification Verdict <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setDecision('APPROVE')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      decision === 'APPROVE'
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">APPROVE</span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">Student is enrolled & in good academic standing.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecision('REQUEST_MORE_INFO')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      decision === 'REQUEST_MORE_INFO'
                        ? 'bg-amber-950/80 border-amber-500 text-amber-200 ring-2 ring-amber-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">REQUEST INFO</span>
                      <AlertCircle className="h-4 w-4 text-amber-400" />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">Requires updated grades / Certificate of Registration.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecision('REJECT')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      decision === 'REJECT'
                        ? 'bg-red-950/80 border-red-500 text-red-200 ring-2 ring-red-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">REJECT</span>
                      <XCircle className="h-4 w-4 text-red-400" />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">Student not enrolled or ineligible.</p>
                  </button>
                </div>
              </div>

              {/* Rationale / Remarks */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Coordinator Remarks & Rationale <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={coordinatorNotes}
                  onChange={(e) => setCoordinatorNotes(e.target.value)}
                  placeholder="Enter any official verification notes or document references..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting || !decision}
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="w-full font-black text-sm bg-blue-600 hover:bg-blue-700 text-white py-3.5 shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                {isSubmitting ? 'Submitting Coordinator Decision...' : 'Submit Verification Verdict →'}
              </Button>
            </form>
          </Card>
        )}
      </main>

      <footer className="py-6 px-4 text-center text-xs text-slate-500 border-t border-slate-800 bg-slate-900/60">
        © 2026 Local Government Unit of Quezon City • Youth Development Office
      </footer>
    </div>
  );
};

export default SchoolVerificationPage;
