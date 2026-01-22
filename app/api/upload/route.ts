import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create a unique filename
        const filename = `${uuidv4()}-${file.name.replace(/\s/g, '_')}`;
        // Save to public/uploads directory (ensure it exists)
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        // Note: In production, you'd verify/create dir here or use S3

        // For this local env, we assume public/uploads exists or we should create it
        // We'll trust the directory structure or creating it beforehand
        try {
            await writeFile(join(uploadDir, filename), buffer);
        } catch (e) {
            // Fallback to just public if uploads folder missing, or error
            // actually better to error if folder missing so we know to fix
            // but let's try to write to public/uploads
            // If this fails, we might need to create the directory
            return NextResponse.json({ error: 'Failed to write file' }, { status: 500 });
        }

        const url = `/uploads/${filename}`;

        return NextResponse.json({ success: true, url });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
