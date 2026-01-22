
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/src/core/entities/User';
import { Loader2 } from 'lucide-react';

import AdminSidebar from '@/app/components/admin/AdminSidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return;

        if (!session?.user || (session.user as any).role !== UserRole.ADMIN) {
            router.push('/');
        }
    }, [session, status, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-saffron-600" />
            </div>
        );
    }

    if (!session?.user || (session.user as any).role !== UserRole.ADMIN) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <AdminSidebar />
            <div className="lg:pl-72 min-h-screen transition-all duration-300">
                {children}
            </div>
        </div>
    );
}
