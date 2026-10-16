'use client';

import React, { useState, useEffect } from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import { useDriverStore } from '@/store/useDriverStore';
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
  Clock,
  AlertCircle,
  Star,
  Filter,
  ChevronDown,
} from 'lucide-react';

interface DriversViewProps {
  filter?: string;
}

const mapFilterToTab = (f?: string): string => {
  if (!f || f === 'all') return 'All';
  const lower = f.toLowerCase().trim();
  if (
    lower === 'pending' ||
    lower === 'pending approval' ||
    lower === 'pending-approval' ||
    lower === 'drivers-pending'
  ) {
    return 'Pending Approval';
  }
  if (lower === 'approved' || lower === 'verified' || lower === 'drivers-approved') {
    return 'Approved';
  }
  if (
    lower === 'online' ||
    lower === 'online duty' ||
    lower === 'duty' ||
    lower === 'drivers-online'
  ) {
    return 'Online';
  }
  if (
    lower === 'suspended' ||
    lower === 'rejected' ||
    lower === 'drivers-suspended'
  ) {
    return 'Suspended';
  }
  if (lower === 'offline') return 'Offline';
  if (lower === 'available') return 'Available';
  if (lower === 'busy') return 'Busy';
  return 'All';
};

export default function DriversView({ filter }: DriversViewProps = {}) {
  const {
    activeTab,
    drivers: fallbackDrivers,
    approveDriver,
    rejectDriver,
    suspendDriver,
    activateDriver,
    setActiveTab,
    setSelectedDriverId,
  } = useRentalStore();

  const {
    drivers: storeDrivers,
    pagination,
    counts,
    isLoading: isStoreLoading,
    fetchDrivers,
    updateDriverStatus,
  } = useDriverStore();

  const [activeTabFilter, setActiveTabFilter] = useState<string>(() =>
    mapFilterToTab(filter || activeTab)
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const mapTabToApiStatus = (tab: string): string => {
    switch (tab) {
      case 'Pending Approval':
        return 'pending';
      case 'Approved':
        return 'approved';
      case 'Online':
        return 'online';
      case 'Offline':
        return 'offline';
      case 'Suspended':
        return 'suspended';
      case 'Rejected':
        return 'rejected';
      default:
        return 'all';
    }
  };

  const dbDrivers: Driver[] = storeDrivers.length > 0 ? storeDrivers : fallbackDrivers;

  const handleUpdateDriverStatus = async (id: string, newStatus: string) => {
    await updateDriverStatus(id, newStatus);
    fetchDrivers({
      page: currentPage,
      limit: pageSize,
      search: searchQuery.trim() || undefined,
      status: mapTabToApiStatus(activeTabFilter),
    });
  };

  // Keep active tab filter in sync when filter prop or store activeTab changes
  useEffect(() => {
    const newTab = mapFilterToTab(filter || activeTab);
    setActiveTabFilter(newTab);
    setCurrentPage(1);
  }, [filter, activeTab]);

  // Dynamic server-side API filtering: fetches directly from backend whenever status, search, or page changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDrivers({
        page: currentPage,
        limit: pageSize,
        search: searchQuery.trim() || undefined,
        status: mapTabToApiStatus(activeTabFilter),
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [activeTabFilter, currentPage, pageSize, searchQuery, fetchDrivers]);

  const handleTabFilterChange = (tab: string) => {
    if (tab === activeTabFilter) return;
    setActiveTabFilter(tab);
    setCurrentPage(1);
  };

  const effectiveStatus = activeTabFilter;

  const filterTabs = [
    'All',
    'Pending Approval',
    'Approved',
    'Online',
    'Offline',
    'Suspended',
    'Rejected',
  ];

  const columns: Column<Driver>[] = [
    {
      key: 'name',
      header: 'Driver Profile',
      className: 'min-w-[180px]',
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
      className: 'min-w-[150px]',
      render: (d) => (
        <span
          className={`inline-block whitespace-nowrap px-2.5 py-1 rounded text-[10px] font-bold ${d.status === 'Approved'
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
      className: 'min-w-[170px]',
      render: (d) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span
            className={`w-2 h-2 rounded-full ${d.dutyStatus === 'Online' ? 'bg-emerald-500' : 'bg-slate-300'
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
      className: 'min-w-[220px]',
      render: (d) =>
        d.subscription.status !== 'None' ? (
          <div className="whitespace-nowrap">
            <span className="font-bold text-slate-900 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" /> {d.subscription.planName}
            </span>
            <span
              className={`text-[10px] font-semibold ${d.subscription.status === 'Active'
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
          <span className="inline-block whitespace-nowrap text-rose-600 font-bold text-[10px] bg-rose-50 px-2.5 py-1 rounded border border-rose-200">
            No Subscription Pass
          </span>
        ),
    },
    {
      key: 'verification',
      header: 'DL Verification',
      className: 'min-w-[170px]',
      render: (d) => (
        <span
          className={`inline-block whitespace-nowrap px-2.5 py-1 rounded text-[10px] font-bold ${d.verification.status === 'Verified'
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
      align: 'center',
      render: (d) => (
        <div className="flex items-center justify-center gap-1.5">
          <Link
            href={`/admin/drivers/${d.id}`}
            className="p-1.5 bg-primary-light hover:bg-primary text-primary hover:text-white rounded-md border border-primary/20 hover:border-primary transition-all inline-flex items-center justify-center shadow-2xs"
            title="View Driver Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>

          {/* {d.status === 'Pending Approval' && (
            <>
              <button
                onClick={() => {
                  approveDriver(d.id);
                  handleUpdateDriverStatus(d.id, 'Approved');
                }}
                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded shadow-xs transition-colors cursor-pointer"
                title="Approve Driver"
              >
                Approve
              </button>
              <button
                onClick={() => {
                  rejectDriver(d.id);
                  handleUpdateDriverStatus(d.id, 'Rejected');
                }}
                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded shadow-xs transition-colors cursor-pointer"
                title="Reject Driver"
              >
                Reject
              </button>
            </>
          )} */}

          {/* {d.status === 'Approved' && (
            <button
              onClick={() => {
                suspendDriver(d.id);
                handleUpdateDriverStatus(d.id, 'Suspended');
              }}
              className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded shadow-xs transition-colors cursor-pointer"
              title="Suspend Driver"
            >
              Suspend
            </button>
          )} */}

          {/* {d.status === 'Suspended' && (
            <button
              onClick={() => {
                activateDriver(d.id);
                handleUpdateDriverStatus(d.id, 'Approved');
              }}
              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded shadow-xs transition-colors cursor-pointer"
              title="Re-activate Driver"
            >
              Activate
            </button>
          )} */}
        </div>
      ),
    },
  ];

  // Dynamic Header Info per Active Filter
  let headerTag = 'Driver Management • Fleet Directory';
  let headerTitle = 'All Driver Profiles & Fleet Roster';
  let headerSubtitle = 'Manage driver accounts, background verification status, duty availability, and pass subscriptions.';

  if (effectiveStatus === 'Pending Approval') {
    headerTag = 'Driver Onboarding • Verification Queue';
    headerTitle = 'Pending Driver Applications';
    headerSubtitle = 'Review driving license documents, ID proofs, and approve or reject driver onboarding requests.';
  } else if (effectiveStatus === 'Approved') {
    headerTag = 'Active Fleet • Verified Drivers';
    headerTitle = 'Approved & Active Driver Directory';
    headerSubtitle = 'Monitor active subscription passes, completed trips, and driver profile details.';
  } else if (effectiveStatus === 'Online') {
    headerTag = 'Live Duty • Dispatch Roster';
    headerTitle = 'Online Duty Drivers';
    headerSubtitle = 'Real-time duty availability, GPS locations, and current trip assignment status.';
  } else if (effectiveStatus === 'Suspended' || effectiveStatus === 'Rejected') {
    headerTag = 'Account Security • Blocked Fleet';
    headerTitle = 'Suspended & Rejected Driver Accounts';
    headerSubtitle = 'Manage blocked drivers, failed DL verifications, and reactivate accounts.';
  }

  // Dynamic Metrics depending on Active Filter
  const totalCount = counts?.total ?? dbDrivers.length;
  const pendingCount =
    counts?.pending ??
    dbDrivers.filter((d) => d.status === 'Pending Approval' || (d as any).status === 'pending').length;
  const approvedCount =
    counts?.approved ??
    dbDrivers.filter((d) => d.status === 'Approved' || (d as any).status === 'verified').length;
  const onlineCount =
    counts?.online ??
    dbDrivers.filter((d) => d.dutyStatus === 'Online' || (d as any).isOnline === true).length;
  const suspendedCount =
    counts?.suspended ??
    dbDrivers.filter(
      (d) =>
        d.status === 'Suspended' ||
        d.status === 'Rejected' ||
        (d as any).status === 'suspended' ||
        (d as any).status === 'rejected'
    ).length;

  const renderTopStats = () => {
    if (effectiveStatus === 'Pending Approval') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-white p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-sm transition-all border border-stone-200/80 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Applications</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-amber-700 tracking-tight">{pendingCount}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Awaiting verification</p>
            </div>
          </div>

          <div className="card-white p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-sm transition-all border border-stone-200/80 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">DL Verified</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-emerald-700 tracking-tight">
                {dbDrivers.filter((d) => d.verification.status === 'Verified').length}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Ready for final approval</p>
            </div>
          </div>

          <div className="card-white p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-sm transition-all border border-stone-200/80 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">DL Review Pending</span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200/60 flex items-center justify-center text-sky-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-sky-700 tracking-tight">
                {dbDrivers.filter((d) => d.verification.status === 'Pending').length}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Documents under review</p>
            </div>
          </div>

          <div className="card-white p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-sm transition-all border border-stone-200/80 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Required Action</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-rose-700 tracking-tight">{pendingCount} Drivers</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Approve or Reject</p>
            </div>
          </div>
        </div>
      );
    }

    if (effectiveStatus === 'Approved') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-white p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-sm transition-all border border-stone-200/80 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Approved Fleet</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-emerald-700 tracking-tight">{approvedCount}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Fully verified drivers</p>
            </div>
          </div>

          <div className="card-white p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-sm transition-all border border-stone-200/80 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Subscriptions</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {dbDrivers.filter((d) => d.subscription?.status === 'Active').length}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Eligible for bookings</p>
            </div>
          </div>

          <div className="card-white p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-sm transition-all border border-stone-200/80 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Expiring Passes</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-amber-700 tracking-tight">
                {dbDrivers.filter((d) => d.subscription?.status === 'Expiring Soon').length}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Requires pass renewal</p>
            </div>
          </div>

          <div className="card-white p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-sm transition-all border border-stone-200/80 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Completed Trips</span>
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {dbDrivers.reduce((acc, d) => acc + (d.completedBookings || 0), 0)} Trips
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Lifetime fulfilled</p>
            </div>
          </div>
        </div>
      );
    }

    if (effectiveStatus === 'Online') {
      const avgRating =
        dbDrivers.length > 0
          ? (dbDrivers.reduce((a, b) => a + (b.rating || 5), 0) / dbDrivers.length).toFixed(1)
          : '5.0';
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-white p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-sm transition-all border border-stone-200/80 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Online Duty Fleet</span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200/60 flex items-center justify-center text-sky-600">
                <Car className="w-4 h-4 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-sky-700 tracking-tight">{onlineCount}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Currently active online</p>
            </div>
          </div>

          <div className="card-white p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-sm transition-all border border-stone-200/80 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Available Drivers</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-emerald-700 tracking-tight">
                {dbDrivers.filter((d) => d.availability === 'Available').length}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Ready for immediate dispatch</p>
            </div>
          </div>

          <div className="card-white p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-sm transition-all border border-stone-200/80 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">On Trip / Busy</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-amber-700 tracking-tight">
                {dbDrivers.filter((d) => d.availability === 'Busy').length}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Fulfilling active booking</p>
            </div>
          </div>

          <div className="card-white p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-sm transition-all border border-stone-200/80 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg Duty Rating</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-500">
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-amber-600 tracking-tight">⭐ {avgRating}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Active fleet rating</p>
            </div>
          </div>
        </div>
      );
    }

    if (effectiveStatus === 'Suspended' || effectiveStatus === 'Rejected') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-white p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-sm transition-all border border-stone-200/80 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Suspended Accounts</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
                <UserX className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-amber-700 tracking-tight">
                {dbDrivers.filter((d) => d.status === 'Suspended' || (d as any).status === 'suspended').length}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Temporarily blocked</p>
            </div>
          </div>

          <div className="card-white p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-sm transition-all border border-stone-200/80 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rejected Applications</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-rose-700 tracking-tight">
                {dbDrivers.filter((d) => d.status === 'Rejected' || (d as any).status === 'rejected').length}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Failed DL verification</p>
            </div>
          </div>

          <div className="card-white p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-sm transition-all border border-stone-200/80 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Blocked Drivers</span>
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-700">
                <UserX className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{suspendedCount}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Not eligible for duty</p>
            </div>
          </div>
        </div>
      );
    }

    // Default 'All Drivers' Individual Cards Grid
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="card-white p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-sm transition-all border border-stone-200/80 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Fleet</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-primary">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{totalCount}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">All registered drivers</p>
          </div>
        </div>

        <div className="card-white p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-sm transition-all border border-stone-200/80 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Approved</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-emerald-700 tracking-tight">{approvedCount}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Verified & active</p>
          </div>
        </div>

        <div className="card-white p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-sm transition-all border border-stone-200/80 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-amber-700 tracking-tight">{pendingCount}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Awaiting verification</p>
          </div>
        </div>

        <div className="card-white p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-sm transition-all border border-stone-200/80 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Online Duty</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200/60 flex items-center justify-center text-sky-600">
              <Car className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-sky-700 tracking-tight">{onlineCount}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Ready for requests</p>
          </div>
        </div>

        <div className="card-white p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-sm transition-all border border-stone-200/80 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Suspended</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-rose-700 tracking-tight">{suspendedCount}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Inactive or blocked</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header Summary Banner */}
      {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold text-[#c5a880] uppercase tracking-wider">
            {headerTag}
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{headerTitle}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{headerSubtitle}</p>
        </div>
      </div> */}

      {/* Top Stats Band */}
      {renderTopStats()}

      <DataTable<Driver>
        columns={columns}
        data={storeDrivers.length > 0 ? storeDrivers : (isStoreLoading ? [] : fallbackDrivers)}
        keyExtractor={(d) => d.id}
        pageSize={pageSize}
        isLoading={isStoreLoading}
        minLoadingDurationMs={200}
        searchPlaceholder="Search driver name, phone, email, driver ID..."
        serverSearch={true}
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        serverPagination={{
          currentPage: pagination?.page || currentPage,
          totalPages: pagination?.totalPages || 1,
          totalItems: pagination?.total ?? (storeDrivers.length || fallbackDrivers.length),
          onPageChange: (newPage) => setCurrentPage(newPage),
          onPageSizeChange: (newPageSize) => {
            setPageSize(newPageSize);
            setCurrentPage(1);
          },
        }}
        emptyMessage={`No drivers found for ${effectiveStatus === 'All' ? 'the current list' : effectiveStatus}.`}
        headerActions={
          <div className="relative inline-flex items-center">
            <div className="relative">
              <select
                value={effectiveStatus}
                onChange={(e) => handleTabFilterChange(e.target.value)}
                className="appearance-none bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg pl-8 pr-8 py-2 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer shadow-2xs transition-all"
                title="Filter by status"
              >
                {filterTabs.map((tab) => {
                  let count: number | undefined = undefined;
                  if (tab === 'All') count = totalCount;
                  else if (tab === 'Pending Approval') count = pendingCount;
                  else if (tab === 'Approved') count = approvedCount;
                  else if (tab === 'Online') count = onlineCount;
                  else if (tab === 'Suspended') count = suspendedCount;

                  return (
                    <option key={tab} value={tab} className="py-1 text-slate-800">
                      {tab}
                    </option>
                  );
                })}
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        }
      />
    </div>
  );
}
