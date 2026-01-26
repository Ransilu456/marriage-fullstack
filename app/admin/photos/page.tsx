'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Camera, User, Activity, Shield } from 'lucide-react';
import Image from 'next/image';
import { fetchPhotoVerifications } from '@/app/services/admin/adminApi';

interface PhotoVerification {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    documentUrl: string;
    selfieUrl: string | null;
    status: string;
    notes: string | null;
    createdAt: string;
}

export default function PhotoVerificationPage() {
    const [verifications, setVerifications] = useState<PhotoVerification[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('PENDING');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const loadVerifications = async () => {
        setLoading(true);
        try {
            const data = await fetchPhotoVerifications(statusFilter);
            setVerifications(data.verifications || []);
        } catch (error) {
            console.error('Failed to load photo verifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVerifications();
    }, [statusFilter]);

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        let reason = '';
        if (action === 'reject') {
            reason = prompt('Enter rejection reason:') || '';
            if (!reason) return;
        }

        try {
            const res = await fetch(`/api/admin/verify/photos/${id}/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });

            if (!res.ok) throw new Error('Failed to process request');

            alert(`Photo verification ${action}d successfully`);
            loadVerifications();
        } catch (error) {
            alert('Operation failed');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Photo Verification</h1>
                    <p className="text-slate-500 font-medium text-sm">Review user profile photos and comparison selfies.</p>
                </div>
                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200 self-start">
                    {['PENDING', 'VERIFIED', 'REJECTED'].map((s) => (
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full h-64 flex items-center justify-center text-slate-400">
                        <Activity className="animate-spin mr-2" size={20} /> Loading photo requests...
                    </div>
                ) : verifications.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100">
                            <Camera size={40} className="text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No {statusFilter.toLowerCase()} requests</h3>
                        <p className="text-slate-500 max-w-sm mt-3">There are no {statusFilter.toLowerCase()} photo verification requests at the moment.</p>
                    </div>
                ) : (
                    verifications.map((v) => (
                        <div key={v.id} className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 overflow-hidden flex flex-col group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                            <div className="p-5 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm group-hover:scale-110 transition-transform">
                                    <User size={22} strokeWidth={1.5} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-900 text-[15px] truncate">{v.userName}</p>
                                    <p className="text-[11px] text-slate-400 font-medium truncate">{v.userEmail}</p>
                                </div>
                                <span className="text-[11px] font-bold text-slate-400 bg-white border border-slate-100 px-2.5 py-1.5 rounded-lg">
                                    {new Date(v.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="p-5 flex-1 bg-white space-y-4">
                                <div className="grid grid-cols-2 gap-4 h-56 w-full">
                                    <div
                                        className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group/img shadow-inner cursor-zoom-in"
                                        onClick={() => setSelectedImage(v.documentUrl)}
                                    >
                                        <Image src={v.documentUrl} alt="Requested Photo" fill className="object-cover transition-transform duration-500 group-hover/img:scale-110" unoptimized />
                                        <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-2 flex items-center justify-between opacity-0 group-hover/img:opacity-100 transition-opacity">
                                            <span>Profile Photo</span>
                                        </div>
                                    </div>
                                    <div
                                        className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group/img shadow-inner cursor-zoom-in"
                                        onClick={() => setSelectedImage(v.selfieUrl || '')}
                                    >
                                        {v.selfieUrl ? (
                                            <>
                                                <Image src={v.selfieUrl} alt="Selfie" fill className="object-cover transition-transform duration-500 group-hover/img:scale-110" unoptimized />
                                                <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-2 flex items-center justify-between opacity-0 group-hover/img:opacity-100 transition-opacity">
                                                    <span>Live Selfie</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                                                <Shield size={24} className="mb-2 opacity-50" />
                                                <span className="text-[10px] font-bold">No Selfie Captured</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {v.notes && (
                                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                                        <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">Admin Notes</p>
                                        <p className="text-xs text-amber-700 italic">"{v.notes}"</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-5 pt-0 mt-auto flex flex-col gap-3">
                                {v.status === 'PENDING' ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleAction(v.id, 'reject')}
                                            className="px-4 py-3 bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-2xl text-[13px] font-bold transition-all flex items-center justify-center gap-2 group/btn"
                                        >
                                            <XCircle size={18} /> Reject
                                        </button>
                                        <button
                                            onClick={() => handleAction(v.id, 'approve')}
                                            className="px-4 py-3 bg-slate-900 hover:bg-rose-600 text-white rounded-2xl text-[13px] font-bold shadow-lg shadow-slate-200 hover:shadow-rose-500/30 transition-all flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={18} /> Approve
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center border-t border-slate-50 pt-3 mt-1">
                                        <span className={`text-[10px] font-bold px-4 py-2 rounded-xl border ${v.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                            {v.status}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6 cursor-zoom-out"
                    onClick={() => setSelectedImage(null)}
                >
                    <div
                        className="relative w-full max-w-4xl max-h-[90vh] aspect-square md:aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image src={selectedImage} alt="Full View" fill className="object-contain" unoptimized />
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
