import React, { useState } from 'react';
import {
  GraduationCap,
  AlertTriangle,
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  Building2,
  TrendingUp,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

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
}

const INITIAL_SCHOLARS: AcademicRecord[] = [
  {
    id: 'SCH-101',
    studentName: 'Alexandra Chen',
    studentId: '2024-QC-884920',
    school: 'Quezon City University (QCU Main)',
    course: 'B.S. Information Technology',
    yearLevel: '3rd Year',
    gpa: 1.25,
    unitsEnrolled: 21,
    unitsPassed: 21,
    scholarshipName: 'QC Excel Tertiary Merit Scholarship',
    status: 'Dean\'s List',
    gradeSubmitted: true,
    semester: '1st Sem AY 2026-2027',
    remarks: 'Consistent University Scholar with top class ranking.',
  },
  {
    id: 'SCH-102',
    studentName: 'Julian Alvarez',
    studentId: '2023-QC-492810',
    school: 'Polytechnic University of the Philippines (PUP QC)',
    course: 'B.S. Electronics Engineering',
    yearLevel: '2nd Year',
    gpa: 2.85,
    unitsEnrolled: 18,
    unitsPassed: 15,
    scholarshipName: 'Tertiary Economic Scholarship (Need-Based)',
    status: 'Probation',
    gradeSubmitted: false,
    semester: '1st Sem AY 2026-2027',
    remarks: 'Deficient in 1 major subject. Scheduled for academic counseling.',
  },
  {
    id: 'SCH-103',
    studentName: 'Maria Leonila Santos',
    studentId: '2024-QC-992014',
    school: 'Quezon City University (QCU San Bartolome)',
    course: 'B.S. Accountancy',
    yearLevel: '4th Year',
    gpa: 1.65,
    unitsEnrolled: 12,
    unitsPassed: 12,
    scholarshipName: 'QC Tertiary Academic Grant',
    status: 'Underload',
    gradeSubmitted: true,
    semester: '1st Sem AY 2026-2027',
    remarks: 'Graduating status: Approved underload for final term capstone/OJT.',
  },
  {
    id: 'SCH-104',
    studentName: 'Roberto Garcia',
    studentId: '2023-QC-110293',
    school: 'University of the Philippines Diliman',
    course: 'B.S. Computer Science',
    yearLevel: '3rd Year',
    gpa: 1.40,
    unitsEnrolled: 18,
    unitsPassed: 18,
    scholarshipName: 'QC Tech Giants STEM Excellence Grant',
    status: 'Dean\'s List',
    gradeSubmitted: true,
    semester: '1st Sem AY 2026-2027',
    remarks: 'Active in AI research lab; excellent scholastic standing.',
  },
  {
    id: 'SCH-105',
    studentName: 'Kyla Patricia Ramos',
    studentId: '2025-QC-339102',
    school: 'Technological Institute of the Philippines (TIP QC)',
    course: 'B.S. Civil Engineering',
    yearLevel: '1st Year',
    gpa: 1.75,
    unitsEnrolled: 21,
    unitsPassed: 21,
    scholarshipName: 'Tertiary Academic Scholarship',
    status: 'Regular',
    gradeSubmitted: true,
    semester: '1st Sem AY 2026-2027',
    remarks: 'Maintained required 1.75 minimum GWA threshold.',
  },
  {
    id: 'SCH-106',
    studentName: 'Mark Angelo David',
    studentId: '2024-QC-771924',
    school: 'Far Eastern University Diliman',
    course: 'B.S. Business Administration',
    yearLevel: '2nd Year',
    gpa: 2.10,
    unitsEnrolled: 18,
    unitsPassed: 18,
    scholarshipName: 'Tertiary Economic Scholarship',
    status: 'Regular',
    gradeSubmitted: false,
    semester: '1st Sem AY 2026-2027',
    remarks: 'Awaiting official Certificate of Grades (COG) stamped copy.',
  },
];

