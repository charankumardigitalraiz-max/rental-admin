'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDriverBookingStore } from '@/store/useDriverBookingStore';
import { useToast } from '@/context/ToastContext';
import { DriverBooking, DriverBookingStatus } from '@/types';
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
} from 'lucide-react';

export default function DriverBookingsView() {
  const { toast } = useToast();

  const {
    driverBookings,
    counts,
    pagination,
    availableDrivers,
    isLoading,
    isSubmitting,
    fetchDriverBookings,
    fetchAvailableDrivers,
    assignDriverToBooking,
    updateDriverBookingStatus,
    cancelDriverBooking,
  } = useDriverBookingStore();

  const [typeFilter, setTypeFilter] = useState<'All' | 'Local' | 'Outstation'>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const PAGE_LIMIT = 10;

  // Assign / Reassign Driver Modal State
  const [assigningBooking, setAssigningBooking] = useState<DriverBooking | null>(null);
  const [selectedDriverForAssign, setSelectedDriverForAssign] = useState<string>('');
  const [assignNotes, setAssignNotes] = useState<string>('');

  // Cancel Booking Modal State
  const [cancellingBooking, setCancellingBooking] = useState<DriverBooking | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Customer requested cancellation');

  // Debounce search query to prevent excessive backend queries (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load available drivers on mount
  useEffect(() => {
    fetchAvailableDrivers();
  }, [fetchAvailableDrivers]);

  // Dynamic server fetch — runs whenever page, typeFilter, statusFilter, or search changes
  useEffect(() => {
    fetchDriverBookings(
      {
        page: currentPage,
        limit: PAGE_LIMIT,
        search: debouncedSearch.trim() || undefined,
        ...(typeFilter !== 'All' ? { serviceType: typeFilter } : {}),
        ...(statusFilter !== 'All' ? { status: statusFilter } : {}),
      },
      false
    );
  }, [currentPage, typeFilter, statusFilter, debouncedSearch, fetchDriverBookings]);

  const statuses: string[] = [
    'All',
    'Pending',
    'Searching Driver',
    'Driver Assigned',
    'Driver Arriving',
    'Service Started',
    'Completed',
    'Cancelled',
    'No Driver Found',
  ];

  // When filters are active, keep client-side filtering as secondary pass
  // (server already pre-filters, but local filter avoids stale flicker)
  const filteredBookings = driverBookings.filter((b) => {
    const matchesType = typeFilter === 'All' || b.bookingType === typeFilter;
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesType && matchesStatus;
  });

  // Reset to page 1 when filters change
  const handleTypeFilter = (val: 'All' | 'Local' | 'Outstation') => {
    setTypeFilter(val);
    setCurrentPage(1);
  };
  const handleStatusFilter = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const totalBookings = counts?.total ?? driverBookings.length;
  const activeBookingsCount =
    counts?.active ??
    driverBookings.filter(
      (b) =>
        b.status === 'Service Started' ||
        b.status === 'Driver Arriving' ||
        b.status === 'Driver Assigned' ||
        b.status === 'Searching Driver' ||
        b.status === 'Pending'
    ).length;
  const completedBookingsCount =
    counts?.completed ?? driverBookings.filter((b) => b.status === 'Completed').length;
  const totalRevenue =
    counts?.totalRevenue ??
    driverBookings
      .filter((b) => b.status !== 'Cancelled')
      .reduce((acc, b) => acc + (b.pricing?.totalCustomerAmount || b.totalAmount || 0), 0);

  const handleConfirmAssignDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningBooking || !selectedDriverForAssign) return;

    const res = await assignDriverToBooking(assigningBooking.id, selectedDriverForAssign, assignNotes);
    if (res.success) {
      toast.success(
        'Driver Assigned',
        `Driver successfully assigned to booking ${assigningBooking.bookingNumber}.`
      );
      setAssigningBooking(null);
      setSelectedDriverForAssign('');
      setAssignNotes('');
    } else {
      toast.error('Assignment Failed', res.error || 'Failed to assign driver');
    }
  };

  const handleConfirmCancelBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingBooking) return;

    const res = await cancelDriverBooking(cancellingBooking.id, cancelReason);
    if (res.success) {
      toast.info(
        'Booking Cancelled',
        `Booking ${cancellingBooking.bookingNumber} has been cancelled.`
      );
      setCancellingBooking(null);
      setCancelReason('Customer requested cancellation');
    } else {
      toast.error('Cancellation Failed', res.error || 'Failed to cancel booking');
    }
  };

  const columns: Column<DriverBooking>[] = [
    {
      key: 'bookingNumber',
      header: 'Booking ID',
      render: (b) => (
        <Link
          href={`/admin/driver-bookings/${b.id}`}
          className="font-mono font-bold text-slate-900 hover:text-emerald-700 hover:underline text-left inline-block"
        >
          {b.bookingNumber}
        </Link>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (b) => (
        <div>
          <div className="font-bold text-slate-900">{b.customerName}</div>
          <div className="text-[10px] text-slate-400">{b.customerPhone || b.customerEmail || 'No contact'}</div>
        </div>
      ),
    },
    {
      key: 'bookingType',
      header: 'Type & Vehicle',
      render: (b) => (
        <div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-light text-primary block w-fit mb-0.5">
            {b.bookingType} ({b.durationHours}h)
          </span>
          <span className="text-[11px] text-slate-700 font-medium">
            {b.vehicleInfo?.model || 'Customer Vehicle'}
          </span>
        </div>
      ),
    },
    {
      key: 'pickupLocation',
      header: 'Pickup & Destination',
      render: (b) => (
        <div className="max-w-[200px]">
          <div className="text-slate-800 font-medium truncate flex items-center gap-1" title={b.pickupLocation}>
            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" /> {b.pickupLocation}
          </div>
          <div className="text-slate-500 text-[10px] truncate flex items-center gap-1 mt-0.5" title={b.destinationLocation}>
            <MapPin className="w-3 h-3 text-rose-500 shrink-0" /> {b.destinationLocation}
          </div>
        </div>
      ),
    },
    {
      key: 'bookingDate',
      header: 'Date & Time',
      render: (b) => (
        <div>
          <div className="font-semibold text-slate-800">{b.bookingDate}</div>
          <div className="text-[10px] text-slate-400">{b.bookingTime}</div>
        </div>
      ),
    },
    {
      key: 'driverName',
      header: 'Assigned Driver',
      render: (b) =>
        b.driverName ? (
          <div>
            <div className="font-bold text-slate-900 flex items-center gap-1">
              <Car className="w-3.5 h-3.5 text-primary" /> {b.driverName}
            </div>
            <div className="text-[10px] text-slate-400">
              {b.driverPhone ? `📞 ${b.driverPhone}` : `Rating: ⭐ ${b.driverRating || 4.8}`}
            </div>
          </div>
        ) : (
          <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded text-[10px] border border-amber-200">
            Searching Driver
          </span>
        ),
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      render: (b) => (
        <span className="font-bold text-slate-900">
          ₹{(b.pricing?.totalCustomerAmount || b.totalAmount || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (b) => (
        <div className="min-w-[120px] text-center">
          <span
            className={`px-3 py-1 rounded text-[10px] font-bold inline-block min-w-[95px] ${b.status === 'Completed'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : b.status === 'Searching Driver' || b.status === 'Pending'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : b.status === 'Cancelled'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-primary-light text-primary border border-primary/20'
              }`}
          >
            {b.status}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (b) => (
        <div className="flex items-center justify-center gap-1.5">
          <Link
            href={`/admin/driver-bookings/${b.id}`}
            className="p-1.5 bg-primary-light hover:bg-primary text-primary hover:text-white rounded-md border border-primary/20 hover:border-primary transition-all inline-flex items-center justify-center shadow-2xs"
            title="View Full Booking Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>

          {b.status !== 'Completed' && b.status !== 'Cancelled' && (
            <button
              onClick={() => {
                setAssigningBooking(b);
                setSelectedDriverForAssign(b.driverId || availableDrivers[0]?.id || '');
              }}
              className="px-2 py-1 bg-primary text-white text-[10px] font-bold rounded shadow-xs hover:bg-primary-hover active:scale-95 transition-all"
              title="Assign or Reassign Driver"
            >
              {b.driverId ? 'Reassign' : 'Assign Driver'}
            </button>
          )}

          {b.status !== 'Cancelled' && b.status !== 'Completed' && (
            <button
              onClick={() => setCancellingBooking(b)}
              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors"
              title="Cancel Booking"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* 4 Individual Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-white p-4 space-y-1">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block">Total Bookings</span>
          <div className="text-xl font-bold text-slate-900">{totalBookings}</div>
          <span className="text-[10px] text-slate-400 font-medium">All Time Dispatches</span>
        </div>

        <div className="card-white p-4 space-y-1">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-sky-700 block">Active Trips</span>
          <div className="text-xl font-bold text-sky-700">{activeBookingsCount}</div>
          <span className="text-[10px] text-sky-600 font-medium">In Progress & Searching</span>
        </div>

        <div className="card-white p-4 space-y-1">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-700 block">Completed Trips</span>
          <div className="text-xl font-bold text-emerald-700">{completedBookingsCount}</div>
          <span className="text-[10px] text-emerald-600 font-medium">Successfully Fulfilled</span>
        </div>

        <div className="card-white p-4 space-y-1">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-primary block">Total Revenue</span>
          <div className="text-xl font-bold text-primary">₹{totalRevenue.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-slate-500 font-medium">Booking Customer Charges</span>
        </div>
      </div>

      <DataTable<DriverBooking>
        columns={columns}
        data={driverBookings}
        keyExtractor={(b) => b.id}
        isLoading={isLoading}
        searchPlaceholder="Search booking #, customer, driver, vehicle..."
        serverSearch={true}
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        emptyMessage={
          isLoading ? 'Loading driver bookings from database...' : 'No driver bookings match the current filter or search criteria.'
        }
        serverPagination={{
          currentPage,
          totalPages: pagination?.totalPages ?? 1,
          totalItems: pagination?.total ?? driverBookings.length,
          onPageChange: (page) => setCurrentPage(page),
        }}
        headerActions={
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                setCurrentPage(1);
                fetchDriverBookings(
                  {
                    page: 1,
                    limit: PAGE_LIMIT,
                    search: debouncedSearch.trim() || undefined,
                    ...(typeFilter !== 'All' ? { serviceType: typeFilter } : {}),
                    ...(statusFilter !== 'All' ? { status: statusFilter } : {}),
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
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Manual Driver Assignment Modal */}
      {assigningBooking && (
        <Modal
          isOpen={!!assigningBooking}
          onClose={() => {
            if (!isSubmitting) setAssigningBooking(null);
          }}
          title={`Assign Driver to Booking ${assigningBooking.bookingNumber}`}
          subtitle="Select a verified driver to perform this booking dispatch"
          icon={UserCheck}
          maxWidth="md"
        >
          <form onSubmit={handleConfirmAssignDriver} className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-900">{assigningBooking.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Booking Type:</span>
                <span className="font-bold text-primary">
                  {assigningBooking.bookingType} ({assigningBooking.durationHours} hours)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle:</span>
                <span className="font-bold text-slate-800">
                  {assigningBooking.vehicleInfo?.model} ({assigningBooking.vehicleInfo?.plateNumber})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pickup:</span>
                <span className="font-medium text-slate-700 truncate max-w-[200px]" title={assigningBooking.pickupLocation}>
                  {assigningBooking.pickupLocation}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold text-xs mb-1">
                Select Available Driver <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedDriverForAssign}
                onChange={(e) => setSelectedDriverForAssign(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={isSubmitting}
              >
                <option value="">-- Choose Driver --</option>
                {availableDrivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.dutyStatus} • ⭐ {d.rating} • 📞 {d.phone || 'No phone'})
                  </option>
                ))}
              </select>
              {availableDrivers.length === 0 && (
                <p className="text-[11px] text-amber-600 mt-1">
                  No verified drivers found. You can add or verify drivers in the Drivers section.
                </p>
              )}
            </div>

            <div>
              <label className="block text-slate-700 font-semibold text-xs mb-1">
                Admin Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Assigned manually after customer phone confirmation"
                value={assignNotes}
                onChange={(e) => setAssignNotes(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isSubmitting}
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAssigningBooking(null)}
                disabled={isSubmitting}
                className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedDriverForAssign}
                className="px-4 py-1.5 bg-primary text-white font-bold rounded-lg text-xs shadow-xs hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Assignment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Cancel Booking Confirmation Modal */}
      {cancellingBooking && (
        <Modal
          isOpen={!!cancellingBooking}
          onClose={() => {
            if (!isSubmitting) setCancellingBooking(null);
          }}
          title={`Cancel Booking ${cancellingBooking.bookingNumber}`}
          subtitle="Are you sure you want to cancel this booking? This will update the status to Cancelled."
          icon={XCircle}
          maxWidth="md"
        >
          <form onSubmit={handleConfirmCancelBooking} className="space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-rose-700 font-semibold">Customer:</span>
                <span className="font-bold text-slate-900">{cancellingBooking.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-rose-700 font-semibold">Pickup Date:</span>
                <span className="font-bold text-slate-900">{cancellingBooking.bookingDate} {cancellingBooking.bookingTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-rose-700 font-semibold">Total Amount:</span>
                <span className="font-bold text-slate-900">₹{(cancellingBooking.pricing?.totalCustomerAmount || cancellingBooking.totalAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold text-xs mb-1">
                Cancellation Reason <span className="text-rose-500">*</span>
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary mb-2"
                disabled={isSubmitting}
              >
                <option value="Customer requested cancellation">Customer requested cancellation</option>
                <option value="Driver not available">Driver not available in service area</option>
                <option value="Customer vehicle issues">Customer vehicle inspection failed or breakdown</option>
                <option value="Duplicate booking">Duplicate booking created</option>
                <option value="Payment verification failed">Payment verification failed</option>
                <option value="Custom">Other (Custom Reason)</option>
              </select>

              {cancelReason === 'Custom' && (
                <input
                  type="text"
                  required
                  placeholder="Enter specific cancellation reason..."
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isSubmitting}
                />
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                disabled={isSubmitting}
                className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                Keep Booking
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Cancel Booking
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
