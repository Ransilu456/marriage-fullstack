'use client';

import { useEffect, useState } from 'react';
import { Search, CheckCircle, XCircle, MoreHorizontal, User as UserIcon } from 'lucide-react';

interface Profile {
    id: string;
    user: {
        name: string | null;
        email: string | null;
        accountStatus: string;
    };
    createdAt: string;
    photoUrl: string;
}

import AdminProfileModal from '@/app/components/admin/modals/AdminProfileModal';

export default function ProfilesPage() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<string>('all');
    const [selectedProfile, setSelectedProfile] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchProfiles = () => {
        setLoading(true);
        let url = `/api/admin/profiles?limit=50`;
        if (status !== 'all') url += `&status=${status}`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                setProfiles(data.profiles || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchProfiles();
    }, [status]);

    const handleAction = async (profileId: string, action: 'VERIFY' | 'REJECT') => {
        try {
            await fetch('/api/admin/profiles', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profileId, action }),
            });
            fetchProfiles();
        } catch (error) {
            alert('Failed to update profile');
        }
    };

    const openProfile = (profile: any) => {
        setSelectedProfile(profile);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Profile Moderation</h1>
                    <p className="text-slate-500 font-medium">Review and verify user profiles.</p>
                </div>

                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                    {['all', 'pending', 'verified'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatus(s)}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${status === s ? 'bg-rose-50 text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Profile Owner</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Created Date</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs text-right">Moderation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">Loading profiles...</td></tr>
                            ) : profiles.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">No profiles found.</td></tr>
                            ) : (
                                profiles.map((profile) => (
                                    <tr key={profile.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                                                    {profile.photoUrl ? (
                                                        <img src={profile.photoUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UserIcon size={18} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{profile.user.name || 'Unknown'}</p>
                                                    <p className="text-xs text-slate-500">{profile.user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-medium">
                                            {new Date(profile.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {profile.user.accountStatus === 'VERIFIED' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/50 text-emerald-700 border border-emerald-200 shadow-sm shadow-emerald-100">
                                                    <CheckCircle size={12} strokeWidth={2.5} /> Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100/50 text-amber-700 border border-amber-200 shadow-sm shadow-amber-100">
                                                    Pending Review
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {profile.user.accountStatus !== 'VERIFIED' && (
                                                    <button
                                                        onClick={() => handleAction(profile.id, 'VERIFY')}
                                                        className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 shadow-sm shadow-emerald-200 active:scale-95 transition-all"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                {profile.user.accountStatus === 'VERIFIED' && (
                                                    <button
                                                        onClick={() => handleAction(profile.id, 'REJECT')}
                                                        className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 hover:text-red-600 hover:border-red-100 active:scale-95 transition-all shadow-sm"
                                                    >
                                                        Revoke
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openProfile(profile)}
                                                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AdminProfileModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                profile={selectedProfile}
            />
        </div>
    );
}
