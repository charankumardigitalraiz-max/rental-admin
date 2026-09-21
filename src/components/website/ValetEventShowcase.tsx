'use client';

import React from 'react';
import { Crown, Building2, ShieldCheck, Users, CalendarCheck, Award, ArrowRight } from 'lucide-react';

interface ValetEventShowcaseProps {
  onOpenBooking: (serviceType: string, initialData?: any) => void;
}

export default function ValetEventShowcase({ onOpenBooking }: ValetEventShowcaseProps) {
  const venues = [
    { name: 'The Leela Palace', event: 'Grand Wedding Receptions', location: 'Kodihalli, Bangalore' },
    { name: 'Taj West End', event: 'Corporate Leadership Summits', location: 'Race Course Road' },
    { name: 'Embassy GolfLinks', event: 'Tech Hub Product Launches', location: 'Domlur, Bangalore' },
    { name: 'UB City Amphitheatre', event: 'Luxury VIP Fashion Galas', location: 'Vittal Mallya Road' },
  ];

  return (
    <section id="valet-events" className="py-12 md:py-16 bg-white text-slate-900 relative overflow-hidden ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">

          {/* Left Text & Value Props */}
          <div className="lg:col-span-6 space-y-6 text-left flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#023526]/10 via-[#c5a880]/15 to-[#023526]/10 border border-[#c5a880]/40 text-[#023526] text-xs font-bold tracking-wide mb-3 shadow-2xs">
                <Crown className="w-4 h-4 text-[#c5a880] fill-[#c5a880]" />
                <span>Luxury Venue & Event Valet Division</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 tracking-tight leading-tight">
                Flawless Valet Parking for{' '}
                <span className="bg-gradient-to-r from-[#023526] via-[#c5a880] to-[#023526] bg-clip-text text-transparent">
                  High-Profile Events
                </span>
              </h2>

              <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
                Elevate your event experience from the moment your guests arrive. Our turnkey valet operations combine well-groomed, uniformed valet staff with digital key-tag tracking and dedicated on-site event supervisors.
              </p>
            </div>

            {/* Grid Features */}
            <div className="grid grid-cols-2 gap-3.5 my-4">
              <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-[#023526] text-white flex items-center justify-center mb-2">
                  <Users className="w-4 h-4 text-[#c5a880]" />
                </div>
                <div className="font-bold text-xs text-slate-900">Uniformed Valets</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Custom branded vests & driver etiquette.</div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-[#023526] text-white flex items-center justify-center mb-2">
                  <Award className="w-4 h-4 text-[#c5a880]" />
                </div>
                <div className="font-bold text-xs text-slate-900">On-Site Supervisor</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Dedicated manager overseeing traffic.</div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-[#023526] text-white flex items-center justify-center mb-2">
                  <CalendarCheck className="w-4 h-4 text-[#c5a880]" />
                </div>
                <div className="font-bold text-xs text-slate-900">Key Tag Management</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Serialized key tags & safe podiums.</div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-[#023526] text-white flex items-center justify-center mb-2">
                  <ShieldCheck className="w-4 h-4 text-[#c5a880]" />
                </div>
                <div className="font-bold text-xs text-slate-900">Fully Insured</div>
                <div className="text-[11px] text-slate-500 mt-0.5">₹10 Lakh event liability coverage.</div>
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={() => onOpenBooking('valet')}
                className="bg-[#023526] hover:bg-[#01261b] text-white font-extrabold text-xs px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer group"
              >
                <span>Request Custom Event Quote</span>
                <ArrowRight className="w-4 h-4 text-[#c5a880] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Partner Venues & Stats Showcase (Unified Single Card) */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-lg border border-stone-200/90 text-left space-y-4 flex flex-col justify-between h-full">

              {/* Top Stats Metric Header */}
              <div className="bg-gradient-to-br from-[#023526] via-[#01261b] to-[#011a12] rounded-2xl p-5 text-white border border-[#c5a880]/30 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-white/15">
                  <div>
                    <span className="text-[10px] font-extrabold text-[#c5a880] uppercase tracking-widest block">
                      Turnkey Valet Excellence
                    </span>
                    <h4 className="text-sm font-bold text-white mt-0.5">500+ High-Profile Events Served</h4>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-700">
                    Proven Track Record
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-1 text-center">
                  <div>
                    <div className="text-lg font-black text-white">500+</div>
                    <div className="text-[10px] text-[#c5a880] font-medium">Events Served</div>
                  </div>
                  <div>
                    <div className="text-lg font-black text-white">50k+</div>
                    <div className="text-[10px] text-[#c5a880] font-medium">Cars Parked</div>
                  </div>
                  <div>
                    <div className="text-lg font-black text-white">99.8%</div>
                    <div className="text-[10px] text-[#c5a880] font-medium">Satisfaction</div>
                  </div>
                </div>
              </div>

              {/* Venues Showcase Header */}
              <div>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#023526]/10 flex items-center justify-center text-[#023526]">
                    <Building2 className="w-4 h-4 text-[#023526]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Partner Venues & Summits</h3>
                    <p className="text-[11px] text-slate-500">Trusted by Bangalore's top luxury hospitality venues</p>
                  </div>
                </div>

                {/* Venues List */}
                <div className="space-y-2.5">
                  {venues.map((v, i) => (
                    <div key={i} className="p-3 rounded-xl bg-stone-50/80 border border-stone-200/80 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-xs text-[#023526]">{v.name}</div>
                        <div className="text-[11px] font-medium text-slate-600 mt-0.5">{v.event}</div>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                        {v.location}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rate Pill */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between text-xs mt-2">
                <span className="text-[#023526] font-bold">Standard Valet Rate</span>
                <span className="font-black text-[#023526] text-xs sm:text-sm">₹150 / Staff / Hour</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
