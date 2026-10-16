import { create } from 'zustand';
import { Transaction } from '@/types';
import { useRentalStore } from './useRentalStore';

export interface TransactionStats {
  totalRevenue: number;
  totalCommission: number;
  totalPayout: number;
  totalCount: number;
  successCount: number;
  pendingCount: number;
  failedCount: number;
  refundedCount: number;
  successRate: number;
}

export interface TransactionPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TransactionDetailData extends Transaction {
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  } | null;
  driver?: {
    id: string;
    driverId: string;
    name: string;
    phone: string;
    avatar?: string;
  } | null;
  booking?: {
    id: string;
    bookingNumber: string;
    status: string;
    tripType: string;
    pickupLocation: string;
    dropLocation: string;
    pickupDate?: string;
    pickupTime?: string;
  } | null;
  subscription?: {
    id: string;
    planName: string;
    status: string;
    price: number;
    startDate?: string;
    expiryDate?: string;
  } | null;
}

interface TransactionStoreState {
  transactions: Transaction[];
  currentTransaction: TransactionDetailData | null;
  stats: TransactionStats | null;
  pagination: TransactionPagination | null;
  isLoading: boolean;
  isDetailLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  serviceFilter: string;
  statusFilter: string;
  searchQuery: string;

  setServiceFilter: (filter: string) => void;
  setStatusFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;
  clearError: () => void;

  fetchTransactions: (
    params?: {
      search?: string;
      serviceType?: string;
      status?: string;
      page?: number;
      limit?: number;
      all?: boolean;
    },
    quiet?: boolean
  ) => Promise<{
    success: boolean;
    data?: Transaction[];
    stats?: TransactionStats;
    pagination?: TransactionPagination;
    error?: string;
  }>;

  fetchTransactionById: (id: string) => Promise<{
    success: boolean;
    data?: TransactionDetailData;
    error?: string;
  }>;

  updateTransactionStatus: (
    id: string,
    status: Transaction['status'],
    refundAmount?: number
  ) => Promise<{
    success: boolean;
    data?: TransactionDetailData;
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

export const useTransactionStore = create<TransactionStoreState>((set, get) => ({
  transactions: [],
  currentTransaction: null,
  stats: null,
  pagination: null,
  isLoading: false,
  isDetailLoading: false,
  isUpdating: false,
  error: null,
  serviceFilter: 'All',
  statusFilter: 'All',
  searchQuery: '',

  setServiceFilter: (filter: string) => set({ serviceFilter: filter }),
  setStatusFilter: (filter: string) => set({ statusFilter: filter }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  clearError: () => set({ error: null }),

  fetchTransactions: async (params, quiet = false) => {
    if (!quiet) set({ isLoading: true, error: null });

    try {
      const search = params?.search !== undefined ? params.search : get().searchQuery;
      const serviceType = params?.serviceType !== undefined ? params.serviceType : get().serviceFilter;
      const status = params?.status !== undefined ? params.status : get().statusFilter;
      const page = params?.page ?? (get().pagination?.page || 1);
      const limit = params?.limit ?? (get().pagination?.limit || 8);
      const all = params?.all ?? false;

      const queryParams = new URLSearchParams();
      if (search && search.trim()) {
        queryParams.set('search', search.trim());
      }
      if (serviceType && serviceType !== 'All') {
        queryParams.set('serviceType', serviceType.trim());
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
      const endpoint = `/api/admin/transactions${queryString ? `?${queryString}` : ''}`;

      const res = await fetch(endpoint, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        const data: Transaction[] = json.data || [];
        const stats: TransactionStats | null = json.stats || null;
        const pagination: TransactionPagination | null = json.pagination || null;

        set({
          transactions: data,
          stats,
          pagination,
          searchQuery: search,
          serviceFilter: serviceType,
          statusFilter: status,
          isLoading: false,
          error: null,
        });

        // Sync with central rental store
        useRentalStore.setState({ transactions: data });

        return { success: true, data, stats: stats || undefined, pagination: pagination || undefined };
      } else {
        const errorMsg = json.error || 'Failed to fetch transactions.';
        set({ error: errorMsg, isLoading: false });
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('Error fetching transactions in useTransactionStore:', err);
      const errorMsg = err.message || 'Network error while fetching transactions.';
      set({ error: errorMsg, isLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  fetchTransactionById: async (id: string) => {
    set({ isDetailLoading: true, error: null });

    try {
      const res = await fetch(`/api/admin/transactions/${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        const data: TransactionDetailData = json.data;
        set({ currentTransaction: data, isDetailLoading: false });
        return { success: true, data };
      } else {
        const errorMsg = json.error || 'Transaction not found.';
        set({ isDetailLoading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('Error fetching transaction by ID:', err);
      const errorMsg = err.message || 'Failed to load transaction details.';
      set({ isDetailLoading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  updateTransactionStatus: async (id: string, status: Transaction['status'], refundAmount?: number) => {
    set({ isUpdating: true });

    try {
      const res = await fetch(`/api/admin/transactions/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, refundAmount }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        const updatedData: TransactionDetailData = json.data;
        set((state) => ({
          isUpdating: false,
          currentTransaction: state.currentTransaction
            ? { ...state.currentTransaction, ...updatedData }
            : updatedData,
          transactions: state.transactions.map((t) =>
            t.id === id || t.transactionId === id ? { ...t, ...updatedData } : t
          ),
        }));

        // Keep rental store synchronized
        useRentalStore.setState((s) => ({
          transactions: s.transactions.map((t) =>
            t.id === id || t.transactionId === id ? { ...t, ...updatedData } : t
          ),
        }));

        return { success: true, data: updatedData };
      } else {
        const errorMsg = json.error || 'Failed to update transaction status.';
        set({ isUpdating: false });
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('Error updating transaction status:', err);
      const errorMsg = err.message || 'Network error while updating transaction.';
      set({ isUpdating: false });
      return { success: false, error: errorMsg };
    }
  },
}));
