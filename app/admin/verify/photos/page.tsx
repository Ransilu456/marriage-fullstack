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
                        Photo Verification Queue
                    </h1>
                    <p className="text-slate-600">Review and approve user photo verifications</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    {(['PENDING', 'VERIFIED', 'REJECTED'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-6 py-3 rounded-xl font-medium transition-all ${filter === status
                                ? 'bg-rose-600 text-white shadow-lg'
                                : 'bg-white text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* Verifications List */}
                {verifications.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center">
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
                                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                                        <User className="text-rose-600" size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-900 truncate">{verification.userName}</h3>
                                        <p className="text-sm text-slate-500 truncate">{verification.userEmail}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Calendar size={16} />
                                        <span>{new Date(verification.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedVerification(verification)}
                                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <Eye size={18} />
                                    Review
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
                                className="bg-white rounded-3xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto"
                            >
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Photo Verification Review</h2>
                                    <div className="flex items-center gap-4 text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <User size={16} />
                                            <span>{selectedVerification.userName}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail size={16} />
                                            <span>{selectedVerification.userEmail}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} />
                                            <span>{new Date(selectedVerification.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Photo Comparison */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-3">Profile Photo</h3>
                                        <div className="relative group">
                                            <img
                                                src={selectedVerification.documentUrl}
                                                alt="Profile"
                                                className="w-full aspect-square object-cover rounded-2xl border-4 border-slate-100"
                                            />
                                            <button
                                                onClick={() => setZoomedImage(selectedVerification.documentUrl)}
                                                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <ZoomIn size={20} />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-3">Verification Selfie</h3>
                                        <div className="relative group">
                                            <img
                                                src={selectedVerification.selfieUrl}
                                                alt="Selfie"
                                                className="w-full aspect-square object-cover rounded-2xl border-4 border-slate-100"
                                            />
                                            <button
                                                onClick={() => setZoomedImage(selectedVerification.selfieUrl)}
                                                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <ZoomIn size={20} />
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
                                            className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm outline-none focus:border-rose-500 transition-all resize-none"
                                        />
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setSelectedVerification(null);
                                            setRejectionReason('');
                                        }}
                                        className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all"
                                    >
                                        Close
                                    </button>
                                    {filter === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => handleReject(selectedVerification.id)}
                                                disabled={processing}
                                                className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle size={20} />}
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => handleApprove(selectedVerification.id)}
                                                disabled={processing}
                                                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle size={20} />}
                                                Approve
                                            </button>
                                        </>
                                    )}
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
                            className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-slate-900/90 backdrop-blur-sm cursor-zoom-out"
                        >
                            <motion.img
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                src={zoomedImage}
                                alt="Zoomed"
                                className="max-w-full max-h-[90vh] rounded-2xl"
                            />
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
