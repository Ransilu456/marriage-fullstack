import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { DeleteAccountUseCase } from '@/src/core/use-cases/DeleteAccountUseCase';

export async function DELETE(req: Request) {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const deleteAccountUseCase = new DeleteAccountUseCase();
        const result = await deleteAccountUseCase.execute(session.userId);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Failed to delete account' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: result.message
        });
    } catch (error: any) {
        console.error('Delete account API error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
