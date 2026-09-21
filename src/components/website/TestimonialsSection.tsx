'use client';

import React from 'react';
import { Star, Quote, CheckCircle } from 'lucide-react';
import { customerReviews } from '@/data/websiteData';

export default function TestimonialsSection() {
  return (
    <section className="py-12 md:py-16 bg-stone-50 text-slate-900 relative overflow-hidden ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#023526]/10 via-[#c5a880]/15 to-[#023526]/10 border border-[#c5a880]/40 text-[#023526] text-xs font-bold tracking-wide shadow-2xs">
            <Star className="w-4 h-4 text-[#c5a880] fill-[#c5a880]" />
            <span>4.9★ Average Rating Across 10,000+ Bookings</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Loved by Individuals &{' '}
            <span className="bg-gradient-to-r from-[#023526] via-[#c5a880] to-[#023526] bg-clip-text text-transparent">
              Luxury Venues
            </span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            Read real feedback from Bangalore residents, corporate executives, and five-star event organizers.
          </p>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {customerReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white border border-stone-200/90 rounded-3xl p-7 shadow-lg hover:shadow-xl transition-all text-left flex flex-col justify-between group"
            >
              <div>
                {/* Rating Stars */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-[#023526] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {rev.serviceUsed}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed mb-6 font-medium">
                  "{rev.comment}"
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                <img
                  src={rev.avatar}
                  alt={rev.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#023526]"
                />
                <div>
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-1">
                    <span>{rev.name}</span>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">{rev.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
