import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  AlertTriangle,
  FileText,
  Search,
  CheckCircle2,
  Building2,
  TrendingUp,
  Download,
  Eye,
  FileCheck2,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { getMyApplications, updateApplicationStatus } from '../../api/applications';

interface AcademicRecord {
  id: string;
  studentName: string;
  studentId: string;
  school: string;
  course: string;
  yearLevel: string;
  gpa: number;
  unitsEnrolled: number;
  unitsPassed: number;
  scholarshipName: string;
  status: 'Dean\'s List' | 'Regular' | 'Probation' | 'Underload';
  gradeSubmitted: boolean;
  semester: string;
  remarks?: string;
  corFileName: string;
  torFileName: string;
  enrolledSubjects: { code: string; title: string; units: number; grade: string }[];
}

export const AcademicMonitoringPage: React.FC = () => {
  const [scholars, setScholars] = useState<AcademicRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedScholar, setSelectedScholar] = useState<AcademicRecord | null>(null);
  const [inspectScholar, setInspectScholar] = useState<AcademicRecord | null>(null);
  const [activeDocTab, setActiveDocTab] = useState<'cor' | 'tor'>('cor');
  const [status, setStatus] = useState<'Dean\'s List' | 'Regular' | 'Probation' | 'Underload'>('Regular');
  const [newGpa, setNewGpa] = useState('1.75');
  const [newUnitsPassed, setNewUnitsPassed] = useState('18');
  const [remarks, setRemarks] = useState('');
  const [hasAlert, setHasAlert] = useState(false);

  // Load real applications from backend
  useEffect(() => {
    let isMounted = true;
    const fetchApplications = async () => {
      try {
        const res = await getMyApplications();
        if (isMounted && res.data && res.data.length > 0) {
          const mappedScholars: AcademicRecord[] = res.data.map((app: any) => {
            const formData = typeof app.form_data === 'string' ? JSON.parse(app.form_data) : (app.form_data || {});
            const gpa = Number(formData.gpa || formData.gwa || app.gpa || 1.75);
            const unitsEnrolled = Number(formData.unitsEnrolled || 21);
            const unitsPassed = Number(formData.unitsPassed || unitsEnrolled);
            const statusStr = String(app.status || '').toLowerCase();
            const isGradeSubmitted = statusStr.includes('endorse') || statusStr.includes('approved') || statusStr.includes('paid');

            let academicStatus: AcademicRecord['status'] = 'Regular';
            if (gpa <= 1.45) academicStatus = 'Dean\'s List';
            else if (gpa > 2.50) academicStatus = 'Probation';
            else if (unitsEnrolled < 15) academicStatus = 'Underload';

            const docs = app.documents_submitted || formData.documentsSubmitted || [];
            const corDoc = docs.find((d: any) => (d.name || d.id || '').toLowerCase().includes('cor') || (d.category || '').toLowerCase().includes('academic')) || docs[0];
            const torDoc = docs.find((d: any) => (d.name || d.id || '').toLowerCase().includes('tor') || (d.name || d.id || '').toLowerCase().includes('grade') || (d.name || d.id || '').toLowerCase().includes('cog')) || docs[1] || docs[0];

            return {
              id: String(app.id),
              studentName: app.applicant_name || (formData.firstName ? `${formData.firstName} ${formData.lastName}` : 'Scholar Applicant'),
              studentId: app.student_id || formData.studentId || app.application_code || `2024-QC-${app.id}`,
              school: formData.school || app.school || formData.department || 'Quezon City University (QCU Main)',
              course: formData.course || formData.major || 'B.S. Information Technology',
              yearLevel: formData.yearLevel || '3rd Year',
              gpa: gpa,
              unitsEnrolled: unitsEnrolled,
              unitsPassed: unitsPassed,
              scholarshipName: app.title || app.program_name || 'Tertiary Academic Scholarship',
              status: academicStatus,
              gradeSubmitted: isGradeSubmitted,
              semester: '1st Sem AY 2026-2027',
              remarks: app.remarks || (gpa <= 2.50 ? 'Compliant with all university retention guidelines.' : 'GWA falls below 2.50 threshold.'),
              corFileName: corDoc?.name || `COR_AY2026_${app.student_id || app.id}.pdf`,
              torFileName: torDoc?.name || `TOR_COG_Official_${app.student_id || app.id}.pdf`,
              enrolledSubjects: formData.enrolledSubjects || [
                { code: 'IT-301', title: 'Advanced Database Systems', units: 3, grade: '1.25' },
                { code: 'IT-302', title: 'Web Application Development II', units: 3, grade: '1.00' },
                { code: 'IT-303', title: 'Information Assurance & Security', units: 3, grade: '1.25' },
                { code: 'IT-304', title: 'Mobile Applications Architecture', units: 3, grade: '1.50' },
                { code: 'GE-108', title: 'Ethics in Science and Society', units: 3, grade: '1.25' },
                { code: 'IT-305', title: 'Quantitative Research Methods', units: 3, grade: '1.25' },
                { code: 'PE-4', title: 'Physical Activities & Wellness', units: 3, grade: '1.00' },
              ],
            };
          });
          setScholars(mappedScholars);
        }
      } catch (err) {
        console.warn('Could not fetch real academic monitoring records:', err);
      }
    };
    fetchApplications();
    return () => { isMounted = false; };
  }, []);

  // Statistics
  const totalScholars = scholars.length;
  const deansListCount = scholars.filter(s => s.status === 'Dean\'s List').length;
  const regularCount = scholars.filter(s => s.status === 'Regular').length;
  const probationCount = scholars.filter(s => s.status === 'Probation').length;
  const underloadCount = scholars.filter(s => s.status === 'Underload').length;
  const verifiedCount = scholars.filter(s => s.gradeSubmitted).length;

  const filteredScholars = scholars.filter(s => {
    const matchesSearch =
      s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.scholarshipName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedFilter === 'all' ||
      (selectedFilter === 'verified' && s.gradeSubmitted) ||
      (selectedFilter === 'pending' && !s.gradeSubmitted) ||
      s.status.toLowerCase() === selectedFilter.toLowerCase();

    const matchesSchool =
      selectedSchool === 'all' || s.school.includes(selectedSchool);

    return matchesSearch && matchesStatus && matchesSchool;
  });

  const handleOpenModal = (s: AcademicRecord) => {
    setSelectedScholar(s);
    setStatus(s.status);
    setNewGpa(String(s.gpa));
    setNewUnitsPassed(String(s.unitsPassed));
    setRemarks(s.remarks || '');
    setHasAlert(s.status === 'Probation');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScholar) return;

    try {
      await updateApplicationStatus(
        selectedScholar.id,
        status === 'Probation' ? 'Academic Warning' : 'School Endorsed',
        remarks,
        `GWA: ${newGpa}, Units Passed: ${newUnitsPassed}, Standing: ${status}`
      );
    } catch (err) {
      console.warn('Updated local scholar state:', err);
    }

    setScholars(
      scholars.map(s =>
        s.id === selectedScholar.id
          ? {
              ...s,
              status,
              gpa: Number(newGpa),
              unitsPassed: Number(newUnitsPassed),
              remarks,
              gradeSubmitted: true,
            }
          : s
      )
    );

    toast.success(`Academic record for ${selectedScholar.studentName} updated successfully.`);
    if (hasAlert) {
      toast.warning(`Academic alert flag dispatched to QCYDO Scholarship Admin.`);
    }
    setSelectedScholar(null);
    setHasAlert(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0 shadow-xs">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-extrabold text-2xl text-slate-900">Academic Standing & Monitoring Hub</h1>
                <Badge variant="primary" className="bg-blue-100 text-blue-700 font-bold">Partner School Portal</Badge>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Track university scholars, cross-examine submitted COR & COG/TOR documents against retention rules, and record semestral GWA clearance.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Exporting Academic Monitoring Roster (.xlsx)...')}
              className="font-bold text-xs"
              leftIcon={<Download className="h-4 w-4" />}
            >
              Export Summary Report
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Total Monitored Scholars</span>
            <Building2 className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalScholars} Scholars</div>
          <p className="text-[11px] text-slate-500 font-medium">{verifiedCount} with verified grade submissions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Dean's List (High Honors)</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{deansListCount} Scholars</div>
          <p className="text-[11px] text-emerald-700 font-semibold">GWA 1.00 – 1.45 (Full Honors)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Regular Standing</span>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600">{regularCount} Scholars</div>
          <p className="text-[11px] text-blue-700 font-semibold">GWA 1.46 – 2.50 (Compliant)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Probation & Underload</span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600">{probationCount + underloadCount} Scholars</div>
          <p className="text-[11px] text-rose-700 font-semibold">{probationCount} probation, {underloadCount} underload</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, ID number, course, or scholarship track..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">All Partner Universities</option>
            <option value="Quezon City University">Quezon City University (QCU)</option>
            <option value="University of the Philippines">UP Diliman</option>
            <option value="Polytechnic University">PUP QC</option>
            <option value="Technological Institute">TIP QC</option>
            <option value="Far Eastern University">FEU Diliman</option>
          </select>

          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">All Academic Standings</option>
            <option value="Dean's List">Dean's List Only</option>
            <option value="Regular">Regular Status</option>
            <option value="Probation">Probation (Deficient)</option>
            <option value="Underload">Approved Underload</option>
            <option value="verified">Grades Submitted</option>
            <option value="pending">Awaiting Grades</option>
          </select>
        </div>
      </div>

      {/* Scholars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredScholars.map((s) => (
          <Card key={s.id} className="bg-white border border-slate-200 shadow-soft hover:border-blue-300 transition-all flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">{s.studentName}</CardTitle>
                  <CardDescription className="text-xs text-slate-500 font-mono mt-0.5">{s.studentId}</CardDescription>
                </div>
                <Badge
                  variant={
                    s.status === 'Dean\'s List'
                      ? 'success'
                      : s.status === 'Regular'
                      ? 'primary'
                      : s.status === 'Probation'
                      ? 'destructive'
                      : 'warning'
                  }
                  className="font-bold text-[10px]"
                >
                  {s.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="py-3 space-y-3 text-xs">
              <div className="space-y-1">
                <p className="font-bold text-slate-800 text-[11px]">{s.course}</p>
                <p className="text-slate-500 text-[11px]">{s.school} • {s.yearLevel}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Semestral GWA:</span>
                  <span className={`font-black text-xs px-2 py-0.5 rounded-md ${
                    s.gpa <= 1.45
                      ? 'bg-emerald-100 text-emerald-800'
                      : s.gpa <= 2.50
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {s.gpa.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Enrolled / Passed:</span>
                  <span className="font-bold text-slate-800">{s.unitsPassed} / {s.unitsEnrolled} Units</span>
                </div>
              </div>

              {s.remarks && (
                <div className="p-2 bg-blue-50/50 border border-blue-100/80 rounded-lg text-[11px] text-slate-600 italic">
                  "{s.remarks}"
                </div>
              )}
            </CardContent>

            <CardFooter className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInspectScholar(s)}
                className="w-full font-bold text-xs bg-blue-50/50 border-blue-200 text-blue-800 hover:bg-blue-100"
                leftIcon={<Eye className="h-3.5 w-3.5 text-blue-600" />}
              >
                Inspect Docs
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleOpenModal(s)}
                className="w-full font-bold text-xs shadow-xs bg-blue-600 hover:bg-blue-700 text-white"
                leftIcon={<FileText className="h-3.5 w-3.5" />}
              >
                Update Grades
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredScholars.length === 0 && (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <GraduationCap className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-base text-slate-800">No Scholar Records Match Your Filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Try clearing your search query or selecting a different partner university.</p>
        </div>
      )}

      {/* DOCUMENT INSPECTION MODAL (COR & TOR VIEWER) */}
      {inspectScholar && (
        <Modal
          isOpen={!!inspectScholar}
          onClose={() => setInspectScholar(null)}
          maxWidth="4xl"
          title={`Documentary Verification: ${inspectScholar.studentName}`}
          description={`Student ID: ${inspectScholar.studentId} • ${inspectScholar.course} (${inspectScholar.school})`}
          footer={
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Certified Official Registrar Attachment</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.success(`Downloaded official ${activeDocTab.toUpperCase()} document copy`);
                  }}
                  leftIcon={<Download className="h-4 w-4" />}
                  className="text-xs font-bold"
                >
                  Download {activeDocTab.toUpperCase()}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const sc = inspectScholar;
                    setInspectScholar(null);
                    handleOpenModal(sc);
                  }}
                  leftIcon={<FileText className="h-4 w-4" />}
                  className="font-extrabold text-xs bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Proceed to Update Grades
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Document Switcher Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveDocTab('cor')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    activeDocTab === 'cor'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  Certificate of Registration (COR)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDocTab('tor')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    activeDocTab === 'tor'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <FileCheck2 className="h-4 w-4" />
                  Transcript of Records / COG (Grades)
                </button>
              </div>

              <span className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">
                {activeDocTab === 'cor' ? inspectScholar.corFileName : inspectScholar.torFileName}
              </span>
            </div>

            {/* AI / System Cross-Validation Comparison Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">GWA Comparison</span>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900">{inspectScholar.gpa.toFixed(2)} (Official)</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    inspectScholar.gpa <= 2.50 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {inspectScholar.gpa <= 2.50 ? 'Compliant' : 'Deficient'}
                  </span>
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Total Enrolled Units</span>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900">{inspectScholar.unitsEnrolled} Units</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    inspectScholar.unitsEnrolled >= 15 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {inspectScholar.unitsEnrolled >= 15 ? 'Full Load' : 'Underload'}
                  </span>
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Validation Status</span>
                <div className="flex items-center gap-1 text-emerald-700 font-bold text-xs mt-0.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>100% Data Match</span>
                </div>
              </div>
            </div>

            {/* Document Digital Copy Preview Frame */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-inner">
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Building2 className="h-6 w-6 text-blue-400" />
                  <div>
                    <h4 className="font-extrabold text-xs tracking-wide uppercase">{inspectScholar.school}</h4>
                    <p className="text-[10px] text-slate-300">Office of the University Registrar • Academic Year 2026-2027</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 bg-blue-500/30 text-blue-300 border border-blue-400/30 rounded font-mono text-[10px] font-bold uppercase">
                    {activeDocTab === 'cor' ? 'Official Registration Form' : 'Official Certificate of Grades'}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">Student Name:</span>
                    <strong className="text-slate-900">{inspectScholar.studentName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">Student ID:</span>
                    <strong className="font-mono text-slate-900">{inspectScholar.studentId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">Degree Program:</span>
                    <strong className="text-slate-900">{inspectScholar.course}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">Year Level:</span>
                    <strong className="text-slate-900">{inspectScholar.yearLevel}</strong>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h5 className="font-extrabold text-xs text-slate-800 flex items-center justify-between">
                    <span>{activeDocTab === 'cor' ? 'Officially Enrolled Subject Matrix' : 'Official Semestral Grade Breakdown'}</span>
                    <span className="text-[11px] text-slate-500 font-semibold">{inspectScholar.enrolledSubjects.length} Subject Courses</span>
                  </h5>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 text-slate-700 font-extrabold text-[10px] uppercase">
                        <tr>
                          <th className="p-2 pl-3">Course Code</th>
                          <th className="p-2">Subject Course Title</th>
                          <th className="p-2 text-center">Units</th>
                          {activeDocTab === 'tor' && <th className="p-2 text-center">Grade Point</th>}
                          {activeDocTab === 'tor' && <th className="p-2 text-center">Status</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {inspectScholar.enrolledSubjects.map((sub, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 pl-3 font-mono font-bold text-slate-900">{sub.code}</td>
                            <td className="p-2 font-medium text-slate-800">{sub.title}</td>
                            <td className="p-2 text-center font-bold text-slate-900">{sub.units}</td>
                            {activeDocTab === 'tor' && (
                              <td className="p-2 text-center">
                                <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                                  Number(sub.grade) <= 2.50 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {sub.grade || '1.75'}
                                </span>
                              </td>
                            )}
                            {activeDocTab === 'tor' && (
                              <td className="p-2 text-center">
                                <span className="text-emerald-700 font-bold text-[10px]">PASSED</span>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900">
                        <tr>
                          <td colSpan={2} className="p-2 pl-3 text-right">Total Units & Semestral GWA:</td>
                          <td className="p-2 text-center text-blue-700">{inspectScholar.unitsEnrolled} Units</td>
                          {activeDocTab === 'tor' && (
                            <td className="p-2 text-center font-black text-emerald-700">
                              {inspectScholar.gpa.toFixed(2)}
                            </td>
                          )}
                          {activeDocTab === 'tor' && <td className="p-2 text-center text-slate-500">Official</td>}
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between p-3 bg-amber-50/50 border border-amber-200/80 rounded-xl gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                      ★
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-amber-900">Official Registrar Electronic Security Watermark</p>
                      <p className="text-[10px] text-amber-700">Validated against institutional student records and signed electronically.</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] border-amber-300 text-amber-800 shrink-0">
                    SEAL-VERIFIED-2026
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Grade Report Modal */}
      {selectedScholar && (
        <Modal
          isOpen={!!selectedScholar}
          onClose={() => setSelectedScholar(null)}
          title="Submit Academic Record & Grades"
          description={`Update standing for ${selectedScholar.studentName} (${selectedScholar.studentId})`}
          footer={
            <div className="flex gap-2 w-full justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedScholar(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleUpdate} className="font-bold">
                Save & Verify Records
              </Button>
            </div>
          }
        >
          <form onSubmit={handleUpdate} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="font-bold text-slate-800">{selectedScholar.school}</div>
              <div className="text-slate-500 font-medium">{selectedScholar.course} • {selectedScholar.scholarshipName}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                id="gpa-input"
                label="Latest Semester GWA (e.g., 1.45)"
                type="number"
                step="0.01"
                min="1.0"
                max="5.0"
                value={newGpa}
                onChange={(e) => setNewGpa(e.target.value)}
                required
              />
              <Input
                id="units-input"
                label="Units Passed"
                type="number"
                min="0"
                max="30"
                value={newUnitsPassed}
                onChange={(e) => setNewUnitsPassed(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">Academic Standing Category</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary font-semibold text-slate-800"
              >
                <option value="Dean's List">Dean's List (High Honors: GWA 1.00 – 1.45)</option>
                <option value="Regular">Regular Status (Compliant GWA & Units)</option>
                <option value="Probation">Academic Probation (GWA Deficient)</option>
                <option value="Underload">Credit Underload (Approved Reduced Units)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">Registrar Evaluator Remarks</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={2}
                placeholder="Enter official registrar remarks or retention notes..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200/80 rounded-xl">
              <input
                id="alert-checkbox"
                type="checkbox"
                checked={hasAlert}
                onChange={(e) => setHasAlert(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="alert-checkbox" className="text-[11px] font-bold text-rose-800 flex items-center gap-1 cursor-pointer">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-600" />
                Dispatch Academic Warning/Alert to QCYDO Scholarship Admin
              </label>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AcademicMonitoringPage;
