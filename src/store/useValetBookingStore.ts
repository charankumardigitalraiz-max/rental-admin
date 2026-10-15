import { create } from 'zustand';
import { ValetBooking, ValetBookingStatus, ValetStaff } from '@/types';
import { initialValetBookings, initialValetStaff } from '@/data/mockData';

export interface ValetBookingCounts {
  total: number;
  newRequests: number;
  pendingAssignment: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
}

export interface ValetBookingPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FetchValetBookingsParams {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateValetBookingPayload {
  eventName: string;
  eventType?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  venueName?: string;
  venueAddress?: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  hours?: number;
  person?: number;
  customerPrice?: number;
  driverPrice?: number;
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

export function mapBackendValetBooking(b: any): ValetBooking {
  const customer = b.customer || b.userdetails || (typeof b.userId === 'object' ? b.userId : {}) || {};
  const customerName =
    [customer.firstName, customer.lastName].filter(Boolean).join(' ') ||
    b.customerName ||
    'Corporate Client';

  const assignedStaff = Array.isArray(b.assignedStaff) ? b.assignedStaff : [];
  const assignedStaffNames = assignedStaff.map(
    (s: any) => [s.firstName, s.lastName].filter(Boolean).join(' ') || s.name || 'Staff'
  );
  const assignedStaffIds = (b.assignedStaffIds || []).map((id: any) =>
    typeof id === 'string' ? id : id?._id?.toString() || id?.toString()
  );

  const statusMap: Record<string, ValetBookingStatus> = {
    new_request: 'New Request',
    pending_assignment: 'Pending Assignment',
    partially_assigned: 'Partially Assigned',
    fully_assigned: 'Fully Assigned',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  const status: ValetBookingStatus =
    statusMap[b.status] || (b.status as ValetBookingStatus) || 'Pending Assignment';

  const totalAmount = b.pricing?.totalAmount ?? b.pricing?.customerPrice ?? 2000;
  const basePrice = b.pricing?.customerPrice ?? (totalAmount - (b.pricing?.taxAmount || 0));
  const driverPrice = b.pricing?.driverPrice ?? b.pricing?.staffPayoutTotal ?? 1400;
  const staffPayoutTotal = b.pricing?.staffPayoutTotal ?? driverPrice;
  const platformCommission =
    b.pricing?.platformCommission ?? Math.max(0, totalAmount - staffPayoutTotal);

  const assignedStaffDetails = assignedStaff.map((s: any) => ({
    id: s._id?.toString() || s.id || '',
    name: [s.firstName, s.lastName].filter(Boolean).join(' ') || s.name || 'Valet Attendant',
    phone: s.phone || '',
    driverId: s.driverId || '',
    avatar: s.profilePicture || '',
    rating: s.rating || 4.8,
  }));

  return {
    id: b._id?.toString() || b.id || b.bookingId,
    bookingNumber: b.bookingId || b.bookingNumber || `VLT-${(b._id || '').slice(-6)}`,
    customerName,
    customerPhone: customer.phone || b.customerPhone || 'N/A',
    customerEmail: customer.email || b.customerEmail || '',
    eventName: b.eventName || 'Valet Event',
    eventType: b.eventType || 'Corporate Event',
    venue: b.venueName || b.venue || b.location?.address || 'Venue',
    venueAddress: b.address || b.venueAddress || b.location?.address || 'Venue Location',
    eventDate: b.eventDate ? new Date(b.eventDate).toISOString().split('T')[0] : '',
    startTime: b.startTime || '18:00',
    endTime: b.endTime || '22:00',
    durationHours: b.hours || b.durationHours || 4,
    requiredStaffCount: b.person || b.requiredStaffCount || 2,
    assignedStaffIds,
    assignedStaffNames,
    assignedStaffDetails,
    status,
    paymentStatus: b.paymentStatus || 'pending',
    paymentMethod: b.paymentMethod || 'online',
    specialInstructions: b.specialInstructions || '',
    adminNotes: b.adminNotes || '',
    cancellationReason: b.cancellationReason || '',
    pricing: {
      pricePerStaff: Math.round(driverPrice / (b.person || b.requiredStaffCount || 1)),
      totalBaseAmount: basePrice,
      surgeAmount: 0,
      tax: b.pricing?.taxAmount || 0,
      totalAmount,
      staffPayoutTotal,
      platformCommission,
    },
    timeline: b.timeline || {
      created: b.createdAt || new Date().toISOString(),
    },
  };
}

interface ValetBookingStoreState {
  valetBookings: ValetBooking[];
  selectedValetBooking: ValetBooking | null;
  selectedValetBookingId: string | null;
  counts: ValetBookingCounts | null;
  pagination: ValetBookingPagination | null;
  isLoading: boolean;
  error: string | null;
  availableStaff: ValetStaff[];

  // Selectors
  setSelectedValetBookingId: (id: string | null) => void;
  setSelectedValetBooking: (booking: ValetBooking | null) => void;

  // Actions
  fetchValetBookings: (params?: FetchValetBookingsParams) => Promise<void>;
  fetchValetBookingById: (id: string) => Promise<ValetBooking | null>;
  createValetBooking: (payload: CreateValetBookingPayload) => Promise<ValetBooking | null>;
  updateValetBookingStatus: (id: string, status: ValetBookingStatus) => Promise<boolean>;
  assignStaffToBooking: (bookingId: string, staffId: string) => Promise<boolean>;
  removeStaffFromBooking: (bookingId: string, staffId: string) => Promise<boolean>;
}

export const useValetBookingStore = create<ValetBookingStoreState>((set, get) => ({
  valetBookings: [],
  selectedValetBooking: null,
  selectedValetBookingId: null,
  counts: null,
  pagination: null,
  isLoading: false,
  error: null,
  availableStaff: initialValetStaff,

  setSelectedValetBookingId: (id) => {
    const booking = id ? get().valetBookings.find((b) => b.id === id) || null : null;
    set({ selectedValetBookingId: id, selectedValetBooking: booking });
  },

  setSelectedValetBooking: (booking) => {
    set({ selectedValetBooking: booking, selectedValetBookingId: booking?.id || null });
  },

  fetchValetBookings: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const q = new URLSearchParams();
      if (params.page) q.set('page', params.page.toString());
      if (params.limit) q.set('limit', params.limit.toString());
      if (params.status && params.status !== 'All') q.set('status', params.status);
      if (params.paymentStatus && params.paymentStatus !== 'All') q.set('paymentStatus', params.paymentStatus);
      if (params.search) q.set('search', params.search);
      if (params.startDate) q.set('startDate', params.startDate);
      if (params.endDate) q.set('endDate', params.endDate);

      const res = await fetch(`/api/admin/valet-bookings?${q.toString()}`, {
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped = json.data.map(mapBackendValetBooking);
          set({
            valetBookings: mapped,
            counts: json.counts || null,
            pagination: json.pagination || null,
            isLoading: false,
          });
          return;
        }
      }

      set({ isLoading: false });
    } catch (err: any) {
      console.warn('Valet booking fetch error:', err);
      set({ error: err.message || 'Failed to fetch valet bookings', isLoading: false });
    }
  },

  fetchValetBookingById: async (id: string) => {
    try {
      const res = await fetch(`/api/admin/valet-bookings/${id}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const mapped = mapBackendValetBooking(json.data);
          set({ selectedValetBooking: mapped, selectedValetBookingId: mapped.id });
          return mapped;
        }
      }
    } catch (err) {
      console.warn('Error fetching valet booking by ID:', err);
    }
    const local = get().valetBookings.find((b) => b.id === id) || null;
    if (local) {
      set({ selectedValetBooking: local, selectedValetBookingId: local.id });
    }
    return local;
  },

  createValetBooking: async (payload: CreateValetBookingPayload) => {
    set({ isLoading: true });
    try {
      const body = {
        eventName: payload.eventName,
        eventType: payload.eventType || 'Corporate Event',
        eventDate: new Date(payload.eventDate),
        startTime: payload.startTime || '18:00',
        endTime: payload.endTime || '22:00',
        hours: payload.hours || 4,
        person: payload.person || 2,
        venueName: payload.venueName,
        address: payload.venueAddress,
        location: {
          type: 'Point',
          coordinates: [78.4867, 17.385],
          address: payload.venueAddress || '',
        },
        pricing: {
          customerPrice: payload.customerPrice || 2000,
          driverPrice: payload.driverPrice || 1400,
          totalAmount: payload.customerPrice || 2000,
          staffPayoutTotal: payload.driverPrice || 1400,
          platformCommission: Math.max(0, (payload.customerPrice || 2000) - (payload.driverPrice || 1400)),
        },
        customerName: payload.customerName,
        customerPhone: payload.customerPhone,
        customerEmail: payload.customerEmail,
        status: 'pending_assignment',
        paymentStatus: 'pending',
      };

      const res = await fetch('/api/admin/valet-bookings', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const mapped = mapBackendValetBooking(json.data);
          set((state) => ({
            valetBookings: [mapped, ...state.valetBookings],
            isLoading: false,
          }));
          return mapped;
        }
      }

      // Local fallback creation
      const localCreated: ValetBooking = {
        id: `vlt-${Date.now()}`,
        bookingNumber: `VLT-${Math.floor(100000 + Math.random() * 900000)}`,
        customerName: payload.customerName || 'Direct Booking',
        customerPhone: payload.customerPhone || 'N/A',
        customerEmail: payload.customerEmail || '',
        eventName: payload.eventName,
        eventType: payload.eventType || 'Corporate Event',
        venue: payload.venueName || 'Venue',
        venueAddress: payload.venueAddress || 'Venue Location',
        eventDate: payload.eventDate,
        startTime: payload.startTime || '18:00',
        endTime: payload.endTime || '22:00',
        durationHours: payload.hours || 4,
        requiredStaffCount: payload.person || 2,
        assignedStaffIds: [],
        assignedStaffNames: [],
        status: 'Pending Assignment',
        pricing: {
          pricePerStaff: Math.round((payload.driverPrice || 1400) / (payload.person || 2)),
          totalBaseAmount: payload.customerPrice || 2000,
          surgeAmount: 0,
          tax: 0,
          totalAmount: payload.customerPrice || 2000,
          staffPayoutTotal: payload.driverPrice || 1400,
          platformCommission: Math.max(0, (payload.customerPrice || 2000) - (payload.driverPrice || 1400)),
        },
        timeline: {
          created: new Date().toISOString(),
        },
      };

      set((state) => ({
        valetBookings: [localCreated, ...state.valetBookings],
        isLoading: false,
      }));
      return localCreated;
    } catch (err: any) {
      set({ error: err.message || 'Creation failed', isLoading: false });
      return null;
    }
  },

  updateValetBookingStatus: async (id: string, status: ValetBookingStatus) => {
    const backendStatusMap: Record<ValetBookingStatus, string> = {
      'New Request': 'new_request',
      'Pending Assignment': 'pending_assignment',
      'Partially Assigned': 'partially_assigned',
      'Fully Assigned': 'fully_assigned',
      'In Progress': 'in_progress',
      Completed: 'completed',
      Cancelled: 'cancelled',
    };

    try {
      await fetch(`/api/admin/valet-bookings/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: backendStatusMap[status] || status }),
      });
    } catch (err) {
      console.warn('Backend status update failed, applying locally:', err);
    }

