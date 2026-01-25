'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Shield, User, Activity } from 'lucide-react';
import Image from 'next/image';

interface Verification {
    id: string;
    user: {
        id: string;
        name: string | null;
        email: string | null;
    };
    documentType: string;
    documentUrl: string;
    selfieUrl: string | null;
    status: string;
    createdAt: string;
}

export default function IdentityVerificationPage() {
    const [verifications, setVerifications] = useState<Verification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchVerifications = () => {
        setLoading(true);
        fetch('/api/admin/identity')
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
    }, []);

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

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Identity Verification</h1>
                    <p className="text-slate-500 font-medium">Review photo and ID verification requests.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full h-64 flex items-center justify-center text-slate-400">Loading requests...</div>
                ) : verifications.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100">
                            <Shield size={40} className="text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">All Clear!</h3>
                        <p className="text-slate-500 max-w-sm mt-3">There are no pending identity verification requests at the moment.</p>
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

                            <div className="p-5 flex-1 bg-white">
                                <div className="grid grid-cols-2 gap-4 h-52 w-full">
                                    <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group/img shadow-inner">
                                        <Image src={v.documentUrl} alt="Document" fill className="object-cover transition-transform duration-500 group-hover/img:scale-110" />
                                        <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-2 flex items-center justify-between">
                                            <span>Document Image</span>
                                        </div>
                                    </div>
                                    {v.selfieUrl ? (
                                        <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group/img shadow-inner">
                                            <Image src={v.selfieUrl} alt="Selfie" fill className="object-cover transition-transform duration-500 group-hover/img:scale-110" />
                                            <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-2 flex items-center justify-between">
                                                <span>Selfie Check</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center bg-slate-50 text-slate-400 text-xs text-center p-4 border-2 border-slate-100 border-dashed rounded-2xl">
                                            <Activity size={24} className="mb-2 opacity-50 text-slate-300" />
                                            <span>No Selfie<br />Provided</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-5 pt-0 mt-auto flex flex-col gap-3">
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
                                {v.status === 'VERIFIED' && (
                                    <button
                                        onClick={() => handleAction(v.id, 'REVOKE')}
                                        className="w-full py-2.5 text-[11px] font-bold text-slate-400 hover:text-rose-600 transition-colors uppercase tracking-widest"
                                    >
                                        Revoke Verification
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
