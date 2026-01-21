import { IUserRepository } from '../interfaces/UserRepository';
import { User } from '../entities/User';
import bcrypt from 'bcryptjs';

interface LoginUserInput {
    email: string;
    password: string;
}

export class LoginUserUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(input: LoginUserInput): Promise<User> {
        const user = await this.userRepository.findByEmail(input.email);

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(input.password, user.passwordHash);

        if (!isValid) {
            throw new Error('Invalid credentials');
        }

        return user;
    }
}
