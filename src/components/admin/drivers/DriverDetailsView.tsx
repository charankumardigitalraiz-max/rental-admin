'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useRentalStore } from '@/store/useRentalStore';
import { useDriverStore } from '@/store/useDriverStore';
import Link from 'next/link';
import Modal from '@/components/ui/Modal';
import DataTable, { Column } from '@/components/ui/DataTable';
import {
  ArrowLeft,
  User,
  ShieldCheck,
  Award,
  DollarSign,
  Star,
  Phone,
  Mail,
  MapPin,
  CalendarCheck,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  ZoomIn,
  Car,
  CreditCard,
  Ban,
  Check,
  Landmark,
  Copy,
} from 'lucide-react';

interface DriverDetailsViewProps {
  driverId?: string;
}

export default function DriverDetailsView({ driverId }: DriverDetailsViewProps = {}) {
  const router = useRouter();
  const { selectedDriverId, driverBookings: fallbackBookings } = useRentalStore();
  const {
    currentDriver: driver,
    driverStats,
    driverBookings,
    bookingsPagination,
    isLoading,
    isBookingsLoading,
    tripFilter,
    setTripFilter,
    fetchDriverById,
    fetchDriverBookings,
    updateDriverStatus,
  } = useDriverStore();

  const [selectedDocImage, setSelectedDocImage] = useState<{ title: string; url: string } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [tripSearchQuery, setTripSearchQuery] = useState('');
  const [debouncedTripSearch, setDebouncedTripSearch] = useState('');
  const isInitialSearchMount = useRef(true);

  const copyToClipboard = (text: string, fieldKey: string) => {
    if (!text || text === 'Not provided') return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const activeDriverId = driverId || selectedDriverId;

  // Debounce driver trips search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTripSearch(tripSearchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [tripSearchQuery]);

  // Initial driver profile fetch (only runs when activeDriverId changes)
  useEffect(() => {
    if (activeDriverId) {
      fetchDriverById(activeDriverId, {
        tripFilter: 'all',
        page: 1,
        limit: 5,
      });
    }
  }, [activeDriverId, fetchDriverById]);

  // Trip search effect: queries bookings only without triggering full-page reload
  useEffect(() => {
    if (isInitialSearchMount.current) {
      isInitialSearchMount.current = false;
      return;
    }
    if (activeDriverId) {
      fetchDriverBookings(activeDriverId, {
        tripFilter,
        page: 1,
        limit: bookingsPagination?.limit || 5,
        search: debouncedTripSearch.trim() || undefined,
      });
    }
  }, [debouncedTripSearch]);

  const handleTripFilterChange = (newFilter: 'all' | 'completed' | 'active' | 'cancelled') => {
    setTripFilter(newFilter);
    if (activeDriverId) {
      fetchDriverBookings(activeDriverId, {
        tripFilter: newFilter,
        page: 1,
        limit: bookingsPagination?.limit || 5,
        search: debouncedTripSearch.trim() || undefined,
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (activeDriverId) {
      fetchDriverBookings(activeDriverId, {
        tripFilter,
        page: newPage,
        limit: bookingsPagination?.limit || 5,
        search: debouncedTripSearch.trim() || undefined,
      });
    }
  };

  const handlePageSizeChange = (newLimit: number) => {
    if (activeDriverId) {
      fetchDriverBookings(activeDriverId, {
        tripFilter,
        page: 1,
        limit: newLimit,
        search: debouncedTripSearch.trim() || undefined,
      });
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (driver?.id) {
      await updateDriverStatus(driver.id, newStatus);
    }
  };

  const tripColumns: Column<any>[] = [
    {
      key: 'bookingNumber',
      header: 'Booking Ref',
      render: (trip) => (
        <span className="font-mono font-bold text-slate-900">{trip.bookingNumber}</span>
      ),
    },
    {
      key: 'bookingDate',
      header: 'Date & Time',
      render: (trip) => (
        <div className="text-slate-600 text-[11px]">
          <div>{trip.bookingDate}</div>
          <div className="text-[10px] text-slate-400 font-mono">{trip.bookingTime}</div>
        </div>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (trip) => (
        <div>
          <span className="font-bold text-slate-900 block">{trip.customerName}</span>
          <span className="text-[10px] text-slate-400">{trip.customerPhone}</span>
        </div>
      ),
    },
    {
      key: 'bookingType',
      header: 'Type / Duration',
      render: (trip) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          {trip.bookingType} ({trip.durationHours}h)
        </span>
      ),
    },
    {
      key: 'vehicleInfo',
      header: 'Customer Vehicle',
      render: (trip) => (
        <div className="text-slate-700">
          <span className="font-semibold block">{trip.vehicleInfo?.model || 'Vehicle'}</span>
          <span className="text-[10px] text-slate-400 font-mono">{trip.vehicleInfo?.plateNumber || '-'}</span>
        </div>
      ),
    },
    {
      key: 'driverEarnings',
      header: 'Driver Earnings',
      render: (trip) => (
        <span className="font-bold text-emerald-700">
          ₹{(trip.pricing?.driverEarnings ?? trip.driverEarnings ?? 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trip Status',
      render: (trip) => {
        const isCompleted = trip.status === 'Completed';
        const isCancelled = trip.status === 'Cancelled';
        return (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${isCompleted
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : isCancelled
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-sky-50 text-sky-800 border border-sky-200'
              }`}
          >
            {trip.status}
          </span>
        );
      },
    },
  ];

  const filteredTrips = driverBookings && driverBookings.length > 0
    ? driverBookings
    : fallbackBookings.filter((b) => b.driverId === driver?.id);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-medium">Loading driver profile...</span>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="card-white p-8 text-center text-slate-500 space-y-2">
        <p className="font-semibold text-slate-800">Driver profile not found.</p>
        <button onClick={() => router.back()} className="text-primary font-bold underline text-xs cursor-pointer">
          Go back to Drivers list
        </button>
      </div>
    );
  }

  const completionRate =
    driver.totalBookings > 0 ? Math.round((driver.completedBookings / driver.totalBookings) * 100) : 100;

  const licenseNumber = driver.verification?.licenseNumber || driver.licenseNumber || 'Not provided';
  const licenseExpiry = driver.verification?.licenseExpiry || 'Not provided';
  const licenseImage = driver.verification?.licenseImage || driver.drivingLicense || '';

  const aadhaarNumber =
    driver.verification?.aadhaarNumber ||
    driver.aadhaarNumber ||
    (driver.verification?.idProofType === 'Aadhaar Card' ? driver.verification?.idProofNumber : '') ||
    '';
  const aadhaarFront =
    driver.verification?.aadhaarCardFront ||
    driver.aadhaarCardFront ||
    (driver.verification?.idProofType === 'Aadhaar Card' ? driver.verification?.idProofImage : '') ||
    '';
  const aadhaarBack =
    driver.verification?.aadhaarCardBack ||
    driver.aadhaarCardBack ||
    driver.verification?.idProofImageBack ||
    '';

  const panNumber =
    driver.verification?.pancardNumber ||
    driver.pancardNumber ||
    (driver.verification?.idProofType === 'PAN Card' ? driver.verification?.idProofNumber : '') ||
    '';
  const panImage =
    driver.verification?.pancard ||
    driver.pancard ||
    (driver.verification?.idProofType === 'PAN Card' ? driver.verification?.idProofImage : '') ||
    '';

  const passportId =
    driver.verification?.passportId ||
    driver.passportId ||
    (driver.verification?.idProofType === 'Passport' ? driver.verification?.idProofNumber : '') ||
    '';
  const passportImage =
    driver.verification?.passport ||
    driver.passport ||
    (driver.verification?.idProofType === 'Passport' ? driver.verification?.idProofImage : '') ||
    '';

  return (
    <div className="space-y-4 pb-10 max-w-7xl mx-auto">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => router.back()}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 bg-white border border-stone-200 px-3 py-1.5 rounded-lg shadow-xs w-fit cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded bg-stone-100 text-slate-700">
            ID: {driver.id}
          </span>
          <span
            className={`px-3 py-1 rounded text-xs font-bold ${driver.status === 'Approved'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : driver.status === 'Pending Approval'
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
          >
            {driver.status}
          </span>

          {driver.status === 'Pending Approval' && (
            <>
              <button
                onClick={() => handleStatusUpdate('Approved')}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded shadow-xs flex items-center gap-1 transition-all"
              >
                <Check className="w-3.5 h-3.5" /> Approve Driver
              </button>
              <button
                onClick={() => handleStatusUpdate('Rejected')}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded shadow-xs flex items-center gap-1 transition-all"
              >
                <Ban className="w-3.5 h-3.5" /> Reject Driver
              </button>
            </>
          )}

          {driver.status === 'Approved' && (
            <button
              onClick={() => handleStatusUpdate('Suspended')}
              className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded flex items-center gap-1 transition-all"
            >
              <Ban className="w-3.5 h-3.5" /> Suspend
            </button>
          )}

          {driver.status === 'Suspended' && (
            <button
              onClick={() => handleStatusUpdate('Approved')}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded shadow-xs flex items-center gap-1 transition-all"
            >
              <Check className="w-3.5 h-3.5" /> Reactivate
            </button>
          )}
        </div>
      </div>

      {/* Driver Personal & Contact Banner */}
      <div className="card-white p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 bg-gradient-to-r from-emerald-50/40 via-white to-stone-50">
        <div className="flex items-center gap-5">
          <div className="relative">
            <img
              src={driver.avatar}
              alt={driver.name}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-emerald-100 shadow-sm"
            />
            <span
              className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${driver.dutyStatus === 'Online' ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              title={`Duty: ${driver.dutyStatus}`}
            ></span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{driver.name}</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                {driver.dutyStatus} ({driver.availability})
              </span>
            </div>
            <div className="text-xs text-slate-600 flex flex-wrap items-center gap-4 pt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Phone className="w-3.5 h-3.5 text-emerald-600" /> {driver.phone}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Mail className="w-3.5 h-3.5 text-sky-600" /> {driver.email}
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-amber-600" /> {driver.currentLocation}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs w-full md:w-auto">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center flex-1 md:flex-initial min-w-[100px]">
            <span className="text-[10px] text-amber-800 font-bold block uppercase">Driver Rating</span>
            <span className="text-lg font-bold text-amber-900">⭐ {driver.rating > 0 ? driver.rating : 'New'}</span>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center flex-1 md:flex-initial min-w-[100px]">
            <span className="text-[10px] text-emerald-800 font-bold block uppercase">Completion Rate</span>
            <span className="text-lg font-bold text-emerald-900">{completionRate}%</span>
          </div>
        </div>
      </div>

      {/* Single Unified Stats Card Band */}
      <div className="card-white p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 gap-4 sm:gap-0">
          <div className="sm:px-4 space-y-1">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block">Total Bookings Received</span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">{driver.totalBookings}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Lifetime assigned orders</p>
          </div>

          <div className="sm:px-4 space-y-1 pt-3 sm:pt-0">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block">Successfully Completed</span>
            <h3 className="text-xl font-bold text-emerald-600 mt-1">{driver.completedBookings}</h3>
            <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Finished driver trips</p>
          </div>

          <div className="sm:px-4 space-y-1 pt-3 sm:pt-0">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block">Cancelled / Missed</span>
            <h3 className="text-xl font-bold text-rose-600 mt-1">{driver.cancelledBookings}</h3>
            <p className="text-[10px] text-rose-600 font-medium mt-0.5">Cancelled by customer or driver</p>
          </div>

          <div className="sm:px-4 space-y-1 pt-3 sm:pt-0">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block">Net Earned Revenue</span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">₹{driver.earnings.total.toLocaleString('en-IN')}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">₹{driver.earnings.pending} pending payout</p>
          </div>
        </div>
      </div>

      {/* SECTION 1: Identity & KYC Verification Documents */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" /> Identity & Verification Documents
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">
            Official government credentials & photo verification
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Driving License Details */}
          <div className="card-white p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="w-4.5 h-4.5 text-emerald-600" /> Driving License
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    driver.verification?.status === 'Verified' || driver.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {driver.verification?.status || 'Pending'}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-lg space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">License #:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold font-mono text-slate-900">{licenseNumber}</span>
                      {licenseNumber && licenseNumber !== 'Not provided' && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(licenseNumber, 'license')}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                          title="Copy License Number"
                        >
                          {copiedField === 'license' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Expiry Date:</span>
                    <span className="font-bold text-slate-800">{licenseExpiry}</span>
                  </div>
                </div>

                {/* DL Image Thumbnail */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">License Photo:</span>
                  {licenseImage ? (
                    <div
                      onClick={() =>
                        setSelectedDocImage({
                          title: `Driving License - ${licenseNumber}`,
                          url: licenseImage,
                        })
                      }
                      className="relative h-28 rounded-lg border border-stone-300 overflow-hidden bg-stone-100 cursor-pointer group shadow-2xs"
                    >
                      <img
                        src={licenseImage}
                        alt="Driving License"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                        <ZoomIn className="w-4 h-4" /> Preview
                      </div>
                    </div>
                  ) : (
                    <div className="h-28 rounded-lg border border-dashed border-stone-200 bg-stone-50 flex items-center justify-center text-slate-400 text-xs">
                      No photo uploaded
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Aadhaar Card Details */}
          <div className="card-white p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <User className="w-4.5 h-4.5 text-sky-600" /> Aadhaar Card
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    aadhaarNumber || aadhaarFront
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-stone-100 text-stone-600 border border-stone-200'
                  }`}
                >
                  {aadhaarNumber || aadhaarFront ? 'Uploaded' : 'Not Uploaded'}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-lg space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Document:</span>
                    <span className="font-bold text-slate-900">Aadhaar Card</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Aadhaar #:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold font-mono text-slate-900">
                        {aadhaarNumber || 'Not provided'}
                      </span>
                      {aadhaarNumber && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(aadhaarNumber, 'aadhaar')}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                          title="Copy Aadhaar Number"
                        >
                          {copiedField === 'aadhaar' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Aadhaar Images: Front & Back */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Aadhaar Photos:</span>
                  {aadhaarFront || aadhaarBack ? (
                    <div className={`grid ${aadhaarFront && aadhaarBack ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
                      {aadhaarFront && (
                        <div
                          onClick={() =>
                            setSelectedDocImage({
                              title: `Aadhaar Card (Front) - ${aadhaarNumber || driver.name}`,
                              url: aadhaarFront,
                            })
                          }
                          className="relative h-28 rounded-lg border border-stone-300 overflow-hidden bg-stone-100 cursor-pointer group shadow-2xs"
                        >
                          <img
                            src={aadhaarFront}
                            alt="Aadhaar Front"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-[9px] text-white rounded font-medium">Front</span>
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                            <ZoomIn className="w-4 h-4" /> Preview
                          </div>
                        </div>
                      )}

                      {aadhaarBack && (
                        <div
                          onClick={() =>
                            setSelectedDocImage({
                              title: `Aadhaar Card (Back) - ${aadhaarNumber || driver.name}`,
                              url: aadhaarBack,
                            })
                          }
                          className="relative h-28 rounded-lg border border-stone-300 overflow-hidden bg-stone-100 cursor-pointer group shadow-2xs"
                        >
                          <img
                            src={aadhaarBack}
                            alt="Aadhaar Back"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-[9px] text-white rounded font-medium">Back</span>
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                            <ZoomIn className="w-4 h-4" /> Preview
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-28 rounded-lg border border-dashed border-stone-200 bg-stone-50 flex items-center justify-center text-slate-400 text-xs">
                      No Aadhaar photos uploaded
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: PAN Card Details */}
          <div className="card-white p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CreditCard className="w-4.5 h-4.5 text-blue-600" /> PAN Card
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    panNumber || panImage
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-stone-100 text-stone-600 border border-stone-200'
                  }`}
                >
                  {panNumber || panImage ? 'Uploaded' : 'Not Uploaded'}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-lg space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Document:</span>
                    <span className="font-bold text-slate-900">PAN Card</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">PAN #:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold font-mono text-slate-900 uppercase">
                        {panNumber || 'Not provided'}
                      </span>
                      {panNumber && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(panNumber, 'pan')}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                          title="Copy PAN Number"
                        >
                          {copiedField === 'pan' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* PAN Card Image Thumbnail */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">PAN Card Photo:</span>
                  {panImage ? (
                    <div
                      onClick={() =>
                        setSelectedDocImage({
                          title: `PAN Card - ${panNumber || driver.name}`,
                          url: panImage,
                        })
                      }
                      className="relative h-28 rounded-lg border border-stone-300 overflow-hidden bg-stone-100 cursor-pointer group shadow-2xs"
                    >
                      <img
                        src={panImage}
                        alt="PAN Card"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                        <ZoomIn className="w-4 h-4" /> Preview
                      </div>
                    </div>
                  ) : (
                    <div className="h-28 rounded-lg border border-dashed border-stone-200 bg-stone-50 flex items-center justify-center text-slate-400 text-xs">
                      No PAN photo uploaded
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Optional Card 4: Passport Details (if available) */}
          {(passportId || passportImage) && (
            <div className="card-white p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4.5 h-4.5 text-amber-600" /> Passport
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    Uploaded
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-lg space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Document:</span>
                      <span className="font-bold text-slate-900">Passport</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Passport #:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold font-mono text-slate-900 uppercase">
                          {passportId || 'Not provided'}
                        </span>
                        {passportId && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(passportId, 'passport')}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer"
                            title="Copy Passport Number"
                          >
                            {copiedField === 'passport' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {passportImage ? (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Passport Photo:</span>
                      <div
                        onClick={() =>
                          setSelectedDocImage({
                            title: `Passport - ${passportId || driver.name}`,
                            url: passportImage,
                          })
                        }
                        className="relative h-28 rounded-lg border border-stone-300 overflow-hidden bg-stone-100 cursor-pointer group shadow-2xs"
                      >
                        <img
                          src={passportImage}
                          alt="Passport"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                          <ZoomIn className="w-4 h-4" /> Preview
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: Banking & Subscription Passes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card: Bank Details & Payout */}
        <div className="card-white p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Landmark className="w-4.5 h-4.5 text-indigo-600" /> Bank & Payout
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {driver.bankDetails?.status || 'Active'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-stone-50 border border-stone-200/80 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Bank Name:</span>
                  <span className="font-bold text-slate-900">{driver.bankDetails?.bankName || 'HDFC Bank'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">A/C Holder:</span>
                  <span className="font-medium text-slate-800 truncate max-w-[200px]">{driver.bankDetails?.accountHolderName || driver.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Account #:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900">{driver.bankDetails?.accountNumber || '50100482910482'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (driver.bankDetails?.accountNumber) {
                          copyToClipboard(driver.bankDetails.accountNumber, 'acc');
                        }
                      }}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                      title="Copy Account Number"
                    >
                      {copiedField === 'acc' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">IFSC Code:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900 uppercase">{driver.bankDetails?.ifscCode || 'HDFC0001234'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (driver.bankDetails?.ifscCode) {
                          copyToClipboard(driver.bankDetails.ifscCode, 'ifsc');
                        }
                      }}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                      title="Copy IFSC"
                    >
                      {copiedField === 'ifsc' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">UPI ID:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-emerald-700 font-semibold">{driver.bankDetails?.upiId || `${driver.phone}@upi`}</span>
                    {driver.bankDetails?.upiId && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(driver.bankDetails.upiId, 'upi')}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="Copy UPI ID"
                      >
                        {copiedField === 'upi' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {driver.bankDetails?.passbookImage ? (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Passbook / Cheque:</span>
                  <div
                    onClick={() =>
                      setSelectedDocImage({
                        title: `Bank Passbook - ${driver.bankDetails?.bankName}`,
                        url: driver.bankDetails.passbookImage,
                      })
                    }
                    className="relative h-24 rounded-lg border border-stone-300 overflow-hidden bg-stone-100 cursor-pointer group shadow-2xs"
                  >
                    <img
                      src={driver.bankDetails.passbookImage}
                      alt="Bank Passbook"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                      <ZoomIn className="w-4 h-4" /> Preview
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-[11px] text-emerald-900 font-medium">Bank account linked for automatic weekly settlements</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card: Subscription Pass Status */}
        <div className="card-white p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Award className={`w-4.5 h-4.5 ${driver.subscription.status === 'Active'
                  ? 'text-emerald-500'
                  : driver.subscription.status === 'Expiring Soon'
                    ? 'text-amber-500'
                    : driver.subscription.status === 'Expired'
                      ? 'text-rose-500'
                      : 'text-slate-400'
                  }`} /> Subscription Pass Status
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${driver.subscription.status === 'Active'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : driver.subscription.status === 'Expiring Soon'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : driver.subscription.status === 'Expired'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
              >
                {driver.subscription.status}
              </span>
            </div>

            {driver.subscription.status !== 'None' ? (
              <div className="space-y-3 text-xs">
                <div className={`p-3.5 border rounded-lg space-y-2 ${driver.subscription.status === 'Active'
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : driver.subscription.status === 'Expiring Soon'
                    ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                    : driver.subscription.status === 'Expired'
                      ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm">{driver.subscription.planName}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Valid From: {driver.subscription.startDate}</span>
                    <span>Expires: {driver.subscription.expiryDate}</span>
                  </div>
                  <div className={`text-[11px] font-bold pt-1.5 border-t ${driver.subscription.status === 'Active'
                    ? 'text-emerald-800 border-emerald-200'
                    : driver.subscription.status === 'Expiring Soon'
                      ? 'text-amber-800 border-amber-200'
                      : driver.subscription.status === 'Expired'
                        ? 'text-rose-800 border-rose-200'
                        : 'text-slate-600 border-slate-200'
                    }`}>
                    {driver.subscription.status === 'Expired'
                      ? 'Pass Expired — Renewal Required'
                      : `Remaining: ${driver.subscription.daysRemaining} days validity`}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Local City Trips:</span>
                    <span className={`font-bold ${driver.subscription.localEligible ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {driver.subscription.localEligible ? 'Eligible ✓' : 'Blocked ✕'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Outstation Trips:</span>
                    <span className={`font-bold ${driver.subscription.outstationEligible ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {driver.subscription.outstationEligible ? 'Eligible ✓' : 'Blocked ✕'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-center space-y-2 text-xs">
                <p className="font-bold text-rose-800">No active subscription pass found.</p>
                <p className="text-[11px] text-rose-600">
                  Driver must purchase a pass to receive booking dispatch requests.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FULL WIDTH: Driver Orders & Trip History Table using Global DataTable */}
      <div className="space-y-3 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Car className="w-5 h-5 text-primary" /> Driver Orders & Trip History
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed ledger of all completed, in-progress, and cancelled customer bookings
            </p>
          </div>
        </div>

        <DataTable<any>
          columns={tripColumns}
          data={filteredTrips}
          keyExtractor={(trip) => trip.id || trip._id || trip.bookingNumber || String(Math.random())}
          pageSize={bookingsPagination?.limit || 5}
          pageSizeOptions={[5, 10, 20, 50]}
          isLoading={isBookingsLoading}
          emptyMessage="No trip records found for the selected filter option."
          searchPlaceholder="Search booking ref, customer, vehicle..."
          serverSearch={true}
          searchValue={tripSearchQuery}
          onSearchChange={(val) => {
            setTripSearchQuery(val);
          }}
          // headerActions={
          //   <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-lg border border-stone-200 text-xs">
          //     <button
          //       type="button"
          //       onClick={() => handleTripFilterChange('all')}
          //       className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${tripFilter === 'all'
          //           ? 'bg-primary text-white shadow-xs'
          //           : 'text-slate-600 hover:text-slate-900 hover:bg-stone-200/60'
          //         }`}
          //     >
          //       All ({bookingsPagination?.total ?? driver.totalBookings ?? filteredTrips.length})
          //     </button>
          //     <button
          //       type="button"
          //       onClick={() => handleTripFilterChange('completed')}
          //       className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${tripFilter === 'completed'
          //           ? 'bg-primary text-white shadow-xs'
          //           : 'text-slate-600 hover:text-slate-900 hover:bg-stone-200/60'
          //         }`}
          //     >
          //       Completed ({driver.completedBookings ?? 0})
          //     </button>
          //     <button
          //       type="button"
          //       onClick={() => handleTripFilterChange('active')}
          //       className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${tripFilter === 'active'
          //           ? 'bg-primary text-white shadow-xs'
          //           : 'text-slate-600 hover:text-slate-900 hover:bg-stone-200/60'
          //         }`}
          //     >
          //       Active ({driver.activeBookings ?? 0})
          //     </button>
          //     <button
          //       type="button"
          //       onClick={() => handleTripFilterChange('cancelled')}
          //       className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${tripFilter === 'cancelled'
          //           ? 'bg-primary text-white shadow-xs'
          //           : 'text-slate-600 hover:text-slate-900 hover:bg-stone-200/60'
          //         }`}
          //     >
          //       Cancelled ({driver.cancelledBookings ?? 0})
          //     </button>
          //   </div>
          // }
          serverPagination={
            bookingsPagination
              ? {
                currentPage: bookingsPagination.page,
                totalPages: bookingsPagination.totalPages,
                totalItems: bookingsPagination.total,
                onPageChange: (newPage) => handlePageChange(newPage),
                onPageSizeChange: (newLimit) => handlePageSizeChange(newLimit),
              }
              : undefined
          }
        />
      </div>

      {/* DOCUMENT IMAGE PREVIEW MODAL */}
      <Modal
        isOpen={!!selectedDocImage}
        onClose={() => setSelectedDocImage(null)}
        title={selectedDocImage?.title || 'Verification Document Preview'}
        subtitle="Full high-resolution document image verification"
        icon={ShieldCheck}
      >
        <div className="space-y-4 text-center">
          <div className="max-h-[70vh] overflow-hidden rounded-lg border border-stone-200 bg-stone-900 flex items-center justify-center p-2">
            <img
              src={selectedDocImage?.url}
              alt={selectedDocImage?.title}
              className="max-w-full max-h-[65vh] object-contain rounded"
            />
          </div>
          <button
            onClick={() => setSelectedDocImage(null)}
            className="px-5 py-2 bg-stone-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition-all"
          >
            Close Document Preview
          </button>
        </div>
      </Modal>
    </div>
  );
}
