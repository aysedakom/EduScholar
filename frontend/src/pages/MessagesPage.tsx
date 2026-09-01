// frontend/src/pages/MessagesPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Send,
  Search,
  Megaphone,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  RefreshCw,
  Ticket,
  CheckCircle2,
  Lock,
  Clock,
  Archive,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/cn';
import {
  getAnnouncements,
  createAnnouncement,
  getConversations,
  getMessages,
  sendMessage,
  type AnnouncementItem,
  type ConversationThread,
  type ChatMessageItem,
} from '../api/communication';
import { createTicket, closeTicket, updateTicketStatus } from '../api/tickets';
import api from '../api/axios';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const isAdminOrStaff = user?.role !== 'student';

  // Announcements State
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [targetGroup, setTargetGroup] = useState('All Students');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [annMessage, setAnnMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Conversations & Chat State
  const [conversations, setConversations] = useState<ConversationThread[]>([]);
  const [selectedConv, setSelectedConv] = useState<ConversationThread | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'tickets' | 'open' | 'closed'>('all');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [ticketSecondsLeft, setTicketSecondsLeft] = useState<number>(120);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Raise Ticket Modal State
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Application Verification');
  const [ticketPriority, setTicketPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [ticketDesc, setTicketDesc] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  // Close Ticket Modal State (Admin)
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [isClosingTicket, setIsClosingTicket] = useState(false);

  // Auto scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load announcements
  const loadAnnouncements = async () => {
    try {
      const res = await getAnnouncements();
      if (res.data?.data) {
        setAnnouncements(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load announcements:', err);
    }
  };

  // Load conversation threads
  const loadConversations = async (autoSelectFirst = false) => {
    try {
      const res = await getConversations();
      const threads = res.data?.data || [];
      setConversations(threads);
      if (threads.length > 0) {
        if (autoSelectFirst || !selectedConv) {
          setSelectedConv(threads[0]);
        } else {
          const updated = threads.find((c) => c.conversation_id === selectedConv.conversation_id);
          if (updated) setSelectedConv(updated);
        }
      }
    } catch (err) {
      console.warn('Failed to load conversations:', err);
    }
  };

  // Load messages for the selected thread
  const loadMessagesForSelected = async (convId: string) => {
    setIsLoadingMessages(true);
    try {
      const res = await getMessages(convId);
      if (res.data?.data && res.data.data.length > 0) {
        setMessages(res.data.data);
      } else {
        setMessages([
          {
            id: 1,
            conversation_id: convId,
            sender_id: 99,
            sender_name: selectedConv?.participant_name || 'Officer',
            sender_role: selectedConv?.participant_role || 'staff',
            message: selectedConv?.is_ticket
              ? `[Ticket #${selectedConv.ticket_code}] ${selectedConv.ticket_subject || 'Inquiry'}\nCategory: ${selectedConv.ticket_category || 'General'}\n\nOur financial aid desk has received your ticket and is reviewing it.`
              : 'Welcome to the official communication channel.',
            is_read: true,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadAnnouncements();
    loadConversations(true);
  }, [user]);

  // 2-Minute Inactivity Auto-Close Timer for Active Live Support Ticket Session
  useEffect(() => {
    setTicketSecondsLeft(120);
  }, [selectedConv?.conversation_id]);

  useEffect(() => {
    if (!selectedConv?.is_ticket || selectedConv?.ticket_status === 'Closed') {
      return;
    }

    if (ticketSecondsLeft <= 0) {
      handleLiveTicketInactivityTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTicketSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [ticketSecondsLeft, selectedConv]);

  const handleLiveTicketInactivityTimeout = async () => {
    if (!selectedConv?.ticket_id || selectedConv?.ticket_status === 'Closed') return;
    try {
      await api.post(`/tickets/${selectedConv.ticket_id}/inactivity-timeout`);
      toast.error(`Ticket #${selectedConv.ticket_code} auto-closed due to 2 minutes of applicant inactivity and moved to Archives.`);
      setSelectedConv((prev) =>
        prev
          ? {
              ...prev,
              ticket_status: 'Closed',
              status: 'Closed',
              resolution_remarks: 'Auto-closed due to applicant inactivity (2-minute session timeout).',
            }
          : null
      );
      loadConversations(false);
    } catch {
      // fallback
    }
  };

  // When selected conversation changes, load messages
  useEffect(() => {
    if (selectedConv) {
      loadMessagesForSelected(selectedConv.conversation_id);
    }
  }, [selectedConv?.conversation_id]);

  // Periodic poll for real-time messages
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedConv) {
        getMessages(selectedConv.conversation_id).then((res) => {
          if (res.data?.data && res.data.data.length !== messages.length) {
            setMessages(res.data.data);
          }
        }).catch(() => {});
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedConv?.conversation_id, messages.length]);

  // Send Direct Message
  const handleSendDirectMessage = async () => {
    if (!messageInput.trim() || !selectedConv || isSending) return;

    const currentText = messageInput.trim();
    setMessageInput('');
    setIsSending(true);

    const optimisticMsg: ChatMessageItem = {
      id: Date.now(),
      conversation_id: selectedConv.conversation_id,
      sender_id: user?.id ? Number(user.id) : 0,
      sender_name: user?.name || 'You',
      sender_role: (user?.role as any) || 'student',
      message: currentText,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await sendMessage({
        conversation_id: selectedConv.conversation_id,
        message: currentText,
        recipient_id: selectedConv.participant_id,
      });

      if (res && res.data) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? res.data.data : m))
        );
      }
      loadConversations(false);
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Could not send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Handler: Student creates a new Support Ticket
  const handleCreateTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDesc.trim()) {
      toast.error('Please enter a ticket subject and inquiry description');
      return;
    }

    setIsSubmittingTicket(true);
    try {
      const res = await createTicket({
        subject: ticketSubject.trim(),
        category: ticketCategory,
        priority: ticketPriority,
        description: ticketDesc.trim(),
        applicant_name: user?.name,
        applicant_email: user?.email,
      });

      if (res.data?.data) {
        const createdTkt = res.data.data;
        toast.success(`Support Ticket #${createdTkt.ticket_code} created successfully! Our team has been notified.`);
        setShowNewTicketModal(false);
        setTicketSubject('');
        setTicketDesc('');
        setTicketPriority('Medium');
        
        const resConvs = await getConversations();
        const updatedThreads = resConvs.data?.data || [];
        setConversations(updatedThreads);
        const createdThread = updatedThreads.find(
          (c) => c.ticket_code === createdTkt.ticket_code || c.conversation_id === createdTkt.conversation_id
        );
        if (createdThread) {
          setSelectedConv(createdThread);
          loadMessagesForSelected(createdThread.conversation_id);
        }
      }
    } catch (err: any) {
      console.error('Failed to create ticket:', err);
      toast.error(err.response?.data?.message || 'Failed to submit ticket. Please try again.');
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  // Handler: Admin closes the selected Support Ticket
  const handleCloseTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConv?.ticket_id) return;

    setIsClosingTicket(true);
    try {
      const res = await closeTicket(selectedConv.ticket_id, {
        resolutionRemarks: resolutionRemarks.trim() || 'Inquiry addressed and verified by administrator.',
      });

      if (res.data?.data) {
        toast.success(`Ticket #${selectedConv.ticket_code} successfully CLOSED!`);
        setShowCloseModal(false);
        setResolutionRemarks('');
        
        // Update selectedConv state immediately
        setSelectedConv((prev) =>
          prev
            ? {
                ...prev,
                ticket_status: 'Closed',
                status: 'Closed',
                resolution_remarks: res.data.data.resolution_remarks,
              }
            : null
        );
        loadConversations(false);
        if (selectedConv.conversation_id) {
          loadMessagesForSelected(selectedConv.conversation_id);
        }
      }
    } catch (err: any) {
      console.error('Failed to close ticket:', err);
      toast.error(err.response?.data?.message || 'Failed to close ticket');
    } finally {
      setIsClosingTicket(false);
    }
  };

  // Handler: Admin quick update status
  const handleQuickStatusChange = async (newStatus: 'Open' | 'In Progress' | 'Resolved' | 'Closed') => {
    if (!selectedConv?.ticket_id) return;
    if (newStatus === 'Closed') {
      setShowCloseModal(true);
      return;
    }

    try {
      const res = await updateTicketStatus(selectedConv.ticket_id, {
        status: newStatus,
        resolutionRemarks: `Status updated to ${newStatus}`,
      });

      if (res.data?.data) {
        toast.success(`Ticket #${selectedConv.ticket_code} status updated to ${newStatus}`);
        setSelectedConv((prev) => (prev ? { ...prev, ticket_status: newStatus, status: `Ticket ${newStatus}` } : null));
        loadConversations(false);
      }
    } catch (err: any) {
      toast.error('Failed to update ticket status');
    }
  };

  // Create Announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) {
      toast.error('Please enter announcement title and message content');
      return;
    }

    setIsBroadcasting(true);
    try {
      const res = await createAnnouncement({
        title: annTitle.trim(),
        target_group: targetGroup,
        message: annMessage.trim(),
        priority: priority,
        sent_by: `${user?.name || 'Admin'} (QCYDO Desk)`,
      });

      if (res.data) {
        toast.success(`Announcement broadcasted to ${targetGroup}!`);
        setShowBulkModal(false);
        setAnnTitle('');
        setAnnMessage('');
        setPriority('normal');
        loadAnnouncements();
      }
    } catch (err) {
      console.error('Failed to broadcast announcement:', err);
      toast.error('Failed to broadcast announcement');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const isScholarshipAdmin = user?.role === 'admin' || user?.role === 'system_admin';
  const isTreasury = user?.role === 'treasury';
  const isSupervisor = user?.role === 'supervisor';
  const isSchoolCoordinator = user?.role === 'school_coordinator';
  const isStudent = user?.role === 'student';

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

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.participant_name.toLowerCase().includes(q) ||
      (c.student_id && c.student_id.toLowerCase().includes(q)) ||
      (c.ticket_code && c.ticket_code.toLowerCase().includes(q)) ||
      (c.ticket_subject && c.ticket_subject.toLowerCase().includes(q)) ||
      c.last_message.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (activeTabFilter === 'tickets') return c.is_ticket === true;
    if (activeTabFilter === 'open') return c.is_ticket === true && c.ticket_status !== 'Closed';
    if (activeTabFilter === 'closed') return c.is_ticket === true && c.ticket_status === 'Closed';

    return true;
  });

  const totalOpenTickets = conversations.filter((c) => c.is_ticket && c.ticket_status !== 'Closed').length;
  const hasTickets = conversations.some((c) => c.is_ticket);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Live Support Operating Schedule Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-base shrink-0 ${
            ((new Date().getUTCHours() + 8) % 24) >= 8 && ((new Date().getUTCHours() + 8) % 24) < 17
              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-950 text-amber-600 border border-amber-200 dark:border-amber-800'
          }`}>
            {((new Date().getUTCHours() + 8) % 24) >= 8 && ((new Date().getUTCHours() + 8) % 24) < 17 ? '🟢' : '🌙'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                {((new Date().getUTCHours() + 8) % 24) >= 8 && ((new Date().getUTCHours() + 8) % 24) < 17
                  ? 'Live Support Chat is ONLINE'
                  : 'Live Support Chat is OFFLINE'}
              </span>
              <Badge variant={((new Date().getUTCHours() + 8) % 24) >= 8 && ((new Date().getUTCHours() + 8) % 24) < 17 ? 'success' : 'warning'} size="sm">
                {((new Date().getUTCHours() + 8) % 24) >= 8 && ((new Date().getUTCHours() + 8) % 24) < 17 ? 'Live Queuing Active' : 'Off-Hours Queue'}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Live Support Schedule: <strong>Monday to Friday, 8:00 AM – 5:00 PM PHT</strong>. (2-minute session inactivity timer applies to active live queues; closed tickets move to Archives).
            </p>
          </div>
        </div>
      </div>

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
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {isStudent ? 'Help Desk & Support Tickets' : 'Live Communications & Support'}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
              {isTreasury
                ? 'Treasury Communications & Inter-Agency Hotlines'
                : isSupervisor
                ? 'Academic Evaluation & Supervisor Hotlines'
                : isSchoolCoordinator
                ? 'School Coordinator & Institutional Communications'
                : isScholarshipAdmin
                ? 'Official Communication Center & Support Tickets'
                : 'Help Desk & Student Support Center'}
            </h1>
            <Badge variant="primary" size="sm">
              {isTreasury
                ? 'Treasury Desk'
                : isSupervisor
                ? 'Supervisor Desk'
                : isSchoolCoordinator
                ? 'Coordinator Desk'
                : isScholarshipAdmin
                ? 'Live Helpdesk'
                : 'Student Support'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {isTreasury
              ? 'Direct coordination hotlines with the Scholarship Board Administration, COA Audit Office, and University Bursars regarding budget drawdowns and disbursement reconciliations.'
              : isSupervisor
              ? 'Direct coordination hotlines with Scholarship Administration, School Registrars, and Evaluation Advisory Desks.'
              : isSchoolCoordinator
              ? 'Direct coordination hotlines with Scholarship Administration and City Treasury for certified masterlists and institutional billing.'
              : isScholarshipAdmin
              ? 'Manage applicant inquiries, resolve and close support tickets, and broadcast citywide scholarship advisories.'
              : 'Direct communication hotline with the Quezon City Scholarship Helpdesk and track support ticket resolutions.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isStudent && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowNewTicketModal(true)}
              className="bg-blue-600 hover:bg-blue-700 font-bold text-xs shadow-xs"
              leftIcon={<Ticket className="h-4 w-4" />}
            >
              Raise Support Ticket
            </Button>
          )}

          {isScholarshipAdmin && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowBulkModal(true)}
              className="bg-blue-600 hover:bg-blue-700 font-bold text-xs shadow-xs"
              leftIcon={<Megaphone className="h-4 w-4" />}
            >
              Post Announcement
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadAnnouncements();
              loadConversations();
            }}
            leftIcon={<RefreshCw className="h-3.5 w-3.5 text-slate-500" />}
            className="font-bold text-xs"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Announcements Broadcast Card */}
      <Card className="border border-blue-200 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20">
        <CardHeader className="flex flex-row items-center justify-between pb-3 cursor-pointer" onClick={() => setShowAnnouncements(!showAnnouncements)}>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Megaphone className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-extrabold text-blue-950 dark:text-blue-200 flex items-center gap-2">
                Citywide Scholarship Announcements & Advisories
                <Badge variant="primary" size="sm" className="text-[10px]">
                  {announcements.length} Active
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Official notices regarding payouts, evaluation updates, and renewal cycles
              </CardDescription>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
            {showAnnouncements ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </CardHeader>

        {showAnnouncements && (
          <CardContent className="pt-0 border-t border-blue-100 dark:border-blue-900/30">
            {announcements.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No active announcements currently posted.</p>
            ) : (
              <div className="space-y-3 pt-3">
                {announcements.map((anc) => (
                  <div
                    key={anc.id}
                    className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-blue-100 dark:border-blue-900/40 space-y-1.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-400">
                          {anc.announcement_code}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{anc.title}</h4>
                        {anc.priority === 'urgent' && (
                          <Badge variant="destructive" size="sm">
                            Urgent
                          </Badge>
                        )}
                        {anc.priority === 'high' && (
                          <Badge variant="warning" size="sm">
                            Priority
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                        To: {anc.target_group}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{anc.message}</p>
                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 font-medium">
                      <span>Sent by: {anc.sent_by}</span>
                      <span>{formatDate(anc.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Main Direct Messaging & Ticket Interface */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[580px]">
        {/* Left Sidebar: Conversations & Tickets List */}
        <Card className="p-3.5 space-y-3 flex flex-col border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              {isTreasury
                ? 'Official Treasury Hotlines'
                : isSupervisor
                ? 'Supervisor Hotlines'
                : isSchoolCoordinator
                ? 'School & Board Hotlines'
                : isScholarshipAdmin
                ? 'Student Inquiries & Tickets'
                : 'My Support Channels'}
            </span>
            <Badge variant="primary" size="sm">
              {conversations.length} Channels
            </Badge>
          </div>

          {/* Quick Filter Tabs for Admin/Student/Tickets */}
          {hasTickets && (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setActiveTabFilter('all')}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  activeTabFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveTabFilter('tickets')}
                className={`flex-1 py-1 rounded-lg flex items-center justify-center gap-1 transition-all ${
                  activeTabFilter === 'tickets'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Ticket className="h-3 w-3" />
                <span>Tickets</span>
                {totalOpenTickets > 0 && (
                  <span className="bg-rose-500 text-white text-[9px] px-1 rounded-full font-extrabold">
                    {totalOpenTickets}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTabFilter('open')}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  activeTabFilter === 'open'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setActiveTabFilter('closed')}
                className={`flex-1 py-1 rounded-lg flex items-center justify-center gap-1 transition-all ${
                  activeTabFilter === 'closed'
                    ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Archive className="h-3 w-3" />
                <span>Archives</span>
              </button>
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={isScholarshipAdmin ? 'Search student, ID, or ticket #...' : 'Search channels & messages...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-blue-600 font-medium placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                <Ticket className="h-6 w-6 mx-auto text-slate-300 opacity-60" />
                <p>No conversations or tickets match the filter.</p>
                {!isAdminOrStaff && (
                  <button
                    onClick={() => setShowNewTicketModal(true)}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    + Raise New Support Ticket
                  </button>
                )}
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = selectedConv?.conversation_id === c.conversation_id;
                const isClosedTicket = c.is_ticket && c.ticket_status === 'Closed';

                return (
                  <div
                    key={c.conversation_id}
                    onClick={() => {
                      setSelectedConv(c);
                      loadMessagesForSelected(c.conversation_id);
                    }}
                    className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 shadow-xs'
                        : isClosedTicket
                        ? 'opacity-65 hover:opacity-100 hover:bg-slate-50 dark:hover:bg-slate-800/40 border-slate-100 dark:border-slate-800'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border-transparent text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div
                      className={`h-9 w-9 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${
                        c.is_ticket
                          ? isClosedTicket
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700'
                          : isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {c.avatar}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <p
                          className={`text-xs font-bold truncate ${
                            isSelected ? 'text-blue-950 dark:text-blue-200' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {c.participant_name}
                        </p>
                        {c.unread_count > 0 && (
                          <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                            {c.unread_count}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mb-1">
                        {c.is_ticket ? (
                          <Badge
                            variant={isClosedTicket ? 'secondary' : c.ticket_status === 'Open' ? 'destructive' : 'warning'}
                            size="sm"
                            className="text-[9px] py-0 px-1.5"
                          >
                            {c.ticket_status === 'Closed' ? 'Closed' : `Ticket ${c.ticket_status || 'Open'}`}
                          </Badge>
                        ) : (
                          c.academic_status && (
                            <Badge
                              variant={c.status_badge_variant === 'danger' ? 'destructive' : (c.status_badge_variant as any) || 'outline'}
                              size="sm"
                              className="text-[9px] py-0 px-1.5"
                            >
                              {c.academic_status}
                            </Badge>
                          )
                        )}
                        {c.ticket_priority && (
                          <span className="text-[9px] font-bold text-slate-400 uppercase">
                            {c.ticket_priority}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-medium">
                        {c.last_message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Right Main Chat Window */}
        <Card className="md:col-span-2 p-4 flex flex-col justify-between border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          {/* Top Chat Header */}
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`h-10 w-10 rounded-full font-bold flex items-center justify-center text-sm shadow-xs shrink-0 ${
                  selectedConv?.is_ticket
                    ? selectedConv.ticket_status === 'Closed'
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {selectedConv?.avatar || 'FA'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {selectedConv?.participant_name || 'Financial Aid Desk'}
                  </h3>
                  {selectedConv?.is_ticket ? (
                    <Badge
                      variant={selectedConv.ticket_status === 'Closed' ? 'secondary' : selectedConv.ticket_status === 'Open' ? 'destructive' : 'warning'}
                      size="sm"
                      className="text-[10px]"
                    >
                      {selectedConv.ticket_status === 'Closed' ? 'Closed' : `Ticket ${selectedConv.ticket_status || 'Open'}`}
                    </Badge>
                  ) : (
                    selectedConv?.academic_status && (
                      <Badge variant="primary" size="sm" className="text-[10px]">
                        {selectedConv.academic_status}
                      </Badge>
                    )
                  )}
                  {selectedConv?.ticket_priority && (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      {selectedConv.ticket_priority} Priority
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-0.5 truncate">
                  <span className={`h-1.5 w-1.5 rounded-full ${selectedConv?.ticket_status === 'Closed' ? 'bg-slate-400' : 'bg-emerald-500'}`} />
                  {selectedConv?.participant_role}
                </p>
              </div>
            </div>

            {/* Admin Ticket Controls or Student Ticket Badge */}
            <div className="flex items-center gap-2 shrink-0">
              {selectedConv?.is_ticket && isAdminOrStaff && (
                <>
                  {selectedConv.ticket_status !== 'Closed' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCloseModal(true)}
                      className="border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800 font-bold text-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Close Ticket</span>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickStatusChange('In Progress')}
                      className="border-slate-200 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer"
                    >
                      Reopen Ticket
                    </Button>
                  )}
                </>
              )}

              {selectedConv?.student_id && (
                <Badge variant="outline" size="sm" className="font-mono text-[10px] hidden sm:inline-flex">
                  {selectedConv.student_id}
                </Badge>
              )}
            </div>
          </div>

          {/* Ticket Information Bar (if viewing a ticket) */}
          {selectedConv?.is_ticket && (
            <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {selectedConv.ticket_code}
                </span>
                <span className="text-slate-400">•</span>
                <span className="font-medium text-slate-600 dark:text-slate-300 truncate max-w-xs">
                  {selectedConv.ticket_subject || selectedConv.participant_role}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {selectedConv.ticket_status !== 'Closed' && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800">
                    <Clock className="h-3 w-3 text-blue-600 animate-spin" />
                    <span className="text-[10px] text-slate-500 font-bold">Auto-Close:</span>
                    <span className={`text-[11px] font-mono font-extrabold ${ticketSecondsLeft <= 30 ? 'text-rose-600 animate-pulse' : 'text-blue-700 dark:text-blue-300'}`}>
                      {String(Math.floor(ticketSecondsLeft / 60)).padStart(2, '0')}:{String(ticketSecondsLeft % 60).padStart(2, '0')}
                    </span>
                  </div>
                )}
                {selectedConv.ticket_status === 'Closed' && selectedConv.resolution_remarks && (
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 truncate max-w-xs">
                    Resolution: {selectedConv.resolution_remarks}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Chat Messages Log */}
          <div className="flex-1 p-3 space-y-3 overflow-y-auto text-xs my-2">
            {isLoadingMessages ? (
              <div className="flex items-center justify-center h-full text-slate-400 font-medium text-xs">
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              selectedConv?.is_ticket ? (
                <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-2.5 my-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-blue-950 dark:text-blue-200">
                      Ticket #{selectedConv.ticket_code}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      {selectedConv.ticket_category}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {selectedConv.ticket_subject || selectedConv.participant_role}
                  </h4>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed shadow-xs">
                    {selectedConv.last_message || 'Student inquiry registered. You can type a response below to assist the applicant.'}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs text-center space-y-1">
                  <ShieldCheck className="h-8 w-8 text-slate-300 opacity-60" />
                  <p className="font-semibold text-slate-600 dark:text-slate-300">
                    Official Quezon City Scholarship Helpdesk
                  </p>
                  <p className="text-[11px]">Send a message to inquire about grant applications or disbursements.</p>
                </div>
              )
            ) : (
              messages.map((c) => {
                const isMe = String(c.sender_id) === String(user?.id) || (isAdminOrStaff && c.sender_role === 'admin') || (!isAdminOrStaff && c.sender_role === 'student');
                const isSystem = c.sender_role === 'system';

                if (isSystem) {
                  return (
                    <div key={c.id} className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] font-medium text-amber-900 dark:text-amber-200 text-center my-1">
                      <p className="whitespace-pre-line">{c.message}</p>
                    </div>
                  );
                }

                return (
                  <div
                    key={c.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-0.5`}
                  >
                    <span className="text-[9px] text-slate-400 px-1 font-medium">
                      {c.sender_name} • {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div
                      className={`p-3 rounded-2xl max-w-sm font-medium leading-relaxed shadow-xs whitespace-pre-line ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                      }`}
                    >
                      {c.message}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Closed Ticket Notice Banner */}
          {selectedConv?.is_ticket && selectedConv?.ticket_status === 'Closed' && (
            <div className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 my-1">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-slate-500" />
                <span className="font-bold">
                  This support ticket is officially CLOSED and ARCHIVED.
                </span>
                <span className="text-slate-400">•</span>
                <span>Both ends cannot send further messages.</span>
              </div>
              <Badge variant="secondary" size="sm">
                Archived & Read-Only
              </Badge>
            </div>
          )}

          {/* Message Input Box */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <input
              type="text"
              disabled={selectedConv?.is_ticket && selectedConv?.ticket_status === 'Closed'}
              placeholder={
                selectedConv?.is_ticket && selectedConv?.ticket_status === 'Closed'
                  ? 'This support ticket has been officially closed and archived. Chat is locked.'
                  : isAdminOrStaff
                  ? `Reply to ${selectedConv?.participant_name || 'student'}...`
                  : 'Type your message or inquiry...'
              }
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !(selectedConv?.is_ticket && selectedConv?.ticket_status === 'Closed') && handleSendDirectMessage()}
              className={`flex-1 h-10 px-3.5 text-xs rounded-xl border font-medium placeholder:text-slate-400 ${
                selectedConv?.is_ticket && selectedConv?.ticket_status === 'Closed'
                  ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600'
              }`}
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleSendDirectMessage}
              disabled={isSending || !messageInput.trim() || (selectedConv?.is_ticket && selectedConv?.ticket_status === 'Closed')}
              leftIcon={<Send className="h-3.5 w-3.5" />}
              className="font-bold bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </Button>
          </div>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: RAISE NEW SUPPORT TICKET (APPLICANT)                               */}
      {/* ========================================================================= */}
      {showNewTicketModal && (
        <Modal
          isOpen={showNewTicketModal}
          onClose={() => setShowNewTicketModal(false)}
          title="Raise a Support Ticket to Financial Aid Officers"
          maxWidth="md"
        >
          <form onSubmit={handleCreateTicketSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-950 dark:text-blue-200">
              <span className="font-bold block mb-0.5">Direct Helpdesk Escalation</span>
              <p className="text-[11px] leading-relaxed">
                Submitting this ticket creates an active support thread linked directly to the Quezon City Scholarship Secretariat.
              </p>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Subject / Inquiry Title:</label>
              <input
                type="text"
                placeholder="e.g. Discrepancy in GWA record / Disbursement status inquiry..."
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                required
                className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-blue-600 font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Category:</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:border-blue-600 font-semibold"
                >
                  <option value="Application Verification">Application Verification</option>
                  <option value="Disbursement & Payout">Disbursement & Payout</option>
                  <option value="Document Resubmission">Document Resubmission</option>
                  <option value="Eligibility Inquiry">Eligibility Inquiry</option>
                  <option value="System & Account">System & Account</option>
                  <option value="General Support">General Support</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Priority:</label>
                <select
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value as any)}
                  className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:border-blue-600 font-semibold"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Urgent">Urgent Priority</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Description / Details:</label>
              <textarea
                rows={4}
                placeholder="Explain the issue or inquiry in detail..."
                value={ticketDesc}
                onChange={(e) => setTicketDesc(e.target.value)}
                required
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-blue-600 font-medium placeholder:text-slate-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" type="button" onClick={() => setShowNewTicketModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={isSubmittingTicket}
                leftIcon={<Ticket className="h-4 w-4" />}
                className="font-bold bg-blue-600 text-white"
              >
                {isSubmittingTicket ? 'Filing Ticket...' : 'Submit Support Ticket'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CLOSE TICKET WITH RESOLUTION REMARKS (ADMIN)                        */}
      {/* ========================================================================= */}
      {showCloseModal && (
        <Modal
          isOpen={showCloseModal}
          onClose={() => setShowCloseModal(false)}
          title={`Close Support Ticket #${selectedConv?.ticket_code || ''}`}
          maxWidth="md"
        >
          <form onSubmit={handleCloseTicketSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200">
              <span className="font-bold block mb-0.5">Official Ticket Resolution</span>
              <p className="text-[11px] leading-relaxed">
                Closing this ticket will mark the applicant's issue as resolved, timestamp the closure, and send an in-app notification to the applicant.
              </p>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Resolution Remarks / Notes for Student:</label>
              <textarea
                rows={3}
                placeholder="e.g. Document verified and updated in database. Disbursement scheduled for Batch #4."
                value={resolutionRemarks}
                onChange={(e) => setResolutionRemarks(e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-blue-600 font-medium placeholder:text-slate-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" type="button" onClick={() => setShowCloseModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={isClosingTicket}
                leftIcon={<CheckCircle2 className="h-4 w-4" />}
                className="font-bold bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isClosingTicket ? 'Closing Ticket...' : 'Confirm & Close Ticket'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE BULK ANNOUNCEMENT                                           */}
      {/* ========================================================================= */}
      {showBulkModal && (
        <Modal
          isOpen={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          title="Broadcast City-Wide Bulk Announcement"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateAnnouncement} className="space-y-3.5 text-xs">
            <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-950 dark:text-blue-200">
              <span className="font-bold block mb-0.5">Campus-Wide Financial Aid Dispatch</span>
              <p className="text-[11px] leading-relaxed">
                Broadcasting this announcement will post it to the live System Announcements board and immediately dispatch
                in-app notifications to all targeted scholar accounts.
              </p>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Announcement Title:</label>
              <input
                type="text"
                placeholder="e.g. Schedule of 1st Semester Allowance Disbursement..."
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-blue-600 font-semibold placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Target Audience:</label>
                <select
                  value={targetGroup}
                  onChange={(e) => setTargetGroup(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:border-blue-600 font-semibold"
                >
                  <option value="All Students" className="dark:bg-slate-900 dark:text-white">All Students & Applicants</option>
                  <option value="All Qualified Scholars" className="dark:bg-slate-900 dark:text-white">All Qualified Active Scholars</option>
                  <option value="Senior High School" className="dark:bg-slate-900 dark:text-white">Senior High School Level (SHS)</option>
                  <option value="Tertiary College" className="dark:bg-slate-900 dark:text-white">Tertiary College Undergraduates</option>
                  <option value="Pending Applicants" className="dark:bg-slate-900 dark:text-white">Pending Review Applicants</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Broadcast Priority:</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:border-blue-600 font-semibold"
                >
                  <option value="normal" className="dark:bg-slate-900 dark:text-white">Normal Announcement</option>
                  <option value="high" className="dark:bg-slate-900 dark:text-white">High Priority</option>
                  <option value="urgent" className="dark:bg-slate-900 dark:text-white">Urgent Notice (Red Alert)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Announcement Body:</label>
              <textarea
                rows={4}
                placeholder="Write the official notification message for scholars..."
                value={annMessage}
                onChange={(e) => setAnnMessage(e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-blue-600 font-medium placeholder:text-slate-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" type="button" onClick={() => setShowBulkModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={isBroadcasting}
                leftIcon={<Megaphone className="h-4 w-4" />}
                className="font-bold bg-blue-600 text-white"
              >
                {isBroadcasting ? 'Broadcasting...' : 'Broadcast to Scholars'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default MessagesPage;
