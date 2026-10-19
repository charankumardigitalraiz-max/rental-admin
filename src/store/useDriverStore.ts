import { create } from 'zustand';
import { Driver } from '@/types';
import { useRentalStore } from './useRentalStore';

export interface DriverStats {
  totalBookings: number;
  completedBookings: number;
  activeBookings: number;
  cancelledBookings: number;
  totalEarnings: number;
  pendingEarnings: number;
  rating: number;
  completionRate: number;
}

export interface DriverPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FetchDriversParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface FetchDriverBookingsParams {
  tripFilter?: 'all' | 'completed' | 'active' | 'cancelled' | string;
  page?: number;
  limit?: number;
  search?: string;
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

export function formatDriver(d: any): any {
  if (!d) return null;
  const safeUrl = (url: any, fallback: string) => {
    if (!url || url === 'undefined' || url === 'null' || url === '') return fallback;
    return url;
  };

  // Determine the primary Govt ID proof submitted by the driver (only 1 will come)
  let idType = 'Govt ID';
  let idNumber = 'Not provided';
  let idFront = '';
  let idBack = '';

  if (d.aadhaarNumber || d.aadhaarCardFront || d.aadhaarCardBack) {
    idType = 'Aadhaar Card';
    idNumber = d.aadhaarNumber || 'Not provided';
    idFront = d.aadhaarCardFront || '';
    idBack = d.aadhaarCardBack || '';
  } else if (d.pancardNumber || d.pancard) {
    idType = 'PAN Card';
    idNumber = d.pancardNumber || 'Not provided';
    idFront = d.pancard || '';
    idBack = '';
  } else if (d.passportId || d.passport) {
    idType = 'Passport';
    idNumber = d.passportId || 'Not provided';
    idFront = d.passport || '';
    idBack = '';
  } else {
    idType = 'Aadhaar Card';
    idNumber = 'Not provided';
    idFront = '';
    idBack = '';
  }

  const panNumber = d.pancardNumber || '';
  const panImage = d.pancard ? safeUrl(d.pancard, '') : '';
  const aadhaarNumber = d.aadhaarNumber || '';
  const aadhaarFront = d.aadhaarCardFront ? safeUrl(d.aadhaarCardFront, '') : '';
  const aadhaarBack = d.aadhaarCardBack ? safeUrl(d.aadhaarCardBack, '') : '';
  const passportId = d.passportId || '';
  const passportImage = d.passport ? safeUrl(d.passport, '') : '';

  return {
    ...d,
    id: d._id || d.driverId,
    _id: d._id,
    driverId: d.driverId,
    name: `${d.firstName || ''} ${d.lastName || ''}`.trim() || 'Driver',
    firstName: d.firstName || '',
    lastName: d.lastName || '',
    phone: d.phone || '',
    email: d.email || '',
    avatar: d.selfie || 'https://i.pravatar.cc/150',
    status:
      d.status === 'pending'
        ? 'Pending Approval'
        : d.status === 'verified'
          ? 'Approved'
          : d.status === 'suspended'
            ? 'Suspended'
            : d.status === 'rejected'
              ? 'Rejected'
              : d.status,
    dutyStatus: d.isOnline ? 'Online' : 'Offline',
    availability: 'Available',
    rating: d.rating ?? 5.0,
    completedBookings: d.completedBookings ?? 0,
    totalBookings: d.totalBookings ?? 0,
    cancelledBookings: d.cancelledBookings ?? 0,
    activeBookings: d.activeBookings ?? 0,
    earnings: d.earnings || { total: 0, pending: 0 },
    currentLocation: d.address || 'Location unavailable',
    subscription: d.subscription || {
      status: 'None',
      planName: 'No Plan',
      startDate: '-',
      expiryDate: '-',
      daysRemaining: 0,
      localEligible: false,
      outstationEligible: false,
    },
    pancardNumber: panNumber,
    pancard: panImage,
    aadhaarNumber: aadhaarNumber,
    aadhaarCardFront: aadhaarFront,
    aadhaarCardBack: aadhaarBack,
    passportId: passportId,
    passport: passportImage,
    verification: {
      status: d.status === 'verified' ? 'Verified' : 'Pending',
      licenseNumber: d.licenseNumber || 'Not provided',
      licenseExpiry: 'Not provided',
      licenseImage: safeUrl(d.drivingLicense, 'https://placehold.co/400x250/e2e8f0/475569?text=License+Image'),
      idProofType: idType,
      idProofNumber: idNumber,
      idProofImage: safeUrl(idFront, `https://placehold.co/400x250/e2e8f0/475569?text=${encodeURIComponent(idType)}`),
      idProofImageBack: idBack ? safeUrl(idBack, '') : '',
      pancardNumber: panNumber,
      pancard: panImage,
      aadhaarNumber: aadhaarNumber,
      aadhaarCardFront: aadhaarFront,
      aadhaarCardBack: aadhaarBack,
      passportId: passportId,
      passport: passportImage,
    },
    bankDetails: d.bankDetails || {
      bankName: d.bankName || 'HDFC Bank',
      accountHolderName: d.accountHolderName || `${d.firstName || ''} ${d.lastName || ''}`.trim() || 'Driver Account',
      accountNumber: d.accountNumber || '50100482910482',
      ifscCode: d.ifscCode || 'HDFC0001234',
      upiId: d.upiId || (d.phone ? `${d.phone}@upi` : 'driver@upi'),
      passbookImage: d.passbookImage || '',
      status: d.status === 'verified' ? 'Verified' : 'Pending',
    },
  };
}

export interface DriverCounts {
  total: number;
  approved: number;
  pending: number;
  online: number;
  suspended: number;
  active?: number;
  inactive?: number;
  newThisMonth?: number;
}

interface DriverStoreState {
  drivers: Driver[];
  selectedDriverId: string | null;
  currentDriver: any | null;
  driverStats: DriverStats | null;
  driverBookings: any[];
  bookingsPagination: DriverPagination | null;
  isLoading: boolean;
  isBookingsLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  pagination: DriverPagination | null;
  counts: DriverCounts | null;
  tripFilter: 'all' | 'completed' | 'active' | 'cancelled';
  currentBookingPage: number;

