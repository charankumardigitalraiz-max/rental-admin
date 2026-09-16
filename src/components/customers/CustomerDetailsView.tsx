'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRentalStore } from '@/store/useRentalStore';
import Link from 'next/link';
import DataTable, { Column } from '@/components/ui/DataTable';
import { DriverBooking, Transaction, RefundRecord } from '@/types';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  CalendarCheck,
  Receipt,
  RotateCcw,
  Ban,
  Check,
  Eye,
} from 'lucide-react';

interface CustomerDetailsViewProps {
  customerId?: string;
}

export default function CustomerDetailsView({ customerId }: CustomerDetailsViewProps = {}) {
  const router = useRouter();
  const {
    customers,
    selectedCustomerId,
    driverBookings,
    transactions,
    refunds,
    setActiveTab,
    toggleCustomerStatus,
    setSelectedDriverBookingId,
  } = useRentalStore();

  const [tripFilter, setTripFilter] = useState<'all' | 'completed' | 'in-progress' | 'cancelled'>('all');

  const targetId = customerId || selectedCustomerId;
  const customer = customers.find((c) => c.id === targetId) || customers[0];

  if (!customer) {
    return (
      <div className="card-white p-8 text-center text-slate-500">
        Customer profile not found.{' '}
        <button onClick={() => router.back()} className="text-primary font-bold underline">
          Back
        </button>
      </div>
    );
  }

  const customerTrips = driverBookings.filter(
    (b) => b.customerName === customer.name || b.customerEmail === customer.email
  );
  const customerTxns = transactions.filter(
    (t) => t.customerOrDriverName === customer.name
  );
  const customerRefunds = refunds.filter((r) => r.customerName === customer.name);

  const filteredTrips = customerTrips.filter((trip) => {
    if (tripFilter === 'completed') return trip.status === 'Completed';
    if (tripFilter === 'in-progress')
      return (
        trip.status === 'Service Started' ||
        trip.status === 'Driver Arriving' ||
        trip.status === 'Driver Assigned' ||
        trip.status === 'Searching Driver' ||
        trip.status === 'Pending'
      );
    if (tripFilter === 'cancelled') return trip.status === 'Cancelled';
    return true;
  });

  const bookingColumns: Column<DriverBooking>[] = [
    {
      key: 'bookingNumber',
      header: 'Booking Ref',
      render: (b) => (
        <Link
          href={`/driver-bookings/${b.id}`}
          className="font-mono font-bold text-slate-900 hover:text-emerald-700 hover:underline text-left inline-block"
        >
          {b.bookingNumber}
        </Link>
      ),
    },
    {
      key: 'bookingDate',
      header: 'Date & Time',
      render: (b) => (
        <div className="text-slate-600 text-[11px]">
          <div>{b.bookingDate}</div>
          <div className="text-[10px] text-slate-400 font-mono">{b.bookingTime}</div>
        </div>
      ),
    },
    {
      key: 'bookingType',
      header: 'Service Type',
      render: (b) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          {b.bookingType} ({b.durationHours}h)
        </span>
      ),
    },
    {
      key: 'pickupLocation',
      header: 'Pickup → Destination',
      render: (b) => (
        <div className="max-w-[220px]">
          <div className="text-slate-900 font-semibold text-xs truncate flex items-center gap-1.5" title={`Pickup: ${b.pickupLocation}`}>
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{b.pickupLocation}</span>
          </div>
          <div className="text-slate-500 text-[11px] truncate flex items-center gap-1.5 mt-0.5" title={`Destination: ${b.destinationLocation}`}>
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate">{b.destinationLocation}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'vehicleInfo',
      header: 'Customer Vehicle',
      render: (b) => (
        <div className="text-slate-700">
          <span className="font-semibold block">{b.vehicleInfo.model}</span>
          <span className="text-[10px] text-slate-400 font-mono">{b.vehicleInfo.plateNumber}</span>
        </div>
      ),
    },
    {
      key: 'driverName',
      header: 'Assigned Driver',
      render: (b) =>
        b.driverName ? (
          <div>
            <span className="font-bold text-slate-900 block">{b.driverName}</span>
            <span className="text-[10px] text-slate-400">{b.driverPhone}</span>
          </div>
        ) : (
          <span className="text-slate-400 text-[11px] italic">Unassigned</span>
        ),
    },
    {
      key: 'amount',
      header: 'Amount (₹)',
      align: 'right',
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
        <div className="min-w-[110px] text-center">
          <span
            className={`px-3 py-1 rounded text-[10px] font-bold inline-block min-w-[80px] ${
              b.status === 'Completed'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : b.status === 'Cancelled'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-sky-50 text-sky-800 border border-sky-200'
            }`}
          >
            {b.status}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (b) => (
        <Link
          href={`/driver-bookings/${b.id}`}
          className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors flex items-center gap-1 ml-auto w-fit"
          title="View Booking Details"
        >
          <Eye className="w-3 h-3" />
          <span>View</span>
        </Link>
      ),
    },
  ];

  const txnColumns: Column<Transaction>[] = [
    {
      key: 'transactionId',
      header: 'Txn ID',
      render: (t) => <span className="font-mono font-bold text-slate-900">{t.transactionId}</span>,
    },
    {
      key: 'date',
      header: 'Date',
      render: (t) => <span className="text-slate-500 text-[11px]">{t.date}</span>,
    },
    {
      key: 'method',
      header: 'Method',
      render: (t) => <span className="font-semibold text-slate-700">{t.method}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (t) => <span className="font-bold text-slate-900">₹{t.amount.toLocaleString('en-IN')}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (t) => (
        <div className="min-w-[110px] text-center">
          <span
            className={`px-3 py-1 rounded text-[10px] font-bold inline-block min-w-[80px] ${
              t.status === 'Success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            {t.status}
          </span>
        </div>
      ),
    },
  ];

  const refundColumns: Column<RefundRecord>[] = [
    {
      key: 'bookingId',
      header: 'Booking Ref',
      render: (r) => <span className="font-mono font-bold text-slate-900">{r.bookingId}</span>,
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (r) => (
        <span className="text-slate-600 truncate max-w-[160px] block" title={r.reason}>
          "{r.reason}"
        </span>
      ),
    },
    {
      key: 'refundAmount',
      header: 'Refund Amount',
      align: 'right',
      render: (r) => <span className="font-bold text-rose-700">₹{r.refundAmount.toLocaleString('en-IN')}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (r) => (
        <div className="min-w-[110px] text-center">
          <span
            className={`px-3 py-1 rounded text-[10px] font-bold inline-block min-w-[80px] ${
              r.status === 'Completed' || r.status === 'Approved'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {r.status}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 pb-10 max-w-7xl mx-auto">
      {/* Top Header Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => router.back()}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs w-fit cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
            ID: {customer.id}
          </span>
          <span
            className={`px-3 py-1 rounded text-xs font-bold ${
              customer.status === 'Active'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {customer.status}
          </span>

          <button
            onClick={() => toggleCustomerStatus(customer.id)}
            className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1 transition-all ${
              customer.status === 'Active'
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
            }`}
          >
            {customer.status === 'Active' ? (
              <>
                <Ban className="w-3.5 h-3.5" /> Suspend Account
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" /> Activate Account
              </>
            )}
          </button>
        </div>
      </div>

      {/* Customer Personal & Contact Header Card */}
      <div className="card-white p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 bg-gradient-to-r from-emerald-50/40 via-white to-slate-50">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <img
              src={customer.avatar}
              alt={customer.name}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-emerald-100 shadow-sm"
            />
            <span
              className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                customer.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              title={`Account Status: ${customer.status}`}
            ></span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{customer.name}</h2>
              {customer.currentBooking && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-sky-100 text-sky-800 border border-sky-200">
                  On Active Trip: {customer.currentBooking}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-600 flex flex-wrap items-center gap-4 pt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Phone className="w-3.5 h-3.5 text-emerald-600" /> {customer.phone}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Mail className="w-3.5 h-3.5 text-sky-600" /> {customer.email}
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-amber-600" /> {customer.address}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs w-full md:w-auto">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center flex-1 md:flex-initial min-w-[110px]">
            <span className="text-[10px] text-slate-500 font-bold block uppercase">Joined Date</span>
            <span className="text-sm font-bold text-slate-800">{customer.joinedDate || 'N/A'}</span>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center flex-1 md:flex-initial min-w-[110px]">
            <span className="text-[10px] text-emerald-800 font-bold block uppercase">Total Spent</span>
            <span className="text-lg font-bold text-emerald-900">₹{customer.totalSpent.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Customer Performance Summary Cards - Unified Strip */}
      <div className="card-white p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-0 sm:divide-x divide-slate-100">
          <div className="space-y-1 sm:pr-5">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block">Total Bookings</span>
            <div className="text-xl font-bold text-slate-900">{customer.totalBookings}</div>
            <p className="text-[10px] text-slate-500">Lifetime requested trips</p>
          </div>

          <div className="space-y-1 sm:px-5">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block">Completed Trips</span>
            <div className="text-xl font-bold text-emerald-600">{customer.completedBookings}</div>
            <p className="text-[10px] text-emerald-600 font-medium">Successfully fulfilled</p>
          </div>

          <div className="space-y-1 sm:px-5">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block">Cancelled Trips</span>
            <div className="text-xl font-bold text-rose-600">{customer.cancelledBookings}</div>
            <p className="text-[10px] text-rose-600 font-medium">Cancelled orders</p>
          </div>

          <div className="space-y-1 sm:pl-5">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block">Active Status</span>
            <div className="text-xl font-bold text-slate-900">{customer.status}</div>
            <p className="text-[10px] text-slate-500">Account standing</p>
          </div>
        </div>
      </div>

      {/* FULL WIDTH: Booking History Table using global DataTable */}
      <DataTable<DriverBooking>
        columns={bookingColumns}
        data={filteredTrips}
        keyExtractor={(b) => b.id}
        pageSize={5}
        emptyMessage="No booking records found for this customer."
        headerActions={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-primary" /> Customer Booking History ({customerTrips.length})
              </h3>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setTripFilter('all')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  tripFilter === 'all'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                All ({customerTrips.length})
              </button>
              <button
                onClick={() => setTripFilter('completed')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  tripFilter === 'completed'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setTripFilter('in-progress')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  tripFilter === 'in-progress'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setTripFilter('cancelled')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  tripFilter === 'cancelled'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Cancelled
              </button>
            </div>
          </div>
        }
      />

      {/* 2-COLUMN EQUAL GRID: Payment Transactions & Refund History using global DataTable */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Transactions */}
        <DataTable<Transaction>
          columns={txnColumns}
          data={customerTxns}
          keyExtractor={(t) => t.id}
          pageSize={5}
          emptyMessage="No payment transactions recorded for this customer."
          headerActions={
            <div className="flex items-center justify-between w-full">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Receipt className="w-4.5 h-4.5 text-primary" /> Payment Transactions ({customerTxns.length})
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Payment Logs</span>
            </div>
          }
        />

        {/* Refund Requests */}
        <DataTable<RefundRecord>
          columns={refundColumns}
          data={customerRefunds}
          keyExtractor={(r) => r.id}
          pageSize={5}
          emptyMessage="No refund requests or dispute claims recorded."
          headerActions={
            <div className="flex items-center justify-between w-full">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <RotateCcw className="w-4.5 h-4.5 text-rose-500" /> Refund History ({customerRefunds.length})
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Refund Claims</span>
            </div>
          }
        />
      </div>
    </div>
  );
}
