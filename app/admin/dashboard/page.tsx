'use client';

import { useEffect, useState } from 'react';
import { Users, FileText, UserCheck, DollarSign, Activity, TrendingUp, CheckCircle, XCircle, MoreHorizontal, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
    totalUsers: number;
    totalProfiles: number;
    totalProposals: number;
    activeProposals: number;
    pendingProfiles: number;
    revenue: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center h-full text-slate-400 animate-pulse">Loading overview...</div>;
    }

    if (!stats) return null;

    const cards = [
        { title: 'Total Users', value: stats.totalUsers, change: '+12%', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { title: 'Total Revenue', value: `$${stats.revenue.toLocaleString()}`, change: '+8%', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { title: 'Active Proposals', value: stats.activeProposals, change: '+24%', icon: FileText, color: 'text-rose-600', bg: 'bg-rose-50' },
        { title: 'Pending Profiles', value: stats.pendingProfiles, change: '-5%', icon: UserCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
                <p className="text-slate-500 font-medium">Platform performance and statistics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 border border-slate-100 flex flex-col justify-between h-40 group">
                        <div className="flex items-center justify-between">
                            <div className={`p-3 rounded-xl ${card.bg} group-hover:scale-110 transition-transform duration-300`}>
                                <card.icon size={22} className={card.color} />
                            </div>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${card.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {card.change}
                            </span>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-slate-900 mt-4">{card.value}</p>
                            <h3 className="text-sm font-medium text-slate-500 mt-1">{card.title}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart Section */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Revenue Analytics</h3>
                            <p className="text-sm text-slate-400">Monthly revenue performance</p>
                        </div>
                        <select className="text-sm border-slate-200 rounded-lg text-slate-600 focus:ring-rose-200 focus:border-rose-400 outline-none px-3 py-1.5 bg-slate-50 transition-all hover:bg-slate-100">
                            <option>This Week</option>
                            <option>This Month</option>
                            <option>This Year</option>
                        </select>
                    </div>

                    <div className="flex-1 flex items-end justify-between gap-4 px-2 h-64">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                            <div key={i} className="w-full bg-slate-50 rounded-t-lg relative group h-full flex items-end overflow-hidden">
                                <div
                                    className="w-full bg-gradient-to-t from-rose-500 to-rose-400 rounded-t-lg transition-all duration-700 group-hover:to-rose-600 group-hover:shadow-lg shadow-rose-200"
                                    style={{ height: `${h}%` }}
                                ></div>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    ${h * 100}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-6 text-xs font-semibold text-slate-400 px-2 uppercase tracking-wider">
                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                    </div>
                </div>

                {/* Quick Actions / Pending Queue */}
                <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Pending Actions</h3>
                            <p className="text-sm text-slate-400">Requires your attention</p>
                        </div>
                        <Link href="/admin/profiles?status=pending" className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1">
                            View All <ArrowRight size={12} />
                        </Link>
                    </div>

                    <div className="space-y-4 flex-1">
                        {/* Mock Pending Items - Ideally fetched from API if we want real-real */}
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer group">
                                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                                    <UserCheck size={18} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-800 group-hover:text-rose-600 transition-colors">Profile Verification</p>
                                    <p className="text-xs text-slate-500">New user requested review</p>
                                </div>
                                <button className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all">
                                    Review
                                </button>
                            </div>
                        ))}

                        <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer group">
                            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                                <Activity size={18} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-800 group-hover:text-rose-600 transition-colors">System Alert</p>
                                <p className="text-xs text-slate-500">High traffic detected</p>
                            </div>
                            <button className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all">
                                Check
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
