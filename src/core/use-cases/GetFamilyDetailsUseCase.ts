
import { IUserRepository } from '../interfaces/UserRepository';
import { User } from '../entities/User';

export interface FamilyDetailsDTO {
    managedBy: { id: string; name: string; email: string } | null;
    manages: Array<{ id: string; name: string; email: string }>;
}

export class GetFamilyDetailsUseCase {
    constructor(private userRepo: IUserRepository) { }

    async execute(userId: string): Promise<FamilyDetailsDTO> {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        // Get details of manager (Guardian)
        let managedBy = null;
        // Accessing _managedById (private property) via getter if available?
        // User entity should have this prop exposed.
        // Assuming User entity has managedById getter.
        if (user.managedById) {
            const guardian = await this.userRepo.findById(user.managedById);
            if (guardian) {
                managedBy = {
                    id: guardian.id,
                    name: guardian.name || 'Unknown Guardian',
                    email: guardian.email
                };
            }
        }

        // Get details of users managed
        const managedUsers = await this.userRepo.findManagedUsers(userId);
        const manages = managedUsers.map(u => ({
            id: u.id,
            name: u.name || 'Unnamed User',
            email: u.email
        }));

        return {
            managedBy,
            manages
        };
    }
}
