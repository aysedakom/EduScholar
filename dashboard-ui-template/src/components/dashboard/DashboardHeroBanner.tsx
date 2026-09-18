import React from 'react';
import { Sparkles, Calendar, ArrowUpRight } from 'lucide-react';

interface DashboardHeroBannerProps {
  role: 'student' | 'admin' | 'system_admin' | 'supervisor' | 'school_coordinator' | 'treasury';
  userName?: string;
}

export const DashboardHeroBanner: React.FC<DashboardHeroBannerProps> = ({ role, userName }) => {
  const getBannerData = () => {
    switch (role) {
      case 'treasury':
        return {
          title: 'Treasury & Disbursement Hub',
          subtitle: 'Fiscal oversight, budget allocation, fund requests, and COA bank reconciliation.',
          ctaText: 'Financial Overview',
        };
      case 'supervisor':
        return {
          title: 'Supervisor Evaluation Desk',
          subtitle: 'Student academic retention, term renewals, mentorship, and institution verification.',
          ctaText: 'View Evaluations',
        };
      case 'school_coordinator':
        return {
          title: 'School Partner Portal',
          subtitle: 'Academic monitoring, registrar verification, official endorsements, and grade auditing.',
          ctaText: 'School Roster',
        };
      case 'system_admin':
      case 'admin':
        return {
          title: 'Scholarship Operations Center',
          subtitle: 'City-wide application screening, fraud monitoring, partner schools, and fund management.',
          ctaText: 'System Operations',
        };
      default:
        return {
          title: 'Quezon City Scholar Portal',
          subtitle: 'Welcome to the unified scholarship portal. Track requirements, review status, and stay updated.',
          ctaText: 'View Guidelines',
        };
    }
  };

  const data = getBannerData();
  const displayName = userName || 'Pia Marie Tiburcio Faner';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-6 sm:p-8 lg:p-10 shadow-medium">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 bg-blue-400/20 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-200">
            <span className="flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Official Portal • Academic Year 2026–2027
            </span>
          </div>

          <h2 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-tight">
            Welcome back, <span className="text-amber-300">{displayName}</span>
          </h2>

          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-normal">
            {data.subtitle}
          </p>
        </div>

        <div className="flex flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0">
          <div className="text-left md:text-right">
            <span className="text-[10px] sm:text-xs text-blue-200 uppercase tracking-widest font-semibold block">
              Today's Date
            </span>
            <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
              <Calendar className="h-4 w-4 text-blue-300" />
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-blue-900 font-bold text-xs shadow-soft hover:bg-blue-50 transition-all hover:scale-105 cursor-pointer"
          >
            <span>{data.ctaText}</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
