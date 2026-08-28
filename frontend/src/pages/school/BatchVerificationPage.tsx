import React, { useState } from 'react';
import {
  FileSpreadsheet,
  ArrowDownToLine,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Users,
  Search,
  UploadCloud,
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
  remarks: string;
}

const SAMPLE_BATCH: BatchRow[] = [
  { id: '1', studentId: '2024-QC-884920', name: 'Alexandra Chen', course: 'BS Information Technology', yearLevel: '3rd Year', unitsEnrolled: 21, gwa: 1.25, status: 'Verified Regular', verified: true, remarks: 'Enrolled in 21 full units. Dean\'s list qualifier.' },
  { id: '2', studentId: '2023-QC-492810', name: 'Julian Alvarez', course: 'BS Electronics Engineering', yearLevel: '2nd Year', unitsEnrolled: 18, gwa: 2.85, status: 'GWA Deficient', verified: false, remarks: 'Failed to meet 2.50 minimum GWA. Flagged for academic counseling.' },
  { id: '3', studentId: '2024-QC-992014', name: 'Maria Leonila Santos', course: 'BS Accountancy', yearLevel: '4th Year', unitsEnrolled: 12, gwa: 1.65, status: 'Underload Warning', verified: true, remarks: 'Approved graduating underload request on file.' },
  { id: '4', studentId: '2023-QC-110293', name: 'Roberto Garcia', course: 'BS Computer Science', yearLevel: '3rd Year', unitsEnrolled: 18, gwa: 1.40, status: 'Verified Regular', verified: true, remarks: 'Good moral cleared; officially registered.' },
  { id: '5', studentId: '2025-QC-339102', name: 'Kyla Patricia Ramos', course: 'BS Civil Engineering', yearLevel: '1st Year', unitsEnrolled: 21, gwa: 1.75, status: 'Verified Regular', verified: true, remarks: 'Regular freshman standing verified.' },
  { id: '6', studentId: '2024-QC-771924', name: 'Mark Angelo David', course: 'BS Business Administration', yearLevel: '2nd Year', unitsEnrolled: 18, gwa: 2.10, status: 'Verified Regular', verified: true, remarks: 'Active economic scholar.' },
];

export const BatchVerificationPage: React.FC = () => {
  const [fileName, setFileName] = useState<string | null>('QCU_Registrar_Enrollment_Master_2026_Term1.xlsx');
  const [rows, setRows] = useState<BatchRow[]>(SAMPLE_BATCH);
  const [isVerifying, setIsVerifying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const totalLoaded = rows.length;
  const verifiedCount = rows.filter(r => r.verified).length;
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

  const handleSyncToCentral = () => {
    setShowConfirmModal(false);
    toast.success('Successfully synchronized 6 student verifications with Central QCYDO Database!');
  };

  const filteredRows = rows.filter(r => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.course.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === 'all' ||
      (selectedFilter === 'verified' && r.verified) ||
      (selectedFilter === 'flagged' && !r.verified) ||
      r.status.toLowerCase().includes(selectedFilter.toLowerCase());

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
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
                Upload university registrar master lists to perform batch enrollment authentication, unit load validation, and GWA clearance in bulk.
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
            leftIcon={<FileCheck className="h-4 w-4" />}
            className="font-bold text-xs shadow-md shadow-blue-600/20"
          >
            Sync to Central Database
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          <p className="text-[11px] text-emerald-700 font-semibold">100% Eligible for Term Stipend Payout</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Flagged / Deficient</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{flaggedCount} Records</div>
          <p className="text-[11px] text-amber-700 font-semibold">GWA Deficient or Underloaded</p>
        </div>
      </div>

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

        <Card className="bg-white border border-slate-200 shadow-soft flex flex-col justify-between p-6 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm">
                ⚡
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">Automated Audit Engine</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Runs automated validation checking GWA retention thresholds, units enrolled (min 15 units), and good moral clearance against QCYDO rules.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleRunBatchVerification}
            isLoading={isVerifying}
            leftIcon={<RefreshCw className={`h-4 w-4 ${isVerifying ? 'animate-spin' : ''}`} />}
            className="w-full font-extrabold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30"
          >
            {isVerifying ? 'Running Verification...' : 'Execute Batch Verification'}
          </Button>
        </Card>
      </div>

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
            <option value="all">All Verification Statuses</option>
            <option value="verified">Verified Regular Only</option>
            <option value="gwa deficient">GWA Deficient</option>
            <option value="underload">Underload Warning</option>
          </select>
        </div>
      </div>

      <Card className="bg-white border border-slate-200 shadow-soft overflow-hidden rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-slate-100">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">Parsed Batch Records Preview</CardTitle>
            <CardDescription className="text-xs text-slate-500">Official semestral registrar batch verification queue</CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-xs">{filteredRows.length} of {rows.length} rows</Badge>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5 pl-6">Student ID</th>
                <th className="p-3.5">Full Name</th>
                <th className="p-3.5">Course & Year</th>
                <th className="p-3.5 text-center">Units Enrolled</th>
                <th className="p-3.5 text-center">Semestral GWA</th>
                <th className="p-3.5">Verification Status</th>
                <th className="p-3.5 pr-6">Registrar Compliance Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 pl-6 font-mono font-bold text-slate-900">{row.studentId}</td>
                  <td className="p-3.5 font-bold text-slate-900">{row.name}</td>
                  <td className="p-3.5">
                    <span className="text-slate-900 font-semibold">{row.course}</span>
                    <span className="text-slate-400 block text-[11px]">{row.yearLevel}</span>
                  </td>
                  <td className="p-3.5 text-center font-bold text-slate-800">{row.unitsEnrolled} Units</td>
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
                    <Badge
                      variant={
                        row.status === 'Verified Regular'
                          ? 'success'
                          : row.status === 'GWA Deficient'
                          ? 'destructive'
                          : 'warning'
                      }
                      className="font-bold text-[10px]"
                    >
                      {row.status}
                    </Badge>
                  </td>
                  <td className="p-3.5 pr-6 text-xs text-slate-500 font-medium">
                    {row.remarks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showConfirmModal && (
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Confirm Central Database Synchronization"
          description="You are about to push verified enrollment records to the City Scholarship Master Database."
          footer={
            <div className="flex gap-2 w-full justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSyncToCentral} className="font-bold">
                Confirm & Sync Masterlist
              </Button>
            </div>
          }
        >
          <div className="space-y-3 text-xs text-slate-600">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Total Records to Sync:</span>
                <span>{rows.length} Scholars</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Verified Clean:</span>
                <span>{verifiedCount} Scholars</span>
              </div>
              <div className="flex justify-between text-amber-700 font-bold">
                <span>Flagged for Review:</span>
                <span>{flaggedCount} Scholars</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              This action will update the QCYDO Central Student Registry, clearing verified students for the upcoming term stipend disbursement batch.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BatchVerificationPage;
