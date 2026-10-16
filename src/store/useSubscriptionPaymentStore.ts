import { create } from 'zustand';
import { SubscriptionPayment } from '@/types';
import { useRentalStore } from './useRentalStore';

export interface SubscriptionPaymentStats {
  totalPassRevenue: number;
  completedCount: number;
  pendingCount: number;
  failedCount: number;
  refundedCount: number;
  totalCount: number;
  activePlanName: string;
  activePlanPrice: number;
}

export interface SubscriptionPaymentPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface SubscriptionPaymentStoreState {
  subscriptionPayments: SubscriptionPayment[];
  stats: SubscriptionPaymentStats | null;
  pagination: SubscriptionPaymentPagination | null;
  isLoading: boolean;
  error: string | null;
  statusFilter: string;
  searchQuery: string;

  setStatusFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;
  clearError: () => void;

  fetchSubscriptionPayments: (
    params?: {
      search?: string;
      status?: string;
      page?: number;
      limit?: number;
      all?: boolean;
    },
    quiet?: boolean
  ) => Promise<{
    success: boolean;
    data?: SubscriptionPayment[];
    stats?: SubscriptionPaymentStats;
    pagination?: SubscriptionPaymentPagination;
    error?: string;
  }>;
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

export const useSubscriptionPaymentStore = create<SubscriptionPaymentStoreState>((set, get) => ({
  subscriptionPayments: [],
  stats: null,
  pagination: null,
  isLoading: false,
  error: null,
  statusFilter: 'All',
  searchQuery: '',

  setStatusFilter: (filter: string) => set({ statusFilter: filter }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  clearError: () => set({ error: null }),

  fetchSubscriptionPayments: async (params, quiet = false) => {
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
      const endpoint = `/api/admin/subscription-payments${queryString ? `?${queryString}` : ''}`;

      const res = await fetch(endpoint, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        const data: SubscriptionPayment[] = json.data || [];
        const stats: SubscriptionPaymentStats | null = json.stats || null;
        const pagination: SubscriptionPaymentPagination | null = json.pagination || null;

        set({
          subscriptionPayments: data,
          stats,
          pagination,
          searchQuery: search,
          statusFilter: status,
          isLoading: false,
          error: null,
        });

        // Sync with central rental store
        useRentalStore.setState({ subscriptionPayments: data });

        return { success: true, data, stats: stats || undefined, pagination: pagination || undefined };
      } else {
        const errorMsg = json.error || 'Failed to fetch subscription payments.';
        set({ error: errorMsg, isLoading: false });
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('Error in fetchSubscriptionPayments store:', err);
      const errorMsg = err.message || 'Network error while fetching subscription payments.';
      set({ error: errorMsg, isLoading: false });
      return { success: false, error: errorMsg };
    }
  },
}));
