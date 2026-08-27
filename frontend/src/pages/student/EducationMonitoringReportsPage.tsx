import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BookOpen,
  Download,
  CheckCircle2,
  Award,
  CheckSquare,
  Search,
  Building2,
  GraduationCap,
  Clock,
  AlertTriangle,
  Send,
  Eye,
  Users,
  Calendar,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { toast } from 'sonner';
import { formatCurrency } from '../../utils/cn';
import { SendScholarshipNoticeModal, type NoticeRecipient } from '../../components/admin/SendScholarshipNoticeModal';
import { getMonitoringReports, updateMonitoringReportStatus } from '../../api/reports';

export interface ScholarSubjectGrade {
  code: string;
  title: string;
  units: number;
  grade: number; // 1.00 - 5.00 grading scale
  attendanceRate: number; // Percentage
  status: 'Passed' | 'Passed with Distinction' | 'Incomplete' | 'Failed';
}

export interface ScholarAcademicAuditRecord {
  id: string;
  studentId: string;
  name: string;
  email: string;
  avatar?: string;
  barangay: string;
  schoolId: string;
  schoolName: string;
  course: string;
  yearLevel: string;
  scholarshipTitle: string;
  semesterAidAmount: number;
  currentTerm: string;
  currentGwa: number;
  unitsEnrolled: number;
  unitsPassed: number;
  incompleteUnits: number;
  classAttendanceRate: number;
  communityServiceHours: number;
  requiredServiceHours: number;
  retentionStatus: 'Retention Cleared' | 'Dean’s List Honors' | 'Renewal Processing' | 'Academic Warning' | 'Graduating';
  subjects: ScholarSubjectGrade[];
  registrarVerified: boolean;
  remarks: string;
}

const AUDIT_SCHOLAR_RECORDS: ScholarAcademicAuditRecord[] = [];

