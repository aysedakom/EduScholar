import { ArrowLeft, DollarSign, GraduationCap, Building2, ShieldCheck, BarChart3, FileText, Calendar, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ApplicationProgressTracker } from '../components/student/ApplicationProgressTracker';
import { Card, CardContent } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

export function DashboardPage() {
  const { user } = useAuth();
  const isAdminOrStaff = user?.role !== 'student';

  if (isAdminOrStaff) {
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
        </div>
      </div>
    );
  }

  // Student Dashboard View
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
