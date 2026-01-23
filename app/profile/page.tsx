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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState<Partial<ProfileData>>({});
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [verificationDocs, setVerificationDocs] = useState<VerificationDoc[]>([]);
    const [selectedVerifyFile, setSelectedVerifyFile] = useState<File | null>(null);

    const REQUIRED_FIELDS = [
        "bio",
        "location",
    ];

    const isFormValid = REQUIRED_FIELDS.every((field) => {
        const value = (formData as any)[field];
        return value !== undefined && value !== null && value.toString().trim() !== "";
    });

    // Verification state
    const [userVerification, setUserVerification] = useState<{
        emailVerified: string | null;
        phoneVerified: boolean;
        photoVerified: boolean;
        idVerified: boolean;
        trustScore: number;
    }>({ emailVerified: null, phoneVerified: false, photoVerified: false, idVerified: false, trustScore: 0 });

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
            // Fetch user verification status
            const userRes = await fetch('/api/user/verification-status');
            const userData = await userRes.json();
            if (userData.success) {
                setUserVerification(userData.verification);
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

    const calculateTrustScore = () => {
        let score = 0;
        if (userVerification.emailVerified) score += 20;
        if (userVerification.phoneVerified) score += 25;
        if (userVerification.photoVerified) score += 30;
        if (userVerification.idVerified) score += 25;
        return score;
    };

    const getTrustTier = (score: number) => {
        if (score >= 76) return { name: 'Premium Trust', color: 'from-amber-500 to-orange-500', icon: '💎', badge: 'Gold' };
        if (score >= 51) return { name: 'High Trust', color: 'from-emerald-500 to-teal-500', icon: '🟢', badge: 'Silver' };
        if (score >= 26) return { name: 'Medium Trust', color: 'from-amber-500 to-yellow-500', icon: '🟡', badge: 'Bronze' };
        return { name: 'Low Trust', color: 'from-slate-400 to-slate-500', icon: '🔴', badge: 'None' };
    };

    const renderVerificationContent = () => {
        const trustScore = calculateTrustScore();
        const tier = getTrustTier(trustScore);

        return (
            <div className="space-y-8">
                {/* Trust Score Header */}
                <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-10 text-white space-y-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl -mr-48 -mt-48" />

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="text-rose-500" size={28} />
                                    <h2 className="font-serif text-3xl font-bold">Trust Score</h2>
                                </div>
                                <p className="text-white/60 text-sm max-w-md">Build trust with the community by verifying your identity. Higher scores unlock premium features.</p>
                            </div>

                            {/* Trust Score Circle */}
                            <div className="relative">
                                <div className="w-32 h-32 relative">
                                    <svg className="w-32 h-32 transform -rotate-90">
                                        <circle
                                            cx="64" cy="64" r="56"
                                            stroke="rgba(255,255,255,0.1)"
                                            strokeWidth="8"
                                            fill="transparent"
                                        />
                                        <circle
                                            cx="64" cy="64" r="56"
                                            stroke="url(#gradient)"
                                            strokeWidth="8"
                                            fill="transparent"
                                            strokeDasharray={352}
                                            strokeDashoffset={352 - (352 * trustScore) / 100}
                                            strokeLinecap="round"
                                            className="transition-all duration-1000"
                                        />
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#f43f5e" />
                                                <stop offset="100%" stopColor="#fb923c" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-4xl font-bold">{trustScore}</span>
                                        <span className="text-xs text-white/60 font-medium">/ 100</span>
                                    </div>
                                </div>
                                <div className={`mt-3 px-4 py-2 bg-gradient-to-r ${tier.color} rounded-xl text-center`}>
                                    <p className="text-xs font-bold uppercase tracking-wider">{tier.icon} {tier.name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Progress Breakdown */}
                        <div className="grid grid-cols-4 gap-4">
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-white/60">Email</span>
                                    <span className="text-lg font-bold">{userVerification.emailVerified ? '20' : '0'}</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className={`h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full transition-all duration-500 ${userVerification.emailVerified ? 'w-full' : 'w-0'}`} />
                                </div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-white/60">Phone</span>
                                    <span className="text-lg font-bold">{userVerification.phoneVerified ? '25' : '0'}</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className={`h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full transition-all duration-500 ${userVerification.phoneVerified ? 'w-full' : 'w-0'}`} />
                                </div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-white/60">Photo</span>
                                    <span className="text-lg font-bold">{userVerification.photoVerified ? '30' : '0'}</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className={`h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full transition-all duration-500 ${userVerification.photoVerified ? 'w-full' : 'w-0'}`} />
                                </div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-white/60">ID</span>
                                    <span className="text-lg font-bold">{userVerification.idVerified ? '25' : '0'}</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className={`h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full transition-all duration-500 ${userVerification.idVerified ? 'w-full' : 'w-0'}`} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Verification Methods */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email Verification */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white shadow-xl p-8 space-y-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                                        <Sparkles className="text-blue-600" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-serif text-xl font-bold text-slate-900">Email Verification</h3>
                                        <p className="text-xs text-slate-400">+20 points</p>
                                    </div>
                                </div>
                            </div>
                            {userVerification.emailVerified ? (
                                <div className="px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200">
                                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">✓ Verified</span>
                                </div>
                            ) : (
                                <div className="px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-200">
                                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">⚠ Pending</span>
                                </div>
                            )}
                        </div>

                        <p className="text-sm text-slate-600 leading-relaxed">
                            Confirm your email address to ensure account security and receive important notifications.
                        </p>

                        {userVerification.emailVerified ? (
                            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                                <p className="text-xs text-emerald-700 font-medium">Verified on {new Date(userVerification.emailVerified).toLocaleDateString()}</p>
                            </div>
                        ) : (
                            <button className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-all shadow-lg shadow-blue-500/20">
                                Verify Email
                            </button>
                        )}
                    </div>

                    {/* Phone Verification */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white shadow-xl p-8 space-y-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                                        <Zap className="text-purple-600" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-serif text-xl font-bold text-slate-900">Phone Verification</h3>
                                        <p className="text-xs text-slate-400">+25 points</p>
                                    </div>
                                </div>
                            </div>
                            {userVerification.phoneVerified ? (
                                <div className="px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200">
                                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">✓ Verified</span>
                                </div>
                            ) : (
                                <div className="px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Not Started</span>
                                </div>
                            )}
                        </div>

                        <p className="text-sm text-slate-600 leading-relaxed">
                            Verify your phone number via SMS OTP for an additional layer of security.
                        </p>

                        <button
                            disabled={!userVerification.phoneVerified}
                            className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {userVerification.phoneVerified ? 'Verified' : 'Coming Soon'}
                        </button>
                    </div>

                    {/* Photo Verification */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white shadow-xl p-8 space-y-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center">
                                        <Camera className="text-rose-600" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-serif text-xl font-bold text-slate-900">Photo Verification</h3>
                                        <p className="text-xs text-slate-400">+30 points</p>
                                    </div>
                                </div>
                            </div>
                            {userVerification.photoVerified ? (
                                <div className="px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200">
                                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">✓ Verified</span>
                                </div>
                            ) : (
                                <div className="px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Not Started</span>
                                </div>
                            )}
                        </div>

                        <p className="text-sm text-slate-600 leading-relaxed">
                            Verify that your profile photo matches your identity through live selfie capture.
                        </p>

                        <button
                            disabled={!userVerification.photoVerified}
                            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-all shadow-lg shadow-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {userVerification.photoVerified ? 'Verified' : 'Coming Soon'}
                        </button>
                    </div>

                    {/* ID Verification */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white shadow-xl p-8 space-y-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                                        <Fingerprint className="text-amber-600" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-serif text-xl font-bold text-slate-900">ID Verification</h3>
                                        <p className="text-xs text-slate-400">+25 points</p>
                                    </div>
                                </div>
                            </div>
                            {userVerification.idVerified ? (
                                <div className="px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200">
                                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">✓ Verified</span>
                                </div>
                            ) : (
                                <div className="px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Not Started</span>
                                </div>
                            )}
                        </div>

                        <p className="text-sm text-slate-600 leading-relaxed">
                            Upload a government-issued ID (NIC, Passport, or Driving License) for highest trust level.
                        </p>

                        <button
                            onClick={() => setShowVerificationModal(true)}
                            className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
                        >
                            {userVerification.idVerified ? 'View Status' : 'Upload Document'}
                        </button>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-3xl border border-rose-100 p-10 space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Crown className="text-rose-600" size={24} />
                            <h3 className="font-serif text-2xl font-bold text-slate-900">Benefits of Higher Trust Score</h3>
                        </div>
                        <p className="text-sm text-slate-600">Unlock premium features as you increase your trust score</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                <BadgeCheck className="text-white" size={18} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-sm">Verified Badge</p>
                                <p className="text-xs text-slate-600">Display trust badge on your profile</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Eye className="text-white" size={18} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-sm">Increased Visibility</p>
                                <p className="text-xs text-slate-600">Featured in search results</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Users className="text-white" size={18} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-sm">More Matches</p>
                                <p className="text-xs text-slate-600">Higher priority in recommendations</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-rose-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Heart className="text-white" size={18} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-sm">Unlimited Proposals</p>
                                <p className="text-xs text-slate-600">Send unlimited interest requests</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ID Upload Modal */}
                <AnimatePresence>
                    {showVerificationModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowVerificationModal(false)}
                                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                            />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-white w-full max-w-2xl rounded-3xl p-10 shadow-2xl space-y-8 overflow-hidden border border-slate-100"
                            >
                                <button
                                    onClick={() => setShowVerificationModal(false)}
                                    className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X size={24} />
                                </button>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center">
                                            <Fingerprint className="text-amber-600" size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-serif text-slate-900 font-bold">ID Verification</h3>
                                            <p className="text-sm text-slate-400">Upload your government-issued ID</p>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleVerifySubmit} className="space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Document Type</label>
                                        <select name="type" className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all">
                                            <option value="ID_CARD">National ID Card (NIC)</option>
                                            <option value="PASSPORT">Passport</option>
                                            <option value="DRIVING_LICENSE">Driving License</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Upload Document</label>
                                        <label className="w-full h-40 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-rose-300 hover:bg-rose-50 transition-all">
                                            {selectedVerifyFile ? (
                                                <>
                                                    <ImageIcon size={32} className="text-rose-500" />
                                                    <span className="text-sm font-bold text-slate-900 truncate max-w-[300px] px-4">
                                                        {selectedVerifyFile.name}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <UploadCloud size={32} className="text-slate-400" />
                                                    <span className="text-sm font-bold text-slate-400">Click to select file</span>
                                                    <span className="text-xs text-slate-400">PNG, JPG or PDF (max 5MB)</span>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                name="file"
                                                className="hidden"
                                                required
                                                accept="image/*,application/pdf"
                                                onChange={(e) => setSelectedVerifyFile(e.target.files?.[0] || null)}
                                            />
                                        </label>
                                    </div>

                                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                        <p className="text-xs text-blue-700 font-medium leading-relaxed">
                                            <strong>Privacy Notice:</strong> Your documents are encrypted and stored securely. They will only be reviewed by our verification team and never shared publicly.
                                        </p>
                                    </div>

                                    <button
                                        disabled={submitting}
                                        className="w-full py-4 bg-slate-900 text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" size={18} /> : <Fingerprint size={18} />}
                                        {submitting ? 'Submitting...' : 'Submit for Verification'}
                                    </button>
                                </form>

                                {/* Previous Submissions */}
                                {verificationDocs.length > 0 && (
                                    <div className="space-y-4 pt-6 border-t border-slate-100">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Previous Submissions</label>
                                        <div className="space-y-3 max-h-48 overflow-y-auto">
                                            {verificationDocs.map((doc) => (
                                                <div key={doc.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                                            <ScrollText className="text-rose-500" size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-900">{doc.type.replace('_', ' ')}</p>
                                                            <p className="text-[10px] text-slate-400">{new Date(doc.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${doc.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' :
                                                        doc.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                                        }`}>
                                                        {doc.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        setGeneralError('');

        try {
            const res = await fetch('/api/user/account', {
                method: 'DELETE',
            });

            const data = await res.json();

            if (res.ok) {
                // Clear localStorage and sign out
                localStorage.clear();
                await signOut({ callbackUrl: '/' });
            } else {
                setGeneralError(data.error || 'Failed to delete account');
                setShowDeleteModal(false);
            }
        } catch (error) {
            setGeneralError('Connection error');
            setShowDeleteModal(false);
        } finally {
            setIsDeleting(false);
        }
    };

    const renderSecurityContent = () => {
        return (
            <div className="space-y-8">
                {/* Delete Account Section */}
                <section className="bg-white/70 backdrop-blur-sm rounded-[2.5rem] border border-rose-200 shadow-2xl shadow-rose-100/50 p-10 space-y-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Trash2 className="text-rose-500" size={18} />
                            <h3 className="font-serif text-2xl text-slate-900 font-bold">Delete Account</h3>
                        </div>
                        <p className="text-sm text-slate-400">Permanently remove your account and all associated data</p>
                    </div>

                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <X className="text-rose-600" size={20} />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-sm font-bold text-rose-900">Warning: This action cannot be undone</h4>
                                <ul className="text-xs text-rose-700 space-y-1 list-disc list-inside">
                                    <li>Your profile and all personal information will be permanently deleted</li>
                                    <li>All your interests, matches, and messages will be removed</li>
                                    <li>Your verification documents will be deleted from our servers</li>
                                    <li>You will need to create a new account to use the platform again</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg"
                    >
                        <Trash2 size={16} />
                        Delete My Account
                    </button>
                </section>

                {/* Delete Confirmation Modal */}
                <AnimatePresence>
                    {showDeleteModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => !isDeleting && setShowDeleteModal(false)}
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                            />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl space-y-6 border border-slate-100"
                            >
                                <div className="space-y-2">
                                    <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto">
                                        <Trash2 className="text-rose-600" size={28} />
                                    </div>
                                    <h3 className="text-2xl font-serif text-slate-900 font-bold text-center">Delete Account?</h3>
                                    <p className="text-sm text-slate-500 text-center">
                                        Are you absolutely sure? This action is permanent and cannot be reversed.
                                    </p>
                                </div>

                                {generalError && (
                                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                                        <p className="text-xs text-rose-600 font-medium">{generalError}</p>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        disabled={isDeleting}
                                        className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={isDeleting}
                                        className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <Loader2 className="animate-spin" size={16} />
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 size={16} />
                                                Yes, Delete
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

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
                                    onClick={() => {
                                        localStorage.clear();
                                        signOut();
                                    }}
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
                                        {activeTab === 'membership' && (
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
                                        {activeTab === 'security' && renderSecurityContent()}
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
                            disabled={isSaving || !isFormValid}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg
    ${isSaving || !isFormValid
                                    ? "bg-gray-400 cursor-not-allowed opacity-50"
                                    : "bg-slate-900 hover:bg-rose-600 text-white"
                                }
  `}
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                        {!isFormValid && (
                            <p className="text-[10px] text-red-500 font-semibold uppercase tracking-widest">
                                Please fill all required fields
                            </p>
                        )}

                    </div>
                </div>
            )}
            {renderStrengthToast()}
        </div>
    );
}
