'use client';

import React, { useState } from 'react';
import { useRentalStore } from '@/store/useRentalStore';
import { DriverBooking as Booking } from '@/types';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import {
  CalendarCheck,
  Plus,
  MapPin,
  ShieldCheck,
  FileText,
  UserCheck,
  CreditCard,
  Phone,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';

export default function BookingsView() {
  const { bookings, cars, updateBookingStatus, addBooking } = useRentalStore();
  const [activeTabStatus, setActiveTabStatus] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKycBooking, setSelectedKycBooking] = useState<Booking | null>(null);

  // Form State for Comprehensive Booking Order
  const [carId, setCarId] = useState(cars[0]?.id || 'car-1');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [driverLicenseNumber, setDriverLicenseNumber] = useState('');
  const [licenseExpiryDate, setLicenseExpiryDate] = useState('2028-12-31');
  const [driverLicenseImage, setDriverLicenseImage] = useState(
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
  );
  const [idProofType, setIdProofType] = useState('Aadhaar Card');
  const [idProofImage, setIdProofImage] = useState(
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80'
  );
  const [emergencyContact, setEmergencyContact] = useState('');

  const [startDate, setStartDate] = useState('2026-09-20');
  const [endDate, setEndDate] = useState('2026-09-24');
  const [pickupLocation, setPickupLocation] = useState('Bangalore Airport Terminal 1');
  const [dropoffLocation, setDropoffLocation] = useState('Indiranagar Hub');
  const [securityDeposit, setSecurityDeposit] = useState(5000);

  const filteredBookings = bookings.filter(
    (b) => activeTabStatus === 'All' || b.status === activeTabStatus
  );

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCar = cars.find((c: { id: string; dailyRate: number }) => c.id === carId) || cars[0];
    const totalDays = 4;
    const dailyRate = selectedCar.dailyRate;
    const totalAmount = dailyRate * totalDays + securityDeposit;

    addBooking({
      carId: selectedCar.id,
      carName: selectedCar.name,
      carImage: selectedCar.image,
      customerName,
      customerEmail,
      customerPhone,
      aadhaarNumber: aadhaarNumber || '5421 8901 2345',
      driverLicenseNumber: driverLicenseNumber || 'KA-01-2022-098124',
      licenseExpiryDate,
      driverLicenseImage: driverLicenseImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      idProofType,
      idProofImage: idProofImage || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
      emergencyContact: emergencyContact || 'Ramesh (Father) +91 98450 99887',
      startDate,
      endDate,
      totalDays,
      dailyRate,
      securityDeposit,
      totalAmount,
      status: 'Pending',
      paymentStatus: 'Pending',
      pickupLocation,
      dropoffLocation,
    });

    setIsModalOpen(false);
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setAadhaarNumber('');
    setDriverLicenseNumber('');
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
            src={b.carImage || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'}
            alt={b.carName || b.vehicleInfo?.model || 'Vehicle'}
            className="w-10 h-7 rounded object-cover border border-slate-200"
          />
          <span className="font-semibold text-slate-800">{b.carName || b.vehicleInfo?.model || 'Vehicle'}</span>
        </div>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer & KYC',
      render: (b) => (
        <div>
          <div className="font-semibold text-slate-900">{b.customerName}</div>
          <div className="text-[10px] text-slate-400">{b.customerPhone}</div>
          <button
            onClick={() => setSelectedKycBooking(b)}
            className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:text-primary-hover mt-0.5"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-600" /> View KYC Docs
          </button>
        </div>
      ),
    },
    {
      key: 'startDate',
      header: 'Trip Period',
      render: (b) => (
        <div className="text-slate-700">
          <div className="font-medium">{b.startDate || b.bookingDate} → {b.endDate || b.bookingDate}</div>
          <div className="text-[10px] text-slate-400">{b.totalDays || Math.ceil((b.durationHours || 24) / 24)} days</div>
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
        <span className="font-bold text-slate-900">
          ₹{(b.totalAmount || b.pricing?.totalCustomerAmount || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (b) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            (b.paymentStatus || 'Paid') === 'Paid'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {b.paymentStatus || 'Paid'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Booking Status',
      render: (b) => (
        <span
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
            b.status === 'Active' || b.status === 'Service Started' || b.status === 'Driver Assigned'
              ? 'bg-emerald-600 text-white'
              : b.status === 'Pending' || b.status === 'Searching Driver'
              ? 'bg-amber-500 text-white'
              : b.status === 'Completed'
              ? 'bg-primary text-white'
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
              className="bg-primary hover:bg-primary-hover text-white text-[10px] font-bold px-2 py-1 rounded"
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
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTabStatus === st
                ? 'bg-white text-primary shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              {st}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Create Rental Order
        </button>
      </div>

      {/* Reusable DataTable with Built-in Search Bar */}
      <DataTable
        columns={bookingColumns}
        data={filteredBookings}
        keyExtractor={(b) => b.id}
        pageSize={4}
        searchPlaceholder="Search order number, customer name, vehicle, DL #..."
        searchFilterKeys={['bookingNumber', 'carName', 'customerName', 'customerEmail', 'driverLicenseNumber', 'aadhaarNumber']}
      />

      {/* 1. Comprehensive Car Rental Order Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Car Rental Booking & KYC Verification"
        subtitle="Collect mandatory driver license, Aadhaar card, emergency contacts, and rental duration"
        icon={CalendarCheck}
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateBooking} className="space-y-4">
          {/* Section 1: Vehicle & Trip Duration */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-primary" /> Vehicle & Rental Period
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-slate-600 text-xs font-semibold mb-1">Select Vehicle</label>
                <select
                  value={carId}
                  onChange={(e) => setCarId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md text-slate-800 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {cars.map((c: { id: string; name: string; dailyRate: number }) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (₹{c.dailyRate}/day)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md text-slate-800 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md text-slate-800 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1">Pickup Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bangalore Airport T1"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md text-slate-800 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1">Dropoff Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indiranagar Hub"
                  value={dropoffLocation}
                  onChange={(e) => setDropoffLocation(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md text-slate-800 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Driver Contact Details */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" /> Driver Personal Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1">Driver Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md text-slate-800 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="rahul@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md text-slate-800 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1">Mobile Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md text-slate-800 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Section 3: KYC Government Documents */}
          <div className="p-3.5 bg-primary-light/50 border border-primary/20 rounded-md space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Driver KYC Documents & Photos
              </span>
              <span className="text-[11px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded">
                Mandatory DL + Govt ID Photos
              </span>
            </h4>

            {/* Mandatory Driving License Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1">
                  Driving License Number (DL No.) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KA-01-2022-098124"
                  value={driverLicenseNumber}
                  onChange={(e) => setDriverLicenseNumber(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md text-slate-800 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1">
                  DL Expiry Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={licenseExpiryDate}
                  onChange={(e) => setLicenseExpiryDate(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md text-slate-800 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* Driving License Photo Attachment */}
            <div>
              <label className="block text-slate-600 text-xs font-semibold mb-1 flex items-center justify-between">
                <span>Upload Driving License Photo (Front/Back) <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-slate-400">JPG/PNG Photo URL</span>
              </label>
              <div className="flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-md">
                {driverLicenseImage ? (
                  <div className="relative w-16 h-10 rounded border border-slate-200 overflow-hidden bg-slate-100 shrink-0">
                    <img src={driverLicenseImage} alt="DL Document Photo" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-10 rounded border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center shrink-0">
                    <Upload className="w-4 h-4 text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <input
                    type="url"
                    required
                    placeholder="Enter Driving License photo URL"
                    value={driverLicenseImage}
                    onChange={(e) => setDriverLicenseImage(e.target.value)}
                    className="w-full text-xs text-slate-800 focus:outline-none bg-transparent"
                  />
                  <span className="text-[10px] text-emerald-600 font-medium block">✓ Mandatory Driving License photo attached</span>
                </div>
              </div>
            </div>

            {/* Selectable Secondary Govt ID Proof */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1">
                  Secondary Govt ID Proof Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={idProofType}
                  onChange={(e) => setIdProofType(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md text-slate-800 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                >
                  <option value="Aadhaar Card">Aadhaar Card (Primary Option)</option>
                  <option value="PAN Card">PAN Card</option>
                  <option value="Voter ID">Voter ID</option>
                  <option value="Passport">Passport</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1">
                  {idProofType} Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    idProofType === 'Aadhaar Card'
                      ? 'e.g. 5421 8901 2345 (12 Digits)'
                      : idProofType === 'PAN Card'
                      ? 'e.g. ABCDE1234F'
                      : idProofType === 'Voter ID'
                      ? 'e.g. WXZ1234567'
                      : 'e.g. A1234567'
                  }
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md text-slate-800 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                />
              </div>
            </div>

            {/* Secondary ID Document Photo Attachment */}
            <div>
              <label className="block text-slate-600 text-xs font-semibold mb-1 flex items-center justify-between">
                <span>Upload {idProofType} Document Photo <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-slate-400">JPG/PNG Photo URL</span>
              </label>
              <div className="flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-md">
                {idProofImage ? (
                  <div className="relative w-16 h-10 rounded border border-slate-200 overflow-hidden bg-slate-100 shrink-0">
                    <img src={idProofImage} alt={`${idProofType} Document Photo`} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-10 rounded border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center shrink-0">
                    <Upload className="w-4 h-4 text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <input
                    type="url"
                    required
                    placeholder={`Enter ${idProofType} document photo URL`}
                    value={idProofImage}
                    onChange={(e) => setIdProofImage(e.target.value)}
                    className="w-full text-xs text-slate-800 focus:outline-none bg-transparent"
                  />
                  <span className="text-[10px] text-emerald-600 font-medium block">✓ {idProofType} document photo attached</span>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <label className="block text-slate-600 text-xs font-semibold mb-1">
                Emergency Contact Person & Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh (Father) +91 98450 00000"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-md text-slate-800 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Section 4: Refundable Security Deposit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-md">
            <div>
              <label className="block text-slate-600 text-xs font-semibold mb-1">Refundable Security Deposit (₹)</label>
              <input
                type="number"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                className="w-full p-2 border border-slate-200 rounded-md text-slate-800 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold"
              />
            </div>
            <div className="flex flex-col justify-end text-right">
              <span className="text-[11px] text-slate-500 font-medium">Total Booking Estimate</span>
              <span className="text-lg font-bold text-primary">
                ₹{((cars.find((c: { id: string; dailyRate?: number }) => c.id === carId)?.dailyRate || 3000) * 4 + securityDeposit).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="pt-3.5 flex justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-md text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button type="submit" className="px-4.5 py-2 bg-primary hover:bg-primary-hover text-white rounded-md font-semibold text-xs shadow-xs transition-colors">
              Verify KYC & Create Order
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. KYC Details Inspector Modal */}
      {selectedKycBooking && (
        <Modal
          isOpen={!!selectedKycBooking}
          onClose={() => setSelectedKycBooking(null)}
          title={`Driver KYC Documents: ${selectedKycBooking.customerName}`}
          subtitle={`Order #${selectedKycBooking.bookingNumber} • Vehicle: ${selectedKycBooking.carName}`}
          icon={ShieldCheck}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-md space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Driver Verification Status
                </span>
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  KYC VERIFIED
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                <div>
                  <span className="text-slate-500 text-[11px] font-medium block mb-0.5">Driving License (DL No.) *</span>
                  <span className="font-mono font-bold text-slate-900 text-xs bg-white px-2 py-1 rounded border border-emerald-200 block">
                    {selectedKycBooking.driverLicenseNumber || 'KA-01-2022-098234'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] font-medium block mb-0.5">License Expiry Date</span>
                  <span className="font-semibold text-slate-800 text-xs bg-white px-2 py-1 rounded border border-emerald-200 block">
                    {selectedKycBooking.licenseExpiryDate || '2028-12-31'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] font-medium block mb-0.5">
                    {selectedKycBooking.idProofType || 'Aadhaar Card'} Number
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-xs bg-white px-2 py-1 rounded border border-emerald-200 block">
                    {selectedKycBooking.aadhaarNumber || '5421 8901 2345'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] font-medium block mb-0.5">Emergency Contact</span>
                  <span className="font-semibold text-slate-800 text-xs bg-white px-2 py-1 rounded border border-emerald-200 block truncate">
                    {selectedKycBooking.emergencyContact || 'Ramesh +91 98450 11223'}
                  </span>
                </div>
              </div>
            </div>

            {/* Document Photo Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-md p-3 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-primary" /> Driving License Photo
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Mandatory
                  </span>
                </div>
                <div className="h-36 rounded border border-slate-200 bg-white overflow-hidden flex items-center justify-center">
                  <img
                    src={
                      selectedKycBooking.driverLicenseImage ||
                      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
                    }
                    alt="Driving License Document"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>

              <div className="border border-slate-200 rounded-md p-3 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-primary" /> {selectedKycBooking.idProofType || 'Aadhaar Card'} Photo
                  </span>
                  <span className="text-[10px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded border border-primary/20">
                    Govt ID Proof
                  </span>
                </div>
                <div className="h-36 rounded border border-slate-200 bg-white overflow-hidden flex items-center justify-center">
                  <img
                    src={
                      selectedKycBooking.idProofImage ||
                      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80'
                    }
                    alt="Secondary Govt ID Document"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedKycBooking(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-semibold text-xs transition-colors"
              >
                Close KYC Inspection
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

