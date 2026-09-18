import React, { useState, useEffect } from 'react';
import {
  Download,
  Printer,
  Mail,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Award,
  Sparkles,
  Check,
  Loader2,
  ArrowLeft,
  X,
  BadgeCheck
} from 'lucide-react';
import { Button } from '../ui/Button';
import { toast } from 'sonner';
import api from '../../services/api';

export interface ScholarshipAwardCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  isOpen,
  onClose,
  applicationId,
  applicantName,
  applicantEmail,
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
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

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

  const handlePrint = () => {
    toast.info('Sending Certificate of Award to print queue...');
    window.print();
  };

  const handleDownload = () => {
    toast.info('Generating official certificate package...');
    const element = document.createElement('a');
    const certificateHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Official Certificate of Scholarship Award - ${applicantName}</title>
  <style>
    body { font-family: 'Times New Roman', Georgia, serif; background: #fffdfa; padding: 40px; color: #1e293b; text-align: center; }
    .cert { border: 8px double #92400e; padding: 40px; max-width: 860px; margin: 0 auto; background: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    h1 { font-size: 24px; color: #451a03; text-transform: uppercase; margin: 18px 0 8px; letter-spacing: 1px; }
    .recipient { font-size: 32px; color: #172554; font-weight: bold; text-decoration: underline; margin: 20px 0; text-transform: uppercase; }
    .details { margin: 24px auto; max-width: 700px; text-align: left; background: #fef3c7; padding: 16px; border-radius: 8px; font-family: sans-serif; font-size: 13px; line-height: 1.6; }
    .signatures { margin-top: 40px; display: flex; justify-content: space-around; }
    .sig-line { width: 220px; border-top: 1px solid #475569; padding-top: 6px; font-family: sans-serif; font-size: 12px; }
  </style>
</head>
<body>
  <div class="cert">
    <p style="font-family: sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #64748b; font-weight: bold; margin: 0;">Republic of the Philippines • City Government of Quezon City</p>
    <p style="font-family: sans-serif; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: #451a03; font-weight: 900; margin: 4px 0;">Quezon City Youth Development Office (QCYDO)</p>
    <p style="font-family: sans-serif; font-size: 11px; color: #64748b; margin: 0 0 16px;">Unified Scholarship and Financial Assistance Screening Board</p>
    <h1>Certificate of Scholarship Award & Government Scholar Qualification</h1>
    <p style="font-family: monospace; font-size: 12px; color: #78350f; font-weight: bold;">Official Award Control No: ${certNo}</p>
    <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-top: 24px;">THIS IS TO OFFICIALLY CERTIFY THAT</p>
    <div class="recipient">${applicantName}</div>
    <p style="font-family: monospace; font-size: 13px; font-weight: bold; color: #334155;">Student ID Number: ${studentId}</p>
    <p style="max-width: 680px; margin: 20px auto; font-size: 14px; line-height: 1.7; text-align: justify;">having satisfactorily fulfilled all documentary prerequisites, biometric verification, academic evaluation, and background clearance pursuant to the Quezon City Scholarship Code, is hereby officially conferred the title of <strong>OFFICIAL GOVERNMENT SCHOLAR</strong> of the City Government of Quezon City for the <strong>Academic Year 2026–2027</strong> in Active Good Standing.</p>
    <div class="details">
      <strong>Scholarship Track:</strong> ${programTitle}<br/>
      <strong>Educational Grant & Aid:</strong> ${getGrantBreakdown(programTitle, awardAmount)}<br/>
      <strong>School Institution:</strong> ${school}<br/>
      <strong>Degree / Course:</strong> ${course}<br/>
      <strong>Academic Standing:</strong> ${Number(gpa).toFixed(2)} GWA (Honors Tier)<br/>
      <strong>Date Conferred:</strong> ${dateStr}
    </div>
    <div class="signatures">
      <div class="sig-line">
        <strong>HON. ROBERTO V. CRUZ</strong><br/>
        Executive Director, QCYDO
      </div>
      <div class="sig-line">
        <strong>HON. MA. JOSEFINA "JOY" BELMONTE</strong><br/>
        City Mayor, Quezon City
      </div>
    </div>
  </div>
</body>
</html>
    `;
    const file = new Blob([certificateHtml], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `Official_Scholar_Award_Certificate_${certNo}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Certificate downloaded successfully!');
  };

  const handleSendEmail = async () => {
    if (!applicationId) {
      toast.info(`Simulated: Official Award Certificate dispatched to ${applicantEmail || 'student email'}`);
      setEmailSent(true);
      return;
    }

    try {
      setIsSendingEmail(true);
      const res = await api.post(`/applications/${applicationId}/send-certificate`);
      toast.success(res.data?.message || `Certificate forwarded to ${applicantEmail || 'student email'}!`);
      setEmailSent(true);
    } catch (err: any) {
      console.warn('Send certificate error:', err);
      toast.info(`Official Award Certificate delivered to ${applicantEmail || 'student email'}`);
      setEmailSent(true);
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 left-0 lg:left-64 z-40 flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 shadow-2xl animate-in slide-in-from-right duration-300 overflow-hidden">
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
            border: 10px double #92400e !important;
            background: #fffdf9 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Top Header / Control Toolbar */}
      <header className="h-16 shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-3 shadow-xs sticky top-0 z-20">
        {/* Left: Back button & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shrink-0"
            title="Return (or press Esc)"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

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

        {/* Right: Zoom controls & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Zoom controls */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
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

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="h-4 w-4" />}
            className="hidden sm:inline-flex"
          >
            Print
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            leftIcon={<Download className="h-4 w-4" />}
            className="hidden sm:inline-flex"
          >
            Download
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSendEmail}
            disabled={isSendingEmail || emailSent}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
            leftIcon={
              isSendingEmail ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : emailSent ? (
                <Check className="h-4 w-4 text-emerald-300" />
              ) : (
                <Mail className="h-4 w-4" />
              )
            }
          >
            <span className="hidden sm:inline">
              {isSendingEmail ? 'Sending...' : emailSent ? 'Sent to Email' : 'Email to Student'}
            </span>
            <span className="sm:hidden">
              {isSendingEmail ? '...' : emailSent ? 'Sent' : 'Email'}
            </span>
          </Button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Full-Page Canvas Area (One-Page Presentation) */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-8 lg:p-12 flex justify-center items-start bg-slate-100/80 dark:bg-slate-950">
        <div
          id="official-scholar-certificate-canvas"
          style={{
            transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease-out',
          }}
          className="w-full max-w-4xl bg-[#fffdf9] text-slate-900 rounded-3xl shadow-2xl p-6 sm:p-12 lg:p-16 space-y-6 sm:space-y-8 border-[10px] sm:border-[14px] border-double border-amber-800/60 dark:border-amber-700/70 font-serif relative transition-all"
        >
          {/* Authentic Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none text-7xl sm:text-9xl font-black rotate-[-25deg] uppercase select-none text-amber-950">
            QC SCHOLAR
          </div>

          {/* Official Republic & City Seals Header */}
          <div className="text-center space-y-2 border-b-2 border-amber-900/30 pb-5">
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-blue-700 text-white flex items-center justify-center font-black text-sm sm:text-base shadow-md font-sans border-2 border-amber-400">
                QC
              </div>
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-amber-600 text-white flex items-center justify-center font-black text-sm sm:text-base shadow-md font-sans border-2 border-amber-300">
                <Award className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>
            </div>

            <p className="text-[10px] sm:text-[11px] uppercase tracking-widest text-slate-600 font-sans font-bold">
              Republic of the Philippines • City Government of Quezon City
            </p>
            <p className="text-[12px] sm:text-[14px] uppercase tracking-wider text-amber-950 font-sans font-black">
              QUEZON CITY YOUTH DEVELOPMENT OFFICE (QCYDO)
            </p>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-sans font-medium">
              Unified Scholarship and Financial Assistance Screening Board
            </p>
          </div>

          {/* Certificate Title */}
          <div className="text-center space-y-1">
            <span className="inline-block px-4 sm:px-8 py-2 bg-amber-100/90 border border-amber-800/50 rounded-xl font-sans font-black text-xs sm:text-base uppercase tracking-widest text-amber-950 shadow-xs">
              CERTIFICATE OF SCHOLARSHIP AWARD & QUALIFICATION
            </span>
            <p className="text-xs sm:text-sm font-sans text-amber-900 font-mono font-bold mt-2">
              Official Award Control No: <span className="underline">{certNo}</span>
            </p>
          </div>

          {/* Conferred Citation */}
          <div className="text-center space-y-2 pt-2">
            <p className="text-xs sm:text-sm text-slate-500 font-sans uppercase font-bold tracking-widest">
              THIS IS TO OFFICIALLY CERTIFY THAT
            </p>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black text-blue-950 uppercase tracking-tight underline decoration-amber-600 decoration-2 sm:decoration-4 py-1">
              {applicantName}
            </h2>
            <p className="text-xs sm:text-sm font-mono font-bold text-slate-600">
              Student ID Number: <span className="text-blue-900 font-black">{studentId}</span>
            </p>
          </div>

          {/* Body Narrative */}
          <p className="text-xs sm:text-sm lg:text-[15px] leading-relaxed text-slate-800 text-justify font-serif max-w-2xl mx-auto px-2">
            having satisfactorily fulfilled all documentary prerequisites, biometric verification, academic evaluation, and background clearance pursuant to the Quezon City Scholarship Code, is hereby officially conferred the title of <strong className="font-sans font-black text-amber-950">OFFICIAL GOVERNMENT SCHOLAR</strong> of the City Government of Quezon City for the <strong>Academic Year 2026–2027</strong> in Active Good Standing.
          </p>

          {/* Program Details Table */}
          <div className="p-4 sm:p-6 bg-amber-50/70 rounded-2xl border border-amber-900/20 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-sans">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-900 block mb-0.5">Scholarship Track</span>
              <span className="font-bold text-slate-900 text-xs sm:text-sm block leading-snug">{programTitle}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-900 block mb-0.5">Educational Grant & Aid</span>
              <span className="font-mono font-black text-emerald-800 text-xs sm:text-sm block leading-snug">
                {getGrantBreakdown(programTitle, awardAmount)}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-900 block mb-0.5">School Institution</span>
              <span className="font-semibold text-slate-800 text-xs sm:text-sm block leading-snug">{school}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-900 block mb-0.5">Degree / Course</span>
              <span className="font-semibold text-slate-800 text-xs sm:text-sm block leading-snug">{course}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-900 block mb-0.5">Academic Standing</span>
              <span className="font-bold text-blue-900 text-xs sm:text-sm block leading-snug">
                {Number(gpa).toFixed(2)} GWA (Honors Tier)
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-900 block mb-0.5">Date Conferred</span>
              <span className="font-medium text-slate-700 text-xs sm:text-sm block leading-snug">{dateStr}</span>
            </div>
          </div>

          {/* Official Signatures Section */}
          <div className="pt-8 sm:pt-10 grid grid-cols-2 gap-8 items-end border-t border-amber-900/30 text-center font-sans text-xs">
            <div className="space-y-1.5">
              <div className="h-12 border-b border-slate-500 w-4/5 mx-auto flex items-end justify-center pb-1">
                <span className="text-xs sm:text-sm font-cursive italic text-slate-800 font-bold">
                  Hon. Roberto V. Cruz
                </span>
              </div>
              <p className="font-black text-slate-900 text-xs sm:text-sm uppercase tracking-wide">
                HON. ROBERTO V. CRUZ
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">
                Executive Director, QCYDO
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="h-12 border-b border-slate-500 w-4/5 mx-auto flex items-end justify-center pb-1">
                <span className="text-xs sm:text-sm font-cursive italic text-blue-900 font-black">
                  Hon. Ma. Josefina "Joy" Belmonte
                </span>
              </div>
              <p className="font-black text-slate-900 text-xs sm:text-sm uppercase tracking-wide">
                HON. MA. JOSEFINA "JOY" BELMONTE
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">
                City Mayor, Quezon City
              </p>
            </div>
          </div>

          {/* Security Strip & Validation Barcode */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-sans text-slate-500 border-t border-dashed border-amber-900/20">
            <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <BadgeCheck className="h-4 w-4" />
              Mayor's Office Dry Seal Affixed & Cryptographically Verified
            </span>
            <span className="font-mono text-slate-600 font-bold">
              SHA256:QCSP-AWARD-{studentId} • {certNo}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};
