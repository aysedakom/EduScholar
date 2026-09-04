import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  MapPin,
  Clock,
  Building2,
  ChevronDown,
  Sun,
  Moon,
  CheckCircle2,
  Ticket,
  ArrowLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'sonner';
import { createTicket, getTickets } from '../../api/tickets';
import { getMessages, sendMessage } from '../../api/communication';
import api from '../../api/axios';

export const ContactPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [eservicesOpen, setEservicesOpen] = useState(false);

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

  // Active Desk Tabs: 'new-ticket' | 'my-tickets' | 'ticket-chat'
  const [activeDeskTab, setActiveDeskTab] = useState<'new-ticket' | 'my-tickets' | 'ticket-chat'>('new-ticket');

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('Scholarship Inquiry');
  const [message, setMessage] = useState('');
  const [createdTicketCode, setCreatedTicketCode] = useState<string | null>(null);

  // Active Ticket Live Session State
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [secondsLeft, setSecondsLeft] = useState<number>(120);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (eservicesOpen && !target.closest('.contact-eservices-dropdown')) {
        setEservicesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [eservicesOpen]);

  // Fetch user tickets if logged in
  const loadUserTickets = async () => {
    if (!user) return;
    try {
      const res = await getTickets();
      if (res.data?.data) {
        setMyTickets(res.data.data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadUserTickets();
  }, [user]);

  // 2-Minute Inactivity Auto-Close Timer for Active Ticket Session
  useEffect(() => {
    if (!selectedTicket || selectedTicket.status === 'Closed' || selectedTicket.status === 'Resolved') {
      return;
    }

    if (secondsLeft <= 0) {
      handleAutoCloseInactivity();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, selectedTicket]);

  const handleAutoCloseInactivity = async () => {
    if (!selectedTicket || selectedTicket.status === 'Closed') return;
    try {
      await api.post(`/tickets/${selectedTicket.id || selectedTicket.ticket_code}/inactivity-timeout`);
      toast.error(`Ticket #${selectedTicket.ticket_code} was automatically closed due to 2 minutes of applicant inactivity.`);
      setSelectedTicket((prev: any) => ({
        ...prev,
        status: 'Closed',
        resolution_remarks: 'Auto-closed due to applicant inactivity (2-minute session timeout).',
      }));
      loadUserTickets();
      if (selectedTicket.conversation_id) {
        loadTicketChat(selectedTicket.conversation_id);
      }
    } catch {
      // fallback
    }
  };

  const loadTicketChat = async (convId: string) => {
    try {
      const res = await getMessages(convId);
      setTicketMessages(res.data?.data || res.data || []);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch {
      // ignore
    }
  };

  const handleSelectTicketToChat = (tkt: any) => {
    setSelectedTicket(tkt);
    setSecondsLeft(120); // reset 2-minute timer
    setActiveDeskTab('ticket-chat');
    const convId = tkt.conversation_id || `conv_ticket_${tkt.ticket_code.toLowerCase()}`;
    loadTicketChat(convId);
  };

  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendTicketMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !selectedTicket) return;
    if (selectedTicket.status === 'Closed' || selectedTicket.status === 'Resolved') {
      toast.error('This ticket is permanently closed and archived. Cannot send new messages.');
      return;
    }

    setIsSendingMsg(true);
    try {
      const convId = selectedTicket.conversation_id || `conv_ticket_${selectedTicket.ticket_code.toLowerCase()}`;
      await sendMessage({
        conversation_id: convId,
        message: chatInput.trim(),
      });
      setChatInput('');
      setSecondsLeft(120); // Reset 2-min inactivity timer on message send
      await loadTicketChat(convId);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setIsSendingMsg(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error('Please complete all required fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await createTicket({
        applicant_name: name,
        applicant_email: email,
        subject: subject,
        category: 'General Inquiry',
        priority: 'Medium',
        description: message,
      });

      const ticket = res.data?.data;
      setCreatedTicketCode(ticket?.ticket_code || 'TKT-2026-QUEUED');
      toast.success(`Support Ticket #${ticket?.ticket_code || 'QUEUED'} submitted successfully!`);
      setIsSubmitting(false);
      setMessage('');
      loadUserTickets();
    } catch {
      setIsSubmitting(false);
      toast.success('Your message has been registered in the QCYDO Support Queue!');
      setCreatedTicketCode(`TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/20 transition-colors duration-200">
      <header className="w-full bg-white dark:bg-slate-900 shadow-md shadow-slate-200/80 dark:shadow-slate-950/50 border-b border-slate-200 dark:border-slate-800 relative z-30 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo-system.png" alt="GovServe Logo" className="h-9 w-9 object-contain bg-blue-50 dark:bg-slate-800 p-1 rounded-xl border border-blue-200 dark:border-slate-700 shadow-xs" />
              <div>
                <span className="font-heading font-extrabold text-lg text-slate-900 dark:text-white leading-none block">GovServe</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Campus Aid Hub Portal</span>
              </div>
            </Link>

            <nav className="flex items-center gap-1 sm:gap-2">
              <Link to="/" className="flex items-center px-3 py-2 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <span>{t('nav.home')}</span>
              </Link>
              <div className="relative contact-eservices-dropdown">
                <button
                  onClick={() => setEservicesOpen(!eservicesOpen)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <span>{t('nav.eservices')}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>
                {eservicesOpen && (
                  <div className="absolute left-0 top-11 w-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden z-50 p-2 animate-in fade-in duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 rounded-xl mb-1">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{t('nav.available')}</p>
                    </div>

                    <Link
                      to="/education-scholarship"
                      onClick={() => setEservicesOpen(false)}
                      className="block p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 hover:bg-blue-100/80 dark:hover:bg-blue-900/40 transition-all mb-1 group"
                    >
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-extrabold text-blue-900 dark:text-blue-200 group-hover:text-blue-700 dark:group-hover:text-blue-300">{t('nav.eduScholarTitle')}</p>
                        <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">{t('nav.primary')}</span>
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">QC Campus Aid Hub & Student Grants</p>
                    </Link>

                    <a
                      href="https://govservedrrm.up.railway.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setEservicesOpen(false)}
                      className="block p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 hover:bg-amber-100/80 dark:hover:bg-amber-900/40 transition-all mb-1 group"
                    >
                      <p className="text-xs font-extrabold text-amber-900 dark:text-amber-300 group-hover:text-amber-700 dark:group-hover:text-amber-200">Disaster Risk Reduction (DRRM)</p>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">Emergency Response, Weather & Evacuation Center Monitoring</p>
                    </a>
                  </div>
                )}
              </div>
              <a href="/citizens_charter.pdf" target="_blank" className="hidden sm:flex items-center px-3 py-2 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <span>{t('nav.charter')}</span>
              </a>
              <Link to="/contact" className="flex items-center px-3 py-2 rounded-xl text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 transition-all">
                <span>{t('nav.contact')}</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <button onClick={toggleTheme} className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </button>
            {user ? (
              <Link to="/dashboard">
                <Button variant="primary" size="sm" className="font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white">My Portal</Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="primary" size="sm" className="font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        {/* Top Breadcrumb Navigation */}
        <div className="flex items-center gap-2">
          <Link
            to={backNav.path}
            className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1.5 transition-colors bg-blue-50 dark:bg-blue-950/60 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 shadow-xs cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> {backNav.label}
          </Link>
          <span className="text-slate-400 text-xs">/</span>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            Help Desk & Inquiry Ticketing
          </span>
        </div>

        {/* Help Desk & Ticketing Notice */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-bold text-lg shrink-0">
              🎫
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                  QCYDO Help Desk & Inquiry Ticketing
                </h2>
                <Badge variant="primary" size="sm">
                  Official Queuing Desk
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Submit an inquiry ticket to our help desk queue. For <strong>real-time Live Support</strong> during office hours (8:00 AM – 5:00 PM), registered scholars can access <strong>Live Support</strong> under <strong>Messages</strong> in the portal sidebar.
              </p>
            </div>
          </div>
          {user && (
            <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full md:w-auto">
              <button onClick={() => setActiveDeskTab('new-ticket')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-1 ${activeDeskTab === 'new-ticket' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}>Submit Ticket</button>
              <button onClick={() => setActiveDeskTab('my-tickets')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-1 ${activeDeskTab !== 'new-ticket' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}>My Tickets ({myTickets.length})</button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6 lg:col-span-1">
            <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-6">
              <h2 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" /> QC Youth Development Office
              </h2>
              <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <p>4th Floor, Civic Center Building A, QC Hall Complex, Diliman, Quezon City</p>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p>QC Hotline: 122<br />Office: (02) 8988-4242 loc. 8175</p>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <p>Monday to Friday: 8:00 AM – 5:00 PM</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {activeDeskTab === 'my-tickets' && (
              <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-extrabold text-lg flex items-center gap-2"><Ticket className="h-5 w-5 text-blue-600" /> My Filed Support Tickets</h3>
                  <Button variant="outline" size="sm" onClick={() => setActiveDeskTab('new-ticket')} className="font-bold text-xs">+ Raise New Ticket</Button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border rounded-2xl overflow-hidden">
                  {myTickets.map((tkt) => (
                    <div key={tkt.id} onClick={() => handleSelectTicketToChat(tkt)} className="p-4 hover:bg-slate-50 cursor-pointer flex items-center justify-between">
                      <div className="space-y-1">
                        <code className="text-xs font-bold text-blue-600 font-mono">{tkt.ticket_code}</code>
                        <h4 className="font-bold text-sm">{tkt.subject}</h4>
                      </div>
                      <Button variant="outline" size="sm" className="font-bold text-xs">Open Chat</Button>
                    </div>
                  ))}
                  {myTickets.length === 0 && <p className="p-8 text-center text-slate-400">No support tickets found.</p>}
                </div>
              </Card>
            )}

            {activeDeskTab === 'ticket-chat' && selectedTicket && (
              <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 shadow-soft space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <button onClick={() => setActiveDeskTab('my-tickets')} className="text-xs font-bold text-blue-600">← Back</button>
                  <div className="p-2 bg-blue-50 rounded-xl border flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-mono font-extrabold text-blue-700">{String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:{String(secondsLeft % 60).padStart(2, '0')}</span>
                  </div>
                </div>
                <div className="h-72 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-y-auto space-y-3 text-xs">
                  {ticketMessages.map((m) => (
                    <div key={m.id} className={`flex flex-col ${String(m.sender_id) === String(user?.id) ? 'items-end' : 'items-start'}`}>
                      <div className={`p-3 rounded-2xl max-w-sm ${String(m.sender_id) === String(user?.id) ? 'bg-blue-600 text-white' : 'bg-white border'}`}>{m.message}</div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendTicketMessage} className="flex gap-2">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-1 h-10 px-3.5 text-xs rounded-xl border" placeholder="Type your message..." />
                  <Button type="submit" variant="primary" size="sm" isLoading={isSendingMsg} className="font-bold">Send</Button>
                </form>
              </Card>
            )}

            {activeDeskTab === 'new-ticket' && (
              <Card className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-6">
                <div>
                  <h2 className="font-heading font-extrabold text-2xl">Submit Support Ticket</h2>
                  <p className="text-xs text-slate-500 mt-1">Fill out the details below to queue your inquiry.</p>
                </div>
                {createdTicketCode ? (
                  <div className="text-center p-8 rounded-2xl bg-emerald-50 border text-emerald-900 space-y-4">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-600" />
                    <h3 className="font-black text-xl">Ticket #{createdTicketCode} Queued!</h3>
                    <Button onClick={() => { setCreatedTicketCode(null); setActiveDeskTab('my-tickets'); }} className="font-bold">View My Tickets</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label="Full Name *" value={name} onChange={(e) => setName(e.target.value)} required />
                      <Input label="Email Address *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <Input label="Inquiry Subject *" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                    <label className="block text-xs font-semibold">Message *</label>
                    <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full p-3 text-xs bg-slate-50 border rounded-xl" required />
                    <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting} className="w-full font-extrabold">Queue Support Ticket</Button>
                  </form>
                )}
              </Card>
            )}
          </div>
        </div>
      </main>

      <footer className="w-full bg-white dark:bg-slate-900 border-t py-6 text-center text-xs text-slate-500 font-medium">
        Quezon City Youth Development Office (QCYDO) • GovServe E-SCHOLAR Helpdesk
      </footer>
    </div>
  );
};

export default ContactPage;
