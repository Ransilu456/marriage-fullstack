'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera, Upload, CheckCircle, XCircle, AlertCircle,
    ArrowRight, ArrowLeft, Loader2, Image as ImageIcon
} from 'lucide-react';

interface VerificationStatus {
    status: 'NOT_STARTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
    hasProfilePhoto: boolean;
    hasSelfie: boolean;
    documentUrl?: string;
    selfieUrl?: string;
    notes?: string;
    message?: string;
}

export default function PhotoVerificationPage() {
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
    const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
    const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>('');
    const [selfiePhoto, setSelfiePhoto] = useState<File | null>(null);
    const [selfiePhotoPreview, setSelfiePhotoPreview] = useState<string>('');
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        if (sessionStatus === 'unauthenticated') {
            router.push('/auth/login');
        } else if (sessionStatus === 'authenticated') {
            fetchVerificationStatus();
        }
    }, [sessionStatus, router]);

    const fetchVerificationStatus = async () => {
        try {
            const res = await fetch('/api/verify/photo/status');
            if (res.ok) {
                const data = await res.json();
                setVerificationStatus(data);

                if (data.status === 'PENDING' && data.hasSelfie) {
                    setStep(3); // Show pending status
                } else if (data.hasProfilePhoto && !data.hasSelfie) {
                    setStep(2); // Go to selfie step
                }
            }
        } catch (error) {
            console.error('Failed to fetch verification status:', error);
        }
    };

    const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }
            setProfilePhoto(file);
            setProfilePhotoPreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const uploadProfilePhoto = async () => {
        if (!profilePhoto) return;

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('photo', profilePhoto);

            const res = await fetch('/api/verify/photo/upload', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess('Profile photo uploaded successfully!');
                setStep(2);
                await fetchVerificationStatus();
            } else {
                setError(data.error || 'Failed to upload photo');
            }
        } catch (error) {
            setError('Failed to upload photo');
        } finally {
            setLoading(false);
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setIsCameraActive(true);
            }
        } catch (error) {
            setError('Failed to access camera. Please allow camera permissions.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraActive(false);
    };

    const captureSelfie = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
                        setSelfiePhoto(file);
                        setSelfiePhotoPreview(URL.createObjectURL(file));
                        stopCamera();
                    }
                }, 'image/jpeg');
            }
        }
    };

    const uploadSelfie = async () => {
        if (!selfiePhoto) return;

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('selfie', selfiePhoto);

            const res = await fetch('/api/verify/photo/selfie', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess('Verification submitted! An admin will review it shortly.');
                setStep(3);
                await fetchVerificationStatus();
            } else {
                setError(data.error || 'Failed to upload selfie');
            }
        } catch (error) {
            setError('Failed to upload selfie');
        } finally {
            setLoading(false);
        }
    };

    if (sessionStatus === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-24 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">
                        Photo Verification
                    </h1>
                    <p className="text-slate-600">
                        Verify your identity to increase your trust score by 30 points
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-12">
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-rose-600' : 'text-slate-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-rose-600 text-white' : 'bg-slate-200'}`}>
                                1
                            </div>
                            <span className="font-medium hidden sm:inline">Upload Photo</span>
                        </div>
                        <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-rose-600' : 'bg-slate-200'}`} />
                        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-rose-600' : 'text-slate-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-rose-600 text-white' : 'bg-slate-200'}`}>
                                2
                            </div>
                            <span className="font-medium hidden sm:inline">Take Selfie</span>
                        </div>
                        <div className={`w-12 h-0.5 ${step >= 3 ? 'bg-rose-600' : 'bg-slate-200'}`} />
                        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-rose-600' : 'text-slate-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-rose-600 text-white' : 'bg-slate-200'}`}>
                                3
                            </div>
                            <span className="font-medium hidden sm:inline">Review</span>
                        </div>
                    </div>
                </div>

                {/* Error/Success Messages */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700"
                        >
                            <XCircle size={20} />
                            <span>{error}</span>
                        </motion.div>
                    )}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700"
                        >
                            <CheckCircle size={20} />
                            <span>{success}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Step Content */}
                <div className="bg-white rounded-3xl shadow-xl p-8">
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <ImageIcon className="w-16 h-16 mx-auto text-rose-600 mb-4" />
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload Profile Photo</h2>
                                <p className="text-slate-600">Choose a clear photo of your face</p>
                            </div>

                            {profilePhotoPreview ? (
                                <div className="space-y-4">
                                    <img
                                        src={profilePhotoPreview}
                                        alt="Profile preview"
                                        className="w-64 h-64 object-cover rounded-2xl mx-auto border-4 border-rose-100"
                                    />
                                    <div className="flex gap-3 justify-center">
                                        <button
                                            onClick={() => {
                                                setProfilePhoto(null);
                                                setProfilePhotoPreview('');
                                            }}
                                            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all"
                                        >
                                            Choose Different Photo
                                        </button>
                                        <button
                                            onClick={uploadProfilePhoto}
                                            disabled={loading}
                                            className="px-6 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-all flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
                                            {!loading && <ArrowRight size={20} />}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label className="block cursor-pointer">
                                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:border-rose-500 transition-all">
                                        <Upload className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                                        <p className="text-slate-600 mb-2">Click to upload or drag and drop</p>
                                        <p className="text-sm text-slate-400">JPG or PNG (max 5MB)</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png"
                                        onChange={handleProfilePhotoChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <Camera className="w-16 h-16 mx-auto text-rose-600 mb-4" />
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Take Verification Selfie</h2>
                                <p className="text-slate-600">Take a live selfie to verify your identity</p>
                            </div>

                            {selfiePhotoPreview ? (
                                <div className="space-y-4">
                                    <img
                                        src={selfiePhotoPreview}
                                        alt="Selfie preview"
                                        className="w-64 h-64 object-cover rounded-2xl mx-auto border-4 border-rose-100"
                                    />
                                    <div className="flex gap-3 justify-center">
                                        <button
                                            onClick={() => {
                                                setSelfiePhoto(null);
                                                setSelfiePhotoPreview('');
                                            }}
                                            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all flex items-center gap-2"
                                        >
                                            <ArrowLeft size={20} />
                                            Retake
                                        </button>
                                        <button
                                            onClick={uploadSelfie}
                                            disabled={loading}
                                            className="px-6 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-all flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit for Review'}
                                            {!loading && <ArrowRight size={20} />}
                                        </button>
                                    </div>
                                </div>
                            ) : isCameraActive ? (
                                <div className="space-y-4">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        className="w-full max-w-md mx-auto rounded-2xl"
                                    />
                                    <canvas ref={canvasRef} className="hidden" />
                                    <div className="flex gap-3 justify-center">
                                        <button
                                            onClick={stopCamera}
                                            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={captureSelfie}
                                            className="px-6 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-all flex items-center gap-2"
                                        >
                                            <Camera size={20} />
                                            Capture
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={startCamera}
                                    className="w-full max-w-md mx-auto block px-6 py-4 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <Camera size={20} />
                                    Start Camera
                                </button>
                            )}
                        </div>
                    )}

                    {step === 3 && verificationStatus && (
                        <div className="text-center space-y-6">
                            {verificationStatus.status === 'PENDING' && (
                                <>
                                    <AlertCircle className="w-16 h-16 mx-auto text-orange-500" />
                                    <h2 className="text-2xl font-bold text-slate-900">Under Review</h2>
                                    <p className="text-slate-600">{verificationStatus.message}</p>
                                </>
                            )}
                            {verificationStatus.status === 'VERIFIED' && (
                                <>
                                    <CheckCircle className="w-16 h-16 mx-auto text-emerald-500" />
                                    <h2 className="text-2xl font-bold text-slate-900">Verified!</h2>
                                    <p className="text-slate-600">{verificationStatus.message}</p>
                                    <button
                                        onClick={() => router.push('/profile')}
                                        className="px-6 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-all"
                                    >
                                        Go to Profile
                                    </button>
                                </>
                            )}
                            {verificationStatus.status === 'REJECTED' && (
                                <>
                                    <XCircle className="w-16 h-16 mx-auto text-rose-500" />
                                    <h2 className="text-2xl font-bold text-slate-900">Verification Rejected</h2>
                                    <p className="text-slate-600">{verificationStatus.notes}</p>
                                    <button
                                        onClick={() => {
                                            setStep(1);
                                            setProfilePhoto(null);
                                            setProfilePhotoPreview('');
                                            setSelfiePhoto(null);
                                            setSelfiePhotoPreview('');
                                        }}
                                        className="px-6 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-all"
                                    >
                                        Try Again
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
