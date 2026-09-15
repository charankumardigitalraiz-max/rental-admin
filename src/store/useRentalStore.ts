import { create } from 'zustand';
import {
  ActiveTab,
  DriverBooking,
  Driver,
  SubscriptionPlan,
  DriverSubscription,
  SubscriptionPayment,
  ValetBooking,
  ValetStaff,
  Customer,
  LocalPricingConfig,
  OutstationPricingConfig,
  ValetPricingConfig,
  PricingRule,
  Transaction,
  RefundRecord,
  ReviewRecord,
  NotificationRecord,
  AdminUser,
  SystemSettings,
} from '@/types';
import {
  initialDriverBookings,
  initialDrivers,
  initialSubscriptionPlans,
  initialDriverSubscriptions,
  initialSubscriptionPayments,
  initialValetBookings,
  initialValetStaff,
  initialCustomers,
  initialLocalPricing,
  initialOutstationPricing,
  initialValetPricing,
  initialPricingRules,
  initialTransactions,
  initialRefunds,
  initialReviews,
  initialNotifications,
  initialAdminUsers,
  initialSystemSettings,
} from '@/data/mockData';

import { INITIAL_CARS } from '@/data';

interface DriverAppStoreState {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  selectedDriverBookingId: string | null;
  setSelectedDriverBookingId: (id: string | null) => void;

  selectedDriverId: string | null;
  setSelectedDriverId: (id: string | null) => void;

  driverStatusFilter: string;
  setDriverStatusFilter: (filter: string) => void;

  selectedValetBookingId: string | null;
  setSelectedValetBookingId: (id: string | null) => void;

  selectedValetStaffId: string | null;
  setSelectedValetStaffId: (id: string | null) => void;

  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;

  // Datasets
  driverBookings: DriverBooking[];
  drivers: Driver[];
  subscriptionPlans: SubscriptionPlan[];
  driverSubscriptions: DriverSubscription[];
  subscriptionPayments: SubscriptionPayment[];
  valetBookings: ValetBooking[];
  valetStaff: ValetStaff[];
  customers: Customer[];
  localPricing: LocalPricingConfig;
  outstationPricing: OutstationPricingConfig;
  valetPricing: ValetPricingConfig;
  pricingRules: PricingRule[];
  transactions: Transaction[];
  refunds: RefundRecord[];
  reviews: ReviewRecord[];
  notifications: NotificationRecord[];
  adminUsers: AdminUser[];
  settings: SystemSettings;

  cars: any[];
  bookings: DriverBooking[];
  addBooking: (booking: any) => void;
  addDriverBooking: (booking: DriverBooking) => void;
  updateBookingStatus: (bookingId: string, status: any, paymentStatus?: string) => void;

  // Actions
  assignDriverToBooking: (bookingId: string, driverId: string) => void;
  updateDriverBookingStatus: (bookingId: string, status: DriverBooking['status']) => void;
  cancelDriverBooking: (bookingId: string) => void;

  approveDriver: (driverId: string) => void;
  rejectDriver: (driverId: string) => void;
  suspendDriver: (driverId: string) => void;
  activateDriver: (driverId: string) => void;

  createSubscriptionPlan: (plan: Omit<SubscriptionPlan, 'id'>) => void;
  updateSubscriptionPlan: (id: string, plan: Partial<SubscriptionPlan>) => void;
  togglePlanStatus: (id: string) => void;

  assignValetStaffToBooking: (bookingId: string, staffId: string) => void;
  removeValetStaffFromBooking: (bookingId: string, staffId: string) => void;
  updateValetBookingStatus: (bookingId: string, status: ValetBooking['status']) => void;

  updateValetStaffStatus: (staffId: string, status: ValetStaff['status']) => void;
  toggleCustomerStatus: (customerId: string) => void;

  updateLocalPricing: (config: LocalPricingConfig) => void;
  updateOutstationPricing: (config: OutstationPricingConfig) => void;
  updateValetPricing: (config: ValetPricingConfig) => void;
  addPricingRule: (rule: Omit<PricingRule, 'id'>) => void;
  togglePricingRuleStatus: (id: string) => void;

  updateRefundStatus: (refundId: string, status: RefundRecord['status']) => void;
  updateReviewStatus: (reviewId: string, status: ReviewRecord['status']) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  updateSettings: (settings: Partial<SystemSettings>) => void;
}

