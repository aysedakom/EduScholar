import React, { useState } from 'react';
import {
  Zap,
  Save,
  ToggleLeft,
  ToggleRight,
  GitBranch,
  Cpu,
  UserCheck,
  RefreshCw,
  Lock,
  CreditCard,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

interface WorkflowRule {
  id: string;
  triggerEvent: string;
  actionTarget: string;
  enabled: boolean;
  templateName: string;
  phase: string;
}

const INITIAL_RULES: WorkflowRule[] = [
  {
    id: 'RULE-01',
    triggerEvent: 'Application Approved by Officer',
    actionTarget: 'State Locking + Award Certificate & Testing Permit Dispatched',
    enabled: true,
    templateName: 'Template: Award_Acceptance_Official.html',
    phase: 'Phase 5: State Locking',
  },
  {
    id: 'RULE-02',
    triggerEvent: 'Incomplete / Unclear Attachment Flagged',
    actionTarget: 'Trigger 5-Day Amendment Sub-Flow with Countdown Timer',
    enabled: true,
    templateName: 'Template: 5Day_Amendment_Notice.html',
    phase: 'Phase 4: Amendment Sub-Flow',
  },
  {
    id: 'RULE-03',
    triggerEvent: 'Unlisted School Selected by Applicant',
    actionTarget: 'Route to Special Eligibility Review Queue with COE Upload',
    enabled: true,
    templateName: 'Exception Trigger: School_Validation.json',
    phase: 'Phase 1: Registration',
  },
  {
    id: 'RULE-04',
    triggerEvent: 'Duplicate QCID or Mismatched Name Detected',
    actionTarget: 'Auto-Flag Fraud Alert & Route to LGU Audit Committee',
    enabled: true,
    templateName: 'Security Trigger: Fraud_Detection_Alert.json',
    phase: 'Phase 2: Automated Ingestion',
  },
  {
    id: 'RULE-05',
    triggerEvent: 'Disbursement Batch Executed',
    actionTarget: 'Drawdown from Council Ordinance Fund + Multi-Channel Settlement Notice',
    enabled: true,
    templateName: 'Template: Treasury_Settlement_Receipt.html',
    phase: 'Phase 6: Batch Disbursement',
  },
];

export const SystemWorkflowsPage: React.FC = () => {
  const [rules, setRules] = useState<WorkflowRule[]>(INITIAL_RULES);
  const [activePhase, setActivePhase] = useState<number | null>(null);

  const handleToggle = (id: string) => {
    setRules(
      rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleSave = () => {
    toast.success('Automated Workflows & Trigger Rules saved successfully!');
  };

  const phases = [
    {
      num: 1,
      title: 'Registration & School Validation',
      icon: Building2,
      color: 'blue',
      nodes: ['PSGC & DepEd DB Check', 'School Validation Exception Flow', 'MIME, Size & SHA-256 Check'],
      desc: 'Validates QC residency, checks school registry, or routes unlisted schools to Special Eligibility review with COE upload.',
    },
    {
      num: 2,
      title: 'Automated Ingestion & Fraud Pre-Check',
      icon: Cpu,
      color: 'indigo',
      nodes: ['Automated OCR Engine', 'Household Relations Check', 'Fraud Audit Escalation'],
      desc: 'Cross-checks duplicate personal IDs and household claims before human evaluation.',
    },
    {
      num: 3,
      title: 'Unified Human Admin Review Queue',
      icon: UserCheck,
      color: 'purple',
      nodes: ['Multi-Criteria Evaluation', 'Evaluator Resolution Notes', 'Formal Rejection Email Breakdown'],
      desc: 'Consolidated human scoring of residency, GWA, and income thresholds.',
    },
    {
      num: 4,
      title: 'Appeal / 5-Day Amendment Sub-Flow',
      icon: RefreshCw,
      color: 'amber',
      nodes: ['Dedicated Correction Dashboard', '5-Day Live Countdown', 'Target Missing Item Only'],
      desc: 'Retains all prior form entries while targeting only the incomplete requirement within a 5-day window.',
    },
    {
      num: 5,
      title: 'State Locking & Allocation Gating',
      icon: Lock,
      color: 'emerald',
      nodes: ['Record Lock Enforced', 'Quota Slot Assigned', 'Exam Schedule / Grant Voucher Unlocked'],
      desc: 'Locks applicant profile against direct edits, assigns cohort quota slot, and unlocks exam permits/vouchers.',
    },
    {
      num: 6,
      title: 'Batch Disbursement & COA Settlement',
      icon: CreditCard,
      color: 'teal',
      nodes: ['Ordinance Fund Drawdown', 'Multi-Channel Payroll (Landbank/GCash/Cash)', 'Digital Receipt + COA Trail'],
      desc: 'Executes treasury batch settlement through direct tuition grant, Landbank/GCash payroll, or on-site cash claim.',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
              End-to-End System Workflow & Automation Engine
            </h1>
            <Badge variant="primary" className="text-[10px]">
              6-Phase Architecture
            </Badge>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Visual governance architecture aligned with UCC / QCYDO local government scholarship lifecycle and automated triggers.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleSave}
          leftIcon={<Save className="h-4 w-4" />}
          className="font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 shrink-0"
        >
          Save Workflow Settings
        </Button>
      </div>

      {/* 6-Phase Interactive Architecture Blueprint */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Scholarship Application Lifecycle Blueprint
          </CardTitle>
          <CardDescription>
            Live representation of the 6 operational phases mapped from registration to treasury settlement.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {phases.map((phase) => {
              const Icon = phase.icon;
              const isSelected = activePhase === phase.num;
              return (
                <div
                  key={phase.num}
                  onClick={() => setActivePhase(isSelected ? null : phase.num)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Phase {phase.num}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[9px] py-0">
                      Active
                    </Badge>
                  </div>

                  <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white">
                    {phase.title}
                  </h3>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                    {phase.desc}
                  </p>

                  <div className="space-y-1 pt-2 border-t border-slate-200/80 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Core Checkpoints:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {phase.nodes.map((node, nIdx) => (
                        <span
                          key={nIdx}
                          className="text-[10px] bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-semibold"
                        >
                          {node}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Rules List */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Automated Lifecycle Triggers & System Rules
          </CardTitle>
          <CardDescription>Event-driven trigger rules attached to each phase</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-4 text-xs">
          {rules.map((r) => (
            <div
              key={r.id}
              className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{r.id}</span>
                  <Badge variant="outline" className="text-[9px]">
                    {r.phase}
                  </Badge>
                  <p className="font-bold text-slate-900 dark:text-white">{r.triggerEvent}</p>
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-medium">{r.actionTarget}</p>
                <p className="text-[11px] text-slate-400 font-mono">{r.templateName}</p>
              </div>

              <button
                type="button"
                onClick={() => handleToggle(r.id)}
                className="cursor-pointer self-end sm:self-center"
              >
                {r.enabled ? (
                  <ToggleRight className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-slate-400" />
                )}
              </button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemWorkflowsPage;
