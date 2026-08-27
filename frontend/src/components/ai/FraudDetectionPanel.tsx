import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface FraudAlertItem {
  id: string;
  studentName: string;
  studentId: string;
  riskType: 'Duplicate Application' | 'Tampered COR Document' | 'GPA Anomaly';
  riskScore: number;
  description: string;
  timestamp: string;
  status: 'Pending Audit' | 'Dismissed' | 'Escalated';
}

const INITIAL_FRAUD_ALERTS: FraudAlertItem[] = [
  {
    id: 'FRD-109',
    studentName: 'Julian Santos',
    studentId: '2024-90421',
    riskType: 'Duplicate Application',
    riskScore: 88,
    description: 'Submitted 2 simultaneous applications for QC Local Grant using alternate email addresses.',
    timestamp: '2026-08-09 14:10',
    status: 'Pending Audit',
  },
  {
    id: 'FRD-110',
    studentName: 'K. Ramos',
    studentId: '2025-11092',
    riskType: 'Tampered COR Document',
    riskScore: 92,
    description: 'OCR Vision engine detected modified pixel signatures on uploaded University COR PDF.',
    timestamp: '2026-08-09 11:45',
    status: 'Pending Audit',
  },
];

export const FraudDetectionPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<FraudAlertItem[]>(INITIAL_FRAUD_ALERTS);

  const handleDismiss = (id: string) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, status: 'Dismissed' } : a)));
    toast.info(`Alert ${id} marked as reviewed & dismissed.`);
  };

  const handleEscalate = (id: string) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, status: 'Escalated' } : a)));
    toast.error(`Alert ${id} escalated to Super Admin Security Officer for investigation.`);
  };

  return (
    <Card className="bg-white shadow-soft">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2 text-rose-700">
          <ShieldAlert className="h-5 w-5 text-rose-600" />
          AI Anomaly & Fraud Risk Detection Monitor
        </CardTitle>
        <CardDescription>Automated threat engine flagging duplicate applications and tampered document uploads</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 pt-0 text-xs">
        {alerts.map((alt) => (
          <div key={alt.id} className="p-4 bg-slate-50 rounded-2xl space-y-2 shadow-xs hover:shadow-soft transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-rose-600">{alt.id}</span>
                <span className="font-bold text-slate-900">{alt.studentName} ({alt.studentId})</span>
              </div>
              <Badge variant={alt.riskScore > 90 ? 'destructive' : 'warning'} size="sm">
                {alt.riskScore}% Threat Risk
              </Badge>
            </div>

            <p className="text-slate-700 font-medium">{alt.description}</p>
            <p className="text-[11px] text-slate-400 font-mono">{alt.timestamp} • Type: {alt.riskType}</p>

            {alt.status === 'Pending Audit' && (
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => handleDismiss(alt.id)}>
                  Dismiss False Positive
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleEscalate(alt.id)}>
                  Escalate Risk
                </Button>
              </div>
            )}

            {alt.status !== 'Pending Audit' && (
              <div className="pt-2 text-right">
                <Badge variant={alt.status === 'Dismissed' ? 'info' : 'destructive'} size="sm">
                  Status: {alt.status}
                </Badge>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