  setSelectedDriverId: (id: string | null) => void;
  setTripFilter: (filter: 'all' | 'completed' | 'active' | 'cancelled') => void;
  setCurrentBookingPage: (page: number) => void;
  clearCurrentDriver: () => void;
  clearError: () => void;

  fetchDrivers: (params?: FetchDriversParams) => Promise<{ success: boolean; data?: Driver[]; counts?: DriverCounts; pagination?: DriverPagination; error?: string }>;
  fetchDriverById: (
    id: string,
    params?: FetchDriverBookingsParams
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  fetchDriverBookings: (
    id: string,
    params?: FetchDriverBookingsParams
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  updateDriverStatus: (id: string, newStatus: string) => Promise<{ success: boolean; error?: string }>;
  updateDriver: (id: string, payload: any) => Promise<{ success: boolean; error?: string }>;
}

export const useDriverStore = create<DriverStoreState>((set, get) => ({
  drivers: [],
  selectedDriverId: null,
  currentDriver: null,
  driverStats: null,
  driverBookings: [],
  bookingsPagination: null,
  isLoading: false,
  isBookingsLoading: false,
  isUpdating: false,
  error: null,
  pagination: null,
  counts: null,
  tripFilter: 'all',
  currentBookingPage: 1,

  setSelectedDriverId: (id: string | null) => set({ selectedDriverId: id }),
  setTripFilter: (filter: 'all' | 'completed' | 'active' | 'cancelled') => set({ tripFilter: filter, currentBookingPage: 1 }),
  setCurrentBookingPage: (page: number) => set({ currentBookingPage: page }),
  clearCurrentDriver: () => set({ currentDriver: null, driverStats: null, driverBookings: [], bookingsPagination: null }),
  clearError: () => set({ error: null }),

  fetchDrivers: async (params?: FetchDriversParams) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', String(params.page));
      if (params?.limit) queryParams.append('limit', String(params.limit));
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status && params.status !== 'all' && params.status !== 'All') {
        queryParams.append('status', params.status);
      }

      const res = await fetch(`/api/admin/drivers?${queryParams.toString()}`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const rawList = Array.isArray(json.data.drivers)
          ? json.data.drivers
          : Array.isArray(json.data)
            ? json.data
            : [];
        const list = rawList.map(formatDriver);
        const counts = json.data?.counts || null;
        const pagination = json.data?.pagination || json.pagination || null;
        set({
          drivers: list,
          counts,
          pagination,
          isLoading: false,
        });
        return { success: true, data: list, counts, pagination };
      }
      set({ isLoading: false, error: json.error || 'Failed to fetch drivers' });
      return { success: false, error: json.error };
    } catch (e: any) {
      set({ isLoading: false, error: e.message || 'Error fetching drivers' });
      return { success: false, error: e.message };
    }
  },

  fetchDriverById: async (id: string, params?: FetchDriverBookingsParams) => {
    set({ isLoading: true, error: null });
    try {
      const tripFilter = params?.tripFilter ?? get().tripFilter;
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 5;
      const search = params?.search ?? '';

      const queryParams = new URLSearchParams();
      if (tripFilter && tripFilter !== 'all') queryParams.append('tripFilter', tripFilter);
      queryParams.append('page', String(page));
      queryParams.append('limit', String(limit));
      if (search) queryParams.append('search', search);

      const res = await fetch(`/api/admin/drivers/${id}?${queryParams.toString()}`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const formatted = formatDriver(json.data.driver);
        set({
          currentDriver: formatted,
          driverStats: json.data.stats || null,
          driverBookings: json.data.bookings || [],
          bookingsPagination: json.data.pagination || null,
          isLoading: false,
        });

        // Also sync into useRentalStore
        try {
          useRentalStore.setState((state) => ({
            drivers: state.drivers.some((d) => d.id === formatted.id)
              ? state.drivers.map((d) => (d.id === formatted.id ? formatted : d))
              : [...state.drivers, formatted],
          }));
        } catch (_) { }

        return { success: true, data: json.data };
      }
      set({ isLoading: false, error: json.error || 'Driver not found' });
      return { success: false, error: json.error };
    } catch (e: any) {
      set({ isLoading: false, error: e.message || 'Error loading driver details' });
      return { success: false, error: e.message };
    }
  },

  fetchDriverBookings: async (id: string, params?: FetchDriverBookingsParams) => {
    set({ isBookingsLoading: true });
    try {
      const tripFilter = params?.tripFilter ?? get().tripFilter;
      const page = params?.page ?? get().currentBookingPage;
      const limit = params?.limit ?? (get().bookingsPagination?.limit || 5);
      const search = params?.search ?? '';

      const queryParams = new URLSearchParams();
      if (tripFilter && tripFilter !== 'all') queryParams.append('tripFilter', tripFilter);
      queryParams.append('page', String(page));
      queryParams.append('limit', String(limit));
      if (search) queryParams.append('search', search);

      const res = await fetch(`/api/admin/drivers/${id}?${queryParams.toString()}`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success && json.data) {
        set({
          driverBookings: json.data.bookings || [],
          bookingsPagination: json.data.pagination || null,
          isBookingsLoading: false,
        });
        return { success: true, data: json.data };
      }
      set({ isBookingsLoading: false });
      return { success: false, error: json.error };
    } catch (e: any) {
      set({ isBookingsLoading: false });
      return { success: false, error: e.message };
    }
  },

  updateDriverStatus: async (id: string, newStatus: string) => {
    set({ isUpdating: true });
    try {
      const dbStatus = newStatus === 'Approved' ? 'verified' : newStatus.toLowerCase();
      const res = await fetch(`/api/admin/drivers/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: dbStatus }),
      });
      const json = await res.json();
      if (json.success) {
        set((state) => ({
          isUpdating: false,
          currentDriver: state.currentDriver ? { ...state.currentDriver, status: newStatus } : null,
          drivers: state.drivers.map((d) => (d.id === id ? { ...d, status: newStatus as any } : d)),
        }));

        try {
          useRentalStore.setState((state) => ({
            drivers: state.drivers.map((d) => (d.id === id ? { ...d, status: newStatus as any } : d)),
          }));
        } catch (_) { }

        return { success: true };
      }
      set({ isUpdating: false });
      return { success: false, error: json.error };
    } catch (e: any) {
      set({ isUpdating: false });
      return { success: false, error: e.message };
    }
  },

  updateDriver: async (id: string, payload: any) => {
    set({ isUpdating: true });
    try {
      const res = await fetch(`/api/admin/drivers/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success && json.data?.driver) {
        const formatted = formatDriver(json.data.driver);
        set((state) => ({
          isUpdating: false,
          currentDriver: formatted,
          drivers: state.drivers.map((d) => (d.id === id ? formatted : d)),
        }));
        return { success: true };
      }
      set({ isUpdating: false });
      return { success: false, error: json.error };
    } catch (e: any) {
      set({ isUpdating: false });
      return { success: false, error: e.message };
    }
  },
}));
