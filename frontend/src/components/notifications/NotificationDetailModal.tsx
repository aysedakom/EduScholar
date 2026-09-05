import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ExternalLink,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { formatDate } from '../../utils/cn';
import type { AppNotification } from '../../types';
import { getNotificationDestination } from '../../utils/systemNotifications';

interface NotificationDetailModalProps {
  notification: AppNotification | null;
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

export const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  notification,
  isOpen,
  onClose,
  userRole,
}) => {
  const navigate = useNavigate();

  if (!notification) return null;

  const dest = getNotificationDestination(notification, userRole);

  const handleNavigate = () => {
    onClose();
    if (dest.link) {
      navigate(dest.link);
    }
  };

  const getStatusIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />;
      default:
        return <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="xl"
      footer={
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 w-full">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            className="w-full sm:w-auto font-bold text-xs"
          >
            Close
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleNavigate}
            rightIcon={<ArrowRight className="h-4 w-4" />}
            className="w-full sm:w-auto font-black text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30 px-5 cursor-pointer"
          >
            {dest.actionLabel}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 pt-1">
        {/* Header Ribbon */}
        <div className="flex items-start gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
          <div className="h-11 w-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center shrink-0 shadow-xs">
            {getStatusIcon()}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-950 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                {(notification as any).sender || 'GovServe Education Automated System'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {(notification as any).office || 'Quezon City Youth Development Office (QCYDO)'}
              </span>
            </div>

            <h3 className="font-heading font-black text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
              {notification.title}
            </h3>

            <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-400" />
                {formatDate(notification.date || notification.created_at || new Date().toISOString())}
              </span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Official Verified Notice
              </span>
            </div>
          </div>
        </div>

        {/* Message Content Container */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Notice Message Details:
          </span>
          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-relaxed font-sans whitespace-pre-line select-text">
            {notification.message}
          </p>
        </div>

        {/* Destination Routing Card */}
        <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Layers className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold text-blue-900 dark:text-blue-200 leading-tight">
                {dest.contextHint}
              </p>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 truncate font-mono">
                {dest.link}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleNavigate}
            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 shrink-0 cursor-pointer"
          >
            Visit Now <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
