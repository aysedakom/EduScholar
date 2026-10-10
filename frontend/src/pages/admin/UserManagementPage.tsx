import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Search,
  Lock,
  Unlock,
  Key,
  Trash2,
  History,
  Users,
  Filter,
  RefreshCw,
  Globe,
  Clock,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  getUsers,
  getAuditLogs,
  createSystemUser,
  updateUserStatus,
  deleteSystemUser,
  resetUserPassword,
  type AuditLogItem
} from '../../api/admin';

interface ManagedUser {
  id: string;
  rawId: number | string;
  name: string;
  email: string;
  role: 'Student' | 'Staff' | 'Admin' | 'Supervisor' | 'School Coordinator';
  department: string;
  status: 'Active' | 'Locked' | 'Pending Approval';
  createdAt: string;
}

export const UserManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'audit_logs'>('users');
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingAudits, setLoadingAudits] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [auditActionFilter, setAuditActionFilter] = useState<string>('all');

  // Modal State for User creation
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<AuditLogItem | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('January10');
  const [role, setRole] = useState<'Student' | 'Staff' | 'Admin' | 'Supervisor' | 'School Coordinator'>('Staff');
  const [department, setDepartment] = useState('Quezon City Youth Development Office (QCYDO)');

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await getUsers();
      const rawData: any = res.data;
      const userList: any[] = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.data)
        ? rawData.data
        : Array.isArray(rawData?.users)
        ? rawData.users
        : [];

      if (Array.isArray(userList)) {
        const roleLabelMap: Record<string, string> = {
          student: 'Student',
          admin: 'Admin',
          supervisor: 'Supervisor',
          school_coordinator: 'School Coordinator',
          treasury: 'Staff',
          system_admin: 'Admin',
        };
        const mapped: ManagedUser[] = userList.map((u: any) => ({
          id: `USR-${String(u.id).padStart(3, '0')}`,
          rawId: u.id,
          name: u.name || 'User Account',
          email: u.email || 'N/A',
          role: (roleLabelMap[u.role] || u.role || 'Staff') as any,
          department: u.department || 'Quezon City Youth Development Office',
          status: (u.status === 'active' || u.is_email_verified ? 'Active' : u.status === 'locked' ? 'Locked' : 'Pending Approval') as any,
          createdAt: u.created_at ? u.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        }));
        setUsers(mapped);
      }
    } catch (err: any) {
      console.warn('Could not load user accounts:', err);
      toast.error('Failed to load user accounts from database');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoadingAudits(true);
    try {
      const res = await getAuditLogs({ limit: 150 });
      if (res.data?.logs) {
        setAuditLogs(res.data.logs);
      }
    } catch (err: any) {
      console.warn('Could not load audit logs:', err);
    } finally {
      setLoadingAudits(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAuditLogs();
  }, []);

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error('Please fill in user name and email');
      return;
    }

    try {
      await createSystemUser({
        name,
        email,
        role,
        department,
        password: password || 'January10'
      });
      toast.success(`New ${role} account created for ${name}! Password set to "${password || 'January10'}"`);
      setShowAddModal(false);
      resetForm();
      fetchUsers();
      fetchAuditLogs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create user account');
    }
  };

  const handleToggleLock = async (user: ManagedUser) => {
    try {
      const newStatus = user.status === 'Locked' ? 'active' : 'locked';
      await updateUserStatus(user.rawId, {
        status: newStatus,
        rationale: `Admin toggled status to ${newStatus}`
      });
      toast.success(`User ${user.name} (${user.email}) is now ${newStatus === 'active' ? 'Active' : 'Locked'}.`);
      fetchUsers();
      fetchAuditLogs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleResetPassword = async (user: ManagedUser) => {
    try {
      await resetUserPassword(user.rawId, 'January10');
      toast.success(`Password for ${user.email} reset to default: "January10"`);
      fetchAuditLogs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    }
  };

  const handleDeleteUser = async (user: ManagedUser) => {
    if (!window.confirm(`Are you sure you want to permanently delete user ${user.name} (${user.email})?`)) {
      return;
    }
    try {
      await deleteSystemUser(user.rawId);
      toast.success(`User account ${user.email} permanently removed.`);
      fetchUsers();
      fetchAuditLogs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete user account');
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('January10');
    setRole('Staff');
    setDepartment('Quezon City Youth Development Office (QCYDO)');
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredAudits = auditLogs.filter((log) => {
    const matchesSearch =
      (log.actor_id && log.actor_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.actor_name && log.actor_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.action && log.action.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.rationale && log.rationale.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.entity_id && log.entity_id.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesAction =
      auditActionFilter === 'all' ||
      (auditActionFilter === 'AUTH' && log.action.includes('LOGIN')) ||
      (auditActionFilter === 'USER_MGMT' && log.action.startsWith('USER_')) ||
      (auditActionFilter === 'APPLICATION' && log.entity_type === 'application');

    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
              <Users className="h-6 w-6" />
            </span>
            <div>
              <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
                User Management & Security Audits
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage institutional accounts, role authorizations, and review immutable user audit logs across the portal.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => { fetchUsers(); fetchAuditLogs(); }}
            leftIcon={<RefreshCw className={`h-4 w-4 ${loadingUsers || loadingAudits ? 'animate-spin' : ''}`} />}
            className="font-bold text-xs"
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => { resetForm(); setShowAddModal(true); }}
            leftIcon={<UserPlus className="h-4 w-4" />}
            className="font-bold shadow-md shadow-blue-600/20 shrink-0 text-xs"
          >
            Create New User Account
          </Button>
        </div>
      </div>

      {/* Tabs Selection */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Users className="h-4 w-4" />
          User Accounts ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('audit_logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'audit_logs'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <History className="h-4 w-4" />
          User Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: USERS LIST */}
      {activeTab === 'users' && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                id="admin-user-search-query"
                name="searchQuery"
                type="text"
                placeholder="Search user name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 h-9 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-primary shadow-xs"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {['all', 'Admin', 'Staff', 'Supervisor', 'School Coordinator', 'Student'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    roleFilter === r
                      ? 'bg-blue-600 border-transparent text-white shadow-md font-bold'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs hover:bg-slate-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold border-b border-border">
                  <tr>
                    <th className="p-3">User ID & Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">System Role</th>
                    <th className="p-3">Department / Institution</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Security & Action Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500">
                        No user accounts matched your search.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3">
                          <div>
                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block">{u.id}</span>
                            <span className="font-bold text-slate-900 dark:text-white">{u.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">{u.email}</td>
                        <td className="p-3">
                          <Badge
                            variant={
                              u.role === 'Admin'
                                ? 'destructive'
                                : u.role === 'Supervisor'
                                ? 'warning'
                                : u.role === 'Staff'
                                ? 'info'
                                : 'primary'
                            }
                          >
                            {u.role}
                          </Badge>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{u.department}</td>
                        <td className="p-3">
                          <Badge
                            variant={u.status === 'Active' ? 'success' : u.status === 'Locked' ? 'destructive' : 'warning'}
                          >
                            {u.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResetPassword(u)}
                              leftIcon={<Key className="h-3.5 w-3.5 text-slate-500" />}
                              title="Reset Password to January10"
                            >
                              Reset Pass
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleLock(u)}
                              leftIcon={u.status === 'Locked' ? <Unlock className="h-3.5 w-3.5 text-emerald-600" /> : <Lock className="h-3.5 w-3.5 text-amber-600" />}
                            >
                              {u.status === 'Locked' ? 'Unlock' : 'Lock'}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUser(u)}
                              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                              title="Delete Account"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: AUDIT LOGS TRAIL */}
      {activeTab === 'audit_logs' && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                id="admin-audit-search-query"
                name="auditSearchQuery"
                type="text"
                placeholder="Search actor, action, rationale, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-72 h-9 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-primary shadow-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" /> Category:
              </span>
              {[
                { label: 'All Activities', value: 'all' },
                { label: 'Login & 2FA Auth', value: 'AUTH' },
                { label: 'User Management', value: 'USER_MGMT' },
                { label: 'Application Workflows', value: 'APPLICATION' },
              ].map((c) => (
                <button
                  key={c.value}
                  onClick={() => setAuditActionFilter(c.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    auditActionFilter === c.value
                      ? 'bg-blue-600 border-transparent text-white shadow-md font-bold'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs hover:bg-slate-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold border-b border-border">
                  <tr>
                    <th className="p-3">Log ID & Timestamp</th>
                    <th className="p-3">Actor / User</th>
                    <th className="p-3">Action Event</th>
                    <th className="p-3">Entity & Target</th>
                    <th className="p-3">Rationale & Details</th>
                    <th className="p-3">IP / Device</th>
                    <th className="p-3 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                  {filteredAudits.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500">
                        {loadingAudits ? 'Loading audit logs...' : 'No audit log records found for this filter.'}
                      </td>
                    </tr>
                  ) : (
                    filteredAudits.map((log) => {
                      const isAuth = log.action.includes('LOGIN');
                      const isUserMgmt = log.action.startsWith('USER_');
                      const isLock = log.action.includes('LOCKED');

                      return (
                        <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 font-mono">
                            <span className="font-bold text-slate-900 dark:text-white block">#{log.id}</span>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3" />
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </td>

                          <td className="p-3">
                            <div className="font-medium text-slate-900 dark:text-white">
                              {log.actor_name || log.actor_id}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {log.actor_email ? log.actor_email : log.actor_id} •{' '}
                              <span className="uppercase font-bold text-blue-600 dark:text-blue-400">
                                {log.actor_role}
                              </span>
                            </div>
                          </td>

                          <td className="p-3">
                            <Badge
                              variant={
                                isLock
                                  ? 'destructive'
                                  : isAuth
                                  ? 'success'
                                  : isUserMgmt
                                  ? 'primary'
                                  : 'secondary'
                              }
                              className="font-mono text-[10px]"
                            >
                              {log.action}
                            </Badge>
                          </td>

                          <td className="p-3">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block capitalize">
                              {log.entity_type}
                            </span>
                            <span className="font-mono text-[11px] text-slate-500">
                              {log.entity_id || 'N/A'}
                            </span>
                          </td>

                          <td className="p-3 max-w-[280px]">
                            <p className="truncate text-slate-700 dark:text-slate-300 font-medium" title={log.rationale || ''}>
                              {log.rationale || 'System recorded event'}
                            </p>
                            {log.previous_state && log.new_state && (
                              <span className="text-[10px] text-slate-500 block mt-0.5">
                                State: <span className="line-through">{log.previous_state}</span> → <span className="font-bold text-emerald-600">{log.new_state}</span>
                              </span>
                            )}
                          </td>

                          <td className="p-3 font-mono text-[11px] text-slate-500">
                            <div className="flex items-center gap-1">
                              <Globe className="h-3 w-3 text-slate-400" />
                              {log.ip_address || '127.0.0.1'}
                            </div>
                          </td>

                          <td className="p-3 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedAudit(log)}
                              leftIcon={<Eye className="h-3.5 w-3.5 text-blue-600" />}
                              className="text-xs"
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Detail Modal */}
      {selectedAudit && (
        <Modal
          isOpen={!!selectedAudit}
          onClose={() => setSelectedAudit(null)}
          title={`Audit Event Trail #${selectedAudit.id}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500">Action Code:</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{selectedAudit.action}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500">Timestamp:</span>
                <span className="font-medium text-slate-900 dark:text-white">{new Date(selectedAudit.timestamp).toUTCString()}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500">Actor ID / Email:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedAudit.actor_id} ({selectedAudit.actor_role})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500">Target Entity:</span>
                <span className="font-medium text-slate-900 dark:text-white">{selectedAudit.entity_type} (ID: {selectedAudit.entity_id})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500">IP Address:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{selectedAudit.ip_address || 'Local / Proxied'}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Audit Rationale / Event Payload:</span>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                  {selectedAudit.rationale || 'No additional rationale provided.'}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm" onClick={() => setSelectedAudit(null)}>
                Close Viewer
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* User Create Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Create New System Account"
          description="Assign user roles and department access permissions"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveUser} className="font-bold">
                Create User Account
              </Button>
            </>
          }
        >
          <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
            <div>
              <label htmlFor="user-full-name-input" className="block font-bold text-slate-800 dark:text-slate-200 mb-1">User Full Name</label>
              <input
                id="user-full-name-input"
                name="userFullName"
                type="text"
                placeholder="e.g. Dr. Robert Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-10 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-primary shadow-xs dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="user-email-input" className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Email Address</label>
              <input
                id="user-email-input"
                name="userEmail"
                type="email"
                placeholder="robert.vance@qc.edu.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-10 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-primary shadow-xs dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="user-password-input" className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Initial Password</label>
              <input
                id="user-password-input"
                name="userPassword"
                type="text"
                placeholder="January10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-10 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-primary shadow-xs dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="user-role-select" className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Assign Role</label>
                <select
                  id="user-role-select"
                  name="userRole"
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full h-10 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-primary shadow-xs dark:text-white"
                >
                  <option value="Staff">Financial Aid Staff / Treasury</option>
                  <option value="Admin">Super Admin</option>
                  <option value="Supervisor">Scholarship Validator / Supervisor</option>
                  <option value="School Coordinator">School Coordinator</option>
                  <option value="Student">Student Scholar</option>
                </select>
              </div>

              <div>
                <label htmlFor="user-department-input" className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Department / Campus</label>
                <input
                  id="user-department-input"
                  name="userDepartment"
                  type="text"
                  placeholder="QCYDO Aid Office"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  className="w-full h-10 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-primary shadow-xs dark:text-white"
                />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default UserManagementPage;

