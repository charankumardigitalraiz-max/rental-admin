'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/website/ui/Navbar';
import Footer from '@/components/website/ui/Footer';
import {
  ShieldCheck,
  FileCheck,
  Scale,
  AlertTriangle,
  Car,
  Clock,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Shield,
  Eye,
  CheckCircle2,
  Mail,
  Phone
} from 'lucide-react';

export default function TermsConditionsPage() {
  const [activeSection, setActiveSection] = useState<string>('acceptance');

  const sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms', icon: FileCheck },
    { id: 'services', title: '2. Mobility & Valet Scope', icon: Car },
    { id: 'obligations', title: '3. Customer Obligations', icon: Clock },
    { id: 'payments', title: '4. Fares & Cancellations', icon: RefreshCw },
    { id: 'liability', title: '5. Limitation of Liability', icon: AlertTriangle },
    { id: 'jurisdiction', title: '6. Law & Dispute Resolution', icon: Scale },
  ];

  React.useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    };

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -120;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-slate-800 selection:bg-[#c5a880] selection:text-white">
      {/* Navigation Header */}
      <Navbar onOpenBooking={() => { }} />

      {/* Hero Header Banner (Light Luxe Theme) */}
      <div className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-b from-[#023526]/5 via-[#faf8f5] to-[#faf8f5] border-b border-stone-200/60">
        {/* Subtle Decorative Glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-gradient-to-tr from-[#c5a880]/15 to-emerald-400/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#023526]/10 border border-[#023526]/15 text-[#023526] text-xs font-bold tracking-wide uppercase mb-4 shadow-2xs">
            <Scale className="w-4 h-4 text-[#9c7f56]" />
            <span>Master Service Agreement</span>
          </div> */}

          <h1 className="text-4xl sm:text-5xl font-black text-[#011811] tracking-tight leading-tight">
            Terms & <span className="text-[#023526]">Conditions</span>
          </h1>

          <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Please read these terms carefully before booking acting drivers, outstation chauffeurs, or event valet parking services with DrivePulse.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full border border-stone-200 shadow-2xs">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              Verified Driver Guarantee
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full border border-stone-200 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#9c7f56]" />
              Insured Key Custody
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full border border-stone-200 shadow-2xs text-slate-500">
              Effective: Sep 23, 2026
            </span>
          </div>
        </div>
      </div>

      {/* Main Container with Sticky Index Sidebar & Light Content Cards */}
      <main className="flex-1 pb-24 pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Quick Navigation Index (Sticky Menu) */}
          <aside className="lg:col-span-3 sticky top-28 hidden lg:block">
            <div className="bg-white/90 backdrop-blur-md border border-stone-200/90 rounded-md p-5 shadow-xl space-y-2">
              <div className="px-3 py-2 text-xs font-extrabold uppercase tracking-wider text-[#023526] flex items-center justify-between">
                <span>Terms Navigation</span>
                <Eye className="w-4 h-4 text-[#9c7f56]" />
              </div>
              <div className="h-px bg-stone-200/80 mb-3" />

              {sections.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all text-left ${isActive
                      ? 'bg-gradient-to-r from-[#023526] to-[#012218] text-white shadow-md font-bold'
                      : 'text-slate-700 hover:bg-stone-100 hover:text-[#023526]'
                      }`}
                  >
                    <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#c5a880]' : 'text-[#023526]'}`} />
                    <span className="truncate">{item.title}</span>
                  </button>
                );
              })}

              <div className="pt-4 mt-2 border-t border-stone-200/80">
                <div className="p-3.5 rounded-2xl bg-[#023526]/5 border border-[#023526]/10 text-xs">
                  <p className="font-bold text-[#011811] mb-1">Questions on Terms?</p>
                  <p className="text-[11px] text-slate-600 mb-3 leading-normal">Our legal desk is ready to clarify your service queries.</p>
                  <a
                    href="mailto:legal@drivepulse.in"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#023526] hover:underline"
                  >
                    <span>Contact Legal Team</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#9c7f56]" />
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Premium Light Mode Terms Cards */}
          <div className="lg:col-span-9 space-y-8">

            {/* SECTION 1: Acceptance */}
            <section
              id="acceptance"
              className="bg-white rounded-md p-6 sm:p-8 border border-stone-200/90 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-stone-100">
                <div className="w-10 h-10 rounded-2xl bg-[#023526]/10 border border-[#023526]/20 flex items-center justify-center text-[#023526]">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#011811] tracking-tight">
                    1. Acceptance of Terms
                  </h2>
                  <p className="text-xs text-[#9c7f56] font-semibold">Binding contractual agreement</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <p>
                  Welcome to <strong className="text-[#011811]">DrivePulse & Valet Technologies Pvt Ltd</strong> (&quot;DrivePulse&quot;). By creating an account, reserving acting drivers, contracting event valet operations, or subscribing to driver partner passes, you explicitly agree to adhere to these Terms & Conditions (&quot;Terms&quot;).
                </p>
                <p>
                  If you disagree with any portion of these Terms, you must immediately cease using our web application and driver assignment services.
                </p>
              </div>
            </section>

            {/* SECTION 2: Mobility & Valet Scope */}
            <section
              id="services"
              className="bg-white rounded-md p-6 sm:p-8 border border-stone-200/90 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-stone-100">
                <div className="w-10 h-10 rounded-2xl bg-[#023526]/10 border border-[#023526]/20 flex items-center justify-center text-[#023526]">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#011811] tracking-tight">
                    2. Scope of Mobility & Valet Services
                  </h2>
                  <p className="text-xs text-[#9c7f56] font-semibold">Core service categories provided by DrivePulse</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-stone-200/70 hover:border-stone-300 transition-colors">
                  <div className="font-bold text-[#023526] text-xs sm:text-sm flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-[#9c7f56]" />
                    <span>Hourly Acting Drivers</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-normal">
                    Background-verified chauffeurs assigned to drive customer-owned private cars for hourly city commutes.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-stone-200/70 hover:border-stone-300 transition-colors">
                  <div className="font-bold text-[#023526] text-xs sm:text-sm flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-[#9c7f56]" />
                    <span>Outstation Chauffeurs</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-normal">
                    Highway-experienced drivers for inter-city, round trips, or multi-day long-distance travel.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-stone-200/70 hover:border-stone-300 transition-colors">
                  <div className="font-bold text-[#023526] text-xs sm:text-sm flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-[#9c7f56]" />
                    <span>Event Valet Management</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-normal">
                    Uniformed valet teams, key safe management, and vehicle parking logistics for weddings and corporate summits.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-stone-200/70 hover:border-stone-300 transition-colors">
                  <div className="font-bold text-[#023526] text-xs sm:text-sm flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-[#9c7f56]" />
                    <span>Driver Monthly Pass (₹999)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-normal">
                    Subscription access for driver partners offering zero-commission ride leads and priority dispatch benefits.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 3: Obligations */}
            <section
              id="obligations"
              className="bg-white rounded-md p-6 sm:p-8 border border-stone-200/90 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-stone-100">
                <div className="w-10 h-10 rounded-2xl bg-[#023526]/10 border border-[#023526]/20 flex items-center justify-center text-[#023526]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#011811] tracking-tight">
                    3. Customer Obligations & Vehicle Fitness
                  </h2>
                  <p className="text-xs text-[#9c7f56] font-semibold">Prerequisites for assigning acting drivers</p>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <p>When booking a driver, vehicle owners guarantee that:</p>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-[#faf8f5] border border-stone-200/70">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Vehicle possesses valid Registration Certificate (RC), Comprehensive Motor Insurance, and valid PUC certificate.</span>
                  </li>
                  <li className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-[#faf8f5] border border-stone-200/70">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Vehicle is in mechanically sound condition with adequate fuel/charge, functional brakes, lights, and tires.</span>
                  </li>
                  <li className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-[#faf8f5] border border-stone-200/70">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>The driver will not be requested to exceed passenger capacity, overspeed, or transport prohibited substances.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* SECTION 4: Fares & Cancellations */}
            <section
              id="payments"
              className="bg-white rounded-md p-6 sm:p-8 border border-stone-200/90 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-stone-100">
                <div className="w-10 h-10 rounded-2xl bg-[#023526]/10 border border-[#023526]/20 flex items-center justify-center text-[#023526]">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#011811] tracking-tight">
                    4. Fares, Payments & Cancellation Rules
                  </h2>
                  <p className="text-xs text-[#9c7f56] font-semibold">Transparent pricing structure and cancellation terms</p>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-stone-200/80 space-y-2">
                  <div className="font-bold text-[#011811] text-xs">Fare Computation:</div>
                  <p className="text-xs text-slate-600 leading-normal">
                    Fares are calculated based on selected hourly packages, night allowances (10 PM - 6 AM), outstation daily caps, and extra time billed in 15-minute increments.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-stone-200/80 space-y-2">
                  <div className="font-bold text-[#011811] text-xs">Zero Penalty Cancellation Policy:</div>
                  <p className="text-xs text-slate-600 leading-normal">
                    Cancellations made 30 minutes prior to scheduled start time incur <strong>zero cancellation fee</strong>. Late cancellations following driver dispatch incur a nominal ₹100 dispatch compensation fee.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 5: Liability */}
            <section
              id="liability"
              className="bg-white rounded-md p-6 sm:p-8 border border-stone-200/90 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-stone-100">
                <div className="w-10 h-10 rounded-2xl bg-[#023526]/10 border border-[#023526]/20 flex items-center justify-center text-[#023526]">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#011811] tracking-tight">
                    5. Limitation of Liability & Insurance Scope
                  </h2>
                  <p className="text-xs text-[#9c7f56] font-semibold">Operational legal liabilities and insurance limits</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-950 text-xs mb-4 leading-relaxed font-medium">
                <strong className="text-amber-950 font-bold">Motor Vehicle Act Compliance:</strong> Under Indian traffic regulations, primary liability for third-party claims or accidental damage rests with the vehicle&apos;s motor insurance policy.
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                DrivePulse conducts rigorous background checks and driving evaluations for all chauffeurs. In valet management operations, DrivePulse maintains designated key security protocols and provides structured insurance reviews for proven physical damages incurred within active valet parking enclosures.
              </p>
            </section>

            {/* SECTION 6: Law & Jurisdiction */}
            <section
              id="jurisdiction"
              className="bg-gradient-to-br from-[#023526] to-[#012218] text-white rounded-md p-6 sm:p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#c5a880] to-[#b4966c] flex items-center justify-center text-[#011811]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    6. Governing Law & Dispute Resolution
                  </h2>
                  <p className="text-xs text-[#c5a880] font-semibold">Jurisdiction in Bengaluru, Karnataka</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-200">
                <p>
                  These Terms shall be interpreted in accordance with the laws of India. Any legal dispute or claim arising from DrivePulse operations shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka.
                </p>

                <div className="mt-4 p-5 rounded-2xl bg-black/20 border border-[#c5a880]/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                  <div>
                    <p className="font-bold text-[#c5a880] text-sm">DrivePulse Legal Helpdesk</p>
                    <p className="text-slate-300 text-xs mt-0.5">Need legal support or formal notices?</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href="mailto:legal@drivepulse.in"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#c5a880] to-[#b4966c] text-[#011811] font-bold text-xs shadow-md hover:brightness-110"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>legal@drivepulse.in</span>
                    </a>
                  </div>
                </div>
              </div>
            </section>

          </div>

        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
