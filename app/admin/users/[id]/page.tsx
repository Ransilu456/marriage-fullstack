'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Mail, Calendar, Shield, MapPin, Briefcase, UserIcon, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface UserDetail {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    accountStatus: string;
    trustScore: number;
    profile?: {
        age?: number;
        location?: string;
        profession?: string;
        bio?: string;
        photoUrl?: string;
    };
    verifications: any[];
    reportsReceived: any[];
}

export default function UserDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`/api/admin/users/${id}`);
                const data = await res.json();
                if (data.user) setUser(data.user);
            } catch (error) {
                console.error('Failed to fetch user', error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchUser();
    }, [id]);

    const deleteUser = async () => {
        if (!confirm('PERMANENTLY DELETE USER?')) return;
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
            if (res.ok) router.push('/admin/users');
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center pt-20">
                <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return <div>User not found</div>;

    return (
        <div className="p-6 pt-24 space-y-8 max-w-5xl mx-auto">
            <Link href="/admin/users" className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-sm transition-colors w-fit">
                <ChevronLeft size={16} /> Back to Users
            </Link>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Cover / Header */}
                <div className="h-32 bg-gradient-to-r from-slate-900 to-slate-800 relative">
                    <div className="absolute -bottom-10 left-8">
                        <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-md">
                            <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                                {user.profile?.photoUrl ? (
                                    <img src={user.profile.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl font-bold text-slate-300">{user.name?.[0]}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-6 right-8 flex gap-3">
                        <button
                            onClick={deleteUser}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-100"
                        >
                            Delete User
                        </button>
                    </div>
                </div>

                <div className="pt-16 pb-8 px-8">
                    <h1 className="text-3xl font-serif font-bold text-slate-900">{user.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm font-medium text-slate-500">
                        <span className="flex items-center gap-1.5"><Mail size={14} /> {user.email}</span>
                        <span className="flex items-center gap-1.5"><Calendar size={14} /> Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-widest ${user.role === 'ADMIN' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>{user.role}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                        {/* Profile Info */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center"><UserIcon className="w-4 h-4" /></span>
                                Profile Details
                            </h3>
                            <div className="bg-slate-50 rounded-2xl p-6 space-y-4 border border-slate-100">
                                {user.profile ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Age</p>
                                                <p className="font-medium text-slate-900">{user.profile.age || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Location</p>
                                                <p className="font-medium text-slate-900 flex items-center gap-1">{user.profile.location && <MapPin size={12} />} {user.profile.location || 'N/A'}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Profession</p>
                                                <p className="font-medium text-slate-900 flex items-center gap-1">{user.profile.profession && <Briefcase size={12} />} {user.profile.profession || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Bio</p>
                                            <p className="text-sm text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">{user.profile.bio || 'No bio provided.'}</p>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-slate-400 italic">No profile created yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Trust & Verification */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><Shield className="w-4 h-4" /></span>
                                Trust & Safety
                            </h3>
                            <div className="bg-slate-50 rounded-2xl p-6 space-y-6 border border-slate-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-600">Trust Score</span>
                                    <span className="text-2xl font-serif font-bold text-emerald-600">{user.trustScore}%</span>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Submitted Documents</p>
                                    <div className="space-y-2">
                                        {user.verifications?.length > 0 ? (
                                            user.verifications.map((v: any) => (
                                                <div key={v.id} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                                                    <span className="text-sm font-medium text-slate-700">{v.documentType}</span>
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest ${v.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-600' :
                                                            v.status === 'REJECTED' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                                                        }`}>{v.status}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-400 italic">No documents submitted.</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Reports Received</p>
                                    {user.reportsReceived?.length > 0 ? (
                                        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                            <p className="text-red-600 font-bold text-sm">{user.reportsReceived.length} Reports</p>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                                            <ShieldCheck size={16} /> Clean Record
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
