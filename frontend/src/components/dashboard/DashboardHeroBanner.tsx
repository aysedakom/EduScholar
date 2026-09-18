import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, CloudSun } from 'lucide-react';
import type { UserRole } from '../../types';

export interface TabOption {
  id: string;
  label: string;
  link?: string;
}

interface DashboardHeroBannerProps {
  role: UserRole;
  userName?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export const DashboardHeroBanner: React.FC<DashboardHeroBannerProps> = ({
  role,
  userName,
  activeTab: externalActiveTab,
  onTabChange,
}) => {
  const navigate = useNavigate();
  const [internalActiveTab, setInternalActiveTab] = useState('all');
  const activeTab = externalActiveTab || internalActiveTab;

  // Display name formatted cleanly
  const displayName = userName && userName.trim() !== '' ? userName : 'Vinzel James Maraño';

  // Role Configurations
  const getRoleConfig = () => {
    switch (role) {
      case 'treasury':
        return {
          badge: 'CITY TREASURY OFFICE • FISCAL COMMAND CENTER',
          welcome: `Welcome, ${displayName}!`,
          subtitle:
            'Authorize funding tranches, review incoming Admin Grant Drawdown Requests, and reconcile beneficiary payouts.',
          tabs: [
            { id: 'all', label: 'Fiscal Overview', link: '/treasury/dashboard' },
            { id: 'budget', label: 'Budget & Fund Pools', link: '/treasury/budget' },
            { id: 'reconciliation', label: 'Disbursement Reconciliation', link: '/treasury/reconciliation' },
            { id: 'payroll', label: 'Payroll Authorization', link: '/treasury/payroll-authorization' },
            { id: 'messages', label: 'Inter-Agency Hotline', link: '/messages' },
          ],
        };

      case 'supervisor':
        return {
          badge: 'SCHOLAR SUPERVISION PORTAL • DASHBOARD',
          welcome: `Welcome, ${displayName}!`,
          subtitle:
            'Perform student performance evaluations, monitor assigned scholars, and verify university enrollment status.',
          tabs: [
            { id: 'all', label: 'Supervision Hub', link: '/supervisor/dashboard' },
            { id: 'evaluations', label: 'Student Evaluations', link: '/supervisor/evaluations' },
            { id: 'verification', label: 'Enrollment Verification', link: '/supervisor/enrollment-verification' },
            { id: 'assigned', label: 'Assigned Scholars', link: '/supervisor/assigned-students' },
            { id: 'messages', label: 'Messages & Support', link: '/messages' },
          ],
        };

      case 'school_coordinator':
        return {
          badge: 'INSTITUTIONAL REGISTRAR PORTAL • ACADEMIC DASHBOARD',
          welcome: `Welcome, ${displayName}!`,
          subtitle:
            'Batch verify enrolled scholars, certify university masterlists, monitor academic records, and track retention.',
          tabs: [
            { id: 'all', label: 'Registrar Hub', link: '/school/dashboard' },
            { id: 'batch', label: 'Batch Verification', link: '/school/batch-verification' },
            { id: 'academic', label: 'Academic Monitoring', link: '/school/academic-monitoring' },
            { id: 'reports', label: 'Education Reports', link: '/admin/education-reports' },
            { id: 'contact', label: 'Help Desk', link: '/contact' },
          ],
        };

      case 'admin':
      case 'system_admin':
        return {
          badge: 'QCYDO + HRMD PORTAL • ADMINISTRATOR COMMAND CENTER',
          welcome: `Welcome, ${displayName}!`,
          subtitle:
            'Monitor active scholarship review queues, financial disbursement batches, partner school compliance, and budget metrics.',
          tabs: [
            { id: 'all', label: 'All Operations', link: '/admin/dashboard' },
            { id: 'review', label: 'Scholarships Queue', link: '/admin/application-review' },
            { id: 'schools', label: 'Partner Schools', link: '/admin/partner-schools' },
            { id: 'distribution', label: 'School Aid Distribution', link: '/admin/school-aid-distribution' },
            { id: 'registry', label: 'Student Registry', link: '/admin/student-registry' },
            { id: 'analytics', label: 'Advanced Analytics', link: '/admin/analytics' },
          ],
        };

      case 'student':
      default:
        return {
          badge: 'DRRM CITIZEN PORTAL • DASHBOARD',
          welcome: `Welcome, ${displayName}!`,
          subtitle:
            'Access your digital resident card, track relief distributions, and check local shelter status and requirements.',
          tabs: [
            { id: 'all', label: 'All Services', link: '/dashboard' },
            { id: 'applications', label: 'Scholarship Applications', link: '/applications' },
            { id: 'distribution', label: 'School Aid Distribution', link: '/student/school-aid-distribution' },
            { id: 'registry', label: 'Student Registry', link: '/student/registry' },
            { id: 'documents', label: 'Document Vault', link: '/documents' },
          ],
        };
    }
  };

  const config = getRoleConfig();

  const handleTabClick = (tab: TabOption) => {
    setInternalActiveTab(tab.id);
    if (onTabChange) {
      onTabChange(tab.id);
    }
    if (tab.link && tab.link !== window.location.pathname) {
      navigate(tab.link);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#0d1f3f] via-[#152e5a] to-[#1c3b73] p-6 sm:p-8 md:p-10 text-white shadow-2xl border border-white/10 transition-all duration-300">
      {/* Background Seal Watermark Graphic */}
      <div className="pointer-events-none absolute right-[-40px] top-1/2 -translate-y-1/2 h-[150%] w-auto opacity-15 mix-blend-screen select-none hidden md:block">
        <img
          src="/lgu_qc_seal.webp"
          alt="Quezon City Seal"
          className="h-full w-auto object-contain filter drop-shadow-md"
          onError={(e) => {
            // Fallback if image fails to load
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

      {/* Decorative Gradient Glow Orbs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />

      {/* Banner Top Row */}
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Top Left Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold tracking-wider text-white backdrop-blur-md shadow-sm w-fit">
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20">
            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="uppercase">{config.badge}</span>
        </div>

        {/* Top Right Weather & Location Card */}
        <div className="inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-white backdrop-blur-md shadow-sm w-fit self-start sm:self-auto">
          <CloudSun className="h-5 w-5 text-amber-300 shrink-0 animate-pulse" />
          <div className="text-left">
            <div className="text-[10px] font-extrabold tracking-widest text-blue-200 uppercase">
              QUEZON CITY
            </div>
            <div className="text-xs font-semibold text-white">
              Partly Cloudy • 28°C
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Heading & Subtitle */}
      <div className="relative z-10 mt-6 sm:mt-8">
        <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-sm">
          {config.welcome}
        </h1>
        <p className="mt-2.5 max-w-3xl text-sm sm:text-base font-normal leading-relaxed text-blue-100/90">
          {config.subtitle}
        </p>
      </div>

      {/* Bottom Filter & Quick Navigation Pills */}
      <div className="relative z-10 mt-6 sm:mt-8 flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2">
        {config.tabs.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-[#09152b] text-white border border-white/30 shadow-lg scale-105 ring-2 ring-white/10'
                  : 'bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white border border-white/15 backdrop-blur-md'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
