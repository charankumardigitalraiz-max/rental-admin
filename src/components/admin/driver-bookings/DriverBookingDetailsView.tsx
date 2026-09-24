'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRentalStore } from '@/store/useRentalStore';
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
} from 'lucide-react';

interface DriverBookingDetailsViewProps {
  bookingId?: string;
}

export default function DriverBookingDetailsView({ bookingId }: DriverBookingDetailsViewProps = {}) {
  const router = useRouter();
  const {
    driverBookings,
    selectedDriverBookingId,
    setActiveTab,
    setSelectedDriverId,
    setSelectedCustomerId,
  } = useRentalStore();

  const targetId = bookingId || selectedDriverBookingId;
  const booking =
    driverBookings.find((b) => b.id === targetId) || driverBookings[0];

  if (!booking) {
    return (
      <div className="card-white p-8 text-center text-slate-500">
        Booking record not found.{' '}
        <button onClick={() => router.back()} className="text-primary font-bold underline">
          Back
        </button>
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

  return (
    <div className="space-y-6 pb-10 max-w-6xl mx-auto">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            ID: {booking.bookingNumber}
          </span>
          <span
            className={`px-3 py-1 rounded-md text-xs font-bold ${booking.status === 'Completed'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : booking.status === 'Searching Driver'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-primary-light text-primary border border-primary/20'
              }`}
          >
            {booking.status}
          </span>
        </div>
      </div>

      {/* Grid: Main Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Overview Card */}
          <div className="card-white p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-primary" /> Booking Lifecycle & Core Info
            </h3>
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

          {/* Customer & Vehicle Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Information */}
            <div className="card-white p-5 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <User className="w-4 h-4 text-primary" /> Customer Profile
              </h4>
              <div className="flex items-center gap-3">
                <img
                  src={booking.customerAvatar}
                  alt={booking.customerName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-light"
                />
                <div>
                  <h5 className="font-bold text-slate-900 text-sm">{booking.customerName}</h5>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {booking.customerPhone}
                  </span>
                </div>
              </div>
              <div className="text-xs text-slate-600 pt-1 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {booking.customerEmail}
                </div>
              </div>
            </div>

            {/* Vehicle Information (Customer's Car) */}
            <div className="card-white p-5 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <Car className="w-4 h-4 text-primary" /> Customer's Vehicle Info
              </h4>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Vehicle Model</span>
                <h5 className="font-bold text-slate-900 text-sm">{booking.vehicleInfo.model}</h5>
                <span className="inline-block mt-1 font-mono font-bold text-xs bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-800">
                  {booking.vehicleInfo.plateNumber}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 border-t border-slate-100 pt-2">
                <div>
                  <span className="text-slate-400 text-[10px] block">Body Type:</span>
                  <span className="font-bold text-slate-800">{booking.vehicleInfo.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Fuel / Trans:</span>
                  <span className="font-bold text-slate-800">
                    {booking.vehicleInfo.fuelType} • {booking.vehicleInfo.transmission}
                  </span>
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
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center space-y-2">
                <p className="text-xs font-bold text-amber-800">No driver assigned yet.</p>
                <button
                  onClick={() => setActiveTab('driver-requests')}
                  className="px-3 py-1 bg-primary text-white text-xs font-bold rounded shadow-xs"
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
