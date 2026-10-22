import DtoDBookingDetailsView from '@/components/admin/d-to-d-bookings/DtoDBookingDetailsView';

export default async function DtoDBookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DtoDBookingDetailsView bookingId={id} />;
}
