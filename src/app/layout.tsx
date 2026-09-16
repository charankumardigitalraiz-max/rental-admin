import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import AdminLayout from '@/components/layout/AdminLayout';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
});

export const metadata: Metadata = {
  title: 'Royal Wheels | Car Rental Admin Dashboard',
  description: 'Comprehensive Next.js Admin Dashboard for Car Rentals in India',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakartaSans.className}>
      <body className="antialiased bg-white text-slate-900 min-h-screen">
        <QueryProvider>
          <AdminLayout>{children}</AdminLayout>
        </QueryProvider>
      </body>
    </html>
  );
}
