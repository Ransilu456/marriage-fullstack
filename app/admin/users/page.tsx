'use client';

import { useEffect, useState } from 'react';
import { Search, Trash2, Shield, Mail, Calendar, Ban, CheckCircle, RefreshCcw, Eye } from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  accountStatus: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    fetch(`/api/admin/users?limit=50&search=${search}`)
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    const timeout = setTimeout(fetchUsers, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to PERMANENTLY delete this user?')) return;
    try {
      await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      fetchUsers();
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  const handleBan = async (userId: string) => {
    if (!confirm('Are you sure you want to BAN this user?')) return;
    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'BAN' }),
      });
      fetchUsers();
    } catch (error) {
      alert('Failed to ban user');
    }
  };

  const handleUnban = async (userId: string) => {
    if (!confirm('Are you sure you want to UNBAN this user?')) return;
    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'UNBAN' }),
      });
      fetchUsers();
    } catch (error) {
      alert('Failed to unban user');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Users Management</h1>
          <p className="text-slate-500 font-medium">Manage your platform users and permissions.</p>
        </div>

        {/* Search Input */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 w-72 shadow-sm transition-all text-sm font-medium"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">User</th>
                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Role</th>
                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Joined Date</th>
                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs text-right">Actions</th>
                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs text-center">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">No users found.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[15px] shadow-sm transform group-hover:scale-105 transition-transform">
                          {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{user.name || 'Unnamed User'}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1"><Mail size={12} /> {user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {user.role === 'ADMIN' && <Shield size={12} />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      <span className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.accountStatus === 'BANNED' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
                          <Ban size={12} /> Banned
                        </span>
                      ) : user.accountStatus === 'VERIFIED' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                          <CheckCircle size={12} /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {user.accountStatus !== 'BANNED' && user.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleBan(user.id)}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            title="Ban User"
                          >
                            <Ban size={16} />
                          </button>
                        )}
                        {user.accountStatus === 'BANNED' && (
                          <button
                            onClick={() => handleUnban(user.id)}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Unban User"
                          >
                            <RefreshCcw size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link href={`/admin/profiles?search=${encodeURIComponent(user.email || '')}`} className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 font-medium text-xs hover:underline">
                        <Eye size={14} /> View Profile
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
