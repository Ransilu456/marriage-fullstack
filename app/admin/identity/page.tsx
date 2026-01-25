'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Shield, User, Activity } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';

interface Verification {
    id: string;
    user: {
        id: string;
        name: string | null;
        email: string | null;
        profile: {
            photoUrl: string;
            bio: string;
            location: string;
        } | null;
    };
    documentType: string;
    documentUrl: string;
    selfieUrl: string | null;
    status: string;
    createdAt: string;
}

export default function IdentityVerificationPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const userIdFilter = searchParams.get('userId');

    const [verifications, setVerifications] = useState<Verification[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('PENDING');

    const fetchVerifications = () => {
        setLoading(true);
        let url = `/api/admin/identity?status=${statusFilter}`;
        if (userIdFilter) url += `&userId=${userIdFilter}`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                setVerifications(data.verifications || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchVerifications();
    }, [statusFilter, userIdFilter]);

    const handleAction = async (verificationId: string, action: 'VERIFY' | 'REJECT' | 'REVOKE', notes?: string) => {
        if (!confirm(`Are you sure you want to ${action.toLowerCase()} this request?`)) return;

        try {
            const res = await fetch('/api/admin/identity', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ verificationId, action, notes }),
            });
            if (!res.ok) throw new Error();
            fetchVerifications();
        } catch (error) {
            alert('Failed to process request');
        }
    };

    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Identity Verification</h1>
                    <p className="text-slate-500 font-medium text-sm">Review photo and ID verification requests.</p>
                </div>
                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200 self-start">
                    {['PENDING', 'VERIFIED', 'REJECTED', 'ALL'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-5 py-2 rounded-xl text-[10px] font-bold transition-all duration-200 ${statusFilter === s ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {userIdFilter && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center justify-between animate-in slide-in-from-top duration-300">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-amber-900 leading-none">Filtering by User</p>
                            <p className="text-[11px] text-amber-700 mt-1">Showing all verification documents for user ID: <span className="font-mono">{userIdFilter}</span></p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/admin/identity')}
                        className="px-4 py-2 bg-white border border-amber-200 text-amber-700 text-xs font-bold rounded-xl hover:bg-amber-100 transition-colors"
                    >
                        Clear Filter
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full h-64 flex items-center justify-center text-slate-400">
                        <Activity className="animate-spin mr-2" size={20} /> Loading requests...
                    </div>
                ) : verifications.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100">
                            <Shield size={40} className="text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No {statusFilter.toLowerCase()} requests</h3>
                        <p className="text-slate-500 max-w-sm mt-3">There are no {statusFilter.toLowerCase()} identity verification requests at the moment.</p>
                    </div>
                ) : (
                    verifications.map((v) => (
                        <div key={v.id} className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 overflow-hidden flex flex-col group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                            <div className="p-5 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm group-hover:scale-110 transition-transform">
                                    <User size={22} strokeWidth={1.5} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-900 text-[15px] truncate">{v.user.name || 'Anonymous User'}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                                            {v.documentType}
                                        </span>
                                        <span className="text-[11px] text-slate-400 font-medium">#{v.id.slice(-6)}</span>
                                    </div>
                                </div>
                                <span className="text-[11px] font-bold text-slate-400 bg-white border border-slate-100 px-2.5 py-1.5 rounded-lg">
                                    {new Date(v.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="p-5 flex-1 bg-white space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-200">
                                            {v.user.profile?.photoUrl ? (
                                                <Image src={v.user.profile.photoUrl} alt="Profile" fill className="object-cover" unoptimized />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <User size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Current Profile Info</p>
                                            <p className="text-xs text-slate-600 truncate mt-0.5">{v.user.profile?.bio || 'No bio provided'}</p>
                                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{v.user.profile?.location || 'Unknown location'}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 h-48 w-full">
                                        <div
                                            className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group/img shadow-inner cursor-zoom-in"
                                            onClick={() => setSelectedImage(v.documentUrl)}
                                        >
                                            <Image src={v.documentUrl} alt="Document" fill className="object-cover transition-transform duration-500 group-hover/img:scale-110" unoptimized />
                                            <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-2 flex items-center justify-between opacity-0 group-hover/img:opacity-100 transition-opacity">
                                                <span>Click to View Full</span>
                                            </div>
                                        </div>
                                        {v.selfieUrl ? (
                                            <div
                                                className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group/img shadow-inner cursor-zoom-in"
                                                onClick={() => setSelectedImage(v.selfieUrl)}
                                            >
                                                <Image src={v.selfieUrl} alt="Selfie" fill className="object-cover transition-transform duration-500 group-hover/img:scale-110" unoptimized />
                                                <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-2 flex items-center justify-between opacity-0 group-hover/img:opacity-100 transition-opacity">
                                                    <span>Click to View Full</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center bg-slate-50 text-slate-400 text-xs text-center p-4 border-2 border-slate-100 border-dashed rounded-2xl">
                                                <Activity size={24} className="mb-2 opacity-50 text-slate-300" />
                                                <span>No Selfie<br />Capture</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 pt-0 mt-auto flex flex-col gap-3">
                                {statusFilter === 'PENDING' ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={async () => {
                                                const notes = prompt('Enter rejection reason (required):');
                                                if (notes) handleAction(v.id, 'REJECT', notes);
                                            }}
                                            className="px-4 py-3 bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-2xl text-[13px] font-bold transition-all flex items-center justify-center gap-2 group/btn"
                                        >
                                            <XCircle size={18} className="transition-transform group-hover/btn:rotate-90" /> Reject
                                        </button>
                                        <button
                                            onClick={() => handleAction(v.id, 'VERIFY')}
                                            className="px-4 py-3 bg-slate-900 hover:bg-rose-600 text-white rounded-2xl text-[13px] font-bold shadow-lg shadow-slate-200 hover:shadow-rose-500/30 transition-all flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={18} /> Approve
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-1">
                                        <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border ${v.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                            {v.status}
                                        </span>
                                        {v.status === 'VERIFIED' && (
                                            <button
                                                onClick={() => handleAction(v.id, 'REVOKE')}
                                                className="text-[11px] font-bold text-slate-400 hover:text-rose-600 transition-colors uppercase tracking-widest"
                                            >
                                                Revoke
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Simple Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6 cursor-zoom-out"
                    onClick={() => setSelectedImage(null)}
                >
                    <div
                        className="relative w-full max-w-4xl aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image src={selectedImage} alt="Document Full View" fill className="object-contain" unoptimized />
                        <button
                            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-all shadow-xl"
                            onClick={() => setSelectedImage(null)}
                        >
                            <XCircle size={24} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