export const AcademicMonitoringPage: React.FC = () => {
  const [scholars, setScholars] = useState<AcademicRecord[]>(INITIAL_SCHOLARS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedScholar, setSelectedScholar] = useState<AcademicRecord | null>(null);
  const [status, setStatus] = useState<'Dean\'s List' | 'Regular' | 'Probation' | 'Underload'>('Regular');
  const [newGpa, setNewGpa] = useState('1.75');
  const [newUnitsPassed, setNewUnitsPassed] = useState('18');
  const [remarks, setRemarks] = useState('');
  const [hasAlert, setHasAlert] = useState(false);

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

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScholar) return;

    setScholars(
      scholars.map(s =>
        s.id === selectedScholar.id
          ? {
              ...s,
              status,
              gpa: Number(newGpa),
              unitsPassed: Number(newUnitsPassed),
              gradeSubmitted: true,
              remarks,
            }
          : s
      )
    );
    toast.success(`Academic record for ${selectedScholar.studentName} updated & synced!`);
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
                <h1 className="font-heading font-extrabold text-2xl text-slate-900">Academic Monitoring Portal</h1>
                <Badge variant="primary" className="bg-blue-100 text-blue-700 font-bold">AY 2026-2027</Badge>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Partner school registrar module: Track scholar retention GWA, verify semestral grade slips, and report academic probation flags.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Exporting Academic Summary Report (CSV)...')}
              leftIcon={<Download className="h-4 w-4" />}
              className="font-bold text-xs"
            >
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Total Scholars</span>
            <Building2 className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalScholars}</div>
          <div className="text-[11px] font-semibold text-emerald-600">{verifiedCount} Grades Verified</div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Dean's List / High Honor</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{deansListCount}</div>
          <div className="text-[11px] font-semibold text-slate-500">GWA 1.00 – 1.45</div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Regular Standing</span>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600">{regularCount}</div>
          <div className="text-[11px] font-semibold text-slate-500">Compliant with Rules</div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Probation & Underload</span>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{probationCount + underloadCount}</div>
          <div className="text-[11px] font-semibold text-amber-700">{probationCount} Need Counseling</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, ID, degree program, or scholarship..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">All Partner Universities</option>
            <option value="QCU">Quezon City University</option>
            <option value="UP">UP Diliman</option>
            <option value="PUP">PUP QC</option>
            <option value="TIP">TIP QC</option>
            <option value="FEU">FEU Diliman</option>
          </select>

          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">All Academic Standings</option>
            <option value="dean's list">Dean's List</option>
            <option value="regular">Regular Standing</option>
            <option value="probation">Academic Probation</option>
            <option value="underload">Credit Underload</option>
            <option value="pending">Pending Grade Verification</option>
          </select>
        </div>
      </div>

      {/* Grid of Scholars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {filteredScholars.map((s) => (
          <Card key={s.id} hoverEffect className="flex flex-col justify-between border border-slate-200/90 shadow-soft rounded-2xl bg-white">
            <CardHeader className="space-y-2 pb-3">
              <div className="flex items-center justify-between">
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
                  className="font-bold text-[11px]"
                >
                  {s.status}
                </Badge>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                    s.gradeSubmitted
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {s.gradeSubmitted ? '✓ Grade Verified' : '⏳ Pending COG'}
                </span>
              </div>
              <CardTitle className="text-base font-extrabold text-slate-900">{s.studentName}</CardTitle>
              <CardDescription className="text-xs text-slate-500 font-medium">
                {s.course} • <span className="font-semibold text-slate-700">{s.yearLevel}</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 text-xs text-slate-600 pt-0">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Institution:</span>
                  <span className="font-bold text-slate-800 text-right truncate max-w-[170px]">{s.school}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Student ID:</span>
                  <span className="font-bold text-slate-800">{s.studentId}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500 font-medium">Semestral GWA:</span>
                  <span className={`font-black text-sm px-2 py-0.5 rounded-lg ${
                    s.gpa <= 1.50
                      ? 'bg-emerald-100 text-emerald-800'
                      : s.gpa <= 1.75
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

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Award Track</span>
                <p className="text-xs font-bold text-blue-900 mt-0.5">{s.scholarshipName}</p>
              </div>

              {s.remarks && (
                <div className="p-2 bg-blue-50/50 border border-blue-100/80 rounded-lg text-[11px] text-slate-600 italic">
                  "{s.remarks}"
                </div>
              )}
            </CardContent>

            <CardFooter className="pt-2 border-t border-slate-100">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleOpenModal(s)}
                className="w-full font-bold text-xs shadow-xs"
                leftIcon={<FileText className="h-4 w-4" />}
              >
                Update Grades & Status
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
