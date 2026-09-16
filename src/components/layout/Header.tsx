'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRentalStore } from '@/store/useRentalStore';
import { useToast } from '@/context/ToastContext';
import {
  Search,
  Bell,
  Plus,
  ShieldCheck,
  ChevronDown,
  UserCheck,
  Car,
  User,
  Settings,
  LogOut,
} from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const { notifications, adminUsers } = useRentalStore();
  const { toast } = useToast();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const currentAdmin = adminUsers[0] || {
    name: 'Rajesh K. Varma',
    role: 'Super Admin',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
  };

  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    '/dashboard': {
      title: 'Platform Overview & Performance',
      subtitle: 'Real-time driver bookings, valet events, active subscriptions, and revenue metrics',
    },
    '/driver-bookings': {
      title: 'Driver Bookings Lifecycle',
      subtitle: 'Monitor and manage local and outstation driver bookings for customer vehicles',
    },
    '/driver-requests': {
      title: 'Driver Search & Dispatch Requests',
      subtitle: 'Live bookings searching for eligible nearby subscription-active drivers',
    },
    '/drivers': {
      title: 'Driver Directory & Verification',
      subtitle: 'Approve, reject, manage online/duty status, and monitor driver subscriptions',
    },
    '/drivers/pending': {
      title: 'Pending Driver Onboarding',
      subtitle: 'Review license documents and verify driver background applications',
    },
    '/drivers/approved': {
      title: 'Approved Active Drivers',
      subtitle: 'Active fleet roster with verified credentials and duty status',
    },
    '/drivers/online': {
      title: 'Online Duty Fleet',
      subtitle: 'Real-time active duty drivers ready for dispatch',
    },
    '/drivers/suspended': {
      title: 'Suspended Account Roster',
      subtitle: 'Blocked or suspended driver profiles requiring administrative review',
    },
    '/driver-subscription-plans': {
      title: 'Driver Subscription Plans',
      subtitle: 'Create and configure subscription passes (Basic, Premium, Professional)',
    },
    '/driver-subscriptions': {
      title: 'Driver Subscription Passes',
      subtitle: 'Track driver active passes, upcoming expirations, and subscription validity',
    },
    '/subscription-payments': {
      title: 'Subscription Payment Transactions',
      subtitle: 'Driver pass purchase transactions and payment gateway logs',
    },
    '/customers': {
      title: 'Customers',
      subtitle: 'Customer profiles, total spent, booking history, and account statuses',
    },
    '/valet-bookings': {
      title: 'Valet Event Bookings',
      subtitle: 'Event valet parking requests, venue locations, and staff requirements',
    },
    '/assignments': {
      title: 'Centralized Assignment Hub',
      subtitle: 'Dual management for Driver-on-Demand matching and Valet Event Staff allocation',
    },
    '/live-operations': {
      title: 'Live Operations Center',
      subtitle: 'Real-time monitoring of searching drivers, active trips, and ongoing valet events',
    },
    '/reviews': {
      title: 'Reviews & Ratings Moderation',
      subtitle: 'Customer ratings and feedback for Drivers and Valet Staff',
    },
    '/notifications': {
      title: 'Notification Center & Dispatch',
      subtitle: 'Broadcast alerts to Customers, Drivers, and Valet Staff',
    },
    '/admin-users': {
      title: 'Staff & Admin Team Management',
      subtitle: 'Manage administrative staff, operational roles, and team permissions',
    },
    '/profile': {
      title: 'Admin User Profile & Account Settings',
      subtitle: 'Personal information, security credentials, 2FA, and audit logs',
    },
    '/roles-permissions': {
      title: 'Roles & Permission Matrix',
      subtitle: 'Fine-grained access control matrix across all platform modules',
    },
    '/settings': {
      title: 'System & Platform Settings',
      subtitle: 'General business, driver eligibility, subscription, tax, and cancellation settings',
    },
  };

  const getHeaderInfo = () => {
    if (pageTitles[pathname]) return pageTitles[pathname];
    if (pathname.startsWith('/drivers/')) {
      return {
        title: 'Driver Detailed Profile',
        subtitle: 'DL verification documents, subscription status, earnings payout, and ratings',
      };
    }
    if (pathname.startsWith('/customers/')) {
      return {
        title: 'Customer Detailed Profile',
        subtitle: 'Customer contact, active bookings, payment history, and refunds',
      };
    }
    if (pathname.startsWith('/driver-bookings/')) {
      return {
        title: 'Driver Booking Details',
        subtitle: 'Vehicle information, customer info, driver assignment, timeline, and pricing split',
      };
    }
    return {
      title: 'DrivePulse & Valet Admin',
      subtitle: 'Manage drivers, valet staff, subscriptions, and platform bookings',
    };
  };

  const currentHeaderInfo = getHeaderInfo();

  return (
    <header className="h-16 bg-white border-b border-[#e7dbc5]/80 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Page Title & Subtitle */}
      <div>
        <h2 className="text-base font-bold text-[#023526] tracking-tight flex items-center gap-2">
          {currentHeaderInfo.title}
        </h2>
        <p className="text-[11px] text-slate-500 hidden sm:block">{currentHeaderInfo.subtitle}</p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Notifications Icon Button */}
        <Link
          href="/notifications"
          className="relative p-2 text-slate-600 hover:text-[#023526] hover:bg-[#faf8f5] rounded-lg transition-colors border border-transparent hover:border-[#e7dbc5]"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          )}
        </Link>

        <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

        {/* Admin Profile Smart Adjusting Popover */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2.5 p-1.5 hover:bg-[#faf8f5] rounded-lg transition-colors border border-transparent hover:border-[#e7dbc5] focus:outline-none"
            title="My Profile & Options"
          >
            <img
              src={currentAdmin.avatar}
              alt={currentAdmin.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#c5a880] shadow-xs"
            />
            <div className="hidden lg:block text-left">
              <h3 className="text-xs font-semibold text-slate-900 leading-none">{currentAdmin.name}</h3>
              <span className="text-[10px] text-[#9c7f56] font-bold">{currentAdmin.role}</span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 hidden lg:block transition-transform duration-200 ${
                isProfileMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Popover Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Header Info */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-950 to-[#023526] text-white border-b border-emerald-800">
                <div className="flex items-center gap-3">
                  <img
                    src={currentAdmin.avatar}
                    alt={currentAdmin.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-[#fcd34d] shadow-sm shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white tracking-tight truncate">{currentAdmin.name}</h4>
                    <p className="text-[10px] text-emerald-200 truncate">
                      {currentAdmin.email || 'rajesh.admin@drivervalet.com'}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-[#fcd34d] text-[#011f16] text-[9px] font-extrabold uppercase rounded">
                      {currentAdmin.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu Options */}
              <div className="p-1 space-y-0.5">
                <Link
                  href="/profile"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-primary hover:bg-emerald-50/70 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4 text-primary" /> My Profile & Security
                </Link>

                <Link
                  href="/admin-users"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-primary hover:bg-emerald-50/70 rounded-lg transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-[#9c7f56]" /> Staff & Admin Team
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-primary hover:bg-emerald-50/70 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-500" /> System Configurations
                </Link>
              </div>

              <div className="my-1 border-t border-slate-100" />

              {/* Logout Option */}
              <div className="p-1">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    toast.info('Logged Out Successfully', 'You have been signed out of the admin portal.');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-600" /> Log Out Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
