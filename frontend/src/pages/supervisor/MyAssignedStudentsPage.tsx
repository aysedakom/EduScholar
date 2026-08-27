import React, { useState } from 'react';
import { Mail, Phone, Star, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

interface AssignedStudent {
  id: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  hourlyRate: number;
  totalHoursLogged: number;
  attendanceRate: number;
  latestScore?: number;
}

const INITIAL_ASSIGNED_STUDENTS: AssignedStudent[] = [
  {
    id: 'STU-1001',
    studentId: '2024-00192',
    name: 'Maria Santos',
    email: 'maria.santos@qc.edu.ph',
    phone: '+63 917 882 9901',
    jobTitle: 'Computer Lab Assistant',
    department: 'Computer Science Lab',
    hourlyRate: 18.50,
    totalHoursLogged: 48.5,
    attendanceRate: 98,
    latestScore: 4.8,
  },
  {
    id: 'STU-1002',
    studentId: '2023-11048',
    name: 'Joshua Reyes',
    email: 'joshua.reyes@qc.edu.ph',
    phone: '+63 998 112 3344',
    jobTitle: 'Library Archive Cataloger',
    department: 'University Library',
    hourlyRate: 16.00,
    totalHoursLogged: 36.0,
    attendanceRate: 95,
  },
  {
    id: 'STU-1004',
    studentId: '2024-00912',
    name: 'Samantha Tan',
    email: 'samantha.tan@qc.edu.ph',
    phone: '+63 918 221 4455',
    jobTitle: 'Library Assistant',
    department: 'University Library',
    hourlyRate: 16.00,
    totalHoursLogged: 60.0,
    attendanceRate: 100,
    latestScore: 4.9,
  },
];

export const MyAssignedStudentsPage: React.FC = () => {
  const [students] = useState<AssignedStudent[]>(INITIAL_ASSIGNED_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-foreground">My Assigned Scholars</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Complete roster of students assigned to your supervisory departments, endorsement logs, and academic scores.
          </p>
        </div>

        <Badge variant="primary" size="md">
          {students.length} Assigned Scholars
        </Badge>
      </div>

      {/* Roster Cards Grid */}
      <Card>
        <CardHeader className="border-b border-border pb-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search scholar by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary shadow-xs"
            />
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filteredStudents.map((s) => (
              <Card key={s.id} hoverEffect className="flex flex-col justify-between">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="primary" size="sm">{s.department}</Badge>
                    <span className="font-mono text-[11px] text-slate-400">{s.studentId}</span>
                  </div>
                  <CardTitle className="text-base">{s.name}</CardTitle>
                  <CardDescription className="font-semibold text-slate-700">{s.jobTitle}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-2 text-xs text-slate-600 pt-0">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="truncate">{s.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>{s.phone}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-slate-800">
                    <div className="flex justify-between">
                      <span>Total Logged Hours:</span>
                      <span className="font-bold text-slate-900">{s.totalHoursLogged} hrs</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Attendance Rate:</span>
                      <span className="font-bold text-emerald-600">{s.attendanceRate}%</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1">
                      <span>Performance Score:</span>
                      <span className="font-bold text-amber-600">
                        {s.latestScore ? `${s.latestScore} / 5.0` : 'Pending'}
                      </span>
                    </div>
                  </div>
                </CardContent>

                <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <Link to="/supervisor/evaluations">
                    <Button variant="primary" size="sm" leftIcon={<Star className="h-3.5 w-3.5" />} className="font-bold">
                      Submit Evaluation
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
