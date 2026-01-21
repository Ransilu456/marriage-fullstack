import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export interface AuthSession {
    userId: string;
    email: string;
    role: string;
}

export async function getSession(): Promise<AuthSession | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) return null;

        const decoded = jwt.verify(
            token,
            process.env.NEXTAUTH_SECRET || 'fallback-secret'
        ) as AuthSession;

        return decoded;
    } catch (error) {
        return null;
    }
}
