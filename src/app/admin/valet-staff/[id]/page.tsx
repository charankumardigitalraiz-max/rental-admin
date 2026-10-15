import ValetStaffDetailsView from '@/components/admin/valet-staff/ValetStaffDetailsView';

export default async function ValetStaffDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ValetStaffDetailsView staffId={id} />;
}
