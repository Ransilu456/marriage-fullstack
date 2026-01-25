import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { AdminRepositoryPrisma } from '@/src/infrastructure/db/AdminRepositoryPrisma';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const repo = new AdminRepositoryPrisma();
    await repo.banUser(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}