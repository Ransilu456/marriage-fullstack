import { NextResponse } from 'next/server';
import { RegisterUserUseCase } from '../../../../src/core/use-cases/RegisterUser';
import { UserRepositoryPrisma } from '../../../../src/infrastructure/db/UserRepositoryPrisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.email || !body.password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const repo = new UserRepositoryPrisma();
        const useCase = new RegisterUserUseCase(repo);

        const user = await useCase.execute({
            email: body.email,
            password: body.password,
            name: body.name
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
            { status: error.message === 'User already exists' ? 409 : 500 }
        );
    }
}
