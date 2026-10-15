import { create } from 'zustand';
import { SubscriptionPlan } from '@/types';
import { useRentalStore } from './useRentalStore';

export interface SubscriptionCounts {
  total: number;
  active: number;
  inactive: number;
}

export interface SubscriptionPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateSubscriptionPlanInput {
  name: string;
  planName?: string;
  description?: string;
  price: number;
  durationDays: number;
  billingCycle?: string;
  localEligible: boolean;
  outstationEligible: boolean;
  maxRequestsPerDay: number;
  features: string[] | string;
  status: 'Active' | 'Inactive' | boolean;
}

export interface UpdateSubscriptionPlanInput {
  name?: string;
  planName?: string;
  description?: string;
  price?: number;
  durationDays?: number;
  billingCycle?: string;
  localEligible?: boolean;
  outstationEligible?: boolean;
  maxRequestsPerDay?: number;
  features?: string[] | string;
  status?: 'Active' | 'Inactive' | boolean;
}

interface SubscriptionStoreState {
  subscriptionPlans: SubscriptionPlan[];
  selectedPlan: SubscriptionPlan | null;
  counts: SubscriptionCounts | null;
  pagination: SubscriptionPagination | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  clearError: () => void;
  setSelectedPlan: (plan: SubscriptionPlan | null) => void;
  fetchSubscriptionPlans: (
    params?: { search?: string; status?: string; all?: boolean; page?: number; limit?: number },
    quiet?: boolean
  ) => Promise<{ success: boolean; data?: SubscriptionPlan[]; error?: string }>;
  fetchSubscriptionPlanById: (
    id: string
  ) => Promise<{ success: boolean; data?: SubscriptionPlan; error?: string }>;
  createSubscriptionPlan: (
    payload: CreateSubscriptionPlanInput
  ) => Promise<{ success: boolean; data?: SubscriptionPlan; error?: string; message?: string }>;
  updateSubscriptionPlan: (
    id: string,
    payload: UpdateSubscriptionPlanInput
  ) => Promise<{ success: boolean; data?: SubscriptionPlan; error?: string; message?: string }>;
  togglePlanStatus: (
    plan: SubscriptionPlan
  ) => Promise<{ success: boolean; data?: SubscriptionPlan; newStatus?: string; error?: string }>;
  deleteSubscriptionPlan: (
    id: string
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
}

export const useSubscriptionStore = create<SubscriptionStoreState>((set, get) => ({
  subscriptionPlans: [],
  selectedPlan: null,
  counts: null,
  pagination: null,
  isLoading: false,
  isSubmitting: false,
  error: null,

  clearError: () => set({ error: null }),
  setSelectedPlan: (plan) => set({ selectedPlan: plan }),

  fetchSubscriptionPlans: async (params, quiet = false) => {
    if (!quiet) set({ isLoading: true, error: null });

    try {
      const query = new URLSearchParams();
      if (params?.all || !params?.page) query.append('all', 'true');
      if (params?.search) query.append('search', params.search);
      if (params?.status && params.status !== 'All') query.append('status', params.status);
      if (params?.page) query.append('page', String(params.page));
      if (params?.limit) query.append('limit', String(params.limit));

      const res = await fetch(`/api/admin/subscription-plans?${query.toString()}`);
      const json = await res.json();

      if (res.ok && json.success && Array.isArray(json.data)) {
        set({
          subscriptionPlans: json.data,
          counts: json.counts || null,
          pagination: json.pagination || null,
          isLoading: false,
          error: null,
        });

        // Synchronize with rental store
        useRentalStore.setState({ subscriptionPlans: json.data });

        return { success: true, data: json.data };
      } else {
        const errorMsg = json.error || 'Failed to fetch subscription plans.';
        set({ error: errorMsg, isLoading: false });
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('Error in fetchSubscriptionPlans zustand store:', err);
      const errorMsg = err.message || 'Network error while fetching subscription plans.';
      set({ error: errorMsg, isLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  fetchSubscriptionPlanById: async (id: string) => {
    try {
      const res = await fetch(`/api/admin/subscription-plans/${id}`);
      const json = await res.json();

      if (res.ok && json.success && json.data) {
        set({ selectedPlan: json.data });
        return { success: true, data: json.data };
      } else {
        return { success: false, error: json.error || 'Subscription plan not found.' };
      }
    } catch (err: any) {
      console.error('Error in fetchSubscriptionPlanById:', err);
      return { success: false, error: err.message || 'Network error fetching subscription plan.' };
    }
  },

  createSubscriptionPlan: async (payload: CreateSubscriptionPlanInput) => {
    set({ isSubmitting: true, error: null });

    try {
      const formattedPayload = {
        name: payload.name.trim(),
        planName: (payload.planName || payload.name).trim(),
        description: payload.description?.trim(),
        price: Number(payload.price),
        durationDays: Number(payload.durationDays),
        billingCycle: payload.billingCycle,
        localEligible: payload.localEligible,
        outstationEligible: payload.outstationEligible,
        maxRequestsPerDay: Number(payload.maxRequestsPerDay),
        features: Array.isArray(payload.features)
          ? payload.features
          : String(payload.features || '')
            .split(',')
            .map((f) => f.trim())
            .filter(Boolean),
        status: payload.status === 'Active' || payload.status === true,
      };

      const res = await fetch('/api/admin/subscription-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedPayload),
      });

      const json = await res.json();

      if (res.ok && json.success && json.data) {
        const updatedPlans = [json.data, ...get().subscriptionPlans];
        set({
          subscriptionPlans: updatedPlans,
          isSubmitting: false,
          error: null,
        });

        // Synchronize with rental store
        useRentalStore.setState({ subscriptionPlans: updatedPlans });

        return {
          success: true,
          data: json.data,
          message: json.message || 'Subscription plan created successfully.',
        };
      } else {
        const errorMsg = json.error || 'Failed to create subscription plan.';
        set({ error: errorMsg, isSubmitting: false });
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('Error in createSubscriptionPlan zustand store:', err);
      const errorMsg = err.message || 'Network error while creating subscription plan.';
      set({ error: errorMsg, isSubmitting: false });
      return { success: false, error: errorMsg };
    }
  },

  updateSubscriptionPlan: async (id: string, payload: UpdateSubscriptionPlanInput) => {
    set({ isSubmitting: true, error: null });

    try {
      const formattedPayload: any = { ...payload };
      if (payload.name) {
        formattedPayload.name = payload.name.trim();
        formattedPayload.planName = payload.name.trim();
      }
      if (payload.price !== undefined) formattedPayload.price = Number(payload.price);
      if (payload.durationDays !== undefined)
        formattedPayload.durationDays = Number(payload.durationDays);
      if (payload.maxRequestsPerDay !== undefined)
        formattedPayload.maxRequestsPerDay = Number(payload.maxRequestsPerDay);
      if (payload.features !== undefined) {
        formattedPayload.features = Array.isArray(payload.features)
          ? payload.features
          : String(payload.features)
            .split(',')
            .map((f) => f.trim())
            .filter(Boolean);
      }
      if (payload.status !== undefined) {
        formattedPayload.status = payload.status === 'Active' || payload.status === true;
      }

      const res = await fetch(`/api/admin/subscription-plans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedPayload),
      });

      const json = await res.json();

      if (res.ok && json.success && json.data) {
        const updatedPlans = get().subscriptionPlans.map((p) =>
          p.id === id || p._id === id ? json.data : p
        );
        set({
          subscriptionPlans: updatedPlans,
          selectedPlan:
            get().selectedPlan?.id === id || get().selectedPlan?._id === id
              ? json.data
              : get().selectedPlan,
          isSubmitting: false,
          error: null,
        });

        // Synchronize with rental store
        useRentalStore.setState({ subscriptionPlans: updatedPlans });

        return {
          success: true,
          data: json.data,
          message: json.message || 'Subscription plan updated successfully.',
        };
      } else {
        const errorMsg = json.error || 'Failed to update subscription plan.';
        set({ error: errorMsg, isSubmitting: false });
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('Error in updateSubscriptionPlan zustand store:', err);
      const errorMsg = err.message || 'Network error while updating subscription plan.';
      set({ error: errorMsg, isSubmitting: false });
      return { success: false, error: errorMsg };
    }
  },

  togglePlanStatus: async (plan: SubscriptionPlan) => {
    const planId = plan.id || plan._id;
    if (!planId) return { success: false, error: 'Invalid plan ID' };

    const newStatus = plan.status === 'Active' ? 'Inactive' : 'Active';

    try {
      const res = await fetch(`/api/admin/subscription-plans/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus === 'Active' }),
      });

      const json = await res.json();

      if (res.ok && json.success && json.data) {
        const updatedPlans = get().subscriptionPlans.map((p) =>
          p.id === planId || p._id === planId ? json.data : p
        );
        set({
          subscriptionPlans: updatedPlans,
          selectedPlan:
            get().selectedPlan?.id === planId || get().selectedPlan?._id === planId
              ? json.data
              : get().selectedPlan,
        });

        // Synchronize with rental store
        useRentalStore.setState({ subscriptionPlans: updatedPlans });

        return { success: true, data: json.data, newStatus };
      } else {
        return { success: false, error: json.error || 'Failed to update plan status.' };
      }
    } catch (err: any) {
      console.error('Error in togglePlanStatus zustand store:', err);
      return { success: false, error: err.message || 'Network error while toggling plan status.' };
    }
  },

  deleteSubscriptionPlan: async (id: string) => {
    set({ isSubmitting: true, error: null });

    try {
      const res = await fetch(`/api/admin/subscriptions/${id}`, {
        method: 'DELETE',
      });

      const json = await res.json();

      if (res.ok && json.success) {
        const updatedPlans = get().subscriptionPlans.filter(
          (p) => p.id !== id && p._id !== id
        );
        set({
          subscriptionPlans: updatedPlans,
          selectedPlan:
            get().selectedPlan?.id === id || get().selectedPlan?._id === id
              ? null
              : get().selectedPlan,
          isSubmitting: false,
          error: null,
        });

        // Synchronize with rental store
        useRentalStore.setState({ subscriptionPlans: updatedPlans });

        return {
          success: true,
          message: json.message || 'Subscription plan deleted successfully.',
        };
      } else {
        const errorMsg = json.error || 'Failed to delete subscription plan.';
        set({ error: errorMsg, isSubmitting: false });
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('Error in deleteSubscriptionPlan zustand store:', err);
      const errorMsg = err.message || 'Network error while deleting subscription plan.';
      set({ error: errorMsg, isSubmitting: false });
      return { success: false, error: errorMsg };
    }
  },
}));
