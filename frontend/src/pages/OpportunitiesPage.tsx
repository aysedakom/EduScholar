import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Building2, Landmark, Heart, University, ExternalLink } from 'lucide-react';
import { getOpportunities } from '../api/opportunities';
import type { Opportunity } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/cn';

const providerIcons = {
  Corporation: Building2,
  Government: Landmark,
  Foundation: Heart,
  University: University,
};

const categoryMap: Record<string, { label: string; variant: 'primary' | 'info' | 'warning' | 'success' }> = {
  Scholarship: { label: 'Scholarship', variant: 'primary' },
  Bursary: { label: 'Bursary', variant: 'info' },
  Grant: { label: 'Grant', variant: 'success' },
};

const QC_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-01',
    title: 'Quezon City Tertiary Education Subsidy (QCTES)',
    provider_name: 'Quezon City Youth Development Office (QCYDO)',
    provider_type: 'Government',
    category: 'Scholarship',
    funding_type: 'Merit-Based',
    eligibility_badge: 'QC Resident, Enrolled College Student',
    deadline: '2026-09-30',
    description: 'City-wide financial aid providing educational grants, book stipends, and connectivity subsidies.',
    amount: 25000,
    location: 'Quezon City',
    status: 'open',
  },
  {
    id: 'opp-02',
    title: 'Economic Scholarship (Need-Based Financial Assistance)',
    provider_name: 'Quezon City LGU & Social Services Development Dept',
    provider_type: 'Government',
    category: 'Bursary',
    funding_type: 'Need-Based',
    eligibility_badge: 'Indigency / Low Income Family, Enrolled in HEI',
    deadline: '2026-09-28',
    description: 'Provides ₱5,000 tuition grant + ₱5,000 living stipend per semester (₱20,000 / school year) for qualified indigent and low-income students.',
    amount: 10000,
    location: 'Quezon City',
    status: 'open',
  },
  {
    id: 'opp-03',
    title: 'QC Tech Giants STEM Excellence Grant (QC-EXCEL)',
    provider_name: 'QC Science & Tech Innovation Council',
    provider_type: 'Foundation',
    category: 'Grant',
    funding_type: 'Merit-Based',
    eligibility_badge: 'GWA 1.75 or better, Priority STEM Degree',
    deadline: '2026-09-25',
    description: 'Merit award for promising tech innovators, developers, and engineers studying in accredited QC universities.',
    amount: 50000,
    location: 'Quezon City',
    status: 'open',
  },
];

export const OpportunitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Opportunity[]>(QC_OPPORTUNITIES);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  const categories = ['All', 'Scholarship', 'Bursary', 'Grant'];

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await getOpportunities();
        const data = res.data || [];
        if (mounted) setItems(data.length ? data : QC_OPPORTUNITIES);
      } catch {
        if (mounted) setItems(QC_OPPORTUNITIES);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = items.filter((o) => {
    const matchesSearch =
      (o.title ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.description ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.provider_name ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || o.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleApplyRoute = (_o: Opportunity) => {
    navigate('/scholar-prog-available');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-border shadow-soft">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-foreground">Discover Opportunities</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Explore external and internal scholarships, bursaries, and grants from trusted providers.
          </p>
        </div>
        <Badge variant="primary" size="md">
          {loading ? 'Loading...' : `${filtered.length} Opportunities`}
        </Badge>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-border shadow-soft">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by provider, title, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-primary border-transparent text-white shadow-md font-bold'
                  : 'bg-white border-slate-200 text-slate-700 shadow-xs hover:bg-slate-50 font-semibold'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground text-sm">
          No opportunities found. Try adjusting your search or filters.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((o) => {
          const ProviderIcon = providerIcons[o.provider_type] ?? Building2;
          const cat = categoryMap[o.category] ?? { label: o.category, variant: 'primary' as const };
          return (
            <Card key={o.id} hoverEffect className="flex flex-col justify-between">
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant={cat.variant}>{cat.label}</Badge>
                  {o.status === 'closing_soon' && (
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      Closing Soon
                    </span>
                  )}
                </div>
                <CardTitle className="text-base">{o.title}</CardTitle>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ProviderIcon className="h-3.5 w-3.5" />
                  <span className="font-medium">{o.provider_name}</span>
                </div>
                <CardDescription className="line-clamp-2">{o.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Funding</span>
                    <span className="font-heading font-extrabold text-lg text-primary">
                      {o.amount ? formatCurrency(o.amount) : 'Varies'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Deadline</span>
                    <span className="font-semibold text-slate-800">
                      {o.deadline ? formatDate(o.deadline) : 'Rolling'}
                    </span>
                  </div>
                </div>
                {o.eligibility_badge && (
                  <div className="text-[11px] text-slate-600 bg-blue-50/60 border border-blue-100 rounded-lg px-3 py-2">
                    <span className="font-bold text-blue-800">Eligibility:</span> {o.eligibility_badge}
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setSelected(o)}
                  className="w-full font-bold"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  View & Apply
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
          description={`${selected.provider_name} | ${selected.category}`}
          maxWidth="lg"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setSelected(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleApplyRoute(selected);
                  setSelected(null);
                }}
                className="font-bold"
              >
                Start Application
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div>
              <h4 className="font-bold text-foreground mb-1">Overview</h4>
              <p className="text-muted-foreground leading-relaxed">{selected.description}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Provider Type</span>
                <span className="font-semibold text-slate-800 capitalize">{selected.provider_type}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Funding</span>
                <span className="font-semibold text-slate-800">
                  {selected.amount ? formatCurrency(selected.amount) : 'Varies'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Deadline</span>
                <span className="font-semibold text-slate-800">
                  {selected.deadline ? formatDate(selected.deadline) : 'Rolling'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Location</span>
                <span className="font-semibold text-slate-800">{selected.location ?? 'Remote / On Campus'}</span>
              </div>
            </div>
            {selected.eligibility_badge && (
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-1">Eligibility</h4>
                <p className="text-blue-800 font-medium">{selected.eligibility_badge}</p>
              </div>
            )}
            {selected.external_url && (
              <button
                type="button"
                onClick={() => {
                  setRedirectUrl(selected.external_url || null);
                }}
                className="inline-flex items-center gap-1.5 text-primary font-semibold hover:underline text-xs"
              >
                Visit provider website <ExternalLink className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </Modal>
      )}

      {redirectUrl && (
        <Modal
          isOpen={!!redirectUrl}
          onClose={() => setRedirectUrl(null)}
          title="External Redirect Safety Warning"
          description="You are about to leave the Campus Aid Hub platform."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setRedirectUrl(null)}>
                Cancel
              </Button>
              <a
                href={redirectUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => setRedirectUrl(null)}
              >
                <Button variant="primary" size="sm" className="font-bold bg-amber-600 hover:bg-amber-700 text-white">
                  Proceed to Site
                </Button>
              </a>
            </>
          }
        >
          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <p>
              This link will redirect you to the official external portal of the scholarship provider:
            </p>
            <p className="font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 truncate font-semibold">
              {redirectUrl}
            </p>
            <p>
              Please verify that this is a trusted secure connection before completing any form fields or uploading credentials on the destination site.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OpportunitiesPage;
