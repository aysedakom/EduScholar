import React, { useState } from 'react';
import { FileSpreadsheet, ArrowDownToLine, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

interface BatchRow {
  studentId: string;
  name: string;
  course: string;
  yearLevel: string;
  gwa: number;
  status: 'Verified Regular' | 'Underload Warning' | 'Pending CSV Verification';
}

const SAMPLE_BATCH: BatchRow[] = [
  { studentId: '2026-QC-0981', name: 'Roberto Garcia', course: 'BS Computer Science', yearLevel: '3rd Year', gwa: 1.45, status: 'Verified Regular' },
  { studentId: '2026-QC-1420', name: 'Samantha Perez', course: 'BS Business Admin', yearLevel: '2nd Year', gwa: 1.70, status: 'Verified Regular' },
  { studentId: '2026-QC-0042', name: 'Juan Dela Cruz', course: 'BS Civil Engineering', yearLevel: '4th Year', gwa: 1.30, status: 'Verified Regular' },
  { studentId: '2026-QC-0112', name: 'Maria Clara Santos', course: 'BS Information Tech', yearLevel: '1st Year', gwa: 1.50, status: 'Verified Regular' },
];

export const BatchVerificationPage: React.FC = () => {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [rows] = useState<BatchRow[]>(SAMPLE_BATCH);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileUploaded(true);
      toast.success(`Batch enrollment file '${e.target.files[0].name}' parsed successfully! 4 student records loaded.`);
    }
  };

  const handleRunBatchVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      toast.success('Batch Verification Complete! 4 Student enrollment records verified and synced to Registrar Database.');
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl text-slate-900">Registrar Batch Verification</h1>
            <Badge variant="primary">CSV / Excel Module</Badge>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Upload school registrar master lists (CSV/Excel) to perform batch enrollment and GWA verifications in one click.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Downloading CSV template format...')}
            leftIcon={<ArrowDownToLine className="h-4 w-4" />}
            className="font-bold"
          >
            Download CSV Template
          </Button>
        </div>
      </div>

      {/* Upload Drop Zone */}
      <Card className="bg-white border border-slate-200 shadow-soft">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900">Upload Registrar Master Sheet</CardTitle>
          <CardDescription>Drag and drop your .csv or .xlsx enrollment export file</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="border-2 border-dashed border-slate-200 hover:border-primary p-8 rounded-2xl text-center bg-slate-50/50 transition-all flex flex-col items-center justify-center space-y-3 cursor-pointer relative">
            <input
              type="file"
              accept=".csv, .xlsx"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-primary flex items-center justify-center">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                {fileUploaded ? 'File Uploaded & Loaded!' : 'Click or Drag & Drop File Here'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Supports CSV, XLSX up to 10MB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Table */}
      <Card className="bg-white border border-slate-200 shadow-soft overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">Parsed Batch Records Preview</CardTitle>
            <CardDescription>{rows.length} Records ready for instant registrar verification sync</CardDescription>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={handleRunBatchVerification}
            disabled={isVerifying}
            leftIcon={<RefreshCw className={`h-4 w-4 ${isVerifying ? 'animate-spin' : ''}`} />}
            className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isVerifying ? 'Verifying Records...' : 'Execute Batch Sync'}
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5 pl-5">Student ID</th>
                  <th className="p-3.5">Full Name</th>
                  <th className="p-3.5">Course / Degree</th>
                  <th className="p-3.5">Year Level</th>
                  <th className="p-3.5">Verified GWA</th>
                  <th className="p-3.5 text-right pr-5">Sync Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {rows.map((r) => (
                  <tr key={r.studentId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-5 font-bold text-slate-900">{r.studentId}</td>
                    <td className="p-3.5 font-bold text-slate-900">{r.name}</td>
                    <td className="p-3.5 text-slate-700">{r.course}</td>
                    <td className="p-3.5 text-slate-700">{r.yearLevel}</td>
                    <td className="p-3.5 font-black text-emerald-700">{r.gwa.toFixed(2)}</td>
                    <td className="p-3.5 text-right pr-5">
                      <Badge variant="success">{r.status}</Badge>
                    </td>
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

export default BatchVerificationPage;
