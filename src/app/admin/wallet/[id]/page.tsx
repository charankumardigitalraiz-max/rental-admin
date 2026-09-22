import WalletDetailsView from '@/components/admin/wallet/WalletDetailsView';

export default async function WalletDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WalletDetailsView walletId={id} />;
}
