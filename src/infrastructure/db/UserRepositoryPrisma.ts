import { IUserRepository } from '../../core/interfaces/UserRepository';
import { prisma } from './prismaClient';
import { User as DomainUser, UserRole, AccountStatus } from '../../core/entities/User';
import { User as PrismaUser, UserRole as PrismaUserRole, AccountStatus as PrismaAccountStatus } from '@prisma/client';

export class UserRepositoryPrisma implements IUserRepository {
    private mapToDomain(prismaUser: PrismaUser): DomainUser {
        return DomainUser.create({
            id: prismaUser.id,
            email: prismaUser.email,
            passwordHash: prismaUser.password,
            name: prismaUser.name || undefined,
            role: prismaUser.role as UserRole,
            createdAt: prismaUser.createdAt,
            updatedAt: prismaUser.updatedAt,
            emailVerified: prismaUser.emailVerified !== null,
            phoneVerified: prismaUser.phoneVerified,
            photoVerified: prismaUser.photoVerified,
            idVerified: prismaUser.idVerified,
            trustScore: prismaUser.trustScore,
            accountStatus: prismaUser.accountStatus as AccountStatus,
            managedById: prismaUser.managedById || undefined,
            verificationOTP: prismaUser.verificationOTP || undefined,
            otpExpires: prismaUser.otpExpires || undefined
        });
    }

    async save(user: DomainUser): Promise<DomainUser> {
        const data = {
            email: user.email,
            password: user.passwordHash,
            name: user.name || null,
            role: user.role as unknown as PrismaUserRole,
            emailVerified: user.emailVerified ? new Date() : null,
            phoneVerified: user.phoneVerified,
            photoVerified: user.photoVerified,
            idVerified: user.idVerified,
            trustScore: user.trustScore,
            accountStatus: user.accountStatus as unknown as PrismaAccountStatus,
            verificationOTP: user.verificationOTP || null,
            otpExpires: user.otpExpires || null,
        };

        const prismaUser = await prisma.user.upsert({
            where: { id: user.id },
            update: data,
            create: {
                id: user.id,
                ...data
            }
        });

        return this.mapToDomain(prismaUser);
    }

    async findById(id: string): Promise<DomainUser | null> {
        const prismaUser = await prisma.user.findUnique({
            where: { id }
        });
        return prismaUser ? this.mapToDomain(prismaUser) : null;
    }

    async findByEmail(email: string): Promise<DomainUser | null> {
        const prismaUser = await prisma.user.findUnique({
            where: { email }
        });
        return prismaUser ? this.mapToDomain(prismaUser) : null;
    }

    async updateManagedBy(userId: string, guardianId: string | null): Promise<void> {
        await prisma.user.update({
            where: { id: userId },
            data: { managedById: guardianId }
        });
    }

    async findManagedUsers(guardianId: string): Promise<DomainUser[]> {
        const prismaUsers = await prisma.user.findMany({
            where: { managedById: guardianId }
        });
        return prismaUsers.map(u => this.mapToDomain(u));
    }

    async updateAccountStatus(userId: string, status: string): Promise<void> {
        await prisma.user.update({
            where: { id: userId },
            data: { accountStatus: status as unknown as PrismaAccountStatus }
        });
    }

    async updateVerificationFlags(userId: string, flags: {
        idVerified?: boolean;
        photoVerified?: boolean;
        trustScore?: number;
    }): Promise<void> {
        await prisma.user.update({
            where: { id: userId },
            data: flags
        });
    }

    async findAllForModeration(): Promise<DomainUser[]> {
        const prismaUsers = await prisma.user.findMany({
            where: {
                role: 'USER'
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return prismaUsers.map(u => this.mapToDomain(u));
    }
}
