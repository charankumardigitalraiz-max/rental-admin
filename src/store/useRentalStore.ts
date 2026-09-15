import { create } from 'zustand';
import {
  CarProduct,
  Category,
  Booking,
  Customer,
  Payment,
  ReturnRecord,
  InventoryItem,
  PricingPlan,
  Coupon,
  Review,
  NotificationItem,
  AdminUser,
  SystemSettings,
  ActiveTab,
} from '@/types';
import {
  INITIAL_CARS,
  INITIAL_CATEGORIES,
  INITIAL_BOOKINGS,
  INITIAL_CUSTOMERS,
  INITIAL_PAYMENTS,
  INITIAL_RETURNS,
  INITIAL_INVENTORY,
  INITIAL_PRICING,
  INITIAL_COUPONS,
  INITIAL_REVIEWS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ADMIN_USERS,
  INITIAL_SETTINGS,
} from '@/data';

interface RentalState {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  cars: CarProduct[];
  categories: Category[];
  bookings: Booking[];
  customers: Customer[];
  payments: Payment[];
  returns: ReturnRecord[];
  inventory: InventoryItem[];
  pricingPlans: PricingPlan[];
  coupons: Coupon[];
  reviews: Review[];
  notifications: NotificationItem[];
  adminUsers: AdminUser[];
  settings: SystemSettings;

  // Car Actions
  addCar: (car: Omit<CarProduct, 'id'>) => void;
  updateCar: (id: string, car: Partial<CarProduct>) => void;
  deleteCar: (id: string) => void;

  // Category Actions
  addCategory: (category: Omit<Category, 'id' | 'carCount'>) => void;

  // Booking Actions
  addBooking: (booking: Omit<Booking, 'id' | 'bookingNumber' | 'createdAt'>) => void;
  updateBookingStatus: (id: string, status: Booking['status'], paymentStatus?: Booking['paymentStatus']) => void;

  // Coupon Actions
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usageCount'>) => void;
  toggleCouponStatus: (id: string) => void;

  // Review Actions
  updateReviewStatus: (id: string, status: Review['status']) => void;

  // Notification Actions
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Return Actions
  addReturnRecord: (record: Omit<ReturnRecord, 'id' | 'returnId'>) => void;

  // Settings Actions
  updateSettings: (newSettings: Partial<SystemSettings>) => void;

  // Search & Filter state
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useRentalStore = create<RentalState>((set) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),

  cars: INITIAL_CARS,
  categories: INITIAL_CATEGORIES,
  bookings: INITIAL_BOOKINGS,
  customers: INITIAL_CUSTOMERS,
  payments: INITIAL_PAYMENTS,
  returns: INITIAL_RETURNS,
  inventory: INITIAL_INVENTORY,
  pricingPlans: INITIAL_PRICING,
  coupons: INITIAL_COUPONS,
  reviews: INITIAL_REVIEWS,
  notifications: INITIAL_NOTIFICATIONS,
  adminUsers: INITIAL_ADMIN_USERS,
  settings: INITIAL_SETTINGS,

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Car mutations
  addCar: (newCar) =>
    set((state) => {
      const id = `car-${Date.now()}`;
      return { cars: [{ ...newCar, id }, ...state.cars] };
    }),

  updateCar: (id, updatedCar) =>
    set((state) => ({
      cars: state.cars.map((c) => (c.id === id ? { ...c, ...updatedCar } : c)),
    })),

  deleteCar: (id) =>
    set((state) => ({
      cars: state.cars.filter((c) => c.id !== id),
    })),

  // Category mutations
  addCategory: (newCategory) =>
    set((state) => ({
      categories: [
        ...state.categories,
        {
          ...newCategory,
          id: `cat-${Date.now()}`,
          carCount: 0,
        },
      ],
    })),

  // Booking mutations
  addBooking: (newBooking) =>
    set((state) => {
      const id = `bk-${Date.now()}`;
      const bookingNumber = `RNT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const createdAt = new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
      return {
        bookings: [
          {
            ...newBooking,
            id,
            bookingNumber,
            createdAt,
          },
          ...state.bookings,
        ],
      };
    }),

  updateBookingStatus: (id, status, paymentStatus) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, status, ...(paymentStatus ? { paymentStatus } : {}) } : b
      ),
    })),

  // Coupon mutations
  addCoupon: (coupon) =>
    set((state) => ({
      coupons: [
        {
          ...coupon,
          id: `coup-${Date.now()}`,
          usageCount: 0,
        },
        ...state.coupons,
      ],
    })),

  toggleCouponStatus: (id) =>
    set((state) => ({
      coupons: state.coupons.map((c) =>
        c.id === id ? { ...c, status: c.status === 'Active' ? 'Expired' : 'Active' } : c
      ),
    })),

  // Review mutations
  updateReviewStatus: (id, status) =>
    set((state) => ({
      reviews: state.reviews.map((r) => (r.id === id ? { ...r, status } : r)),
    })),

  // Notification mutations
  markNotificationAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  markAllNotificationsAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  // Return record
  addReturnRecord: (record) =>
    set((state) => ({
      returns: [
        {
          ...record,
          id: `ret-${Date.now()}`,
          returnId: `RET-${Math.floor(8000 + Math.random() * 1000)}`,
        },
        ...state.returns,
      ],
    })),

  // Settings
  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),
}));
