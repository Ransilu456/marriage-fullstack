'use client';

import { useEffect, useState } from 'react';
import { Trash2, Users, Search, Shield, ShieldCheck, Mail, Calendar, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    profile?: {
        id: string;
    };
}

export default function AdminDashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (data.users) setUsers(data.users);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setUsers(users.filter(u => u.id !== userId));
            } else {
                alert('Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user', error);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20">
                <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen pt-24 pb-20 px-6">
            <main className="max-w-7xl mx-auto space-y-10">
                {/* Header */}
                <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
                    <div className="space-y-4 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                <ShieldCheck size={24} className="text-rose-400" />
                            </div>
                            <h1 className="text-4xl font-serif text-slate-900 font-bold tracking-tight">Admin <span className="text-rose-600">Dashboard</span></h1>
                        </div>
                        <p className="text-slate-500 text-lg font-light max-w-xl">
                            Platform administration and user management. Monitor registrations and maintain site integrity.
                        </p>
                    </div>

                    <div className="flex items-center gap-6 relative z-10">
                        <div className="bg-slate-50 px-8 py-5 rounded-2xl border border-slate-100 shadow-sm text-center min-w-[160px]">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Users</p>
                            <p className="text-3xl font-serif text-slate-900 font-bold">{users.length}</p>
                        </div>
                    </div>
                </div>

                {/* User List Controls */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-serif text-slate-900 font-bold">User Directory</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manage platform members</p>
                        </div>
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm outline-none focus:border-rose-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">User Details</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joined At</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredUsers.map((user, idx) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-slate-50/50 transition-all duration-200 group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 font-bold text-lg border border-rose-100">
                                                    {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                                </div>
                                                <div className="space-y-0.5">
                                                    <div className="text-base font-bold text-slate-900">{user.name || 'Anonymous User'}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
                                                        <Mail size={12} className="text-slate-300" /> {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${user.role === 'ADMIN'
                                                ? 'bg-slate-900 text-white shadow-sm'
                                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            {user.profile ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                    <div className="w-1 h-1 rounded-full bg-emerald-500" /> Active Profile
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100">
                                                    <div className="w-1 h-1 rounded-full bg-amber-500" /> No Profile
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={12} />
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    className="p-2.5 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 shadow-sm transition-all"
                                                    title="View Profile"
                                                >
                                                    <UserIcon size={16} />
                                                </button>
                                                <button
                                                    onClick={() => deleteUser(user.id)}
                                                    className="p-2.5 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg border border-slate-200 shadow-sm transition-all active:scale-95"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredUsers.length === 0 && (
                            <div className="py-24 text-center space-y-3">
                                <Search size={40} className="text-slate-200 mx-auto" />
                                <p className="text-slate-400 text-sm italic font-light">No users found matching your search.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
