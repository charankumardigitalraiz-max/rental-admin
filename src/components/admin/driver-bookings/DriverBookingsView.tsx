'use client';

import React, { useState } from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import { DriverBooking, DriverBookingStatus } from '@/types';
import Link from 'next/link';
import Modal from '@/components/ui/Modal';
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
} from 'lucide-react';

import DataTable, { Column } from '@/components/ui/DataTable';

export default function DriverBookingsView() {
  const {
    driverBookings,
    drivers,
    setActiveTab,
    setSelectedDriverBookingId,
    assignDriverToBooking,
    updateDriverBookingStatus,
    cancelDriverBooking,
  } = useRentalStore();

  const [typeFilter, setTypeFilter] = useState<'All' | 'Local' | 'Outstation'>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Assign / Reassign Driver Modal State
  const [assigningBooking, setAssigningBooking] = useState<DriverBooking | null>(null);
  const [selectedDriverForAssign, setSelectedDriverForAssign] = useState<string>('');

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

  const filteredBookings = driverBookings.filter((b) => {
    const matchesType = typeFilter === 'All' || b.bookingType === typeFilter;
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesType && matchesStatus;
  });

  const availableDrivers = drivers.filter(
    (d) => d.status === 'Approved' && (d.subscription.status === 'Active' || d.subscription.status === 'Expiring Soon')
  );

  const totalBookings = driverBookings.length;
  const activeBookingsCount = driverBookings.filter(
    (b) =>
      b.status === 'Service Started' ||
      b.status === 'Driver Arriving' ||
      b.status === 'Driver Assigned' ||
      b.status === 'Searching Driver' ||
      b.status === 'Pending'
  ).length;
  const completedBookingsCount = driverBookings.filter((b) => b.status === 'Completed').length;
  const totalRevenue = driverBookings
    .filter((b) => b.status !== 'Cancelled')
    .reduce((acc, b) => acc + (b.pricing?.totalCustomerAmount || 0), 0);

  const handleConfirmAssignDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningBooking || !selectedDriverForAssign) return;
    assignDriverToBooking(assigningBooking.id, selectedDriverForAssign);
    setAssigningBooking(null);
    setSelectedDriverForAssign('');
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
          <div className="text-[10px] text-slate-400">{b.customerPhone}</div>
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
          <span className="text-[11px] text-slate-700 font-medium">{b.vehicleInfo.model}</span>
        </div>
      ),
    },
    {
      key: 'pickupLocation',
      header: 'Pickup & Destination',
      render: (b) => (
        <div className="max-w-[200px]">
          <div className="text-slate-800 font-medium truncate flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" /> {b.pickupLocation}
          </div>
          <div className="text-slate-500 text-[10px] truncate flex items-center gap-1 mt-0.5">
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
      className: 'min-w-[180px] sm:min-w-[200px]',
      render: (b) =>
        b.driverName ? (
          <div>
            <div className="font-bold text-slate-900 flex items-center gap-1">
              <Car className="w-3.5 h-3.5 text-primary" /> {b.driverName}
            </div>
            <div className="text-[10px] text-slate-400">Rating: ⭐ {b.driverRating}</div>
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
          ₹{b.pricing.totalCustomerAmount.toLocaleString('en-IN')}
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
              className="px-2 py-1 bg-primary text-white text-[10px] font-bold rounded shadow-xs hover:bg-primary-hover"
              title="Assign or Reassign Driver"
            >
              {b.driverId ? 'Reassign' : 'Assign Driver'}
            </button>
          )}

          {b.status !== 'Cancelled' && b.status !== 'Completed' && (
            <button
              onClick={() => cancelDriverBooking(b.id)}
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
      {/* Single Unified Stats Card Band */}
      <div className="card-white p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 gap-4 sm:gap-0">
          <div className="sm:px-4 space-y-1">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block">Total Bookings</span>
            <div className="text-xl font-bold text-slate-900">{totalBookings}</div>
            <span className="text-[10px] text-slate-400 font-medium">All Time Dispatches</span>
          </div>

          <div className="sm:px-4 space-y-1 pt-3 sm:pt-0">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-sky-700 block">Active Trips</span>
            <div className="text-xl font-bold text-sky-700">{activeBookingsCount}</div>
            <span className="text-[10px] text-sky-600 font-medium">In Progress & Searching</span>
          </div>

          <div className="sm:px-4 space-y-1 pt-3 sm:pt-0">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-700 block">Completed Trips</span>
            <div className="text-xl font-bold text-emerald-700">{completedBookingsCount}</div>
            <span className="text-[10px] text-emerald-600 font-medium">Successfully Fulfilled</span>
          </div>

          <div className="sm:px-4 space-y-1 pt-3 sm:pt-0">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-primary block">Total Revenue</span>
            <div className="text-xl font-bold text-primary">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-slate-500 font-medium">Booking Customer Charges</span>
          </div>
        </div>
      </div>

      <DataTable<DriverBooking>
        columns={columns}
        data={filteredBookings}
        keyExtractor={(b) => b.id}
        pageSize={8}
        searchPlaceholder="Search booking #, customer, driver..."
        searchFilterKeys={['bookingNumber', 'customerName', 'driverName', 'pickupLocation']}
        emptyMessage="No driver bookings match the current filter criteria."
        headerActions={
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Filter className="w-3.5 h-3.5" /> Type:
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'All' | 'Local' | 'Outstation')}
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
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {/* <button
              onClick={() => setActiveTab('driver-requests')}
              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-all w-full sm:w-auto justify-center"
            >
              <UserPlus className="w-4 h-4" /> Dispatch Matching Center
            </button> */}
          </div>
        }
      />

      {/* Manual Driver Assignment Modal */}
      {assigningBooking && (
        <Modal
          isOpen={!!assigningBooking}
          onClose={() => setAssigningBooking(null)}
          title={`Assign Driver to Booking ${assigningBooking.bookingNumber}`}
          subtitle="Select an active subscription-verified driver to perform this booking"
          icon={UserCheck}
          maxWidth="md"
        >
          <form onSubmit={handleConfirmAssignDriver} className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-900">{assigningBooking.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Booking Type:</span>
                <span className="font-bold text-primary">{assigningBooking.bookingType} ({assigningBooking.durationHours} hours)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle:</span>
                <span className="font-bold text-slate-800">{assigningBooking.vehicleInfo.model} ({assigningBooking.vehicleInfo.plateNumber})</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold text-xs mb-1">
                Select Available Driver (Active Subscription Required)
              </label>
              <select
                value={selectedDriverForAssign}
                onChange={(e) => setSelectedDriverForAssign(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">-- Choose Driver --</option>
                {availableDrivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.dutyStatus} • ⭐ {d.rating} • Pass: {d.subscription.planName})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAssigningBooking(null)}
                className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-primary text-white font-bold rounded-lg text-xs shadow-xs hover:bg-primary-hover"
              >
                Confirm Assignment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
