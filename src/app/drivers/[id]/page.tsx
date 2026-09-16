import DriverDetailsView from '@/components/drivers/DriverDetailsView';

export default async function DriverDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DriverDetailsView driverId={id} />;
}
