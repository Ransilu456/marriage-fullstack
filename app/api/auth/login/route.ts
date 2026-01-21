import { NextResponse } from 'next/server';
import { LoginUserUseCase } from '../../../../src/core/use-cases/LoginUser';
import { UserRepositoryPrisma } from '../../../../src/infrastructure/db/UserRepositoryPrisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.email || !body.password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const repo = new UserRepositoryPrisma();
        const useCase = new LoginUserUseCase(repo);

        const user = await useCase.execute({
            email: body.email,
            password: body.password
        });

        // Create JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.NEXTAUTH_SECRET || 'fallback-secret',
            { expiresIn: '7d' }
        );

        // Set Cookie
        (await cookies()).set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
            sameSite: 'strict'
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: error.message === 'Invalid credentials' ? 401 : 500 }
        );
    }
}
