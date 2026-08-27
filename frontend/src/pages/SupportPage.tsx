import React, { useState } from 'react';
import { HelpCircle, Search, Plus, ChevronDown, ChevronUp, Ticket, Bot, PhoneCall } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { formatDate } from '../utils/cn';

interface FAQItem {
  id: string;
  category: 'scholarships' | 'grants' | 'documents' | 'disbursement';
  question: string;
  answer: string;
}

interface SupportTicket {
  id: string;
  title: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  date: string;
  description: string;
}

const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'scholarships',
    question: 'How do I check if I meet the eligibility criteria for merit scholarships?',
    answer: 'Each scholarship listing displays an Eligibility Badge (e.g. GPA >= 3.50, STEM Major). You can also click on any scholarship card to view detailed GPA, residency, and unit load requirements.',
  },
  {
    id: 'faq-2',
    category: 'scholarships',
    question: 'Can I apply for multiple scholarships at the same time?',
    answer: 'Yes! You may submit applications for multiple scholarship programs. However, certain institutional grants cannot be combined with full-tuition city scholarships.',
  },
  {
    id: 'faq-3',
    category: 'grants',
    question: 'What are the eligibility criteria for Quezon City continuing education grants?',
    answer: 'Applicants must be bona fide residents of Quezon City, currently enrolled in a recognized tertiary institution, and maintain satisfactory academic standing according to their program guidelines.',
  },
  {
    id: 'faq-4',
    category: 'grants',
    question: 'How do I track my scholarship validation remarks?',
    answer: 'Navigate to your Dashboard or Track Application page to view real-time validation stages, evaluators remarks, and payout schedule updates.',
  },
  {
    id: 'faq-5',
    category: 'documents',
    question: 'What file formats and size limits apply to Document Vault uploads?',
    answer: 'The Document Vault accepts PDF, PNG, and JPG files up to 10 MB per file. All files are encrypted using AES-256 standards upon upload.',
  },
  {
    id: 'faq-6',
    category: 'disbursement',
    question: 'When are scholarship funds disbursed to my account?',
    answer: 'Approved scholarship grants are disbursed according to the official academic calendar directly to your registered payment method (GCash or Bank Account).',
  },
];

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'TCK-9402',
    title: 'Disbursement delay for Dean’s Excellence Grant',
    category: 'Disbursement & Payroll',
    priority: 'High',
    status: 'In Progress',
    date: '2026-08-10',
    description: 'Grant status shows approved, but funds have not reflected on registered GCash account.',
  },
  {
    id: 'TCK-8819',
    title: 'FAFSA transcript verification inquiry',
    category: 'Document Vault',
    priority: 'Medium',
    status: 'Resolved',
    date: '2026-08-04',
    description: 'Submitted 2026 FAFSA transcript needs verification badge update.',
  },
];

