'use client';

import { useEffect, useState } from 'react';
import { Trash2, Users, Search, Shield, ShieldCheck, Mail, Calendar, User as UserIcon } from 'lucide-react';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    profile?: {
        id: string;
    };
    idVerified?: boolean;
    photoVerified?: boolean;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users?limit=100');
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
            <div className="h-full flex items-center justify-center pt-20">
                <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 pt-24 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-900">User <span className="text-rose-600">Directory</span></h1>
                    <p className="text-slate-500 mt-1">Manage and monitor all platform users.</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm w-full md:w-96">
                    <Search className="text-slate-400 ml-2" size={20} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 outline-none text-sm bg-transparent"
                    />
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">User Details</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verification</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joined At</th>
                                <th className="px-8 py-5 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100/50 flex items-center justify-center text-rose-600 font-bold text-lg border border-rose-100">
                                                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{user.name || 'Anonymous'}</div>
                                                <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                                                    <Mail size={10} className="text-slate-300" /> {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${user.role === 'ADMIN'
                                                ? 'bg-slate-900 text-white shadow-sm'
                                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex gap-2">
                                            {user.idVerified ? (
                                                <span className="p-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100" title="ID Verified">
                                                    <ShieldCheck size={14} />
                                                </span>
                                            ) : (
                                                <span className="p-1.5 rounded-full bg-slate-50 text-slate-300 border border-slate-100" title="ID Not Verified">
                                                    <Shield size={14} />
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                className="p-2 rounded-lg hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors"
                                                title="View Details"
                                            >
                                                <UserIcon size={16} />
                                            </button>
                                            <button
                                                onClick={() => deleteUser(user.id)}
                                                className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 text-slate-400 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
