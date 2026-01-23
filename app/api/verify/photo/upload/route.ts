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
        const photo = formData.get('photo') as File;

        if (!photo) {
            return NextResponse.json({ error: 'Photo is required' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(photo.type)) {
            return NextResponse.json({
                error: 'Invalid file type. Only JPG and PNG are allowed'
            }, { status: 400 });
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (photo.size > maxSize) {
            return NextResponse.json({
                error: 'File too large. Maximum size is 5MB'
            }, { status: 400 });
        }

        // Create upload directory if it doesn't exist
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'verifications');
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const extension = photo.name.split('.').pop();
        const filename = `photo_${session.userId}_${timestamp}.${extension}`;
        const filepath = join(uploadDir, filename);

        // Save file
        const bytes = await photo.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        const photoUrl = `/uploads/verifications/${filename}`;

        // Check if user already has a pending photo verification
        const existingVerification = await prisma.verification.findFirst({
            where: {
                userId: session.userId,
                documentType: 'PHOTO',
                status: 'PENDING'
            }
        });

        if (existingVerification) {
            // Update existing verification
            await prisma.verification.update({
                where: { id: existingVerification.id },
                data: {
                    documentUrl: photoUrl,
                    updatedAt: new Date()
                }
            });
        } else {
            // Create new verification record
            await prisma.verification.create({
                data: {
                    userId: session.userId,
                    documentType: 'PHOTO',
                    documentUrl: photoUrl,
                    status: 'PENDING'
                }
            });
        }

        return NextResponse.json({
            success: true,
            photoUrl,
            message: 'Photo uploaded successfully. Please upload a verification selfie.'
        });
    } catch (error: any) {
        console.error('Photo upload error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to upload photo' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const verification = await prisma.verification.findFirst({
            where: {
                userId: session.userId,
                documentType: 'PHOTO'
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!verification) {
            return NextResponse.json({
                status: 'NOT_STARTED',
                message: 'No photo verification found'
            });
        }

        return NextResponse.json({
            status: verification.status,
            documentUrl: verification.documentUrl,
            selfieUrl: verification.selfieUrl,
            notes: verification.notes,
            createdAt: verification.createdAt,
            reviewedAt: verification.reviewedAt
        });
    } catch (error: any) {
        console.error('Get verification status error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to get verification status' },
            { status: 500 }
        );
    }
}
