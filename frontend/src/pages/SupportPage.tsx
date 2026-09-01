import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Search, Plus, ChevronDown, ChevronUp, Ticket, Bot, PhoneCall, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/cn';
import { createTicket, getTickets } from '../api/tickets';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  roleScope?: string;
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

const ALL_ROLE_FAQS: FAQItem[] = [
  // Student FAQs
  {
    id: 'faq-std-1',
    category: 'scholarships',
    roleScope: 'student',
    question: 'How do I check if I meet the eligibility criteria for merit scholarships?',
    answer: 'Each scholarship listing displays an Eligibility Badge (e.g. GWA <= 2.50, STEM Major). You can also click on any scholarship card to view detailed GPA, residency, and unit load requirements.',
  },
  {
    id: 'faq-std-2',
    category: 'documents',
    roleScope: 'student',
    question: 'What file formats and size limits apply to Document Vault uploads?',
    answer: 'The Document Vault accepts PDF, PNG, and JPG files up to 10 MB per file. All files are encrypted using AES-256 standards upon upload.',
  },
  {
    id: 'faq-std-3',
    category: 'disbursement',
    roleScope: 'student',
    question: 'When are scholarship funds disbursed to my account?',
    answer: 'Approved scholarship grants are disbursed according to the official academic calendar directly to your registered payment method (GCash or Landbank ATM Account).',
  },

  // School Coordinator FAQs
  {
    id: 'faq-coor-1',
    category: 'registrar_csv',
    roleScope: 'school_coordinator',
    question: 'How do I upload and parse a batch enrollment CSV in the Batch Verification Hub?',
    answer: 'Navigate to Batch Verification, download the official .csv template, paste your university registrar matriculation roster, and drag-and-drop the file into the upload zone. The system automatically cross-audits unit loads and semestral GWA.',
  },
  {
    id: 'faq-coor-2',
    category: 'academic_retention',
    roleScope: 'school_coordinator',
    question: 'What retention threshold does the system enforce for Tertiary Merit Scholarships?',
    answer: 'Tertiary Merit scholars must maintain a minimum cumulative GWA of 2.50 with at least 15 enrolled academic units. Scholars with GWA > 2.50 are automatically flagged as GWA Deficient for counseling.',
  },
  {
    id: 'faq-coor-3',
    category: 'coordinator_tools',
    roleScope: 'school_coordinator',
    question: 'How do I inspect original COR and TOR documentary attachments before endorsing?',
    answer: 'Click "Inspect COR & TOR" on any student record. The Document Viewer allows side-by-side comparison of system data against the university registrar official stamp and watermark.',
  },
  {
    id: 'faq-coor-4',
    category: 'coordinator_tools',
    roleScope: 'school_coordinator',
    question: 'How does endorsing a scholar update the QCYDO Admin review queue?',
    answer: 'Clicking "Endorse to Admin" flags the record as School Endorsed and pushes it directly into the QCYDO Scholarship Admin approval queue with full audit history.',
  },

  // Treasury FAQs
  {
    id: 'faq-tre-1',
    category: 'reconciliation',
    roleScope: 'treasury',
    question: 'How does the automated Treasury Reconciliation matching engine work?',
    answer: 'The reconciliation module cross-references QCYDO approved grant amounts against bank payout transaction files using reference hashing. Any discrepancy or bank fee is flagged for manual review.',
  },
  {
    id: 'faq-tre-2',
    category: 'banking_channels',
    roleScope: 'treasury',
    question: 'What is the procedure for failed GCash e-wallet disbursements?',
    answer: 'Failed or bounced e-wallet disbursements are categorized as "Uncredited". The Treasury officer can click "Re-queue Payout" or switch the beneficiary channel to Landbank Over-the-Counter.',
  },
  {
    id: 'faq-tre-3',
    category: 'audit_compliance',
    roleScope: 'treasury',
    question: 'How do I generate liquidation certificates for Commission on Audit (COA) compliance?',
    answer: 'Under Treasury Reports, select the term budget pool (e.g. QCSP Fund 2026) and click "Export COA Liquidation Voucher" to produce an audited PDF ledger with disbursement checksums.',
  },
];

