import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { headers } from 'next/headers';

export interface AuthSession {
    userId: string;
    email: string;
    role: string;
    name: string;
}

export async function getSession(req?: Request | NextRequest): Promise<AuthSession | null> {
    try {
        const { getServerSession } = await import('next-auth/next');
        const { authOptions } = await import('@/app/api/auth/[...nextauth]/route');

        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return null;
        }

        return {
            userId: (session.user as any).id,
            email: session.user.email || '',
            role: (session.user as any).role || 'user',
            name: session.user.name || 'Confidential'
        };
    } catch (error) {
        console.error('Session retrieval error:', error);
        return null;
    }
}
