import AdminLayoutComponent from '@/app/components/admin/layout/AdminLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutComponent>{children}</AdminLayoutComponent>;
}