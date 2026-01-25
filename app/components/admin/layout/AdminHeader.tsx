'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Menu, Search } from 'lucide-react';
import { NotificationBell } from '@/app/components/NotificationBell';

interface AdminHeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function AdminHeader({ collapsed, setCollapsed }: AdminHeaderProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <header className="h-16 px-6 md:px-8 flex items-center justify-between border-b border-neutral-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-2.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>

        <div className="flex items-center gap-3 text-[13px]">
          <span className="text-slate-400 font-medium">Administration</span>
          <span className="text-slate-200">/</span>
          <span className="font-bold text-slate-900 tracking-tight capitalize">
            {pathname?.split('/').pop()?.replace(/-/g, ' ') || "Overview"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Global Search - Enhanced Aesthetics */}
        <div className="hidden md:flex items-center gap-3 h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-rose-400 focus-within:ring-4 focus-within:ring-rose-50/50 focus-within:bg-white transition-all duration-300 w-64 lg:w-96 group shadow-sm">
          <Search size={18} className="text-slate-400 group-focus-within:text-rose-500 transition-colors" />
          <input
            type="text"
            placeholder="Search users, profiles, documents..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400 font-medium"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const target = e.target as HTMLInputElement;
                if (target.value.trim()) {
                  window.location.href = `/admin/users?search=${encodeURIComponent(target.value)}`;
                }
              }
            }}
          />
          <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 font-mono text-[10px] font-bold text-slate-400 shadow-sm">
            <span className="text-[10px]">⌘</span>
            <span className="text-[10px]">K</span>
          </kbd>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1"></div>

        {/* Notifications */}
        <NotificationBell />
      </div>
    </header>
  );
}
