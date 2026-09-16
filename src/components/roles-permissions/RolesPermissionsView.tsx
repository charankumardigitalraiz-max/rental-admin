'use client';

import React, { useState } from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import DataTable, { Column } from '@/components/ui/DataTable';
import {
  Lock,
  ShieldCheck,
  ShieldAlert,
  Key,
  Check,
  X,
  Plus,
  Edit2,
  Copy,
  Save,
  Users,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Info,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';

export interface ModulePermission {
  id: string;
  moduleName: string;
  category: 'Operations' | 'Finance' | 'Users & Drivers' | 'System';
  read: boolean;
  write: boolean;
  delete: boolean;
  export: boolean;
  approve: boolean;
}

export interface SystemRole {
  id: string;
  name: string;
  code: string;
  description: string;
  isSystem: boolean; // System roles cannot be deleted
  assignedUsersCount: number;
  badgeColor: 'emerald' | 'sky' | 'indigo' | 'amber' | 'purple';
  permissions: ModulePermission[];
}

const initialModulesList: Omit<ModulePermission, 'read' | 'write' | 'delete' | 'export' | 'approve'>[] = [
  { id: 'mod-drivers', moduleName: 'Driver Onboarding & Verification', category: 'Users & Drivers' },
  { id: 'mod-subscriptions', moduleName: 'Driver Subscription Passes', category: 'Finance' },
  { id: 'mod-live-ops', moduleName: 'Live Operations & Dispatch Control', category: 'Operations' },
  { id: 'mod-valet', moduleName: 'Valet Staff Event Allocation', category: 'Operations' },
  { id: 'mod-pricing', moduleName: 'Pricing, Rates & Surge Rules', category: 'Finance' },
  { id: 'mod-payments', moduleName: 'Payments, Payouts & Refunds', category: 'Finance' },
  { id: 'mod-reviews', moduleName: 'Reviews & Rating Moderation', category: 'Users & Drivers' },
  { id: 'mod-system', moduleName: 'System Configurations & Audit Logs', category: 'System' },
];

const initialRolesData: SystemRole[] = [
  {
    id: 'role-super-admin',
    name: 'Super Admin',
    code: 'SUPER_ADMIN',
    description: 'Full un-restricted access across all operational modules, financials, and security settings.',
    isSystem: true,
    assignedUsersCount: 1,
    badgeColor: 'emerald',
    permissions: initialModulesList.map((m) => ({
      ...m,
      read: true,
      write: true,
      delete: true,
      export: true,
      approve: true,
    })),
  },
  {
    id: 'role-driver-mgr',
    name: 'Driver Operations Manager',
    code: 'DRIVER_MGR',
    description: 'Manages driver onboarding, document approval, subscription pass monitoring, and dispatch allocations.',
    isSystem: false,
    assignedUsersCount: 1,
    badgeColor: 'sky',
    permissions: initialModulesList.map((m) => ({
      ...m,
      read: true,
      write: m.id === 'mod-drivers' || m.id === 'mod-subscriptions' || m.id === 'mod-live-ops',
      delete: false,
      export: m.id === 'mod-drivers' || m.id === 'mod-subscriptions',
      approve: m.id === 'mod-drivers',
    })),
  },
  {
    id: 'role-valet-mgr',
    name: 'Valet Staff Manager',
    code: 'VALET_MGR',
    description: 'Oversees valet staff allocation, venue event bookings, staff availability, and customer ratings.',
    isSystem: false,
    assignedUsersCount: 1,
    badgeColor: 'indigo',
    permissions: initialModulesList.map((m) => ({
      ...m,
      read: m.id === 'mod-valet' || m.id === 'mod-reviews' || m.id === 'mod-live-ops',
      write: m.id === 'mod-valet',
      delete: false,
      export: m.id === 'mod-valet',
      approve: m.id === 'mod-valet',
    })),
  },
  {
    id: 'role-finance-admin',
    name: 'Finance & Payouts Admin',
    code: 'FINANCE_ADMIN',
    description: 'Manages subscription payments, pricing models, driver payout verification, and refund requests.',
    isSystem: false,
    assignedUsersCount: 0,
    badgeColor: 'purple',
    permissions: initialModulesList.map((m) => ({
      ...m,
      read: m.id === 'mod-subscriptions' || m.id === 'mod-pricing' || m.id === 'mod-payments',
      write: m.id === 'mod-pricing' || m.id === 'mod-payments',
      delete: false,
      export: true,
      approve: m.id === 'mod-payments',
    })),
  },
  {
    id: 'role-support-officer',
    name: 'Support & Complaints Officer',
    code: 'SUPPORT_OFFICER',
    description: 'Read-only visibility for bookings and driver profiles, with review moderation privileges.',
    isSystem: false,
    assignedUsersCount: 0,
    badgeColor: 'amber',
    permissions: initialModulesList.map((m) => ({
      ...m,
      read: true,
      write: m.id === 'mod-reviews',
      delete: false,
      export: false,
      approve: false,
    })),
  },
];

export default function RolesPermissionsView() {
  const { adminUsers, setActiveTab } = useRentalStore();
  const [roles, setRoles] = useState<SystemRole[]>(initialRolesData);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('role-super-admin');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // New Role Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newRoleName, setNewRoleName] = useState<string>('');
  const [newRoleDesc, setNewRoleDesc] = useState<string>('');
  const [newRoleTemplate, setNewRoleTemplate] = useState<string>('role-driver-mgr');

  const selectedRole = roles.find((r) => r.id === selectedRoleId) || roles[0];

  // Helper badge styles
  const getBadgeStyle = (color: SystemRole['badgeColor']) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'sky':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'indigo':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'purple':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'amber':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  // Toggle individual permission cell
  const handleTogglePermission = (moduleId: string, actionKey: keyof Omit<ModulePermission, 'id' | 'moduleName' | 'category'>) => {
    if (selectedRole.isSystem) return; // Super admin permissions locked

    setRoles((prevRoles) =>
      prevRoles.map((role) => {
        if (role.id !== selectedRoleId) return role;
        return {
          ...role,
          permissions: role.permissions.map((perm) => {
            if (perm.id !== moduleId) return perm;
            return {
              ...perm,
              [actionKey]: !perm[actionKey],
            };
          }),
        };
      })
    );
    setHasUnsavedChanges(true);
  };

  // Toggle all actions for a specific module
  const handleToggleModuleAll = (moduleId: string, state: boolean) => {
    if (selectedRole.isSystem) return;

    setRoles((prevRoles) =>
      prevRoles.map((role) => {
        if (role.id !== selectedRoleId) return role;
        return {
          ...role,
          permissions: role.permissions.map((perm) => {
            if (perm.id !== moduleId) return perm;
            return {
              ...perm,
              read: state,
              write: state,
              delete: state,
              export: state,
              approve: state,
            };
          }),
        };
      })
    );
    setHasUnsavedChanges(true);
  };

  // Save matrix handler
  const handleSaveChanges = () => {
    setHasUnsavedChanges(false);
    setSaveToast(`Permissions matrix updated successfully for ${selectedRole.name}`);
    setTimeout(() => setSaveToast(null), 3500);
  };

  // Create new role
  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const templateRole = roles.find((r) => r.id === newRoleTemplate) || roles[0];
    const newId = `role-${Date.now()}`;
    const newRole: SystemRole = {
      id: newId,
      name: newRoleName.trim(),
      code: newRoleName.trim().toUpperCase().replace(/\s+/g, '_'),
      description: newRoleDesc.trim() || 'Custom system privilege role.',
      isSystem: false,
      assignedUsersCount: 0,
      badgeColor: 'indigo',
      permissions: templateRole.permissions.map((p) => ({ ...p })),
    };

    setRoles((prev) => [...prev, newRole]);
    setSelectedRoleId(newId);
    setIsCreateModalOpen(false);
    setNewRoleName('');
    setNewRoleDesc('');
    setSaveToast(`New role "${newRole.name}" created!`);
    setTimeout(() => setSaveToast(null), 3500);
  };

  // Metrics
  const totalRolesCount = roles.length;
  const totalAssignedAdmins = adminUsers.length;
  const systemProtectedRoles = roles.filter((r) => r.isSystem).length;
  const totalModulesCount = initialModulesList.length;
  // Filter permissions by category
  const filteredPermissions = selectedRole.permissions.filter(
    (p) => categoryFilter === 'All' || p.category === categoryFilter
  );

  // Permission table columns definition for DataTable
  const permissionColumns: Column<ModulePermission>[] = [
    {
      key: 'moduleName',
      header: 'Module Name & Category',
      className: 'min-w-[220px]',
      render: (perm) => (
        <div>
          <div className="font-bold text-slate-900">{perm.moduleName}</div>
          <span className="inline-block text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded mt-0.5">
            {perm.category}
          </span>
        </div>
      ),
    },
    {
      key: 'read',
      header: 'Read / View',
      align: 'center',
      className: 'w-28',
      render: (perm) => (
        <button
          onClick={() => handleTogglePermission(perm.id, 'read')}
          disabled={selectedRole.isSystem}
          className={`w-7 h-7 rounded-md inline-flex items-center justify-center transition-all ${perm.read
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
            } ${selectedRole.isSystem ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
        >
          {perm.read ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4" />}
        </button>
      ),
    },
    {
      key: 'write',
      header: 'Create / Edit',
      align: 'center',
      className: 'w-28',
      render: (perm) => (
        <button
          onClick={() => handleTogglePermission(perm.id, 'write')}
          disabled={selectedRole.isSystem}
          className={`w-7 h-7 rounded-md inline-flex items-center justify-center transition-all ${perm.write
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
            } ${selectedRole.isSystem ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
        >
          {perm.write ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4" />}
        </button>
      ),
    },
    {
      key: 'delete',
      header: 'Delete',
      align: 'center',
      className: 'w-28',
      render: (perm) => (
        <button
          onClick={() => handleTogglePermission(perm.id, 'delete')}
          disabled={selectedRole.isSystem}
          className={`w-7 h-7 rounded-md inline-flex items-center justify-center transition-all ${perm.delete
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
            } ${selectedRole.isSystem ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
        >
          {perm.delete ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4" />}
        </button>
      ),
    },
    {
      key: 'export',
      header: 'Export CSV',
      align: 'center',
      className: 'w-28',
      render: (perm) => (
        <button
          onClick={() => handleTogglePermission(perm.id, 'export')}
          disabled={selectedRole.isSystem}
          className={`w-7 h-7 rounded-md inline-flex items-center justify-center transition-all ${perm.export
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
            } ${selectedRole.isSystem ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
        >
          {perm.export ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4" />}
        </button>
      ),
    },
    {
      key: 'approve',
      header: 'Approve',
      align: 'center',
      className: 'w-28',
      render: (perm) => (
        <button
          onClick={() => handleTogglePermission(perm.id, 'approve')}
          disabled={selectedRole.isSystem}
          className={`w-7 h-7 rounded-md inline-flex items-center justify-center transition-all ${perm.approve
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
            } ${selectedRole.isSystem ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
        >
          {perm.approve ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4" />}
        </button>
      ),
    },
    {
      key: 'quickAll',
      header: 'Quick All',
      align: 'center',
      className: 'w-28',
      render: (perm) => {
        const isAllGranted = perm.read && perm.write && perm.delete && perm.export && perm.approve;
        return (
          <button
            onClick={() => handleToggleModuleAll(perm.id, !isAllGranted)}
            disabled={selectedRole.isSystem}
            className={`text-[11px] font-bold px-2.5 py-1 rounded transition-all ${isAllGranted
                ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                : 'text-[#023526] bg-[#faf8f5] hover:bg-[#f3ede2] border border-[#e7dbc5]'
              } ${selectedRole.isSystem ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            {isAllGranted ? 'Revoke All' : 'Grant All'}
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Unified Stats Band */}
      <div className="card-white p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="p-3 first:pl-0">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Defined System Roles</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-slate-900">{totalRolesCount} Roles</span>
              <span className="text-xs text-emerald-600 font-medium">({systemProtectedRoles} Built-in)</span>
            </div>
          </div>

          <div className="p-3 md:pl-6">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Assigned Admin Users</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-slate-900">{totalAssignedAdmins} Members</span>
              <span className="text-xs text-slate-500 font-medium">Active</span>
            </div>
          </div>

          <div className="p-3 md:pl-6">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Protected Platform Modules</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-slate-900">{totalModulesCount} Modules</span>
              <span className="text-xs text-indigo-600 font-medium">Matrix Managed</span>
            </div>
          </div>

          <div className="p-3 md:pl-6">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Active Role Selected</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-sm font-bold text-primary truncate">{selectedRole.name}</span>
              {selectedRole.isSystem && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                  System Locked
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Notification Toast */}
      {saveToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-md flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveToast}</span>
          </div>
          <button onClick={() => setSaveToast(null)} className="opacity-80 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Roles Selector Band */}
      <div className="card-white p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> System Access Roles
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Select a role to inspect or edit its module privilege matrix</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Role</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {roles.map((role) => {
            const isSelected = role.id === selectedRoleId;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className={`text-left p-3.5 rounded-xl border transition-all relative flex flex-col justify-between ${isSelected
                  ? 'border-primary ring-2 ring-primary/10 bg-primary/5 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`text-[10px] font-bold border px-2 py-0.5 rounded-md ${getBadgeStyle(
                        role.badgeColor
                      )}`}
                    >
                      {role.code}
                    </span>
                    {role.isSystem && <Lock className="w-3 h-3 text-slate-400" />}
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{role.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {role.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-400" />
                    {role.assignedUsersCount} Admins
                  </span>
                  {isSelected && (
                    <span className="font-bold text-primary flex items-center gap-0.5 text-[10px]">
                      Active <ChevronRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Permission Matrix Section */}
      <div className="card-white space-y-4">
        {/* Matrix Header Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">
                Permissions Matrix: <span className="text-primary">{selectedRole.name}</span>
              </h3>
              {selectedRole.isSystem && (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-600" /> System Immutable
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Configure read, write, delete, export, and approval grants per platform module.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
              {['All', 'Operations', 'Finance', 'Users & Drivers', 'System'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-md transition-all ${categoryFilter === cat
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Save Button */}
            {!selectedRole.isSystem && (
              <button
                onClick={handleSaveChanges}
                disabled={!hasUnsavedChanges}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all ${hasUnsavedChanges
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Matrix</span>
              </button>
            )}
          </div>
        </div>

        {/* Matrix Table using DataTable */}
        <DataTable<ModulePermission>
          columns={permissionColumns}
          data={filteredPermissions}
          keyExtractor={(perm) => perm.id}
          pageSize={10}
          searchPlaceholder="Search module name or category..."
          searchFilterKeys={['moduleName', 'category']}
          emptyMessage="No permission modules match the search query."
        />
      </div>

      {/* Admin Team Members with Selected Role */}
      <div className="card-white p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Admin Members Assigned to {selectedRole.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Active administrators currently inheriting this permission matrix
            </p>
          </div>

          <button
            onClick={() => setActiveTab('admin-users')}
            className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 hover:underline transition-colors"
          >
            <span>Manage Admin Team</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {adminUsers.filter((a) => a.role === selectedRole.name).length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
            <Info className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No Admin Users Assigned</p>
            <p className="text-[11px] text-slate-500">
              There are currently no active team members assigned to the "{selectedRole.name}" role.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {adminUsers
              .filter((a) => a.role === selectedRole.name)
              .map((admin) => (
                <div key={admin.id} className="p-3.5 border border-slate-200 rounded-xl flex items-center gap-3 bg-white">
                  <img
                    src={admin.avatar}
                    alt={admin.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-100"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-slate-900 truncate">{admin.name}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{admin.email}</p>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded inline-block mt-1">
                      {admin.status}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Create Custom Role Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-slate-900 text-sm">Create Custom System Role</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Role Title / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Audit & Compliance Officer"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Role Description</label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe operational responsibilities for this role..."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Copy Initial Permissions From</label>
                <select
                  value={newRoleTemplate}
                  onChange={(e) => setNewRoleTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 bg-white"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold shadow-xs transition-colors"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
