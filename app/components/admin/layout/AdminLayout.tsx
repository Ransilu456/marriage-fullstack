'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    setCollapsed(saved === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", collapsed ? "true" : "false");
  }, [collapsed]);

  const sidebarWidth = collapsed && !hovered ? "80px" : "250px";

  return (
    <div className={`min-h-screen selection:bg-rose-100 bg-white`}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar
          collapsed={collapsed}
          hovered={hovered}
          setHovered={setHovered}
        />

        {/* Main Content */}
        <div
          className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out bg-slate-50"
          style={{ marginLeft: sidebarWidth }}
        >
          <AdminHeader
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />

          {/* Scrollable Main Area */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
            <div className="max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-300">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
