'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, BadgeCheck, MessageCircle, MapPin, Briefcase, Send, X, ArrowRight, HeartHandshake } from 'lucide-react';
import Link from 'next/link';

interface Profile {
    id: string;
    userId: string;
    name: string;
    age: number;
    gender: string;
    religion?: string;
    height?: number;
    location: string;
    photoUrl: string;
    jobCategory?: string;
    jobStatus?: string;
    maritalStatus?: string;
    bio?: string;
    isVerified?: boolean;
}

interface ProposalModalProps {
    profile: Profile;
    onClose: () => void;
}

const ProposalModal = ({ profile, onClose }: ProposalModalProps) => {
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [statusMessage, setStatusMessage] = useState("");

    const handleSendProposal = async () => {
        if (!message.trim()) return;
        setIsSending(true);
        setStatus('IDLE');
        try {
            const res = await fetch('/api/interests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverId: profile.userId,
                    message: message
                })
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('SUCCESS');
                setTimeout(() => {
                    onClose();
                    setStatus('IDLE');
                }, 2000);
            } else {
                setStatus('ERROR');
                setStatusMessage(data.error || "Failed to send proposal");
            }
        } catch (error) {
            setStatus('ERROR');
            setStatusMessage("Internal server error");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isSending && onClose()}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl space-y-6 overflow-hidden border border-slate-100"
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
                        <HeartHandshake className="text-rose-600" size={32} />
                    </div>
                    <h3 className="text-2xl font-serif text-slate-900 font-bold">Express Interest</h3>
                    <p className="text-sm text-slate-400">Send a personalized message to {profile.name}.</p>
                </div>

                <div className="space-y-4">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full h-32 bg-slate-50 border border-slate-200 focus:border-rose-500 rounded-xl p-4 text-sm outline-none transition-all resize-none placeholder:text-slate-400"
                        placeholder="Write your message here..."
                        disabled={isSending || status === 'SUCCESS'}
                    />

                    {status === 'ERROR' && (
                        <p className="text-xs text-rose-500 text-center font-medium">{statusMessage}</p>
                    )}

                    <button
                        onClick={handleSendProposal}
                        disabled={isSending || status === 'SUCCESS' || !message.trim()}
                        className={`w-full py-3.5 rounded-xl font-medium text-sm text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${status === 'SUCCESS'
                            ? 'bg-emerald-500 shadow-emerald-500/20'
                            : 'bg-slate-900 hover:bg-rose-600 shadow-slate-900/10 disabled:opacity-50'
                            }`}
                    >
                        {isSending ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : status === 'SUCCESS' ? (
                            "Proposal Sent"
                        ) : (
                            <>
                                <span>Send Proposal</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

interface UserCardProps {
    profile: Profile;
    index: number;
    isFavorite: boolean;
    onToggleFavorite: (userId: string) => void;
    matchScore?: number;
}

export function UserCard({ profile, index, isFavorite, onToggleFavorite, matchScore }: UserCardProps) {
    const [isProposing, setIsProposing] = useState(false);
    const compatibilityScore = matchScore || (Math.floor(Math.random() * 15) + 80);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-rose-900/5 transition-all duration-300 overflow-hidden flex flex-col h-full relative"
        >
            {/* Image Section */}
            <div className="relative aspect-[4/5] overflow-hidden">
                <img
                    src={profile.photoUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&h=800'}
                    alt={profile.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Overlay Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-80" />

                {/* Compatibility Badge */}
                <div className="absolute top-4 left-4">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-2 flex items-center gap-3">
                        <div className="relative w-8 h-8">
                            <svg className="w-8 h-8 transform -rotate-90">
                                <circle
                                    cx="16" cy="16" r="14"
                                    stroke="rgba(255,255,255,0.1)"
                                    strokeWidth="3"
                                    fill="transparent"
                                />
                                <circle
                                    cx="16" cy="16" r="14"
                                    stroke="#f43f5e"
                                    strokeWidth="3"
                                    fill="transparent"
                                    strokeDasharray={88}
                                    strokeDashoffset={88 - (88 * compatibilityScore) / 100}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                                {compatibilityScore}%
                            </span>
                        </div>
                        <div className="pr-1">
                            <p className="text-[8px] font-bold text-rose-300 uppercase tracking-wider leading-none">Match</p>
                        </div>
                    </div>
                </div>

                {/* Favorite Button */}
                <button
                    onClick={(e) => { e.preventDefault(); onToggleFavorite(profile.userId); }}
                    className={`absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 ${isFavorite
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                        : 'bg-white/20 backdrop-blur-md text-white border border-white/20 hover:bg-white/40'
                        }`}
                >
                    <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
                </button>

                {/* Status Indicator */}
                <div className="absolute bottom-4 left-6 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-[10px] font-medium text-white/90 uppercase tracking-widest">Active Now</span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                    <Link href={`/profile/${profile.userId}`} className="block group/title">
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-serif text-slate-900 font-bold tracking-tight group-hover/title:text-rose-600 transition-colors">{profile.name}, {profile.age}</h3>
                            <BadgeCheck size={18} className="text-blue-500 flex-shrink-0" />
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 font-medium mt-0.5">
                            <MapPin size={12} /> {profile.location}
                        </div>
                    </Link>

                    <div className="flex flex-wrap gap-2">
                        <div className="px-3 py-1 bg-slate-50 text-[10px] font-medium text-slate-500 uppercase tracking-wide rounded-lg border border-slate-100 flex items-center gap-1.5">
                            <Briefcase size={12} /> {profile.jobCategory || 'Professional'}
                        </div>
                        <div className="px-3 py-1 bg-slate-50 text-[10px] font-medium text-slate-500 uppercase tracking-wide rounded-lg border border-slate-100">
                            {profile.maritalStatus?.toLowerCase() || 'Single'}
                        </div>
                    </div>

                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                        {profile.bio || "Searching for a meaningful connection based on shared values."}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-6">
                    <Link
                        href={`/chat/${profile.userId}`}
                        className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 py-3 rounded-xl text-xs font-medium transition-all"
                    >
                        <MessageCircle size={16} /> Chat
                    </Link>
                    <button
                        onClick={() => setIsProposing(true)}
                        className="bg-slate-900 hover:bg-rose-600 text-white py-3 rounded-xl text-xs font-medium transition-all shadow-lg hover:shadow-rose-500/20 active:scale-95"
                    >
                        Propose
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isProposing && (
                    <ProposalModal
                        profile={profile}
                        onClose={() => setIsProposing(false)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}
