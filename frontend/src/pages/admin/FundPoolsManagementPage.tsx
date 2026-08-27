// frontend/src/pages/admin/FundPoolsManagementPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Plus,
  DollarSign,
  Landmark,
  Building,
  CheckCircle2,
  Clock,
  Send,
  Download,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  getFundPools,
  getDrawdownRequests,
  submitDrawdownRequest,
  updateDrawdownStatus,
  createFundPool,
  type FundPoolItem,
  type DrawdownRequestItem,
} from '../../api/funds';

export const FundPoolsManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pools' | 'drawdowns'>('pools');
  const [funds, setFunds] = useState<FundPoolItem[]>([]);
  const [drawdowns, setDrawdowns] = useState<DrawdownRequestItem[]>([]);

  // Modals
  const [showDrawdownModal, setShowDrawdownModal] = useState(false);
  const [showCreatePoolModal, setShowCreatePoolModal] = useState(false);
  const [selectedDrawdown, setSelectedDrawdown] = useState<DrawdownRequestItem | null>(null);

  // Form State: Drawdown Request
  const [selectedFundId, setSelectedFundId] = useState('');
  const [drawdownAmount, setDrawdownAmount] = useState('5000000');
  const [trancheName, setTrancheName] = useState('Tranche 2: 1st Semester AY 2026-2027 Expansion');
  const [targetProgram, setTargetProgram] = useState('Economic Scholarship (Need-Based Financial Assistance)');
  const [justification, setJustification] = useState(
    'Disbursement tranche request for qualified tertiary and SHS scholars enrolled in partner institutions.'
  );

  // Form State: Create Fund Pool
  const [newPoolName, setNewPoolName] = useState('');
  const [newFunderAgency, setNewFunderAgency] = useState('');
  const [newRevenueSource, setNewRevenueSource] = useState('');
  const [newBudget, setNewBudget] = useState('10000000');

  const loadData = async () => {
    try {
      const [poolsRes, drawdownsRes] = await Promise.all([getFundPools(), getDrawdownRequests()]);
      if (poolsRes.data?.data) {
        setFunds(poolsRes.data.data);
        if (poolsRes.data.data.length > 0 && !selectedFundId) {
          setSelectedFundId(poolsRes.data.data[0].id);
        }
      }
      if (drawdownsRes.data?.data) {
        setDrawdowns(drawdownsRes.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load fund pools data');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Aggregate Metrics
  const totalAllocatedBudget = funds.reduce((sum, f) => sum + f.total_budget, 0);
  const totalDisbursedAmount = funds.reduce((sum, f) => sum + f.disbursed_amount, 0);
  const totalCommittedAmount = funds.reduce((sum, f) => sum + f.committed_amount, 0);
  const totalRemainingBalance = funds.reduce((sum, f) => sum + f.remaining_balance, 0);

  // Submit Drawdown Pull Request Handler
  const handleCreateDrawdown = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFundId || !drawdownAmount) {
      toast.error('Please specify fund source and requested amount');
      return;
    }

    try {
      const res = await submitDrawdownRequest({
        fund_id: selectedFundId,
        requested_amount: parseFloat(drawdownAmount),
        tranche_name: trancheName,
        target_programs: [targetProgram],
        justification,
        requested_by: 'Quezon City Scholarship Board Executive Secretariat',
      });

      toast.success(res.data.message || 'Funder Drawdown Request submitted to City Treasury!');
      setShowDrawdownModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit drawdown request');
    }
  };

  // Submit Create Fund Pool Handler
  const handleCreateFundPool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoolName || !newBudget) {
      toast.error('Please enter pool name and budget amount');
      return;
    }

    try {
      await createFundPool({
        name: newPoolName,
        funder_agency: newFunderAgency || 'Quezon City Local Government Unit',
        revenue_source: newRevenueSource || 'City Special Education Allocation',
        total_budget: parseFloat(newBudget),
        fiscal_year: 'FY 2026-2027',
      });

      toast.success(`Created fund source pool: "${newPoolName}"!`);
      setShowCreatePoolModal(false);
      setNewPoolName('');
      setNewFunderAgency('');
      setNewRevenueSource('');
      setNewBudget('10000000');
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create fund pool');
    }
  };

  // Approve Drawdown Request (Treasury Simulation)
  const handleApproveDrawdown = async (reqId: string) => {
    try {
      await updateDrawdownStatus(reqId, 'Transferred & Credited');
      toast.success(`Drawdown ${reqId} APPROVED by Treasury! ₱ Funds transferred to Disbursement Vault.`);
      loadData();
      if (selectedDrawdown?.id === reqId) {
        setSelectedDrawdown(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to approve drawdown request');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
              Scholarship Funds & Revenue Treasury
            </h1>
            <Badge variant="primary" size="sm">
              LGU Treasury Desk
            </Badge>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Monitor revenue streams, Special Education Funds (SEF), and submit formal{' '}
            <strong className="text-blue-700 dark:text-blue-400">Funder Drawdown Pull Requests</strong> for grant
            disbursements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreatePoolModal(true)}
            leftIcon={<Plus className="h-4 w-4 text-blue-600" />}
            className="font-bold whitespace-nowrap"
          >
            Add Revenue Pool
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowDrawdownModal(true)}
            leftIcon={<Send className="h-4 w-4" />}
            className="font-bold bg-blue-600 text-white shadow-md shadow-blue-600/20 whitespace-nowrap"
          >
            Create Funder Pull Request
          </Button>
        </div>
      </div>

      {/* Top Aggregate Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-100 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                Total Budget Allocation
              </span>
              <h3 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
                ₱{(totalAllocatedBudget / 1000000).toFixed(1)}M
              </h3>
              <span className="text-[10px] text-slate-400 block mt-0.5">Across {funds.length} Active Fund Pools</span>
            </div>
            <Landmark className="h-8 w-8 text-blue-600 opacity-80" />
          </CardContent>
        </Card>

        <Card className="border-emerald-100 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Released Disbursements
              </span>
              <h3 className="font-heading font-extrabold text-2xl text-emerald-950 dark:text-emerald-200">
                ₱{(totalDisbursedAmount / 1000000).toFixed(1)}M
              </h3>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block mt-0.5">
                {Math.round((totalDisbursedAmount / totalAllocatedBudget) * 100 || 0)}% Disbursed to Scholars
              </span>
            </div>
            <CheckCircle2 className="h-8 w-8 text-emerald-600 opacity-80" />
          </CardContent>
        </Card>

        <Card className="border-amber-100 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                Committed in Drawdowns
              </span>
              <h3 className="font-heading font-extrabold text-2xl text-amber-950 dark:text-amber-200">
                ₱{(totalCommittedAmount / 1000000).toFixed(1)}M
              </h3>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold block mt-0.5">
                {drawdowns.filter((d) => d.status.includes('Review') || d.status.includes('Submitted')).length} Pending Pull Requests
              </span>
            </div>
            <Clock className="h-8 w-8 text-amber-600 opacity-80" />
          </CardContent>
        </Card>

        <Card className="border-indigo-100 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                Available Liquid Balance
              </span>
              <h3 className="font-heading font-extrabold text-2xl text-indigo-950 dark:text-indigo-200">
                ₱{(totalRemainingBalance / 1000000).toFixed(1)}M
              </h3>
              <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-semibold block mt-0.5">
                Ready for Next Drawdown
              </span>
            </div>
            <DollarSign className="h-8 w-8 text-indigo-600 opacity-80" />
          </CardContent>
        </Card>
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl flex gap-1 border border-slate-200 dark:border-slate-700 max-w-md">
        <button
          onClick={() => setActiveTab('pools')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'pools'
              ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Landmark className="h-4 w-4 text-blue-600" />
          <span>Fund Revenue Pools ({funds.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('drawdowns')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'drawdowns'
              ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Send className="h-4 w-4 text-indigo-600" />
          <span>Funder Pull Requests ({drawdowns.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: REVENUE FUND POOLS                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'pools' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {funds.map((f) => {
            const pct = Math.round(((f.disbursed_amount + f.committed_amount) / f.total_budget) * 100);

            return (
              <Card
                key={f.id}
                hoverEffect
                className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between"
              >
                <div>
                  <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center">
                      <Badge variant="primary" size="sm" className="font-mono text-[10px]">
                        {f.id}
                      </Badge>
                      <Badge variant={f.status === 'Active' ? 'success' : 'warning'} size="sm">
                        {f.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-white mt-1.5 leading-snug">
                      {f.name}
                    </CardTitle>
                    <CardDescription className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Building className="h-3 w-3 text-slate-400" /> {f.funder_agency}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-4 space-y-3.5 text-xs">
                    {/* Revenue Source Pill */}
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Revenue Source</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        {f.revenue_source}
                      </span>
                    </div>

                    {/* Financial Figures */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900">
                        <span className="text-blue-700 dark:text-blue-300 block text-[10px] font-bold uppercase">
                          Total Budget
                        </span>
                        <span className="font-heading font-extrabold text-blue-950 dark:text-blue-100 text-sm">
                          ₱{f.total_budget.toLocaleString()}
                        </span>
                      </div>

                      <div className="p-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900">
                        <span className="text-emerald-700 dark:text-emerald-300 block text-[10px] font-bold uppercase">
                          Remaining Balance
                        </span>
                        <span className="font-heading font-extrabold text-emerald-950 dark:text-emerald-100 text-sm">
                          ₱{f.remaining_balance.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-500">Utilization Rate</span>
                        <span className="text-blue-700 dark:text-blue-400">{pct}% Committed</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                        <span>Disbursed: ₱{(f.disbursed_amount / 1000000).toFixed(1)}M</span>
                        <span>Committed: ₱{(f.committed_amount / 1000000).toFixed(1)}M</span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedFundId(f.id);
                      setShowDrawdownModal(true);
                    }}
                    leftIcon={<Send className="h-3.5 w-3.5 text-blue-600" />}
                    className="w-full font-bold text-xs"
                  >
                    Request Drawdown Tranche
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FUNDER DRAWDOWN PULL REQUESTS DESK                                 */}
      {/* ========================================================================= */}
      {activeTab === 'drawdowns' && (
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base text-slate-900 dark:text-white">
                Funder Drawdown Pull Requests & Treasury Tranches
              </CardTitle>
              <CardDescription className="text-xs">
                Official funding drawdowns submitted to the City Treasury, Special Education Board, and national co-funders.
              </CardDescription>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowDrawdownModal(true)}
              leftIcon={<Plus className="h-4 w-4" />}
              className="font-bold bg-blue-600 text-white shadow-xs"
            >
              New Pull Request
            </Button>
          </CardHeader>

          <CardContent className="pt-0 p-0 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5">Request Ref & Tranche</th>
                  <th className="p-3.5">Fund Source & Sponsoring Agency</th>
                  <th className="p-3.5">Requested Amount</th>
                  <th className="p-3.5">Target Scholarship Programs</th>
                  <th className="p-3.5">Submission Date</th>
                  <th className="p-3.5">Treasury Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {drawdowns.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{req.tranche_name}</div>
                      <code className="text-[10px] text-blue-700 dark:text-blue-400 font-mono font-semibold block mt-0.5">
                        {req.id} • VCH: {req.voucher_number}
                      </code>
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{req.fund_name}</div>
                      <span className="text-[11px] text-slate-400 block">{req.funder_agency}</span>
                    </td>

                    <td className="p-3.5">
                      <span className="font-heading font-extrabold text-sm text-blue-700 dark:text-blue-300 block">
                        ₱{req.requested_amount.toLocaleString()}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-600 dark:text-slate-400">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-[11px] font-medium block w-fit">
                        {req.target_programs[0]}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-600 dark:text-slate-400 font-medium">
                      {req.requested_date}
                    </td>

                    <td className="p-3.5">
                      <Badge
                        variant={
                          req.status === 'Transferred & Credited'
                            ? 'success'
                            : req.status.includes('Review')
                            ? 'warning'
                            : 'primary'
                        }
                        size="sm"
                        className="font-bold"
                      >
                        {req.status}
                      </Badge>
                    </td>

                    <td className="p-3.5 text-right space-x-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDrawdown(req)}
                        leftIcon={<Eye className="h-3.5 w-3.5 text-slate-500" />}
                        className="font-bold text-xs"
                      >
                        Voucher
                      </Button>

                      {req.status !== 'Transferred & Credited' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApproveDrawdown(req.id)}
                          leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                          className="font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          title="Simulate Treasury Transfer & Credit to Disbursement Vault"
                        >
                          Credit Vault
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE FUNDER DRAWDOWN PULL REQUEST                                */}
      {/* ========================================================================= */}
      {showDrawdownModal && (
        <Modal
          isOpen={showDrawdownModal}
          onClose={() => setShowDrawdownModal(false)}
          title="Create Funder Drawdown Pull Request"
          maxWidth="2xl"
        >
          <form onSubmit={handleCreateDrawdown} className="space-y-4 text-xs">
            <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-950 dark:text-blue-200">
              <span className="font-bold block mb-0.5">Official City Treasury Allocation Request</span>
              <p className="text-[11px] leading-relaxed">
                Submitting this formal pull request authorizes the city treasury or sponsoring agency to release the
                specified funding tranche to the EduScholar grant disbursement ledger.
              </p>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Select Revenue Fund Source:
              </label>
              <select
                value={selectedFundId}
                onChange={(e) => setSelectedFundId(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 font-semibold"
              >
                {funds.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} (Available: ₱{f.remaining_balance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Requested Tranche Amount (₱):
                </label>
                <input
                  type="number"
                  step="500000"
                  value={drawdownAmount}
                  onChange={(e) => setDrawdownAmount(e.target.value)}
                  className="w-full h-10 px-3 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tranche / Semester Name:
                </label>
                <input
                  type="text"
                  value={trancheName}
                  onChange={(e) => setTrancheName(e.target.value)}
                  placeholder="e.g. Tranche 2: 1st Sem AY 2026-2027..."
                  className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Target Scholarship Program:
              </label>
              <input
                type="text"
                value={targetProgram}
                onChange={(e) => setTargetProgram(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Official Treasury Justification:
              </label>
              <textarea
                rows={3}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" type="button" onClick={() => setShowDrawdownModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                leftIcon={<Send className="h-4 w-4" />}
                className="font-bold bg-blue-600 text-white"
              >
                Submit Drawdown to Treasury
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE FUND POOL                                                   */}
      {/* ========================================================================= */}
      {showCreatePoolModal && (
        <Modal
          isOpen={showCreatePoolModal}
          onClose={() => setShowCreatePoolModal(false)}
          title="Add New Sponsoring Revenue Fund Pool"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateFundPool} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Fund Pool Title:</label>
              <input
                type="text"
                placeholder="e.g. QC Mayor's Special Innovation Grant Pool..."
                value={newPoolName}
                onChange={(e) => setNewPoolName(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Sponsoring Agency / Funder:</label>
              <input
                type="text"
                placeholder="e.g. Quezon City Local School Board..."
                value={newFunderAgency}
                onChange={(e) => setNewFunderAgency(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Revenue Source:</label>
              <input
                type="text"
                placeholder="e.g. Real Property Tax / Local Ordinance Allocation..."
                value={newRevenueSource}
                onChange={(e) => setNewRevenueSource(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Total Annual Budget (₱):</label>
              <input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                className="w-full h-10 px-3 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" type="button" onClick={() => setShowCreatePoolModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" className="font-bold bg-blue-600 text-white">
                Save Fund Pool
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW DRAWDOWN VOUCHER DETAILS                                      */}
      {/* ========================================================================= */}
      {selectedDrawdown && (
        <Modal
          isOpen={!!selectedDrawdown}
          onClose={() => setSelectedDrawdown(null)}
          title="Official Treasury Drawdown Voucher"
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Voucher Reference</span>
                  <code className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400">
                    {selectedDrawdown.voucher_number}
                  </code>
                </div>
                <Badge variant={selectedDrawdown.status === 'Transferred & Credited' ? 'success' : 'warning'} size="sm">
                  {selectedDrawdown.status}
                </Badge>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Drawdown Tranche</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedDrawdown.tranche_name}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Funder Source</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedDrawdown.fund_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Funder Agency</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedDrawdown.funder_agency}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900">
                <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 block">
                  Tranche Release Amount
                </span>
                <span className="font-heading font-extrabold text-blue-900 dark:text-blue-100 text-lg">
                  ₱{selectedDrawdown.requested_amount.toLocaleString()}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Justification</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{selectedDrawdown.justification}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success(`Exported Drawdown Voucher ${selectedDrawdown.voucher_number} (PDF)`)}
                leftIcon={<Download className="h-3.5 w-3.5 text-blue-600" />}
                className="font-bold text-xs"
              >
                Download Voucher PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedDrawdown(null)} className="font-bold text-xs">
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default FundPoolsManagementPage;
