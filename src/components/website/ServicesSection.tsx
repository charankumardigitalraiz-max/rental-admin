'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Car, Navigation, Crown, CheckCircle2, ArrowRight, Zap, Star } from 'lucide-react';
import { servicesData } from '@/data/websiteData';

interface ServicesSectionProps {
  onOpenBooking: (serviceType: string) => void;
}

export default function ServicesSection({ onOpenBooking }: ServicesSectionProps) {
  const [activeTab, setActiveTab] = useState('local');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(`service-card-${id}`);
    if (element && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const elementLeft = element.offsetLeft;
      const elementWidth = element.offsetWidth;
      const containerWidth = container.clientWidth;
      const scrollPos = elementLeft - (containerWidth / 2) + (elementWidth / 2);

      container.scrollTo({
        left: Math.max(0, scrollPos),
        behavior: 'smooth',
      });
    }
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cards = container.querySelectorAll<HTMLElement>('[data-service-id]');
    const center = container.scrollLeft + container.clientWidth / 2;

    let closestId = activeTab;
    let minDiff = Infinity;

    cards.forEach((card) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const diff = Math.abs(center - cardCenter);
      if (diff < minDiff) {
        minDiff = diff;
        closestId = card.getAttribute('data-service-id') || activeTab;
      }
    });

    if (closestId !== activeTab) {
      setActiveTab(closestId);
    }
  };

  return (
    <section id="services" className="py-12 md:py-16 bg-white text-slate-900 relative overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-[#023526] text-xs font-bold tracking-wide mb-3 shadow-2xs">
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

        {/* Mobile Filter / Jump Tabs (Hidden on Desktop) */}
        <div className="flex md:hidden items-center justify-between p-1 bg-stone-100 rounded-2xl mb-6 border border-stone-200/80">
          {servicesData.map((svc) => (
            <button
              key={svc.id}
              onClick={() => handleTabClick(svc.id)}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${activeTab === svc.id
                  ? 'bg-white text-[#023526] shadow-xs border border-stone-200/90'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              {svc.id === 'local' ? 'Local Chauffeur' : svc.id === 'outstation' ? 'Outstation Driver' : 'Valet Staff'}
            </button>
          ))}
        </div>

        {/* Services Cards: Mobile Snap Carousel + Desktop 3-Column Grid */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex md:grid md:grid-cols-3 gap-5 lg:gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 px-2 sm:px-0 -mx-4 sm:mx-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
        >
          {servicesData.map((service) => (
            <div
              key={service.id}
              id={`service-card-${service.id}`}
              data-service-id={service.id}
              className={`w-[85vw] max-w-[340px] sm:max-w-[360px] md:w-full md:max-w-none shrink-0 snap-center rounded-3xl bg-white border flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 text-left group p-6 sm:p-7 lg:p-8 relative ${service.popular
                  ? 'border-[#023526] ring-2 ring-[#023526]/15'
                  : 'border-stone-200/90'
                }`}
            >
              {/* Top Accent for Popular Service */}
              {service.popular && (
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#023526] via-[#c5a880] to-[#023526]" />
              )}

              <div>
                {/* Header Badge Row */}
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-200/60 shrink-0">
                    {getIcon(service.iconName)}
                  </div>

                  {service.popular ? (
                    <span className="bg-[#023526] text-[#c5a880] text-[10px] sm:text-[10.5px] font-extrabold uppercase px-3 py-1 rounded-full border border-[#c5a880]/40 shadow-2xs flex items-center gap-1 shrink-0">
                      <Star className="w-3 h-3 fill-[#c5a880] text-[#c5a880]" />
                      <span>Most Popular</span>
                    </span>
                  ) : (
                    <span className="text-[10.5px] sm:text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 shrink-0">
                      {service.id === 'valet' ? 'Event Management' : 'Verified Chauffeur'}
                    </span>
                  )}
                </div>

                {/* Service Content Body */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                    {service.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs font-semibold text-emerald-800 mt-1 line-clamp-1">
                    {service.tagline}
                  </p>
                  <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed min-h-[48px]">
                    {service.description}
                  </p>

                  {/* Starting Price Tag */}
                  <div className="my-4 sm:my-5 p-3 sm:p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-2">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      Starting Base Rate
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-[#023526] shrink-0">
                      {service.startingPrice}
                    </span>
                  </div>

                  {/* Features Checklist */}
                  <div className="space-y-2.5 my-4">
                    {service.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs font-medium text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-2 border-t border-stone-100">
                <button
                  onClick={() => onOpenBooking(service.id)}
                  className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${service.popular
                      ? 'bg-[#023526] hover:bg-[#034432] text-white shadow-md shadow-[#023526]/20'
                      : 'bg-[#02281d] hover:bg-[#023526] text-white shadow-xs'
                    }`}
                >
                  <span>Book {service.name}</span>
                  <ArrowRight className="w-4 h-4 text-[#c5a880]" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Pagination Indicator Dots */}
        <div className="flex md:hidden items-center justify-center gap-2 mt-4">
          {servicesData.map((svc) => (
            <button
              key={svc.id}
              onClick={() => handleTabClick(svc.id)}
              aria-label={`Jump to ${svc.name}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${activeTab === svc.id ? 'w-6 bg-[#023526]' : 'w-2 bg-stone-300'
                }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
