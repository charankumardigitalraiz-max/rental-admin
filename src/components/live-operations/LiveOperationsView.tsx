'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRentalStore } from '@/store/useRentalStore';
import DataTable, { Column } from '@/components/ui/DataTable';
import { DriverBooking, Driver } from '@/types';
import {
  Car,
  MapPin,
  Phone,
  Compass,
  Navigation,
  Zap,
  Eye,
  Activity,
  Filter,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';

export default function LiveOperationsView() {
  const {
    driverBookings,
    drivers,
    setSelectedDriverBookingId,
    setSelectedDriverId,
    setActiveTab,
  } = useRentalStore();

  const [activeTabState, setActiveTabState] = useState<'driver-trips' | 'online-drivers'>('driver-trips');
  const [driverStatusFilter, setDriverStatusFilter] = useState('All');

  // Filter active driver bookings (ongoing trips / dispatching)
  const activeDriverBookings = driverBookings.filter((b) => {
    const isLive =
      b.status === 'Service Started' ||
      b.status === 'Driver Arriving' ||
      b.status === 'Searching Driver' ||
      b.status === 'Driver Assigned';

    if (!isLive) return false;
    return driverStatusFilter === 'All' || b.status === driverStatusFilter;
  });

  // Filter pending dispatch requests
  const pendingRequests = driverBookings.filter(
    (b) => b.status === 'Searching Driver' || b.status === 'Pending'
  );

  // Online drivers roster
  const onlineDrivers = drivers.filter((d) => d.dutyStatus === 'Online');
  const availableDrivers = onlineDrivers.filter((d) => d.availability === 'Available');

  // Columns for Ongoing Driver Trips Table
  const driverTripColumns: Column<DriverBooking>[] = [
    {
      key: 'bookingNumber',
      header: 'Booking Ref',
      render: (b) => <span className="font-mono font-bold text-slate-900">{b.bookingNumber}</span>,
    },
    {
      key: 'customerName',
      header: 'Customer Info',
      render: (b) => (
        <div>
          <div className="font-bold text-slate-900">{b.customerName}</div>
          <div className="text-[10px] text-slate-400">{b.customerPhone}</div>
        </div>
      ),
    },
    {
      key: 'bookingType',
      header: 'Type & Vehicle',
      render: (b) => (
        <div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-light text-primary block w-fit mb-0.5">
            {b.bookingType} ({b.durationHours}h)
          </span>
          <span className="text-[11px] text-slate-700 font-medium">{b.vehicleInfo.model}</span>
        </div>
      ),
    },
    {
      key: 'pickupLocation',
      header: 'Live Route (Pickup → Drop)',
      render: (b) => (
        <div className="max-w-[220px]">
          <div className="text-slate-800 font-medium truncate flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" /> {b.pickupLocation}
          </div>
          <div className="text-slate-500 text-[10px] truncate flex items-center gap-1 mt-0.5">
            <Navigation className="w-3.5 h-3.5 text-rose-500 shrink-0" /> {b.destinationLocation}
          </div>
        </div>
      ),
    },
    {
      key: 'driverName',
      header: 'Assigned Duty Driver',
      render: (b) =>
        b.driverName ? (
          <div className="flex items-center gap-2">
            <img src={b.driverAvatar} alt={b.driverName} className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-emerald-200" />
            <div>
              <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                {b.driverName} <span className="text-[10px] text-amber-500 font-bold">⭐ {b.driverRating}</span>
              </div>
              {b.driverPhone && (
                <a href={`tel:${b.driverPhone}`} className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5">
                  <Phone className="w-2.5 h-2.5" /> Call Driver
                </a>
              )}
            </div>
          </div>
        ) : (
          <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded text-[10px] border border-amber-200 whitespace-nowrap inline-block">
            Dispatch Searching Driver...
          </span>
        ),
    },
    {
      key: 'totalAmount',
      header: 'Trip Fare',
      render: (b) => (
        <span className="font-bold text-slate-900">
          ₹{b.pricing.totalCustomerAmount.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Live Status',
      render: (b) => (
        <span
          className={`px-2.5 py-1 rounded text-[10px] font-bold whitespace-nowrap inline-block ${b.status === 'Service Started'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : b.status === 'Driver Arriving'
              ? 'bg-sky-50 text-sky-700 border border-sky-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
        >
          ● {b.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (b) => (
        <div className="flex justify-center">
          <Link
            href={`/driver-bookings/${b.id}`}
            className="p-1.5 bg-primary text-white text-[11px] font-bold rounded-md shadow-2xs hover:bg-primary-hover transition-all flex items-center justify-center"
            title="View Booking Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
        </div>
      ),
    },
  ];

  // Columns for Online Driver Duty Roster Table
  const onlineDriverColumns: Column<Driver>[] = [
    {
      key: 'name',
      header: 'Driver Profile',
      render: (d) => (
        <div className="flex items-center gap-3">
          <img src={d.avatar} alt={d.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-200 shrink-0" />
          <div>
            <div className="font-bold text-slate-900 text-xs">{d.name}</div>
            <div className="text-[10px] text-slate-400">{d.phone} • ⭐ {d.rating}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'availability',
      header: 'Duty Availability',
      render: (d) => (
        <span
          className={`px-2.5 py-1 rounded text-[10px] font-bold whitespace-nowrap inline-block ${d.availability === 'Available'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
        >
          {d.availability}
        </span>
      ),
    },
    {
      key: 'currentLocation',
      header: 'GPS Location',
      render: (d) => (
        <div className="flex items-center gap-1 text-slate-700 font-medium">
          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" /> {d.currentLocation}
        </div>
      ),
    },
    {
      key: 'subscription',
      header: 'Subscription Pass',
      render: (d) => (
        <span className="font-bold text-slate-900 text-xs">
          {d.subscription.planName} ({d.subscription.status})
        </span>
      ),
    },
    {
      key: 'completedBookings',
      header: 'Trips Completed',
      render: (d) => <span className="font-bold text-slate-900">{d.completedBookings} Trips</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (d) => (
        <div className="flex items-center justify-center gap-1.5">
          <a
            href={`tel:${d.phone}`}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-md border border-emerald-200/80 flex items-center gap-1 whitespace-nowrap transition-all shadow-2xs"
          >
            <Phone className="w-3 h-3 text-emerald-700" /> Call
          </a>
          <Link
            href={`/drivers/${d.id}`}
            className="px-2.5 py-1 bg-primary-light hover:bg-primary text-primary hover:text-white text-[11px] font-bold rounded-md border border-primary/20 hover:border-primary transition-all flex items-center gap-1 whitespace-nowrap shadow-2xs"
            title="View Driver Profile"
          >
            <Eye className="w-3.5 h-3.5" /> Profile
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Single Unified Stats Card Band */}
      <div className="card-white p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 gap-4 sm:gap-0">
          <div className="sm:px-4 flex items-center justify-between">
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block">Ongoing Driver Trips</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">{activeDriverBookings.length}</span>
              <span className="text-[10px] text-emerald-600 font-bold block">Trips in progress</span>
            </div>
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700 shrink-0">
              <Car className="w-4 h-4" />
            </div>
          </div>

          <div className="sm:px-4 pt-3 sm:pt-0 flex items-center justify-between">
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block">Pending Dispatch</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">{pendingRequests.length}</span>
              <span className="text-[10px] text-amber-600 font-bold block">Searching driver</span>
            </div>
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>

          <div className="sm:px-4 pt-3 sm:pt-0 flex items-center justify-between">
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block">Drivers Duty Online</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">{onlineDrivers.length}</span>
              <span className="text-[10px] font-medium  text-emerald-600">Active duty fleet</span>
            </div>
            <div className="p-2 bg-primary-light rounded-lg text-primary shrink-0">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div className="sm:px-4 pt-3 sm:pt-0 flex items-center justify-between">
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block">Available Drivers</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">{availableDrivers.length}</span>
              <span className="text-[10px] text-sky-600 font-bold block">Ready for assignment</span>
            </div>
            <div className="p-2 bg-sky-100 rounded-lg text-sky-700 shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tab Bar - Segmented Control */}
      <div className="flex justify-center border-b border-slate-200/80 pb-3">
        <div className="inline-flex items-center p-1 bg-slate-100/90 border border-slate-200/80 rounded-xl shadow-2xs gap-1">
          <button
            onClick={() => setActiveTabState('driver-trips')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTabState === 'driver-trips'
              ? 'bg-primary text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
              }`}
          >
            <Car className="w-4 h-4" /> Ongoing Driver Trips ({activeDriverBookings.length})
          </button>

          <button
            onClick={() => setActiveTabState('online-drivers')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTabState === 'online-drivers'
              ? 'bg-primary text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
              }`}
          >
            <Activity className="w-4 h-4 text-emerald-400" /> Online Drivers ({onlineDrivers.length})
          </button>
        </div>
      </div>

      {/* Dynamic Tab Tables */}
      {activeTabState === 'driver-trips' && (
        <DataTable<DriverBooking>
          columns={driverTripColumns}
          data={activeDriverBookings}
          keyExtractor={(b) => b.id}
          pageSize={8}
          searchPlaceholder="Search booking #, customer, driver, route..."
          searchFilterKeys={['bookingNumber', 'customerName', 'driverName', 'pickupLocation']}
          emptyMessage="No active driver trips currently in execution."
          headerActions={
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Filter className="w-3.5 h-3.5" /> Status Filter:
              <select
                value={driverStatusFilter}
                onChange={(e) => setDriverStatusFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="All">All Live Statuses</option>
                <option value="Service Started">Service Started</option>
                <option value="Driver Arriving">Driver Arriving</option>
                <option value="Searching Driver">Searching Driver</option>
              </select>
            </div>
          }
        />
      )}

      {activeTabState === 'online-drivers' && (
        <DataTable<Driver>
          columns={onlineDriverColumns}
          data={onlineDrivers}
          keyExtractor={(d) => d.id}
          pageSize={8}
          searchPlaceholder="Search driver name, phone, location..."
          searchFilterKeys={['name', 'phone', 'currentLocation']}
          emptyMessage="No drivers currently online on duty."
        />
      )}
    </div>
  );
}
