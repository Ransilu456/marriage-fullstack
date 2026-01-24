import { IIdentityDocumentRepository } from '../../core/interfaces/IdentityDocumentRepository';
import { IdentityDocument } from '../../core/entities/IdentityDocument';
import { prisma } from './prismaClient';

export class IdentityDocumentRepositoryPrisma implements IIdentityDocumentRepository {

  async save(doc: IdentityDocument): Promise<IdentityDocument> {
    const d = doc.toJSON();

    const saved = await prisma.identityDocument.upsert({
      where: { id: d.id },
      update: {
        status: d.status,
        rejectionReason: d.rejectionReason,
        updatedAt: new Date(),
      },
      create: {
        id: d.id,
        userId: d.userId,
        type: d.type,
        fileUrl: d.fileUrl,
        status: d.status,
        rejectionReason: d.rejectionReason,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      },
    });

    return this.toDomain(saved);
  }

  async findById(id: string): Promise<IdentityDocument | null> {
    const found = await prisma.identityDocument.findUnique({ where: { id } });
    return found ? this.toDomain(found) : null;
  }

  async findByUserId(userId: string): Promise<IdentityDocument[]> {
    const found = await prisma.identityDocument.findMany({ where: { userId } });
    return found.map(f => this.toDomain(f));
  }

  async delete(id: string): Promise<void> {
    await prisma.identityDocument.delete({ where: { id } });
  }

  async findAllPending(): Promise<IdentityDocument[]> {
    const found = await prisma.identityDocument.findMany({
      where: { status: 'PENDING' },
    });
    return found.map(f => this.toDomain(f));
  }

  private toDomain(p: any): IdentityDocument {
    return IdentityDocument.create({
      id: p.id,
      userId: p.userId,
      type: p.type,
      fileUrl: p.fileUrl,
      status: p.status,
      rejectionReason: p.rejectionReason ?? undefined,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    });
  }
}
