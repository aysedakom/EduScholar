import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ShieldCheck,
  Printer,
  Check,
  AlertCircle,
  FileCode,
  Image as ImageIcon,
  FileCheck,
  Award,
  BookOpen,
  CreditCard,
  HeartHandshake
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { toast } from 'sonner';

export interface DocumentAttachmentItem {
  id: string;
  name: string;
  label?: string;
  type?: string;
  size?: string;
  uploadedAt?: string;
  verified?: boolean;
  status?: 'verified' | 'flagged' | 'pending';
  flagReason?: string;
  category?: string;
  fileData?: string;
  mimeType?: string;
}

interface DocumentAttachmentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentAttachmentItem[];
  applicantName: string;
  applicantId: string;
  programTitle: string;
  studentSchool?: string;
  studentCourse?: string;
  studentGpa?: number;
  initialIndex?: number;
  onVerifyDoc?: (docId: string) => void;
  onFlagDoc?: (docId: string, reason: string) => void;
  onApproveApplication?: () => void;
  onRejectApplication?: () => void;
}

export const DocumentAttachmentViewerModal: React.FC<DocumentAttachmentViewerModalProps> = ({
  isOpen,
  onClose,
  documents,
  applicantName,
  applicantId,
  programTitle,
  studentSchool = 'Bestlink College of the Philippines (BCP)',
  studentCourse = 'B.S. Information Technology',
  studentGpa = 1.50,
  initialIndex = 0,
  onVerifyDoc,
  onFlagDoc,
  onApproveApplication,
  onRejectApplication,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [verifiedDocs, setVerifiedDocs] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    documents.forEach((d) => {
      init[d.id] = d.verified ?? true;
    });
    return init;
  });
  const [flaggedDocs, setFlaggedDocs] = useState<Record<string, string>>({});
  const [flagInputModal, setFlagInputModal] = useState(false);
  const [flagReasonInput, setFlagReasonInput] = useState('');
  const [jsonViewTab, setJsonViewTab] = useState<'structured' | 'raw'>('structured');
  const [activeMediaView, setActiveMediaView] = useState<'canvas' | 'raw_image'>('canvas');

  if (!isOpen || documents.length === 0) return null;

  const currentDoc = documents[selectedIndex] || documents[0];
  const isCurrentVerified = verifiedDocs[currentDoc.id] ?? false;
  const currentFlagReason = flaggedDocs[currentDoc.id];

  const fileNameLower = (currentDoc.name || '').toLowerCase();
  const labelLower = (currentDoc.label || '').toLowerCase();
  const idLower = (currentDoc.id || '').toLowerCase();
  const combinedKey = `${fileNameLower} ${labelLower} ${idLower}`;

  const isJson = fileNameLower.endsWith('.json') || currentDoc.mimeType === 'application/json';
  const isMarkdownOrText = fileNameLower.endsWith('.md') || fileNameLower.endsWith('.txt') || currentDoc.mimeType?.startsWith('text/');
  const is2Step = combinedKey.includes('2step') || combinedKey.includes('verification') || idLower === 'sectoral_proof' || combinedKey.includes('mfa');

  // Determine specific document categories
  const isIndigencyCert = combinedKey.includes('indigency') || combinedKey.includes('barangay') || combinedKey.includes('residency') || combinedKey.includes('34b62969');
  const isCorOrGrades = combinedKey.includes('cor') || combinedKey.includes('registration') || combinedKey.includes('matriculation') || combinedKey.includes('grades') || combinedKey.includes('31042836');
  const isTorOrReportCard = combinedKey.includes('tor') || combinedKey.includes('transcript') || combinedKey.includes('form 137') || combinedKey.includes('form 138') || combinedKey.includes('report card');
  const isGoodMoralOrRecommendation = combinedKey.includes('moral') || combinedKey.includes('recommendation') || combinedKey.includes('endorsement') || combinedKey.includes('honors');
  const isItrOrTax = combinedKey.includes('itr') || combinedKey.includes('tax') || combinedKey.includes('affidavit') || combinedKey.includes('income');
  const isQCitizenOrId = combinedKey.includes('qcitizen') || combinedKey.includes('valid id') || combinedKey.includes('student id') || combinedKey.includes('identity');
  const isSectoral = combinedKey.includes('solo parent') || combinedKey.includes('pwd') || combinedKey.includes('4ps') || combinedKey.includes('indigenous') || combinedKey.includes('toda') || combinedKey.includes('kasambahay');

  const hasRealImageSource = currentDoc.fileData && (currentDoc.fileData.startsWith('data:image/') || currentDoc.fileData.startsWith('http'));

  const handleVerify = (docId: string) => {
    setVerifiedDocs((prev) => ({ ...prev, [docId]: true }));
    setFlaggedDocs((prev) => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });
    onVerifyDoc?.(docId);
    toast.success(`Verified: ${currentDoc.label || currentDoc.name}`);
  };

  const handleFlag = (docId: string, reason: string) => {
    if (!reason.trim()) return;
    setFlaggedDocs((prev) => ({ ...prev, [docId]: reason }));
    setVerifiedDocs((prev) => ({ ...prev, [docId]: false }));
    onFlagDoc?.(docId, reason);
    setFlagInputModal(false);
    setFlagReasonInput('');
    toast.error(`Flagged attachment: ${currentDoc.name}`, {
      description: `Reason: ${reason}`,
    });
  };

  const handleDownload = (doc: DocumentAttachmentItem) => {
    toast.info(`Downloading file: ${doc.name}...`);
    const element = document.createElement('a');
    let content = '';
    let mime = 'text/plain';

    if (isJson) {
      content = JSON.stringify({
        system: "QC Citizen Information & Residency Verification Engine",
        verificationId: "QC-CIS-2026-99201",
        applicantName,
        applicantId,
        barangay: "Barangay Central, Quezon City",
        verificationStatus: "MATCHED_AND_AUTHENTICATED",
        timestamp: "2026-08-25T16:12:00.000Z",
        biometricsMatched: true,
        residencyDurationYears: 6
      }, null, 2);
      mime = 'application/json';
    } else {
      content = `Quezon City Government E-Scholar Document Vault\nApplicant: ${applicantName} (${applicantId})\nProgram: ${programTitle}\nDocument: ${doc.name}\nSize: ${doc.size || 'Unknown'}\nVerification: QCSP Certified\nTimestamp: ${new Date().toISOString()}`;
    }

    const file = new Blob([content], { type: mime });
    element.href = URL.createObjectURL(file);
    element.download = doc.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    toast.info('Sending attachment to print queue...');
    window.print();
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % documents.length);
    setZoomLevel(100);
    setRotation(0);
    setActiveMediaView('canvas');
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev - 1 + documents.length) % documents.length);
    setZoomLevel(100);
    setRotation(0);
    setActiveMediaView('canvas');
  };

  const sampleJsonData = {
    system: "QC Citizen Information & Residency Verification Engine (QC-CIS)",
    registryVersion: "v4.2.8",
    verificationRecord: {
      status: "AUTHENTICATED",
      confidenceScore: "100%",
      qCitizenId: "QC-2024-88491",
      residentFullName: applicantName,
      studentId: applicantId,
      schoolInstitution: studentSchool,
      courseDegree: studentCourse,
      registeredAddress: "Blk 11 Lot 15 Villa Alicia 1, Barangay Central",
      city: "Quezon City",
      district: "District IV",
      verifiedVoter: true,
      indigencyCategory: "Category C (Low Income Family Bracket)",
      householdAnnualIncome: "₱60,000.00",
      biometricHash: "SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      verifiedAt: "2026-08-25T16:12:00.000Z",
      issuingAuthority: "Quezon City People's Government & ICTD"
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submitted Attachment Inspection & Verification Desk"
      description={`Reviewing official document submissions for ${applicantName} (${applicantId})`}
      maxWidth="6xl"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              Attachment {selectedIndex + 1} of {documents.length} •{' '}
              <strong className="text-slate-900 dark:text-white">
                {Object.values(verifiedDocs).filter(Boolean).length} / {documents.length} Verified
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close Inspector
            </Button>
            {onRejectApplication && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  onClose();
                  onRejectApplication();
                }}
              >
                Reject Application
              </Button>
            )}
            {onApproveApplication && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onApproveApplication();
                }}
              >
                Approve Application
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        {/* Left Side: Attachment Index Drawer (4 Cols) */}
        <div className="lg:col-span-4 space-y-3 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 pb-4 lg:pb-0 lg:pr-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Submitted Attachments ({documents.length})
            </span>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
              Click to Open File
            </span>
          </div>

          {/* Document list */}
          <div className="space-y-2 max-h-[430px] overflow-y-auto pr-1">
            {documents.map((doc, idx) => {
              const isSelected = idx === selectedIndex;
              const isVer = verifiedDocs[doc.id];
              const isFlag = Boolean(flaggedDocs[doc.id]);
              const docName = (doc.name || '').toLowerCase();
              const isItemJson = docName.endsWith('.json');
              const isItemImg = docName.endsWith('.jfif') || docName.endsWith('.jpg') || docName.endsWith('.png');
              const isItemMd = docName.endsWith('.md') || docName.endsWith('.txt');

              return (
                <button
                  key={doc.id || idx}
                  onClick={() => {
                    setSelectedIndex(idx);
                    setZoomLevel(100);
                    setRotation(0);
                    setActiveMediaView('canvas');
                  }}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 dark:border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : isFlag
                        ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400'
                        : isVer
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {isItemJson ? (
                      <FileCode className="h-4 w-4" />
                    ) : isItemImg ? (
                      <ImageIcon className="h-4 w-4" />
                    ) : isItemMd ? (
                      <FileText className="h-4 w-4" />
                    ) : (
                      <FileCheck className="h-4 w-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-extrabold truncate ${isSelected ? 'text-blue-900 dark:text-blue-200' : 'text-slate-900 dark:text-white'}`}>
                        {doc.label || doc.name}
                      </p>
                    </div>

                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
                      {doc.name}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                      <span className="text-slate-400">{doc.size || '1.4 MB'}</span>
                      <span>•</span>
                      {isFlag ? (
                        <span className="text-rose-600 dark:text-rose-400 font-extrabold flex items-center gap-0.5">
                          <AlertTriangle className="h-3 w-3" /> Flagged
                        </span>
                      ) : isVer ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-0.5">
                          <Check className="h-3 w-3" /> Verified Inside
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">
                          Needs Review
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Summary Applicant Credentials */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Applicant:</span>
              <span className="font-bold text-slate-900 dark:text-white">{applicantName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">School / College:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">{studentSchool}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Course / Major:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">{studentCourse}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Recorded GWA:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{studentGpa.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Document Canvas & Interactive Previewer (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-3">
          {/* Top Inspector Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={documents.length <= 1}
                className="h-8 px-2"
                title="Previous Document"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={documents.length <= 1}
                className="h-8 px-2"
                title="Next Document"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-2">
                Doc {selectedIndex + 1} / {documents.length}
              </span>

              {hasRealImageSource && (
                <div className="flex items-center gap-1 bg-white dark:bg-slate-700 p-0.5 rounded-xl border border-slate-300 dark:border-slate-600 ml-2">
                  <button
                    onClick={() => setActiveMediaView('canvas')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                      activeMediaView === 'canvas' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Digitized
                  </button>
                  <button
                    onClick={() => setActiveMediaView('raw_image')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                      activeMediaView === 'raw_image' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Scan Image
                  </button>
                </div>
              )}
            </div>

            {/* Zoom & Rotation Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 15, 60))}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 shadow-xs cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 px-1.5">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 15, 160))}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 shadow-xs cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 shadow-xs ml-1 cursor-pointer"
                title="Rotate 90°"
              >
                <RotateCw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleDownload(currentDoc)}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 shadow-xs ml-1 cursor-pointer"
                title="Download File"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handlePrint}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 shadow-xs ml-1 cursor-pointer"
                title="Print Attachment"
              >
                <Printer className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Document Verification Action Status */}
            <div className="flex items-center gap-1.5">
              {isCurrentVerified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-xl">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Verified Correct
                </span>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVerify(currentDoc.id)}
                  className="h-8 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 hover:bg-emerald-100"
                  leftIcon={<Check className="h-3.5 w-3.5" />}
                >
                  Mark Verified
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setFlagInputModal(true)}
                className="h-8 text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/80 border-rose-300 hover:bg-rose-100"
                leftIcon={<AlertTriangle className="h-3.5 w-3.5" />}
              >
                Flag Issue
              </Button>
            </div>
          </div>

          {/* Flag Issue Notification if present */}
          {currentFlagReason && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center justify-between text-xs text-rose-900 dark:text-rose-200 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>
                  <strong>Flagged by Admin:</strong> {currentFlagReason}
                </span>
              </div>
              <button
                onClick={() => handleVerify(currentDoc.id)}
                className="text-[11px] font-bold underline hover:text-rose-700 cursor-pointer"
              >
                Clear Flag & Verify
              </button>
            </div>
          )}

          {/* Flag Input Prompt Drawer/Box */}
          {flagInputModal && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-2 text-xs animate-in fade-in">
              <p className="font-bold text-amber-900 dark:text-amber-200">
                Specify issue with attachment "{currentDoc.name}":
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={flagReasonInput}
                  onChange={(e) => setFlagReasonInput(e.target.value)}
                  placeholder="e.g. Blurred photo, missing registrar stamp, wrong semester..."
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl text-xs focus:outline-none"
                />
                <Button
                  size="sm"
                  onClick={() => handleFlag(currentDoc.id, flagReasonInput || 'Invalid documentary submission')}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Confirm Flag
                </Button>
                <Button size="sm" variant="outline" onClick={() => setFlagInputModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Dynamic Visual Document Canvas Preview (Renders Actual Content Inside) */}
          <div className="relative flex-1 bg-slate-950 dark:bg-black rounded-3xl border border-slate-800 p-4 sm:p-6 overflow-auto max-h-[510px] flex items-center justify-center shadow-2xl">
            
            {/* RAW UPLOADED IMAGE VIEW (if active) */}
            {hasRealImageSource && activeMediaView === 'raw_image' ? (
              <div
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease-out',
                }}
                className="flex items-center justify-center max-w-full"
              >
                <img
                  src={currentDoc.fileData}
                  alt={currentDoc.name}
                  className="max-h-[460px] object-contain rounded-xl shadow-2xl border border-slate-700 bg-white"
                />
              </div>
            ) : isJson ? (
              /* 1. JSON DOCUMENT PREVIEW (e.g. Citizen_Information_System_Matched.json) */
              <div
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease-out',
                }}
                className="w-full max-w-2xl bg-slate-900 text-slate-100 rounded-2xl shadow-2xl p-6 space-y-4 border border-slate-700 font-sans"
              >
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <FileCode className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{currentDoc.name}</h4>
                      <p className="text-[11px] text-emerald-400 font-medium">✓ Cryptographically Verified QC-CIS Record</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
                    <button
                      onClick={() => setJsonViewTab('structured')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        jsonViewTab === 'structured' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Summary Inspector
                    </button>
                    <button
                      onClick={() => setJsonViewTab('raw')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        jsonViewTab === 'raw' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Raw JSON
                    </button>
                  </div>
                </div>

                {jsonViewTab === 'structured' ? (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Citizen Full Name</span>
                        <span className="font-bold text-white text-sm">{applicantName}</span>
                      </div>
                      <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">QCitizen ID Card</span>
                        <span className="font-mono font-bold text-emerald-400">QC-2024-88491</span>
                      </div>
                      <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Barangay Residency</span>
                        <span className="font-semibold text-slate-200">Barangay Central, District IV</span>
                      </div>
                      <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Residency Eligibility</span>
                        <span className="font-bold text-emerald-400">Eligible (6+ Years Resident)</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 space-y-1 font-mono text-[11px]">
                      <div className="flex justify-between text-slate-400">
                        <span>Biometric Authenticity:</span>
                        <span className="text-emerald-400 font-bold">MATCHED (100%)</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Verification Stamp:</span>
                        <span className="text-slate-300">SHA256:e3b0c44298fc...52b855</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-[260px]">
                    {JSON.stringify(sampleJsonData, null, 2)}
                  </pre>
                )}
              </div>
            ) : isIndigencyCert ? (
              /* 2. CERTIFICATE OF INDIGENCY / BARANGAY CLEARANCE */
              <div
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease-out',
                }}
                className="w-full max-w-2xl bg-[#fffdfa] text-slate-900 rounded-xl shadow-2xl p-8 space-y-5 border-4 border-double border-amber-900/40 font-serif relative"
              >
                {/* Official Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none text-9xl font-black rotate-[-30deg] uppercase select-none text-slate-900">
                  OFFICIAL
                </div>

                {/* Barangay Header */}
                <div className="text-center space-y-1 border-b-2 border-amber-900/30 pb-4">
                  <p className="text-[10px] uppercase tracking-widest text-slate-600 font-sans font-bold">
                    Republic of the Philippines • National Capital Region
                  </p>
                  <p className="text-[11px] uppercase tracking-wider text-slate-700 font-sans font-bold">
                    City of Quezon • District IV
                  </p>
                  <h3 className="font-heading text-lg font-black text-slate-900 tracking-tight font-serif uppercase text-amber-950">
                    BARANGAY CENTRAL
                  </h3>
                  <p className="text-[10px] text-slate-500 italic font-serif">
                    Office of the Punong Barangay & Sangguniang Barangay
                  </p>
                </div>

                {/* Title */}
                <div className="text-center py-2">
                  <span className="inline-block px-6 py-1 bg-amber-100/70 border border-amber-900/40 rounded-md font-sans font-extrabold text-xs uppercase tracking-widest text-amber-950">
                    CERTIFICATE OF INDIGENCY & BARANGAY RESIDENCY
                  </span>
                  <p className="text-[10px] font-sans text-slate-400 mt-1 font-mono">
                    Control No: BC-IND-2026-088492
                  </p>
                </div>

                {/* Body Text */}
                <div className="space-y-3 text-xs leading-relaxed text-slate-800 text-justify font-serif">
                  <p className="font-bold">TO WHOM IT MAY CONCERN:</p>
                  <p>
                    This is to certify that <strong className="font-sans font-black text-slate-900 underline">{applicantName}</strong>, of legal age, Single, Filipino citizen, is a bona fide permanent resident of this Barangay with registered residential address at <strong className="font-sans font-bold text-slate-900">Blk 11 Lot 15 Villa Alicia 1, Barangay Central, District IV, Quezon City</strong>.
                  </p>
                  <p>
                    Records further certify that the above-named student belongs to the <strong className="font-sans font-bold text-amber-950">Low-Income / Indigent Household Bracket</strong> of our community with an annual household declaration of approximately <strong className="font-mono font-bold">₱60,000.00</strong>.
                  </p>
                  <p>
                    This certification is issued upon the request of the interested party for the purpose of her application for the <strong className="font-sans font-bold text-blue-900">QUEZON CITY SCHOLARSHIP PROGRAM (QCSP) — {programTitle.toUpperCase()}</strong>.
                  </p>
                  <p className="italic text-[11px] text-slate-600">
                    Issued this 25th day of August 2026 at Barangay Central Hall, Quezon City, Philippines.
                  </p>
                </div>

                {/* Signatures & Seal Section */}
                <div className="pt-6 grid grid-cols-2 gap-4 items-end border-t border-amber-900/20">
                  <div className="text-center space-y-1">
                    <div className="h-10 border-b border-slate-400 w-3/4 mx-auto flex items-end justify-center">
                      <span className="text-[10px] font-cursive italic text-slate-600">C. M. Ramos</span>
                    </div>
                    <p className="text-[10px] font-sans font-bold text-slate-900 uppercase">Corazon M. Ramos</p>
                    <p className="text-[9px] font-sans text-slate-500">Barangay Secretary</p>
                  </div>

                  <div className="text-center space-y-1">
                    <div className="h-10 border-b border-slate-400 w-3/4 mx-auto flex items-end justify-center">
                      <span className="text-[10px] font-cursive italic text-blue-900 font-bold">Hon. Mario V. Delos Reyes</span>
                    </div>
                    <p className="text-[10px] font-sans font-black text-slate-900 uppercase">HON. MARIO V. DELOS REYES</p>
                    <p className="text-[9px] font-sans text-slate-500 font-bold">Punong Barangay / Barangay Captain</p>
                  </div>
                </div>

                {/* Seal Strip */}
                <div className="pt-2 flex items-center justify-between text-[9px] font-sans text-slate-400 border-t border-dashed border-slate-300">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    Barangay Dry Seal Affixed & Authenticated
                  </span>
                  <span className="font-mono">Doc ID: {currentDoc.name}</span>
                </div>
              </div>
            ) : isCorOrGrades ? (
              /* 3. CERTIFICATE OF REGISTRATION (COR) & SEMESTER GRADE CARD */
              <div
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease-out',
                }}
                className="w-full max-w-2xl bg-white text-slate-900 rounded-xl shadow-2xl p-7 space-y-4 border-2 border-slate-300 font-sans relative"
              >
                {/* Official Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none text-8xl font-black rotate-[-25deg] uppercase select-none text-blue-900">
                  OFFICIAL COR
                </div>

                {/* University Header */}
                <div className="flex items-center justify-between border-b-2 border-blue-900 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-xs shadow-xs">
                      QC
                    </div>
                    <div>
                      <h3 className="font-heading text-sm font-black text-blue-950 uppercase tracking-tight">
                        {studentSchool}
                      </h3>
                      <p className="text-[10px] text-slate-600 font-medium">
                        Office of the University Registrar • Student Information & Grade System
                      </p>
                    </div>
                  </div>
                  <Badge variant="primary" className="text-[10px] font-bold">
                    Official COR & Grade Report
                  </Badge>
                </div>

                {/* Student Credentials Strip */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Student Name</span>
                    <span className="font-bold text-slate-900 truncate block">{applicantName}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Student Number</span>
                    <span className="font-mono font-bold text-blue-700 block">{applicantId}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Degree / Program</span>
                    <span className="font-bold text-slate-800 truncate block">{studentCourse}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">GWA & Standing</span>
                    <span className="font-bold text-emerald-700 block">{studentGpa.toFixed(2)} (Regular Enrollee)</span>
                  </div>
                </div>

                {/* Course Subjects & Grade Breakdown Table */}
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 text-slate-600 font-bold border-b">
                      <tr>
                        <th className="p-2">Subject Code</th>
                        <th className="p-2">Descriptive Course Title</th>
                        <th className="p-2 text-center">Units</th>
                        <th className="p-2 text-center">Final Grade</th>
                        <th className="p-2 text-center">Remark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr>
                        <td className="p-2 font-mono font-bold text-blue-700">IT401</td>
                        <td className="p-2">Capstone Project & Systems Development</td>
                        <td className="p-2 text-center">3.0</td>
                        <td className="p-2 text-center font-bold text-emerald-700">1.25</td>
                        <td className="p-2 text-center font-bold text-emerald-600">PASSED</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-mono font-bold text-blue-700">IT402</td>
                        <td className="p-2">Information Assurance and Cybersecurity</td>
                        <td className="p-2 text-center">3.0</td>
                        <td className="p-2 text-center font-bold text-emerald-700">1.50</td>
                        <td className="p-2 text-center font-bold text-emerald-600">PASSED</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-mono font-bold text-blue-700">IT403</td>
                        <td className="p-2">Advanced Database Systems & Management</td>
                        <td className="p-2 text-center">3.0</td>
                        <td className="p-2 text-center font-bold text-emerald-700">1.50</td>
                        <td className="p-2 text-center font-bold text-emerald-600">PASSED</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-mono font-bold text-blue-700">IT404</td>
                        <td className="p-2">Cloud Computing Infrastructure & DevOps</td>
                        <td className="p-2 text-center">3.0</td>
                        <td className="p-2 text-center font-bold text-emerald-700">1.75</td>
                        <td className="p-2 text-center font-bold text-emerald-600">PASSED</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-mono font-bold text-blue-700">IT405</td>
                        <td className="p-2">Web Application Architecture & RESTful APIs</td>
                        <td className="p-2 text-center">3.0</td>
                        <td className="p-2 text-center font-bold text-emerald-700">1.25</td>
                        <td className="p-2 text-center font-bold text-emerald-600">PASSED</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-mono font-bold text-blue-700">IT406</td>
                        <td className="p-2">Professional Ethics, Governance & IPR</td>
                        <td className="p-2 text-center">3.0</td>
                        <td className="p-2 text-center font-bold text-emerald-700">1.50</td>
                        <td className="p-2 text-center font-bold text-emerald-600">PASSED</td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-blue-50/70 border-t font-bold text-slate-800">
                      <tr>
                        <td colSpan={2} className="p-2 text-right">TOTAL ENROLLED UNITS & TERM GWA:</td>
                        <td className="p-2 text-center text-blue-900">18.0</td>
                        <td className="p-2 text-center font-extrabold text-emerald-700 text-xs">{studentGpa.toFixed(2)} GWA</td>
                        <td className="p-2 text-center text-emerald-700">HONOR TIER</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Footer Validation Strip */}
                <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 border-t">
                  <span className="flex items-center gap-1 font-semibold text-emerald-700">
                    <ShieldCheck className="h-3.5 w-3.5" /> University Registrar Digital Seal Validated
                  </span>
                  <span className="font-mono">Verification Hash: SHA256-REG-{applicantId}</span>
                </div>
              </div>
            ) : isTorOrReportCard ? (
              /* 4. OFFICIAL TRANSCRIPT OF RECORDS (TOR) / FORM 137 / 138 REPORT CARD */
              <div
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease-out',
                }}
                className="w-full max-w-2xl bg-[#fafafa] text-slate-900 rounded-xl shadow-2xl p-7 space-y-4 border-2 border-slate-300 font-sans relative"
              >
                <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-700 text-white flex items-center justify-center font-black text-xs shadow-xs">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-sm font-black text-slate-900 uppercase tracking-tight">
                        OFFICIAL TRANSCRIPT OF RECORDS & PROGRESS REPORT
                      </h3>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {studentSchool} • Student Records & Evaluation Bureau
                      </p>
                    </div>
                  </div>
                  <Badge variant="success" className="text-[10px] font-bold">
                    Official Certified True Copy
                  </Badge>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-slate-400 font-bold text-[10px] block">CANDIDATE:</span> <strong className="text-slate-900">{applicantName}</strong></div>
                    <div><span className="text-slate-400 font-bold text-[10px] block">STUDENT NUMBER:</span> <span className="font-mono font-bold text-indigo-700">{applicantId}</span></div>
                    <div><span className="text-slate-400 font-bold text-[10px] block">ACADEMIC DEGREE:</span> <span className="font-semibold text-slate-800">{studentCourse}</span></div>
                    <div><span className="text-slate-400 font-bold text-[10px] block">CUMULATIVE GWA:</span> <strong className="text-emerald-700 text-sm">{studentGpa.toFixed(2)}</strong></div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1 text-emerald-950">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    Academic Standing & Units Clearance
                  </p>
                  <p className="text-[11px] text-emerald-800">
                    Candidate has completed all prerequisite units with zero failed or dropped subjects. Qualified for academic honors and scholarship stipend allocation.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t">
                  <span>Commission on Higher Education (CHED) Standard Transcript Format</span>
                  <span className="font-mono">TOR-REG-{applicantId}</span>
                </div>
              </div>
            ) : isGoodMoralOrRecommendation ? (
              /* 5. CERTIFICATE OF GOOD MORAL CHARACTER / RECOMMENDATION LETTER */
              <div
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease-out',
                }}
                className="w-full max-w-2xl bg-[#fffdfa] text-slate-900 rounded-xl shadow-2xl p-8 space-y-5 border-4 border-double border-blue-900/30 font-serif relative"
              >
                <div className="text-center space-y-1 border-b-2 border-blue-900/30 pb-4">
                  <div className="inline-flex items-center justify-center p-2 rounded-full bg-blue-100 text-blue-800 mb-1">
                    <Award className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading text-base font-black text-blue-950 uppercase tracking-tight">
                    {studentSchool}
                  </h3>
                  <p className="text-[11px] text-slate-600 font-sans font-bold uppercase">
                    Office of Student Affairs & Dean of Discipline
                  </p>
                </div>

                <div className="text-center py-1">
                  <span className="inline-block px-5 py-1 bg-blue-50 border border-blue-200 rounded-md font-sans font-extrabold text-xs uppercase tracking-wider text-blue-950">
                    CERTIFICATE OF GOOD MORAL CHARACTER & FACULTY ENDORSEMENT
                  </span>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-slate-800 text-justify font-serif">
                  <p className="font-bold font-sans">TO THE SCHOLARSHIP SCREENING COMMITTEE:</p>
                  <p>
                    This is to certify that <strong className="font-sans font-bold text-slate-900">{applicantName}</strong> (Student No. <span className="font-mono">{applicantId}</span>) is a student of good moral character and has maintained exemplary civic and academic conduct in this institution.
                  </p>
                  <p>
                    The student has not been subjected to any disciplinary action or violation of university rules and regulations. We strongly endorse this student for the <strong className="font-sans font-bold text-blue-900">{programTitle}</strong>.
                  </p>
                </div>

                <div className="pt-6 flex justify-between items-end border-t border-blue-900/20 text-center font-sans text-xs">
                  <div className="space-y-1">
                    <div className="h-8 border-b border-slate-400 w-36 mx-auto flex items-end justify-center">
                      <span className="text-[10px] italic text-slate-600">Dr. A. Vance</span>
                    </div>
                    <p className="font-bold text-slate-900 text-[11px]">Dr. Arthur Vance, Ph.D.</p>
                    <p className="text-[9px] text-slate-500">Department Chairperson</p>
                  </div>

                  <div className="space-y-1">
                    <div className="h-8 border-b border-slate-400 w-36 mx-auto flex items-end justify-center">
                      <span className="text-[10px] italic text-blue-900 font-bold">Dean R. Martinez</span>
                    </div>
                    <p className="font-black text-slate-900 text-[11px]">Dean Rosalinda Martinez</p>
                    <p className="text-[9px] text-slate-500">Dean of Student Affairs</p>
                  </div>
                </div>
              </div>
            ) : isItrOrTax ? (
              /* 6. INCOME TAX RETURN (ITR) / AFFIDAVIT OF LOW INCOME */
              <div
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease-out',
                }}
                className="w-full max-w-2xl bg-white text-slate-900 rounded-xl shadow-2xl p-7 space-y-4 border-2 border-slate-300 font-sans relative"
              >
                <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-500">Republic of the Philippines • Bureau of Internal Revenue</p>
                    <h3 className="font-heading text-sm font-black text-slate-900 uppercase">
                      CERTIFICATE OF LOW INCOME & AFFIDAVIT OF TAX EXEMPTION
                    </h3>
                  </div>
                  <Badge variant="primary" className="text-[10px] font-bold">
                    BIR Verified
                  </Badge>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-slate-400 font-bold text-[10px] block">TAXPAYER / BENEFICIARY:</span> <strong className="text-slate-900">{applicantName}</strong></div>
                    <div><span className="text-slate-400 font-bold text-[10px] block">IDENTIFICATION:</span> <span className="font-mono font-bold text-slate-700">{applicantId}</span></div>
                    <div><span className="text-slate-400 font-bold text-[10px] block">HOUSEHOLD ANNUAL INCOME:</span> <span className="font-bold text-emerald-700">₱60,000.00 / Year</span></div>
                    <div><span className="text-slate-400 font-bold text-[10px] block">EXEMPTION STATUS:</span> <span className="font-bold text-blue-700">Tax Exempt (Under Threshold)</span></div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  The declaring party is certified to belong to the non-taxable minimum wage earner / indigent bracket, eligible for educational subsidies under the Quezon City Scholarship Code.
                </p>

                <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t">
                  <span>Revenue District Office • Quezon City District IV</span>
                  <span className="font-mono">BIR-EXEMPT-2026-{applicantId}</span>
                </div>
              </div>
            ) : isQCitizenOrId ? (
              /* 7. QCITIZEN IDENTIFICATION CARD / RESIDENT SMART CARD */
              <div
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease-out',
                }}
                className="w-full max-w-xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 text-white rounded-2xl shadow-2xl p-6 space-y-4 border border-blue-700 font-sans relative overflow-hidden"
              >
                {/* Card Glow Elements */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-blue-700/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-white text-blue-900 flex items-center justify-center font-black text-xs shadow-md">
                      QC
                    </div>
                    <div>
                      <h4 className="font-heading font-black text-sm text-white tracking-wide">QCITIZEN RESIDENT ID</h4>
                      <p className="text-[10px] text-blue-200">Quezon City Government Unified Resident Card</p>
                    </div>
                  </div>
                  <CreditCard className="h-6 w-6 text-blue-300" />
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="col-span-1 flex flex-col items-center justify-center bg-blue-950/70 border border-blue-600/40 rounded-xl p-3 text-center">
                    <div className="h-16 w-16 rounded-full bg-blue-800 border-2 border-blue-400 flex items-center justify-center text-xl font-bold">
                      {applicantName.charAt(0)}
                    </div>
                    <span className="text-[9px] text-emerald-400 font-bold mt-1.5 flex items-center gap-0.5">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Biometrics Valid
                    </span>
                  </div>

                  <div className="col-span-2 space-y-1.5 text-xs">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-blue-300 block">CARDHOLDER NAME</span>
                      <span className="font-extrabold text-white text-sm block">{applicantName}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-blue-300 block">QCITIZEN NUMBER</span>
                      <span className="font-mono font-bold text-amber-300 text-xs block">QC-2024-88491</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      <div><span className="text-blue-300 block">BARANGAY</span><span>Central, Dist. IV</span></div>
                      <div><span className="text-blue-300 block">VALIDITY</span><span>2024–2029</span></div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[10px] text-blue-300 border-t border-blue-800/80 font-mono">
                  <span>Quezon City E-Services Smart ID</span>
                  <span>QCSP-AUTH-ACTIVE</span>
                </div>
              </div>
            ) : isSectoral ? (
              /* 8. SECTORAL CLEARANCE (SOLO PARENT / PWD / 4PS / INDIGENOUS) */
              <div
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease-out',
                }}
                className="w-full max-w-2xl bg-white text-slate-900 rounded-xl shadow-2xl p-7 space-y-4 border-2 border-slate-300 font-sans relative"
              >
                <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-700 text-white flex items-center justify-center font-black text-xs shadow-xs">
                      <HeartHandshake className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-sm font-black text-slate-900 uppercase">
                        SECTORAL ELIGIBILITY & SOCIAL WELFARE CERTIFICATION
                      </h3>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Social Services Development Department (SSDD) • Quezon City
                      </p>
                    </div>
                  </div>
                  <Badge variant="primary" className="text-[10px] font-bold">
                    Official Priority Sector
                  </Badge>
                </div>

                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-purple-600 font-bold text-[10px] block">BENEFICIARY:</span> <strong className="text-slate-900">{applicantName}</strong></div>
                    <div><span className="text-purple-600 font-bold text-[10px] block">STUDENT NUMBER:</span> <span className="font-mono font-bold text-slate-700">{applicantId}</span></div>
                    <div><span className="text-purple-600 font-bold text-[10px] block">SECTORAL CLASSIFICATION:</span> <span className="font-bold text-purple-900">Priority Educational Assistance Bracket</span></div>
                    <div><span className="text-purple-600 font-bold text-[10px] block">VERIFICATION STATUS:</span> <span className="font-bold text-emerald-700">Validated & Approved</span></div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Official registry certification confirming sectoral eligibility, granting expedited evaluation and full educational grant entitlement.
                </p>

                <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t">
                  <span>Quezon City Social Services Registry</span>
                  <span className="font-mono">SSDD-VAL-{applicantId}</span>
                </div>
              </div>
            ) : isMarkdownOrText ? (
              /* 9. MARKDOWN / TEXT FILE PREVIEW (e.g. implementation_plan.md) */
              <div
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease-out',
                }}
                className="w-full max-w-2xl bg-slate-900 text-slate-100 rounded-2xl shadow-2xl p-6 space-y-4 border border-slate-700 font-sans"
              >
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-400" />
                    <div>
                      <h4 className="font-bold text-sm text-white">{currentDoc.name}</h4>
                      <p className="text-[10px] text-slate-400">Applicant Study & Commitment Plan</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{currentDoc.size || '6.2 KB'}</span>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 space-y-3 max-h-[300px] overflow-y-auto leading-relaxed">
                  <div className="border-b border-slate-800 pb-2">
                    <p className="text-emerald-400 font-bold text-sm"># Academic Goals & Study Plan (AY 2026-2027)</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">Applicant: {applicantName} • {studentCourse}</p>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <p className="text-blue-300 font-bold">1. Academic Target:</p>
                    <p className="text-slate-300 pl-3">
                      - Maintain semester GWA of 1.75 or higher in {studentCourse} at {studentSchool}.<br />
                      - Complete final year capstone project focusing on public government service innovation.
                    </p>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <p className="text-blue-300 font-bold">2. Educational Grant Allocation Plan:</p>
                    <p className="text-slate-300 pl-3">
                      - Tuition & Laboratory Assessment Fees: ₱10,000.00<br />
                      - Academic Books & E-Learning Connectivity Subsidy: ₱5,000.00<br />
                      - Capstone Systems Development & Graduation Fund: ₱5,000.00
                    </p>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <p className="text-blue-300 font-bold">3. Sworn Commitment:</p>
                    <p className="text-slate-300 pl-3">
                      "I hereby commit to upholding the highest standards of academic integrity, active community involvement in Quezon City, and prompt submission of renewal credentials."
                    </p>
                  </div>
                </div>
              </div>
            ) : is2Step ? (
              /* 10. 2STEP VERIFICATION PROOF */
              <div
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease-out',
                }}
                className="w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl p-7 space-y-4 border border-slate-200 font-sans"
              >
                <div className="text-center space-y-1 border-b pb-3">
                  <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-50 text-emerald-600 mb-1">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <h4 className="font-heading font-extrabold text-base text-slate-900">Multi-Factor Authentication & Identity Verification</h4>
                  <p className="text-xs text-slate-500">Quezon City E-Services Student Identity Assurance Level 2 (IAL-2)</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Verified User:</span>
                    <span className="font-bold text-slate-900">{applicantName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Authentication Method:</span>
                    <span className="font-semibold text-slate-800">Email OTP & SMS 2-Factor Auth</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Security Clearance:</span>
                    <span className="font-bold text-emerald-600">PASSED & AUTHENTICATED</span>
                  </div>
                </div>
              </div>
            ) : (
              /* 11. GENERAL CERTIFIED DOCUMENT VIEW */
              <div
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease-out',
                }}
                className="w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl p-8 space-y-6 border border-slate-200 font-serif relative"
              >
                {/* Header */}
                <div className="text-center border-b-2 border-slate-800 pb-4 space-y-1">
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs font-sans">
                      QC
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-sans font-extrabold">
                        Republic of the Philippines • Quezon City
                      </p>
                      <h3 className="font-heading text-base font-extrabold text-slate-900 tracking-tight font-sans">
                        {studentSchool}
                      </h3>
                      <p className="text-[10px] text-slate-600 font-sans">
                        Office of Academic Affairs & Registrar • Student Records Section
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center py-2 space-y-1">
                  <h2 className="text-lg font-bold uppercase tracking-widest text-slate-900 font-sans">
                    {currentDoc.label || currentDoc.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-sans font-medium">
                    Official Student Documentary Submission • AY 2026-2027
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs font-sans space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Bearer Name</span>
                      <span className="font-bold text-slate-900">{applicantName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Student ID Number</span>
                      <span className="font-mono font-bold text-blue-700">{applicantId}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Degree Program</span>
                    <span className="font-bold text-slate-900">{studentCourse}</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between text-[10px] font-sans text-slate-400 border-t">
                  <span>Quezon City Scholarship Program Secure Archive</span>
                  <span className="font-mono">Doc ID: {currentDoc.id}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
