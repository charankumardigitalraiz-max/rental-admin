const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const doc = new PDFDocument({
  margin: 45,
  size: 'A4',
  bufferPages: true
});

const outputPath = path.join(process.cwd(), 'Private_Driver_Admin_Portal_Blueprint.pdf');
const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

const BLACK = '#000000';
const DARK_GRAY = '#222222';
const MUTED_GRAY = '#555555';

// Title Header
doc.fontSize(16).font('Helvetica-Bold').fillColor(BLACK).text('ON-DEMAND PRIVATE DRIVER PLATFORM - ADMIN PORTAL BLUEPRINT', { align: 'left' });
doc.moveDown(0.2);
doc.fontSize(9.5).font('Helvetica').fillColor(MUTED_GRAY).text('Complete Functional Specification & Page-by-Page Feature Breakdown (Excluding Valet)', { align: 'left' });
doc.moveDown(0.2);
doc.rect(45, doc.y, 505, 1).fill(BLACK);
doc.moveDown(0.6);

function addPageHeader(title) {
  if (doc.y > 670) doc.addPage();
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica-Bold').fillColor(BLACK).text(title.toUpperCase());
  doc.moveDown(0.2);
  doc.rect(45, doc.y, 505, 0.5).fill(BLACK);
  doc.moveDown(0.4);
}

function addBullet(label, desc) {
  if (doc.y > 720) doc.addPage();
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor(BLACK).text(`• ${label}: `, { continued: true });
  doc.font('Helvetica').fillColor(DARK_GRAY).text(desc, { lineGap: 1.5 });
  doc.moveDown(0.15);
}

// 1. Executive Concept & Ecosystem
addPageHeader('1. Executive Platform Concept');
doc.fontSize(8.5).font('Helvetica').lineGap(2).fillColor(DARK_GRAY).text(
  'An enterprise control system managing on-demand private drivers for personal cars. It powers Local City Trips (hourly hire) and Outstation Journeys (multi-day travel), handling live dispatching, driver verification, subscription pass access, financial payouts, user wallets, and customer support.'
);

// 2. Page-by-Page Admin Module Specifications
addPageHeader('2. Page-by-Page Admin Dashboard Breakdown');

// Page 1: Live Dispatch Control Center
doc.fontSize(9.5).font('Helvetica-Bold').fillColor(BLACK).text('PAGE 1: LIVE DISPATCH CONTROL CENTER (Live Operations)');
addBullet('Live Tracking Map', 'Interactive map tracking active on-duty drivers, ongoing customer trips, and pending pickup requests.');
addBullet('Unassigned Request Queue', 'Real-time broadcast queue showing unassigned trips waiting for driver acceptance.');
addBullet('Manual Override & Reassign', 'Ability for dispatch admins to manually assign or reassign available drivers to urgent bookings.');

// Page 2: Driver Bookings Directory
doc.fontSize(9.5).font('Helvetica-Bold').fillColor(BLACK).text('PAGE 2: DRIVER BOOKINGS DIRECTORY (Bookings & Trips Management)');
addBullet('Global Trip Table', 'Paginated table listing Booking ID, Customer Name, Vehicle Transmission/Model, Date & Time, Assigned Driver, and Trip Status.');
addBullet('Status Lifecycle Filter', 'Filter trips by status: Pending, Searching Driver, Driver Assigned, Driver Arriving, Service Started, Completed, Cancelled.');
addBullet('Trip Details View', 'Drill-down view showing customer pickup/destination GPS, OTP status, pre-trip vehicle checklist, and fare calculations.');

// Page 3: Driver Partner Directory & Verification Desk
doc.fontSize(9.5).font('Helvetica-Bold').fillColor(BLACK).text('PAGE 3: DRIVER PARTNER DIRECTORY & VERIFICATION DESK');
addBullet('Driver Roster & Status', 'Complete driver directory categorized by status: Approved, Pending Verification, Suspended, Online, On Trip.');
addBullet('Document Verification Desk', 'Interface to review and approve Driving License, Aadhaar/ID, Vehicle Transmission Skills, and Police Background Checks.');
addBullet('Pass Compliance Audit', 'Real-time indicator showing if driver holds an active daily/monthly subscription pass.');

