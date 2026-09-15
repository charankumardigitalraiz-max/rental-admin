'use client';

import React, { useState } from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import { Booking } from '@/types';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { CalendarCheck, Plus, MapPin } from 'lucide-react';

export default function BookingsView() {
  const { bookings, cars, updateBookingStatus, addBooking } = useRentalStore();
  const [activeTabStatus, setActiveTabStatus] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Booking Form State
  const [carId, setCarId] = useState(cars[0]?.id || 'car-1');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [startDate, setStartDate] = useState('2026-09-20');
  const [endDate, setEndDate] = useState('2026-09-24');

  const filteredBookings = bookings.filter(
    (b) => activeTabStatus === 'All' || b.status === activeTabStatus
  );

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCar = cars.find((c) => c.id === carId) || cars[0];
    const totalDays = 4;
    const dailyRate = selectedCar.dailyRate;
    const totalAmount = dailyRate * totalDays + 2000;

    addBooking({
      carId: selectedCar.id,
      carName: selectedCar.name,
      carImage: selectedCar.image,
      customerName,
      customerEmail,
      customerPhone,
      startDate,
      endDate,
      totalDays,
      dailyRate,
      securityDeposit: 5000,
      totalAmount,
      status: 'Pending',
      paymentStatus: 'Pending',
      pickupLocation: 'Bangalore Central Hub',
      dropoffLocation: 'Bangalore Central Hub',
    });

    setIsModalOpen(false);
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
  };

  const bookingColumns: Column<Booking>[] = [
    {
      key: 'bookingNumber',
      header: 'Order Number',
      render: (b) => <span className="font-bold text-slate-900">{b.bookingNumber}</span>,
    },
    {
      key: 'carName',
      header: 'Vehicle',
      render: (b) => (
        <div className="flex items-center gap-2.5">
          <img
            src={b.carImage}
            alt={b.carName}
            className="w-10 h-7 rounded object-cover border border-slate-200"
          />
          <span className="font-semibold text-slate-800">{b.carName}</span>
        </div>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer Details',
      render: (b) => (
        <div>
          <div className="font-semibold text-slate-900">{b.customerName}</div>
          <div className="text-[10px] text-slate-400">{b.customerEmail}</div>
        </div>
      ),
    },
    {
      key: 'startDate',
      header: 'Trip Period',
      render: (b) => (
        <div className="text-slate-700">
          <div className="font-medium">{b.startDate} → {b.endDate}</div>
          <div className="text-[10px] text-slate-400">{b.totalDays} days</div>
        </div>
      ),
    },
    {
      key: 'pickupLocation',
      header: 'Locations',
      render: (b) => (
        <div className="flex items-center gap-1 text-[11px] text-slate-600">
          <MapPin className="w-3 h-3 text-slate-400" /> {b.pickupLocation}
        </div>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Total Cost',
      render: (b) => (
        <span className="font-bold text-slate-900">₹{b.totalAmount.toLocaleString('en-IN')}</span>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (b) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            b.paymentStatus === 'Paid'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {b.paymentStatus}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Booking Status',
      render: (b) => (
        <span
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
            b.status === 'Active'
              ? 'bg-emerald-600 text-white'
              : b.status === 'Pending'
              ? 'bg-amber-500 text-white'
              : b.status === 'Completed'
              ? 'bg-blue-600 text-white'
              : 'bg-rose-500 text-white'
          }`}
        >
          {b.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (b) => (
        <div className="flex items-center justify-end gap-1.5">
          {b.status === 'Pending' && (
            <button
              onClick={() => updateBookingStatus(b.id, 'Active', 'Paid')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2 py-1 rounded"
            >
              Approve
            </button>
          )}
          {b.status === 'Active' && (
            <button
              onClick={() => updateBookingStatus(b.id, 'Completed')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-2 py-1 rounded"
            >
              Complete
            </button>
          )}
          {b.status !== 'Cancelled' && b.status !== 'Completed' && (
            <button
              onClick={() => updateBookingStatus(b.id, 'Cancelled')}
              className="text-rose-500 hover:text-rose-700 font-medium text-[10px] underline"
            >
              Cancel
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Controls & Filter Tabs */}
      <div className="card-white p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-slate-100/80 rounded-lg">
          {['All', 'Active', 'Pending', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setActiveTabStatus(st)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTabStatus === st
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Create Booking Order
        </button>
      </div>

      <DataTable
        columns={bookingColumns}
        data={filteredBookings}
        keyExtractor={(b) => b.id}
        pageSize={4}
        searchPlaceholder="Search order number, customer name, vehicle..."
        searchFilterKeys={['bookingNumber', 'carName', 'customerName', 'customerEmail']}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Car Rental Order"
        subtitle="Assign vehicle to driver, select trip duration & rate"
        icon={CalendarCheck}
        maxWidth="md"
      >
        <form onSubmit={handleCreateBooking} className="space-y-3">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Select Vehicle</label>
            <select
              value={carId}
              onChange={(e) => setCarId(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:outline-none"
            >
              {cars.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — ₹{c.dailyRate}/day
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Customer Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Customer Email</label>
              <input
                type="email"
                required
                placeholder="rahul@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Phone Number</label>
              <input
                type="tel"
                required
                placeholder="+91 98765 00000"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold shadow-xs">
              Create Booking
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
