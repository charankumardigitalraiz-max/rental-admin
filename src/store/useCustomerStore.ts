import { create } from 'zustand';
import { Customer, DriverBooking, Transaction } from '@/types';
import { initialCustomers, initialDriverBookings, initialTransactions } from '@/data/mockData';

export interface CustomerCounts {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
}

export interface CustomerPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerBookingStats {
  completed: number;
  cancelled: number;
  total: number;
}

export interface CustomerTransactionStats {
  totalCount: number;
  totalSuccess: number;
  totalFailed: number;
  totalAmount: number;
  totalSpentAmount: number;
}

export interface CustomerDetailsData {
  customer: Customer;
  transactions: Transaction[];
  bookings: DriverBooking[];
  customerBookingStats: CustomerBookingStats;
  customerTransactionStats: CustomerTransactionStats;
}

interface CustomerStoreState {
  customers: Customer[];
  selectedCustomerId: string | null;
  selectedCustomerDetails: CustomerDetailsData | null;
  isLoading: boolean;
  error: string | null;
  counts: CustomerCounts | null;
  pagination: CustomerPagination | null;

  setSelectedCustomerId: (id: string | null) => void;
  fetchCustomers: (params?: { page?: number; limit?: number; search?: string; status?: string }) => Promise<void>;
  fetchCustomersById: (customerId: string) => Promise<void>;
  toggleCustomerStatus: (customerId: string) => Promise<void>;
}

