'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Heart, Settings, LogOut, User, Bell, Shield,
    Lock, CreditCard, Users, Eye, MapPin, Zap,
    CheckCircle, AlertCircle, Clock, Download, Trash2,
    Edit3, ChevronRight, BarChart3, TrendingUp, MessageSquare,
    Calendar, FileText, HelpCircle
} from 'lucide-react';

interface DashboardStats {
    totalMatches: number;
    pendingProposals: number;
    unreadMessages: number;
    profileCompletion: number;
    verificationStatus: string;
    trustScore: number;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats>({
        totalMatches: 0,
        pendingProposals: 0,
        unreadMessages: 0,
        profileCompletion: 0,
        verificationStatus: 'pending',
        trustScore: 0
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (status === 'authenticated') {
            fetchDashboardStats();
        }
    }, [status]);

    const fetchDashboardStats = async () => {
        try {
            const res = await fetch('/api/user/account');
            const data = await res.json();
            if (data) {
                setStats({
                    totalMatches: data.matches || 0,
                    pendingProposals: data.proposals || 0,
                    unreadMessages: data.messages || 0,
                    profileCompletion: data.profileCompletion || 0,
                    verificationStatus: data.verificationStatus || 'pending',
                    trustScore: data.trustScore || 0
                });
            }
        } catch (error) {
            console.error('Failed to fetch dashboard stats', error);
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin" />
            </div>
        );
    }

    const accountMenuItems = [
        { id: 'profile', label: 'Edit Profile', icon: Edit3, href: '/profile/edit' },
        { id: 'preferences', label: 'Preferences', icon: Settings, href: '/profile/preferences' },
        { id: 'privacy', label: 'Privacy & Security', icon: Shield, href: '/settings/privacy' },
        { id: 'verification', label: 'Verification', icon: CheckCircle, href: '/verify/photo' },
        { id: 'billing', label: 'Billing & Plans', icon: CreditCard, href: '/settings/billing' },
    ];

