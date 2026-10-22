'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  Sun,
  Users,
  CheckCircle2,
  RefreshCw,
  Repeat,
} from 'lucide-react';
import { vehicleTypes } from '@/data/websiteData';
import { DriverPricingData, defaultDriverPricingData } from '@/store/usePricingStore';

interface FareCalculatorProps {
  onOpenBooking: (serviceType: string, initialData?: any) => void;
}

export default function FareCalculator({ onOpenBooking }: FareCalculatorProps) {
  // Service category tab
  const [serviceCategory, setServiceCategory] = useState<'local' | 'outstation' | 'valet'>('local');

  // Dynamic pricing state from Admin database
  const [pricing, setPricing] = useState<DriverPricingData>(defaultDriverPricingData);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  // Local Inputs
  const [localTripType, setLocalTripType] = useState<'one_way' | 'round_trip'>('one_way');
  const [localShift, setLocalShift] = useState<'morningHours' | 'nightHours'>('morningHours');
  const [localHours, setLocalHours] = useState(4);
  const [selectedVehicle, setSelectedVehicle] = useState('Hatchback');

  // Outstation Inputs
  const [outstationTripType, setOutstationTripType] = useState<'one_way' | 'round_trip'>('one_way');
  const [outstationShift, setOutstationShift] = useState<'morningHours' | 'nightHours'>('morningHours');
  const [outstationHours, setOutstationHours] = useState(12);
  const [outstationNightStay, setOutstationNightStay] = useState(1);

  // Valet Inputs
  const [valetStaff, setValetStaff] = useState(6);
  const [valetHours, setValetHours] = useState(5);
  const [valetEventType, setValetEventType] = useState('wedding');

  // Fetch dynamic pricing from backend
  const fetchCharges = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/common/charges', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        const list = Array.isArray(json.data) ? json.data : [json.data];
        if (list.length > 0 && list[0]) {
          const item = list[0];
          setPricing({
            ...defaultDriverPricingData,
            ...item,
            local: {
              one_way: {
                ...defaultDriverPricingData.local.one_way,
                ...(item.local?.one_way || {}),
              },
              round_trip: {
                ...defaultDriverPricingData.local.round_trip,
                ...(item.local?.round_trip || {}),
              },
            },
            outstation: {
              one_way: {
                ...defaultDriverPricingData.outstation.one_way,
                ...(item.outstation?.one_way || {}),
              },
              round_trip: {
                ...defaultDriverPricingData.outstation.round_trip,
                ...(item.outstation?.round_trip || {}),
              },
            },
            valletparking: {
              ...defaultDriverPricingData.valletparking,
              ...(item.valletparking || {}),
            },
          });
          setLastSynced(new Date());
        }
      }
    } catch (err) {
      console.error('Failed to load dynamic pricing:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCharges();
  }, [fetchCharges]);

  // Adjust default hours when switching trip type for local
  useEffect(() => {
    const tier = pricing?.local?.[localTripType]?.[localShift];
    if (tier?.hours) {
      setLocalHours((prev) => Math.max(tier.hours, prev));
    }
  }, [localTripType, localShift, pricing]);

  // Active Local Pricing Tier
  const activeLocalTier = useMemo(() => {
    const tripObj = pricing?.local?.[localTripType] || defaultDriverPricingData.local[localTripType];
    return tripObj?.[localShift] || tripObj?.morningHours || defaultDriverPricingData.local.one_way.morningHours;
  }, [pricing, localTripType, localShift]);

  // Calculate Local Fare
  const localFare = useMemo(() => {
    const baseHours = activeLocalTier.hours || 4;
    const basePrice = activeLocalTier.customerPrice || 400;
    const timeRange = activeLocalTier.timeRange || (localShift === 'morningHours' ? '06:00-18:00' : '18:00-06:00');

    // Rate per additional hour derived dynamically from base tier rate
    const extraHours = Math.max(0, localHours - baseHours);
    const hourlyRate = Math.max(50, Math.round(basePrice / baseHours));
    const durationCharge = extraHours * hourlyRate;

    // Vehicle multiplier
    const vehObj = vehicleTypes.find((v) => v.type === selectedVehicle);
    const mult = vehObj ? vehObj.multiplier : 1.0;

    const subtotalBeforeVeh = basePrice + durationCharge;
    const vehicleExtra = Math.round(subtotalBeforeVeh * (mult - 1.0));

    const taxableTotal = subtotalBeforeVeh + vehicleExtra;
    const tax = Math.round(taxableTotal * 0.18);
    const total = taxableTotal + tax;

    return {
      basePrice,
      baseHours,
      timeRange,
      hourlyRate,
      extraHours,
      durationCharge,
      vehicleExtra,
      taxableTotal,
      tax,
      total,
    };
  }, [activeLocalTier, localHours, selectedVehicle, localShift]);

  // Active Outstation Pricing Tier
  const activeOutstationTier = useMemo(() => {
    const tripObj = pricing?.outstation?.[outstationTripType] || defaultDriverPricingData.outstation[outstationTripType];
    return {
      packagePrice: tripObj?.customerPrice || (outstationTripType === 'one_way' ? 1500 : 2000),
      packageDays: tripObj?.day || 1,
      shiftTier: tripObj?.[outstationShift] || tripObj?.morningHours || defaultDriverPricingData.outstation.one_way.morningHours,
    };
  }, [pricing, outstationTripType, outstationShift]);

  // Calculate Outstation Fare
  const outstationFare = useMemo(() => {
    const { packagePrice, shiftTier } = activeOutstationTier;
    const baseHours = shiftTier.hours || 12;
    const basePrice = shiftTier.customerPrice || packagePrice || 1500;
    const timeRange = shiftTier.timeRange || (outstationShift === 'morningHours' ? '06:00-18:00' : '18:00-06:00');

    const extraHours = Math.max(0, outstationHours - baseHours);
    const hourlyRate = Math.max(75, Math.round(basePrice / baseHours));
    const durationCharge = extraHours * hourlyRate;

    // Vehicle multiplier
    const vehObj = vehicleTypes.find((v) => v.type === selectedVehicle);
    const mult = vehObj ? vehObj.multiplier : 1.0;

    const subtotalBeforeVeh = basePrice + durationCharge;
    const vehicleExtra = Math.round(subtotalBeforeVeh * (mult - 1.0));

    // Dynamic Allowances
    const foodBlocks = Math.ceil(outstationHours / 12);
    const foodAllowance = foodBlocks * 300;
    const nightAllowance = outstationNightStay * 400;

    const taxableTotal = subtotalBeforeVeh + vehicleExtra + foodAllowance + nightAllowance;
    const tax = Math.round(taxableTotal * 0.18);
    const total = taxableTotal + tax;

    return {
      basePrice,
      baseHours,
      timeRange,
      hourlyRate,
      extraHours,
      durationCharge,
      vehicleExtra,
      foodAllowance,
      nightAllowance,
      taxableTotal,
      tax,
      total,
    };
  }, [activeOutstationTier, outstationHours, selectedVehicle, outstationNightStay, outstationShift]);

  // Active Valet Pricing Tier
  const activeValetConfig = useMemo(() => {
    return pricing?.valletparking || defaultDriverPricingData.valletparking!;
  }, [pricing]);

  // Calculate Valet Fare dynamically
  const valetFare = useMemo(() => {
    const standardPrice = activeValetConfig.customerprice || 600;
    const standardHours = activeValetConfig.hours || 4;
    const standardStaff = activeValetConfig.person || 1;

    // Rate per staff per hour dynamically derived from admin configuration
    const ratePerStaffHour = Math.max(50, Math.round(standardPrice / (standardHours * standardStaff || 1)));

    const totalHoursStaff = valetStaff * valetHours;
    const baseAmount = totalHoursStaff * ratePerStaffHour;

    const tax = Math.round(baseAmount * 0.18);
    const total = baseAmount + tax;

    return {
      ratePerStaffHour,
      standardHours,
      standardPrice,
      totalHoursStaff,
      baseAmount,
      tax,
      total,
    };
  }, [activeValetConfig, valetStaff, valetHours]);

  const handleBookNow = () => {
    onOpenBooking(serviceCategory, {
      serviceCategory,
      tripType: serviceCategory === 'local' ? localTripType : serviceCategory === 'outstation' ? outstationTripType : 'event',
      shift: serviceCategory === 'local' ? localShift : outstationShift,
      durationHours: serviceCategory === 'local' ? localHours : serviceCategory === 'outstation' ? outstationHours : valetHours,
      vehicleType: selectedVehicle,
      outstationHours,
      outstationNightStay,
      valetStaff,
      valetHours,
      valetEventType,
      estimatedTotal:
        serviceCategory === 'local' ? localFare.total : serviceCategory === 'outstation' ? outstationFare.total : valetFare.total,
    });
  };

  return (
    <section id="calculator" className="py-12 md:py-16 bg-white relative overflow-hidden">
      {/* Background Soft Subtle Glows */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#023526]/10 via-[#c5a880]/15 to-[#023526]/10 border border-[#c5a880]/40 text-[#023526] text-xs font-bold tracking-wide mb-3 shadow-2xs">
            <Calculator className="w-4 h-4 text-[#c5a880]" />
            <span>Instant Fare Estimator • Live Admin Dynamic Pricing</span>
            <button
              onClick={fetchCharges}
              disabled={isLoading}
              title="Refresh latest pricing rates"
              className="ml-1 text-slate-400 hover:text-[#023526] transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-[#023526]' : ''}`} />
            </button>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 tracking-tight leading-tight">
            Calculate Your Exact Fare <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#023526] via-[#c5a880] to-[#023526] bg-clip-text text-transparent">
              Before You Book
            </span>
          </h2>
          <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Transparent pricing calculated in real-time with verified platform rates. Zero surge pricing, no unexpected driver fees, and full insurance included.
          </p>
        </div>

        {/* Calculator Outer Frame */}
        <div className="bg-white/95 rounded-3xl border border-stone-200/90 p-6 sm:p-10 lg:p-12 max-w-7xl w-full mx-auto relative">

          {/* Service Category Navigation Pills */}
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
                  {/* Trip Type & Shift Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2 border-b border-slate-100">
                    {/* Trip Type Selector */}
                    <div>
                      <label className="block text-xs font-black text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <Repeat className="w-3.5 h-3.5 text-[#023526]" />
                        <span>Trip Type</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                        <button
                          type="button"
                          onClick={() => setLocalTripType('one_way')}
                          className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${localTripType === 'one_way'
                            ? 'bg-white text-[#023526] shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                          One-Way
                        </button>
                        <button
                          type="button"
                          onClick={() => setLocalTripType('round_trip')}
                          className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${localTripType === 'round_trip'
                            ? 'bg-white text-[#023526] shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                          Round Trip
                        </button>
                      </div>
                    </div>

                    {/* Time Shift Selector */}
                    <div>
                      <label className="block text-xs font-black text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#023526]" />
                        <span>Shift Schedule</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                        <button
                          type="button"
                          onClick={() => setLocalShift('morningHours')}
                          className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${localShift === 'morningHours'
                            ? 'bg-white text-amber-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                          <Sun className="w-3.5 h-3.5 text-amber-500" />
                          <span>Day </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setLocalShift('nightHours')}
                          className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${localShift === 'nightHours'
                            ? 'bg-white text-indigo-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                          <Moon className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Night</span>
                        </button>
                      </div>
                    </div>
                  </div>

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
                      min={Math.min(2, localFare.baseHours)}
                      max="16"
                      step="1"
                      value={localHours}
                      onChange={(e) => setLocalHours(parseInt(e.target.value))}
                      className="w-full h-2.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#023526]"
                    />

                    <div className="flex justify-between text-[11px] font-semibold text-slate-500 mt-2">
                      <span>{localFare.baseHours} hrs (₹{localFare.basePrice})</span>
                      <span>6 hrs</span>
                      <span>8 hrs (Day)</span>
                      <span>12 hrs</span>
                      <span>16 hrs</span>
                    </div>
                  </div>

                  {/* Vehicle Type Picker */}
                  {/* <div>
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
                  </div> */}

                  {/* Tier details info pill */}
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11.5px] text-emerald-950 font-semibold flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Base rate: ₹{localFare.basePrice} for first {localFare.baseHours} hrs • Extra hrs @ ₹{localFare.hourlyRate}/hr
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded">
                      {localTripType === 'one_way' ? 'One-Way' : 'Round Trip'}
                    </span>
                  </div>
                </>
              )}

              {/* CATEGORY 2: OUTSTATION HIGHWAY TRIP */}
              {serviceCategory === 'outstation' && (
                <>
                  {/* Trip Type & Shift Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2 border-b border-slate-100">
                    <div>
                      <label className="block text-xs font-black text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <Repeat className="w-3.5 h-3.5 text-[#023526]" />
                        <span>Trip Scope</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                        <button
                          type="button"
                          onClick={() => setOutstationTripType('one_way')}
                          className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${outstationTripType === 'one_way'
                            ? 'bg-white text-[#023526] shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                          One-Way
                        </button>
                        <button
                          type="button"
                          onClick={() => setOutstationTripType('round_trip')}
                          className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${outstationTripType === 'round_trip'
                            ? 'bg-white text-[#023526] shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                          Round Trip
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#023526]" />
                        <span>Highway Shift</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                        <button
                          type="button"
                          onClick={() => setOutstationShift('morningHours')}
                          className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${outstationShift === 'morningHours'
                            ? 'bg-white text-amber-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                          <Sun className="w-3.5 h-3.5 text-amber-500" />
                          <span>Day Trip</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setOutstationShift('nightHours')}
                          className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${outstationShift === 'nightHours'
                            ? 'bg-white text-indigo-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                          <Moon className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Night Highway</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Hours Range Slider for Outstation */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-[#023526]" />
                        <span>Outstation Duration (Hours)</span>
                      </label>
                      <span className="px-3 py-1 bg-emerald-50 text-[#023526] border border-emerald-200 rounded-full font-extrabold text-xs">
                        {outstationHours} Hours ({Math.ceil(outstationHours / 24)} Day{Math.ceil(outstationHours / 24) > 1 ? 's' : ''})
                      </span>
                    </div>

                    <input
                      type="range"
                      min="6"
                      max="72"
                      step="2"
                      value={outstationHours}
                      onChange={(e) => {
                        const h = parseInt(e.target.value);
                        setOutstationHours(h);
                        // Auto-adjust night stay based on duration
                        const expectedNights = Math.max(0, Math.floor(h / 24));
                        setOutstationNightStay(expectedNights);
                      }}
                      className="w-full h-2.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#023526]"
                    />

                    <div className="flex justify-between text-[11px] font-semibold text-slate-500 mt-2">
                      <span>{outstationFare.baseHours} hrs (Base)</span>
                      <span>24 hrs (1 Day)</span>
                      <span>48 hrs (2 Days)</span>
                      <span>72 hrs (3 Days)</span>
                    </div>
                  </div>

                  {/* Vehicle Type Picker */}
                  {/* <div>
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
                  </div> */}

                  {/* Overnight Driver Stays Counter */}
                  {/* <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                        <Moon className="w-3.5 h-3.5 text-[#023526]" />
                        <span>Driver Overnight Stays</span>
                      </label>
                      <span className="text-xs font-bold text-slate-600">
                        {outstationNightStay} Night{outstationNightStay === 1 ? '' : 's'} (₹{outstationFare.nightAllowance})
                      </span>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      <button
                        type="button"
                        onClick={() => setOutstationNightStay(Math.max(0, outstationNightStay - 1))}
                        className="w-8 h-8 rounded-lg bg-white font-bold text-slate-800 text-sm shadow-xs hover:bg-slate-100 cursor-pointer flex items-center justify-center border border-slate-200"
                      >
                        -
                      </button>
                      <span className="text-xs font-semibold text-slate-700 flex-1 text-center">
                        ₹400 / night driver stay allowance
                      </span>
                      <button
                        type="button"
                        onClick={() => setOutstationNightStay(outstationNightStay + 1)}
                        className="w-8 h-8 rounded-lg bg-white font-bold text-slate-800 text-sm shadow-xs hover:bg-slate-100 cursor-pointer flex items-center justify-center border border-slate-200"
                      >
                        +
                      </button>
                    </div>
                  </div> */}

                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11.5px] text-emerald-950 font-semibold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Dynamic Tariff: Base ₹{outstationFare.basePrice} for first {outstationFare.baseHours} hrs + ₹{outstationFare.hourlyRate}/extra hr + driver meals (₹300/12h).
                    </span>
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
                        className="w-9 h-9 rounded-lg bg-white font-bold text-slate-800 text-lg shadow-xs hover:bg-slate-100 cursor-pointer flex items-center justify-center border border-slate-200"
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
                        className="w-9 h-9 rounded-lg bg-white font-bold text-slate-800 text-lg shadow-xs hover:bg-slate-100 cursor-pointer flex items-center justify-center border border-slate-200"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                      <span>Handles approx ~{valetStaff * 20} to {valetStaff * 30} guest vehicles</span>
                      <span className="text-[#023526] font-bold">₹{valetFare.ratePerStaffHour} / staff / hr</span>
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
                      <span>
                        Live Admin Tariff: ₹{valetFare.ratePerStaffHour}/hr per attendant • Includes On-Site Supervisor & Key Tag Management
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Right Fare Summary Card */}
            <div className="lg:col-span-5 bg-gradient-to-b from-[#023526] via-[#02281d] to-[#011c14] rounded-2xl p-6 sm:p-7 text-white border border-[#c5a880]/35 shadow-md text-left relative overflow-hidden">
              {/* Top Shimmer Line */}
              <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#c5a880]/60 to-transparent pointer-events-none" />

              {/* Decorative Subtle Background Rings */}
              <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full border border-[#c5a880]/15 pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full border border-emerald-400/10 pointer-events-none" />
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#035940]/30 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between pb-3 border-b border-white/15 mb-4 relative z-10">
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
                <span className="text-[10px] font-extrabold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Dynamic Rate
                </span>
              </div>

              {/* Local Breakdown */}
              {serviceCategory === 'local' && (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>
                      Base Package ({localFare.baseHours} hrs • {localTripType === 'one_way' ? 'One-Way' : 'Round Trip'})
                    </span>
                    <span className="font-semibold text-white">₹{localFare.basePrice}</span>
                  </div>
                  {localFare.durationCharge > 0 && (
                    <div className="flex justify-between text-slate-300">
                      <span>
                        Extra Hours ({localFare.extraHours} hrs @ ₹{localFare.hourlyRate}/hr)
                      </span>
                      <span className="font-semibold text-white">₹{localFare.durationCharge}</span>
                    </div>
                  )}
                  {localFare.vehicleExtra > 0 && (
                    <div className="flex justify-between text-slate-300">
                      <span>{selectedVehicle} Category Surcharge</span>
                      <span className="font-semibold text-white">₹{localFare.vehicleExtra}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-300">
                    <span>Shift Type</span>
                    <span className="font-semibold text-white">
                      {localShift === 'morningHours' ? 'Day Shift' : 'Night Shift'} ({localFare.timeRange})
                    </span>
                  </div>
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

              {/* Outstation Breakdown */}
              {serviceCategory === 'outstation' && (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>
                      Base Outstation Rate ({outstationFare.baseHours} hrs • {outstationTripType === 'one_way' ? 'One-Way' : 'Round Trip'})
                    </span>
                    <span className="font-semibold text-white">₹{outstationFare.basePrice}</span>
                  </div>
                  {outstationFare.durationCharge > 0 && (
                    <div className="flex justify-between text-slate-300">
                      <span>
                        Extra Highway Hours ({outstationFare.extraHours} hrs @ ₹{outstationFare.hourlyRate}/hr)
                      </span>
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
                    <span>Base Staff Charge (@ ₹{valetFare.ratePerStaffHour}/hr)</span>
                    <span className="font-semibold text-white">₹{valetFare.baseAmount}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
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
                <span>
                  Price calculated with active admin tariffs. Comprehensive insurance & verified drivers guaranteed.
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
