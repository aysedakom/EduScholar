import React, { useState } from 'react';
import {
  FileSpreadsheet,
  ArrowDownToLine,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Users,
  Search,
  UploadCloud,
  Send,
  ShieldCheck,
  Check,
  Eye,
  FileText,
  Download,
  FileCheck2,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

interface BatchRow {
  id: string;
  studentId: string;
  name: string;
  course: string;
  yearLevel: string;
  unitsEnrolled: number;
  gwa: number;
  status: 'Verified Regular' | 'GWA Deficient' | 'Underload Warning' | 'Pending CSV Verification';
  verified: boolean;
  endorsedToAdmin: boolean;
  remarks: string;
  corFileName: string;
  torFileName: string;
  schoolName: string;
  enrolledSubjects: { code: string; title: string; units: number; grade?: string }[];
}

const SAMPLE_BATCH: BatchRow[] = [
  {
    id: '1',
    studentId: '2024-QC-884920',
    name: 'Alexandra Chen',
    course: 'BS Information Technology',
    yearLevel: '3rd Year',
    unitsEnrolled: 21,
    gwa: 1.25,
    status: 'Verified Regular',
    verified: true,
    endorsedToAdmin: false,
    remarks: 'Enrolled in 21 full units. Dean\'s list qualifier.',
    corFileName: 'COR_FirstSem_2026_AlexandraChen.pdf',
    torFileName: 'TOR_COG_CertifiedCopy_AlexandraChen.pdf',
    schoolName: 'Quezon City University (QCU Main)',
    enrolledSubjects: [
      { code: 'IT-301', title: 'Advanced Database Systems', units: 3, grade: '1.25' },
      { code: 'IT-302', title: 'Web Application Development II', units: 3, grade: '1.00' },
      { code: 'IT-303', title: 'Information Assurance & Security', units: 3, grade: '1.25' },
      { code: 'IT-304', title: 'Mobile Applications Architecture', units: 3, grade: '1.50' },
      { code: 'GE-108', title: 'Ethics in Science and Society', units: 3, grade: '1.25' },
      { code: 'IT-305', title: 'Quantitative Research Methods', units: 3, grade: '1.25' },
      { code: 'PE-4', title: 'Physical Activities & Wellness', units: 3, grade: '1.00' },
    ],
  },
  {
    id: '2',
    studentId: '2023-QC-492810',
    name: 'Julian Alvarez',
    course: 'BS Electronics Engineering',
    yearLevel: '2nd Year',
    unitsEnrolled: 18,
    gwa: 2.85,
    status: 'GWA Deficient',
    verified: false,
    endorsedToAdmin: false,
    remarks: 'Failed to meet 2.50 minimum GWA. Flagged for academic counseling.',
    corFileName: 'COR_2026_PUP_JulianAlvarez.pdf',
    torFileName: 'COG_SemestralGrades_JulianAlvarez.pdf',
    schoolName: 'Polytechnic University of the Philippines (PUP QC)',
    enrolledSubjects: [
      { code: 'ECE-201', title: 'Circuits & Signals Analysis', units: 4, grade: '3.00' },
      { code: 'ECE-202', title: 'Electromagnetics Engineering', units: 3, grade: '2.75' },
      { code: 'MATH-204', title: 'Differential Equations', units: 3, grade: '3.00' },
      { code: 'ENG-201', title: 'Technical Writing for Engineers', units: 3, grade: '2.25' },
      { code: 'ECE-203', title: 'Electronic Devices & Lab', units: 5, grade: '2.50' },
    ],
  },
  {
    id: '3',
    studentId: '2024-QC-992014',
    name: 'Maria Leonila Santos',
    course: 'BS Accountancy',
    yearLevel: '4th Year',
    unitsEnrolled: 12,
    gwa: 1.65,
    status: 'Underload Warning',
    verified: true,
    endorsedToAdmin: false,
    remarks: 'Approved graduating underload request on file.',
    corFileName: 'COR_AY2026_QCU_MariaSantos.pdf',
    torFileName: 'OfficialTranscript_Certified_Santos.pdf',
    schoolName: 'Quezon City University (QCU San Bartolome)',
    enrolledSubjects: [
      { code: 'ACC-401', title: 'Auditing & Assurance Principles', units: 3, grade: '1.50' },
      { code: 'ACC-402', title: 'Strategic Business Tax Accounting', units: 3, grade: '1.75' },
      { code: 'ACC-403', title: 'Management Advisory Practice', units: 3, grade: '1.50' },
      { code: 'ACC-404', title: 'Senior Accountancy Capstone / OJT', units: 3, grade: '1.75' },
    ],
  },
  {
    id: '4',
    studentId: '2023-QC-110293',
    name: 'Roberto Garcia',
    course: 'BS Computer Science',
    yearLevel: '3rd Year',
    unitsEnrolled: 18,
    gwa: 1.40,
    status: 'Verified Regular',
    verified: true,
    endorsedToAdmin: false,
    remarks: 'Good moral cleared; officially registered.',
    corFileName: 'UPD_Form5_COR_2026_RobertoGarcia.pdf',
    torFileName: 'UPD_TranscriptOfRecords_RobertoGarcia.pdf',
    schoolName: 'University of the Philippines Diliman',
    enrolledSubjects: [
      { code: 'CS-130', title: 'Operating Systems Architecture', units: 3, grade: '1.25' },
      { code: 'CS-140', title: 'Design & Analysis of Algorithms', units: 3, grade: '1.50' },
      { code: 'CS-150', title: 'Computer Networks & Distributed Systems', units: 3, grade: '1.25' },
      { code: 'MATH-120', title: 'Numerical Analysis & Linear Algebra', units: 3, grade: '1.50' },
      { code: 'CS-160', title: 'Artificial Intelligence Principles', units: 3, grade: '1.25' },
      { code: 'PI-100', title: 'The Life and Works of Rizal', units: 3, grade: '1.50' },
    ],
  },
  {
    id: '5',
    studentId: '2025-QC-339102',
    name: 'Kyla Patricia Ramos',
    course: 'BS Civil Engineering',
    yearLevel: '1st Year',
    unitsEnrolled: 21,
    gwa: 1.75,
    status: 'Verified Regular',
    verified: true,
    endorsedToAdmin: false,
    remarks: 'Regular freshman standing verified.',
    corFileName: 'TIP_RegistrationAssessment_KylaRamos.pdf',
    torFileName: 'TIP_GradeReportSlip_Term1.pdf',
    schoolName: 'Technological Institute of the Philippines (TIP QC)',
    enrolledSubjects: [
      { code: 'CE-101', title: 'Civil Engineering Orientation', units: 2, grade: '1.75' },
      { code: 'MATH-101', title: 'Calculus for Engineers I', units: 4, grade: '1.75' },
      { code: 'PHYS-101', title: 'University Physics with Lab', units: 4, grade: '1.75' },
      { code: 'CHEM-101', title: 'Chemistry for Engineers', units: 4, grade: '1.50' },
      { code: 'GE-101', title: 'Understanding the Self', units: 3, grade: '1.75' },
      { code: 'NSTP-1', title: 'Civic Welfare Training Service I', units: 3, grade: '1.50' },
      { code: 'PE-1', title: 'Physical Fitness & Gym', units: 1, grade: '1.50' },
    ],
  },
  {
    id: '6',
    studentId: '2024-QC-771924',
    name: 'Mark Angelo David',
    course: 'BS Business Administration',
    yearLevel: '2nd Year',
    unitsEnrolled: 18,
    gwa: 2.10,
    status: 'Verified Regular',
    verified: true,
    endorsedToAdmin: false,
    remarks: 'Active economic scholar.',
    corFileName: 'FEU_AssessmentForm_MarkDavid.pdf',
    torFileName: 'FEU_OfficialGradeSlip_2026.pdf',
    schoolName: 'Far Eastern University Diliman',
    enrolledSubjects: [
      { code: 'MGT-201', title: 'Operations Management & TQM', units: 3, grade: '2.00' },
      { code: 'MKT-201', title: 'Strategic Marketing Fundamentals', units: 3, grade: '2.00' },
      { code: 'FIN-201', title: 'Financial Management for Business', units: 3, grade: '2.25' },
      { code: 'HRM-201', title: 'Human Resource Development', units: 3, grade: '2.00' },
      { code: 'GE-104', title: 'Mathematics in the Modern World', units: 3, grade: '2.25' },
      { code: 'GE-105', title: 'Purposive Communication', units: 3, grade: '2.00' },
    ],
  },
];

export const BatchVerificationPage: React.FC = () => {
  const [fileName, setFileName] = useState<string | null>('QCU_Registrar_Enrollment_Master_2026_Term1.xlsx');
  const [rows, setRows] = useState<BatchRow[]>(SAMPLE_BATCH);
  const [isVerifying, setIsVerifying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [inspectRow, setInspectRow] = useState<BatchRow | null>(null);
  const [activeDocTab, setActiveDocTab] = useState<'cor' | 'tor'>('cor');

  const totalLoaded = rows.length;
  const verifiedCount = rows.filter(r => r.verified).length;
  const endorsedCount = rows.filter(r => r.endorsedToAdmin).length;
  const flaggedCount = rows.filter(r => !r.verified || r.status === 'GWA Deficient').length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name);
      toast.success(`Batch enrollment file '${file.name}' parsed successfully! ${SAMPLE_BATCH.length} student records loaded.`);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' +
      'Student_ID,Full_Name,Degree_Program,Year_Level,Units_Enrolled,Semestral_GWA,Clearance_Status\n' +
      '2024-QC-884920,Alexandra Chen,BS Information Technology,3rd Year,21,1.25,Cleared\n' +
      '2023-QC-492810,Julian Alvarez,BS Electronics Engineering,2nd Year,18,2.85,Flagged\n' +
      '2024-QC-992014,Maria Leonila Santos,BS Accountancy,4th Year,12,1.65,Cleared\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'QC_Scholarship_Batch_Verification_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Official Registrar Batch Template downloaded (.csv)');
  };

  const handleRunBatchVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setRows(
        rows.map(r => ({
          ...r,
          verified: r.gwa <= 2.50,
          status: r.gwa > 2.50 ? 'GWA Deficient' : r.unitsEnrolled < 15 ? 'Underload Warning' : 'Verified Regular',
        }))
      );
      toast.success('Batch Verification Complete! All records matched against QCYDO active scholar masterlist.');
    }, 1200);
  };

  const handleEndorseSingle = (id: string, name: string) => {
    setRows(rows.map(r => r.id === id ? { ...r, endorsedToAdmin: true } : r));
    toast.success(`✓ Endorsed ${name} to QCYDO Scholarship Admin Review Queue!`);
    if (inspectRow && inspectRow.id === id) {
      setInspectRow({ ...inspectRow, endorsedToAdmin: true });
    }
  };

  const handleBulkEndorseQualified = () => {
    const eligibleCount = rows.filter(r => r.verified && !r.endorsedToAdmin).length;
    if (eligibleCount === 0) {
      toast.info('All qualified scholars are already endorsed to the Admin Queue.');
      return;
    }
    setRows(rows.map(r => r.verified ? { ...r, endorsedToAdmin: true } : r));
    toast.success(`🚀 Successfully pushed ${eligibleCount} qualified scholars to QCYDO Admin Review Queue for Payout Approval!`);
  };

  const handleSyncToCentral = () => {
    setShowConfirmModal(false);
    setRows(rows.map(r => r.verified ? { ...r, endorsedToAdmin: true } : r));
    toast.success('Successfully synchronized and pushed all verified records to QCYDO Central Database!');
  };

  const filteredRows = rows.filter(r => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.course.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === 'all' ||
      (selectedFilter === 'endorsed' && r.endorsedToAdmin) ||
      (selectedFilter === 'verified' && r.verified) ||
      (selectedFilter === 'flagged' && !r.verified) ||
      r.status.toLowerCase().includes(selectedFilter.toLowerCase());

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-soft">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0 shadow-xs">
              <FileSpreadsheet className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-extrabold text-2xl text-slate-900">Registrar Batch Verification Hub</h1>
                <Badge variant="primary" className="bg-blue-100 text-blue-700 font-bold">CSV / XLSX Module</Badge>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Upload university registrar master lists to authenticate enrollment, inspect submitted student COR & TOR attachments, and push verified scholars to QCYDO Admin.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            leftIcon={<ArrowDownToLine className="h-4 w-4" />}
            className="font-bold text-xs"
          >
            Download CSV Template
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowConfirmModal(true)}
            leftIcon={<Send className="h-4 w-4" />}
            className="font-bold text-xs shadow-md shadow-blue-600/20 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Push All to Admin Queue
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Total Loaded Records</span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalLoaded} Scholars</div>
          <p className="text-[11px] text-slate-500 font-medium truncate">File: {fileName || 'None uploaded'}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Verified Compliant</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{verifiedCount} Records</div>
          <p className="text-[11px] text-emerald-700 font-semibold">Passed GWA & Unit Requirements</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Pushed to Admin Queue</span>
            <ShieldCheck className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-purple-600">{endorsedCount} of {verifiedCount}</div>
          <p className="text-[11px] text-purple-700 font-semibold">Ready for Final Admin Payout</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Flagged / Deficient</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{flaggedCount} Records</div>
          <p className="text-[11px] text-amber-700 font-semibold">Held for Academic Review</p>
        </div>
      </div>

      {/* Upload Drop Zone & Action Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white border border-slate-200 shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900">Upload Registrar Master Sheet</CardTitle>
            <CardDescription className="text-xs text-slate-500">Drag and drop your semestral .csv or .xlsx enrollment export file</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="border-2 border-dashed border-blue-200 hover:border-blue-500 p-6 rounded-2xl text-center bg-blue-50/30 transition-all flex flex-col items-center justify-center space-y-2 cursor-pointer relative group">
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="h-11 w-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-900">
                  {fileName ? `Loaded: ${fileName}` : 'Click or Drag & Drop File Here'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Supports CSV, XLSX up to 15MB • Formatted for QCYDO Schema</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Engine Action Card */}
        <Card className="bg-white border border-slate-200 shadow-soft flex flex-col justify-between p-6 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm">
                ⚡
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">Automated Audit & Push Engine</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Validate student records against retention rules. Inspect submitted original COR/TOR copy, then push qualified scholars to the QCYDO Admin Review Queue.
            </p>
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunBatchVerification}
              isLoading={isVerifying}
              leftIcon={<RefreshCw className={`h-4 w-4 ${isVerifying ? 'animate-spin' : ''}`} />}
              className="w-full font-bold text-xs"
            >
              {isVerifying ? 'Validating...' : '1. Re-Run GWA Validation'}
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleBulkEndorseQualified}
              leftIcon={<Send className="h-4 w-4" />}
              className="w-full font-extrabold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
            >
              2. Endorse All Qualified ({verifiedCount}) to Admin
            </Button>
          </div>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by student name, ID number, or degree course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">All Records</option>
            <option value="endorsed">Pushed to Admin Queue (Endorsed)</option>
            <option value="verified">Verified Regular (Eligible)</option>
            <option value="flagged">Flagged / Deficient (Hold)</option>
          </select>
        </div>
      </div>

      {/* Batch Results Table */}
      <Card className="bg-white border border-slate-200 shadow-soft overflow-hidden rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-slate-100">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">Parsed Batch Records & Documentary Verification</CardTitle>
            <CardDescription className="text-xs text-slate-500">Click "Inspect COR/TOR" to cross-examine submitted student documents against system validation</CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-xs">{filteredRows.length} of {rows.length} rows</Badge>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5 pl-6">Student ID</th>
                <th className="p-3.5">Full Name & School</th>
                <th className="p-3.5">Course & Year</th>
                <th className="p-3.5 text-center">Units</th>
                <th className="p-3.5 text-center">GWA</th>
                <th className="p-3.5">Submitted Docs</th>
                <th className="p-3.5">Admin Queue Status</th>
                <th className="p-3.5 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 pl-6 font-mono font-bold text-slate-900">{row.studentId}</td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      {row.name}
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium truncate block max-w-[200px]">{row.schoolName}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="text-slate-900 font-semibold">{row.course}</span>
                    <span className="text-slate-400 block text-[11px]">{row.yearLevel}</span>
                  </td>
                  <td className="p-3.5 text-center font-bold text-slate-800">{row.unitsEnrolled}</td>
                  <td className="p-3.5 text-center">
                    <span className={`font-black text-xs px-2 py-0.5 rounded-lg ${
                      row.gwa <= 1.50
                        ? 'bg-emerald-100 text-emerald-800'
                        : row.gwa <= 2.50
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {row.gwa.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInspectRow(row)}
                      leftIcon={<Eye className="h-3.5 w-3.5 text-blue-600" />}
                      className="text-[11px] font-bold h-7 px-2.5 bg-blue-50/60 border-blue-200 text-blue-800 hover:bg-blue-100 transition-colors"
                    >
                      Inspect COR & TOR
                    </Button>
                  </td>
                  <td className="p-3.5">
                    {row.endorsedToAdmin ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Check className="h-3 w-3" /> Pushed to Admin
                      </span>
                    ) : row.verified ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                        Ready to Endorse
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                        On Academic Hold
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 pr-6 text-right">
                    {row.endorsedToAdmin ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled
                        className="text-xs font-bold text-emerald-700 cursor-default"
                      >
                        ✓ Endorsed
                      </Button>
                    ) : row.verified ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleEndorseSingle(row.id, row.name)}
                        leftIcon={<Send className="h-3.5 w-3.5" />}
                        className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                      >
                        Endorse to Admin
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.warning(`Flagged ${row.name} for GWA deficiency counseling.`)}
                        className="text-xs font-bold text-amber-700 border-amber-300 hover:bg-amber-50"
                      >
                        Flag for Review
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* DOCUMENT INSPECTION MODAL (COR & TOR VIEWER) */}
      {inspectRow && (
        <Modal
          isOpen={!!inspectRow}
          onClose={() => setInspectRow(null)}
          title={`Documentary Verification: ${inspectRow.name}`}
          description={`Student ID: ${inspectRow.studentId} • ${inspectRow.course} (${inspectRow.schoolName})`}
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
                {inspectRow.endorsedToAdmin ? (
                  <Badge variant="success" className="font-extrabold text-xs py-1.5 px-3">
                    ✓ Already Pushed to Admin
                  </Badge>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleEndorseSingle(inspectRow.id, inspectRow.name)}
                    leftIcon={<Send className="h-4 w-4" />}
                    className="font-extrabold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
                  >
                    Confirm & Endorse to Admin
                  </Button>
                )}
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
                {activeDocTab === 'cor' ? inspectRow.corFileName : inspectRow.torFileName}
              </span>
            </div>

            {/* AI / System Cross-Validation Comparison Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">GWA Comparison</span>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900">{inspectRow.gwa.toFixed(2)} (Official)</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    inspectRow.gwa <= 2.50 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {inspectRow.gwa <= 2.50 ? 'Compliant' : 'Deficient'}
                  </span>
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Total Enrolled Units</span>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900">{inspectRow.unitsEnrolled} Units</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    inspectRow.unitsEnrolled >= 15 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {inspectRow.unitsEnrolled >= 15 ? 'Full Load' : 'Underload'}
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
              {/* Document Header Representation */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Building2 className="h-6 w-6 text-blue-400" />
                  <div>
                    <h4 className="font-extrabold text-xs tracking-wide uppercase">{inspectRow.schoolName}</h4>
                    <p className="text-[10px] text-slate-300">Office of the University Registrar • Academic Year 2026-2027</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 bg-blue-500/30 text-blue-300 border border-blue-400/30 rounded font-mono text-[10px] font-bold uppercase">
                    {activeDocTab === 'cor' ? 'Official Registration Form' : 'Official Certificate of Grades'}
                  </span>
                </div>
              </div>

              {/* Document Content Details */}
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">Student Name:</span>
                    <strong className="text-slate-900">{inspectRow.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">Student ID:</span>
                    <strong className="font-mono text-slate-900">{inspectRow.studentId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">Degree Program:</span>
                    <strong className="text-slate-900">{inspectRow.course}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">Year Level:</span>
                    <strong className="text-slate-900">{inspectRow.yearLevel}</strong>
                  </div>
                </div>

                {/* Subject and Grade Matrix */}
                <div className="space-y-1.5">
                  <h5 className="font-extrabold text-xs text-slate-800 flex items-center justify-between">
                    <span>{activeDocTab === 'cor' ? 'Officially Enrolled Subject Matrix' : 'Official Semestral Grade Breakdown'}</span>
                    <span className="text-[11px] text-slate-500 font-semibold">{inspectRow.enrolledSubjects.length} Subject Courses</span>
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
                        {inspectRow.enrolledSubjects.map((sub, idx) => (
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
                          <td className="p-2 text-center text-blue-700">{inspectRow.unitsEnrolled} Units</td>
                          {activeDocTab === 'tor' && (
                            <td className="p-2 text-center font-black text-emerald-700">
                              {inspectRow.gwa.toFixed(2)}
                            </td>
                          )}
                          {activeDocTab === 'tor' && <td className="p-2 text-center text-slate-500">Official</td>}
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Digital Registrar Stamp Signature */}
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

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Confirm Central Database Synchronization"
          description="Push all verified university scholars into the QCYDO Admin Review & Payout Queue."
          footer={
            <div className="flex gap-2 w-full justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSyncToCentral} className="font-bold bg-blue-600 text-white">
                Confirm & Push to Admin
              </Button>
            </div>
          }
        >
          <div className="space-y-3 text-xs text-slate-600">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Total University Records:</span>
                <span>{rows.length} Scholars</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Eligible for Endorsement:</span>
                <span>{verifiedCount} Scholars</span>
              </div>
              <div className="flex justify-between text-amber-700 font-bold">
                <span>Held (GWA Deficient):</span>
                <span>{flaggedCount} Scholars</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Once pushed, these verified student records will instantly appear in the <strong>QCYDO Admin Review Queue</strong> and <strong>School Aid Distribution Module</strong> marked as <em>"School Verified / Ready for Payout"</em>.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BatchVerificationPage;

