import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Bell,
  Clock,
  DollarSign,
  Megaphone,
  GraduationCap,
  Users,
  Search,
  Trash2,
  Info,
  CalendarCheck,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { toast } from 'sonner';
import { getCalendarEvents, createCalendarEvent, deleteCalendarEvent, type CalendarEventItem } from '../api/calendar';

export interface CalendarNotice extends CalendarEventItem {}

export const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const { subscribeToTable, isConnected } = useWebSocket();
  const isAdmin = user?.role === 'admin' || user?.role === 'system_admin' || user?.role === 'school_coordinator' || user?.role === 'treasury';

  // Live Philippine Time Clock & Date Extractor
  const getManilaTimeString = () =>
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Manila',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date());

  const getPhtDate = () => {
    const now = new Date();
    const phtFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    const parts = phtFormatter.formatToParts(now);
    const year = parseInt(parts.find((p) => p.type === 'year')?.value || `${now.getFullYear()}`, 10);
    const month = parseInt(parts.find((p) => p.type === 'month')?.value || `${now.getMonth() + 1}`, 10) - 1; // 0-indexed (0 = Jan, 8 = Sept)
    const day = parseInt(parts.find((p) => p.type === 'day')?.value || `${now.getDate()}`, 10);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return { year, month, day, dateStr };
  };

  const [phtClock, setPhtClock] = useState<string>(getManilaTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setPhtClock(getManilaTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const initialPht = getPhtDate();

  // Current Calendar View State (synced to live PHT date)
  const [currentYear, setCurrentYear] = useState<number>(initialPht.year);
  const [currentMonth, setCurrentMonth] = useState<number>(initialPht.month);

  // Selected Date
  const [selectedDate, setSelectedDate] = useState<string>(initialPht.dateStr);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Events State
  const [notices, setNotices] = useState<CalendarNotice[]>([]);

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [viewingNotice, setViewingNotice] = useState<CalendarNotice | null>(null);

  // Form State for Admin New Notice
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDate, setFormDate] = useState<string>(initialPht.dateStr);
  const [formTime, setFormTime] = useState<string>('09:00 AM');
  const [formCategory, setFormCategory] = useState<CalendarNotice['category']>('Announcement');
  const [formTargetAudience, setFormTargetAudience] = useState<string>('All Registered Scholars');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formPriority, setFormPriority] = useState<CalendarNotice['priority']>('High');
  const [formSendNotification, setFormSendNotification] = useState<boolean>(true);

  // Load live system milestones & custom events
  const loadCalendarData = async () => {
    setIsLoading(true);
    try {
      const res = await getCalendarEvents();
      if (res.data?.data && res.data.data.length > 0) {
        setNotices(res.data.data);
      }
    } catch (err) {
      console.warn('Could not fetch calendar events from backend:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarData();
  }, []);

  // =========================================================================
  // REAL-TIME WEBSOCKET SUBSCRIPTION FOR CALENDAR EVENTS
  // =========================================================================
  useEffect(() => {
    const unsubscribe = subscribeToTable('calendar_events', (event) => {
      if (event.action === 'INSERT' && event.record) {
        const newEvent = event.record as any;
        setNotices((prev) => {
          if (prev.some((n) => n.id === newEvent.id || (newEvent.event_code && n.id === newEvent.event_code))) {
            return prev;
          }
          return [newEvent as CalendarNotice, ...prev];
        });
        toast.info(`📅 New Calendar Event: ${newEvent.title}`, {
          description: `Scheduled for ${newEvent.date} at ${newEvent.time || '08:00 AM'}`,
        });
      } else if (event.action === 'DELETE' && event.record) {
        const rawRec = event.record as any;
        const targetId = rawRec.id || rawRec.event_code;
        setNotices((prev) => prev.filter((n) => n.id !== targetId && n.id !== rawRec.id));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [subscribeToTable]);

  // Periodic poll fallback for real-time calendar synchronization (every 10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      getCalendarEvents()
        .then((res) => {
          if (res.data?.data) {
            setNotices(res.data.data);
          }
        })
        .catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Calendar Date Math
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    const today = getPhtDate();
    setCurrentYear(today.year);
    setCurrentMonth(today.month);
    setSelectedDate(today.dateStr);
  };

  const formatDateStr = (year: number, month: number, day: number): string => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Role-based Category & Notice Scoping
  const availableCategories = user?.role === 'school_coordinator'
    ? ['All', 'Academic', 'Deadline', 'Announcement', 'Interview']
    : user?.role === 'treasury'
    ? ['All', 'Disbursement', 'Deadline', 'Announcement']
    : ['All', 'Disbursement', 'Deadline', 'Announcement', 'Academic', 'Interview'];

  const roleFilteredNotices = notices.filter((n) => {
    if (user?.role === 'school_coordinator') {
      return n.category !== 'Disbursement';
    }
    if (user?.role === 'treasury') {
      return n.category === 'Disbursement' || n.category === 'Deadline' || n.category === 'Announcement';
    }
    return true;
  });

  const getNoticesForDate = (dateStr: string): CalendarNotice[] => {
    return roleFilteredNotices.filter((n) => n.date === dateStr);
  };

  const filteredNotices = roleFilteredNotices.filter((n) => {
    const matchesCategory = selectedCategory === 'All' || n.category === selectedCategory;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.targetAudience.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedDateNotices = getNoticesForDate(selectedDate);

  // Handle Admin Add Notice Submission
  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDate) {
      toast.error('Please enter an event title and target date.');
      return;
    }

    try {
      const res = await createCalendarEvent({
        title: formTitle.trim(),
        date: formDate,
        time: formTime.trim() || '08:00 AM',
        category: formCategory,
        targetAudience: formTargetAudience.trim() || 'All Registered Scholars',
        description: formDescription.trim(),
        priority: formPriority,
        sendNotification: formSendNotification,
        isOfficialLGU: true,
      });

      if (res.data?.data) {
        setNotices((prev) => [res.data.data, ...prev]);
        toast.success(res.data.message || 'Calendar Notification Scheduled Successfully!', {
          description: formSendNotification
            ? `Information posted for ${formDate} and automated system notice dispatched to scholars' feeds.`
            : `Information posted on the official calendar for ${formDate}.`,
        });
      }
    } catch (err) {
      console.error('Failed to create calendar event:', err);
      toast.error('Failed to create calendar event');
    }

    // Reset Form & Close Modal
    setFormTitle('');
    setFormDescription('');
    setShowAddModal(false);
    setSelectedDate(formDate);
  };

  const handleDeleteNotice = async (id: string, title: string) => {
    try {
      await deleteCalendarEvent(id);
      setNotices((prev) => prev.filter((n) => n.id !== id));
      if (viewingNotice && viewingNotice.id === id) {
        setViewingNotice(null);
      }
      toast.success(`Removed notice: "${title}"`);
    } catch (err) {
      console.error('Failed to delete calendar event:', err);
      toast.error('Failed to delete calendar notice');
    }
  };

  const getCategoryBadgeVariant = (cat: CalendarNotice['category']): 'success' | 'destructive' | 'primary' | 'secondary' | 'warning' => {
    switch (cat) {
      case 'Disbursement':
        return 'success';
      case 'Deadline':
        return 'destructive';
      case 'Announcement':
        return 'primary';
      case 'Academic':
        return 'secondary';
      case 'Interview':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getCategoryIcon = (cat: CalendarNotice['category']) => {
    switch (cat) {
      case 'Disbursement':
        return <DollarSign className="h-3.5 w-3.5 text-emerald-600" />;
      case 'Deadline':
        return <Clock className="h-3.5 w-3.5 text-rose-600" />;
      case 'Announcement':
        return <Megaphone className="h-3.5 w-3.5 text-blue-600" />;
      case 'Academic':
        return <GraduationCap className="h-3.5 w-3.5 text-indigo-600" />;
      case 'Interview':
        return <Users className="h-3.5 w-3.5 text-amber-600" />;
      default:
        return <Info className="h-3.5 w-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Real-time Status & Philippine Clock Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-bold text-lg shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                Real-Time Academic & Deadline Calendar
              </span>
              <Badge variant="primary" size="sm" className="font-mono text-[10px]">
                🕒 {phtClock} (PHT)
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Synchronized with Quezon City Scholarship Board milestone schedules, application cutoffs, and Landbank distribution dates in real time.
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
            {isConnected ? 'Real-Time Sync Online' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
              {user?.role === 'school_coordinator'
                ? 'Academic & Evaluation Calendar'
                : user?.role === 'treasury'
                ? 'Treasury Payout & Financial Calendar'
                : 'Official Academic & Financial Aid Calendar'}
            </h1>
            {user?.role === 'school_coordinator' && (
              <Badge variant="secondary" className="font-bold text-xs">
                Registrar Scope
              </Badge>
            )}
            {user?.role === 'treasury' && (
              <Badge variant="success" className="font-bold text-xs">
                Fiscal & Payout Scope
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {user?.role === 'school_coordinator'
              ? 'Institutional milestones for grade submissions, underload evaluations, and coordinator verification cutoffs.'
              : user?.role === 'treasury'
              ? 'Fiscal milestones for Landbank ATM releases, GCash crediting windows, and budget reconciliation dates.'
              : 'Master Quezon City Youth Development Office scheduling portal for citywide scholarships and grants.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setFormDate(selectedDate);
                setShowAddModal(true);
              }}
              leftIcon={<Plus className="h-4 w-4" />}
              className="font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
            >
              Set Date Notification
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={loadCalendarData}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`h-4 w-4 text-blue-600 ${isLoading ? 'animate-spin' : ''}`} />}
            className="font-bold"
          >
            {isLoading ? 'Syncing...' : 'Sync Events'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            leftIcon={<CalendarCheck className="h-4 w-4 text-blue-600" />}
            className="font-bold"
          >
            Today ({monthNames[initialPht.month].slice(0, 3)} {initialPht.day})
          </Button>
        </div>
      </div>

      {/* Main Calendar View & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Interactive Month Grid */}
        <Card className="lg:col-span-8 p-6 space-y-5">
          {/* Calendar Controls Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">
                  {monthNames[currentMonth]} {currentYear}
                </h2>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  AY 2026-2027 1st Semester Academic Term
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekday Header */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-1">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty slots for previous month trailing days */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => {
              const prevDayNum = daysInPrevMonth - firstDayOfMonth + idx + 1;
              return (
                <div
                  key={`prev-${idx}`}
                  className="min-h-[92px] p-2 rounded-2xl border border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/30 text-slate-300 dark:text-slate-700 text-xs font-medium select-none"
                >
                  <span className="block text-[11px]">{prevDayNum}</span>
                </div>
              );
            })}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = formatDateStr(currentYear, currentMonth, dayNum);
              const isSelected = selectedDate === dateStr;
              const livePht = getPhtDate();
              const isToday =
                currentYear === livePht.year &&
                currentMonth === livePht.month &&
                dayNum === livePht.day;
              const dayNotices = getNoticesForDate(dateStr);
              const hasDisbursement = dayNotices.some((n) => n.category === 'Disbursement');
              const hasDeadline = dayNotices.some((n) => n.category === 'Deadline');
              const hasAnnouncement = dayNotices.some((n) => n.category === 'Announcement');

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`min-h-[92px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20 shadow-md font-semibold'
                      : isToday
                      ? 'border-emerald-400 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isSelected
                          ? 'text-blue-700 dark:text-blue-300'
                          : isToday
                          ? 'text-emerald-700 dark:text-emerald-400 font-extrabold'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {/* Today Pill */}
                    {isToday && (
                      <span className="text-[8px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Date Notice Pill Badges */}
                  <div className="space-y-1 mt-1">
                    {dayNotices.slice(0, 2).map((notice) => (
                      <div
                        key={notice.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDate(dateStr);
                          setViewingNotice(notice);
                        }}
                        className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold truncate flex items-center gap-1 shadow-xs transition-transform hover:scale-102 ${
                          notice.category === 'Disbursement'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                            : notice.category === 'Deadline'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
                            : notice.category === 'Announcement'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-200 border border-blue-300 dark:border-blue-800'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-800'
                        }`}
                        title={notice.title}
                      >
                        <span className="truncate">{notice.title}</span>
                      </div>
                    ))}

                    {dayNotices.length > 2 && (
                      <span className="text-[9px] text-slate-400 font-semibold block text-center">
                        +{dayNotices.length - 2} more notices
                      </span>
                    )}
                  </div>

                  {/* Bottom Dot Indicators */}
                  <div className="flex items-center gap-1 mt-auto pt-1">
                    {hasDisbursement && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />}
                    {hasDeadline && <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />}
                    {hasAnnouncement && <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right 4 Cols: Selected Date Agenda & Upcoming Milestones */}
        <div className="lg:col-span-4 space-y-5">
          {/* Selected Date Header Box */}
          <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/60 via-white to-slate-50 dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-900">
            <CardHeader className="p-4 border-b border-blue-100 dark:border-blue-900/50 flex flex-row items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 tracking-wider block">
                  Date Schedule & Notices
                </span>
                <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    weekday: 'short',
                  })}
                </h3>
              </div>

              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormDate(selectedDate);
                    setShowAddModal(true);
                  }}
                  leftIcon={<Plus className="h-3.5 w-3.5" />}
                  className="font-bold text-xs bg-white dark:bg-slate-800 shadow-xs"
                >
                  Add Notice
                </Button>
              )}
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {selectedDateNotices.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  <Clock className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700 mb-1" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    No notices scheduled on this date.
                  </p>
                  {isAdmin && (
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 cursor-pointer font-medium mt-1 hover:underline" onClick={() => {
                      setFormDate(selectedDate);
                      setShowAddModal(true);
                    }}>
                      + Post a notification or disbursement notice
                    </p>
                  )}
                </div>
              ) : (
                selectedDateNotices.map((n) => (
                  <div
                    key={n.id}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs space-y-2 hover:border-blue-400 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {getCategoryIcon(n.category)}
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {n.category} • {n.time || 'All Day'}
                        </span>
                      </div>
                      <Badge variant={getCategoryBadgeVariant(n.category)} size="sm">
                        {n.priority}
                      </Badge>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                      {n.title}
                    </h4>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                      {n.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-medium truncate max-w-[170px]">
                        Target: {n.targetAudience}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setViewingNotice(n)}
                          className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          View Details
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteNotice(n.id, n.title)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer ml-1"
                            title="Delete Notice"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Master Milestones Timeline Card */}
          <Card>
            <CardHeader className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Bell className="h-4 w-4 text-blue-600" /> Active System Notices & Milestones
              </CardTitle>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative w-full">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search notices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-8 pl-8 pr-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full sm:w-auto h-8 px-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-600 cursor-pointer shrink-0"
                >
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'All' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3 max-h-[380px] overflow-y-auto">
              {filteredNotices.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    setSelectedDate(n.date);
                    setViewingNotice(n);
                  }}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      {n.date}
                    </span>
                    <Badge variant={getCategoryBadgeVariant(n.category)} size="sm" className="text-[9px]">
                      {n.category}
                    </Badge>
                  </div>
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block truncate">
                    {n.title}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                    {n.targetAudience}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Admin "Set Notification on Date" Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Set Date Notification & Information"
          description="Post official scholarship notices, disbursement dates, and document compliance deadlines on the calendar."
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateNotice}
                leftIcon={<CalendarCheck className="h-4 w-4" />}
                className="font-bold bg-blue-600 hover:bg-blue-700 text-white"
              >
                Schedule & Post Notice
              </Button>
            </div>
          }
        >
          <form onSubmit={handleCreateNotice} className="space-y-4 text-xs">
            {/* Title */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Notice Title / Event Headline <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 1st Tranche GCash Disbursement Release AY 2026-2027"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>

            {/* Date and Time Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Scheduled Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Time / Cut-off Hour
                </label>
                <input
                  type="text"
                  placeholder="e.g. 08:00 AM or 05:00 PM"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            {/* Category and Priority Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notice Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as CalendarNotice['category'])}
                  className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 font-semibold cursor-pointer"
                >
                  <option value="Disbursement">💰 Disbursement & Aid Payout Date</option>
                  <option value="Deadline">⏰ Application & Document Deadline</option>
                  <option value="Announcement">📢 System Announcement & Notice</option>
                  <option value="Academic">🎓 Academic Term Milestone / Retention Audit</option>
                  <option value="Interview">🎙️ Screening & Interview Schedule</option>
                  <option value="Compliance">⚠️ Urgent Compliance Advisory</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Priority Level
                </label>
                <select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as CalendarNotice['priority'])}
                  className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 font-semibold cursor-pointer"
                >
                  <option value="Normal">Normal (Standard Schedule)</option>
                  <option value="High">High (Key Financial / Academic Milestone)</option>
                  <option value="Critical">Critical (Immediate Action Required)</option>
                </select>
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Recipients & Audience
              </label>
              <input
                type="text"
                placeholder="e.g. All Quezon City Scholars, QCU Enrollees, or BS Nursing Grantees"
                value={formTargetAudience}
                onChange={(e) => setFormTargetAudience(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Detailed Information & Guidelines
              </label>
              <textarea
                rows={3}
                placeholder="Provide detailed instructions, required attachments, or payout instructions for scholars..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 font-medium resize-none"
              />
            </div>

            {/* System Automated Notification Blast Checkbox */}
            <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 flex items-start gap-3">
              <input
                type="checkbox"
                id="sendNotifCheck"
                checked={formSendNotification}
                onChange={(e) => setFormSendNotification(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="sendNotifCheck" className="text-xs cursor-pointer">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Broadcast Automated System Notification
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 block mt-0.5">
                  Sends this notice automatically to student notification center inboxes as an official notification from <strong>GovServe Education Automated System</strong>.
                </span>
              </label>
            </div>
          </form>
        </Modal>
      )}

      {/* Notice Inspection / Details Modal */}
      {viewingNotice && (
        <Modal
          isOpen={!!viewingNotice}
          onClose={() => setViewingNotice(null)}
          title={viewingNotice.title}
          description={`Scheduled Date: ${viewingNotice.date} • ${viewingNotice.time || 'All Day'}`}
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              {isAdmin ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteNotice(viewingNotice.id, viewingNotice.title)}
                  leftIcon={<Trash2 className="h-3.5 w-3.5 text-rose-600" />}
                  className="font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  Delete Notice
                </Button>
              ) : <div />}
              <Button variant="primary" size="sm" onClick={() => setViewingNotice(null)}>
                Close Notice
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={getCategoryBadgeVariant(viewingNotice.category)} size="md">
                {viewingNotice.category}
              </Badge>
              <Badge variant="primary" size="md">
                Priority: {viewingNotice.priority}
              </Badge>
              <Badge variant="success" size="md">
                Official QCYDO Notice ✓
              </Badge>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Recipients</span>
              <span className="font-bold text-slate-900 dark:text-white block mt-0.5">{viewingNotice.targetAudience}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Notice Details</span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                {viewingNotice.description}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CalendarPage;
