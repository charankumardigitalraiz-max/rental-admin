import { Metadata } from 'next';
import BannersView from '@/components/admin/banners/BannersView';

export const metadata: Metadata = {
  title: 'Banner & Promotional Management | DrivePulse Admin',
  description: 'Create, schedule, and optimize interactive banners and promotions across DrivePulse mobile apps.',
};

export default function BannersPage() {
  return <BannersView />;
}