export function formatCustomer(raw: any): Customer {
  const isObj = raw && typeof raw === 'object';
  const fullName =
    (isObj && raw.name) ||
    [isObj && raw.firstName, isObj && raw.lastName].filter(Boolean).join(' ') ||
    'Customer';

  const isStatusActive = isObj && (raw.status === true || raw.status === 'Active');

  return {
    id: isObj ? (raw._id || raw.custId || raw.id || '') : '',
    mongoId: isObj ? raw._id : undefined,
    custId: isObj ? (raw.custId || raw.id || raw._id || '') : '',
    name: fullName,
    firstName: isObj ? (raw.firstName || '') : '',
    lastName: isObj ? (raw.lastName || '') : '',
    email: isObj ? (raw.email || '') : '',
    phone: isObj ? (raw.phone || '') : '',
    avatar:
      (isObj && raw.avatar) ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=023526&color=fff`,
    address: isObj ? (raw.address || '') : '',
    totalBookings: isObj ? (raw.totalBookings ?? 0) : 0,
    completedBookings: isObj ? (raw.completedBookings ?? 0) : 0,
    cancelledBookings: isObj ? (raw.cancelledBookings ?? 0) : 0,
    totalSpent: isObj ? (raw.totalSpentAmount ?? raw.totalSpent ?? 0) : 0,
    currentBooking: isObj ? (raw.currentBooking || undefined) : undefined,
    status: isStatusActive ? 'Active' : 'Suspended',
    joinedDate: isObj && raw.createdAt
      ? new Date(raw.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : isObj && raw.joinedDate ? raw.joinedDate : 'Sep 29, 2026',
  };
}

export function formatBooking(raw: any, customer?: Customer): DriverBooking {
  const isDoc = raw && typeof raw === 'object';
  const id = isDoc ? (raw._id || raw.id || `bkg-${Math.random().toString(36).substring(7)}`) : `bkg-${Math.random().toString(36).substring(7)}`;
  const bookingNumber = isDoc ? (raw.bookingNumber || raw.bookingId || `BKG-${Math.floor(100000 + Math.random() * 900000)}`) : `BKG-${Math.floor(100000 + Math.random() * 900000)}`;

  const bookingDate = isDoc && (raw.bookingDate || raw.createdAt)
    ? new Date(raw.bookingDate || raw.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Sep 29, 2026';

  const bookingTime = isDoc && raw.bookingTime ? raw.bookingTime : '10:30 AM';
  const bookingType = isDoc && (raw.bookingType || raw.serviceType)
    ? (raw.bookingType === 'outstation' || raw.serviceType === 'outstation' ? 'Outstation' : 'Local')
    : 'Local';

  const durationHours = isDoc ? (raw.durationHours || raw.durationDays || 4) : 4;
  const pickup = isDoc ? (typeof raw.pickupLocation === 'string' ? raw.pickupLocation : raw.pickupLocation?.address || 'MG Road, Indiranagar, Bengaluru') : 'MG Road, Indiranagar, Bengaluru';
  const drop = isDoc ? (typeof raw.destinationLocation === 'string' ? raw.destinationLocation : raw.dropLocation?.address || 'Koramangala 5th Block, Bengaluru') : 'Koramangala 5th Block, Bengaluru';

  const vehicleModel = isDoc ? (raw.vehicleInfo?.model || raw.vehicleNumber || 'Hyundai Creta') : 'Hyundai Creta';
  const vehiclePlate = isDoc ? (raw.vehicleInfo?.plateNumber || raw.vehicleNumber || 'KA-01-MJ-8899') : 'KA-01-MJ-8899';

  const totalAmount = isDoc ? (raw.totalAmount || raw.pricing?.totalCustomerAmount || raw.baseAmount || 1250) : 1250;

  const rawStatus = isDoc ? (raw.status || raw.bookingStatus || 'Completed') : 'Completed';
  let formattedStatus: any = 'Completed';
  if (typeof rawStatus === 'string') {
    const s = rawStatus.toLowerCase();
    if (s.includes('complete')) formattedStatus = 'Completed';
    else if (s.includes('cancel')) formattedStatus = 'Cancelled';
    else if (s.includes('start')) formattedStatus = 'Service Started';
    else if (s.includes('assign')) formattedStatus = 'Driver Assigned';
    else if (s.includes('search')) formattedStatus = 'Searching Driver';
    else formattedStatus = 'Pending';
  }

  return {
    id: String(id),
    bookingNumber: String(bookingNumber),
    customerName: customer?.name || (isDoc ? raw.customerName : 'Customer'),
    customerEmail: customer?.email || (isDoc ? raw.customerEmail : ''),
    customerPhone: customer?.phone || (isDoc ? raw.customerPhone : ''),
    customerAvatar: customer?.avatar || '',
    bookingType: bookingType as 'Local' | 'Outstation',
    pickupLocation: pickup,
    destinationLocation: drop,
    bookingDate: bookingDate,
    bookingTime: bookingTime,
    durationHours: Number(durationHours),
    vehicleInfo: {
      type: isDoc ? (raw.vehicleInfo?.type || raw.vehicleType || 'SUV') : 'SUV',
      model: vehicleModel,
      plateNumber: vehiclePlate,
      fuelType: isDoc ? (raw.vehicleInfo?.fuelType || 'Petrol') : 'Petrol',
      transmission: isDoc ? (raw.vehicleInfo?.transmission || raw.transmission || 'Automatic') : 'Automatic',
    },
    status: formattedStatus,
    driverName: isDoc ? (raw.driverName || 'Ramesh Kumar') : 'Ramesh Kumar',
    driverPhone: isDoc ? (raw.driverPhone || '+91 98765 43210') : '+91 98765 43210',
    pricing: {
      baseAmount: totalAmount * 0.8,
      durationCharge: 0,
      typeCharge: 0,
      extraCharges: 0,
      discount: 0,
      tax: totalAmount * 0.18,
      totalCustomerAmount: totalAmount,
      driverEarnings: totalAmount * 0.85,
      platformCommission: totalAmount * 0.15,
    },
    timeline: {
      created: bookingDate,
    },
  };
}

export function formatTransaction(raw: any, customer?: Customer): Transaction {
  const isDoc = raw && typeof raw === 'object';
  const id = isDoc ? (raw._id || raw.id || `txn-${Math.random().toString(36).substring(7)}`) : `txn-${Math.random().toString(36).substring(7)}`;
  const txnId = isDoc ? (raw.transactionId || `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`) : `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;

  const date = isDoc && (raw.date || raw.createdAt)
    ? new Date(raw.date || raw.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Sep 29, 2026';

  const amount = isDoc ? (raw.amount || 1250) : 1250;
  const method = isDoc ? (raw.method || 'UPI / Razorpay') : 'UPI / Razorpay';
  const rawStatus = isDoc ? (raw.status || 'Success') : 'Success';

  let status: any = 'Success';
  if (typeof rawStatus === 'string') {
    const s = rawStatus.toLowerCase();
    if (s.includes('succ') || s.includes('paid')) status = 'Success';
    else if (s.includes('fail')) status = 'Failed';
    else if (s.includes('refund')) status = 'Refunded';
    else status = 'Pending';
  }

  return {
    id: String(id),
    transactionId: String(txnId),
    bookingId: isDoc ? (raw.bookingId || '') : '',
    serviceType: isDoc ? (raw.serviceType || 'Driver Local') : 'Driver Local',
    customerOrDriverName: customer?.name || (isDoc ? raw.customerOrDriverName : ''),
    amount: Number(amount),
    method: method,
    payoutAmount: isDoc ? (raw.payoutAmount || 0) : 0,
    platformCommission: isDoc ? (raw.platformCommission || 0) : 0,
    refundAmount: isDoc ? (raw.refundAmount || 0) : 0,
    status: status,
    date: date,
  };
}

export const useCustomerStore = create<CustomerStoreState>((set, get) => ({
  customers: initialCustomers,
  selectedCustomerId: null,
  selectedCustomerDetails: null,
  isLoading: false,
  error: null,
  counts: null,
  pagination: null,

  setSelectedCustomerId: (id) => set({ selectedCustomerId: id }),

  fetchCustomers: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', params.page.toString());
      if (params?.limit) queryParams.set('limit', params.limit.toString());
      if (params?.search) queryParams.set('search', params.search);
      if (params?.status !== undefined && params.status !== '') {
        queryParams.set('status', params.status);
      }

      const queryString = queryParams.toString();
      const endpoint = `/api/admin/customers${queryString ? `?${queryString}` : ''}`;

      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const formattedList = (data.data || []).map(formatCustomer);
        set({
          customers: formattedList,
          counts: data.counts || null,
          pagination: data.pagination || null,
          isLoading: false,
        });
      } else {
        set({
          error: data.error || 'Failed to fetch customer records.',
          isLoading: false,
        });
      }
    } catch (err: any) {
      set({
        error: err.message || 'Failed to connect to customer API endpoint.',
        isLoading: false,
      });
    }
  },

  fetchCustomersById: async (customerId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const payload = data.data;

        // Extract customer object whether nested inside payload.customer or directly payload
        const rawCustomer = payload.customer || payload;
        const formattedCust = formatCustomer(rawCustomer);

        // Raw bookings & transactions from API response
        const rawBookings = payload.bookings || [];
        const rawTransactions = payload.transactions || [];

        // Format bookings & transactions
        let formattedBookings: DriverBooking[] = (rawBookings || []).map((b: any) => formatBooking(b, formattedCust));
        let formattedTransactions: Transaction[] = (rawTransactions || []).map((t: any) => formatTransaction(t, formattedCust));

        // Fallback: If API returned empty bookings/transactions for demo, match initial mock bookings & txns for seamless UI preview
        if (formattedBookings.length === 0) {
          const matchedMockBookings = initialDriverBookings.filter(
            (b) => b.customerName === formattedCust.name || b.customerEmail === formattedCust.email
          );
          formattedBookings = matchedMockBookings.length > 0 ? matchedMockBookings : initialDriverBookings.slice(0, 2);
        }

        if (formattedTransactions.length === 0) {
          const matchedMockTxns = initialTransactions.filter(
            (t) => t.customerOrDriverName === formattedCust.name
          );
          formattedTransactions = matchedMockTxns.length > 0 ? matchedMockTxns : initialTransactions.slice(0, 2);
        }

        const bookingStats = payload.customerBookingStats || {
          completed: formattedBookings.filter((b) => b.status === 'Completed').length,
          cancelled: formattedBookings.filter((b) => b.status === 'Cancelled').length,
          total: formattedBookings.length,
        };

        const transactionStats = payload.customerTransactionStats || {
          totalCount: formattedTransactions.length,
          totalSuccess: formattedTransactions.filter((t) => t.status === 'Success').length,
          totalFailed: formattedTransactions.filter((t) => t.status === 'Failed').length,
          totalAmount: formattedTransactions.reduce((acc, t) => acc + (t.amount || 0), 0),
          totalSpentAmount: formattedTransactions.reduce((acc, t) => t.status === 'Success' ? acc + (t.amount || 0) : acc, 0),
        };

        // Update customer totalSpent and totalBookings if provided by stats
        if (transactionStats.totalSpentAmount > 0) {
          formattedCust.totalSpent = transactionStats.totalSpentAmount;
        }
        if (bookingStats.total > 0) {
          formattedCust.totalBookings = bookingStats.total;
          formattedCust.completedBookings = bookingStats.completed;
          formattedCust.cancelledBookings = bookingStats.cancelled;
        }

        const customerDetails: CustomerDetailsData = {
          customer: formattedCust,
          bookings: formattedBookings,
          transactions: formattedTransactions,
          customerBookingStats: bookingStats,
          customerTransactionStats: transactionStats,
        };

        const existing = get().customers;
        const index = existing.findIndex(
          (c) => c.id === formattedCust.id || c.mongoId === formattedCust.mongoId || c.custId === formattedCust.custId
        );
        const updatedList =
          index >= 0
            ? existing.map((c, i) => (i === index ? formattedCust : c))
            : [...existing, formattedCust];

        set({
          customers: updatedList,
          selectedCustomerDetails: customerDetails,
          isLoading: false,
        });
      } else {
        set({
          error: data.error || 'Failed to fetch customer record.',
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch customer record.',
        isLoading: false,
      });
    }
  },

  toggleCustomerStatus: async (customerId: string) => {
    const currentCustomers = get().customers;
    const target = currentCustomers.find(
      (c) => c.id === customerId || c.mongoId === customerId || c.custId === customerId
    );

    if (!target) return;

    const newStatusBool = target.status !== 'Active';
    const targetId = target.mongoId || target.id;

    // Optimistic store update
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === customerId || c.mongoId === customerId || c.custId === customerId
          ? { ...c, status: newStatusBool ? 'Active' : 'Suspended' }
          : c
      ),
      selectedCustomerDetails: state.selectedCustomerDetails
        ? {
            ...state.selectedCustomerDetails,
            customer: {
              ...state.selectedCustomerDetails.customer,
              status: newStatusBool ? 'Active' : 'Suspended',
            },
          }
        : null,
      counts: state.counts
        ? {
            ...state.counts,
            active: newStatusBool ? state.counts.active + 1 : state.counts.active - 1,
            inactive: newStatusBool ? state.counts.inactive - 1 : state.counts.inactive + 1,
          }
        : null,
    }));

    try {
      const res = await fetch(`/api/admin/customers/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatusBool }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        // Revert optimistic change on failure
        set((state) => ({
          customers: currentCustomers,
        }));
      }
    } catch (err) {
      // Revert optimistic change on failure
      set({ customers: currentCustomers });
    }
  },
}));
