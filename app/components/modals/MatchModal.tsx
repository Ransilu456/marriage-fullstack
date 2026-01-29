'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface MatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    partnerName: string;
    partnerImage?: string;
    myImage?: string;
    partnerId?: string;
}

export function MatchModal({ isOpen, onClose, partnerName, partnerImage, myImage, partnerId }: MatchModalProps) {
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 50 }}
                    transition={{ type: "spring", bounce: 0.4 }}
                    className="relative w-full max-w-lg text-center space-y-10"
                >
                    {/* Celebration Particles */}
                    <div className="absolute inset-0 -z-10 pointer-events-none">
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0, x: 0, y: 0 }}
                                animate={{
                                    scale: [0, 1, 0],
                                    x: (Math.random() - 0.5) * 400,
                                    y: (Math.random() - 0.5) * 400,
                                    rotate: Math.random() * 360
                                }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                                className="absolute top-1/2 left-1/2 text-rose-400 opacity-40 text-2xl"
                            >
                                {i % 2 === 0 ? '✨' : '❤️'}
                            </motion.div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-rose-500 to-orange-500 rounded-full shadow-lg shadow-rose-500/30 mb-4"
                        >
                            <Sparkles size={16} className="text-white" />
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white">New Match</span>
                        </motion.div>
                        <h2 className="text-6xl font-serif text-white font-bold tracking-tight drop-shadow-2xl">
                            It's a <span className="text-rose-500 italic">Match!</span>
                        </h2>
                    </div>

                    <div className="flex justify-center items-center gap-6 relative">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent blur-sm" />

                        <motion.div
                            initial={{ x: -60, opacity: 0, rotate: -15 }}
                            animate={{ x: 0, opacity: 1, rotate: 0 }}
                            className="relative z-10"
                        >
                            <div className="w-28 h-28 rounded-3xl border-4 border-white shadow-2xl overflow-hidden bg-slate-100 transform -rotate-3 relative">
                                {myImage ? (
                                    <Image src={myImage} alt="Me" fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-50 text-slate-300">
                                        <div className="w-full h-full bg-slate-200 animate-pulse" />
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.5, 1] }}
                            transition={{ delay: 0.5 }}
                            className="relative z-20 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl shadow-rose-500/20"
                        >
                            <Heart className="text-rose-500 fill-rose-500 animate-pulse" size={32} />
                        </motion.div>

                        <motion.div
                            initial={{ x: 60, opacity: 0, rotate: 15 }}
                            animate={{ x: 0, opacity: 1, rotate: 0 }}
                            className="relative z-10"
                        >
                            <div className="w-28 h-28 rounded-3xl border-4 border-white shadow-2xl overflow-hidden bg-slate-100 transform rotate-3 relative">
                                {partnerImage ? (
                                    <Image src={partnerImage} alt={partnerName} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-50 text-slate-300">
                                        <div className="w-full h-full bg-slate-200 animate-pulse" />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    <p className="text-white/80 text-lg font-medium max-w-sm mx-auto leading-relaxed">
                        You and <span className="text-white font-bold">{partnerName}</span> have liked each other. You can now start a conversation!
                    </p>

                    <div className="flex flex-col gap-3 max-w-xs mx-auto pt-4">
                        <button
                            onClick={() => {
                                onClose();
                                if (partnerId) {
                                    router.push(`/chat/${partnerId}`);
                                } else {
                                    router.push('/messages'); // Fallback
                                }
                            }}
                            className="w-full py-4 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-xl shadow-rose-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                            <MessageCircle size={18} />
                            <span>Send Message</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl transition-all border border-white/10"
                        >
                            Keep Browsing
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
