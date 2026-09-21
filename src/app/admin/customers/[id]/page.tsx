import CustomerDetailsView from '@/components/admin/customers/CustomerDetailsView';

export default async function CustomerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CustomerDetailsView customerId={id} />;
}
