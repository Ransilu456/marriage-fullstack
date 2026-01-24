'use client';

import { Bell, LogOut } from 'lucide-react';

export default function AdminHeader() {
  return (
    // Make header part of the layout flow and sticky within admin content
    <header className="sticky top-0 h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-30 lg:ml-72">
      <h2 className="font-bold text-lg text-slate-800">Admin Panel</h2>

      <div className="flex items-center gap-4">
        <button className="relative">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-600">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </header>
  );
}
