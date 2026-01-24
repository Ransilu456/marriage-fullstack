
import { Users, Activity, ShieldAlert, UserPlus } from 'lucide-react';
import StatCard from './StatCard';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  pendingVerifications: number;
  recentSignups: number;
}

export default function StatsGrid({ stats }: { stats: AdminStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard label="Total Users" value={stats.totalUsers} icon={Users} color="blue" />
      <StatCard label="Active Users" value={stats.activeUsers} icon={Activity} color="emerald" />
      <StatCard label="Pending Verification" value={stats.pendingVerifications} icon={ShieldAlert} color="amber" />
      <StatCard label="New Users" value={stats.recentSignups} icon={UserPlus} color="rose" />
    </div>
  );
}
