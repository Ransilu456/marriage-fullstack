'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowRight, Loader2, Sparkles, Mail, CheckCircle2, AlertCircle, HeartHandshake } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
    const router = useRouter();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value[0];
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) {
            setError('Please enter the 6-digit code sent to your email.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/auth/verify-email', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp: code })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/profile');
                }, 3000);
            } else {
                setError(data.error || 'Verification failed. Please check the code.');
            }
        } catch (error) {
            setError('Connection error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                {/* Background Decorative Blur */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-rose-200/30 rounded-full blur-3xl mix-blend-multiply filter"></div>
                <div className="absolute top-20 right-20 w-72 h-72 bg-orange-100/40 rounded-full blur-3xl mix-blend-multiply filter"></div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md relative z-10"
                >
                    <div className="bg-white rounded-[2rem] p-12 text-center shadow-2xl space-y-8 relative">
                        <div className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto text-emerald-500 animate-bounce">
                            <CheckCircle2 size={48} />
                        </div>
                        <div className="space-y-3">
                            <h1 className="text-3xl font-serif font-bold text-slate-900">Email Verified!</h1>
                            <p className="text-slate-500">Congratulations! Your email has been verified and +20 trust points have been added to your profile.</p>
                        </div>
                        <Link
                            href="/profile"
                            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-8 py-4 rounded-xl hover:bg-emerald-100 transition-all w-full justify-center"
                        >
                            Return to Profile <ArrowRight size={16} />
                        </Link>
                        <div className="absolute -right-4 -bottom-4 w-full h-full border border-emerald-100 rounded-[2rem] -z-10"></div>
                    </div>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Blur */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-rose-200/30 rounded-full blur-3xl mix-blend-multiply filter"></div>
            <div className="absolute top-20 right-20 w-72 h-72 bg-orange-100/40 rounded-full blur-3xl mix-blend-multiply filter"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <Link href="/" className="flex items-center justify-center gap-2 mb-12">
                    <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-orange-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                        <HeartHandshake size={24} />
                    </div>
                    <span className="font-serif text-2xl tracking-tight text-slate-900 font-bold">Eternity</span>
                </Link>

                <div className="relative">
                    <div className="bg-white rounded-[2rem] p-10 shadow-2xl space-y-8 relative z-10">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-500 shadow-inner">
                                <Mail size={28} />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center justify-center gap-2">
                                    <Sparkles className="text-amber-500" size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600">Verification</span>
                                </div>
                                <h1 className="text-2xl font-serif font-bold text-slate-900">Verify Your Email</h1>
                                <p className="text-slate-500 text-xs">We've sent a code to your email. Please enter it below.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="flex justify-between gap-2">
                                {otp.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        id={`otp-${idx}`}
                                        type="text"
                                        inputMode="numeric"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(idx, e)}
                                        className="w-12 h-14 bg-slate-50 border-2 border-slate-100 rounded-xl text-center text-xl font-bold text-slate-900 focus:border-rose-400 focus:bg-white outline-none transition-all"
                                        autoComplete="one-time-code"
                                    />
                                ))}
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="flex items-center gap-2 text-rose-500 bg-rose-50 p-4 rounded-xl text-[10px] font-bold"
                                >
                                    <AlertCircle size={14} />
                                    {error}
                                </motion.div>
                            )}

                            <div className="space-y-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:bg-rose-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : (
                                        <>Verify & Continue <ArrowRight size={16} /></>
                                    )}
                                </button>

                                <button type="button" className="w-full text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:text-rose-600 transition-all">
                                    Resend Code
                                </button>
                            </div>
                        </form>

                        <div className="pt-6 border-t border-slate-100 text-center">
                            <div className="flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 py-2.5 px-4 rounded-xl inline-flex font-bold text-[9px] uppercase tracking-widest border border-emerald-100">
                                <ShieldCheck size={14} /> Secure Verification
                            </div>
                        </div>
                    </div>
                    {/* Double border effect */}
                    <div className="absolute -right-4 -bottom-4 w-full h-full border border-rose-200 rounded-[2rem] -z-10"></div>
                </div>

                <p className="text-center mt-12 text-slate-400 text-[10px] font-medium tracking-wide">
                    © 2024 Eternity Matrimony. Crafted with love.
                </p>
            </motion.div>
        </main>
    );
}
