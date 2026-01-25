'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Briefcase, Heart, BookOpen, Ruler, Users, Utensils } from 'lucide-react';
import Image from 'next/image';

interface AdminProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: any; // Using any for flexibility, typing should be refined
}

export default function AdminProfileModal({ isOpen, onClose, profile }: AdminProfileModalProps) {
    if (!profile) return null;

    const { user, ...details } = profile;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto"
                    >
                        <div className="relative">
                            {/* Cover Image Placeholder */}
                            <div className="h-48 bg-gradient-to-r from-rose-100 to-orange-100 w-full relative">
                                {details.coverUrl && <Image src={details.coverUrl} alt="Cover" fill className="object-cover" />}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full transition-colors backdrop-blur-md text-slate-700"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="px-8 pb-8 -mt-16 relative">
                                {/* Profile Photo */}
                                <div className="w-32 h-32 rounded-2xl bg-white p-1.5 shadow-xl mb-6">
                                    <div className="w-full h-full rounded-xl overflow-hidden bg-slate-100 relative">
                                        {details.photoUrl ? (
                                            <Image src={details.photoUrl} alt={user.name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-300">
                                                {user.name?.[0]}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900">{user.name}</h2>
                                    <div className="flex items-center gap-2 text-slate-500 font-medium mt-1">
                                        <span>{details.age} years old</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><MapPin size={16} /> {details.location}</span>
                                    </div>
                                </div>

                                <div className="mt-8 grid grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">About</h3>
                                        <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            {details.bio || "No bio provided."}
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Basic Info</h3>
                                        <ul className="space-y-3">
                                            <li className="flex items-center gap-3 text-sm text-slate-700">
                                                <Ruler size={16} className="text-rose-400" />
                                                <span>{details.height ? `${details.height} cm` : 'Height not specified'}</span>
                                            </li>
                                            <li className="flex items-center gap-3 text-sm text-slate-700">
                                                <Heart size={16} className="text-rose-400" />
                                                <span>{details.maritalStatus}</span>
                                            </li>
                                            <li className="flex items-center gap-3 text-sm text-slate-700">
                                                <BookOpen size={16} className="text-rose-400" />
                                                <span>{details.religion || 'Religion not specified'}</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Career & Lifestyle</h3>
                                        <ul className="space-y-3">
                                            <li className="flex items-center gap-3 text-sm text-slate-700">
                                                <Briefcase size={16} className="text-orange-400" />
                                                <span>{details.profession || 'Profession not specified'}</span>
                                            </li>
                                            <li className="flex items-center gap-3 text-sm text-slate-700">
                                                <Briefcase size={16} className="text-orange-400" />
                                                <span>{details.education || 'Education not specified'}</span>
                                            </li>
                                            <li className="flex items-center gap-3 text-sm text-slate-700">
                                                <Utensils size={16} className="text-orange-400" />
                                                <span>{details.diet || 'Diet not specified'}</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="col-span-2 space-y-4">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Family</h3>
                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-slate-400 font-medium">Father's Job</p>
                                                <p className="text-sm text-slate-800 font-semibold">{details.fatherOccupation || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-medium">Mother's Job</p>
                                                <p className="text-sm text-slate-800 font-semibold">{details.motherOccupation || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-medium">Siblings</p>
                                                <p className="text-sm text-slate-800 font-semibold">{details.siblings || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-medium">Type</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <Users size={14} className="text-slate-400" />
                                                    <span className="text-sm text-slate-800 font-semibold">{details.familyType || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
