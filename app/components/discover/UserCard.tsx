'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, BadgeCheck, MessageCircle, MapPin, Briefcase, Send, X, ArrowRight, HeartHandshake, Ruler, Church, Users, GraduationCap, Home, CheckCircle2, Sparkles, UserCircle } from 'lucide-react';
import Link from 'next/link';

interface Profile {
    id: string;
    userId: string;
    name: string;
    age: number;
    gender: string;
    religion?: string;
    caste?: string;
    height?: number;
    profession?: string;
    education?: string;
    location: string;
    photoUrl: string;
    jobCategory?: string;
    jobStatus?: string;
    maritalStatus?: string;
    familyType?: string;
    bio?: string;
    isVerified?: boolean;
    incomeRange?: string;
    diet?: string;
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
                    <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-rose-500/20">
                        <HeartHandshake className="text-white" size={32} />
                    </div>
                    <h3 className="text-2xl font-serif text-slate-900 font-bold">Express Interest</h3>
                    <p className="text-sm text-slate-500">Send a personalized message to {profile.name}</p>
                </div>

                <div className="space-y-4">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full h-32 bg-slate-50 border-2 border-slate-200 focus:border-rose-500 rounded-xl p-4 text-sm outline-none transition-all resize-none placeholder:text-slate-400"
                        placeholder="Write your message here..."
                        disabled={isSending || status === 'SUCCESS'}
                    />

                    {status === 'ERROR' && (
                        <p className="text-sm text-rose-600 text-center font-medium bg-rose-50 py-2 rounded-lg">{statusMessage}</p>
                    )}

                    <button
                        onClick={handleSendProposal}
                        disabled={isSending || status === 'SUCCESS' || !message.trim()}
                        className={`w-full py-4 rounded-xl font-bold text-sm text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${status === 'SUCCESS'
                            ? 'bg-emerald-500 shadow-emerald-500/20'
                            : 'bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 shadow-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                    >
                        {isSending ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : status === 'SUCCESS' ? (
                            <>
                                <CheckCircle2 size={18} />
                                <span>Proposal Sent</span>
                            </>
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
            className="group bg-white rounded-[2rem] border border-slate-100/80 hover:border-rose-100 shadow-sm hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-500 overflow-hidden flex flex-col h-full relative"
        >
            {/* Image Section */}
            <Link href={`/profile/${profile.userId}`} className="relative aspect-[3/4] overflow-hidden bg-slate-100 block">
                <img
                    src={profile.photoUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&h=800'}
                    alt={profile.name}
                    onLoad={() => setImageLoaded(true)}
                    className={`w-full h-full object-cover transition-all duration-700 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'} group-hover:scale-105`}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />

                {/* Match Score Badge */}
                <div className="absolute top-4 left-4 z-10">
                    <div className="bg-white/95 backdrop-blur-md rounded-full pl-1.5 pr-3 py-1.5 shadow-lg flex items-center gap-2">
                        <div className="bg-emerald-500 text-white p-1 rounded-full">
                            <Sparkles size={10} fill="currentColor" />
                        </div>
                        <span className="text-xs font-bold text-slate-900">{compatibilityScore}% Match</span>
                    </div>
                </div>

                {/* Favorite Button */}
                <button
                    onClick={(e) => { e.preventDefault(); onToggleFavorite(profile.userId); }}
                    className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg backdrop-blur-sm z-10 ${isFavorite
                        ? 'bg-rose-500 text-white shadow-rose-500/40'
                        : 'bg-white/90 text-slate-500 hover:bg-white hover:text-rose-500'
                        }`}
                >
                    <Heart size={18} className={isFavorite ? 'fill-current' : ''} />
                </button>

                {/* Name & Basic Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                    <div className="flex items-center gap-2 mb-1.5">
                        <h2 className="text-2xl font-serif text-white font-bold tracking-tight drop-shadow-md truncate">
                            {profile.name}
                        </h2>
                        {profile.isVerified && (
                            <div className="bg-blue-500 text-white p-0.5 rounded-full drop-shadow-md" title="Verified Profile">
                                <CheckCircle2 size={14} />
                            </div>
                        )}
                    </div>
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-white/90 text-sm">
                        <span className="font-medium bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-md">{profile.age} yrs</span>
                        <span className="text-white/40 hidden sm:inline">•</span>
                        <div className="flex items-center gap-1">
                            <MapPin size={13} className="text-rose-300" />
                            <span className="font-medium truncate max-w-[150px]">{profile.location}</span>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Detailed Info Section */}
            <div className="p-5 flex-1 flex flex-col gap-4">
                {/* Key Attributes Pills */}
                <div className="flex flex-wrap gap-2">
                    {profile.height && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 rounded-lg border border-rose-100">
                            <Ruler size={13} className="text-rose-600" />
                            <span className="text-[11px] font-semibold text-rose-900">{profile.height} cm</span>
                        </div>
                    )}
                    {profile.religion && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-lg border border-blue-100">
                            <Church size={13} className="text-blue-600" />
                            <span className="text-[11px] font-semibold text-blue-900">{profile.religion} {profile.caste ? `• ${profile.caste}` : ''}</span>
                        </div>
                    )}
                    {profile.maritalStatus && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
                            <UserCircle size={13} className="text-emerald-600" />
                            <span className="text-[11px] font-semibold text-emerald-900 capitalize">{profile.maritalStatus.toLowerCase()}</span>
                        </div>
                    )}
                </div>

                {/* Professional & Education Grid */}
                <div className="grid grid-cols-1 gap-2.5">
                    {(profile.profession || profile.jobCategory) && (
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Briefcase size={14} className="text-slate-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Profession</p>
                                <p className="text-xs font-semibold text-slate-900 line-clamp-1">
                                    {profile.profession || profile.jobCategory}
                                </p>
                            </div>
                        </div>
                    )}
                    {profile.education && (
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                <GraduationCap size={14} className="text-slate-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Education</p>
                                <p className="text-xs font-semibold text-slate-900 line-clamp-1">
                                    {profile.education}
                                </p>
                            </div>
                        </div>
                    )}
                    {profile.familyType && (
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Users size={14} className="text-slate-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Family Type</p>
                                <p className="text-xs font-semibold text-slate-900 line-clamp-1 capitalize">
                                    {profile.familyType.toLowerCase().replace('_', ' ')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bio Snippet (Optional) */}
                {profile.bio && (
                    <div className="mt-1 pt-3 border-t border-slate-100">
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed italic">
                            "{profile.bio}"
                        </p>
                    </div>
                )}

                <div className="flex-grow" />

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <Link
                        href={`/chat/${profile.userId}`}
                        className="flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 py-3 rounded-xl text-xs font-bold transition-all border border-slate-200"
                    >
                        <MessageCircle size={16} />
                        <span>Chat</span>
                    </Link>
                    <button
                        onClick={() => setIsProposing(true)}
                        className="bg-slate-900 hover:bg-rose-600 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                    >
                        <Send size={16} />
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
