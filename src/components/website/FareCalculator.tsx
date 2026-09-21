'use client';

import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Car,
  Clock,
  Navigation,
  Crown,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Moon,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { vehicleTypes, pricingConfigAdmin } from '@/data/websiteData';

interface FareCalculatorProps {
  onOpenBooking: (serviceType: string, initialData?: any) => void;
}

export default function FareCalculator({ onOpenBooking }: FareCalculatorProps) {
  const [serviceCategory, setServiceCategory] = useState<'local' | 'outstation' | 'valet'>('local');

  // Local Inputs
  const [localHours, setLocalHours] = useState(4);
  const [selectedVehicle, setSelectedVehicle] = useState('Hatchback');
  const [isNightDrive, setIsNightDrive] = useState(false);

  // Outstation Inputs (Hour-wise)
  const [outstationHours, setOutstationHours] = useState(12);
  const [outstationNightStay, setOutstationNightStay] = useState(1);

  // Valet Inputs
  const [valetStaff, setValetStaff] = useState(6);
  const [valetHours, setValetHours] = useState(5);
  const [valetEventType, setValetEventType] = useState('wedding');

  // Calculate Local Fare
  const localFare = useMemo(() => {
    const config = pricingConfigAdmin.local;
    const base = config.basePrice; // ₹400 for 2 hours
    const extraHours = Math.max(0, localHours - config.minDurationHours);
    const durationCharge = extraHours * config.additionalHourPrice;

    // Vehicle multiplier
    const vehObj = vehicleTypes.find((v) => v.type === selectedVehicle);
    const mult = vehObj ? vehObj.multiplier : 1.0;

    const subtotalBeforeVeh = base + durationCharge;
    const vehicleExtra = Math.round(subtotalBeforeVeh * (mult - 1.0));
    const nightCharge = isNightDrive ? config.nightCharge : 0;

    const taxableTotal = subtotalBeforeVeh + vehicleExtra + nightCharge;
    const tax = Math.round(taxableTotal * (config.taxPercent / 100));
    const total = taxableTotal + tax;

    return {
      base,
      durationCharge,
      vehicleExtra,
      nightCharge,
      taxableTotal,
      tax,
      total,
    };
  }, [localHours, selectedVehicle, isNightDrive]);

  // Calculate Outstation Fare (Hours-wise)
  const outstationFare = useMemo(() => {
    const baseHours = 6;
    const base = 1000; // Base ₹1,000 for 6 hours
    const extraHours = Math.max(0, outstationHours - baseHours);
    const durationCharge = extraHours * 150; // ₹150/extra hour

    // Vehicle multiplier
    const vehObj = vehicleTypes.find((v) => v.type === selectedVehicle);
    const mult = vehObj ? vehObj.multiplier : 1.0;

    const subtotalBeforeVeh = base + durationCharge;
    const vehicleExtra = Math.round(subtotalBeforeVeh * (mult - 1.0));

    const foodBlocks = Math.ceil(outstationHours / 12);
    const foodAllowance = foodBlocks * 300;
    const nightAllowance = outstationNightStay * 400;

    const taxableTotal = subtotalBeforeVeh + vehicleExtra + foodAllowance + nightAllowance;
    const tax = Math.round(taxableTotal * 0.18);
    const total = taxableTotal + tax;

    return {
      base,
      durationCharge,
      vehicleExtra,
      foodAllowance,
      nightAllowance,
      taxableTotal,
      tax,
      total,
    };
  }, [outstationHours, selectedVehicle, outstationNightStay]);

  // Calculate Valet Fare
  const valetFare = useMemo(() => {
    const config = pricingConfigAdmin.valet;
    const totalHoursStaff = valetStaff * valetHours;
    const baseAmount = totalHoursStaff * config.pricePerStaffPerHour;

    const tax = Math.round(baseAmount * (config.taxPercent / 100));
    const total = baseAmount + tax;

    return {
      totalHoursStaff,
      baseAmount,
      tax,
      total,
    };
  }, [valetStaff, valetHours]);

  const handleBookNow = () => {
    onOpenBooking(serviceCategory, {
      durationHours: serviceCategory === 'local' ? localHours : serviceCategory === 'outstation' ? outstationHours : valetHours,
      vehicleType: selectedVehicle,
      isNightDrive,
      outstationHours,
      outstationNightStay,
      valetStaff,
      valetHours,
    });
  };

  return (
    <section id="calculator" className="py-12 md:py-16 bg-white relative overflow-hidden ">
      {/* Background Soft Subtle Glows */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#023526]/10 via-[#c5a880]/15 to-[#023526]/10 border border-[#c5a880]/40 text-[#023526] text-xs font-bold tracking-wide mb-3 shadow-2xs">
            <Calculator className="w-4 h-4 text-[#c5a880]" />
            <span>Instant Fare Estimator • Zero Hidden Costs</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 tracking-tight leading-tight">
            Calculate Your Exact Fare <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#023526] via-[#c5a880] to-[#023526] bg-clip-text text-transparent">
              Before You Book
            </span>
          </h2>
          <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Transparent pricing algorithm calculated in real-time. No surge pricing, no unexpected driver fees, and full insurance included.
          </p>
        </div>

        {/* Calculator Outer Frame */}
        <div className="bg-white/95 rounded-3xl border border-stone-200/90  p-6 sm:p-10 lg:p-12 max-w-7xl w-full mx-auto relative">

          {/* Ultra-Compact Service Category Navigation Pills */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-1 p-1 bg-stone-100 border border-stone-200/80 rounded-xl shadow-2xs">
              <button
                onClick={() => setServiceCategory('local')}
                className={`py-1.5 px-3.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${serviceCategory === 'local'
                  ? 'bg-[#023526] text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
              >
                <Clock className={`w-3.5 h-3.5 ${serviceCategory === 'local' ? 'text-[#c5a880]' : 'text-slate-400'}`} />
                <span>Local Station</span>
              </button>

              <button
                onClick={() => setServiceCategory('outstation')}
                className={`py-1.5 px-3.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${serviceCategory === 'outstation'
                  ? 'bg-[#023526] text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
              >
                <Navigation className={`w-3.5 h-3.5 ${serviceCategory === 'outstation' ? 'text-[#c5a880]' : 'text-slate-400'}`} />
                <span>Outstation</span>
              </button>

              <button
                onClick={() => setServiceCategory('valet')}
                className={`py-1.5 px-3.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${serviceCategory === 'valet'
                  ? 'bg-[#023526] text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
              >
                <Crown className={`w-3.5 h-3.5 ${serviceCategory === 'valet' ? 'text-[#c5a880]' : 'text-slate-400'}`} />
                <span>Valet Event</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Options Input Column */}
            <div className="lg:col-span-7 space-y-6 text-left bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs">

              {/* CATEGORY 1: LOCAL HOURLY DRIVER */}
              {serviceCategory === 'local' && (
                <>
                  {/* Hours Range Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#023526]" />
                        <span>Booking Duration</span>
                      </label>
                      <span className="px-3 py-1 bg-emerald-50 text-[#023526] border border-emerald-200 rounded-full font-extrabold text-xs">
                        {localHours} Hours
                      </span>
                    </div>

                    <input
                      type="range"
                      min="2"
                      max="12"
                      step="1"
                      value={localHours}
                      onChange={(e) => setLocalHours(parseInt(e.target.value))}
                      className="w-full h-2.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#023526]"
                    />

                    <div className="flex justify-between text-[11px] font-semibold text-slate-500 mt-2">
                      <span>2 hrs (₹400)</span>
                      <span>4 hrs</span>
                      <span>6 hrs</span>
                      <span>8 hrs (Day)</span>
                      <span>12 hrs</span>
                    </div>
                  </div>

                  {/* Vehicle Type Picker */}
                  <div>
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-[#023526]" />
                      <span>Select Car Category</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {vehicleTypes.map((v) => {
                        const isSelected = selectedVehicle === v.type;
                        return (
                          <div
                            key={v.type}
                            onClick={() => setSelectedVehicle(v.type)}
                            className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${isSelected
                              ? 'border-[#023526] bg-[#023526]/5 shadow-xs'
                              : 'border-slate-200/80 hover:border-slate-300 bg-white'
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900">{v.type}</span>
                              {isSelected ? (
                                <CheckCircle2 className="w-4 h-4 text-[#023526]" />
                              ) : (
                                <span className="text-[10px] font-bold text-slate-400">
                                  {v.multiplier === 1 ? 'Standard' : `+${Math.round((v.multiplier - 1) * 100)}%`}
                                </span>
                              )}
                            </div>
                            <p className="text-[10.5px] text-slate-500 mt-1 line-clamp-1">{v.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Night Allowance Checkbox Card */}
                  {/* <div
                    onClick={() => setIsNightDrive(!isNightDrive)}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${isNightDrive
                        ? 'border-[#023526] bg-[#023526]/5 shadow-xs'
                        : 'border-slate-200/80 hover:border-slate-300 bg-white'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isNightDrive ? 'bg-[#023526] text-[#c5a880]' : 'bg-slate-100 text-slate-500'
                        }`}>
                        <Moon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Night Drive Surcharge (10 PM - 6 AM)</span>
                        <p className="text-[11px] text-slate-500">Fixed ₹250 late-night driver allowance</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isNightDrive}
                      onChange={(e) => setIsNightDrive(e.target.checked)}
                      className="w-5 h-5 accent-[#023526] cursor-pointer"
                    />
                  </div> */}
                </>
              )}

              {/* CATEGORY 2: OUTSTATION HIGHWAY TRIP */}
              {serviceCategory === 'outstation' && (
                <>
                  {/* Hours Range Slider for Outstation */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-[#023526]" />
                        <span>Outstation Duration (Hours)</span>
                      </label>
                      <span className="px-3 py-1 bg-emerald-50 text-[#023526] border border-emerald-200 rounded-full font-extrabold text-xs">
                        {outstationHours} Hours
                      </span>
                    </div>

                    <input
                      type="range"
                      min="6"
                      max="48"
                      step="1"
                      value={outstationHours}
                      onChange={(e) => setOutstationHours(parseInt(e.target.value))}
                      className="w-full h-2.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#023526]"
                    />

                    <div className="flex justify-between text-[11px] font-semibold text-slate-500 mt-2">
                      <span>6 hrs (₹1,000)</span>
                      <span>12 hrs (Day)</span>
                      <span>24 hrs</span>
                      <span>36 hrs</span>
                      <span>48 hrs (2 Days)</span>
                    </div>
                  </div>

                  {/* Vehicle Type Picker */}
                  <div>
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-[#023526]" />
                      <span>Select Car Category</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {vehicleTypes.map((v) => {
                        const isSelected = selectedVehicle === v.type;
                        return (
                          <div
                            key={v.type}
                            onClick={() => setSelectedVehicle(v.type)}
                            className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${isSelected
                              ? 'border-[#023526] bg-[#023526]/5 shadow-xs'
                              : 'border-slate-200/80 hover:border-slate-300 bg-white'
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900">{v.type}</span>
                              {isSelected ? (
                                <CheckCircle2 className="w-4 h-4 text-[#023526]" />
                              ) : (
                                <span className="text-[10px] font-bold text-slate-400">
                                  {v.multiplier === 1 ? 'Standard' : `+${Math.round((v.multiplier - 1) * 100)}%`}
                                </span>
                              )}
                            </div>
                            <p className="text-[10.5px] text-slate-500 mt-1 line-clamp-1">{v.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Night Stays Counter */}
                  {/* <div>
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <Moon className="w-3.5 h-3.5 text-[#023526]" />
                      <span>Overnight Driver Stays</span>
                    </label>
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                      <button
                        type="button"
                        onClick={() => setOutstationNightStay(Math.max(0, outstationNightStay - 1))}
                        className="w-9 h-9 rounded-lg bg-white font-bold text-slate-800 text-base shadow-xs hover:bg-slate-100 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-sm font-black text-slate-900 flex-1 text-center">
                        {outstationNightStay} Night{outstationNightStay === 1 ? '' : 's'} (₹400 / night)
                      </span>
                      <button
                        type="button"
                        onClick={() => setOutstationNightStay(outstationNightStay + 1)}
                        className="w-9 h-9 rounded-lg bg-white font-bold text-slate-800 text-base shadow-xs hover:bg-slate-100 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div> */}

                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11.5px] text-emerald-950 font-semibold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Outstation calculated hourly (₹1,000 base for 6 hrs + ₹150/extra hr) + meals & night stays.</span>
                  </div>
                </>
              )}

              {/* CATEGORY 3: VALET EVENT PARKING */}
              {serviceCategory === 'valet' && (
                <div className="space-y-6">
                  {/* Event Type Quick Preset Selection */}
                  <div>
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-[#023526]" />
                      <span>Select Event Type</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'wedding', label: 'Wedding', staff: 10, sub: '200-300 Cars' },
                        { id: 'corporate', label: 'Corporate', staff: 6, sub: '120-180 Cars' },
                        { id: 'party', label: 'Private Party', staff: 4, sub: '60-100 Cars' },
                        { id: 'gala', label: 'Grand Gala', staff: 16, sub: '400+ Cars' },
                      ].map((evt) => (
                        <button
                          key={evt.id}
                          type="button"
                          onClick={() => {
                            setValetEventType(evt.id);
                            setValetStaff(evt.staff);
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${valetEventType === evt.id
                            ? 'border-[#023526] bg-[#023526]/5 shadow-xs font-bold'
                            : 'border-slate-200/80 hover:border-slate-300 bg-white'
                            }`}
                        >
                          <span className="text-xs font-bold text-slate-900 block">{evt.label}</span>
                          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{evt.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Valet Staff Stepper & Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#023526]" />
                        <span>Required Valet Staff</span>
                      </label>
                      <span className="px-3 py-1 bg-amber-50 text-[#9c7f56] border border-amber-200 rounded-full font-extrabold text-xs">
                        {valetStaff} Uniformed Attendants
                      </span>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80 mb-3">
                      <button
                        type="button"
                        onClick={() => setValetStaff(Math.max(2, valetStaff - 1))}
                        className="w-9 h-9 rounded-lg bg-white font-bold text-slate-800 text-lg shadow-xs hover:bg-slate-100 cursor-pointer flex items-center justify-center"
                      >
                        -
                      </button>
                      <input
                        type="range"
                        min="2"
                        max="25"
                        step="1"
                        value={valetStaff}
                        onChange={(e) => setValetStaff(parseInt(e.target.value))}
                        className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#023526]"
                      />
                      <button
                        type="button"
                        onClick={() => setValetStaff(Math.min(25, valetStaff + 1))}
                        className="w-9 h-9 rounded-lg bg-white font-bold text-slate-800 text-lg shadow-xs hover:bg-slate-100 cursor-pointer flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                      <span>Handles approx ~{valetStaff * 20} to {valetStaff * 30} guest vehicles</span>
                      <span className="text-[#023526] font-bold">₹150 / staff / hr</span>
                    </div>
                  </div>

                  {/* Event Duration Hours */}
                  <div>
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#023526]" />
                      <span>Event Duration (Hours)</span>
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {[3, 4, 6, 8, 12].map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setValetHours(h)}
                          className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${valetHours === h
                            ? 'bg-[#023526] text-white shadow-md'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                          {h} {h === 12 ? 'hrs (Full)' : 'Hours'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Valet Service Feature Guarantees */}
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11.5px] text-emerald-950 font-semibold space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Includes Uniformed Valet Drivers + On-Site Supervisor & Key Tag Management</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Right Fare Summary Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#023526] via-[#01261b] to-[#011a12] rounded-2xl p-6 text-white border border-[#c5a880]/30 shadow-sm text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a880]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between pb-3 border-b border-white/15 mb-4">
                <h4 className="text-xs font-bold text-[#c5a880] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#c5a880]" />
                  <span>
                    {serviceCategory === 'local'
                      ? 'Local Driver Fare'
                      : serviceCategory === 'outstation'
                        ? 'Outstation Trip Fare'
                        : 'Valet Event Estimate'}
                  </span>
                </h4>
                <span className="text-[10px] font-extrabold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700">
                  Fixed Price
                </span>
              </div>

              {/* Local Breakdown */}
              {serviceCategory === 'local' && (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Base Fare (First 2 Hours)</span>
                    <span className="font-semibold text-white">₹{localFare.base}</span>
                  </div>
                  {localFare.durationCharge > 0 && (
                    <div className="flex justify-between text-slate-300">
                      <span>Extra Hours ({localHours - 2} hrs @ ₹150)</span>
                      <span className="font-semibold text-white">₹{localFare.durationCharge}</span>
                    </div>
                  )}
                  {localFare.vehicleExtra > 0 && (
                    <div className="flex justify-between text-slate-300">
                      <span>{selectedVehicle} Category Surcharge</span>
                      <span className="font-semibold text-white">₹{localFare.vehicleExtra}</span>
                    </div>
                  )}
                  {localFare.nightCharge > 0 && (
                    <div className="flex justify-between text-slate-300">
                      <span>Night Allowance (10 PM - 6 AM)</span>
                      <span className="font-semibold text-white">₹{localFare.nightCharge}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-300">
                    <span>GST Tax (18%)</span>
                    <span className="font-semibold text-white">₹{localFare.tax}</span>
                  </div>

                  <div className="pt-4 mt-2 border-t border-white/15 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#c5a880] font-bold uppercase tracking-wider block">Estimated Total</span>
                      <div className="text-3xl font-black text-white tracking-tight">₹{localFare.total}</div>
                    </div>
                    <button
                      onClick={handleBookNow}
                      className="px-5 py-3 bg-gradient-to-r from-[#d4af37] via-[#f5e6b3] to-[#b4966c] text-[#011d15] font-black text-xs rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
                    >
                      <span>Book Local Driver</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Outstation Breakdown (Hours-wise) */}
              {serviceCategory === 'outstation' && (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Base Outstation Rate (First 6 Hours)</span>
                    <span className="font-semibold text-white">₹{outstationFare.base}</span>
                  </div>
                  {outstationFare.durationCharge > 0 && (
                    <div className="flex justify-between text-slate-300">
                      <span>Extra Highway Hours ({outstationHours - 6} hrs @ ₹150)</span>
                      <span className="font-semibold text-white">₹{outstationFare.durationCharge}</span>
                    </div>
                  )}
                  {outstationFare.vehicleExtra > 0 && (
                    <div className="flex justify-between text-slate-300">
                      <span>{selectedVehicle} Category Surcharge</span>
                      <span className="font-semibold text-white">₹{outstationFare.vehicleExtra}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-300">
                    <span>Driver Meals Allowance ({Math.ceil(outstationHours / 12)} × ₹300)</span>
                    <span className="font-semibold text-white">₹{outstationFare.foodAllowance}</span>
                  </div>
                  {outstationFare.nightAllowance > 0 && (
                    <div className="flex justify-between text-slate-300">
                      <span>Driver Night Stay ({outstationNightStay} Nights)</span>
                      <span className="font-semibold text-white">₹{outstationFare.nightAllowance}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-300">
                    <span>GST Tax (18%)</span>
                    <span className="font-semibold text-white">₹{outstationFare.tax}</span>
                  </div>

                  <div className="pt-4 mt-2 border-t border-white/15 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#c5a880] font-bold uppercase tracking-wider block">Estimated Total</span>
                      <div className="text-3xl font-black text-white tracking-tight">₹{outstationFare.total}</div>
                    </div>
                    <button
                      onClick={handleBookNow}
                      className="px-5 py-3 bg-gradient-to-r from-[#d4af37] via-[#f5e6b3] to-[#b4966c] text-[#011d15] font-black text-xs rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
                    >
                      <span>Book Outstation Driver</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Valet Breakdown */}
              {serviceCategory === 'valet' && (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Valet Staff Count</span>
                    <span className="font-semibold text-white">{valetStaff} Uniformed Staff</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Staff Hours ({valetStaff} × {valetHours} hrs)</span>
                    <span className="font-semibold text-white">{valetFare.totalHoursStaff} Staff-Hours</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Base Staff Charge (@ ₹150/hr)</span>
                    <span className="font-semibold text-white">₹{valetFare.baseAmount}</span>
                  </div>
                  <div className="flex justify-between text-slate-[#ffffff]">
                    <span>GST Tax (18%)</span>
                    <span className="font-semibold text-white">₹{valetFare.tax}</span>
                  </div>

                  <div className="pt-4 mt-2 border-t border-white/15 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#c5a880] font-bold uppercase tracking-wider block">Estimated Total</span>
                      <div className="text-3xl font-black text-white tracking-tight">₹{valetFare.total}</div>
                    </div>
                    <button
                      onClick={handleBookNow}
                      className="px-5 py-3 bg-gradient-to-r from-[#d4af37] via-[#f5e6b3] to-[#b4966c] text-[#011d15] font-black text-xs rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
                    >
                      <span>Request Valet Team</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-5 pt-3 border-t border-white/10 flex items-center gap-2 text-[10.5px] text-slate-300">
                <ShieldCheck className="w-4 h-4 text-[#c5a880] shrink-0" />
                <span>Price locked on confirmation. Comprehensive insurance & verified drivers guaranteed.</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
