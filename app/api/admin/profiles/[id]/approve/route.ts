import { NextResponse } from 'next/server';
import { prisma } from '@/src/infrastructure/db/prismaClient';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  await prisma.profile.update({
    where: { id: params.id },
    data: { status: 'APPROVED' }
  });
  return NextResponse.json({ success: true });
}