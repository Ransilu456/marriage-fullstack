'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ShieldCheck, FileText } from 'lucide-react';
import { useState } from 'react';

const routes = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { label: 'Users', icon: Users, href: '/admin/users' },
  { label: 'Verifications', icon: ShieldCheck, href: '/admin/verify' },
  { label: 'Reports', icon: FileText, href: '/admin/reports' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-20 bottom-0 h-[calc(100vh-5rem)] w-72 bg-white border-r border-slate-200 z-50 transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } overflow-y-auto`}
      >
        <div className="flex flex-col gap-4 p-6 border-b border-slate-100 relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 relative rounded-full overflow-hidden border-2 border-rose-200 shadow">
              <Image src="/avatar-admin.png" alt="Admin" fill sizes="48px" className="object-cover" />
            </div>
            <div>
              <div className="font-bold text-lg text-slate-900">Admin User</div>
              <div className="text-xs text-slate-400 font-semibold">Administrator</div>
            </div>
          </div>

          <button
            className="lg:hidden absolute top-6 right-6 text-slate-400 hover:text-rose-600"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <nav className="px-4 pt-6 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">Main</div>
          {routes.map(r => {
            const active = pathname === r.href;
            return (
              <Link
                key={r.href}
                href={r.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                  active
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-rose-50 hover:text-rose-600'
                }`}
                onClick={() => setOpen(false)}
              >
                <r.icon size={22} />
                {r.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-6 text-xs text-slate-400">&copy; {new Date().getFullYear()} Marrage Admin</div>
      </aside>

      {/* Hamburger for mobile */}
      <button
        className="fixed top-4 left-4 z-50 p-2 bg-white border border-slate-200 rounded-lg shadow-md text-slate-600 lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
    </>
  );
}