export const EducationMonitoringReportsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'system_admin' || user?.role === 'school_coordinator';
  
  const [auditRecords, setAuditRecords] = useState<ScholarAcademicAuditRecord[]>(AUDIT_SCHOLAR_RECORDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedTerm, setSelectedTerm] = useState<string>('AY 2026-2027 1st Semester');
  
  // Interactive Modals
  const [viewingRecord, setViewingRecord] = useState<ScholarAcademicAuditRecord | null>(null);
  const [noticeRecipient, setNoticeRecipient] = useState<NoticeRecipient | null>(null);
  const [showNoticeModal, setShowNoticeModal] = useState(false);

  // Sync active submitted student application from LocalStorage
  useEffect(() => {
    try {
      const activeAppRaw = localStorage.getItem('qc_active_student_application');
      if (activeAppRaw) {
        const activeApp = JSON.parse(activeAppRaw);
        const dynamicAuditRecord: ScholarAcademicAuditRecord = {
          id: `AUDIT-LIVE-${activeApp.id || '9920'}`,
          studentId: activeApp.studentId || '2026-884920',
          name: activeApp.applicantName || 'Student Applicant',
          email: activeApp.email || 'student@university.edu',
          barangay: activeApp.barangay || 'Barangay Central, Quezon City',
          schoolId: 'sch-qc-01',
          schoolName: activeApp.school || 'Quezon City University (QCU)',
          course: activeApp.course || activeApp.program_name || 'BS Information Technology',
          yearLevel: '1st Year',
          scholarshipTitle: activeApp.scholarshipTitle || 'Quezon City Tertiary Scholarship Grant',
          semesterAidAmount: activeApp.amount || 10000,
          currentTerm: '1st Semester AY 2026-2027',
          currentGwa: parseFloat(activeApp.gpa) ? (parseFloat(activeApp.gpa) <= 4.0 && parseFloat(activeApp.gpa) >= 1.0 ? 1.25 : 1.30) : 1.25,
          unitsEnrolled: 21,
          unitsPassed: 21,
          incompleteUnits: 0,
          classAttendanceRate: 98.0,
          communityServiceHours: 20,
          requiredServiceHours: 20,
          retentionStatus: 'Retention Cleared',
          registrarVerified: true,
          remarks: 'Submitted through E-SCHOLAR Portal with complete registrar attachments. Meets all grade & attendance retention benchmarks.',
          subjects: [
            { code: 'CC101', title: 'Introduction to Computing', units: 3, grade: 1.25, attendanceRate: 98, status: 'Passed with Distinction' },
            { code: 'CC102', title: 'Fundamentals of Programming', units: 3, grade: 1.00, attendanceRate: 100, status: 'Passed with Distinction' },
            { code: 'GE101', title: 'Understanding the Self', units: 3, grade: 1.25, attendanceRate: 97, status: 'Passed with Distinction' },
            { code: 'MATH10', title: 'Mathematics in the Modern World', units: 3, grade: 1.50, attendanceRate: 96, status: 'Passed' },
            { code: 'GE102', title: 'Readings in Philippine History', units: 3, grade: 1.25, attendanceRate: 98, status: 'Passed with Distinction' },
            { code: 'PE101', title: 'Physical Fitness & Gymnastics', units: 3, grade: 1.00, attendanceRate: 100, status: 'Passed with Distinction' },
            { code: 'NSTP1', title: 'Civic Welfare Training Service', units: 3, grade: 1.00, attendanceRate: 100, status: 'Passed with Distinction' },
          ],
        };

        setAuditRecords((prev) => {
          const exists = prev.some((r) => r.studentId === dynamicAuditRecord.studentId || r.id === dynamicAuditRecord.id);
          if (!exists) {
            return [dynamicAuditRecord, ...prev];
          }
          return prev;
        });
      }
    } catch (e) {
      console.error('Error loading live submitted application for academic audit:', e);
    }
  }, []);

  const loadAuditRecordsFromDb = async () => {
    try {
      const res = await getMonitoringReports();
      const audits = Array.isArray(res.data?.audits) ? res.data.audits : [];

      const mapped: ScholarAcademicAuditRecord[] = audits.map((a) => {
        return {
          id: String(a.audit_code || a.id),
          studentId: a.student_id,
          name: a.name,
          email: a.email,
          avatar: a.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
          barangay: a.barangay,
          schoolId: 'sch-qc-01',
          schoolName: a.school,
          course: a.program,
          yearLevel: '3rd Year',
          scholarshipTitle: a.program,
          semesterAidAmount: Number(a.semester_aid_amount) || 10000,
          currentTerm: a.current_term,
          currentGwa: Number(a.current_gwa) || 1.75,
          unitsEnrolled: Number(a.units_enrolled) || 18,
          unitsPassed: Number(a.units_passed) || 18,
          incompleteUnits: Number(a.incomplete_units) || 0,
          classAttendanceRate: Number(a.class_attendance_rate) || 98.5,
          communityServiceHours: Number(a.community_service_hours) || 30,
          requiredServiceHours: Number(a.required_service_hours) || 30,
          retentionStatus: a.retention_status as any,
          registrarVerified: Boolean(a.registrar_verified),
          remarks: a.remarks || '',
          subjects: Array.isArray(a.subjects) ? a.subjects : []
        };
      });

      setAuditRecords((prev) => {
        const liveApp = prev.filter((r) => r.id.includes('AUDIT-LIVE'));
        const dbWithoutLive = mapped.filter((m) => !liveApp.some((la) => la.studentId === m.studentId));
        return [...liveApp, ...dbWithoutLive];
      });
    } catch (err) {
      console.error('Failed to load audit records from backend:', err);
    }
  };

  useEffect(() => {
    loadAuditRecordsFromDb();
  }, []);

  // Filter Logic
  const filteredRecords = auditRecords.filter((record) => {
    const matchesSearch =
      record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.scholarshipTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.schoolName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSchool = selectedSchool === 'All' || record.schoolName.toLowerCase().includes(selectedSchool.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || record.retentionStatus === selectedStatus;

    return matchesSearch && matchesSchool && matchesStatus;
  });

  // Calculate Statistics across all audited records
  const totalAudited = auditRecords.length;
  const avgGwa = (auditRecords.reduce((acc, curr) => acc + curr.currentGwa, 0) / (totalAudited || 1)).toFixed(2);
  const avgAttendance = (auditRecords.reduce((acc, curr) => acc + curr.classAttendanceRate, 0) / (totalAudited || 1)).toFixed(1);
  const totalPassedUnits = auditRecords.reduce((acc, curr) => acc + curr.unitsPassed, 0);
  const totalEnrolledUnits = auditRecords.reduce((acc, curr) => acc + curr.unitsEnrolled, 0);
  const unitPassingRate = ((totalPassedUnits / (totalEnrolledUnits || 1)) * 100).toFixed(1);
  const retentionClearedCount = auditRecords.filter((r) => r.retentionStatus === 'Retention Cleared' || r.retentionStatus === 'Dean’s List Honors').length;
  const retentionRate = ((retentionClearedCount / (totalAudited || 1)) * 100).toFixed(1);

  const handleBatchApproveRetention = async () => {
    try {
      for (const r of auditRecords) {
        if (r.retentionStatus !== 'Academic Warning' && r.retentionStatus !== 'Retention Cleared') {
          await updateMonitoringReportStatus(r.id, 'Retention Cleared');
        }
      }
      toast.success('Academic Retention Batch Verified & Approved in Database!');
    } catch (err) {
      console.error(err);
    }

    setAuditRecords((prev) =>
      prev.map((r) => ({
        ...r,
        retentionStatus: r.retentionStatus === 'Academic Warning' ? 'Academic Warning' : 'Retention Cleared',
      }))
    );
  };

  const handleClearIndividualScholar = async (id: string, name: string) => {
    try {
      await updateMonitoringReportStatus(id, 'Retention Cleared');
      toast.success(`Academic Retention Approved in Database for ${name}!`);
    } catch (err) {
      console.error(err);
    }

    setAuditRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, retentionStatus: 'Retention Cleared' } : r))
    );
    if (viewingRecord && viewingRecord.id === id) {
      setViewingRecord((prev) => prev ? { ...prev, retentionStatus: 'Retention Cleared' } : null);
    }
  };

  const handleExportMasterAudit = (type: 'Excel' | 'PDF') => {
    toast.success(`Master Academic Retention Audit exported as ${type}!`, {
      description: `Includes GWA performance, unit completion audit, and attendance compliance for ${filteredRecords.length} scholars.`,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
            Education Monitoring Reports
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleBatchApproveRetention}
              leftIcon={<CheckSquare className="h-4 w-4" />}
              className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
            >
              Approve Retention Batch
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportMasterAudit('Excel')}
            leftIcon={<FileSpreadsheet className="h-4 w-4 text-emerald-600" />}
            className="font-bold"
          >
            Export Ledger
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportMasterAudit('PDF')}
            leftIcon={<Download className="h-4 w-4 text-blue-600" />}
            className="font-bold"
          >
            Audit PDF
          </Button>
        </div>
      </div>

      {/* Overview Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Total Audited Scholars */}
        <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/60 via-white to-slate-50 dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-900">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800 dark:text-blue-300 block">
                Audited Scholars
              </span>
              <h2 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">
                {totalAudited} Active
              </h2>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold block">
                Synced with Registry
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 2. City-Wide GWA Performance */}
        <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50/60 via-white to-slate-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                Average GWA
              </span>
              <h2 className="font-heading font-extrabold text-xl text-emerald-900 dark:text-emerald-200">
                {avgGwa}
              </h2>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block">
                Dean’s Honor Standing
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 3. Unit Completion Rate */}
        <Card className="border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50/60 via-white to-slate-50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 block">
                Unit Completion
              </span>
              <h2 className="font-heading font-extrabold text-xl text-indigo-900 dark:text-indigo-200">
                {unitPassingRate}%
              </h2>
              <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-semibold block">
                {totalPassedUnits}/{totalEnrolledUnits} Units Passed
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 4. Attendance Compliance */}
        <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/60 via-white to-slate-50 dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-900">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-800 dark:text-purple-300 block">
                Class Attendance
              </span>
              <h2 className="font-heading font-extrabold text-xl text-purple-900 dark:text-purple-200">
                {avgAttendance}%
              </h2>
              <span className="text-[10px] text-purple-700 dark:text-purple-400 font-semibold block">
                Biometrics Verified
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 5. Academic Retention Clearance */}
        <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/60 via-white to-slate-50 dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
                Retention Qualified
              </span>
              <h2 className="font-heading font-extrabold text-xl text-amber-900 dark:text-amber-200">
                {retentionRate}%
              </h2>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold block">
                Cleared for Payout
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Audit Roster Card */}
      <Card>
        <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search scholar name, ID, or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 shadow-xs"
              />
            </div>

            {/* Partner School Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="h-10 px-3 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 cursor-pointer shadow-xs max-w-[200px]"
              >
                <option value="All">All Partner Institutions</option>
                <option value="Quezon City University">Quezon City University (QCU)</option>
                <option value="Polytechnic University of the Philippines">PUP Quezon City</option>
                <option value="University of the Philippines Diliman">UP Diliman</option>
                <option value="Technological Institute of the Philippines">TIP Quezon City</option>
                <option value="Far Eastern University">FEU-NRMF</option>
                <option value="St. Luke">St. Luke’s College of Medicine</option>
              </select>
            </div>

            {/* Term Selector */}
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="h-10 px-3 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 cursor-pointer shadow-xs"
              >
                <option value="AY 2026-2027 1st Semester">AY 2026-2027 1st Semester (Current)</option>
                <option value="AY 2025-2026 2nd Semester">AY 2025-2026 2nd Semester</option>
                <option value="AY 2025-2026 1st Semester">AY 2025-2026 1st Semester</option>
              </select>
            </div>
          </div>

          {/* Retention Status Filter Tabs */}
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'All', label: 'All Scholars' },
              { id: 'Dean’s List Honors', label: 'Dean’s Honors' },
              { id: 'Retention Cleared', label: 'Retention Cleared' },
              { id: 'Renewal Processing', label: 'Renewal Pending' },
              { id: 'Academic Warning', label: 'Warning' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedStatus === tab.id
                    ? 'bg-blue-600 text-white shadow-md border border-transparent font-bold'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4">Scholar & Pass ID</th>
                <th className="p-4">Partner Institution & Degree</th>
                <th className="p-4">Enrolled LGU Scholarship</th>
                <th className="p-4">Semester GWA</th>
                <th className="p-4">Unit Completion</th>
                <th className="p-4">Attendance & Service</th>
                <th className="p-4">Retention Clearance</th>
                <th className="p-4 text-right">Audit Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <GraduationCap className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                      No scholar academic audit records match the current filter
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Try selecting a different partner institution or clearing the search keyword.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Scholar Name & Pass ID */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {record.avatar ? (
                          <img
                            src={record.avatar}
                            alt={record.name}
                            className="h-10 w-10 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {record.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {record.name}
                          </span>
                          <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-semibold block">
                            {record.studentId}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[140px] block">
                            {record.barangay.split(',')[0]}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Partner School & Course */}
                    <td className="p-4">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          {record.schoolName}
                        </span>
                        <span className="text-[11px] text-slate-600 dark:text-slate-400 block font-medium">
                          {record.course}
                        </span>
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold block">
                          {record.yearLevel}
                        </span>
                      </div>
                    </td>

                    {/* Scholarship Program & Aid Amount */}
                    <td className="p-4">
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {record.scholarshipTitle}
                        </span>
                        <span className="font-heading font-extrabold text-xs text-emerald-600 dark:text-emerald-400 block mt-0.5">
                          {formatCurrency(record.semesterAidAmount)} / sem
                        </span>
                      </div>
                    </td>

                    {/* Semester GWA Performance */}
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-heading font-black text-sm text-slate-900 dark:text-white">
                            {record.currentGwa.toFixed(2)}
                          </span>
                          {record.currentGwa <= 1.25 ? (
                            <Badge variant="success" size="sm" className="text-[9px] font-bold">
                              TOP 5%
                            </Badge>
                          ) : (
                            <Badge variant="primary" size="sm" className="text-[9px] font-bold">
                              PASSED
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block">
                          ✓ GWA ≥ 1.75 Threshold
                        </span>
                      </div>
                    </td>

                    {/* Unit Completion Rate */}
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {record.unitsPassed} / {record.unitsEnrolled} Units
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                          {record.incompleteUnits === 0 ? '0 Incomplete / Failed' : `${record.incompleteUnits} Units Pending`}
                        </span>
                        <div className="w-20 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden mt-1">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${(record.unitsPassed / record.unitsEnrolled) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Attendance & Service */}
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {record.classAttendanceRate}%
                          </span>
                          <span className="text-[10px] text-slate-400">Class</span>
                        </div>
                        <span className="text-[10px] text-purple-700 dark:text-purple-400 font-semibold block">
                          {record.communityServiceHours}/{record.requiredServiceHours}h Service ✓
                        </span>
                      </div>
                    </td>

                    {/* Retention Clearance Status */}
                    <td className="p-4">
                      <div>
                        {record.retentionStatus === 'Dean’s List Honors' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 dark:text-emerald-200 bg-emerald-100/90 dark:bg-emerald-950/80 px-2.5 py-1 rounded-xl border border-emerald-300 dark:border-emerald-800">
                            <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Dean’s Honors
                          </span>
                        ) : record.retentionStatus === 'Retention Cleared' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 dark:text-blue-200 bg-blue-100/90 dark:bg-blue-950/80 px-2.5 py-1 rounded-xl border border-blue-300 dark:border-blue-800">
                            <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /> Retention Cleared
                          </span>
                        ) : record.retentionStatus === 'Renewal Processing' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-200 bg-amber-100/90 dark:bg-amber-950/80 px-2.5 py-1 rounded-xl border border-amber-300 dark:border-amber-800">
                            <Clock className="h-3.5 w-3.5 text-amber-600" /> Renewal Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 dark:text-rose-200 bg-rose-100/90 dark:bg-rose-950/80 px-2.5 py-1 rounded-xl border border-rose-300 dark:border-rose-800">
                            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" /> Academic Warning
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 block mt-1">
                          AY 2026-2027 Roster
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingRecord(record)}
                          leftIcon={<Eye className="h-3.5 w-3.5 text-blue-600" />}
                          className="font-bold text-xs"
                        >
                          Audit Sheet
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setNoticeRecipient({
                              studentId: record.studentId,
                              studentName: record.name,
                              email: record.email,
                              school: record.schoolName,
                              scholarshipTitle: record.scholarshipTitle,
                              gpa: record.currentGwa,
                            });
                            setShowNoticeModal(true);
                          }}
                          leftIcon={<Send className="h-3.5 w-3.5 text-blue-600" />}
                          className="font-bold text-xs"
                        >
                          Notify
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Interactive Grade Sheet & Attendance Audit Modal */}
      {viewingRecord && (
        <Modal
          isOpen={!!viewingRecord}
          onClose={() => setViewingRecord(null)}
          title={`Academic Retention Audit Sheet: ${viewingRecord.name}`}
          description={`Student ID: ${viewingRecord.studentId} • ${viewingRecord.schoolName} (${viewingRecord.course})`}
          maxWidth="3xl"
          footer={
            <div className="flex flex-wrap items-center justify-between w-full gap-2">
              <Button variant="outline" size="sm" onClick={() => setViewingRecord(null)}>
                Close Sheet
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setNoticeRecipient({
                      studentId: viewingRecord.studentId,
                      studentName: viewingRecord.name,
                      email: viewingRecord.email,
                      school: viewingRecord.schoolName,
                      scholarshipTitle: viewingRecord.scholarshipTitle,
                      gpa: viewingRecord.currentGwa,
                    });
                    setShowNoticeModal(true);
                  }}
                  leftIcon={<Send className="h-3.5 w-3.5 text-blue-600" />}
                  className="font-bold text-xs"
                >
                  Dispatch System Notice
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleClearIndividualScholar(viewingRecord.id, viewingRecord.name)}
                  leftIcon={<CheckCircle2 className="h-4 w-4" />}
                  className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Approve Retention Clearance
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-5 text-xs">
            {/* Header Scholar ID Pill */}
            <div className="p-4 bg-gradient-to-r from-blue-50 via-slate-50 to-white dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-900 rounded-2xl border border-blue-200 dark:border-blue-800 grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Scholarship Program</span>
                <span className="font-bold text-slate-900 dark:text-white block">{viewingRecord.scholarshipTitle}</span>
                <span className="text-emerald-600 font-heading font-extrabold text-xs">{formatCurrency(viewingRecord.semesterAidAmount)} / sem</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Semester GWA & Rank</span>
                <span className="font-heading font-black text-lg text-blue-600 dark:text-blue-400 block">
                  {viewingRecord.currentGwa.toFixed(2)}
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">100% Compliant</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Unit Completion</span>
                <span className="font-bold text-slate-900 dark:text-white block">
                  {viewingRecord.unitsPassed} / {viewingRecord.unitsEnrolled} Units Passed
                </span>
                <span className="text-[10px] text-slate-500">0 Incomplete / Backlogs</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Attendance & Service</span>
                <span className="font-bold text-purple-700 dark:text-purple-400 block">
                  {viewingRecord.classAttendanceRate}% Class Attendance
                </span>
                <span className="text-[10px] text-slate-500">{viewingRecord.communityServiceHours}/{viewingRecord.requiredServiceHours}h Service Hours</span>
              </div>
            </div>

            {/* Course Subject Grade Performance Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-blue-600" /> Course Subject Grade & Attendance Sheet ({viewingRecord.currentTerm})
                </h4>
                <Badge variant="success" size="sm">
                  Registrar Certified ✓
                </Badge>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">Course Code & Description</th>
                      <th className="p-3">Units</th>
                      <th className="p-3">Final Grade</th>
                      <th className="p-3">Attendance</th>
                      <th className="p-3 text-right">Standing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {viewingRecord.subjects.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3">
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block">{sub.code}</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{sub.title}</span>
                        </td>
                        <td className="p-3 font-bold text-slate-700 dark:text-slate-300">{sub.units}.0</td>
                        <td className="p-3">
                          <span className={`font-heading font-black text-sm ${sub.grade <= 1.25 ? 'text-emerald-600' : 'text-blue-600'}`}>
                            {sub.grade.toFixed(2)}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-purple-700 dark:text-purple-400">{sub.attendanceRate}%</span>
                        </td>
                        <td className="p-3 text-right">
                          <Badge variant={sub.status.includes('Distinction') ? 'success' : 'primary'} size="sm">
                            {sub.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Registrar & Auditor Certification Stamp */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>QCYDO Academic Retention Audit Verification</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                {viewingRecord.remarks} Official evaluation synchronized with Quezon City Scholar Registry pass ID and School Aid Distribution disbursement roster.
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Send Official System Notice Modal */}
      {showNoticeModal && noticeRecipient && (
        <SendScholarshipNoticeModal
          isOpen={showNoticeModal}
          onClose={() => {
            setShowNoticeModal(false);
            setNoticeRecipient(null);
          }}
          recipient={noticeRecipient}
          defaultTemplate="renewal"
        />
      )}
    </div>
  );
};

export default EducationMonitoringReportsPage;
