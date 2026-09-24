'use client';

import React, { useState, useEffect } from 'react';
import { Car, Clock, Navigation, Crown, MapPin, Calendar, CheckCircle2, ShieldCheck, X, Ticket, ArrowRight, Phone } from 'lucide-react';
import { vehicleTypes, pricingConfigAdmin } from '@/data/websiteData';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType?: string;
  initialData?: any;
}

export default function BookingModal({ isOpen, onClose, serviceType = 'local', initialData }: BookingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [category, setCategory] = useState(serviceType);
  const [pickup, setPickup] = useState(initialData?.pickup || 'Indiranagar 100ft Road, Bangalore');
  const [destination, setDestination] = useState(initialData?.destination || 'Koramangala Sony World Signal');
  const [bookingDate, setBookingDate] = useState('2026-09-17');
  const [bookingTime, setBookingTime] = useState('16:30');
  const [durationHours, setDurationHours] = useState(initialData?.durationHours || 4);
  const [vehicle, setVehicle] = useState(initialData?.vehicleType || 'Sedan');
  const [staffCount, setStaffCount] = useState(initialData?.requiredStaffCount || 4);

  // Customer Details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Generated Booking Ref
  const [generatedBookingId, setGeneratedBookingId] = useState('');

  useEffect(() => {
    if (serviceType) setCategory(serviceType);
    if (initialData) {
      if (initialData.pickup) setPickup(initialData.pickup);
      if (initialData.destination) setDestination(initialData.destination);
      if (initialData.durationHours) setDurationHours(initialData.durationHours);
      if (initialData.vehicleType) setVehicle(initialData.vehicleType);
      if (initialData.requiredStaffCount) setStaffCount(initialData.requiredStaffCount);
    }
  }, [serviceType, initialData]);

  if (!isOpen) return null;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      // Generate Booking ID
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const prefix = category === 'valet' ? 'VLT' : 'DRV';
      setGeneratedBookingId(`${prefix}-2026-${randomNum}`);
      setStep(3);
    }
  };

  const handleReset = () => {
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#023526] text-white rounded-3xl border border-[#c5a880]/40 max-w-xl w-full p-6 sm:p-8 relative custom-shadow text-left my-8">
        
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 text-slate-400 hover:text-white bg-black/30 p-2 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl gold-gradient-bg flex items-center justify-center text-[#012218] font-bold">
            {category === 'valet' ? <Crown className="w-5 h-5" /> : <Car className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              {category === 'local' && 'Book Hourly Acting Driver'}
              {category === 'outstation' && 'Book Outstation Highway Driver'}
              {category === 'valet' && 'Request Event Valet Management'}
            </h3>
            <p className="text-xs text-[#c5a880]">Step {step} of 3 - Instant Dispatch Confirmation</p>
          </div>
        </div>

        {/* Step 1: Trip & Vehicle Details */}
        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-4">
            {category !== 'valet' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Pickup Location</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#c5a880] absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white text-xs focus:outline-none focus:border-[#c5a880]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {category === 'outstation' ? 'Destination City' : 'Destination Address'}
                  </label>
                  <div className="relative">
                    <Navigation className="w-4 h-4 text-[#c5a880] absolute left-3 top-3" />
                    <input
                      type="text"
                      required={category === 'outstation'}
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white text-xs focus:outline-none focus:border-[#c5a880]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Booking Date</label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white text-xs focus:outline-none focus:border-[#c5a880]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Pickup Time</label>
                    <input
                      type="time"
                      required
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full px-3 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white text-xs focus:outline-none focus:border-[#c5a880]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Vehicle Category</label>
                    <select
                      value={vehicle}
                      onChange={(e) => setVehicle(e.target.value)}
                      className="w-full py-2.5 px-3 bg-black/40 border border-white/20 rounded-xl text-white text-xs focus:outline-none focus:border-[#c5a880]"
                    >
                      {vehicleTypes.map((v) => (
                        <option key={v.type} value={v.type}>
                          {v.type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Hours)</label>
                    <select
                      value={durationHours}
                      onChange={(e) => setDurationHours(parseInt(e.target.value))}
                      className="w-full py-2.5 px-3 bg-black/40 border border-white/20 rounded-xl text-white text-xs focus:outline-none focus:border-[#c5a880]"
                    >
                      <option value="2">2 Hours</option>
                      <option value="4">4 Hours</option>
                      <option value="6">6 Hours</option>
                      <option value="8">8 Hours</option>
                      <option value="12">12 Hours</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Event Venue & Address</label>
                  <input
                    type="text"
                    required
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="w-full px-3 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white text-xs focus:outline-none focus:border-[#c5a880]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Event Date</label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white text-xs focus:outline-none focus:border-[#c5a880]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Valet Staff Count</label>
                    <input
                      type="number"
                      min="2"
                      max="30"
                      value={staffCount}
                      onChange={(e) => setStaffCount(parseInt(e.target.value))}
                      className="w-full px-3 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white text-xs focus:outline-none focus:border-[#c5a880]"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="pt-4">
              <button
                type="submit"
                className="w-full gold-gradient-bg text-[#012218] font-extrabold text-xs py-3.5 rounded-xl gold-shadow hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Passenger Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Passenger Info */}
        {step === 2 && (
          <form onSubmit={handleNext} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className="w-full px-3 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white text-xs focus:outline-none focus:border-[#c5a880]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number (for SMS & Driver Call)</label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white text-xs focus:outline-none focus:border-[#c5a880]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="aarav.sharma@example.com"
                className="w-full px-3 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white text-xs focus:outline-none focus:border-[#c5a880]"
              />
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-[11px] text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#c5a880] shrink-0" />
              <span>Driver contact details will be dispatched immediately via SMS after confirmation.</span>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-2/3 gold-gradient-bg text-[#012218] font-extrabold text-xs py-3.5 rounded-xl gold-shadow hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Confirm & Dispatch Driver</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Confirmation Receipt */}
        {step === 3 && (
          <div className="text-center py-4 space-y-5">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-extrabold text-white">Booking Confirmed!</h3>
              <p className="text-xs text-slate-300 mt-1">
                Your driver matching request has been received by our Live Operations Center.
              </p>
            </div>

            {/* Generated Ticket Box */}
            <div className="p-5 rounded-2xl bg-black/50 border border-[#c5a880]/40 text-left space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">Booking Reference:</span>
                <span className="font-bold text-[#c5a880]">{generatedBookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Passenger:</span>
                <span className="text-white font-semibold">{customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pickup Location:</span>
                <span className="text-white truncate max-w-[200px]">{pickup}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date & Time:</span>
                <span className="text-white">{bookingDate} @ {bookingTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Driver:</span>
                <span className="text-emerald-400 font-bold">Vikram Singh (Rating 4.9★)</span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-3.5 gold-gradient-bg text-[#012218] font-extrabold text-xs rounded-xl hover:brightness-110"
            >
              Done & Return to Homepage
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
