import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import { ToastProvider } from '@/context/ToastContext';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
});

export const metadata: Metadata = {
  title: 'DrivePulse & Valet | Premier Chauffeurs & Events',
  description: 'Bangalore premier acting driver & event valet service platform with admin portal.',
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
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
