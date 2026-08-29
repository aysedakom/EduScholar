import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, WalletCards, Coins } from 'lucide-react';
import { getBursaries } from '../api/scholarships';
import { getOpportunities } from '../api/opportunities';
import type { Bursary } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { formatCurrency, formatDate } from '../utils/cn';
import { useNavigate } from 'react-router-dom';

const QC_BURSARIES: Bursary[] = [
  {
    id: 'bur-01',
    title: 'Quezon City Special Higher Education Emergency Aid (SHEA)',
    type: 'Emergency Assistance',
    amount: 20000,
    deadline: '2026-11-30',
    eligibility: 'Quezon City resident student, documented urgent financial or medical crisis',
    funds_available: 120,
    description: 'City emergency support for continuous collegiate enrollment during unforeseen family emergencies or financial hardship.',
    status: 'Open',
  },
  {
    id: 'bur-02',
    title: 'Tertiary Student Connectivity & Academic Device Subsidy',
    type: 'Equity & Access',
    amount: 15000,
    deadline: '2026-10-15',
    eligibility: 'Enrolled college student, household income below priority threshold',
    funds_available: 250,
    description: 'Direct allowance for educational technology, laptops, textbooks, and digital connectivity supplies.',
    status: 'Open',
  },
  {
    id: 'bur-03',
    title: 'Quezon City Youth Calamity & Displacement Relief',
    amount: 10000,
    type: 'Emergency Assistance',
    deadline: '2026-12-31',
    eligibility: 'Bona fide resident affected by local calamity, flood, or fire emergency',
    funds_available: 85,
    description: 'Rapid 48-hour approval relief stipend provided through the QC Crisis Relief Desk.',
    status: 'Open',
  },
];

export const BursariesPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Bursary[]>(QC_BURSARIES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selected, setSelected] = useState<Bursary | null>(null);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'federal' | 'hardship' | 'emergency'>('federal');

  const types = ['All', 'Emergency Assistance', 'Equity & Access', 'Regional Support'];

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [bursariesRes, oppRes] = await Promise.all([
          getBursaries(),
          getOpportunities({ category: 'Bursary' }),
        ]);
        const bData: any[] = bursariesRes.data || [];
        const oppData: any[] = oppRes.data || [];

        const combined: Bursary[] = [
          ...oppData.map((o) => ({
            id: o.id ?? `bur-opp-${Math.random()}`,
            title: o.title ?? 'Bursary Opportunity',
            type: o.funding_type ?? 'Provider Bursary',
            amount: o.amount ?? 0,
            deadline: o.deadline,
            eligibility: o.eligibility_badge ?? 'See description',
            description: o.description,
            status: o.status === 'closed' ? 'Closed' : o.status === 'closing_soon' ? 'Closing Soon' : 'Open',
          })),
          ...bData.map((b) => ({
            id: b.id ?? `bur-${Math.random()}`,
            title: b.title,
            type: b.type ?? 'General Bursary',
            amount: b.amount ?? 0,
            deadline: b.deadline,
            eligibility: b.eligibility,
            funds_available: b.funds_available,
            description: b.description,
            status: b.status ?? 'Open',
          })),
        ];
        if (mounted) setItems(combined.length ? combined : QC_BURSARIES);
      } catch {
        if (mounted) setItems(QC_BURSARIES);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = items.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.description ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || b.type === selectedType;
    
    let matchesTab = false;
    const typeLower = (b.type ?? '').toLowerCase();
    if (activeTab === 'federal') {
      matchesTab = typeLower.includes('equity') || typeLower.includes('federal') || typeLower.includes('national');
    } else if (activeTab === 'hardship') {
      matchesTab = typeLower.includes('hardship') || typeLower.includes('regional') || typeLower.includes('institutional') || typeLower.includes('support') || typeLower.includes('general') || typeLower.includes('provider');
    } else if (activeTab === 'emergency') {
      matchesTab = typeLower.includes('emergency') || typeLower.includes('crisis') || typeLower.includes('aid') || typeLower.includes('instant');
    }
    
    return matchesSearch && matchesType && matchesTab;
  });

  const handleApply = (id: string) => {
    if (!appliedIds.includes(id)) setAppliedIds([...appliedIds, id]);
    setSelected(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-slate-900 dark:text-white">Bursaries & Emergency Aid</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Need-based financial assistance designed to reduce barriers and support students facing financial hardship.
          </p>
        </div>
        <Badge variant="info" size="md">
          {filtered.length} Bursaries Available
        </Badge>
      </div>

      {/* Nested Tabs: Federal Bursaries, Institutional Hardship Funds, Emergency Aid */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { id: 'federal', label: 'Federal Bursaries' },
          { id: 'hardship', label: 'Institutional Hardship Funds' },
          { id: 'emergency', label: 'Emergency Aid' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search bursaries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-blue-600 transition-all placeholder:text-slate-400 font-medium"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                selectedType === t
                  ? 'bg-blue-600 border-transparent text-white shadow-md font-bold'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((b) => {
          const isApplied = appliedIds.includes(b.id);
          return (
            <Card key={b.id} hoverEffect className="flex flex-col justify-between bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant={b.status === 'Closing Soon' ? 'warning' : 'info'} size="sm">
                    {b.status}
                  </Badge>
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{b.type}</span>
                </div>
                <CardTitle className="text-base text-slate-900 dark:text-white">{b.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-slate-500 dark:text-slate-400">{b.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800 rounded-xl p-3">
                  <Coins className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <span className="text-[10px] uppercase tracking-wider block text-emerald-600/80 dark:text-emerald-400/80">Award Value</span>
                    <span className="font-heading font-extrabold text-lg text-emerald-700 dark:text-emerald-300">{formatCurrency(b.amount)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span>Deadline: {b.deadline ? formatDate(b.deadline) : 'Rolling'}</span>
                  {typeof b.funds_available === 'number' && (
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">{b.funds_available} slots</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Eligibility:</span> {b.eligibility}
                </p>
              </CardContent>

              <CardFooter className="pt-3">
                <Button
                  variant={isApplied ? 'secondary' : 'primary'}
                  size="md"
                  onClick={() => setSelected(b)}
                  className="w-full font-bold"
                  rightIcon={!isApplied && <ArrowRight className="h-4 w-4" />}
                >
                  {isApplied ? 'Application Submitted' : 'Review & Apply'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {selected && (
        <Modal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          title={selected.title}
          description={`${selected.type} | ${formatCurrency(selected.amount)}`}
          maxWidth="lg"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setSelected(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleApply(selected.id)}
                disabled={appliedIds.includes(selected.id)}
                className="font-bold"
              >
                {appliedIds.includes(selected.id) ? 'Already Applied' : 'Submit Bursary Application'}
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">Bursary Overview</h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selected.description}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">Type</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selected.type}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">Award Amount</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(selected.amount)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">Deadline</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selected.deadline ? formatDate(selected.deadline) : 'Rolling'}
                </span>
              </div>
              {typeof selected.funds_available === 'number' && (
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">Available Slots</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selected.funds_available}</span>
                </div>
              )}
            </div>
            <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800">
              <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-1">Eligibility</h4>
              <p className="text-blue-800 dark:text-blue-300 font-medium">{selected.eligibility}</p>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <WalletCards className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>Need guidance on which bursary fits your situation?</span>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/apply/scholarship')}>
          Browse All Awards
        </Button>
      </div>
    </div>
  );
};

export default BursariesPage;
