const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const doc = new PDFDocument({
  margin: 40,
  size: 'A4',
  bufferPages: true
});

const outputPath = path.join(process.cwd(), 'Admin_Portal_Documentation.pdf');
const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Colors
const PRIMARY = '#011f16';
const SECONDARY = '#023526';
const ACCENT = '#fcd34d';
const TEXT_DARK = '#0f172a';
const TEXT_MUTED = '#475569';
const BG_LIGHT = '#f8fafc';
const BORDER_COLOR = '#e2e8f0';

// Helper for Section Headers
function addSectionHeader(title) {
  if (doc.y > 680) doc.addPage();
  doc.moveDown(0.8);
  doc.rect(40, doc.y, 515, 26).fill(PRIMARY);
  doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold').text(title.toUpperCase(), 50, doc.y - 20, { characterSpacing: 1 });
  doc.moveDown(1);
  doc.fillColor(TEXT_DARK);
}

// Helper for Subheaders
function addSubHeader(title) {
  if (doc.y > 700) doc.addPage();
  doc.moveDown(0.5);
  doc.fillColor(SECONDARY).fontSize(11).font('Helvetica-Bold').text(title);
  doc.moveDown(0.2);
  doc.fillColor(TEXT_DARK);
}

// Cover Header
doc.rect(0, 0, 595, 120).fill(PRIMARY);
doc.fillColor(ACCENT).fontSize(22).font('Helvetica-Bold').text('RENTAL & VALET OPERATIONS CONTROL', 40, 35);
doc.fillColor('#ffffff').fontSize(13).font('Helvetica').text('Comprehensive Platform Architecture & Admin Portal Documentation', 40, 65);
doc.fillColor('#cbd5e1').fontSize(9).text('Generated: ' + new Date().toLocaleDateString('en-US', { dateStyle: 'long' }) + ' • Version 2.4.0', 40, 88);

doc.y = 140;

// Executive Summary
addSectionHeader('1. Executive Summary');
doc.fontSize(9.5).font('Helvetica').lineGap(3).text(
  'The Rental & Valet Admin Portal is an enterprise-grade control center engineered for managing on-demand driver dispatches, venue/corporate valet bookings, subscription passes, driver payouts, user savings wallets, dispute moderations, and role-based access control (RBAC).'
);

// Key Modules & Architecture
addSectionHeader('2. Key Modules & Functional Architecture');

addSubHeader('2.1 Valet Bookings & Event Operations');
doc.fontSize(9).font('Helvetica').text('• Event Status Workflow: Standardized across Pending, In Progress, Completed, and Cancelled states.');
doc.fontSize(9).font('Helvetica').text('• Staff Allocation: Real-time assignment modal for allocating active, verified valet personnel to events.');
doc.fontSize(9).font('Helvetica').text('• Action Panel: Standardized action column width (170px) with single-line whitespace preservation.');

addSubHeader('2.2 Driver Management & Subscription Passes');
doc.fontSize(9).font('Helvetica').text('• Active Driver Roster: Real-time driver status tracking (Online, On Trip, Standby, Suspended).');
doc.fontSize(9).font('Helvetica').text('• Pass Verification: Subscription validation enforcing daily/monthly pass compliance prior to trip dispatch.');

addSubHeader('2.3 Financial Settlements & Driver Payouts');
doc.fontSize(9).font('Helvetica').text('• Payout Ledger: Tracks Gross Revenue, Platform Commission, Deductions, and Net Disbursed Payouts.');
doc.fontSize(9).font('Helvetica').text('• Integrated DataTable: Replaced legacy tables with global Paginated & Searchable DataTables.');

addSubHeader('2.4 User Savings & Digital Wallets');
doc.fontSize(9).font('Helvetica').text('• Dual View Navigation: Seamless tabbed switching between User Wallets and Immutable Wallet Ledger.');
doc.fontSize(9).font('Helvetica').text('• Transaction Auditing: Comprehensive audit trail for cashbacks, top-ups, and promo campaign rewards.');

addSubHeader('2.5 System Administration & RBAC');
doc.fontSize(9).font('Helvetica').text('• Roles & Permissions: Granular permission toggles for User Management, Financials, and Support.');
doc.fontSize(9).font('Helvetica').text('• Header Integration: Centralized page titles mapped dynamically across all 24 sub-routing components.');

// UI Design System Standardizations
addSectionHeader('3. UI Design System & Metric Standardizations');
doc.fontSize(9.5).font('Helvetica').lineGap(2).text(
  'To maintain high visual polish and executive readability across all 24 administrative modules, the interface adheres to strict visual design guidelines:'
);
doc.moveDown(0.5);

doc.fontSize(9).font('Helvetica-Bold').text('• Metric Stat Typography: Standardized across all 8 primary overview views to text-xl font-bold.');
doc.fontSize(9).font('Helvetica-Bold').text('• Harmonized Palette: Stat labels use uppercase tracking (text-[10.5px] font-bold text-slate-500) paired with contextual color accents (Emerald, Amber, Sky, Rose).');
doc.fontSize(9).font('Helvetica-Bold').text('• Single Unified Cards: Consolidated scattered metric widgets into unified responsive grid headers with vertical dividers.');

// Page Numbering Footer
const pages = doc.bufferedPageRange();
for (let i = 0; i < pages.count; i++) {
  doc.switchToPage(i);
  doc.rect(40, 790, 515, 0.5).fill('#cbd5e1');
  doc.fillColor(TEXT_MUTED).fontSize(8).font('Helvetica').text('Rental & Valet Operations Administration Portal • Confidential', 40, 800);
  doc.text(`Page ${i + 1} of ${pages.count}`, 500, 800, { align: 'right' });
}

doc.end();

writeStream.on('finish', () => {
  console.log('PDF Generated Successfully at:', outputPath);
});
