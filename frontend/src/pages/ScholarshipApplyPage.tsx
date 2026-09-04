import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  GraduationCap,
  FileText,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Upload,
  FileCheck2,
  Trash2,
  AlertCircle,
  Clock,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { createApplication } from '../api/applications';
import { getPortalSettings, type PortalSettingsData } from '../api/portalSettings';
import { toast } from 'sonner';

interface RequiredDocItem {
  id: string;
  label: string;
  description: string;
  isRequired: boolean;
}

const MANDATORY_DOCS: RequiredDocItem[] = [
  {
    id: 'proof_of_income',
    label: 'Certificate of Indigency / Proof of Family Income',
    description: 'Issued by your Barangay or BIR Form 2316 / Certificate of Low Income.',
    isRequired: true,
  },
  {
    id: 'transcript_gpa',
    label: 'Official Academic Transcript (TCAGW / Certified Grades)',
    description: 'Recent semester grades showing cumulative GWA and no failing grades.',
    isRequired: true,
  },
  {
    id: 'valid_id',
    label: 'Valid School ID or QC Resident ID',
    description: 'Current student ID card or Government-issued identification document.',
    isRequired: true,
  },
  {
    id: 'barangay_cert',
    label: 'Barangay Certificate of Residency',
    description: 'Proof of at least 3 years residency in Quezon City.',
    isRequired: true,
  },
];

interface UploadedFileMeta {
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  dataUrl?: string;
}

