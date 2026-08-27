import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  GraduationCap,
  Sun,
  Moon,
  ChevronDown,
  FileText,
  UploadCloud,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface ActiveGrant {
  id: string;
  programTitle: string;
  grantType: string;
  currentGwa: number;
  maxAllowedGwa: number;
  documentsVerified: boolean;
  awardValue: number;
  academicTerm: string;
  renewalStatus: 'Eligible for Renewal' | 'Renewal Submitted' | 'Processing';
}

export interface RenewalDocumentItem {
  id: string;
  code: string;
  name: string;
  category: string;
  fileName: string;
  fileSize: string;
  date: string;
  status: 'Pending Verification' | 'Uploaded & Verified' | 'Auto-Recognized';
}

const DEFAULT_RENEWAL_DOCS: RenewalDocumentItem[] = [
  {
    id: 'DOC-01',
    code: 'TOR / COG',
    name: 'Official Transcript of Records (TOR / Semester Grade Report)',
    category: 'Academic Standing',
    fileName: '',
    fileSize: '',
    date: 'Pending Upload',
    status: 'Pending Verification',
  },
  {
    id: 'DOC-02',
    code: 'COR / COE',
    name: 'Certificate of Registration (COR) AY 2026-2027 1st Sem',
    category: 'Enrollment Proof',
    fileName: '',
    fileSize: '',
    date: 'Pending Upload',
    status: 'Pending Verification',
  },
  {
    id: 'DOC-03',
    code: 'QC ID',
    name: 'QC Citizen ID & Residency Status',
    category: 'QC Resident Verification',
    fileName: 'Citizen_Information_System_Matched.json',
    fileSize: 'System Verified',
    date: 'Auto-Recognized',
    status: 'Auto-Recognized',
  },
];

