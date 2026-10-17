'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRentalStore } from '@/store/useRentalStore';
import { useDriverBookingStore } from '@/store/useDriverBookingStore';
import {
  ArrowLeft,
  CalendarCheck,
  User,
  Car,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle2,
  ShieldCheck,
  Phone,
  Mail,
  Receipt,
  RotateCcw,
  Loader2,
  UserX,
  ExternalLink,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { RejectedDriver } from '@/types';

interface DriverBookingDetailsViewProps {
  bookingId?: string;
}

export default function DriverBookingDetailsView({ bookingId }: DriverBookingDetailsViewProps = {}) {
  const router = useRouter();
  const {
    driverBookings: rentalBookings,
    drivers: rentalDrivers,
    selectedDriverBookingId,
    setActiveTab,
    setSelectedDriverId,
    setSelectedCustomerId,
  } = useRentalStore();

  const {
    driverBookings,
    selectedBooking,
    availableDrivers,
    isLoading,
    fetchDriverBookingById,
    fetchAvailableDrivers,
  } = useDriverBookingStore();

  const targetId = bookingId || selectedDriverBookingId;

  useEffect(() => {
    if (targetId) {
      fetchDriverBookingById(targetId);
    }
  }, [targetId, fetchDriverBookingById]);

  useEffect(() => {
    if (availableDrivers.length === 0) {
      fetchAvailableDrivers();
    }
  }, [availableDrivers.length, fetchAvailableDrivers]);

  const getDriverInfo = (driverId: string, preloadedDriver?: RejectedDriver['driver']) => {
    if (preloadedDriver && (preloadedDriver.name || preloadedDriver.firstName)) {
      return preloadedDriver;
    }
    const foundAvail = availableDrivers.find((d) => d.id === driverId);
    if (foundAvail) {
      return {
        _id: foundAvail.id,
        driverId: foundAvail.id,
        name: foundAvail.name,
        phone: foundAvail.phone,
        profilePicture: foundAvail.avatar,
        avatar: foundAvail.avatar,
        rating: foundAvail.rating,
        status: foundAvail.status,
      };
    }
    const foundRental = rentalDrivers?.find((d) => d.id === driverId);
    if (foundRental) {
      return {
        _id: foundRental.id,
        driverId: foundRental.id,
        name: foundRental.name,
        phone: foundRental.phone,
        profilePicture: foundRental.avatar,
        avatar: foundRental.avatar,
        rating: foundRental.rating,
        status: foundRental.status,
      };
    }
    return preloadedDriver;
  };

  const booking =
    (selectedBooking && (selectedBooking.id === targetId || selectedBooking.bookingNumber === targetId || selectedBooking._id === targetId) ? selectedBooking : null) ||
    driverBookings.find((b) => b.id === targetId || b.bookingNumber === targetId || b._id === targetId) ||
    rentalBookings.find((b) => b.id === targetId || b.bookingNumber === targetId || b._id === targetId) ||
    selectedBooking ||
    driverBookings[0] ||
    rentalBookings[0];

  if (!booking) {
    return (
      <div className="card-white p-8 text-center text-slate-500 max-w-xl mx-auto my-12 space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-xs font-semibold text-slate-600">Loading booking details from database...</p>
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold">Booking record not found.</p>
            <button onClick={() => router.back()} className="text-primary font-bold underline text-xs">
              Back to Bookings
            </button>
          </>
        )}
      </div>
    );
  }

  const timelineSteps = [
    { label: 'Booking Created', timestamp: booking.timeline.created, done: true },
    { label: 'Searching Driver', timestamp: booking.timeline.searching, done: !!booking.timeline.searching },
    { label: 'Driver Accepted', timestamp: booking.timeline.accepted, done: !!booking.timeline.accepted },
    { label: 'Driver Assigned', timestamp: booking.timeline.assigned, done: !!booking.timeline.assigned },
    { label: 'Driver Arrived', timestamp: booking.timeline.arrived, done: !!booking.timeline.arrived },
    { label: 'Service Started', timestamp: booking.timeline.started, done: !!booking.timeline.started },
    { label: 'Service Completed', timestamp: booking.timeline.completed, done: !!booking.timeline.completed },
  ];

  const isBookingRejected =
    booking.status === 'Rejected' ||
    Boolean(booking.rejectedDrivers && booking.rejectedDrivers.length > 0);

  return (
    <div className="space-y-4 pb-10 max-w-6xl mx-auto">
      {/* Top Header Navigation Card */}
      <div className="card-white p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 px-3 py-1.5 rounded-lg shadow-2xs transition-all cursor-pointer active:scale-98"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Back</span>
          </button>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-mono leading-none">
              {booking.bookingNumber || booking.bookingId || booking.id || 'N/A'}
            </h2>
            <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
              Driver Booking Details
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 ml-auto sm:ml-0">
          <span
            className={`px-3 py-1 rounded-md text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs ${booking.status === 'Completed'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : booking.status === 'Searching Driver'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : booking.status === 'Cancelled' || booking.status === 'Rejected'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-primary-light text-primary border border-primary/20'
              }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${booking.status === 'Completed'
                ? 'bg-emerald-500'
                : booking.status === 'Searching Driver'
                  ? 'bg-amber-500 animate-pulse'
                  : booking.status === 'Cancelled' || booking.status === 'Rejected'
                    ? 'bg-rose-500'
                    : 'bg-primary'
                }`}
            />
            {booking.status}
          </span>
        </div>
      </div>

      {/* Grid: Main Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Overview Card */}
          <div className="card-white overflow-hidden shadow-2xs hover:shadow-xs transition-shadow">
            <div className="bg-primary px-4 py-2.5 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-white/15 flex items-center justify-center text-white backdrop-blur-xs">
                  <CalendarCheck className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                  Booking Lifecycle & Core Info
                </h3>
              </div>
              <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full tracking-wide">
                {booking.bookingType} Service
              </span>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block font-medium uppercase">Service Type</span>
                  <span className="font-bold text-primary text-sm">{booking.bookingType} Driver</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-medium uppercase">Duration</span>
                  <span className="font-bold text-slate-900 text-sm">{booking.durationHours} Hours</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-medium uppercase">Date & Time</span>
                  <span className="font-bold text-slate-800">{booking.bookingDate} @ {booking.bookingTime}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-medium uppercase">Created At</span>
                  <span className="font-medium text-slate-600">{booking.timeline.created}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Vehicle Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Information */}
            <div className="card-white overflow-hidden shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
              <div className="bg-primary px-4 py-2.5 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-white/15 flex items-center justify-center text-white backdrop-blur-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                    Customer Profile
                  </h4>
                </div>
                <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full tracking-wide">
                  Passenger
                </span>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={booking.customerAvatar}
                      alt={booking.customerName}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-primary/20 shadow-2xs shrink-0"
                    />
                    <div className="min-w-0">
                      <h5 className="font-bold text-slate-900 text-sm truncate">{booking.customerName}</h5>
                      <a
                        href={booking.customerPhone ? `tel:${booking.customerPhone}` : undefined}
                        className="text-[11px] text-slate-500 hover:text-primary flex items-center gap-1.5 transition-colors mt-0.5 font-medium"
                      >
                        <Phone className="w-3 h-3 text-slate-400" /> {booking.customerPhone}
                      </a>
                    </div>
                  </div>

                  <Link
                    href={booking.customerId ? `/admin/customers/${booking.customerId}` : (booking.userId ? `/admin/customers/${booking.userId}` : '/admin/customers')}
                    className="group px-2.5 py-1 text-[11px] font-bold text-white bg-primary hover:bg-slate-100 hover:text-primary border border-transparent hover:border-slate-300 rounded-lg flex items-center gap-1 shadow-2xs transition-all shrink-0 cursor-pointer"
                    title="View Customer Profile"
                  >
                    <span>Profile</span>
                    <ExternalLink className="w-3 h-3 text-white group-hover:text-primary transition-colors" />
                  </Link>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <a
                    href={booking.customerEmail ? `mailto:${booking.customerEmail}` : undefined}
                    className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-primary transition-colors truncate"
                    title={booking.customerEmail}
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{booking.customerEmail}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Vehicle Information (Customer's Car) */}
            <div className="card-white overflow-hidden shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
              <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-white/15 flex items-center justify-center text-white backdrop-blur-xs">
                    <Car className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                    Customer's Vehicle
                  </h4>
                </div>
                <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full tracking-wide">
                  {booking.vehicleInfo.type || 'Vehicle'}
                </span>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vehicle Model</span>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <h5 className="font-bold text-slate-900 text-sm truncate">{booking.vehicleInfo.model}</h5>
                    <span className="font-mono font-bold text-xs bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-800 shrink-0">
                      {booking.vehicleInfo.plateNumber}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 border-t border-slate-100 pt-2">
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-medium">Body Type</span>
                    <span className="font-bold text-slate-800">{booking.vehicleInfo.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-medium">Fuel / Trans</span>
                    <span className="font-bold text-slate-800 truncate block">
                      {booking.vehicleInfo.fuelType} • {booking.vehicleInfo.transmission}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Pickup & Destination Location Card */}
          <div className="card-white p-5 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <MapPin className="w-4 h-4 text-emerald-600" /> Location Details
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Pickup Location</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{booking.pickupLocation}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 bg-rose-50/50 border border-rose-100 rounded-lg">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-rose-800 uppercase block">Destination Location</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{booking.destinationLocation}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Inspection Evidence Card */}
          <div className="card-white p-5 space-y-4">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <ShieldCheck className="w-4 h-4 text-primary" /> Pre & Post Trip Vehicle Inspection Evidence
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <span className="text-[10px] font-bold uppercase text-emerald-700 block">Pre-Trip Inspection Baseline</span>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Odometer:</span>
                  <span className="font-bold text-slate-900">24,150 km</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Fuel Level:</span>
                  <span className="font-bold text-emerald-700">85% Full</span>
                </div>
                <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded block text-center">
                  Verified by Customer ✓
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <span className="text-[10px] font-bold uppercase text-sky-700 block">Post-Trip Inspection Return</span>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Odometer:</span>
                  <span className="font-bold text-slate-900">24,215 km (+65km)</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Fuel Level:</span>
                  <span className="font-bold text-sky-700">70% Remaining</span>
                </div>
                <span className="text-[10px] text-sky-800 font-bold bg-sky-100 px-2 py-0.5 rounded block text-center">
                  Completed Clean ✓
                </span>
              </div>
            </div>
          </div>

          {/* Rejected Drivers History Card */}
          {booking.rejectedDrivers && booking.rejectedDrivers.length > 0 && (
            <div className="card-white p-5 space-y-4 border-rose-100 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-rose-100 text-rose-600 flex items-center justify-center">
                    <UserX className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Rejected Drivers List
                  </h4>
                </div>
                <span className="text-[10.5px] font-bold text-rose-700 bg-rose-50 border border-rose-200/80 px-2.5 py-0.5 rounded-full">
                  {booking.rejectedDrivers.length} Rejected
                </span>
              </div>

              <div className="space-y-3">
                {booking.rejectedDrivers.map((rej, idx) => {
                  const driverObj = getDriverInfo(rej.driverId, rej.driver);
                  const driverName =
                    driverObj?.name ||
                    [driverObj?.firstName, driverObj?.lastName].filter(Boolean).join(' ') ||
                    `Driver (${rej.driverId?.slice(-6) || 'N/A'})`;
                  const driverPhone = driverObj?.phone;
                  const driverAvatar =
                    driverObj?.avatar ||
                    driverObj?.profilePicture ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80';
                  const driverCode = driverObj?.driverId || rej.driverId;
                  const rejectFormattedTime = rej.rejectTime
                    ? new Date(rej.rejectTime).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                    : 'Time not recorded';

                  return (
                    <div
                      key={rej._id || idx}
                      className="p-3.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 rounded-xl transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={driverAvatar}
                            alt={driverName}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-200 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-slate-900 text-xs sm:text-sm">{driverName}</h5>
                              {driverCode && (
                                <span className="text-[10px] font-mono font-semibold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.2 rounded">
                                  {driverCode.length > 12 ? driverCode.slice(-6) : driverCode}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2.5 text-[11px] text-slate-500 mt-0.5">
                              {driverPhone && (
                                <span className="flex items-center gap-1 font-medium text-slate-600">
                                  <Phone className="w-3 h-3 text-slate-400" /> {driverPhone}
                                </span>
                              )}
                              {driverObj?.rating !== undefined && (
                                <span className="text-amber-600 font-bold">
                                  ⭐ {driverObj.rating}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {rej.driverId && (
                          <Link
                            href={`/admin/drivers/${rej.driverId}`}
                            className="group px-2.5 py-1 text-[11px] font-bold text-white bg-primary hover:bg-slate-100 hover:text-primary border border-transparent hover:border-slate-300 rounded-lg flex items-center gap-1 shadow-2xs transition-all shrink-0 cursor-pointer"
                            title="View Driver Profile"
                          >
                            <span>Profile</span>
                            <ExternalLink className="w-3 h-3 text-white group-hover:text-primary transition-colors" />
                          </Link>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                            Declined
                          </span>
                          <span className="font-semibold text-slate-800 text-[11.5px]">
                            {rej.reason || 'Driver declined the ride'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-[10.5px] text-slate-500 font-medium">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{rejectFormattedTime}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Booking Timeline */}
          <div className="card-white p-5 space-y-4">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Clock className="w-4 h-4 text-primary" /> Service Lifecycle Timeline
            </h4>
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {timelineSteps.map((step, idx) => (
                <div key={idx} className="relative flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step.done
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-400 border border-slate-300'
                        }`}
                    >
                      {step.done ? '✓' : idx + 1}
                    </span>
                    <span className={`font-bold ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>
                      {step.label}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {step.timestamp || 'Pending...'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Driver & Pricing Breakdown */}
        <div className="space-y-6">
          {/* Assigned Driver Card */}
          <div className="card-white p-5 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <ShieldCheck className="w-4 h-4 text-primary" /> Driver Information
            </h4>
            {booking.driverName ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={booking.driverAvatar}
                    alt={booking.driverName}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-light"
                  />
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">{booking.driverName}</h5>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {booking.driverPhone}
                    </p>
                    <span className="text-[10px] font-bold text-amber-600">⭐ {booking.driverRating} Driver Rating</span>
                  </div>
                </div>
                <Link
                  href={booking.driverId ? `/admin/drivers/${booking.driverId}` : '/admin/drivers'}
                  className="w-full py-1.5 bg-primary text-white rounded font-bold text-xs transition-colors block text-center"
                >
                  View Full Driver Profile
                </Link>
              </div>
            ) : (
              <div
                className={`p-4 rounded-lg text-center space-y-2 border ${isBookingRejected
                  ? 'bg-rose-50 border-rose-200'
                  : 'bg-amber-50 border-amber-200'
                  }`}
              >
                <p
                  className={`text-xs font-bold ${isBookingRejected ? 'text-rose-800' : 'text-amber-800'
                    }`}
                >
                  {isBookingRejected
                    ? 'Ride was declined by driver. No driver assigned.'
                    : 'No driver assigned yet.'}
                </p>
                <button
                  onClick={() => setActiveTab('driver-requests')}
                  className="px-3 py-1 bg-primary text-white text-xs font-bold rounded shadow-xs cursor-pointer hover:bg-primary-hover transition-colors"
                >
                  Go to Dispatch Center
                </button>
              </div>
            )}
          </div>

          {/* Pricing & Revenue Split Breakdown */}
          <div className="card-white p-5 space-y-4">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Receipt className="w-4 h-4 text-primary" /> Pricing & Payout Split
            </h4>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-500">Base Fare ({booking.bookingType}):</span>
                <span className="font-semibold text-slate-800">₹{booking.pricing.baseAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration Charge ({booking.durationHours}h):</span>
                <span className="font-semibold text-slate-800">₹{booking.pricing.durationCharge}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle Type Charge:</span>
                <span className="font-semibold text-slate-800">₹{booking.pricing.typeCharge}</span>
              </div>
              {booking.pricing.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Promo Discount:</span>
                  <span className="font-bold">-₹{booking.pricing.discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">GST Tax (18%):</span>
                <span className="font-semibold text-slate-800">₹{booking.pricing.tax}</span>
              </div>

              <div className="border-t border-slate-200 pt-2.5 flex justify-between text-sm font-bold text-slate-900">
                <span>Total Customer Paid:</span>
                <span className="text-primary">₹{booking.pricing.totalCustomerAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Split Details */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Driver Earnings (80%):</span>
                <span>₹{booking.pricing.driverEarnings.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-indigo-700 font-bold">
                <span>Platform Commission (20%):</span>
                <span>₹{booking.pricing.platformCommission.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
