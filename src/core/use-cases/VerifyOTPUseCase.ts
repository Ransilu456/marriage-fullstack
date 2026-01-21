
import { IUserRepository } from '../interfaces/UserRepository';
import { User, AccountStatus } from '../entities/User';

interface VerifyOTPInput {
    userId: string;
    otp: string;
    type: 'EMAIL' | 'PHONE';
}

interface VerifyOTPResult {
    success: boolean;
    message: string;
}

export class VerifyOTPUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(input: VerifyOTPInput): Promise<VerifyOTPResult> {
        const user = await this.userRepository.findById(input.userId);

        if (!user) {
            throw new Error('User not found');
        }

        // 1. Check if OTP matches
        if (!user.verificationOTP || user.verificationOTP !== input.otp) {
            throw new Error('Invalid verification code');
        }

        // 2. Check expiry
        if (user.otpExpires && user.otpExpires < new Date()) {
            throw new Error('Verification code has expired');
        }

        // 3. Update verification flags
        // We need to mutate the user props. Since User is immutable (mostly getters), 
        // we might typically use a method like `verifyEmail()` on the entity to return a new instance or mutate internal state.
        // However, looking at the User entity, it takes `props` in constructor. 
        // Let's create a new User instance with updated props to stay pure/immutable if possible, 
        // OR simpler: we cast to any to modify or add a setter method to the User entity.
        // Given the code I see, the User entity seems to be anemic/DTO-like with getters.
        // I will re-create the user with updated props using User.create or similar, but User.create sets defaults.
        // I'll assume we can pass all props to the constructor if we export UserProps or use a hack.
        // Actually, the cleanest way without changing Entity too much is to just use what we have.
        // User entity has `toObject()`.

        const userProps = user.toObject();

        if (input.type === 'EMAIL') userProps.emailVerified = true;
        if (input.type === 'PHONE') userProps.phoneVerified = true;

        // Clear OTP
        userProps.verificationOTP = undefined;
        userProps.otpExpires = undefined;

        // Auto-upgrade status
        // For this flow, let's say verification makes you "VERIFIED"
        userProps.accountStatus = AccountStatus.VERIFIED;

        // Re-create user entity
        // Note: usage of 'any' might be needed if UserProps is not fully matching what constructor expects strictly public
        // but User constructor takes UserProps.
        const updatedUser = new User(userProps);

        await this.userRepository.save(updatedUser);

        return {
            success: true,
            message: `${input.type} verified successfully. Your account is now verified.`
        };
    }
}
