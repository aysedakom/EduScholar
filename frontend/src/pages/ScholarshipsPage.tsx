import React, { useState, useEffect } from 'react';
import {
  Search,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  FileText,
  CheckCircle2,
  Plus,
  Trash2,
  Calendar,
  Edit3,
  Filter,
  Layers,
  RefreshCw,
  Inbox,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Scholarship, Application } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { formatCurrency, formatDate } from '../utils/cn';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { ConditionalOffersPage } from './admin/ConditionalOffersPage';
import { ApplicationReviewQueuePage } from './admin/ApplicationReviewQueuePage';

import { getMyApplications } from '../api/applications';
import { getScholarships, updateScholarshipStatus } from '../api/scholarships';
import { getPortalSettings, updatePortalSettings, type PortalSettingsData } from '../api/portalSettings';

import { ALL_SCHOLARSHIP_PROGRAMS, getActiveStudentApplication, saveActiveStudentApplication } from '../utils/scholarshipPrograms';

type FeedItem = Scholarship & { kind: 'scholarship' };

const INITIAL_PROGRAMS: FeedItem[] = ALL_SCHOLARSHIP_PROGRAMS.map((prog) => {
  let amount = 10000;
  let slots = 500;

  if (prog.id.includes('economic')) {
    amount = 10000; // 5k tuition + 5k stipend per sem
    slots = 3500;
  } else if (prog.id.includes('excel')) {
    amount = 80000;
    slots = 600;
  } else if (prog.id.includes('academic') && prog.id.includes('tertiary')) {
    amount = 52500;
    slots = 2000;
  } else if (prog.id.includes('academic') && prog.id.includes('shs')) {
    amount = 15000;
    slots = 1500;
  } else if (prog.id.includes('youth-leaders') || prog.id.includes('athletic')) {
    amount = 40000;
    slots = 400;
  } else if (prog.id.includes('specialized')) {
    amount = 15000;
    slots = 500;
  } else if (prog.id.includes('shs')) {
    amount = 15000;
    slots = 500;
  } else if (prog.id.includes('vocational') || prog.id.includes('continuing')) {
    amount = 10000;
    slots = 800;
  } else if (prog.id.includes('postgrad') || prog.id.includes('thesis')) {
    amount = 52500;
    slots = 300;
  } else if (prog.id.includes('filipino') || prog.id.includes('literature')) {
    amount = 52500;
    slots = 200;
  }

  let category = 'Need-Based';
  if (prog.id.includes('academic') || prog.id.includes('honors')) {
    category = 'Merit-Based';
  } else if (prog.id.includes('specialized') || prog.id.includes('excel')) {
    category = 'STEM';
  } else if (prog.id.includes('athletic') || prog.id.includes('arts')) {
    category = 'Athletic';
  }

  return {
    id: prog.id,
    title: prog.title,
    description: prog.summary || 'City-funded scholarship program supporting deserving college students.',
    eligibility: prog.minGwaText + ', ' + prog.level + ' level. ' + (prog.qualifications[0] || ''),
    amount: amount,
    deadline: '2026-09-30',
    category: category,
    slots: slots,
    appliedCount: 0,
    status: 'Open',
    kind: 'scholarship',
    level: prog.level,
    category_title: prog.categoryTitle,
  };
});

