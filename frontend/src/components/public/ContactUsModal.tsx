import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { toast } from 'sonner';

interface ContactUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactUsModal: React.FC<ContactUsModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Scholarship Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success('Your message has been sent to QC Youth Development Office!');
      setIsSubmitting(false);
      setName('');
      setEmail('');
      setMessage('');
      onClose();
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Contact QC Youth Development Office (QCYDO)"
      description="Get in touch with the official Quezon City Scholarship Program helpdesk & support officers."
      footer={
        <div className="flex gap-2 w-full justify-between items-center">
          <span className="text-[11px] text-slate-500 font-medium">Hotline: (02) 8988-4242 ext. 8439</span>
          <Button variant="outline" size="sm" onClick={onClose} className="font-bold">
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-6 text-xs">
        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-start gap-3">
            <Phone className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-blue-950 block">Helpline Numbers</span>
              <span className="text-blue-900 font-medium">(02) 8988-4242 ext. 8439 / 8440</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">QC Call Center: 122</span>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-start gap-3">
            <Mail className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-950 block">Email Support</span>
              <span className="text-emerald-900 font-medium">qcydo@quezoncity.gov.ph</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Response within 24-48 hours</span>
            </div>
          </div>

          <div className="p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-2xl flex items-start gap-3 sm:col-span-2">
            <MapPin className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-purple-950 block">Office Location</span>
              <span className="text-purple-900 font-medium">QC Youth Development Office, 4th Floor, Civic Center Building A, QC City Hall Complex, Elliptical Road, Diliman, Quezon City</span>
            </div>
          </div>
        </div>

        {/* Send Inquiry Form */}
        <form onSubmit={handleSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
            <Send className="h-4 w-4 text-blue-600" /> Send Direct Inquiry Message
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              id="contact-name"
              label="Full Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Juan Dela Cruz"
              required
            />
            <Input
              id="contact-email"
              label="Email Address *"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. juan@example.com"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-800 text-[11px]">Subject / Topic</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full h-9 px-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-xs"
            >
              <option value="Scholarship Inquiry">Scholarship Inquiry & Status</option>
              <option value="Document Requirement">Document Vault & Requirements</option>
              <option value="Disbursement Status">Stipend & Electronic Disbursement</option>
              <option value="Educational Grants">Educational Grants & Bursaries</option>
              <option value="Other Concerns">Other Concerns</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-800 text-[11px]">Message Details *</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your inquiry or question here..."
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 resize-none text-xs"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            rightIcon={<Send className="h-3.5 w-3.5" />}
            className="w-full font-bold bg-blue-600 hover:bg-blue-700 text-white py-2.5"
          >
            Send Inquiry to QCYDO
          </Button>
        </form>
      </div>
    </Modal>
  );
};
