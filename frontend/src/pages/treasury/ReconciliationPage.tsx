import React, { useState } from 'react';
import { RefreshCw, CheckCircle, AlertTriangle, ArrowDownToLine } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/cn';

interface Transaction {
  id: string;
  studentName: string;
  amount: number;
  channel: 'GCash' | 'Bank Transfer';
  referenceNo: string;
  status: 'Matched' | 'Pending Verification' | 'Discrepancy';
  disbursedDate: string;
}

const INITIAL_TXS: Transaction[] = [
  {
    id: 'TX-001',
    studentName: 'Alexandra Chen',
    amount: 12500,
    channel: 'GCash',
    referenceNo: 'GCASH-9920148A',
    status: 'Matched',
    disbursedDate: '2026-08-05',
  },
  {
    id: 'TX-002',
    studentName: 'Roberto Gomez',
    amount: 7500,
    channel: 'Bank Transfer',
    referenceNo: 'LBP-1029482X',
    status: 'Pending Verification',
    disbursedDate: '2026-08-06',
  },
  {
    id: 'TX-003',
    studentName: 'Julian Alvarez',
    amount: 15000,
    channel: 'GCash',
    referenceNo: 'GCASH-8819402B',
    status: 'Discrepancy',
    disbursedDate: '2026-08-04',
  },
];

export const ReconciliationPage: React.FC = () => {
  const [txs, setTxs] = useState<Transaction[]>(INITIAL_TXS);
  const [isReconciling, setIsReconciling] = useState(false);

  const handleReconcile = () => {
    setIsReconciling(true);
    setTimeout(() => {
      setTxs(txs.map(t => t.status === 'Pending Verification' ? { ...t, status: 'Matched' } : t));
      setIsReconciling(false);
      toast.success('Manual reconciliation completed successfully! 1 transaction verified.');
    }, 1200);
  };

  const handleExport = () => {
    toast.success('Reconciliation report compiled and downloaded successfully.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0">
              <RefreshCw className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-2xl text-foreground">Disbursement Reconciliation</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Verify GCash and Landbank ledger payouts against City treasury statements.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              leftIcon={<ArrowDownToLine className="h-4 w-4" />}
              className="font-bold shrink-0"
            >
              Export Statement
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleReconcile}
              disabled={isReconciling}
              leftIcon={<RefreshCw className={`h-4 w-4 ${isReconciling ? 'animate-spin' : ''}`} />}
              className="font-bold shrink-0"
            >
              {isReconciling ? 'Matching Ledger...' : 'Run Auto Match'}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Widget */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Matched</span>
          <span className="text-2xl font-black text-emerald-700 mt-1">
            {txs.filter(t => t.status === 'Matched').length} / {txs.length}
          </span>
        </div>
        <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">Pending Match</span>
          <span className="text-2xl font-black text-amber-700 mt-1">
            {txs.filter(t => t.status === 'Pending Verification').length}
          </span>
        </div>
        <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-2xl flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold text-rose-800 tracking-wider">Discrepancy Flags</span>
          <span className="text-2xl font-black text-rose-700 mt-1">
            {txs.filter(t => t.status === 'Discrepancy').length}
          </span>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-heading font-bold text-slate-900 text-sm">Disbursement Registry & Match Ledger</h2>
        </div>
        <div className="overflow-x-auto text-xs">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 text-[10px] uppercase tracking-wider font-semibold">
                <th className="p-4 text-left">Record ID</th>
                <th className="p-4 text-left">Scholar</th>
                <th className="p-4 text-right">Disbursed Amount</th>
                <th className="p-4 text-left">Channel</th>
                <th className="p-4 text-left">Bank Ref No</th>
                <th className="p-4 text-left">Matched Date</th>
                <th className="p-4 text-center">Reconciliation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {txs.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-mono font-bold text-slate-500">{t.id}</td>
                  <td className="p-4 font-semibold text-slate-800">{t.studentName}</td>
                  <td className="p-4 text-right font-bold text-slate-950">{formatCurrency(t.amount)}</td>
                  <td className="p-4 text-slate-600 font-medium">{t.channel}</td>
                  <td className="p-4 font-mono font-semibold text-slate-700">{t.referenceNo}</td>
                  <td className="p-4 text-slate-500 font-medium">{t.disbursedDate}</td>
                  <td className="p-4">
                    <div className="flex justify-center">
                      <Badge
                        variant={
                          t.status === 'Matched'
                            ? 'success'
                            : t.status === 'Discrepancy'
                            ? 'destructive'
                            : 'warning'
                        }
                      >
                        <span className="flex items-center gap-1">
                          {t.status === 'Matched' ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : t.status === 'Discrepancy' ? (
                            <AlertTriangle className="h-3 w-3" />
                          ) : (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          )}
                          {t.status}
                        </span>
                      </Badge>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
