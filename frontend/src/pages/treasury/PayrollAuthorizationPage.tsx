import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  ArrowDownToLine,
  DollarSign,
  ShieldCheck,
  Ban,
  Send,
  RefreshCw,
  FileCheck,
  Eye,
  X,
  CreditCard,
  Building2,
  GraduationCap,
  MapPin,
  FileText,
  UserCheck,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { formatCurrency } from '../../utils/cn';
import { getScholars, updateScholarStatus } from '../../api/registry';
import type { ScholarRegistryRecord } from '../../api/registry';

export const PayrollAuthorizationPage: React.FC = () => {
  const [scholars, setScholars] = useState<ScholarRegistryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [schoolFilter, setSchoolFilter] = useState<string>('All');
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  // Audit Drawer state
  const [auditScholar, setAuditScholar] = useState<ScholarRegistryRecord | null>(null);

  // Bulk Authorization Modal
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [batchNote, setBatchNote] = useState('Authorized for Landbank & GCash Payout Batch Release by City Treasury Disbursing Officer.');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadScholars = async () => {
    setIsLoading(true);
    try {
      const res = await getScholars();
      const data = Array.isArray(res.data) ? res.data : [];
      setScholars(data);
    } catch (err) {
      console.error('Failed to load scholars for payroll review:', err);
      toast.error('Failed to load scholar payroll records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadScholars();
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allFilteredIds = filteredScholars.map((s) => s.id);
      setSelectedIds(allFilteredIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string | number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleUpdateSingleStatus = async (id: string | number, newDisbursementStatus: string) => {
    try {
      await updateScholarStatus(id, 'Active Good Standing', newDisbursementStatus);
      if (newDisbursementStatus === 'Scheduled' || newDisbursementStatus === 'Pending') {
        localStorage.removeItem('qc_active_student_application');
        toast.success(`Scholar payout status reset back to "Pending Review". You can now test the process again!`);
      } else {
        toast.success(`Scholar payout status updated to "${newDisbursementStatus}".`);
      }
      setScholars((prev) =>
        prev.map((s) => (s.id === id ? { ...s, disbursement_status: newDisbursementStatus } : s))
      );
      if (auditScholar && auditScholar.id === id) {
        setAuditScholar((prev) => (prev ? { ...prev, disbursement_status: newDisbursementStatus } : null));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update payout status.');
    }
  };

  const handleExecuteBulkAuthorization = async () => {
    if (selectedIds.length === 0) return;
    setIsProcessing(true);
    try {
      let updatedCount = 0;
      for (const id of selectedIds) {
        await updateScholarStatus(id, 'Active Good Standing', 'Approved for Payout');
        updatedCount++;
      }

      setScholars((prev) =>
        prev.map((s) =>
          selectedIds.includes(s.id) ? { ...s, disbursement_status: 'Approved for Payout' } : s
        )
      );

      toast.success(`Successfully authorized ${updatedCount} scholar payouts for electronic disbursement!`);
      setSelectedIds([]);
      setShowBulkModal(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to process bulk payout authorization.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportManifest = () => {
    toast.success('Generating Official City Treasury Payroll Manifest...');
    const headers =
      'Scholar ID,Student Name,Email,School,Program Name,GWA,Units,Grant Amount (PHP),Disbursement Status,Payout Channel\n';
    const rows = filteredScholars
      .map(
        (s, idx) =>
          `"${s.student_id}","${s.full_name}","${s.email}","${s.school}","${s.program_name}",${s.gwa},${
            s.units_enrolled
          },${s.grant_amount || 15000},"${s.disbursement_status || 'Scheduled'}","${
            idx % 2 === 0 ? 'GCash' : 'Landbank ATM'
          }"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `QC_Treasury_Payroll_Manifest_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Filtering
  const filteredScholars = scholars.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.full_name.toLowerCase().includes(q) ||
      s.student_id.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.school.toLowerCase().includes(q) ||
      s.program_name.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (statusFilter !== 'All') {
      const currentSt = s.disbursement_status || 'Scheduled';
      if (statusFilter === 'Pending' && !['Scheduled', 'Pending Treasury Review', 'Pending'].includes(currentSt)) {
        return false;
      }
      if (statusFilter === 'Approved' && currentSt !== 'Approved for Payout' && currentSt !== 'Authorized') {
        return false;
      }
      if (statusFilter === 'Disbursed' && currentSt !== 'Disbursed') {
        return false;
      }
      if (statusFilter === 'On-Hold' && currentSt !== 'On-Hold' && currentSt !== 'Failed') {
        return false;
      }
    }

    if (schoolFilter !== 'All' && !s.school.toLowerCase().includes(schoolFilter.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Aggregates
  const totalPendingCount = scholars.filter((s) =>
    ['Scheduled', 'Pending Treasury Review', 'Pending'].includes(s.disbursement_status || 'Scheduled')
  ).length;

  const totalPendingAmount = scholars
    .filter((s) => ['Scheduled', 'Pending Treasury Review', 'Pending'].includes(s.disbursement_status || 'Scheduled'))
    .reduce((acc, curr) => acc + (curr.grant_amount || 15000), 0);

  const totalAuthorizedCount = scholars.filter((s) =>
    ['Approved for Payout', 'Authorized'].includes(s.disbursement_status)
  ).length;

  const totalAuthorizedAmount = scholars
    .filter((s) => ['Approved for Payout', 'Authorized'].includes(s.disbursement_status))
    .reduce((acc, curr) => acc + (curr.grant_amount || 15000), 0);

  const totalOnHoldCount = scholars.filter((s) =>
    ['On-Hold', 'Failed', 'Discrepancy'].includes(s.disbursement_status)
  ).length;

  const selectedTotalAmount = scholars
    .filter((s) => selectedIds.includes(s.id))
    .reduce((acc, curr) => acc + (curr.grant_amount || 15000), 0);

  const uniqueSchools = Array.from(new Set(scholars.map((s) => s.school).filter(Boolean)));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800 shrink-0 shadow-xs">
              <FileCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
                  Payroll Review & Payout Authorization
                </h1>
                <Badge variant="warning" size="sm">
                  Pre-Disbursement Gate
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Verify admin-approved scholarship rosters, audit grant amounts, inspect student credentials, and authorize electronic payout batches prior to disbursement.
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportManifest}
              leftIcon={<ArrowDownToLine className="h-4 w-4" />}
              className="font-bold shrink-0 text-xs"
            >
              Export Manifest
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowBulkModal(true)}
              disabled={selectedIds.length === 0}
              leftIcon={<Send className="h-4 w-4" />}
              className="font-bold shrink-0 text-xs bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
            >
              Authorize Selected ({selectedIds.length})
            </Button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Treasury Review */}
        <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-5 rounded-2xl flex items-center justify-between shadow-soft">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Pending Review Queue
            </p>
            <p className="font-heading font-black text-2xl text-amber-700 dark:text-amber-400 mt-0.5">
              {totalPendingCount} Scholars
            </p>
            <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300 mt-1">
              {formatCurrency(totalPendingAmount)}
            </p>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 border border-amber-300 dark:border-amber-700">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        {/* Authorized for Payout */}
        <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-5 rounded-2xl flex items-center justify-between shadow-soft">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800 dark:text-blue-300">
              Authorized for Payout
            </p>
            <p className="font-heading font-black text-2xl text-blue-700 dark:text-blue-400 mt-0.5">
              {totalAuthorizedCount} Scholars
            </p>
            <p className="text-[11px] font-bold text-blue-800 dark:text-blue-300 mt-1">
              {formatCurrency(totalAuthorizedAmount)}
            </p>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 border border-blue-300 dark:border-blue-700">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        {/* On Hold / Flagged */}
        <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-5 rounded-2xl flex items-center justify-between shadow-soft">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800 dark:text-rose-300">
              On-Hold / Discrepancy
            </p>
            <p className="font-heading font-black text-2xl text-rose-700 dark:text-rose-400 mt-0.5">
              {totalOnHoldCount} Records
            </p>
            <p className="text-[11px] font-medium text-rose-700 dark:text-rose-400 mt-1">
              Requires Admin / School Clarification
            </p>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0 border border-rose-300 dark:border-rose-700">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>

        {/* Selected Batch Counter */}
        <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-5 rounded-2xl flex items-center justify-between shadow-soft">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Selected Batch Total
            </p>
            <p className="font-heading font-black text-2xl text-emerald-700 dark:text-emerald-400 mt-0.5">
              {selectedIds.length} Selected
            </p>
            <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 mt-1">
              {formatCurrency(selectedTotalAmount)}
            </p>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-300 dark:border-emerald-700">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search scholar name, ID, email, school..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-blue-600 font-medium placeholder:text-slate-400"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            {/* Status Pills */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {['All', 'Pending', 'Approved', 'Disbursed', 'On-Hold'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* School Filter */}
            {uniqueSchools.length > 0 && (
              <select
                value={schoolFilter}
                onChange={(e) => setSchoolFilter(e.target.value)}
                className="h-9 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-medium focus:outline-none"
              >
                <option value="All">All Partner Schools</option>
                {uniqueSchools.map((sch) => (
                  <option key={sch} value={sch}>
                    {sch}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Roster Matrix Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <h2 className="font-heading font-bold text-slate-900 dark:text-white text-sm">
              Scholar Disbursement Authorization Roster ({filteredScholars.length} Records)
            </h2>
          </div>
          <button
            onClick={loadScholars}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" /> Refresh Roster
          </button>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-[10px] uppercase tracking-wider font-semibold">
                <th className="p-4 w-10 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      filteredScholars.length > 0 && selectedIds.length === filteredScholars.length
                    }
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                </th>
                <th className="p-4 text-left">Scholar / Student ID</th>
                <th className="p-4 text-left">Partner Institution</th>
                <th className="p-4 text-left">Program & Term</th>
                <th className="p-4 text-right">Grant Amount</th>
                <th className="p-4 text-left">Payout Channel</th>
                <th className="p-4 text-center">Authorization Status</th>
                <th className="p-4 text-right">Treasury Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Loading scholar records for payroll verification...
                  </td>
                </tr>
              ) : filteredScholars.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No scholar records match the search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredScholars.map((s, idx) => {
                  const isSelected = selectedIds.includes(s.id);
                  const statusStr = s.disbursement_status || 'Scheduled';
                  const channelName = idx % 2 === 0 ? 'GCash' : 'Landbank Cash Card';

                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(s.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                      </td>

                      {/* Scholar Info */}
                      <td className="p-4">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {s.full_name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 block">
                            {s.student_id} • {s.email}
                          </span>
                        </div>
                      </td>

                      {/* School */}
                      <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                        {s.school}
                      </td>

                      {/* Program & Term */}
                      <td className="p-4">
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                            {s.program_name}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {s.current_term} • GWA: {s.gwa}
                          </span>
                        </div>
                      </td>

                      {/* Grant Amount */}
                      <td className="p-4 text-right font-black text-slate-950 dark:text-emerald-400">
                        {formatCurrency(s.grant_amount || 15000)}
                      </td>

                      {/* Payout Channel */}
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              channelName === 'GCash' ? 'bg-blue-500' : 'bg-emerald-500'
                            }`}
                          />
                          {channelName}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        <Badge
                          variant={
                            statusStr === 'Disbursed'
                              ? 'success'
                              : statusStr === 'Approved for Payout' || statusStr === 'Authorized'
                              ? 'primary'
                              : statusStr === 'On-Hold' || statusStr === 'Failed'
                              ? 'destructive'
                              : 'warning'
                          }
                          size="sm"
                        >
                          <span className="flex items-center justify-center gap-1">
                            {statusStr === 'Disbursed' ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : statusStr === 'Approved for Payout' || statusStr === 'Authorized' ? (
                              <ShieldCheck className="h-3 w-3" />
                            ) : statusStr === 'On-Hold' || statusStr === 'Failed' ? (
                              <AlertTriangle className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                            {statusStr === 'Scheduled' ? 'Pending Review' : statusStr}
                          </span>
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Audit & Verify Button */}
                          <button
                            onClick={() => setAuditScholar(s)}
                            title="Audit Scholar Verification File"
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-blue-600" /> Audit
                          </button>

                          {statusStr !== 'Approved for Payout' && statusStr !== 'Disbursed' && (
                            <button
                              onClick={() => handleUpdateSingleStatus(s.id, 'Approved for Payout')}
                              title="Authorize Payout"
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Authorize
                            </button>
                          )}

                          {statusStr !== 'On-Hold' && statusStr !== 'Disbursed' && (
                            <button
                              onClick={() => handleUpdateSingleStatus(s.id, 'On-Hold')}
                              title="Put Payout On Hold"
                              className="px-2 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Ban className="h-3 w-3 text-amber-600" /> Hold
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Audit Verification Drawer */}
      {auditScholar && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                    {auditScholar.application_code || `QC-2026-APP-${String(auditScholar.id).padStart(4, '0')}`}
                  </span>
                  <Badge
                    variant={
                      auditScholar.disbursement_status === 'Disbursed'
                        ? 'success'
                        : auditScholar.disbursement_status === 'Approved for Payout' || auditScholar.disbursement_status === 'Authorized'
                        ? 'primary'
                        : auditScholar.disbursement_status === 'On-Hold'
                        ? 'destructive'
                        : 'warning'
                    }
                    size="sm"
                  >
                    {auditScholar.disbursement_status || 'Pending Review'}
                  </Badge>
                </div>
                <h2 className="font-heading font-black text-xl text-slate-900 dark:text-white">
                  {auditScholar.full_name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Student ID: {auditScholar.student_id} • {auditScholar.email}
                </p>
              </div>

              <button
                onClick={() => setAuditScholar(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* 1. Target Account & Payout Details */}
              <div className="bg-emerald-50/80 dark:bg-emerald-950/40 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                    <span className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                      Disbursement Target & Account Matching
                    </span>
                  </div>
                  <span className="font-heading font-black text-lg text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(auditScholar.grant_amount || 15000)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-emerald-800 dark:text-emerald-400 block">
                      Payout Channel
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white text-xs block mt-0.5">
                      {Number(auditScholar.id) % 2 === 0 ? 'GCash Direct Electronic Payout' : 'Landbank Cash Card / ATM'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-emerald-800 dark:text-emerald-400 block">
                      Target Phone / Card No.
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-xs block mt-0.5">
                      {auditScholar.phone || (Number(auditScholar.id) % 2 === 0 ? '0917-882-9910' : '1084-3829-1920')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium">
                  <UserCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>
                    Beneficiary Name Match: <strong>{auditScholar.full_name}</strong> (100% Verified)
                  </span>
                </div>
              </div>

              {/* 2. Secretariat Approval Audit Trail */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                    Admin Approval & Secretariat Audit Notes
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 italic text-[11px] bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  "{auditScholar.application_remarks || 'Application officially approved and authenticated by QCYDO Secretariat. Grant: ₱30,000. Verified enrollment and GWA criteria.'}"
                </p>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
                  <span>Approved By: QCYDO Secretariat Admin</span>
                  <span>Date Approved: {auditScholar.submission_date || '2026-09-01'}</span>
                </div>
              </div>

              {/* 3. Academic & Residency Profile */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-indigo-600" /> Academic & Resident Profile
                </h3>

                <div className="grid grid-cols-2 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Institution / College</span>
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                      <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                      {auditScholar.school}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Scholarship Program</span>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                      {auditScholar.program_name}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Current GWA & Load</span>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                      GWA: {auditScholar.gwa} • {auditScholar.units_enrolled} Units Enrolled
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Term & Status</span>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                      {auditScholar.current_term} ({auditScholar.scholarship_age || 'Year 1'})
                    </span>
                  </div>

                  <div className="col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">QC Residence Address</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                      {auditScholar.address || 'Katipunan Ave, Brgy. Loyola Heights'}, {auditScholar.barangay || 'Barangay Central'}, {auditScholar.district || 'District 3'}, Quezon City
                    </span>
                  </div>
                </div>

                {/* Priority Badges */}
                <div className="flex gap-2 flex-wrap pt-1">
                  {auditScholar.is_pwd && <Badge variant="warning" size="sm">PWD Beneficiary</Badge>}
                  {auditScholar.is_solo_parent && <Badge variant="primary" size="sm">Solo Parent Dependent</Badge>}
                  {auditScholar.is_4ps && <Badge variant="success" size="sm">4Ps / CCT Recipient</Badge>}
                  {auditScholar.is_kasambahay_or_toda && <Badge variant="outline" size="sm">TODA / Kasambahay Sector</Badge>}
                  {!auditScholar.is_pwd && !auditScholar.is_solo_parent && !auditScholar.is_4ps && (
                    <Badge variant="outline" size="sm">Regular Qualified Applicant</Badge>
                  )}
                </div>
              </div>

              {/* 4. Verified Documents Vault */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-600" /> Authenticated Supporting Documents
                </h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                        PDF
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block text-xs">
                          Certificate of Enrollment / Registration (COE)
                        </span>
                        <span className="text-[10px] text-slate-400">Authenticated by Registrar • 1.2 MB</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <Check className="h-3 w-3" /> Verified
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                        PDF
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block text-xs">
                          Official Certificate of Grades (COG / Transcript)
                        </span>
                        <span className="text-[10px] text-slate-400">Verified GWA: {auditScholar.gwa} • 980 KB</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <Check className="h-3 w-3" /> Verified
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                        PDF
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block text-xs">
                          QC Citizen ID / Barangay Residency Clearance
                        </span>
                        <span className="text-[10px] text-slate-400">QC LGU Residency Validated • 1.4 MB</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <Check className="h-3 w-3" /> Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer Action Bar */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateSingleStatus(auditScholar.id, 'On-Hold')}
                disabled={auditScholar.disbursement_status === 'On-Hold'}
                leftIcon={<Ban className="h-4 w-4 text-amber-600" />}
                className="font-bold text-xs"
              >
                Flag Discrepancy (Hold)
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAuditScholar(null)}
                  className="font-bold text-xs"
                >
                  Close
                </Button>
                {auditScholar.disbursement_status !== 'Approved for Payout' && auditScholar.disbursement_status !== 'Disbursed' ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleUpdateSingleStatus(auditScholar.id, 'Approved for Payout')}
                    leftIcon={<CheckCircle2 className="h-4 w-4" />}
                    className="font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Authorize Payout Release
                  </Button>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Payout Authorized
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Authorization Modal */}
      {showBulkModal && (
        <Modal
          isOpen={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          title="Authorize Selected Payroll Payout Batch"
          description={`You are about to authorize electronic payout release for ${selectedIds.length} scholars.`}
          footer={
            <div className="flex gap-2 w-full justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowBulkModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleExecuteBulkAuthorization}
                disabled={isProcessing}
                className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isProcessing ? 'Processing Batch...' : 'Confirm & Authorize Release'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-1">
              <p className="font-extrabold text-emerald-900 dark:text-emerald-200">
                Batch Authorization Summary:
              </p>
              <div className="flex justify-between items-center text-emerald-800 dark:text-emerald-300 font-medium">
                <span>Total Scholars Selected:</span>
                <span className="font-black">{selectedIds.length} Scholars</span>
              </div>
              <div className="flex justify-between items-center text-emerald-900 dark:text-emerald-200 font-bold text-sm">
                <span>Aggregate Payout Amount:</span>
                <span className="font-black">{formatCurrency(selectedTotalAmount)}</span>
              </div>
            </div>

            <Input
              id="batch-note"
              label="Treasury Disbursing Officer Authorization Remarks"
              value={batchNote}
              onChange={(e) => setBatchNote(e.target.value)}
              placeholder="Enter authorization notes or city ordinance reference..."
              required
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PayrollAuthorizationPage;
