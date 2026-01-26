import { IUserRepository } from '../interfaces/UserRepository';
import { IEmailService } from '../interfaces/EmailService';
import { INotificationRepository } from '../interfaces/NotificationRepository';

export class GenerateEmailVerificationTokenUseCase {
    constructor(
        private userRepo: IUserRepository,
        private emailService: IEmailService,
        private notificationRepo: INotificationRepository
    ) { }

    async execute(userId: string): Promise<void> {
        const user = await this.userRepo.findById(userId);
        if (!user) throw new Error('User not found');

        if (user.emailVerified) {
            throw new Error('Email is already verified');
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Save to user (Need to update User entity/repo if not already supported)
        const userObj = user.toObject();
        const updatedUser = (user.constructor as any).create({
            ...userObj,
            verificationOTP: otp,
            otpExpires: expires
        });

        await this.userRepo.save(updatedUser);

        // Send Email
        if ((this.emailService as any).sendEmailVerification) {
            await (this.emailService as any).sendEmailVerification(user.email, otp);
        } else {
            console.log(`📧 [MOCK EMAIL] Verification OTP for ${user.email}: ${otp}`);
        }

        // Notify in-app
        await this.notificationRepo.save({
            userId,
            type: 'EMAIL_VERIFICATION',
            title: 'Verify Your Email',
            message: `A verification code has been sent to ${user.email}. Use it to get +20 trust points!`
        });
    }
}