export const SupportPage: React.FC = () => {
  const [faqs] = useState<FAQItem[]>(INITIAL_FAQS);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  
  // FAQ Filters & Accordion
  const [faqCategory, setFaqCategory] = useState<string>('all');
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-1');

  // Ticket Modal Form
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Scholarship Eligibility');
  const [ticketPriority, setTicketPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [ticketDesc, setTicketDesc] = useState('');

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCat = faqCategory === 'all' || faq.category === faqCategory;
    const matchesSearch = faq.question.toLowerCase().includes(faqSearch.toLowerCase()) || faq.answer.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle || !ticketDesc) {
      toast.error('Please fill in title and ticket description');
      return;
    }

    const newTicket: SupportTicket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      title: ticketTitle,
      category: ticketCategory,
      priority: ticketPriority,
      status: 'Open',
      date: new Date().toISOString().split('T')[0],
      description: ticketDesc,
    };

    setTickets([newTicket, ...tickets]);
    setShowTicketModal(false);
    setTicketTitle('');
    setTicketDesc('');
    toast.success(`Support Ticket ${newTicket.id} created successfully! Financial Aid team notified.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-border shadow-soft">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-foreground">Support & Knowledge Center</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Search financial aid FAQs, interact with AI assistant, or submit a support ticket to officers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowTicketModal(true)}
            leftIcon={<Plus className="h-4 w-4" />}
            className="font-bold shadow-md shadow-blue-600/20"
          >
            Raise Support Ticket
          </Button>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card hoverEffect className="bg-white border border-slate-200 text-slate-900 shadow-soft">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-heading font-extrabold text-lg text-slate-900">AI Assistant Chat</p>
              <p className="text-xs text-slate-500">Instant automated help 24/7</p>
              <span className="inline-block mt-2 text-[11px] font-bold text-primary underline cursor-pointer">
                Click widget at bottom-right →
              </span>
            </div>
            <Bot className="h-10 w-10 text-primary shrink-0" />
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Financial Aid Office</p>
              <p className="font-heading font-extrabold text-lg text-foreground mt-0.5">Live Desk Support</p>
              <p className="text-[11px] text-slate-500 mt-1">Mon–Fri 8:00 AM – 5:00 PM</p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <PhoneCall className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Active Tickets</p>
              <p className="font-heading font-extrabold text-lg text-foreground mt-0.5">
                {tickets.filter((t) => t.status !== 'Resolved' && t.status !== 'Closed').length} Pending
              </p>
              <p className="text-[11px] text-slate-500 mt-1">{tickets.length} total tickets submitted</p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Ticket className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Knowledge Base FAQs Section */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <CardTitle>Knowledge Base & FAQ Search</CardTitle>
            <CardDescription>Browse verified guides for scholarships, bursaries, grants, and disbursement.</CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary shadow-xs"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {[
                { id: 'all', label: 'All' },
                { id: 'scholarships', label: 'Scholarships' },
                { id: 'grants', label: 'Grants & Bursaries' },
                { id: 'documents', label: 'Documents' },
                { id: 'disbursement', label: 'Disbursement' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFaqCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    faqCategory === tab.id
                      ? 'bg-primary text-white shadow-md border border-transparent font-bold'
                      : 'bg-white text-slate-700 border border-slate-200 shadow-xs hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs">
              No matching FAQ articles found. Try raising a support ticket below.
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="border border-border rounded-2xl overflow-hidden transition-all bg-white hover:border-slate-300"
                >
                  <button
                    onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs text-slate-900 bg-slate-50/50 hover:bg-slate-100/50 transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                      {faq.question}
                    </span>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
                  </button>

                  {isExpanded && (
                    <div className="p-4 pt-2 text-xs text-slate-600 border-t border-border/50 leading-relaxed bg-white">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Support Ticket History */}
      <Card>
        <CardHeader>
          <CardTitle>My Support Tickets</CardTitle>
          <CardDescription>Track status and officer responses for submitted inquiries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase group-label border-b border-border">
                <tr>
                  <th className="p-3">Ticket ID</th>
                  <th className="p-3">Subject Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Submitted</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70">
                    <td className="p-3 font-mono font-bold text-slate-900">{t.id}</td>
                    <td className="p-3 font-semibold text-slate-900">{t.title}</td>
                    <td className="p-3 text-slate-600">{t.category}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          t.priority === 'High'
                            ? 'bg-rose-100 text-rose-700'
                            : t.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{formatDate(t.date)}</td>
                    <td className="p-3 text-right">
                      <Badge
                        variant={t.status === 'Resolved' ? 'success' : t.status === 'In Progress' ? 'warning' : 'info'}
                      >
                        {t.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Modal */}
      {showTicketModal && (
        <Modal
          isOpen={showTicketModal}
          onClose={() => setShowTicketModal(false)}
          title="Raise a Support Ticket"
          description="Submit an inquiry directly to the Financial Aid & Scholarship Office"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setShowTicketModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleCreateTicket} className="font-bold">
                Submit Ticket
              </Button>
            </>
          }
        >
          <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-foreground mb-1">Inquiry Title / Subject</label>
              <input
                type="text"
                placeholder="Brief summary of issue..."
                value={ticketTitle}
                onChange={(e) => setTicketTitle(e.target.value)}
                required
                className="w-full h-10 px-3 bg-white border border-border rounded-xl text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-foreground mb-1">Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-border rounded-xl text-xs focus:outline-none focus:border-primary"
                >
                  <option value="Scholarship Eligibility">Scholarship Eligibility</option>
                  <option value="Grants & Bursaries">Grants & Bursaries</option>
                  <option value="Document Vault">Document Vault</option>
                  <option value="Disbursement & Payroll">Disbursement & Payouts</option>
                  <option value="Technical Issue">Technical / Login Issue</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">Priority Level</label>
                <select
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value as any)}
                  className="w-full h-10 px-3 bg-white border border-border rounded-xl text-xs focus:outline-none focus:border-primary"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">Detailed Description</label>
              <textarea
                rows={4}
                value={ticketDesc}
                onChange={(e) => setTicketDesc(e.target.value)}
                placeholder="Describe your inquiry or technical issue..."
                required
                className="w-full p-3 bg-white border border-border rounded-xl text-xs focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
