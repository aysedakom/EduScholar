import React, { useState, useEffect } from 'react';
import { FileCheck2, CheckCircle2, Clock, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { toast } from 'sonner';

export interface SubmittedDocumentItem {
  id: string;
  code: string;
  name: string;
  category: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  status: 'verified' | 'uploaded' | 'pending';
}

const DEFAULT_SUBMITTED_DOCS: SubmittedDocumentItem[] = [
  {
    id: 'cog',
    code: 'COG',
    name: 'Certificate of Grades (COG / TCG)',
    category: 'Academic Standing',
    fileName: 'Official_COG_1stSem2026.pdf',
    fileSize: '1.4 MB',
    uploadDate: 'Jul 28, 2026 10:14 AM',
    status: 'verified',
  },
  {
    id: 'soa',
    code: 'SOA',
    name: 'Statement of Account (SOA)',
    category: 'Financial Need',
    fileName: 'School_Assessment_SOA.pdf',
    fileSize: '980 KB',
    uploadDate: 'Jul 28, 2026 10:16 AM',
    status: 'verified',
  },
  {
    id: 'cor',
    code: 'COR',
    name: 'Certificate of Registration (COR)',
    category: 'Academic Enrollment',
    fileName: 'Official_COR_Enrolled.pdf',
    fileSize: '2.1 MB',
    uploadDate: 'Jul 28, 2026 10:18 AM',
    status: 'verified',
  },
  {
    id: 'qcid',
    code: 'QCID',
    name: 'QC Citizen ID & Residency Status',
    category: 'Residency & Identity',
    fileName: 'Citizen_Information_System_Matched.json',
    fileSize: 'System Verified',
    uploadDate: 'Jul 28, 2026 10:20 AM',
    status: 'verified',
  },
  {
    id: 'video',
    code: 'VIDEO',
    name: '3-Minute Video Presentation Pitch',
    category: 'Applicant Video Pitch',
    fileName: 'QC_Scholar_Pitch_Alexandra.mp4',
    fileSize: '18.5 MB',
    uploadDate: 'Jul 28, 2026 10:25 AM',
    status: 'uploaded',
  },
];

export const InformationRequirementsGuide: React.FC = () => {
  const [documents, setDocuments] = useState<SubmittedDocumentItem[]>(() => {
    try {
      const stored = localStorage.getItem('student_submitted_checklist');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SUBMITTED_DOCS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('student_submitted_checklist', JSON.stringify(documents));
    } catch (e) {
      console.error(e);
    }
  }, [documents]);

  const handleFileUpload = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocuments(prev =>
      prev.map(doc => {
        if (doc.id === docId) {
          return {
            ...doc,
            fileName: file.name,
            fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
            uploadDate: new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            status: 'uploaded',
          };
        }
        return doc;
      })
    );

    toast.success('Document updated successfully!', {
      description: `${file.name} uploaded to your E-Scholar vault.`,
    });
  };

  const uploadedCount = documents.filter(d => d.status === 'verified' || d.status === 'uploaded').length;

  return (
    <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
      {/* Clean White Card Header */}
      <CardHeader className="border-b border-slate-100 p-5 sm:p-6 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] font-bold">
                ✓ System Vault Linked
              </Badge>
              <span className="text-xs text-slate-500 font-medium">
                {uploadedCount} of {documents.length} Requirements Submitted
              </span>
            </div>
            <CardTitle className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-blue-600" />
              Submitted Document Checklist & Vault Confirmation
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Live confirmation status of mandatory digital files uploaded into your E-Scholar Document Vault.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Requirement Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">File Attached</th>
                <th className="py-3.5 px-4">Date Uploaded</th>
                <th className="py-3.5 px-4 text-center">System Status</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {documents.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Requirement Name */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2.5">
                      <span className="h-7 w-7 rounded-lg bg-blue-50 text-blue-700 font-extrabold text-[10px] flex items-center justify-center shrink-0 border border-blue-100">
                        {doc.code}
                      </span>
                      <span className="font-extrabold text-slate-900">{doc.name}</span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-4 px-4 text-slate-600 font-semibold">
                    {doc.category}
                  </td>

                  {/* Attached File */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-blue-700 font-bold">
                      <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                      <span className="truncate max-w-[180px]">{doc.fileName}</span>
                      <span className="text-[10px] font-mono text-slate-400 font-normal">({doc.fileSize})</span>
                    </div>
                  </td>

                  {/* Date Uploaded */}
                  <td className="py-4 px-4 text-slate-500 font-medium">
                    {doc.uploadDate}
                  </td>

                  {/* Status Confirmation Badge */}
                  <td className="py-4 px-4 text-center">
                    {doc.status === 'verified' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Confirmed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                        <Clock className="h-3.5 w-3.5 text-blue-600" /> Uploaded
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-4 px-5 text-right">
                    <label className="cursor-pointer inline-block">
                      <input
                        type="file"
                        className="hidden"
                        onChange={e => handleFileUpload(doc.id, e)}
                      />
                      <span className="text-xs font-extrabold text-blue-600 hover:text-blue-800 hover:underline">
                        Replace
                      </span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};


