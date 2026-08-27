import React, { useState, useEffect } from 'react';
import {
  Send,
  Shield,
  Bell,
  Mail,
  Smartphone,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { sendSystemScholarshipNotice } from '../../utils/systemNotifications';

export interface NoticeRecipient {
  studentId: string;
  studentName: string;
  email?: string;
  school?: string;
  scholarshipTitle: string;
  applicationId?: string;
  gpa?: number;
}

interface SendScholarshipNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: NoticeRecipient | null;
  defaultTemplate?: 'award' | 'compliance' | 'payout' | 'interview' | 'renewal' | 'custom';
}

interface TemplatePreset {
  id: string;
  name: string;
  category: 'Award Notice' | 'Document Compliance' | 'Interview Schedule' | 'Disbursement Payout' | 'Renewal Reminder' | 'General Notice';
  priority: 'normal' | 'urgent' | 'high';
  getSubject: (r: NoticeRecipient) => string;
  getMessage: (r: NoticeRecipient) => string;
}

const TEMPLATES: TemplatePreset[] = [
  {
    id: 'award',
    name: '🎉 Official Scholarship Award & Approval Notice',
    category: 'Award Notice',
    priority: 'high',
    getSubject: (r) => `[Official Notice] Congratulations! Your application for ${r.scholarshipTitle} has been Approved`,
    getMessage: (r) =>
      `Dear ${r.studentName} (${r.studentId}),\n\nWe are pleased to inform you that your application (Ref: ${r.applicationId || 'APP-QC-2026'}) for the ${r.scholarshipTitle} has been officially approved by the Quezon City Youth Development Office (QCYDO) evaluation committee.\n\nYour scholar registry record and payout disbursement allocation have been scheduled for processing. Please ensure your digital scholar registry pass and GCash/Landbank account information remain updated.\n\nFor inquiries, consult the E-SCHOLAR portal helpdesk.\n\nBest regards,\nQuezon City Youth Development Office (QCYDO)\nGovServe Education Automated System`,
  },
  {
    id: 'compliance',
    name: '⚠️ Document Compliance / Deficiency Notice',
    category: 'Document Compliance',
    priority: 'urgent',
    getSubject: (r) => `[Action Required] Document Compliance Notice for ${r.scholarshipTitle}`,
    getMessage: (r) =>
      `Dear ${r.studentName} (${r.studentId}),\n\nUpon initial registrar and committee review of your application for ${r.scholarshipTitle}, certain documentary requirements require immediate clarification or re-submission.\n\nPlease log in to your E-SCHOLAR portal account and update your submitted attachments within five (5) working days to prevent application suspension.\n\nQuezon City Youth Development Office (QCYDO)\nGovServe Education Automated System`,
  },
  {
    id: 'payout',
    name: '💵 Scholarship Aid Disbursement Release Advisory',
    category: 'Disbursement Payout',
    priority: 'high',
    getSubject: (r) => `[Disbursement Notice] Educational Assistance Fund Release for ${r.scholarshipTitle}`,
    getMessage: (r) =>
      `Dear ${r.studentName} (${r.studentId}),\n\nYour educational assistance grant payout for the current semester under ${r.scholarshipTitle} at ${r.school || 'your accredited institution'} has been approved and queued for electronic disbursement.\n\nPlease check your registered payout account or digital disbursement receipt on the portal.\n\nQuezon City Youth Development Office (QCYDO)\nGovServe Education Automated System`,
  },
  {
    id: 'interview',
    name: '📅 Interview & Panel Screening Confirmation',
    category: 'Interview Schedule',
    priority: 'normal',
    getSubject: (r) => `[Interview Notice] Panel Screening Schedule for ${r.scholarshipTitle}`,
    getMessage: (r) =>
      `Dear ${r.studentName} (${r.studentId}),\n\nYou have been shortlisted for the final screening panel for ${r.scholarshipTitle}. Please visit the Self-Schedule Interview portal on your student dashboard to confirm your preferred interview time slot and venue.\n\nQuezon City Youth Development Office (QCYDO)\nGovServe Education Automated System`,
  },
  {
    id: 'renewal',
    name: '🔄 Academic Renewal & Term Verification Reminder',
    category: 'Renewal Reminder',
    priority: 'normal',
    getSubject: (r) => `[Renewal Advisory] Semester Renewal Window Open for ${r.scholarshipTitle}`,
    getMessage: (r) =>
      `Dear ${r.studentName} (${r.studentId}),\n\nThis is a system reminder that the scholarship renewal submission window for AY 2026-2027 is now open. To maintain your active scholar standing, please submit your latest Certificate of Registration (COR) and Semester GWA transcript.\n\nQuezon City Youth Development Office (QCYDO)\nGovServe Education Automated System`,
  },
  {
    id: 'custom',
    name: '✍️ Custom Official System Notice',
    category: 'General Notice',
    priority: 'normal',
    getSubject: (r) => `[Official Advisory] Important Information Regarding ${r.scholarshipTitle}`,
    getMessage: (r) =>
      `Dear ${r.studentName} (${r.studentId}),\n\nThis is an official advisory regarding your scholarship status in ${r.scholarshipTitle}.\n\n[Please enter your detailed notice instructions here]\n\nQuezon City Youth Development Office (QCYDO)\nGovServe Education Automated System`,
  },
];

