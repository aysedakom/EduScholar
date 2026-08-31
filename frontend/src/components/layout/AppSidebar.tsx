import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  DollarSign,
  CheckSquare,
  Star,
  FileText,
  Building2,
  Users,
  ShieldCheck,
  BarChart3,
  Layers,
  HelpCircle,
  Clock,
  UserCheck,
  BookOpen,
  ShieldAlert,
  Database,
  Sliders,
  AlertTriangle,
  KeyRound,
  Activity,
  FileCode,
  HardDrive,
  X
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { cn } from '../../utils/cn';

interface SidebarItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  roles?: readonly string[];
}

interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    label: 'CORE NAVIGATION',
    items: [
      {
        label: 'Dashboard',
        to: '/dashboard',
        icon: LayoutDashboard,
        roles: [
          'student',
          'admin',
          'supervisor',
          'school_coordinator',
          'treasury',
          'system_admin',
        ] as const,
      },
    ],
  },
  {
    label: 'Admin Portal (QCYDO)',
    items: [
      { label: 'Scholarship Application Portal', to: '/admin/scholarships', icon: GraduationCap, roles: ['admin', 'system_admin'] as const },
      { label: 'School Aid Distribution', to: '/admin/school-aid-distribution', icon: DollarSign, roles: ['admin', 'system_admin'] as const },
      { label: 'Student Registry', to: '/admin/student-registry', icon: ShieldCheck, roles: ['admin', 'system_admin'] as const },
      { label: 'Partner School Database', to: '/admin/partner-schools', icon: Building2, roles: ['admin', 'system_admin'] as const },
      { label: 'Education Monitoring Reports', to: '/admin/education-reports', icon: BarChart3, roles: ['admin', 'system_admin'] as const },
    ],
  },
  {
    label: 'Supervisor Portal',
    items: [
      { label: 'Evaluations', to: '/supervisor/evaluations', icon: Star, roles: ['supervisor'] as const },
      { label: 'Enrollment Verification', to: '/supervisor/enrollment-verification', icon: UserCheck, roles: ['supervisor'] as const },
      { label: 'My Assigned Students', to: '/supervisor/assigned-students', icon: Users, roles: ['supervisor'] as const },
    ],
  },
  {
    label: 'School Portal',
    items: [
      { label: 'Partner School Database', to: '/admin/partner-schools', icon: Building2, roles: ['school_coordinator'] as const },
      { label: 'Academic Monitoring', to: '/school/academic-monitoring', icon: BookOpen, roles: ['school_coordinator'] as const },
      { label: 'Batch Verification', to: '/school/batch-verification', icon: CheckSquare, roles: ['school_coordinator'] as const },
    ],
  },
  {
    label: 'Treasury Portal',
    items: [
      { label: 'Budget Management', to: '/treasury/budget', icon: DollarSign, roles: ['treasury'] as const },
      { label: 'Reconciliation', to: '/treasury/reconciliation', icon: FileText, roles: ['treasury'] as const },
    ],
  },
  {
    label: 'System Admin Console',
    items: [
      { label: 'User Management', to: '/admin/users', icon: Users, roles: ['system_admin'] as const },
      { label: 'Super Admin Settings', to: '/admin/super-admin', icon: ShieldCheck, roles: ['system_admin'] as const },
      { label: 'Roles & Permissions', to: '/admin/roles-permissions', icon: KeyRound, roles: ['system_admin'] as const },
      { label: 'System Configuration', to: '/admin/system-config', icon: Sliders, roles: ['system_admin'] as const },
      { label: 'Master Student DB', to: '/admin/master-student-db', icon: Database, roles: ['system_admin'] as const },
      { label: 'Employer Management', to: '/admin/employers', icon: Building2, roles: ['system_admin'] as const },
      { label: 'Fund Pools', to: '/admin/fund-pools', icon: DollarSign, roles: ['system_admin'] as const },
      { label: 'System Workflows', to: '/admin/workflows', icon: Layers, roles: ['system_admin'] as const },
      { label: 'API Integrations', to: '/admin/api-integrations', icon: FileCode, roles: ['system_admin'] as const },
      { label: 'Audit & System Logs', to: '/admin/system-logs', icon: Activity, roles: ['system_admin'] as const },
      { label: 'Database Admin', to: '/admin/database', icon: HardDrive, roles: ['system_admin'] as const },
      { label: 'Maintenance Mode', to: '/admin/maintenance', icon: AlertTriangle, roles: ['system_admin'] as const },
      { label: 'Security Management', to: '/admin/security', icon: ShieldAlert, roles: ['system_admin'] as const },
    ],
  },
  {
    label: 'UTILITIES',
    items: [
      {
        label: 'Messages',
        to: '/messages',
        icon: FileText,
        roles: [
          'student',
          'admin',
          'supervisor',
          'school_coordinator',
          'treasury',
          'system_admin',
        ] as const,
      },
      {
        label: 'Calendar',
        to: '/calendar',
        icon: Clock,
        roles: [
          'student',
          'admin',
          'supervisor',
          'school_coordinator',
          'treasury',
          'system_admin',
        ] as const,
      },
      {
        label: 'Help Desk & Support',
        to: '/contact',
        icon: HelpCircle,
        roles: [
          'student',
          'admin',
          'supervisor',
          'school_coordinator',
          'treasury',
          'system_admin',
        ] as const,
      },
    ],
  },
];

