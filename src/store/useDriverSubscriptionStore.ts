import { create } from 'zustand';
import { DriverSubscription } from '@/types';
import { useRentalStore } from './useRentalStore';

export interface DriverSubscriptionStats {
  totalSubscriptions: number;
  totalPassRevenue: number;
  activePasses: number;
  activePassRevenue: number;
  expiringSoonPasses: number;
  expiredPasses: number;
}

export interface DriverSubscriptionPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface DriverSubscriptionStoreState {
  subscriptions: DriverSubscription[];
  stats: DriverSubscriptionStats | null;
  pagination: DriverSubscriptionPagination | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  statusFilter: string;
  searchQuery: string;

  setStatusFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;
  clearError: () => void;

  fetchDriverSubscriptions: (
    params?: { search?: string; status?: string; page?: number; limit?: number; all?: boolean },
    quiet?: boolean
  ) => Promise<{
    success: boolean;
    data?: DriverSubscription[];
    stats?: DriverSubscriptionStats;
    pagination?: DriverSubscriptionPagination;
    error?: string;
  }>;

  updateSubscriptionStatus: (
    id: string,
    subscriptionStatus: DriverSubscription['subscriptionStatus']
  ) => Promise<{ success: boolean; data?: DriverSubscription; error?: string }>;
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('admin_token') ||
      document.cookie
        .split('; ')
        .find((row) => row.startsWith('admin_token=') || row.startsWith('token='))
        ?.split('=')[1];
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

export const useDriverSubscriptionStore = create<DriverSubscriptionStoreState>((set, get) => ({
  subscriptions: [],
  stats: null,
  pagination: null,
  isLoading: false,
  isUpdating: false,
  error: null,
  statusFilter: 'All',
  searchQuery: '',

  setStatusFilter: (filter: string) => set({ statusFilter: filter }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  clearError: () => set({ error: null }),

  fetchDriverSubscriptions: async (params, quiet = false) => {
    if (!quiet) set({ isLoading: true, error: null });

    try {
      const search = params?.search !== undefined ? params.search : get().searchQuery;
      const status = params?.status !== undefined ? params.status : get().statusFilter;
      const page = params?.page ?? (get().pagination?.page || 1);
      const limit = params?.limit ?? (get().pagination?.limit || 8);
      const all = params?.all ?? false;

      const queryParams = new URLSearchParams();
      if (search && search.trim()) {
        queryParams.set('search', search.trim());
      }
      if (status && status !== 'All') {
        queryParams.set('status', status.trim());
      }
      if (all) {
        queryParams.set('all', 'true');
      } else {
        queryParams.set('page', String(page));
        queryParams.set('limit', String(limit));
      }

      const queryString = queryParams.toString();
      const endpoint = `/api/admin/driver-subscriptions${queryString ? `?${queryString}` : ''}`;

      const res = await fetch(endpoint, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        const data: DriverSubscription[] = json.data || [];
        const stats: DriverSubscriptionStats | null = json.stats || null;
        const pagination: DriverSubscriptionPagination | null = json.pagination || null;

        set({
          subscriptions: data,
          stats,
          pagination,
          searchQuery: search,
          statusFilter: status,
          isLoading: false,
          error: null,
        });

        // Keep rental store synchronized for dashboard cards and other views
        useRentalStore.setState({ driverSubscriptions: data });

        return { success: true, data, stats: stats || undefined, pagination: pagination || undefined };
      } else {
        const errorMsg = json.error || 'Failed to fetch driver subscriptions.';
        set({ error: errorMsg, isLoading: false });
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('Error fetching driver subscriptions:', err);
      const errorMsg = err.message || 'Network error while fetching subscriptions.';
      set({ error: errorMsg, isLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  updateSubscriptionStatus: async (id, subscriptionStatus) => {
    set({ isUpdating: true, error: null });

    try {
      const res = await fetch('/api/admin/driver-subscriptions', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id, subscriptionStatus }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        // Update local subscriptions state
        const updated = get().subscriptions.map((s) =>
          s.id === id || (s as any)._id === id ? { ...s, subscriptionStatus } : s
        );

        set({
          subscriptions: updated,
          isUpdating: false,
          error: null,
        });

        useRentalStore.setState({ driverSubscriptions: updated });

        // Refresh stats silently in background
        get().fetchDriverSubscriptions(undefined, true);

        return { success: true, data: json.data };
      } else {
        const errorMsg = json.error || 'Failed to update subscription status.';
        set({ error: errorMsg, isUpdating: false });
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('Error in updateSubscriptionStatus:', err);
      const errorMsg = err.message || 'Network error while updating subscription status.';
      set({ error: errorMsg, isUpdating: false });
      return { success: false, error: errorMsg };
    }
  },
}));
