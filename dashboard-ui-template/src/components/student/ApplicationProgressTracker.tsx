import React from 'react';
import {
  FileText,
  Clock,
  Award,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const ApplicationProgressTracker: React.FC = () => {
  const steps = [
    {
      id: 1,
      title: 'Application Submitted',
      description: 'Documents uploaded and initial submission confirmed.',
      status: 'completed',
      date: 'September 5, 2026',
    },
    {
      id: 2,
      title: 'Biometric & Document Review',
      description: 'School registrar and QCYDO screening evaluation.',
      status: 'completed',
      date: 'September 12, 2026',
    },
    {
      id: 3,
      title: 'School Endorsement',
      description: 'Bestlink College of the Philippines officially certified standing.',
      status: 'completed',
      date: 'September 15, 2026',
    },
    {
      id: 4,
      title: 'Award Conferred & Certified',
      description: 'Conferred Official Government Scholar in Active Good Standing.',
      status: 'completed',
      date: 'September 19, 2026',
    },
    {
      id: 5,
      title: 'Disbursement Settlement',
      description: 'Scheduled Treasury payout batch settlement.',
      status: 'current',
      date: 'Pending Treasury Release',
    },
  ];

  return (
    <Card className="overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <FileText className="h-4 w-4" />
              </span>
              <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                Application Status & Qualification Pipeline
              </h3>
              <Badge variant="success" size="sm">
                Approved Tier
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Economic Scholarship (Need-Based Financial Assistance) • Application No:{' '}
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                QCSP-2026-APP-88491
              </span>
            </p>
          </div>

          <Button variant="outline" size="sm" className="font-bold text-xs shrink-0">
            <span>View Full Details</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Horizontal Pipeline Steps */}
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {steps.map((step, idx) => {
              const isCompleted = step.status === 'completed';
              const isCurrent = step.status === 'current';

              return (
                <div key={step.id} className="relative flex flex-col items-start sm:items-center text-left sm:text-center space-y-2 group">
                  {/* Step Icon Badge */}
                  <div
                    className={`h-10 w-10 rounded-2xl flex items-center justify-center font-black text-xs transition-all ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-950 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : isCurrent ? (
                      <Clock className="h-5 w-5 animate-spin" />
                    ) : (
                      idx + 1
                    )}
                  </div>

                  {/* Text Details */}
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {step.description}
                    </p>
                    <span className="text-[10px] font-mono font-semibold text-blue-600 dark:text-blue-400 block pt-1">
                      {step.date}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Grant Summary Banner */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">
                Grant Allocation: ₱10,000.00 / Semester
              </p>
              <p className="text-slate-500 text-[11px]">
                Direct payout via Landbank ATM card or verified GCash e-wallet.
              </p>
            </div>
          </div>

          <Badge variant="primary" size="sm" className="shrink-0 self-start sm:self-auto">
            Batch Payout #2 Ready
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
