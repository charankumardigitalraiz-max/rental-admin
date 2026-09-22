'use client';

import React, { useState } from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import { ValetBooking, ValetBookingStatus } from '@/types';
import Modal from '@/components/ui/Modal';
import DataTable, { Column } from '@/components/ui/DataTable';
import {
  Building2,
  Search,
  Filter,
  UserCheck,
  Plus,
  Eye,
  UserPlus,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export default function ValetBookingsView() {
  const {
    valetBookings,
    valetStaff,
    assignValetStaffToBooking,
    removeValetStaffFromBooking,
    updateValetBookingStatus,
    setActiveTab,
    setSelectedValetBookingId,
  } = useRentalStore();

  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Staff Assignment Modal State
  const [assigningBooking, setAssigningBooking] = useState<ValetBooking | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');

  // Streamlined Event Status Options
  const statuses = ['All', 'Pending', 'In Progress', 'Completed', 'Cancelled'];

  const pendingCount = valetBookings.filter(
    (b) =>
      b.status === 'New Request' ||
      b.status === 'Pending Assignment' ||
      b.status === 'Partially Assigned' ||
      b.status === 'Fully Assigned' ||
      (b.status as string) === 'Pending'
  ).length;
  const inProgressCount = valetBookings.filter((b) => b.status === 'In Progress').length;
  const completedCount = valetBookings.filter((b) => b.status === 'Completed').length;
  const cancelledCount = valetBookings.filter((b) => b.status === 'Cancelled').length;

  const getStatusCount = (st: string) => {
    if (st === 'All') return valetBookings.length;
    if (st === 'Pending') return pendingCount;
    if (st === 'In Progress') return inProgressCount;
    if (st === 'Completed') return completedCount;
    if (st === 'Cancelled') return cancelledCount;
    return 0;
  };

  const filteredValetBookings = valetBookings.filter((v) => {
    const matchesSearch =
      v.bookingNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
      v.customerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      v.eventName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      v.venue.toLowerCase().includes(searchFilter.toLowerCase());

    let matchesStatus = false;
    if (statusFilter === 'All') {
      matchesStatus = true;
    } else if (statusFilter === 'Pending') {
      matchesStatus =
        v.status === 'New Request' ||
        v.status === 'Pending Assignment' ||
        v.status === 'Partially Assigned' ||
        v.status === 'Fully Assigned' ||
        (v.status as string) === 'Pending';
    } else {
      matchesStatus = v.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  const availableStaffList = valetStaff.filter(
    (s) => s.status === 'Available' || s.status === 'Assigned'
  );

  const totalValetBookingsCount = valetBookings.length;
  const activeEventsCount = valetBookings.filter((b) => b.status === 'In Progress').length;
  const upcomingEventsCount = valetBookings.filter(
    (b) =>
      b.status === 'New Request' ||
      b.status === 'Pending Assignment' ||
      b.status === 'Partially Assigned' ||
      b.status === 'Fully Assigned'
  ).length;
  const completedEventsCount = valetBookings.filter((b) => b.status === 'Completed').length;

  const handleAssignStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningBooking || !selectedStaffId) return;
    assignValetStaffToBooking(assigningBooking.id, selectedStaffId);
    setSelectedStaffId('');
  };

  const columns: Column<ValetBooking>[] = [
    {
      key: 'bookingNumber',
      header: 'Booking Ref',
      render: (v) => <span className="font-mono font-bold text-slate-900">{v.bookingNumber}</span>,
    },
    {
      key: 'eventName',
      header: 'Event Name & Type',
      render: (v) => (
        <div>
          <div className="font-bold text-slate-900">{v.eventName}</div>
          <span className="text-[10px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded">
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
          <div className="font-bold text-slate-800">{v.customerName}</div>
          <div className="text-[10px] text-slate-400">{v.customerPhone}</div>
        </div>
      ),
    },
    {
      key: 'venue',
      header: 'Venue & Date',
      render: (v) => (
        <div>
          <div className="font-semibold text-slate-800 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" /> {v.venue}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
            <Calendar className="w-3 h-3 shrink-0" /> {v.eventDate} ({v.startTime} - {v.endTime})
          </div>
        </div>
      ),
    },
    {
      key: 'staffReq',
      header: 'Staff Requirement',
      render: (v) => {
        const assignedCount = v.assignedStaffIds.length;
        const remaining = v.requiredStaffCount - assignedCount;
        return (
          <div>
            <div className="font-bold text-slate-900">
              {assignedCount} / {v.requiredStaffCount} Staff Assigned
            </div>
            {remaining > 0 ? (
              <span className="text-[10px] text-rose-600 font-bold block">Need {remaining} more</span>
            ) : (
              <span className="text-[10px] text-emerald-600 font-bold block">Fully Staffed ✓</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      render: (v) => (
        <span className="font-bold text-slate-900">
          ₹{v.pricing.totalAmount.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'min-w-[140px]',
      render: (v) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${v.status === 'Fully Assigned' || v.status === 'In Progress'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : v.status === 'Partially Assigned' || v.status === 'New Request'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : v.status === 'Completed'
                ? 'bg-primary-light text-primary border border-primary/20'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
        >
          {v.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      className: 'min-w-[170px]',
      render: (v) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => {
              setSelectedValetBookingId(v.id);
              setActiveTab('valet-booking-details');
            }}
            className="p-1.5 bg-primary-light hover:bg-primary text-primary hover:text-white rounded-md border border-primary/20 hover:border-primary transition-all inline-flex items-center justify-center shadow-2xs"
            title="View Event & Staff Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setAssigningBooking(v)}
            className="px-2 py-1 bg-primary hover:bg-slate-800 text-white text-[10px] font-bold rounded-md shadow-xs whitespace-nowrap"
            title="Assign Staff to Event"
          >
            Assign Staff
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-2 space-y-6 pb-10">
      {/* Unified Stats Card */}
      <div className="bg-white p-6 rounded-xl border border-stone-200/80 shadow-xs space-y-5">
        {/* <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <Building2 className="w-5 h-5 text-[#023526]" />
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Valet Event Bookings Overview
            </h1>
            <p className="text-xs text-slate-500">
              Track active corporate & wedding event assignments, staff dispatch schedules, and event completion logs.
            </p>
          </div>
        </div> */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="pt-2 md:pt-0">
            <p className="text-xs font-semibold text-slate-500">Total Event Bookings</p>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalValetBookingsCount}</div>
            <p className="text-[10px] text-slate-400 mt-1">All venue & corporate bookings</p>
          </div>

          <div className="pt-3 md:pt-0 md:pl-4">
            <p className="text-xs font-semibold text-amber-600">Active Events (In Progress)</p>
            <div className="text-2xl font-black text-amber-800 mt-1">{activeEventsCount}</div>
            <p className="text-[10px] text-amber-600/80 mt-1">Valet staff currently on ground</p>
          </div>

          <div className="pt-3 md:pt-0 md:pl-4">
            <p className="text-xs font-semibold text-sky-600">Upcoming / Pending Events</p>
            <div className="text-2xl font-black text-sky-800 mt-1">{upcomingEventsCount}</div>
            <p className="text-[10px] text-sky-600/80 mt-1">New requests & staff allocation</p>
          </div>

          <div className="pt-3 md:pt-0 md:pl-4">
            <p className="text-xs font-semibold text-emerald-600">Completed Events</p>
            <div className="text-2xl font-black text-emerald-800 mt-1">{completedEventsCount}</div>
            <p className="text-[10px] text-emerald-600/80 mt-1">Successfully fulfilled</p>
          </div>
        </div>
      </div>

      <DataTable<ValetBooking>
        columns={columns}
        data={filteredValetBookings}
        keyExtractor={(v) => v.id}
        pageSize={6}
        searchPlaceholder="Search event name, venue, customer..."
        searchFilterKeys={['bookingNumber', 'customerName', 'eventName', 'venue']}
        emptyMessage="No valet event bookings match the selected status."
        headerActions={
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Filter className="w-3.5 h-3.5" /> Event Status:
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {statuses.map((st) => {
                const count = getStatusCount(st);
                return (
                  <option key={st} value={st}>
                    {st} ({count})
                  </option>
                );
              })}
            </select>

            {/* <button
              onClick={() => setActiveTab('valet-staff')}
              className="bg-primary hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-all w-full sm:w-auto justify-center"
            >
              <UserCheck className="w-4 h-4 text-amber-400" /> Valet Staff Roster
            </button> */}
          </div>
        }
      />

      {/* Quick Staff Allocation Modal */}
      {assigningBooking && (
        <Modal
          isOpen={!!assigningBooking}
          onClose={() => setAssigningBooking(null)}
          title={`Allocate Staff to ${assigningBooking.eventName}`}
          subtitle={`Venue: ${assigningBooking.venue} • Required Staff: ${assigningBooking.requiredStaffCount}`}
          icon={UserCheck}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Current Staff Roster */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Currently Assigned Staff ({assigningBooking.assignedStaffNames.length} / {assigningBooking.requiredStaffCount}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {assigningBooking.assignedStaffIds.length === 0 ? (
                  <span className="text-amber-700 font-semibold italic">No valet staff assigned yet.</span>
                ) : (
                  assigningBooking.assignedStaffIds.map((staffId, idx) => (
                    <span
                      key={staffId}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-md font-bold text-slate-800 flex items-center gap-1.5"
                    >
                      {assigningBooking.assignedStaffNames[idx]}
                      <button
                        onClick={() => removeValetStaffFromBooking(assigningBooking.id, staffId)}
                        className="text-rose-500 hover:text-rose-700 font-bold text-xs ml-1"
                        title="Remove Staff"
                      >
                        ✕
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Add Staff Form */}
            {assigningBooking.assignedStaffIds.length < assigningBooking.requiredStaffCount && (
              <form onSubmit={handleAssignStaff} className="space-y-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Select Available Valet Staff Member
                  </label>
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">-- Choose Valet Staff --</option>
                    {availableStaffList
                      .filter((s) => !assigningBooking.assignedStaffIds.includes(s.id))
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.location} • {s.experienceYears} yrs exp • ⭐ {s.rating})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-primary text-white font-bold rounded-lg shadow-xs hover:bg-primary-hover"
                  >
                    + Assign Staff Member
                  </button>
                </div>
              </form>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setAssigningBooking(null)}
                className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-lg text-xs"
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
