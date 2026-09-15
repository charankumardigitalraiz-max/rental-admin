export type ActiveTab =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'bookings'
  | 'customers'
  | 'payments'
  | 'returns'
  | 'inventory'
  | 'pricing'
  | 'coupons'
  | 'reviews'
  | 'analytics'
  | 'notifications'
  | 'admin-users'
  | 'settings';

export interface CarProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  year: number;
  licensePlate: string;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  transmission: 'Automatic' | 'Manual';
  seats: number;
  color: string;
  status: 'Available' | 'Rented' | 'Maintenance' | 'Reserved';
  mileage: number; // in km
  location: string;
  image: string;
  rating: number;
  reviewsCount: number;
  features: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  carCount: number;
  startingPrice: number;
  icon: string;
  status: 'Active' | 'Inactive';
}

export interface Booking {
  id: string;
  bookingNumber: string;
  carId: string;
  carName: string;
  carImage: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  aadhaarNumber?: string;
  driverLicenseNumber?: string;
  licenseExpiryDate?: string;
  emergencyContact?: string;
  idProofType?: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  dailyRate: number;
  securityDeposit: number;
  totalAmount: number;
  status: 'Pending' | 'Active' | 'Completed' | 'Cancelled';
  paymentStatus: 'Paid' | 'Pending' | 'Refunded' | 'Failed';
  pickupLocation: string;
  dropoffLocation: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  address: string;
  licenseNumber: string;
  licenseStatus: 'Verified' | 'Pending' | 'Rejected';
  totalBookings: number;
  totalSpent: number;
  rating: number;
  joinedDate: string;
  status: 'Active' | 'Blocked';
}

export interface Payment {
  id: string;
  transactionId: string;
  bookingId: string;
  customerName: string;
  amount: number;
  method: 'UPI' | 'NetBanking' | 'Credit Card' | 'Debit Card' | 'Razorpay' | 'Cash';
  status: 'Success' | 'Pending' | 'Failed' | 'Refunded';
  date: string;
  invoiceUrl: string;
}

export interface ReturnRecord {
  id: string;
  returnId: string;
  bookingId: string;
  carId: string;
  carName: string;
  customerName: string;
  expectedReturnDate: string;
  actualReturnDate: string;
  startingOdometer: number;
  endingOdometer: number;
  distanceDriven: number;
  fuelLevelBefore: string;
  fuelLevelAfter: string;
  damageReported: boolean;
  damageNotes?: string;
  extraCharges: number;
  inspectorName: string;
  status: 'Inspected' | 'Pending Inspection' | 'Disputed';
}

export interface InventoryItem {
  id: string;
  carId: string;
  carName: string;
  licensePlate: string;
  currentStatus: 'On Road' | 'In Garage' | 'Scheduled Maintenance' | 'Available at Yard';
  yardLocation: string;
  lastServiceDate: string;
  nextServiceDueDate: string;
  healthScore: number;
  fuelLevelPercent: number;
}

export interface PricingPlan {
  id: string;
  title: string;
  category: string;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  weekendSurgePercent: number;
  freeKmPerDay: number;
  extraKmRate: number;
  securityDeposit: number;
  status: 'Active' | 'Draft';
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'Percentage' | 'Fixed';
  discountValue: number;
  minRentalAmount: number;
  maxDiscount?: number;
  usageCount: number;
  maxUsage: number;
  validFrom: string;
  validUntil: string;
  status: 'Active' | 'Expired' | 'Scheduled';
}

export interface Review {
  id: string;
  customerName: string;
  customerAvatar: string;
  carName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'Approved' | 'Pending' | 'Hidden';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'booking' | 'payment' | 'maintenance' | 'system' | 'return';
  read: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: 'Super Admin' | 'Fleet Manager' | 'Booking Manager' | 'Support Agent';
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

export interface SystemSettings {
  storeName: string;
  currencySymbol: string;
  currencyCode: string;
  taxRatePercent: number;
  supportPhone: string;
  supportEmail: string;
  address: string;
  autoApproveBookings: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}
