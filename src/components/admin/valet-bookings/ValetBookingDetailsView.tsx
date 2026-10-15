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
  ChevronDown,
  Check,
  Search,
  X,
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
    assignMultipleStaffToBooking,
    removeStaffFromBooking,
  } = useValetBookingStore();

  const [booking, setBooking] = useState<ValetBooking | null>(null);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [isStaffPickerOpen, setIsStaffPickerOpen] = useState(false);
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const staffPickerRef = React.useRef<HTMLDivElement>(null);
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

  // Close staff picker on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (staffPickerRef.current && !staffPickerRef.current.contains(event.target as Node)) {
        setIsStaffPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Multiple Staff Assignment
  const handleAssignStaff = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!booking || selectedStaffIds.length === 0) return;

    const assignedCount = booking.assignedStaffIds?.length || 0;
    const requiredCount = booking.requiredStaffCount || 1;
    const remainingSlots = Math.max(0, requiredCount - assignedCount);

    if (selectedStaffIds.length > remainingSlots) {
      toast.warning(
        'Quota Exceeded',
        `Only ${remainingSlots} more attendant(s) required to fulfill event quota`
      );
      return;
    }

    setIsAssigning(true);
    const success = await assignMultipleStaffToBooking(booking.id, selectedStaffIds);
    setIsAssigning(false);

    if (success) {
      const assignedCountNum = selectedStaffIds.length;
      toast.success(
        'Staff Allocated',
        `${assignedCountNum} valet attendant${assignedCountNum > 1 ? 's' : ''} assigned to ${booking.eventName}`
      );
      setSelectedStaffIds([]);
      setIsStaffPickerOpen(false);
      setStaffSearchQuery('');
      // Refresh fresh populated booking from backend
      fetchValetBookingById(booking.id).then((fresh) => {
        if (fresh) setBooking(fresh);
      });
    } else {
      toast.error('Allocation Failed', 'Could not assign selected staff members');
    }
  };

  const handleToggleStaff = (staffId: string) => {
    if (!booking) return;
    const assignedCount = booking.assignedStaffIds?.length || 0;
    const requiredCount = booking.requiredStaffCount || 1;
    const remainingSlots = Math.max(0, requiredCount - assignedCount);

    setSelectedStaffIds((prev) => {
      if (prev.includes(staffId)) {
        return prev.filter((id) => id !== staffId);
      }
      if (prev.length >= remainingSlots) {
        toast.warning(
          'Quota Limit Reached',
          `This event only needs ${remainingSlots} more attendant${remainingSlots > 1 ? 's' : ''}. Deselect one to choose another.`
        );
        return prev;
      }
      return [...prev, staffId];
    });
  };

  const handleSelectAllRemaining = () => {
    if (!booking) return;
    const assignedCount = booking.assignedStaffIds?.length || 0;
    const requiredCount = booking.requiredStaffCount || 1;
    const remainingSlots = Math.max(0, requiredCount - assignedCount);
    const unassigned = availableStaff.filter((s) => !booking.assignedStaffIds.includes(s.id));
    const nextAvailable = unassigned.slice(0, remainingSlots).map((s) => s.id);
    setSelectedStaffIds(nextAvailable);
  };

  const handleClearSelected = () => {
    setSelectedStaffIds([]);
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
  const remainingSlots = Math.max(0, requiredCount - assignedCount);
  const isQuotaFulfilled = assignedCount >= requiredCount;
  const unassignedStaff = availableStaff.filter(
    (s) => !booking.assignedStaffIds.includes(s.id)
  );
  const filteredStaff = unassignedStaff.filter((s) => {
    if (!staffSearchQuery.trim()) return true;
    const q = staffSearchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.location && s.location.toLowerCase().includes(q)) ||
      (s.phone && s.phone.includes(q))
    );
  });

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

            {/* In-place Multiple Staff Allocation Picker */}
            {!isQuotaFulfilled && (
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">Allocate Valet Attendants</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                      {remainingSlots} more needed
                    </span>
                  </div>

                  {unassignedStaff.length > 0 && remainingSlots > 0 && (
                    <div className="flex items-center gap-2">
                      {selectedStaffIds.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearSelected}
                          className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleSelectAllRemaining}
                        className="text-[11px] font-semibold text-[#023526] hover:text-[#034431] hover:underline cursor-pointer"
                      >
                        Auto-select {Math.min(remainingSlots, unassignedStaff.length)} available
                      </button>
                    </div>
                  )}
                </div>

                {/* Multi-Select Trigger & Dropdown Menu */}
                <div className="relative" ref={staffPickerRef}>
                  <button
                    type="button"
                    onClick={() => setIsStaffPickerOpen((prev) => !prev)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#023526] transition-all cursor-pointer shadow-2xs flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {selectedStaffIds.length === 0 ? (
                        <span className="text-slate-400">
                          Click to select multiple attendants ({unassignedStaff.length} available in roster)...
                        </span>
                      ) : (
                        <span className="text-slate-800 font-bold">
                          {selectedStaffIds.length} attendant{selectedStaffIds.length > 1 ? 's' : ''} selected
                          <span className="text-slate-400 font-normal ml-1">
                            (max {remainingSlots})
                          </span>
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isStaffPickerOpen ? 'rotate-180' : ''
                        }`}
                    />
                  </button>

                  {/* Dropdown Popover */}
                  {isStaffPickerOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-30 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                      {/* Search Bar inside Popover */}
                      <div className="p-2 border-b border-slate-100 bg-slate-50/70">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Filter by name, location, or phone..."
                            value={staffSearchQuery}
                            onChange={(e) => setStaffSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-300"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Staff Checklist */}
                      <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                        {filteredStaff.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400">
                            {unassignedStaff.length === 0
                              ? 'No unassigned staff available in roster'
                              : 'No matching attendants found'}
                          </div>
                        ) : (
                          filteredStaff.map((st) => {
                            const isSelected = selectedStaffIds.includes(st.id);
                            const isMaxReached =
                              selectedStaffIds.length >= remainingSlots && !isSelected;

                            return (
                              <button
                                key={st.id}
                                type="button"
                                disabled={isMaxReached}
                                onClick={() => handleToggleStaff(st.id)}
                                className={`w-full p-2.5 flex items-center justify-between text-left transition-colors cursor-pointer text-xs ${isSelected
                                  ? 'bg-emerald-50/70 hover:bg-emerald-50'
                                  : isMaxReached
                                    ? 'opacity-40 cursor-not-allowed bg-slate-50/50'
                                    : 'hover:bg-slate-50'
                                  }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div
                                    className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${isSelected
                                      ? 'bg-[#023526] border-[#023526] text-white'
                                      : 'border-slate-300 bg-white'
                                      }`}
                                  >
                                    {isSelected && <Check className="w-3 h-3" />}
                                  </div>

                                  <div className="min-w-0">
                                    <div className="font-bold text-slate-800 truncate">{st.name}</div>
                                    <div className="text-[10px] text-slate-400 truncate">
                                      {st.location || 'Bengaluru'} • {st.phone || 'No phone'}
                                    </div>
                                  </div>
                                </div>

                                <div className="shrink-0 text-right ml-2">
                                  <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                    ★ {st.rating || 4.8}
                                  </span>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>

                      {/* Dropdown Footer */}
                      <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">
                          Selected:{' '}
                          <strong className="text-slate-800">{selectedStaffIds.length}</strong> / {remainingSlots}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsStaffPickerOpen(false)}
                          className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 rounded-lg shadow-2xs cursor-pointer"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected Staff Chips */}
                {selectedStaffIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedStaffIds.map((id) => {
                      const staff = unassignedStaff.find((s) => s.id === id);
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold"
                        >
                          <span>{staff?.name || 'Staff'}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleStaff(id)}
                            className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
                            title="Remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Allocation Action Button */}
                <div className="flex items-center justify-end pt-1">
                  <button
                    type="button"
                    disabled={selectedStaffIds.length === 0 || isAssigning}
                    onClick={handleAssignStaff}
                    className="w-full sm:w-auto px-4 py-2 bg-[#023526] hover:bg-[#034431] text-white font-bold rounded-xl text-xs shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
                  >
                    {isAssigning ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <UserPlus className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {selectedStaffIds.length > 0
                        ? `Allocate ${selectedStaffIds.length} Attendant${selectedStaffIds.length > 1 ? 's' : ''}`
                        : 'Select Attendants to Allocate'}
                    </span>
                  </button>
                </div>
              </div>
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
          {/* <div className="card-white p-5 space-y-3">
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
          </div> */}
        </div>
      </div>
    </div>
  );
}