    const dangerZoneItems = [
        { label: 'Download Data', icon: Download, action: 'download' },
        { label: 'Delete Account', icon: Trash2, action: 'delete', danger: true },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">
                        Welcome back, <span className="text-rose-600">{session?.user?.name || 'User'}</span>
                    </h1>
                    <p className="text-slate-600">Manage your account and settings from here</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <motion.div
                        whileHover={{ translateY: -4 }}
                        className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Matches</p>
                                <p className="text-3xl font-bold text-slate-900">{stats.totalMatches}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
                                <Heart size={24} />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ translateY: -4 }}
                        className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Proposals</p>
                                <p className="text-3xl font-bold text-slate-900">{stats.pendingProposals}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                                <Clock size={24} />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ translateY: -4 }}
                        className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Messages</p>
                                <p className="text-3xl font-bold text-slate-900">{stats.unreadMessages}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                                <MessageSquare size={24} />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ translateY: -4 }}
                        className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Trust Score</p>
                                <p className="text-3xl font-bold text-slate-900">{stats.trustScore}%</p>
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                                <Zap size={24} />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Profile Completion Banner */}
                <motion.div
                    whileHover={{ translateY: -2 }}
                    className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-2xl p-6 mb-8 border border-rose-200"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-900 mb-2">Profile Completion</h3>
                            <p className="text-sm text-slate-600 mb-4">Complete your profile to increase match visibility</p>
                            <div className="w-full bg-white rounded-full h-3 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-300"
                                    style={{ width: `${stats.profileCompletion}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-600 mt-2">{stats.profileCompletion}% complete</p>
                        </div>
                        <Link
                            href="/profile/edit"
                            className="ml-6 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm font-medium whitespace-nowrap"
                        >
                            Complete Profile
                        </Link>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 border-b border-slate-200">
                    {[
                        { id: 'overview', label: 'Overview' },
                        { id: 'account', label: 'Account Management' },
                        { id: 'security', label: 'Security' },
                        { id: 'activity', label: 'Activity' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === tab.id
                                    ? 'border-rose-600 text-rose-600'
                                    : 'border-transparent text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl p-6 border border-slate-200">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <Link
                                        href="/discover"
                                        className="p-4 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors text-center"
                                    >
                                        <Eye className="mx-auto mb-2 text-rose-600" size={20} />
                                        <p className="text-sm font-medium text-slate-900">Browse Profiles</p>
                                    </Link>
                                    <Link
                                        href="/proposals"
                                        className="p-4 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors text-center"
                                    >
                                        <Users className="mx-auto mb-2 text-amber-600" size={20} />
                                        <p className="text-sm font-medium text-slate-900">Proposals</p>
                                    </Link>
                                    <Link
                                        href="/messages"
                                        className="p-4 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors text-center"
                                    >
                                        <MessageSquare className="mx-auto mb-2 text-blue-600" size={20} />
                                        <p className="text-sm font-medium text-slate-900">Messages</p>
                                    </Link>
                                    <Link
                                        href="/family"
                                        className="p-4 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors text-center"
                                    >
                                        <Users className="mx-auto mb-2 text-purple-600" size={20} />
                                        <p className="text-sm font-medium text-slate-900">Family</p>
                                    </Link>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 border border-slate-200">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Verification Status</h3>
                                <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 border border-blue-200">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-blue-100">
                                            <CheckCircle className="text-blue-600" size={20} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">
                                                {stats.verificationStatus === 'verified' ? 'Verified' : 'Pending Verification'}
                                            </p>
                                            <p className="text-xs text-slate-600">
                                                {stats.verificationStatus === 'verified'
                                                    ? 'Your account is verified'
                                                    : 'Complete photo verification to increase trust'}
                                            </p>
                                        </div>
                                    </div>
                                    {stats.verificationStatus !== 'verified' && (
                                        <Link
                                            href="/verify/photo"
                                            className="text-xs font-medium text-blue-600 hover:text-blue-700"
                                        >
                                            Verify Now
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl p-6 border border-slate-200">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Help & Support</h3>
                                <div className="space-y-2">
                                    <a href="#" className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                        <span className="text-sm font-medium text-slate-600">FAQ</span>
                                        <ChevronRight size={16} className="text-slate-400" />
                                    </a>
                                    <a href="#" className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                        <span className="text-sm font-medium text-slate-600">Contact Support</span>
                                        <ChevronRight size={16} className="text-slate-400" />
                                    </a>
                                    <a href="#" className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                        <span className="text-sm font-medium text-slate-600">Guidelines</span>
                                        <ChevronRight size={16} className="text-slate-400" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'account' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            {accountMenuItems.map(item => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-rose-300 hover:shadow-md transition-all flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-lg bg-slate-100 group-hover:bg-rose-50 transition-colors">
                                                <Icon className="text-slate-600 group-hover:text-rose-600" size={20} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{item.label}</p>
                                                <p className="text-xs text-slate-500">
                                                    {item.id === 'profile' && 'Update your profile information'}
                                                    {item.id === 'preferences' && 'Manage match preferences'}
                                                    {item.id === 'privacy' && 'Control privacy settings'}
                                                    {item.id === 'verification' && 'Verify your identity'}
                                                    {item.id === 'billing' && 'Manage subscriptions'}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight className="text-slate-400 group-hover:text-rose-600 transition-colors" size={20} />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="max-w-2xl space-y-6">
                        <div className="bg-white rounded-2xl p-6 border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Lock size={20} className="text-rose-600" />
                                Password & Authentication
                            </h3>
                            <button className="w-full p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-left">
                                <p className="font-medium text-slate-900">Change Password</p>
                                <p className="text-xs text-slate-500 mt-1">Last changed 30 days ago</p>
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Shield size={20} className="text-emerald-600" />
                                Two-Factor Authentication
                            </h3>
                            <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                                <div>
                                    <p className="font-medium text-slate-900">Enabled</p>
                                    <p className="text-xs text-slate-600">Protect your account with 2FA</p>
                                </div>
                                <div className="w-3 h-3 rounded-full bg-emerald-600" />
                            </div>
                        </div>

                        <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                            <h3 className="text-lg font-bold text-red-900 mb-4">Danger Zone</h3>
                            <div className="space-y-2">
                                {dangerZoneItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <button
                                            key={item.action}
                                            className={`w-full p-3 rounded-lg border flex items-center gap-3 transition-colors ${
                                                item.danger
                                                    ? 'border-red-200 hover:bg-red-100 text-red-700'
                                                    : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                                            }`}
                                        >
                                            <Icon size={18} />
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="max-w-2xl bg-white rounded-2xl p-6 border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {[
                                { action: 'Profile updated', time: '2 hours ago', icon: Edit3 },
                                { action: 'Photo verified', time: '1 day ago', icon: CheckCircle },
                                { action: 'Login from new device', time: '3 days ago', icon: AlertCircle },
                                { action: 'Password changed', time: '1 week ago', icon: Lock },
                            ].map((activity, idx) => {
                                const Icon = activity.icon;
                                return (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-full bg-slate-100">
                                                <Icon size={16} className="text-slate-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                                                <p className="text-xs text-slate-500">{activity.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Logout Button */}
                <div className="mt-8 flex gap-3">
                    <button
                        onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
                        className="px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium flex items-center gap-2"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
