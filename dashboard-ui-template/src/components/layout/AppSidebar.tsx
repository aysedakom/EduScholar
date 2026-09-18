import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Building2,
  Users,
  GraduationCap,
  WalletCards,
  Calendar,
  MessageSquare,
  LifeBuoy,
  X,
} from 'lucide-react';

interface AppSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
  activeRole: string;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ mobileOpen, onClose, activeRole }) => {
  const getNavItems = () => {
    switch (activeRole) {
      case 'treasury':
        return [
          { name: 'Treasury Dashboard', icon: LayoutDashboard, active: true },
          { name: 'Budget & Fund Pools', icon: WalletCards },
          { name: 'Reconciliation', icon: FileText },
          { name: 'Disbursement Calendar', icon: Calendar },
          { name: 'Official Messages', icon: MessageSquare },
        ];
      case 'school_coordinator':
        return [
          { name: 'Coordinator Dashboard', icon: LayoutDashboard, active: true },
          { name: 'Endorsements', icon: FileText },
          { name: 'Batch Verification', icon: Users },
          { name: 'Academic Monitoring', icon: GraduationCap },
          { name: 'Notices & Support', icon: MessageSquare },
        ];
      case 'supervisor':
        return [
          { name: 'Supervisor Dashboard', icon: LayoutDashboard, active: true },
          { name: 'Student Evaluations', icon: GraduationCap },
          { name: 'Enrollment Audits', icon: FileText },
          { name: 'Assigned Scholars', icon: Users },
          { name: 'Supervisor Channels', icon: MessageSquare },
        ];
      case 'admin':
      case 'system_admin':
        return [
          { name: 'Admin Dashboard', icon: LayoutDashboard, active: true },
          { name: 'Scholarship Programs', icon: GraduationCap },
          { name: 'Partner Schools', icon: Building2 },
          { name: 'Student Registry', icon: Users },
          { name: 'Fund Requests', icon: WalletCards },
          { name: 'Education Reports', icon: FileText },
        ];
      default:
        return [
          { name: 'Scholar Dashboard', icon: LayoutDashboard, active: true },
          { name: 'Applications Tracker', icon: FileText },
          { name: 'Document Vault', icon: Building2 },
          { name: 'Available Scholarships', icon: GraduationCap },
          { name: 'Calendar', icon: Calendar },
          { name: 'Messages & Support', icon: MessageSquare },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden backdrop-blur-xs cursor-pointer"
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 lg:static flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 font-sans transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 px-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
              GS
            </div>
            <div>
              <span className="font-heading font-black text-sm text-white tracking-tight block">
                GovServe
              </span>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">
                Campus Aid Hub
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white lg:hidden cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-2 pt-1">
            Navigation Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                type="button"
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                  item.active
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Footer Support */}
        <div className="p-4 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-800/40 text-slate-400">
            <LifeBuoy className="h-4 w-4 text-blue-400 shrink-0" />
            <div className="min-w-0">
              <span className="block text-[11px] font-bold text-slate-200 truncate">
                Help Desk Active
              </span>
              <span className="block text-[10px] text-slate-400 truncate">
                support@govserve.ph
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
