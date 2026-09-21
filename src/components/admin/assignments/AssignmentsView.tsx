'use client';

import React, { useState } from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import Modal from '@/components/ui/Modal';
import {
  Compass,
  Car,
  Building2,
  UserCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  Star,
  Award,
  Zap,
} from 'lucide-react';

export default function AssignmentsView() {
  const {
    driverBookings,
    drivers,
    valetBookings,
    valetStaff,
    assignDriverToBooking,
    assignValetStaffToBooking,
    removeValetStaffFromBooking,
    setSelectedDriverBookingId,
    setSelectedValetBookingId,
    setActiveTab,
  } = useRentalStore();

  // State for Driver Assignment Modal
  const [selectedDriverBookingForAssign, setSelectedDriverBookingForAssign] = useState<string | null>(null);

  // State for Valet Staff Assignment Modal
  const [selectedValetBookingForAssign, setSelectedValetBookingForAssign] = useState<string | null>(null);

  const pendingDriverBookings = driverBookings.filter(
    (b) => b.status === 'Searching Driver' || b.status === 'Pending' || b.status === 'No Driver Found'
  );

  const pendingValetBookings = valetBookings.filter(
    (v) => v.status === 'New Request' || v.status === 'Partially Assigned' || v.status === 'Pending Assignment'
  );

  const eligibleDrivers = drivers.filter(
    (d) => d.status === 'Approved' && d.dutyStatus === 'Online' && d.subscription.status === 'Active'
  );

  const availableValetStaff = valetStaff.filter((s) => s.status === 'Available');

  const currentDriverBookingToAssign = driverBookings.find((b) => b.id === selectedDriverBookingForAssign);
  const currentValetBookingToAssign = valetBookings.find((v) => v.id === selectedValetBookingForAssign);

  return (
    <div className="space-y-6">


      {/* SECTION 1: Unassigned Driver Bookings */}
      <div className="card-white p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-slate-900 text-base">Unassigned Driver Booking Requests</h3>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-900 rounded-md border border-amber-200">
            {pendingDriverBookings.length} Requests Awaiting Driver
          </span>
        </div>

        {pendingDriverBookings.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-medium">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            All driver bookings are fully assigned and dispatched!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingDriverBookings.map((booking) => (
              <div
                key={booking.id}
                className="card-white p-4 space-y-3 hover:border-primary/50 transition-all border-l-4 border-l-amber-500"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {booking.bookingType} DRIVER REQUEST
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{booking.bookingNumber}</h4>
                    <p className="text-xs text-slate-500">{booking.customerName} • {booking.vehicleInfo.model}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
                    ₹{booking.pricing.totalCustomerAmount}
                  </span>
                </div>

                <div className="bg-stone-50 p-2.5 rounded-md border border-stone-100 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-medium truncate">{booking.pickupLocation}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{booking.bookingDate} at {booking.bookingTime} ({booking.durationHours} hrs)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setSelectedDriverBookingForAssign(booking.id)}
                    className="flex-1 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" /> Assign Subscription Driver
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDriverBookingId(booking.id);
                      setActiveTab('driver-booking-details');
                    }}
                    className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-bold rounded-lg transition-all"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: Valet Event Staff Allocation Matrix */}
      <div className="card-white p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-slate-900 text-base">Valet Event Staff Quota Allocation</h3>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-sky-50 text-sky-900 rounded-md border border-sky-200">
            {pendingValetBookings.length} Events Requiring Staff
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {valetBookings.map((valet) => (
            <div key={valet.id} className="card-white p-5 space-y-4 hover:border-sky-300 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-900 border border-sky-200">
                    {valet.eventType}
                  </span>
                  <h4 className="font-bold text-slate-900 text-base mt-1">{valet.eventName}</h4>
                  <p className="text-xs text-slate-500">{valet.venue}</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded text-xs font-bold ${
                    valet.status === 'Fully Assigned'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {valet.status}
                </span>
              </div>

              {/* Progress Quota Bar */}
              <div className="bg-stone-50 p-3 rounded-lg border border-stone-200/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Staff Quota Fulfillment</span>
                  <span className="font-bold text-sky-900">
                    {valet.assignedStaffIds.length} / {valet.requiredStaffCount} Staff Assigned
                  </span>
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (valet.assignedStaffIds.length / valet.requiredStaffCount) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Assigned Staff Pills */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase text-slate-400 block">Assigned Staff Members:</span>
                {valet.assignedStaffIds.length === 0 ? (
                  <span className="text-xs text-amber-700 font-medium italic block bg-amber-50 p-2 rounded border border-amber-200">
                    No staff assigned yet. Allocate available staff below.
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {valet.assignedStaffNames.map((name, idx) => {
                      const staffId = valet.assignedStaffIds[idx];
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 bg-emerald-50 text-emerald-900 text-xs font-semibold px-2.5 py-1 rounded-md border border-emerald-200"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{name}</span>
                          <button
                            onClick={() => removeValetStaffFromBooking(valet.id, staffId)}
                            title="Remove staff"
                            className="text-emerald-700 hover:text-rose-600 ml-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                <button
                  onClick={() => setSelectedValetBookingForAssign(valet.id)}
                  disabled={valet.assignedStaffIds.length >= valet.requiredStaffCount}
                  className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-200 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Allocate Additional Staff
                </button>
                <button
                  onClick={() => {
                    setSelectedValetBookingId(valet.id);
                    setActiveTab('valet-booking-details');
                  }}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-bold rounded-lg transition-all"
                >
                  Inspect Event
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL 1: Assign Driver to Booking */}
      <Modal
        isOpen={!!selectedDriverBookingForAssign}
        onClose={() => setSelectedDriverBookingForAssign(null)}
        title="Assign Subscription Driver to Booking"
        subtitle={`Select an online subscription-active driver for ${currentDriverBookingToAssign?.bookingNumber || ''}`}
        icon={Car}
      >
        <div className="space-y-4">
          <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-xs space-y-1">
            <span className="font-bold text-slate-800 block">Customer Pickup Details:</span>
            <p className="text-slate-600">{currentDriverBookingToAssign?.pickupLocation}</p>
            <p className="text-slate-500">
              Vehicle: {currentDriverBookingToAssign?.vehicleInfo.type} ({currentDriverBookingToAssign?.vehicleInfo.model})
            </p>
          </div>

          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Eligible Online Subscription Drivers:</h4>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {eligibleDrivers.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No online subscription drivers available currently.</p>
            ) : (
              eligibleDrivers.map((driver) => (
                <div
                  key={driver.id}
                  className="p-3 rounded-lg border border-stone-200 hover:border-primary/60 bg-white flex items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img src={driver.avatar} alt={driver.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs">{driver.name}</h5>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="flex items-center text-amber-500 font-bold">
                          <Star className="w-3 h-3 fill-amber-400 mr-0.5" /> {driver.rating}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">{driver.subscription.planName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">{driver.currentLocation}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (selectedDriverBookingForAssign) {
                        assignDriverToBooking(selectedDriverBookingForAssign, driver.id);
                        setSelectedDriverBookingForAssign(null);
                      }
                    }}
                    className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-md shadow-xs transition-all shrink-0"
                  >
                    Assign Driver
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* MODAL 2: Assign Staff to Valet Booking */}
      <Modal
        isOpen={!!selectedValetBookingForAssign}
        onClose={() => setSelectedValetBookingForAssign(null)}
        title="Allocate Valet Staff Member"
        subtitle={`Assign staff to event: ${currentValetBookingToAssign?.eventName || ''}`}
        icon={UserCheck}
      >
        <div className="space-y-4">
          <div className="bg-sky-50 p-3 rounded-lg border border-sky-200 text-xs space-y-1">
            <span className="font-bold text-sky-900 block font-bold">Event Quota Status:</span>
            <p className="text-sky-800">
              {currentValetBookingToAssign?.assignedStaffIds.length} / {currentValetBookingToAssign?.requiredStaffCount} Staff Currently Assigned
            </p>
          </div>

          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Available Valet Staff Roster:</h4>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {availableValetStaff.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No available valet staff currently.</p>
            ) : (
              availableValetStaff.map((staff) => (
                <div
                  key={staff.id}
                  className="p-3 rounded-lg border border-stone-200 hover:border-emerald-500 bg-white flex items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img src={staff.avatar} alt={staff.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs">{staff.name}</h5>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="flex items-center text-amber-500 font-bold">
                          <Star className="w-3 h-3 fill-amber-400 mr-0.5" /> {staff.rating}
                        </span>
                        <span>•</span>
                        <span>{staff.experienceYears} Years Exp</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">{staff.location}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (selectedValetBookingForAssign) {
                        assignValetStaffToBooking(selectedValetBookingForAssign, staff.id);
                        setSelectedValetBookingForAssign(null);
                      }
                    }}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-md shadow-xs transition-all shrink-0"
                  >
                    Allocate Staff
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
