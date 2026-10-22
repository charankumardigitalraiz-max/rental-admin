'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDtoDBookingStore, DtoDBooking } from '@/store/useDtoDBookingStore';
import { useToast } from '@/context/ToastContext';
import Modal from '@/components/ui/Modal';
import DataTable, { Column } from '@/components/ui/DataTable';
import {
  CalendarCheck,
  Search,
  Filter,
  Car,
  UserCheck,
  Clock,
  Eye,
  UserPlus,
  XCircle,
  MapPin,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Loader2,
  Percent,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Phone,
  User,
  Radio,
} from 'lucide-react';

export default function DtoDBookingsView() {
  const { toast } = useToast();

  const {
    bookings,
    counts,
    pagination,
    availableDrivers,
    isLoading,
    isSubmitting,
    fetchBookings,
    fetchAvailableDrivers,
    assignDriverToBooking,
    updateBookingStatus,
    cancelBooking,
  } = useDtoDBookingStore();

  const [typeFilter, setTypeFilter] = useState<'All' | 'Local' | 'Outstation'>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const PAGE_LIMIT = 10;

  // Selected Booking for Full Detail Modal
  const [detailBooking, setDetailBooking] = useState<DtoDBooking | null>(null);

  // Assign Driver Modal
  const [assigningBooking, setAssigningBooking] = useState<DtoDBooking | null>(null);
  const [selectedDriverForAssign, setSelectedDriverForAssign] = useState<string>('');
  const [assignNotes, setAssignNotes] = useState<string>('');

  // Cancel Booking Modal
  const [cancellingBooking, setCancellingBooking] = useState<DtoDBooking | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Source driver requested trip cancellation');

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch bookings when filters change
  useEffect(() => {
    fetchBookings({
      page: currentPage,
      limit: PAGE_LIMIT,
      serviceType: typeFilter !== 'All' ? typeFilter.toLowerCase() : undefined,
      status: statusFilter !== 'All' ? statusFilter : undefined,
      search: debouncedSearch.trim() || undefined,
    });
  }, [currentPage, typeFilter, statusFilter, debouncedSearch, fetchBookings]);

  // Load available drivers on mount
  useEffect(() => {
    fetchAvailableDrivers();
  }, [fetchAvailableDrivers]);

  // Handle Assign Driver Submit
  const handleAssignSubmit = async () => {
    if (!assigningBooking || !selectedDriverForAssign) {
      toast.error('Select Driver', 'Please select a driver to fulfill this trip.');
      return;
    }

    const res = await assignDriverToBooking(
      assigningBooking.bookingId || assigningBooking.id,
      selectedDriverForAssign,
      assignNotes
    );

    if (res.success) {
      toast.success('Driver Assigned', res.message || 'Driver assigned to D-to-D booking successfully.');
      setAssigningBooking(null);
      setSelectedDriverForAssign('');
      setAssignNotes('');
    } else {
      toast.error('Assignment Failed', res.error || 'Failed to assign driver.');
    }
  };

  // Handle Cancel Submit
  const handleCancelSubmit = async () => {
    if (!cancellingBooking) return;

    const res = await cancelBooking(
      cancellingBooking.bookingId || cancellingBooking.id,
      cancelReason
    );

    if (res.success) {
      toast.success('Trip Cancelled', 'Driver-to-Driver booking has been cancelled.');
      setCancellingBooking(null);
      setCancelReason('Source driver requested trip cancellation');
    } else {
      toast.error('Cancellation Failed', res.error || 'Could not cancel booking.');
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Status Timestamp Helper
  const getRowStatusTime = (row?: DtoDBooking) => {
    if (!row) return null;
    const s = (row.status || row.bookingStatus || '').toLowerCase();
    let dateStr: string | null | undefined = null;
    switch (s) {
      case 'trip_completed':
      case 'completed':
        dateStr = row.tripCompletedAt;
        break;
      case 'trip_started':
      case 'service started':
        dateStr = row.tripStartedAt;
        break;
      case 'driver_arriving':
      case 'driver_arrived':
        dateStr = row.driverArrivedAt;
        break;
      case 'driver_assigned':
      case 'driver assigned':
        dateStr = row.driverAssignedAt;
        break;
      case 'cancelled':
        dateStr = row.cancelledAt;
        break;
      case 'pending':
      default:
        dateStr = row.createdAt;
        break;
    }

    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Status Badge Helper with Time
  const renderStatusBadge = (status: string, row?: DtoDBooking) => {
    const s = (status || '').toLowerCase();
    const timeStr = getRowStatusTime(row);
    let badge = null;

    switch (s) {
      case 'trip_completed':
      case 'completed':
        badge = (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
        break;
      case 'trip_started':
      case 'service started':
        badge = (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Trip In-Progress
          </span>
        );
        break;
      case 'driver_assigned':
      case 'driver assigned':
        badge = (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <UserCheck className="w-3.5 h-3.5" />
            Driver Assigned
          </span>
        );
        break;
      case 'driver_arriving':
      case 'driver_arrived':
        badge = (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Car className="w-3.5 h-3.5" />
            Arrived at Pickup
          </span>
        );
        break;
      case 'cancelled':
        badge = (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
        break;
      case 'pending':
      default:
        badge = (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Searching Driver
          </span>
        );
        break;
    }

    return (
      <div className="space-y-1">
        {badge}
        {timeStr && (
          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
            <span>{timeStr}</span>
          </div>
        )}
      </div>
    );
  };

  // Table Columns
  const columns: Column<DtoDBooking>[] = [
    {
      key: 'bookingDetails',
      header: 'Booking Details',
      render: (row: DtoDBooking) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/d-to-d-bookings/${row.id}`}
              className="font-mono font-bold text-slate-900 hover:text-emerald-700 hover:underline text-sm"
            >
              {row.bookingNumber}
            </Link>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
              {row.serviceType}
            </span>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{row.bookingDate} · {row.bookingTime}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'sourceDriver',
      header: 'Source Driver (Initiator)',
      render: (row: DtoDBooking) => (
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-xs shrink-0">
            {row.sourceDriver?.name ? row.sourceDriver.name.charAt(0).toUpperCase() : 'D'}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">
              {row.sourceDriver?.name || 'Peer Driver'}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>{row.sourceDriver?.phone || 'No phone'}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'fulfillingDriver',
      header: 'Fulfilling Driver',
      render: (row: DtoDBooking) => {
        if (!row.driver) {
          return (
            <button
              onClick={() => {
                setAssigningBooking(row);
                setSelectedDriverForAssign('');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Assign Driver</span>
            </button>
          );
        }

        return (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center justify-center font-bold text-xs shrink-0">
              {row.driver.name ? row.driver.name.charAt(0).toUpperCase() : 'D'}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                {row.driver.name}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{row.driver.phone || 'N/A'}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'vehicleRoute',
      header: 'Vehicle & Route',
      render: (row: DtoDBooking) => (
        <div className="space-y-1 max-w-[240px]">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-800">
            <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="capitalize">{row.vehicleInfo.type} ({row.vehicleInfo.transmission})</span>
            {row.vehicleInfo.vehicleNumber && (
              <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                {row.vehicleInfo.vehicleNumber}
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 truncate flex items-center gap-1" title={row.pickupLocation}>
            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate">{row.pickupLocation}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'pricing',
      header: 'Pricing & Charges',
      render: (row: DtoDBooking) => (
        <div className="space-y-1">
          <div className="text-sm font-bold text-slate-900">
            {formatCurrency(row.pricing.totalAmount)}
          </div>
          {/* <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Percent className="w-2.5 h-2.5" />
            <span>0% Platform Charge</span>
          </div> */}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: DtoDBooking) => renderStatusBadge(row.status, row),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: DtoDBooking) => (
        <div className="flex items-center gap-1.5">
          <Link
            href={`/admin/d-to-d-bookings/${row.id}`}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center justify-center cursor-pointer"
            title="View Full Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
          {/* {row.status !== 'cancelled' && row.status !== 'trip_completed' && (
            <>
              <button
                onClick={() => {
                  setAssigningBooking(row);
                  setSelectedDriverForAssign(row.driverId || '');
                }}
                className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                title="Reassign Driver"
              >
                <UserPlus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCancellingBooking(row)}
                className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Cancel Booking"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )} */}
        </div>
      ),
    },
  ];

  const statCards = [
    {
      label: 'Total Bookings',
      value: counts?.total ?? bookings.length,
      subtext: `${counts?.active ?? 0} Active • ${counts?.completed ?? 0} Completed`,
      icon: CalendarCheck,
      iconColor: 'text-primary',
      valueColor: 'text-slate-900',
    },
    {
      label: 'Active Trips',
      value: `${counts?.active ?? 0} Trips`,
      subtext: 'In-Transit & Dispatched',
      icon: Radio,
      iconColor: 'text-blue-600 animate-pulse',
      valueColor: 'text-blue-600',
      subtextColor: 'text-blue-600 font-semibold',
    },
    {
      label: 'Completed Trips',
      value: `${counts?.completed ?? 0} Trips`,
      subtext: 'Successfully Fulfilled',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-600',
      subtextColor: 'text-emerald-600 font-semibold',
    },
    {
      label: 'Cancelled Trips',
      value: `${counts?.cancelled ?? 0} Trips`,
      subtext: 'Declined or Cancelled',
      icon: XCircle,
      iconColor: 'text-rose-600',
      valueColor: 'text-rose-600',
      subtextColor: 'text-rose-600 font-semibold',
    },
  ];

  const statuses = [
    { label: 'All Statuses', value: 'All' },
    { label: 'Pending (Searching)', value: 'pending' },
    { label: 'Driver Assigned', value: 'driver_assigned' },
    { label: 'Driver Arriving', value: 'driver_arriving' },
    { label: 'Trip In-Progress', value: 'trip_started' },
    { label: 'Completed', value: 'trip_completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  const handleTypeFilter = (val: 'All' | 'Local' | 'Outstation') => {
    setTypeFilter(val);
    setCurrentPage(1);
  };

  const handleStatusFilter = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. TOP METRICS DASHBOARD CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card-white p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10.5px] font-bold uppercase tracking-wider">{stat.label}</span>
                <Icon className={`w-4 h-4 ${stat.iconColor}`} />
              </div>
              <h3 className={`text-xl font-bold mt-1 tracking-wider ${stat.valueColor}`}>{stat.value}</h3>
              <p className={`text-[10px] mt-0.5 ${stat.subtextColor || 'text-slate-500'}`}>{stat.subtext}</p>
            </div>
          );
        })}
      </div>

      {/* 2. DATA TABLE WITH INTEGRATED SEARCH & FILTERS */}
      <DataTable<DtoDBooking>
        columns={columns}
        data={bookings}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        searchPlaceholder="Search D2D ID, driver name, phone..."
        serverSearch={true}
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        emptyMessage={
          isLoading
            ? 'Loading peer bookings from database...'
            : 'No Driver-to-Driver bookings match the current filter or search criteria.'
        }
        pageSize={PAGE_LIMIT}
        serverPagination={{
          currentPage,
          totalPages: pagination?.totalPages ?? 1,
          totalItems: pagination?.total ?? bookings.length,
          onPageChange: (page: number) => setCurrentPage(page),
        }}
        headerActions={
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                setCurrentPage(1);
                fetchBookings(
                  {
                    page: 1,
                    limit: PAGE_LIMIT,
                    serviceType: typeFilter !== 'All' ? typeFilter.toLowerCase() : undefined,
                    status: statusFilter !== 'All' ? statusFilter : undefined,
                    search: debouncedSearch.trim() || undefined,
                  },
                  false
                );
                fetchAvailableDrivers();
              }}
              disabled={isLoading}
              className="p-2 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
              title="Refresh Bookings"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-primary' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Filter className="w-3.5 h-3.5" /> Type:
            </div>
            <select
              value={typeFilter}
              onChange={(e) => handleTypeFilter(e.target.value as 'All' | 'Local' | 'Outstation')}
              className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="All">All Types</option>
              <option value="Local">Local City</option>
              <option value="Outstation">Outstation</option>
            </select>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              Status:
            </div>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {statuses.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* 4. MODAL: ASSIGN DRIVER */}
      {assigningBooking && (
        <Modal
          isOpen={!!assigningBooking}
          onClose={() => setAssigningBooking(null)}
          title={`Assign Driver to ${assigningBooking.bookingNumber}`}
          subtitle="Select an approved, active driver from the fleet to fulfill this peer booking."
        >
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Available Approved Drivers ({availableDrivers.length})
              </label>
              <select
                value={selectedDriverForAssign}
                onChange={(e) => setSelectedDriverForAssign(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-slate-800"
              >
                <option value="">-- Select a driver --</option>
                {availableDrivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} · {driver.phone} ({driver.dutyStatus}) - ★{driver.rating}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Administrative Notes (Optional)
              </label>
              <textarea
                value={assignNotes}
                onChange={(e) => setAssignNotes(e.target.value)}
                rows={2}
                placeholder="Reason or dispatch notes for this assignment..."
                className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-slate-800"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setAssigningBooking(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignSubmit}
                disabled={isSubmitting || !selectedDriverForAssign}
                className="px-4 py-2 text-xs font-semibold bg-[#0b2920] hover:bg-[#064233] text-white rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Assigning...</span>
                  </>
                ) : (
                  <span>Confirm Assignment</span>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 5. MODAL: CANCEL BOOKING */}
      {cancellingBooking && (
        <Modal
          isOpen={!!cancellingBooking}
          onClose={() => setCancellingBooking(null)}
          title={`Cancel Trip ${cancellingBooking.bookingNumber}`}
          subtitle="Are you sure you want to cancel this Driver-to-Driver booking?"
        >
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Cancellation Reason
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                placeholder="Explain why this D2D booking is being cancelled..."
                className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-rose-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleCancelSubmit}
                disabled={isSubmitting || !cancelReason.trim()}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Cancel Booking</span>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 6. MODAL: DETAILED BOOKING VIEW */}
      {detailBooking && (
        <Modal
          isOpen={!!detailBooking}
          onClose={() => setDetailBooking(null)}
          title={`Booking Details: ${detailBooking.bookingNumber}`}
          subtitle={`Created on ${detailBooking.bookingDate} · 0% Platform Fee`}
        >
          <div className="space-y-4 pt-2 text-xs">
            {/* Drivers Comparison Box */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Source Driver (Initiator)
                </span>
                <p className="font-bold text-slate-900">{detailBooking.sourceDriver?.name || 'Peer Driver'}</p>
                <p className="text-slate-500">{detailBooking.sourceDriver?.phone || 'No phone'}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Fulfilling Driver
                </span>
                <p className="font-bold text-slate-900">{detailBooking.driver?.name || 'Unassigned'}</p>
                <p className="text-slate-500">{detailBooking.driver?.phone || 'Awaiting acceptance'}</p>
              </div>
            </div>

            {/* Route & Times */}
            <div className="space-y-2 p-3 bg-white rounded-xl border border-stone-200">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-700">Pickup: </span>
                  <span className="text-slate-600">{detailBooking.pickupLocation}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-700">Drop: </span>
                  <span className="text-slate-600">{detailBooking.dropLocation}</span>
                </div>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-1.5">
              <div className="flex items-center justify-between text-slate-600">
                <span>Base Driver Fee:</span>
                <span>{formatCurrency(detailBooking.pricing.driverFee || detailBooking.pricing.baseAmount)}</span>
              </div>
              <div className="flex items-center justify-between font-semibold text-emerald-800">
                <span>Platform Commission Charge:</span>
                <span>₹0.00 (Waived)</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-emerald-200/80 font-bold text-slate-900 text-sm">
                <span>Total Amount:</span>
                <span>{formatCurrency(detailBooking.pricing.totalAmount)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDetailBooking(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
