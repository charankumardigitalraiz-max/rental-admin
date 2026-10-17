'use client';

import React, { useState, useEffect } from 'react';
import { useAdminUserStore } from '@/store/useAdminUserStore';
import { useToast } from '@/context/ToastContext';
import { AdminUser } from '@/types';
import Modal from '@/components/ui/Modal';
import DataTable, { Column } from '@/components/ui/DataTable';
import {
  ShieldCheck,
  Plus,
  Mail,
  Phone,
  Lock,
  CheckCircle2,
  Edit3,
  Users,
  Award,
  Filter,
  X,
  Check,
  RefreshCw,
  Trash2,
} from 'lucide-react';

export default function AdminUsersView() {
  const {
    adminUsers,
    counts,
    isLoading,
    isSubmitting,
    fetchAdminUsers,
    addAdminUser,
    updateAdminUser,
    toggleAdminUserStatus,
    deleteAdminUser,
  } = useAdminUserStore();
  const { toast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<AdminUser | null>(null);
  const [roleFilter, setRoleFilter] = useState('All');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    role: 'Operations Admin' as AdminUser['role'],
    status: 'Active' as AdminUser['status'],
  });

  // Fetch admin users on initial mount
  useEffect(() => {
    fetchAdminUsers();
  }, [fetchAdminUsers]);

  // Metric counts derived from backend response or client roster
  const totalStaff = counts?.totalStaff ?? adminUsers.length;
  const activeStaffCount =
    counts?.activeStaffCount ?? adminUsers.filter((a) => a.status === 'Active').length;
  const superAdminCount =
    counts?.superAdminCount ?? adminUsers.filter((a) => a.role === 'Super Admin').length;
  const managersCount =
    counts?.managersCount ??
    adminUsers.filter(
      (a) =>
        a.role === 'Driver Manager' ||
        a.role === 'Valet Manager' ||
        a.role === 'Operations Admin'
    ).length;

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Required Fields Missing', 'Please provide staff name and email address.');
      return;
    }

    const res = await addAdminUser(formData);
    if (res.success) {
      toast.success('Staff Member Added', `${formData.name} was added to the administrative roster.`);
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        role: 'Operations Admin',
        status: 'Active',
      });
    } else {
      toast.error('Creation Failed', res.error || 'Failed to create staff member.');
    }
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    const res = await updateAdminUser(editingStaff.id, editingStaff);
    if (res.success) {
      toast.success('Staff Details Updated', `Changes for ${editingStaff.name} have been saved.`);
      setEditingStaff(null);
    } else {
      toast.error('Update Failed', res.error || 'Failed to update staff member.');
    }
  };

  const handleToggleStatus = async (a: AdminUser) => {
    const res = await toggleAdminUserStatus(a.id);
    if (res.success) {
      const nextStatus = res.data?.status || (a.status === 'Active' ? 'Inactive' : 'Active');
      if (nextStatus === 'Active') {
        toast.success('Staff Activated', `${a.name} is now active.`);
      } else {
        toast.warning('Staff Suspended', `Access for ${a.name} has been suspended.`);
      }
    } else {
      toast.error('Action Failed', res.error || 'Failed to update staff status.');
    }
  };

  const handleDeleteStaff = async (a: AdminUser) => {
    if (!window.confirm(`Are you sure you want to remove ${a.name} from the administrative roster?`)) {
      return;
    }

    const res = await deleteAdminUser(a.id);
    if (res.success) {
      toast.success('Staff Removed', `${a.name} was removed from the roster.`);
    } else {
      toast.error('Deletion Failed', res.error || 'Failed to delete staff member.');
    }
  };

  const rolesList: AdminUser['role'][] = [
    'Super Admin',
    'Operations Admin',
    'Finance Admin',
    'Driver Manager',
    'Valet Manager',
    'Support Staff',
  ];

  const filteredStaff = adminUsers.filter((a) => {
    return roleFilter === 'All' || a.role === roleFilter;
  });

  const getRoleBadgeStyle = (role: AdminUser['role']) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold';
      case 'Driver Manager':
        return 'bg-sky-50 text-sky-800 border-sky-300 font-bold';
      case 'Valet Manager':
        return 'bg-amber-50 text-amber-800 border-amber-300 font-bold';
      case 'Operations Admin':
        return 'bg-indigo-50 text-indigo-800 border-indigo-300 font-bold';
      case 'Finance Admin':
        return 'bg-purple-50 text-purple-800 border-purple-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300 font-medium';
    }
  };

  const columns: Column<AdminUser>[] = [
    {
      key: 'name',
      header: 'Staff Member Profile',
      className: 'min-w-[200px]',
      render: (a) => (
        <div className="flex items-center gap-3">
          <img
            src={a.avatar}
            alt={a.name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-100 shrink-0"
          />
          <div>
            <div className="font-bold text-slate-900">{a.name}</div>
            <div className="text-[10px] text-slate-400 font-medium">{a.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Assigned Role',
      render: (a) => (
        <span className={`px-2.5 py-1 rounded text-[10.5px] border ${getRoleBadgeStyle(a.role)}`}>
          {a.role}
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'Phone Contact',
      render: (a) => <span className="font-medium text-slate-700">{a.phone}</span>,
    },
    {
      key: 'lastLogin',
      header: 'Last Dashboard Login',
      render: (a) => <span className="text-slate-500 font-medium">{a.lastLogin}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (a) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            a.status === 'Active'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {a.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (a) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => setEditingStaff(a)}
            className="p-1.5 bg-primary-light hover:bg-primary text-primary hover:text-white rounded-md border border-primary/20 hover:border-primary transition-all shadow-2xs active:scale-95 cursor-pointer"
            title="Edit Staff Member Details"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleToggleStatus(a)}
            className={`px-2 py-1 text-[10px] font-bold rounded border transition-colors cursor-pointer ${
              a.status === 'Active'
                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            {a.status === 'Active' ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => handleDeleteStaff(a)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md border border-transparent hover:border-rose-200 transition-all cursor-pointer"
            title="Delete Staff Account"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Staff Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Staff Roster */}
        <div className="card-white p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Staff Roster
            </span>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">{totalStaff} Members</div>
          <span className="text-[10px] text-emerald-600 font-semibold block">
            {activeStaffCount} Active Accounts
          </span>
        </div>

        {/* Super Administrators */}
        <div className="card-white p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block">
              Super Administrators
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-700 mt-1">{superAdminCount} Super Admins</div>
          <span className="text-[10px] text-slate-500 font-medium block">Full system access control</span>
        </div>

        {/* Operations & Fleet Managers */}
        <div className="card-white p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block">
              Operations & Fleet Managers
            </span>
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-700">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-sky-700 mt-1">{managersCount} Managers</div>
          <span className="text-[10px] text-slate-500 font-medium block">Driver & Valet operational Leads</span>
        </div>

        {/* Security Status */}
        <div className="card-white p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block">
              Security Status
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>100% Verified</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium block">2FA & Role-Based Access Enabled</span>
        </div>
      </div>

      {/* DataTable Roster */}
      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={filteredStaff}
          keyExtractor={(a) => a.id}
          pageSize={6}
          isLoading={isLoading}
          searchPlaceholder="Search staff name, email, role, or phone..."
          searchFilterKeys={['name', 'email', 'phone', 'role']}
          headerActions={
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => fetchAdminUsers()}
                disabled={isLoading}
                className="p-1.5 text-slate-500 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                title="Refresh staff roster"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-primary' : ''}`} />
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Filter Role:
                </span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs"
                >
                  <option value="All">All Roles</option>
                  {rolesList.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm hover:shadow active:scale-95 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Staff Member
              </button>
            </div>
          }
        />
      </div>

      {/* 1. Add Staff Member Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Staff Member"
        subtitle="Create an administrative or staff user account with assigned operational role"
        icon={Users}
        maxWidth="lg"
      >
        <form onSubmit={handleCreateStaff} className="space-y-3">
          <div>
            <label className="block text-slate-700 font-semibold text-xs mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Ananya Roy"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-700 font-semibold text-xs mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="staff@drivervalet.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold text-xs mb-1">Phone Number</label>
              <input
                type="text"
                required
                placeholder="+91 98000 00000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-700 font-semibold text-xs mb-1">Assigned Operational Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminUser['role'] })}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary font-semibold"
              >
                {rolesList.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold text-xs mb-1">Account Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as AdminUser['status'] })}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary font-semibold"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold text-xs hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg text-xs shadow-sm hover:shadow transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" /> Create Staff Member
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Edit Staff Member Modal */}
      {editingStaff && (
        <Modal
          isOpen={!!editingStaff}
          onClose={() => setEditingStaff(null)}
          title={`Edit Staff: ${editingStaff.name}`}
          subtitle="Modify contact information and assigned administrative role"
          icon={Edit3}
          maxWidth="md"
        >
          <form onSubmit={handleUpdateStaff} className="space-y-3">
            <div>
              <label className="block text-slate-700 font-semibold text-xs mb-1">Full Name</label>
              <input
                type="text"
                required
                value={editingStaff.name}
                onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-700 font-semibold text-xs mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingStaff.email}
                  onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold text-xs mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={editingStaff.phone}
                  onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold text-xs mb-1">Assigned Operational Role</label>
              <select
                value={editingStaff.role}
                onChange={(e) =>
                  setEditingStaff({ ...editingStaff, role: e.target.value as AdminUser['role'] })
                }
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary font-semibold"
              >
                {rolesList.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold text-xs hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg text-xs shadow-sm hover:shadow transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" /> Save Staff Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
