'use client';

import React from 'react';
import Link from 'next/link';
import {
  Crown,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Car,
  Clock,
  Navigation,
  Building2,
  Calculator,
  Ticket,
  Percent,
  UserPlus,
  FileText,
  Lock,
  ArrowUp,
  ArrowRight,
  MessageCircle,
  Headphones,
  KeyRound,
} from 'lucide-react';

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export default function Footer() {
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gradient-to-b from-[#023526] via-[#02281d] to-[#011c14] text-white border-t border-[#c5a880]/30 pt-12 pb-10 relative overflow-hidden">
      {/* Top Shimmer Line */}
      <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#c5a880]/60 to-transparent pointer-events-none z-10" />

      {/* Subtle Geometric SVG Grid Pattern */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.045] z-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="footer-grid-pattern" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#c5a880" strokeWidth="1" />
            <circle cx="48" cy="0" r="1" fill="#c5a880" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#footer-grid-pattern)" />
      </svg>

      {/* Concentric Decorative Rings - Top Right */}
      <div className="absolute -top-48 -right-36 w-[520px] h-[520px] rounded-full border border-[#c5a880]/15 pointer-events-none hidden sm:block" />
      <div className="absolute -top-32 -right-16 w-[380px] h-[380px] rounded-full border border-[#c5a880]/10 border-dashed pointer-events-none hidden sm:block" />
      <div className="absolute -top-16 right-4 w-[240px] h-[240px] rounded-full border border-[#c5a880]/10 pointer-events-none hidden sm:block" />
      <div className="absolute top-12 right-44 w-2 h-2 rounded-full bg-[#c5a880] shadow-[0_0_12px_#c5a880] pointer-events-none hidden sm:block" />

      {/* Concentric Decorative Rings & Floating Diamond - Bottom Left */}
      <div className="absolute -bottom-48 -left-28 w-[420px] h-[420px] rounded-full border border-emerald-400/10 pointer-events-none hidden sm:block" />
      <div className="absolute -bottom-32 -left-12 w-[280px] h-[280px] rounded-full border border-emerald-400/10 border-dashed pointer-events-none hidden sm:block" />
      <div className="absolute bottom-16 left-12 w-16 h-16 rounded-2xl border border-[#c5a880]/15 rotate-45 pointer-events-none hidden lg:block" />

      {/* Soft Ambient Light Glows */}
      <div className="absolute -top-24 left-1/4 w-[450px] h-[450px] bg-[#035940]/40 rounded-full blur-3xl pointer-events-none -translate-y-1/3" />
      <div className="absolute -bottom-24 right-1/4 w-[400px] h-[400px] bg-[#c5a880]/15 rounded-full blur-3xl pointer-events-none translate-y-1/3" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 text-left mb-8">

          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c5a880] via-[#b4966c] to-[#7e6542] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Crown className="w-6 h-6 text-amber-100 fill-amber-100" />
              </div>
              <div>
                <div className="font-bold text-white text-lg tracking-tight">
                  DrivePulse <span className="text-[#c5a880] font-extrabold">& Valet</span>
                </div>
                <p className="text-[10px] font-semibold text-[#c5a880]/80 tracking-wider uppercase">
                  Premier Chauffeurs & Events
                </p>
              </div>
            </Link>

            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Bangalore's premier acting driver & event valet service platform. Providing background-checked hourly acting drivers, outstation chauffeurs, and luxury event valet parking management.
            </p>

            {/* Direct Contact Badges */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <a
                href="tel:+918025211234"
                className="flex items-center gap-2 text-xs font-semibold text-[#c5a880] bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 hover:border-[#c5a880]/40 transition-all shadow-xs"
              >
                <Phone className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>+91 80 2521 1234</span>
              </a>
              <a
                href="mailto:support@drivepulse.in"
                className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 hover:border-[#c5a880]/40 transition-all shadow-xs"
              >
                <Mail className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>support@drivepulse.in</span>
              </a>
            </div>

            {/* Social Media Links with Icons */}
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2.5">
                Connect With Us
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#c5a880] hover:text-[#011811] text-slate-300 flex items-center justify-center transition-all border border-white/10 hover:border-[#c5a880]"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Twitter / X"
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#c5a880] hover:text-[#011811] text-slate-300 flex items-center justify-center transition-all border border-white/10 hover:border-[#c5a880]"
                >
                  <TwitterIcon className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#c5a880] hover:text-[#011811] text-slate-300 flex items-center justify-center transition-all border border-white/10 hover:border-[#c5a880]"
                >
                  <LinkedinIcon className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#c5a880] hover:text-[#011811] text-slate-300 flex items-center justify-center transition-all border border-white/10 hover:border-[#c5a880]"
                >
                  <FacebookIcon className="w-4 h-4" />
                </a>
                <a
                  href="https://wa.me/918025211234"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp Support"
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#25D366] hover:text-white text-slate-300 flex items-center justify-center transition-all border border-white/10 hover:border-[#25D366]"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links: Mobility Services */}
          <div>
            <h4 className="text-xs font-bold text-[#c5a880] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Car className="w-3.5 h-3.5 text-[#c5a880]" />
              <span>Mobility Services</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
              <li>
                <a
                  href="#services"
                  className="flex items-center gap-2 hover:text-[#c5a880] group transition-colors"
                >
                  <Clock className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#c5a880] transition-colors shrink-0" />
                  <span className="group-hover:translate-x-0.5 transition-transform">Hourly Acting Drivers</span>
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="flex items-center gap-2 hover:text-[#c5a880] group transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#c5a880] transition-colors shrink-0" />
                  <span className="group-hover:translate-x-0.5 transition-transform">Outstation Highway Chauffeurs</span>
                </a>
              </li>
              <li>
                <a
                  href="#valet-events"
                  className="flex items-center gap-2 hover:text-[#c5a880] group transition-colors"
                >
                  <Crown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#c5a880] transition-colors shrink-0" />
                  <span className="group-hover:translate-x-0.5 transition-transform">Wedding Valet Parking</span>
                </a>
              </li>
              <li>
                <a
                  href="#valet-events"
                  className="flex items-center gap-2 hover:text-[#c5a880] group transition-colors"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#c5a880] transition-colors shrink-0" />
                  <span className="group-hover:translate-x-0.5 transition-transform">Corporate Summit Valets</span>
                </a>
              </li>
              <li>
                <a
                  href="#calculator"
                  className="flex items-center gap-2 hover:text-[#c5a880] group transition-colors"
                >
                  <Calculator className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#c5a880] transition-colors shrink-0" />
                  <span className="group-hover:translate-x-0.5 transition-transform">Live Fare Estimator</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Driver Partners */}
          <div>
            <h4 className="text-xs font-bold text-[#c5a880] uppercase tracking-wider mb-4 flex items-center gap-2">
              <UserPlus className="w-3.5 h-3.5 text-[#c5a880]" />
              <span>Driver Network</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
              <li>
                <a
                  href="#driver-partner"
                  className="flex items-center gap-2 hover:text-[#c5a880] group transition-colors"
                >
                  <Ticket className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#c5a880] transition-colors shrink-0" />
                  <span className="group-hover:translate-x-0.5 transition-transform">Driver Monthly Pass (₹999)</span>
                </a>
              </li>
              <li>
                <a
                  href="#driver-partner"
                  className="flex items-center gap-2 hover:text-[#c5a880] group transition-colors"
                >
                  <Percent className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#c5a880] transition-colors shrink-0" />
                  <span className="group-hover:translate-x-0.5 transition-transform">Zero Commission Program</span>
                </a>
              </li>
              <li>
                <a
                  href="#driver-partner"
                  className="flex items-center gap-2 hover:text-[#c5a880] group transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#c5a880] transition-colors shrink-0" />
                  <span className="group-hover:translate-x-0.5 transition-transform">Join as Driver Partner</span>
                </a>
              </li>
              <li>
                <a
                  href="#safety"
                  className="flex items-center gap-2 hover:text-[#c5a880] group transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#c5a880] transition-colors shrink-0" />
                  <span className="group-hover:translate-x-0.5 transition-transform">Driver Verification Standard</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Location & Support */}
          <div>
            <h4 className="text-xs font-bold text-[#c5a880] uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#c5a880]" />
              <span>Headquarters</span>
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#c5a880] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  DrivePulse Towers, 100ft Road, Indiranagar, Bengaluru, KA 560038
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>24/7 Operations Hub Online</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                <Headphones className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
                <span>Instant dispatch within 15-25 mins</span>
              </div>
              <div className="pt-2 border-t border-white/10 mt-2">
                <Link
                  href="/contact-us"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c5a880] hover:text-white transition-colors group"
                >
                  <span>Contact Us & Support Hub</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#c5a880] group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-2 border-t border-white/10 flex flex-col lg:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <span>© {new Date().getFullYear()} DrivePulse & Valet Technologies Pvt Ltd. All rights reserved.</span>
            <span className="hidden sm:inline text-white/20">•</span>
            <span className="text-slate-400">
              Designed & Developed by{' '}
              <a
                href="https://digitalraiz.co.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#c5a880] hover:text-[#e4cfb4] font-semibold transition-colors underline-offset-2 hover:underline"
              >
                Digitalraiz Creative Solutions
              </a>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link
              href="/privacy-policy"
              className="flex items-center gap-1.5 hover:text-[#c5a880] transition-colors group"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#c5a880] transition-colors" />
              <span>Privacy Policy</span>
            </Link>

            <Link
              href="/terms-and-conditions"
              className="flex items-center gap-1.5 hover:text-[#c5a880] transition-colors group"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#c5a880] transition-colors" />
              <span>Terms of Service</span>
            </Link>

            {/* Back to top button */}
            <button
              type="button"
              onClick={scrollToTop}
              title="Back to Top"
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-[#c5a880] text-slate-400 hover:text-[#011811] flex items-center justify-center border border-white/10 transition-all cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
