import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { prisma } from '@/src/infrastructure/db/prismaClient';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const selfie = formData.get('selfie') as File;

        if (!selfie) {
            return NextResponse.json({ error: 'Selfie is required' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(selfie.type)) {
            return NextResponse.json({
                error: 'Invalid file type. Only JPG and PNG are allowed'
            }, { status: 400 });
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (selfie.size > maxSize) {
            return NextResponse.json({
                error: 'File too large. Maximum size is 5MB'
            }, { status: 400 });
        }

        // Find pending photo verification
        const verification = await prisma.verification.findFirst({
            where: {
                userId: session.userId,
                documentType: 'PHOTO',
                status: 'PENDING'
            }
        });

        if (!verification) {
            return NextResponse.json({
                error: 'No pending photo verification found. Please upload a profile photo first.'
            }, { status: 404 });
        }

        // Create upload directory if it doesn't exist
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'verifications');
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const extension = selfie.name.split('.').pop();
        const filename = `selfie_${session.userId}_${timestamp}.${extension}`;
        const filepath = join(uploadDir, filename);

        // Save file
        const bytes = await selfie.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        const selfieUrl = `/uploads/verifications/${filename}`;

        // Update verification with selfie URL
        await prisma.verification.update({
            where: { id: verification.id },
            data: {
                selfieUrl,
                updatedAt: new Date()
            }
        });

        // Create notification for admins
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' }
        });

        for (const admin of admins) {
            await prisma.notification.create({
                data: {
                    userId: admin.id,
                    type: 'VERIFICATION_PENDING',
                    title: 'New Photo Verification',
                    message: `User ${session.userId} submitted a photo verification request`,
                    link: `/admin/verify/photos/${verification.id}`
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Verification submitted successfully. An admin will review it shortly.',
            verificationId: verification.id
        });
    } catch (error: any) {
        console.error('Selfie upload error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to upload selfie' },
            { status: 500 }
        );
    }
}