    set((state) => ({
      valetBookings: state.valetBookings.map((b) => (b.id === id ? { ...b, status } : b)),
      selectedValetBooking:
        state.selectedValetBooking?.id === id
          ? { ...state.selectedValetBooking, status }
          : state.selectedValetBooking,
    }));
    return true;
  },

  assignStaffToBooking: async (bookingId: string, staffId: string) => {
    const state = get();
    const booking = state.valetBookings.find((b) => b.id === bookingId);
    if (!booking) return false;

    const staffMember = state.availableStaff.find((s) => s.id === staffId);
    const staffName = staffMember?.name || 'Valet Attendant';

    const updatedIds = [...booking.assignedStaffIds, staffId];
    const updatedNames = [...booking.assignedStaffNames, staffName];
    const newStatus: ValetBookingStatus =
      updatedIds.length >= booking.requiredStaffCount ? 'Fully Assigned' : 'Partially Assigned';

    try {
      await fetch(`/api/admin/valet-bookings/${bookingId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          assignedStaffIds: updatedIds,
          status: newStatus === 'Fully Assigned' ? 'fully_assigned' : 'partially_assigned',
        }),
      });
    } catch (err) {
      console.warn('Backend staff assignment failed, applying locally:', err);
    }

    set((s) => ({
      valetBookings: s.valetBookings.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              assignedStaffIds: updatedIds,
              assignedStaffNames: updatedNames,
              status: newStatus,
            }
          : b
      ),
      selectedValetBooking:
        s.selectedValetBooking?.id === bookingId
          ? {
              ...s.selectedValetBooking,
              assignedStaffIds: updatedIds,
              assignedStaffNames: updatedNames,
              status: newStatus,
            }
          : s.selectedValetBooking,
    }));
    return true;
  },

  removeStaffFromBooking: async (bookingId: string, staffId: string) => {
    const state = get();
    const booking = state.valetBookings.find((b) => b.id === bookingId);
    if (!booking) return false;

    const staffIdx = booking.assignedStaffIds.indexOf(staffId);
    const updatedIds = booking.assignedStaffIds.filter((id) => id !== staffId);
    const updatedNames = booking.assignedStaffNames.filter((_, idx) => idx !== staffIdx);
    const newStatus: ValetBookingStatus =
      updatedIds.length === 0 ? 'Pending Assignment' : 'Partially Assigned';

    try {
      await fetch(`/api/admin/valet-bookings/${bookingId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          assignedStaffIds: updatedIds,
          status: updatedIds.length === 0 ? 'pending_assignment' : 'partially_assigned',
        }),
      });
    } catch (err) {
      console.warn('Backend staff removal failed, applying locally:', err);
    }

    set((s) => ({
      valetBookings: s.valetBookings.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              assignedStaffIds: updatedIds,
              assignedStaffNames: updatedNames,
              status: newStatus,
            }
          : b
      ),
      selectedValetBooking:
        s.selectedValetBooking?.id === bookingId
          ? {
              ...s.selectedValetBooking,
              assignedStaffIds: updatedIds,
              assignedStaffNames: updatedNames,
              status: newStatus,
            }
          : s.selectedValetBooking,
    }));
    return true;
  },
}));
