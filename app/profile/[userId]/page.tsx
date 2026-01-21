'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, Loader2, MapPin, BadgeCheck, Users, Sun,
    MessageCircle, HeartHandshake, ArrowLeft, Share2,
    Briefcase, GraduationCap, Utensils, Cigarette,
    Home, ArrowRight, Sparkles, ShieldCheck, X
} from 'lucide-react';
import Link from 'next/link';

interface ProfileData {
    id: string;
    userId: string;
    name: string;
    age: number;
    gender: string;
    religion?: string;
    caste?: string;
    motherTongue?: string;
    height?: number;
    bio: string;
    location: string;
    jobStatus: string;
    maritalStatus: string;
    photoUrl: string;
    education?: string;
    profession?: string;
    incomeRange?: string;
    diet?: string;
    smoking?: string;
    drinking?: string;
    fatherOccupation?: string;
    motherOccupation?: string;
    siblings?: string;
    familyType?: string;
    prefAgeMin?: number;
    prefAgeMax?: number;
    prefHeightMin?: number;
    prefReligion?: string;
    prefEducation?: string;
    prefLifestyle?: string;
}

export default function UserProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const userId = params?.userId as string;

    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
    const [interestMessage, setInterestMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [hasInterest, setHasInterest] = useState(false);

    useEffect(() => {
        if (userId && status === 'authenticated') {
            fetchProfile();
            checkFavoriteStatus();
        }
    }, [userId, status]);

    const fetchProfile = async () => {
        try {
            const response = await fetch(`/api/profiles/${userId}`);
            if (response.status === 404) {
                router.push('/discover');
                return;
            }
            const data = await response.json();
            if (data.success && data.profile) {
                setProfile(data.profile);
            }
        } catch (error) {
            console.error('Failed to fetch profile', error);
        } finally {
            setLoading(false);
        }
    };

    const checkFavoriteStatus = async () => {
        try {
            const response = await fetch('/api/favorites');
            if (response.ok) {
                const data = await response.json();
                setIsFavorite(data.favoriteIds?.includes(userId) || false);
            }
        } catch (error) {
            console.error('Error checking favorite status:', error);
        }
    };

    const toggleFavorite = async () => {
        const response = await fetch('/api/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ favoritedId: userId }),
        });
        if (response.ok) {
            const data = await response.json();
            setIsFavorite(data.isFavorited);
        }
    };

    const handleSendInterest = async () => {
        setIsSending(true);
        try {
            const res = await fetch('/api/interests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverId: userId,
                    message: interestMessage
                })
            });
            if (res.ok) {
                setIsInterestModalOpen(false);
                setInterestMessage("");
                setHasInterest(true);
            }
        } catch (error) {
            console.error('Error sending interest:', error);
        } finally {
            setIsSending(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="bg-slate-50 min-h-screen pb-20 pt-24">
            <div className="max-w-7xl mx-auto px-6">
                <Link href="/discover" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-rose-600 transition-all mb-8">
                    <ArrowLeft size={14} /> Back to Discover
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Image Section */}
                    <div className="lg:col-span-5">
                        <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-xl border-8 border-white relative">
                            <img src={profile.photoUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&h=800"} className="w-full h-full object-cover" alt={profile.name} />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-40" />
                            <div className="absolute top-6 right-6 flex flex-col gap-3">
                                <button
                                    onClick={toggleFavorite}
                                    className={`p-3 rounded-xl backdrop-blur-md transition-all shadow-lg ${isFavorite ? 'bg-rose-500 text-white' : 'bg-white/30 text-white hover:bg-white/50 border border-white/20'}`}
                                >
                                    <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
                                </button>
                                <button className="p-3 rounded-xl bg-white/30 backdrop-blur-md text-white hover:bg-white/50 border border-white/20 transition-all shadow-lg">
                                    <Share2 size={20} />
                                </button>
                            </div>
                            <div className="absolute bottom-8 left-8">
                                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-500 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Online
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <h1 className="text-5xl font-serif text-slate-900 font-bold tracking-tight">{profile.name}, {profile.age}</h1>
                                <BadgeCheck className="text-blue-500" size={32} />
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-rose-500" /> {profile.location}</span>
                                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                <span>{profile.religion || 'Not specified'}</span>
                            </div>
                            <p className="text-slate-500 text-lg italic leading-relaxed font-light border-l-2 border-rose-100 pl-6 py-2">
                                "{profile.bio || 'Searching for a meaningful connection based on shared values.'}"
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-1 shadow-sm">
                                <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-bold">Religion</span>
                                <span className="text-slate-900 font-bold text-sm block truncate">{profile.religion || '-'}</span>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-1 shadow-sm">
                                <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-bold">Height</span>
                                <span className="text-slate-900 font-bold text-sm block">{profile.height} cm</span>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-1 shadow-sm">
                                <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-bold">Status</span>
                                <span className="text-slate-900 font-bold text-sm block truncate">{profile.maritalStatus?.toLowerCase()}</span>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-1 shadow-sm">
                                <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-bold">Caste</span>
                                <span className="text-slate-900 font-bold text-sm block truncate">{profile.caste || '-'}</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                onClick={() => setIsInterestModalOpen(true)}
                                disabled={hasInterest}
                                className="flex-1 bg-slate-900 text-white px-8 py-4.5 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-rose-600 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                <HeartHandshake size={18} />
                                {hasInterest ? 'Interest Sent' : 'Express Interest'}
                            </button>
                            <Link
                                href={`/chat/${userId}`}
                                className="px-8 py-4.5 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-95"
                            >
                                <MessageCircle size={18} /> Chat
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                    {/* Lifestyle */}
                    <div className="space-y-6">
                        <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            <Briefcase size={14} /> Lifestyle & Education
                        </h3>
                        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Education</label>
                                <p className="text-slate-900 font-bold">{profile.education || 'Not specified'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Profession</label>
                                <p className="text-slate-900 font-bold">{profile.profession || 'Not specified'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Income</label>
                                <p className="text-slate-900 font-bold">{profile.incomeRange || 'Not specified'}</p>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                                <div className="bg-slate-50 px-3 py-1.5 rounded-lg text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <Utensils size={12} className="text-rose-400" /> {profile.diet || 'Any'}
                                </div>
                                <div className="bg-slate-50 px-3 py-1.5 rounded-lg text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <Cigarette size={12} className="text-rose-400" /> {profile.smoking || 'Non-smoker'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Family */}
                    <div className="space-y-6">
                        <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            <Home size={14} /> Family Details
                        </h3>
                        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Family Type</label>
                                <p className="text-slate-900 font-bold">{profile.familyType || 'Not specified'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Father</label>
                                    <p className="text-slate-700 text-sm font-medium">{profile.fatherOccupation || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Mother</label>
                                    <p className="text-slate-700 text-sm font-medium">{profile.motherOccupation || '-'}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Siblings</label>
                                <p className="text-slate-900 font-bold">{profile.siblings || 'Not specified'}</p>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl uppercase tracking-widest">
                                <ShieldCheck size={14} /> Verified History
                            </div>
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="space-y-6">
                        <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            <Sparkles size={14} /> Partner Preferences
                        </h3>
                        <div className="bg-slate-900 rounded-3xl p-8 shadow-xl space-y-6 text-white relative overflow-hidden">
                            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl" />
                            <div className="space-y-1 relative z-10">
                                <label className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">Age Range</label>
                                <p className="text-white font-bold text-xl">{profile.prefAgeMin} - {profile.prefAgeMax} years</p>
                            </div>
                            <div className="space-y-1 relative z-10">
                                <label className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">Religion</label>
                                <p className="text-white font-bold">{profile.prefReligion || 'Any'}</p>
                            </div>
                            <div className="space-y-1 relative z-10">
                                <label className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">Education</label>
                                <p className="text-white font-bold">{profile.prefEducation || 'Any'}</p>
                            </div>
                            <div className="pt-4 border-t border-white/10 relative z-10">
                                <label className="text-[9px] font-bold text-rose-400 uppercase tracking-widest block mb-2">Message</label>
                                <p className="text-white/60 text-sm font-light italic leading-relaxed">
                                    "{profile.prefLifestyle || 'Searching for a partner who values mutual respect and shared dreams.'}"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Interest Modal */}
            <AnimatePresence>
                {isInterestModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isSending && setIsInterestModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl space-y-8"
                        >
                            <button onClick={() => setIsInterestModalOpen(false)} className="absolute top-6 right-6 text-slate-400">
                                <X size={20} />
                            </button>
                            <div className="text-center space-y-3">
                                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
                                    <HeartHandshake className="text-rose-600" size={32} />
                                </div>
                                <h3 className="text-2xl font-serif text-slate-900 font-bold">Express Interest</h3>
                                <p className="text-sm text-slate-500">Add a personalized message to {profile.name}.</p>
                            </div>

                            <div className="space-y-4">
                                <textarea
                                    value={interestMessage}
                                    onChange={(e) => setInterestMessage(e.target.value)}
                                    className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm outline-none focus:border-rose-500 transition-all resize-none shadow-inner"
                                    placeholder="I'd like to connect and learn more about you..."
                                    disabled={isSending}
                                />
                                <button
                                    onClick={handleSendInterest}
                                    disabled={isSending || !interestMessage.trim()}
                                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-rose-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSending ? <Loader2 className="animate-spin" size={18} /> : (
                                        <>Send Proposal <ArrowRight size={16} /></>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
