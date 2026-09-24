const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const doc = new PDFDocument({
  margin: 40,
  size: 'A4',
  bufferPages: true
});

const outputPath = path.join(process.cwd(), 'OnDemand_Driver_and_Valet_Business_Documentation.pdf');
const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Colors
const PRIMARY = '#011f16';
const SECONDARY = '#023526';
const ACCENT = '#fcd34d';
const TEXT_DARK = '#0f172a';
const TEXT_MUTED = '#475569';
const ACCENT_EMERALD = '#047857';

function drawHeader() {
  doc.rect(0, 0, 595, 115).fill(PRIMARY);
  doc.fillColor(ACCENT).fontSize(20).font('Helvetica-Bold').text('ON-DEMAND DRIVER & VALET PARKING', 40, 30);
  doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold').text('Business Concept, Platform Architecture & Operational Workflow Documentation', 40, 58);
  doc.fillColor('#94a3b8').fontSize(9).font('Helvetica').text('Official Business & Product Blueprint • Version 1.0.0', 40, 80);
  doc.y = 135;
}

function addSection(title) {
  if (doc.y > 670) doc.addPage();
  doc.moveDown(0.6);
  doc.rect(40, doc.y, 515, 24).fill(PRIMARY);
  doc.fillColor('#ffffff').fontSize(11).font('Helvetica-Bold').text(title.toUpperCase(), 48, doc.y - 18, { characterSpacing: 1 });
  doc.moveDown(0.8);
  doc.fillColor(TEXT_DARK);
}

function addSubSection(title) {
  if (doc.y > 690) doc.addPage();
  doc.moveDown(0.4);
  doc.fillColor(ACCENT_EMERALD).fontSize(10.5).font('Helvetica-Bold').text(title);
  doc.moveDown(0.2);
  doc.fillColor(TEXT_DARK);
}

function addBullet(label, desc) {
  if (doc.y > 720) doc.addPage();
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor(TEXT_DARK).text(`• ${label}: `, { continued: true });
  doc.font('Helvetica').fillColor(TEXT_MUTED).text(desc, { lineGap: 1.5 });
  doc.moveDown(0.15);
}

drawHeader();

// 1. Executive Business Concept
addSection('1. Executive Business Concept & Market Vision');
doc.fontSize(8.5).font('Helvetica').lineGap(2.5).fillColor(TEXT_MUTED).text(
  'The platform bridges car owners, corporate clients, and venue organizers with professional, background-verified private drivers and valet management personnel. It provides seamless booking for short-duration city trips, outstation journeys, and large-scale corporate or wedding valet parking services.'
);

// 2. Core Service Verticals
addSection('2. Core Service Verticals');

addSubSection('2.1 On-Demand Private Driver Services');
addBullet('Local City Driving', 'Hourly or multi-hour professional driver hire for personal vehicle commute, night outs, or shopping trips.');
addBullet('Outstation Journeys', 'Long-distance intercity round trips or one-way travel with daily tariff slabs & food allowances.');
addBullet('Dispatch Engine', 'Instant matching algorithm connecting customer requests to nearest available subscription-active drivers.');

addSubSection('2.2 Enterprise & Event Valet Parking Management');
addBullet('Venue & Corporate Events', 'End-to-end valet staffing for weddings, luxury hotels, private parties, and corporate venues.');
addBullet('Staff Management & Duty Allocation', 'Dynamic allocation of vetted valet staff with real-time shift & roster tracking.');
addBullet('Vehicle Safety & Security Key Control', 'Token-based vehicle logging, parking slot coordination, and driver performance ratings.');

// 3. Monetization & Business Model
addSection('3. Monetization & Business Model');
addBullet('Driver Subscription Passes', 'Drivers buy daily, weekly, or monthly access passes to receive unlimited dispatch requests.');
addBullet('Platform Commission Cuts', 'Percentage-based revenue retention on completed rides and event contracts.');
addBullet('Event Pricing & Surge', 'Hourly per-staff rate with peak event surge multipliers (e.g., weekend or festival surges).');

// 4. Financial & Payout Ecosystem
addSection('4. Financial, Payout & Wallet Ecosystem');
addBullet('Driver Payout Settlements', 'Automated calculations for Gross Earnings, Platform Cuts, Deductions, and Net Bank Transfers.');
addBullet('User Savings & Cashbacks', 'Promotional rewards and digital wallet top-ups with instant checkout balance utilization.');
addBullet('Secure Payment Gateway', 'Integrated Razorpay payment processing for customer bookings & wallet top-ups.');

// 5. Admin Control Center Capabilities
addSection('5. Administrative Control Center Capabilities');
addBullet('Live Dispatch Monitoring', 'Real-time tracking of ongoing trips, driver locations, and pending customer requests.');
addBullet('Dispute Moderation & Reviews', 'Resolution desk for customer feedback, rating reviews, and billing claims.');
addBullet('Role-Based Access Control (RBAC)', 'Multi-tenant admin roles (Super Admin, Operations Lead, Financial Manager, Support Specialist).');

// Page Footers
const pages = doc.bufferedPageRange();
for (let i = 0; i < pages.count; i++) {
  doc.switchToPage(i);
  doc.rect(40, 790, 515, 0.5).fill('#cbd5e1');
  doc.fillColor(TEXT_MUTED).fontSize(8).font('Helvetica').text('On-Demand Driver & Valet Business Concept Documentation • Confidential', 40, 800);
  doc.text(`Page ${i + 1} of ${pages.count}`, 500, 800, { align: 'right' });
}

doc.end();

writeStream.on('finish', () => {
  console.log('Business Concept PDF Generated Successfully at:', outputPath);
});
