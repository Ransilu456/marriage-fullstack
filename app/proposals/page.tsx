'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Check, X, Clock, MessageCircle, HeartHandshake, Sparkles, Send, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMatch } from "@/app/components/providers/MatchProvider";

interface Interest {
    id: string;
    senderId: string;
    receiverId: string;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
    message?: string;
    createdAt: string;
    senderName?: string;
    senderPhoto?: string;
    receiverName?: string;
    receiverPhoto?: string;
}

export default function ProposalsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { showMatch } = useMatch();
    const [received, setReceived] = useState<Interest[]>([]);
    const [sent, setSent] = useState<Interest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (status === 'authenticated') {
            fetchInterests();
        }
    }, [status]);

    const fetchInterests = async () => {
        try {
            const [receivedRes, sentRes] = await Promise.all([
                fetch('/api/interests?type=received'),
                fetch('/api/interests?type=sent')
            ]);

            if (receivedRes.ok && sentRes.ok) {
                const receivedData = await receivedRes.json();
                const sentData = await sentRes.json();
                setReceived(receivedData.interests || []);
                setSent(sentData.interests || []);
            }
        } catch (error) {
            console.error('Error fetching interests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (interestId: string, status: 'ACCEPTED' | 'DECLINED') => {
        try {
            const res = await fetch('/api/interests', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ interestId, status })
            });

            if (res.ok) {
                if (status === 'ACCEPTED') {
                    const int = received.find(i => i.id === interestId);
                    showMatch({
                        partnerName: int?.senderName || 'Your Match',
                        partnerImage: int?.senderPhoto,
                        proposalId: interestId
                    });
                }
                fetchInterests();
            }
        } catch (error) {
            console.error('Action error:', error);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin" />
        </div>
    );

    const currentList = activeTab === 'received' ? received : sent;

    return (
        <div className="bg-slate-50 min-h-screen pb-32 pt-24">
            <main className="max-w-5xl mx-auto px-6 space-y-12 relative z-10">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 rounded-full border border-rose-100 mb-2">
                        <Sparkles size={12} className="text-rose-600" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600">Proposals</span>
                    </div>
                    <h1 className="text-4xl font-serif text-slate-900 font-bold tracking-tight">Manage Your <span className="text-rose-600">Interest</span></h1>
                    <p className="text-slate-500 font-light max-w-xl">Review and manage the interests you've received or sent to potential matches.</p>
                </div>

                <div className="flex justify-center">
                    <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex">
                        <button
                            onClick={() => setActiveTab('received')}
                            className={`px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'received'
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            <HeartHandshake size={16} />
                            Received {received.filter(i => i.status === 'PENDING').length > 0 && `(${received.filter(i => i.status === 'PENDING').length})`}
                        </button>
                        <button
                            onClick={() => setActiveTab('sent')}
                            className={`px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'sent'
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            <Send size={16} />
                            Sent {sent.filter(i => i.status === 'PENDING').length > 0 && `(${sent.filter(i => i.status === 'PENDING').length})`}
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {currentList.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white border border-slate-100 rounded-3xl p-24 text-center space-y-4 shadow-sm"
                            >
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                    <Clock size={24} className="text-slate-200" />
                                </div>
                                <p className="text-sm font-medium text-slate-400">No active interests in this category yet.</p>
                            </motion.div>
                        ) : (
                            currentList.map((interest, idx) => (
                                <motion.div
                                    key={interest.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                    className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6 hover:shadow-lg transition-all"
                                >
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-slate-50 shadow-sm">
                                            <img
                                                src={(activeTab === 'received' ? interest.senderPhoto : interest.receiverPhoto) || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&h=300"}
                                                className="w-full h-full object-cover"
                                                alt="User"
                                            />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-white">
                                            <ShieldCheck size={12} />
                                        </div>
                                    </div>

                                    <div className="flex-1 text-center md:text-left space-y-2">
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-serif font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                                                {activeTab === 'received' ? interest.senderName : interest.receiverName}
                                            </h3>
                                            <div className="flex items-center justify-center md:justify-start gap-4">
                                                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Clock size={12} /> {new Date(interest.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${interest.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600' :
                                                    interest.status === 'DECLINED' ? 'bg-slate-50 text-slate-400' : 'bg-rose-50 text-rose-600'
                                                    }`}>
                                                    {interest.status}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-500 italic border-l-2 border-rose-100 pl-4 py-1">
                                            "{interest.message || 'Expressed interest in your profile.'}"
                                        </p>
                                    </div>

                                    <div className="flex gap-3 w-full md:w-auto">
                                        {activeTab === 'received' && interest.status === 'PENDING' ? (
                                            <>
                                                <button
                                                    onClick={() => handleAction(interest.id, 'ACCEPTED')}
                                                    className="flex-1 sm:flex-none px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-md active:scale-95"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleAction(interest.id, 'DECLINED')}
                                                    className="flex-1 sm:flex-none px-6 py-3 bg-slate-50 text-slate-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 transition-all border border-slate-200"
                                                >
                                                    Decline
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => router.push(`/chat/${activeTab === 'received' ? interest.senderId : interest.receiverId}`)}
                                                className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rose-600 transition-all shadow-md flex items-center justify-center gap-2"
                                            >
                                                <MessageCircle size={14} />
                                                {interest.status === 'ACCEPTED' ? 'Message' : 'View'}
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
