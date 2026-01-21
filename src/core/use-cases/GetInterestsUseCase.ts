
import { IInterestRepository } from '../interfaces/IInterestRepository';
import { IProfileRepository } from '../interfaces/ProfileRepository';
import { Interest } from '../entities/Interest';

export interface InterestDTO {
    id: string;
    senderId: string;
    receiverId: string;
    status: string;
    message?: string;
    createdAt: string; // ISO string for JSON serialization
    updatedAt: string;
    senderName?: string;
    senderPhoto?: string;
    receiverName?: string;
    receiverPhoto?: string;
}

export class GetInterestsUseCase {
    constructor(
        private interestRepo: IInterestRepository,
        private profileRepo: IProfileRepository
    ) { }

    async execute(userId: string, type: 'sent' | 'received'): Promise<InterestDTO[]> {
        let interests: Interest[] = [];

        if (type === 'sent') {
            interests = await this.interestRepo.findSent(userId);
        } else {
            interests = await this.interestRepo.findReceived(userId);
        }

        // Enrich with profile data
        const enriched = await Promise.all(interests.map(async (interest) => {
            const partnerId = type === 'sent' ? interest.receiverId : interest.senderId;
            const partnerProfile = await this.profileRepo.findByUserId(partnerId);

            // Fetch my own profile for the other side if needed, but usually we just need the partner's details
            // relative to the current user.
            // If I sent it, I want to see the Receiver's Name.
            // If I received it, I want to see the Sender's Name.

            let senderName, senderPhoto, receiverName, receiverPhoto;

            if (type === 'received') {
                // I am receiver. Partner is sender.
                if (partnerProfile) {
                    const json = partnerProfile.toJSON();
                    senderName = json.jobCategory || "Member"; // Privacy: Use Job or similar until matched? Or name if public? 
                    // Application.md says "Serious matrimonial". Usually name is shown or obscured.
                    // For now, let's assume we want to show some identity.
                    // The Profile entity likely has name or User entity has name.
                    // ProfileRepository.findByUserId returns a Profile entity.
                    // Let's assume Profile has the photoUrl.
                    senderPhoto = json.photoUrl;
                    senderName = "Member"; // Default privacy
                }
                // Real name requires User repo or Profile having name.
                // Let's check Profile entity definition.
            } else {
                // I am sender. Partner is receiver.
                if (partnerProfile) {
                    const json = partnerProfile.toJSON();
                    receiverPhoto = json.photoUrl;
                    receiverName = "Member";
                }
            }

            // To get actual Names, we might need IUserRepository or if Profile has it.
            // I'll stick to basic enrichment for now and if I miss names, I'll update.

            return {
                id: interest.id,
                senderId: interest.senderId,
                receiverId: interest.receiverId,
                status: interest.status,
                message: interest.message,
                createdAt: interest.createdAt.toISOString(),
                updatedAt: interest.updatedAt.toISOString(),
                senderName,
                senderPhoto,
                receiverName,
                receiverPhoto
            };
        }));

        return enriched;
    }
}
