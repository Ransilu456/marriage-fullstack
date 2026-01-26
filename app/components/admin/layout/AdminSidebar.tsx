'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  Shield,
  Settings,
  LogOut,
  ChevronDown,
  UserCircle,
  Camera
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

interface AdminSidebarProps {
  collapsed: boolean;
  hovered: boolean;
  setHovered: (hovered: boolean) => void;
}

const menuItems = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'User Management', href: '/admin/users', icon: Users },
  { name: 'Identity Verifications', href: '/admin/identity', icon: UserCheck },
  { name: 'Photo Verifications', href: '/admin/photos', icon: Camera },
  { name: 'Proposals', href: '/admin/proposals', icon: FileText },
  { name: 'Reports', href: '/admin/reports', icon: Shield },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar({ collapsed, hovered, setHovered }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const sidebarWidth = collapsed && !hovered ? "80px" : "250px";

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      // @ts-ignore - simplistic type check for now
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
    };
    document.addEventListener("pointerdown", onClick);
    return () => document.removeEventListener("pointerdown", onClick);
  }, []);

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarWidth }}
      transition={{ type: "spring", stiffness: 400, damping: 40 }}
      onMouseEnter={() => collapsed && setHovered(true)}
      onMouseLeave={() => collapsed && setHovered(false)}
      className="fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-[#FAFAFA] border-neutral-200 transition-colors duration-300"
    >
      <div className="h-16 flex items-center px-4 border-b border-neutral-200">
        <div
          className={`flex items-center gap-3 overflow-hidden ${collapsed && !hovered ? "justify-center w-full px-0" : ""
            }`}
        >
          <div className="h-8 w-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-neutral-500/20">
            <span className="font-bold text-lg tracking-tighter">E</span>
          </div>
          {(!collapsed || hovered) && (
            <span className="font-semibold text-sm tracking-tight text-neutral-900 whitespace-nowrap opacity-100 transition-opacity duration-200">
              Eternity Admin
            </span>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
        {(!collapsed || hovered) && (
          <p className="px-2 mt-2 mb-1 text-[10px] font-medium text-neutral-400 uppercase tracking-widest">
            Platform
          </p>
        )}

        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-2.5 py-2 rounded-lg mb-0.5 transition-all duration-200 ${isActive
                ? "bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] text-neutral-900 border border-neutral-200/50 border-l-2 border-rose-500"
                : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 border-transparent"
                }`}
            >
              <IconComponent size={18} strokeWidth={1.5} />
              {(!collapsed || hovered) && (
                <span className="text-xs font-medium tracking-tight whitespace-nowrap">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}

        <div className="mt-auto">
          {(!collapsed || hovered) && (
            <p className="px-2 mb-1 text-[10px] font-medium text-neutral-400 uppercase tracking-widest">
              Account
            </p>
          )}
          <Link
            href="/admin/settings"
            className="group flex items-center gap-3 px-2.5 py-2 rounded-lg mb-0.5 transition-all duration-200 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
          >
            <UserCircle size={18} strokeWidth={1.5} />
            {(!collapsed || hovered) && (
              <span className="text-xs font-medium tracking-tight whitespace-nowrap">
                My Profile
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-neutral-200">
        <div
          className={`relative flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-neutral-200 transition-all cursor-pointer group ${collapsed && !hovered ? "justify-center" : ""
            }`}
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          ref={userMenuRef}
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-rose-100 to-white border border-neutral-200 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-rose-600">
            {session?.user?.name?.[0] || "A"}
          </div>

          {(!collapsed || hovered) && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-medium text-neutral-900 truncate">
                {session?.user?.name || "Admin"}
              </span>
              <span className="text-[10px] text-neutral-400 truncate">
                {session?.user?.email || "admin@eternity.com"}
              </span>
            </div>
          )}

          {(!collapsed || hovered) && (
            <ChevronDown size={14} className="ml-auto text-neutral-400 group-hover:text-neutral-600" />
          )}

          {/* Dropdown Menu */}
          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: -12, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute bottom-full left-0 w-full mb-2 rounded-xl bg-white border border-neutral-200 shadow-xl shadow-black/5 overflow-hidden z-50 p-1"
                style={{
                  minWidth: collapsed && !hovered ? "180px" : "100%",
                  left: collapsed && !hovered ? "3.5rem" : "0",
                }}
              >
                <Link
                  href="/"
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors mb-1"
                >
                  <LayoutDashboard size={14} />
                  Main Site
                </Link>
                <button
                  onClick={() => {
                    signOut({ callbackUrl: '/' });
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={14} />
                  Log Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}