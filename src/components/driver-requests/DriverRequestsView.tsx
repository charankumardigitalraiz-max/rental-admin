'use client';

import React, { useState } from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import { DriverBooking, Driver } from '@/types';
import {
  Radio,
  Search,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  Car,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Award,
} from 'lucide-react';

export default function DriverRequestsView() {
  const {
    driverBookings,
    drivers,
    assignDriverToBooking,
    cancelDriverBooking,
    setActiveTab,
    setSelectedDriverId,
    setSelectedDriverBookingId,
  } = useRentalStore();

  const searchingBookings = driverBookings.filter(
    (b) => b.status === 'Searching Driver' || b.status === 'Pending'
  );

  const [selectedBookingId, setSelectedBookingId] = useState<string>(
    searchingBookings[0]?.id || driverBookings[0]?.id || ''
  );

  const activeBooking =
    driverBookings.find((b) => b.id === selectedBookingId) || searchingBookings[0] || driverBookings[0];

  // Driver Eligibility Logic
  const checkDriverEligibility = (driver: Driver, booking: DriverBooking) => {
    const isApproved = driver.status === 'Approved';
    const isOnline = driver.dutyStatus === 'Online';
    const isAvailable = driver.availability === 'Available';
    const hasActiveSubscription =
      driver.subscription.status === 'Active' || driver.subscription.status === 'Expiring Soon';

    const isTypeEligible =
      booking.bookingType === 'Local'
        ? driver.subscription.localEligible
        : driver.subscription.outstationEligible;

    const isEligible = isApproved && isOnline && isAvailable && hasActiveSubscription && isTypeEligible;

    const reasons: string[] = [];
    if (!isApproved) reasons.push('Account not approved');
    if (!isOnline) reasons.push('Driver offline');
    if (!isAvailable) reasons.push('Driver currently busy on trip');
    if (!hasActiveSubscription) reasons.push('Subscription expired or missing');
    if (hasActiveSubscription && !isTypeEligible)
      reasons.push(`Plan does not allow ${booking.bookingType} bookings`);

    return { isEligible, reasons };
  };

  return (
    <div className="space-y-6 pb-10">


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Searching Requests List */}
        <div className="card-white p-4 space-y-3">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
            Pending Dispatch Requests ({searchingBookings.length})
          </h3>

          {searchingBookings.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              No pending driver search requests at the moment.
            </div>
          ) : (
            <div className="space-y-2.5">
              {searchingBookings.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBookingId(b.id)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    activeBooking?.id === b.id
                      ? 'bg-primary-light/50 border-primary ring-1 ring-primary'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">{b.bookingNumber}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-light text-primary">
                      {b.bookingType} ({b.durationHours}h)
                    </span>
                  </div>

                  <p className="font-bold text-slate-900 mt-1.5">{b.customerName}</p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600 shrink-0" /> {b.pickupLocation}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-200/60 mt-2">
                    <span>Date: {b.bookingDate}</span>
                    <span className="font-bold text-amber-700">Elapsed: 4m 12s</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 2 Columns: Driver Matching & Eligibility Verification */}
        <div className="lg:col-span-2 space-y-6">
          {activeBooking ? (
            <>
              {/* Active Booking Summary */}
              <div className="card-white p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">{activeBooking.bookingNumber}</span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-primary-light text-primary">
                        {activeBooking.bookingType} Drive
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1">
                      Customer: {activeBooking.customerName} ({activeBooking.customerPhone})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedDriverBookingId(activeBooking.id);
                        setActiveTab('driver-booking-details');
                      }}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded"
                    >
                      View Full Specs
                    </button>
                    <button
                      onClick={() => cancelDriverBooking(activeBooking.id)}
                      className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded border border-rose-200"
                    >
                      Cancel Search
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Customer's Car</span>
                    <span className="font-bold text-slate-900">{activeBooking.vehicleInfo.model}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Plate Number</span>
                    <span className="font-bold font-mono text-slate-800">{activeBooking.vehicleInfo.plateNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Duration</span>
                    <span className="font-bold text-slate-900">{activeBooking.durationHours} Hours</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Total Fare</span>
                    <span className="font-bold text-emerald-700">₹{activeBooking.pricing.totalCustomerAmount}</span>
                  </div>
                </div>
              </div>

              {/* Drivers Eligibility Roster */}
              <div className="card-white p-5 space-y-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between border-b border-slate-100 pb-3">
                  <span>Nearby Drivers Eligibility Matrix</span>
                  <span className="text-xs text-slate-500 font-normal">
                    {drivers.filter((d) => checkDriverEligibility(d, activeBooking).isEligible).length} Eligible Drivers Found
                  </span>
                </h3>

                <div className="space-y-3">
                  {drivers.map((drv) => {
                    const { isEligible, reasons } = checkDriverEligibility(drv, activeBooking);
                    return (
                      <div
                        key={drv.id}
                        className={`p-4 rounded-lg border transition-all ${
                          isEligible
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-slate-50/70 border-slate-200 opacity-75'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={drv.avatar}
                              alt={drv.name}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-900 text-sm">{drv.name}</h4>
                                {isEligible ? (
                                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 rounded flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" /> Eligible
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 rounded flex items-center gap-1">
                                    <ShieldAlert className="w-3 h-3" /> Ineligible
                                  </span>
                                )}
                              </div>

                              <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                                <span>⭐ {drv.rating} Rating</span>
                                <span>•</span>
                                <span>{drv.completedBookings} Trips Completed</span>
                                <span>•</span>
                                <span className="font-semibold text-slate-700">Location: {drv.currentLocation}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                setSelectedDriverId(drv.id);
                                setActiveTab('driver-details');
                              }}
                              className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded hover:bg-slate-50"
                            >
                              Profile
                            </button>
                            {isEligible && activeBooking.status !== 'Driver Assigned' && (
                              <button
                                onClick={() => assignDriverToBooking(activeBooking.id, drv.id)}
                                className="px-3.5 py-1.5 bg-primary text-white text-xs font-bold rounded shadow-xs hover:bg-primary-hover"
                              >
                                Assign Driver
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Subscription & Eligibility Notes */}
                        <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap items-center justify-between text-[11px] gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-700 flex items-center gap-1">
                              <Award className="w-3.5 h-3.5 text-amber-500" /> Subscription: {drv.subscription.planName}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                drv.subscription.status === 'Active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {drv.subscription.status}
                            </span>
                          </div>

                          {!isEligible && (
                            <div className="text-rose-600 font-semibold text-[10px]">
                              Ineligible reason: {reasons.join(' • ')}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="card-white p-8 text-center text-slate-400">
              Select a driver request from the left column to view eligible drivers.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