export const SupportPage: React.FC = () => {
  const { user } = useAuth();
  
  // Role-filtered initial tickets
  const getInitialTickets = (): SupportTicket[] => {
    if (user?.role === 'school_coordinator') {
      return [
        {
          id: 'TCK-COOR-101',
          title: 'Registrar Batch CSV Column Format Validation',
          category: 'Registrar CSV Upload',
          priority: 'Medium',
          status: 'Resolved',
          date: '2026-08-20',
          description: 'Clarified header formatting requirements for enrolled subjects matrix.',
        },
        {
          id: 'TCK-COOR-102',
          title: 'Graduating Senior Underload Waiver Clearance',
          category: 'Academic Retention Waiver',
          priority: 'High',
          status: 'In Progress',
          date: '2026-08-24',
          description: 'Special exemption review for Accountancy senior enrolled in 12 units.',
        },
      ];
    }
    if (user?.role === 'treasury') {
      return [
        {
          id: 'TCK-TRE-201',
          title: 'Landbank ATM Batch #089 Reference Hash Mismatch',
          category: 'Bank Reconciliation',
          priority: 'High',
          status: 'In Progress',
          date: '2026-08-22',
          description: 'Bank clearing reference mismatch on 2 transaction line items.',
        },
        {
          id: 'TCK-TRE-202',
          title: 'GCash Corporate API Webhook Disbursement Status',
          category: 'E-Wallet Disbursement',
          priority: 'Medium',
          status: 'Resolved',
          date: '2026-08-18',
          description: 'Confirmed settlement for 150 student digital cash vouchers.',
        },
      ];
    }
    return [
      {
        id: 'TCK-9402',
        title: 'Disbursement inquiry for Tertiary Merit Scholarship',
        category: 'Disbursement & Payout',
        priority: 'High',
        status: 'In Progress',
        date: '2026-08-10',
        description: 'Grant status shows approved, inquiring about official ATM card release date.',
      },
      {
        id: 'TCK-8819',
        title: 'Document Vault COR upload status check',
        category: 'Document Vault',
        priority: 'Medium',
        status: 'Resolved',
        date: '2026-08-04',
        description: 'Submitted 2026 Certificate of Registration verified by school registrar.',
      },
    ];
  };

  const [tickets, setTickets] = useState<SupportTicket[]>(getInitialTickets());

  useEffect(() => {
    const fetchDbTickets = async () => {
      try {
        const res = await getTickets();
        if (res.data?.data && res.data.data.length > 0) {
          const mapped: SupportTicket[] = res.data.data.map((t) => ({
            id: t.ticket_code,
            title: t.subject,
            category: t.category,
            priority: (t.priority as any) || 'Medium',
            status: (t.status as any) || 'Open',
            date: t.created_at ? t.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            description: t.description,
          }));
          setTickets(mapped);
        }
      } catch (err) {
        console.warn('Failed to load tickets from API:', err);
      }
    };
    fetchDbTickets();
  }, [user]);

  const [faqCategory, setFaqCategory] = useState<string>('all');
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  // Ticket Modal Form
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketCategory, setTicketCategory] = useState(
    user?.role === 'school_coordinator'
      ? 'Registrar CSV Upload'
      : user?.role === 'treasury'
      ? 'Bank Reconciliation'
      : 'Scholarship Eligibility'
  );
  const [ticketPriority, setTicketPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [ticketDesc, setTicketDesc] = useState('');

  // Filter FAQs according to current user role and active tab category
  const filteredFaqs = ALL_ROLE_FAQS.filter((faq) => {
    if (user?.role === 'school_coordinator' && faq.roleScope !== 'school_coordinator') return false;
    if (user?.role === 'treasury' && faq.roleScope !== 'treasury') return false;
    if (user?.role === 'student' && faq.roleScope !== 'student') return false;

    const matchesCategory = faqCategory === 'all' || faq.category === faqCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.answer.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle || !ticketDesc) {
      toast.error('Please fill in title and ticket description');
      return;
    }

    try {
      const res = await createTicket({
        subject: ticketTitle,
        category: ticketCategory,
        priority: ticketPriority as any,
        description: ticketDesc,
        applicant_name: user?.name,
        applicant_email: user?.email,
      });

      if (res.data?.data) {
        const created = res.data.data;
        const newTicket: SupportTicket = {
          id: created.ticket_code,
          title: created.subject,
          category: created.category,
          priority: created.priority as any,
          status: created.status as any,
          date: created.created_at.split('T')[0],
          description: created.description,
        };
        setTickets([newTicket, ...tickets]);
        setShowTicketModal(false);
        setTicketTitle('');
        setTicketDesc('');
        toast.success(`Support Ticket #${created.ticket_code} created successfully! You can track and converse with officers in the Messages Center.`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit ticket');
    }
  };

  const getBackNav = () => {
    switch (user?.role) {
      case 'student':
        return { label: 'Student Dashboard', path: '/dashboard' };
      case 'school_coordinator':
        return { label: 'Coordinator Portal', path: '/school/portal' };
      case 'admin':
      case 'system_admin':
        return { label: 'Admin Dashboard', path: '/admin/dashboard' };
      case 'supervisor':
        return { label: 'Supervisor Portal', path: '/supervisor/evaluations' };
      case 'treasury':
        return { label: 'Treasury Portal', path: '/treasury/budget' };
      default:
        return { label: 'E-SCHOLAR Hub', path: '/e-scholar' };
    }
  };
  const backNav = getBackNav();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          {/* Breadcrumb Navigation Matching Exact Design */}
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              to={backNav.path}
              className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {backNav.label}
            </Link>
            <span className="text-slate-400 text-xs">/</span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Support & Helpdesk Tickets</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-slate-900 dark:text-white">Support & Knowledge Center</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
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
        <Card hoverEffect className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-soft">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">AI Assistant Chat</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Instant automated help 24/7</p>
              <span className="inline-block mt-2 text-[11px] font-bold text-blue-600 dark:text-blue-400 underline cursor-pointer">
                Click widget at bottom-right →
              </span>
            </div>
            <Bot className="h-10 w-10 text-blue-600 dark:text-blue-400 shrink-0" />
          </CardContent>
        </Card>

        <Card hoverEffect className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Financial Aid Office</p>
              <p className="font-heading font-extrabold text-lg text-slate-900 dark:text-white mt-0.5">Live Desk Support</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Mon–Fri 8:00 AM – 5:00 PM</p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
              <PhoneCall className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Tickets</p>
              <p className="font-heading font-extrabold text-lg text-slate-900 dark:text-white mt-0.5">
                {tickets.filter((t) => t.status !== 'Resolved' && t.status !== 'Closed').length} Pending
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{tickets.length} total tickets submitted</p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
              <Ticket className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Knowledge Base FAQs Section */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <CardTitle className="text-slate-900 dark:text-white">Knowledge Base & FAQ Search</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">Browse verified guides for scholarships, bursaries, grants, and disbursement.</CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-blue-600 shadow-xs placeholder:text-slate-400 font-medium"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {(user?.role === 'school_coordinator'
                ? [
                    { id: 'all', label: 'All Topics' },
                    { id: 'registrar_csv', label: 'Registrar CSV' },
                    { id: 'academic_retention', label: 'Retention & GWA' },
                    { id: 'coordinator_tools', label: 'Endorsement Tools' },
                  ]
                : user?.role === 'treasury'
                ? [
                    { id: 'all', label: 'All Topics' },
                    { id: 'reconciliation', label: 'Reconciliation' },
                    { id: 'banking_channels', label: 'Bank & GCash' },
                    { id: 'audit_compliance', label: 'COA Audit' },
                  ]
                : [
                    { id: 'all', label: 'All Topics' },
                    { id: 'scholarships', label: 'Scholarships' },
                    { id: 'documents', label: 'Documents' },
                    { id: 'disbursement', label: 'Disbursement' },
                  ]
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFaqCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    faqCategory === tab.id
                      ? 'bg-blue-600 text-white shadow-md border border-transparent font-bold'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700'
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
            <div className="p-8 text-center text-slate-400 text-xs">
              No matching FAQ articles found. Try raising a support ticket below.
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <button
                    onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/60 hover:bg-slate-100/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      {faq.question}
                    </span>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
                  </button>

                  {isExpanded && (
                    <div className="p-4 pt-3 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 leading-relaxed bg-white dark:bg-slate-900/90 font-medium">
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
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <CardTitle className="text-slate-900 dark:text-white">My Support Tickets</CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">Track status and officer responses for submitted inquiries</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase group-label border-b border-slate-200 dark:border-slate-700 font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Ticket ID</th>
                  <th className="p-3.5">Subject Title</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Submitted</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">{t.id}</td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{t.title}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">{t.category}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          t.priority === 'High'
                            ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : t.priority === 'Medium'
                            ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-400">{formatDate(t.date)}</td>
                    <td className="p-3.5 text-right">
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
              <label className="block font-bold text-slate-900 dark:text-white mb-1">Inquiry Title / Subject</label>
              <input
                type="text"
                placeholder="Brief summary of issue..."
                value={ticketTitle}
                onChange={(e) => setTicketTitle(e.target.value)}
                required
                className="w-full h-10 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:border-blue-600 placeholder:text-slate-400 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-900 dark:text-white mb-1">Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full h-10 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-xs focus:outline-none focus:border-blue-600 font-medium"
                >
                  <option value="Scholarship Eligibility" className="dark:bg-slate-900 dark:text-white">Scholarship Eligibility</option>
                  <option value="Grants & Bursaries" className="dark:bg-slate-900 dark:text-white">Grants & Bursaries</option>
                  <option value="Document Vault" className="dark:bg-slate-900 dark:text-white">Document Vault</option>
                  <option value="Disbursement & Payroll" className="dark:bg-slate-900 dark:text-white">Disbursement & Payouts</option>
                  <option value="Technical Issue" className="dark:bg-slate-900 dark:text-white">Technical / Login Issue</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-900 dark:text-white mb-1">Priority Level</label>
                <select
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value as any)}
                  className="w-full h-10 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-xs focus:outline-none focus:border-blue-600 font-medium"
                >
                  <option value="Low" className="dark:bg-slate-900 dark:text-white">Low Priority</option>
                  <option value="Medium" className="dark:bg-slate-900 dark:text-white">Medium Priority</option>
                  <option value="High" className="dark:bg-slate-900 dark:text-white">High Priority</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-900 dark:text-white mb-1">Detailed Description</label>
              <textarea
                rows={4}
                value={ticketDesc}
                onChange={(e) => setTicketDesc(e.target.value)}
                placeholder="Describe your inquiry or technical issue..."
                required
                className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:border-blue-600 resize-none placeholder:text-slate-400 font-medium"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
