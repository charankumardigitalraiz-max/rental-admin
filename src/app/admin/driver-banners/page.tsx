import { Metadata } from 'next';
import DriverBannersView from '@/components/admin/banners/DriverBannersView';

export const metadata: Metadata = {
  title: 'Driver App Banner Management | DrivePulse Admin',
  description: 'Upload and organize promotional banners for Driver Onboarding, Hero Surge, and Partner Benefits across the Driver partner app.',
};

export default function DriverBannersPage() {
  return <DriverBannersView />;
}
