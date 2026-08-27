import React from 'react';
import { ShieldCheck, Database, Server, Lock, Cpu, Users, Activity, Sliders, FileText, DatabaseZap, ShieldAlert, Wrench, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/cn';

export const SuperAdminPage: React.FC = () => {
  const cpuUsage = 24;
  const memoryUsage = 38;
  const diskUsage = 42;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-extrabold text-2xl text-foreground">Super Admin Control Portal</h1>
                <Badge variant="destructive">Super Admin Access</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Full-stack system administration, server resource monitoring, database backups, and security policy control.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/admin/config">
              <Button variant="outline" size="sm" leftIcon={<Sliders className="h-4 w-4" />}>
                System Config
              </Button>
            </Link>
            <Link to="/admin/database">
              <Button variant="primary" size="sm" leftIcon={<DatabaseZap className="h-4 w-4" />} className="font-bold">
                Database Management
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* System Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card hoverEffect>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">System Health</p>
              <p className="font-heading font-extrabold text-2xl text-emerald-600 mt-0.5">100% Operational</p>
              <p className="text-[11px] text-slate-500 mt-1">API & PostgreSQL Online</p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <Activity className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Active Users Online</p>
              <p className="font-heading font-extrabold text-2xl text-blue-600 mt-0.5">142 Users</p>
              <p className="text-[11px] text-slate-500 mt-1">Students & Officers</p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Total Aid Dollars Processed</p>
              <p className="font-heading font-extrabold text-2xl text-slate-900 mt-0.5">{formatCurrency(100000000)}</p>
              <p className="text-[11px] text-slate-500 mt-1">FY 2026 Disbursements</p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200">
              <Database className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Backup Status</p>
              <p className="font-heading font-extrabold text-2xl text-emerald-600 mt-0.5">Automated Daily</p>
              <p className="text-[11px] text-slate-500 mt-1">Last Backup: Today 04:00 AM</p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <RefreshCw className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Server Resources & Quick Admin Links Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Server Hardware Resource Usage */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              Server Resource Utilization
            </CardTitle>
            <CardDescription>Live hardware metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-600">CPU Usage (8 Cores)</span>
                <span className="font-bold text-slate-900">{cpuUsage}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                <div className="bg-primary h-full rounded-full" style={{ width: `${cpuUsage}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-600">RAM Allocation (32 GB)</span>
                <span className="font-bold text-slate-900">{memoryUsage}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${memoryUsage}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-600">NVMe SSD Storage (500 GB)</span>
                <span className="font-bold text-slate-900">{diskUsage}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${diskUsage}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Administration Tools Quick Matrix */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sliders className="h-5 w-5 text-indigo-600" />
              System Administration Tool Suite
            </CardTitle>
            <CardDescription>Quick access to all 11 Super Admin management modules</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {[
                { label: 'User Directory', to: '/admin/users', icon: Users },
                { label: 'Role & Permissions', to: '/admin/roles', icon: ShieldCheck },
                { label: 'System Config', to: '/admin/config', icon: Sliders },
                { label: 'Master Student DB', to: '/admin/students', icon: Database },
                { label: 'Workplace Employers', to: '/admin/employers', icon: Server },
                { label: 'Fund Pools & Budget', to: '/admin/funds', icon: DatabaseZap },
                { label: 'Automated Workflows', to: '/admin/workflows', icon: Activity },
                { label: 'API & Integrations', to: '/admin/integrations', icon: Lock },
                { label: 'Audit Trail Logs', to: '/admin/logs', icon: FileText },
                { label: 'Database & Backups', to: '/admin/database', icon: RefreshCw },
                { label: 'Maintenance Mode', to: '/admin/maintenance', icon: Wrench },
                { label: 'Security Firewall', to: '/admin/security', icon: ShieldAlert },
              ].map((tool, idx) => {
                const Icon = tool.icon;
                return (
                  <Link key={idx} to={tool.to}>
                    <div className="p-3 bg-slate-50 hover:bg-white border border-slate-200 rounded-2xl flex items-center gap-2.5 transition-all shadow-xs hover:shadow-soft">
                      <Icon className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-bold text-slate-800 truncate">{tool.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
