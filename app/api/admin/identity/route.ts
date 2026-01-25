import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { GetIdentityVerifications } from '@/src/core/use-cases/GetIdentityVerifications';
import { AdminVerifyIdentity } from '@/src/core/use-cases/AdminVerifyIdentity';

export async function GET(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    try {
        const useCase = new GetIdentityVerifications();
        const result = await useCase.execute(page, limit, status);
        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { verificationId, action, notes } = await request.json();
        if (!verificationId || !['VERIFY', 'REJECT', 'REVOKE'].includes(action)) {
            return NextResponse.json({ error: 'Invalid Input' }, { status: 400 });
        }

        const useCase = new AdminVerifyIdentity();
        await useCase.execute(verificationId, action, notes);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
