'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, BadgeCheck, MessageCircle, MapPin, Briefcase, Send, X, ArrowRight, HeartHandshake, Ruler, Church, Users } from 'lucide-react';
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
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl space-y-6 overflow-hidden"
            >
                <button
                    onClick={onClose}
                    disabled={isSending}
                    className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all disabled:opacity-50"
                >
                    <X size={20} />
                </button>

                <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
                        <HeartHandshake className="text-white" size={32} />
                    </div>
                    <h3 className="text-2xl font-serif text-slate-900 font-bold">Express Interest</h3>
                    <p className="text-sm text-slate-500">Send a personalized message to {profile.name}</p>
                </div>

                <div className="space-y-4">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full h-32 bg-slate-50 border-2 border-slate-200 focus:border-rose-500 rounded-2xl p-4 text-sm outline-none transition-all resize-none placeholder:text-slate-400"
                        placeholder="Write your message here..."
                        disabled={isSending || status === 'SUCCESS'}
                    />

                    {status === 'ERROR' && (
                        <p className="text-sm text-rose-600 text-center font-medium">{statusMessage}</p>
                    )}

                    <button
                        onClick={handleSendProposal}
                        disabled={isSending || status === 'SUCCESS' || !message.trim()}
                        className={`w-full py-4 rounded-2xl font-semibold text-sm text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${status === 'SUCCESS'
                            ? 'bg-emerald-500 shadow-emerald-500/20'
                            : 'bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 shadow-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                    >
                        {isSending ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : status === 'SUCCESS' ? (
                            "Proposal Sent ✓"
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
    const [imageLoaded, setImageLoaded] = useState(false);
    const compatibilityScore = matchScore || (Math.floor(Math.random() * 15) + 80);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-white rounded-3xl border border-slate-200 hover:border-rose-200 shadow-sm hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-500 overflow-hidden flex flex-col h-full"
        >
            {/* Image Section */}
            <Link href={`/profile/${profile.userId}`} className="relative aspect-[3/4] overflow-hidden bg-slate-100">
                <img
                    src={profile.photoUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&h=800'}
                    alt={profile.name}
                    onLoad={() => setImageLoaded(true)}
                    className={`w-full h-full object-cover transition-all duration-700 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'} group-hover:scale-110`}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

                {/* Match Score Badge */}
                <div className="absolute top-4 left-4">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-sm font-bold text-slate-900">{compatibilityScore}% Match</span>
                        </div>
                    </div>
                </div>

                {/* Favorite Button */}
                <button
                    onClick={(e) => { e.preventDefault(); onToggleFavorite(profile.userId); }}
                    className={`absolute top-4 right-4 w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-lg backdrop-blur-sm ${isFavorite
                        ? 'bg-rose-500 text-white shadow-rose-500/40'
                        : 'bg-white/95 text-slate-600 hover:bg-white hover:scale-110'
                        }`}
                >
                    <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
                </button>

                {/* Name & Basic Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-3xl font-serif text-white font-bold tracking-tight drop-shadow-lg">
                            {profile.name}
                        </h2>
                        {profile.isVerified && (
                            <BadgeCheck size={24} className="text-blue-400 flex-shrink-0 drop-shadow-lg" />
                        )}
                    </div>
                    <div className="flex items-center gap-3 text-white/90">
                        <span className="text-base font-medium">{profile.age} years</span>
                        <span className="text-white/50">•</span>
                        <div className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-rose-300" />
                            <span className="text-sm font-medium">{profile.location}</span>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Info Section */}
            <div className="p-6 space-y-4 flex-1 flex flex-col">
                {/* Quick Stats */}
                <div className="flex items-center gap-2 flex-wrap">
                    {profile.height && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 rounded-full">
                            <Ruler size={14} className="text-rose-600" />
                            <span className="text-xs font-semibold text-rose-900">{profile.height} cm</span>
                        </div>
                    )}
                    {profile.religion && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full">
                            <Church size={14} className="text-blue-600" />
                            <span className="text-xs font-semibold text-blue-900">{profile.religion}</span>
                        </div>
                    )}
                    {profile.maritalStatus && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-full">
                            <Users size={14} className="text-emerald-600" />
                            <span className="text-xs font-semibold text-emerald-900 capitalize">{profile.maritalStatus.toLowerCase()}</span>
                        </div>
                    )}
                </div>

                {/* Profession */}
                {(profile.profession || profile.jobCategory) && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Briefcase size={18} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-500 font-medium mb-0.5">Profession</p>
                            <p className="text-sm font-bold text-slate-900 truncate">
                                {profile.profession || profile.jobCategory}
                            </p>
                        </div>
                    </div>
                )}

                {/* Bio */}
                {profile.bio && (
                    <div className="flex-1">
                        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                            {profile.bio}
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-4 mt-auto">
                    <Link
                        href={`/chat/${profile.userId}`}
                        className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-2xl text-sm font-semibold transition-all active:scale-95"
                    >
                        <MessageCircle size={18} />
                        <span>Chat</span>
                    </Link>
                    <button
                        onClick={() => setIsProposing(true)}
                        className="bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white py-3.5 rounded-2xl text-sm font-semibold transition-all shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Send size={18} />
                        <span>Propose</span>
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
