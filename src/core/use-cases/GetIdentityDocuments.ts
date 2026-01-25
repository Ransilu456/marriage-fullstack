import { IIdentityDocumentRepository } from '../interfaces/IdentityDocumentRepository';

export class GetIdentityDocuments {
    constructor(private docRepo: IIdentityDocumentRepository) { }

    async execute(userId: string) {
        const docs = await this.docRepo.findByUserId(userId);
        return docs.map(doc => doc.toJSON());
    }
}
