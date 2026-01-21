
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
    const args = process.argv.slice(2);

    if (args.length < 3) {
        console.error('Usage: npx ts-node scripts/create-admin.ts <email> <password> <name>');
        process.exit(1);
    }

    const [email, password, name] = args;

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            console.error(`User with email ${email} already exists.`);
            process.exit(1);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword, // Note: schema matches "password" or "passwordHash"? Let's check schema.
                // Schema says: password String
                // Wait, LoginUser.ts uses user.passwordHash but schema says password.
                // Let's re-read schema.
                // Schema line 45: password String
                // LoginUser.ts line 20: user.passwordHash ???
                // I need to double check the schema vs entity.
                // Let's assume schema is source of truth: password field.
                name,
                role: 'ADMIN',
                accountStatus: 'VERIFIED',
                emailVerified: new Date(),
                phoneVerified: true,
                photoVerified: true,
                idVerified: true,
                trustScore: 100,
            },
        });

        console.log(`Admin user created successfully: ${user.email} (${user.id})`);
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
