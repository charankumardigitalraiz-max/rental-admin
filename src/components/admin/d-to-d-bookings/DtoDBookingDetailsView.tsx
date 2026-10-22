'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDtoDBookingStore, DtoDBooking } from '@/store/useDtoDBookingStore';
import { useToast } from '@/context/ToastContext';
import Modal from '@/components/ui/Modal';
import {
  ArrowLeft,
  CalendarCheck,
  User,
  Car,
  MapPin,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  Loader2,
  XCircle,
  Percent,
  UserPlus,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  FileText,
  Navigation,
  Compass,
  ArrowRight,
  Sparkles,
  Play,
  Key,
  Flag,
  Timer,
  Check,
} from 'lucide-react';

interface DtoDBookingDetailsViewProps {
  bookingId: string;
}

export default function DtoDBookingDetailsView({ bookingId }: DtoDBookingDetailsViewProps) {
  const router = useRouter();
  const { toast } = useToast();

  const {
    selectedBooking,
    availableDrivers,
    isLoading,
    isSubmitting,
    fetchBookingById,
    fetchAvailableDrivers,
    assignDriverToBooking,
    updateBookingStatus,
    cancelBooking,
  } = useDtoDBookingStore();

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Source driver requested trip cancellation');

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  useEffect(() => {
    if (bookingId) {
      fetchBookingById(bookingId);
    }
  }, [bookingId, fetchBookingById]);

  useEffect(() => {
    fetchAvailableDrivers();
  }, [fetchAvailableDrivers]);

  const booking = selectedBooking;

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriverId) {
      toast.error('Select Driver', 'Please select a driver from the list.');
      return;
    }

    const res = await assignDriverToBooking(bookingId, selectedDriverId, assignNotes);
    if (res.success) {
      toast.success('Driver Assigned', res.message || 'Driver assigned successfully.');
      setIsAssignModalOpen(false);
      setSelectedDriverId('');
      setAssignNotes('');
      fetchBookingById(bookingId);
    } else {
      toast.error('Assignment Failed', res.error || 'Failed to assign driver.');
    }
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await cancelBooking(bookingId, cancelReason);
    if (res.success) {
      toast.success('Booking Cancelled', 'The D-to-D booking has been cancelled.');
      setIsCancelModalOpen(false);
      setCancelReason('Source driver requested trip cancellation');
      fetchBookingById(bookingId);
    } else {
      toast.error('Cancellation Failed', res.error || 'Failed to cancel booking.');
    }
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatus) return;

    const res = await updateBookingStatus(bookingId, newStatus, statusNotes);
    if (res.success) {
      toast.success('Status Updated', res.message || 'Booking status updated.');
      setIsStatusModalOpen(false);
      setNewStatus('');
      setStatusNotes('');
      fetchBookingById(bookingId);
    } else {
      toast.error('Update Failed', res.error || 'Failed to update status.');
    }
  };

  const handleQuickStatusChange = async (targetStatus: string, confirmationMsg: string) => {
    const res = await updateBookingStatus(bookingId, targetStatus, `Admin progressed lifecycle to ${targetStatus}`);
    if (res.success) {
      toast.success('Lifecycle Updated', confirmationMsg);
      fetchBookingById(bookingId);
    } else {
      toast.error('Update Failed', res.error || 'Failed to update status.');
    }
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getTripDuration = () => {
    if (!booking?.tripStartedAt || !booking?.tripCompletedAt) return null;
    const start = new Date(booking.tripStartedAt).getTime();
    const end = new Date(booking.tripCompletedAt).getTime();
    const diffMs = end - start;
    if (diffMs <= 0) return '0 mins';
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hours === 0) return `${mins} mins`;
    return `${hours} hr ${remainingMins} mins`;
  };

  if (isLoading && !booking) {
    return (
      <div className="card-white p-12 text-center text-slate-500 max-w-xl mx-auto my-12 space-y-3">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
          <p className="text-xs font-semibold text-slate-700">Loading Peer-to-Peer Booking Details...</p>
          <span className="text-[11px] text-slate-400">Fetching drivers, route, and zero-fee pricing</span>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="card-white p-8 text-center text-slate-500 max-w-xl mx-auto my-12 space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">D-to-D Booking Not Found</h3>
        <p className="text-xs text-slate-500">
          We could not find booking record <code className="font-mono font-bold text-slate-700">{bookingId}</code>.
        </p>
        <button
          onClick={() => router.push('/admin/d-to-d-bookings')}
          className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover transition-colors cursor-pointer"
        >
          Back to D-to-D Bookings
        </button>
      </div>
    );
  }

  const getCurrentStatusTime = () => {
    switch (booking.status) {
      case 'trip_completed':
        return booking.tripCompletedAt ? formatDateTime(booking.tripCompletedAt) : null;
      case 'trip_started':
        return booking.tripStartedAt ? formatDateTime(booking.tripStartedAt) : null;
      case 'driver_arrived':
      case 'driver_arriving':
        return booking.driverArrivedAt ? formatDateTime(booking.driverArrivedAt) : null;
      case 'driver_assigned':
        return booking.driverAssignedAt ? formatDateTime(booking.driverAssignedAt) : null;
      case 'cancelled':
        return booking.cancelledAt ? formatDateTime(booking.cancelledAt) : null;
      case 'pending':
      default:
        return booking.createdAt ? formatDateTime(booking.createdAt) : null;
    }
  };

  const renderStatusBadge = (status: string) => {
    const time = getCurrentStatusTime();
    let badge = null;

    switch (status) {
      case 'trip_completed':
        badge = (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Completed
          </span>
        );
        break;
      case 'trip_started':
        badge = (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Trip In-Progress
          </span>
        );
        break;
      case 'driver_assigned':
        badge = (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            Driver Assigned
          </span>
        );
        break;
      case 'driver_arriving':
      case 'driver_arrived':
        badge = (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            Arrived at Pickup
          </span>
        );
        break;
      case 'cancelled':
        badge = (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Cancelled
          </span>
        );
        break;
      case 'pending':
      default:
        badge = (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            Searching Driver
          </span>
        );
        break;
    }

    return (
      <div className="flex flex-col items-end">
        {badge}
        {time && (
          <span className="text-[10px] text-slate-500 font-mono font-medium mt-0.5 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 text-slate-400" />
            <span>{time}</span>
          </span>
        )}
      </div>
    );
  };

  const isTripActive = booking.status !== 'cancelled' && booking.status !== 'trip_completed';

  const isPending = booking.status === 'pending';
  const isAssigned = booking.status === 'driver_assigned';
  const isArrived = booking.status === 'driver_arrived' || booking.status === 'driver_arriving';
  const isStarted = booking.status === 'trip_started';
  const isCompleted = booking.status === 'trip_completed';
  const isCancelled = booking.status === 'cancelled';

  const timelineSteps = [
    {
      label: 'Peer Request Created',
      time: formatDateTime(booking.createdAt),
      subtext: 'Created by Source Driver',
      done: true,
      active: isPending,
    },
    {
      label: 'Driver Assigned',
      time: booking.driverAssignedAt
        ? formatDateTime(booking.driverAssignedAt)
        : (booking.driver || isAssigned || isArrived || isStarted || isCompleted)
          ? formatDateTime(booking.createdAt)
          : null,
      subtext: booking.driver
        ? `${booking.driver.name} (${booking.driver.phone || 'Approved Driver'})`
        : isPending
          ? 'Searching Eligible Drivers'
          : 'Pending Assignment',
      done: Boolean(booking.driver || isAssigned || isArrived || isStarted || isCompleted),
      active: isAssigned,
    },
    {
      label: 'Driver Arrived at Pickup',
      time: booking.driverArrivedAt
        ? formatDateTime(booking.driverArrivedAt)
        : (isArrived || isStarted || isCompleted)
          ? (booking.tripStartedAt ? formatDateTime(booking.tripStartedAt) : 'Arrived at Pickup')
          : null,
      subtext: isArrived
        ? 'Driver waiting at pickup'
        : (isStarted || isCompleted)
          ? 'Reached pickup location'
          : 'En-route to pickup',
      done: isArrived || isStarted || isCompleted,
      active: isArrived,
    },
    {
      label: 'Trip Started (In-Transit)',
      time: booking.tripStartedAt ? formatDateTime(booking.tripStartedAt) : null,
      subtext: isStarted
        ? (booking.startOtp ? `In-transit • OTP: ${booking.startOtp}` : 'Trip in-progress')
        : isCompleted
          ? 'Trip started and completed'
          : 'Pending trip start',
      done: isStarted || isCompleted,
      active: isStarted,
    },
    {
      label: 'Ride Completed & Settled',
      time: booking.tripCompletedAt ? formatDateTime(booking.tripCompletedAt) : null,
      subtext: isCompleted
        ? `Fulfilled (0% Commission)${getTripDuration() ? ` • Duration: ${getTripDuration()}` : ''}`
        : 'Awaiting fulfillment',
      done: isCompleted,
      active: isCompleted,
    },
    ...(isCancelled
      ? [
          {
            label: 'Ride Cancelled',
            time: booking.cancelledAt ? formatDateTime(booking.cancelledAt) : formatDateTime(booking.createdAt),
            subtext: booking.cancellationReason || (booking.cancelledBy ? `Cancelled by ${booking.cancelledBy}` : 'Ride cancelled'),
            done: true,
            active: true,
            isCancelled: true,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4 pb-12 max-w-6xl mx-auto">
      {/* Top Header Card */}
      <div className="card-white p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/d-to-d-bookings')}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 px-3 py-1.5 rounded-lg shadow-2xs transition-all cursor-pointer active:scale-98"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Back</span>
          </button>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-mono leading-none">
                {booking.bookingNumber}
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                {booking.serviceType}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                0% Commission
              </span>
              {booking.linkedBooking?.bookingId && (
                <Link
                  href={`/admin/driver-bookings/${booking.driverBookingId || booking.linkedBooking.bookingId}`}
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 flex items-center gap-1 transition-colors"
                  title="View original customer booking"
                >
                  <span>From: {booking.linkedBooking.bookingId}</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </Link>
              )}
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              Driver-to-Driver Peer Booking Details
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {renderStatusBadge(booking.status)}

          <button
            onClick={() => fetchBookingById(bookingId)}
            className="p-1.5 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
            title="Refresh Details"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>
      </div>

      {/* Interactive Ride Lifecycle Progression Stepper & Controller */}
      <div className="card-white p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {/* <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Live Dispatch Pipeline
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                0% Platform Fee
              </span> */}

            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Ride Lifecycle Stage:</span>
              {booking.startOtp && (isStarted || isArrived || isAssigned) && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <Key className="w-2.5 h-2.5" />
                  <span>Start OTP: {booking.startOtp}</span>
                </span>
              )}
              {/* {renderStatusBadge(booking.status)} */}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isPending && `Waiting for driver assignment since ${formatDateTime(booking.createdAt) || 'request creation'}. Choose an approved fleet driver to dispatch this peer request.`}
              {isAssigned && `Driver ${booking.driver?.name || 'Assigned'} matched${booking.driverAssignedAt ? ` at ${formatDateTime(booking.driverAssignedAt)}` : ''}! Waiting for driver to reach pickup location.`}
              {isArrived && `Driver arrived at pickup location${booking.driverArrivedAt ? ` at ${formatDateTime(booking.driverArrivedAt)}` : ''}! Ready to start ride.`}
              {isStarted && `Ride is currently in-transit${booking.tripStartedAt ? ` since ${formatDateTime(booking.tripStartedAt)}` : ''}. Facilitating direct dispatch.`}
              {isCompleted && `Ride successfully completed${booking.tripCompletedAt ? ` on ${formatDateTime(booking.tripCompletedAt)}` : ''}${getTripDuration() ? ` (Duration: ${getTripDuration()})` : ''}. 100% fare settled.`}
              {isCancelled && `Ride was cancelled${booking.cancelledAt ? ` on ${formatDateTime(booking.cancelledAt)}` : ''}${booking.cancellationReason ? `: ${booking.cancellationReason}` : ''}.`}
            </p>
          </div>

          {/* Lifecycle Action Triggers */}
          <div className="flex flex-wrap items-center gap-2">
            {isPending && (
              <button
                onClick={() => {
                  setSelectedDriverId('');
                  setIsAssignModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-98"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Assign Driver</span>
              </button>
            )}

            {isAssigned && (
              <>
                <button
                  onClick={() => handleQuickStatusChange('driver_arrived', 'Driver marked as arrived at pickup location.')}
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Mark Driver Arrived</span>
                </button>
                <button
                  onClick={() => handleQuickStatusChange('trip_started', 'Ride started! Trip is now in-transit.')}
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Ride</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedDriverId(booking.driverId || '');
                    setIsAssignModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Reassign</span>
                </button>
              </>
            )}

            {isArrived && (
              <>
                <button
                  onClick={() => handleQuickStatusChange('trip_started', 'Ride started! Trip is now in-transit.')}
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Ride</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedDriverId(booking.driverId || '');
                    setIsAssignModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Reassign</span>
                </button>
              </>
            )}

            {isStarted && (
              <button
                onClick={() => handleQuickStatusChange('trip_completed', 'Ride marked as completed! 100% fare settled to driver.')}
                disabled={isSubmitting}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 active:scale-98"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Complete Ride</span>
              </button>
            )}

            {isTripActive && (
              <button
                onClick={() => {
                  setNewStatus(booking.status);
                  setIsStatusModalOpen(true);
                }}
                className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                title="Override Status"
              >
                <span>Override Status</span>
              </button>
            )}

            {isTripActive && (
              <button
                onClick={() => setIsCancelModalOpen(true)}
                className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                title="Cancel Ride"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 5-Step Visual Stepper Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
          {/* Step 1: Request Created */}
          <div className={`p-3 rounded-xl border transition-all ${isCancelled
            ? 'bg-slate-50 border-slate-200 opacity-60'
            : 'bg-emerald-50/50 border-emerald-200'
            }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 1</span>
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                ✓
              </div>
            </div>
            <h5 className="text-xs font-bold text-slate-900">Request Created</h5>
            <span className="text-[11px] text-slate-500 block truncate">Source Driver</span>
            <span className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-1 truncate">
              <Clock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
              <span className="truncate">{formatDateTime(booking.createdAt) || 'Logged'}</span>
            </span>
          </div>

          {/* Step 2: Driver Assigned */}
          <div className={`p-3 rounded-xl border transition-all ${isAssigned
            ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200'
            : (isArrived || isStarted || isCompleted)
              ? 'bg-emerald-50/50 border-emerald-200'
              : 'bg-slate-50 border-slate-200'
            }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 2</span>
              {(isArrived || isStarted || isCompleted) ? (
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
              ) : isAssigned ? (
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center animate-pulse">
                  <UserPlus className="w-3 h-3" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px]">
                  2
                </div>
              )}
            </div>
            <h5 className={`text-xs font-bold ${isAssigned ? 'text-indigo-900' : 'text-slate-900'}`}>
              Driver Assigned
            </h5>
            <span className="text-[11px] text-slate-500 block truncate">
              {booking.driver?.name || 'Searching...'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-1 truncate">
              <Clock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {booking.driverAssignedAt
                  ? formatDateTime(booking.driverAssignedAt)
                  : (booking.driver || isAssigned || isArrived || isStarted || isCompleted)
                    ? (formatDateTime(booking.createdAt) || 'Assigned')
                    : (isPending ? 'Pending Match' : 'Unassigned')}
              </span>
            </span>
          </div>

          {/* Step 3: Driver Arrived */}
          <div className={`p-3 rounded-xl border transition-all ${isArrived
            ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-200'
            : (isStarted || isCompleted)
              ? 'bg-emerald-50/50 border-emerald-200'
              : 'bg-slate-50 border-slate-200'
            }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 3</span>
              {(isStarted || isCompleted) ? (
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
              ) : isArrived ? (
                <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center animate-pulse">
                  <MapPin className="w-3 h-3" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px]">
                  3
                </div>
              )}
            </div>
            <h5 className={`text-xs font-bold ${isArrived ? 'text-purple-900' : 'text-slate-900'}`}>
              Driver Arrived
            </h5>
            <span className="text-[11px] text-slate-500 block truncate">Pickup Location</span>
            <span className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-1 truncate">
              <Clock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {booking.driverArrivedAt
                  ? formatDateTime(booking.driverArrivedAt)
                  : (isArrived || isStarted || isCompleted)
                    ? (booking.tripStartedAt ? formatDateTime(booking.tripStartedAt) : 'Arrived at Pickup')
                    : 'Upcoming'}
              </span>
            </span>
          </div>

          {/* Step 4: Ride Started */}
          <div className={`p-3 rounded-xl border transition-all ${isStarted
            ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
            : isCompleted
              ? 'bg-emerald-50/50 border-emerald-200'
              : 'bg-slate-50 border-slate-200'
            }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 4</span>
              {isCompleted ? (
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
              ) : isStarted ? (
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center animate-pulse">
                  <Play className="w-3 h-3 fill-current" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px]">
                  4
                </div>
              )}
            </div>
            <h5 className={`text-xs font-bold ${isStarted ? 'text-blue-900' : 'text-slate-900'}`}>
              Ride Started
            </h5>
            <span className="text-[11px] text-slate-500 block truncate">
              {booking.startOtp ? `OTP: ${booking.startOtp}` : 'Trip In-Transit'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-1 truncate">
              <Clock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {booking.tripStartedAt
                  ? formatDateTime(booking.tripStartedAt)
                  : (isStarted ? 'In-Transit' : 'Pending Start')}
              </span>
            </span>
          </div>

          {/* Step 5: Ride Completed */}
          <div className={`p-3 rounded-xl border transition-all ${isCompleted
            ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200'
            : 'bg-slate-50 border-slate-200'
            }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 5</span>
              {isCompleted ? (
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px]">
                  5
                </div>
              )}
            </div>
            <h5 className={`text-xs font-bold ${isCompleted ? 'text-emerald-900' : 'text-slate-900'}`}>
              Ride Completed
            </h5>
            <span className="text-[11px] text-slate-500 block truncate">100% Driver Fare</span>
            <span className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-1 truncate">
              <Clock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {booking.tripCompletedAt
                  ? formatDateTime(booking.tripCompletedAt)
                  : (isCompleted ? 'Fulfilled' : 'Awaiting End')}
              </span>
            </span>
          </div>
        </div>

        {/* Cancellation Notice Banner if Cancelled */}
        {isCancelled && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <div>
                <span className="font-bold">Ride Cancelled</span>
                <span className="text-rose-600 ml-1.5 font-normal">
                  {booking.cancellationReason || `Cancelled by ${booking.cancelledBy || 'admin'}`}
                </span>
              </div>
            </div>
            {booking.cancelledAt && (
              <span className="text-[10.5px] font-mono text-rose-700 font-bold flex items-center gap-1 shrink-0">
                <Clock className="w-3 h-3 text-rose-500" />
                <span>{formatDateTime(booking.cancelledAt)}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Grid: 2 Columns Left + 1 Column Sidebar Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Both Drivers Card (Source vs Assigned) */}
          <div className="card-white overflow-hidden shadow-2xs">
            <div className="bg-primary px-4 py-2.5 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-white/15 flex items-center justify-center text-white backdrop-blur-xs">
                  <User className="w-3.5 h-3.5" />
                </div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                  Driver-to-Driver Hand-Off Match
                </h4>
              </div>
              <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full tracking-wide">
                Peer Fleet
              </span>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              {/* Source Driver */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Source Driver (Initiator)
                  </span>
                  <span className="text-[11px] text-slate-400">Created Request</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 border-2 border-emerald-200 flex items-center justify-center font-bold text-base shrink-0 overflow-hidden">
                    {booking.sourceDriver?.avatar ? (
                      <img src={booking.sourceDriver.avatar} alt="Source Driver" className="w-full h-full object-cover" />
                    ) : (
                      booking.sourceDriver?.name?.charAt(0).toUpperCase() || 'D'
                    )}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">
                      {booking.sourceDriver?.name || 'Peer Driver'}
                    </h5>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{booking.sourceDriver?.phone || 'No phone'}</span>
                    </div>
                    {booking.sourceDriver?.email && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{booking.sourceDriver.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/80 text-xs flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Driver Rating:</span>
                  <span className="font-bold text-slate-800">★ {booking.sourceDriver?.rating || '5.0'}</span>
                </div>
              </div>

              {/* Fulfilling Driver */}
              <div className="space-y-3 pt-4 md:pt-0 md:pl-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    Fulfilling Driver (Executor)
                  </span>
                  <span className="text-[11px] text-slate-400">Assigned Driver</span>
                </div>

                {booking.driver ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-800 border-2 border-indigo-200 flex items-center justify-center font-bold text-base shrink-0 overflow-hidden">
                        {booking.driver?.avatar ? (
                          <img src={booking.driver.avatar} alt="Assigned Driver" className="w-full h-full object-cover" />
                        ) : (
                          booking.driver?.name?.charAt(0).toUpperCase() || 'D'
                        )}
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-slate-900">{booking.driver.name}</h5>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{booking.driver.phone || 'N/A'}</span>
                        </div>
                        {booking.driver.email && (
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{booking.driver.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/80 text-xs flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Driver Rating:</span>
                      <span className="font-bold text-slate-800">★ {booking.driver.rating || '5.0'}</span>
                    </div>
                  </>
                ) : (
                  <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 text-center space-y-2">
                    <p className="text-xs font-semibold text-amber-800">No Fulfilling Driver Assigned</p>
                    <p className="text-[11px] text-amber-700/80">
                      This peer booking is waiting for an approved driver dispatch.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedDriverId('');
                        setIsAssignModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Assign Driver Now</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Route & Vehicle Information */}
          <div className="card-white overflow-hidden shadow-2xs">
            <div className="bg-primary px-4 py-2.5 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-white/15 flex items-center justify-center text-white backdrop-blur-xs">
                  <Navigation className="w-3.5 h-3.5" />
                </div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                  Route & Vehicle Specifications
                </h4>
              </div>
              <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full tracking-wide">
                Trip Route
              </span>
            </div>

            <div className="p-5 space-y-5">
              {/* Route Locations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pickup Location</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900">{booking.pickupLocation}</p>
                </div>

                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    <span>Drop Location</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900">{booking.dropLocation || 'As requested by passenger'}</p>
                </div>
              </div>

              {/* Vehicle Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-stone-200/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Vehicle Type</span>
                  <span className="font-bold text-slate-900 capitalize">{booking.vehicleInfo?.type || 'Sedan'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Transmission</span>
                  <span className="font-bold text-slate-900 capitalize">{booking.vehicleInfo?.transmission || 'Manual'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Plate Number</span>
                  <span className="font-mono font-bold text-slate-900 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200 inline-block mt-0.5">
                    {booking.vehicleInfo?.vehicleNumber || 'Unassigned'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Booking Mode</span>
                  <span className="font-bold text-slate-900 capitalize">{booking.bookingMode}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Notes & Administration */}
          {(booking.adminNotes || booking.driverNotes || booking.cancellationReason) && (
            <div className="card-white p-5 space-y-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider border-b border-stone-200 pb-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Notes & Booking Logs</span>
              </div>

              {booking.adminNotes && (
                <div className="text-xs">
                  <span className="font-bold text-slate-700 block mb-0.5">Admin Notes:</span>
                  <p className="text-slate-600 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                    {booking.adminNotes}
                  </p>
                </div>
              )}

              {booking.driverNotes && (
                <div className="text-xs">
                  <span className="font-bold text-slate-700 block mb-0.5">Driver Notes:</span>
                  <p className="text-slate-600 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                    {booking.driverNotes}
                  </p>
                </div>
              )}

              {booking.cancellationReason && (
                <div className="text-xs">
                  <span className="font-bold text-rose-700 block mb-0.5">Cancellation Reason:</span>
                  <p className="text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                    {booking.cancellationReason}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar: Pricing & Timeline */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <div className="card-white overflow-hidden shadow-2xs">
            <div className="bg-primary px-4 py-2.5 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-white/15 flex items-center justify-center text-white backdrop-blur-xs">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                  Fare & Financials
                </h4>
              </div>
              <span className="text-[10px] font-bold bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full tracking-wide">
                0% Fee
              </span>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Base Amount</span>
                  <span className="font-medium text-slate-900">{formatCurrency(booking.pricing.baseAmount)}</span>
                </div>

                {booking.pricing.extraKmAmount > 0 && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Extra KM Charges</span>
                    <span className="font-medium text-slate-900">{formatCurrency(booking.pricing.extraKmAmount)}</span>
                  </div>
                )}

                {booking.pricing.driverAllowance > 0 && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Driver Allowance</span>
                    <span className="font-medium text-slate-900">{formatCurrency(booking.pricing.driverAllowance)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-600">
                  <span>Driver Direct Fee</span>
                  <span className="font-medium text-slate-900">{formatCurrency(booking.pricing.driverFee)}</span>
                </div>

                {/* ZERO PLATFORM COMMISSION */}
                <div className="flex items-center justify-between py-1.5 px-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 font-semibold text-xs">
                  <div className="flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Platform Commission</span>
                  </div>
                  <span className="font-bold text-emerald-700">₹0 (0%)</span>
                </div>

                {booking.pricing.taxAmount > 0 && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Tax / GST</span>
                    <span className="font-medium text-slate-900">{formatCurrency(booking.pricing.taxAmount)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-stone-200 pt-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Amount</span>
                  <span className="text-xl font-bold text-slate-900 font-mono">
                    {formatCurrency(booking.pricing.totalAmount)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Payment Method</span>
                  <span className="text-xs font-bold text-slate-800 uppercase">{booking.paymentMethod}</span>
                </div>
              </div>

              <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200 text-xs flex items-center justify-between">
                <span className="text-slate-500 font-medium">Payment Status:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${booking.paymentStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                    }`}
                >
                  {booking.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Ride Lifecycle Timeline */}
          <div className="card-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                <span>Ride Lifecycle Timeline</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-medium">Status & Time</span>
            </div>

            <div className="space-y-4 text-xs">
              {timelineSteps.map((step, idx) => (
                <div key={step.label} className="flex items-start gap-3 relative">
                  {idx < timelineSteps.length - 1 && (
                    <div
                      className={`absolute left-2.5 top-5 w-0.5 h-8 ${
                        step.isCancelled
                          ? 'bg-rose-400'
                          : step.done
                            ? 'bg-emerald-500'
                            : 'bg-slate-200'
                      }`}
                    />
                  )}
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 ${
                      step.isCancelled
                        ? 'bg-rose-600 text-white'
                        : step.done
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-400 border border-slate-300'
                    }`}
                  >
                    {step.isCancelled ? (
                      <XCircle className="w-3.5 h-3.5" />
                    ) : step.done ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`font-bold text-xs block ${
                          step.isCancelled
                            ? 'text-rose-700'
                            : step.done
                              ? 'text-slate-900'
                              : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>

                    {step.time ? (
                      <div className="flex items-center gap-1 text-[10.5px] font-mono text-emerald-700 font-semibold mt-0.5">
                        <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{step.time}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 mt-0.5">
                        <Clock className="w-2.5 h-2.5 text-slate-300 shrink-0" />
                        <span>{step.done ? 'Recorded' : 'Pending'}</span>
                      </div>
                    )}

                    {step.subtext && (
                      <span className="text-[10px] text-slate-500 block mt-0.5 truncate">
                        {step.subtext}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Card */}
          {isTripActive && (
            <div className="card-white p-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Lifecycle Actions</span>
                <span className="text-[10px] text-slate-400 font-normal">Direct Dispatch</span>
              </h4>

              {isPending && (
                <button
                  onClick={() => {
                    setSelectedDriverId('');
                    setIsAssignModalOpen(true);
                  }}
                  className="w-full py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-98"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Assign Fulfilling Driver</span>
                </button>
              )}

              {isAssigned && (
                <>
                  <button
                    onClick={() => handleQuickStatusChange('driver_arrived', 'Driver marked as arrived at pickup location.')}
                    disabled={isSubmitting}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50 active:scale-98"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Mark Driver Arrived</span>
                  </button>
                  <button
                    onClick={() => handleQuickStatusChange('trip_started', 'Ride started! Trip is now in-transit.')}
                    disabled={isSubmitting}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50 active:scale-98"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Ride</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDriverId(booking.driverId || '');
                      setIsAssignModalOpen(true);
                    }}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Reassign Driver</span>
                  </button>
                </>
              )}

              {isArrived && (
                <>
                  <button
                    onClick={() => handleQuickStatusChange('trip_started', 'Ride started! Trip is now in-transit.')}
                    disabled={isSubmitting}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50 active:scale-98"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Ride</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDriverId(booking.driverId || '');
                      setIsAssignModalOpen(true);
                    }}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Reassign Driver</span>
                  </button>
                </>
              )}

              {isStarted && (
                <button
                  onClick={() => handleQuickStatusChange('trip_completed', 'Ride marked as completed! 100% fare settled to driver.')}
                  disabled={isSubmitting}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50 active:scale-98"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Complete Ride</span>
                </button>
              )}

              <button
                onClick={() => {
                  setNewStatus(booking.status);
                  setIsStatusModalOpen(true);
                }}
                className="w-full py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Override Status</span>
              </button>

              <button
                onClick={() => setIsCancelModalOpen(true)}
                className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel Booking</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Assign / Reassign Driver */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Assign Driver to ${booking.bookingNumber}`}
        subtitle="Select an active approved driver from the fleet to fulfill this peer booking."
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Select Active Driver ({availableDrivers.length} Available)
            </label>
            <select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-slate-800"
              required
            >
              <option value="">-- Choose Driver --</option>
              {availableDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} · {d.phone} ({d.dutyStatus}) - ★{d.rating}
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
              placeholder="e.g., Assigned per source driver's request."
              className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-slate-800"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-stone-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedDriverId}
              className="px-4 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
              <span>Confirm Assignment</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Cancel Booking */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title={`Cancel Booking ${booking.bookingNumber}`}
        subtitle="Are you sure you want to cancel this peer booking?"
      >
        <form onSubmit={handleCancelSubmit} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Cancellation Reason
            </label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-slate-800"
            >
              <option value="Source driver requested trip cancellation">Source driver requested trip cancellation</option>
              <option value="Customer cancelled the ride">Customer cancelled the ride</option>
              <option value="No fulfilling driver available">No fulfilling driver available</option>
              <option value="Duplicate booking created">Duplicate booking created</option>
              <option value="Vehicle breakdown / emergency">Vehicle breakdown / emergency</option>
            </select>
          </div>

          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>This action will cancel the ride dispatch. Both drivers will be notified.</span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setIsCancelModalOpen(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-stone-100 rounded-lg"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
              <span>Confirm Cancellation</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Update Status */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={`Update Status: ${booking.bookingNumber}`}
        subtitle="Select a new status for this peer booking."
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Booking Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-slate-800"
            >
              <option value="pending">pending (Searching Driver)</option>
              <option value="driver_assigned">driver_assigned (Driver Assigned)</option>
              <option value="driver_arrived">driver_arrived (Driver at Pickup)</option>
              <option value="trip_started">trip_started (In-Progress)</option>
              <option value="trip_completed">trip_completed (Completed)</option>
              <option value="cancelled">cancelled (Cancelled)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Status Change Notes (Optional)
            </label>
            <textarea
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              rows={2}
              placeholder="e.g., Driver completed ride manually."
              className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-slate-800"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setIsStatusModalOpen(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-stone-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>Save Status</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
