import { NextResponse } from 'next/server';
import { UserRepositoryPrisma } from '@/src/infrastructure/db/UserRepositoryPrisma';
import bcrypt from 'bcryptjs';
import { User, UserRole, AccountStatus } from '@/src/core/entities/User';
import crypto from 'crypto';
import { getSession } from '@/src/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
        }

        const body = await request.json();

        if (!body.email || !body.password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const repo = new UserRepositoryPrisma();
        const existingUser = await repo.findByEmail(body.email);

        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        const passwordHash = await bcrypt.hash(body.password, 10);

        // We use the Entity to create, similar to RegisterUserUseCase but with ADMIN role
        // Note: The Entity factory might not expose all flags in `create`, but let's see.
        // Actually, for direct admin creation, we might want to be thorough.
        // Checking User.ts...
        // User.create takes UserProps.
        // Let's manually construct it appropriately.

        const user = User.create({
            id: crypto.randomUUID(),
            email: body.email,
            passwordHash: passwordHash,
            name: body.name || 'Admin User',
            role: UserRole.ADMIN,
            emailVerified: true,
            phoneVerified: true,
            photoVerified: true,
            idVerified: true,
            trustScore: 100,
            accountStatus: AccountStatus.VERIFIED,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await repo.save(user);

        return NextResponse.json({
            success: true,
            message: 'Admin created successfully',
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
