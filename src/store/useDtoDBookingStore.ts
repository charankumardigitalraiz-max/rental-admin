import { create } from 'zustand';

export interface DtoDDriverInfo {
  _id?: string;
  driverId?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  email?: string;
  profilePicture?: string;
  avatar?: string;
  rating?: number;
  status?: string;
}

export interface DtoDCustomerInfo {
  _id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  email?: string;
  custId?: string;
  avatar?: string;
}

export interface DtoDBooking {
  id: string;
  bookingNumber: string;
  bookingId: string;
  
  // Source Driver
  sourceDriverId?: string;
  sourceDriver?: DtoDDriverInfo;
  
  // Fulfilling Driver
  driverId?: string;
  driver?: DtoDDriverInfo;
  
  // Customer (optional)
  userId?: string;
  customer?: DtoDCustomerInfo;
  
  // Original Customer Booking (if delegated / handed off)
  driverBookingId?: string;
  linkedBooking?: {
    bookingId?: string;
    serviceType?: string;
    tripType?: string;
    bookingStatus?: string;
    totalAmount?: number;
  };
  
  serviceType: 'local' | 'outstation' | string;
  tripType: 'one_way' | 'round_trip' | string;
  bookingMode: 'now' | 'scheduled' | string;
  
  scheduledStartTime: string;
  bookingDate: string;
  bookingTime: string;
  
  durationHours?: number;
  durationDays?: number;
  
  pickupLocation: string;
  dropLocation: string;
  
  vehicleInfo: {
    type: string;
    transmission: string;
    vehicleNumber: string;
  };
  
  pricing: {
    baseAmount: number;
    extraKmAmount: number;
    driverAllowance: number;
    driverFee: number;
    platformFee: number; // Always 0
    taxAmount: number;
    totalAmount: number;
  };
  
  paymentMethod: string;
  paymentStatus: string;
  bookingStatus: string;
  status: string;
  
  timings?: {
    driverAssignedAt?: string | null;
    driverArrivedAt?: string | null;
    tripStartedAt?: string | null;
    tripCompletedAt?: string | null;
  };
  driverAssignedAt?: string | null;
  driverArrivedAt?: string | null;
  tripStartedAt?: string | null;
  tripCompletedAt?: string | null;
  startOtp?: string;
  
  adminNotes?: string;
  driverNotes?: string;
  userNotes?: string;
  
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  createdAt: string;
}

export interface DtoDBookingCounts {
  total: number;
  pending: number;
  active: number;
  completed: number;
  cancelled: number;
  totalVolume: number;
}

export interface DtoDPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FetchDtoDBookingsParams {
  page?: number;
  limit?: number;
  status?: string;
  serviceType?: string;
  paymentStatus?: string;
  search?: string;
  sourceDriverId?: string;
  driverId?: string;
  startDate?: string;
  endDate?: string;
}