export const useRentalStore = create<DriverAppStoreState>((set) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  selectedDriverBookingId: null,
  setSelectedDriverBookingId: (id) => set({ selectedDriverBookingId: id }),

  selectedDriverId: null,
  setSelectedDriverId: (id) => set({ selectedDriverId: id }),

  driverStatusFilter: 'All',
  setDriverStatusFilter: (filter) => set({ driverStatusFilter: filter }),

  selectedValetBookingId: null,
  setSelectedValetBookingId: (id) => set({ selectedValetBookingId: id }),

  selectedValetStaffId: null,
  setSelectedValetStaffId: (id) => set({ selectedValetStaffId: id }),

  selectedCustomerId: null,
  setSelectedCustomerId: (id) => set({ selectedCustomerId: id }),

  cars: INITIAL_CARS,
  driverBookings: initialDriverBookings,
  bookings: initialDriverBookings,
  addBooking: (booking) =>
    set((state) => ({
      driverBookings: [booking, ...state.driverBookings],
      bookings: [booking, ...(state.bookings || [])],
    })),
  addDriverBooking: (booking) =>
    set((state) => ({
      driverBookings: [booking, ...state.driverBookings],
      bookings: [booking, ...(state.bookings || [])],
    })),
  updateBookingStatus: (bookingId, status) =>
    set((state) => ({
      driverBookings: state.driverBookings.map((b) =>
        b.id === bookingId ? { ...b, status } : b
      ),
      bookings: (state.bookings || []).map((b) =>
        b.id === bookingId ? { ...b, status } : b
      ),
    })),
  drivers: initialDrivers,
  subscriptionPlans: initialSubscriptionPlans,
  driverSubscriptions: initialDriverSubscriptions,
  subscriptionPayments: initialSubscriptionPayments,
  valetBookings: initialValetBookings,
  valetStaff: initialValetStaff,
  customers: initialCustomers,
  localPricing: initialLocalPricing,
  outstationPricing: initialOutstationPricing,
  valetPricing: initialValetPricing,
  pricingRules: initialPricingRules,
  transactions: initialTransactions,
  refunds: initialRefunds,
  reviews: initialReviews,
  notifications: initialNotifications,
  adminUsers: initialAdminUsers,
  settings: initialSystemSettings,

  assignDriverToBooking: (bookingId, driverId) =>
    set((state) => {
      const driver = state.drivers.find((d) => d.id === driverId);
      if (!driver) return state;

      return {
        driverBookings: state.driverBookings.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                driverId: driver.id,
                driverName: driver.name,
                driverPhone: driver.phone,
                driverRating: driver.rating,
                driverAvatar: driver.avatar,
                status: 'Driver Assigned',
                timeline: {
                  ...b.timeline,
                  assigned: new Date().toISOString().replace('T', ' ').slice(0, 16),
                },
              }
            : b
        ),
        drivers: state.drivers.map((d) => (d.id === driverId ? { ...d, availability: 'Busy' } : d)),
      };
    }),

  updateDriverBookingStatus: (bookingId, status) =>
    set((state) => ({
      driverBookings: state.driverBookings.map((b) =>
        b.id === bookingId ? { ...b, status } : b
      ),
    })),

  cancelDriverBooking: (bookingId) =>
    set((state) => ({
      driverBookings: state.driverBookings.map((b) =>
        b.id === bookingId ? { ...b, status: 'Cancelled' } : b
      ),
    })),

  approveDriver: (driverId) =>
    set((state) => ({
      drivers: state.drivers.map((d) =>
        d.id === driverId
          ? {
              ...d,
              status: 'Approved',
              verification: { ...d.verification, status: 'Verified' },
            }
          : d
      ),
    })),

  rejectDriver: (driverId) =>
    set((state) => ({
      drivers: state.drivers.map((d) =>
        d.id === driverId
          ? {
              ...d,
              status: 'Rejected',
              verification: { ...d.verification, status: 'Rejected' },
            }
          : d
      ),
    })),

  suspendDriver: (driverId) =>
    set((state) => ({
      drivers: state.drivers.map((d) =>
        d.id === driverId ? { ...d, status: 'Suspended', dutyStatus: 'Offline' } : d
      ),
    })),

  activateDriver: (driverId) =>
    set((state) => ({
      drivers: state.drivers.map((d) => (d.id === driverId ? { ...d, status: 'Approved' } : d)),
    })),

  createSubscriptionPlan: (newPlanData) =>
    set((state) => {
      const newPlan: SubscriptionPlan = {
        ...newPlanData,
        id: `plan-${Date.now()}`,
      };
      return { subscriptionPlans: [...state.subscriptionPlans, newPlan] };
    }),

  updateSubscriptionPlan: (id, partialPlan) =>
    set((state) => ({
      subscriptionPlans: state.subscriptionPlans.map((p) =>
        p.id === id ? { ...p, ...partialPlan } : p
      ),
    })),

  togglePlanStatus: (id) =>
    set((state) => ({
      subscriptionPlans: state.subscriptionPlans.map((p) =>
        p.id === id ? { ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' } : p
      ),
    })),

  assignValetStaffToBooking: (bookingId, staffId) =>
    set((state) => {
      const staff = state.valetStaff.find((s) => s.id === staffId);
      if (!staff) return state;

      return {
        valetBookings: state.valetBookings.map((vb) => {
          if (vb.id !== bookingId) return vb;
          if (vb.assignedStaffIds.includes(staffId)) return vb;

          const updatedStaffIds = [...vb.assignedStaffIds, staffId];
          const updatedStaffNames = [...vb.assignedStaffNames, staff.name];
          const isFully = updatedStaffIds.length >= vb.requiredStaffCount;

          return {
            ...vb,
            assignedStaffIds: updatedStaffIds,
            assignedStaffNames: updatedStaffNames,
            status: isFully ? 'Fully Assigned' : 'Partially Assigned',
          };
        }),
        valetStaff: state.valetStaff.map((s) =>
          s.id === staffId ? { ...s, status: 'Assigned' } : s
        ),
      };
    }),

  removeValetStaffFromBooking: (bookingId, staffId) =>
    set((state) => {
      const staff = state.valetStaff.find((s) => s.id === staffId);
      return {
        valetBookings: state.valetBookings.map((vb) => {
          if (vb.id !== bookingId) return vb;
          const updatedStaffIds = vb.assignedStaffIds.filter((id) => id !== staffId);
          const updatedStaffNames = vb.assignedStaffNames.filter((name) => name !== staff?.name);
          const newStatus =
            updatedStaffIds.length === 0
              ? 'Pending Assignment'
              : updatedStaffIds.length < vb.requiredStaffCount
              ? 'Partially Assigned'
              : 'Fully Assigned';

          return {
            ...vb,
            assignedStaffIds: updatedStaffIds,
            assignedStaffNames: updatedStaffNames,
            status: newStatus,
          };
        }),
        valetStaff: state.valetStaff.map((s) =>
          s.id === staffId ? { ...s, status: 'Available' } : s
        ),
      };
    }),

  updateValetBookingStatus: (bookingId, status) =>
    set((state) => ({
      valetBookings: state.valetBookings.map((vb) =>
        vb.id === bookingId ? { ...vb, status } : vb
      ),
    })),

  updateValetStaffStatus: (staffId, status) =>
    set((state) => ({
      valetStaff: state.valetStaff.map((s) => (s.id === staffId ? { ...s, status } : s)),
    })),

  toggleCustomerStatus: (customerId) =>
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === customerId ? { ...c, status: c.status === 'Active' ? 'Suspended' : 'Active' } : c
      ),
    })),

  updateLocalPricing: (config) => set({ localPricing: config }),
  updateOutstationPricing: (config) => set({ outstationPricing: config }),
  updateValetPricing: (config) => set({ valetPricing: config }),

  addPricingRule: (ruleData) =>
    set((state) => ({
      pricingRules: [...state.pricingRules, { ...ruleData, id: `rule-${Date.now()}` }],
    })),

  togglePricingRuleStatus: (id) =>
    set((state) => ({
      pricingRules: state.pricingRules.map((r) =>
        r.id === id ? { ...r, status: r.status === 'Active' ? 'Inactive' : 'Active' } : r
      ),
    })),

  updateRefundStatus: (refundId, status) =>
    set((state) => ({
      refunds: state.refunds.map((r) => (r.id === refundId ? { ...r, status } : r)),
    })),

  updateReviewStatus: (reviewId, status) =>
    set((state) => ({
      reviews: state.reviews.map((r) => (r.id === reviewId ? { ...r, status } : r)),
    })),

  markNotificationAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  markAllNotificationsAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),
}));
