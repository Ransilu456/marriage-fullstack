'use client';


import { useEffect, useState } from 'react';
import { User } from '@/app/components/admin/users/types';
import { useDebounce } from 'use-debounce';
import UserTable from '@/app/components/admin/users/UserTable';
import UserFilters from '@/app/components/admin/users/UserFilters';
import GlassCard from '@/app/components/admin/ui/GlassCard';


export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 300);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [activeUser, setActiveUser] = useState<User | null>(null);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    verified: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users?limit=200');
      const data = await res.json();

      const list = data.users || [];
      setUsers(list);

      setStats({
        total: list.length,
        active: list.filter((u: User) => u.accountStatus === 'ACTIVE').length,
        suspended: list.filter((u: User) => u.accountStatus === 'SUSPENDED').length,
        verified: list.filter((u: User) => u.idVerified).length,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const match =
      u.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(debouncedSearch.toLowerCase());

    if (filterStatus === 'ALL') return match;
    if (filterStatus === 'VERIFIED') return match && u.idVerified;
    if (filterStatus === 'ACTIVE') return match && u.accountStatus === 'ACTIVE';
    if (filterStatus === 'SUSPENDED') return match && u.accountStatus === 'SUSPENDED';
    if (filterStatus === 'UNVERIFIED') return match && !u.idVerified;
    return match;
  });

  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user permanently?')) return;
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    setUsers(prev => prev.filter(u => u.id !== id));
  };


  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900">
            Users <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Management</span>
          </h1>
          <p className="text-slate-500 mt-1">Manage all users, search, filter, and take actions.</p>
        </div>
        <div className="flex flex-col gap-2">
          <UserFilters value={filterStatus} onChange={setFilterStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-6 flex flex-col items-center justify-center">
          <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Users</p>
          <p className="text-3xl font-bold text-indigo-700">{stats.total}</p>
        </GlassCard>
        <GlassCard className="p-6 flex flex-col items-center justify-center">
          <p className="text-xs font-bold text-slate-500 uppercase mb-1">Active</p>
          <p className="text-3xl font-bold text-emerald-600">{stats.active}</p>
        </GlassCard>
        <GlassCard className="p-6 flex flex-col items-center justify-center">
          <p className="text-xs font-bold text-slate-500 uppercase mb-1">Verified</p>
          <p className="text-3xl font-bold text-blue-600">{stats.verified}</p>
        </GlassCard>
        <GlassCard className="p-6 flex flex-col items-center justify-center">
          <p className="text-xs font-bold text-slate-500 uppercase mb-1">Suspended</p>
          <p className="text-3xl font-bold text-red-600">{stats.suspended}</p>
        </GlassCard>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <input
          className="w-full md:w-96 px-4 py-2 border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-200"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center">Loading users...</div>
      ) : (
        <UserTable users={filteredUsers} onDelete={deleteUser} />
      )}

      {/* USER MODAL */}
      {activeUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button
              onClick={() => setActiveUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-rose-600"
              aria-label="Close"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <h2 className="text-2xl font-bold mb-2">{activeUser.name}</h2>
            <p className="text-slate-500 mb-4">{activeUser.email}</p>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-slate-400">Status: {activeUser.accountStatus}</span>
              <span className="text-xs font-semibold text-slate-400">Joined: {new Date(activeUser.createdAt).toLocaleDateString()}</span>
              <span className="text-xs font-semibold text-slate-400">Verified: {activeUser.idVerified ? 'Yes' : 'No'}</span>
              <span className="text-xs font-semibold text-slate-400">Trust Score: {activeUser.trustScore || 0}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
