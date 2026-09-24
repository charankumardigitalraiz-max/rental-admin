import CustomerVehicleDetailsView from '@/components/admin/vehicles/CustomerVehicleDetailsView';

export default function CustomerVehicleDetailsPage({ params }: { params: { id: string } }) {
  return <CustomerVehicleDetailsView vehicleId={params.id} />;
}
