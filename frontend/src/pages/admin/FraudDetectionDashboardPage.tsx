import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

interface FraudAlert {
  id: string;
  studentName: string;
  studentId: string;
  alertType: 'Duplicate Application' | 'Forged Document' | 'GPA Mismatch' | 'Income Mismatch' | 'Plagiarism';
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Pending Review' | 'Resolved' | 'False Alarm';
  timestamp: string;
}

const INITIAL_ALERTS: FraudAlert[] = [
  {
    id: 'ALT-101',
    studentName: 'Roberto Garcia',
    studentId: '2026-QC-0981',
    alertType: 'Duplicate Application',
    description: 'Submitted 2 identical applications to QC Excel Academic & Economic grants within 5 minutes.',
    severity: 'High',
    status: 'Pending Review',
    timestamp: '2026-08-10 14:22',
  },
  {
    id: 'ALT-102',
    studentName: 'Samantha Perez',
    studentId: '2026-QC-1420',
    alertType: 'GPA Mismatch',
    description: 'OCR extracted GWA of 2.10 from PDF transcript, but profile claimed 1.25.',
    severity: 'Critical',
    status: 'Pending Review',
    timestamp: '2026-08-10 11:05',
  },
  {
    id: 'ALT-103',
    studentName: 'Juan Dela Cruz',
    studentId: '2026-QC-0042',
    alertType: 'Forged Document',
    description: 'Exifr metadata indicates Photoshop CC image editing artifacts on Income Tax Return.',
    severity: 'Critical',
    status: 'Pending Review',
    timestamp: '2026-08-09 18:40',
  },
  {
    id: 'ALT-104',
    studentName: 'Maria Clara Santos',
    studentId: '2026-QC-0112',
    alertType: 'Plagiarism',
    description: 'Personal essay matched 94% similarity against previously submitted scholarship essay.',
    severity: 'Medium',
    status: 'Pending Review',
    timestamp: '2026-08-09 09:15',
  },
];

export const FraudDetectionDashboardPage: React.FC = () => {
  const [alerts, setAlerts] = useState<FraudAlert[]>(INITIAL_ALERTS);
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const handleResolve = (id: string, action: 'Resolved' | 'False Alarm') => {
    setAlerts(
      alerts.map((a) => (a.id === id ? { ...a, status: action } : a))
    );
    toast.success(`Alert ${id} marked as ${action}`);
  };

  const filteredAlerts = alerts.filter((a) => {
    const matchesSearch =
      a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.alertType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSev = filterSeverity === 'All' || a.severity === filterSeverity;
    return matchesSearch && matchesSev;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl text-slate-900">AI Fraud & Compliance Dashboard</h1>
            <Badge variant="destructive">Security AI</Badge>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Real-time automated flags for duplicate applications, OCR discrepancies, metadata forgery, and essay plagiarism.
          </p>
        </div>
      </div>

      {/* Stats Widget */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-red-50/70 border border-red-200 rounded-2xl">
          <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider block">Critical Flags</span>
          <span className="text-2xl font-black text-red-700 mt-1 block">
            {alerts.filter((a) => a.severity === 'Critical' && a.status === 'Pending Review').length}
          </span>
        </div>
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">High Severity</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">
            {alerts.filter((a) => a.severity === 'High' && a.status === 'Pending Review').length}
          </span>
        </div>
        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl">
          <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Pending Resolution</span>
          <span className="text-2xl font-black text-blue-700 mt-1 block">
            {alerts.filter((a) => a.status === 'Pending Review').length}
          </span>
        </div>
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Resolved Today</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            {alerts.filter((a) => a.status !== 'Pending Review').length}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, ID, or alert type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['All', 'Critical', 'High', 'Medium'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                filterSeverity === sev
                  ? 'bg-primary border-transparent text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Table */}
      <Card className="bg-white border border-slate-200 shadow-soft overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5 pl-5">Alert ID & Timestamp</th>
                  <th className="p-3.5">Student</th>
                  <th className="p-3.5">Flag Category</th>
                  <th className="p-3.5">Severity</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5 text-right pr-5">Resolution Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredAlerts.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-5">
                      <span className="font-bold text-slate-900 block">{a.id}</span>
                      <span className="text-[10px] text-slate-500">{a.timestamp}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 block">{a.studentName}</span>
                      <span className="text-[10px] text-slate-500">{a.studentId}</span>
                    </td>
                    <td className="p-3.5">
                      <Badge variant={a.alertType === 'Forged Document' || a.alertType === 'GPA Mismatch' ? 'destructive' : 'warning'}>
                        {a.alertType}
                      </Badge>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`font-bold text-[11px] px-2.5 py-0.5 rounded-full border ${
                          a.severity === 'Critical'
                            ? 'bg-red-100 text-red-800 border-red-200'
                            : a.severity === 'High'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-blue-100 text-blue-800 border-blue-200'
                        }`}
                      >
                        {a.severity}
                      </span>
                    </td>
                    <td className="p-3.5 max-w-xs text-slate-600 leading-relaxed">
                      {a.description}
                    </td>
                    <td className="p-3.5 text-right pr-5">
                      {a.status === 'Pending Review' ? (
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResolve(a.id, 'False Alarm')}
                            className="font-bold text-xs"
                          >
                            Dismiss
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleResolve(a.id, 'Resolved')}
                            className="font-bold text-xs bg-red-600 hover:bg-red-700 text-white"
                          >
                            Flag / Reject
                          </Button>
                        </div>
                      ) : (
                        <Badge variant={a.status === 'Resolved' ? 'destructive' : 'success'}>
                          {a.status}
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FraudDetectionDashboardPage;
