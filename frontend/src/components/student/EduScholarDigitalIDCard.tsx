import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck,
  CheckCircle2,
  Building2,
  GraduationCap,
  Sparkles,
  QrCode,
  RotateCw,
  Printer,
  Download,
  Copy,
  Lock
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { toast } from 'sonner';

export interface DigitalIDData {
  studentId: string;
  fullName: string;
  email?: string;
  school: string;
  department?: string;
  programName: string;
  yearLevel?: string;
  gwa?: number | string;
  status: string;
  validUntil?: string;
  avatar?: string;
  barangay?: string;
  currentTerm?: string;
  scholarshipAge?: string;
  grantAmount?: number;
}

interface EduScholarDigitalIDCardProps {
  data: DigitalIDData;
  className?: string;
}

export const EduScholarDigitalIDCard: React.FC<EduScholarDigitalIDCardProps> = ({ data, className = '' }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const verificationUrl = `https://eduscholar.qc.gov.ph/verify?id=${encodeURIComponent(data.studentId)}&name=${encodeURIComponent(data.fullName)}`;
  const qrPayload = JSON.stringify({
    system: 'EduScholar QCSP',
    studentId: data.studentId,
    fullName: data.fullName,
    school: data.school,
    program: data.programName,
    status: data.status || 'Active & Good Standing',
    term: data.currentTerm || 'AY 2026-2027',
    verifyUrl: verificationUrl
  });

  const handleCopyId = () => {
    navigator.clipboard.writeText(data.studentId);
    toast.success(`Student ID (${data.studentId}) copied to clipboard!`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPass = () => {
    toast.success(`Official Digital Scholar Pass (${data.studentId}.pdf) downloading...`);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* CARD CONTAINER WITH FLIP TRANSITION */}
      <div className="relative group perspective-1000 min-h-[380px] w-full">
        <div
          className={`relative w-full h-full transition-all duration-700 transform-style-preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT SIDE OF EDUSCHOLAR ID CARD */}
          <div className="w-full bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 shadow-2xl border border-blue-500/30 flex flex-col justify-between overflow-hidden relative backface-hidden min-h-[380px]">
            {/* Holographic Watermark Pattern Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_50%)] pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header: QC & EduScholar Branding */}
            <div className="flex items-center justify-between z-10 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0 border border-amber-400/40">
                  <img
                    src="/logo-system.webp"
                    alt="QC Logo"
                    className="h-8 w-8 object-contain rounded-xl"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-heading font-black text-xs tracking-widest text-amber-300 uppercase">
                      EDUSCHOLAR QCSP
                    </span>
                    <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" />
                  </div>
                  <h4 className="text-[10px] text-blue-200 tracking-wider font-semibold uppercase">
                    Quezon City Youth Development Office
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant="success"
                  size="sm"
                  className="bg-emerald-500/20 text-emerald-300 border-emerald-400/40 px-2.5 py-1 text-[11px] font-bold shadow-sm"
                >
                  <ShieldCheck className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                  VERIFIED SCHOLAR
                </Badge>
              </div>
            </div>

            {/* Middle Section: Photo & Primary Info */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center my-4 z-10">
              <div className="sm:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left space-y-2">
                <div className="relative group/avatar cursor-pointer" onClick={() => setShowQRModal(true)}>
                  <img
                    src={
                      data.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                    }
                    alt={data.fullName}
                    className="h-24 w-24 rounded-2xl object-cover border-2 border-amber-400/80 shadow-lg group-hover/avatar:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1 border border-white text-white shadow-md">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="text-[11px] font-mono text-blue-300 hover:text-white flex items-center gap-1 transition-colors bg-white/5 px-2 py-0.5 rounded-md border border-white/10"
                >
                  <span>{data.studentId}</span>
                  <Copy className="h-3 w-3 text-slate-400" />
                </button>
              </div>

              <div className="sm:col-span-8 space-y-2 text-center sm:text-left">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                    Scholar Beneficiary Name
                  </span>
                  <h2 className="font-heading font-extrabold text-xl text-white tracking-wide leading-snug">
                    {data.fullName}
                  </h2>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="text-blue-100 font-medium flex items-center justify-center sm:justify-start gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{data.school}</span>
                  </p>
                  <p className="text-blue-200/90 text-[11px] flex items-center justify-center sm:justify-start gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span>{data.programName}</span>
                  </p>
                  {data.department && (
                    <p className="text-slate-300 text-[11px]">
                      {data.department} {data.yearLevel ? `• ${data.yearLevel}` : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Footer: Dynamic QR Code & Barcode Section */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between z-10">
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                  Registry Status & Validity
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-extrabold text-xs flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {data.status || 'Active Good Standing'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({data.validUntil || 'AY 2026-2027'})
                  </span>
                </div>
              </div>

              {/* Clickable QR Code */}
              <button
                type="button"
                onClick={() => setShowQRModal(true)}
                className="bg-white p-2 rounded-xl shadow-md border-2 border-amber-400/60 hover:scale-105 transition-transform group/qr flex flex-col items-center gap-1"
                title="Click to view high-res verification QR code"
              >
                <QRCodeSVG value={qrPayload} size={48} level="M" />
                <span className="text-[8px] font-mono font-bold text-slate-900 group-hover/qr:text-blue-600">
                  TAP QR
                </span>
              </button>
            </div>
          </div>

          {/* BACK SIDE OF EDUSCHOLAR ID CARD (Visible when flipped) */}
          <div className="w-full bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-slate-800 flex flex-col justify-between overflow-hidden relative backface-hidden rotate-y-180 absolute inset-0 min-h-[380px]">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-400" />
                  <h3 className="font-heading text-xs font-black tracking-wider uppercase text-amber-300">
                    EDUSCHOLAR OFFICIAL PASS BACK
                  </h3>
                </div>
                <Badge variant="outline" size="sm" className="text-slate-400 border-slate-700">
                  OFFICIAL ISSUANCE
                </Badge>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 bg-slate-850 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Terms & Conditions
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    This digital ID card is issued under the authority of the Quezon City Youth Development Office (QCYDO). It certifies active scholar standing and accredited grant enrolment.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-slate-850 rounded-lg border border-slate-800">
                    <span className="text-[9px] uppercase text-slate-400 block">Barangay Residency</span>
                    <span className="font-semibold text-white">{data.barangay || 'Quezon City Resident'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-850 rounded-lg border border-slate-800">
                    <span className="text-[9px] uppercase text-slate-400 block">Current Academic Term</span>
                    <span className="font-semibold text-white">{data.currentTerm || '1st Sem AY 2026-2027'}</span>
                  </div>
                </div>

                <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-900/40 space-y-1 text-center">
                  <span className="text-[10px] uppercase font-bold text-blue-300 block">
                    Verification Hotline & Portal
                  </span>
                  <p className="text-[11px] font-mono text-blue-200">
                    eduscholar.qc.gov.ph • hotline: (02) 8988-4242 ext 8181
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[10px]">Issued by QC Youth Development Office</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFlipped(false)}
                leftIcon={<RotateCw className="h-3.5 w-3.5" />}
                className="text-amber-400 hover:text-amber-300 font-bold"
              >
                Flip Front
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CARD ACTION BUTTONS */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsFlipped(!isFlipped)}
          leftIcon={<RotateCw className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
          className="font-bold text-xs"
        >
          {isFlipped ? 'Show Front Side' : 'Flip to Back Side'}
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQRModal(true)}
            leftIcon={<QrCode className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
            className="font-bold text-xs"
          >
            Show Verification QR
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleDownloadPass}
            leftIcon={<Download className="h-4 w-4" />}
            className="font-bold text-xs"
          >
            Export Pass (PDF)
          </Button>
        </div>
      </div>

      {/* INTERACTIVE QR CODE & VERIFICATION MODAL */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title="Official EduScholar QR Verification Pass"
        maxWidth="md"
      >
        <div className="space-y-6 text-center py-2">
          {/* Header Badge */}
          <div className="flex justify-center">
            <Badge variant="success" size="md" className="px-3 py-1 font-bold">
              <ShieldCheck className="h-4 w-4 mr-1.5" /> Official QCYDO Verified Scholar
            </Badge>
          </div>

          {/* High Res QR Display */}
          <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-50 to-blue-50/50 dark:from-slate-800 dark:to-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-inner space-y-4">
            <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-amber-400/80">
              <QRCodeSVG value={qrPayload} size={180} level="H" includeMargin={true} />
            </div>
            <div className="space-y-1">
              <p className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                ID: {data.studentId}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Scan with any QR scanner to verify authentic QCYDO scholarship standing.
              </p>
            </div>
          </div>

          {/* Student Verification Details */}
          <div className="text-left bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="text-slate-500 dark:text-slate-400">Scholar Name:</span>
              <span className="font-bold text-slate-900 dark:text-white">{data.fullName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="text-slate-500 dark:text-slate-400">Institution:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{data.school}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="text-slate-500 dark:text-slate-400">Program Track:</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">{data.programName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Security Hash:</span>
              <span className="font-mono text-[10px] text-slate-600 dark:text-slate-300">
                QCSP-HASH-2026-X89F2A
              </span>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={handlePrint} leftIcon={<Printer className="h-4 w-4" />}>
              Print Verification Badge
            </Button>
            <Button variant="primary" size="sm" onClick={handleDownloadPass} leftIcon={<Download className="h-4 w-4" />}>
              Download Digital ID Pass
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EduScholarDigitalIDCard;
