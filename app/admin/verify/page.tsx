'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, Check, X, FileText, User } from 'lucide-react';
import Link from 'next/link';

interface VerificationRequest {
    id: string;
    userId: string;
    type: string;
    fileUrl: string;
    status: string;
    createdAt: string;
    userName?: string;
    userEmail?: string;
}

export default function VerifyPage() {
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/admin/verify');
            const data = await res.json();
            if (data.verifications) setRequests(data.verifications);
            console.log("Admin Req:", data)
        } catch (error) {
            console.error('Failed to fetch verifications', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (documentId: string, action: 'VERIFY' | 'REJECT') => {
        const reason = action === 'REJECT' ? prompt('Enter rejection reason:') : undefined;
        if (action === 'REJECT' && !reason) return;

        try {
            const res = await fetch('/api/admin/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentId, action, reason })
            });

            if (res.ok) {
                setRequests(requests.filter(r => r.id !== documentId));
                alert(`Document ${action === 'VERIFY' ? 'verified' : 'rejected'} successfully`);
            } else {
                alert('Action failed');
            }
        } catch (error) {
            console.error('Action failed', error);
        }
    };

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
            <div>
                <h1 className="text-3xl font-serif font-bold text-slate-900">Pending <span className="text-rose-600">Verifications</span></h1>
                <p className="text-slate-500 mt-1">Review identity documents submitted by users.</p>
            </div>

            {requests.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <ShieldCheck size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">All Caught Up!</h3>
                    <p className="text-slate-500 mt-1">There are no pending verification requests at this time.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.map((req) => (
                        <div key={req.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                            {/* Preview Area */}
                            <div className="h-48 bg-slate-100 flex items-center justify-center border-b border-slate-100 relative group cursor-pointer" onClick={() => window.open(req.fileUrl, '_blank')}>
                                <FileText size={48} className="text-slate-300 group-hover:scale-110 transition-transform" />
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="bg-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">View Document</span>
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-1">{req.type}</p>
                                        <Link href={`/admin/users/${req.userId}`} className="font-bold text-slate-900 hover:text-rose-600 transition-colors flex items-center gap-1.5">
                                            <User size={14} className="text-slate-400" />
                                            {req.userName || 'Unknown User'}
                                        </Link>
                                        <p className="text-xs text-slate-400 mt-0.5">{req.userEmail}</p>
                                    </div>
                                    <span className="px-2 py-1 rounded bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-widest border border-amber-100">
                                        Pending
                                    </span>
                                </div>

                                <div className="mt-auto grid grid-cols-2 gap-3 pt-6 border-t border-slate-50">
                                    <button
                                        onClick={() => handleAction(req.id, 'REJECT')}
                                        className="py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all flex items-center justify-center gap-2"
                                    >
                                        <X size={16} /> Reject
                                    </button>
                                    <button
                                        onClick={() => handleAction(req.id, 'VERIFY')}
                                        className="py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold shadow-sm hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Check size={16} /> Verify
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
