'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle, XCircle, Loader2, Eye, ZoomIn,
    User, Mail, Calendar, AlertCircle
} from 'lucide-react';

interface Verification {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    documentUrl: string;
    selfieUrl: string;
    status: string;
    notes?: string;
    createdAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
}

export default function AdminPhotoVerificationPage() {
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();
    const [verifications, setVerifications] = useState<Verification[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState(false);
    const [filter, setFilter] = useState<'PENDING' | 'VERIFIED' | 'REJECTED'>('PENDING');
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);

    useEffect(() => {
        if (sessionStatus === 'unauthenticated') {
            router.push('/auth/login');
        } else if (sessionStatus === 'authenticated') {
            if ((session?.user as any)?.role !== 'ADMIN') {
                router.push('/');
            } else {
                fetchVerifications();
            }
        }
    }, [sessionStatus, session, router, filter]);

    const fetchVerifications = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/verify/photos?status=${filter}`);
            if (res.ok) {
                const data = await res.json();
                setVerifications(data.verifications || []);
            }
        } catch (error) {
            console.error('Failed to fetch verifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (!confirm('Are you sure you want to approve this verification?')) return;

        setProcessing(true);
        try {
            const res = await fetch(`/api/admin/verify/photos/${id}/approve`, {
                method: 'POST'
            });

            if (res.ok) {
                alert('Verification approved successfully!');
                setSelectedVerification(null);
                fetchVerifications();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to approve verification');
            }
        } catch (error) {
            alert('Failed to approve verification');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async (id: string) => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        if (!confirm('Are you sure you want to reject this verification?')) return;

        setProcessing(true);
        try {
            const res = await fetch(`/api/admin/verify/photos/${id}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: rejectionReason })
            });

            if (res.ok) {
                alert('Verification rejected successfully!');
                setSelectedVerification(null);
                setRejectionReason('');
                fetchVerifications();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to reject verification');
            }
        } catch (error) {
            alert('Failed to reject verification');
        } finally {
            setProcessing(false);
        }
    };

    if (sessionStatus === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-24 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">
                        Photo <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Verification</span>
                    </h1>
                    <p className="text-slate-600">Review and approve user identity verification photos</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {(['PENDING', 'VERIFIED', 'REJECTED'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${filter === status
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'
                                }`}
                        >
                            {status}
                            <span className="ml-2 text-sm font-bold">
                                ({verifications.filter(v => v.status === status).length})
                            </span>
                        </button>
                    ))}
                </div>

                {/* Verifications Grid */}
                {verifications.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                        <AlertCircle className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Verifications</h3>
                        <p className="text-slate-600">No {filter.toLowerCase()} verifications found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {verifications.map((verification) => (
                            <motion.div
                                key={verification.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all border border-slate-200 overflow-hidden"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                                        <User className="text-indigo-600" size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-900 truncate">{verification.userName}</h3>
                                        <p className="text-sm text-slate-500 truncate">{verification.userEmail}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Calendar size={14} />
                                        <span>{new Date(verification.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                                        verification.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' :
                                        verification.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                        {verification.status}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedVerification(verification)}
                                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <Eye size={18} />
                                    Review Photos
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Review Modal */}
                <AnimatePresence>
                    {selectedVerification && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/50 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                            >
                                {/* Modal Header */}
                                <div className="sticky top-0 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200 p-6 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">Photo Verification Review</h2>
                                        <p className="text-slate-600 mt-1">Verify user identity documents</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedVerification(null);
                                            setRejectionReason('');
                                        }}
                                        className="text-slate-400 hover:text-slate-600"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="p-6">
                                    {/* User Info */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-slate-600">User Name</p>
                                            <p className="font-semibold text-slate-900 mt-1">{selectedVerification.userName}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Email</p>
                                            <p className="font-semibold text-slate-900 mt-1">{selectedVerification.userEmail}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Status</p>
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold mt-1 ${
                                                selectedVerification.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' :
                                                selectedVerification.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                                {selectedVerification.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Photo Comparison */}
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">Documents</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <p className="text-sm font-bold text-slate-700 mb-3">Profile Photo</p>
                                            <div className="relative group">
                                                <img
                                                    src={selectedVerification.documentUrl}
                                                    alt="Profile"
                                                    className="w-full aspect-square object-cover rounded-2xl border-2 border-slate-200"
                                                />
                                                <button
                                                    onClick={() => setZoomedImage(selectedVerification.documentUrl)}
                                                    className="absolute top-3 right-3 w-10 h-10 bg-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:shadow-xl"
                                                >
                                                    <ZoomIn size={20} className="text-indigo-600" />
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-700 mb-3">Verification Selfie</p>
                                            <div className="relative group">
                                                <img
                                                    src={selectedVerification.selfieUrl}
                                                    alt="Selfie"
                                                    className="w-full aspect-square object-cover rounded-2xl border-2 border-slate-200"
                                                />
                                                <button
                                                    onClick={() => setZoomedImage(selectedVerification.selfieUrl)}
                                                    className="absolute top-3 right-3 w-10 h-10 bg-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:shadow-xl"
                                                >
                                                    <ZoomIn size={20} className="text-indigo-600" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rejection Reason Input */}
                                    {filter === 'PENDING' && (
                                        <div className="mb-6">
                                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                                Rejection Reason (if rejecting)
                                            </label>
                                            <textarea
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder="Provide a clear reason for rejection..."
                                                className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none"
                                            />
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                                        <button
                                            onClick={() => {
                                                setSelectedVerification(null);
                                                setRejectionReason('');
                                            }}
                                            className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                                        >
                                            Close
                                        </button>
                                        {filter === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => handleReject(selectedVerification.id)}
                                                    disabled={processing}
                                                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle size={20} />}
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(selectedVerification.id)}
                                                    disabled={processing}
                                                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle size={20} />}
                                                    Approve
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Zoomed Image Modal */}
                <AnimatePresence>
                    {zoomedImage && (
                        <div
                            onClick={() => setZoomedImage(null)}
                            className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-slate-900/95 backdrop-blur-sm cursor-zoom-out"
                        >
                            <motion.img
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                src={zoomedImage}
                                alt="Zoomed"
                                className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl"
                            />
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
