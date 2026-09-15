'use client';

import React, { useState, useEffect } from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import PageLoader from '@/components/ui/PageLoader';

import DashboardView from '@/components/dashboard/DashboardView';
import ProductsView from '@/components/products/ProductsView';
import CategoriesView from '@/components/categories/CategoriesView';
import BookingsView from '@/components/bookings/BookingsView';
import CustomersView from '@/components/customers/CustomersView';
import PaymentsView from '@/components/payments/PaymentsView';
import ReturnsView from '@/components/returns/ReturnsView';
import InventoryView from '@/components/inventory/InventoryView';
import PricingView from '@/components/pricing/PricingView';
import CouponsView from '@/components/coupons/CouponsView';
import ReviewsView from '@/components/reviews/ReviewsView';
import AnalyticsView from '@/components/analytics/AnalyticsView';
import NotificationsView from '@/components/notifications/NotificationsView';
import AdminUsersView from '@/components/admin-users/AdminUsersView';
import SettingsView from '@/components/settings/SettingsView';

export default function Home() {
  const { activeTab } = useRentalStore();
  const [isLoading, setIsLoading] = useState(false);

  // Trigger smooth loading state on screen tab change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const renderActiveScreen = () => {
    if (isLoading) {
      const tabLabels: Record<string, string> = {
        dashboard: 'Dashboard Metrics',
        products: 'Fleet & Vehicle Catalog',
        categories: 'Vehicle Categories',
        bookings: 'Rental Orders',
        customers: 'Customer Profiles',
        payments: 'Transactions & Invoices',
        returns: 'Inspection Records',
        inventory: 'Inventory Matrix',
        pricing: 'Tariff Plans',
        coupons: 'Promotional Discounts',
        reviews: 'Customer Feedback',
        analytics: 'Financial Analytics',
        notifications: 'System Notifications',
        'admin-users': 'Admin Team Permissions',
        settings: 'System Configurations',
      };
      return <PageLoader message={`Fetching ${tabLabels[activeTab] || 'screen data'}...`} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'products':
        return <ProductsView />;
      case 'categories':
        return <CategoriesView />;
      case 'bookings':
        return <BookingsView />;
      case 'customers':
        return <CustomersView />;
      case 'payments':
        return <PaymentsView />;
      case 'returns':
        return <ReturnsView />;
      case 'inventory':
        return <InventoryView />;
      case 'pricing':
        return <PricingView />;
      case 'coupons':
        return <CouponsView />;
      case 'reviews':
        return <ReviewsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'notifications':
        return <NotificationsView />;
      case 'admin-users':
        return <AdminUsersView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
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
