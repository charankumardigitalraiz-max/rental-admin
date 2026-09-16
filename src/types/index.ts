export type ActiveTab =
  | 'dashboard'
  | 'driver-bookings'
  | 'driver-booking-details'
  | 'driver-requests'
  | 'drivers'
  | 'drivers-pending'
  | 'drivers-approved'
  | 'drivers-online'
  | 'drivers-suspended'
  | 'driver-details'
  | 'driver-subscription-plans'
  | 'driver-subscriptions'
  | 'subscription-payments'
  | 'customers'
  | 'customer-details'
  | 'valet-bookings'
  | 'valet-booking-details'
  | 'valet-staff'
  | 'valet-staff-details'
  | 'assignments'
  | 'live-operations'
  | 'local-pricing'
  | 'outstation-pricing'
  | 'valet-pricing'
  | 'pricing-rules'
  | 'payments'
  | 'driver-earnings'
  | 'platform-revenue'
  | 'refunds'
  | 'reviews'
  | 'notifications'
  | 'reports'
  | 'admin-users'
  | 'roles-permissions'
  | 'settings';

export type DriverBookingStatus =
  | 'Pending'
  | 'Active'
  | 'Searching Driver'
  | 'Driver Assigned'
  | 'Driver Arriving'
  | 'Service Started'
  | 'Completed'
  | 'Cancelled'
  | 'No Driver Found';

export type Booking = DriverBooking;

export interface DriverBooking {
  id: string;
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAvatar: string;
  bookingType: 'Local' | 'Outstation';
  pickupLocation: string;
  destinationLocation: string;
  bookingDate: string;
  bookingTime: string;
  durationHours: number;
  vehicleInfo: {
    type: string;
    model: string;
    plateNumber: string;
    fuelType: string;
    transmission: string;
  };
  status: DriverBookingStatus;
  carId?: string;
  carName?: string;
  carImage?: string;
  driverLicenseNumber?: string;
  licenseExpiryDate?: string;
  driverLicenseImage?: string;
  idProofType?: string;
  idProofImage?: string;
  aadhaarNumber?: string;
  emergencyContact?: string;
  startDate?: string;
  endDate?: string;
  totalDays?: number;
  totalAmount?: number;
  paymentStatus?: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverRating?: number;
  driverAvatar?: string;
  pricing: {
    baseAmount: number;
    durationCharge: number;
    typeCharge: number;
    extraCharges: number;
    discount: number;
    tax: number;
    totalCustomerAmount: number;
    driverEarnings: number;
    platformCommission: number;
  };
  timeline: {
    created: string;
    searching?: string;
    accepted?: string;
    assigned?: string;
    arrived?: string;
    started?: string;
    completed?: string;
  };
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  rating: number;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  status: 'Pending Approval' | 'Approved' | 'Rejected' | 'Suspended';
  dutyStatus: 'Online' | 'Offline';
  availability: 'Available' | 'Busy';
  subscription: {
    planId: string;
    planName: string;
    status: 'Active' | 'Expiring Soon' | 'Expired' | 'None';
    startDate: string;
    expiryDate: string;
    daysRemaining: number;
    localEligible: boolean;
    outstationEligible: boolean;
  };
  verification: {
    status: 'Verified' | 'Pending' | 'Rejected';
    licenseNumber: string;
    licenseExpiry: string;
    licenseImage: string;
    idProofType: string;
    idProofNumber: string;
    idProofImage: string;
  };
  earnings: {
    total: number;
    pending: number;
    paid: number;
  };
  currentLocation: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  localEligible: boolean;
  outstationEligible: boolean;
  maxRequestsPerDay: number;
  features: string[];
  status: 'Active' | 'Inactive';
}

export interface DriverSubscription {
  id: string;
  driverId: string;
  driverName: string;
  driverAvatar: string;
  planId: string;
  planName: string;
  startDate: string;
  expiryDate: string;
  amount: number;
  paymentStatus: 'Successful' | 'Pending' | 'Failed';
  subscriptionStatus: 'Active' | 'Expiring Soon' | 'Expired' | 'Cancelled' | 'Suspended';
  bookingsReceived: number;
  completedBookings: number;
}

export interface SubscriptionPayment {
  id: string;
  transactionId: string;
  driverId: string;
  driverName: string;
  planName: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  status: 'Successful' | 'Pending' | 'Failed' | 'Refunded';
}

export type ValetBookingStatus =
  | 'New Request'
  | 'Pending Assignment'
  | 'Partially Assigned'
  | 'Fully Assigned'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';

