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
  | 'customer-vehicles'
  | 'customer-vehicle-details'
  | 'damage-claims'
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
  | 'pricing'
  | 'payouts'
  | 'disputes'
  | 'wallet'
  | 'admin-users'
  | 'roles-permissions'
  | 'settings';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userType: 'Customer' | 'Driver' | 'Valet Staff';
  userName: string;
  userPhone: string;
  userAvatar: string;
  bookingNumber?: string;
  issueType: 'Damage Claim' | 'Cancellation Dispute' | 'Payment Issue' | 'Driver Conduct' | 'Lost Item' | 'Other';
  priority: 'High' | 'Medium' | 'Low' | 'Urgent';
  status: 'Open' | 'Under Investigation' | 'Resolved' | 'Closed';
  description: string;
  createdAt: string;
  assignedAdmin?: string;
  resolutionNotes?: string;
}

export interface DriverPayoutRecord {
  id: string;
  payoutNumber: string;
  driverOrStaffId: string;
  driverOrStaffName: string;
  driverOrStaffPhone: string;
  driverOrStaffAvatar: string;
  role: 'Driver' | 'Valet Staff';
  period: string;
  totalTripsOrEvents: number;
  grossAmount: number;
  platformCommission: number;
  taxDeducted: number;
  netPayout: number;
  bankAccount: string;
  status: 'Pending Approval' | 'Processing' | 'Completed' | 'Failed';
  processedDate?: string;
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

export type DriverBookingStatus =
  | 'Pending'
  | 'Active'
  | 'Searching Driver'
  | 'Driver Assigned'
  | 'Driver Arriving'
  | 'Service Started'
  | 'Completed'
  | 'Cancelled'
  | 'Rejected'
  | 'No Driver Found';

export interface RejectedDriver {
  _id?: string;
  driverId: string;
  reason?: string;
  rejectTime?: string;
  driver?: {
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
  };
}

export type Booking = DriverBooking;

export interface DriverBooking {
  id: string;
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAvatar: string;
  customerId?: string;
  userId?: string;
  bookingType: 'Local' | 'Outstation' | 'Valet' | string;
  serviceCategory?: 'driver' | 'valet';
  detailsUrl?: string;
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
  _id?: string;
  bookingId?: string;
  rawBookingStatus?: string;
  cancellationReason?: string;
  cancelledBy?: string | null;
  cancelledAt?: string | null;
  rejectedDrivers?: RejectedDriver[];
  adminNotes?: string;
  userNotes?: string;
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
    idProofImageBack?: string;
    pancardNumber?: string;
    pancard?: string;
    aadhaarNumber?: string;
    aadhaarCardFront?: string;
    aadhaarCardBack?: string;
    passportId?: string;
    passport?: string;
  };
  pancardNumber?: string;
  pancard?: string;
  aadhaarNumber?: string;
  aadhaarCardFront?: string;
  aadhaarCardBack?: string;
  passportId?: string;
  passport?: string;
  bankDetails?: {
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    upiId?: string;
    passbookImage?: string;
    status?: string;
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
  _id?: string;
  name: string;
  planName?: string;
  description?: string;
  price: number;
  durationDays: number;
  billingCycle?: string;
  localEligible: boolean;
  outstationEligible: boolean;
  maxRequestsPerDay: number;
  features: string[];
  status: 'Active' | 'Inactive';
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DriverSubscription {
  id: string;
  driverId: string;
  driverName: string;
  driverAvatar: string;
  driverMongoId?: string;
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
  assignedStaffDetails?: {
    id: string;
    name: string;
    phone?: string;
    driverId?: string;
    avatar?: string;
    rating?: number;
  }[];
  status: ValetBookingStatus;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded' | string;
  paymentMethod?: string;
  specialInstructions?: string;
  adminNotes?: string;
  cancellationReason?: string;
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
  staffId?: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  rating: number;
  experienceYears: number;
  location: string;
  assignedEventsCount: number;
  status: 'Available' | 'Assigned' | 'On Duty' | 'Offline' | 'Suspended';
  idProofType?: 'Aadhaar Card' | 'PAN Card' | 'Voter ID' | 'Driving License' | 'Passport' | string;
  idProofNumber?: string;
  idProofImage?: string;
  idProofFrontImage?: string;
  idProofBackImage?: string;
  aadhaarNumber?: string;
  aadhaarCardImage?: string;
  aadhaarCardFront?: string;
  aadhaarCardBack?: string;
  drivingLicenseNumber?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  address?: string;
  currentAssignment?: {
    bookingId: string;
    eventName: string;
    venue: string;
    status?: string;
    eventDate?: string;
  };
  bookings?: ValetBooking[];
  bookingsPagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  bookingCounts?: {
    all: number;
    active: number;
    completed: number;
    cancelled: number;
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
  mongoId?: string;
  custId?: string;
  firstName?: string;
  lastName?: string;
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

export interface ValetParkingPricingTier {
  person: number;
  hours: number;
  customerprice: number;
  driverprice: number;
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
  _id?: string;
  targetAudience: 'Customers' | 'Drivers' | 'Valet Staff' | 'All' | 'Custom';
  type: 'Booking' | 'Subscription' | 'Payment' | 'Cancellation' | 'Assignment' | 'General' | 'Alert';
  title: string;
  message: string;
  sentAt?: string;
  read?: boolean;
  status?: 'sent' | 'failed' | 'scheduled';
  successCount?: number;
  failureCount?: number;
  fcmMessageId?: string;
  errorDetails?: string;
  targetType?: 'topic' | 'token' | 'user' | 'broadcast';
  topic?: string;
  imageUrl?: string;
  sentBy?: string;
  createdAt?: string;
  data?: Record<string, string>;
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

export interface CustomerVehicle {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  regNumber: string;
  make: string;
  model: string;
  year: number;
  transmission: 'Manual' | 'Automatic';
  fuelType: 'Petrol' | 'Diesel' | 'EV' | 'CNG';
  insuranceExpiry: string;
  insuranceProvider: string;
  policyNumber: string;
  authorized: boolean;
  status: 'Active' | 'Under Review' | 'Expired Insurance' | 'Suspended';
  vehicleImages?: string[];
  rcImage?: string;
  rcNumber?: string;
}

export interface VehicleInspectionEvidence {
  id: string;
  bookingId: string;
  bookingNumber: string;
  type: 'Pre-Trip' | 'Post-Trip';
  odometerReading: number;
  fuelLevelPercent: number;
  exteriorPhotos: string[];
  interiorPhotos: string[];
  dashboardPhoto: string;
  existingScratches: string[];
  recordedAt: string;
  recordedByDriverName: string;
  verifiedByCustomer: boolean;
}

export interface DamageClaim {
  id: string;
  claimNumber: string;
  bookingId: string;
  bookingNumber: string;
  customerName: string;
  customerPhone: string;
  driverName: string;
  driverPhone: string;
  vehicleRegNumber: string;
  vehicleModel: string;
  incidentDate: string;
  damageDescription: string;
  preTripPhotoRef: string;
  postTripPhotoRef: string;
  estimatedRepairCost: number;
  insurerNotified: boolean;
  payoutHoldStatus: boolean;
  status: 'Open' | 'Under Review' | 'Approved' | 'Rejected' | 'Settled';
  createdAt: string;
}
