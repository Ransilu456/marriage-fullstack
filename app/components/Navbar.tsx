'use client';

import { useState } from 'react';
import Link from 'next/link';
/* Wait, I should use next/link. The previous version had Link from next/link. */
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Menu, X, HeartHandshake } from 'lucide-react';
import { NotificationBell } from './NotificationBell';

/* Correcting the import above */
import NextLink from 'next/link';

export default function Navbar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    const navItems = session ? [
        { name: 'Discover', href: '/discover' },
        { name: 'Proposals', href: '/proposals' },
        { name: 'Messages', href: '/messages' },
        { name: 'Family', href: '/family' },
    ] : [];

    return (
        <nav className="fixed w-full z-[100] top-0 left-0 bg-white/80 backdrop-blur-md border-b border-rose-100/30 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <NextLink href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-orange-400 rounded-lg flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                        <HeartHandshake size={18} />
                    </div>
                    <span className="font-serif text-xl tracking-tight text-slate-900 font-bold">
                        Eternity
                    </span>
                </NextLink>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <div className="flex items-center gap-8 text-xs font-medium text-slate-500">
                        {navItems.map((item) => (
                            <NextLink
                                key={item.name}
                                href={item.href}
                                className={`transition-all hover:text-rose-600 ${pathname === item.href ? 'text-rose-600 font-bold' : ''
                                    }`}
                            >
                                {item.name}
                            </NextLink>
                        ))}
                    </div>

                    <div className="h-4 w-px bg-slate-200 mx-1" />

                    {session ? (
                        <div className="flex items-center gap-6">
                            {/* Admin Dashboard Link */}
                            {session?.user?.role === 'ADMIN' && (
                                <NextLink
                                    href="/admin"
                                    className={`text-xs font-medium transition-all hover:text-rose-600 ${pathname?.startsWith('/admin') ? 'text-rose-600 font-bold' : 'text-slate-500'
                                        }`}
                                >
                                    Dashboard
                                </NextLink>
                            )}
                            <NotificationBell />
                            <NextLink
                                href="/profile"
                                className={`text-xs font-medium transition-all hover:text-rose-600 ${pathname === '/profile' ? 'text-rose-600 font-bold' : 'text-slate-500'
                                    }`}
                            >
                                Profile
                            </NextLink>
                            <button
                                onClick={() => {
                                    localStorage.clear();
                                    signOut();
                                }}
                                className="text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors"
                            >
                                Log out
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <NextLink
                                href="/auth/login"
                                className="text-xs font-medium text-slate-600 hover:text-rose-600 transition-colors"
                            >
                                Log in
                            </NextLink>
                            <NextLink
                                href="/auth/register"
                                className="bg-slate-900 hover:bg-rose-600 text-white text-xs font-medium py-2 px-5 rounded-lg transition-all shadow-md hover:shadow-rose-500/20"
                            >
                                Join Now
                            </NextLink>
                        </div>
                    )}
                </div>

                <div className="md:hidden flex items-center">
                    <button
                        onClick={toggleMenu}
                        className="p-1.5 text-slate-600"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-slate-100 overflow-hidden shadow-xl"
                    >
                        <div className="px-6 py-8 flex flex-col gap-6">
                            {navItems.map((item) => (
                                <NextLink
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`text-sm font-medium transition-all ${pathname === item.href ? 'text-rose-600' : 'text-slate-500'
                                        }`}
                                >
                                    {item.name}
                                </NextLink>
                            ))}
                            {session ? (
                                <>
                                    {session?.user?.role === 'ADMIN' && (
                                        <NextLink
                                            href="/admin"
                                            onClick={() => setIsOpen(false)}
                                            className="text-sm font-medium text-slate-500 hover:text-rose-600"
                                        >
                                            Admin Dashboard
                                        </NextLink>
                                    )}
                                    <NextLink
                                        href="/profile"
                                        onClick={() => setIsOpen(false)}
                                        className="text-sm font-medium text-slate-500"
                                    >
                                        My Profile
                                    </NextLink>
                                    <button
                                        onClick={() => {
                                            localStorage.clear();
                                            signOut();
                                            setIsOpen(false);
                                        }}
                                        className="text-left text-sm font-medium text-rose-600"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <NextLink
                                        href="/auth/login"
                                        onClick={() => setIsOpen(false)}
                                        className="text-sm font-medium text-slate-500"
                                    >
                                        Login
                                    </NextLink>
                                    <NextLink
                                        href="/auth/register"
                                        onClick={() => setIsOpen(false)}
                                        className="bg-slate-900 text-white text-center text-sm font-medium py-3 rounded-lg"
                                    >
                                        Join Eternity
                                    </NextLink>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}