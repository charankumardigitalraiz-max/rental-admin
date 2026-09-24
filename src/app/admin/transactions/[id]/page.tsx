import TransactionDetailsView from '@/components/admin/transactions/TransactionDetailsView';

export default async function TransactionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TransactionDetailsView transactionId={id} />;
}
