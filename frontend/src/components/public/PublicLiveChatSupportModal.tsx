// frontend/src/components/public/PublicLiveChatSupportModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Clock, Bot, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import {
  ALLOWED_CONCERN_CATEGORIES,
  startLiveChat,
  getLiveChatSession,
  sendLiveChatMessage,
  type LiveChatSession,
  type LiveChatMessage,
} from '../../api/liveChat';

interface PublicLiveChatSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublicLiveChatSupportModal: React.FC<PublicLiveChatSupportModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  // Active Live Chat Session
  const [activeSession, setActiveSession] = useState<LiveChatSession | null>(null);
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  // Pre-Chat Form State ("sa labas ng sign in")
  const [completeName, setCompleteName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [category, setCategory] = useState('Application Status');
  const [initialConcern, setInitialConcern] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inactivity Auto-Close Timer State (120 seconds = 2 minutes)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(120);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load existing session ID from localStorage if returning
  useEffect(() => {
    const savedSessionId = localStorage.getItem('eduscholar_live_chat_session_id');
    if (savedSessionId) {
      fetchSession(parseInt(savedSessionId, 10));
    }
  }, []);

  const fetchSession = async (sessionId: number) => {
    try {
      const res = await getLiveChatSession(sessionId);
      if (res.data?.data) {
        const sess = res.data.data;
        setActiveSession(sess);
        setMessages(sess.messages || []);
        if (sess.status === 'Expired' || sess.status === 'Closed' || sess.status === 'Resolved') {
          localStorage.removeItem('eduscholar_live_chat_session_id');
        }
      }
    } catch (err) {
      console.warn('Failed to load live chat session:', err);
      localStorage.removeItem('eduscholar_live_chat_session_id');
    }
  };

  // Poll session update every 3 seconds while chat is active
  useEffect(() => {
    if (!isOpen || !activeSession || activeSession.status === 'Expired' || activeSession.status === 'Closed' || activeSession.status === 'Resolved') return;

    const interval = setInterval(() => {
      fetchSession(activeSession.id);
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, activeSession]);

  // 120-second (2-minute) Inactivity Countdown Timer
  useEffect(() => {
    if (!activeSession || (activeSession.status !== 'Active' && activeSession.status !== 'Waiting')) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-close session locally & refresh
          fetchSession(activeSession.id);
          toast.error('Chat session auto-closed due to 2 minutes of user inactivity.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession]);

  // Handle Starting a New Live Chat Session
  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeName.trim()) {
      toast.error('Please enter your Complete Name.');
      return;
    }
    if (!initialConcern.trim()) {
      toast.error('Please enter your message or concern.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await startLiveChat({
        complete_name: completeName.trim(),
        guest_email: email.trim(),
        category,
        initial_message: initialConcern.trim(),
      });

      if (res.data?.data) {
        const sess = res.data.data;
        setActiveSession(sess);
        setMessages([
          {
            id: Date.now(),
            session_id: sess.id,
            sender_type: user ? 'student' : 'guest',
            sender_name: completeName.trim(),
            message: initialConcern.trim(),
            created_at: new Date().toISOString(),
          },
        ]);
        localStorage.setItem('eduscholar_live_chat_session_id', String(sess.id));
        setSecondsRemaining(120);
        toast.success(`Live chat started! You are #${sess.queue_position || 1} in queue.`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start live chat');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Sending Message in Active Session
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !activeSession) return;
    if (activeSession.status === 'Expired' || activeSession.status === 'Closed' || activeSession.status === 'Resolved') {
      toast.error('This chat is closed and archived for administrative reference.');
      return;
    }

    const textToSend = inputMessage.trim();
    setInputMessage('');
    setSecondsRemaining(120); // Reset 2-minute inactivity timer on message send!

    try {
      const res = await sendLiveChatMessage(activeSession.id, {
        message: textToSend,
        sender_name: completeName || user?.name || 'User',
        sender_type: user ? 'student' : 'guest',
      });

      if (res.data?.data) {
        setMessages((prev) => [...prev, res.data.data]);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    }
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-4 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-sm flex items-center gap-2">
              Quezon City Live Support
            </h3>
            <p className="text-[11px] text-blue-100 font-medium">Financial Aid & Scholarship Help Desk</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Main Body */}
      {!activeSession ? (
        /* Pre-Chat Form ("sa labas ng sign in") */
        <form onSubmit={handleStartChat} className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl text-blue-900 dark:text-blue-200 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-xs text-blue-900 dark:text-blue-200">
              <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Start Live Chat Inquiry
            </p>
            <p className="text-[11px] leading-relaxed text-blue-800 dark:text-blue-300">
              No account required. Fill in your name and concern below to connect with an officer.
            </p>
          </div>

          <div>
            <label className="block font-extrabold text-slate-900 dark:text-white mb-1">
              Complete Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter your full name..."
              value={completeName}
              onChange={(e) => setCompleteName(e.target.value)}
              required
              className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:border-blue-600 font-medium"
            />
          </div>

          <div>
            <label className="block font-extrabold text-slate-900 dark:text-white mb-1">Email Address (Optional)</label>
            <input
              type="email"
              placeholder="e.g. juandelacruz@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:border-blue-600 font-medium"
            />
          </div>

          <div>
            <label className="block font-extrabold text-slate-900 dark:text-white mb-1">
              Concern Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:border-blue-600 font-medium"
            >
              {ALLOWED_CONCERN_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-extrabold text-slate-900 dark:text-white mb-1">
              Message / Detail of Concern <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Describe your inquiry..."
              value={initialConcern}
              onChange={(e) => setInitialConcern(e.target.value)}
              required
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:border-blue-600 resize-none font-medium"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting}
            className="w-full font-bold shadow-md shadow-blue-600/20 py-2.5"
          >
            {isSubmitting ? 'Connecting...' : 'Start Live Chat'}
          </Button>
        </form>
      ) : (
        /* Active Live Chat Interface */
        <div className="flex flex-col h-[450px]">
          {/* Status & Queue Indicator Banner */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1 ${
                  activeSession.status === 'Active'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : activeSession.status === 'Waiting'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : activeSession.status === 'Resolved'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                {activeSession.status === 'Active' && '🟢 Active Chat'}
                {activeSession.status === 'Waiting' && `🟡 Waiting in Queue (#${activeSession.queue_position || 1})`}
                {activeSession.status === 'Resolved' && '🔵 Resolved'}
                {(activeSession.status === 'Expired' || activeSession.status === 'Closed') && '🔴 Expired/Closed'}
              </span>
            </div>

            {/* Inactivity Auto-Close Timer Display */}
            {(activeSession.status === 'Active' || activeSession.status === 'Waiting') && (
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <Clock className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                Auto-close: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formatCountdown(secondsRemaining)}</span>
              </div>
            )}
          </div>

          {/* Queue Position Alert Banner */}
          {activeSession.status === 'Waiting' && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-b border-amber-200 dark:border-amber-800 text-[11px] font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                You are <strong>#{activeSession.queue_position || 1} in line</strong>. An admin officer will accept your chat shortly.
              </span>
            </div>
          )}

          {/* Message Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-900/50 text-xs">
            {messages.map((m) => {
              const isUser = m.sender_type === 'student' || m.sender_type === 'guest';
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
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] font-bold text-slate-400 mb-0.5 px-1">
                    {m.sender_name}
                  </span>
                  <div
                    className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                      isUser
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

          {/* Message Input Box */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              placeholder={
                activeSession.status === 'Expired' || activeSession.status === 'Closed' || activeSession.status === 'Resolved'
                  ? 'This chat has ended.'
                  : 'Type your message...'
              }
              disabled={activeSession.status === 'Expired' || activeSession.status === 'Closed' || activeSession.status === 'Resolved'}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 h-10 px-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:border-blue-600 font-medium disabled:opacity-50"
            />
            <Button
              variant="primary"
              size="md"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || activeSession.status === 'Expired' || activeSession.status === 'Closed' || activeSession.status === 'Resolved'}
              leftIcon={<Send className="h-4 w-4" />}
              className="font-bold"
            >
              Send
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
