import React, { useState } from 'react';
import { Zap, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface WorkflowRule {
  id: string;
  triggerEvent: string;
  actionTarget: string;
  enabled: boolean;
  templateName: string;
}

const INITIAL_RULES: WorkflowRule[] = [
  {
    id: 'RULE-01',
    triggerEvent: 'Application Approved by Officer',
    actionTarget: 'Send Automated Acceptance Email & PDF Award Letter',
    enabled: true,
    templateName: 'Template: Award_Acceptance_Official.html',
  },
  {
    id: 'RULE-02',
    triggerEvent: 'Disbursement Batch Executed',
    actionTarget: 'Send SMS Payment Confirmation to Student Mobile',
    enabled: true,
    templateName: 'Template: SMS_Disbursement_Notice.txt',
  },
  {
    id: 'RULE-03',
    triggerEvent: 'GPA Exceeds 3.80 Threshold',
    actionTarget: 'Auto-Flag "High Priority Merit" Badge in Review Queue',
    enabled: true,
    templateName: 'System Flag Rule',
  },
];

export const SystemWorkflowsPage: React.FC = () => {
  const [rules, setRules] = useState<WorkflowRule[]>(INITIAL_RULES);

  const handleToggle = (id: string) => {
    setRules(
      rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleSave = () => {
    toast.success('Automated Workflows & Trigger Rules saved successfully!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-foreground">System Workflows & Notification Triggers</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure automated email dispatches, SMS notifications, and auto-flagging compliance rules.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleSave} leftIcon={<Save className="h-4 w-4" />} className="font-bold shadow-md shadow-blue-600/20 shrink-0">
          Save Workflow Rules
        </Button>
      </div>

      {/* Rules List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Active Automation Rules
          </CardTitle>
          <CardDescription>Event-driven trigger rules</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-0 text-xs">
          {rules.map((r) => (
            <div key={r.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary">{r.id}</span>
                  <p className="font-bold text-slate-900">{r.triggerEvent}</p>
                </div>
                <p className="text-slate-600 font-medium">{r.actionTarget}</p>
                <p className="text-[11px] text-slate-400 font-mono">{r.templateName}</p>
              </div>

              <button type="button" onClick={() => handleToggle(r.id)}>
                {r.enabled ? <ToggleRight className="h-8 w-8 text-emerald-600" /> : <ToggleLeft className="h-8 w-8 text-slate-400" />}
              </button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
