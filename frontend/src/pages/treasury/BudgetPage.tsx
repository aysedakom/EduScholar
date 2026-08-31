import React, { useState, useEffect } from 'react';
import { WalletCards, Landmark, Plus, DollarSign, Percent, CheckCircle2, Clock, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { formatCurrency } from '../../utils/cn';
import {
  getFundPools,
  getDrawdownRequests,
  updateDrawdownStatus,
  createFundPool,
  type FundPoolItem,
  type DrawdownRequestItem,
} from '../../api/funds';

export const BudgetPage: React.FC = () => {
  const [funds, setFunds] = useState<FundPoolItem[]>([]);
  const [drawdowns, setDrawdowns] = useState<DrawdownRequestItem[]>([]);

  // Create Allocation Pool Modal
  const [showModal, setShowModal] = useState(false);
  const [progName, setProgName] = useState('');
  const [funderAgency, setFunderAgency] = useState('Quezon City Local School Board & City Treasury');
  const [amount, setAmount] = useState('10000000');
  const [fy, setFy] = useState('FY 2026-2027');

  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = async () => {
    try {
      const [poolsRes, drawdownsRes] = await Promise.all([getFundPools(), getDrawdownRequests()]);
      if (poolsRes.data?.data) {
        setFunds(poolsRes.data.data);
      }
      if (drawdownsRes.data?.data) {
        setDrawdowns(drawdownsRes.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load fund allocation data');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Aggregates
  const totalAllocated = funds.reduce((acc, curr) => acc + curr.total_budget, 0);
  const totalDisbursed = funds.reduce((acc, curr) => acc + curr.disbursed_amount, 0);
  const totalCommitted = funds.reduce((acc, curr) => acc + curr.committed_amount, 0);
  const totalRemaining = funds.reduce((acc, curr) => acc + curr.remaining_balance, 0);
  const utilizationRate = totalAllocated > 0 ? (totalDisbursed / totalAllocated) * 100 : 0;

  const handleCreatePool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progName || !amount) {
      toast.error('Please enter a valid program name and allocation amount.');
      return;
    }

    try {
      const res = await createFundPool({
        name: progName,
        funder_agency: funderAgency,
        total_budget: parseFloat(amount),
        fiscal_year: fy,
        revenue_source: 'QC Local Appropriations Ordinance',
        status: 'Active',
      });

      if (res.data?.data) {
        setFunds((prev) => [res.data.data, ...prev]);
        setShowModal(false);
        setProgName('');
        toast.success(`Fund Allocation Pool "${progName}" created successfully!`);
      }
    } catch (err) {
      toast.error('Failed to create fund allocation pool');
    }
  };

  const handleAuthorizeDrawdown = async (reqId: string) => {
    setIsProcessing(true);
    try {
      const res = await updateDrawdownStatus(reqId, 'Transferred & Credited', 'Authorized by City Treasury Disbursing Officer');
      toast.success(res.data?.message || 'Grant funds successfully released and credited to active scholarship vault!');
      await loadData();
    } catch (err) {
      toast.error('Failed to authorize drawdown request');
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingRequests = drawdowns.filter((d) => d.status !== 'Transferred & Credited');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800 shrink-0 shadow-xs">
              <WalletCards className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
                  Treasury & Budget Management
                </h1>
                <Badge variant="primary" size="sm">
                  FY 2026-2027
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Review and approve Admin Grant Funding requests, authorize disbursement tranches, and track fund allocations.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowModal(true)}
              leftIcon={<Plus className="h-4 w-4" />}
              className="font-bold shrink-0 text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Allocation Pool
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverEffect className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-soft">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Budget Allocated</p>
              <p className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white mt-0.5">
                {formatCurrency(totalAllocated)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Across {funds.length} Active Fund Pools</p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
              <Landmark className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-soft">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Disbursed</p>
              <p className="font-heading font-extrabold text-2xl text-emerald-600 dark:text-emerald-400 mt-0.5">
                {formatCurrency(totalDisbursed)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Paid to Scholars & Partner Schools</p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-soft">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Committed & In-Review</p>
              <p className="font-heading font-extrabold text-2xl text-amber-600 dark:text-amber-400 mt-0.5">
                {formatCurrency(totalCommitted)}
              </p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
                {pendingRequests.length} Pending Grant Pull Requests
              </p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-soft">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Remaining Capital</p>
              <p className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white mt-0.5">
                {formatCurrency(totalRemaining)}
              </p>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-medium">
                {utilizationRate.toFixed(1)}% Utilization Pace
              </p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
              <Percent className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: INCOMING ADMIN GRANT & DRAWDOWN PULL REQUESTS                    */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-white to-transparent dark:from-blue-950/20 dark:via-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Send className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-slate-900 dark:text-white text-sm">
                Incoming Admin Grant & Funding Drawdown Requests
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Grant funding requests submitted by Scholarship Board Administrators for Treasury release authorization
              </p>
            </div>
          </div>
          <Badge variant={pendingRequests.length > 0 ? 'warning' : 'success'} size="sm">
            {pendingRequests.length} Pending Authorization
          </Badge>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-[10px] uppercase tracking-wider font-semibold">
                <th className="p-4 text-left">Request ID / Voucher</th>
                <th className="p-4 text-left">Fund Source & Tranche</th>
                <th className="p-4 text-right">Requested Amount</th>
                <th className="p-4 text-left">Target Beneficiaries</th>
                <th className="p-4 text-left">Submitted Date</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Treasury Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {drawdowns.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                    <div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white block">{d.id}</span>
                      <span className="font-mono text-[10px] text-slate-400">{d.voucher_number}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">{d.fund_name}</span>
                      <span className="text-[10px] text-slate-500">{d.tranche_name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right font-black text-slate-950 dark:text-emerald-400">
                    {formatCurrency(d.requested_amount)}
                  </td>
                  <td className="p-4">
                    <span className="text-[11px] text-slate-600 dark:text-slate-300 max-w-[200px] truncate block">
                      {Array.isArray(d.target_programs) ? d.target_programs.join(', ') : 'All Programs'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 font-medium">{d.requested_date}</td>
                  <td className="p-4 text-center">
                    <Badge
                      variant={
                        d.status === 'Transferred & Credited'
                          ? 'success'
                          : d.status === 'Under Funder Treasury Review'
                          ? 'warning'
                          : 'destructive'
                      }
                      size="sm"
                    >
                      {d.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    {d.status !== 'Transferred & Credited' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAuthorizeDrawdown(d.id)}
                        disabled={isProcessing}
                        leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                        className="font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Authorize & Credit Grant
                      </Button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Credited to Vault
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: BUDGET ALLOCATION POOLS MASTERLIST                               */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-slate-900 dark:text-white text-sm">
              Approved Capital Allocation Pools & Tranches
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Breakdown of city, national, and donor scholarship funds currently under Treasury custody
            </p>
          </div>
          <Badge variant="primary">Active Ordinances</Badge>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-[10px] uppercase tracking-wider font-semibold">
                <th className="p-4 text-left">Fund ID</th>
                <th className="p-4 text-left">Program / Allocation Pool</th>
                <th className="p-4 text-left">Funder Agency</th>
                <th className="p-4 text-right">Total Allocated</th>
                <th className="p-4 text-right">Total Disbursed</th>
                <th className="p-4 text-right">Remaining Capital</th>
                <th className="p-4 text-center">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {funds.map((b) => {
                const util = b.total_budget > 0 ? (b.disbursed_amount / b.total_budget) * 100 : 0;
                return (
                  <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-500 dark:text-slate-400">{b.id}</td>
                    <td className="p-4 font-semibold text-slate-800 dark:text-white">
                      <div>
                        <span>{b.name}</span>
                        <span className="text-[10px] text-slate-400 block font-normal">{b.revenue_source}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{b.funder_agency}</td>
                    <td className="p-4 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(b.total_budget)}
                    </td>
                    <td className="p-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(b.disbursed_amount)}
                    </td>
                    <td className="p-4 text-right font-bold text-slate-700 dark:text-slate-300">
                      {formatCurrency(b.remaining_balance)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${Math.min(100, util)}%` }} />
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{util.toFixed(0)}%</span>
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
          description="Allocate City capital funds to specific scholarship programs under Ordinance authority."
          footer={
            <div className="flex gap-2 w-full justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleCreatePool} className="font-bold bg-blue-600 text-white">
                Allocate Funds
              </Button>
            </div>
          }
        >
          <form onSubmit={handleCreatePool} className="space-y-4 text-xs">
            <Input
              id="bdg-name"
              label="Scholarship / Aid Program Name"
              value={progName}
              onChange={(e) => setProgName(e.target.value)}
              placeholder="e.g. Quezon City Tertiary Continuing Education Aid Pool"
              required
            />
            <Input
              id="bdg-agency"
              label="Funder / Sponsoring Agency"
              value={funderAgency}
              onChange={(e) => setFunderAgency(e.target.value)}
              placeholder="e.g. Quezon City Local School Board & City Treasury"
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

export default BudgetPage;
