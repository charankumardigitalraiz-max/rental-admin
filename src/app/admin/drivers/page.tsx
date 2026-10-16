import DriversView from '@/components/admin/drivers/DriversView';

interface DriversPageProps {
  searchParams?: Promise<{ status?: string; filter?: string }>;
}

export default async function DriversPage({ searchParams }: DriversPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const filter = params?.status || params?.filter || 'all';
  return <DriversView filter={filter} />;
}