export interface ValetBooking {
  id: string;
  bookingNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventName: string;
  eventType: string;
  venue: string;
  venueAddress: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  requiredStaffCount: number;
  assignedStaffIds: string[];
  assignedStaffNames: string[];
  status: ValetBookingStatus;
  pricing: {
    pricePerStaff: number;
    totalBaseAmount: number;
    surgeAmount: number;
    tax: number;
    totalAmount: number;
    staffPayoutTotal: number;
    platformCommission: number;
  };
  timeline: {
    created: string;
    assignmentStarted?: string;
    fullyAssigned?: string;
    eventStarted?: string;
    completed?: string;
  };
}

export interface ValetStaff {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  rating: number;
  experienceYears: number;
  location: string;
  assignedEventsCount: number;
  status: 'Available' | 'Assigned' | 'On Duty' | 'Offline' | 'Suspended';
  currentAssignment?: {
    bookingId: string;
    eventName: string;
    venue: string;
  };
  earnings: {
    total: number;
    pending: number;
    paid: number;
  };
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  address: string;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalSpent: number;
  currentBooking?: string;
  status: 'Active' | 'Suspended';
  joinedDate: string;
}

export interface LocalPricingConfig {
  basePrice: number;
  minDurationHours: number;
  perHourPrice: number;
  additionalHourPrice: number;
  waitingChargePerHour: number;
  nightCharge: number;
  peakSurgePercent: number;
  platformCommissionPercent: number;
  driverSharePercent: number;
  taxPercent: number;
}

export interface OutstationPricingConfig {
  basePrice: number;
  minDurationDays: number;
  perDayRate: number;
  perKmRate: number;
  waitingChargePerHour: number;
  nightAllowancePerNight: number;
  driverFoodAllowancePerDay: number;
  platformCommissionPercent: number;
  driverSharePercent: number;
  taxPercent: number;
}

export interface ValetPricingConfig {
  pricePerStaffPerHour: number;
  minStaffRequirement: number;
  minDurationHours: number;
  additionalHourRatePerStaff: number;
  weekendSurgePercent: number;
  peakEventSurgePercent: number;
  platformCommissionPercent: number;
  staffPayoutPercent: number;
  taxPercent: number;
}

export interface PricingRule {
  id: string;
  ruleName: string;
  service: 'Local Driver' | 'Outstation Driver' | 'Valet Staff' | 'All';
  condition: string;
  type: 'Percentage' | 'Fixed';
  value: number;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Inactive';
}

export interface Transaction {
  id: string;
  transactionId: string;
  bookingId: string;
  serviceType: 'Driver Local' | 'Driver Outstation' | 'Valet Staff' | 'Subscription';
  customerOrDriverName: string;
  amount: number;
  method: string;
  payoutAmount: number;
  platformCommission: number;
  refundAmount: number;
  status: 'Success' | 'Pending' | 'Failed' | 'Refunded';
  date: string;
}

export interface DriverEarningRecord {
  driverId: string;
  driverName: string;
  completedBookings: number;
  grossEarnings: number;
  platformCommission: number;
  adjustments: number;
  netEarnings: number;
  pendingPayout: number;
  paidAmount: number;
}

export interface RefundRecord {
  id: string;
  bookingId: string;
  serviceType: string;
  customerName: string;
  originalAmount: number;
  refundAmount: number;
  reason: string;
  requestedDate: string;
  status: 'Requested' | 'Under Review' | 'Approved' | 'Processing' | 'Completed' | 'Rejected';
}

export interface ReviewRecord {
  id: string;
  reviewType: 'Driver' | 'Valet Staff';
  customerName: string;
  bookingNumber: string;
  targetName: string;
  rating: number;
  reviewText: string;
  date: string;
  status: 'Approved' | 'Flagged' | 'Hidden';
}

export interface NotificationRecord {
  id: string;
  targetAudience: 'Customers' | 'Drivers' | 'Valet Staff' | 'All';
  type: 'Booking' | 'Subscription' | 'Payment' | 'Cancellation' | 'Assignment' | 'General';
  title: string;
  message: string;
  sentAt: string;
  read?: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: 'Super Admin' | 'Operations Admin' | 'Finance Admin' | 'Driver Manager' | 'Valet Manager' | 'Support Staff';
  lastLogin: string;
  status: 'Active' | 'Inactive';
}

export interface SystemSettings {
  platformName: string;
  contactEmail: string;
  contactPhone: string;
  currencySymbol: string;
  autoDriverMatching: boolean;
  driverSubscriptionMandatory: boolean;
  minDriverRatingRequired: number;
  valetMinNoticeHours: number;
  valetHourlyRate: number;
  localDriverHourlyRate: number;
  outstationDriverHourlyRate: number;
  cancellationFreeWindowMins: number;
  cancellationFeePercent: number;
  gstTaxPercent: number;
}