// Page 4: Driver Subscription Pass Management
doc.fontSize(9.5).font('Helvetica-Bold').fillColor(BLACK).text('PAGE 4: DRIVER SUBSCRIPTION PASS MANAGEMENT');
addBullet('Plan Configuration', 'Create and edit Subscription Passes (Daily Pass, Weekly Pass, Monthly Pass) with price and validity controls.');
addBullet('Active Subscriptions Directory', 'View drivers with active pass validity, expiry countdowns, and renewal history.');
addBullet('Pass Revenue Metrics', 'Track total subscription pass sales revenue and active driver pass compliance rates.');

// Page 5: Financial Settlements & Driver Payouts
doc.fontSize(9.5).font('Helvetica-Bold').fillColor(BLACK).text('PAGE 5: FINANCIAL SETTLEMENTS & DRIVER PAYOUTS');
addBullet('Payout Batch Ledger', 'Tracks completed trips, Gross Fare, Platform Commission Retention, Fuel/Toll Deductions, and Net Driver Payout.');
addBullet('Automated Bank Disbursements', 'Approve and trigger direct bank payout transfers to verified driver bank accounts.');
addBullet('Payout Status Tracking', 'Filter payout batches by Pending Approval, Processing, Disbursed, and Failed Settlements.');

// Page 6: Pricing, Tariff & Rate Management
doc.fontSize(9.5).font('Helvetica-Bold').fillColor(BLACK).text('PAGE 6: PRICING, TARIFF & RATE MANAGEMENT');
addBullet('Local Hourly Pricing Engine', 'Configure base fare for minimum hours (e.g., ₹400 for 4 hrs), extra per-hour charges, and driver payout share %.');
addBullet('Outstation Tariff Engine', 'Configure daily outstation rates, per-km charges, driver food allowances, and night stay charges.');
addBullet('Surge & Peak Multipliers', 'Set peak hour multipliers, festival surge rates, and late-night (10 PM - 6 AM) driver allowances.');

// Page 7: User Savings & Digital Wallets
doc.fontSize(9.5).font('Helvetica-Bold').fillColor(BLACK).text('PAGE 7: USER SAVINGS & DIGITAL WALLETS DIRECTORY');
addBullet('Customer Wallet Balances', 'Directory of registered customer wallet balances, top-up history, and promotional cashbacks.');
addBullet('Immutable Wallet Ledger', 'Full audit trail of credit top-ups, checkout debits, promo cashback rewards, and refund logs.');

// Page 8: Customer Management Directory
doc.fontSize(9.5).font('Helvetica-Bold').fillColor(BLACK).text('PAGE 8: CUSTOMER MANAGEMENT DIRECTORY');
addBullet('Customer Profiles', 'Directory displaying Customer Name, Phone, Email, Total Bookings Completed, Lifetime Spend, and Account Status.');
addBullet('Account Suspension Desk', 'Suspend or reactivate customer accounts for policy violations or unpaid dues.');

// Page 9: Support Tickets, Disputes & Reviews
doc.fontSize(9.5).font('Helvetica-Bold').fillColor(BLACK).text('PAGE 9: SUPPORT TICKETS, DISPUTES & REVIEWS MODERATION');
addBullet('Customer & Driver Reviews', 'Moderate 1-star to 5-star ratings, review complaints, and flagged feedback.');
addBullet('Dispute Claims Desk', 'Investigate billing disputes, incorrect extra hour/km charges, property damage claims, and process customer refunds.');

// Page 10: Roles & Permissions (RBAC)
doc.fontSize(9.5).font('Helvetica-Bold').fillColor(BLACK).text('PAGE 10: ROLES & PERMISSIONS (RBAC & Admin Roster)');
addBullet('System Roles Definition', 'Define roles (Super Admin, Dispatch Controller, Financial Auditor, Support Specialist).');
addBullet('Granular Permission Matrix', 'Toggle specific permissions per module (e.g., View Only, Edit Pricing, Approve Payouts, Suspend Drivers).');

// Page Footers
const pages = doc.bufferedPageRange();
for (let i = 0; i < pages.count; i++) {
  doc.switchToPage(i);
  doc.rect(45, 790, 505, 0.5).fill(MUTED_GRAY);
  doc.fillColor(MUTED_GRAY).fontSize(8).font('Helvetica').text('On-Demand Private Driver Platform - Complete Admin Specification Blueprint', 45, 797);
  doc.text(`Page ${i + 1} of ${pages.count}`, 495, 797, { align: 'right' });
}

doc.end();

writeStream.on('finish', () => {
  console.log('Admin Portal Blueprint PDF Generated Successfully at:', outputPath);
});