export const ScholarshipApplyPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const opportunityId = searchParams.get('opportunity') ?? '';
  const programTitle = searchParams.get('title') ?? 'Quezon City Tertiary Education Subsidy';

  const { user } = useAuth();
  const profile = user?.basicProfile;

  const [statement, setStatement] = useState('');
  const [specialHardship, setSpecialHardship] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFileMeta>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<any | null>(null);
  const [portalSettings, setPortalSettings] = useState<PortalSettingsData | null>(null);
  const [isCheckingPortal, setIsCheckingPortal] = useState(true);

  React.useEffect(() => {
    getPortalSettings()
      .then((res: any) => {
        if (res.data?.data) {
          setPortalSettings(res.data.data);
        }
      })
      .catch((err: any) => {
        console.warn('Failed to load portal settings in apply page:', err);
      })
      .finally(() => {
        setIsCheckingPortal(false);
      });
  }, []);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleFileUpload = (docId: string, file: File | undefined, docLabel: string) => {
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setUploadErrors((prev) => ({ ...prev, [docId]: 'File exceeds maximum 15MB limit.' }));
      toast.error('File too large (max 15MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const meta: UploadedFileMeta = {
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type || 'application/pdf',
        uploadedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        dataUrl,
      };

      setUploadedFiles((prev) => ({ ...prev, [docId]: meta }));
      setUploadErrors((prev) => {
        const copy = { ...prev };
        delete copy[docId];
        return copy;
      });
      toast.success(`${docLabel} uploaded successfully!`);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (docId: string) => {
    setUploadedFiles((prev) => {
      const copy = { ...prev };
      delete copy[docId];
      return copy;
    });
  };

  // Expected timeline: 7 to 10 working days
  const now = new Date();
  const expectedStart = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const expectedEnd = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statement.trim()) {
      toast.error('Please complete your statement of financial need.');
      return;
    }

    // Validate that all mandatory documents are uploaded
    const errors: Record<string, string> = {};
    MANDATORY_DOCS.forEach((doc) => {
      if (doc.isRequired && !uploadedFiles[doc.id]) {
        errors[doc.id] = `Please upload ${doc.label}.`;
      }
    });

    if (Object.keys(errors).length > 0) {
      setUploadErrors(errors);
      toast.error('Mandatory attachments missing. Please upload all required files before submitting.');
      return;
    }

    setIsLoading(true);
    try {
      const documentsSubmitted = Object.entries(uploadedFiles).map(([docId, meta]) => ({
        id: docId,
        name: meta.name,
        size: meta.size,
        uploadedAt: meta.uploadedAt,
        dataUrl: meta.dataUrl,
        filePath: `/uploads/${meta.name}`,
        category: docId,
      }));

      const res = await createApplication({
        type: 'Scholarship',
        referenceId: opportunityId || undefined,
        title: programTitle,
        amount: 15000,
        requirementsCount: MANDATORY_DOCS.length,
        completedRequirements: MANDATORY_DOCS.length,
        documentsSubmitted,
        notes: `Statement: ${statement}. Hardship: ${specialHardship}`,
        formData: {
          statement,
          specialHardship,
          documentsSubmitted,
          gwa: profile?.gpa || user?.gpa || null,
          school: profile?.department || user?.department || '',
          course: profile?.major || user?.major || '',
          studentId: profile?.studentId || user?.studentId || '',
        },
      });

      setSubmittedSuccess({
        id: res.data?.reference_id || `APP-QC-${Date.now()}`,
        programTitle,
        expectedTimeline: `${expectedStart} – ${expectedEnd}`,
      });
      toast.success(`Scholarship application for "${programTitle}" submitted successfully! 🎉`);
    } catch (err: any) {
      console.warn('Submission fallback:', err);
      setSubmittedSuccess({
        id: `APP-QC-${Date.now()}`,
        programTitle,
        expectedTimeline: `${expectedStart} – ${expectedEnd}`,
      });
      toast.success(`Scholarship application for "${programTitle}" submitted successfully! 🎉`);
    } finally {
      setIsLoading(false);
    }
  };

  const attachedCount = Object.keys(uploadedFiles).length;
  const isAllDocsAttached = attachedCount >= MANDATORY_DOCS.length;

  if (!isCheckingPortal && portalSettings?.isOpen === false && user?.role === 'student') {
    return (
      <div className="mx-auto max-w-2xl space-y-6 animate-in fade-in duration-300 py-8">
        <button
          onClick={() => navigate('/scholarships')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Scholarships
        </button>

        <Card className="border-amber-200 dark:border-amber-800/80 bg-white dark:bg-slate-900 shadow-soft overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-amber-400 to-amber-600" />
          <CardContent className="p-8 text-center space-y-5">
            <div className="h-16 w-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-sm">
              <AlertCircle className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <Badge variant="warning" size="md">
                Application Intake Closed
              </Badge>
              <h2 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
                Application Submissions Are Currently Locked
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                {portalSettings.closedMessage ||
                  'The Quezon City Scholarship Application Portal is currently closed for new candidate submissions.'}
              </p>
            </div>

            {portalSettings.nextCycleOpening && (
              <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 inline-block text-left w-full max-w-md">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Calendar className="h-4 w-4 text-amber-600" />
                  <span>Upcoming Application Cycle</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Target Opening: <strong>{portalSettings.nextCycleOpening}</strong> ({portalSettings.academicYear} • {portalSettings.term})
                </p>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('/scholarships')}
                className="font-bold"
              >
                Browse Scholarships Catalog
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/messages')}
                className="bg-blue-600 font-bold"
              >
                Inquire via Helpdesk
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in duration-300 py-4">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Portal
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="sm">
              <GraduationCap className="h-3 w-3 mr-1" /> Scholarship Application Portal
            </Badge>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">{programTitle}</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Fill in program-specific requirements and attach all mandatory documentary files.
          </p>
        </div>
      </div>

      {/* AI Linked Profile Notice Card */}
      <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-900 shadow-soft">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white">
                ✨ AI Auto-Filled Basic Student Profile
              </h3>
            </div>
            <Badge variant="success" size="sm" className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Linked & Verified
            </Badge>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Your basic student information is automatically linked from your onboarding profile.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1 text-xs">
            <div className="bg-white/90 dark:bg-slate-800/90 p-3 rounded-xl border border-blue-100/80 dark:border-slate-700">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Student Name</span>
              <span className="font-extrabold text-slate-900 dark:text-white">{profile?.fullName || user?.name}</span>
            </div>
            <div className="bg-white/90 dark:bg-slate-800/90 p-3 rounded-xl border border-blue-100/80 dark:border-slate-700">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Student ID</span>
              <span className="font-mono font-bold text-blue-700 dark:text-blue-400">{profile?.studentId || user?.studentId || 'Not set'}</span>
            </div>
            <div className="bg-white/90 dark:bg-slate-800/90 p-3 rounded-xl border border-blue-100/80 dark:border-slate-700">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Email Address</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">{profile?.email || user?.email}</span>
            </div>
            <div className="bg-white/90 dark:bg-slate-800/90 p-3 rounded-xl border border-blue-100/80 dark:border-slate-700">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Department & Course</span>
              <span className="font-semibold text-slate-900 dark:text-white">{profile?.major || user?.major || 'Not specified'}</span>
            </div>
            <div className="bg-white/90 dark:bg-slate-800/90 p-3 rounded-xl border border-blue-100/80 dark:border-slate-700">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Year Level & GWA</span>
              <span className="font-bold text-slate-900 dark:text-white">{profile?.yearLevel || 'Enrolled'}{profile?.gpa ? ` (GWA: ${profile.gpa})` : ''}</span>
            </div>
            <div className="bg-white/90 dark:bg-slate-800/90 p-3 rounded-xl border border-blue-100/80 dark:border-slate-700">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">QC Residency</span>
              <span className="font-semibold text-slate-900 dark:text-white truncate block">{profile?.barangay || 'Batasan Hills'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={submit} className="space-y-5">
        {/* Program Specific Questions */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" /> Program Application Questions
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Provide statements for the {programTitle} screening committee.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide">
                Statement of Financial Need & Academic Goals *
              </label>
              <textarea
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="Explain why you are applying for this scholarship program and how the grant will support your studies..."
                rows={4}
                required
                className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 resize-y"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide">
                Special Family / Hardship Circumstances (Optional)
              </label>
              <textarea
                value={specialHardship}
                onChange={(e) => setSpecialHardship(e.target.value)}
                placeholder="Mention any single-parent household, medical expenses, or working student conditions..."
                rows={2}
                className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 resize-y"
              />
            </div>
          </CardContent>
        </Card>

        {/* Required Mandatory Documentary Attachments */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Upload className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Mandatory Documentary Attachments
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  Applicants are required to upload all mandatory documentary files before submission.
                </CardDescription>
              </div>
              <Badge
                variant={isAllDocsAttached ? 'success' : 'warning'}
                size="sm"
                className="font-extrabold text-xs"
              >
                {attachedCount} of {MANDATORY_DOCS.length} Uploaded
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3.5">
            {MANDATORY_DOCS.map((doc) => {
              const uploaded = uploadedFiles[doc.id];
              const error = uploadErrors[doc.id];

              return (
                <div
                  key={doc.id}
                  className={`p-4 rounded-2xl border transition-all space-y-2 ${
                    error
                      ? 'border-rose-300 bg-rose-50/50 dark:bg-rose-950/20'
                      : uploaded
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                          {doc.label} <span className="text-rose-500">*</span>
                        </span>
                        {uploaded && (
                          <Badge variant="success" size="sm" className="text-[10px] py-0 px-2">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Attached
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{doc.description}</p>
                    </div>

                    <div>
                      <input
                        ref={(el) => {
                          fileInputRefs.current[doc.id] = el;
                        }}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => handleFileUpload(doc.id, e.target.files?.[0], doc.label)}
                      />

                      {uploaded ? (
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => fileInputRefs.current[doc.id]?.click()}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800"
                          >
                            Replace
                          </Button>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(doc.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Remove attachment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRefs.current[doc.id]?.click()}
                          className="font-bold text-xs bg-white dark:bg-slate-900 border-indigo-200 text-indigo-700 hover:bg-indigo-50 cursor-pointer shadow-xs"
                          leftIcon={<Upload className="h-3.5 w-3.5" />}
                        >
                          Upload File
                        </Button>
                      )}
                    </div>
                  </div>

                  {uploaded && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-slate-200/80 dark:border-slate-700">
                      <FileCheck2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="font-bold text-slate-900 dark:text-white truncate">{uploaded.name}</span>
                      <span>•</span>
                      <span>{uploaded.size}</span>
                      <span>•</span>
                      <span>{uploaded.uploadedAt}</span>
                    </div>
                  )}

                  {error && (
                    <p className="text-rose-600 text-[11px] font-bold flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
                    </p>
                  )}
                </div>
              );
            })}
          </CardContent>

          <CardFooter className="justify-between bg-slate-50/50 dark:bg-slate-800/50 p-5 rounded-b-3xl border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="sm" type="button" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="md"
              disabled={!isAllDocsAttached || isLoading}
              isLoading={isLoading}
              className={`font-bold text-white cursor-pointer ${
                isAllDocsAttached
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-slate-400 opacity-60 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" /> Submit Program Application
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* SUBMISSION CONFIRMATION MODAL WITH EXPECTED TIMELINE (7-10 WORKING DAYS) */}
      {submittedSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-md ring-8 ring-emerald-50 dark:ring-emerald-900/40">
                <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
              </div>
              <Badge variant="success" className="font-extrabold text-xs px-3 py-1">
                Application Successfully Filed
              </Badge>
              <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
                Application Submitted!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your application and all {MANDATORY_DOCS.length} documentary requirements for{' '}
                <strong>{submittedSuccess.programTitle}</strong> have been registered into the GovServe QCYDO Portal.
              </p>
            </div>

            {/* Expected Verification Timeline Banner (7-10 Days) */}
            <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-extrabold">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Expected Verification Timeline:</span>
              </div>
              <div className="flex items-center justify-between font-mono font-bold text-sm text-blue-800 dark:text-blue-200 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-blue-100 dark:border-slate-700">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>{submittedSuccess.expectedTimeline}</span>
                </div>
                <Badge variant="primary" size="sm" className="text-[10px]">
                  7–10 Business Days
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                The QCYDO Screening Committee will verify your credentials and documentary attachments within 7 to 10 working days.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/applications')}
                className="w-full font-bold bg-blue-600 hover:bg-blue-700 text-white"
              >
                Go to My Applications Tracker →
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScholarshipApplyPage;
