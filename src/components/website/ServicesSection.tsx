'use client';

import React from 'react';
import { Car, Navigation, Crown, CheckCircle2, ArrowRight, Zap, Star } from 'lucide-react';
import { servicesData } from '@/data/websiteData';

interface ServicesSectionProps {
  onOpenBooking: (serviceType: string) => void;
}

export default function ServicesSection({ onOpenBooking }: ServicesSectionProps) {
  const getServiceImage = (id: string) => {
    switch (id) {
      case 'local':
        return 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
      case 'outstation':
        return 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80';
      case 'valet':
        return 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80';
      default:
        return 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80';
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Car':
        return <Car className="w-5 h-5 text-[#023526]" />;
      case 'Navigation':
        return <Navigation className="w-5 h-5 text-[#023526]" />;
      case 'Crown':
        return <Crown className="w-5 h-5 text-[#c5a880]" />;
      default:
        return <Car className="w-5 h-5 text-[#023526]" />;
    }
  };

  return (
    <section id="services" className="py-12 md:py-16 bg-white text-slate-900 relative overflow-hidden select-none ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#023526]/10 via-[#c5a880]/15 to-[#023526]/10 border border-[#c5a880]/40 text-[#023526] text-xs font-bold tracking-wide mb-3 shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-[#c5a880] fill-[#c5a880]" />
            <span>Our Signature Mobility Offerings</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 tracking-tight leading-tight">
            Tailored Chauffeur &{' '}
            <span className="bg-gradient-to-r from-[#023526] via-[#c5a880] to-[#023526] bg-clip-text text-transparent">
              Valet Services
            </span>
          </h2>
          <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
            Whether you need an acting driver for 2 hours in city traffic, a multi-day highway vacation, or uniformed valets for your wedding gala—DrivePulse delivers excellence.
          </p>
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {servicesData.map((service) => (
            <div
              key={service.id}
              className={`rounded-3xl bg-white border flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left group p-6 sm:p-8 ${service.popular ? 'border-[#023526] ring-2 ring-[#023526]/15' : 'border-stone-200/90'
                }`}
            >
              <div>
                {/* Header Badge Row */}
                <div className="flex items-center justify-between gap-2 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#023526]/10 flex items-center justify-center border border-[#023526]/15">
                    {getIcon(service.iconName)}
                  </div>

                  {service.popular ? (
                    <span className="bg-[#023526] text-[#c5a880] text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border border-[#c5a880]/40 shadow-2xs flex items-center gap-1">
                      <Star className="w-3 h-3 fill-[#c5a880] text-[#c5a880]" />
                      <span>Most Popular</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-500 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200/80">
                      {service.tagline}
                    </span>
                  )}
                </div>

                {/* Service Content Body */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">{service.name}</h3>
                  <p className="text-slate-600 text-xs mt-2 leading-relaxed min-h-[40px]">{service.description}</p>

                  {/* Starting Price Tag */}
                  <div className="my-5 p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Starting Base Rate</span>
                    <span className="text-base font-extrabold text-[#023526]">{service.startingPrice}</span>
                  </div>

                  {/* Features Checklist */}
                  <div className="space-y-2.5 my-4">
                    {service.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs font-medium text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-[#023526] shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-2">
                <button
                  onClick={() => onOpenBooking(service.id)}
                  className={`w-full py-3.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${service.popular
                    ? 'bg-[#023526] hover:bg-[#01261b] text-white shadow-md shadow-[#023526]/20'
                    : 'bg-stone-900 hover:bg-black text-white shadow-xs'
                    }`}
                >
                  <span>Book {service.name}</span>
                  <ArrowRight className="w-4 h-4 text-[#c5a880]" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
