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

  const statuses = [
    'All',
    'New Request',
    'Pending Assignment',
    'Partially Assigned',
    'Fully Assigned',
    'In Progress',
    'Completed',
    'Cancelled',
  ];

  const filteredValetBookings = valetBookings.filter((v) => {
    const matchesSearch =
      v.bookingNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
      v.customerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      v.eventName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      v.venue.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const availableStaffList = valetStaff.filter(
    (s) => s.status === 'Available' || s.status === 'Assigned'
  );

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
      render: (v) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            v.status === 'Fully Assigned' || v.status === 'In Progress'
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
      align: 'right',
      render: (v) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => {
              setSelectedValetBookingId(v.id);
              setActiveTab('valet-booking-details');
            }}
            className="p-1.5 text-primary hover:bg-primary-light rounded transition-colors"
            title="View Event & Staff Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setAssigningBooking(v)}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded shadow-xs"
            title="Assign Staff to Event"
          >
            Assign Staff
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-10">
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
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            <button
              onClick={() => setActiveTab('valet-staff')}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-all w-full sm:w-auto justify-center"
            >
              <UserCheck className="w-4 h-4 text-amber-400" /> Valet Staff Roster
            </button>
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
