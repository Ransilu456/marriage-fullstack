import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { AdminRepositoryPrisma } from '@/src/infrastructure/db/AdminRepositoryPrisma';

export async function GET(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    try {
        const repo = new AdminRepositoryPrisma();
        const result = await repo.getReports(page, limit);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Fetch reports error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { reportId, status } = await request.json();
        if (!reportId || !status) {
            return NextResponse.json({ error: 'Missing Report ID or Status' }, { status: 400 });
        }

        const repo = new AdminRepositoryPrisma();
        await repo.updateReportStatus(reportId, status);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update report error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