export interface AvailableDriverOption {
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

export function mapBackendDtoDToFrontend(b: any): DtoDBooking {
  const sourceDriverRaw = b.sourcedriverdetails || (typeof b.sourceDriverId === 'object' ? b.sourceDriverId : null);
  const assignedDriverRaw = b.driverdetails || (typeof b.driverId === 'object' ? b.driverId : null);
  const customerRaw = b.userdetails || (typeof b.userId === 'object' ? b.userId : null);

  const sourceDriverName = sourceDriverRaw
    ? [sourceDriverRaw.firstName, sourceDriverRaw.lastName].filter(Boolean).join(' ') || 'Source Driver'
    : 'Unknown Driver';

  const assignedDriverName = assignedDriverRaw
    ? [assignedDriverRaw.firstName, assignedDriverRaw.lastName].filter(Boolean).join(' ') || 'Assigned Driver'
    : undefined;

  const scheduledDate = b.scheduledStartTime ? new Date(b.scheduledStartTime) : new Date(b.createdAt || Date.now());
  const bookingDate = !isNaN(scheduledDate.getTime())
    ? scheduledDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'N/A';
  const bookingTime = !isNaN(scheduledDate.getTime())
    ? scheduledDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    : 'N/A';

  return {
    id: b._id?.toString() || b.bookingId,
    bookingNumber: b.bookingId,
    bookingId: b.bookingId,
    
    sourceDriverId: b.sourceDriverId?._id?.toString() || b.sourceDriverId?.toString(),
    sourceDriver: sourceDriverRaw
      ? {
          _id: sourceDriverRaw._id?.toString(),
          driverId: sourceDriverRaw.driverId,
          firstName: sourceDriverRaw.firstName,
          lastName: sourceDriverRaw.lastName,
          name: sourceDriverName,
          phone: sourceDriverRaw.phone,
          email: sourceDriverRaw.email,
          avatar: sourceDriverRaw.profilePicture,
          rating: sourceDriverRaw.rating,
          status: sourceDriverRaw.status,
        }
      : undefined,

    driverId: b.driverId?._id?.toString() || b.driverId?.toString(),
    driver: assignedDriverRaw
      ? {
          _id: assignedDriverRaw._id?.toString(),
          driverId: assignedDriverRaw.driverId,
          firstName: assignedDriverRaw.firstName,
          lastName: assignedDriverRaw.lastName,
          name: assignedDriverName,
          phone: assignedDriverRaw.phone,
          email: assignedDriverRaw.email,
          avatar: assignedDriverRaw.profilePicture,
          rating: assignedDriverRaw.rating,
          status: assignedDriverRaw.status,
        }
      : undefined,

    userId: b.userId?._id?.toString() || b.userId?.toString(),
    customer: customerRaw
      ? {
          _id: customerRaw._id?.toString(),
          firstName: customerRaw.firstName,
          lastName: customerRaw.lastName,
          name: [customerRaw.firstName, customerRaw.lastName].filter(Boolean).join(' '),
          phone: customerRaw.phone,
          email: customerRaw.email,
          custId: customerRaw.custId,
          avatar: customerRaw.avatar,
        }
      : undefined,

    driverBookingId: b.driverBookingId?._id?.toString() || b.driverBookingId?.toString(),
    linkedBooking: b.linkedbookingdetails
      ? {
          bookingId: b.linkedbookingdetails.bookingId,
          serviceType: b.linkedbookingdetails.serviceType,
          tripType: b.linkedbookingdetails.tripType,
          bookingStatus: b.linkedbookingdetails.bookingStatus,
          totalAmount: b.linkedbookingdetails.totalAmount,
        }
      : undefined,

    serviceType: b.serviceType || 'local',
    tripType: b.tripType || 'one_way',
    bookingMode: b.bookingMode || 'scheduled',
    scheduledStartTime: b.scheduledStartTime,
    bookingDate,
    bookingTime,
    durationHours: b.durationHours || 0,
    durationDays: b.durationDays || 0,
    
    pickupLocation: b.pickupLocation?.address || 'Pickup Point',
    dropLocation: b.dropLocation?.address || 'Drop Point',

    vehicleInfo: {
      type: b.vehicleType || 'sedan',
      transmission: b.transmission || 'manual',
      vehicleNumber: b.vehicleNumber || 'Unassigned',
    },

    pricing: {
      baseAmount: b.baseAmount || 0,
      extraKmAmount: b.extraKmAmount || 0,
      driverAllowance: b.driverAllowance || 0,
      driverFee: b.driverFee || 0,
      platformFee: 0, // Strict zero fee for D-to-D
      taxAmount: b.taxAmount || 0,
      totalAmount: b.totalAmount || 0,
    },

    paymentMethod: b.paymentMethod || 'cash',
    paymentStatus: b.paymentStatus || 'pending',
    bookingStatus: b.bookingStatus || 'pending',
    status: b.bookingStatus || 'pending',

    timings: {
      driverAssignedAt: (b.timings?.driverAssignedAt || b.driverAssignedAt)
        ? new Date(b.timings?.driverAssignedAt || b.driverAssignedAt).toISOString()
        : null,
      driverArrivedAt: (b.timings?.driverArrivedAt || b.driverArrivedAt)
        ? new Date(b.timings?.driverArrivedAt || b.driverArrivedAt).toISOString()
        : null,
      tripStartedAt: (b.timings?.tripStartedAt || b.tripStartedAt)
        ? new Date(b.timings?.tripStartedAt || b.tripStartedAt).toISOString()
        : null,
      tripCompletedAt: (b.timings?.tripCompletedAt || b.tripCompletedAt)
        ? new Date(b.timings?.tripCompletedAt || b.tripCompletedAt).toISOString()
        : null,
    },

    driverAssignedAt: (b.timings?.driverAssignedAt || b.driverAssignedAt)
      ? new Date(b.timings?.driverAssignedAt || b.driverAssignedAt).toISOString()
      : null,
    driverArrivedAt: (b.timings?.driverArrivedAt || b.driverArrivedAt)
      ? new Date(b.timings?.driverArrivedAt || b.driverArrivedAt).toISOString()
      : null,
    tripStartedAt: (b.timings?.tripStartedAt || b.tripStartedAt)
      ? new Date(b.timings?.tripStartedAt || b.tripStartedAt).toISOString()
      : null,
    tripCompletedAt: (b.timings?.tripCompletedAt || b.tripCompletedAt)
      ? new Date(b.timings?.tripCompletedAt || b.tripCompletedAt).toISOString()
      : null,
    startOtp: b.startOtp || '',

    adminNotes: b.adminNotes || '',
    driverNotes: b.driverNotes || '',
    userNotes: b.userNotes || '',

    cancellationReason: b.cancellationReason || '',
    cancelledBy: b.cancelledBy || null,
    cancelledAt: b.cancelledAt || null,
    createdAt: b.createdAt || new Date().toISOString(),
  };
}

interface DtoDBookingStoreState {
  bookings: DtoDBooking[];
  selectedBooking: DtoDBooking | null;
  counts: DtoDBookingCounts | null;
  pagination: DtoDPagination | null;
  availableDrivers: AvailableDriverOption[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  clearError: () => void;
  setSelectedBooking: (booking: DtoDBooking | null) => void;
  fetchBookings: (
    params?: FetchDtoDBookingsParams,
    quiet?: boolean
  ) => Promise<{ success: boolean; data?: DtoDBooking[]; error?: string }>;
  fetchBookingById: (
    id: string
  ) => Promise<{ success: boolean; data?: DtoDBooking; error?: string }>;
  fetchAvailableDrivers: () => Promise<AvailableDriverOption[]>;
  assignDriverToBooking: (
    bookingId: string,
    driverId: string,
    adminNotes?: string
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  updateBookingStatus: (
    bookingId: string,
    status: string,
    notes?: string
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  cancelBooking: (
    bookingId: string,
    cancellationReason?: string
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  createBooking: (
    payload: any
  ) => Promise<{ success: boolean; data?: DtoDBooking; message?: string; error?: string }>;
}

export const useDtoDBookingStore = create<DtoDBookingStoreState>((set, get) => ({
  bookings: [],
  selectedBooking: null,
  counts: null,
  pagination: null,
  availableDrivers: [],
  isLoading: false,
  isSubmitting: false,
  error: null,

  clearError: () => set({ error: null }),
  setSelectedBooking: (booking) => set({ selectedBooking: booking }),

  fetchBookings: async (params?: FetchDtoDBookingsParams, quiet = false) => {
    if (!quiet) set({ isLoading: true, error: null });

    try {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());
      if (params?.status && params.status !== 'All') query.set('status', params.status);
      if (params?.serviceType && params.serviceType !== 'All') query.set('serviceType', params.serviceType);
      if (params?.paymentStatus && params.paymentStatus !== 'All') query.set('paymentStatus', params.paymentStatus);
      if (params?.search) query.set('search', params.search);
      if (params?.sourceDriverId) query.set('sourceDriverId', params.sourceDriverId);
      if (params?.driverId) query.set('driverId', params.driverId);
      if (params?.startDate) query.set('startDate', params.startDate);
      if (params?.endDate) query.set('endDate', params.endDate);

      const res = await fetch(`/api/admin/d-to-d-bookings?${query.toString()}`, {
        headers: getAuthHeaders(),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        const mappedList: DtoDBooking[] = (json.data || []).map(mapBackendDtoDToFrontend);

        set({
          bookings: mappedList,
          counts: json.counts || null,
          pagination: json.pagination || null,
          isLoading: false,
        });

        return { success: true, data: mappedList };
      } else {
        const errMsg = json.error || 'Failed to fetch D-to-D bookings';
        set({ error: errMsg, isLoading: false });
        return { success: false, error: errMsg };
      }
    } catch (err: any) {
      const errMsg = err.message || 'Network error fetching D-to-D bookings';
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
    }
  },

  fetchBookingById: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const res = await fetch(`/api/admin/d-to-d-bookings/${id}`, {
        headers: getAuthHeaders(),
      });

      const json = await res.json();

      if (res.ok && json.success && json.data) {
        const mapped = mapBackendDtoDToFrontend(json.data);
        set({ selectedBooking: mapped, isLoading: false });
        return { success: true, data: mapped };
      } else {
        const errMsg = json.error || 'Booking not found';
        set({ error: errMsg, isLoading: false });
        return { success: false, error: errMsg };
      }
    } catch (err: any) {
      const errMsg = err.message || 'Network error loading booking details';
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
    }
  },

  fetchAvailableDrivers: async () => {
    try {
      const res = await fetch('/api/admin/drivers?limit=100&status=Approved', {
        headers: getAuthHeaders(),
      });
      const json = await res.json();

      if (res.ok && (json.success || json.drivers)) {
        const list = json.drivers || json.data || [];
        const mapped: AvailableDriverOption[] = list.map((d: any) => ({
          id: d._id?.toString() || d.id,
          name: [d.firstName, d.lastName].filter(Boolean).join(' ') || d.name || 'Driver',
          phone: d.phone || d.mobile || 'N/A',
          rating: Number(d.rating) || 5.0,
          avatar: d.profilePicture || d.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
          status: d.status || 'Active',
          dutyStatus: d.isOnline ? 'Online' : 'Offline',
          planName: d.subscription?.planName || 'Active Driver',
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
      const res = await fetch(`/api/admin/d-to-d-bookings/${bookingId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          driverId,
          adminNotes: adminNotes || 'Driver manually assigned by admin',
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        const updated = mapBackendDtoDToFrontend(json.data);

        set((state) => {
          const updatedList = state.bookings.map((b) =>
            b.id === bookingId || b.bookingNumber === bookingId ? updated : b
          );
          return {
            bookings: updatedList,
            selectedBooking: state.selectedBooking?.id === bookingId ? updated : state.selectedBooking,
            isSubmitting: false,
          };
        });

        get().fetchBookings({}, true);
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

  updateBookingStatus: async (bookingId: string, status: string, notes?: string) => {
    set({ isSubmitting: true, error: null });

    try {
      const res = await fetch(`/api/admin/d-to-d-bookings/${bookingId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          bookingStatus: status,
          adminNotes: notes,
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        const updated = mapBackendDtoDToFrontend(json.data);

        set((state) => {
          const updatedList = state.bookings.map((b) =>
            b.id === bookingId || b.bookingNumber === bookingId ? updated : b
          );
          return {
            bookings: updatedList,
            selectedBooking: state.selectedBooking?.id === bookingId ? updated : state.selectedBooking,
            isSubmitting: false,
          };
        });

        get().fetchBookings({}, true);
        return { success: true, message: json.message || 'Status updated successfully' };
      } else {
        const errMsg = json.error || 'Failed to update booking status';
        set({ isSubmitting: false, error: errMsg });
        return { success: false, error: errMsg };
      }
    } catch (err: any) {
      const errMsg = err.message || 'Network error updating status';
      set({ isSubmitting: false, error: errMsg });
      return { success: false, error: errMsg };
    }
  },

  cancelBooking: async (bookingId: string, cancellationReason?: string) => {
    set({ isSubmitting: true, error: null });

    try {
      const res = await fetch(`/api/admin/d-to-d-bookings/${bookingId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          bookingStatus: 'cancelled',
          cancellationReason: cancellationReason || 'Cancelled by admin',
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        const updated = mapBackendDtoDToFrontend(json.data);

        set((state) => {
          const updatedList = state.bookings.map((b) =>
            b.id === bookingId || b.bookingNumber === bookingId ? updated : b
          );
          return {
            bookings: updatedList,
            selectedBooking: state.selectedBooking?.id === bookingId ? updated : state.selectedBooking,
            isSubmitting: false,
          };
        });

        get().fetchBookings({}, true);
        return { success: true, message: 'Booking cancelled successfully' };
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

  createBooking: async (payload: any) => {
    set({ isSubmitting: true, error: null });

    try {
      const res = await fetch('/api/admin/d-to-d-bookings', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        const newBooking = mapBackendDtoDToFrontend(json.data);

        set((state) => ({
          bookings: [newBooking, ...state.bookings],
          isSubmitting: false,
        }));

        get().fetchBookings({}, true);
        return { success: true, data: newBooking, message: json.message || 'D-to-D booking created' };
      } else {
        const errMsg = json.error || 'Failed to create booking';
        set({ isSubmitting: false, error: errMsg });
        return { success: false, error: errMsg };
      }
    } catch (err: any) {
      const errMsg = err.message || 'Network error creating D-to-D booking';
      set({ isSubmitting: false, error: errMsg });
      return { success: false, error: errMsg };
    }
  },
}));