interface AppSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  mobileOpen?: boolean;
  onClose?: () => void;
}

const TRANSLATE_SIDEBAR: Record<string, string> = {
  'CORE NAVIGATION': 'PANGUNAHING NABIGASYON',
  'Dashboard': 'Dashboard',
  'Student Portal': 'Portal ng Mag-aaral',
  'Available Scholarships': 'Mga Bukas na Iskolarship',
  'My Applications': 'Aking mga Aplikasyon',
  'Document Vault': 'Vault ng Dokumento',
  'Semestral Renewal': 'Pagpapanibago (Renewal)',
  'Eligibility Matcher': 'Pagsusuri ng Kwalipikasyon',
  'COMMUNICATION': 'KOMUNIKASYON',
  'Messages': 'Mga Mensahe',
  'Calendar': 'Kalendaryo',
  'Notifications': 'Mga Abiso',
  'Help Desk & Support': 'Tulong at Suporta',
  'SCHOLARSHIP DISCOVERY': 'PAGHAHANAP NG ISKOLARSHIP',
  'Browse Grants': 'Maghanap ng Grants',
  'Bursary Assistance': 'Tulong sa Bursary',
  'Special Aid & Hardship': 'Pang-emerhensyang Tulong',
  'MANAGEMENT & VERIFICATION': 'PAMAMAHALA AT BERIPIKASYON',
  'Review Applications': 'Suriin ang mga Aplikasyon',
  'Batch Verification': 'Batch na Beripikasyon',
  'Academic Monitoring': 'Akademikong Pagsubaybay',
  'Assigned Students': 'Nakatalagang Mag-aaral',
  'Partner Schools': 'Katuwang na Paaralan',
  'Reports & Analytics': 'Ulat at Analytics',
};

export function AppSidebar({ collapsed = false, mobileOpen = false, onClose }: AppSidebarProps) {
  const { user } = useAuth();
  const { isTagalog } = useLanguage();
  const role = user?.role ?? 'student';

  return (
    <aside
      className={cn(
        'flex flex-col bg-slate-900 border-r border-slate-800 text-slate-300 font-sans shadow-2xl transition-all duration-300 ease-in-out z-50 shrink-0',
        'fixed inset-y-0 left-0 h-[100dvh] lg:static lg:h-full',
        'w-[280px] sm:w-72 max-w-[85vw] lg:max-w-none',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        collapsed ? 'lg:w-20' : 'lg:w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 bg-slate-900 px-4 gap-3">
        <div className="flex items-center gap-3 min-w-0 truncate">
          <img
            src="/logo-system.png"
            alt="GovServe Logo"
            className="h-10 w-10 min-w-[40px] min-h-[40px] object-contain bg-blue-600/25 p-0.5 rounded-full border border-blue-500/40 shadow-md shrink-0 transition-transform hover:scale-105"
          />
          <div className={cn('flex flex-col min-w-0 truncate', collapsed ? 'lg:hidden' : 'flex')}>
            <span className="font-heading font-black text-base text-white tracking-tight leading-none truncate">
              GovServe
            </span>
            <span className="text-[10px] text-blue-400 font-bold tracking-wider uppercase mt-1 truncate">
              Campus Aid Hub
            </span>
          </div>
        </div>

        {/* Mobile Close Button (Touch target min 44x44) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation sidebar"
          className="flex lg:hidden p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors cursor-pointer shrink-0"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Groups Container */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
        {SIDEBAR_GROUPS.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !item.roles || item.roles.includes(role)
          );

          if (visibleItems.length === 0) return null;

          const groupLabel = isTagalog && TRANSLATE_SIDEBAR[group.label] ? TRANSLATE_SIDEBAR[group.label] : group.label;

          return (
            <div key={group.label} className="space-y-1.5">
              <p
                className={cn(
                  'px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 truncate',
                  collapsed ? 'lg:hidden' : 'block'
                )}
              >
                {groupLabel}
              </p>
              {collapsed && <div className="hidden lg:block h-px bg-slate-800/80 my-2 mx-1" title={groupLabel} />}

              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const itemLabel = isTagalog && TRANSLATE_SIDEBAR[item.label] ? TRANSLATE_SIDEBAR[item.label] : item.label;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      title={collapsed ? itemLabel : undefined}
                      className={({ isActive }) =>
                        cn(
                          'group flex items-center rounded-xl transition-all duration-150 min-h-[42px]',
                          collapsed
                            ? 'lg:justify-center lg:p-2.5 justify-between px-3 py-2 text-xs font-bold'
                            : 'justify-between px-3 py-2 text-xs font-bold',
                          isActive
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                            : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                        )
                      }
                    >
                      <div className={cn('flex items-center min-w-0', collapsed ? 'lg:justify-center gap-2.5' : 'gap-2.5')}>
                        <Icon className={cn('shrink-0 transition-transform group-hover:scale-110', collapsed ? 'lg:h-5 lg:w-5 h-4 w-4' : 'h-4 w-4')} />
                        <span className={cn('truncate', collapsed ? 'lg:hidden inline' : 'inline')}>
                          {itemLabel}
                        </span>
                      </div>
                      {item.badge && (
                        <span
                          className={cn(
                            'rounded-md bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-extrabold text-blue-300 border border-blue-400/30',
                            collapsed ? 'lg:hidden inline' : 'inline'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
