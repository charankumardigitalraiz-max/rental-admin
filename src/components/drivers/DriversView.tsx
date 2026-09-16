'use client';

import React, { useState } from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import Link from 'next/link';
import DataTable, { Column } from '@/components/ui/DataTable';
import { Driver } from '@/types';
import {
  Car,
  Search,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Award,
  Eye,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Users,
} from 'lucide-react';

interface DriversViewProps {
  filter?: string;
}

export default function DriversView({ filter }: DriversViewProps = {}) {
  const {
    activeTab,
    drivers,
    approveDriver,
    rejectDriver,
    suspendDriver,
    activateDriver,
    setActiveTab,
    setSelectedDriverId,
  } = useRentalStore();

  const [activeTabFilter, setActiveTabFilter] = useState<string>('All');

  // Determine effective filter status
  let effectiveStatus = activeTabFilter;
  if (filter === 'pending' || activeTab === 'drivers-pending') effectiveStatus = 'Pending Approval';
  else if (filter === 'approved' || activeTab === 'drivers-approved') effectiveStatus = 'Approved';
  else if (filter === 'online' || activeTab === 'drivers-online') effectiveStatus = 'Online';
  else if (filter === 'suspended' || activeTab === 'drivers-suspended') effectiveStatus = 'Suspended';

  const isDedicatedScreen = !!filter || activeTab !== 'drivers';

  const filterTabs = [
    'All',
    'Pending Approval',
    'Approved',
    'Online',
    'Offline',
    'Available',
    'Busy',
    'Suspended',
    'Rejected',
  ];

  const filteredDrivers = drivers.filter((d) => {
    switch (effectiveStatus) {
      case 'Pending Approval':
        return d.status === 'Pending Approval';
      case 'Approved':
        return d.status === 'Approved';
      case 'Online':
        return d.dutyStatus === 'Online';
      case 'Offline':
        return d.dutyStatus === 'Offline';
      case 'Available':
        return d.availability === 'Available';
      case 'Busy':
        return d.availability === 'Busy';
      case 'Suspended':
        return d.status === 'Suspended' || d.status === 'Rejected';
      case 'Rejected':
        return d.status === 'Rejected';
      default:
        return true;
    }
  });

  const columns: Column<Driver>[] = [
    {
      key: 'name',
      header: 'Driver Profile',
      render: (d) => (
        <div className="flex items-center gap-3">
          <img src={d.avatar} alt={d.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 shrink-0" />
          <div>
            <div className="font-bold text-slate-900">{d.name}</div>
            <div className="text-[10px] text-slate-400">{d.phone} • ⭐ {d.rating}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (d) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            d.status === 'Approved'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : d.status === 'Pending Approval'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : d.status === 'Suspended'
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {d.status}
        </span>
      ),
    },
    {
      key: 'dutyStatus',
      header: 'Duty / Availability',
      render: (d) => (
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              d.dutyStatus === 'Online' ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          ></span>
          <span className="font-semibold text-slate-800">{d.dutyStatus}</span>
          <span className="text-[10px] text-slate-400">({d.availability})</span>
        </div>
      ),
    },
    {
      key: 'subscription',
      header: 'Subscription Pass',
      render: (d) =>
        d.subscription.status !== 'None' ? (
          <div>
            <span className="font-bold text-slate-900 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" /> {d.subscription.planName}
            </span>
            <span
              className={`text-[10px] font-semibold ${
                d.subscription.status === 'Active'
                  ? 'text-emerald-600'
                  : d.subscription.status === 'Expiring Soon'
                  ? 'text-amber-600 font-bold'
                  : 'text-rose-600'
              }`}
            >
              {d.subscription.status} (Exp: {d.subscription.expiryDate})
            </span>
          </div>
        ) : (
          <span className="text-rose-600 font-bold text-[10px] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            No Subscription Pass
          </span>
        ),
    },
    {
      key: 'verification',
      header: 'DL Verification',
      render: (d) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            d.verification.status === 'Verified'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {d.verification.status} ({d.verification.licenseNumber})
        </span>
      ),
    },
    {
      key: 'completedBookings',
      header: 'Completed Trips',
      render: (d) => <span className="font-bold text-slate-900">{d.completedBookings} Trips</span>,
    },
    {
      key: 'earnings',
      header: 'Total Earnings',
      render: (d) => (
        <span className="font-bold text-slate-900">
          ₹{d.earnings.total.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (d) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/drivers/${d.id}`}
            className="p-1.5 text-primary hover:bg-primary-light rounded transition-colors inline-block"
            title="View Driver Details"
          >
            <Eye className="w-4 h-4" />
          </Link>

          {d.status === 'Pending Approval' && (
            <>
              <button
                onClick={() => approveDriver(d.id)}
                className="px-2 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded shadow-xs"
                title="Approve Driver"
              >
                Approve
              </button>
              <button
                onClick={() => rejectDriver(d.id)}
                className="px-2 py-1 bg-rose-600 text-white text-[10px] font-bold rounded shadow-xs"
                title="Reject Driver"
              >
                Reject
              </button>
            </>
          )}

          {d.status === 'Approved' && (
            <button
              onClick={() => suspendDriver(d.id)}
              className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded shadow-xs"
              title="Suspend Driver"
            >
              Suspend
            </button>
          )}

          {d.status === 'Suspended' && (
            <button
              onClick={() => activateDriver(d.id)}
              className="px-2 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded shadow-xs"
              title="Re-activate Driver"
            >
              Activate
            </button>
          )}
        </div>
      ),
    },
  ];

  // Dynamic Header Info per Screen Tab
  let headerTag = 'Driver Management • Fleet Directory';
  let headerTitle = 'All Driver Profiles & Fleet Roster';
  let headerSubtitle = 'Manage driver accounts, background verification status, duty availability, and pass subscriptions.';

  if (filter === 'pending' || activeTab === 'drivers-pending') {
    headerTag = 'Driver Onboarding • Verification Queue';
    headerTitle = 'Pending Driver Applications';
    headerSubtitle = 'Review driving license documents, ID proofs, and approve or reject driver onboarding requests.';
  } else if (filter === 'approved' || activeTab === 'drivers-approved') {
    headerTag = 'Active Fleet • Verified Drivers';
    headerTitle = 'Approved & Active Driver Directory';
    headerSubtitle = 'Monitor active subscription passes, completed trips, and driver profile details.';
  } else if (filter === 'online' || activeTab === 'drivers-online') {
    headerTag = 'Live Duty • Dispatch Roster';
    headerTitle = 'Online Duty Drivers';
    headerSubtitle = 'Real-time duty availability, GPS locations, and current trip assignment status.';
  } else if (filter === 'suspended' || activeTab === 'drivers-suspended') {
    headerTag = 'Account Security • Blocked Fleet';
    headerTitle = 'Suspended & Rejected Driver Accounts';
    headerSubtitle = 'Manage blocked drivers, failed DL verifications, and reactivate accounts.';
  }

  // Dynamic Metrics depending on Screen Tab
  const pendingDrivers = drivers.filter((d) => d.status === 'Pending Approval');
  const approvedDrivers = drivers.filter((d) => d.status === 'Approved');
  const onlineDrivers = drivers.filter((d) => d.dutyStatus === 'Online');
  const suspendedDrivers = drivers.filter((d) => d.status === 'Suspended' || d.status === 'Rejected');

  const renderTopStats = () => {
    if (filter === 'pending' || activeTab === 'drivers-pending') {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Pending Applications</span>
            <h3 className="text-xl font-bold mt-1 text-amber-700">{pendingDrivers.length}</h3>
            <p className="text-[10px] text-amber-600 mt-0.5">Awaiting verification</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">DL Verified</span>
            <h3 className="text-xl font-bold mt-1 text-emerald-700">{pendingDrivers.filter(d => d.verification.status === 'Verified').length}</h3>
            <p className="text-[10px] text-emerald-600 mt-0.5">Ready for final approval</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">DL Review Pending</span>
            <h3 className="text-xl font-bold mt-1 text-sky-700">{pendingDrivers.filter(d => d.verification.status === 'Pending').length}</h3>
            <p className="text-[10px] text-sky-600 mt-0.5">Documents under review</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Required Action</span>
            <h3 className="text-xl font-bold mt-1 text-rose-700">{pendingDrivers.length} Drivers</h3>
            <p className="text-[10px] text-rose-600 mt-0.5">Approve or Reject</p>
          </div>
        </div>
      );
    }

    if (filter === 'approved' || activeTab === 'drivers-approved') {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Approved Fleet</span>
            <h3 className="text-xl font-bold mt-1 text-emerald-700">{approvedDrivers.length}</h3>
            <p className="text-[10px] text-emerald-600 mt-0.5">Fully verified drivers</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active Subscriptions</span>
            <h3 className="text-xl font-bold mt-1 text-emerald-700">{approvedDrivers.filter(d => d.subscription.status === 'Active').length}</h3>
            <p className="text-[10px] text-emerald-600 mt-0.5">Eligible for bookings</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Expiring Passes</span>
            <h3 className="text-xl font-bold mt-1 text-amber-700">{approvedDrivers.filter(d => d.subscription.status === 'Expiring Soon').length}</h3>
            <p className="text-[10px] text-amber-600 mt-0.5">Requires pass renewal</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Completed Trips</span>
            <h3 className="text-xl font-bold mt-1 text-slate-900">{approvedDrivers.reduce((acc, d) => acc + d.completedBookings, 0)} Trips</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Lifetime fulfilled</p>
          </div>
        </div>
      );
    }

    if (filter === 'online' || activeTab === 'drivers-online') {
      const avgRating = onlineDrivers.length > 0 ? (onlineDrivers.reduce((a, b) => a + b.rating, 0) / onlineDrivers.length).toFixed(1) : '5.0';
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Online Duty Fleet</span>
            <h3 className="text-xl font-bold mt-1 text-sky-700">{onlineDrivers.length}</h3>
            <p className="text-[10px] text-sky-600 mt-0.5">Currently active online</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Available Drivers</span>
            <h3 className="text-xl font-bold mt-1 text-emerald-700">{onlineDrivers.filter(d => d.availability === 'Available').length}</h3>
            <p className="text-[10px] text-emerald-600 mt-0.5">Ready for immediate dispatch</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">On Trip / Busy</span>
            <h3 className="text-xl font-bold mt-1 text-amber-700">{onlineDrivers.filter(d => d.availability === 'Busy').length}</h3>
            <p className="text-[10px] text-amber-600 mt-0.5">Fulfilling active booking</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Avg Duty Rating</span>
            <h3 className="text-xl font-bold mt-1 text-amber-600">⭐ {avgRating}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Active fleet rating</p>
          </div>
        </div>
      );
    }

    if (filter === 'suspended' || activeTab === 'drivers-suspended') {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Suspended Accounts</span>
            <h3 className="text-xl font-bold mt-1 text-amber-700">{drivers.filter(d => d.status === 'Suspended').length}</h3>
            <p className="text-[10px] text-amber-600 mt-0.5">Temporarily blocked</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Rejected Applications</span>
            <h3 className="text-xl font-bold mt-1 text-rose-700">{drivers.filter(d => d.status === 'Rejected').length}</h3>
            <p className="text-[10px] text-rose-600 mt-0.5">Failed DL verification</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Blocked Drivers</span>
            <h3 className="text-xl font-bold mt-1 text-slate-900">{suspendedDrivers.length}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Not eligible for duty</p>
          </div>
        </div>
      );
    }

    // Default 'drivers' (All Drivers) Stats Band
    return (
      <div className="card-white p-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 gap-4 sm:gap-0">
          <div className="sm:px-3 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Fleet</span>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-xl font-bold mt-1 text-slate-900">{drivers.length}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">All registered drivers</p>
          </div>

          <div className="sm:px-3 space-y-1 pt-3 sm:pt-0">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Approved</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold mt-1 text-emerald-700">{approvedDrivers.length}</h3>
            <p className="text-[10px] text-emerald-600 mt-0.5">Verified & active</p>
          </div>

          <div className="sm:px-3 space-y-1 pt-3 sm:pt-0">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Pending</span>
              <UserCheck className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold mt-1 text-amber-700">{pendingDrivers.length}</h3>
            <p className="text-[10px] text-amber-600 mt-0.5">Awaiting verification</p>
          </div>

          <div className="sm:px-3 space-y-1 pt-3 sm:pt-0">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Online Duty</span>
              <Car className="w-4 h-4 text-sky-600 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold mt-1 text-sky-700">{onlineDrivers.length}</h3>
            <p className="text-[10px] text-sky-600 mt-0.5">Ready for requests</p>
          </div>

          <div className="sm:px-3 space-y-1 pt-3 sm:pt-0">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Suspended</span>
              <UserX className="w-4 h-4 text-rose-500" />
            </div>
            <h3 className="text-xl font-bold mt-1 text-rose-700">{suspendedDrivers.length}</h3>
            <p className="text-[10px] text-rose-600 mt-0.5">Inactive or blocked</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Top Stats Band */}
      {renderTopStats()}

      <DataTable<Driver>
        columns={columns}
        data={filteredDrivers}
        keyExtractor={(d) => d.id}
        pageSize={8}
        searchPlaceholder="Search driver name, phone, email..."
        searchFilterKeys={['name', 'phone', 'email']}
        emptyMessage={`No drivers found for ${effectiveStatus === 'All' ? 'the current list' : effectiveStatus}.`}
        headerActions={
          !isDedicatedScreen ? (
            <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100/80 rounded-lg max-w-full">
              {filterTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTabFilter(tab)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTabFilter === tab
                      ? 'bg-white text-primary shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          ) : undefined
        }
      />
    </div>
  );
}
