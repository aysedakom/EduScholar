import React, { useState } from 'react';
import { CheckSquare, Square, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/cn';

interface ApplicationRow {
  id: string;
  studentName: string;
  studentId: string;
  program: string;
  amount: number;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  gwa: number;
}

const INITIAL_ROWS: ApplicationRow[] = [
  { id: 'APP-901', studentName: 'Roberto Garcia', studentId: '2026-QC-0981', program: 'QC Excel Academic Scholarship', amount: 110000, status: 'Under Review', gwa: 1.45 },
  { id: 'APP-902', studentName: 'Samantha Perez', studentId: '2026-QC-1420', program: 'QC Economic Assistance Bursary', amount: 40000, status: 'Under Review', gwa: 1.70 },
  { id: 'APP-903', studentName: 'Juan Dela Cruz', studentId: '2026-QC-0042', program: 'Dean’s Technology Innovation Grant', amount: 7500, status: 'Submitted', gwa: 1.30 },
  { id: 'APP-904', studentName: 'Maria Clara Santos', studentId: '2026-QC-0112', program: 'QC Excel Academic Scholarship', amount: 110000, status: 'Under Review', gwa: 1.50 },
  { id: 'APP-905', studentName: 'Angelica Ramos', studentId: '2026-QC-1102', program: 'QC Economic Assistance Bursary', amount: 40000, status: 'Submitted', gwa: 1.65 },
];

export const BulkActionsPage: React.FC = () => {
  const [rows, setRows] = useState<ApplicationRow[]>(INITIAL_ROWS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedIds.length === rows.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(rows.map((r) => r.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkStatus = (newStatus: 'Approved' | 'Rejected') => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least 1 application row to perform bulk action.');
      return;
    }

    setRows(
      rows.map((r) => (selectedIds.includes(r.id) ? { ...r, status: newStatus } : r))
    );
    toast.success(`Bulk Action Executed: ${selectedIds.length} applications set to ${newStatus}`);
    setSelectedIds([]);
  };

  const filteredRows = rows;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl text-slate-900">Bulk Approve & Batch Actions Console</h1>
            <Badge variant="primary">Batch Operations</Badge>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Perform mass status approvals, bulk rejections, and batch notification dispatches across application queues.
          </p>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSelectAll}
            leftIcon={selectedIds.length === rows.length ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4 text-slate-400" />}
            className="font-bold text-xs"
          >
            {selectedIds.length === rows.length ? 'Deselect All' : 'Select All'}
          </Button>

          <span className="text-xs font-bold text-slate-600">
            Selected: <strong className="text-primary font-black">{selectedIds.length}</strong> Applications
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleBulkStatus('Approved')}
            disabled={selectedIds.length === 0}
            leftIcon={<CheckCircle2 className="h-4 w-4" />}
            className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Bulk Approve Selected
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkStatus('Rejected')}
            disabled={selectedIds.length === 0}
            leftIcon={<XCircle className="h-4 w-4 text-red-500" />}
            className="font-bold text-red-600 hover:bg-red-50"
          >
            Bulk Reject Selected
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="bg-white border border-slate-200 shadow-soft overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5 pl-5 w-10">Select</th>
                  <th className="p-3.5">App Ref</th>
                  <th className="p-3.5">Student</th>
                  <th className="p-3.5">Scholarship Program</th>
                  <th className="p-3.5">GWA</th>
                  <th className="p-3.5">Award Amount</th>
                  <th className="p-3.5 text-right pr-5">Current Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredRows.map((r) => {
                  const isSelected = selectedIds.includes(r.id);
                  return (
                    <tr
                      key={r.id}
                      onClick={() => toggleSelectRow(r.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="p-3.5 pl-5">
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-primary" />
                        ) : (
                          <Square className="h-4 w-4 text-slate-300" />
                        )}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">{r.id}</td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">{r.studentName}</span>
                        <span className="text-[10px] text-slate-500">{r.studentId}</span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-800">{r.program}</td>
                      <td className="p-3.5 font-black text-emerald-700">{r.gwa.toFixed(2)}</td>
                      <td className="p-3.5 font-heading font-extrabold text-primary">{formatCurrency(r.amount)}</td>
                      <td className="p-3.5 text-right pr-5">
                        <Badge
                          variant={
                            r.status === 'Approved'
                              ? 'success'
                              : r.status === 'Rejected'
                              ? 'destructive'
                              : 'warning'
                          }
                        >
                          {r.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkActionsPage;
