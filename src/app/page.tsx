'use client';

import React, { useState, useEffect } from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import PageLoader from '@/components/ui/PageLoader';
import { ActiveTab } from '@/types';

import DashboardView from '@/components/dashboard/DashboardView';
import LiveOperationsView from '@/components/live-operations/LiveOperationsView';
import AssignmentsView from '@/components/assignments/AssignmentsView';
import DriverBookingsView from '@/components/driver-bookings/DriverBookingsView';
import DriverBookingDetailsView from '@/components/driver-bookings/DriverBookingDetailsView';
import DriverRequestsView from '@/components/driver-requests/DriverRequestsView';
import DriversView from '@/components/drivers/DriversView';
import DriverDetailsView from '@/components/drivers/DriverDetailsView';
import DriverSubscriptionPlansView from '@/components/driver-subscription-plans/DriverSubscriptionPlansView';
import DriverSubscriptionsView from '@/components/driver-subscriptions/DriverSubscriptionsView';
import SubscriptionPaymentsView from '@/components/subscription-payments/SubscriptionPaymentsView';
import CustomersView from '@/components/customers/CustomersView';
import CustomerDetailsView from '@/components/customers/CustomerDetailsView';
import ValetBookingsView from '@/components/valet-bookings/ValetBookingsView';
import ReviewsView from '@/components/reviews/ReviewsView';
import NotificationsView from '@/components/notifications/NotificationsView';
import AdminUsersView from '@/components/admin-users/AdminUsersView';
import RolesPermissionsView from '@/components/roles-permissions/RolesPermissionsView';
import SettingsView from '@/components/settings/SettingsView';

const VALID_TABS: ActiveTab[] = [
  'dashboard',
  'driver-bookings',
  'driver-booking-details',
  'driver-requests',
  'drivers',
  'drivers-pending',
  'drivers-approved',
  'drivers-online',
  'drivers-suspended',
  'driver-details',
  'driver-subscription-plans',
  'driver-subscriptions',
  'subscription-payments',
  'customers',
  'customer-details',
  'valet-bookings',
  'valet-booking-details',
  'valet-staff',
  'valet-staff-details',
  'assignments',
  'live-operations',
  'local-pricing',
  'outstation-pricing',
  'valet-pricing',
  'pricing-rules',
  'payments',
  'driver-earnings',
  'platform-revenue',
  'refunds',
  'reviews',
  'notifications',
  'reports',
  'admin-users',
  'roles-permissions',
  'settings',
];

export default function Home() {
  const { activeTab, setActiveTab } = useRentalStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Helper to extract valid tab from URL query params or localStorage
  const getInitialTab = (): ActiveTab => {
    if (typeof window === 'undefined') return 'dashboard';
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as ActiveTab;
    if (tabParam && VALID_TABS.includes(tabParam)) {
      return tabParam;
    }
    const saved = localStorage.getItem('rental_active_tab') as ActiveTab;
    if (saved && VALID_TABS.includes(saved)) {
      return saved;
    }
    return 'dashboard';
  };

  // Initial mount: restore activeTab from URL / localStorage & setup popstate listener for back/forward browser navigation
  useEffect(() => {
    const initialTab = getInitialTab();
    if (initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
    setIsMounted(true);

    const handlePopState = () => {
      const currentParams = new URLSearchParams(window.location.search);
      const tabParam = currentParams.get('tab') as ActiveTab;
      if (tabParam && VALID_TABS.includes(tabParam)) {
        setActiveTab(tabParam);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Whenever activeTab changes: sync URL query parameter (?tab=...) & localStorage
  useEffect(() => {
    if (!isMounted) return;

    // Save to localStorage
    localStorage.setItem('rental_active_tab', activeTab);

    // Update URL parameter without triggering full page reload
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('tab') !== activeTab) {
        url.searchParams.set('tab', activeTab);
        window.history.replaceState(null, '', url.pathname + url.search);
      }
    }

    // Trigger page loader transition effect
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [activeTab, isMounted]);

  const renderActiveScreen = () => {
    if (isLoading) {
      const tabLabels: Partial<Record<ActiveTab, string>> = {
        dashboard: 'Platform Dashboard',
        'driver-bookings': 'Driver Bookings Management',
        'driver-booking-details': 'Driver Booking Lifecycle',
        'driver-requests': 'Driver Dispatch & Requests',
        drivers: 'Driver Directory & Verification',
        'driver-details': 'Driver Profile & Earnings',
        'driver-subscription-plans': 'Subscription Plans',
        'driver-subscriptions': 'Driver Active Passes',
        'subscription-payments': 'Subscription Payment Logs',
        customers: 'Customer Directory',
        'customer-details': 'Customer Profile & History',
        'valet-bookings': 'Valet Event Bookings',
        'valet-booking-details': 'Valet Event Assignment',
        'valet-staff': 'Valet Staff Roster',
        'valet-staff-details': 'Valet Staff Profile',
        assignments: 'Centralized Dispatch & Assignments',
        'live-operations': 'Live Operations Center',
        'local-pricing': 'Local Driver Pricing Configuration',
        'outstation-pricing': 'Outstation Driver Pricing',
        'valet-pricing': 'Valet Staff Event Pricing',
        'pricing-rules': 'Dynamic Pricing & Surge Rules',
        payments: 'All Platform Transactions',
        'driver-earnings': 'Driver Payout & Net Revenue',
        'platform-revenue': 'Platform Revenue Breakdown',
        refunds: 'Refund Requests',
        reviews: 'Reviews & Rating Moderation',
        notifications: 'System Notification Center',
        reports: 'Analytics & Financial Reports',
        'admin-users': 'Admin Team Management',
        'roles-permissions': 'Role Permissions Matrix',
        settings: 'System Configurations',
      };
      return <PageLoader message={`Fetching ${tabLabels[activeTab] || 'screen data'}...`} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'live-operations':
        return <LiveOperationsView />;
      case 'assignments':
        return <AssignmentsView />;
      case 'driver-bookings':
        return <DriverBookingsView />;
      case 'driver-booking-details':
        return <DriverBookingDetailsView />;
      case 'driver-requests':
        return <DriverRequestsView />;
      case 'drivers':
      case 'drivers-pending':
      case 'drivers-approved':
      case 'drivers-online':
      case 'drivers-suspended':
        return <DriversView />;
      case 'driver-details':
        return <DriverDetailsView />;
      case 'driver-subscription-plans':
        return <DriverSubscriptionPlansView />;
      case 'driver-subscriptions':
        return <DriverSubscriptionsView />;
      case 'subscription-payments':
        return <SubscriptionPaymentsView />;
      case 'customers':
        return <CustomersView />;
      case 'customer-details':
        return <CustomerDetailsView />;
      case 'valet-bookings':
        return <ValetBookingsView />;
      case 'reviews':
        return <ReviewsView />;
      case 'notifications':
        return <NotificationsView />;
      case 'admin-users':
        return <AdminUsersView />;
      case 'roles-permissions':
        return <RolesPermissionsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">{renderActiveScreen()}</main>
      </div>
    </div>
  );
}
