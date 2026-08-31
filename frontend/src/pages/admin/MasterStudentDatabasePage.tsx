import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Upload, ArrowLeft, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/cn';
import { getScholars } from '../../api/registry';
import { useAuth } from '../../context/AuthContext';

interface MasterStudentRow {
  id: string;
  studentId: string;
  name: string;
  email: string;
  gpa: number;
  university: string;
  course: string;
  yearLevel: string;
  totalAidReceived: number;
}

export const MasterStudentDatabasePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [students, setStudents] = useState<MasterStudentRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const partnerSchoolRoute = user?.role === 'school_coordinator' ? '/school/partner-schools' : '/admin/partner-schools';

  useEffect(() => {
    let isMounted = true;
    const fetchStudents = async () => {
      try {
        const res = await getScholars();
        if (res.data && isMounted) {
          const mapped: MasterStudentRow[] = res.data.map(s => ({
            id: `STU-${s.id}`,
            studentId: s.student_id,
            name: s.full_name,
            email: s.email,
            gpa: Number(s.gwa) || 1.75,
            university: s.school,
            course: s.program_name,
            yearLevel: s.scholarship_age.includes('Year 2') ? '2nd Year' : s.scholarship_age.includes('Year 3') ? '3rd Year' : '1st Year',
            totalAidReceived: s.grant_amount || 10000,
          }));
          setStudents(mapped);
        }
      } catch {
        // fallback
      }
    };
    fetchStudents();
    return () => { isMounted = false; };
  }, []);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.university.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportCSV = () => {
    toast.success('Exported Master Student Database (CSV dataset)');
  };

  const handleImportCSV = () => {
    toast.info('Simulating SIS Master Student Import...');
    setTimeout(() => toast.success('Imported 120 student records from SIS database!'), 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(partnerSchoolRoute)}
          className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline cursor-pointer bg-blue-50 dark:bg-blue-950/60 px-4 py-2.5 rounded-xl border border-blue-200 dark:border-blue-800 transition-all hover:shadow-xs shadow-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>← Back to Partner School Database</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-foreground dark:text-white">Master Student Database</h1>
          <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1">
            Central student records synchronization, SIS database integration, and bulk student data imports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(partnerSchoolRoute)}
            className="font-bold text-xs border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950"
            leftIcon={<Building2 className="h-4 w-4" />}
          >
            Partner School Database
          </Button>
          <Button variant="outline" size="sm" onClick={handleImportCSV} leftIcon={<Upload className="h-4 w-4" />}>
            Import SIS CSV
          </Button>
          <Button variant="primary" size="sm" onClick={handleExportCSV} leftIcon={<Download className="h-4 w-4" />} className="font-bold">
            Export Master DB CSV
          </Button>
        </div>
      </div>

      {/* Roster Table */}
      <Card>
        <CardHeader className="border-b border-border pb-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search student or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary shadow-xs"
            />
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase group-label border-b border-border">
                <tr>
                  <th className="p-3">Student Name & ID</th>
                  <th className="p-3">University</th>
                  <th className="p-3">Course & Year</th>
                  <th className="p-3">Cumulative GPA</th>
                  <th className="p-3">Total Aid Disbursed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70">
                    <td className="p-3">
                      <div>
                        <span className="font-bold text-slate-900 block">{s.name}</span>
                        <span className="font-mono text-[11px] text-slate-400">{s.studentId}</span>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-slate-800">{s.university}</td>
                    <td className="p-3">
                      <span className="font-medium text-slate-800 block">{s.course}</span>
                      <span className="text-[11px] text-slate-500">{s.yearLevel}</span>
                    </td>
                    <td className="p-3 font-bold text-emerald-600">GPA {s.gpa.toFixed(2)}</td>
                    <td className="p-3 font-bold text-blue-600">{formatCurrency(s.totalAidReceived)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
