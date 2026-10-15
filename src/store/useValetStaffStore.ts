import { create } from 'zustand';
import { ValetStaff } from '@/types';
import { initialValetStaff } from '@/data/mockData';

export interface ValetStaffCounts {
  total: number;
  active: number;
  inactive: number;
  available?: number;
  onDuty?: number;
}

export interface ValetStaffPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FetchValetStaffParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  bloodGroup?: string;
  proofType?: string;
  location?: string;
  isAvailable?: boolean;
}

export interface CreateValetStaffPayload {
  name: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  proofType: string;
  identityNumber: string;
  proofImage?: string | File;
  proofImageBack?: string | File;
  profileImage?: string | File;
  address?: string;
  status?: string;
  notes?: string;
  location?: string;
  experienceYears?: number;
}

function getAuthHeaders(isFormData = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
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

/**
 * Maps a MongoDB ValetStaff document to the frontend ValetStaff interface.
 */
export function mapBackendValetStaff(s: any): ValetStaff {
  // const staffId = s.staffId || s._id?.toString() || s.id || `VS-${Date.now()}`;

  // Status mapping:
  // Backend: "active" | "inactive" | "pending" | "suspended"
  // Frontend: "Available" | "Assigned" | "On Duty" | "Offline" | "Suspended"
  let mappedStatus: ValetStaff['status'] = 'Available';
  if (s.status === 'suspended') {
    mappedStatus = 'Suspended';
  } else if (s.status === 'inactive' || s.status === 'pending') {
    mappedStatus = 'Offline';
  } else if (s.status === 'active') {
    mappedStatus = s.isAvailable === false ? 'Assigned' : 'Available';
  } else if (['Available', 'Assigned', 'On Duty', 'Offline', 'Suspended'].includes(s.status)) {
    mappedStatus = s.status;
  }

  const proof = s.proof || {};
  const proofType = proof.proofType || s.proofType || s.idProofType || 'Aadhaar Card';
  const identityNumber = proof.identityNumber || s.identityNumber || s.idProofNumber || '';
  const frontImg = proof.proofImage || s.proofImage || s.idProofFrontImage || s.idProofImage || '';
  const backImg = proof.proofImageBack || s.proofImageBack || s.idProofBackImage || '';
  const avatar =
    s.profileImage ||
    s.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name || 'Valet')}&background=023526&color=fff&bold=true`;

  const isAadhaar = (proofType || '').toLowerCase().includes('aadhaar');
  const isDL = (proofType || '').toLowerCase().includes('driving');

  return {
    id: s?._id.toString(),
    staffId: s?.staffId.toString(),
    name: s.name || 'Valet Attendant',
    phone: s.phone || '',
    email: s.email || '',
    avatar,
    rating: s.rating ?? 5.0,
    experienceYears: s.experienceYears ?? 3,
    location: s.address || s.location || 'Bengaluru Central',
    address: s.address || '',
    assignedEventsCount: s.assignedEventsCount ?? (Array.isArray(s.bookings) ? s.bookings.length : 0),
    status: mappedStatus,
    idProofType: proofType,
    idProofNumber: identityNumber,
    idProofImage: frontImg,
    idProofFrontImage: frontImg,
    idProofBackImage: backImg,
    aadhaarNumber: isAadhaar ? identityNumber : s.aadhaarNumber,
    aadhaarCardImage: isAadhaar ? frontImg : s.aadhaarCardImage,
    aadhaarCardFront: isAadhaar ? frontImg : s.aadhaarCardFront,
    aadhaarCardBack: isAadhaar ? backImg : s.aadhaarCardBack,
    drivingLicenseNumber: isDL ? identityNumber : s.drivingLicenseNumber,
    emergencyContact: s.emergencyContactPhone || s.emergencyContact || '',
    bloodGroup: s.bloodGroup || 'O+',
    currentAssignment: s.currentAssignment,
    bookings: s.bookings,
    bookingsPagination: s.bookingsPagination,
    bookingCounts: s.bookingCounts,
    earnings: s.earnings || { total: 0, pending: 0, paid: 0 },
  };
}

interface ValetStaffStoreState {
  staffList: ValetStaff[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  counts: ValetStaffCounts;
  pagination: ValetStaffPagination;

  searchQuery: string;
  statusFilter: string;

  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;

  fetchStaff: (params?: FetchValetStaffParams) => Promise<void>;
  createStaff: (
    payload: CreateValetStaffPayload | FormData
  ) => Promise<{ success: boolean; data?: ValetStaff; error?: string }>;
  updateStaffStatus: (
    staffId: string,
    status: ValetStaff['status']
  ) => Promise<{ success: boolean; error?: string }>;
  deleteStaff: (staffId: string) => Promise<{ success: boolean; error?: string }>;
}

export const useValetStaffStore = create<ValetStaffStoreState>((set, get) => ({
  staffList: initialValetStaff,
  isLoading: false,
  isSubmitting: false,
  error: null,

  counts: {
    total: initialValetStaff.length,
    active: initialValetStaff.filter((s) => s.status === 'Available' || s.status === 'On Duty' || s.status === 'Assigned').length,
    inactive: initialValetStaff.filter((s) => s.status === 'Offline' || s.status === 'Suspended').length,
  },

  pagination: {
    total: initialValetStaff.length,
    page: 1,
    limit: 50,
    totalPages: 1,
  },

  searchQuery: '',
  statusFilter: 'All',

  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (status) => set({ statusFilter: status }),

  fetchStaff: async (params?: FetchValetStaffParams) => {
    set({ isLoading: true, error: null });
    try {
      const q = new URLSearchParams();
      if (params?.page) q.set('page', params.page.toString());
      if (params?.limit) q.set('limit', params.limit.toString());
      if (params?.search) q.set('search', params.search);
      if (params?.status && params.status !== 'All') {
        const backendStatus =
          params.status === 'Available'
            ? 'active'
            : params.status === 'Suspended'
              ? 'suspended'
              : params.status === 'Offline'
                ? 'inactive'
                : params.status;
        q.set('status', backendStatus);
      }
      if (params?.bloodGroup && params.bloodGroup !== 'All') q.set('bloodGroup', params.bloodGroup);
      if (params?.proofType && params.proofType !== 'All') q.set('proofType', params.proofType);
      if (params?.location && params.location !== 'All') q.set('location', params.location);
      if (params?.isAvailable !== undefined) q.set('isAvailable', params.isAvailable.toString());

      const res = await fetch(`/api/admin/valet-staff?${q.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders(false),
      });

      const resData = await res.json();
      if (res.ok && resData.success && resData.data?.staff) {
        const mappedStaff: ValetStaff[] = resData.data.staff.map(mapBackendValetStaff);

        const hasSearchOrFilter = !!(
          params?.search ||
          (params?.status && params.status !== 'All') ||
          (params?.bloodGroup && params.bloodGroup !== 'All') ||
          (params?.proofType && params.proofType !== 'All') ||
          (params?.location && params.location !== 'All')
        );

        // Fall back to initial mock only if initial unfiltered load returned 0
        const finalStaff: ValetStaff[] =
          mappedStaff.length > 0 || hasSearchOrFilter ? mappedStaff : initialValetStaff;

        set({
          staffList: finalStaff,
          counts: {
            total: resData.data.counts?.total ?? finalStaff.length,
            active: resData.data.counts?.active ?? finalStaff.filter((s: ValetStaff) => s.status === 'Available' || s.status === 'On Duty').length,
            inactive: resData.data.counts?.inactive ?? finalStaff.filter((s: ValetStaff) => s.status === 'Offline' || s.status === 'Suspended').length,
            available: resData.data.counts?.available ?? finalStaff.filter((s: ValetStaff) => s.status === 'Available').length,
            onDuty: resData.data.counts?.onDuty ?? finalStaff.filter((s: ValetStaff) => s.status === 'On Duty' || s.status === 'Assigned').length,
          },
          pagination: {
            total: resData.data.pagination?.total ?? finalStaff.length,
            page: resData.data.pagination?.page ?? 1,
            limit: resData.data.pagination?.limit ?? 50,
            totalPages: resData.data.pagination?.totalPages ?? 1,
          },
          isLoading: false,
        });
      } else {
        set({
          error: resData.error || 'Failed to fetch staff from API',
          isLoading: false,
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch valet staff:', err);
      set({
        error: err.message || 'Network error fetching staff',
        isLoading: false,
      });
    }
  },

  createStaff: async (payload: CreateValetStaffPayload | FormData) => {
    set({ isSubmitting: true, error: null });
    try {
      const isFormData = payload instanceof FormData;
      const res = await fetch('/api/admin/valet-staff', {
        method: 'POST',
        headers: getAuthHeaders(isFormData),
        body: isFormData ? payload : JSON.stringify(payload),
      });

      const resData = await res.json();
      if (res.ok && resData.success && resData.data) {
        const newStaff = mapBackendValetStaff(resData.data);
        set((state) => ({
          staffList: [newStaff, ...state.staffList],
          counts: {
            ...state.counts,
            total: state.counts.total + 1,
            active: state.counts.active + 1,
          },
          isSubmitting: false,
        }));
        return { success: true, data: newStaff };
      } else {
        const err = resData.error || 'Failed to create staff';
        set({ isSubmitting: false, error: err });
        return { success: false, error: err };
      }
    } catch (err: any) {
      console.error('Valet staff create error:', err);
      const errMsg = err.message || 'Network error creating staff';
      set({ isSubmitting: false, error: errMsg });
      return { success: false, error: errMsg };
    }
  },

  updateStaffStatus: async (staffId: string, status: ValetStaff['status']) => {
    // Optimistic local update
    set((state) => ({
      staffList: state.staffList.map((s) => (s.id === staffId ? { ...s, status } : s)),
    }));

    try {
      const backendStatus =
        status === 'Available' || status === 'On Duty' || status === 'Assigned'
          ? 'active'
          : status === 'Suspended'
            ? 'suspended'
            : 'inactive';

      const res = await fetch(`/api/admin/valet-staff/${encodeURIComponent(staffId)}`, {
        method: 'PUT',
        headers: getAuthHeaders(false),
        body: JSON.stringify({
          status: backendStatus,
          isAvailable: status === 'Available',
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        // Revert on failure by refreshing
        get().fetchStaff();
        return { success: false, error: resData.error || 'Failed to update status' };
      }
      return { success: true };
    } catch (err: any) {
      console.error('Valet staff status update error:', err);
      get().fetchStaff();
      return { success: false, error: err.message || 'Network error updating status' };
    }
  },

  deleteStaff: async (staffId: string) => {
    // Optimistic removal
    const previous = get().staffList;
    set((state) => ({
      staffList: state.staffList.filter((s) => s.id !== staffId),
      counts: {
        ...state.counts,
        total: Math.max(0, state.counts.total - 1),
      },
    }));

    try {
      const res = await fetch(`/api/admin/valet-staff/${encodeURIComponent(staffId)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(false),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        set({ staffList: previous });
        return { success: false, error: resData.error || 'Failed to delete staff' };
      }
      return { success: true };
    } catch (err: any) {
      console.error('Valet staff delete error:', err);
      set({ staffList: previous });
      return { success: false, error: err.message || 'Network error deleting staff' };
    }
  },
}));
