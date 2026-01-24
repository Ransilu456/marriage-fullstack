'use client';

import AdminLayout from '@/app/components/admin/layout/AdminLayout';

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-indigo-50">
			<AdminLayout>{children}</AdminLayout>
		</div>
	);
}
