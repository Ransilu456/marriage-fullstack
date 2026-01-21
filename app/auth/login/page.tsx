'use client';

import { motion } from 'framer-motion';
import AuthForm from '@/app/components/AuthForm';
import { HeartHandshake } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    return (
        <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Blur */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-rose-200/30 rounded-full blur-3xl mix-blend-multiply filter"></div>
            <div className="absolute top-20 right-20 w-72 h-72 bg-orange-100/40 rounded-full blur-3xl mix-blend-multiply filter"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <Link href="/" className="flex items-center justify-center gap-2 mb-12">
                    <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-orange-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                        <HeartHandshake size={24} />
                    </div>
                    <span className="font-serif text-2xl tracking-tight text-slate-900 font-bold">Eternity</span>
                </Link>

                <div className="relative">
                    <AuthForm mode="login" />
                    <div className="absolute -right-4 -bottom-4 w-full h-full border border-rose-200 rounded-[2rem] -z-10"></div>
                </div>

                <p className="text-center mt-12 text-slate-400 text-xs">
                    © 2024 Eternity Matrimony. Crafted with love for meaningful connections.
                </p>
            </motion.div>
        </main>
    );
}
