import AdminLayout from '@/components/admin/layout/AdminLayout';

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminLayout>{children}</AdminLayout>;
}
