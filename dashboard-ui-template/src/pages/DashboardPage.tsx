import React from 'react';
import {
  DollarSign,
  GraduationCap,
  Building2,
  ShieldCheck,
  BarChart3,
  FileText,
  Calendar,
  HelpCircle,
  WalletCards,
  Landmark,
  CheckSquare,
  Star,
  UserCheck,
  Users,
  RefreshCw,
  ArrowUpRight,
} from 'lucide-react';
import { DashboardHeroBanner } from '../components/dashboard/DashboardHeroBanner';
import { ApplicationProgressTracker } from '../components/student/ApplicationProgressTracker';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

interface DashboardPageProps {
  role: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ role }) => {
  // =========================================================================
  // 1. TREASURY DASHBOARD VIEW
  // =========================================================================
  if (role === 'treasury') {
    return (
      <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in duration-300">
        <DashboardHeroBanner role="treasury" userName="Hon. Maria Elena Santos" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Card hoverEffect className="border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <WalletCards className="h-7 w-7" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                Budget & Fund Management
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Approve Admin Grant Requests, monitor capital pools (₱140M), and release tranches.
              </p>
              <Badge variant="primary" size="sm" className="mt-1">
                Capital Desks & Ordinances
              </Badge>
            </CardContent>
          </Card>

          <Card hoverEffect className="border-emerald-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <RefreshCw className="h-7 w-7" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                Disbursement Reconciliation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Match GCash and Landbank ATM payouts against bank receipts and export COA reports.
              </p>
              <Badge variant="success" size="sm" className="mt-1">
                1-Click Auto Match & COA Ledger
              </Badge>
            </CardContent>
          </Card>

          <Card hoverEffect className="border-amber-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Landmark className="h-7 w-7" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                Inter-Agency Hotlines
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct communications with Scholarship Board Admin, COA Audit, & University Bursars.
              </p>
              <Badge variant="warning" size="sm" className="mt-1">
                Admin & Bursar Channels
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. SUPERVISOR DASHBOARD VIEW
  // =========================================================================
  if (role === 'supervisor') {
    return (
      <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in duration-300">
        <DashboardHeroBanner role="supervisor" userName="Dean Ricardo Morales" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card hoverEffect className="border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                <Star className="h-7 w-7" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                Student Evaluations
              </h3>
              <p className="text-xs text-slate-500">Grade performance and renewal assessments</p>
            </CardContent>
          </Card>

          <Card hoverEffect className="border-emerald-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <UserCheck className="h-7 w-7" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                Enrollment Verification
              </h3>
              <p className="text-xs text-slate-500">Validate active units and semester registration</p>
            </CardContent>
          </Card>

          <Card hoverEffect className="border-purple-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                My Assigned Scholars
              </h3>
              <p className="text-xs text-slate-500">Mentorship tracking and scholar retention</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. SCHOOL COORDINATOR DASHBOARD VIEW
  // =========================================================================
  if (role === 'school_coordinator') {
    return (
      <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in duration-300">
        <DashboardHeroBanner role="school_coordinator" userName="Prof. Clarissa Ramos" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card hoverEffect className="border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                <UserCheck className="h-7 w-7" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                Review Endorsements
              </h3>
              <p className="text-xs text-slate-500">
                Review student credentials, verify COR & TOR, and submit endorsement to QCYDO.
              </p>
            </CardContent>
          </Card>

          <Card hoverEffect className="border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                <CheckSquare className="h-7 w-7" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                Batch Verification
              </h3>
              <p className="text-xs text-slate-500">1-click certify enrolled scholars from your institution.</p>
            </CardContent>
          </Card>

          <Card hoverEffect className="border-emerald-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <BarChart3 className="h-7 w-7" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                Academic Monitoring
              </h3>
              <p className="text-xs text-slate-500">Track student grades, GPA distributions, and retention.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. ADMIN & SYSTEM ADMIN DASHBOARD VIEW
  // =========================================================================
  if (role === 'admin' || role === 'system_admin') {
    return (
      <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in duration-300">
        <DashboardHeroBanner role={role as any} userName="System Administrator" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Card hoverEffect className="border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <GraduationCap className="h-7 w-7" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                Scholarship Programs
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage applications, renewals, tiers, and criteria.
              </p>
            </CardContent>
          </Card>

          <Card hoverEffect className="border-emerald-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Building2 className="h-7 w-7" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                Partner School Database
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monitor university compliance and MOA status.
              </p>
            </CardContent>
          </Card>

          <Card hoverEffect className="border-amber-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <DollarSign className="h-7 w-7" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                School Aid Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track disbursements, tranches, and payout batches.
              </p>
            </CardContent>
          </Card>

          <Card hoverEffect className="border-indigo-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                Student Registry
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Master database of enrolled scholars and verification records.
              </p>
            </CardContent>
          </Card>

          <Card hoverEffect className="border-purple-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <BarChart3 className="h-7 w-7" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                Education Reports
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Demographic trends, budget utilization, and retention metrics.
              </p>
            </CardContent>
          </Card>

          <Card hoverEffect className="border-rose-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <WalletCards className="h-7 w-7" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                Fund Drawdown Requests
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Submit budget requests directly to Treasury for authorization.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 5. STUDENT DASHBOARD VIEW
  // =========================================================================
  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in duration-300">
      {/* Student Hero Banner */}
      <DashboardHeroBanner role="student" userName="Pia Marie Tiburcio Faner" />

      {/* Student Portal Exclusive: Application Progress Status Tracker */}
      <ApplicationProgressTracker />

      {/* Student Utilities & Communication Services */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
            Utilities & Services
          </h3>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Quick Communication & Tools
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card hoverEffect className="border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">Messages</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">System advisories & notices</p>
              </div>
            </CardContent>
          </Card>

          <Card hoverEffect className="border-emerald-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">Calendar</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Disbursement dates & deadlines</p>
              </div>
            </CardContent>
          </Card>

          <Card hoverEffect className="border-purple-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <HelpCircle className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">Help Desk & Support</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Citizen charter & inquiries</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
