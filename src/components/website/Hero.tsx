'use client';

import React from 'react';
import {
  Car,
  Crown,
  ShieldCheck,
  Star,
  ArrowRight,
  Zap,
  PhoneCall,
} from 'lucide-react';

interface HeroProps {
  onOpenBooking: (serviceType?: string, initialData?: any) => void;
}

export default function Hero({ onOpenBooking }: HeroProps) {
  return (
    <section className="relative pt-24 pb-12 md:pt-28 md:pb-16 bg-white text-slate-900 overflow-hidden select-none">
      {/* Background Soft Subtle Gradient Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-emerald-100/50 via-amber-50/40 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-50/60 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Headline, Subtitle, Action Buttons & Feature Badges */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#023526]/10 via-[#c5a880]/15 to-[#023526]/10 border border-[#c5a880]/40 text-[#023526] text-xs font-bold tracking-wide shadow-2xs">
              <Crown className="w-4 h-4 text-[#c5a880] fill-[#c5a880]" />
              <span>Bangalore's Premier Acting Driver & Valet Network</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-900 leading-[1.12]">
              Rent Professional{' '}
              <span className="bg-gradient-to-r from-[#023526] via-[#c5a880] to-[#023526] bg-clip-text text-transparent">
                Acting Drivers
              </span>{' '}
              & Luxury Valets
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl">
              Relax in your own car while our police-verified, background-checked chauffeurs take the wheel. Available 24/7 for hourly city trips, highway outstation tours, and wedding valet parking.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onOpenBooking('local')}
                className="px-6 py-3.5 bg-[#023526] hover:bg-[#012218] text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer group"
              >
                <Car className="w-4 h-4 text-[#c5a880]" />
                <span>Book Driver Now</span>
                <ArrowRight className="w-4 h-4 text-[#c5a880] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onOpenBooking('valet')}
                className="px-5 py-3.5 bg-stone-100 hover:bg-stone-200 text-slate-900 font-bold text-xs rounded-xl border border-stone-200 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Crown className="w-4 h-4 text-[#023526]" />
                <span>Event Valet Quote</span>
              </button>

              <a
                href="tel:+918025211234"
                className="px-4 py-3.5 text-slate-700 hover:text-[#023526] font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-[#023526]" />
                <span>+91 80 2521 1234</span>
              </a>
            </div>

            {/* Feature Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone-200/80">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-stone-50 p-3 rounded-2xl border border-stone-200/80 shadow-2xs">
                <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>15-25 Min Dispatch</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-stone-50 p-3 rounded-2xl border border-stone-200/80 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-[#023526] shrink-0" />
                <span>Police Verified DL</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-stone-50 p-3 rounded-2xl border border-stone-200/80 shadow-2xs">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                <span>4.9★ Driver Rating</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Image */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="relative rounded-3xl overflow-hidden  bg-white">
              <img
                src="/bookable_driver_valet_services_white_background_wider.png"
                alt="DrivePulse & Valet Premier Services"
                className="w-full h-auto max-h-[520px] object-cover rounded-3xl"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
