'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageSquare, Heart, ChevronRight, ShieldCheck, Clock, MapPin, BadgeCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Conversation {
    id: string;
    participant: {
        id: string;
        name: string;
        photoUrl: string;
        location: string;
    };
    lastMessage: {
        text: string;
        createdAt: string;
        isRead: boolean;
    };
}

export default function MessagesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [msgRes, matchRes] = await Promise.all([
                fetch('/api/messages'),
                fetch('/api/matches')
            ]);

            if (msgRes.ok) {
                const data = await msgRes.json();
                setConversations(data.conversations || []);
            }
            if (matchRes.ok) {
                const data = await matchRes.json();
                setMatches(data.matches || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated') {
            fetchData();
        }
    }, [status]);

    const filteredConversations = conversations.filter(c =>
        c.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen pt-24">
            <main className="max-w-7xl mx-auto px-6 pb-20 space-y-12 relative z-10">
                {/* Header */}
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 rounded-full border border-rose-100">
                        <Sparkles size={12} className="text-rose-600" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600">Messages</span>
                    </div>
                    <h1 className="text-4xl font-serif text-slate-900 font-bold tracking-tight">
                        Conversations & <span className="text-rose-600">Connections</span>
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Sidebar / Stats */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-8">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search messages..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:border-rose-500 transition-all"
                                />
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Insights</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-4 bg-rose-50/50 rounded-2xl border border-rose-100/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-600 shadow-sm">
                                                <Heart size={18} />
                                            </div>
                                            <span className="text-xs font-bold text-slate-700">Matches</span>
                                        </div>
                                        <span className="text-xl font-serif text-rose-600 font-bold">{matches.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-600 shadow-sm">
                                                <Clock size={18} />
                                            </div>
                                            <span className="text-xs font-bold text-slate-700">Pending</span>
                                        </div>
                                        <span className="text-xl font-serif text-slate-900 font-bold">3</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-3xl p-8 text-white space-y-6 shadow-xl shadow-slate-900/10">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                                <ShieldCheck className="text-rose-400" size={24} />
                            </div>
                            <h3 className="text-xl font-serif font-bold tracking-tight">Safe Chat</h3>
                            <p className="text-white/60 text-sm leading-relaxed font-light">
                                Your conversations are kept private and secure. Follow our safety guidelines for the best experience.
                            </p>
                            <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-white/10">
                                Safety Tips
                            </button>
                        </div>
                    </div>

                    {/* Conversations List */}
                    <div className="lg:col-span-8">
                        {filteredConversations.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-slate-100 py-32 text-center space-y-6 shadow-sm">
                                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-200">
                                    <MessageSquare size={40} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-serif text-slate-900 font-bold">No Messages Yet</h3>
                                    <p className="text-sm text-slate-500 max-w-sm mx-auto">Discover and match with profiles to start a conversation.</p>
                                </div>
                                <Link
                                    href="/discover"
                                    className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg active:scale-95"
                                >
                                    Discover Profiles <ChevronRight size={16} />
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredConversations.map((conv, idx) => (
                                    <motion.div
                                        key={conv.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <Link
                                            href={`/chat/${conv.participant.id}`}
                                            className="block group bg-white hover:border-rose-200 border border-slate-100 rounded-3xl p-6 transition-all shadow-sm hover:shadow-lg"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="relative flex-shrink-0">
                                                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm bg-slate-100 group-hover:scale-105 transition-transform">
                                                        <img
                                                            src={conv.participant.photoUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&h=300"}
                                                            className="w-full h-full object-cover"
                                                            alt={conv.participant.name}
                                                        />
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full shadow-md" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-xl font-serif text-slate-900 group-hover:text-rose-600 transition-colors font-bold tracking-tight">
                                                                {conv.participant.name}
                                                            </h3>
                                                            <BadgeCheck size={18} className="text-blue-500" />
                                                        </div>
                                                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                                                            {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-1 pr-12">
                                                        {conv.lastMessage.text}
                                                    </p>
                                                    <div className="flex items-center gap-6 mt-3">
                                                        {!conv.lastMessage.isRead && (
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                                                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">New</span>
                                                            </div>
                                                        )}
                                                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest flex items-center gap-1.5">
                                                            <MapPin size={12} className="text-rose-500/50" /> {conv.participant.location}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner border border-slate-100">
                                                    <ChevronRight size={24} strokeWidth={1.5} />
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
