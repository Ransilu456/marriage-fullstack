'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowRight, Loader2, Sparkles, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white max-w-md w-full rounded-[2.5rem] p-12 text-center shadow-2xl space-y-8 border border-white"
                >
                    <div className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto text-emerald-500 animate-bounce">
                        <CheckCircle2 size={48} />
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-3xl font-serif font-bold text-slate-900">Email Verified!</h1>
                        <p className="text-slate-500">Congratulations! Your email has been verified and +20 trust points have been added to your profile.</p>
                    </div>
                    <Link
                        href="/profile"
                        className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-8 py-4 rounded-xl hover:bg-emerald-100 transition-all"
                    >
                        Return to Profile <ArrowRight size={16} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.05),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.05),transparent_40%)]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white max-w-lg w-full rounded-[3rem] p-12 shadow-2xl space-y-10 border border-white relative overflow-hidden"
            >
                {/* Decorative backgrounds */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -ml-16 -mb-16" />

                <div className="text-center space-y-4 relative z-10">
                    <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto text-blue-600 shadow-inner">
                        <Mail size={36} />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                            <Sparkles className="text-amber-500" size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Verification Required</span>
                        </div>
                        <h1 className="text-3xl font-serif font-bold text-slate-900">Verify Your Email</h1>
                        <p className="text-slate-500 text-sm">We've sent a 6-digit verification code to your registered email address. Please enter it below.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    <div className="flex justify-center gap-3 sm:gap-4">
                        {otp.map((digit, idx) => (
                            <input
                                key={idx}
                                id={`otp-${idx}`}
                                type="text"
                                inputMode="numeric"
                                value={digit}
                                onChange={(e) => handleOtpChange(idx, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(idx, e)}
                                className="w-12 h-16 sm:w-14 sm:h-20 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center text-2xl font-bold text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner"
                                autoComplete="one-time-code"
                            />
                        ))}
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="flex items-center gap-2 text-rose-500 bg-rose-50 p-4 rounded-xl text-xs font-bold"
                        >
                            <AlertCircle size={16} />
                            {error}
                        </motion.div>
                    )}

                    <div className="space-y-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>Verify & Collect Points <ArrowRight size={18} /></>
                            )}
                        </button>

                        <p className="text-center text-xs text-slate-400 font-medium">
                            Didn't receive the code? <button type="button" className="text-blue-600 hover:underline font-bold">Resend Code</button>
                        </p>
                    </div>
                </form>

                <div className="pt-8 border-t border-slate-100 text-center relative z-10">
                    <div className="flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 py-3 px-6 rounded-2xl inline-flex font-bold text-[10px] uppercase tracking-widest border border-emerald-100">
                        <ShieldCheck size={16} /> Secure Verification System
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
