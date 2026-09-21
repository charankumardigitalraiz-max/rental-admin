'use client';

import React, { useState } from 'react';
import Navbar from '@/components/website/ui/Navbar';
import Hero from '@/components/website/Hero';
import FareCalculator from '@/components/website/FareCalculator';
import ServicesSection from '@/components/website/ServicesSection';
import ValetEventShowcase from '@/components/website/ValetEventShowcase';
import DriverPartnerSection from '@/components/website/DriverPartnerSection';
import SafetyVerification from '@/components/website/SafetyVerification';
import TestimonialsSection from '@/components/website/TestimonialsSection';
import FAQSection from '@/components/website/FAQSection';
import Footer from '@/components/website/ui/Footer';
import BookingModal from '@/components/website/BookingModal';

export default function Home() {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [activeServiceType, setActiveServiceType] = useState('local');
  const [bookingInitialData, setBookingInitialData] = useState<any>(null);

  const handleOpenBooking = (serviceType: string = 'local', initialData?: any) => {
    setActiveServiceType(serviceType);
    if (initialData) setBookingInitialData(initialData);
    setBookingModalOpen(true);
  };

  const handleCloseBooking = () => {
    setBookingModalOpen(false);
    setBookingInitialData(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]">
      {/* Top Navbar */}
      <Navbar onOpenBooking={handleOpenBooking} />

      {/* Main Content Sections */}
      <main className="flex-1">
        <Hero onOpenBooking={handleOpenBooking} />
        <FareCalculator onOpenBooking={handleOpenBooking} />
        <ServicesSection onOpenBooking={handleOpenBooking} />
        <ValetEventShowcase onOpenBooking={handleOpenBooking} />
        <DriverPartnerSection />
        <SafetyVerification />
        <TestimonialsSection />
        <FAQSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={handleCloseBooking}
        serviceType={activeServiceType}
        initialData={bookingInitialData}
      />
    </div>
  );
}
