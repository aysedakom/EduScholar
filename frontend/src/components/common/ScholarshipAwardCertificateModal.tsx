import React, { useState, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Award,
  Sparkles,
  ArrowLeft,
  BadgeCheck
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface ScholarshipAwardCertificateModalProps {
  isOpen?: boolean;
  onClose: () => void;
  backLabel?: string;
  applicationId?: number | string;
  applicantName: string;
  applicantEmail?: string;
  studentId: string;
  programTitle: string;
  awardAmount?: number | string;
  school?: string;
  course?: string;
  gpa?: number | string;
  certificateNumber?: string;
  issueDate?: string;
}

export const ScholarshipAwardCertificateModal: React.FC<ScholarshipAwardCertificateModalProps> = ({
  isOpen = true,
  onClose,
  backLabel = 'Back to Applications',
  applicationId,
  applicantName,
  studentId,
  programTitle,
  awardAmount = 20000,
  school = 'Bestlink College of the Philippines (BCP)',
  course = 'B.S. Information Technology',
  gpa = 1.50,
  certificateNumber,
  issueDate,
}) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const certNo = certificateNumber || `QCSP-AWARD-2026-${applicationId ? String(applicationId).padStart(5, '0') : '88491'}`;
  const dateStr = issueDate || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const getGrantBreakdown = (title: string, amt: number | string) => {
    const t = (title || '').toLowerCase();
    if (t.includes('economic')) {
      return '₱10,000.00 / Sem (₱5,000 Tuition Grant + ₱5,000 Stipend)';
    }
    if (t.includes('excel')) {
      return '₱80,000.00 / Sem (₱55,000 Tuition + ₱25,000 Stipend)';
    }
    if (t.includes('academic') && !t.includes('shs') && !t.includes('senior high')) {
      return '₱52,500.00 / Sem (₱40,000 Tuition + ₱12,500 Stipend)';
    }
    if (t.includes('athletic') || t.includes('youth leader')) {
      return '₱40,000.00 / Sem (₱27,500 Tuition + ₱12,500 Stipend)';
    }
    if (t.includes('shs') || t.includes('senior high')) {
      return '₱15,000.00 / Sem (₱10,000 Tuition + ₱5,000 Stipend)';
    }
    return `${Number(amt).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })} / Sem`;
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Print-Specific Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #official-scholar-certificate-canvas,
          #official-scholar-certificate-canvas * {
            visibility: visible !important;
          }
          #official-scholar-certificate-canvas {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 32px !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Top Header / Control Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl shadow-soft border border-slate-200 dark:border-slate-800">
        {/* Left: Back button & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            className="font-bold text-xs border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
          >
            {backLabel}
          </Button>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2 min-w-0">
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold border border-emerald-300/40 shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              Conferred Scholar
            </span>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-bold text-foreground truncate">
                Official Award Certificate
              </h1>
              <p className="text-[10px] sm:text-[11px] font-mono text-muted-foreground truncate">
                Control No: {certNo}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Zoom controls */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 10, 60))}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="font-mono font-bold px-1 text-slate-700 dark:text-slate-300 min-w-[3rem] text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 10, 150))}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
              title="Rotate 90°"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Document Area */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-12 lg:p-16 rounded-3xl shadow-soft border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <div
          id="official-scholar-certificate-canvas"
          style={{
            transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease-out',
          }}
          className="w-full max-w-4xl mx-auto space-y-8 font-serif relative text-slate-900 dark:text-slate-100"
        >
          {/* Authentic Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.05] pointer-events-none text-7xl sm:text-9xl font-black rotate-[-25deg] uppercase select-none text-slate-900 dark:text-white">
            QC SCHOLAR
          </div>

          {/* Official Republic & City Seals Header */}
          <div className="text-center space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-blue-700 text-white flex items-center justify-center font-black text-sm sm:text-base shadow-sm font-sans">
                QC
              </div>
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-amber-600 text-white flex items-center justify-center font-black text-sm sm:text-base shadow-sm font-sans">
                <Award className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>
            </div>

            <p className="text-[11px] sm:text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-sans font-bold">
              Republic of the Philippines • City Government of Quezon City
            </p>
            <p className="text-sm sm:text-base uppercase tracking-wider text-slate-900 dark:text-slate-100 font-sans font-black">
              QUEZON CITY YOUTH DEVELOPMENT OFFICE (QCYDO)
            </p>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-sans font-medium">
              Unified Scholarship and Financial Assistance Screening Board
            </p>
          </div>

          {/* Certificate Title */}
          <div className="text-center space-y-1.5">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-sans font-black uppercase tracking-widest text-amber-900 dark:text-amber-400">
              CERTIFICATE OF SCHOLARSHIP AWARD & QUALIFICATION
            </h2>
            <p className="text-xs sm:text-sm font-mono font-bold text-slate-500 dark:text-slate-400">
              Official Award Control No: <span className="underline text-slate-800 dark:text-slate-200">{certNo}</span>
            </p>
          </div>

          {/* Conferred Citation */}
          <div className="text-center space-y-3 pt-2">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-sans uppercase font-bold tracking-widest">
              THIS IS TO OFFICIALLY CERTIFY THAT
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-blue-900 dark:text-blue-400 uppercase tracking-tight py-1">
              {applicantName}
            </h1>
            <p className="text-xs sm:text-sm font-mono font-bold text-slate-600 dark:text-slate-400">
              Student ID Number: <span className="text-slate-900 dark:text-slate-100 font-black">{studentId}</span>
            </p>
          </div>

          {/* Body Narrative */}
          <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-slate-800 dark:text-slate-200 text-justify font-serif max-w-3xl mx-auto px-2">
            having satisfactorily fulfilled all documentary prerequisites, biometric verification, academic evaluation, and background clearance pursuant to the Quezon City Scholarship Code, is hereby officially conferred the title of <strong className="font-sans font-black text-slate-900 dark:text-white">OFFICIAL GOVERNMENT SCHOLAR</strong> of the City Government of Quezon City for the <strong>Academic Year 2026–2027</strong> in Active Good Standing.
          </p>

          {/* Program Details - Clean Open Flow (No boxed card/container) */}
          <div className="py-6 border-y border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs sm:text-sm font-sans">
            <div>
              <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Scholarship Track</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm block leading-snug">{programTitle}</span>
            </div>
            <div>
              <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Educational Grant & Aid</span>
              <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm block leading-snug">
                {getGrantBreakdown(programTitle, awardAmount)}
              </span>
            </div>
            <div>
              <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">School Institution</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm block leading-snug">{school}</span>
            </div>
            <div>
              <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Degree / Course</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm block leading-snug">{course}</span>
            </div>
            <div>
              <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Academic Standing</span>
              <span className="font-bold text-blue-700 dark:text-blue-400 text-xs sm:text-sm block leading-snug">
                {Number(gpa).toFixed(2)} GWA (Honors Tier)
              </span>
            </div>
            <div>
              <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Date Conferred</span>
              <span className="font-medium text-slate-700 dark:text-slate-300 text-xs sm:text-sm block leading-snug">{dateStr}</span>
            </div>
          </div>

          {/* Official Signatures Section */}
          <div className="pt-8 sm:pt-12 grid grid-cols-2 gap-8 items-end text-center font-sans text-xs sm:text-sm">
            <div className="space-y-2">
              <div className="h-12 border-b border-slate-400 dark:border-slate-600 w-4/5 mx-auto flex items-end justify-center pb-1">
                <span className="text-sm sm:text-base font-cursive italic text-slate-800 dark:text-slate-200 font-bold">
                  Hon. Roberto V. Cruz
                </span>
              </div>
              <p className="font-black text-slate-900 dark:text-slate-100 text-xs sm:text-sm uppercase tracking-wide">
                HON. ROBERTO V. CRUZ
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold">
                Executive Director, QCYDO
              </p>
            </div>

            <div className="space-y-2">
              <div className="h-12 border-b border-slate-400 dark:border-slate-600 w-4/5 mx-auto flex items-end justify-center pb-1">
                <span className="text-sm sm:text-base font-cursive italic text-blue-900 dark:text-blue-300 font-black">
                  Hon. Ma. Josefina "Joy" Belmonte
                </span>
              </div>
              <p className="font-black text-slate-900 dark:text-slate-100 text-xs sm:text-sm uppercase tracking-wide">
                HON. MA. JOSEFINA "JOY" BELMONTE
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold">
                City Mayor, Quezon City
              </p>
            </div>
          </div>

          {/* Security Strip & Validation Barcode */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] sm:text-xs font-sans text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
            <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
              <BadgeCheck className="h-4 w-4" />
              Mayor's Office Dry Seal Affixed & Cryptographically Verified
            </span>
            <span className="font-mono text-slate-600 dark:text-slate-400 font-bold">
              SHA256:QCSP-AWARD-{studentId} • {certNo}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
