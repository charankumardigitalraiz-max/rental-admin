'use client';

import React from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import { Search, Bell, Plus, ShieldCheck, ChevronDown, UserCheck, Car } from 'lucide-react';

export default function Header() {
  const { activeTab, setActiveTab, searchQuery, setSearchQuery, notifications, adminUsers } =
    useRentalStore();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const currentAdmin = adminUsers[0] || {
    name: 'Rajesh K. Varma',
    role: 'Super Admin',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
  };

  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Platform Overview & Performance',
      subtitle: 'Real-time driver bookings, valet events, active subscriptions, and revenue metrics',
    },
    'driver-bookings': {
      title: 'Driver Bookings Lifecycle',
      subtitle: 'Monitor and manage local and outstation driver bookings for customer vehicles',
    },
    'driver-booking-details': {
      title: 'Driver Booking Details',
      subtitle: 'Vehicle information, customer info, driver assignment, timeline, and pricing split',
    },
    'driver-requests': {
      title: 'Driver Search & Dispatch Requests',
      subtitle: 'Live bookings searching for eligible nearby subscription-active drivers',
    },
    drivers: {
      title: 'Driver Directory & Verification',
      subtitle: 'Approve, reject, manage online/duty status, and monitor driver subscriptions',
    },
    'driver-details': {
      title: 'Driver Full Profile',
      subtitle: 'DL verification documents, subscription status, earnings payout, and ratings',
    },
    'driver-subscription-plans': {
      title: 'Driver Subscription Plans',
      subtitle: 'Create and configure subscription passes (Basic, Premium, Professional)',
    },
    'driver-subscriptions': {
      title: 'Driver Subscription Passes',
      subtitle: 'Track driver active passes, upcoming expirations, and subscription validity',
    },
    'subscription-payments': {
      title: 'Subscription Payment Transactions',
      subtitle: 'Driver pass purchase transactions and payment gateway logs',
    },
    customers: {
      title: 'Customer Directory',
      subtitle: 'Customer profiles, total spent, booking history, and account statuses',
    },
    'customer-details': {
      title: 'Customer Detailed Profile',
      subtitle: 'Customer contact, active bookings, payment history, and refunds',
    },
    'valet-bookings': {
      title: 'Valet Event Bookings',
      subtitle: 'Event valet parking requests, venue locations, and staff requirements',
    },
    'valet-booking-details': {
      title: 'Valet Event Details & Staff Duty',
      subtitle: 'Event specs, staff quota fulfillment, and staff assignment management',
    },
    'valet-staff': {
      title: 'Valet Parking Staff Roster',
      subtitle: 'Manage valet staff availability, current event duty, and performance ratings',
    },
    'valet-staff-details': {
      title: 'Valet Staff Profile & Attendance',
      subtitle: 'Staff event duty history, ratings, and payout earnings',
    },
    assignments: {
      title: 'Centralized Assignment Hub',
      subtitle: 'Dual management for Driver-on-Demand matching and Valet Event Staff allocation',
    },
    'live-operations': {
      title: 'Live Operations Center',
      subtitle: 'Real-time monitoring of searching drivers, active trips, and ongoing valet events',
    },
    'local-pricing': {
      title: 'Local Driver Pricing Configuration',
      subtitle: 'Base fare, hourly rate, waiting charges, night allowance, and fare preview',
    },
    'outstation-pricing': {
      title: 'Outstation Driver Pricing Rules',
      subtitle: 'Per-day rates, per-km charges, driver food allowance, and platform split',
    },
    'valet-pricing': {
      title: 'Valet Parking Staff Pricing',
      subtitle: 'Staff hourly rates, min staff requirements, event surge rates, and payouts',
    },
    'pricing-rules': {
      title: 'Dynamic Pricing & Surge Rules',
      subtitle: 'Configure peak hours, weekend surges, holiday rates, and event multipliers',
    },
    payments: {
      title: 'Transactions & Invoices',
      subtitle: 'Complete transaction audit logs for driver trips, valet events, and subscriptions',
    },
    'driver-earnings': {
      title: 'Driver Earnings & Payout Ledger',
      subtitle: 'Gross earnings, platform commission breakdown, and net driver payouts',
    },
    'platform-revenue': {
      title: 'Platform Net Revenue',
      subtitle: 'Financial gross booking value, driver payouts, valet payouts, and net commission',
    },
    refunds: {
      title: 'Customer Refund Management',
      subtitle: 'Process cancellation refund requests, dispute reviews, and status approvals',
    },
    reviews: {
      title: 'Reviews & Ratings Moderation',
      subtitle: 'Customer ratings and feedback for Drivers and Valet Staff',
    },
    notifications: {
      title: 'Notification Center & Dispatch',
      subtitle: 'Broadcast alerts to Customers, Drivers, and Valet Staff',
    },
    reports: {
      title: 'Platform Analytics & Reports',
      subtitle: 'Comprehensive performance reports, revenue exports, and utilization charts',
    },
    'admin-users': {
      title: 'Admin Team & Access Management',
      subtitle: 'Manage administrative users, operational roles, and team permissions',
    },
    'roles-permissions': {
      title: 'Roles & Permission Matrix',
      subtitle: 'Fine-grained access control matrix across all platform modules',
    },
    settings: {
      title: 'System & Platform Settings',
      subtitle: 'General business, driver eligibility, subscription, tax, and cancellation settings',
    },
  };

  const currentHeaderInfo = pageTitles[activeTab] || {
    title: 'DrivePulse & Valet Admin',
    subtitle: 'Manage drivers, valet staff, subscriptions, and platform bookings',
  };

  return (
    <header className="h-16 bg-white border-b border-stone-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Page Title & Subtitle */}
      <div>
        <h2 className="text-base font-bold text-[#064e3b] tracking-tight flex items-center gap-2">
          {currentHeaderInfo.title}
        </h2>
        <p className="text-[11px] text-slate-500 hidden sm:block">{currentHeaderInfo.subtitle}</p>
      </div>

      {/* Center Search Bar */}
      {/* <div className="flex-1 max-w-md mx-6 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search booking #, driver, valet staff, customer, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-slate-800 placeholder-slate-400 transition-all"
          />
        </div>
      </div> */}

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Add Action Buttons */}
        {/* <button
          onClick={() => setActiveTab('driver-bookings')}
          className="hidden sm:flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-all"
        >
          <Car className="w-3.5 h-3.5" />
          <span>Driver Booking</span>
        </button>

        <button
          onClick={() => setActiveTab('valet-bookings')}
          className="hidden md:flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-all"
        >
          <UserCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Valet Booking</span>
        </button> */}

        {/* Notifications Icon Button */}
        <button
          onClick={() => setActiveTab('notifications')}
          className="relative p-2 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          )}
        </button>

        <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

        {/* Admin Profile */}
        <div
          onClick={() => setActiveTab('admin-users')}
          className="flex items-center gap-2.5 cursor-pointer p-1 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <img
            src={currentAdmin.avatar}
            alt={currentAdmin.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-light"
          />
          <div className="hidden lg:block text-left">
            <h3 className="text-xs font-semibold text-slate-900 leading-none">{currentAdmin.name}</h3>
            <span className="text-[10px] text-primary font-medium">{currentAdmin.role}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
        </div>
      </div>
    </header>
  );
}
