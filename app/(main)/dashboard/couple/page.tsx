'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Heart, Calendar, MessageCircle, Image as ImageIcon,
    Sparkles, Shield, User, MapPin, Briefcase, Phone
} from 'lucide-react';

interface CoupleData {
    partner: any; // Profile
    startDate: string;
    status: string;
}

export default function CoupleDashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [data, setData] = useState<CoupleData | null>(null);
    const [loading, setLoading] = useState(true);
    const [daysTogether, setDaysTogether] = useState(0);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (status === 'authenticated') {
            fetchCoupleData();
        }
    }, [status]);

    const fetchCoupleData = async () => {
        try {
            const res = await fetch('/api/user/couple');
            const json = await res.json();
            if (json.found) {
                setData(json);
                // Calculate days
                const start = new Date(json.startDate);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                setDaysTogether(diffDays);
            } else {
                // Not a couple? Redirect or show empty state
                // For now, let's just stay here and show a message
            }
        } catch (error) {
            console.error('Failed to fetch couple data', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20 bg-rose-50/50">
                <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen pt-32 pb-20 px-4 text-center">
                <div className="max-w-md mx-auto space-y-6">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                        <Heart size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Not in a Relationship Yet</h1>
                    <p className="text-slate-500">
                        This page is for couples who have officially engaged through the platform.
                        Keep searching for your perfect match!
                    </p>
                    <button
                        onClick={() => router.push('/discover')}
                        className="px-6 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition"
                    >
                        Discover Matches
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fff0f3] pt-24 pb-20 overflow-hidden relative">
            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-rose-200/40 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-100/40 blur-[150px] rounded-full" />
            </div>

            <main className="max-w-6xl mx-auto px-4 relative z-10 space-y-12">
                {/* Hero / Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-6"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/60 backdrop-blur-sm border border-rose-200 rounded-full shadow-sm">
                        <Sparkles size={14} className="text-rose-500" />
                        <span className="text-xs font-bold uppercase tracking-widest text-rose-600">
                            {data.status === 'ENGAGED' ? 'Officially Engaged' : 'Relationship'}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-serif text-slate-900 font-bold tracking-tight">
                        You & <span className="text-rose-600">{data.partner.name}</span>
                    </h1>

                    <div className="flex justify-center">
                        <div className="px-8 py-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl shadow-rose-200/20 border border-white flex items-center gap-3">
                            <Calendar className="text-rose-400" size={20} />
                            <span className="text-lg font-medium text-slate-600">
                                Together for <span className="text-rose-600 font-bold text-2xl mx-1">{daysTogether}</span> Days
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Profiles Board */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* User Card (Self) */}
                    <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 transform lg:translate-y-12 opacity-80 hover:opacity-100 transition-all">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-32 h-32 rounded-full bg-slate-100 overflow-hidden border-4 border-white shadow-lg">
                                {session?.user?.image ? (
                                    <img src={session.user.image} alt="You" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                        <User size={40} className="text-slate-300" />
                                    </div>
                                )}
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-slate-900">You</h3>
                                <p className="text-sm text-slate-500">My Profile</p>
                            </div>
                            <button
                                onClick={() => router.push('/profile/edit')}
                                className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition"
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* Connection Status / Actions */}
                    <div className="space-y-6 lg:col-span-1 lg:pt-20">
                        <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white shadow-lg text-center space-y-6">
                            <Heart size={48} className="text-rose-500 mx-auto fill-rose-500 animate-pulse" />
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">The Journey Begins</h3>
                                <p className="text-sm text-slate-500 mt-2">
                                    Start planning your future together. Use the tools below to connect.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={() => router.push('/messages')} // Ideally direct to chat with partner
                                    className="w-full py-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-xl font-bold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/40 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <MessageCircle size={18} /> Chat Now
                                </button>
                                <button className="w-full py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                    <ImageIcon size={18} /> Shared Gallery <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400">SOON</span>
                                </button>
                                <button className="w-full py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                    <Phone size={18} /> Audio Call <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400">SOON</span>
                                </button>
                            </div>
                        </div>

                        {/* Safety */}
                        <div className="text-center">
                            <button className="text-xs font-medium text-slate-400 flex items-center justify-center gap-1 mx-auto hover:text-rose-600 transition">
                                <Shield size={12} />
                                Report an issue or unmatch
                            </button>
                        </div>
                    </div>

                    {/* Partner Card */}
                    <div className="bg-white rounded-3xl p-6 shadow-xl shadow-rose-200/40 border border-rose-100 ring-4 ring-rose-50 ring-offset-2">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-32 h-32 rounded-full bg-slate-100 overflow-hidden border-4 border-white shadow-lg relative">
                                <img src={data.partner.photoUrl || '/placeholder-user.jpg'} alt={data.partner.name} className="w-full h-full object-cover" />
                                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-2 border-white rounded-full" />
                            </div>
                            <div className="text-center space-y-1">
                                <h3 className="text-2xl font-bold text-slate-900">{data.partner.name}</h3>
                                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                                    <MapPin size={14} /> {data.partner.location}
                                </div>
                                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                                    <Briefcase size={14} /> {data.partner.profession}
                                </div>
                            </div>

                            <div className="w-full pt-4 border-t border-slate-50 space-y-3">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">About</h4>
                                <p className="text-sm text-slate-600 text-center line-clamp-3 italic">
                                    "{data.partner.bio}"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
