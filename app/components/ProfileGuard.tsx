'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProfileGuard({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        const checkProfile = async () => {
            // Exempt admin routes from profile check
            if (pathname?.startsWith('/admin')) {
                setHasChecked(true);
                return;
            }

            // Only check if authenticated and not on public/profile pages
            // Also bypass for ADMIN role
            if (status === 'authenticated' && (session?.user as any)?.role === 'ADMIN') {
                setHasChecked(true);
                return;
            }

            if (status === 'authenticated' && pathname !== '/' && pathname !== '/profile') {
                try {
                    const res = await fetch('/api/profile');
                    if (res.status === 404) {
                        router.push('/profile');
                    } else {
                        setHasChecked(true);
                    }
                } catch (error) {
                    console.error('Profile check failed', error);
                }
            } else {
                setHasChecked(true);
            }
        };

        if (status !== 'loading') {
            checkProfile();
        }
    }, [status, pathname, router]);

    if (status === 'loading' || (!hasChecked && status === 'authenticated' && pathname !== '/' && pathname !== '/profile' && !pathname?.startsWith('/admin'))) {
        return null; // Or a loading spinner
    }

    return <>{children}</>;
}
