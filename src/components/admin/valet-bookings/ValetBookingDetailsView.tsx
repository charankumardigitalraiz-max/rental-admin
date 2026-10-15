'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useValetBookingStore } from '@/store/useValetBookingStore';
import { ValetBooking, ValetBookingStatus } from '@/types';
import { useToast } from '@/context/ToastContext';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  MapPin,
  Users,
  UserCheck,
  UserPlus,
  Phone,
  Mail,
  DollarSign,
  Receipt,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ShieldCheck,
  FileText,
  Trash2,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface ValetBookingDetailsViewProps {
  bookingId?: string;
}

export default function ValetBookingDetailsView({ bookingId }: ValetBookingDetailsViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const {
    valetBookings,
    selectedValetBooking,
    availableStaff,
    isLoading,
    fetchValetBookingById,
    fetchAvailableStaff,
    updateValetBookingStatus,
    assignStaffToBooking,
    removeStaffFromBooking,
  } = useValetBookingStore();

  const [booking, setBooking] = useState<ValetBooking | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Load booking details on mount or ID change
  useEffect(() => {
    let isMounted = true;
    if (bookingId) {
      fetchValetBookingById(bookingId).then((data) => {
        if (isMounted && data) {
          setBooking(data);
          setAdminNoteInput(data.adminNotes || '');
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [bookingId, fetchValetBookingById]);

  // Load live valet staff members from backend
  useEffect(() => {
    fetchAvailableStaff();
  }, [fetchAvailableStaff]);

  // Fallback to locally stored booking if available
  useEffect(() => {
    if (!booking && bookingId) {
      const found =
        valetBookings.find(
          (b) => b.id === bookingId || b.bookingNumber === bookingId
        ) ||
        (selectedValetBooking?.id === bookingId ? selectedValetBooking : null);
      if (found) {
        setBooking(found);
        setAdminNoteInput(found.adminNotes || '');
      }
    }
  }, [booking, bookingId, valetBookings, selectedValetBooking]);

  // Handle status update
  const handleUpdateStatus = async (newStatus: ValetBookingStatus) => {
    if (!booking) return;

    // Validation: staff must be assigned before starting event / transitioning to In Progress
    if (newStatus === 'In Progress') {
      const staffCount = booking.assignedStaffIds?.length || 0;
      if (staffCount === 0) {
        toast.warning(
          'Staff Allocation Required',
          'Please allocate at least one valet attendant before starting this event'
        );
        return;
      }
    }

    setIsUpdatingStatus(true);
    const success = await updateValetBookingStatus(booking.id, newStatus);
    setIsUpdatingStatus(false);
    if (success) {
      setBooking((prev) => (prev ? { ...prev, status: newStatus } : null));
      toast.success('Status Updated', `Event status changed to ${newStatus}`);
    } else {
      toast.error('Update Failed', 'Could not update event status');
    }
  };

  // Handle Staff Assignment
  const handleAssignStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking || !selectedStaffId) return;

    if (booking.assignedStaffIds.includes(selectedStaffId)) {
      toast.error('Already Assigned', 'This staff member is already assigned to this event');
      return;
    }

    if (booking.assignedStaffIds.length >= booking.requiredStaffCount) {
      toast.error('Quota Full', 'Required staff quota is already fulfilled');
      return;
    }

    setIsAssigning(true);
    const success = await assignStaffToBooking(booking.id, selectedStaffId);
    setIsAssigning(false);

    if (success) {
      const staffMember = availableStaff.find((s) => s.id === selectedStaffId);
      const staffName = staffMember?.name || 'Valet Staff';

      const updatedIds = [...booking.assignedStaffIds, selectedStaffId];
      const updatedNames = [...booking.assignedStaffNames, staffName];
      const newStatus: ValetBookingStatus =
        updatedIds.length >= booking.requiredStaffCount
          ? 'Fully Assigned'
          : 'Partially Assigned';

      const updatedStaffDetails = [
        ...(booking.assignedStaffDetails || []),
        {
          id: selectedStaffId,
          name: staffName,
          phone: staffMember?.phone || '',
          rating: staffMember?.rating || 4.8,
          avatar: staffMember?.avatar || '',
        },
      ];

      setBooking((prev) =>
        prev
          ? {
            ...prev,
            assignedStaffIds: updatedIds,
            assignedStaffNames: updatedNames,
            assignedStaffDetails: updatedStaffDetails,
            status: newStatus,
          }
          : null
      );

      setSelectedStaffId('');
      toast.success('Staff Allocated', `${staffName} assigned to ${booking.eventName}`);
      // Refresh fresh populated booking from backend
      fetchValetBookingById(booking.id).then((fresh) => {
        if (fresh) setBooking(fresh);
      });
    } else {
      toast.error('Allocation Failed', 'Could not assign staff member');
    }
  };

  // Handle Staff Removal
  const handleRemoveStaff = async (staffId: string) => {
    if (!booking) return;

    const success = await removeStaffFromBooking(booking.id, staffId);
    if (success) {
      const staffIdx = booking.assignedStaffIds.indexOf(staffId);
      const updatedIds = booking.assignedStaffIds.filter((id) => id !== staffId);
      const updatedNames = booking.assignedStaffNames.filter((_, idx) => idx !== staffIdx);
      const updatedStaffDetails = (booking.assignedStaffDetails || []).filter(
        (s) => s.id !== staffId
      );
      const newStatus: ValetBookingStatus =
        updatedIds.length === 0 ? 'Pending Assignment' : 'Partially Assigned';

      setBooking((prev) =>
        prev
          ? {
            ...prev,
            assignedStaffIds: updatedIds,
            assignedStaffNames: updatedNames,
            assignedStaffDetails: updatedStaffDetails,
            status: newStatus,
          }
          : null
      );
      toast.info('Staff Removed', 'Valet staff unassigned from this event');
      fetchValetBookingById(booking.id).then((fresh) => {
        if (fresh) setBooking(fresh);
      });
    } else {
      toast.error('Removal Failed', 'Could not remove staff member');
    }
  };

  // Handle Save Admin Notes
  const handleSaveNotes = async () => {
    if (!booking) return;
    setIsSavingNotes(true);
    try {
      const res = await fetch(`/api/admin/valet-bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes: adminNoteInput }),
      });
      if (res.ok) {
        setBooking((prev) => (prev ? { ...prev, adminNotes: adminNoteInput } : null));
        toast.success('Notes Saved', 'Internal admin notes updated');
      } else {
        toast.error('Save Failed', 'Could not update notes');
      }
    } catch {
      toast.error('Error', 'Failed to save admin notes');
    } finally {
      setIsSavingNotes(false);
    }
  };

  if (isLoading && !booking) {
    return (
      <div className="card-white p-12 text-center text-slate-500 max-w-lg mx-auto my-12 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#023526] mx-auto" />
        <p className="text-sm font-semibold text-slate-700">Loading valet event details...</p>
        <p className="text-xs text-slate-400">Fetching live record from database</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="card-white p-8 text-center text-slate-500 max-w-lg mx-auto my-12 space-y-4">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <div>
          <h3 className="text-base font-bold text-slate-900">Event Booking Not Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Could not find valet booking reference: <span className="font-mono">{bookingId}</span>
          </p>
        </div>
        <Link
          href="/admin/valet-bookings"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#023526] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#034431] transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Valet Bookings
        </Link>
      </div>
    );
  }

  const assignedCount = booking.assignedStaffIds?.length || 0;
  const requiredCount = booking.requiredStaffCount || 1;
  const isQuotaFulfilled = assignedCount >= requiredCount;
  const unassignedStaff = availableStaff.filter(
    (s) => !booking.assignedStaffIds.includes(s.id)
  );

  const getStatusBadgeStyle = (status: ValetBookingStatus) => {
    switch (status) {
      case 'Fully Assigned':
      case 'In Progress':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'New Request':
      case 'Pending Assignment':
      case 'Partially Assigned':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Completed':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Link
            href="/admin/valet-bookings"
            className="p-2.5 bg-slate-50 border border-slate-200/90 hover:bg-slate-100 text-slate-700 rounded-xl transition-all shadow-2xs shrink-0 flex items-center justify-center hover:text-slate-900"
            title="Back to Valet Bookings"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {booking.eventName}
              </h1>
              {/* <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200/80">
                {booking.bookingNumber}
              </span> */}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>Valet Event Booking Management</span>
              <span className="text-slate-300">•</span>
              <span className="capitalize font-medium text-slate-600">{booking.eventType}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:justify-end">
          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border shadow-2xs ${getStatusBadgeStyle(
              booking.status
            )}`}
          >
            {booking.status}
          </span>

          {booking.status !== 'In Progress' && booking.status !== 'Completed' && (
            <>
              {assignedCount === 0 && (
                <span className="text-[11px] font-medium text-amber-800 bg-amber-50/90 border border-amber-200/80 px-2.5 py-1.5 rounded-xl">
                  Allocate staff first to start event
                </span>
              )}
              <button
                type="button"
                disabled={isUpdatingStatus || assignedCount === 0}
                onClick={() => handleUpdateStatus('In Progress')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 ${assignedCount > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-[0.98]'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                  }`}
                title={
                  assignedCount > 0
                    ? 'Start Event Operations'
                    : 'Please allocate at least one valet attendant before starting this event'
                }
              >
                Start Event
              </button>
            </>
          )}

          {booking.status !== 'Completed' && (
            <button
              type="button"
              disabled={isUpdatingStatus}
              onClick={() => handleUpdateStatus('Completed')}
              className="px-3.5 py-1.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            >
              Mark Fulfilled ✓
            </button>
          )}

          {booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
            <button
              type="button"
              disabled={isUpdatingStatus}
              onClick={() => {
                if (confirm('Are you sure you want to cancel this event booking?')) {
                  handleUpdateStatus('Cancelled');
                }
              }}
              className="px-3.5 py-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            >
              Cancel Event
            </button>
          )}
        </div>
      </div>

      {/* 4 Quick Stat Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="card-white p-4 space-y-1">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Event Date & Time
          </span>
          <div className="text-base font-bold text-slate-900">{booking.eventDate || 'Scheduled'}</div>
          <span className="text-[11px] text-slate-500 font-medium">
            {booking.startTime} - {booking.endTime} ({booking.durationHours} hrs)
          </span>
        </div>

        <div className="card-white p-4 space-y-1">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-400" /> Staffing Quota
          </span>
          <div className="text-base font-bold text-slate-900">
            {assignedCount} / {requiredCount} Attendants
          </div>
          <span
            className={`text-[11px] font-semibold ${isQuotaFulfilled ? 'text-emerald-600' : 'text-amber-600'
              }`}
          >
            {isQuotaFulfilled ? 'Full Team Assigned' : `${requiredCount - assignedCount} more required`}
          </span>
        </div>

        <div className="card-white p-4 space-y-1">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Total Booking Value
          </span>
          <div className="text-base font-bold text-slate-900">
            ₹{booking.pricing.totalAmount.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500 font-medium capitalize">
            Payment: {booking.paymentStatus || 'Pending'} ({booking.paymentMethod || 'Online'})
          </span>
        </div>

        <div className="card-white p-4 space-y-1">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400" /> Host Venue
          </span>
          <div className="text-base font-bold text-slate-900 truncate" title={booking.venue}>
            {booking.venue}
          </div>
          <span className="text-[11px] text-slate-500 font-medium truncate block" title={booking.venueAddress}>
            {booking.venueAddress}
          </span>
        </div>
      </div>

      {/* Main Grid: Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Event Details, Staff Allocation, Instructions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Venue & Event Logistics */}
          <div className="card-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#023526]" /> Event Logistics & Venue Information
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-50 text-[#023526] border border-emerald-200">
                {booking.eventType}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10.5px] font-bold uppercase text-slate-400">Venue Destination</span>
                <p className="font-bold text-slate-900 text-sm">{booking.venue}</p>
                <p className="text-slate-500 flex items-start gap-1 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{booking.venueAddress}</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10.5px] font-bold uppercase text-slate-400">Schedule & Duration</span>
                <p className="font-bold text-slate-900 text-sm">
                  {booking.startTime} - {booking.endTime}
                </p>
                <p className="text-slate-500 flex items-center gap-1 pt-0.5">
                  <Clock className="w-3.5 h-3.5 text-[#023526] shrink-0" />
                  <span>{booking.durationHours} Hours Dedicated Service Window</span>
                </p>
              </div>
            </div>

            {/* Special Instructions Callout */}
            {booking.specialInstructions && (
              <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-1">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Host's Special Instructions
                </span>
                <p className="text-xs text-amber-950 font-medium leading-relaxed">
                  "{booking.specialInstructions}"
                </p>
              </div>
            )}
          </div>

          {/* Valet Staff Allocation Card */}
          <div className="card-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#023526]" /> On-Ground Valet Team
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assigned attendants responsible for guest vehicle intake and return
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                  {assignedCount} / {requiredCount} Attendants
                </span>
              </div>
            </div>

            {/* Quota Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                <span>Staffing Quota Fulfillment</span>
                <span>{Math.round((assignedCount / requiredCount) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${isQuotaFulfilled ? 'bg-emerald-600' : 'bg-amber-500'
                    }`}
                  style={{ width: `${Math.min(100, (assignedCount / requiredCount) * 100)}%` }}
                />
              </div>
            </div>

            {/* Assigned Staff Members List */}
            <div className="space-y-2">
              <span className="text-[10.5px] font-bold uppercase text-slate-400 tracking-wider">
                Currently Assigned Valet Attendants
              </span>

              {assignedCount === 0 ? (
                <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500 space-y-1">
                  <UserPlus className="w-5 h-5 text-slate-400 mx-auto" />
                  <p className="font-semibold text-slate-700">No staff members allocated yet</p>
                  <p className="text-[11px] text-slate-500">
                    Assign at least one valet attendant below to enable starting the event (&quot;In Progress&quot;)
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {booking.assignedStaffIds.map((staffId, idx) => {
                    const staffDetail = (booking.assignedStaffDetails || []).find(
                      (s) => s.id === staffId
                    );
                    const staffName =
                      staffDetail?.name || booking.assignedStaffNames[idx] || `Valet #${idx + 1}`;
                    const staffPhone = staffDetail?.phone || 'On Duty';

                    return (
                      <div
                        key={staffId}
                        className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl flex items-center justify-between gap-3 shadow-2xs hover:bg-slate-100/60 transition-colors"
                      >
                        <Link
                          href={`/admin/valet-staff/${staffId}`}
                          className="flex items-center gap-2.5 min-w-0 hover:opacity-85 transition-opacity cursor-pointer group"
                          title="View Valet Staff Profile"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#023526] text-white flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                            {staffName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#023526] transition-colors">{staffName}</h4>
                            <span className="text-[10.5px] text-slate-500 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" /> {staffPhone}
                            </span>
                          </div>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleRemoveStaff(staffId)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove Attendant"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* In-place Staff Allocation Picker */}
            {!isQuotaFulfilled && (
              <form
                onSubmit={handleAssignStaff}
                className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2"
              >
                <div className="flex-1 w-full">
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#023526] transition-all cursor-pointer shadow-2xs"
                  >
                    <option value="">-- Select Trained Valet Driver from Roster --</option>
                    {unassignedStaff.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} • {st.location || 'Bengaluru'} (Rating: {st.rating || 4.8}★)
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!selectedStaffId || isAssigning}
                  className="w-full sm:w-auto px-4 py-2 bg-[#023526] hover:bg-[#034431] text-white font-bold rounded-xl text-xs shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
                >
                  {isAssigning ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserPlus className="w-3.5 h-3.5" />
                  )}
                  <span>Allocate Attendant</span>
                </button>
              </form>
            )}
          </div>

          {/* Event Lifecycle & Operations Timeline */}
          <div className="card-white p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clock className="w-4 h-4 text-[#023526]" /> Event Lifecycle & Operations Timeline
            </h2>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">Event Booking Created</p>
                  <p className="text-[11px] text-slate-500">
                    Booking ID {booking.bookingNumber} registered in DrivePulse systems • Created on{' '}
                    {booking.timeline?.created ? new Date(booking.timeline.created).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${assignedCount > 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-400'
                    }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">Staff Allocation</p>
                  <p className="text-[11px] text-slate-500">
                    {assignedCount > 0
                      ? `${assignedCount} attendants confirmed for venue arrival`
                      : 'Pending dispatcher staff allocation'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${booking.status === 'In Progress' || booking.status === 'Completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-400'
                    }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">On-Ground Valet Execution</p>
                  <p className="text-[11px] text-slate-500">
                    {booking.status === 'In Progress'
                      ? 'Event currently underway. Attendants actively managing guest vehicles.'
                      : booking.status === 'Completed'
                        ? 'Event operations successfully concluded.'
                        : 'Awaiting scheduled event start time.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Customer Profile, Financials, Admin Notes */}
        <div className="space-y-6">
          {/* Customer / Organizer Profile */}
          <div className="card-white p-5 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Users className="w-4 h-4 text-[#023526]" /> Event Host / Organizer
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#023526] border border-emerald-200 flex items-center justify-center font-bold text-sm shrink-0">
                {booking.customerName.charAt(0)}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 text-sm truncate">{booking.customerName}</h4>
                <span className="text-[11px] text-slate-500 block">Host / Client Account</span>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-2 border-t border-slate-100 text-slate-600">
              <a
                href={`tel:${booking.customerPhone}`}
                className="flex items-center gap-2 hover:text-[#023526] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium">{booking.customerPhone}</span>
              </a>

              {booking.customerEmail && (
                <a
                  href={`mailto:${booking.customerEmail}`}
                  className="flex items-center gap-2 hover:text-[#023526] transition-colors truncate"
                  title={booking.customerEmail}
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium truncate">{booking.customerEmail}</span>
                </a>
              )}
            </div>
          </div>

          {/* Financial Breakdown Card */}
          <div className="card-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#023526]" /> Event Financials & Payout
              </h3>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {booking.paymentStatus || 'Pending'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Base Event Charge</span>
                <span className="font-medium text-slate-900">
                  ₹{booking.pricing.totalBaseAmount.toLocaleString('en-IN')}
                </span>
              </div>

              {booking.pricing.tax > 0 && (
                <div className="flex items-center justify-between text-slate-600">
                  <span>Applicable GST / Taxes</span>
                  <span className="font-medium text-slate-900">
                    ₹{booking.pricing.tax.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-900 font-bold border-t border-slate-100 pt-2 text-sm">
                <span>Total Client Invoice</span>
                <span className="text-[#023526]">
                  ₹{booking.pricing.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mt-3">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                  <span>Staff Compensation Pool</span>
                  <span className="text-slate-900 font-bold">
                    ₹{booking.pricing.staffPayoutTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10.5px] text-slate-500">
                  <span>Per-Valet Pay Rate</span>
                  <span>₹{booking.pricing.pricePerStaff.toLocaleString('en-IN')} / attendant</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-800 border-t border-slate-200/80 pt-1.5">
                  <span>Platform Retained Margin</span>
                  <span>₹{booking.pricing.platformCommission.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Internal Operations / Admin Notes */}
          <div className="card-white p-5 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <FileText className="w-4 h-4 text-[#023526]" /> Internal Dispatch Notes
            </h3>

            <div className="space-y-2">
              <textarea
                rows={3}
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                placeholder="Add internal supervisor notes, uniform notes, entry gate codes..."
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#023526] transition-all resize-none text-slate-800"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={isSavingNotes}
                  onClick={handleSaveNotes}
                  className="px-3 py-1.5 bg-[#023526] hover:bg-[#034431] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSavingNotes && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Notes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
