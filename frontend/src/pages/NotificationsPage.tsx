import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, Sliders, Search, CheckCircle2, DollarSign, Clock, Info, Moon, Mail, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { getSystemNotifications, saveSystemNotifications } from '../utils/systemNotifications';
import { markAllNotificationsRead, markNotificationRead } from '../api/notifications';
import type { AppNotification } from '../types';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { formatDate } from '../utils/cn';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getSystemNotifications());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  
  // Modals
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Preference Settings
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [quietHours, setQuietHours] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setNotifications(getSystemNotifications());
    };
    window.addEventListener('qc_new_notification', refresh);
    return () => window.removeEventListener('qc_new_notification', refresh);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveSystemNotifications(updated);
    try {
      await markAllNotificationsRead();
    } catch {
      // local updated
    }
    toast.success('All notifications marked as read');
  };

  const handleToggleRead = async (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: !n.read } : n));
    setNotifications(updated);
    saveSystemNotifications(updated);
    try {
      await markNotificationRead(id);
    } catch {
      // local state
    }
  };

  const confirmDelete = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    saveSystemNotifications(updated);
    setDeleteTargetId(null);
    toast.success('Notification deleted');
  };

  // Filtered Notifications List
  const filteredNotifs = notifications.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.message.toLowerCase().includes(searchQuery.toLowerCase());
    const typeStr = ((n as any).type || (n as any).category || '').toString().toLowerCase();
    const titleStr = n.title.toLowerCase();
    
    const matchesCategory =
      activeCategory === 'all' ||
      (activeCategory === 'applications' && (typeStr.includes('application') || titleStr.includes('scholarship'))) ||
      (activeCategory === 'disbursements' && (typeStr.includes('disburse') || titleStr.includes('disburs') || titleStr.includes('gcash'))) ||
      (activeCategory === 'documents' && (titleStr.includes('vault') || titleStr.includes('document') || titleStr.includes('verified'))) ||
      (activeCategory === 'reminders' && (typeStr.includes('deadline') || titleStr.includes('reminder')));

    const matchesRead = readFilter === 'all' || (readFilter === 'unread' && !n.read) || (readFilter === 'read' && n.read);
    return matchesSearch && matchesCategory && matchesRead;
  });

  const getNotificationIcon = (type?: string, title?: string) => {
    const t = (type || title || '').toLowerCase();
    if (t.includes('disburse') || t.includes('payment') || t.includes('gcash')) {
      return <DollarSign className="h-4 w-4 text-emerald-600" />;
    }
    if (t.includes('vault') || t.includes('document') || t.includes('verified')) {
      return <CheckCircle2 className="h-4 w-4 text-indigo-600" />;
    }
    if (t.includes('deadline') || t.includes('reminder')) {
      return <Clock className="h-4 w-4 text-amber-600" />;
    }
    if (t.includes('approve') || t.includes('scholarship')) {
      return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
    }
    return <Info className="h-4 w-4 text-slate-600" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">Notification Center</h1>
            {unreadCount > 0 && (
              <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Real-time status updates on scholarship applications, disbursements, document verifications, and deadline reminders.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreferencesModal(true)}
            leftIcon={<Sliders className="h-4 w-4" />}
          >
            Notification Preferences
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            leftIcon={<CheckCheck className="h-4 w-4" />}
            className="font-bold shadow-md shadow-blue-600/20"
          >
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All Updates' },
              { id: 'applications', label: 'Scholarship Status' },
              { id: 'disbursements', label: 'Disbursements' },
              { id: 'documents', label: 'Document Vault' },
              { id: 'reminders', label: 'Deadlines & Reminders' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-blue-600 text-white shadow-md border border-transparent font-bold'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-blue-600 shadow-xs placeholder:text-slate-400 font-medium"
              />
            </div>

            <select
              value={readFilter}
              onChange={(e) => setReadFilter(e.target.value as any)}
              className="h-9 px-3 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:border-blue-600 shadow-xs cursor-pointer"
            >
              <option value="all" className="dark:bg-slate-900 dark:text-white">All Statuses</option>
              <option value="unread" className="dark:bg-slate-900 dark:text-white">Unread Only</option>
              <option value="read" className="dark:bg-slate-900 dark:text-white">Read Only</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="space-y-3">
            {filteredNotifs.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Bell className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">No notifications found</p>
                <p className="text-xs text-slate-400 mt-0.5">Try selecting a different filter category or search term.</p>
              </div>
            ) : (
              filteredNotifs.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                    !item.read
                      ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800 shadow-medium'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-medium'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="h-10 w-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center shrink-0 mt-0.5">
                      {getNotificationIcon(item.type, item.title)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                          {(item as any).sender || 'GovServe Education Automated System'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {(item as any).office || 'Quezon City Youth Development Office (QCYDO)'}
                        </span>
                        {!item.read && (
                          <span className="bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full shadow-xs">
                            NEW
                          </span>
                        )}
                      </div>

                      <h4 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white pt-0.5">
                        {item.title}
                      </h4>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-line pt-0.5">
                        {item.message}
                      </p>

                      <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-400">
                        <span className="font-medium">{formatDate(item.date || item.created_at || new Date().toISOString())}</span>
                        <span>•</span>
                        <span className="text-slate-400 text-[10px]">Official System Notice (No direct reply)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggleRead(item.id)}
                      title={item.read ? 'Mark as Unread' : 'Mark as Read'}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <CheckCheck className={`h-4 w-4 ${item.read ? 'text-slate-300 dark:text-slate-600' : 'text-blue-600 font-bold'}`} />
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(item.id)}
                      title="Delete Notification"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preferences Modal */}
      {showPreferencesModal && (
        <Modal
          isOpen={showPreferencesModal}
          onClose={() => setShowPreferencesModal(false)}
          title="Notification Delivery Preferences"
          description="Configure in-app, email, and SMS alert channels"
          footer={
            <Button variant="primary" size="sm" onClick={() => { setShowPreferencesModal(false); toast.success('Preferences saved successfully!'); }} className="font-bold">
              Save Preferences
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Email Notifications</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Receive application & disbursement summaries via email</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">SMS / Mobile Alerts</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Urgent text messages for payment disbursement</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">In-App Push Badges</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Live notifications in top header bell</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={inAppAlerts}
                onChange={(e) => setInAppAlerts(e.target.checked)}
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Quiet Hours (10:00 PM – 06:00 AM)</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Pause non-essential alerts overnight</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={quietHours}
                onChange={(e) => setQuietHours(e.target.checked)}
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-600 cursor-pointer"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <Modal
          isOpen={!!deleteTargetId}
          onClose={() => setDeleteTargetId(null)}
          title="Delete Notification"
          description="Are you sure you want to delete this notification item?"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setDeleteTargetId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={() => confirmDelete(deleteTargetId)} className="font-bold">
                Delete Notification
              </Button>
            </>
          }
        >
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            This item will be permanently removed from your Notification Center.
          </div>
        </Modal>
      )}
    </div>
  );
};
