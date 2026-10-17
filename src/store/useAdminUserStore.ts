import { create } from 'zustand';
import { AdminUser } from '@/types';
import { useRentalStore } from './useRentalStore';

export interface AdminUserCounts {
  totalStaff: number;
  activeStaffCount: number;
  superAdminCount: number;
  managersCount: number;
}

export interface CreateAdminUserInput {
  name: string;
  email: string;
  phone: string;
  role: AdminUser['role'];
  status: AdminUser['status'];
  avatar?: string;
  password?: string;
}

export interface UpdateAdminUserInput {
  name?: string;
  email?: string;
  phone?: string;
  role?: AdminUser['role'];
  status?: AdminUser['status'];
  avatar?: string;
  password?: string;
}

interface AdminUserStoreState {
  adminUsers: AdminUser[];
  counts: AdminUserCounts | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  clearError: () => void;
  fetchAdminUsers: (params?: {
    search?: string;
    role?: string;
    status?: string;
  }) => Promise<{ success: boolean; data?: AdminUser[]; error?: string }>;
  addAdminUser: (
    data: CreateAdminUserInput
  ) => Promise<{ success: boolean; data?: AdminUser; error?: string }>;
  updateAdminUser: (
    id: string,
    data: UpdateAdminUserInput
  ) => Promise<{ success: boolean; data?: AdminUser; error?: string }>;
  toggleAdminUserStatus: (
    id: string
  ) => Promise<{ success: boolean; data?: AdminUser; error?: string }>;
  deleteAdminUser: (
    id: string
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
}

export const useAdminUserStore = create<AdminUserStoreState>((set, get) => ({
  adminUsers: [],
  counts: null,
  isLoading: false,
  isSubmitting: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchAdminUsers: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const q = new URLSearchParams();
      q.append('all', 'true');
      if (params?.search) q.append('search', params.search);
      if (params?.role && params.role !== 'All') q.append('role', params.role);
      if (params?.status && params.status !== 'All') q.append('status', params.status);

      const res = await fetch(`/api/admin/admin-users?${q.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const json = await res.json();

      if (res.ok && json.success && Array.isArray(json.data)) {
        set({
          adminUsers: json.data,
          counts: json.counts || null,
          isLoading: false,
          error: null,
        });

        // Sync with useRentalStore so Header/Profile remain in sync
        useRentalStore.setState({ adminUsers: json.data });

        return { success: true, data: json.data };
      } else {
        const errorMsg = json.error || 'Failed to fetch staff roster.';
        set({ error: errorMsg, isLoading: false });
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('Error fetching admin users:', err);
      const errorMsg = err.message || 'Network error while fetching staff roster.';
      set({ error: errorMsg, isLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  addAdminUser: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await fetch('/api/admin/admin-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (res.ok && json.success && json.data) {
        const createdUser: AdminUser = json.data;
        const currentList = get().adminUsers;
        const updatedList = [createdUser, ...currentList.filter((u) => u.id !== createdUser.id)];

        set({
          adminUsers: updatedList,
          isSubmitting: false,
          error: null,
        });

        useRentalStore.setState({ adminUsers: updatedList });

        // Refresh counts in background
        get().fetchAdminUsers();

        return { success: true, data: createdUser };
      } else {
        const errorMsg = json.error || 'Failed to add staff member.';
        set({ error: errorMsg, isSubmitting: false });
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('Error creating staff member:', err);
      const errorMsg = err.message || 'Network error while adding staff member.';
      set({ error: errorMsg, isSubmitting: false });
      return { success: false, error: errorMsg };
    }
  },

  updateAdminUser: async (id, data) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await fetch(`/api/admin/admin-users/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (res.ok && json.success && json.data) {
        const updatedUser: AdminUser = json.data;
        const updatedList = get().adminUsers.map((u) => (u.id === id ? updatedUser : u));

        set({
          adminUsers: updatedList,
          isSubmitting: false,
          error: null,
        });

        useRentalStore.setState({ adminUsers: updatedList });

        // Refresh counts in background
        get().fetchAdminUsers();

        return { success: true, data: updatedUser };
      } else {
        const errorMsg = json.error || 'Failed to update staff member.';
        set({ error: errorMsg, isSubmitting: false });
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('Error updating staff member:', err);
      const errorMsg = err.message || 'Network error while updating staff member.';
      set({ error: errorMsg, isSubmitting: false });
      return { success: false, error: errorMsg };
    }
  },

  toggleAdminUserStatus: async (id) => {
    try {
      const target = get().adminUsers.find((u) => u.id === id);
      const nextStatus = target?.status === 'Active' ? 'Inactive' : 'Active';

      // Optimistic update
      const optimisticList = get().adminUsers.map((u) =>
        u.id === id ? { ...u, status: nextStatus as AdminUser['status'] } : u
      );
      set({ adminUsers: optimisticList });
      useRentalStore.setState({ adminUsers: optimisticList });

      const res = await fetch(`/api/admin/admin-users/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      const json = await res.json();

      if (res.ok && json.success && json.data) {
        const confirmedUser: AdminUser = json.data;
        const finalList = get().adminUsers.map((u) => (u.id === id ? confirmedUser : u));
        set({ adminUsers: finalList });
        useRentalStore.setState({ adminUsers: finalList });
        get().fetchAdminUsers();
        return { success: true, data: confirmedUser };
      } else {
        // Rollback optimistic update
        if (target) {
          const rollbackList = get().adminUsers.map((u) => (u.id === id ? target : u));
          set({ adminUsers: rollbackList });
          useRentalStore.setState({ adminUsers: rollbackList });
        }
        const errorMsg = json.error || 'Failed to toggle staff status.';
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('Error toggling staff status:', err);
      return { success: false, error: err.message || 'Network error' };
    }
  },

  deleteAdminUser: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await fetch(`/api/admin/admin-users/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      const json = await res.json();

      if (res.ok && json.success) {
        const updatedList = get().adminUsers.filter((u) => u.id !== id);
        set({
          adminUsers: updatedList,
          isSubmitting: false,
          error: null,
        });

        useRentalStore.setState({ adminUsers: updatedList });
        get().fetchAdminUsers();

        return { success: true, message: json.message };
      } else {
        const errorMsg = json.error || 'Failed to delete staff member.';
        set({ error: errorMsg, isSubmitting: false });
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('Error deleting staff member:', err);
      const errorMsg = err.message || 'Network error while deleting staff member.';
      set({ error: errorMsg, isSubmitting: false });
      return { success: false, error: errorMsg };
    }
  },
}));
