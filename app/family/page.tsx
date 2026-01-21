'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    UserPlus,
    Shield,
    ExternalLink,
    Loader2,
    Mail,
    User as UserIcon,
    AlertCircle,
    CheckCircle2,
    Sparkles,
    Heart,
    ShieldCheck,
    ScrollText
} from 'lucide-react';

interface FamilyData {
    managedBy: { id: string; name: string; email: string } | null;
    manages: Array<{ id: string; name: string; email: string }>;
}

export default function FamilyDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [data, setData] = useState<FamilyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [guardianEmail, setGuardianEmail] = useState('');
    const [linking, setLinking] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (status === 'authenticated') {
            fetchFamilyData();
        }
    }, [status]);

    const fetchFamilyData = async () => {
        try {
            const res = await fetch('/api/family/guardian');
            const result = await res.json();
            if (result.success) {
                setData(result);
            }
        } catch (error) {
            console.error('Failed to fetch family data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLinkGuardian = async (e: React.FormEvent) => {
        e.preventDefault();
        setLinking(true);
        setMessage(null);
        try {
            const res = await fetch('/api/family/guardian', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ guardianEmail })
            });
            const result = await res.json();
            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                fetchFamilyData();
                setGuardianEmail('');
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to link guardian' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error linking guardian' });
        } finally {
            setLinking(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen pt-24 pb-20">
            <main className="max-w-7xl mx-auto px-6 space-y-12 relative z-10">
                {/* Header */}
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 rounded-full border border-rose-100">
                        <ShieldCheck size={12} className="text-rose-600" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600">Family Center</span>
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-5xl font-serif text-slate-900 font-bold tracking-tight">Family <span className="text-rose-600">Access</span></h1>
                        <p className="text-slate-500 text-lg font-light max-w-2xl">
                            Involve your family in your search. Link a guardian to help manage your profile and vet interested partners.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Guardian Section */}
                    <div className="lg:col-span-5">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-8"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600">
                                    <Shield size={24} />
                                </div>
                                <h2 className="text-2xl font-serif text-slate-900 font-bold">Guardian Details</h2>
                            </div>

                            {data?.managedBy ? (
                                <div className="space-y-6">
                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400">
                                                <UserIcon size={24} />
                                            </div>
                                            <div className="space-y-0.5">
                                                <h3 className="font-serif text-xl text-slate-900 font-bold">{data.managedBy.name}</h3>
                                                <p className="text-slate-500 text-xs flex items-center gap-1.5 uppercase tracking-widest font-bold">
                                                    <Mail size={12} className="text-rose-400" /> {data.managedBy.email}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-400 font-light italic bg-white/50 p-3 rounded-lg border border-slate-100">
                                            This person is authorized to assist with your profile management and communications.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        Enter the email of a family member or mentor you trust to act as your profile guardian.
                                    </p>

                                    <form onSubmit={handleLinkGuardian} className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase font-bold text-slate-400 ml-1 tracking-widest">Guardian Email</label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    required
                                                    value={guardianEmail}
                                                    onChange={e => setGuardianEmail(e.target.value)}
                                                    placeholder="elderly@family.com"
                                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl py-3.5 pl-10 pr-4 outline-none focus:border-rose-500 transition-all"
                                                />
                                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            </div>
                                        </div>

                                        <button
                                            disabled={linking}
                                            className="w-full py-4 bg-slate-900 hover:bg-rose-600 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                        >
                                            {linking ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                                            Link Guardian
                                        </button>
                                    </form>

                                    {message && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex items-center gap-2 p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}
                                        >
                                            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                            {message.text}
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Managed Profiles Section */}
                    <div className="lg:col-span-7">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm h-full flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-slate-900 rounded-xl text-white">
                                        <ScrollText size={24} />
                                    </div>
                                    <h2 className="text-2xl font-serif text-slate-900 font-bold">Managed Profiles</h2>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                                    {data?.manages?.length || 0} Total
                                </span>
                            </div>

                            {data?.manages && data.manages.length > 0 ? (
                                <div className="space-y-4">
                                    {data.manages.map((user, idx) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:border-rose-200 group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-rose-500 transition-colors">
                                                    <UserIcon size={20} />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <h3 className="font-serif text-slate-900 font-bold text-lg">{user.name}</h3>
                                                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">{user.email}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => router.push(`/family/manage/${user.id}`)}
                                                className="w-10 h-10 bg-white text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl border border-slate-200 shadow-sm transition-all flex items-center justify-center"
                                            >
                                                <ExternalLink size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center flex-1 text-center py-20 px-10 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                                    <Users size={48} className="text-slate-200 mb-4" />
                                    <div className="space-y-2">
                                        <p className="text-slate-900 font-bold">No profiles linked yet</p>
                                        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                                            Profiles you manage will appear here once someone adds you as their guardian.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}
