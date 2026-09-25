// frontend/src/components/admin/AdminLiveChatDashboard.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Search,
  CheckCircle2,
  XCircle,
  UserCheck,
  Send,
  Archive,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../context/AuthContext';
import {
  getLiveChatSessions,
  getLiveChatSession,
  sendLiveChatMessage,
  acceptLiveChatSession,
  updateLiveChatStatus,
  type LiveChatSession,
  type LiveChatMessage,
  type LiveChatStats,
} from '../../api/liveChat';

export const AdminLiveChatDashboard: React.FC = () => {
  const { user } = useAuth();

  // Sessions & Stats State
  const [sessions, setSessions] = useState<LiveChatSession[]>([]);
  const [stats, setStats] = useState<LiveChatStats>({
    active_count: 0,
    waiting_count: 0,
    resolved_count: 0,
    expired_count: 0,
    archived_count: 0,
    total_count: 0,
  });

  const [activeTab, setActiveTab] = useState<'Active' | 'Waiting' | 'Resolved' | 'Expired/Closed'>('Active');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Selected Session for Live Conversation Modal / Drawer
  const [selectedSession, setSelectedSession] = useState<LiveChatSession | null>(null);
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [adminReplyText, setAdminReplyText] = useState('');

  // Transfer Modal State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [targetDepartment, setTargetDepartment] = useState('Scholarship Admin');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchSessionsList = async () => {
    setIsLoading(true);
    try {
      const res = await getLiveChatSessions({ status: activeTab, search: searchTerm });
      if (res.data?.data) {
        setSessions(res.data.data);
      }
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.warn('Failed to load live chat sessions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionsList();
    const interval = setInterval(fetchSessionsList, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [activeTab, searchTerm]);

  // Load detailed messages when a session card is clicked
  const handleSelectSession = async (session: LiveChatSession) => {
    setSelectedSession(session);
    try {
      const res = await getLiveChatSession(session.id);
      if (res.data?.data) {
        setSelectedSession(res.data.data);
        setMessages(res.data.data.messages || []);
      }
    } catch (err) {
      console.warn('Failed to load session details:', err);
    }
  };

  // Poll current open chat messages every 3s
  useEffect(() => {
    if (!selectedSession) return;
    const interval = setInterval(async () => {
      try {
        const res = await getLiveChatSession(selectedSession.id);
        if (res.data?.data) {
          setSelectedSession(res.data.data);
          setMessages(res.data.data.messages || []);
        }
      } catch (err) {
        // ignore
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Admin Action: Accept Chat
  const handleAcceptChat = async (sessionId: number) => {
    try {
      const res = await acceptLiveChatSession(sessionId);
      if (res.data?.success) {
        toast.success(res.data.message || 'Chat accepted!');
        fetchSessionsList();
        if (selectedSession && selectedSession.id === sessionId) {
          handleSelectSession(res.data.data);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to accept chat');
    }
  };

  // Admin Action: Reply Message
  const handleSendReply = async () => {
    if (!adminReplyText.trim() || !selectedSession) return;

    const textToSend = adminReplyText.trim();
    setAdminReplyText('');

    try {
      const res = await sendLiveChatMessage(selectedSession.id, {
        message: textToSend,
        sender_name: user?.name || 'Officer',
        sender_type: 'admin',
      });

      if (res.data?.data) {
        setMessages((prev) => [...prev, res.data.data]);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send reply');
    }
  };

  // Admin Action: Mark as Resolved (Active -> Resolved -> Archived)
  const handleMarkResolved = async (sessionId: number) => {
    try {
      const res = await updateLiveChatStatus(sessionId, {
        status: 'Resolved',
        remarks: 'Inquiry addressed and verified by admin officer.',
      });
      if (res.data?.success) {
        toast.success(`Chat session #${res.data.data.session_code} marked as Resolved and archived!`);
        fetchSessionsList();
        if (selectedSession?.id === sessionId) {
          setSelectedSession(res.data.data);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resolve chat');
    }
  };

  // Admin Action: End Chat (Active -> Closed/Expired)
  const handleEndChat = async (sessionId: number) => {
    try {
      const res = await updateLiveChatStatus(sessionId, { status: 'Closed' });
      if (res.data?.success) {
        toast.success(`Chat session #${res.data.data.session_code} closed.`);
        fetchSessionsList();
        if (selectedSession?.id === sessionId) {
          setSelectedSession(res.data.data);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to end chat');
    }
  };

  // Admin Action: Transfer Chat (Optional)
  const handleTransferChat = async () => {
    if (!selectedSession) return;
    try {
      const res = await updateLiveChatStatus(selectedSession.id, {
        status: 'Waiting',
        remarks: `Transferred to ${targetDepartment}`,
      });
      if (res.data?.success) {
        toast.success(`Chat session transferred to ${targetDepartment} queue!`);
        setShowTransferModal(false);
        fetchSessionsList();
        setSelectedSession(null);
      }
    } catch (err: any) {
      toast.error('Failed to transfer chat');
    }
  };

  const formatStartedTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-slate-900 dark:text-white flex items-center gap-2.5">
            <MessageSquare className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            Live Chat Support Queue
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Real-time queuing system, student/guest inquiries, officer chat acceptance, and administrative archiving.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSessionsList}
            leftIcon={<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />}
            className="font-bold"
          >
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* Filter Tabs matching Requirement 25: Active, Waiting, Resolved, Expired/Closed */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: 'Active', label: '🟢 Active Chats', count: stats.active_count },
          { id: 'Waiting', label: '🟡 Waiting', count: stats.waiting_count },
          { id: 'Resolved', label: '🔵 Resolved', count: stats.resolved_count },
          { id: 'Expired/Closed', label: '🔴 Expired / Closed', count: stats.expired_count },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-md font-bold'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold">{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                {tab.count}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search chat by student name, session code, or concern category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-11 pl-10 pr-4 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl focus:outline-none focus:border-blue-600 font-medium shadow-xs"
        />
      </div>

      {/* Main Grid: Sessions List + Chat Conversation Window */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sessions List Cards (Requirement 25) */}
        <div className="lg:col-span-5 space-y-3">
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm text-slate-900 dark:text-white">
                Chat Queue ({sessions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
              {sessions.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-medium">
                  No {activeTab} chat sessions found.
                </div>
              ) : (
                sessions.map((sess) => (
                  <div
                    key={sess.id}
                    onClick={() => handleSelectSession(sess)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      selectedSession?.id === sess.id
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500 shadow-sm'
                        : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                          Student Name: <span className="text-blue-600 dark:text-blue-400">{sess.guest_name}</span>
                        </h4>
                        <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-1">
                          Concern: <span className="font-bold">{sess.category}</span>
                        </p>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                          sess.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : sess.status === 'Waiting'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : sess.status === 'Resolved'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {sess.status === 'Waiting' ? `Waiting (#${sess.queue_position})` : sess.status}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      <span>Started: <strong>{formatStartedTime(sess.created_at)}</strong></span>
                      <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {sess.session_code}
                      </span>
                    </div>

                    {/* Quick Admin Accept Button for Waiting Chats */}
                    {sess.status === 'Waiting' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptChat(sess.id);
                        }}
                        leftIcon={<UserCheck className="h-3.5 w-3.5" />}
                        className="w-full mt-3 font-bold text-xs py-1.5"
                      >
                        Accept Chat
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selected Session Conversation Panel (Requirement 26 & 27) */}
        <div className="lg:col-span-7">
          {!selectedSession ? (
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-[600px] flex items-center justify-center text-slate-400 text-xs font-medium">
              Select a chat card on the left to view messages and respond.
            </Card>
          ) : (
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col h-[600px]">
              {/* Card Header & Admin Action Toolbar (Requirement 26) */}
              <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {selectedSession.guest_name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      Queuer ID: {selectedSession.user_id ? `STU-${selectedSession.user_id}` : 'PUBLIC-GUEST'}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      ({selectedSession.category})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    📧 Email: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedSession.guest_email || 'No Email Provided'}</span> • Session Code: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedSession.session_code}</span> • Started: {formatStartedTime(selectedSession.created_at)}
                  </p>
                </div>

                {/* Admin Action Buttons (Requirement 26) */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {selectedSession.status === 'Waiting' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAcceptChat(selectedSession.id)}
                      leftIcon={<UserCheck className="h-3.5 w-3.5" />}
                      className="font-bold text-xs"
                    >
                      Accept Chat
                    </Button>
                  )}

                  {(selectedSession.status === 'Active' || selectedSession.status === 'Waiting') && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowTransferModal(true)}
                        className="text-xs font-bold"
                      >
                        Transfer
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleMarkResolved(selectedSession.id)}
                        leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                        className="font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
                      >
                        Mark as Resolved
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEndChat(selectedSession.id)}
                        leftIcon={<XCircle className="h-3.5 w-3.5 text-rose-500" />}
                        className="font-bold text-xs text-rose-600 border-rose-200 dark:border-rose-900"
                      >
                        End Chat
                      </Button>
                    </>
                  )}
                </div>
              </CardHeader>

              {/* Requirement 27 Archiving Notice */}
              {(selectedSession.status === 'Resolved' || selectedSession.status === 'Expired' || selectedSession.status === 'Closed') && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs font-medium flex items-center gap-2">
                  <Archive className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>
                    Closed conversations are <strong>archived for administrative reference</strong> rather than permanently deleted.
                  </span>
                </div>
              )}

              {/* Messages Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-900/50 text-xs">
                {messages.map((m) => {
                  const isAdmin = m.sender_type === 'admin';
                  const isSystem = m.sender_type === 'system';

                  if (isSystem) {
                    return (
                      <div key={m.id} className="p-2.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] text-center font-medium border border-slate-300/50 dark:border-slate-700">
                        {m.message}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] font-bold text-slate-400 mb-0.5 px-1">
                        {m.sender_name} ({m.sender_type})
                      </span>
                      <div
                        className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                          isAdmin
                            ? 'bg-blue-600 text-white rounded-br-xs font-medium shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-bl-xs shadow-xs'
                        }`}
                      >
                        {m.message}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Admin Reply Bar */}
              <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  placeholder={
                    selectedSession.status === 'Waiting'
                      ? 'Click "Accept Chat" above to start replying...'
                      : selectedSession.status === 'Resolved' || selectedSession.status === 'Expired' || selectedSession.status === 'Closed'
                      ? 'This chat is archived for reference.'
                      : 'Type officer response...'
                  }
                  disabled={selectedSession.status !== 'Active'}
                  value={adminReplyText}
                  onChange={(e) => setAdminReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                  className="flex-1 h-10 px-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:border-blue-600 font-medium disabled:opacity-50"
                />
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSendReply}
                  disabled={!adminReplyText.trim() || selectedSession.status !== 'Active'}
                  leftIcon={<Send className="h-4 w-4" />}
                  className="font-bold"
                >
                  Reply
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Transfer Chat Modal */}
      {showTransferModal && (
        <Modal
          isOpen={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          title="Transfer Live Chat Session"
          description="Re-assign this student inquiry to another support department"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setShowTransferModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleTransferChat} className="font-bold">
                Confirm Transfer
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <label className="block font-bold text-slate-900 dark:text-white">Target Department Queue</label>
            <select
              value={targetDepartment}
              onChange={(e) => setTargetDepartment(e.target.value)}
              className="w-full h-10 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-medium"
            >
              <option value="Scholarship Admin">Financial Aid & Scholarship Admin</option>
              <option value="City Treasury">City Treasury Payouts</option>
              <option value="Academic Evaluation">Academic Evaluation Unit</option>
              <option value="School Registrars Desk">School Registrars Desk</option>
            </select>
          </div>
        </Modal>
      )}
    </div>
  );
};
