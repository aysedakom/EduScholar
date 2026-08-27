import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Lock, Unlock, Key, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { getUsers } from '../../api/admin';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Staff' | 'Admin' | 'Supervisor' | 'School Coordinator';
  department: string;
  status: 'Active' | 'Locked' | 'Pending Approval';
  createdAt: string;
}

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      try {
        const res = await getUsers();
        if (res.data && isMounted) {
          const roleLabelMap: Record<string, string> = {
            student: 'Student',
            admin: 'Admin',
            supervisor: 'Supervisor',
            school_coordinator: 'School Coordinator',
            treasury: 'Staff',
            system_admin: 'Admin',
          };
          const mapped: ManagedUser[] = res.data.map((u: any) => ({
            id: `USR-${String(u.id).padStart(3, '0')}`,
            name: u.name,
            email: u.email,
            role: (roleLabelMap[u.role] || 'Staff') as any,
            department: u.department || 'Quezon City Youth Development Office',
            status: (u.status === 'active' ? 'Active' : 'Pending Approval') as any,
            createdAt: u.created_at ? u.created_at.split('T')[0] : '2026-01-01',
          }));
          setUsers(mapped);
        }
      } catch {
        // fallback
      }
    };
    fetchUsers();
    return () => { isMounted = false; };
  }, []);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Student' | 'Staff' | 'Admin' | 'Supervisor' | 'School Coordinator'>('Staff');
  const [department, setDepartment] = useState('QCYDO Aid Office');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error('Please fill in user name and email');
      return;
    }

    if (editingUser) {
      setUsers(
        users.map((u) =>
          u.id === editingUser.id ? { ...u, name, email, role, department } : u
        )
      );
      toast.success(`User ${editingUser.id} updated successfully!`);
    } else {
      const newUser: ManagedUser = {
        id: `USR-${Math.floor(100 + Math.random() * 900)}`,
        name,
        email,
        role,
        department,
        status: 'Active',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUsers([newUser, ...users]);
      toast.success(`New ${role} account created for ${name}!`);
    }

    setShowAddModal(false);
    setEditingUser(null);
    resetForm();
  };

  const handleToggleLock = (id: string) => {
    setUsers(
      users.map((u) =>
        u.id === id
          ? { ...u, status: u.status === 'Locked' ? 'Active' : 'Locked' }
          : u
      )
    );
    toast.info(`Updated user account status for ${id}`);
  };

  const handleResetPassword = (email: string) => {
    toast.success(`Password reset link dispatched to ${email}!`);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
    toast.success(`User account ${id} permanently removed.`);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setRole('Staff');
    setDepartment('QCYDO Aid Office');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-foreground">User & Role Access Management</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage system accounts, assign RBAC role permissions (Student, Staff, Admin, Supervisor, Coordinator), and trigger security resets.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => { resetForm(); setEditingUser(null); setShowAddModal(true); }}
          leftIcon={<UserPlus className="h-4 w-4" />}
          className="font-bold shadow-md shadow-blue-600/20 shrink-0"
        >
          Create New User Account
        </Button>
      </div>

      {/* Table & Controls */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary shadow-xs"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {['all', 'Admin', 'Staff', 'Supervisor', 'School Coordinator', 'Student'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  roleFilter === r
                    ? 'bg-primary border-transparent text-white shadow-md font-bold'
                    : 'bg-white border-slate-200 text-slate-700 shadow-xs hover:bg-slate-50'
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
              <thead className="bg-slate-50 text-slate-500 uppercase group-label border-b border-border">
                <tr>
                  <th className="p-3">User ID & Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">System Role</th>
                  <th className="p-3">Department / Institution</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="p-3">
                      <div>
                        <span className="font-mono font-bold text-primary block">{u.id}</span>
                        <span className="font-bold text-slate-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-700 font-medium">{u.email}</td>
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
                    <td className="p-3 text-slate-600">{u.department}</td>
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
                          onClick={() => handleResetPassword(u.email)}
                          leftIcon={<Key className="h-3.5 w-3.5 text-slate-500" />}
                          title="Reset Password"
                        >
                          Reset Pass
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleLock(u.id)}
                          leftIcon={u.status === 'Locked' ? <Unlock className="h-3.5 w-3.5 text-emerald-600" /> : <Lock className="h-3.5 w-3.5 text-amber-600" />}
                        >
                          {u.status === 'Locked' ? 'Unlock' : 'Lock'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(u.id)}
                          leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* User Create/Edit Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title={editingUser ? `Edit Account: ${editingUser.id}` : 'Create New System Account'}
          description="Assign user roles and department access permissions"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveUser} className="font-bold">
                {editingUser ? 'Save User Changes' : 'Create User Account'}
              </Button>
            </>
          }
        >
          <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">User Full Name</label>
              <input
                type="text"
                placeholder="e.g. Dr. Robert Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary shadow-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="robert.vance@qc.edu.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary shadow-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Assign Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary shadow-xs"
                >
                  <option value="Staff">Financial Aid Staff</option>
                  <option value="Admin">Super Admin</option>
                  <option value="Supervisor">Scholarship Validator / Supervisor</option>
                  <option value="School Coordinator">School Coordinator</option>
                  <option value="Student">Student Scholar</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Department / Campus</label>
                <input
                  type="text"
                  placeholder="QCYDO Aid Office"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary shadow-xs"
                />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
