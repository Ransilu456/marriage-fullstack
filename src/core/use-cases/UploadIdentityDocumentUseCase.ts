
import { IIdentityDocumentRepository } from '../interfaces/IdentityDocumentRepository';
import { IUserRepository } from '../interfaces/UserRepository';
import { IdentityDocument } from '../entities/IdentityDocument';
import { prisma } from '@/src/infrastructure/db/prismaClient';

export interface UploadIdentityInput {
    userId: string;
    type: string;
    fileUrl: string;
}

export class UploadIdentityDocumentUseCase {
    constructor(
        private docRepo: IIdentityDocumentRepository,
        private userRepo: IUserRepository
    ) { }

    async execute(input: UploadIdentityInput): Promise<IdentityDocument> {
        const user = await this.userRepo.findById(input.userId);
        if (!user) throw new Error("User not found");

        // Reset verification flags based on new upload
        if (['ID_CARD', 'PASSPORT', 'DRIVING_LICENSE'].includes(input.type)) {
            await this.userRepo.updateVerificationFlags(user.id, { idVerified: false });
        } else if (input.type === 'PHOTO') {
            await this.userRepo.updateVerificationFlags(user.id, { photoVerified: false });
        }

        const doc = IdentityDocument.create({
            userId: input.userId,
            type: input.type,
            fileUrl: input.fileUrl,
            status: 'PENDING'
        });

        // Sync with Verification table for Admin review
        const verificationType = ['ID_CARD', 'PASSPORT', 'DRIVING_LICENSE'].includes(input.type) ? 'ID' :
            input.type === 'PHOTO' ? 'PHOTO' : 'ID';

        await prisma.verification.create({
            data: {
                userId: input.userId,
                documentType: verificationType,
                documentUrl: input.fileUrl,
                status: 'PENDING'
            }
        });

        return await this.docRepo.save(doc);
    }
}
