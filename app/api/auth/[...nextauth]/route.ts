import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { UserRepositoryPrisma } from '@/src/infrastructure/db/UserRepositoryPrisma';
import { ProfileRepositoryPrisma } from '@/src/infrastructure/db/ProfileRepositoryPrisma';
import { LoginUserUseCase } from '@/src/core/use-cases/LoginUser';

console.log('!!! NEXTAUTH ROUTE HANDLER INITIALIZED !!!');

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                console.log('>>> [NEXTAUTH] AUTHORIZE START');
                console.log('>>> Host:', (req as any)?.headers?.host || 'unknown');
                console.log('>>> Credentials:', { email: credentials?.email, hasPassword: !!credentials?.password });

                if (!credentials || !credentials.email || !credentials.password) {
                    console.log('>>> [NEXTAUTH] Missing inputs');
                    return null;
                }

                try {
                    const repo = new UserRepositoryPrisma();
                    const useCase = new LoginUserUseCase(repo);
                    const user = await useCase.execute({
                        email: credentials.email,
                        password: credentials.password
                    });

                    console.log('>>> [NEXTAUTH] Success! User:', user.id, user.role);

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role
                    };
                } catch (error: any) {
                    console.error('>>> [NEXTAUTH] Authorize Error:', error.message);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, account, trigger, session }) {
            // Initial sign in
            if (user) {
                console.log('>>> [NEXTAUTH] JWT CALLBACK - NEW USER:', user.id, (user as any).role);
                token.id = user.id;
                token.role = (user as any).role;

                // Check if profile exists
                try {
                    const profileRepo = new ProfileRepositoryPrisma();
                    const profile = await profileRepo.findByUserId(user.id);
                    token.hasProfile = !!profile;
                    console.log('>>> [NEXTAUTH] Profile Check:', !!profile);
                } catch (e) {
                    console.error('>>> [NEXTAUTH] Profile Check Failed:', e);
                    token.hasProfile = false;
                }
            }

            // Update session trigger
            if (trigger === "update" && session) {
                // Allow updating hasProfile from client if needed
                if (session.hasProfile !== undefined) {
                    token.hasProfile = session.hasProfile;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).hasProfile = token.hasProfile;
            }
            return session;
        }
    },
    pages: {
        signIn: '/auth/login',
        error: '/auth/error',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
