import React from 'react';
import { FileText, ExternalLink, Download, ShieldCheck, CheckCircle2, Building2, Clock, Scale } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface CitizensCharterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CitizensCharterModal: React.FC<CitizensCharterModalProps> = ({ isOpen, onClose }) => {
  const handleOpenPdf = () => {
    window.open('/citizens_charter.pdf', '_blank', 'noopener,noreferrer');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quezon City Citizen's Charter"
      description="Official QCYDO Service Pledges, Performance Standards, and Educational Aid Guidelines."
      footer={
        <div className="flex gap-2.5 w-full justify-between items-center">
          <Button variant="outline" size="sm" onClick={onClose} className="font-bold">
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenPdf}
            leftIcon={<ExternalLink className="h-4 w-4" />}
            className="font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
          >
            Open / Download Official PDF (4.8 MB) →
          </Button>
        </div>
      }
    >
      <div className="space-y-5 text-xs">
        {/* PDF Callout Banner */}
        <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl shadow-md flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-amber-400" />
              <span className="font-heading font-extrabold text-sm text-white">Official QCLG Citizen's Charter</span>
            </div>
            <p className="text-[11px] text-blue-100/90 leading-relaxed font-medium">
              Republic Act No. 11032 — Ease of Doing Business & Efficient Government Service Delivery Act.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenPdf}
            leftIcon={<Download className="h-4 w-4" />}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold border-none shrink-0"
          >
            Open PDF
          </Button>
        </div>

        {/* Core Guarantees Grid */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
            <ShieldCheck className="h-4 w-4 text-blue-600" /> QCYDO Service Guarantees & Turnaround Times
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-blue-600" /> Application Evaluation
              </span>
              <span className="text-slate-600 text-[11px] block">Standard Turnaround: 3 to 5 Working Days upon complete submission.</span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Electronic Disbursement
              </span>
              <span className="text-slate-600 text-[11px] block">Direct e-payout processing via GCash / Maya within 24 hours of approval.</span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-purple-600" /> Equal Access Guarantee
              </span>
              <span className="text-slate-600 text-[11px] block">Zero processing fees, automated document vault validation, AI matching.</span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-amber-600" /> Re-evaluation & Appeals
              </span>
              <span className="text-slate-600 text-[11px] block">Formal appeal review within 48 hours for document clarification.</span>
            </div>
          </div>
        </div>

        {/* PDF Link Notice */}
        <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between text-[11px] text-blue-950 font-semibold">
          <span>📄 Complete Official Document: QCLG-Citizens-Charter.pdf</span>
          <button
            onClick={handleOpenPdf}
            className="text-blue-700 hover:underline font-extrabold flex items-center gap-1 cursor-pointer"
          >
            View Full Charter <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
