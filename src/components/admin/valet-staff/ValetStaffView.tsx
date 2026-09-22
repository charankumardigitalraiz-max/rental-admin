'use client';

import React, { useState } from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import {
  Users,
  Search,
  Filter,
  Star,
  Building2,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Clock,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { ValetStaff } from '@/types';

export default function ValetStaffView() {
  const { valetStaff, updateValetStaffStatus } = useRentalStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedStaff, setSelectedStaff] = useState<ValetStaff | null>(null);

  const filteredStaff = valetStaff.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.phone.includes(searchQuery) ||
      staff.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || staff.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const availableCount = valetStaff.filter((s) => s.status === 'Available').length;
  const onDutyCount = valetStaff.filter((s) => s.status === 'On Duty' || s.status === 'Assigned').length;
  const avgRating = (valetStaff.reduce((acc, s) => acc + s.rating, 0) / valetStaff.length).toFixed(1);

  return (
    <div className="p-2 space-y-6 max-w-7xl mx-auto">
      {/* Unified Metrics & Roster Overview Card */}
      <div className="bg-white p-6 rounded-xl border border-stone-200/80 shadow-xs space-y-5">
        {/* <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <Building2 className="w-5 h-5 text-[#023526]" />
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Valet Event Staff Roster Overview
            </h1>
            <p className="text-xs text-slate-500">
              Manage professional valet drivers, event duty status, shift assignments, and performance ratings.
            </p>
          </div>
        </div> */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="pt-2 md:pt-0">
            <p className="text-xs font-semibold text-slate-500">Total Valet Staff</p>
            <div className="text-2xl font-black text-slate-900 mt-1">{valetStaff.length}</div>
            <p className="text-[10px] text-slate-400 mt-1">Active roster staff</p>
          </div>

          <div className="pt-3 md:pt-0 md:pl-4">
            <p className="text-xs font-semibold text-emerald-600">On Duty / Assigned</p>
            <div className="text-2xl font-black text-emerald-800 mt-1">{onDutyCount}</div>
            <p className="text-[10px] text-emerald-600/80 mt-1">Currently assigned to events</p>
          </div>

          <div className="pt-3 md:pt-0 md:pl-4">
            <p className="text-xs font-semibold text-sky-600">Available Standby</p>
            <div className="text-2xl font-black text-sky-800 mt-1">{availableCount}</div>
            <p className="text-[10px] text-sky-600/80 mt-1">Ready for event allocation</p>
          </div>

          <div className="pt-3 md:pt-0 md:pl-4">
            <p className="text-xs font-semibold text-amber-600">Average Roster Rating</p>
            <div className="flex items-center gap-1 text-2xl font-black text-slate-900 mt-1">
              {avgRating} <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <p className="text-[10px] text-amber-600/80 mt-1">Based on event reviews</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff name, phone, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-600">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          >
            <option value="All">All Staff ({valetStaff.length})</option>
            <option value="Available">Available</option>
            <option value="Assigned">Assigned</option>
            <option value="On Duty">On Duty</option>
            <option value="Offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Roster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStaff.map((staff) => (
          <div
            key={staff.id}
            className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between space-y-4 group hover:border-[#023526]/30"
          >
            {/* Top Profile Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={staff.avatar}
                    alt={staff.name}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-stone-100 group-hover:ring-[#023526]/20 transition-all"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-[#023526] text-white p-0.5 rounded-full ring-2 ring-white">
                    <ShieldCheck className="w-3 h-3 text-amber-300" />
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm tracking-tight group-hover:text-[#023526] transition-colors">
                    {staff.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{staff.rating}</span>
                    <span className="text-slate-400 font-normal">({staff.assignedEventsCount} events)</span>
                  </div>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase border ${
                  staff.status === 'Available'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                    : staff.status === 'On Duty'
                    ? 'bg-amber-50 text-amber-900 border-amber-200/80'
                    : staff.status === 'Assigned'
                    ? 'bg-sky-50 text-sky-800 border-sky-200/80'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    staff.status === 'Available'
                      ? 'bg-emerald-500 animate-pulse'
                      : staff.status === 'On Duty'
                      ? 'bg-amber-500 animate-pulse'
                      : staff.status === 'Assigned'
                      ? 'bg-sky-500'
                      : 'bg-slate-400'
                  }`}
                />
                {staff.status}
              </span>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate font-medium">{staff.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate font-medium">{staff.location}</span>
              </div>
              <div className="col-span-2 flex items-center gap-2 text-slate-700 pt-1.5 border-t border-slate-200/60">
                <ShieldCheck className="w-3.5 h-3.5 text-[#023526] shrink-0" />
                <span className="font-semibold text-slate-800 text-[11px]">
                  {staff.experienceYears} Years Valet Experience
                </span>
              </div>
            </div>

            {/* Active Event Assignment Banner */}
            {staff.currentAssignment ? (
              <div className="bg-gradient-to-r from-emerald-950 to-[#023526] text-white p-3 rounded-xl space-y-1 shadow-2xs">
                <div className="flex justify-between items-center text-[10px] font-bold text-[#c5a880] uppercase tracking-wider">
                  <span>Current Event Duty</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <p className="font-bold text-xs truncate text-white">{staff.currentAssignment.eventName}</p>
                <p className="text-[11px] text-emerald-200/80 truncate">@ {staff.currentAssignment.venue}</p>
              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-200 p-2.5 rounded-xl text-[11px] text-slate-400 text-center font-medium">
                No active event assigned currently
              </div>
            )}

            {/* Card Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <span className="text-[9.5px] text-slate-400 uppercase font-bold tracking-wider block">
                  Total Earnings
                </span>
                <p className="text-sm font-extrabold text-slate-900">
                  ₹{staff.earnings.total.toLocaleString()}
                </p>
              </div>

              <select
                value={staff.status}
                onChange={(e) => updateValetStaffStatus(staff.id, e.target.value as any)}
                className="px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-[#023526] focus:outline-none shadow-2xs cursor-pointer"
              >
                <option value="Available">Available</option>
                <option value="Assigned">Assigned</option>
                <option value="On Duty">On Duty</option>
                <option value="Offline">Offline</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
