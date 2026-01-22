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
    profession?: string;
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6">
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
                className="relative bg-white w-full max-w-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 sm:space-y-6 overflow-hidden border border-slate-100"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 sm:w-auto sm:h-auto flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="text-center space-y-3">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
                        <HeartHandshake className="text-rose-600" size={28} />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-serif text-slate-900 font-bold">Express Interest</h3>
                    <p className="text-xs sm:text-sm text-slate-400">Send a personalized message to {profile.name}.</p>
                </div>

                <div className="space-y-4">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full h-28 sm:h-32 bg-slate-50 border border-slate-200 focus:border-rose-500 rounded-xl p-3 sm:p-4 text-sm outline-none transition-all resize-none placeholder:text-slate-400"
                        placeholder="Write your message here..."
                        disabled={isSending || status === 'SUCCESS'}
                    />

                    {status === 'ERROR' && (
                        <p className="text-xs text-rose-500 text-center font-medium">{statusMessage}</p>
                    )}

                    <button
                        onClick={handleSendProposal}
                        disabled={isSending || status === 'SUCCESS' || !message.trim()}
                        className={`w-full py-3 sm:py-3.5 rounded-xl font-medium text-sm text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${status === 'SUCCESS'
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
            className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-rose-900/10 transition-all duration-500 overflow-hidden flex flex-col w-[400px] h-full relative"
        >
            {/* Image Section with Enhanced Overlay */}
            <div className="relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden">
                <img
                    src={profile.photoUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&h=800'}
                    alt={profile.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Sophisticated Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                {/* Compatibility Badge - Responsive */}
                <div className="absolute top-3 left-3 sm:top-5 sm:left-5">
                    <div className="bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-2xl shadow-rose-500/30">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                                <svg className="w-8 h-8 sm:w-10 sm:h-10 transform -rotate-90">
                                    <circle
                                        cx="16" cy="16" r="14"
                                        stroke="rgba(255,255,255,0.2)"
                                        strokeWidth="2.5"
                                        fill="transparent"
                                        className="sm:hidden"
                                    />
                                    <circle
                                        cx="16" cy="16" r="14"
                                        stroke="white"
                                        strokeWidth="2.5"
                                        fill="transparent"
                                        strokeDasharray={88}
                                        strokeDashoffset={88 - (88 * compatibilityScore) / 100}
                                        strokeLinecap="round"
                                        className="sm:hidden"
                                    />
                                    <circle
                                        cx="20" cy="20" r="18"
                                        stroke="rgba(255,255,255,0.2)"
                                        strokeWidth="3"
                                        fill="transparent"
                                        className="hidden sm:block"
                                    />
                                    <circle
                                        cx="20" cy="20" r="18"
                                        stroke="white"
                                        strokeWidth="3"
                                        fill="transparent"
                                        strokeDasharray={113}
                                        strokeDashoffset={113 - (113 * compatibilityScore) / 100}
                                        strokeLinecap="round"
                                        className="hidden sm:block"
                                    />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-bold text-white">
                                    {compatibilityScore}
                                </span>
                            </div>
                            <div className="pr-0.5 sm:pr-1">
                                <p className="text-[8px] sm:text-[9px] font-bold text-white uppercase tracking-wider leading-tight">Match</p>
                                <p className="text-[7px] sm:text-[8px] text-white/80 leading-none">Score</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Favorite Button - Responsive */}
                <button
                    onClick={(e) => { e.preventDefault(); onToggleFavorite(profile.userId); }}
                    className={`absolute top-3 right-3 sm:top-5 sm:right-5 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-xl ${isFavorite
                        ? 'bg-rose-500 text-white shadow-rose-500/40'
                        : 'bg-white/90 backdrop-blur-md text-slate-600 hover:bg-white'
                        }`}
                >
                    <Heart size={18} className={`sm:w-[22px] sm:h-[22px] ${isFavorite ? 'fill-current' : ''}`} />
                </button>

                {/* Name & Age Overlay - Responsive Typography */}
                <div className="absolute bottom-0 left-0 right-0 p-4 pb-3 sm:p-6 sm:pb-5">
                    <Link href={`/profile/${profile.userId}`} className="block group/title">
                        <div className="flex items-center gap-2 sm:gap-2.5 mb-1 sm:mb-1.5">
                            <h2 className="text-2xl sm:text-3xl font-serif text-white font-bold tracking-tight group-hover/title:text-rose-300 transition-colors drop-shadow-lg truncate">
                                {profile.name}
                            </h2>
                            {profile.isVerified && (
                                <BadgeCheck size={20} className="sm:w-6 sm:h-6 text-blue-400 flex-shrink-0 drop-shadow-lg" />
                            )}
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 text-white/90 text-sm sm:text-base">
                            <span className="font-medium">{profile.age} years</span>
                            <span className="text-white/50">•</span>
                            <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                                <MapPin size={12} className="sm:w-[14px] sm:h-[14px] text-rose-300 flex-shrink-0" />
                                <span className="text-xs sm:text-sm font-medium truncate">{profile.location}</span>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Matrimonial Vitals Section - Responsive */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 flex flex-col">
                {/* Key Details Grid - Responsive */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {profile.height && (
                        <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-rose-100">
                            <p className="text-[8px] sm:text-[9px] font-bold text-rose-600 uppercase tracking-wider mb-0.5 sm:mb-1">Height</p>
                            <p className="text-base sm:text-lg font-bold text-slate-900">{profile.height} cm</p>
                            <p className="text-[8px] sm:text-[9px] text-slate-500 mt-0.5">{Math.floor(profile.height / 30.48)}'{Math.round((profile.height % 30.48) / 2.54)}"</p>
                        </div>
                    )}
                    {profile.religion && (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-blue-100">
                            <p className="text-[8px] sm:text-[9px] font-bold text-blue-600 uppercase tracking-wider mb-0.5 sm:mb-1">Religion</p>
                            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate">{profile.religion}</p>
                        </div>
                    )}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-emerald-100 col-span-2 sm:col-span-1">
                        <p className="text-[8px] sm:text-[9px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5 sm:mb-1">Status</p>
                        <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight capitalize truncate">{profile.maritalStatus?.toLowerCase() || 'Single'}</p>
                    </div>
                </div>

                {/* Profession & Job Category - Responsive */}
                {(profile.profession || profile.jobCategory) && (
                    <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-100">
                        <div className="flex items-start gap-2.5 sm:gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-900 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                                <Briefcase size={18} className="sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5 sm:mb-1">Profession</p>
                                <p className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
                                    {profile.profession || profile.jobCategory || 'Professional'}
                                </p>
                                {profile.jobStatus && (
                                    <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 capitalize truncate">{profile.jobStatus.toLowerCase().replace('_', ' ')}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Bio Section - Responsive */}
                {profile.bio && (
                    <div className="flex-1">
                        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                            {profile.bio}
                        </p>
                    </div>
                )}

                {/* Action Buttons - Responsive */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-3 sm:pt-4 mt-auto">
                    <Link
                        href={`/chat/${profile.userId}`}
                        className="flex items-center justify-center gap-1.5 sm:gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 sm:py-3.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-95"
                    >
                        <MessageCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span className="hidden xs:inline sm:inline">Chat</span>
                    </Link>
                    <button
                        onClick={() => setIsProposing(true)}
                        className="bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white py-3 sm:py-3.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-rose-500/30 hover:shadow-rose-500/40 active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2"
                    >
                        <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span className="hidden xs:inline sm:inline">Propose</span>
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
