'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Heart, Briefcase, Users, ArrowRight,
    Check, ChevronRight, ChevronLeft, Sparkles,
    Calendar, Ruler, MapPin, UploadCloud, Crown
} from 'lucide-react';

const STEPS = [
    { id: 'personal', title: 'Personal Details', icon: User, description: 'Basic info about you' },
    { id: 'lifestyle', title: 'Lifestyle & Profession', icon: Briefcase, description: 'Your career and habits' },
    { id: 'family', title: 'Family Background', icon: Users, description: 'Your heritage' },
    { id: 'preferences', title: 'Partner Preferences', icon: Heart, description: 'Who are you looking for?' }
];

export default function CreateProfilePage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        // Personal
        dateOfBirth: '',
        gender: '',
        height: '',
        religion: '',
        caste: '',
        motherTongue: '',
        bio: '',
        location: '',

        // Lifestyle
        jobStatus: 'EMPLOYED',
        maritalStatus: 'SINGLE',
        education: '',
        profession: '',
        incomeRange: '',
        diet: '',
        smoking: 'No',
        drinking: 'No',

        // Family
        fatherOccupation: '',
        motherOccupation: '',
        siblings: '',
        familyType: 'TRADITIONAL',

        // Preferences
        prefAgeMin: '18',
        prefAgeMax: '50',
        prefHeightMin: '',
        prefReligion: '',
        prefEducation: '',
        prefLifestyle: '',

        // Media
        photoUrl: '',
        coverUrl: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentStep < STEPS.length - 1) {
            handleNext();
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    height: formData.height ? parseFloat(formData.height) : undefined,
                    prefAgeMin: parseInt(formData.prefAgeMin),
                    prefAgeMax: parseInt(formData.prefAgeMax),
                    prefHeightMin: formData.prefHeightMin ? parseFloat(formData.prefHeightMin) : undefined,
                }),
            });

            if (res.ok) {
                router.push('/discover');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to create profile');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                                <input type="date" required value={formData.dateOfBirth} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all font-medium" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                                <select required value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all font-medium appearance-none cursor-pointer">
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Height (cm)</label>
                                <input type="number" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all font-medium" placeholder="e.g. 175" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Religion</label>
                                <input type="text" value={formData.religion} onChange={e => setFormData({ ...formData, religion: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all font-medium" placeholder="e.g. Buddhist" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Caste</label>
                                <input type="text" value={formData.caste} onChange={e => setFormData({ ...formData, caste: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all font-medium" placeholder="Optional" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mother Tongue</label>
                                <input type="text" value={formData.motherTongue} onChange={e => setFormData({ ...formData, motherTongue: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all font-medium" placeholder="e.g. Sinhala" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Current Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type="text" required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 pl-10 outline-none focus:border-rose-500 transition-all font-medium" placeholder="City, Country" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">About Me</label>
                            <textarea rows={4} required minLength={20} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all font-medium resize-none" placeholder="Write a short bio about yourself..." />
                            <p className="text-[10px] text-slate-400 text-right">Minimum 20 characters</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Profile Photo URL</label>
                            <div className="relative">
                                <UploadCloud className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type="url" required value={formData.photoUrl} onChange={e => setFormData({ ...formData, photoUrl: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 pl-10 outline-none focus:border-rose-500 transition-all font-medium" placeholder="https://example.com/photo.jpg" />
                            </div>
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Job Status</label>
                                <select value={formData.jobStatus} onChange={e => setFormData({ ...formData, jobStatus: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all font-medium cursor-pointer">
                                    <option value="EMPLOYED">Employed</option>
                                    <option value="UNEMPLOYED">Unemployed</option>
                                    <option value="SELF_EMPLOYED">Self-Employed</option>
                                    <option value="STUDENT">Student</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Marital Status</label>
                                <select value={formData.maritalStatus} onChange={e => setFormData({ ...formData, maritalStatus: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all font-medium cursor-pointer">
                                    <option value="SINGLE">Single</option>
                                    <option value="DIVORCED">Divorced</option>
                                    <option value="WIDOWED">Widowed</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Highest Education</label>
                                <input type="text" value={formData.education} onChange={e => setFormData({ ...formData, education: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all font-medium" placeholder="e.g. BSc in Engineering" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Profession</label>
                                <input type="text" value={formData.profession} onChange={e => setFormData({ ...formData, profession: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all font-medium" placeholder="e.g. Software Engineer" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Annual Income Range</label>
                            <select value={formData.incomeRange} onChange={e => setFormData({ ...formData, incomeRange: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all font-medium cursor-pointer">
                                <option value="">Select Range</option>
                                <option value="0-5L">0 - 5 Lakhs</option>
                                <option value="5-10L">5 - 10 Lakhs</option>
                                <option value="10-20L">10 - 20 Lakhs</option>
                                <option value="20-50L">20 - 50 Lakhs</option>
                                <option value="50L+">50 Lakhs+</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Diet</label>
                                <input type="text" value={formData.diet} onChange={e => setFormData({ ...formData, diet: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all font-medium" placeholder="e.g. Veg" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Smoking</label>
                                <select value={formData.smoking} onChange={e => setFormData({ ...formData, smoking: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all font-medium cursor-pointer">
                                    <option value="No">No</option>
                                    <option value="Occasionally">Occasionally</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Drinking</label>
                                <select value={formData.drinking} onChange={e => setFormData({ ...formData, drinking: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all font-medium cursor-pointer">
                                    <option value="No">No</option>
                                    <option value="Occasionally">Occasionally</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Father's Occupation</label>
                                <input type="text" value={formData.fatherOccupation} onChange={e => setFormData({ ...formData, fatherOccupation: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all font-medium" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mother's Occupation</label>
                                <input type="text" value={formData.motherOccupation} onChange={e => setFormData({ ...formData, motherOccupation: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all font-medium" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Siblings Details</label>
                            <input type="text" value={formData.siblings} onChange={e => setFormData({ ...formData, siblings: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all font-medium" placeholder="e.g., 1 brother, 1 sister" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Family Type</label>
                            <select value={formData.familyType} onChange={e => setFormData({ ...formData, familyType: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all font-medium cursor-pointer">
                                <option value="TRADITIONAL">Traditional</option>
                                <option value="MODERN">Modern</option>
                                <option value="JOINT">Joint Family</option>
                                <option value="NUCLEAR">Nuclear Family</option>
                            </select>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-xl border border-rose-100">
                            <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
                                <Heart size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">Partner Preference</h4>
                                <p className="text-xs text-slate-500">Who are you looking for?</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Min Age</label>
                                <input type="number" value={formData.prefAgeMin} onChange={e => setFormData({ ...formData, prefAgeMin: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all font-medium" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Max Age</label>
                                <input type="number" value={formData.prefAgeMax} onChange={e => setFormData({ ...formData, prefAgeMax: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all font-medium" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Preferred Religion</label>
                            <input type="text" value={formData.prefReligion} onChange={e => setFormData({ ...formData, prefReligion: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all font-medium" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Preferred Education</label>
                            <input type="text" value={formData.prefEducation} onChange={e => setFormData({ ...formData, prefEducation: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all font-medium" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Min Height (cm)</label>
                                <input type="number" value={formData.prefHeightMin} onChange={e => setFormData({ ...formData, prefHeightMin: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all font-medium" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Preferred Lifestyle</label>
                                <input type="text" value={formData.prefLifestyle} onChange={e => setFormData({ ...formData, prefLifestyle: e.target.value })} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-rose-500 transition-all font-medium" placeholder="e.g. Vegetarian" />
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-500/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

            <div className="max-w-3xl mx-auto relative z-10">
                {/* Header */}
                <div className="mb-10 text-center space-y-3">
                    <h1 className="font-serif text-4xl text-slate-900 font-bold">Create Your Profile</h1>
                    <p className="text-slate-500 text-lg">Tell us about yourself to find your perfect match.</p>
                </div>

                {/* Main Card */}
                <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-6 md:p-10 border border-white">

                    {/* Progress Steps */}
                    <div className="mb-10">
                        <div className="flex justify-between relative">
                            {/* Connector Line */}
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full -z-10" />
                            <div
                                className="absolute top-1/2 left-0 h-1 bg-rose-500 -translate-y-1/2 rounded-full transition-all duration-500 -z-10"
                                style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                            />

                            {STEPS.map((step, idx) => {
                                const Icon = step.icon;
                                const isActive = idx <= currentStep;
                                const isCurrent = idx === currentStep;
                                return (
                                    <div key={step.id} className="flex flex-col items-center gap-2">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-white text-slate-300 border border-slate-100'
                                            }`}>
                                            <Icon size={18} />
                                        </div>
                                        <div className={`hidden md:block text-xs font-bold uppercase tracking-wider transition-colors ${isCurrent ? 'text-rose-600' : 'text-slate-300'}`}>
                                            {step.title.split(' ')[0]}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500">
                                {currentStep + 1}
                            </span>
                            {STEPS[currentStep].title}
                        </h2>
                        <p className="text-slate-400 text-sm ml-11">{STEPS[currentStep].description}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="min-h-[400px]"
                            >
                                {renderStep()}
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex justify-between items-center pt-8 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={handleBack}
                                disabled={currentStep === 0}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${currentStep === 0
                                        ? 'opacity-0 pointer-events-none'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <ChevronLeft size={16} />
                                Back
                            </button>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-xl hover:bg-rose-500 hover:shadow-rose-500/30 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 group"
                            >
                                {submitting ? (
                                    'Processing...'
                                ) : currentStep === STEPS.length - 1 ? (
                                    <>Complete Profile <Check size={16} /></>
                                ) : (
                                    <>Next Step <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
