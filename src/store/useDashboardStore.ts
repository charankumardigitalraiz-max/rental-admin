import { create } from 'zustand';
import { DriverBooking, DriverSubscription } from '@/types';

export interface DashboardStats {
  totalBookings: number;
  totalDriverBookings: number;
  totalValetBookings: number;
  activeDriverTrips: number;
  searchingDriverBookings: number;
  completedBookingsCount: number;
  cancelledBookingsCount: number;
  localDriverBookings: number;
  outstationDriverBookings: number;
  activeDriversCount: number;
  availableDriversCount: number;
  busyDriversCount: number;
  totalGrossRevenue: number;
  totalPlatformCommission: number;
  revenueGrowthText: string;
  activeSubscribedDrivers: number;
  expiringSoonSubscribedDrivers: number;
  expiredSubscribedDrivers: number;
  totalSubscriptions: number;
  availableValetStaffCount: number;
  assignedValetStaffCount: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentDriverBookings: DriverBooking[];
  expiredOrExpiringSubscriptions: DriverSubscription[];
}

interface DashboardStoreState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  fetchDashboardData: (
    quiet?: boolean
  ) => Promise<{ success: boolean; data?: DashboardData; error?: string }>;
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

export const useDashboardStore = create<DashboardStoreState>((set) => ({
  data: null,
  isLoading: true,
  error: null,

  fetchDashboardData: async (quiet = false) => {
    if (!quiet) set({ isLoading: true, error: null });

    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: getAuthHeaders(),
      });
      const json = await res.json();

      if (res.ok && json.success && json.data) {
        set({
          data: json.data,
          isLoading: false,
          error: null,
        });
        return { success: true, data: json.data };
      }

      set({
        isLoading: false,
        error: json.error || 'Failed to fetch dashboard data',
      });
      return { success: false, error: json.error };
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Network error fetching dashboard data',
      });
      return { success: false, error: err.message };
    }
  },
}));