export const ScholarshipsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const profile = user?.basicProfile;
  const isAdminOrStaff = user?.role !== 'student';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ongoing' | 'upcoming' | 'expired'>('all');
  const [activeModalScholarship, setActiveModalScholarship] = useState<Scholarship | null>(null);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [activeStudentApp, setActiveStudentApp] = useState<any | null>(() => getActiveStudentApplication());
  const [items, setItems] = useState<FeedItem[]>(INITIAL_PROGRAMS);
  const [adminActiveTab, setAdminActiveTab] = useState<'programs' | 'reviews' | 'renewal'>('programs');
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string | null>(null);
  const [portalSettings, setPortalSettings] = useState<PortalSettingsData | null>(null);
  const [isPortalOpen, setIsPortalOpen] = useState<boolean>(true);
  const [pendingReviewsCount, setPendingReviewsCount] = useState<number>(0);
  const [dbApplications, setDbApplications] = useState<Application[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({});

  // Sync real-time scholarship programs & portal intake settings
  useEffect(() => {
    getPortalSettings()
      .then((res: any) => {
        if (res.data?.data) {
          setPortalSettings(res.data.data);
          setIsPortalOpen(res.data.data.isOpen);
        }
      })
      .catch((err: any) => {
        console.warn('Failed to fetch portal settings:', err);
      });

    let localOverrides: Record<string, string> = {};
    try {
      localOverrides = JSON.parse(localStorage.getItem('qc_scholarship_status_overrides') || '{}');
    } catch (_) {}

    getScholarships()
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const dbProgs: FeedItem[] = res.data.map((p: any) => {
            const progId = p.program_code || String(p.id);
            const status = localOverrides[progId] || p.status || 'Open';
            return {
              id: progId,
              title: p.title,
              description: p.summary || p.description || '',
              eligibility: (p.min_gwa_text || '') + (p.level ? `, ${p.level}` : ''),
              amount: parseFloat(p.amount) || 10000,
              deadline: p.deadline || '2026-09-30',
              category: p.category_id || p.category || 'Need-Based',
              slots: parseInt(p.slots) || 500,
              appliedCount: parseInt(p.applied_count) || 0,
              status: status,
              kind: 'scholarship',
              level: p.level || 'Tertiary',
              category_title: p.category_title || p.category || 'Scholarship',
            };
          });
          setItems(dbProgs);
        } else {
          setItems((prev) =>
            prev.map((item) => ({
              ...item,
              status: localOverrides[item.id] || item.status,
            }))
          );
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch scholarships from DB, using default program catalogue:', err);
        setItems((prev) =>
          prev.map((item) => ({
            ...item,
            status: localOverrides[item.id] || item.status,
          }))
        );
      });

    getMyApplications()
      .then((res) => {
        const dbApps = res && Array.isArray(res.data) ? res.data : [];
        setDbApplications(dbApps);
        if (isAdminOrStaff) {
          const activePending = dbApps.filter((a) => {
            const s = (a.status || '').toLowerCase();
            return s !== 'approved' && s !== 'granted' && s !== 'rejected' && s !== 'paid';
          }).length;
          setPendingReviewsCount(activePending);
        } else {
          // Student role: find if student already has active application
          const active = dbApps.find((a: any) => {
            const s = String(a.status || '').toLowerCase();
            return s !== 'rejected' && s !== 'cancelled';
          });
          if (active) {
            const unified = {
              id: active.reference_id || active.application_code || active.id,
              program_name: active.program_name || active.title,
              status: active.status,
              submissionDate: active.submission_date,
            };
            saveActiveStudentApplication(unified);
            setActiveStudentApp(unified);
            setAppliedIds(dbApps.map((a: any) => a.program_id || String(a.id)));
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch applications:', err);
      });
  }, [isAdminOrStaff]);

  const getAppliedCountForProgram = (id: string, title: string): number => {
    const match = dbApplications.filter((a) => {
      const pId = String(a.program_id || '').toLowerCase().trim();
      const pName = String(a.program_name || a.title || '').toLowerCase().trim();
      const targetId = String(id || '').toLowerCase().trim();
      const targetTitle = String(title || '').toLowerCase().trim();

      if (pId && pId === targetId) return true;
      if (pName && pName === targetTitle) return true;
      if (pName && targetTitle && (pName.includes(targetTitle) || targetTitle.includes(pName))) return true;

      if ((targetId.includes('economic') || targetId === 'tertiary-economic') && (pId.includes('economic') || pName.includes('economic') || pName.includes('need-based'))) return true;
      if ((targetId.includes('excel') || targetId === 'tertiary-excel') && (pId.includes('excel') || pName.includes('excel'))) return true;
      if (targetId === 'shs-academic' && (pId === 'shs-academic' || (pName.includes('academic') && (pName.includes('senior') || pName.includes('shs'))))) return true;
      if (targetId === 'tertiary-academic' && (pId === 'tertiary-academic' || (pName.includes('academic') && !pName.includes('senior') && !pName.includes('shs')))) return true;
      if (targetId.includes('specialized') && (pId.includes('specialized') || pName.includes('specialized'))) return true;
      if (targetId.includes('athletic') && (pId.includes('athletic') || pName.includes('athletic'))) return true;
      if (targetId.includes('youth') && (pId.includes('youth') || pName.includes('youth'))) return true;
      if (targetId.includes('filipino') && (pId.includes('filipino') || pName.includes('filipino'))) return true;
      if (targetId.includes('thesis') && (pId.includes('thesis') || pName.includes('thesis') || pName.includes('postgrad'))) return true;
      if (targetId.includes('vocational') && (pId.includes('vocational') || pName.includes('vocational') || pName.includes('continuing'))) return true;

      return false;
    });
    return match.length;
  };

  // Admin Program Creation Modal state
  const [showAdminCreateModal, setShowAdminCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newEligibility, setNewEligibility] = useState('');
  const [newAmount, setNewAmount] = useState('10000');
  const [newSlots, setNewSlots] = useState('25');
  const [newCategory, setNewCategory] = useState<'STEM' | 'Need-Based' | 'Merit-Based' | 'Athletic' | 'Continuing Education'>('STEM');
  const [newDeadline, setNewDeadline] = useState('2026-09-30');

  const filteredScholarships = items.filter((sch) => {
    const matchesSearch =
      sch.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sch.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sch.eligibility.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat =
      selectedCategory === 'All' ||
      sch.category === selectedCategory ||
      (selectedCategory === 'School Aid' && sch.category === 'Need-Based');

    let matchesTab = true;
    if (statusFilter === 'ongoing') {
      matchesTab = sch.status === 'Open' || sch.status === 'Closing Soon';
    } else if (statusFilter === 'upcoming') {
      matchesTab = sch.status === 'Upcoming';
    } else if (statusFilter === 'expired') {
      matchesTab = sch.status === 'Closed';
    }

    return matchesSearch && matchesCat && matchesTab;
  });

  const handleStartApplication = (_sch: Scholarship) => {
    if (!isPortalOpen && !isAdminOrStaff) {
      toast.error('Application portal intake is currently closed for new submissions.');
      return;
    }
    if (!isAdminOrStaff && activeStudentApp) {
      toast.warning('You already have an active application on file. Applicants may only apply once for an active scholarship program.');
      return;
    }
    navigate('/scholar-prog-available');
  };

  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Please enter a scholarship program title');
      return;
    }

    const newItem: FeedItem = {
      id: `PROG-${Date.now().toString().slice(-4)}`,
      title: newTitle,
      description: newDesc || 'City-funded scholarship program supporting deserving college students.',
      eligibility: newEligibility || 'Quezon City resident, currently enrolled in college.',
      amount: parseFloat(newAmount) || 10000,
      deadline: newDeadline,
      category: newCategory,
      slots: parseInt(newSlots) || 50,
      appliedCount: 0,
      status: 'Open',
      kind: 'scholarship',
    };

    setItems([newItem, ...items]);
    setShowAdminCreateModal(false);
    setNewTitle('');
    setNewDesc('');
    setNewEligibility('');
    toast.success(`Scholarship Program "${newTitle}" created successfully!`);
  };

  const handleToggleStatus = async (id: string) => {
    const target = items.find((item) => item.id === id);
    if (!target) return;
    const newStatus = target.status === 'Closed' ? 'Open' : 'Closed';

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );

    try {
      await updateScholarshipStatus(id, newStatus);
      toast.success(`Scholarship program "${target.title}" is now ${newStatus.toUpperCase()} in database.`);
    } catch (err) {
      console.warn('DB status update note:', err);
      toast.info(`Scholarship program "${target.title}" status updated to ${newStatus}.`);
    }

    try {
      const overrides = JSON.parse(localStorage.getItem('qc_scholarship_status_overrides') || '{}');
      overrides[id] = newStatus;
      localStorage.setItem('qc_scholarship_status_overrides', JSON.stringify(overrides));
    } catch (_) {}
  };

  const handlePortalToggle = async () => {
    const nextState = !isPortalOpen;
    setIsPortalOpen(nextState);
    try {
      const res = await updatePortalSettings({ isOpen: nextState });
      if (res.data?.data) {
        setPortalSettings(res.data.data);
      }
      toast.success(
        nextState
          ? 'Portal intake OPEN: Accepting student applications'
          : 'Portal intake CLOSED: Submissions locked in database'
      );
    } catch (err: any) {
      console.error('Failed to update portal settings:', err);
      toast.error('Failed to update portal status: ' + err.message);
    }
  };

  const handleDeleteProgram = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.info('Program removed from portal catalog.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">Scholarship Application Portal</h1>
            {!isAdminOrStaff && (
              <Badge variant="primary" size="md">
                <GraduationCap className="h-3.5 w-3.5 mr-1" />
                Unified Grants & Aid
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
            {isAdminOrStaff
              ? 'Configure city-sponsored scholarships, manage slots & criteria, and review active applicant pools.'
              : 'Browse and apply for all Quezon City institutional scholarships, bursaries, and merit awards in one portal.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdminOrStaff ? (
            <>
              {/* Clean Portal Toggle */}
              <button
                type="button"
                onClick={handlePortalToggle}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isPortalOpen
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/60'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100/70 dark:hover:bg-rose-900/60'
                }`}
                title="Toggle student application submissions"
              >
                <span className={`h-2 w-2 rounded-full ${isPortalOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span>{isPortalOpen ? 'Accepting Applications' : 'Submissions Closed'}</span>
              </button>

              <Button
                variant="primary"
                size="md"
                onClick={() => setShowAdminCreateModal(true)}
                leftIcon={<Plus className="h-4 w-4" />}
                className="font-bold shadow-md shadow-blue-600/20 cursor-pointer"
              >
                Create Program
              </Button>
            </>
          ) : (
            <Badge variant="success" size="md" className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Profile Active {profile?.studentId || user?.studentId ? `(${profile?.studentId || user?.studentId})` : ''}
            </Badge>
          )}
        </div>
      </div>

      {/* Admin KPI Stats */}
      {isAdminOrStaff && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft">
            <span className="text-slate-400 dark:text-slate-400 font-bold uppercase text-[10px] block">Active Programs</span>
            <span className="font-heading font-extrabold text-xl text-blue-600 dark:text-blue-400 mt-0.5 block">{items.length} Programs</span>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft">
            <span className="text-slate-400 dark:text-slate-400 font-bold uppercase text-[10px] block">Total Budget Allocation</span>
            <span className="font-heading font-extrabold text-xl text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              ₱{(items.reduce((sum, it) => sum + ((Number(it.amount) || 0) * (Number(it.slots) || 0)), 0) / 1000000).toFixed(1)}M
            </span>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft">
            <span className="text-slate-400 dark:text-slate-400 font-bold uppercase text-[10px] block">Total Open Slots</span>
            <span className="font-heading font-extrabold text-xl text-indigo-600 dark:text-indigo-400 mt-0.5 block">
              {items.reduce((sum, it) => sum + (Number(it.slots) || 0), 0).toLocaleString()} Slots
            </span>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft">
            <span className="text-slate-400 dark:text-slate-400 font-bold uppercase text-[10px] block">Review Queue</span>
            <span className="font-heading font-extrabold text-xl text-amber-600 dark:text-amber-400 mt-0.5 block">{pendingReviewsCount} Applications</span>
          </div>
        </div>
      )}

      {/* Admin Operations Segmented Navigation */}
      {isAdminOrStaff && (
        <div className="bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-2xl flex gap-1 border border-slate-200/80 dark:border-slate-700/80 max-w-xl">
          {[
            { id: 'programs', label: 'Programs & Catalog', icon: Layers },
            { id: 'reviews', label: 'Review Queue', icon: Inbox },
            { id: 'renewal', label: 'Applicant Renewal', icon: RefreshCw },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = adminActiveTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAdminActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs font-extrabold border border-slate-200/60 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {(!isAdminOrStaff || adminActiveTab === 'programs') && (
        <>
          {/* Student AI Pre-fill Info Callout */}
          {!isPortalOpen && !isAdminOrStaff && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3 text-xs text-amber-950 dark:text-amber-200 shadow-sm">
              <div className="h-8 w-8 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                ⚠️
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-extrabold text-sm text-amber-900 dark:text-amber-200">Application Intake Currently Closed</p>
                  <span className="text-[10px] font-bold bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-md">
                    Portal Locked
                  </span>
                </div>
                <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed font-medium">
                  {portalSettings?.closedMessage ||
                    'The Quezon City Scholarship Application Portal is currently closed for new submissions. Evaluators are processing active candidate queues.'}
                </p>
                {portalSettings?.nextCycleOpening && (
                  <p className="text-[11px] font-bold text-amber-900 dark:text-amber-200 pt-0.5">
                    Expected Next Intake Cycle: <strong>{portalSettings.nextCycleOpening}</strong> ({portalSettings.academicYear} • {portalSettings.term})
                  </p>
                )}
              </div>
            </div>
          )}

          {!isAdminOrStaff && (
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-300">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">✨ No need to re-enter basic information!</p>
                <p className="text-blue-800 dark:text-blue-300/90">
                  Your basic details (Name, Student ID, Email, Course, GPA, Barangay) are automatically linked. When applying, you only fill program-specific statements and submit required document attachments.
                </p>
              </div>
            </div>
          )}

          {/* Unified Compact Search & Filters Toolbar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search programs by title, eligibility, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-9 pr-4 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-blue-600 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              {/* Category Select Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 h-9 text-xs">
                <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  aria-label="Filter by category"
                  className="bg-transparent font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="All" className="dark:bg-slate-900 dark:text-white">All Categories</option>
                  <option value="Need-Based" className="dark:bg-slate-900 dark:text-white">Need-Based</option>
                  <option value="Merit-Based" className="dark:bg-slate-900 dark:text-white">Merit-Based</option>
                  <option value="STEM" className="dark:bg-slate-900 dark:text-white">STEM Field</option>
                  <option value="School Aid" className="dark:bg-slate-900 dark:text-white">School Aid</option>
                </select>
              </div>

              {/* Status Select Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 h-9 text-xs">
                <span className="text-slate-400 font-medium">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  aria-label="Filter by status"
                  className="bg-transparent font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="all" className="dark:bg-slate-900 dark:text-white">All Statuses</option>
                  <option value="ongoing" className="dark:bg-slate-900 dark:text-white">Active / Ongoing</option>
                  <option value="upcoming" className="dark:bg-slate-900 dark:text-white">Upcoming</option>
                  <option value="expired" className="dark:bg-slate-900 dark:text-white">Closed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grouped Program List by Educational Level */}
          <div className="space-y-8">
            {(() => {
              const groups: { [key: string]: FeedItem[] } = {};
              filteredScholarships.forEach((sch) => {
                const groupName = sch.category_title || 'Other Scholarship Programs';
                if (!groups[groupName]) {
                  groups[groupName] = [];
                }
                groups[groupName].push(sch);
              });

              return Object.entries(groups).map(([groupTitle, schList]) => {
                const isExpanded = expandedGroups[groupTitle] === true;

                return (
                  <div key={groupTitle} className="space-y-4">
                    <div
                      onClick={() => {
                        setExpandedGroups((prev) => ({
                          ...prev,
                          [groupTitle]: !isExpanded,
                        }));
                      }}
                      className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/70 rounded-xl px-2 py-1 transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-4 w-1 bg-blue-600 rounded-full" />
                        <h3 className="font-heading font-extrabold text-xs text-slate-800 dark:text-slate-200 tracking-wider uppercase group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {groupTitle}
                        </h3>
                        <Badge variant="primary" size="sm">
                          {schList.length} {schList.length === 1 ? 'Program' : 'Programs'}
                        </Badge>
                      </div>
                      <button
                        type="button"
                        className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors p-1 cursor-pointer"
                      >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-1 duration-200">
                        {schList.map((sch) => {
                          const isApplied = appliedIds.includes(sch.id);

                          return (
                            <Card key={sch.id} hoverEffect className="flex flex-col justify-between border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                              <CardHeader className="space-y-2 pb-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Badge variant={sch.category === 'STEM' ? 'success' : sch.category === 'Merit-Based' ? 'primary' : 'info'} size="sm">
                                      {sch.category}
                                    </Badge>
                                    <Badge variant={sch.status === 'Open' ? 'success' : 'warning'} size="sm">
                                      {sch.status === 'Open' ? 'Active' : sch.status}
                                    </Badge>
                                  </div>

                                  {isAdminOrStaff && (
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleToggleStatus(sch.id)}
                                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                                        title={sch.status === 'Closed' ? 'Re-open program' : 'Close program'}
                                      >
                                        <Edit3 className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteProgram(sch.id)}
                                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all cursor-pointer"
                                        title="Delete Program"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>

                                <CardTitle className="text-base font-bold text-slate-900 dark:text-white leading-snug">{sch.title}</CardTitle>
                                <CardDescription className="line-clamp-2 text-slate-600 dark:text-slate-400 text-xs">{sch.description}</CardDescription>
                              </CardHeader>

                              <CardContent className="space-y-3 text-xs text-slate-600 dark:text-slate-300 pt-0">
                                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50/80 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                                  <div>
                                    <span className="text-[11px] text-slate-400 dark:text-slate-400 block">Grant Amount</span>
                                    <span className="font-bold text-slate-900 dark:text-white text-sm">{formatCurrency(sch.amount)}</span>
                                  </div>
                                  <div>
                                    <span className="text-[11px] text-slate-400 dark:text-slate-400 block">Deadline</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                                      <Calendar className="h-3.5 w-3.5 text-slate-400" /> {formatDate(sch.deadline)}
                                    </span>
                                  </div>
                                </div>

                                <div>
                                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-[11px]">Eligibility Criteria:</span>
                                  <p className="p-2.5 bg-blue-50/50 dark:bg-blue-950/40 border border-blue-100/80 dark:border-blue-800/80 text-blue-900 dark:text-blue-300 rounded-xl leading-relaxed font-medium text-xs">
                                    {sch.eligibility}
                                  </p>
                                </div>
                              </CardContent>

                              <CardFooter className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                                {isAdminOrStaff ? (
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedProgramFilter(sch.title);
                                      setAdminActiveTab('reviews');
                                    }}
                                    className="w-full font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                    rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                                  >
                                    Review Queue ({getAppliedCountForProgram(sch.id, sch.title)} Applicants)
                                  </Button>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => setActiveModalScholarship(sch)}
                                      className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
                                    >
                                      View Details
                                    </button>
                                    <Button
                                      variant={isApplied ? 'secondary' : 'primary'}
                                      size="sm"
                                      onClick={() => handleStartApplication(sch)}
                                      className="font-bold bg-blue-600 hover:bg-blue-700 text-white px-5"
                                      rightIcon={!isApplied && <ArrowRight className="h-3.5 w-3.5" />}
                                    >
                                      {isApplied ? 'Applied' : 'Apply Now'}
                                    </Button>
                                  </>
                                )}
                              </CardFooter>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </>
      )}

      {isAdminOrStaff && adminActiveTab === 'reviews' && (
        <div className="mt-4">
          <ApplicationReviewQueuePage
            initialProgramFilter={selectedProgramFilter}
            onClearProgramFilter={() => setSelectedProgramFilter(null)}
            onBackToPrograms={() => {
              setSelectedProgramFilter(null);
              setAdminActiveTab('programs');
            }}
          />
        </div>
      )}

      {isAdminOrStaff && adminActiveTab === 'renewal' && (
        <div className="mt-4">
          <ConditionalOffersPage />
        </div>
      )}

      {/* Admin Creation Modal */}
      {showAdminCreateModal && (
        <Modal
          isOpen={showAdminCreateModal}
          onClose={() => setShowAdminCreateModal(false)}
          title="Create New Scholarship Program"
          description="Configure the program details, award value, eligibility criteria, and open slots."
          footer={
            <div className="flex gap-2 w-full justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowAdminCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleCreateProgram} className="font-bold bg-blue-600 text-white">
                Submit & Publish Program
              </Button>
            </div>
          }
        >
          <form onSubmit={handleCreateProgram} className="space-y-4 text-xs">
            <Input
              id="sch-title"
              label="Scholarship Program Title *"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Quezon City Excellence in Engineering Grant"
              required
            />

            <div className="space-y-1">
              <label className="block font-bold text-slate-800">Program Description *</label>
              <textarea
                rows={3}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Detailed explanation of the grant award and objectives..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 resize-none"
                required
              />
            </div>

            <Input
              id="sch-eligibility"
              label="Eligibility Requirements *"
              value={newEligibility}
              onChange={(e) => setNewEligibility(e.target.value)}
              placeholder="e.g. Minimum GPA 3.50, Quezon City resident voter, CS major"
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                id="sch-amount"
                label="Award Value (₱) *"
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                required
              />
              <Input
                id="sch-slots"
                label="Total Available Slots *"
                type="number"
                value={newSlots}
                onChange={(e) => setNewSlots(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Category *</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                >
                  <option value="STEM">STEM Field Grant</option>
                  <option value="Need-Based">Need-Based Financial Assistance</option>
                  <option value="Merit-Based">Merit & Honor Award</option>
                  <option value="Continuing Education">Continuing Education Aid</option>
                  <option value="Athletic">Athletic & Talent Grant</option>
                </select>
              </div>

              <Input
                id="sch-deadline"
                label="Application Deadline *"
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                required
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Modal for Program Details (Student View) */}
      {activeModalScholarship && (
        <Modal
          isOpen={!!activeModalScholarship}
          onClose={() => setActiveModalScholarship(null)}
          title={activeModalScholarship.title}
          description={`Grant Award: ${formatCurrency(activeModalScholarship.amount)} | Category: ${activeModalScholarship.category}`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setActiveModalScholarship(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleStartApplication(activeModalScholarship)}
                className="font-bold bg-blue-600 hover:bg-blue-700 text-white"
              >
                Fill Application Form
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Program Overview</h4>
              <p className="text-slate-600 leading-relaxed">{activeModalScholarship.description}</p>
            </div>

            <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 space-y-1">
              <h4 className="font-bold text-blue-950">Eligibility & Qualifications</h4>
              <p className="text-blue-900 font-medium">{activeModalScholarship.eligibility}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900">Required Vault Documents:</h4>
              <ul className="space-y-1.5 text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> Certificate of Indigency / Proof of Income
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> Official Transcript of Records (GPA 3.5+)
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600 shrink-0" /> Statement of Financial Need Essay
                </li>
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ScholarshipsPage;
