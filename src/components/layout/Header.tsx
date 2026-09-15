'use client';

import React from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import { Search, Bell, Plus, ShieldCheck, ChevronDown, Sparkles } from 'lucide-react';

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
    dashboard: { title: 'Dashboard Overview', subtitle: 'Live car rental performance metrics & business activity' },
    products: { title: 'Products / Vehicles', subtitle: 'Manage fleet inventory, specifications, and daily rates' },
    categories: { title: 'Vehicle Categories', subtitle: 'Organize fleet by vehicle segment and pricing tiers' },
    bookings: { title: 'Rental Orders & Bookings', subtitle: 'Track active trips, pending requests, and completion' },
    customers: { title: 'Customer Directory', subtitle: 'Driver license verifications and rental history' },
    payments: { title: 'Payment Transactions', subtitle: 'Real-time UPI, NetBanking, and Card payment logs' },
    returns: { title: 'Returns & Vehicle Inspection', subtitle: 'Odometer checks, fuel levels, and damage logs' },
    inventory: { title: 'Inventory & Availability Matrix', subtitle: 'Live vehicle yard status and service schedules' },
    pricing: { title: 'Pricing & Rental Plans', subtitle: 'Base rates, weekend surges, and deposit rules in ₹' },
    coupons: { title: 'Coupons & Discount Codes', subtitle: 'Promotional campaigns, referral offers, and usage' },
    reviews: { title: 'Customer Reviews & Feedback', subtitle: 'Ratings, customer testimonials, and moderation' },
    analytics: { title: 'Reports & Revenue Analytics', subtitle: 'Financial breakdowns, utilization rates, and trends' },
    notifications: { title: 'System Notifications', subtitle: 'Alerts, maintenance schedules, and booking logs' },
    'admin-users': { title: 'Admin Users & Access Roles', subtitle: 'Team permissions, access control, and staff accounts' },
    settings: { title: 'Store & System Settings', subtitle: 'Configure currency (₹), taxes, contacts, and rules' },
  };

  const currentHeaderInfo = pageTitles[activeTab] || {
    title: 'Car Rental Admin',
    subtitle: 'Manage rentals, fleet, and customer bookings',
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Page Title & Subtitle */}
      <div>
        <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
          {currentHeaderInfo.title}
        </h2>
        <p className="text-[11px] text-slate-500 hidden sm:block">{currentHeaderInfo.subtitle}</p>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search cars, booking IDs, customers, coupons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Add Action */}
        <button
          onClick={() => setActiveTab('products')}
          className="hidden sm:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Manage Fleet</span>
        </button>

        {/* Notifications Icon Button */}
        <button
          onClick={() => setActiveTab('notifications')}
          className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          )}
        </button>

        <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

        {/* Admin Profile */}
        <div className="flex items-center gap-2.5 cursor-pointer p-1 hover:bg-slate-50 rounded-lg transition-colors">
          <img
            src={currentAdmin.avatar}
            alt={currentAdmin.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-100"
          />
          <div className="hidden lg:block text-left">
            <h3 className="text-xs font-semibold text-slate-900 leading-none">{currentAdmin.name}</h3>
            <span className="text-[10px] text-blue-600 font-medium">{currentAdmin.role}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
        </div>
      </div>
    </header>
  );
}
