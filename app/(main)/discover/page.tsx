'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, MapPin, Briefcase,
    ChevronDown, Heart, Sparkles, MessageCircle,
    BadgeCheck, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { UserCard } from '@/app/components/discover/UserCard';

interface Profile {
    id: string;
    userId: string;
    gender: string;
    age: number;
    religion: string;
    location: string;
    photoUrl: string;
    jobCategory: string;
    jobStatus: string;
    maritalStatus: string;
    education: string;
    profession: string;
    name: string;
    bio: string;
}

interface ScoredProfile {
    profile: Profile;
    score: number;
    reasons: string[];
}

export default function DiscoverPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [profiles, setProfiles] = useState<ScoredProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

    const [filters, setFilters] = useState({
        religion: '',
        gender: '',
        ageMin: '',
        ageMax: '',
        location: '',
        jobStatus: '',
        maritalStatus: ''
    });

    const RELIGIONS = ['Hindu', 'Muslim', 'Sikh', 'Christian', 'Jain', 'Parsi', 'Buddhist', 'Jewish'];
    const MARITAL_STATUSES = ['SINGLE', 'DIVORCED', 'WIDOWED'];

    const fetchFavorites = async () => {
        try {
            const res = await fetch('/api/favorites');
            if (res.ok) {
                const data = await res.json();
                setFavoriteIds(data.favoriteIds || []);
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
        }
    };

    const toggleFavorite = async (userId: string) => {
        try {
            const isFav = favoriteIds.includes(userId);
            setFavoriteIds(prev => isFav ? prev.filter(id => id !== userId) : [...prev, userId]);

            const res = await fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ favoritedId: userId })
            });

            if (!res.ok) {
                setFavoriteIds(prev => isFav ? [...prev, userId] : prev.filter(id => id !== userId));
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const fetchProfiles = useCallback(async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value.toString());
            });
            queryParams.append('page', page.toString());
            queryParams.append('limit', '12');

            const res = await fetch(`/api/profiles?${queryParams.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setProfiles(data.profiles || []);
                setTotalPages(data.totalPages || 1);
            }
        } catch (error) {
            console.error('Error fetching profiles:', error);
        } finally {
            setLoading(false);
        }
    }, [filters, page]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (status === 'authenticated') {
            fetchProfiles();
            fetchFavorites();
        }
    }, [status, fetchProfiles, router]);

    return (
        <div className="bg-slate-50 min-h-screen pb-32 pt-24 relative overflow-hidden">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none opacity-30">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-100/30 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-50/40 blur-[120px] rounded-full" />
            </div>

            <main className="max-w-7xl mx-auto px-6 space-y-12 relative z-10">
                {/* Header */}
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 rounded-full border border-rose-100">
                        <Sparkles size={12} className="text-rose-600" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600">Discover Matches</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif text-slate-900 font-bold tracking-tight">
                        Find Your <span className="text-rose-600">Perfect Harmony</span>
                    </h1>
                </div>

                {/* Filter Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 p-8 space-y-8 border border-white"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Religion</label>
                            <div className="relative group">
                                <select
                                    value={filters.religion}
                                    onChange={(e) => setFilters({ ...filters, religion: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-10 text-sm focus:border-rose-500 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">All Religions</option>
                                    {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-rose-500 transition-colors" size={16} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                            <div className="relative group">
                                <select
                                    value={filters.gender}
                                    onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-10 text-sm focus:border-rose-500 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">All</option>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-rose-500 transition-colors" size={16} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Age Range</label>
                            <div className="flex gap-3">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.ageMin}
                                    onChange={(e) => setFilters({ ...filters, ageMin: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:border-rose-500 outline-none transition-all"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.ageMax}
                                    onChange={(e) => setFilters({ ...filters, ageMax: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:border-rose-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={() => setPage(1)}
                                className="w-full bg-slate-900 text-white rounded-xl h-[46px] font-medium text-sm hover:bg-rose-600 transition-all shadow-lg hover:shadow-rose-500/20 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Search size={16} /> Find Matches
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-rose-600 transition-colors mx-auto"
                    >
                        <Filter size={14} />
                        {showAdvanced ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
                        <ChevronDown className={`transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} size={14} />
                    </button>

                    <AnimatePresence>
                        {showAdvanced && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-50">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Employment</label>
                                        <select
                                            value={filters.jobStatus}
                                            onChange={(e) => setFilters({ ...filters, jobStatus: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:border-rose-500 outline-none"
                                        >
                                            <option value="">Any</option>
                                            <option value="EMPLOYED">Employed</option>
                                            <option value="SELF_EMPLOYED">Self Employed</option>
                                            <option value="STUDENT">Student</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Marital Status</label>
                                        <select
                                            value={filters.maritalStatus}
                                            onChange={(e) => setFilters({ ...filters, maritalStatus: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:border-rose-500 outline-none"
                                        >
                                            <option value="">Any</option>
                                            {MARITAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Location</label>
                                        <input
                                            type="text"
                                            placeholder="Region/City..."
                                            value={filters.location}
                                            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:border-rose-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Profile Grid */}
                <div className="space-y-8">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="aspect-[4/5] sm:aspect-[3/4] rounded-2xl sm:rounded-3xl bg-white animate-pulse border border-slate-100 shadow-sm" />
                            ))}
                        </div>
                    ) : profiles.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                            {profiles.map((sp: any, idx) => (
                                <UserCard
                                    key={sp.profile.id}
                                    profile={sp.profile}
                                    matchScore={sp.score}
                                    index={idx}
                                    isFavorite={favoriteIds.includes(sp.profile.userId)}
                                    onToggleFavorite={toggleFavorite}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-6">
                            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
                                <Search size={32} className="text-rose-200" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-slate-900">No Matches Found</h3>
                                <p className="text-sm text-slate-500">Try adjusting your filters to see more profiles.</p>
                            </div>
                            <button
                                onClick={() => setFilters({ religion: '', gender: '', ageMin: '', ageMax: '', location: '', jobStatus: '', maritalStatus: '' })}
                                className="text-rose-600 font-bold text-xs uppercase tracking-widest hover:underline"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-center items-center gap-8 pt-12 border-t border-slate-100"
                    >
                        <button
                            disabled={page === 1}
                            onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="w-10 h-10 bg-white rounded-xl text-slate-400 shadow-sm border border-slate-200 flex items-center justify-center disabled:opacity-30 hover:text-rose-600 transition-all active:scale-95"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                            Page <span className="text-slate-900 font-bold">{page}</span> of {totalPages}
                        </div>
                        <button
                            disabled={page === totalPages}
                            onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-rose-600 transition-all active:scale-95"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </motion.div>
                )
                }
            </main >
        </div >
    );
}
