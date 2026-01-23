'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    ShieldCheck,
    FileText,
    Settings,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';
import { signOut } from 'next-auth/react';

export default function AdminSidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const routes = [
        {
            label: 'Dashboard',
            icon: LayoutDashboard,
            href: '/admin',
            active: pathname === '/admin',
        },
        {
            label: 'Users',
            icon: Users,
            href: '/admin/users',
            active: pathname?.startsWith('/admin/users'),
        },
        {
            label: 'Verifications',
            icon: ShieldCheck,
            href: '/admin/verify',
            active: pathname?.startsWith('/admin/verify'),
        },
        {
            label: 'Reports',
            icon: FileText,
            href: '/admin/reports',
            active: pathname?.startsWith('/admin/reports'),
        },
    ];

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md text-slate-600"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 z-40 h-screen w-72 bg-white border-r border-slate-200
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="flex flex-col h-full bg-gradient-to-b from-rose-50/50 to-white">
                    {/* Brand */}
                    <div className="h-20 flex items-center px-8 border-b border-rose-100">
                        <Link href="/admin" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center text-white font-serif font-bold text-xl">
                                E
                            </div>
                            <span className="text-xl font-serif font-bold text-slate-900">
                                Admin<span className="text-rose-600">Panel</span>
                            </span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto py-8 px-4 space-y-1">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                onClick={() => setIsOpen(false)}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                                    ${route.active
                                        ? 'bg-rose-600 text-white shadow-md shadow-rose-200 font-medium'
                                        : 'text-slate-500 hover:bg-rose-50 hover:text-rose-600'
                                    }
                                `}
                            >
                                <route.icon size={20} className={route.active ? 'text-white' : 'text-slate-400 group-hover:text-rose-600'} />
                                {route.label}
                            </Link>
                        ))}
                    </div>

                    {/* Footer / User */}
                    <div className="p-4 border-t border-slate-100 bg-white">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                                    A
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate">Administrator</p>
                                    <p className="text-xs text-slate-500 truncate">System Access</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                localStorage.clear();
                                signOut({ callbackUrl: '/' });
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-sm font-medium"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
