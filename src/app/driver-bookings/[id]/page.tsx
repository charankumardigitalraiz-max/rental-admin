import DriverBookingDetailsView from '@/components/driver-bookings/DriverBookingDetailsView';

export default async function DriverBookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DriverBookingDetailsView bookingId={id} />;
}
