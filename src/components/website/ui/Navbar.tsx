'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Crown, Phone, Menu, X, Car, ChevronRight } from 'lucide-react';

interface NavbarProps {
  onOpenBooking: (serviceType?: string) => void;
}

export default function Navbar({ onOpenBooking }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 pointer-events-none transition-all duration-300 ${
        isScrolled ? 'px-0 pt-0' : 'px-0 sm:px-6 pt-0 sm:pt-4'
      }`}
    >
      <div className={`mx-auto flex flex-col items-start justify-start relative pointer-events-auto transition-all duration-300 ${
        isScrolled ? 'w-full max-w-none' : 'max-w-7xl'
      }`}>

        {/* Main Navbar Bar */}
        <div
          className={`transition-all duration-300 ease-in-out flex items-center justify-between gap-2 sm:gap-6 overflow-hidden w-full ${
            isScrolled
              ? 'py-2.5 sm:py-3 px-3.5 sm:px-10 rounded-none bg-[#02281d]/98 text-white border-b border-[#c5a880]/30 backdrop-blur-xl shadow-2xl'
              : 'py-2.5 sm:py-3 px-3.5 sm:px-7 rounded-none sm:rounded-2xl bg-white/95 text-slate-900 border-b sm:border border-stone-200/90 backdrop-blur-lg shadow-xl'
          }`}
        >
          {/* LEFT GROUP: Brand Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
              <div className="relative">
                <div
                  className={`rounded-xl flex items-center justify-center text-white shadow-md transition-all duration-300 ${
                    isScrolled
                      ? 'w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 bg-gradient-to-br from-[#d4af37] via-[#c5a880] to-[#8c734b] ring-1 ring-[#c5a880]/50 shadow-[0_0_15px_rgba(197,168,128,0.3)]'
                      : 'w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#023526] to-[#012218] ring-2 ring-[#023526]/20'
                  }`}
                >
                  <Crown
                    className={`transition-all duration-300 ${
                      isScrolled
                        ? 'w-4.5 h-4.5 sm:w-5 sm:h-5 text-slate-950 fill-slate-950/90'
                        : 'w-5 h-5 text-[#c5a880] fill-[#c5a880]'
                    }`}
                  />
                </div>
                {!isScrolled && (
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-500 ring-2 ring-white rounded-full flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                  </span>
                )}
              </div>

              <div>
                <div
                  className={`font-bold tracking-tight flex items-center gap-1 sm:gap-1.5 transition-all duration-300 ${
                    isScrolled ? 'text-sm sm:text-base text-white' : 'text-base sm:text-lg text-slate-900'
                  }`}
                >
                  DrivePulse{' '}
                  <span className={isScrolled ? 'text-[#c5a880] font-extrabold' : 'text-[#023526] font-extrabold'}>
                    & Valet
                  </span>
                </div>
                {!isScrolled && (
                  <p className="hidden sm:flex text-[9.5px] font-bold tracking-widest uppercase items-center gap-1 text-[#9c7f56] transition-opacity duration-300">
                    <span>Premier Chauffeurs & Events</span>
                  </p>
                )}
              </div>
            </Link>
          </div>

          {/* CENTER GROUP: Desktop Navigation Links */}
          <nav
            className={`hidden lg:flex items-center gap-1 text-xs font-semibold p-1 rounded-full border transition-all duration-300 ${
              isScrolled
                ? 'bg-white/10 text-slate-100 border-white/15'
                : 'bg-slate-100/90 text-slate-800 border-slate-200/80'
            }`}
          >
            <a
              href="#services"
              className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                isScrolled
                  ? 'hover:text-[#c5a880] hover:bg-white/10'
                  : 'hover:text-[#023526] hover:bg-white hover:shadow-2xs text-slate-700'
              }`}
            >
              Services
            </a>
            <a
              href="#calculator"
              className={`px-4 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                isScrolled
                  ? 'hover:text-[#c5a880] hover:bg-white/10'
                  : 'hover:text-[#023526] hover:bg-white hover:shadow-2xs text-slate-700'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Fare Estimator
            </a>
            <a
              href="#valet-events"
              className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                isScrolled
                  ? 'hover:text-[#c5a880] hover:bg-white/10'
                  : 'hover:text-[#023526] hover:bg-white hover:shadow-2xs text-slate-700'
              }`}
            >
              Valet Events
            </a>
            <a
              href="#driver-partner"
              className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                isScrolled
                  ? 'hover:text-[#c5a880] hover:bg-white/10'
                  : 'hover:text-[#023526] hover:bg-white hover:shadow-2xs text-slate-700'
              }`}
            >
              Driver Pass
            </a>
            <a
              href="#safety"
              className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                isScrolled
                  ? 'hover:text-[#c5a880] hover:bg-white/10'
                  : 'hover:text-[#023526] hover:bg-white hover:shadow-2xs text-slate-700'
              }`}
            >
              Safety
            </a>
            <a
              href="#faqs"
              className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                isScrolled
                  ? 'hover:text-[#c5a880] hover:bg-white/10'
                  : 'hover:text-[#023526] hover:bg-white hover:shadow-2xs text-slate-700'
              }`}
            >
              FAQs
            </a>
          </nav>

          {/* RIGHT GROUP: Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Phone button (Desktop only) */}
            <a
              href="tel:+918025211234"
              className={`hidden lg:flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border transition-all ${
                isScrolled
                  ? 'text-[#02281d] bg-[#c5a880] hover:bg-[#d5b88f] border-[#c5a880] shadow-sm'
                  : 'text-[#023526] bg-emerald-50 hover:bg-emerald-100 border-emerald-200/80'
              }`}
            >
              <Phone className={`w-3.5 h-3.5 ${isScrolled ? 'text-[#02281d]' : 'text-[#023526]'}`} />
              <span>+91 80 2521 1234</span>
            </a>

            {/* Desktop Book Now Button */}
            <button
              onClick={() => onOpenBooking('local')}
              className="hidden sm:relative sm:group overflow-hidden rounded-xl p-px font-bold text-xs cursor-pointer transition-all duration-300 active:scale-95 shadow-[0_4px_20px_rgba(2,53,38,0.25)] hover:shadow-[0_6px_25px_rgba(2,53,38,0.4)]"
            >
              <span
                className={`absolute inset-0 transition-opacity duration-300 group-hover:opacity-90 ${
                  isScrolled
                    ? 'bg-gradient-to-r from-[#d4af37] via-[#f7e4af] to-[#9c7f56]'
                    : 'bg-gradient-to-r from-[#023526] via-[#c5a880] to-[#023526]'
                }`}
              ></span>
              <span
                className={`relative flex items-center gap-1.5 transition-all duration-300 ${
                  isScrolled
                    ? 'px-4 py-2 rounded-[11px] bg-gradient-to-r from-[#d4af37] via-[#f5e6b3] to-[#c5a880] text-[#011d15] font-extrabold'
                    : 'px-4 py-2 rounded-[11px] bg-gradient-to-r from-[#023526] to-[#012218] text-white font-extrabold'
                }`}
              >
                <Car className={`w-4 h-4 ${isScrolled ? 'text-[#011d15]' : 'text-[#c5a880]'}`} />
                <span>Book Driver Now</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${isScrolled ? 'text-[#011d15]' : 'text-[#c5a880]'}`} />
              </span>
            </button>

            {/* Mobile Menu Icon Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 sm:p-2.5 rounded-xl border transition-all active:scale-95 focus:outline-none flex items-center justify-center ${
                isScrolled
                  ? 'text-[#c5a880] bg-white/10 hover:bg-white/20 border-white/20 shadow-xs'
                  : 'text-[#023526] bg-slate-100 hover:bg-slate-200/80 border-slate-200/90 shadow-2xs'
              }`}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-rose-400" />
              ) : (
                <Menu className={`w-5.5 h-5.5 ${isScrolled ? 'text-[#c5a880]' : 'text-[#023526]'}`} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            className={`w-full backdrop-blur-2xl border-x border-b sm:border rounded-b-2xl sm:rounded-2xl p-4 sm:p-5 mt-0 sm:mt-2 shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 pointer-events-auto ${
              isScrolled
                ? 'bg-[#011d15]/98 border-[#c5a880]/30 text-white'
                : 'bg-white/98 border-slate-200 text-slate-800'
            }`}
          >
            <div className="grid grid-cols-1 gap-1">
              <a
                href="#services"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                  isScrolled ? 'hover:bg-white/10 text-slate-100' : 'hover:bg-slate-100 text-slate-800'
                }`}
              >
                <span>Services</span>
                <ChevronRight className="w-4 h-4 text-[#c5a880]" />
              </a>
              <a
                href="#calculator"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                  isScrolled ? 'hover:bg-white/10 text-slate-100' : 'hover:bg-slate-100 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>Fare Estimator</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#c5a880]" />
              </a>
              <a
                href="#valet-events"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                  isScrolled ? 'hover:bg-white/10 text-slate-100' : 'hover:bg-slate-100 text-slate-800'
                }`}
              >
                <span>Valet Events</span>
                <ChevronRight className="w-4 h-4 text-[#c5a880]" />
              </a>
              <a
                href="#driver-partner"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                  isScrolled ? 'hover:bg-white/10 text-slate-100' : 'hover:bg-slate-100 text-slate-800'
                }`}
              >
                <span>Driver Pass</span>
                <ChevronRight className="w-4 h-4 text-[#c5a880]" />
              </a>
              <a
                href="#safety"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                  isScrolled ? 'hover:bg-white/10 text-slate-100' : 'hover:bg-slate-100 text-slate-800'
                }`}
              >
                <span>Safety</span>
                <ChevronRight className="w-4 h-4 text-[#c5a880]" />
              </a>
              <a
                href="#faqs"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                  isScrolled ? 'hover:bg-white/10 text-slate-100' : 'hover:bg-slate-100 text-slate-800'
                }`}
              >
                <span>FAQs</span>
                <ChevronRight className="w-4 h-4 text-[#c5a880]" />
              </a>
            </div>

            {/* Mobile Booking CTA & Call Action Buttons */}
            <div className="pt-3 border-t border-slate-200/30 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking('local');
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f5e6b3] to-[#c5a880] text-[#011d15] font-black text-xs shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-transform"
              >
                <Car className="w-4 h-4 text-[#011d15]" />
                <span>Book Driver Now</span>
                <ChevronRight className="w-4 h-4 text-[#011d15]" />
              </button>

              <a
                href="tel:+918025211234"
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs border transition-colors ${
                  isScrolled
                    ? 'bg-white/10 text-white border-white/20'
                    : 'bg-slate-100 text-[#023526] border-slate-200'
                }`}
              >
                <Phone className="w-4 h-4 text-[#c5a880]" />
                <span>24/7 Helpline: +91 80 2521 1234</span>
              </a>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
