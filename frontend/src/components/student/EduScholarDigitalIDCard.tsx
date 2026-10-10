import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck,
  Building2,
  GraduationCap,
  QrCode,
  RotateCw,
  Printer,
  Download,
  Copy,
  User,
  BookOpen
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
      <div className="relative group perspective-1000 w-full max-w-[360px] mx-auto min-h-[540px]">
        <div
          className={`relative w-full h-full transition-all duration-700 transform-style-preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT SIDE OF OFFICIAL SCHOLAR ID TEMPLATE */}
          <div className="w-full bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative backface-hidden min-h-[540px] flex flex-col justify-between select-none">
            {/* Template Background Layer */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
              style={{ backgroundImage: 'url("/scholar_id_front.png")' }}
            />

            {/* Dynamic Content Overlay matching exact template dimensions */}
            <div className="relative z-10 flex flex-col h-full justify-between p-5 pt-6 text-slate-900">
              {/* Header Top Clearance (Aligned with GovServe / EduScholar Logos) */}
              <div className="h-10" />

              {/* ID Photo Container (Aligned with template frame) */}
              <div className="flex justify-center mt-3">
                <div 
                  className="w-[145px] h-[178px] rounded-2xl overflow-hidden border-[3px] border-[#a07b3b] shadow-md bg-slate-200 cursor-pointer hover:scale-102 transition-transform"
                  onClick={() => setShowQRModal(true)}
                  title="Click to view QR Verification"
                >
                  <img
                    src={
                      data.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                    }
                    alt={data.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Student Name & Scholar Label */}
              <div className="text-center mt-3 mb-1">
                <h2 className="font-heading font-black text-lg text-[#8f6d2b] tracking-wide uppercase px-2 truncate">
                  {data.fullName || 'STUDENT NAME'}
                </h2>
                <span className="font-heading font-extrabold text-xs text-[#8f6d2b] tracking-wider uppercase block">
                  SCHOLAR
                </span>
              </div>

              {/* Student Details with Icons & Underline Styling */}
              <div className="space-y-3.5 px-3 mb-6 text-xs">
                {/* 1. Student Number */}
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#1b3a6b] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1 border-b border-slate-900/60 pb-0.5">
                    <span className="text-[10px] font-black uppercase text-slate-900 tracking-wider block">
                      STUDENT NUMBER:
                    </span>
                    <span className="font-bold text-slate-950 font-mono text-xs">
                      {data.studentId || '2026-00001'}
                    </span>
                  </div>
                </div>

                {/* 2. School */}
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#b82229] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1 border-b border-slate-900/60 pb-0.5">
                    <span className="text-[10px] font-black uppercase text-slate-900 tracking-wider block">
                      SCHOOL:
                    </span>
                    <span className="font-bold text-slate-950 text-xs truncate block">
                      {data.school || 'Quezon City University (QCU)'}
                    </span>
                  </div>
                </div>

                {/* 3. Scholarship Program */}
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#d49919] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <div className="flex-1 border-b border-slate-900/60 pb-0.5">
                    <span className="text-[10px] font-black uppercase text-slate-900 tracking-wider block">
                      SCHOLARSHIP PROGRAM:
                    </span>
                    <span className="font-bold text-slate-950 text-xs truncate block">
                      {data.programName || 'Quezon City Financial Aid'}
                    </span>
                  </div>
                </div>

                {/* 4. School Year / S.Y. */}
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#1b5e8a] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div className="flex-1 border-b border-slate-900/60 pb-0.5">
                    <span className="text-[10px] font-black uppercase text-slate-900 tracking-wider block">
                      S.Y.:
                    </span>
                    <span className="font-bold text-slate-950 text-xs">
                      {data.currentTerm || '2026–2027'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Spacing (Overlaid on template ribbon) */}
              <div className="h-6" />
            </div>
          </div>

          {/* BACK SIDE OF OFFICIAL SCHOLAR ID TEMPLATE (Visible when flipped) */}
          <div className="w-full bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative backface-hidden rotate-y-180 absolute inset-0 min-h-[540px] flex flex-col justify-between select-none">
            {/* Template Background Layer for Back Side */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
              style={{ backgroundImage: 'url("/scholar_id_back.png")' }}
            />

            {/* Dynamic Content Overlay for Back Side */}
            <div className="relative z-10 flex flex-col h-full justify-between p-5 pt-6 text-slate-900">
              {/* Header Clearance */}
              <div className="text-center mt-6">
                <span className="font-heading font-black text-xs text-slate-900 tracking-wide uppercase">
                  SCAN FOR VERIFICATION & CONTACT INFO
                </span>
              </div>

              {/* Dynamic QR Code aligned with template frame */}
              <div className="flex justify-center my-2">
                <div 
                  className="bg-white p-2.5 rounded-xl border-2 border-slate-900 shadow-md cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setShowQRModal(true)}
                  title="Click to zoom verification QR code"
                >
                  <QRCodeSVG value={qrPayload} size={135} level="H" />
                </div>
              </div>

              {/* Emergency Contact & Address Header */}
              <div className="text-center">
                <span className="font-heading font-black text-xs text-slate-950 tracking-wider uppercase block">
                  EMERGENCY CONTACT & ADDRESS
                </span>
              </div>

              {/* Emergency Contact Details */}
              <div className="space-y-2.5 px-3 text-xs mb-8">
                <div className="border-b border-slate-900/60 pb-0.5 flex items-baseline justify-between gap-2">
                  <span className="text-[10px] font-black uppercase text-slate-900 shrink-0">FULL NAME:</span>
                  <span className="font-bold text-slate-950 text-xs truncate">{data.fullName}</span>
                </div>

                <div className="border-b border-slate-900/60 pb-0.5 flex items-baseline justify-between gap-2">
                  <span className="text-[10px] font-black uppercase text-slate-900 shrink-0">RELATIONSHIP:</span>
                  <span className="font-bold text-slate-950 text-xs">Guardian / Parent</span>
                </div>

                <div className="border-b border-slate-900/60 pb-0.5 flex items-baseline justify-between gap-2">
                  <span className="text-[10px] font-black uppercase text-slate-900 shrink-0">CONTACT NUMBER(S):</span>
                  <span className="font-bold text-slate-950 font-mono text-xs">+63 917 890 1234</span>
                </div>

                <div className="border-b border-slate-900/60 pb-0.5 flex items-baseline justify-between gap-2">
                  <span className="text-[10px] font-black uppercase text-slate-900 shrink-0">COMPLETE ADDRESS:</span>
                  <span className="font-bold text-slate-950 text-[11px] truncate">{data.barangay ? `${data.barangay}, Quezon City` : 'Quezon City, Metro Manila'}</span>
                </div>
              </div>

              {/* Bottom Clearance */}
              <div className="h-10" />
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
            onClick={handleCopyId}
            leftIcon={<Copy className="h-4 w-4 text-slate-600 dark:text-slate-400" />}
            className="font-bold text-xs"
            title="Copy Student ID"
          >
            Copy ID
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQRModal(true)}
            leftIcon={<QrCode className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
            className="font-bold text-xs"
          >
            Show QR
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
