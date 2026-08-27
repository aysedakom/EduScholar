import React, { useState } from 'react';
import { Search, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

interface LogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  type: 'Audit' | 'Error' | 'Security Alert' | 'Slow Query';
  ipAddress: string;
}

const INITIAL_LOGS: LogEntry[] = [
  {
    id: 'LOG-8801',
    timestamp: '2026-08-09 15:42:10',
    user: 'Dr. Robert Vance (Admin)',
    action: 'Approved Disbursement Batch #PAY-2026-08 ($145,000)',
    type: 'Audit',
    ipAddress: '192.168.1.45',
  },
  {
    id: 'LOG-8802',
    timestamp: '2026-08-09 14:20:05',
    user: 'Elena Rostova (Validator)',
    action: 'Bulk Verified 6 Applicant Enrollment Files',
    type: 'Audit',
    ipAddress: '192.168.1.88',
  },
  {
    id: 'LOG-8803',
    timestamp: '2026-08-09 12:15:30',
    user: 'System Process',
    action: 'PostgreSQL Query Latency exceeded 120ms (Slow Query Monitor)',
    type: 'Slow Query',
    ipAddress: '127.0.0.1',
  },
  {
    id: 'LOG-8804',
    timestamp: '2026-08-09 10:05:00',
    user: 'Unknown (Attempted)',
    action: 'Failed Admin Password Login Attempt',
    type: 'Security Alert',
    ipAddress: '110.54.21.90',
  },
];

export const SystemLogsPage: React.FC = () => {
  const [logs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = logs.filter((l) => {
    const matchesSearch =
      l.user.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.id.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || l.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleExportLogs = () => {
    toast.success('Exported Audit & System Logs (CSV log report)');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-foreground">Audit Trails & System Logs</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time security event monitoring, administrative action audit trails, and error logs.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleExportLogs} leftIcon={<Download className="h-4 w-4" />} className="font-bold shadow-md shadow-blue-600/20 shrink-0">
          Export Logs CSV
        </Button>
      </div>

      {/* Table & Filter Bar */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search user or event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary shadow-xs"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {['all', 'Audit', 'Security Alert', 'Slow Query', 'Error'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  filterType === t
                    ? 'bg-primary border-transparent text-white shadow-md font-bold'
                    : 'bg-white border-slate-200 text-slate-700 shadow-xs hover:bg-slate-50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase group-label border-b border-border">
                <tr>
                  <th className="p-3">Log ID & Timestamp</th>
                  <th className="p-3">User Account</th>
                  <th className="p-3">Event Action Description</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/70">
                    <td className="p-3">
                      <span className="font-mono font-bold text-primary block">{l.id}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{l.timestamp}</span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">{l.user}</td>
                    <td className="p-3 text-slate-700 font-medium">{l.action}</td>
                    <td className="p-3">
                      <Badge
                        variant={
                          l.type === 'Audit'
                            ? 'success'
                            : l.type === 'Security Alert'
                            ? 'destructive'
                            : 'warning'
                        }
                      >
                        {l.type}
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-mono text-slate-500">{l.ipAddress}</td>
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
