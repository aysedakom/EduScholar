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
  ArrowLeft,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
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

/**
 * Helper to compute live Philippine Standard Time (PHT, UTC+8)
 * Desk Operating Hours: 8:00 AM to 5:00 PM PHT (08:00 to 17:00 PHT)
 */
export const getPhilippineTimeInfo = () => {
  const now = new Date();
  const manilaParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }).formatToParts(now);

  const hour = parseInt(manilaParts.find((p) => p.type === 'hour')?.value || '0', 10);
  const minute = parseInt(manilaParts.find((p) => p.type === 'minute')?.value || '0', 10);
  const second = parseInt(manilaParts.find((p) => p.type === 'second')?.value || '0', 10);

  // Business hours: 8:00 AM (08:00) to 4:59:59 PM (<17:00). At 5:00 PM (17:00), automatically CLOSED!
  const isOpen = hour >= 8 && hour < 17;

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(now);

  return {
    isOpen,
    hour,
    minute,
    second,
    formattedTime,
    timeZoneText: 'PHT (Asia/Manila, UTC+8)',
  };
};

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { subscribeToTable, isConnected } = useWebSocket();
  const isAdminOrStaff = user?.role !== 'student';

  // Live Philippine Time State (Updates Every Second)
  const [phtInfo, setPhtInfo] = useState(getPhilippineTimeInfo());

  useEffect(() => {
    const timer = setInterval(() => {
      setPhtInfo(getPhilippineTimeInfo());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
  const selectedConvRef = useRef<ConversationThread | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'active'>('all');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    selectedConvRef.current = selectedConv;
  }, [selectedConv]);

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
            sender_name: selectedConv?.participant_name || 'Helpdesk Counselor',
            sender_role: selectedConv?.participant_role || 'staff',
            message: 'Welcome to the official Quezon City Scholarship live support desk. Operating hours are 8:00 AM to 5:00 PM Philippine Time.',
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

  // When selected conversation changes, load messages
  useEffect(() => {
    if (selectedConv) {
      loadMessagesForSelected(selectedConv.conversation_id);
    }
  }, [selectedConv?.conversation_id]);

  // =========================================================================
  // REAL-TIME WEBSOCKET SUBSCRIPTION FOR LIVE CHAT MESSAGES
  // =========================================================================
  useEffect(() => {
    const unsubscribe = subscribeToTable('chat_messages', (event) => {
      if (event.action === 'INSERT' && event.record) {
        const incomingMsg = event.record as ChatMessageItem;
        
        // If message belongs to active chat thread, immediately append in real-time
        if (selectedConvRef.current && incomingMsg.conversation_id === selectedConvRef.current.conversation_id) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === incomingMsg.id)) return prev;
            return [...prev, incomingMsg];
          });
        }

        // Update the conversations sidebar list preview in real-time
        setConversations((prev) =>
          prev.map((c) => {
            if (c.conversation_id === incomingMsg.conversation_id) {
              return {
                ...c,
                last_message: incomingMsg.message,
                last_message_time: incomingMsg.created_at,
                unread_count:
                  c.conversation_id !== selectedConvRef.current?.conversation_id &&
                  String(incomingMsg.sender_id) !== String(user?.id)
                    ? (c.unread_count || 0) + 1
                    : 0,
              };
            }
            return c;
          })
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, [subscribeToTable, user?.id]);

  // Periodic poll fallback for real-time messages (every 4 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedConv) {
        getMessages(selectedConv.conversation_id)
          .then((res) => {
            if (res.data?.data && res.data.data.length !== messages.length) {
              setMessages(res.data.data);
            }
          })
          .catch(() => {});
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedConv?.conversation_id, messages.length]);

  // Send Direct Message
  const handleSendDirectMessage = async () => {
    if (!messageInput.trim() || !selectedConv || isSending) return;

    if (!phtInfo.isOpen && !isAdminOrStaff) {
      toast.error('Live Support Desk is closed. Operating hours are 8:00 AM to 5:00 PM (Philippine Time).');
      return;
    }

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
    } catch (err: any) {
      console.error('Failed to send message:', err);
      const errDetail = err?.response?.data?.message || 'Could not send message. Please try again.';
      toast.error(errDetail);
    } finally {
      setIsSending(false);
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
      c.last_message.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (activeTabFilter === 'active') {
      return c.unread_count > 0 || c.status?.toLowerCase().includes('active');
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Live Support Operating Schedule Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
              phtInfo.isOpen
                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950 text-rose-600 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {phtInfo.isOpen ? '🟢' : '🛑'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                {phtInfo.isOpen ? 'Live Support Chat is ONLINE' : 'Live Support Chat is CLOSED'}
              </span>
              <Badge variant={phtInfo.isOpen ? 'success' : 'destructive'} size="sm">
                {phtInfo.isOpen ? 'Live Desk Active (8:00 AM – 5:00 PM)' : 'Closed • Reopens 8:00 AM PHT'}
              </Badge>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                🕒 PHT: {phtInfo.formattedTime}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Live Support Operating Hours: <strong>8:00 AM to 5:00 PM Philippine Standard Time (PHT)</strong>. Channels automatically close at 5:00 PM and reopen at 8:00 AM PHT.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            {isConnected ? 'Real-Time Sync Active' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              to={backNav.path}
              className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {backNav.label}
            </Link>
            <span className="text-slate-400 text-xs">/</span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Live Support Chat
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
                ? 'Official Live Support Desk & Communications'
                : 'Help Desk & Live Support Chat'}
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
                : 'Live Support'}
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
              ? 'Manage live applicant inquiries, answer real-time student messages, and broadcast citywide scholarship advisories.'
              : 'Direct real-time communication hotline with the Quezon City Scholarship Helpdesk and financial aid counselors.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
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
            className="font-bold text-xs cursor-pointer"
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

      {/* Main Direct Live Chat Interface */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[580px]">
        {/* Left Sidebar: Live Communication Channels List */}
        <Card className="p-3.5 space-y-3 flex flex-col border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              {isTreasury
                ? 'Treasury Hotlines'
                : isSupervisor
                ? 'Supervisor Hotlines'
                : isSchoolCoordinator
                ? 'Institutional Hotlines'
                : isScholarshipAdmin
                ? 'Live Student Inquiries'
                : 'Live Support Desks'}
            </span>
            <Badge variant="primary" size="sm">
              {conversations.length} Desks
            </Badge>
          </div>

          {/* Quick Filter Tabs */}
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
              All Channels
            </button>
            <button
              type="button"
              onClick={() => setActiveTabFilter('active')}
              className={`flex-1 py-1 rounded-lg transition-all ${
                activeTabFilter === 'active'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Active
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={isScholarshipAdmin ? 'Search student name or ID...' : 'Search channels & messages...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-blue-600 font-medium placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                <MessageSquare className="h-6 w-6 mx-auto text-slate-300 opacity-60" />
                <p>No communication channels match your search.</p>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = selectedConv?.conversation_id === c.conversation_id;

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
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border-transparent text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div
                      className={`h-9 w-9 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${
                        isSelected
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

                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        {c.academic_status && (
                          <Badge
                            variant={c.status_badge_variant === 'danger' ? 'destructive' : (c.status_badge_variant as any) || 'outline'}
                            size="sm"
                            className="text-[9px] py-0 px-1.5"
                          >
                            {c.academic_status}
                          </Badge>
                        )}
                        {c.student_id && (
                          <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400">
                            Ref: {c.student_id}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-medium truncate">
                          {c.participant_role}
                        </span>
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
              <div className="h-10 w-10 rounded-full font-bold flex items-center justify-center text-sm shadow-xs shrink-0 bg-blue-600 text-white">
                {selectedConv?.avatar || 'FA'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {selectedConv?.participant_name || 'Financial Aid Desk'}
                  </h3>
                  {selectedConv?.academic_status && (
                    <Badge variant="primary" size="sm" className="text-[10px]">
                      {selectedConv.academic_status}
                    </Badge>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 mt-0.5 truncate">
                  {phtInfo.isOpen ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        Live Desk Online (8:00 AM – 5:00 PM PHT)
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        Desk Closed (Reopens 8:00 AM PHT)
                      </span>
                    </>
                  )}
                  <span className="text-slate-300">•</span>
                  <span>{selectedConv?.participant_role || 'Support Counselor'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {selectedConv?.student_id && (
                <Badge
                  variant="outline"
                  size="sm"
                  className="font-mono font-bold text-[10px] hidden sm:inline-flex bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                >
                  Ref ID: {selectedConv.student_id}
                </Badge>
              )}
            </div>
          </div>

          {/* Off-Hours Notification Banner for Students */}
          {!phtInfo.isOpen && !isAdminOrStaff && (
            <div className="p-3 my-2 rounded-xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-rose-900 dark:text-rose-200 text-xs shadow-xs">
              <div className="p-1 rounded-md bg-rose-200/70 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold shrink-0 mt-0.5">
                <Clock className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap font-bold">
                  <span>🛑 Live Support Desk is currently CLOSED</span>
                  <span className="font-mono text-[10px] bg-white/80 dark:bg-black/50 px-2 py-0.5 rounded border border-rose-300 dark:border-rose-700">
                    Current Time: {phtInfo.formattedTime} PHT
                  </span>
                </div>
                <p className="text-[11px] mt-0.5 text-rose-800/90 dark:text-rose-300/90 leading-relaxed font-medium">
                  Live support counselors are available from <strong>8:00 AM to 5:00 PM (Philippine Standard Time, UTC+8)</strong>. Chat channels will automatically reopen at <strong>8:00 AM PHT</strong>.
                </p>
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
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs text-center space-y-1">
                <ShieldCheck className="h-8 w-8 text-slate-300 opacity-60" />
                <p className="font-semibold text-slate-600 dark:text-slate-300">
                  Official Quezon City Scholarship Live Desk
                </p>
                <p className="text-[11px]">Send a message to inquire about grant applications, disbursements, or program policies.</p>
              </div>
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

          {/* Message Input Box */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <input
              type="text"
              disabled={!phtInfo.isOpen && !isAdminOrStaff}
              placeholder={
                !phtInfo.isOpen && !isAdminOrStaff
                  ? 'Live Support Desk is closed (Hours: 8:00 AM - 5:00 PM PHT). Reopens at 8:00 AM.'
                  : isAdminOrStaff
                  ? `Reply to ${selectedConv?.participant_name || 'student'}...`
                  : 'Type your message or inquiry to the counselor...'
              }
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === 'Enter' &&
                (phtInfo.isOpen || isAdminOrStaff) &&
                handleSendDirectMessage()
              }
              className="flex-1 h-10 px-3.5 text-xs rounded-xl border font-medium placeholder:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleSendDirectMessage}
              disabled={isSending || !messageInput.trim() || (!phtInfo.isOpen && !isAdminOrStaff)}
              leftIcon={<Send className="h-3.5 w-3.5" />}
              className="font-bold bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Send
            </Button>
          </div>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREATE BULK ANNOUNCEMENT (ADMIN)                                   */}
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