export const OneClickRenewalPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (userDropdownOpen && !target.closest('.user-dropdown-container')) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [userDropdownOpen]);

  const [grant, setGrant] = useState<ActiveGrant>({
    id: 'grant-active-01',
    programTitle: 'QC Excel Academic Scholarship Program',
    grantType: 'Full Academic Support & Living Allowance',
    currentGwa: 1.45,
    maxAllowedGwa: 1.75,
    documentsVerified: true,
    awardValue: 10000,
    academicTerm: '1st Semester AY 2026-2027',
    renewalStatus: 'Eligible for Renewal',
  });

  const [isRenewing, setIsRenewing] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);

  const [renewalDocs, setRenewalDocs] = useState<RenewalDocumentItem[]>(() => {
    try {
      const stored = localStorage.getItem('student_renewal_docs');
      if (stored) {
        const parsed: RenewalDocumentItem[] = JSON.parse(stored);
        return parsed.map(doc => {
          if (doc.id === 'DOC-01' || doc.id === 'DOC-02') {
            if (!doc.fileName || doc.fileName.includes('Official_COG') || doc.fileName.includes('Enrolled_COR') || doc.fileName.includes('2026')) {
              return { ...doc, fileName: '', fileSize: '', date: 'Pending Upload', status: 'Pending Verification' };
            }
          }
          return doc;
        });
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_RENEWAL_DOCS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('student_renewal_docs', JSON.stringify(renewalDocs));
    } catch (e) {
      console.error(e);
    }
  }, [renewalDocs]);

  const handleRenewalDocumentUpload = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRenewalDocs(prev =>
      prev.map(doc => {
        if (doc.id === docId) {
          return {
            ...doc,
            fileName: file.name,
            fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
            date: new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            status: 'Uploaded & Verified',
          };
        }
        return doc;
      })
    );

    toast.success('Document uploaded for renewal!', {
      description: `${file.name} attached to your semestral renewal packet.`,
    });
  };

  const handleRenew = () => {
    const unattachedDocs = renewalDocs.filter(d => !d.fileName);
    if (unattachedDocs.length > 0) {
      toast.error('Incomplete Renewal Attachments', {
        description: `Please upload your ${unattachedDocs.map(d => d.code).join(' and ')} before submitting your renewal.`,
      });
      return;
    }

    if (!agreedTerms) {
      toast.error('Please confirm the renewal compliance agreement before submitting.');
      return;
    }
    setIsRenewing(true);
    setTimeout(() => {
      setGrant((prev) => ({ ...prev, renewalStatus: 'Renewal Submitted' }));
      setIsRenewing(false);
      toast.success('Semestral Renewal Submitted! Your uploaded TOR & COR attachments and verified GWA record were sent to QCYDO.');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/20 flex flex-col transition-colors duration-200">
      {/* Top Header Navbar */}
      <header className="w-full bg-white dark:bg-slate-900 shadow-md shadow-slate-200/80 dark:shadow-slate-950/50 border-b border-slate-200 dark:border-slate-800 relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo-system.png" alt="GovServe Logo" className="h-9 w-9 object-contain bg-blue-50 dark:bg-slate-800 p-1 rounded-xl border border-blue-200 dark:border-slate-700 shadow-xs" />
              <div>
                <span className="font-heading font-extrabold text-lg text-slate-900 dark:text-white leading-none block">GovServe</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Campus Aid Hub Portal</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 transition-all cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </button>

            {user && (
              <div className="relative user-dropdown-container">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-extrabold text-white">
                    {user.name?.charAt(0).toUpperCase() ?? 'U'}
                  </div>
                  <span className="hidden sm:inline">{user.name}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 top-11 w-48 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 shadow-xl z-50 animate-in fade-in duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">{user.role}</p>
                    </div>
                    <button
                      onClick={logout}
                      className="w-full rounded-xl px-3 py-2 text-left text-xs font-extrabold hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 cursor-pointer transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Expanded Hero Banner Section */}
      <div className="w-full bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white py-10 sm:py-12 border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center gap-2">
            <Link to="/e-scholar" className="text-xs font-extrabold text-blue-300 hover:text-white flex items-center gap-1 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> E-SCHOLAR Hub
            </Link>
            <span className="text-slate-500 text-xs">/</span>
            <span className="text-xs font-bold text-slate-300">Automated Semestral Scholarship Renewal</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">
                  One-Click Scholarship Renewal
                </h1>
                <Badge variant="primary" className="bg-blue-500/20 text-blue-300 border-blue-400/40 text-xs font-extrabold px-3 py-1">
                  Instant Verification
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                Fast-track your semestral scholarship renewal for Academic Year 2026-2027. Your verified grades, school coordinator approval, and Document Vault attachments are auto-compiled below for instant submission to QCYDO.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl text-right shadow-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Target Disbursement Term</span>
                <span className="text-sm font-extrabold text-blue-300">{grant.academicTerm}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Expanded Container (max-w-7xl) */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Active Grant Overview Card */}
        <Card className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-medium rounded-3xl overflow-hidden transition-colors">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/80 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  {grant.renewalStatus === 'Renewal Submitted' && (
                    <Badge variant="success" size="md" className="font-bold">
                      Renewal Submitted
                    </Badge>
                  )}
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">ID: {grant.id}</span>
                </div>
                <CardTitle className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 flex items-center gap-2">
                  <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  {grant.programTitle}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1">
                  Program Category: <strong className="text-slate-800 dark:text-slate-200">{grant.grantType}</strong> • Total Award Value: <strong className="text-blue-700 dark:text-blue-400">{formatCurrency(grant.awardValue)} / Semester</strong>
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-8">
            {/* EXPANDED SECTION 2: Semestral Renewal Document Upload */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                    Semestral Renewal Document Upload
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Upload your latest semestral TOR/COG and COR to refresh your scholarship renewal packet before submission.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renewalDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                      doc.status === 'Uploaded & Verified'
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                        : doc.status === 'Auto-Recognized'
                        ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/60'
                        : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-500/30'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-900">
                          {doc.code}
                        </span>
                        {doc.status === 'Uploaded & Verified' && (
                          <Badge variant="success" size="sm" className="font-bold flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Attached
                          </Badge>
                        )}
                        {doc.status === 'Pending Verification' && (
                          <Badge variant="warning" size="sm" className="font-bold flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Pending Upload
                          </Badge>
                        )}
                        {doc.status === 'Auto-Recognized' && (
                          <Badge variant="primary" size="sm" className="font-bold flex items-center gap-1">
                            ✓ System Verified
                          </Badge>
                        )}
                      </div>

                      <p className="font-bold text-xs text-slate-900 dark:text-white leading-snug">{doc.name}</p>

                      {doc.fileName ? (
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                            <span className="truncate max-w-[150px] flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                              <FileText className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                              {doc.fileName}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{doc.fileSize}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Updated: {doc.date}</p>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-dashed border-amber-300 dark:border-amber-500/40 text-center space-y-0.5">
                          <p className="text-[11px] font-extrabold text-amber-900 dark:text-amber-200">No document attached yet</p>
                          <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">Click below to upload your file</p>
                        </div>
                      )}
                    </div>

                    {/* Action Upload/Replace Button */}
                    <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase">{doc.category}</span>
                      {doc.status !== 'Auto-Recognized' ? (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={e => handleRenewalDocumentUpload(doc.id, e)}
                          />
                          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline">
                            <UploadCloud className="h-3.5 w-3.5" />
                            {doc.status === 'Uploaded & Verified' ? 'Replace' : 'Upload File'}
                          </span>
                        </label>
                      ) : (
                        <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-800/50">
                          Auto-Linked
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* EXPANDED SECTION 3: Financial Aid Disbursement Breakdown */}
            <div className="space-y-4 pt-2">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                  Approved Semestral Financial Aid Allocation
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Financial grant disbursements scheduled upon successful renewal processing.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">Scholarship Fund</span>
                  <h4 className="font-heading font-extrabold text-xl text-emerald-950 dark:text-emerald-200">{formatCurrency(5000)}</h4>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">Direct Academic & School Grant</span>
                </div>

                <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/40 dark:bg-blue-950/20 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800 dark:text-blue-400">Semestral Living Stipend</span>
                  <h4 className="font-heading font-extrabold text-xl text-blue-950 dark:text-blue-200">{formatCurrency(5000)}</h4>
                  <span className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold">Landbank Scholar Card / E-Wallet</span>
                </div>
              </div>
            </div>

            {/* Compliance Guarantee & Agreement Box */}
            <div className="p-5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 rounded-2xl text-xs text-blue-950 dark:text-blue-200 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-bold text-sm">
                <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>QCYDO One-Click Automated Renewal Guarantee</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                By submitting this semestral renewal form, you confirm that your submitted grades and Quezon City residency information remain true, complete, and accurate. Your renewal packet will be processed automatically by the Secretariat.
              </p>
              <label className="flex items-center gap-3 pt-2 cursor-pointer border-t border-blue-200/60 dark:border-blue-800/60 font-bold text-slate-900 dark:text-slate-100">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>I affirm that I maintain active regular enrollment and comply with QC Scholar Honor Rules.</span>
              </label>
            </div>
          </CardContent>

          <CardFooter className="p-6 sm:p-8 bg-slate-50/80 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-4">
            <Button
              variant={grant.renewalStatus === 'Renewal Submitted' ? 'secondary' : 'primary'}
              size="lg"
              onClick={handleRenew}
              disabled={grant.renewalStatus === 'Renewal Submitted' || isRenewing}
              className="w-full sm:w-auto font-extrabold text-sm shadow-md shadow-blue-600/25 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white"
              leftIcon={<RefreshCw className={`h-4 w-4 ${isRenewing ? 'animate-spin' : ''}`} />}
            >
              {isRenewing
                ? 'Processing Renewal Packet...'
                : grant.renewalStatus === 'Renewal Submitted'
                ? 'Renewal Already Submitted ✓'
                : 'Submit Renewal'}
            </Button>
          </CardFooter>
        </Card>
      </main>

      {/* Simple Footer */}
      <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
        Quezon City Youth Development Office (QCYDO) • GovServe E-SCHOLAR Portal
      </footer>
    </div>
  );
};

export default OneClickRenewalPage;
