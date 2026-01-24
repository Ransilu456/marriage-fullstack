'use client';



import { useEffect, useState } from 'react';
import StatsGrid from '@/app/components/admin/dashboard/StatsGrid';
import ActivityList from '@/app/components/admin/dashboard/ActivityList';
import SystemStatus from '@/app/components/admin/dashboard/SystemStatus';
import UserChart from '@/app/components/admin/dashboard/UserChart';
import GlassCard from '@/app/components/admin/ui/GlassCard';

export default function AdminDashboardPage() {

  interface User {
    id: string;
    name?: string;
    email: string;
    createdAt: string;
    accountStatus?: string;
  }

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingVerifications: 0,
    recentSignups: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all users (limit high for dashboard)
        const res = await fetch('/api/admin/users?limit=500');
        const data = await res.json();
        const users: User[] = data.users || [];
        const now = new Date();
        // Count users created in last 7 days
        const recentSignups = users.filter((u) => {
          const created = new Date(u.createdAt);
          return (now.getTime() - created.getTime()) < 7 * 24 * 60 * 60 * 1000;
        }).length;
        setStats({
          totalUsers: users.length,
          activeUsers: users.filter((u) => u.accountStatus === 'ACTIVE').length,
          pendingVerifications: users.filter((u) => u.accountStatus === 'LIMITED' || u.accountStatus === 'PENDING').length,
          recentSignups,
        });
      } catch {
        setStats({ totalUsers: 0, activeUsers: 0, pendingVerifications: 0, recentSignups: 0 });
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900">
            Admin <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Dashboard</span>
          </h1>
          <p className="text-slate-500 mt-1">Welcome to the admin dashboard. Monitor platform activity, users, and system health.</p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <GlassCard className="p-4 flex flex-col items-center justify-center">
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Users</p>
            <p className="text-2xl font-bold text-indigo-700">{stats.totalUsers}</p>
          </GlassCard>
        </div>
      </div>

      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <UserChart />
          <ActivityList />
        </div>
        <SystemStatus />
      </div>
    </div>
  );
}
