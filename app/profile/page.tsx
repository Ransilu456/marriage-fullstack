'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, Loader2, MapPin, Briefcase,
    Image as ImageIcon, Share2,
    BadgeCheck, Users, Sun, BookOpen, Coffee,
    Camera, Save, Edit3, User,
    SlidersHorizontal, ShieldCheck, LogOut,
    Eye, ChevronDown, Trash2, UploadCloud,
    Plus, Sparkles, ScrollText, Fingerprint, Crown,
    ArrowRight, Zap, X
} from 'lucide-react';

interface ProfileData {
    id: string;
    age: number;
    height?: number;
    dateOfBirth: string;
    gender: string;
    religion?: string;
    visibility?: string;
    bio: string;
    location: string;
    jobStatus: string;
    maritalStatus: string;
    photoUrl: string;
    coverUrl?: string;
    photoGallery?: string;
    jobCategory: string;
    contactDetails: string;
    caste?: string;
    motherTongue?: string;
    incomeRange?: string;
    education?: string;
    profession?: string;
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
    completionPercentage?: number;
    tips?: { field: string; tip: string; id: string }[];
}

interface VerificationDoc {
    id: string;
    type: string;
    status: string;
    fileUrl: string;
    createdAt: string;
}

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('edit-profile');
    const [isViewMode, setIsViewMode] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [bannerDismissed, setBannerDismissed] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [generalError, setGeneralError] = useState('');
    const [generalSuccess, setGeneralSuccess] = useState('');
    const [prevCompletion, setPrevCompletion] = useState<number | null>(null);
    const [showStrengthToast, setShowStrengthToast] = useState(false);

    const [formData, setFormData] = useState<Partial<ProfileData>>({});
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [verificationDocs, setVerificationDocs] = useState<VerificationDoc[]>([]);
    const [selectedVerifyFile, setSelectedVerifyFile] = useState<File | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (status === 'authenticated') {
            fetchProfile();
            fetchVerificationDocs();
        }
    }, [status, router]);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/profile');
            const data = await res.json();
            if (data.profile) {
                setProfile(data.profile);
                setFormData(data.profile);
                if (prevCompletion === null) {
                    setPrevCompletion(data.profile.completionPercentage || 0);
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchVerificationDocs = async () => {
        try {
            const res = await fetch('/api/verify/status');
            const data = await res.json();
            if (data.documents) {
                setVerificationDocs(data.documents);
            }
        } catch (error) {
            console.error('Error fetching verification docs:', error);
        }
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        setErrors({});
        setGeneralError('');
        setGeneralSuccess('');

        try {
            const payload = {
                ...formData,
                gender: formData.gender || 'MALE',
                jobStatus: formData.jobStatus || 'EMPLOYED',
                maritalStatus: formData.maritalStatus || 'SINGLE',
                bio: formData.bio || '',
                location: formData.location || '',
                photoUrl: formData.photoUrl || ''
            };

            const res = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                setGeneralSuccess('Profile updated successfully.');
                const newProfile = data.profile;

                // Show strength toast if completion increased
                if (prevCompletion !== null && (newProfile.completionPercentage || 0) > prevCompletion) {
                    setShowStrengthToast(true);
                    setTimeout(() => setShowStrengthToast(false), 5000);
                }

                setProfile(newProfile);
                setPrevCompletion(newProfile.completionPercentage || 0);
                setTimeout(() => setGeneralSuccess(''), 3000);
            } else {
                if (data.errors) setErrors(data.errors);
                else setGeneralError(data.error || 'Failed to update profile');
            }
        } catch (error) {
            setGeneralError('Connection error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleVerifySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        setSubmitting(true);
        setGeneralError('');

        try {
            // 1. Upload File
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData // contains 'file' input
            });
            const uploadData = await uploadRes.json();

            if (!uploadData.success || !uploadData.url) {
                throw new Error(uploadData.error || 'File upload failed');
            }

            // 2. Submit Verification Request
            const res = await fetch('/api/verify/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: formData.get('type'),
                    fileUrl: uploadData.url
                })
            });

            const data = await res.json();
            if (data.success) {
                fetchVerificationDocs();
                setGeneralSuccess('Verification document submitted.');
                form.reset();
                setSelectedVerifyFile(null);
            } else {
                setGeneralError(data.error || 'Submission failed');
            }
        } catch (error: any) {
            setGeneralError(error.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeTab, isViewMode]);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const headerOffset = 140;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'cover' | 'gallery') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        try {
            setSubmitting(true);
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: uploadFormData,
            });
            const data = await response.json();
            if (data.success) {
                if (type === 'photo') {
                    setFormData(prev => ({ ...prev, photoUrl: data.url }));
                } else if (type === 'cover') {
                    setFormData(prev => ({ ...prev, coverUrl: data.url }));
                } else if (type === 'gallery') {
                    const currentGallery = formData.photoGallery ? formData.photoGallery.split(',').filter(u => u) : [];
                    setFormData(prev => ({ ...prev, photoGallery: [...currentGallery, data.url].join(',') }));
                }
                setGeneralSuccess('Upload successful.');
                setTimeout(() => setGeneralSuccess(''), 3000);
            } else {
                setGeneralError(data.error || 'Upload failed');
            }
        } catch (error) {
            setGeneralError('Upload failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin" />
            </div>
        );
    }

    const navItems = [
        { id: 'edit-profile', label: 'My Profile', icon: User },
        { id: 'verification', label: 'Verification', icon: ShieldCheck },
        { id: 'membership', label: 'Membership', icon: Crown },
        { id: 'security', label: 'Settings', icon: SlidersHorizontal },
    ];

    const renderEditContent = () => (
        <div className="space-y-8">
            {/* Completion Tips Section */}
            {profile && profile.completionPercentage! < 100 && (
                <section id="section-tips" className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-10 text-white space-y-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-rose-500/20 transition-all duration-700" />
                    <div className="space-y-2 relative z-10">
                        <div className="flex items-center gap-2">
                            <Zap className="text-rose-500" size={20} />
                            <h3 className="font-serif text-2xl font-bold">Boost Your Profile</h3>
                        </div>
                        <p className="text-white/60 text-sm">Follow these actionable steps to increase your match potential.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                        {getProfileTips().map((tip, idx) => (
                            <motion.button
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => scrollToSection(tip.id)}
                                className="flex items-center gap-4 p-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group/tip text-left"
                            >
                                <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center border border-rose-500/30 group-hover/tip:bg-rose-500 transition-all">
                                    <ArrowRight size={18} className="text-rose-500 group-hover/tip:text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400 group-hover/tip:text-rose-300">{tip.field}</p>
                                    <p className="text-xs text-white/80 group-hover/tip:text-white font-medium">{tip.tip}</p>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </section>
            )}

            {/* Identity Basics */}
            <section id="section-basics" className="bg-white/70 backdrop-blur-sm rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/50 p-10 space-y-10 transition-all hover:shadow-rose-100/20">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-rose-500" size={18} />
                        <h3 className="font-serif text-2xl text-slate-900 font-bold">Basic Information</h3>
                    </div>
                    <p className="text-sm text-slate-400">Essential details for your matrimonial profile.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                        <input
                            type="date"
                            value={formData.dateOfBirth?.split('T')[0] || ''}
                            onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                        <div className="relative group">
                            <select
                                value={formData.gender || ''}
                                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all cursor-pointer"
                            >
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Height (cm)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={formData.height || ''}
                            onChange={e => setFormData({ ...formData, height: parseFloat(e.target.value) })}
                            placeholder="e.g., 175.5"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Religion</label>
                        <div className="relative group">
                            <select
                                value={formData.religion || ''}
                                onChange={e => setFormData({ ...formData, religion: e.target.value })}
                                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all cursor-pointer"
                            >
                                <option value="">Select Religion</option>
                                {['Buddhist', 'Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Other'].map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mother Tongue</label>
                        <input
                            type="text"
                            value={formData.motherTongue || ''}
                            onChange={e => setFormData({ ...formData, motherTongue: e.target.value })}
                            placeholder="e.g., Sinhala, Tamil, English"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Caste</label>
                        <input
                            type="text"
                            value={formData.caste || ''}
                            onChange={e => setFormData({ ...formData, caste: e.target.value })}
                            placeholder="Optional"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Profile Visibility</label>
                        <div className="relative group">
                            <select
                                value={formData.visibility || 'PUBLIC'}
                                onChange={e => setFormData({ ...formData, visibility: e.target.value })}
                                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all cursor-pointer"
                            >
                                <option value="PUBLIC">Public (Visible to All)</option>
                                <option value="PRIVATE">Private (Only I can see)</option>
                                <option value="PROTECTED">Protected (Matches only)</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Life & Vocation */}
            <section id="section-career" className="bg-white/70 backdrop-blur-sm rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/50 p-10 space-y-10 transition-all hover:shadow-rose-100/20">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Briefcase className="text-rose-500" size={18} />
                        <h3 className="font-serif text-2xl text-slate-900 font-bold">Career & About</h3>
                    </div>
                    <p className="text-sm text-slate-400">Share your professional life and personal bio.</p>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">About Me</label>
                            <textarea
                                rows={4}
                                value={formData.bio || ''}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-2xl p-4 outline-none focus:border-rose-500 transition-all resize-none"
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Details (Private)</label>
                            <textarea
                                rows={4}
                                value={formData.contactDetails || ''}
                                onChange={e => setFormData({ ...formData, contactDetails: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-2xl p-4 outline-none focus:border-rose-500 transition-all resize-none"
                                placeholder="Phone, WhatsApp, or Email for matches..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Current Location</label>
                            <input
                                type="text"
                                value={formData.location || ''}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                placeholder="City, Country"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Monthly Income</label>
                            <input
                                type="text"
                                value={formData.incomeRange || ''}
                                onChange={e => setFormData({ ...formData, incomeRange: e.target.value })}
                                placeholder="e.g., $2000 - $3000"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Job Category</label>
                            <input
                                type="text"
                                value={formData.jobCategory || ''}
                                onChange={e => setFormData({ ...formData, jobCategory: e.target.value })}
                                placeholder="Engineering, Healthcare..."
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Profession</label>
                            <input
                                type="text"
                                value={formData.profession || ''}
                                onChange={e => setFormData({ ...formData, profession: e.target.value })}
                                placeholder="e.g., Software Architect"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Lifestyle & Social */}
            <section id="section-lifestyle" className="bg-white/70 backdrop-blur-sm rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/50 p-10 space-y-10 transition-all hover:shadow-rose-100/20">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Sun className="text-rose-500" size={18} />
                        <h3 className="font-serif text-2xl text-slate-900 font-bold">Lifestyle & Social</h3>
                    </div>
                    <p className="text-sm text-slate-400">Manage your personal habits and social status.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Marital Status</label>
                        <select
                            value={formData.maritalStatus || 'SINGLE'}
                            onChange={e => setFormData({ ...formData, maritalStatus: e.target.value })}
                            className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all cursor-pointer"
                        >
                            <option value="SINGLE">Single</option>
                            <option value="DIVORCED">Divorced</option>
                            <option value="WIDOWED">Widowed</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Employment Status</label>
                        <select
                            value={formData.jobStatus || 'EMPLOYED'}
                            onChange={e => setFormData({ ...formData, jobStatus: e.target.value })}
                            className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all cursor-pointer"
                        >
                            <option value="EMPLOYED">Employed</option>
                            <option value="SELF_EMPLOYED">Self Employed</option>
                            <option value="STUDENT">Student</option>
                            <option value="UNEMPLOYED">Unemployed</option>
                            <option value="RETIRED">Retired</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Highest Education</label>
                        <input
                            type="text"
                            value={formData.education || ''}
                            onChange={e => setFormData({ ...formData, education: e.target.value })}
                            placeholder="e.g., Bachelor of Science"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Dietary Habits</label>
                        <input
                            type="text"
                            value={formData.diet || ''}
                            onChange={e => setFormData({ ...formData, diet: e.target.value })}
                            placeholder="e.g., Vegetarian, Vegan"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Smoking</label>
                        <select
                            value={formData.smoking || 'NO'}
                            onChange={e => setFormData({ ...formData, smoking: e.target.value })}
                            className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all cursor-pointer"
                        >
                            <option value="NO">No</option>
                            <option value="OCCASIONALLY">Occasionally</option>
                            <option value="YES">Yes</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Drinking</label>
                        <select
                            value={formData.drinking || 'NO'}
                            onChange={e => setFormData({ ...formData, drinking: e.target.value })}
                            className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all cursor-pointer"
                        >
                            <option value="NO">No</option>
                            <option value="OCCASIONALLY">Occasionally</option>
                            <option value="YES">Yes</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Family Heritage */}
            <section id="section-family" className="bg-white/70 backdrop-blur-sm rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/50 p-10 space-y-10 transition-all hover:shadow-rose-100/20">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Users className="text-rose-500" size={18} />
                        <h3 className="font-serif text-2xl text-slate-900 font-bold">Family Heritage</h3>
                    </div>
                    <p className="text-sm text-slate-400">Tell us about your family background.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Father's Occupation</label>
                        <input
                            type="text"
                            value={formData.fatherOccupation || ''}
                            onChange={e => setFormData({ ...formData, fatherOccupation: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mother's Occupation</label>
                        <input
                            type="text"
                            value={formData.motherOccupation || ''}
                            onChange={e => setFormData({ ...formData, motherOccupation: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Siblings</label>
                        <input
                            type="text"
                            value={formData.siblings || ''}
                            onChange={e => setFormData({ ...formData, siblings: e.target.value })}
                            placeholder="e.g., 1 Brother, 2 Sisters"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Family Type</label>
                        <select
                            value={formData.familyType || 'NUCLEAR'}
                            onChange={e => setFormData({ ...formData, familyType: e.target.value })}
                            className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all cursor-pointer"
                        >
                            <option value="NUCLEAR">Nuclear</option>
                            <option value="JOINT">Joint</option>
                            <option value="TRADITIONAL">Traditional</option>
                            <option value="MODERN">Modern</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Partner Preferences */}
            <section id="section-preferences" className="bg-white/70 backdrop-blur-sm rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/50 p-10 space-y-10 transition-all hover:shadow-rose-100/20">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Heart className="text-rose-500" size={18} />
                        <h3 className="font-serif text-2xl text-slate-900 font-bold">Partner Preferences</h3>
                    </div>
                    <p className="text-sm text-slate-400">Specify what you are looking for in a partner.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Age Range (Min - Max)</label>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="number"
                                value={formData.prefAgeMin || ''}
                                onChange={e => setFormData({ ...formData, prefAgeMin: parseInt(e.target.value) })}
                                placeholder="Min"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all"
                            />
                            <input
                                type="number"
                                value={formData.prefAgeMax || ''}
                                onChange={e => setFormData({ ...formData, prefAgeMax: parseInt(e.target.value) })}
                                placeholder="Max"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Preferred Religion</label>
                        <input
                            type="text"
                            value={formData.prefReligion || ''}
                            onChange={e => setFormData({ ...formData, prefReligion: e.target.value })}
                            placeholder="Optional"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Preferred Education</label>
                        <input
                            type="text"
                            value={formData.prefEducation || ''}
                            onChange={e => setFormData({ ...formData, prefEducation: e.target.value })}
                            placeholder="Optional"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Preferred Lifestyle</label>
                        <input
                            type="text"
                            value={formData.prefLifestyle || ''}
                            onChange={e => setFormData({ ...formData, prefLifestyle: e.target.value })}
                            placeholder="e.g., Simple, Luxury"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all"
                        />
                    </div>
                </div>
            </section>

            {/* Visuals */}
            <section id="section-visuals" className="bg-white/70 backdrop-blur-sm rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/50 p-10 space-y-10 transition-all hover:shadow-rose-100/20">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Camera className="text-rose-500" size={18} />
                        <h3 className="font-serif text-2xl text-slate-900 font-bold">Photos</h3>
                    </div>
                    <p className="text-sm text-slate-400">Upload photos to make your profile stand out.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Primary Photo */}
                    <div className="md:col-span-1 space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Main Profile Photo</label>
                        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 group hover:border-rose-300 transition-all">
                            {formData.photoUrl ? (
                                <>
                                    <img src={formData.photoUrl} className="w-full h-full object-cover" alt="Profile" />
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                                        <label className="p-3 bg-white text-slate-900 rounded-xl cursor-pointer hover:bg-rose-600 hover:text-white transition-all">
                                            <Camera size={20} />
                                            <input type="file" className="hidden" onChange={e => handleFileUpload(e, 'photo')} accept="image/*" />
                                        </label>
                                    </div>
                                </>
                            ) : (
                                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-rose-500 transition-all">
                                    <Camera size={32} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest mt-2">Upload</span>
                                    <input type="file" className="hidden" onChange={e => handleFileUpload(e, 'photo')} accept="image/*" />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Gallery */}
                    <div className="md:col-span-2 space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Photo Gallery</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {formData.photoGallery?.split(',').filter(u => u).map((url, idx) => (
                                <div key={idx} className="aspect-square rounded-xl overflow-hidden relative group border border-slate-200">
                                    <img src={url} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                                    <button
                                        onClick={() => {
                                            const gallery = formData.photoGallery!.split(',').filter((_, i) => i !== idx);
                                            setFormData(prev => ({ ...prev, photoGallery: gallery.join(',') }));
                                        }}
                                        className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-md"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                            <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-rose-300 hover:bg-rose-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-rose-500 bg-slate-50">
                                <Plus size={24} />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Add More</span>
                                <input type="file" className="hidden" onChange={e => handleFileUpload(e, 'gallery')} accept="image/*" />
                            </label>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );

    const getProfileTips = () => {
        return profile?.tips || [];
    };

    const renderStrengthToast = () => (
        <AnimatePresence>
            {showStrengthToast && (
                <motion.div
                    initial={{ opacity: 0, x: 100, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 100, scale: 0.9 }}
                    className="fixed bottom-32 right-8 z-[100] bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl border border-white/10 backdrop-blur-xl w-80 overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/30">
                                <Zap size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Profile Strength</p>
                                <p className="text-sm font-bold">Awesome! Level Up 🚀</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold">
                                <span>Completion</span>
                                <span className="text-emerald-500">{profile?.completionPercentage}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: `${prevCompletion}%` }}
                                    animate={{ width: `${profile?.completionPercentage}%` }}
                                    className="h-full bg-emerald-500 rounded-full"
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-white/60 leading-relaxed font-medium capitalize">
                            Your profile visibility has increased by {Math.round((profile?.completionPercentage || 0) - (prevCompletion || 0)) * 2}%!
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    const renderProfileCompletionBanner = () => {
        if (bannerDismissed || !profile || profile.completionPercentage! >= 100) return null;

        return (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-6 bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-white/20 transition-all duration-700" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 animate-pulse transition-all group-hover:bg-white/30">
                            <Sparkles size={28} />
                        </div>
                        <div className="space-y-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-tighter border border-white/30">Action Required</span>
                                <h3 className="text-xl font-bold font-serif italic">Complete your profile to get 10x more visibility!</h3>
                            </div>
                            <p className="text-white/80 text-sm font-medium">You are currently at <span className="font-bold underline text-white px-1">{profile.completionPercentage}%</span> completion. Stand out from the crowd.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setActiveTab('edit-profile');
                                setTimeout(() => scrollToSection('section-tips'), 100);
                            }}
                            className="px-8 py-3 bg-white text-rose-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-lg shadow-rose-900/20"
                        >
                            Complete Now
                        </motion.button>
                        <button
                            onClick={() => setBannerDismissed(true)}
                            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/20"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    };

    const renderVerificationContent = () => (
        <div className="space-y-8">
            <section className="bg-white/70 backdrop-blur-sm rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/50 p-10 space-y-10 transition-all hover:shadow-rose-100/20">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="text-rose-500" size={24} />
                        <h3 className="font-serif text-2xl text-slate-900 font-bold">Identity Verification</h3>
                    </div>
                    <p className="text-sm text-slate-400">Verify your profile to build trust and get the Verified badge.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <form onSubmit={handleVerifySubmit} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Document Type</label>
                            <select name="type" className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all">
                                <option value="ID_CARD">National ID</option>
                                <option value="PASSPORT">Passport</option>
                                <option value="DRIVING_LICENSE">License</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Upload Document</label>
                            <label className="w-full h-32 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-rose-300 hover:bg-rose-50 transition-all">
                                {selectedVerifyFile ? (
                                    <>
                                        <ImageIcon size={24} className="text-rose-500" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900 truncate max-w-[200px]">
                                            {selectedVerifyFile.name}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud size={24} className="text-slate-400" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Select File</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    name="file"
                                    className="hidden"
                                    required
                                    onChange={(e) => setSelectedVerifyFile(e.target.files?.[0] || null)}
                                />
                            </label>
                        </div>

                        <button
                            disabled={submitting}
                            className="w-full py-4 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rose-600 transition-all shadow-md flex items-center justify-center gap-2"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={16} /> : <Fingerprint size={16} />}
                            {submitting ? 'Submitting...' : 'Submit for Verification'}
                        </button>
                    </form>

                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Previous Submissions</label>
                        <div className="space-y-3">
                            {verificationDocs.length === 0 ? (
                                <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center space-y-2">
                                    <ScrollText className="text-slate-200 mx-auto" size={32} />
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">No documents found</p>
                                </div>
                            ) : (
                                verificationDocs.map((doc) => (
                                    <div key={doc.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                                <ScrollText className="text-rose-500" size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-900">{doc.type}</p>
                                                <p className="text-[10px] text-slate-400">{new Date(doc.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${doc.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' :
                                            doc.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                            }`}>
                                            {doc.status}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );

    const renderViewContent = () => {
        if (!profile) return null;
        return (
            <div className="space-y-8">
                <div className="relative aspect-[16/6] md:aspect-[16/4] rounded-3xl overflow-hidden bg-slate-900 shadow-lg">
                    <img
                        src={profile.coverUrl || 'https://images.unsplash.com/photo-1502481851512-e9e2529bbbf9?auto=format&fit=crop&w=1920&q=80'}
                        className="w-full h-full object-cover opacity-50"
                        alt="Cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />

                    <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 flex items-end gap-6 md:gap-10">
                        <div className="relative">
                            <div className="w-24 h-24 md:w-40 md:h-40 rounded-2xl md:rounded-[2.5rem] border-4 border-white shadow-xl overflow-hidden bg-white">
                                <img src={profile.photoUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80'} className="w-full h-full object-cover" alt="Profile" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-rose-500 text-white p-1.5 md:p-2.5 rounded-lg md:rounded-2xl shadow-lg border-2 border-white">
                                <BadgeCheck size={20} />
                            </div>
                        </div>
                        <div className="mb-2 md:mb-4 space-y-1">
                            <h1 className="text-2xl md:text-5xl font-serif text-white font-bold">{session?.user?.name || 'My Profile'}</h1>
                            <div className="flex items-center gap-3 text-white/70 text-[10px] md:text-sm font-medium uppercase tracking-widest">
                                <span className="flex items-center gap-1"><MapPin size={14} /> {profile.location}</span>
                                <span className="w-1 h-1 bg-white/30 rounded-full" />
                                <span className="flex items-center gap-1"><Users size={14} /> {profile.maritalStatus}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white/70 backdrop-blur-sm rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/50 p-10 md:p-14 space-y-8 transition-all hover:shadow-rose-100/20">
                            <div className="flex items-center gap-3">
                                <BookOpen className="text-rose-500" size={24} />
                                <h3 className="font-serif text-2xl text-slate-900 font-bold">About Me</h3>
                            </div>
                            <p className="text-slate-600 leading-relaxed font-light italic text-lg">
                                "{profile.bio || "Searching for a meaningful connection based on shared values."}"
                            </p>
                        </section>

                        <section className="bg-white/70 backdrop-blur-sm rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/50 p-10 md:p-14 space-y-8 transition-all hover:shadow-rose-100/20">
                            <div className="flex items-center gap-3">
                                <Users className="text-rose-500" size={24} />
                                <h3 className="font-serif text-2xl text-slate-900 font-bold">Heritage & Lifestyle</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Caste</span>
                                        <span className="text-sm font-medium text-slate-900">{profile.caste || 'Open'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mother Tongue</span>
                                        <span className="text-sm font-medium text-slate-900">{profile.motherTongue}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Diet</span>
                                        <span className="text-sm font-medium text-slate-900">{profile.diet || 'Not specified'}</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Smoking</span>
                                        <span className="text-sm font-medium text-slate-900">{profile.smoking || 'No'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Drinking</span>
                                        <span className="text-sm font-medium text-slate-900">{profile.drinking || 'No'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Education</span>
                                        <span className="text-sm font-medium text-slate-900">{profile.education || 'Not specified'}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white/70 backdrop-blur-sm rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/50 p-10 md:p-14 space-y-8 transition-all hover:shadow-rose-100/20">
                            <div className="flex items-center gap-3">
                                <Heart className="text-rose-500" size={24} />
                                <h3 className="font-serif text-2xl text-slate-900 font-bold">Partner Preferences</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Age Range</span>
                                        <span className="text-sm font-medium text-slate-900">{profile.prefAgeMin} - {profile.prefAgeMax} Years</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preferred Religion</span>
                                        <span className="text-sm font-medium text-slate-900">{profile.prefReligion || 'Any'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Min Height Pref</span>
                                        <span className="text-sm font-medium text-slate-900">{profile.prefHeightMin ? `${profile.prefHeightMin} cm` : 'Any'}</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preferred Education</span>
                                        <span className="text-sm font-medium text-slate-900">{profile.prefEducation || 'Any'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lifestyle Pref</span>
                                        <span className="text-sm font-medium text-slate-900">{profile.prefLifestyle || 'Any'}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white/70 backdrop-blur-sm rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/50 p-10 md:p-14 space-y-8 transition-all hover:shadow-rose-100/20">
                            <div className="flex items-center gap-3">
                                <Users className="text-rose-500" size={24} />
                                <h3 className="font-serif text-2xl text-slate-900 font-bold">Family Background</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Father's Occupation</span>
                                        <span className="text-sm font-medium text-slate-900">{profile.fatherOccupation || 'Not specified'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mother's Occupation</span>
                                        <span className="text-sm font-medium text-slate-900">{profile.motherOccupation || 'Not specified'}</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Siblings</span>
                                        <span className="text-sm font-medium text-slate-900">{profile.siblings || 'None'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Family Type</span>
                                        <span className="text-sm font-medium text-slate-900">{profile.familyType || 'Nuclear'}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white/70 backdrop-blur-sm rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/50 p-10 md:p-14 space-y-8 transition-all hover:shadow-rose-100/20">
                            <div className="flex items-center gap-3">
                                <ImageIcon className="text-rose-500" size={24} />
                                <h3 className="font-serif text-2xl text-slate-900 font-bold">Photo Gallery</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {profile.photoGallery?.split(',').filter(u => u).map((url, idx) => (
                                    <div key={idx} className="aspect-square rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                                        <img src={url} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-8">
                        <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white space-y-10 shadow-2xl overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-rose-500/20 transition-all duration-700" />
                            <h3 className="font-serif text-2xl font-bold">Profile Details</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                                        <Briefcase size={18} className="text-rose-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Profession</p>
                                        <p className="text-sm font-medium">{profile.jobCategory}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                                        <Sun size={18} className="text-rose-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Religion</p>
                                        <p className="text-sm font-medium">{profile.religion || 'Not specified'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                                        <Zap size={18} className="text-rose-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Height</p>
                                        <p className="text-sm font-medium">{profile.height ? `${profile.height} cm` : 'Not specified'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                                        <Coffee size={18} className="text-rose-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Marital Status</p>
                                        <p className="text-sm font-medium">{profile.maritalStatus}</p>
                                    </div>
                                </div>
                                {profile.contactDetails && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                                            <Share2 size={18} className="text-rose-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Contact Info</p>
                                            <p className="text-xs font-medium text-rose-200">{profile.contactDetails}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        <div className="bg-rose-50 rounded-3xl p-8 border border-rose-100 space-y-4">
                            <div className="flex items-center gap-3">
                                <Share2 className="text-rose-600" size={20} />
                                <h4 className="font-serif text-lg font-bold text-slate-900">Family Access</h4>
                            </div>
                            <p className="text-xs text-slate-500">Involve your family in your search for a lifelong partner.</p>
                            <button onClick={() => router.push('/family')} className="w-full py-3 bg-white text-rose-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm">Enter Family Section</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-slate-50 min-h-screen relative">
            <main className="max-w-7xl mx-auto px-6 py-12 relative z-10 md:pt-32">
                {/* Profile Completion Notification */}
                {renderProfileCompletionBanner()}

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 rounded-full border border-rose-100">
                            <Sparkles size={12} className="text-rose-600" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600">Account Sanctuary</span>
                        </div>
                        <h2 className="text-4xl font-serif text-slate-900 font-bold tracking-tight">
                            Personal <span className="text-rose-600">{isViewMode ? 'Preview' : 'Profile'}</span>
                        </h2>
                    </div>

                    <div className="bg-white p-1.5 rounded-2xl flex border border-slate-200 shadow-sm">
                        <button
                            onClick={() => setIsViewMode(false)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${!isViewMode ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            <Edit3 size={14} /> Edit
                        </button>
                        <button
                            onClick={() => setIsViewMode(true)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${isViewMode ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            <Eye size={14} /> Preview
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 lg:grid lg:grid-cols-12">
                    {/* Navigation Sidebar */}
                    <div className={`lg:col-span-3 h-full ${isViewMode ? 'hidden' : 'block'}`}>
                        <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white shadow-xl p-3 sticky top-32 space-y-4 max-h-[calc(100vh-160px)] overflow-y-auto no-scrollbar scroll-smooth">
                            <style jsx global>{`
                                .no-scrollbar::-webkit-scrollbar { display: none; }
                                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                            `}</style>
                            <nav className="space-y-1">
                                {navItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 group relative overflow-hidden ${activeTab === item.id
                                            ? 'bg-slate-900 text-white shadow-2xl scale-[1.02]'
                                            : 'text-slate-500 hover:bg-rose-50/50 hover:text-rose-600'
                                            }`}
                                    >
                                        <item.icon size={18} className={`${activeTab === item.id ? 'text-rose-400' : 'text-slate-400 group-hover:text-rose-400'} transition-colors`} />
                                        <span className="relative z-10">{item.label}</span>
                                        {activeTab === item.id && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute inset-0 bg-gradient-to-r from-rose-600/10 to-transparent pointer-events-none"
                                            />
                                        )}
                                    </button>
                                ))}
                                <div className="my-4 h-px bg-slate-100/50 mx-4" />
                                <button
                                    onClick={() => signOut()}
                                    className="w-full flex items-center gap-4 px-5 py-4 text-rose-500 hover:bg-rose-50 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all group"
                                >
                                    <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                                    Sign Out
                                </button>
                            </nav>

                            {/* Profile Completion Tips - In Sidebar */}
                            <AnimatePresence>
                                {profile && profile.completionPercentage! < 100 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-5 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl text-white shadow-lg space-y-4"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Sparkles size={16} />
                                            <h4 className="text-[10px] font-bold uppercase tracking-widest">Profile Strength</h4>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-end">
                                                <span className="text-2xl font-bold">{profile.completionPercentage}%</span>
                                                <span className="text-[8px] font-bold opacity-70 uppercase tracking-tighter">Almost there!</span>
                                            </div>
                                            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-white h-full rounded-full transition-all duration-1000"
                                                    style={{ width: `${profile.completionPercentage}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 space-y-2">
                                            <p className="text-[9px] font-medium leading-tight opacity-90">
                                                {getProfileTips()[0]?.tip || 'Complete your profile to unlock more matches!'}
                                            </p>
                                            <button
                                                onClick={() => setActiveTab('edit-profile')}
                                                className="text-[8px] font-bold uppercase tracking-widest bg-white text-rose-600 px-3 py-1.5 rounded-lg w-full hover:bg-slate-900 hover:text-white transition-all"
                                            >
                                                Improve Now
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className={`flex-1 ${isViewMode ? 'lg:col-span-12' : 'lg:col-span-9'}`}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isViewMode ? 'view' : activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                {isViewMode ? renderViewContent() : (
                                    <>
                                        {activeTab === 'edit-profile' && renderEditContent()}
                                        {activeTab === 'verification' && renderVerificationContent()}
                                        {(activeTab === 'membership' || activeTab === 'security') && (
                                            <div className="bg-white rounded-3xl p-32 text-center border border-slate-100 shadow-sm space-y-6">
                                                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
                                                    <Sparkles size={32} className="text-rose-500" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-2xl font-serif text-slate-900 font-bold">Coming Soon</h3>
                                                    <p className="text-sm text-slate-400">This section is currently under development.</p>
                                                </div>
                                                <button onClick={() => setActiveTab('edit-profile')} className="text-rose-600 font-bold text-[10px] uppercase tracking-widest hover:underline">
                                                    Back to Profile
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* Sticky Action Footer */}
            {!isViewMode && activeTab === 'edit-profile' && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-4xl bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-100 shadow-2xl flex items-center justify-between z-50">
                    <div className="flex items-center gap-4 ml-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Profile Completion</span>
                            <div className="flex items-center gap-3">
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${profile?.completionPercentage || 0}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs font-bold text-emerald-600">{profile?.completionPercentage || 0}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {generalSuccess && (
                            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">{generalSuccess}</span>
                        )}
                        <button
                            onClick={handleSubmit}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-slate-900 hover:bg-rose-600 text-white px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            )}
            {renderStrengthToast()}
        </div>
    );
}
