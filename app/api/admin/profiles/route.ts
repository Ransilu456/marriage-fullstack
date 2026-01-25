import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { AdminRepositoryPrisma } from '@/src/infrastructure/db/AdminRepositoryPrisma';
import { ModerateProfile } from '@/src/core/use-cases/ModerateProfile';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const status = searchParams.get('status') || undefined;
  const search = searchParams.get('search') || undefined;

  try {
    const repo = new AdminRepositoryPrisma();
    const result = await repo.getProfiles(page, limit, status, search);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { profileId, action } = await request.json();
    if (!profileId || !action) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const useCase = new ModerateProfile();
    await useCase.execute(profileId, action);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}