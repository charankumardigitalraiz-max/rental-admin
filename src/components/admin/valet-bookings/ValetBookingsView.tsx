'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useValetBookingStore } from '@/store/useValetBookingStore';
import { ValetBooking, ValetBookingStatus } from '@/types';
import Modal from '@/components/ui/Modal';
import DataTable, { Column } from '@/components/ui/DataTable';
import { useToast } from '@/context/ToastContext';
import {
  Building2,
  Filter,
  UserCheck,
  Plus,
  Eye,
  UserPlus,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Phone,
  Mail,
  Users,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export default function ValetBookingsView() {
  const { toast } = useToast();
  const {
    valetBookings,
    selectedValetBooking,
    counts,
    pagination,
    isLoading,
    availableStaff,
    fetchValetBookings,
    fetchAvailableStaff,
    updateValetBookingStatus,
    assignStaffToBooking,
    removeStaffFromBooking,
    setSelectedValetBooking,
  } = useValetBookingStore();

  // Dynamic Filters, Search & Pagination
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modals & Assignments
  const [viewingBooking, setViewingBooking] = useState<ValetBooking | null>(null);
  const [assigningBooking, setAssigningBooking] = useState<ValetBooking | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');

  const statuses = ['All', 'Pending', 'In Progress', 'Completed', 'Cancelled'];

  // Debounce search query to prevent excessive backend queries (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Re-fetch bookings from backend whenever status filter, page, or search query changes
  useEffect(() => {
    fetchValetBookings({
      page: currentPage,
      limit: 10,
      status: statusFilter !== 'All' ? statusFilter : undefined,
      search: debouncedSearch.trim() || undefined,
    });
  }, [currentPage, statusFilter, debouncedSearch, fetchValetBookings]);

  // Load active valet staff roster from backend
  useEffect(() => {
    fetchAvailableStaff();
  }, [fetchAvailableStaff]);

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  };

  // Dynamic counts: directly driven by API counts, or computed from valetBookings as fallback
  const totalCount = counts?.total ?? valetBookings.length;
  const pendingCount =
    counts != null
      ? (counts.newRequests ?? 0) + (counts.pendingAssignment ?? 0)
      : valetBookings.filter(
        (b) =>
          b.status === 'New Request' ||
          b.status === 'Pending Assignment' ||
          b.status === 'Partially Assigned' ||
          (b.status as string) === 'Pending'
      ).length;
  const inProgressCount =
    counts != null
      ? (counts.inProgress ?? 0)
      : valetBookings.filter((b) => b.status === 'In Progress' || b.status === 'Fully Assigned').length;
  const completedCount =
    counts != null
      ? (counts.completed ?? 0)
      : valetBookings.filter((b) => b.status === 'Completed').length;
  const cancelledCount =
    counts != null
      ? (counts.cancelled ?? 0)
      : valetBookings.filter((b) => b.status === 'Cancelled').length;

  const getStatusCount = (st: string) => {
    if (st === 'All') return totalCount;
    if (st === 'Pending') return pendingCount;
    if (st === 'In Progress') return inProgressCount;
    if (st === 'Completed') return completedCount;
    if (st === 'Cancelled') return cancelledCount;
    return 0;
  };

  // Filtered List (instant zero-delay client-side pass)
  const filteredValetBookings = valetBookings.filter((v) => {
    if (statusFilter !== 'All') {
      if (statusFilter === 'Pending') {
        const isPending =
          v.status === 'New Request' ||
          v.status === 'Pending Assignment' ||
          v.status === 'Partially Assigned' ||
          (v.status as string) === 'Pending';
        if (!isPending) return false;
      } else if (statusFilter === 'In Progress') {
        if (v.status !== 'In Progress' && v.status !== 'Fully Assigned') return false;
      } else if (v.status !== statusFilter) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matches =
        v.bookingNumber?.toLowerCase().includes(q) ||
        v.customerName?.toLowerCase().includes(q) ||
        v.customerPhone?.toLowerCase().includes(q) ||
        v.customerEmail?.toLowerCase().includes(q) ||
        v.eventName?.toLowerCase().includes(q) ||
        v.eventType?.toLowerCase().includes(q) ||
        v.venue?.toLowerCase().includes(q) ||
        v.venueAddress?.toLowerCase().includes(q);
      if (!matches) return false;
    }

    return true;
  });

  const availableStaffList = availableStaff.filter(
    (s) => s.status === 'Available' || s.status === 'Assigned' || s.status === 'On Duty'
  );

  // Status Updater
  const handleUpdateStatus = async (bookingId: string, newStatus: ValetBookingStatus) => {
    if (newStatus === 'In Progress') {
      const targetBooking =
        (viewingBooking?.id === bookingId ? viewingBooking : null) ||
        valetBookings.find((b) => b.id === bookingId);
      const staffCount = targetBooking?.assignedStaffIds?.length || 0;
      if (staffCount === 0) {
        toast.warning(
          'Staff Allocation Required',
          'Please allocate at least one valet attendant before starting this event'
        );
        return;
      }
    }

    const success = await updateValetBookingStatus(bookingId, newStatus);
    if (success) {
      if (viewingBooking?.id === bookingId) {
        setViewingBooking((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      toast.success('Status Updated', `Event marked as ${newStatus}`);
    } else {
      toast.error('Update Failed', 'Could not update status');
    }
  };

  // Staff Assignment
  const handleAssignStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningBooking || !selectedStaffId) return;

    const staffMember = availableStaff.find((s) => s.id === selectedStaffId);
    const staffName = staffMember?.name || 'Valet Staff';

    const success = await assignStaffToBooking(assigningBooking.id, selectedStaffId);
    if (success) {
      // Synchronize modal state
      const updatedIds = [...assigningBooking.assignedStaffIds, selectedStaffId];
      const updatedNames = [...assigningBooking.assignedStaffNames, staffName];
      const newStatus: ValetBookingStatus =
        updatedIds.length >= assigningBooking.requiredStaffCount
          ? 'Fully Assigned'
          : 'Partially Assigned';

      setAssigningBooking((prev) =>
        prev
          ? {
            ...prev,
            assignedStaffIds: updatedIds,
            assignedStaffNames: updatedNames,
            status: newStatus,
          }
          : null
      );

      if (viewingBooking?.id === assigningBooking.id) {
        setViewingBooking((prev) =>
          prev
            ? {
              ...prev,
              assignedStaffIds: updatedIds,
              assignedStaffNames: updatedNames,
              status: newStatus,
            }
            : null
        );
      }

      setSelectedStaffId('');
      toast.success('Staff Allocated', `${staffName} assigned to ${assigningBooking.eventName}`);
    } else {
      toast.error('Assignment Failed', 'Could not assign staff member');
    }
  };

  // Staff Removal
  const handleRemoveStaff = async (bookingId: string, staffId: string) => {
    const success = await removeStaffFromBooking(bookingId, staffId);
    if (success) {
      const booking = valetBookings.find((b) => b.id === bookingId);
      if (booking) {
        const staffIdx = booking.assignedStaffIds.indexOf(staffId);
        const updatedIds = booking.assignedStaffIds.filter((id) => id !== staffId);
        const updatedNames = booking.assignedStaffNames.filter((_, idx) => idx !== staffIdx);
        const newStatus: ValetBookingStatus =
          updatedIds.length === 0 ? 'Pending Assignment' : 'Partially Assigned';

        if (assigningBooking?.id === bookingId) {
          setAssigningBooking((prev) =>
            prev
              ? {
                ...prev,
                assignedStaffIds: updatedIds,
                assignedStaffNames: updatedNames,
                status: newStatus,
              }
              : null
          );
        }

        if (viewingBooking?.id === bookingId) {
          setViewingBooking((prev) =>
            prev
              ? {
                ...prev,
                assignedStaffIds: updatedIds,
                assignedStaffNames: updatedNames,
                status: newStatus,
              }
              : null
          );
        }
      }
      toast.info('Staff Removed', 'Valet staff removed from this event');
    } else {
      toast.error('Removal Failed', 'Could not remove staff member');
    }
  };

  // Columns for DataTable
  const columns: Column<ValetBooking>[] = [
    {
      key: 'bookingNumber',
      header: 'Booking Ref',
      render: (v) => (
        <Link href={`/admin/valet-bookings/${v.id}`} className="group block">
          <span className="font-mono font-bold text-slate-900 group-hover:text-[#023526] group-hover:underline block text-xs">
            {v.bookingNumber}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {v.id.length > 12 ? v.id.slice(-6) : v.id}
          </span>
        </Link>
      ),
    },
    {
      key: 'eventName',
      header: 'Event Name & Type',
      className: 'min-w-[170px]',
      render: (v) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{v.eventName}</div>
          <span className="inline-block mt-0.5 text-[9.5px] font-semibold text-[#023526] bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
            {v.eventType}
          </span>
        </div>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer / Business',
      render: (v) => (
        <div>
          <div className="font-bold text-slate-800 text-xs">{v.customerName}</div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
            <Phone className="w-2.5 h-2.5" /> {v.customerPhone}
          </div>
        </div>
      ),
    },
    {
      key: 'venue',
      header: 'Venue & Schedule',
      className: 'min-w-[190px]',
      render: (v) => (
        <div>
          <div className="font-semibold text-slate-800 text-xs flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" /> {v.venue}
          </div>
          <div className="text-[10.5px] text-slate-500 flex items-center gap-1 mt-0.5">
            <Calendar className="w-3 h-3 text-slate-400 shrink-0" /> {v.eventDate} • {v.startTime} - {v.endTime}
          </div>
        </div>
      ),
    },
    {
      key: 'staffReq',
      header: 'Staff Roster',
      render: (v) => {
        const assignedCount = v.assignedStaffIds.length;
        const remaining = v.requiredStaffCount - assignedCount;
        const isComplete = remaining <= 0;
        return (
          <div>
            <div className="font-bold text-slate-900 text-xs">
              {assignedCount} / {v.requiredStaffCount} Attendants
            </div>
            {isComplete ? (
              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Fully Staffed
              </span>
            ) : (
              <span className="text-[10px] text-amber-700 font-semibold">
                Needs {remaining} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'totalAmount',
      header: 'Event Pricing',
      render: (v) => (
        <div>
          <span className="font-bold text-slate-900 text-xs block">
            ₹{v.pricing.totalAmount.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-400">
            Payout: ₹{v.pricing.staffPayoutTotal.toLocaleString('en-IN')}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'min-w-[130px]',
      render: (v) => {
        let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
        if (v.status === 'Fully Assigned' || v.status === 'In Progress') {
          badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        } else if (
          v.status === 'Partially Assigned' ||
          v.status === 'New Request' ||
          (v.status as string) === 'Pending Assignment'
        ) {
          badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200';
        } else if (v.status === 'Completed') {
          badgeStyle = 'bg-sky-50 text-sky-800 border-sky-200';
        } else if (v.status === 'Cancelled') {
          badgeStyle = 'bg-rose-50 text-rose-800 border-rose-200';
        }

        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeStyle}`}>
            {v.status}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      className: 'min-w-[150px]',
      render: (v) => (
        <div className="flex items-center justify-center gap-1.5">
          <Link
            href={`/admin/valet-bookings/${v.id}`}
            className="p-1.5 bg-slate-100 hover:bg-[#023526] text-slate-700 hover:text-white rounded-lg border border-slate-200 transition-all cursor-pointer inline-flex items-center justify-center shadow-2xs"
            title="View Full Event Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => setAssigningBooking(v)}
            className="px-2.5 py-1 bg-[#023526] hover:bg-[#034431] text-white text-[10.5px] font-semibold rounded-lg shadow-2xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
            title="Allocate Staff to Event"
          >
            <UserPlus className="w-3 h-3" />
            Staff ({v.assignedStaffIds?.length || 0}/{v.requiredStaffCount})
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 4 Interactive Dynamic Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => handleStatusChange('All')}
          className={`card-white p-4 space-y-1 cursor-pointer transition-all hover:shadow-xs ${statusFilter === 'All'
            ? 'ring-2 ring-[#023526] border-transparent shadow-xs'
            : 'hover:border-slate-300'
            }`}
          title="Click to view all events"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block">
              Total Event Bookings
            </span>
            {statusFilter === 'All' && (
              <span className="w-2 h-2 rounded-full bg-[#023526]" />
            )}
          </div>
          <div className="text-xl font-bold text-slate-900">{totalCount}</div>
          <span className="text-[10px] text-slate-400 font-medium">
            All venue & corporate events
          </span>
        </div>

        <div
          onClick={() => handleStatusChange('Pending')}
          className={`card-white p-4 space-y-1 cursor-pointer transition-all hover:shadow-xs ${statusFilter === 'Pending'
            ? 'ring-2 ring-amber-500 border-transparent shadow-xs'
            : 'hover:border-amber-200'
            }`}
          title="Click to filter pending allocation"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-700 block">
              Pending Allocation
            </span>
            {statusFilter === 'Pending' && (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            )}
          </div>
          <div className="text-xl font-bold text-amber-700">{pendingCount}</div>
          <span className="text-[10px] text-amber-600 font-medium">
            Requires staff assignment
          </span>
        </div>

        <div
          onClick={() => handleStatusChange('In Progress')}
          className={`card-white p-4 space-y-1 cursor-pointer transition-all hover:shadow-xs ${statusFilter === 'In Progress'
            ? 'ring-2 ring-emerald-600 border-transparent shadow-xs'
            : 'hover:border-emerald-200'
            }`}
          title="Click to filter active events"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-700 block">
              Active / Fully Staffed
            </span>
            {statusFilter === 'In Progress' && (
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
            )}
          </div>
          <div className="text-xl font-bold text-emerald-700">{inProgressCount}</div>
          <span className="text-[10px] text-emerald-600 font-medium">
            Valets assigned & on-ground
          </span>
        </div>

        <div
          onClick={() => handleStatusChange('Completed')}
          className={`card-white p-4 space-y-1 cursor-pointer transition-all hover:shadow-xs ${statusFilter === 'Completed'
            ? 'ring-2 ring-sky-600 border-transparent shadow-xs'
            : 'hover:border-sky-200'
            }`}
          title="Click to filter completed events"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-sky-700 block">
              Completed Events
            </span>
            {statusFilter === 'Completed' && (
              <span className="w-2 h-2 rounded-full bg-sky-600" />
            )}
          </div>
          <div className="text-xl font-bold text-sky-700">{completedCount}</div>
          <span className="text-[10px] text-sky-600 font-medium">Successfully fulfilled</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div>
        <DataTable<ValetBooking>
          columns={columns}
          data={valetBookings}
          isLoading={isLoading}
          keyExtractor={(v) => v.id}
          pageSize={10}
          searchPlaceholder="Search by booking ref, event name, customer, phone, venue..."
          serverSearch={true}
          searchValue={searchQuery}
          onSearchChange={(val) => {
            setSearchQuery(val);
            setCurrentPage(1);
          }}
          emptyMessage="No valet event bookings found matching your search or filter."
          serverPagination={{
            currentPage,
            totalPages: pagination?.totalPages ?? 1,
            totalItems: pagination?.total ?? valetBookings.length,
            onPageChange: (page) => setCurrentPage(page),
          }}
          headerActions={
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#023526] transition-all cursor-pointer shadow-2xs"
                >
                  {statuses.map((st) => (
                    <option key={st} value={st}>
                      {st === 'All' ? 'All Statuses' : st} ({getStatusCount(st)})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  fetchValetBookings({
                    page: currentPage,
                    limit: 10,
                    status: statusFilter !== 'All' ? statusFilter : undefined,
                    search: searchQuery.trim() || undefined,
                  });
                }}
                disabled={isLoading}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                title="Refresh Bookings"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : 'text-slate-400'}`}
                />
                <span>Refresh</span>
              </button>
            </div>
          }
        />
      </div>

      {/* ===================================================================== */}
      {/* MODAL 1: VIEW FULL EVENT DETAILS                                      */}
      {/* ===================================================================== */}
      {viewingBooking && (
        <Modal
          isOpen={!!viewingBooking}
          onClose={() => setViewingBooking(null)}
          title={viewingBooking.eventName}
          subtitle={`Booking Reference: ${viewingBooking.bookingNumber} • ${viewingBooking.eventType}`}
          icon={Building2}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs">
            {/* Quick Status Bar */}
            <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-600">Current Status:</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#023526] text-white">
                  {viewingBooking.status}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {viewingBooking.status !== 'In Progress' && viewingBooking.status !== 'Completed' && (
                  <button
                    type="button"
                    disabled={(viewingBooking.assignedStaffIds?.length || 0) === 0}
                    onClick={() => handleUpdateStatus(viewingBooking.id, 'In Progress')}
                    className={`px-2.5 py-1 font-bold rounded-lg transition-colors text-[10.5px] ${(viewingBooking.assignedStaffIds?.length || 0) > 0
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                      : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                      }`}
                    title={
                      (viewingBooking.assignedStaffIds?.length || 0) > 0
                        ? 'Start Event Operations'
                        : 'Allocate staff before starting this event'
                    }
                  >
                    Start Event
                  </button>
                )}
                {viewingBooking.status !== 'Completed' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(viewingBooking.id, 'Completed')}
                    className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-lg transition-colors cursor-pointer text-[10.5px]"
                  >
                    Mark Fulfilled ✓
                  </button>
                )}
                {viewingBooking.status !== 'Cancelled' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(viewingBooking.id, 'Cancelled')}
                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-lg transition-colors cursor-pointer text-[10.5px]"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Event Schedule & Venue */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" /> Event Timing & Duration
                </span>
                <div className="font-bold text-sm text-slate-900">{viewingBooking.eventDate}</div>
                <div className="text-slate-600 font-medium">
                  {viewingBooking.startTime} to {viewingBooking.endTime} ({viewingBooking.durationHours} hours)
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-600" /> Venue & Destination
                </span>
                <div className="font-bold text-sm text-slate-900">{viewingBooking.venue}</div>
                <div className="text-slate-500 line-clamp-2">{viewingBooking.venueAddress}</div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Client / Organizer Contact
              </span>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-900 text-xs">{viewingBooking.customerName}</div>
                  <div className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" /> {viewingBooking.customerPhone}
                    {viewingBooking.customerEmail && (
                      <>
                        <span className="text-slate-300">•</span>
                        <Mail className="w-3 h-3 text-slate-400" /> {viewingBooking.customerEmail}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Staff Allocation Roster */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Assigned Valet Staff ({viewingBooking.assignedStaffIds.length} /{' '}
                  {viewingBooking.requiredStaffCount} Required)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAssigningBooking(viewingBooking);
                  }}
                  className="px-2.5 py-1 bg-[#023526] text-white rounded-lg text-[10.5px] font-bold flex items-center gap-1 hover:bg-[#034431] cursor-pointer"
                >
                  <UserPlus className="w-3 h-3" /> Manage Allocation
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {viewingBooking.assignedStaffIds.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-medium w-full flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    No valet staff assigned to this event yet. Click &quot;Manage Allocation&quot; to assign attendants.
                  </div>
                ) : (
                  viewingBooking.assignedStaffIds.map((staffId, idx) => (
                    <div
                      key={staffId}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#023526] font-bold flex items-center justify-center text-[10px]">
                        ✓
                      </div>
                      <span className="font-bold text-slate-800 text-xs">
                        {viewingBooking.assignedStaffNames[idx] || `Valet Staff ${idx + 1}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStaff(viewingBooking.id, staffId)}
                        className="text-slate-400 hover:text-rose-600 text-xs font-bold transition-colors ml-1 cursor-pointer"
                        title="Remove Staff"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Financial Overview */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Financial Split & Margins
              </span>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-semibold block">Customer Tariff</span>
                  <span className="text-base font-bold text-slate-900">
                    ₹{viewingBooking.pricing.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-emerald-700 font-semibold block">Staff Payout</span>
                  <span className="text-base font-bold text-emerald-700">
                    ₹{viewingBooking.pricing.staffPayoutTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-amber-700 font-semibold block">Platform Margin</span>
                  <span className="text-base font-bold text-amber-700">
                    ₹{viewingBooking.pricing.platformCommission.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingBooking(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: ALLOCATE VALET STAFF TO EVENT                                */}
      {/* ===================================================================== */}
      {assigningBooking && (
        <Modal
          isOpen={!!assigningBooking}
          onClose={() => setAssigningBooking(null)}
          title={`Allocate Valet Staff to ${assigningBooking.eventName}`}
          subtitle={`Venue: ${assigningBooking.venue} • Required Staff: ${assigningBooking.requiredStaffCount}`}
          icon={UserCheck}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Current Roster */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                Currently Assigned ({assigningBooking.assignedStaffNames.length} /{' '}
                {assigningBooking.requiredStaffCount}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {assigningBooking.assignedStaffIds.length === 0 ? (
                  <span className="text-amber-700 font-semibold italic text-xs">
                    No valet staff assigned yet.
                  </span>
                ) : (
                  assigningBooking.assignedStaffIds.map((staffId, idx) => (
                    <span
                      key={staffId}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 flex items-center gap-1.5 shadow-2xs"
                    >
                      {assigningBooking.assignedStaffNames[idx] || `Valet Staff ${idx + 1}`}
                      <button
                        type="button"
                        onClick={() => handleRemoveStaff(assigningBooking.id, staffId)}
                        className="text-rose-500 hover:text-rose-700 font-bold text-xs ml-1 cursor-pointer"
                        title="Remove Staff"
                      >
                        ✕
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Allocation Form */}
            {assigningBooking.assignedStaffIds.length < assigningBooking.requiredStaffCount ? (
              <form onSubmit={handleAssignStaff} className="space-y-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">
                    Select Available Valet Attendant
                  </label>
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#023526] text-xs font-semibold cursor-pointer"
                    required
                  >
                    <option value="">-- Choose Valet Staff Member --</option>
                    {availableStaffList
                      .filter((s) => !assigningBooking.assignedStaffIds.includes(s.id))
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.location} • {s.experienceYears} yrs exp • ⭐ {s.rating})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#023526] hover:bg-[#034431] text-white font-bold rounded-xl text-xs shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Allocate to Event
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                This event has fulfilled its required staff quota of {assigningBooking.requiredStaffCount} attendants!
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setAssigningBooking(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
