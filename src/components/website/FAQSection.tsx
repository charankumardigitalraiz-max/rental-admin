'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Search, X } from 'lucide-react';

export default function FAQSection() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const categories = ['All', 'Local Hourly', 'Outstation Drives', 'Valet & Events', 'Driver Partners'];

  const faqsList = [
    {
      category: 'Local Hourly',
      question: 'How quickly can a driver arrive after I book?',
      answer: 'For Local Hourly bookings in Bangalore metro areas (Indiranagar, Koramangala, Whitefield, MG Road, HSR Layout, etc.), drivers typically arrive at your pickup location within 15 to 25 minutes of booking.',
    },
    {
      category: 'Local Hourly',
      question: 'Are all your drivers background checked and verified?',
      answer: 'Yes! Every driver undergoes a strict 5-point verification process including UIDAI Aadhaar authentication, Commercial Driving License check, police background verification, address validation, and driving skill assessment.',
    },
    {
      category: 'Outstation Drives',
      question: 'How are outstation charges calculated?',
      answer: 'Outstation trips start at a base rate of ₹1,000 for the first 6 hours (plus ₹150 per additional hour) + driver food allowance of ₹300 per 12 hours. For overnight trips, a night stay allowance of ₹400 applies.',
    },
    {
      category: 'Valet & Events',
      question: 'Can I hire valet staff for private events or weddings?',
      answer: 'Absolutely! Our Valet Management service supplies trained, uniformed valets with an on-site supervisor, key-tag tracking system, and full insurance coverage. You can request a custom quote or calculate pricing instantly on our site.',
    },
    {
      category: 'Driver Partners',
      question: 'How do drivers join the DrivePulse platform?',
      answer: 'Drivers can sign up through our Driver Onboarding portal, submit required ID & DL documents, choose a zero-commission subscription pass (e.g. ₹999/mo), and get approved by our admin team within 24 hours.',
    },
    {
      category: 'Local Hourly',
      question: 'What types of vehicles can your drivers operate?',
      answer: 'Our chauffeurs are skilled in driving all vehicle transmissions including Manual, Automatic, Dual-Clutch, and EV models across Hatchbacks, Sedans, Luxury SUVs, and Premium Imports.',
    },
    {
      category: 'Outstation Drives',
      question: 'Is my vehicle covered by insurance during the ride?',
      answer: 'Yes, every completed trip booked through DrivePulse includes comprehensive vehicle damage protection and 24/7 Live Operations Center monitoring.',
    },
  ];

  const filteredFaqs = faqsList.filter((faq) => {
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faqs" className="py-12 md:py-20 bg-white text-slate-900 relative border-t border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#023526]/10 via-[#c5a880]/15 to-[#023526]/10 border border-[#c5a880]/40 text-[#023526] text-xs font-bold tracking-wide shadow-2xs">
            <HelpCircle className="w-4 h-4 text-[#c5a880]" />
            <span>Got Questions? We Have Answers</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-[#023526] via-[#c5a880] to-[#023526] bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed">
            Everything you need to know about booking acting drivers, outstation rates, valet management, and driver subscription passes.
          </p>
        </div>

        {/* 2-Column Grid Layout: Image on Left, FAQs on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Side: Illustrative Visual Card */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-200/80 group">
              <img
                src="/professional_chauffeur_driver.png"
                alt="Professional Chauffeur Driver Support"
                className="w-full h-[400px] sm:h-[480px] lg:h-[520px] object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-6 sm:p-8">
                <span className="inline-block px-3 py-1 bg-[#c5a880] text-slate-950 font-extrabold text-[10px] tracking-wider uppercase rounded-full w-max mb-2">
                  24/7 Support Included
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                  Need Help With Your Booking or Outstation Trip?
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed font-light">
                  Our live operations team is always active to ensure your ride is smooth, safe, and punctual.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Filters, Search, and FAQs Accordion */}
          <div className="lg:col-span-7 space-y-6">

            {/* Horizontal Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-start gap-2">
              {categories.map((cat) => {
                const count = cat === 'All' ? faqsList.length : faqsList.filter((f) => f.category === cat).length;
                const isSelected = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${isSelected
                        ? 'bg-[#023526] text-white shadow-sm'
                        : 'bg-stone-50 text-slate-700 hover:bg-stone-100 border border-stone-200/80'
                      }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${isSelected ? 'bg-white/20 text-white' : 'bg-stone-200/80 text-slate-600'
                        }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search questions (e.g. outstation, insurance, valet)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#023526] shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Accordion Items List */}
            {filteredFaqs.length > 0 ? (
              <div className="space-y-3.5 text-left">
                {filteredFaqs.map((faq, idx) => {
                  const isOpen = openIdx === idx;
                  return (
                    <div
                      key={idx}
                      className={`bg-white rounded-2xl border transition-all overflow-hidden ${isOpen
                          ? 'border-[#023526] ring-2 ring-[#023526]/10 shadow-md'
                          : 'border-stone-200/90 hover:border-stone-300 shadow-2xs'
                        }`}
                    >
                      <button
                        onClick={() => toggle(idx)}
                        className="w-full px-5 py-4 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-900 hover:text-[#023526] focus:outline-none cursor-pointer gap-4"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                            {faq.category}
                          </span>
                          <span>{faq.question}</span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-[#023526] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
                            }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-4.5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-stone-100 pt-3 font-normal">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">No Matching Questions Found</h4>
                <p className="text-xs text-slate-500">Try searching for keywords like "outstation", "valet", "hourly", or "insurance".</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('All');
                  }}
                  className="mt-2 text-xs font-bold text-[#023526] underline cursor-pointer"
                >
                  Clear search filters
                </button>
              </div>
            )}

          </div>
        </div>

      </div>
    </section>
  );
}
