'use client';

import React, { useState } from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import ConfirmDeleteModal from '@/components/ui/ConfirmDeleteModal';
import {
  Lock,
  ShieldCheck,
  Check,
  X,
  Plus,
  Save,
  Users,
  UserCheck,
  CheckCircle2,
  Info,
  Eye,
  SlidersHorizontal,
  Trash2,
  Shield,
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
  const [roles, setRoles] = useState<SystemRole[]>(initialRolesData);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // View / Edit Permission Matrix Modal State
  const [activeMatrixRole, setActiveMatrixRole] = useState<SystemRole | null>(null);
  const [matrixPermissions, setMatrixPermissions] = useState<ModulePermission[]>([]);

  // Delete Role Confirmation State
  const [roleToDelete, setRoleToDelete] = useState<SystemRole | null>(null);

  // Create New Role Modal State (2-Column Split)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newRoleName, setNewRoleName] = useState<string>('');
  const [newRoleDesc, setNewRoleDesc] = useState<string>('');
  const [newRoleBadgeColor, setNewRoleBadgeColor] = useState<SystemRole['badgeColor']>('indigo');
  const [newRoleTemplate, setNewRoleTemplate] = useState<string>('role-driver-mgr');
  const [newRolePermissions, setNewRolePermissions] = useState<ModulePermission[]>(() =>
    initialModulesList.map((m) => ({
      ...m,
      read: true,
      write: false,
      delete: false,
      export: false,
      approve: false,
    }))
  );

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

  // Open creation modal
  const handleOpenCreateModal = () => {
    setNewRoleName('');
    setNewRoleDesc('');
    setNewRoleBadgeColor('indigo');
    setNewRoleTemplate('role-driver-mgr');
    const defaultTemplate = roles.find((r) => r.id === 'role-driver-mgr') || roles[0];
    setNewRolePermissions(defaultTemplate.permissions.map((p) => ({ ...p })));
    setIsCreateModalOpen(true);
  };

  // Change template in creation modal
  const handleTemplateChange = (templateId: string) => {
    setNewRoleTemplate(templateId);
    const templateRole = roles.find((r) => r.id === templateId);
    if (templateRole) {
      setNewRolePermissions(templateRole.permissions.map((p) => ({ ...p })));
    }
  };

  // Toggle permission in creation modal
  const handleModalPermissionToggle = (
    moduleId: string,
    actionKey: keyof Omit<ModulePermission, 'id' | 'moduleName' | 'category'>
  ) => {
    setNewRolePermissions((prev) =>
      prev.map((perm) => {
        if (perm.id !== moduleId) return perm;
        return {
          ...perm,
          [actionKey]: !perm[actionKey],
        };
      })
    );
  };

  // Toggle all actions for a single module in creation modal
  const handleModalToggleModuleAll = (moduleId: string, state: boolean) => {
    setNewRolePermissions((prev) =>
      prev.map((perm) => {
        if (perm.id !== moduleId) return perm;
        return {
          ...perm,
          read: state,
          write: state,
          delete: state,
          export: state,
          approve: state,
        };
      })
    );
  };

  // Toggle all screens in creation modal
  const handleModalToggleAllScreens = (grantAll: boolean) => {
    setNewRolePermissions((prev) =>
      prev.map((perm) => ({
        ...perm,
        read: grantAll,
        write: grantAll,
        delete: grantAll,
        export: grantAll,
        approve: grantAll,
      }))
    );
  };

  // Create new role handler
  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const newId = `role-${Date.now()}`;
    const newRole: SystemRole = {
      id: newId,
      name: newRoleName.trim(),
      code: newRoleName.trim().toUpperCase().replace(/\s+/g, '_'),
      description: newRoleDesc.trim() || 'Custom system privilege role.',
      isSystem: false,
      assignedUsersCount: 0,
      badgeColor: newRoleBadgeColor,
      permissions: newRolePermissions.map((p) => ({ ...p })),
    };

    setRoles((prev) => [...prev, newRole]);
    setIsCreateModalOpen(false);
    setSaveToast(`New role "${newRole.name}" created successfully!`);
    setTimeout(() => setSaveToast(null), 3500);
  };

  // Delete role handler
  const handleDeleteRole = (roleId: string, roleName: string) => {
    if (confirm(`Are you sure you want to delete custom role "${roleName}"?`)) {
      setRoles((prev) => prev.filter((r) => r.id !== roleId));
      setSaveToast(`Role "${roleName}" deleted.`);
      setTimeout(() => setSaveToast(null), 3500);
    }
  };

  // Open View/Edit Matrix Modal for a specific role
  const handleOpenMatrixModal = (role: SystemRole) => {
    setActiveMatrixRole(role);
    setMatrixPermissions(role.permissions.map((p) => ({ ...p })));
  };

  // Toggle permission in View/Edit Matrix Modal
  const handleMatrixToggle = (
    moduleId: string,
    actionKey: keyof Omit<ModulePermission, 'id' | 'moduleName' | 'category'>
  ) => {
    if (activeMatrixRole?.isSystem) return;
    setMatrixPermissions((prev) =>
      prev.map((perm) => {
        if (perm.id !== moduleId) return perm;
        return {
          ...perm,
          [actionKey]: !perm[actionKey],
        };
      })
    );
  };

  // Save changes from View/Edit Matrix Modal
  const handleSaveMatrixChanges = () => {
    if (!activeMatrixRole) return;
    setRoles((prevRoles) =>
      prevRoles.map((role) => {
        if (role.id !== activeMatrixRole.id) return role;
        return {
          ...role,
          permissions: matrixPermissions.map((p) => ({ ...p })),
        };
      })
    );
    setActiveMatrixRole(null);
    setSaveToast(`Permissions updated for ${activeMatrixRole.name}`);
    setTimeout(() => setSaveToast(null), 3500);
  };

  // Columns definition for All Roles DataTable
  const roleColumns: Column<SystemRole>[] = [
    {
      key: 'name',
      header: 'Role Name & Code',
      render: (role) => (
        <div>
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            {role.name}
            {role.isSystem && <Lock className="w-3.5 h-3.5 text-slate-400" />}
          </div>
          <span
            className={`inline-block text-[10px] font-bold border px-2 py-0.5 rounded-md mt-0.5 ${getBadgeStyle(
              role.badgeColor
            )}`}
          >
            {role.code}
          </span>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (role) => (
        <span className="text-xs text-slate-600 leading-relaxed block max-w-lg">
          {role.description}
        </span>
      ),
    },
    {
      key: 'isSystem',
      header: 'Role Security Type',
      render: (role) => (
        <span
          className={`px-2.5 py-1 rounded text-[10px] font-bold inline-block ${
            role.isSystem
              ? 'bg-amber-50 text-amber-800 border border-amber-200'
              : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
          }`}
        >
          {role.isSystem ? 'Built-in System' : 'Custom Role'}
        </span>
      ),
    },
    {
      key: 'assignedUsersCount',
      header: 'Assigned Admins',
      align: 'center',
      render: (role) => (
        <span className="font-bold text-slate-900 text-xs flex items-center justify-center gap-1">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          {role.assignedUsersCount} {role.assignedUsersCount === 1 ? 'Admin' : 'Admins'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (role) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleOpenMatrixModal(role)}
            className="px-3 py-1.5 bg-primary text-white hover:bg-primary-hover rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
            title="Inspect & Edit Permissions Matrix"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Permissions</span>
          </button>

          {!role.isSystem && (
            <button
              onClick={() => setRoleToDelete(role)}
              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete Custom Role"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  // Columns definition for Matrix DataTable (Modal 1)
  const matrixColumns: Column<ModulePermission>[] = [
    {
      key: 'moduleName',
      header: 'Screen / Module',
      render: (perm) => (
        <div>
          <div className="font-bold text-slate-900">{perm.moduleName}</div>
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
            {perm.category}
          </span>
        </div>
      ),
    },
    {
      key: 'read',
      header: 'Read / View',
      align: 'center',
      render: (perm) => (
        <button
          type="button"
          onClick={() => handleMatrixToggle(perm.id, 'read')}
          disabled={activeMatrixRole?.isSystem}
          className={`w-6.5 h-6.5 rounded inline-flex items-center justify-center transition-all ${
            perm.read
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold shadow-2xs'
              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
          } ${activeMatrixRole?.isSystem ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
        >
          {perm.read ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
        </button>
      ),
    },
    {
      key: 'write',
      header: 'Create / Edit',
      align: 'center',
      render: (perm) => (
        <button
          type="button"
          onClick={() => handleMatrixToggle(perm.id, 'write')}
          disabled={activeMatrixRole?.isSystem}
          className={`w-6.5 h-6.5 rounded inline-flex items-center justify-center transition-all ${
            perm.write
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold shadow-2xs'
              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
          } ${activeMatrixRole?.isSystem ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
        >
          {perm.write ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
        </button>
      ),
    },
    {
      key: 'delete',
      header: 'Delete',
      align: 'center',
      render: (perm) => (
        <button
          type="button"
          onClick={() => handleMatrixToggle(perm.id, 'delete')}
          disabled={activeMatrixRole?.isSystem}
          className={`w-6.5 h-6.5 rounded inline-flex items-center justify-center transition-all ${
            perm.delete
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold shadow-2xs'
              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
          } ${activeMatrixRole?.isSystem ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
        >
          {perm.delete ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
        </button>
      ),
    },
    {
      key: 'export',
      header: 'Export CSV',
      align: 'center',
      render: (perm) => (
        <button
          type="button"
          onClick={() => handleMatrixToggle(perm.id, 'export')}
          disabled={activeMatrixRole?.isSystem}
          className={`w-6.5 h-6.5 rounded inline-flex items-center justify-center transition-all ${
            perm.export
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold shadow-2xs'
              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
          } ${activeMatrixRole?.isSystem ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
        >
          {perm.export ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
        </button>
      ),
    },
    {
      key: 'approve',
      header: 'Approve',
      align: 'center',
      render: (perm) => (
        <button
          type="button"
          onClick={() => handleMatrixToggle(perm.id, 'approve')}
          disabled={activeMatrixRole?.isSystem}
          className={`w-6.5 h-6.5 rounded inline-flex items-center justify-center transition-all ${
            perm.approve
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold shadow-2xs'
              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
          } ${activeMatrixRole?.isSystem ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
        >
          {perm.approve ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
        </button>
      ),
    },
  ];

  // Columns definition for Creation Matrix DataTable (Modal 2)
  const createMatrixColumns: Column<ModulePermission>[] = [
    {
      key: 'moduleName',
      header: 'Screen / Module',
      render: (perm) => (
        <div>
          <div className="font-bold text-slate-900">{perm.moduleName}</div>
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
            {perm.category}
          </span>
        </div>
      ),
    },
    {
      key: 'read',
      header: 'View (Read)',
      align: 'center',
      render: (perm) => (
        <button
          type="button"
          onClick={() => handleModalPermissionToggle(perm.id, 'read')}
          title="View / Read Access"
          className={`w-6.5 h-6.5 rounded inline-flex items-center justify-center transition-all ${
            perm.read
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold shadow-2xs'
              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
          }`}
        >
          {perm.read ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
        </button>
      ),
    },
    {
      key: 'write',
      header: 'Edit (Write)',
      align: 'center',
      render: (perm) => (
        <button
          type="button"
          onClick={() => handleModalPermissionToggle(perm.id, 'write')}
          title="Create / Edit Access"
          className={`w-6.5 h-6.5 rounded inline-flex items-center justify-center transition-all ${
            perm.write
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold shadow-2xs'
              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
          }`}
        >
          {perm.write ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
        </button>
      ),
    },
    {
      key: 'delete',
      header: 'Delete',
      align: 'center',
      render: (perm) => (
        <button
          type="button"
          onClick={() => handleModalPermissionToggle(perm.id, 'delete')}
          title="Delete Access"
          className={`w-6.5 h-6.5 rounded inline-flex items-center justify-center transition-all ${
            perm.delete
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold shadow-2xs'
              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
          }`}
        >
          {perm.delete ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
        </button>
      ),
    },
    {
      key: 'export',
      header: 'Export',
      align: 'center',
      render: (perm) => (
        <button
          type="button"
          onClick={() => handleModalPermissionToggle(perm.id, 'export')}
          title="Export CSV Access"
          className={`w-6.5 h-6.5 rounded inline-flex items-center justify-center transition-all ${
            perm.export
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold shadow-2xs'
              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
          }`}
        >
          {perm.export ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
        </button>
      ),
    },
    {
      key: 'approve',
      header: 'Approve',
      align: 'center',
      render: (perm) => (
        <button
          type="button"
          onClick={() => handleModalPermissionToggle(perm.id, 'approve')}
          title="Approve Access"
          className={`w-6.5 h-6.5 rounded inline-flex items-center justify-center transition-all ${
            perm.approve
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold shadow-2xs'
              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
          }`}
        >
          {perm.approve ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
        </button>
      ),
    },
    {
      key: 'quickAction',
      header: 'Quick Action',
      align: 'center',
      render: (perm) => {
        const isAllGranted = perm.read && perm.write && perm.delete && perm.export && perm.approve;
        return (
          <button
            type="button"
            onClick={() => handleModalToggleModuleAll(perm.id, !isAllGranted)}
            className={`text-[10px] font-bold px-2 py-1 rounded transition-all ${
              isAllGranted
                ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                : 'text-primary bg-primary-light hover:bg-primary/20 border border-primary/20'
            }`}
          >
            {isAllGranted ? 'Revoke' : 'Grant All'}
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 pb-12">
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

      {/* Main All System Access Roles Table */}
      <DataTable<SystemRole>
        columns={roleColumns}
        data={roles}
        keyExtractor={(role) => role.id}
        pageSize={10}
        searchPlaceholder="Search role name, code, description..."
        searchFilterKeys={['name', 'code', 'description']}
        emptyMessage="No system roles found."
        headerActions={
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Role</span>
          </button>
        }
      />

      {/* View / Edit Permissions Matrix Modal (Global Modal & DataTable) */}
      {activeMatrixRole && (
        <Modal
          isOpen={!!activeMatrixRole}
          onClose={() => setActiveMatrixRole(null)}
          title={`Permissions Matrix: ${activeMatrixRole.name}`}
          subtitle={
            activeMatrixRole.isSystem
              ? 'Built-in system role privileges (Read-Only)'
              : 'Granular view, edit, delete, export, and approval grants'
          }
          icon={Shield}
          maxWidth="4xl"
          footer={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveMatrixRole(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition-colors text-xs flex items-center gap-1.5"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>

              {!activeMatrixRole.isSystem && (
                <button
                  type="button"
                  onClick={handleSaveMatrixChanges}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold shadow-xs transition-colors text-xs flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Permissions</span>
                </button>
              )}
            </div>
          }
        >
          <DataTable<ModulePermission>
            columns={matrixColumns}
            data={matrixPermissions}
            keyExtractor={(perm) => perm.id}
            pageSize={10}
          />
        </Modal>
      )}

      {/* Create Custom Role Modal (Global Modal & DataTable) */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create Custom System Role"
          subtitle="Left: Fill role & personal details • Right: Configure screen module action permissions"
          icon={ShieldCheck}
          maxWidth="5xl"
          footer={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition-colors text-xs flex items-center gap-1.5"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                form="create-role-form"
                className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold shadow-xs transition-colors text-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create Role with Permissions</span>
              </button>
            </div>
          }
        >
          <form id="create-role-form" onSubmit={handleCreateRole} className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT SIDE: Personal & Role Details */}
              <div className="lg:col-span-4 space-y-4 bg-slate-50/90 p-4 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2">
                  <UserCheck className="w-4 h-4 text-primary" />
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Role & Personal Details
                  </h4>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-xs">Role Title / Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Regional Dispatch Officer"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-xs">Badge Theme Color</label>
                  <select
                    value={newRoleBadgeColor}
                    onChange={(e) => setNewRoleBadgeColor(e.target.value as SystemRole['badgeColor'])}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 bg-white text-xs font-medium"
                  >
                    <option value="indigo">Indigo Blue</option>
                    <option value="emerald">Emerald Green</option>
                    <option value="sky">Sky Blue</option>
                    <option value="purple">Royal Purple</option>
                    <option value="amber">Warm Amber</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-xs">Copy Preset Template</label>
                  <select
                    value={newRoleTemplate}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 bg-white text-xs font-medium"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.code})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">Pre-fills permission matrix from selected template</p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-xs">Role Description & Responsibilities</label>
                  <textarea
                    rows={3}
                    placeholder="Describe operational access, administrative scope, and responsibilities..."
                    value={newRoleDesc}
                    onChange={(e) => setNewRoleDesc(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 bg-white text-xs"
                  />
                </div>

                <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-lg text-[11px] text-emerald-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                    <Info className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    Role Assignment Note
                  </div>
                  <p className="leading-relaxed">
                    Custom roles can be assigned to active administrative members in the Admin Users tab once created.
                  </p>
                </div>
              </div>

              {/* RIGHT SIDE: Screen Module Permissions Matrix */}
              <div className="lg:col-span-8 space-y-3">
                <DataTable<ModulePermission>
                  columns={createMatrixColumns}
                  data={newRolePermissions}
                  keyExtractor={(perm) => perm.id}
                  pageSize={10}
                  headerActions={
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleModalToggleAllScreens(true)}
                        className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-md transition-colors"
                      >
                        Grant All Screens
                      </button>
                      <button
                        type="button"
                        onClick={() => handleModalToggleAllScreens(false)}
                        className="text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-md transition-colors"
                      >
                        Revoke All Screens
                      </button>
                    </div>
                  }
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirm Delete Custom Role Modal */}
      {roleToDelete && (
        <ConfirmDeleteModal
          isOpen={!!roleToDelete}
          onClose={() => setRoleToDelete(null)}
          onConfirm={() => {
            const target = roleToDelete;
            setRoles((prev) => prev.filter((r) => r.id !== target.id));
            setSaveToast(`Custom role "${target.name}" deleted.`);
            setTimeout(() => setSaveToast(null), 3500);
            setRoleToDelete(null);
          }}
          title="Confirm Custom Role Deletion"
          itemName={roleToDelete.name}
          itemDetails={`Code: ${roleToDelete.code} • ${roleToDelete.assignedUsersCount} Admins assigned`}
          warningText={`Are you sure you want to delete the custom role "${roleToDelete.name}"? Active admin users assigned to this role will lose inherited permissions.`}
          confirmText="Yes, Delete Role"
        />
      )}
    </div>
  );
}
