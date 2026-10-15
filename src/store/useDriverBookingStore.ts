import { create } from 'zustand';
import { DriverBooking, DriverBookingStatus, Driver } from '@/types';
import { useRentalStore } from './useRentalStore';

export interface DriverBookingCounts {
  total: number;
  pending: number;
  active: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
}

export interface DriverBookingPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FetchDriverBookingsParams {
  page?: number;
  limit?: number;
  status?: string;
  serviceType?: string;
  paymentStatus?: string;
  search?: string;
  driverId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface DriverOption {
  id: string;
  name: string;
  phone: string;
  rating: number;
  avatar: string;
  status: string;
  dutyStatus: string;
  planName?: string;
}

function getAuthHeaders(): HeadersInit {
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

export function mapBackendBookingToFrontend(b: any): DriverBooking {
  const customer = b.userdetails || (typeof b.userId === 'object' ? b.userId : null) || {};
  const driver = b.driverdetails || (typeof b.driverId === 'object' ? b.driverId : null) || {};

  const customerName =
    b.customerName ||
    [customer.firstName, customer.lastName].filter(Boolean).join(' ') ||
    'Customer';

  const driverName =
    b.driverName ||
    [driver.firstName, driver.lastName].filter(Boolean).join(' ') ||
    (b.driverId && typeof b.driverId === 'string' ? `Driver (${b.driverId.slice(-4)})` : undefined);

  // Status mapping
  const statusMap: Record<string, DriverBookingStatus> = {
    pending: 'Pending',
    confirmed: 'Searching Driver',
    searching_driver: 'Searching Driver',
    driver_assigned: 'Driver Assigned',
    driver_arriving: 'Driver Arriving',
    driver_arrived: 'Driver Arriving',
    trip_started: 'Service Started',
    trip_completed: 'Completed',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_driver_found: 'No Driver Found',
  };

  const rawStatus = (b.bookingStatus || b.status || 'pending').toLowerCase();
  const status: DriverBookingStatus = statusMap[rawStatus] || (b.status as DriverBookingStatus) || 'Pending';

  const scheduledDate = b.scheduledStartTime ? new Date(b.scheduledStartTime) : new Date(b.createdAt || Date.now());
  const bookingDate = !isNaN(scheduledDate.getTime())
    ? scheduledDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'N/A';
  const bookingTime = !isNaN(scheduledDate.getTime())
    ? scheduledDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : 'N/A';

  const pickupLoc =
    typeof b.pickupLocation === 'string'
      ? b.pickupLocation
      : b.pickupLocation?.address || 'Pickup Point';

  const dropLoc =
    typeof b.dropLocation === 'string'
      ? b.dropLocation
      : b.dropLocation?.address || b.destinationLocation || 'Destination';

  const totalAmount = b.totalAmount ?? b.pricing?.totalCustomerAmount ?? 0;
  const baseAmount = b.baseAmount ?? b.pricing?.baseAmount ?? 0;
  const driverEarnings = b.driverFee ?? b.pricing?.driverEarnings ?? Math.round(totalAmount * 0.8);
  const platformCommission = b.platformFee ?? b.pricing?.platformCommission ?? Math.max(0, totalAmount - driverEarnings);

  return {
    id: b._id?.toString() || b.id || b.bookingId,
    _id: b._id?.toString(),
    bookingNumber: b.bookingId || b.bookingNumber || `BKG-${b._id?.toString()?.slice(-6) || '000000'}`,
    bookingId: b.bookingId,
    customerName,
    customerEmail: customer.email || b.customerEmail || '',
    customerPhone: customer.phone || b.customerPhone || '',
    customerAvatar: customer.avatar || customer.profileImage || b.customerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    bookingType: b.serviceType?.toLowerCase() === 'outstation' ? 'Outstation' : (b.bookingType || 'Local'),
    pickupLocation: pickupLoc,
    destinationLocation: dropLoc,
    bookingDate,
    bookingTime,
    durationHours: b.durationHours || (b.durationDays ? b.durationDays * 24 : 4),
    vehicleInfo: {
      type: b.vehicleType || b.vehicleInfo?.type || 'Sedan',
      model: b.vehicleNumber ? `${b.vehicleType || 'Vehicle'} (${b.vehicleNumber})` : (b.vehicleInfo?.model || 'Customer Vehicle'),
      plateNumber: b.vehicleNumber || b.vehicleInfo?.plateNumber || 'N/A',
      fuelType: b.vehicleInfo?.fuelType || 'Petrol',
      transmission: b.transmission || b.vehicleInfo?.transmission || 'Manual',
    },
    status,
    rawBookingStatus: b.bookingStatus,
    paymentStatus: b.paymentStatus || 'Pending',
    driverId: driver._id?.toString() || (typeof b.driverId === 'string' ? b.driverId : undefined),
    driverName,
    driverPhone: driver.phone || b.driverPhone || '',
    driverRating: driver.rating || b.driverRating || 4.8,
    driverAvatar: driver.profilePicture || b.driverAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    pricing: {
      baseAmount,
      durationCharge: b.pricing?.durationCharge || 0,
      typeCharge: b.pricing?.typeCharge || 0,
      extraCharges: b.extraKmAmount || b.pricing?.extraCharges || 0,
      discount: b.discountAmount || b.pricing?.discount || 0,
      tax: b.taxAmount || b.pricing?.tax || 0,
      totalCustomerAmount: totalAmount,
      driverEarnings,
      platformCommission,
    },
    timeline: {
      created: b.createdAt ? new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (b.timeline?.created || '10:00 AM'),
      searching: b.timeline?.searching,
      accepted: b.timeline?.accepted,
      assigned: b.driverId ? (b.updatedAt ? new Date(b.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Assigned') : undefined,
      arrived: b.timeline?.arrived,
      started: b.tripStartedAt ? new Date(b.tripStartedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : b.timeline?.started,
      completed: b.tripCompletedAt ? new Date(b.tripCompletedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : b.timeline?.completed,
    },
    cancellationReason: b.cancellationReason,
    adminNotes: b.adminNotes,
    userNotes: b.userNotes,
  };
}

interface DriverBookingStoreState {
  driverBookings: DriverBooking[];
  selectedBooking: DriverBooking | null;
  counts: DriverBookingCounts | null;
  pagination: DriverBookingPagination | null;
  availableDrivers: DriverOption[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  clearError: () => void;
  setSelectedBooking: (booking: DriverBooking | null) => void;
  fetchDriverBookings: (
    params?: FetchDriverBookingsParams,
    quiet?: boolean
  ) => Promise<{ success: boolean; data?: DriverBooking[]; error?: string }>;
  fetchDriverBookingById: (
    id: string
  ) => Promise<{ success: boolean; data?: DriverBooking; error?: string }>;
  fetchAvailableDrivers: () => Promise<DriverOption[]>;
  assignDriverToBooking: (
    bookingId: string,
    driverId: string,
    adminNotes?: string
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  updateDriverBookingStatus: (
    bookingId: string,
    status: string,
    notes?: string
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  cancelDriverBooking: (
    bookingId: string,
    cancellationReason?: string
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
}

export const useDriverBookingStore = create<DriverBookingStoreState>((set, get) => ({
  driverBookings: [],
  selectedBooking: null,
  counts: null,
  pagination: null,
  availableDrivers: [],
  isLoading: false,
  isSubmitting: false,
  error: null,

  clearError: () => set({ error: null }),
  setSelectedBooking: (booking) => set({ selectedBooking: booking }),

  fetchDriverBookings: async (params, quiet = false) => {
    if (!quiet) set({ isLoading: true, error: null });

    try {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', String(params.page));
      if (params?.limit) query.append('limit', String(params.limit));
      if (params?.search) query.append('search', params.search);
      if (params?.serviceType && params.serviceType !== 'All') {
        query.append('serviceType', params.serviceType.toLowerCase());
      }
      if (params?.status && params.status !== 'All') {
        // Map frontend status label to backend status code if needed
        const statusMapToBackend: Record<string, string> = {
          Pending: 'pending',
          'Searching Driver': 'confirmed',
          'Driver Assigned': 'driver_assigned',
          'Driver Arriving': 'driver_arriving',
          'Service Started': 'trip_started',
          Completed: 'trip_completed',
          Cancelled: 'cancelled',
        };
        const backendStatus = statusMapToBackend[params.status] || params.status.toLowerCase();
        query.append('status', backendStatus);
      }
      if (params?.paymentStatus && params.paymentStatus !== 'All') {
        query.append('paymentStatus', params.paymentStatus.toLowerCase());
      }
      if (params?.driverId) query.append('driverId', params.driverId);
      if (params?.userId) query.append('userId', params.userId);
      if (params?.startDate) query.append('startDate', params.startDate);
      if (params?.endDate) query.append('endDate', params.endDate);

      const res = await fetch(`/api/admin/driver-bookings?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();

      if (res.ok && json.success && Array.isArray(json.data)) {
        const mappedBookings = json.data.map(mapBackendBookingToFrontend);

        set({
          driverBookings: mappedBookings,
          counts: json.counts || null,
          pagination: json.pagination || null,
          isLoading: false,
          error: null,
        });

        // Sync with useRentalStore so other components remain in sync
        useRentalStore.setState({ driverBookings: mappedBookings, bookings: mappedBookings });

        return { success: true, data: mappedBookings };
      } else {
        const errMsg = json.error || 'Failed to fetch driver bookings';
        set({ isLoading: false, error: errMsg });
        return { success: false, error: errMsg };
      }
    } catch (err: any) {
      const errMsg = err.message || 'Network error fetching driver bookings';
      set({ isLoading: false, error: errMsg });
      return { success: false, error: errMsg };
    }
  },

  fetchDriverBookingById: async (id: string) => {
    try {
      const res = await fetch(`/api/admin/driver-bookings/${id}`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();

      if (res.ok && json.success && json.data) {
        const mapped = mapBackendBookingToFrontend(json.data);
        set({ selectedBooking: mapped });
        return { success: true, data: mapped };
      } else {
        return { success: false, error: json.error || 'Booking not found' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Error fetching booking details' };
    }
  },

  fetchAvailableDrivers: async () => {
    try {
      const res = await fetch('/api/admin/drivers?limit=100', {
        headers: getAuthHeaders(),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        const rawDrivers = json.data?.drivers || json.data || [];
        const mapped: DriverOption[] = rawDrivers.map((d: any) => ({
          id: d._id?.toString() || d.id || d.driverId,
          name: [d.firstName, d.lastName].filter(Boolean).join(' ') || d.name || 'Driver',
          phone: d.phone || '',
          rating: d.rating || 4.8,
          avatar: d.profilePicture || d.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
          status: d.status || 'Active',
          dutyStatus: d.isOnline ? 'Online' : 'Offline',
          planName: d.subscription?.planName || 'Active Pass',
        }));

        set({ availableDrivers: mapped });
        return mapped;
      }
      return [];
    } catch {
      return [];
    }
  },

  assignDriverToBooking: async (bookingId: string, driverId: string, adminNotes?: string) => {
    set({ isSubmitting: true, error: null });

    try {
      const res = await fetch(`/api/admin/driver-bookings/${bookingId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          driverId,
          adminNotes: adminNotes || 'Driver manually assigned by admin',
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        const updated = mapBackendBookingToFrontend(json.data);

        // Update local state
        set((state) => {
          const updatedList = state.driverBookings.map((b) =>
            b.id === bookingId || b.bookingNumber === bookingId ? updated : b
          );
          return {
            driverBookings: updatedList,
            selectedBooking: state.selectedBooking?.id === bookingId ? updated : state.selectedBooking,
            isSubmitting: false,
          };
        });

        // Sync with useRentalStore
        const currentList = get().driverBookings;
        useRentalStore.setState({ driverBookings: currentList, bookings: currentList });

        // Refresh counts in background
        get().fetchDriverBookings({}, true);

        return { success: true, message: json.message || 'Driver assigned successfully' };
      } else {
        const errMsg = json.error || 'Failed to assign driver';
        set({ isSubmitting: false, error: errMsg });
        return { success: false, error: errMsg };
      }
    } catch (err: any) {
      const errMsg = err.message || 'Network error assigning driver';
      set({ isSubmitting: false, error: errMsg });
      return { success: false, error: errMsg };
    }
  },

  updateDriverBookingStatus: async (bookingId: string, status: string, notes?: string) => {
    set({ isSubmitting: true, error: null });

    try {
      const res = await fetch(`/api/admin/driver-bookings/${bookingId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          bookingStatus: status,
          adminNotes: notes,
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        const updated = mapBackendBookingToFrontend(json.data);

        set((state) => {
          const updatedList = state.driverBookings.map((b) =>
            b.id === bookingId || b.bookingNumber === bookingId ? updated : b
          );
          return {
            driverBookings: updatedList,
            selectedBooking: state.selectedBooking?.id === bookingId ? updated : state.selectedBooking,
            isSubmitting: false,
          };
        });

        const currentList = get().driverBookings;
        useRentalStore.setState({ driverBookings: currentList, bookings: currentList });
        get().fetchDriverBookings({}, true);

        return { success: true, message: json.message || 'Status updated successfully' };
      } else {
        const errMsg = json.error || 'Failed to update status';
        set({ isSubmitting: false, error: errMsg });
        return { success: false, error: errMsg };
      }
    } catch (err: any) {
      const errMsg = err.message || 'Network error updating status';
      set({ isSubmitting: false, error: errMsg });
      return { success: false, error: errMsg };
    }
  },

  cancelDriverBooking: async (bookingId: string, cancellationReason?: string) => {
    set({ isSubmitting: true, error: null });

    try {
      const res = await fetch(`/api/admin/driver-bookings/${bookingId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          bookingStatus: 'cancelled',
          cancellationReason: cancellationReason || 'Cancelled by Admin',
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        const updated = mapBackendBookingToFrontend(json.data);

        set((state) => {
          const updatedList = state.driverBookings.map((b) =>
            b.id === bookingId || b.bookingNumber === bookingId ? updated : b
          );
          return {
            driverBookings: updatedList,
            selectedBooking: state.selectedBooking?.id === bookingId ? updated : state.selectedBooking,
            isSubmitting: false,
          };
        });

        const currentList = get().driverBookings;
        useRentalStore.setState({ driverBookings: currentList, bookings: currentList });
        get().fetchDriverBookings({}, true);

        return { success: true, message: json.message || 'Booking cancelled successfully' };
      } else {
        const errMsg = json.error || 'Failed to cancel booking';
        set({ isSubmitting: false, error: errMsg });
        return { success: false, error: errMsg };
      }
    } catch (err: any) {
      const errMsg = err.message || 'Network error cancelling booking';
      set({ isSubmitting: false, error: errMsg });
      return { success: false, error: errMsg };
    }
  },
}));
