'use client';

import { useEffect, useState } from 'react';
import { Users, ShieldAlert, Activity, UserPlus } from 'lucide-react';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        pendingVerifications: 0,
        recentSignups: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/users?limit=1');
            const data = await res.json();
            if (data) {
                setStats({
                    totalUsers: data.pagination?.total || 0,
                    pendingVerifications: 5, 
                    recentSignups: 12 
                });
            }
        } catch (error) {
            console.error('Failed to fetch stats', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center pt-20">
                <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin" />
            </div>
        );
    }

    const cards = [
        {
            label: 'Total Users',
            value: stats.totalUsers,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50 border-blue-100',
        },
        {
            label: 'Pending Verifications',
            value: stats.pendingVerifications,
            icon: ShieldAlert,
            color: 'text-amber-600',
            bg: 'bg-amber-50 border-amber-100',
        },
        {
            label: 'New Users (7d)',
            value: stats.recentSignups,
            icon: UserPlus,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 border-emerald-100',
        },
        {
            label: 'Active Sessions',
            value: '24',
            icon: Activity,
            color: 'text-rose-600',
            bg: 'bg-rose-50 border-rose-100',
        }
    ];

    return (
        <div className="p-6 pt-24 space-y-10 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-slate-900">Admin <span className="text-rose-600">Dashboard</span></h1>
                    <p className="text-slate-500 mt-2 text-lg font-light">Welcome back, Administrator. Here&lsquo;s what&apos;s happening today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-4 py-2 bg-white rounded-full text-sm font-bold text-slate-500 border border-slate-200 shadow-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        System Operational
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                    <div key={card.label} className={`p-6 rounded-3xl border ${card.bg} shadow-sm backdrop-blur-sm`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">{card.label}</p>
                                <p className="text-4xl font-serif font-bold text-slate-900">{card.value}</p>
                            </div>
                            <div className={`p-3 rounded-2xl bg-white/80 shadow-sm ${card.color}`}>
                                <card.icon size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm min-h-100">
                    <h3 className="text-xl font-serif font-bold text-slate-900 mb-6">System Health</h3>
                    <div className="flex items-center justify-center h-64 text-slate-400 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                        Placeholder Graph / Chart
                    </div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-serif font-bold text-slate-900 mb-6">Recent Events</h3>
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                                    <Activity size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">System Update</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Automated backup completed successfully.</p>
                                    <p className="text-[10px] text-slate-400 mt-2 font-mono">10:42 AM</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
