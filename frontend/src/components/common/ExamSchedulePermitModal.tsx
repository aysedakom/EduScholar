import React from 'react';
import {
  Download,
  Printer,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { toast } from 'sonner';

export interface ExamSchedulePermitModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicantName: string;
  studentId: string;
  programTitle: string;
  applicationCode?: string;
  school?: string;
  examDate?: string;
  examTime?: string;
  testingCenter?: string;
  roomNumber?: string;
  seatNumber?: string;
}

export const ExamSchedulePermitModal: React.FC<ExamSchedulePermitModalProps> = ({
  isOpen,
  onClose,
  applicantName,
  studentId,
  programTitle,
  applicationCode = 'QCSP-2026-APP-88491',
  school = 'Quezon City University (QCU)',
  examDate = 'Saturday, October 24, 2026',
  examTime = '8:00 AM – 11:30 AM (Batch 1)',
  testingCenter = 'Quezon City University (QCU) - Main Campus San Bartolome',
  roomNumber = 'Academic Bldg A, 3rd Floor - Room 304',
  seatNumber = 'Seat #18',
}) => {
  if (!isOpen) return null;

  const permitCode = `EXAM-PERMIT-${studentId ? String(studentId).replace(/[^a-zA-Z0-9]/g, '') : '2026'}-QC`;

  const handlePrint = () => {
    toast.info('Sending Examination Permit to printer queue...');
    window.print();
  };

  const handleDownload = () => {
    toast.info('Downloading official examination permit package...');
    const element = document.createElement('a');
    const permitHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Official Exam Permit - ${applicantName}</title>
  <style>
    body { font-family: 'Arial', sans-serif; background: #fff; padding: 30px; color: #0f172a; }
    .permit { border: 3px solid #1e3a8a; padding: 24px; max-width: 750px; margin: 0 auto; border-radius: 12px; }
    .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
    .title { font-size: 20px; font-weight: bold; color: #1e3a8a; }
    .subtitle { font-size: 13px; color: #64748b; }
    .details-table { width: 100%; margin-top: 16px; border-collapse: collapse; }
    .details-table td { padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 13px; }
    .label { font-weight: bold; background: #f8fafc; width: 30%; }
    .instructions { margin-top: 16px; font-size: 11px; color: #475569; border-top: 1px dashed #cbd5e1; padding-top: 12px; }
  </style>
</head>
<body>
  <div class="permit">
    <div class="header">
      <div class="title">QUEZON CITY SCHOLARSHIP QUALIFYING EXAMINATION</div>
      <div class="subtitle">Official Examination Testing Permit • Academic Year 2026-2027</div>
      <div style="font-size: 11px; margin-top: 4px; font-weight: bold; color: #2563eb;">Permit Code: ${permitCode}</div>
    </div>
    <table class="details-table">
      <tr><td class="label">Examinee Name</td><td><strong>${applicantName}</strong></td></tr>
      <tr><td class="label">Student ID / LRN</td><td>${studentId}</td></tr>
      <tr><td class="label">School Institution</td><td>${school}</td></tr>
      <tr><td class="label">Scholarship Track</td><td>${programTitle}</td></tr>
      <tr><td class="label">Examination Date</td><td><strong>${examDate}</strong></td></tr>
      <tr><td class="label">Testing Schedule</td><td><strong>${examTime}</strong></td></tr>
      <tr><td class="label">Testing Venue</td><td>${testingCenter}</td></tr>
      <tr><td class="label">Room & Seat Assignment</td><td><strong>${roomNumber} • ${seatNumber}</strong></td></tr>
    </table>
    <div class="instructions">
      <strong>EXAMINEE INSTRUCTIONS:</strong><br>
      1. Arrive at the testing room at least 30 minutes before the scheduled time.<br>
      2. Present this printed permit along with one (1) valid School ID or Government ID.<br>
      3. Bring at least two (2) sharpened Mongol No. 2 pencils and an eraser.<br>
      4. Electronic gadgets and smartwatches are strictly prohibited inside the exam hall.
    </div>
  </div>
</body>
</html>
    `;
    const file = new Blob([permitHtml], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `Exam_Permit_${applicantName.replace(/\s+/g, '_')}_2026.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Qualifying Examination Schedule & Testing Permit"
      description={`Phase 5 Qualification Gating • Track: ${programTitle}`}
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-2">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            <ShieldCheck className="h-4 w-4" />
            <span>Cryptographically Verified Testing Slot</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} leftIcon={<Printer className="h-4 w-4" />}>
              Print Permit
            </Button>
            <Button variant="primary" size="sm" onClick={handleDownload} leftIcon={<Download className="h-4 w-4" />} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
              Download PDF Package
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Permit Header Badge */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-blue-300">
                Official Examination Testing Permit
              </span>
              <h3 className="text-base font-extrabold mt-0.5">{applicantName}</h3>
              <p className="text-xs text-blue-200 mt-0.5">
                ID: <strong>{studentId}</strong> • Application Ref: <strong>{applicationCode}</strong>
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 text-right">
              <span className="text-[9px] uppercase tracking-wider text-blue-200 font-bold block">Assigned Slot</span>
              <span className="font-extrabold text-white text-sm">{seatNumber}</span>
            </div>
          </div>
        </div>

        {/* Schedule & Venue Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 dark:text-slate-400 block">
              Exam Date & Time
            </span>
            <div className="flex items-start gap-2 text-slate-800 dark:text-slate-200 font-bold text-xs">
              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p>{examDate}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal flex items-center gap-1 mt-0.5">
                  <Clock className="h-3 w-3" /> {examTime}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 dark:text-slate-400 block">
              Testing Venue & Room
            </span>
            <div className="flex items-start gap-2 text-slate-800 dark:text-slate-200 font-bold text-xs">
              <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="line-clamp-1">{testingCenter}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                  {roomNumber}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions Checklist */}
        <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800/80 space-y-2 text-blue-950 dark:text-blue-200">
          <span className="font-extrabold text-xs flex items-center gap-1.5">
            <FileCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Mandatory Examination Day Checklist:
          </span>
          <ul className="space-y-1 text-[11px] text-blue-900 dark:text-blue-300 pl-4 list-disc">
            <li>Bring this printed <strong>Testing Permit</strong> and a valid photo ID (School ID or QC Resident ID).</li>
            <li>Arrive at least <strong>30 minutes</strong> prior to 8:00 AM call time.</li>
            <li>Bring two (2) Mongol No. 2 pencils, sharpener, and eraser.</li>
            <li>Wear proper university / school attire (no sleeveless shirts or shorts).</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};
