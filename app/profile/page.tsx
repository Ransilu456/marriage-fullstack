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
    ArrowRight
} from 'lucide-react';

interface ProfileData {
    id: string;
    age: number;
    dateOfBirth: string;
    gender: string;
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
    prefHeightMin?: number;
    prefLifestyle?: string;
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
    const [isSaving, setIsSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [generalError, setGeneralError] = useState('');
    const [generalSuccess, setGeneralSuccess] = useState('');

    const [formData, setFormData] = useState<Partial<ProfileData>>({});
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [verificationDocs, setVerificationDocs] = useState<VerificationDoc[]>([]);

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
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchVerificationDocs = async () => {
        try {
            const res = await fetch('/api/admin/verify');
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
            const res = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setGeneralSuccess('Profile updated successfully.');
                setProfile(data.profile);
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
        const docForm = new FormData(e.currentTarget);
        setSubmitting(true);
        try {
            const res = await fetch('/api/admin/verify', {
                method: 'POST',
                body: docForm
            });
            const data = await res.json();
            if (data.success) {
                fetchVerificationDocs();
                setGeneralSuccess('Verification document submitted.');
            } else {
                setGeneralError(data.error || 'Submission failed');
            }
        } catch (error) {
            setGeneralError('Submission failed');
        } finally {
            setSubmitting(false);
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
            {/* Identity Basics */}
            <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-8">
                <div className="space-y-1">
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
                                value={formData.gender}
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
                </div>
            </section>

            {/* Life & Vocation */}
            <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Briefcase className="text-rose-500" size={18} />
                        <h3 className="font-serif text-2xl text-slate-900 font-bold">Career & About</h3>
                    </div>
                    <p className="text-sm text-slate-400">Share your professional life and personal bio.</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">About Me</label>
                        <textarea
                            rows={4}
                            value={formData.bio}
                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-2xl p-4 outline-none focus:border-rose-500 transition-all resize-none"
                            placeholder="Tell us about yourself..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Current Location</label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                placeholder="City, Country"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Profession</label>
                            <input
                                type="text"
                                value={formData.jobCategory}
                                onChange={e => setFormData({ ...formData, jobCategory: e.target.value })}
                                placeholder="Software Engineer, Doctor, etc."
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Visuals */}
            <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-8">
                <div className="space-y-1">
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

    const renderVerificationContent = () => (
        <div className="space-y-8">
            <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-8">
                <div className="space-y-1">
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
                                <UploadCloud size={24} className="text-slate-400" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Select File</span>
                                <input type="file" name="file" className="hidden" required />
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
                        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 md:p-12 space-y-6">
                            <div className="flex items-center gap-3">
                                <BookOpen className="text-rose-500" size={24} />
                                <h3 className="font-serif text-2xl text-slate-900 font-bold">About Me</h3>
                            </div>
                            <p className="text-slate-600 leading-relaxed font-light italic text-lg">
                                "{profile.bio || "Searching for a meaningful connection based on shared values."}"
                            </p>
                        </section>

                        <section className="space-y-4">
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

                    <div className="space-y-6">
                        <section className="bg-slate-900 rounded-3xl p-8 text-white space-y-6 shadow-xl">
                            <h3 className="font-serif text-xl font-bold">Profile Details</h3>
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
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Heritage</p>
                                        <p className="text-sm font-medium">{profile.motherTongue || 'Not specified'}</p>
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
        <div className="bg-slate-50 min-h-screen relative overflow-hidden">
            <main className="max-w-7xl mx-auto px-6 py-12 relative z-10 md:pt-32">
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

                <div className="flex flex-col lg:row gap-12 lg:grid lg:grid-cols-12">
                    {/* Navigation Sidebar */}
                    <div className={`lg:col-span-3 ${isViewMode ? 'hidden' : 'block'}`}>
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-3 sticky top-32">
                            <nav className="space-y-1">
                                {navItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all group ${activeTab === item.id
                                            ? 'bg-slate-900 text-white shadow-lg'
                                            : 'text-slate-400 hover:bg-rose-50 hover:text-rose-600'
                                            }`}
                                    >
                                        <item.icon size={18} className={activeTab === item.id ? 'text-rose-400' : 'text-slate-300 group-hover:text-rose-400'} />
                                        {item.label}
                                    </button>
                                ))}
                                <div className="my-4 h-px bg-slate-100 mx-4" />
                                <button
                                    onClick={() => signOut()}
                                    className="w-full flex items-center gap-4 px-5 py-4 text-rose-500 hover:bg-rose-50 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all"
                                >
                                    <LogOut size={18} />
                                    Sign Out
                                </button>
                            </nav>
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
                                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85%' }}></div>
                                </div>
                                <span className="text-xs font-bold text-emerald-600">85%</span>
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
        </div>
    );
}