export const SendScholarshipNoticeModal: React.FC<SendScholarshipNoticeModalProps> = ({
  isOpen,
  onClose,
  recipient,
  defaultTemplate = 'award',
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(defaultTemplate);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent' | 'high'>('normal');
  const [sendInApp, setSendInApp] = useState(true);
  const [sendSms, setSendSms] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (recipient) {
      const tmpl = TEMPLATES.find((t) => t.id === selectedTemplateId) || TEMPLATES[0];
      setSubject(tmpl.getSubject(recipient));
      setMessage(tmpl.getMessage(recipient));
      setPriority(tmpl.priority);
    }
  }, [recipient, selectedTemplateId]);

  if (!recipient) return null;

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = TEMPLATES.find((t) => t.id === templateId);
    if (tmpl && recipient) {
      setSubject(tmpl.getSubject(recipient));
      setMessage(tmpl.getMessage(recipient));
      setPriority(tmpl.priority);
    }
  };

  const handleDispatch = () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Please provide both subject and message content.');
      return;
    }

    setIsSending(true);

    try {
      sendSystemScholarshipNotice({
        recipientStudentId: recipient.studentId,
        recipientStudentName: recipient.studentName,
        recipientEmail: recipient.email,
        scholarshipTitle: recipient.scholarshipTitle,
        subject: subject.trim(),
        message: message.trim(),
        priority,
        category: (TEMPLATES.find((t) => t.id === selectedTemplateId)?.category || 'General Notice'),
      });

      toast.success(`Official System Notice dispatched to ${recipient.studentName}!`, {
        description: `Delivered via In-App Portal Bell${sendSms ? ', SMS' : ''}${sendEmail ? ', Email' : ''}. Sender masked as 'GovServe Education Automated System'.`,
      });

      onClose();
    } catch (e) {
      console.error(e);
      toast.error('Failed to send notice. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="2xl">
      <div className="space-y-5">
        {/* Header Title & System Masking Banner */}
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold border border-blue-200 dark:border-blue-800 shrink-0">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                Dispatch Scholarship Notice to Student
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official scholarship communications and compliance advisories.
              </p>
            </div>
          </div>

          {/* System Identity Masking Guarantee Notice */}
          <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
            <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-800 dark:text-emerald-300">
                🛡️ Automated System Dispatch Active (Admin Identity Masked)
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5 leading-relaxed">
                When <strong>{recipient.studentName}</strong> receives this notice, the sender is strictly displayed as{' '}
                <strong className="underline">GovServe Education Automated System (QCYDO)</strong>. Your individual admin name, staff ID, and personal credentials will never be exposed.
              </p>
            </div>
          </div>
        </div>

        {/* Recipient Details Pill */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Recipient Scholar</span>
            <span className="font-bold text-slate-900 dark:text-white block truncate">{recipient.studentName}</span>
            <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-semibold">{recipient.studentId}</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Enrolled Scholarship</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">{recipient.scholarshipTitle}</span>
            <span className="text-[10px] text-slate-500">{recipient.school || 'Quezon City Partner School'}</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Official Sender Label</span>
            <Badge variant="primary" size="sm" className="font-bold text-[10px]">
              GovServe System Notice
            </Badge>
          </div>
        </div>

        {/* Template Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Choose Message Template / Subject Type:</span>
            <span className="text-[11px] text-blue-600 font-normal">Pre-filled with official QCYDO format</span>
          </label>
          <select
            value={selectedTemplateId}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="w-full h-10 px-3 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-xs"
          >
            {TEMPLATES.map((tmpl) => (
              <option key={tmpl.id} value={tmpl.id}>
                {tmpl.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subject Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Notice Subject Line:
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter notification title..."
            className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 shadow-xs"
          />
        </div>

        {/* Message Body */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Official Message Content:
            </label>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
              {showPreview ? 'Edit Message' : 'Preview Student View'}
            </button>
          </div>

          {showPreview ? (
            <div className="p-4 bg-gradient-to-br from-blue-50/70 via-white to-slate-50 dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-900 border-2 border-blue-300 dark:border-blue-700 rounded-2xl space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-blue-200 dark:border-blue-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-white p-0.5 shadow-xs flex items-center justify-center">
                    <img src="/logo-system.png" alt="QC Logo" className="h-6 w-6 object-contain" />
                  </div>
                  <div>
                    <h5 className="font-heading text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      GovServe Education Automated System
                    </h5>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Official QCYDO Portal Notice</span>
                  </div>
                </div>
                <Badge variant="success" size="sm" className="text-[9px]">
                  VERIFIED DISPATCH
                </Badge>
              </div>

              <div className="space-y-1">
                <h4 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white">{subject}</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                  {message}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-400">
                <span>Timestamp: {new Date().toLocaleString()}</span>
                <span>Automated Notice • Do Not Reply Directly</span>
              </div>
            </div>
          ) : (
            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write the official scholarship notification message here..."
              className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-sans text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 leading-relaxed shadow-xs"
            />
          )}
        </div>

        {/* Delivery Channels */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Automated Delivery Channels:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <label className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer shadow-xs">
              <input
                type="checkbox"
                checked={sendInApp}
                onChange={(e) => setSendInApp(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <Bell className="h-3.5 w-3.5 text-blue-600" />
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">Portal Bell Alert</span>
            </label>

            <label className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer shadow-xs">
              <input
                type="checkbox"
                checked={sendSms}
                onChange={(e) => setSendSms(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">SMS Broadcast</span>
            </label>

            <label className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer shadow-xs">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <Mail className="h-3.5 w-3.5 text-indigo-600" />
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">Email Dispatch</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
          <Button variant="outline" size="sm" onClick={onClose} className="font-bold text-xs">
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleDispatch}
            disabled={isSending}
            leftIcon={<Send className="h-4 w-4" />}
            className="font-bold text-xs bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/25"
          >
            {isSending ? 'Dispatching...' : `Dispatch Notice to ${recipient.studentName.split(' ')[0]}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
