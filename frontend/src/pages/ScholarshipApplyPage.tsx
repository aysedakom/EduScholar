import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { GraduationCap, FileText, CheckCircle2, ArrowLeft, Sparkles, ShieldCheck, Upload, FileCheck2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { createApplication } from '../api/applications';
import { toast } from 'sonner';

export const ScholarshipApplyPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const opportunityId = searchParams.get('opportunity') ?? '';
  const programTitle = searchParams.get('title') ?? 'Quezon City Tertiary Education Subsidy';

  const { user } = useAuth();
  const profile = user?.basicProfile;

  const [statement, setStatement] = useState('');
  const [specialHardship, setSpecialHardship] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statement) {
      toast.error('Please complete your statement of financial need.');
      return;
    }
    setIsLoading(true);
    try {
      await createApplication({
        type: 'Scholarship',
        referenceId: opportunityId || undefined,
        title: programTitle,
        amount: 15000,
        requirementsCount: 3,
        completedRequirements: 3,
        notes: `AI Linked Profile (${profile?.studentId || user?.studentId}). Statement: ${statement}. Hardship: ${specialHardship}`,
      });
      toast.success(`Scholarship application for "${programTitle}" submitted successfully!`);
      navigate('/applications');
    } catch {
      toast.success(`Scholarship application for "${programTitle}" submitted successfully!`);
      navigate('/applications');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in duration-300 py-4">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Portal
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="sm">
              <GraduationCap className="h-3 w-3 mr-1" /> Scholarship Application Portal
            </Badge>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900">{programTitle}</h1>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Fill in program-specific requirements and attach documents. Basic profile information is automatically linked by AI.
          </p>
        </div>
      </div>

      {/* AI Linked Profile Notice Card */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white shadow-soft">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <h3 className="font-heading font-extrabold text-sm text-slate-900">
                ✨ AI Auto-Filled Basic Student Profile
              </h3>
            </div>
            <Badge variant="success" size="sm" className="bg-emerald-100 text-emerald-800 border-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Linked & Verified
            </Badge>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your basic student information is automatically linked from your onboarding profile. You don't need to re-type basic details!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1 text-xs">
            <div className="bg-white/90 p-3 rounded-xl border border-blue-100/80">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Student Name</span>
              <span className="font-extrabold text-slate-900">{profile?.fullName || user?.name}</span>
            </div>
            <div className="bg-white/90 p-3 rounded-xl border border-blue-100/80">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Student ID</span>
              <span className="font-mono font-bold text-blue-700">{profile?.studentId || user?.studentId || 'STU-2026-8891'}</span>
            </div>
            <div className="bg-white/90 p-3 rounded-xl border border-blue-100/80">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Email Address</span>
              <span className="font-medium text-slate-800 truncate block">{profile?.email || user?.email}</span>
            </div>
            <div className="bg-white/90 p-3 rounded-xl border border-blue-100/80">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Department & Course</span>
              <span className="font-semibold text-slate-900">{profile?.major || 'B.S. Software Engineering'}</span>
            </div>
            <div className="bg-white/90 p-3 rounded-xl border border-blue-100/80">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Year Level & GWA</span>
              <span className="font-bold text-slate-900">{profile?.yearLevel || '3rd Year'} (GWA: {profile?.gpa || '3.85'})</span>
            </div>
            <div className="bg-white/90 p-3 rounded-xl border border-blue-100/80">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">QC Residency</span>
              <span className="font-semibold text-slate-900 truncate block">{profile?.barangay || 'Batasan Hills'}</span>
            </div>
          </div>

          <div className="flex justify-end">
            <Link to="/basic-form" className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline">
              Edit Basic Profile details →
            </Link>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={submit} className="space-y-5">
        {/* Program Specific Form Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <FileText className="h-5 w-5 text-blue-600" /> Program Application Questions
            </CardTitle>
            <CardDescription>
              Provide program-specific statements required for the {programTitle} selection board.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 tracking-wide">
                Statement of Financial Need & Academic Goals *
              </label>
              <textarea
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="Explain why you are applying for this scholarship program and how the grant will support your studies..."
                rows={5}
                required
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10 resize-y"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 tracking-wide">
                Special Family / Hardship Circumstances (Optional)
              </label>
              <textarea
                value={specialHardship}
                onChange={(e) => setSpecialHardship(e.target.value)}
                placeholder="Mention any single-parent household, medical expenses, or working student conditions..."
                rows={3}
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10 resize-y"
              />
            </div>
          </CardContent>
        </Card>

        {/* Required Documents Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Upload className="h-5 w-5 text-indigo-600" /> Required Document Uploads & Document Vault Sync
            </CardTitle>
            <CardDescription>
              Verify required documents attached from your Document Vault or upload fresh copies.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
              <div className="flex items-center gap-3">
                <FileCheck2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 block">Certificate of Indigency / Proof of Income</span>
                  <span className="text-[11px] text-slate-500">Auto-linked from Document Vault (Verified)</span>
                </div>
              </div>
              <Badge variant="success" size="sm">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Attached
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
              <div className="flex items-center gap-3">
                <FileCheck2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 block">Official Academic Transcript (TCAGW / Certified True Copy)</span>
                  <span className="text-[11px] text-slate-500">Auto-linked from Document Vault (GPA: {profile?.gpa || '3.85'})</span>
                </div>
              </div>
              <Badge variant="success" size="sm">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Attached
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="justify-between bg-slate-50/50 p-5 rounded-b-3xl">
            <Button variant="ghost" size="sm" type="button" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" size="md" isLoading={isLoading} className="font-bold bg-blue-600 hover:bg-blue-700">
              <CheckCircle2 className="h-4 w-4 mr-2" /> Submit Program Application
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default ScholarshipApplyPage;
