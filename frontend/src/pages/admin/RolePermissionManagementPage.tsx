import React, { useState } from 'react';
import { ShieldCheck, Plus, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

interface PermissionModule {
  moduleName: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

interface RoleDefinition {
  roleId: string;
  roleName: string;
  description: string;
  userCount: number;
  permissions: Record<string, PermissionModule>;
}

const INITIAL_ROLES: RoleDefinition[] = [
  {
    roleId: 'ROLE-ADMIN',
    roleName: 'Super Admin',
    description: 'Unrestricted full-system administrative & security access',
    userCount: 4,
    permissions: {
      Applications: { moduleName: 'Applications', create: true, read: true, update: true, delete: true },
      Disbursements: { moduleName: 'Disbursements', create: true, read: true, update: true, delete: true },
      Scholarships: { moduleName: 'Scholarships', create: true, read: true, update: true, delete: true },
      SystemLogs: { moduleName: 'System Logs', create: true, read: true, update: true, delete: true },
    },
  },
  {
    roleId: 'ROLE-SUPERVISOR',
    roleName: 'Scholarship Validator',
    description: 'Reviews applicant documents, endorsement forms, and evaluation scores',
    userCount: 14,
    permissions: {
      Applications: { moduleName: 'Applications', create: false, read: true, update: false, delete: false },
      Disbursements: { moduleName: 'Disbursements', create: false, read: false, update: false, delete: false },
      Scholarships: { moduleName: 'Scholarships', create: false, read: true, update: true, delete: false },
      SystemLogs: { moduleName: 'System Logs', create: false, read: false, update: false, delete: false },
    },
  },
  {
    roleId: 'ROLE-STAFF',
    roleName: 'Financial Aid Staff',
    description: 'Evaluates pending applications, verifies documents, and schedules payouts',
    userCount: 22,
    permissions: {
      Applications: { moduleName: 'Applications', create: true, read: true, update: true, delete: false },
      Disbursements: { moduleName: 'Disbursements', create: true, read: true, update: true, delete: false },
      Scholarships: { moduleName: 'Scholarships', create: false, read: true, update: false, delete: false },
      SystemLogs: { moduleName: 'System Logs', create: false, read: true, update: false, delete: false },
    },
  },
];

export const RolePermissionManagementPage: React.FC = () => {
  const [roles, setRoles] = useState<RoleDefinition[]>(INITIAL_ROLES);
  const [selectedRole, setSelectedRole] = useState<RoleDefinition>(INITIAL_ROLES[0]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const handleTogglePermission = (moduleKey: string, action: 'create' | 'read' | 'update' | 'delete') => {
    const updated = {
      ...selectedRole,
      permissions: {
        ...selectedRole.permissions,
        [moduleKey]: {
          ...selectedRole.permissions[moduleKey],
          [action]: !selectedRole.permissions[moduleKey][action],
        },
      },
    };

    setSelectedRole(updated);
    setRoles(roles.map((r) => (r.roleId === updated.roleId ? updated : r)));
  };

  const handleSavePermissions = () => {
    toast.success(`Saved updated permission matrix for role "${selectedRole.roleName}"!`);
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName) return;

    const newRole: RoleDefinition = {
      roleId: `ROLE-${newRoleName.toUpperCase().replace(/\s+/g, '_')}`,
      roleName: newRoleName,
      description: newRoleDesc || 'Custom defined system role',
      userCount: 0,
      permissions: {
        Applications: { moduleName: 'Applications', create: false, read: true, update: false, delete: false },
        Disbursements: { moduleName: 'Disbursements', create: false, read: false, update: false, delete: false },
        Scholarships: { moduleName: 'Scholarships', create: false, read: true, update: false, delete: false },
        SystemLogs: { moduleName: 'System Logs', create: false, read: false, update: false, delete: false },
      },
    };

    setRoles([...roles, newRole]);
    setSelectedRole(newRole);
    setShowCreateModal(false);
    setNewRoleName('');
    setNewRoleDesc('');
    toast.success(`Custom Role "${newRole.roleName}" created!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-foreground">Role & Permission Matrix</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure granular CRUD permission matrices (Create, Read, Update, Delete) across system modules.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setShowCreateModal(true)}
          leftIcon={<Plus className="h-4 w-4" />}
          className="font-bold shadow-md shadow-blue-600/20 shrink-0"
        >
          Create Custom Role
        </Button>
      </div>

      {/* Role Selection & Permission Matrix Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              System Roles List
            </CardTitle>
            <CardDescription>Select role to configure permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {roles.map((r) => (
              <div
                key={r.roleId}
                onClick={() => setSelectedRole(r)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  selectedRole.roleId === r.roleId
                    ? 'bg-blue-50 border-blue-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{r.roleName}</span>
                  <Badge variant="primary" size="sm">{r.userCount} Users</Badge>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{r.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Permission Matrix */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">Permission Matrix: {selectedRole.roleName}</CardTitle>
                <Badge variant="info">{selectedRole.roleId}</Badge>
              </div>
              <CardDescription className="mt-0.5">{selectedRole.description}</CardDescription>
            </div>

            <Button variant="primary" size="sm" onClick={handleSavePermissions} leftIcon={<Save className="h-4 w-4" />} className="font-bold">
              Save Matrix Changes
            </Button>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase group-label border-b border-border">
                  <tr>
                    <th className="p-3">Module Name</th>
                    <th className="p-3 text-center">Create</th>
                    <th className="p-3 text-center">Read</th>
                    <th className="p-3 text-center">Update</th>
                    <th className="p-3 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {Object.entries(selectedRole.permissions).map(([key, perm]) => (
                    <tr key={key} className="hover:bg-slate-50/70">
                      <td className="p-3 font-bold text-slate-800">{perm.moduleName}</td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={perm.create}
                          onChange={() => handleTogglePermission(key, 'create')}
                          className="rounded border-slate-300 h-4 w-4 text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={perm.read}
                          onChange={() => handleTogglePermission(key, 'read')}
                          className="rounded border-slate-300 h-4 w-4 text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={perm.update}
                          onChange={() => handleTogglePermission(key, 'update')}
                          className="rounded border-slate-300 h-4 w-4 text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={perm.delete}
                          onChange={() => handleTogglePermission(key, 'delete')}
                          className="rounded border-slate-300 h-4 w-4 text-primary focus:ring-primary"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Custom Role Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Custom System Role"
          description="Define a new role and configure module CRUD permissions"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleCreateRole} className="font-bold">
                Create Custom Role
              </Button>
            </>
          }
        >
          <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Role Title</label>
              <input
                type="text"
                placeholder="e.g. Audit Auditor"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                required
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary shadow-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Role Description</label>
              <textarea
                rows={3}
                value={newRoleDesc}
                onChange={(e) => setNewRoleDesc(e.target.value)}
                placeholder="Describe role responsibilities..."
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary resize-none shadow-xs"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
