import ValetBookingDetailsView from '@/components/admin/valet-bookings/ValetBookingDetailsView';

export default async function ValetBookingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ValetBookingDetailsView bookingId={id} />;
}
