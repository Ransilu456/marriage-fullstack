import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { AdminRepositoryPrisma } from '@/src/infrastructure/db/AdminRepositoryPrisma';
import { ManageProposals } from '@/src/core/use-cases/ManageProposals';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const status = searchParams.get('status') || undefined;

  try {
    const repo = new AdminRepositoryPrisma();
    const result = await repo.getProposals(page, limit, status);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { proposalId } = await request.json();
    if (!proposalId) return NextResponse.json({ error: 'Missing Proposal ID' }, { status: 400 });

    const useCase = new ManageProposals();
    await useCase.execute(proposalId, 'DELETE');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}