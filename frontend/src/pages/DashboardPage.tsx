import {
  ArrowLeft,
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
import { Link } from 'react-router-dom';
import { ApplicationProgressTracker } from '../components/student/ApplicationProgressTracker';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role || 'student';

  // =========================================================================
  // 1. TREASURY DASHBOARD VIEW
  // =========================================================================
  if (role === 'treasury') {
    return (
      <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in duration-300">
        {/* Treasury Header Banner */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-soft">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground font-semibold">City Treasury Office • Fiscal Management</span>
              <Badge variant="primary" size="sm">
                FY 2026-2027
              </Badge>
            </div>
            <h1 className="mt-1 font-heading text-2xl font-extrabold md:text-3xl text-slate-900 dark:text-white">
              City Treasury Command Center
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Authorize funding tranches, review incoming Admin Grant Drawdown Requests, and reconcile beneficiary payouts.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/treasury/budget">
              <Button variant="primary" size="sm" className="font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
                Review Budget Tranches
              </Button>
            </Link>
          </div>
        </div>

        {/* Treasury Core Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Link to="/treasury/budget" className="block group">
            <Card hoverEffect className="h-full border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900 group-hover:border-blue-300 dark:group-hover:border-blue-700 group-hover:shadow-md transition-all">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <WalletCards className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Budget & Fund Management</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Approve Admin Grant Requests, monitor capital pools (₱140M), and release tranches.
                  </p>
                </div>
                <Badge variant="primary" size="sm" className="mt-1">
                  Capital Desks & Ordinances
                </Badge>
              </CardContent>
            </Card>
          </Link>

          <Link to="/treasury/reconciliation" className="block group">
            <Card hoverEffect className="h-full border-emerald-100 dark:border-slate-800 bg-white dark:bg-slate-900 group-hover:border-emerald-300 dark:group-hover:border-emerald-700 group-hover:shadow-md transition-all">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <RefreshCw className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Disbursement Reconciliation</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Match GCash and Landbank ATM payouts against bank receipts and export COA reports.
                  </p>
                </div>
                <Badge variant="success" size="sm" className="mt-1">
                  1-Click Auto Match & COA Ledger
                </Badge>
              </CardContent>
            </Card>
          </Link>

          <Link to="/messages" className="block group">
            <Card hoverEffect className="h-full border-amber-100 dark:border-slate-800 bg-white dark:bg-slate-900 group-hover:border-amber-300 dark:group-hover:border-amber-700 group-hover:shadow-md transition-all">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Landmark className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Inter-Agency Hotlines</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Direct communications with Scholarship Board Admin, COA Audit, & University Bursars.
                  </p>
                </div>
                <Badge variant="warning" size="sm" className="mt-1">
                  Admin & Bursar Channels
                </Badge>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Treasury Utilities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/calendar" className="block group">
            <Card hoverEffect className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <CardContent className="p-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Disbursement Calendar</h4>
                    <p className="text-xs text-slate-500">Payout windows and monthly reconciliation deadlines</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </CardContent>
            </Card>
          </Link>

          <Link to="/contact" className="block group">
            <Card hoverEffect className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <CardContent className="p-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Help Desk & System Support</h4>
                    <p className="text-xs text-slate-500">Technical assistance & system inquiries</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
              </CardContent>
            </Card>
          </Link>
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
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-soft">
          <div>
            <span className="text-xs text-muted-foreground font-semibold">Scholarship Supervision Directorate</span>
            <h1 className="mt-1 font-heading text-2xl font-extrabold md:text-3xl text-slate-900 dark:text-white">
              Supervisor Command Center
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Perform student performance evaluations, monitor assigned scholars, and verify enrollment status.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Link to="/supervisor/evaluations" className="block group">
            <Card hoverEffect className="h-full border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                  <Star className="h-7 w-7" />
                </div>
                <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Student Evaluations</h3>
                <p className="text-xs text-slate-500">Grade performance and renewal assessments</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/supervisor/enrollment-verification" className="block group">
            <Card hoverEffect className="h-full border-emerald-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                  <UserCheck className="h-7 w-7" />
                </div>
                <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Enrollment Verification</h3>
                <p className="text-xs text-slate-500">Validate active units and semester registration</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/supervisor/assigned-students" className="block group">
            <Card hoverEffect className="h-full border-purple-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                  <Users className="h-7 w-7" />
                </div>
                <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">My Assigned Scholars</h3>
                <p className="text-xs text-slate-500">Mentorship tracking and scholar retention</p>
              </CardContent>
            </Card>
          </Link>
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
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-soft">
          <div>
            <span className="text-xs text-muted-foreground font-semibold">Institutional Registrar & Coordinator Portal</span>
            <h1 className="mt-1 font-heading text-2xl font-extrabold md:text-3xl text-slate-900 dark:text-white">
              School Coordinator Command Center
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Batch verify enrolled scholars, certify university masterlists, and monitor academic records.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Link to="/school/batch-verification" className="block group">
            <Card hoverEffect className="h-full border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                  <CheckSquare className="h-7 w-7" />
                </div>
                <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Batch Verification</h3>
                <p className="text-xs text-slate-500">1-click certify enrolled scholars from your institution</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/school/academic-monitoring" className="block group">
            <Card hoverEffect className="h-full border-emerald-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                  <BarChart3 className="h-7 w-7" />
                </div>
                <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Academic Monitoring</h3>
                <p className="text-xs text-slate-500">Track student grades, GPA distributions, and retention</p>
              </CardContent>
            </Card>
          </Link>
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
        {/* Admin Header Banner */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-soft">
          <div>
            <span className="text-xs text-muted-foreground font-semibold">QCYDO + HRMD Operations</span>
            <h1 className="mt-1 font-heading text-2xl font-extrabold md:text-3xl text-slate-900 dark:text-white">
              Administrator Command Center
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Monitor active scholarship review queues, financial disbursement batches, and budget utilization metrics.
            </p>
          </div>
        </div>

        {/* Admin Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Link to="/admin/scholarships" className="block group">
            <Card hoverEffect className="h-full border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900 group-hover:border-blue-300 dark:group-hover:border-blue-700 group-hover:shadow-md transition-all">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Scholarship Application Portal</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage applications, renewals, and reviews</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/partner-schools" className="block group">
            <Card hoverEffect className="h-full border-emerald-100 dark:border-slate-800 bg-white dark:bg-slate-900 group-hover:border-emerald-300 dark:group-hover:border-emerald-700 group-hover:shadow-md transition-all">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Partner School Database</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Monitor school compliance and programs</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/school-aid-distribution" className="block group">
            <Card hoverEffect className="h-full border-amber-100 dark:border-slate-800 bg-white dark:bg-slate-900 group-hover:border-amber-300 dark:group-hover:border-amber-700 group-hover:shadow-md transition-all">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">School Aid Distribution</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Track disbursements and funds</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/student-registry" className="block group">
            <Card hoverEffect className="h-full border-indigo-100 dark:border-slate-800 bg-white dark:bg-slate-900 group-hover:border-indigo-300 dark:group-hover:border-indigo-700 group-hover:shadow-md transition-all">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Student Registry</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage master list of scholars</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/education-reports" className="block group">
            <Card hoverEffect className="h-full border-purple-100 dark:border-slate-800 bg-white dark:bg-slate-900 group-hover:border-purple-300 dark:group-hover:border-purple-700 group-hover:shadow-md transition-all">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Education Monitoring Reports</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Analyze data and performance</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/funds" className="block group">
            <Card hoverEffect className="h-full border-rose-100 dark:border-slate-800 bg-white dark:bg-slate-900 group-hover:border-rose-300 dark:group-hover:border-rose-700 group-hover:shadow-md transition-all">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <WalletCards className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Funder Drawdown Requests</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Submit budget drawdown tranches to Treasury</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 5. STUDENT DASHBOARD VIEW
  // =========================================================================
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/e-scholar" className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> E-SCHOLAR Hub
            </Link>
            <span className="text-slate-400 text-xs">/</span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Student Dashboard</span>
          </div>
          <h1 className="mt-1 font-heading text-2xl font-extrabold md:text-3xl text-slate-900 dark:text-white">
            Good day, {user?.name?.split(' ')[0] ?? 'Student'}! 👋
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Here's your scholarship and financial aid overview.
          </p>
        </div>
      </div>

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
          <Link to="/messages" className="block group">
            <Card hoverEffect className="h-full border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900 group-hover:border-blue-300 dark:group-hover:border-blue-700 group-hover:shadow-md transition-all">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">Messages</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">System advisories & notices</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/calendar" className="block group">
            <Card hoverEffect className="h-full border-emerald-100 dark:border-slate-800 bg-white dark:bg-slate-900 group-hover:border-emerald-300 dark:group-hover:border-emerald-700 group-hover:shadow-md transition-all">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">Calendar</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Disbursement dates & deadlines</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/contact" className="block group">
            <Card hoverEffect className="h-full border-purple-100 dark:border-slate-800 bg-white dark:bg-slate-900 group-hover:border-purple-300 dark:group-hover:border-purple-700 group-hover:shadow-md transition-all">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">Help Desk & Support</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Citizen charter & inquiries</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
