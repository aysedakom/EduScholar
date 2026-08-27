import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  Building2,
  UserCheck,
  GraduationCap,
  Calendar,
  Clock,
  Award,
  BookOpen,
  FileCheck,
  Send,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { INSTALLED_DEPARTMENTS } from '../../utils/departments';
import { formatCurrency } from '../../utils/cn';
import { SendScholarshipNoticeModal, type NoticeRecipient } from '../../components/admin/SendScholarshipNoticeModal';
import { ScholarshipAwardCertificateModal } from '../../components/common/ScholarshipAwardCertificateModal';

export interface StudentProfile {
  id: string;
  studentId: string;
  name: string;
  email: string;
  gpa: number;
  department: string;
  major: string;
  yearLevel: string;
  school: string;
  barangay: string;
  scholarshipTitle: string;
  currentTerm: string;
  applicationNumber: string;
  scholarshipAge: string;
  scholarshipStatus: 'Active & In Good Standing' | 'Active - Renewal Processing' | 'Graduating Scholar' | 'Probationary';
  disbursementAmount: number;
  avatar?: string;
}

import { getScholars } from '../../api/registry';

export const StudentProfilesSearchPage: React.FC = () => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedSchool, setSelectedSchool] = useState('All');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  // Send System Scholarship Notice State
  const [noticeRecipient, setNoticeRecipient] = useState<NoticeRecipient | null>(null);
  const [selectedCertStudent, setSelectedCertStudent] = useState<StudentProfile | null>(null);
  const [showNoticeModal, setShowNoticeModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchRegistry = async () => {
      try {
        const res = await getScholars();
        if (res.data && res.data.length > 0 && isMounted) {
          const mapped: StudentProfile[] = res.data.map(s => ({
            id: `STU-${s.id}`,
            studentId: s.student_id,
            name: s.full_name,
            email: s.email,
            gpa: Number(s.gwa) || 1.75,
            department: 'College of Computer Studies (CCS)',
            major: s.program_name,
            yearLevel: s.scholarship_age.includes('Year 2') ? '2nd Year' : s.scholarship_age.includes('Year 3') ? '3rd Year' : '1st Year',
            school: s.school,
            barangay: 'Quezon City',
            scholarshipTitle: s.program_name,
            currentTerm: s.current_term,
            applicationNumber: `APP-QC-2026-${s.student_id}`,
            scholarshipAge: s.scholarship_age,
            scholarshipStatus: (s.status.includes('Active') ? 'Active & In Good Standing' : 'Active - Renewal Processing') as any,
            disbursementAmount: s.grant_amount || 10000,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
          }));
          setStudents(mapped);
          if (mapped.length > 0) {
            setExpandedStudentId(mapped[0].id);
          }
        }
      } catch {
        // fallback
      }
    };
    fetchRegistry();
    return () => { isMounted = false; };
  }, []);

  const filteredStudents = students.filter((stu) => {
    const matchesSearch =
      stu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.scholarshipTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDepartment === 'All' || stu.department.toLowerCase().includes(selectedDepartment.toLowerCase());
    const matchesSchool = selectedSchool === 'All' || stu.school.toLowerCase().includes(selectedSchool.toLowerCase());

    return matchesSearch && matchesDept && matchesSchool;
  });

  const toggleExpand = (id: string) => {
    setExpandedStudentId(expandedStudentId === id ? null : id);
  };

  const handleExportCSV = () => {
    toast.success('Master QC Student Registry Database exported (CSV)');
    const headers = 'Registry ID,Student ID,Full Name,Email,School / Institution,Department,Major,Year Level,GWA,Scholarship Program,Current Term,Application Number,Scholarship Age / Tenure,Scholarship Status,Disbursement Amount\n';
    const rows = filteredStudents
      .map(
        (s) =>
          `"${s.id}","${s.studentId}","${s.name}","${s.email}","${s.school}","${s.department}","${s.major}","${s.yearLevel}",${s.gpa},"${s.scholarshipTitle}","${s.currentTerm}","${s.applicationNumber}","${s.scholarshipAge}","${s.scholarshipStatus}",${s.disbursementAmount}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `QC_Student_Registry_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const uniqueSchools = Array.from(new Set(students.map((s) => s.school)));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">Student Registry</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
            Official Quezon City Scholar Master Registry. View enrolled scholarships, current academic terms, applications, institutions, scholarship tenure, and standing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" size="md">
            {students.length} Verified Scholars Enrolled
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
            className="font-bold whitespace-nowrap"
          >
            Export Master DB
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex flex-col lg:flex-row items-center gap-3 w-full">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search student name, ID (e.g. 2024-00192), school, scholarship program, or application #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 shadow-xs"
              />
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto">
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:border-blue-600 cursor-pointer min-w-[200px]"
              >
                <option value="All">All Partner Schools</option>
                {uniqueSchools.map((sch) => (
                  <option key={sch} value={sch}>
                    {sch}
                  </option>
                ))}
              </select>

              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:border-blue-600 cursor-pointer min-w-[190px]"
              >
                <option value="All">All Departments</option>
                {INSTALLED_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 p-0 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase group-label border-b border-slate-200 dark:border-slate-700 font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Student & ID</th>
                <th className="p-3.5">School & Degree Program</th>
                <th className="p-3.5">Enrolled Scholarship</th>
                <th className="p-3.5">Current Term & App #</th>
                <th className="p-3.5">Scholarship Tenure / Age</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <GraduationCap className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                      No matching students found in registry
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Try adjusting your search terms or filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => {
                  const isExpanded = expandedStudentId === stu.id;
                  return (
                    <React.Fragment key={stu.id}>
                      <tr
                        onClick={() => toggleExpand(stu.id)}
                        className={`cursor-pointer transition-colors ${
                          isExpanded
                            ? 'bg-blue-50/60 dark:bg-blue-950/40 font-medium'
                            : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={stu.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                              alt={stu.name}
                              className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">{stu.name}</span>
                              <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-semibold">{stu.studentId}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">{stu.school}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">{stu.major} • {stu.yearLevel}</span>
                        </td>

                        <td className="p-3.5">
                          <span className="font-bold text-blue-700 dark:text-blue-300 block text-xs">{stu.scholarshipTitle}</span>
                          <span className="text-[10px] text-emerald-600 font-semibold">{formatCurrency(stu.disbursementAmount)} / sem</span>
                        </td>

                        <td className="p-3.5">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">{stu.currentTerm}</span>
                            <span className="font-mono text-[10px] text-slate-400 block">{stu.applicationNumber}</span>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <Clock className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                            <span className="font-medium text-xs">{stu.scholarshipAge}</span>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <Badge
                            variant={
                              stu.scholarshipStatus.includes('Active')
                                ? 'success'
                                : stu.scholarshipStatus.includes('Graduating')
                                ? 'primary'
                                : 'warning'
                            }
                            size="sm"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {stu.scholarshipStatus}
                          </Badge>
                        </td>

                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(stu.id);
                            }}
                            title={isExpanded ? 'Hide Student Registry Details' : 'View Student Registry Details'}
                            className={`p-2 rounded-xl border transition-all cursor-pointer inline-flex items-center justify-center ${
                              isExpanded
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 shadow-xs'
                            }`}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>

                      {/* Dropdown Accordion Content: Student Registry Verified Profile Data */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 dark:bg-slate-900/90 animate-in fade-in slide-in-from-top-1 duration-200">
                          <td colSpan={7} className="p-4 md:p-6 border-y-2 border-blue-300 dark:border-blue-700 bg-gradient-to-b from-blue-50/50 via-slate-50 to-white dark:from-blue-950/30 dark:via-slate-900 dark:to-slate-900">
                            <div className="space-y-5">
                              {/* Section Header */}
                              <div className="flex items-center justify-between border-b border-blue-200 dark:border-blue-800 pb-3">
                                <div className="flex items-center gap-2">
                                  <Badge variant="primary" className="bg-blue-600 text-white font-bold">
                                    <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Verified Student Registry Card
                                  </Badge>
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    Registry Record ID: <strong className="font-mono text-slate-800 dark:text-slate-200">{stu.id}</strong>
                                  </span>
                                </div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                                  Synchronized with QCYDO Registrar Database
                                </span>
                              </div>

                              {/* Top Row: Digital Scholar Pass Card & Verified Profile Details */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Digital Scholar Pass (Student Registry Card) */}
                                <div className="md:col-span-1 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-5 rounded-3xl text-white shadow-xl flex flex-col justify-between space-y-5 border border-slate-800">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="h-9 w-9 rounded-full bg-white p-1 shadow-md flex items-center justify-center shrink-0">
                                        <img src="/logo-system.png" alt="QC Logo" className="h-7 w-7 object-contain" />
                                      </div>
                                      <div>
                                        <h3 className="font-heading text-[11px] font-black tracking-wider uppercase">QC SCHOLAR REGISTRY</h3>
                                        <span className="text-[9px] text-blue-300">GovServe Education Division</span>
                                      </div>
                                    </div>
                                    <Badge variant="success" size="sm" className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[10px]">
                                      <ShieldCheck className="h-3 w-3 mr-1" /> VERIFIED
                                    </Badge>
                                  </div>

                                  <div className="flex items-center gap-3.5">
                                    <img
                                      src={stu.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                                      alt={stu.name}
                                      className="h-14 w-14 rounded-2xl object-cover border-2 border-white/20 shadow-md"
                                    />
                                    <div>
                                      <h2 className="font-heading font-extrabold text-base text-white">{stu.name}</h2>
                                      <p className="text-xs text-blue-200 font-mono">{stu.studentId}</p>
                                      <span className="text-[11px] text-slate-300">{stu.major}</span>
                                    </div>
                                  </div>

                                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                                    <div>
                                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Registry Status</span>
                                      <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                                        <CheckCircle2 className="h-3 w-3" /> Valid for AY 2026-2027
                                      </span>
                                    </div>
                                    <QrCode className="h-8 w-8 text-white/80 opacity-80" />
                                  </div>
                                </div>

                                {/* Verified Details Grid */}
                                <div className="md:col-span-2 space-y-4">
                                  <div className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2">
                                      <UserCheck className="h-4 w-4 text-blue-600" /> Student Profile & Registrar Verification
                                    </h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                      <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 space-y-0.5">
                                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Student ID Number</span>
                                        <span className="font-bold text-slate-900 dark:text-white font-mono text-xs">{stu.studentId}</span>
                                      </div>
                                      <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 space-y-0.5">
                                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Registered Email</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">{stu.email}</span>
                                      </div>
                                      <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 space-y-0.5">
                                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Institution / Partner School</span>
                                        <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                                          <Building2 className="h-3.5 w-3.5 text-blue-600" /> {stu.school}
                                        </span>
                                      </div>
                                      <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 space-y-0.5">
                                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Department & Course</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">{stu.department}</span>
                                      </div>
                                      <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 space-y-0.5">
                                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Year Level & Standing</span>
                                        <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                                          <GraduationCap className="h-3.5 w-3.5 text-indigo-600" /> {stu.yearLevel} — GWA: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{stu.gpa.toFixed(2)}</span>
                                        </span>
                                      </div>
                                      <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 space-y-0.5">
                                        <span className="text-[9px] uppercase font-bold text-slate-400 block">QC Residency Barangay</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">{stu.barangay}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Second Row: Specific Scholarship Status & Tenure Grid (NEW CONTENT.md) */}
                              <div className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                                <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2">
                                  <Award className="h-4 w-4 text-blue-600" /> Official Scholarship Enrolment, Tenure & Standing
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                                  <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 space-y-1">
                                    <span className="text-[10px] font-extrabold uppercase text-blue-700 dark:text-blue-300 block flex items-center gap-1">
                                      <BookOpen className="h-3.5 w-3.5 text-blue-600" /> Scholarship Award
                                    </span>
                                    <span className="font-bold text-slate-900 dark:text-white text-xs block leading-snug">
                                      {stu.scholarshipTitle}
                                    </span>
                                    <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                                      Grant: {formatCurrency(stu.disbursementAmount)} / Semester
                                    </span>
                                  </div>

                                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                                    <span className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 block flex items-center gap-1">
                                      <Calendar className="h-3.5 w-3.5 text-indigo-600" /> Current Term & Application
                                    </span>
                                    <span className="font-bold text-slate-900 dark:text-white text-xs block">
                                      {stu.currentTerm}
                                    </span>
                                    <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-semibold block mt-0.5">
                                      App Reference: {stu.applicationNumber}
                                    </span>
                                  </div>

                                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                                    <span className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 block flex items-center gap-1">
                                      <Clock className="h-3.5 w-3.5 text-amber-600" /> Age / Tenure of Scholarship
                                    </span>
                                    <span className="font-bold text-slate-900 dark:text-white text-xs block">
                                      {stu.scholarshipAge}
                                    </span>
                                    <span className="text-[10px] text-slate-500 block mt-0.5">
                                      Academic Standing: Satisfactory
                                    </span>
                                  </div>

                                  <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-1">
                                    <span className="text-[10px] font-extrabold uppercase text-emerald-700 dark:text-emerald-300 block flex items-center gap-1">
                                      <FileCheck className="h-3.5 w-3.5 text-emerald-600" /> Status of Scholarship
                                    </span>
                                    <div className="pt-0.5">
                                      <Badge variant="success" size="sm" className="font-bold text-[10px]">
                                        <CheckCircle2 className="h-3 w-3 mr-1" /> {stu.scholarshipStatus}
                                      </Badge>
                                    </div>
                                    <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block mt-0.5">
                                      Official QCYDO Verified
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Admin Action Footer */}
                              <div className="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                  <span>Official Quezon City Youth Development Office Scholar Master Record</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setNoticeRecipient({
                                        studentId: stu.studentId,
                                        studentName: stu.name,
                                        email: stu.email,
                                        school: stu.school,
                                        scholarshipTitle: stu.scholarshipTitle,
                                        applicationId: stu.applicationNumber,
                                        gpa: stu.gpa,
                                      });
                                      setShowNoticeModal(true);
                                    }}
                                    leftIcon={<Send className="h-3.5 w-3.5 text-blue-600" />}
                                    className="font-bold text-xs bg-blue-50/70 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300"
                                  >
                                    Send System Notice
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedCertStudent(stu)}
                                    leftIcon={<Award className="h-3.5 w-3.5 text-amber-600" />}
                                    className="font-bold text-xs bg-amber-50/80 border-amber-300 text-amber-900 hover:bg-amber-100 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300"
                                  >
                                    Official Scholar Certificate
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setExpandedStudentId(null)}
                                    className="font-bold text-xs text-slate-600 dark:text-slate-400"
                                  >
                                    Close Dropdown
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                }))}
              </tbody>
            </table>
        </CardContent>
      </Card>

      {/* Send Official System Notice Modal */}
      {showNoticeModal && noticeRecipient && (
        <SendScholarshipNoticeModal
          isOpen={showNoticeModal}
          onClose={() => {
            setShowNoticeModal(false);
            setNoticeRecipient(null);
          }}
          recipient={noticeRecipient}
        />
      )}

      {/* Official Certificate of Scholarship Award Modal */}
      {selectedCertStudent && (
        <ScholarshipAwardCertificateModal
          isOpen={!!selectedCertStudent}
          onClose={() => setSelectedCertStudent(null)}
          applicantName={selectedCertStudent.name}
          applicantEmail={selectedCertStudent.email}
          studentId={selectedCertStudent.studentId}
          programTitle={selectedCertStudent.scholarshipTitle}
          awardAmount={selectedCertStudent.disbursementAmount || 10000}
          school={selectedCertStudent.school}
          course={selectedCertStudent.department}
          gpa={selectedCertStudent.gpa}
        />
      )}
    </div>
  );
};

export default StudentProfilesSearchPage;
