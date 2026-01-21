import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        const cookieStore = await cookies();

        // delete() is the correct way to clear a cookie in Next.js App Router
        cookieStore.delete('token');

        // We can also try to set it with expiration in the past to be doubly sure for older clients
        // but .delete() is standard.

        return NextResponse.json({ success: true, message: 'Logged out successfully' });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
