'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/website/ui/Navbar';
import Footer from '@/components/website/ui/Footer';
import BookingModal from '@/components/website/BookingModal';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Search,
  MessageCircle,
  ArrowRight,
  Headphones,
  FileQuestion,
  Copy,
  Check,
  Loader2,
  Calendar,
  Building2,
  Radio,
} from 'lucide-react';

const QUERY_CATEGORIES = [
  'Booking Support',
  'Hourly Acting Driver',
  'Outstation Trip Help',
  'Valet Event Consultation',
  'Driver Partner Pass',
  'Billing & GST Invoices',
  'Feedback / Escalation',
];

export default function ContactSupportContent() {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [activeServiceType, setActiveServiceType] = useState('local');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('Booking Support');
  const [bookingId, setBookingId] = useState('');
  const [priority, setPriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // Submit Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<{
    ticketId: string;
    name: string;
    category: string;
    createdAt: string;
  } | null>(null);
  const [copiedTicket, setCopiedTicket] = useState(false);

  // Ticket Lookup State
  const [lookupId, setLookupId] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [lookupError, setLookupError] = useState('');

  const handleOpenBooking = (serviceType: string = 'local') => {
    setActiveServiceType(serviceType);
    setBookingModalOpen(true);
  };

  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/common/support-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          category,
          subject,
          message,
          bookingId,
          priority,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setSubmitError(json.error || 'Failed to submit query. Please try again.');
      } else {
        setSubmittedTicket(json.data);
      }
    } catch (err: any) {
      setSubmitError('Network error. Please verify your connection or call our 24/7 hotline.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLookupTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupId.trim()) return;
    setLookupError('');
    setLookupResult(null);
    setIsLookingUp(true);

    try {
      const res = await fetch(`/api/common/support-query?ticketId=${encodeURIComponent(lookupId.trim())}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        setLookupError(json.error || 'Ticket not found.');
      } else {
        setLookupResult(json.data);
      }
    } catch (err) {
      setLookupError('Failed to query ticket status.');
    } finally {
      setIsLookingUp(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTicket(true);
    setTimeout(() => setCopiedTicket(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-slate-800 selection:bg-[#c5a880] selection:text-white">
      {/* Top Morphing Navbar */}
      <Navbar onOpenBooking={handleOpenBooking} />

      {/* Hero Banner with Luxury Accents */}
      <div className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-b from-[#023526]/8 via-[#faf8f5] to-[#faf8f5] border-b border-stone-200/60">
        {/* Subtle Decorative Ambient Lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[280px] bg-gradient-to-tr from-[#c5a880]/15 to-emerald-400/10 blur-[90px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#023526] text-xs font-bold tracking-wide uppercase mb-4 shadow-2xs">
            <Headphones className="w-3.5 h-3.5 text-[#c5a880]" />
            <span>24/7 Dedicated Concierge & Support Hub</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            We’re Here to Help.{' '}
            <span className="bg-gradient-to-r from-[#023526] via-[#c5a880] to-[#023526] bg-clip-text text-transparent">
              Every Step of the Way.
            </span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Have questions about an acting driver, need an immediate dispatch in Bangalore, or looking for a customized valet parking proposal? Connect directly or create a support ticket below.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full flex-1">

        {/* 4 Direct Contact Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {/* Channel 1: 24/7 Helpline */}
          <a
            href="tel:+918025211234"
            className="rounded-2xl p-5 bg-white border border-stone-200/90 hover:border-[#023526]/50 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#023526] border border-emerald-200/70 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Phone className="w-5 h-5 text-[#023526]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">24/7 Hotline & SOS</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Emergency dispatch and real-time ride assistance.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#023526]">
              <span>+91 80 2521 1234</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          {/* Channel 2: WhatsApp Chat */}
          <a
            href="https://wa.me/918025211234"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl p-5 bg-white border border-stone-200/90 hover:border-emerald-500/50 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <MessageCircle className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">WhatsApp Concierge</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Fast messaging with dispatchers. Average reply: 3 mins.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>Chat on WhatsApp</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          {/* Channel 3: Email Inquiries */}
          <a
            href="mailto:support@drivepulse.in"
            className="rounded-2xl p-5 bg-white border border-stone-200/90 hover:border-[#c5a880]/50 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/70 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Mail className="w-5 h-5 text-amber-800" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Corporate & Billing</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Invoices, event contracts, and corporate agreements.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-slate-900">
              <span>support@drivepulse.in</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          {/* Channel 4: Headquarters */}
          <div className="rounded-2xl p-5 bg-white border border-stone-200/90 shadow-xs text-left flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-stone-100 text-slate-800 border border-stone-200 flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5 text-[#023526]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Bangalore Operations</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                100 Feet Road, Indiranagar, Bangalore, Karnataka 560038
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              <span>Operations: 24/7/365</span>
            </div>
          </div>
        </div>

        {/* 2-Column Layout: Create Query Form on Left, Ticket Tracker & FAQs on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* Left Column: Create a Support Query Form (lg:col-span-7) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 lg:p-9 border border-stone-200/90 shadow-md text-left relative overflow-hidden">
            {/* Top Luxury Accent Bar */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#023526] via-[#c5a880] to-[#023526]" />

            {!submittedTicket ? (
              <>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-[#023526] shrink-0">
                    <FileQuestion className="w-5 h-5 text-[#023526]" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Create a Support Query</h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Fill out the form below to receive a tracked ticket reference.
                    </p>
                  </div>
                </div>

                {submitError && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{submitError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitQuery} className="space-y-5">
                  {/* Category Pill Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Inquiry Category <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {QUERY_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            category === cat
                              ? 'bg-[#023526] text-white shadow-xs'
                              : 'bg-stone-50 hover:bg-stone-100 text-slate-600 border border-stone-200/80'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name & Phone Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Your Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Vikram Sharma"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#023526]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#023526]"
                      />
                    </div>
                  </div>

                  {/* Email & Booking ID Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#023526]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Booking ID <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={bookingId}
                        onChange={(e) => setBookingId(e.target.value)}
                        placeholder="e.g. BK-98214"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#023526]"
                      />
                    </div>
                  </div>

                  {/* Subject & Priority Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-8">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Question regarding outstation driver stay allowance"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#023526]"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Priority Level
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#023526]"
                      >
                        <option value="Normal">Normal Priority</option>
                        <option value="High">High Priority</option>
                        <option value="Urgent">Urgent (Active Ride)</option>
                      </select>
                    </div>
                  </div>

                  {/* Detailed Query Message */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Detailed Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please describe your query or requirement in detail. Include times, locations, or vehicle models if relevant."
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#023526] resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 rounded-xl font-bold text-xs bg-[#023526] hover:bg-[#034432] disabled:opacity-70 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#c5a880]" />
                          <span>Logging Your Ticket...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 text-[#c5a880]" />
                          <span>Submit Support Query</span>
                        </>
                      )}
                    </button>
                    <p className="text-center text-[11px] text-slate-500 mt-2.5">
                      Average response time for queries logged online is <span className="font-semibold text-slate-700">under 30 minutes</span>.
                    </p>
                  </div>
                </form>
              </>
            ) : (
              /* Success Confirmation Card */
              <div className="py-8 text-center space-y-5">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto border-2 border-emerald-300">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Query Logged Successfully!</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
                    Thank you, <span className="font-bold text-slate-900">{submittedTicket.name}</span>. Your ticket has been assigned to our Bangalore operations concierge.
                  </p>
                </div>

                {/* Ticket ID Box */}
                <div className="inline-flex items-center gap-3 p-3.5 px-5 rounded-2xl bg-stone-50 border border-stone-200/90 text-left">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Your Ticket ID</span>
                    <span className="text-base font-extrabold text-[#023526] font-mono">{submittedTicket.ticketId}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(submittedTicket.ticketId)}
                    className="p-2 rounded-lg bg-white border border-stone-200 text-slate-600 hover:text-slate-900 cursor-pointer"
                    title="Copy Ticket ID"
                  >
                    {copiedTicket ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  We have sent an acknowledgment to your email. You can check the live status of this ticket anytime using our status tracker.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSubmittedTicket(null);
                      setSubject('');
                      setMessage('');
                      setBookingId('');
                    }}
                    className="px-6 py-2.5 bg-[#023526] text-white rounded-xl text-xs font-bold hover:bg-[#034432] cursor-pointer"
                  >
                    Submit Another Query
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Track Ticket Status & Emergency Escalation (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-6">

            {/* Panel 1: Live Ticket Tracker Card */}
            <div className="rounded-3xl p-6 bg-white border border-stone-200/90 shadow-sm text-left relative overflow-hidden">
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-stone-100">
                <Search className="w-4 h-4 text-[#023526]" />
                <h3 className="font-bold text-slate-900 text-sm">Track Ticket Status</h3>
              </div>

              <form onSubmit={handleLookupTicket} className="space-y-3">
                <p className="text-xs text-slate-500">
                  Already submitted a query? Enter your reference ID below to view current progress:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={lookupId}
                    onChange={(e) => setLookupId(e.target.value.toUpperCase())}
                    placeholder="e.g. DP-Q-123456"
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#023526]"
                  />
                  <button
                    type="submit"
                    disabled={isLookingUp}
                    className="px-4 py-2 bg-[#023526] text-white rounded-xl text-xs font-bold hover:bg-[#034432] disabled:opacity-70 cursor-pointer"
                  >
                    {isLookingUp ? <Loader2 className="w-4 h-4 animate-spin text-[#c5a880]" /> : 'Track'}
                  </button>
                </div>
              </form>

              {lookupError && (
                <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                  <span>{lookupError}</span>
                </div>
              )}

              {lookupResult && (
                <div className="mt-4 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="font-mono text-[#023526]">{lookupResult.ticketId}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10.5px] bg-emerald-200 text-emerald-900 font-extrabold uppercase">
                      {lookupResult.status}
                    </span>
                  </div>
                  <div className="text-slate-600 font-medium">
                    <span className="font-bold text-slate-700">Subject:</span> {lookupResult.subject}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Created on {new Date(lookupResult.createdAt).toLocaleDateString()} at{' '}
                    {new Date(lookupResult.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )}
            </div>

            {/* Panel 2: Active Ride / Emergency Fast-Track */}
            <div className="rounded-3xl p-6 bg-gradient-to-b from-[#023526] via-[#02281d] to-[#011c14] text-white border border-[#c5a880]/30 shadow-md text-left relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#c5a880]/60 to-transparent pointer-events-none" />
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full border border-[#c5a880]/15 pointer-events-none" />

              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#c5a880] uppercase tracking-wider">
                  <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  <span>Active Passenger Fast-Track</span>
                </div>
                <h4 className="text-lg font-bold text-white tracking-tight">Currently on an Active Ride?</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  If you are currently traveling in Bangalore or on an outstation highway trip and need immediate assistance, bypass the form and call live dispatch directly:
                </p>

                <div className="pt-2">
                  <a
                    href="tel:+918025211234"
                    className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 border border-[#c5a880]/40 rounded-xl text-xs font-extrabold text-[#c5a880] flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Phone className="w-4 h-4 text-[#c5a880]" />
                    <span>Call Live Dispatch (+91 80 2521 1234)</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Panel 3: Quick FAQs */}
            <div className="rounded-3xl p-6 bg-white border border-stone-200/90 shadow-sm text-left space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-100 text-xs font-bold text-slate-900 uppercase tracking-wide">
                <HelpCircle className="w-4 h-4 text-[#023526]" />
                <span>Common Inquiries</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <h5 className="font-bold text-slate-900">How quickly does a driver arrive?</h5>
                  <p className="text-slate-500 mt-0.5 leading-relaxed">
                    Local city acting drivers typically arrive within 15 to 25 minutes of booking confirmation anywhere in Bangalore.
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-100">
                  <h5 className="font-bold text-slate-900">Can I extend hours during my trip?</h5>
                  <p className="text-slate-500 mt-0.5 leading-relaxed">
                    Yes. All hourly bookings can be extended on the go at ₹150/hr with no surge penalties.
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-100">
                  <h5 className="font-bold text-slate-900">How do I request a corporate GST invoice?</h5>
                  <p className="text-slate-500 mt-0.5 leading-relaxed">
                    Submit a query selecting “Billing & GST Invoices” or email support@drivepulse.in with your booking reference.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Footer */}
      <Footer />

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        serviceType={activeServiceType}
      />
    </div>
  );
}
