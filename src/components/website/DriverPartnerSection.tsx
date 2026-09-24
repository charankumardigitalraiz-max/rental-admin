'use client';

import React, { useState } from 'react';
import { Award, Ticket, CheckCircle2, ShieldCheck, Zap, Phone, UserCheck, ArrowRight } from 'lucide-react';
import { driverSubscriptionPlans } from '@/data/websiteData';

export default function DriverPartnerSection() {
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const handleRegisterDriver = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisteredSuccess(true);
  };

  return (
    <section id="driver-partner" className="py-12 md:py-16 bg-white text-slate-900 relative overflow-hidden ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* 2-Column Section Layout: Title & Content on Left, Subscription Card on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Side: Title & Info */}
          <div className="lg:col-span-5 text-left space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#023526]/10 via-[#c5a880]/15 to-[#023526]/10 border border-[#c5a880]/40 text-[#023526] text-xs font-bold tracking-wide shadow-2xs">
              <Award className="w-4 h-4 text-[#c5a880]" />
              <span>Driver Partner Subscription Hub</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 tracking-tight leading-tight">
              Drive with Us & Keep{' '}
              <span className="bg-gradient-to-r from-[#023526] via-[#c5a880] to-[#023526] bg-clip-text text-transparent">
                100% of Your Earnings
              </span>
            </h2>

            <p className="text-slate-600 text-base sm:text-lg font-normal leading-relaxed">
              Are you a professional commercial driver in Bangalore? Subscribe to our monthly pass for just ₹999 and enjoy unlimited ride dispatches with zero platform commission!
            </p>

            {/* Quick Benefits Bullet Points */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-800 bg-stone-50 p-3 rounded-xl border border-stone-200/80">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block text-xs">100% Zero Commission</span>
                  <span className="text-slate-500 text-[11px]">Keep every rupee earned from fares directly</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold text-slate-800 bg-stone-50 p-3 rounded-xl border border-stone-200/80">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block text-xs">Instant Dispatch Matching</span>
                  <span className="text-slate-500 text-[11px]">Get matched with nearby local & outstation rides</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Single Subscription Plan Card */}
          <div className="lg:col-span-7">
            {driverSubscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 sm:p-8 bg-white border transition-all duration-300 relative text-left shadow-lg hover:shadow-2xl flex flex-col justify-between ${plan.popular
                  ? 'border-[#023526] ring-2 ring-[#023526]/20'
                  : 'border-stone-200/90'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 right-6 bg-[#023526] text-[#c5a880] text-[10px] font-extrabold uppercase px-3.5 py-1 rounded-full shadow-md border border-[#c5a880]/30">
                    Most Popular Driver Pass
                  </div>
                )}

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#023526] shrink-0">
                        <Ticket className="w-6 h-6 text-[#023526]" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{plan.name}</h3>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                          {plan.commission}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2 bg-stone-50 px-4 py-2 rounded-2xl border border-stone-200/80">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900">₹{plan.price}</span>
                      <span className="text-slate-500 text-xs font-semibold">{plan.period}</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed font-normal">{plan.description}</p>

                  <div className="space-y-3 mb-8 bg-stone-50/50 p-4 sm:p-5 rounded-2xl border border-stone-100">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs font-medium text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setShowRegisterForm(true)}
                  className="w-full py-4 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md bg-[#023526] hover:bg-[#012218] text-white"
                >
                  <UserCheck className="w-5 h-5 text-[#c5a880]" />
                  <span>Join as Driver Partner</span>
                </button>
              </div>
            ))}
          </div>

        </div>

        {/* Driver Registration Modal Popup */}
        {showRegisterForm && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-stone-200 max-w-md w-full p-6 text-left relative shadow-2xl">
              <button
                onClick={() => {
                  setShowRegisterForm(false);
                  setRegisteredSuccess(false);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 font-bold w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
              >
                ✕
              </button>

              {!registeredSuccess ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#023526] flex items-center justify-center text-white">
                      <UserCheck className="w-5 h-5 text-[#c5a880]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Driver Partner Registration</h3>
                      <p className="text-xs text-slate-500">Join DrivePulse & Get Approved in 24 Hrs</p>
                    </div>
                  </div>

                  <form onSubmit={handleRegisterDriver} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
                      <input
                        type="text"
                        required
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        placeholder="e.g. Vikram Singh"
                        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#023526]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={driverPhone}
                        onChange={(e) => setDriverPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#023526]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Driving License Number</label>
                      <input
                        type="text"
                        required
                        value={driverLicense}
                        onChange={(e) => setDriverLicense(e.target.value)}
                        placeholder="KA-04-20180091234"
                        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#023526]"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full bg-[#023526] hover:bg-[#012218] text-white font-extrabold text-xs py-3 rounded-xl shadow-md cursor-pointer"
                      >
                        Submit Driver Application
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Application Submitted!</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Thank you, <span className="font-bold text-slate-900">{driverName}</span>. Our verification team will review your license <span className="font-mono font-bold text-slate-800">{driverLicense}</span> and contact you at {driverPhone} within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setShowRegisterForm(false);
                      setRegisteredSuccess(false);
                    }}
                    className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
