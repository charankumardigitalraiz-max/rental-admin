'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/website/ui/Navbar';
import Footer from '@/components/website/ui/Footer';
import {
  ShieldCheck,
  Lock,
  FileText,
  UserCheck,
  Bell,
  Scale,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
  Eye,
  Server
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState<string>('overview');

  const sections = [
    { id: 'overview', title: '1. Overview & Commitment', icon: Lock },
    { id: 'collection', title: '2. Information We Collect', icon: FileText },
    { id: 'usage', title: '3. How We Use Information', icon: UserCheck },
    { id: 'sharing', title: '4. Third-Party Data Sharing', icon: Bell },
    { id: 'security', title: '5. Security & Retention', icon: Server },
    { id: 'rights', title: '6. Rights & Contact Info', icon: ShieldCheck },
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
            <ShieldCheck className="w-4 h-4 text-[#9c7f56]" />
            <span>Data Governance & Protection Policy</span>
          </div> */}

          <h1 className="text-4xl sm:text-5xl font-black text-[#011811] tracking-tight leading-tight">
            Privacy <span className="text-[#023526]">Policy</span>
          </h1>

          <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Your trust is our cornerstone. Learn how DrivePulse & Valet protects, manages, and respects your privacy and personal information.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full border border-stone-200 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#9c7f56]" />
              DPDP Act (India) Compliant
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full border border-stone-200 shadow-2xs">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              256-Bit SSL Encrypted
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full border border-stone-200 shadow-2xs text-slate-500">
              Updated: Sep 23, 2026
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
                <span>Policy Navigation</span>
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
                  <p className="font-bold text-[#011811] mb-1">Need Clarification?</p>
                  <p className="text-[11px] text-slate-600 mb-3 leading-normal">Our legal response team typically replies within 24 hours.</p>
                  <a
                    href="mailto:privacy@drivepulse.in"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#023526] hover:underline"
                  >
                    <span>Email Privacy Desk</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#9c7f56]" />
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Premium Light Mode Policy Cards */}
          <div className="lg:col-span-9 space-y-8">

            {/* SECTION 1: Overview */}
            <section
              id="overview"
              className="bg-white rounded-md p-6 sm:p-8 border border-stone-200/90 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-stone-100">
                <div className="w-10 h-10 rounded-2xl bg-[#023526]/10 border border-[#023526]/20 flex items-center justify-center text-[#023526]">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#011811] tracking-tight">
                    1. Overview & Operational Scope
                  </h2>
                  <p className="text-xs text-[#9c7f56] font-semibold">Commitment to transparency and legal compliance</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <p>
                  At <strong className="text-[#011811]">DrivePulse & Valet Technologies Pvt Ltd</strong> (&quot;DrivePulse&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), protecting your privacy is integral to how we design, deliver, and manage our acting driver assignments, outstation chauffeurs, and luxury event valet parking solutions.
                </p>
                <p>
                  This Privacy Policy details the policies governing the collection, utilization, processing, storage, and protection of your personal information. It applies across our digital platforms, mobile interfaces, booking web apps, and offline event services in compliance with the <span className="text-[#023526] font-bold">Digital Personal Data Protection (DPDP) Act, 2023</span> and the <span className="text-[#023526] font-bold">Information Technology Act, 2000</span>.
                </p>
              </div>
            </section>

            {/* SECTION 2: Information Collected */}
            <section
              id="collection"
              className="bg-white rounded-md p-6 sm:p-8 border border-stone-200/90 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-stone-100">
                <div className="w-10 h-10 rounded-2xl bg-[#023526]/10 border border-[#023526]/20 flex items-center justify-center text-[#023526]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#011811] tracking-tight">
                    2. Information We Collect
                  </h2>
                  <p className="text-xs text-[#9c7f56] font-semibold">Categorized details of collected user & driver data</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-stone-200/70 hover:border-stone-300 transition-colors">
                  <div className="font-bold text-[#023526] text-xs sm:text-sm flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-[#9c7f56]" />
                    <span>Contact Information</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-normal">
                    Full legal name, phone number, email address, residential address, and preferred pickup or vehicle drop-off coordinates.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-stone-200/70 hover:border-stone-300 transition-colors">
                  <div className="font-bold text-[#023526] text-xs sm:text-sm flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-[#9c7f56]" />
                    <span>Booking & Vehicle Specs</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-normal">
                    Vehicle make, model, registration number, transmission type (Manual/Automatic), trip itineraries, and event valet scale.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-stone-200/70 hover:border-stone-300 transition-colors">
                  <div className="font-bold text-[#023526] text-xs sm:text-sm flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-[#9c7f56]" />
                    <span>Driver Partner Verification</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-normal">
                    Aadhaar, PAN, Driving License details, address proofs, background check verification records, and police clearances.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-stone-200/70 hover:border-stone-300 transition-colors">
                  <div className="font-bold text-[#023526] text-xs sm:text-sm flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-[#9c7f56]" />
                    <span>Real-time Telematics & GPS</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-normal">
                    Precise real-time GPS location collected during active trips to manage driver routing, ETA updates, and emergency safety.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 3: Usage Purposes */}
            <section
              id="usage"
              className="bg-white rounded-md p-6 sm:p-8 border border-stone-200/90 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-stone-100">
                <div className="w-10 h-10 rounded-2xl bg-[#023526]/10 border border-[#023526]/20 flex items-center justify-center text-[#023526]">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#011811] tracking-tight">
                    3. How We Use Your Information
                  </h2>
                  <p className="text-xs text-[#9c7f56] font-semibold">Strict operational purposes and service delivery</p>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#faf8f5] border border-stone-200/60">
                  <div className="w-6 h-6 rounded-full bg-[#023526] text-[#c5a880] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-[#011811]">Chauffeur & Valet Assignment</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Connecting background-verified drivers to your vehicle for hourly, outstation, or event requests.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#faf8f5] border border-stone-200/60">
                  <div className="w-6 h-6 rounded-full bg-[#023526] text-[#c5a880] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-[#011811]">Fare Estimations & Instant Receipts</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Calculating distance-based rates, sending trip status notifications, GST invoices, and WhatsApp confirmations.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#faf8f5] border border-stone-200/60">
                  <div className="w-6 h-6 rounded-full bg-[#023526] text-[#c5a880] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-[#011811]">Driver Partner Pass & Commission Settlement</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Managing driver zero-commission subscriptions (e.g. ₹999 monthly pass) and instant digital wallet payouts.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 4: Data Sharing */}
            <section
              id="sharing"
              className="bg-white rounded-md p-6 sm:p-8 border border-stone-200/90 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-stone-100">
                <div className="w-10 h-10 rounded-2xl bg-[#023526]/10 border border-[#023526]/20 flex items-center justify-center text-[#023526]">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#011811] tracking-tight">
                    4. Third-Party Data Sharing
                  </h2>
                  <p className="text-xs text-[#9c7f56] font-semibold">No commercial data selling guaranteed</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs mb-4 leading-relaxed font-medium">
                <strong className="text-amber-950 font-bold">Zero Data Monetization Guarantee:</strong> DrivePulse does NOT sell, monetize, or trade your personal contact or location data with third-party advertisers or marketing agencies.
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <p>Data is shared strictly on a need-to-know basis with trusted partners:</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <li className="p-3.5 rounded-2xl bg-[#faf8f5] border border-stone-200/70">
                    <strong className="text-[#011811] block mb-1">Assigned Chauffeur Partners</strong>
                    Pickup location & contact details necessary to perform your requested service.
                  </li>
                  <li className="p-3.5 rounded-2xl bg-[#faf8f5] border border-stone-200/70">
                    <strong className="text-[#011811] block mb-1">PCI-DSS Payment Gateways</strong>
                    Encrypted transactions via secure processors (e.g. Razorpay, UPI APIs).
                  </li>
                  <li className="p-3.5 rounded-2xl bg-[#faf8f5] border border-stone-200/70">
                    <strong className="text-[#011811] block mb-1">Verification Authorities</strong>
                    Police database API checks for driver criminal history verification.
                  </li>
                  <li className="p-3.5 rounded-2xl bg-[#faf8f5] border border-stone-200/70">
                    <strong className="text-[#011811] block mb-1">Statutory Compliance</strong>
                    Law enforcement agencies upon valid judicial court warrants.
                  </li>
                </ul>
              </div>
            </section>

            {/* SECTION 5: Security & Retention */}
            <section
              id="security"
              className="bg-white rounded-md p-6 sm:p-8 border border-stone-200/90 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-stone-100">
                <div className="w-10 h-10 rounded-2xl bg-[#023526]/10 border border-[#023526]/20 flex items-center justify-center text-[#023526]">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#011811] tracking-tight">
                    5. Data Security & Technical Guardrails
                  </h2>
                  <p className="text-xs text-[#9c7f56] font-semibold">Enterprise-grade encryption and storage protocols</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <p>
                  We deploy robust technical and organizational safeguards, including SSL/TLS 1.3 transport encryption, AES-256 database storage encryption, role-based access restrictions, and periodic vulnerability penetration testing.
                </p>
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-stone-200/80 space-y-2">
                  <h4 className="font-bold text-[#011811] text-xs">Retention Schedule:</h4>
                  <p className="text-xs text-slate-600">
                    Active trip logs and booking records are retained for up to 3 years to comply with tax, insurance claim, and municipal transport regulations, after which data is permanently scrubbed or anonymized.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 6: Rights & Contact */}
            <section
              id="rights"
              className="bg-gradient-to-br from-[#023526] to-[#012218] text-white rounded-md p-6 sm:p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a880]/10 rounded-bl-full pointer-events-none" />

              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-white/10 relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#c5a880] to-[#b4966c] flex items-center justify-center text-[#011811]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    6. Your Privacy Rights & Grievance Contact
                  </h2>
                  <p className="text-xs text-[#c5a880] font-semibold">Dedicated support for privacy requests</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-200 relative z-10">
                <p>
                  Under Indian data protection laws, you retain the right to review, update, export, or request deletion of your personal profile and data records.
                </p>

                <div className="mt-4 p-5 rounded-2xl bg-black/20 border border-[#c5a880]/30 space-y-3">
                  <div className="font-bold text-[#c5a880] text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Data Protection & Grievance Officer</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 pt-1">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[#c5a880] shrink-0 mt-0.5" />
                      <span>DrivePulse Towers, 100ft Road, Indiranagar, Bengaluru, KA 560038</span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#c5a880]" />
                        <a href="mailto:privacy@drivepulse.in" className="hover:text-white underline">privacy@drivepulse.in</a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#c5a880]" />
                        <span>+91 80 2521 1234</span>
                      </div>
                    </div>
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
