import { IUserRepository } from '../interfaces/UserRepository';
import { INotificationRepository } from '../interfaces/NotificationRepository';

export class VerifyEmailUseCase {
    constructor(
        private userRepo: IUserRepository,
        private notificationRepo: INotificationRepository
    ) { }

    async execute(userId: string, otp: string): Promise<void> {
        const user = await this.userRepo.findById(userId);
        if (!user) throw new Error('User not found');

        if (user.emailVerified) {
            throw new Error('Email is already verified');
        }

        if (!user.verificationOTP || user.verificationOTP !== otp) {
            throw new Error('Invalid verification code');
        }

        if (user.otpExpires && user.otpExpires < new Date()) {
            throw new Error('Verification code has expired');
        }

        // Verify and reward points
        user.verifyEmail();

        // Clear OTP
        const userObj = user.toObject();
        const updatedUser = (user.constructor as any).create({
            ...userObj,
            verificationOTP: null,
            otpExpires: null
        });

        await this.userRepo.save(updatedUser);

        // Notify in-app
        await this.notificationRepo.save({
            userId,
            type: 'VERIFICATION_SUCCESS',
            title: 'Email Verified!',
            message: 'Congratulations! Your email is verified and you earned 20 trust points.'
        });
    }
}
