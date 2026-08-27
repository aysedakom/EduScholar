import React from 'react';
import { Users, Star, UserCheck, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const SupervisorDashboardPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="primary">Supervisor Portal</Badge>
            <span className="text-xs text-muted-foreground font-semibold">QC Public Library & Tech Labs</span>
          </div>
          <h1 className="mt-2 font-heading font-extrabold text-2xl md:text-3xl text-foreground">
            Supervisor Command Center
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Manage assigned scholars, verify enrollment credentials, and submit performance and academic evaluations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to="/supervisor/evaluations">
            <Button variant="primary" size="sm" leftIcon={<Star className="h-4 w-4" />} className="font-bold">
              Submit Evaluations (3)
            </Button>
          </Link>
          <Link to="/supervisor/assigned-students">
            <Button variant="outline" size="sm" leftIcon={<Users className="h-4 w-4" />}>
              Assigned Scholars (14)
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card hoverEffect>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Assigned Scholars</p>
              <p className="font-heading font-extrabold text-2xl text-slate-900 mt-0.5">14 Students</p>
              <p className="text-[11px] text-slate-500 mt-1">Across 2 Departments</p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Pending Verifications</p>
              <p className="font-heading font-extrabold text-2xl text-amber-600 mt-0.5">6 Records</p>
              <p className="text-[11px] text-slate-500 mt-1">Requires Validation</p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Pending Evaluations</p>
              <p className="font-heading font-extrabold text-2xl text-indigo-600 mt-0.5">3 Reviews</p>
              <p className="text-[11px] text-slate-500 mt-1">Mid-Semester Rubric</p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200">
              <Star className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Verified Enrolled</p>
              <p className="font-heading font-extrabold text-2xl text-emerald-600 mt-0.5">11 Active</p>
              <p className="text-[11px] text-slate-500 mt-1">All Credentials Clean</p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <UserCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Summary & Activity Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Breakdowns */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-emerald-600" />
              Enrollment Status
            </CardTitle>
            <CardDescription>Real-time verification audit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center text-xs">
              <span className="font-bold text-emerald-900">Verified Enrolled</span>
              <span className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">11 Scholars</span>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center text-xs">
              <span className="font-bold text-amber-900">Pending Review</span>
              <span className="font-bold text-amber-700 bg-white px-2 py-0.5 rounded-md border border-amber-200">2 Scholars</span>
            </div>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex justify-between items-center text-xs">
              <span className="font-bold text-rose-900">Action Required</span>
              <span className="font-bold text-rose-700 bg-white px-2 py-0.5 rounded-md border border-rose-200">1 Scholar</span>
            </div>

            <Link to="/supervisor/assigned-students" className="block pt-2">
              <Button variant="outline" size="sm" className="w-full font-bold">
                View Full Student Roster
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Recent Validation Activity Feed
              </CardTitle>
              <CardDescription>Live notifications for credential verifications and evaluation requests</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-3">
              {[
                { text: 'Maria Santos uploaded Transcript of Records (Computer Science)', time: '15 mins ago', status: 'Pending Approval' },
                { text: 'Joshua Reyes submitted Certificate of Registration', time: '40 mins ago', status: 'Pending Approval' },
                { text: 'Supervisor Vance completed Performance Evaluation for Samantha Tan', time: '2 hrs ago', status: 'Completed' },
                { text: 'Gabriel Mendoza verified enrollment document (COR 2026)', time: '4 hrs ago', status: 'Verified' },
              ].map((act, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800">{act.text}</p>
                      <span className="text-[11px] text-slate-400 font-medium">{act.time}</span>
                    </div>
                  </div>
                  <Badge variant={act.status === 'Completed' || act.status === 'Verified' ? 'success' : 'warning'} size="sm">
                    {act.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
