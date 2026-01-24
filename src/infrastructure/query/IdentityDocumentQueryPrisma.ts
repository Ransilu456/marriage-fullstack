import { prisma } from '../db/prismaClient';
import { Prisma } from '@prisma/client';

export type IdentityDocumentWithUser = Prisma.IdentityDocumentGetPayload<{
  include: {
    user: {
      select: {
        name: true;
        email: true;
      };
    };
  };
}>;

export class IdentityDocumentQueryPrisma {
  async findPendingWithUser(): Promise<IdentityDocumentWithUser[]> {
    return prisma.identityDocument.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
