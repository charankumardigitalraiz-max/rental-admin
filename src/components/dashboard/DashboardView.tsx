'use client';

import React from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import {
  IndianRupee,
  Car,
  CalendarCheck,
  TrendingUp,
  Clock,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Plus,
  ArrowRight,
  Zap,
} from 'lucide-react';

export default function DashboardView() {
  const { cars, bookings, customers, payments, setActiveTab, updateBookingStatus } = useRentalStore();

  const totalRevenue = payments
    .filter((p) => p.status === 'Success')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const activeRentalsCount = bookings.filter((b) => b.status === 'Active').length;
  const pendingCount = bookings.filter((b) => b.status === 'Pending').length;
  const totalCars = cars.length;
  const rentedCars = cars.filter((c) => c.status === 'Rented').length;
  const utilizationRate = Math.round((rentedCars / totalCars) * 100);

  return (
    <div className="space-y-6">
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Revenue */}
        <div className="card-white card-white-hover p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">₹{totalRevenue.toLocaleString('en-IN')}</h3>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="inline-flex items-center text-emerald-600 text-xs font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +14.8%
              </span>
              <span className="text-[11px] text-slate-400">vs last month</span>
            </div>
          </div>
        </div>

        {/* Stat 2: Active Rentals */}
        <div className="card-white card-white-hover p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Trips</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{activeRentalsCount} Cars</h3>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="inline-flex items-center text-blue-600 text-xs font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3 mr-0.5" /> On Road Now
              </span>
              <span className="text-[11px] text-slate-400">out of {totalCars} total</span>
            </div>
          </div>
        </div>

        {/* Stat 3: Fleet Utilization */}
        <div className="card-white card-white-hover p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fleet Utilization</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{utilizationRate}%</h3>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${utilizationRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Stat 4: Pending Bookings */}
        <div className="card-white card-white-hover p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Orders</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{pendingCount} Requests</h3>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[11px] text-amber-700 bg-amber-50 font-medium px-2 py-0.5 rounded">
                Action required
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section: Chart & Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Rental Activity Chart Preview */}
        <div className="lg:col-span-2 card-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Revenue & Booking Trends</h3>
              <p className="text-xs text-slate-500">Monthly breakdown for 2026</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Revenue (₹)
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Bookings
              </span>
            </div>
          </div>

          {/* Clean SVG Bar Chart */}
          <div className="h-56 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100">
            {[
              { month: 'Apr', rev: 45, book: 22 },
              { month: 'May', rev: 65, book: 35 },
              { month: 'Jun', rev: 80, book: 48 },
              { month: 'Jul', rev: 72, book: 40 },
              { month: 'Aug', rev: 95, book: 58 },
              { month: 'Sep', rev: 110, book: 72 },
            ].map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1.5 h-40">
                  <div
                    className="w-3.5 bg-blue-600 rounded-t-sm transition-all group-hover:bg-blue-700"
                    style={{ height: `${d.rev}%` }}
                    title={`₹${d.rev * 1000}`}
                  ></div>
                  <div
                    className="w-3.5 bg-emerald-500 rounded-t-sm transition-all group-hover:bg-emerald-600"
                    style={{ height: `${d.book}%` }}
                    title={`${d.book} bookings`}
                  ></div>
                </div>
                <span className="text-[11px] text-slate-500 font-medium mt-1">{d.month}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
            <span>Peak Month: September (₹1,10,000 revenue)</span>
            <button
              onClick={() => setActiveTab('analytics')}
              className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              Full Analytics Report <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Quick Fleet & Operation Shortcuts */}
        <div className="card-white p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Quick Fleet Overview</h3>
            <p className="text-xs text-slate-500 mb-4">Real-time status of all {totalCars} vehicles</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-900">Available Vehicles</span>
                </div>
                <span className="text-xs font-bold text-emerald-700">
                  {cars.filter((c) => c.status === 'Available').length}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-900">Currently Rented</span>
                </div>
                <span className="text-xs font-bold text-blue-700">
                  {cars.filter((c) => c.status === 'Rented').length}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-amber-50/70 border border-amber-100 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-900">Under Service</span>
                </div>
                <span className="text-xs font-bold text-amber-700">
                  {cars.filter((c) => c.status === 'Maintenance').length}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <button
              onClick={() => setActiveTab('products')}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add New Vehicle
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              View Booking Orders
            </button>
          </div>
        </div>
      </div>

      {/* Recent Booking Requests Table */}
      <div className="card-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Rental Orders</h3>
            <p className="text-xs text-slate-500">Latest customer booking activities and status approvals</p>
          </div>
          <button
            onClick={() => setActiveTab('bookings')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View All ({bookings.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-y border-slate-200">
              <tr>
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Vehicle Details</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Rental Dates</th>
                <th className="py-3 px-3">Total Amount</th>
                <th className="py-3 px-3">Booking Status</th>
                <th className="py-3 px-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.slice(0, 5).map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900">{booking.bookingNumber}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={booking.carImage}
                        alt={booking.carName}
                        className="w-9 h-7 rounded object-cover border border-slate-200"
                      />
                      <span className="font-medium text-slate-800">{booking.carName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-800">{booking.customerName}</div>
                    <div className="text-[10px] text-slate-400">{booking.customerPhone}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {booking.startDate} to {booking.endDate} ({booking.totalDays}d)
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    ₹{booking.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        booking.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : booking.status === 'Pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : booking.status === 'Completed'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {booking.status === 'Pending' ? (
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'Active', 'Paid')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold px-2.5 py-1 rounded transition-colors"
                      >
                        Approve
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveTab('bookings')}
                        className="text-slate-500 hover:text-slate-800 text-[11px] font-medium underline"
                      >
                        Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
