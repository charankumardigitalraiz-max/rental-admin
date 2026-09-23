'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRentalStore } from '@/store/useRentalStore';
import {
  ArrowLeft,
  Car,
  User,
  Phone,
  Shield,
  ShieldCheck,
  CheckCircle,
  Lock,
  Calendar,
  Fuel,
  Sliders,
  FileText,
  Image as ImageIcon,
  AlertTriangle,
} from 'lucide-react';

interface CustomerVehicleDetailsViewProps {
  vehicleId?: string;
}

export default function CustomerVehicleDetailsView({ vehicleId }: CustomerVehicleDetailsViewProps = {}) {
  const router = useRouter();
  const {
    customerVehicles,
    selectedVehicleId,
    toggleVehicleAuthorization,
    driverBookings,
    setSelectedCustomerId,
    setActiveTab,
  } = useRentalStore();

  const targetId = vehicleId || selectedVehicleId;
  const vehicle = customerVehicles.find((v) => v.id === targetId) || customerVehicles[0];

  const [activeImage, setActiveImage] = useState<string>(
    vehicle?.vehicleImages?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
  );

  if (!vehicle) {
    return (
      <div className="card-white p-8 text-center text-slate-500">
        Vehicle record not found.{' '}
        <button onClick={() => router.back()} className="text-primary font-bold underline">
          Back to Directory
        </button>
      </div>
    );
  }

  // Related trips for this vehicle
  const relatedTrips = driverBookings.filter(
    (b) => b.vehicleInfo?.plateNumber === vehicle.regNumber || b.customerName === vehicle.customerName
  );

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Navigation & Header Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-2 rounded-lg shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Vehicles
        </button>

        <div className="flex items-center gap-2">
          <span className="font-mono font-extrabold text-sm text-slate-800 bg-slate-100 border border-slate-200 px-3 py-1 rounded-md">
            {vehicle.regNumber}
          </span>
          <button
            onClick={() => toggleVehicleAuthorization(vehicle.id)}
            className={`px-3 py-1 rounded-md text-xs font-bold border transition-colors inline-flex items-center gap-1 ${vehicle.authorized
              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
          >
            {vehicle.authorized ? <Lock className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
            {vehicle.authorized ? 'Revoke Authorization' : 'Authorize Driver'}
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Image Gallery & Inspection Photos (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Gallery Card */}
          <div className="card-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" /> Vehicle Exterior & Interior Photos
              </h3>
              <span className="text-[10px] font-bold uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                {vehicle.vehicleImages?.length || 1} Registered Photos
              </span>
            </div>

            {/* Featured Photo View */}
            <div className="relative h-72 sm:h-80 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
              <img
                src={activeImage}
                alt={vehicle.model}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-md text-xs font-bold">
                {vehicle.make} {vehicle.model} ({vehicle.year})
              </div>
            </div>

            {/* Thumbnails Row */}
            <div className="grid grid-cols-4 gap-3">
              {(vehicle.vehicleImages || [activeImage]).map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${activeImage === imgUrl ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200 hover:border-slate-400'
                    }`}
                >
                  <img src={imgUrl} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Registration Certificate (RC) & Legal Documents Card */}
          <div className="card-white p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Registration Certificate (RC) & Insurance Document
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* RC Card */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[10.5px] font-bold uppercase text-slate-500 block">Registration Certificate (RC)</span>
                <div className="font-mono font-bold text-slate-900 text-sm">{vehicle.rcNumber || 'RC-RECORD-VERIFIED'}</div>
                <div className="h-32 rounded-lg overflow-hidden border border-slate-200 bg-slate-200">
                  <img
                    src={vehicle.rcImage || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80'}
                    alt="RC Document"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Insurance Policy Card */}
              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
                <span className="text-[10.5px] font-bold uppercase text-emerald-800 block flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-700" /> Insurance Policy Info
                </span>
                <div className="space-y-1 text-slate-800">
                  <div className="font-bold text-sm text-slate-900">{vehicle.insuranceProvider}</div>
                  <div className="font-mono text-slate-600">Policy #: {vehicle.policyNumber}</div>
                  <div className="font-bold text-emerald-700 pt-1">Expiry Date: {vehicle.insuranceExpiry}</div>
                </div>
                <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${vehicle.status === 'Expired Insurance' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                  {vehicle.status === 'Expired Insurance' ? 'Insurance Expired • Needs Upload' : 'Insurance Valid ✓'}
                </span>
              </div>
            </div>
          </div>

          {/* Related Booking Trips */}
          <div className="card-white p-5 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> Trip Dispatch History with this Vehicle
            </h3>
            {relatedTrips.length > 0 ? (
              <div className="divide-y divide-slate-100 text-xs">
                {relatedTrips.map((b) => (
                  <div key={b.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-primary">{b.bookingNumber}</span>
                      <span className="text-slate-500 ml-2">{b.bookingDate} • {b.bookingType}</span>
                    </div>
                    <span className="font-bold text-slate-800">Driver: {b.driverName || 'Unassigned'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-2">No recent trip records for this vehicle registration.</p>
            )}
          </div>
        </div>

        {/* Right Column: Owner Profile & Technical Specs (1 col) */}
        <div className="space-y-6">
          {/* Owner Profile Card */}
          <div className="card-white p-5 space-y-4">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-primary" /> Customer Owner Details
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Owner Name</span>
                <span className="font-bold text-slate-900 text-sm block">{vehicle.customerName}</span>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Contact Phone</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-primary" /> {vehicle.customerPhone}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <Link
                  href={`/admin/customers/${vehicle.customerId}`}
                  onClick={() => {
                    setSelectedCustomerId(vehicle.customerId);
                    setActiveTab('customer-details');
                  }}
                  className="w-full py-2 bg-primary text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <User className="w-3.5 h-3.5" /> View Full Customer Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Technical Specifications Card */}
          <div className="card-white p-5 space-y-4">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Sliders className="w-4 h-4 text-primary" /> Vehicle Specifications
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Make & Brand:</span>
                <span className="font-bold text-slate-900">{vehicle.make}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Model Name:</span>
                <span className="font-bold text-slate-900">{vehicle.model}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Manufacture Year:</span>
                <span className="font-bold text-slate-900">{vehicle.year}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Transmission:</span>
                <span className="font-extrabold text-primary">{vehicle.transmission}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Fuel Engine Type:</span>
                <span className="font-bold text-slate-900">{vehicle.fuelType}</span>
              </div>
            </div>
          </div>

          {/* Authorization Status Badge Card */}
          <div className="card-white p-5 space-y-3 bg-slate-900 text-white">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="font-bold text-black text-sm">Driver Authorization Status</h4>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              {vehicle.authorized
                ? 'Owner has digitally authorized verified platform drivers to operate this vehicle.'
                : 'Authorization is currently revoked. Drivers will not be assigned to this car.'}
            </p>
            <button
              onClick={() => toggleVehicleAuthorization(vehicle.id)}
              className={`w-full py-2 rounded-lg font-bold text-xs transition-colors mt-2 ${vehicle.authorized
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
            >
              {vehicle.authorized ? 'Revoke Authorization' : 'Authorize Driver Access'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
