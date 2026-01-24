'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, Sparkles, MessageCircle } from 'lucide-react';
import Image from 'next/image';

interface MatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    partnerName: string;
    partnerImage?: string;
    myImage?: string;
}

export function MatchModal({ isOpen, onClose, partnerName, partnerImage, myImage }: MatchModalProps) {
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
                                className="absolute top-1/2 left-1/2 text-saffron-400 opacity-40 text-2xl"
                            >
                                {i % 2 === 0 ? '✨' : '💖'}
                            </motion.div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="inline-flex items-center gap-2 px-6 py-2 bg-saffron-500 rounded-full border border-saffron-400 mb-4"
                        >
                            <Sparkles size={16} className="text-white" />
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-white">Divine Resonance</span>
                        </motion.div>
                        <h2 className="text-7xl font-serif text-white font-bold tracking-tighter drop-shadow-2xl">
                            Soul's <span className="italic text-saffron-400">Harmony</span>
                        </h2>
                    </div>

                    <div className="flex justify-center items-center gap-6 relative">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-px bg-gradient-to-r from-transparent via-saffron-500/50 to-transparent blur-sm" />

                        <motion.div
                            initial={{ x: -60, opacity: 0, rotate: -15 }}
                            animate={{ x: 0, opacity: 1, rotate: 0 }}
                            className="relative z-10"
                        >
                            <div className="w-32 h-32 rounded-[2.5rem] border-[6px] border-white shadow-2xl overflow-hidden bg-slate-100 transform -rotate-3 relative">
                                {myImage ? (
                                    <Image src={myImage} alt="Me" fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-50 text-slate-300">🫵</div>
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.5, 1] }}
                            transition={{ delay: 0.5 }}
                            className="relative z-20 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl"
                        >
                            <Heart className="text-saffron-500 fill-saffron-500 animate-pulse" size={32} />
                        </motion.div>

                        <motion.div
                            initial={{ x: 60, opacity: 0, rotate: 15 }}
                            animate={{ x: 0, opacity: 1, rotate: 0 }}
                            className="relative z-10"
                        >
                            <div className="w-32 h-32 rounded-[2.5rem] border-[6px] border-white shadow-2xl overflow-hidden bg-slate-100 transform rotate-3 relative">
                                {partnerImage ? (
                                    <Image src={partnerImage} alt={partnerName} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-50 text-slate-300">👤</div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    <p className="text-white/80 text-xl font-light italic max-w-sm mx-auto">
                        Your path has converged with <span className="text-saffron-400 font-bold">{partnerName}</span>. A new journey begins here.
                    </p>

                    <div className="flex flex-col gap-4 max-w-xs mx-auto pt-6">
                        <button
                            onClick={() => {
                                onClose();
                                router.push('/chat');
                            }}
                            className="w-full py-5 bg-saffron-500 hover:bg-saffron-600 text-white font-black uppercase tracking-[0.25em] text-[11px] rounded-2xl shadow-2xl shadow-saffron-500/30 flex items-center justify-center gap-3 active:scale-95 transition-all"
                        >
                            <MessageCircle size={18} /> Initiate Echo
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] transition-all border border-white/5"
                        >
                            Continue Seeking
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
