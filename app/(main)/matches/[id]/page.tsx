'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, MessageCircle, ShieldCheck, ArrowRight, User, MapPin, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function MatchPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [matchData, setMatchData] = useState<any>(null);
    const [adminNotified, setAdminNotified] = useState(false);
    const [notifyingAdmin, setNotifyingAdmin] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (status === 'authenticated' && id) {
            fetchMatchDetails();
        }
    }, [status, id]);

    const fetchMatchDetails = async () => {
        try {
            // Fetch match details (proposals that are accepted)
            const res = await fetch(`/api/matches/${id}`);
            const data = await res.json();
            if (res.ok) {
                setMatchData(data.match);
                // Check if admin already notified (maybe a flag in Match model? 
                // For now we'll assume a local state or check match status)
                setAdminNotified(data.match.adminNotified);
            }
        } catch (error) {
            console.error('Error fetching match:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNotifyAdmin = async () => {
        setNotifyingAdmin(true);
        try {
            const res = await fetch(`/api/matches/${id}/notify-admin`, {
                method: 'POST'
            });
            if (res.ok) {
                setAdminNotified(true);
            }
        } catch (error) {
            console.error('Error notifying admin:', error);
        } finally {
            setNotifyingAdmin(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin" />
        </div>
    );

    if (!matchData) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="text-center space-y-4">
                <AlertTriangle size={48} className="text-amber-500 mx-auto" />
                <h1 className="text-2xl font-bold">Match Not Found</h1>
                <Link href="/dashboard" className="text-rose-600 font-bold hover:underline">Return to Dashboard</Link>
            </div>
        </div>
    );

    const partner = matchData.userAId === session?.userId ? matchData.userB : matchData.userA;

    return (
        <div className="min-h-screen bg-slate-50 py-24 px-6 overflow-hidden relative">
            {/* Background Animations */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0.5],
                            y: [0, -200],
                            x: Math.random() * 400 - 200
                        }}
                        transition={{
                            duration: 5 + Math.random() * 5,
                            repeat: Infinity,
                            delay: Math.random() * 10
                        }}
                        className="absolute text-rose-300/30"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`
                        }}
                    >
                        <Heart size={Math.random() * 20 + 10} />
                    </motion.div>
                ))}
            </div>

            <main className="max-w-4xl mx-auto space-y-12 relative z-10">
                {/* Celebration Header */}
                <div className="text-center space-y-6">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-24 h-24 bg-rose-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-rose-500/40 relative"
                    >
                        <Sparkles className="text-white" size={40} />
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute -inset-2 border-2 border-rose-500 border-dashed rounded-[3rem]"
                        />
                    </motion.div>

                    <div className="space-y-4">
                        <h1 className="text-6xl font-serif font-bold text-slate-900 leading-tight">It's a <span className="text-rose-600">Perfect Match!</span></h1>
                        <p className="text-slate-500 text-lg font-light max-w-xl mx-auto">
                            Congratulations! Your proposal has been accepted. We wish you both a beautiful journey ahead.
                        </p>
                    </div>
                </div>

                {/* Match Cards */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-12 pt-8">
                    {/* Me */}
                    <div className="relative group">
                        <div className="w-48 h-64 rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl rotate-[-3deg] group-hover:rotate-0 transition-all duration-500">
                            <img src={session?.user?.image || ""} className="w-full h-full object-cover" alt="Me" />
                        </div>
                        <div className="absolute -bottom-4 right-0 bg-white px-4 py-2 rounded-xl shadow-lg border border-slate-100 italic font-medium">You</div>
                    </div>

                    {/* Heart Connector */}
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl border border-rose-100 z-20"
                    >
                        <Heart className="text-rose-500 fill-current" size={32} />
                    </motion.div>

                    {/* Partner */}
                    <div className="relative group">
                        <div className="w-48 h-64 rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl rotate-[3deg] group-hover:rotate-0 transition-all duration-500">
                            <img src={partner?.profile?.photoUrl || ""} className="w-full h-full object-cover" alt="Partner" />
                        </div>
                        <div className="absolute -bottom-4 left-0 bg-white px-4 py-2 rounded-xl shadow-lg border border-slate-100 italic font-medium">{partner?.name}</div>
                    </div>
                </div>

                {/* Next Steps Card */}
                <section className="bg-white/80 backdrop-blur-md rounded-[3rem] p-12 shadow-2xl border border-white space-y-10">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-serif font-bold text-slate-900">Next Steps</h3>
                            <p className="text-sm text-slate-400">Formalize your journey with our assistance.</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-emerald-100">
                            <ShieldCheck size={16} /> Verified Match
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Notify Admin Card */}
                        <div className={`p-8 rounded-3xl transition-all border-2 ${adminNotified ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 hover:border-rose-300'}`}>
                            <div className="space-y-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${adminNotified ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 shadow-sm'}`}>
                                    {adminNotified ? <CheckCircle2 size={24} /> : <ShieldCheck size={24} />}
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-slate-900">Notify Administration</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Let our team know about your successful match. We can assist with formal proceedings and verification.
                                    </p>
                                </div>
                                {!adminNotified && (
                                    <button
                                        onClick={handleNotifyAdmin}
                                        disabled={notifyingAdmin}
                                        className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 transition-all disabled:opacity-50"
                                    >
                                        {notifyingAdmin ? 'Notifying...' : 'Notify Admin Now'}
                                    </button>
                                )}
                                {adminNotified && (
                                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-widest">
                                        <CheckCircle2 size={14} /> Admin Notified
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Chat Card */}
                        <div className="p-8 bg-slate-900 rounded-3xl text-white space-y-4 shadow-xl">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                <MessageCircle size={24} className="text-rose-500" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold">Continue Conversation</h4>
                                <p className="text-xs text-white/60 leading-relaxed">
                                    Start discussing your next steps directly with {partner?.name}.
                                </p>
                            </div>
                            <Link
                                href={`/chat/${partner?.id}`}
                                className="inline-flex items-center gap-2 w-full justify-center py-3 bg-white text-slate-900 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                            >
                                Open Chat <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </section>

                <div className="text-center">
                    <Link href="/dashboard" className="text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-slate-900 transition-all">
                        ← Back to Dashboard
                    </Link>
                </div>
            </main>
        </div>
    );
}
