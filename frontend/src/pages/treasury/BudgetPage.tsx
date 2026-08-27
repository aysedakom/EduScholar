import React, { useState } from 'react';
import { WalletCards, Landmark, Plus, DollarSign, Percent } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { formatCurrency } from '../../utils/cn';

interface BudgetAllocation {
  id: string;
  programName: string;
  totalBudget: number;
  disbursed: number;
  fiscalYear: string;
}

const INITIAL_BUDGETS: BudgetAllocation[] = [
  {
    id: 'BDG-01',
    programName: 'QC Presidential Merit Scholarship Pool',
    totalBudget: 25000000,
    disbursed: 18500000,
    fiscalYear: 'FY 2026',
  },
  {
    id: 'BDG-02',
    programName: 'QCYDO College Financial Assistance Fund',
    totalBudget: 40000000,
    disbursed: 32000000,
    fiscalYear: 'FY 2026',
  },
  {
    id: 'BDG-03',
    programName: 'QC Tertiary Continuing Education Aid Pool',
    totalBudget: 15000000,
    disbursed: 9200000,
    fiscalYear: 'FY 2026',
  },
];

export const BudgetPage: React.FC = () => {
  const [budgets, setBudgets] = useState<BudgetAllocation[]>(INITIAL_BUDGETS);
  const [showModal, setShowModal] = useState(false);
  const [progName, setProgName] = useState('');
  const [amount, setAmount] = useState('5000000');
  const [fy, setFy] = useState('FY 2026');

  // Sum calculations
  const totalAllocated = budgets.reduce((acc, curr) => acc + curr.totalBudget, 0);
  const totalDisbursed = budgets.reduce((acc, curr) => acc + curr.disbursed, 0);
  const totalRemaining = totalAllocated - totalDisbursed;
  const utilizationRate = totalAllocated > 0 ? (totalDisbursed / totalAllocated) * 100 : 0;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!progName || !amount) {
      toast.error('Please enter a valid program name and allocation amount.');
      return;
    }
    const newBdg: BudgetAllocation = {
      id: `BDG-0${budgets.length + 1}`,
      programName: progName,
      totalBudget: Number(amount),
      disbursed: 0,
      fiscalYear: fy,
    };
    setBudgets([...budgets, newBdg]);
    setShowModal(false);
    setProgName('');
    toast.success('Budget Allocation created successfully!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0">
              <WalletCards className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-2xl text-foreground">Treasury & Budget Management</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Monitor capital allocations, track disbursements, and approve emergency fund pools.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowModal(true)}
            leftIcon={<Plus className="h-4 w-4" />}
            className="font-bold shrink-0"
          >
            Create Allocation Pool
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card hoverEffect>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Total Budget Allocated</p>
              <p className="font-heading font-extrabold text-2xl text-slate-900 mt-0.5">{formatCurrency(totalAllocated)}</p>
              <p className="text-[11px] text-slate-500 mt-1">Across {budgets.length} Funds</p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
              <Landmark className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Total Disbursed</p>
              <p className="font-heading font-extrabold text-2xl text-emerald-600 mt-0.5">{formatCurrency(totalDisbursed)}</p>
              <p className="text-[11px] text-slate-500 mt-1">Paid to Scholars & Schools</p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Remaining Capital</p>
              <p className="font-heading font-extrabold text-2xl text-slate-900 mt-0.5">{formatCurrency(totalRemaining)}</p>
              <p className="text-[11px] text-slate-500 mt-1">Uncommitted Reserves</p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200">
              <WalletCards className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Utilization Rate</p>
              <p className="font-heading font-extrabold text-2xl text-blue-600 mt-0.5">{utilizationRate.toFixed(1)}%</p>
              <p className="text-[11px] text-slate-500 mt-1">Disbursement Pace</p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
              <Percent className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Allocation List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-heading font-bold text-slate-900 text-sm">Budget Allocation Breakdown</h2>
          <Badge variant="primary">{fy}</Badge>
        </div>
        <div className="overflow-x-auto text-xs">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 text-[10px] uppercase tracking-wider font-semibold">
                <th className="p-4 text-left">Fund ID</th>
                <th className="p-4 text-left">Program / Allocation Pool</th>
                <th className="p-4 text-right">Total Allocated</th>
                <th className="p-4 text-right">Total Disbursed</th>
                <th className="p-4 text-right">Remaining</th>
                <th className="p-4 text-center">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {budgets.map((b) => {
                const util = (b.disbursed / b.totalBudget) * 100;
                return (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono font-bold text-slate-500">{b.id}</td>
                    <td className="p-4 font-semibold text-slate-800">{b.programName}</td>
                    <td className="p-4 text-right font-bold">{formatCurrency(b.totalBudget)}</td>
                    <td className="p-4 text-right font-bold text-emerald-600">{formatCurrency(b.disbursed)}</td>
                    <td className="p-4 text-right font-bold text-slate-700">{formatCurrency(b.totalBudget - b.disbursed)}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                          <div className="bg-blue-600 h-full" style={{ width: `${util}%` }} />
                        </div>
                        <span className="font-bold text-slate-700">{util.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Create Budget Allocation Pool"
          description="Allocate City funds to specific scholarship programs."
          footer={
            <div className="flex gap-2 w-full justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleCreate} className="font-bold">
                Allocate Funds
              </Button>
            </div>
          }
        >
          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <Input
              id="bdg-name"
              label="Scholarship/Bursary Program Name"
              value={progName}
              onChange={(e) => setProgName(e.target.value)}
              placeholder="e.g. Quezon City PWD Educational Assistance"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="bdg-amount"
                label="Allocated Capital (PHP)"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <Input
                id="bdg-fy"
                label="Fiscal Year"
                value={fy}
                onChange={(e) => setFy(e.target.value)}
                required
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
