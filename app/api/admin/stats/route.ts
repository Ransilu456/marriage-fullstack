import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { GetAdminStats } from '@/src/core/use-cases/GetAdminStats';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const useCase = new GetAdminStats();
    const stats = await useCase.execute();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
