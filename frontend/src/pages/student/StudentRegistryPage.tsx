import React from 'react';
import {
  ShieldCheck,
  GraduationCap,
  Building2,
  UserCheck,
  Download,
  Award,
  CheckCircle2,
  QrCode,
  Calendar,
  Clock,
  BookOpen,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';
import { StudentProfilesSearchPage } from '../admin/StudentProfilesSearchPage';
import { formatCurrency } from '../../utils/cn';

export const StudentRegistryPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'system_admin';
  const profile = user?.basicProfile;

  // If Admin, render combined Student Registry Master Console
  if (isAdmin) {
    return <StudentProfilesSearchPage />;
  }

  const handleDownloadCertificate = () => {
    toast.success('Official QC Student Registry Certificate downloaded (PDF)');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">Student Registry</h1>
            <Badge variant="success" size="md">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Active QC Scholar Registry
            </Badge>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
            Official verified enrollment profile, digital scholar pass, and accredited scholarship standing under the Quezon City Youth Development Office.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleDownloadCertificate}
            leftIcon={<Download className="h-4 w-4" />}
            className="font-bold"
          >
            Export Registry Certificate
          </Button>
        </div>
      </div>

      {/* Main Student Registry Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Digital Scholar Pass (Verified Student Registry Card) */}
        <div className="md:col-span-1 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-6 rounded-3xl text-white shadow-xl flex flex-col justify-between space-y-6 border border-slate-800">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-white p-1 shadow-md flex items-center justify-center shrink-0">
                <img src="/logo-system.png" alt="QC Logo" className="h-8 w-8 object-contain" />
              </div>
              <div>
                <h3 className="font-heading text-xs font-black tracking-wider uppercase">QC SCHOLAR REGISTRY</h3>
                <span className="text-[10px] text-blue-300">GovServe Education Division</span>
              </div>
            </div>
            <Badge variant="success" size="sm" className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
              VERIFIED
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                alt="Student Photo"
                className="h-16 w-16 rounded-2xl object-cover border-2 border-white/20 shadow-md"
              />
              <div>
                <h2 className="font-heading font-extrabold text-lg text-white">{profile?.fullName || user?.name || 'Maria Santos'}</h2>
                <p className="text-xs text-blue-200 font-mono">{profile?.studentId || user?.studentId || '2024-00192'}</p>
                <span className="text-[11px] text-slate-300">{profile?.major || 'BS Information Technology'}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Registry Status</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Valid for AY 2026-2027
              </span>
            </div>
            <QrCode className="h-10 w-10 text-white/80 opacity-80" />
          </div>
        </div>

        {/* Registry Details & Official Scholarship Standing */}
        <div className="md:col-span-2 space-y-6">
          {/* Verified Student Profile Details */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" /> Student Profile & Registrar Verification
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Synchronized with the Registrar database & Quezon City Youth Development Office.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Student ID Number</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm font-mono">{profile?.studentId || user?.studentId || '2024-00192'}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Registered Email</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{profile?.email || user?.email || 'maria.santos@qc.edu.ph'}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Institution / Partner School</span>
                  <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> Quezon City University (QCU)
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Department & Course</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {profile?.department || 'College of Computer Studies (CCS)'} ({profile?.major || 'BS Information Technology'})
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Year Level & Standing</span>
                  <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" /> {profile?.yearLevel || '3rd Year'} — GWA: {profile?.gpa || '3.82'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">QC Residency Barangay</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{profile?.barangay || 'Barangay Batasan Hills, Quezon City'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Official Scholarship Details & Standing Grid (NEW CONTENT.md) */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" /> Official Scholarship Enrolment & Status
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Current grant award, academic tenure, term registration, and standing verified by QCYDO.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* 1. What scholar they have */}
                <div className="p-4 bg-blue-50/60 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase text-blue-700 dark:text-blue-300 block flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5 text-blue-600" /> Scholarship Program
                  </span>
                  <h4 className="font-heading font-extrabold text-slate-900 dark:text-white text-sm">
                    Dean’s Tech Excellence Award (QCYDO Merit Grant)
                  </h4>
                  <span className="text-[11px] text-emerald-600 font-bold block">
                    Award Value: {formatCurrency(15000)} / Semester
                  </span>
                </div>

                {/* 2. Current term and application */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 block flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-indigo-600" /> Current Term & Application
                  </span>
                  <h4 className="font-heading font-extrabold text-slate-900 dark:text-white text-sm">
                    1st Semester AY 2026-2027
                  </h4>
                  <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-semibold block">
                    App Reference: APP-QC-2026-00192
                  </span>
                </div>

                {/* 3. Age of their scholarship */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 block flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-amber-600" /> Age / Tenure of Scholarship
                  </span>
                  <h4 className="font-heading font-extrabold text-slate-900 dark:text-white text-sm">
                    2 Years, 1 Month
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    Enrolled since Aug 2024 • 5 Semesters Active
                  </span>
                </div>

                {/* 4. Status of their scholarship */}
                <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-700 dark:text-emerald-300 block flex items-center gap-1">
                    <FileCheck className="h-3.5 w-3.5 text-emerald-600" /> Status of Scholarship
                  </span>
                  <div className="pt-0.5">
                    <Badge variant="success" size="md" className="font-bold">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Active & In Good Standing
                    </Badge>
                  </div>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium block">
                    Disbursement Cleared for Current Semester
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentRegistryPage;
