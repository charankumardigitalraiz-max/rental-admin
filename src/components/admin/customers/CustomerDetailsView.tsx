'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Car,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useCustomerStore } from '@/store/useCustomerStore';
import { useToast } from '@/context/ToastContext';
import Modal from '@/components/ui/Modal';

interface CustomerDetailsViewProps {
  customerId?: string;
}

export default function CustomerDetailsView({ customerId }: CustomerDetailsViewProps = {}) {
  const router = useRouter();
  const { toast } = useToast();
  const {
    customers: storeCustomers,
    selectedCustomerDetails,
    isLoading,
    fetchCustomersById,
    toggleCustomerStatus,
  } = useCustomerStore();

  const [tripFilter, setTripFilter] = useState<'all' | 'driver' | 'valet' | 'completed' | 'cancelled'>('all');
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingLimit, setBookingLimit] = useState(5);
  const [financialTab, setFinancialTab] = useState<'transactions' | 'refunds'>('transactions');
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionLimit, setTransactionLimit] = useState(5);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const targetId = customerId;

  useEffect(() => {
    if (targetId) {
      fetchCustomersById(targetId, {
        bookingPage: 1,
        bookingLimit: 5,
        bookingFilter: 'all',
        transactionPage: 1,
        transactionLimit: 5,
      });
    }
  }, [targetId, fetchCustomersById]);

  const handleTripFilterChange = (filter: 'all' | 'driver' | 'valet' | 'completed' | 'cancelled') => {
    setTripFilter(filter);
    setBookingPage(1);
    if (targetId) {
      fetchCustomersById(targetId, {
        bookingPage: 1,
        bookingLimit,
        bookingFilter: filter,
        transactionPage,
        transactionLimit,
      });
    }
  };

  const handleBookingPageChange = (page: number) => {
    setBookingPage(page);
    if (targetId) {
      fetchCustomersById(targetId, {
        bookingPage: page,
        bookingLimit,
        bookingFilter: tripFilter,
        transactionPage,
        transactionLimit,
      });
    }
  };

  const handleBookingLimitChange = (limit: number) => {
    setBookingLimit(limit);
    setBookingPage(1);
    if (targetId) {
      fetchCustomersById(targetId, {
        bookingPage: 1,
        bookingLimit: limit,
        bookingFilter: tripFilter,
        transactionPage,
        transactionLimit,
      });
    }
  };

  const handleTransactionPageChange = (page: number) => {
    setTransactionPage(page);
    if (targetId) {
      fetchCustomersById(targetId, {
        bookingPage,
        bookingLimit,
        bookingFilter: tripFilter,
        transactionPage: page,
        transactionLimit,
      });
    }
  };

  const handleTransactionLimitChange = (limit: number) => {
    setTransactionLimit(limit);
    setTransactionPage(1);
    if (targetId) {
      fetchCustomersById(targetId, {
        bookingPage,
        bookingLimit,
        bookingFilter: tripFilter,
        transactionPage: 1,
        transactionLimit: limit,
      });
    }
  };

  const customer =
    selectedCustomerDetails?.customer ||
    storeCustomers.find((c) => c.id === targetId || c.mongoId === targetId || c.custId === targetId);

  // Delete handler
  const handleDelete = async () => {
    if (!customer) return;
    setIsDeleting(true);
    try {
      const token =
        localStorage.getItem('token') ||
        localStorage.getItem('admin_token') ||
        document.cookie.split('; ').find((r) => r.startsWith('admin_token=') || r.startsWith('token='))?.split('=')[1];
      const res = await fetch(`/api/admin/customers/${customer.mongoId || customer.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Customer Deleted', `${customer.name}'s account has been permanently removed.`);
        router.push('/admin/customers');
      } else {
        toast.error('Delete Failed', json.error || 'Could not delete customer.');
      }
    } catch (err: any) {
      toast.error('Delete Failed', err.message || 'Network error.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading && !customer) {
    return (
      <div className="space-y-4 pb-10 animate-pulse">
        <div className="h-10 bg-slate-100 rounded-xl w-32" />
        <div className="card-white p-6 flex gap-5">
          <div className="w-20 h-20 rounded-full bg-slate-200" />
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-slate-200 rounded w-48" />
            <div className="h-4 bg-slate-100 rounded w-72" />
            <div className="h-4 bg-slate-100 rounded w-56" />
          </div>
        </div>
        <div className="card-white p-6 h-24 bg-slate-50" />
        <div className="card-white p-6 h-40 bg-slate-50" />
      </div>
    );
  }

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

  const customerTrips = selectedCustomerDetails?.bookings || [];
  const customerTxns = selectedCustomerDetails?.transactions || [];
  const customerRefunds: RefundRecord[] = [];

  const bookingStats = selectedCustomerDetails?.customerBookingStats;
  const txnStats = selectedCustomerDetails?.customerTransactionStats;
  const bookingsPagination = selectedCustomerDetails?.bookingsPagination;
  const txnsPagination = selectedCustomerDetails?.transactionsPagination;

  const totalSpentAmount = txnStats?.totalSpentAmount ?? customer.totalSpent ?? 0;
  const totalBookingsCount = bookingStats?.total ?? customer.totalBookings ?? 0;
  const completedTripsCount = bookingStats?.completed ?? customer.completedBookings ?? 0;
  const cancelledTripsCount = bookingStats?.cancelled ?? customer.cancelledBookings ?? 0;
  const driverTripsCount = bookingStats?.driverTripsCount ?? 0;
  const valetTripsCount = bookingStats?.valetTripsCount ?? 0;

  const bookingColumns: Column<DriverBooking>[] = [
    {
      key: 'bookingNumber',
      header: 'Booking Ref',
      render: (b) => {
        const linkUrl = b.detailsUrl || (b.bookingType === 'Valet' || b.bookingNumber?.startsWith('VLT') ? `/admin/valet-bookings/${b.id}` : `/admin/driver-bookings/${b.id}`);
        return (
          <Link
            href={linkUrl}
            className="font-mono font-bold text-slate-900 hover:text-emerald-700 hover:underline text-left inline-block"
          >
            {b.bookingNumber}
          </Link>
        );
      },
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
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${b.bookingType === 'Valet'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : b.bookingType === 'Outstation'
                ? 'bg-sky-50 text-sky-800 border-sky-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
        >
          {b.bookingType === 'Valet' ? 'Valet Parking' : `${b.bookingType} (${b.durationHours}h)`}
        </span>
      ),
    },
    {
      key: 'pickupLocation',
      header: 'Pickup / Location',
      render: (b) => (
        <div className="max-w-[220px]">
          <div className="text-slate-900 font-semibold text-xs truncate flex items-center gap-1.5" title={`Pickup: ${b.pickupLocation}`}>
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{b.pickupLocation}</span>
          </div>
          <div className="text-slate-500 text-[11px] truncate flex items-center gap-1.5 mt-0.5" title={`Details: ${b.destinationLocation}`}>
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate">{b.destinationLocation}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'vehicleInfo',
      header: 'Vehicle / Event',
      render: (b) => (
        <div className="text-slate-700">
          <span className="font-semibold block truncate max-w-[150px]">{b.vehicleInfo.model}</span>
          <span className="text-[10px] text-slate-400 font-mono">{b.vehicleInfo.plateNumber}</span>
        </div>
      ),
    },
    {
      key: 'driverName',
      header: 'Assigned Driver / Staff',
      render: (b) =>
        b.driverName ? (
          <div>
            <span className="font-bold text-slate-900 block truncate max-w-[130px]">{b.driverName}</span>
            {b.driverPhone && <span className="text-[10px] text-slate-400">{b.driverPhone}</span>}
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
          ₹{(b.pricing?.totalCustomerAmount || b.totalAmount || 0).toLocaleString('en-IN')}
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
            className={`px-3 py-1 rounded text-[10px] font-bold inline-block min-w-[80px] ${b.status === 'Completed'
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
      render: (b) => {
        const linkUrl = b.detailsUrl || (b.bookingType === 'Valet' || b.bookingNumber?.startsWith('VLT') ? `/admin/valet-bookings/${b.id}` : `/admin/driver-bookings/${b.id}`);
        return (
          <Link
            href={linkUrl}
            className="px-2.5 py-1 text-[11px] font-bold text-white bg-primary hover:bg-emerald-800 border border-emerald-900 rounded-md transition-colors flex items-center gap-1 ml-auto w-fit"
            title="View Booking Details"
          >
            <Eye className="w-3 h-3" />
          </Link>
        );
      },
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
            className={`px-3 py-1 rounded text-[10px] font-bold inline-block min-w-[80px] ${t.status === 'Success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
          >
            {t.status}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (t) => (
        <Link
          href={`/admin/transactions/${t.id}`}
          className="px-2.5 py-1 text-[11px] font-bold text-white bg-primary hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors flex items-center gap-1 ml-auto w-fit"
          title="View Transaction Details"
        >
          <Eye className="w-3 h-3" />
        </Link>
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
            className={`px-3 py-1 rounded text-[10px] font-bold inline-block min-w-[80px] ${r.status === 'Completed' || r.status === 'Approved'
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
            ID: {customer.custId || customer.id}
          </span>
          <span
            className={`px-3 py-1 rounded text-xs font-bold ${customer.status === 'Active'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
          >
            {customer.status}
          </span>

          <button
            onClick={() => toggleCustomerStatus(customer.id)}
            className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1 transition-all ${customer.status === 'Active'
              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
              }`}
          >
            {customer.status === 'Active' ? (
              <><Ban className="w-3.5 h-3.5" /> Suspend Account</>
            ) : (
              <><Check className="w-3.5 h-3.5" /> Activate Account</>
            )}
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-3 py-1 text-xs font-bold rounded flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
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
              className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${customer.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
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
            <span className="text-lg font-bold text-emerald-900">₹{(totalSpentAmount || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Customer Performance Summary - Individual Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-white p-4 space-y-1">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block">Total Bookings</span>
          <div className="text-xl font-bold text-slate-900">{totalBookingsCount}</div>
          <p className="text-[10px] text-slate-500 font-medium">{driverTripsCount} Driver · {valetTripsCount} Valet</p>
        </div>

        <div className="card-white p-4 space-y-1">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-700 block">Completed Trips</span>
          <div className="text-xl font-bold text-emerald-600">{completedTripsCount}</div>
          <p className="text-[10px] text-emerald-600 font-medium">Successfully fulfilled</p>
        </div>

        <div className="card-white p-4 space-y-1">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-rose-700 block">Cancelled Trips</span>
          <div className="text-xl font-bold text-rose-600">{cancelledTripsCount}</div>
          <p className="text-[10px] text-rose-600 font-medium">Cancelled orders</p>
        </div>

        <div className="card-white p-4 space-y-1">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block">Active Status</span>
          <div className={`text-xl font-bold ${customer.status === 'Active' ? 'text-emerald-600' : 'text-rose-600'}`}>
            {customer.status}
          </div>
          <p className="text-[10px] text-slate-500">Account standing</p>
        </div>
      </div>

      {/* Customer Vehicle Information Section (Modern Full Width Card Design) */}
      {/* <div className="card-white p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Registered Vehicle Information</h3>
              <p className="text-xs text-slate-500">Vehicle specifications, RC & insurance details, and registered car photos</p>
            </div>
          </div>
          <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
            1 Vehicle Registered
          </span>
        </div>

        {(() => {
          const displayVehicles = [
            {
              id: 'cv-1',
              customerId: customer.id,
              customerName: customer.name,
              customerPhone: customer.phone,
              regNumber: 'KA-01-MJ-8821',
              make: 'Hyundai',
              model: 'Creta SX (O)',
              vehicleType: "EV",
              year: 2022,
              transmission: 'Automatic',
              fuelType: 'Petrol',
              insuranceExpiry: '2027-08-15',
              insuranceProvider: 'HDFC ERGO General Insurance',
              policyNumber: 'POL-99281-2024',
              rcNumber: 'RC-990218-KA',
              authorized: true,
              status: 'Active',
              vehicleImages: [
                'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
              ],
            },
          ];

          return (
            <div className="space-y-6">
              {displayVehicles.map((v) => {
                const images = v.vehicleImages && v.vehicleImages.length > 0
                  ? v.vehicleImages
                  : ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'];

                return (
                  <div key={v.id} className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-5">
            
                    <div className="flex items-center justify-between gap-4 bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-2xs">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-lg tracking-tight flex items-center gap-2">
                          <span>{v.make} {v.model}</span>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {v.year}
                          </span>
                        </h4>
                        <span className="text-xs text-slate-500 font-medium mt-0.5 block">Manufacturing Year: {v.year}</span>
                      </div>

                      
                      <div className="flex items-center gap-2">
                        <div className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-mono font-black text-base tracking-wider rounded-lg border-2 border-slate-900 shadow-sm flex items-center gap-2 ring-2 ring-amber-400/20">
                          <span className="w-2 h-2 rounded-full bg-slate-900 inline-block"></span>
                          <span>{v.regNumber}</span>
                        </div>
                      </div>
                    </div>

                  
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                   
                      <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3.5 bg-white p-5 rounded-xl border border-slate-200/80">
                        <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-100 space-y-0.5">
                          <span className="text-[10.5px] uppercase font-bold text-slate-400 block">Transmission</span>
                          <span className="font-extrabold text-primary text-sm">{v.transmission}</span>
                        </div>

                        <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-100 space-y-0.5">
                          <span className="text-[10.5px] uppercase font-bold text-slate-400 block">Fuel Engine</span>
                          <span className="font-bold text-slate-900 text-sm">{v.fuelType}</span>
                        </div>

                        <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-100 space-y-0.5">
                          <span className="text-[10.5px] uppercase font-bold text-slate-400 block">RC Number</span>
                          <span className="font-mono font-bold text-slate-800 text-xs">{v.rcNumber || 'RC-VERIFIED'}</span>
                        </div>

                        <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-100 space-y-0.5">
                          <span className="text-[10.5px] uppercase font-bold text-slate-400 block">Insurance Provider</span>
                          <span className="font-bold text-slate-800 text-xs truncate block" title={v.insuranceProvider}>{v.insuranceProvider}</span>
                        </div>

                        <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-100 space-y-0.5">
                          <span className="text-[10.5px] uppercase font-bold text-slate-400 block">Policy Number</span>
                          <span className="font-mono text-slate-700 text-xs truncate block">{v.policyNumber}</span>
                        </div>

                        <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-100 space-y-0.5">
                          <span className="text-[10.5px] uppercase font-bold text-slate-400 block">Insurance Expiry</span>
                          <span className="font-bold text-emerald-700 text-xs">{v.insuranceExpiry}</span>
                        </div>

                        <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-100 space-y-0.5">
                          <span className="text-[10.5px] uppercase font-bold text-slate-400 block">Vehicle Type</span>
                          <span className="font-bold text-emerald-700 text-xs">{v.vehicleType}</span>
                        </div>
                      </div>

     
                      <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="text-[11px] uppercase font-bold text-slate-600">Vehicle Photos</span>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{images.length} Photos</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 flex-1">
                          {images.map((img, idx) => (
                            <div key={idx} className="relative h-20 sm:h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-900 group">
                              <img
                                src={img}
                                alt={`Car Photo ${idx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div> */}

      {/* FULL WIDTH: Booking History Table using global DataTable */}
      <DataTable<DriverBooking>
        columns={bookingColumns}
        data={customerTrips}
        keyExtractor={(b) => b.id || (b as any)._id || b.bookingNumber || String(Math.random())}
        pageSize={bookingLimit}
        pageSizeOptions={[5, 10, 20, 50]}
        isLoading={isLoading}
        serverPagination={{
          currentPage: bookingsPagination?.page || bookingPage,
          totalPages: bookingsPagination?.totalPages || 1,
          totalItems: bookingsPagination?.total ?? (tripFilter === 'all' ? totalBookingsCount : (tripFilter === 'driver' ? driverTripsCount : (tripFilter === 'valet' ? valetTripsCount : (tripFilter === 'completed' ? completedTripsCount : cancelledTripsCount)))),
          onPageChange: handleBookingPageChange,
          onPageSizeChange: handleBookingLimitChange,
        }}
        emptyMessage="No booking records found for this customer."
        headerActions={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-primary" /> Customer Booking History
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => handleTripFilterChange('all')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${tripFilter === 'all'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
              >
                All ({totalBookingsCount})
              </button>
              <button
                type="button"
                onClick={() => handleTripFilterChange('driver')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${tripFilter === 'driver'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
              >
                Driver ({driverTripsCount})
              </button>
              <button
                type="button"
                onClick={() => handleTripFilterChange('valet')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${tripFilter === 'valet'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
              >
                Valet ({valetTripsCount})
              </button>
              <button
                type="button"
                onClick={() => handleTripFilterChange('completed')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${tripFilter === 'completed'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
              >
                Completed ({completedTripsCount})
              </button>
              <button
                type="button"
                onClick={() => handleTripFilterChange('cancelled')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${tripFilter === 'cancelled'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
              >
                Cancelled ({cancelledTripsCount})
              </button>
            </div>
          </div>
        }
      />

      {/* Financial Records Navigation & Content */}
      <div className="space-y-4">
        {/* Tab Filter Control */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary" /> Financial Activity & History
            </h3>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setFinancialTab('transactions')}
              className={`px-3 py-1 rounded-md font-bold transition-all flex items-center gap-1.5 cursor-pointer ${financialTab === 'transactions'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Transactions ({customerTxns.length})</span>
            </button>
            <button
              onClick={() => setFinancialTab('refunds')}
              className={`px-3 py-1 rounded-md font-bold transition-all flex items-center gap-1.5 cursor-pointer ${financialTab === 'refunds'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refunds ({customerRefunds.length})</span>
            </button>
          </div>
        </div>

        {/* Financial Tables Stack */}
        <div className="space-y-6">
          {financialTab === 'transactions' ? (
            <DataTable<Transaction>
              columns={txnColumns}
              data={customerTxns}
              keyExtractor={(t) => t.id || (t as any)._id || t.transactionId || String(Math.random())}
              pageSize={transactionLimit}
              pageSizeOptions={[5, 10, 20]}
              isLoading={isLoading}
              serverPagination={{
                currentPage: txnsPagination?.page || transactionPage,
                totalPages: txnsPagination?.totalPages || 1,
                totalItems: txnsPagination?.total ?? (txnStats?.totalCount ?? customerTxns.length),
                onPageChange: handleTransactionPageChange,
                onPageSizeChange: handleTransactionLimitChange,
              }}
              emptyMessage="No payment transactions recorded for this customer."
              headerActions={
                <div className="flex items-center justify-between w-full">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Receipt className="w-4.5 h-4.5 text-primary" /> Payment Transactions
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Payment Logs</span>
                </div>
              }
            />
          ) : (
            <DataTable<RefundRecord>
              columns={refundColumns}
              data={customerRefunds}
              keyExtractor={(r) => r.id}
              pageSize={5}
              emptyMessage="No refund requests or dispute claims recorded."
              headerActions={
                <div className="flex items-center justify-between w-full">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <RotateCcw className="w-4.5 h-4.5 text-rose-500" /> Refund History
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Refund Claims</span>
                </div>
              }
            />
          )}
        </div>
      </div>
      {/* Delete Customer Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => { if (!isDeleting) setShowDeleteModal(false); }}
          title="Permanently Delete Customer"
          subtitle="This action cannot be undone. All customer data will be removed."
          icon={Trash2}
          maxWidth="sm"
          footer={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition-colors text-xs disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete Permanently
              </button>
            </div>
          }
        >
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-3 text-xs">
            <img src={customer.avatar} alt={customer.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-200" />
            <div>
              <div className="font-bold text-slate-900">{customer.name}</div>
              <div className="text-rose-700">{customer.email} • {customer.custId}</div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
