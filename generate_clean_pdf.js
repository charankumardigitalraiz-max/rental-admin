const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const doc = new PDFDocument({
  margin: 50,
  size: 'A4',
  bufferPages: true
});

const outputPath = path.join(process.cwd(), 'OnDemand_Driver_and_Valet_Business_Documentation.pdf');
const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Clean Black & White Typography Colors
const BLACK = '#000000';
const DARK_GRAY = '#333333';
const LIGHT_GRAY = '#666666';

// Document Header
doc.fontSize(18).font('Helvetica-Bold').fillColor(BLACK).text('ON-DEMAND DRIVER & VALET PARKING BUSINESS DOCUMENTATION', { align: 'left' });
doc.moveDown(0.3);
doc.fontSize(10).font('Helvetica').fillColor(LIGHT_GRAY).text('Platform Concept, Service Verticals, Monetization & Operational Blueprint', { align: 'left' });
doc.moveDown(0.2);
doc.rect(50, doc.y, 495, 1).fill(BLACK);
doc.moveDown(0.8);

function addSectionHeader(title) {
  if (doc.y > 680) doc.addPage();
  doc.moveDown(0.6);
  doc.fontSize(12).font('Helvetica-Bold').fillColor(BLACK).text(title.toUpperCase());
  doc.moveDown(0.2);
  doc.rect(50, doc.y, 495, 0.5).fill(BLACK);
  doc.moveDown(0.5);
}

function addSubHeader(title) {
  if (doc.y > 700) doc.addPage();
  doc.moveDown(0.4);
  doc.fontSize(10.5).font('Helvetica-Bold').fillColor(BLACK).text(title);
  doc.moveDown(0.2);
}

function addBullet(label, desc) {
  if (doc.y > 720) doc.addPage();
  doc.fontSize(9).font('Helvetica-Bold').fillColor(BLACK).text(`• ${label}: `, { continued: true });
  doc.font('Helvetica').fillColor(DARK_GRAY).text(desc, { lineGap: 2 });
  doc.moveDown(0.2);
}

// 1. Executive Business Concept
addSectionHeader('1. Executive Business Concept & Market Vision');
doc.fontSize(9).font('Helvetica').lineGap(2.5).fillColor(DARK_GRAY).text(
  'This platform connects vehicle owners, corporate clients, and venue host management with background-verified private drivers and professional valet parking personnel. It enables seamless hourly booking for city commutes, outstation travel, and large-scale event valet management.'
);

// 2. Core Service Verticals
addSectionHeader('2. Core Service Verticals');

addSubHeader('2.1 On-Demand Private Driver Services');
addBullet('Local City Hire', 'Hourly or multi-hour professional driver hire for personal vehicle commute, night outs, or shopping trips.');
addBullet('Outstation Journeys', 'Long-distance intercity round trips or one-way travel with daily tariff slabs & food allowances.');
addBullet('Smart Dispatch Engine', 'Instant matching algorithm connecting customer requests to nearest available subscription-active drivers.');

addSubHeader('2.2 Enterprise & Event Valet Parking Management');
addBullet('Venue & Corporate Events', 'End-to-end valet staffing for weddings, luxury hotels, private parties, and corporate venues.');
addBullet('Staff Management & Duty Allocation', 'Dynamic allocation of vetted valet staff with real-time shift & roster tracking.');
addBullet('Vehicle Safety & Security Key Control', 'Token-based vehicle logging, parking slot coordination, and driver performance ratings.');

// 3. Monetization & Business Model
addSectionHeader('3. Monetization & Business Model');
addBullet('Driver Subscription Passes', 'Drivers buy daily, weekly, or monthly access passes to receive unlimited dispatch requests.');
addBullet('Platform Commission Cuts', 'Percentage-based revenue retention on completed rides and event contracts.');
addBullet('Event Pricing & Surge Multipliers', 'Hourly per-staff rate with peak event surge multipliers (e.g., weekend or festival surges).');

// 4. Financial, Payout & Wallet Ecosystem
addSectionHeader('4. Financial, Payout & Wallet Ecosystem');
addBullet('Driver Payout Settlements', 'Automated calculations for Gross Earnings, Platform Cuts, Deductions, and Net Bank Transfers.');
addBullet('User Savings & Cashbacks', 'Promotional rewards and digital wallet top-ups with instant checkout balance utilization.');
addBullet('Secure Payment Gateway Integration', 'Integrated Razorpay payment processing for customer bookings & wallet top-ups.');

// 5. Administrative Control Center Capabilities
addSectionHeader('5. Administrative Control Center Capabilities');
addBullet('Live Dispatch Monitoring', 'Real-time tracking of ongoing trips, driver locations, and pending customer requests.');
addBullet('Dispute Moderation & Reviews', 'Resolution desk for customer feedback, rating reviews, and billing claims.');
addBullet('Role-Based Access Control (RBAC)', 'Multi-tenant admin roles (Super Admin, Operations Lead, Financial Manager, Support Specialist).');

// Page Footers
const pages = doc.bufferedPageRange();
for (let i = 0; i < pages.count; i++) {
  doc.switchToPage(i);
  doc.rect(50, 785, 495, 0.5).fill(LIGHT_GRAY);
  doc.fillColor(LIGHT_GRAY).fontSize(8).font('Helvetica').text('On-Demand Driver & Valet Business Documentation', 50, 792);
  doc.text(`Page ${i + 1} of ${pages.count}`, 495, 792, { align: 'right' });
}

doc.end();

writeStream.on('finish', () => {
  console.log('Clean Text-Only PDF Generated Successfully at:', outputPath);
});
