'use client';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Heart, HeartHandshake, ArrowRight, BadgeCheck, Users, ShieldCheck } from 'lucide-react';
import AuthForm from './components/AuthForm';

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="bg-slate-50 min-h-screen relative overflow-hidden">
      {/* Background Decorative Blurs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-100/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-50/40 blur-[120px] rounded-full" />
      </div>

      {/* Navigation (Placeholder) */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-rose-100/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-orange-400 rounded-lg flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
              <HeartHandshake size={18} />
            </div>
            <span className="font-serif text-xl tracking-tight text-slate-900 font-medium">Eternity</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <Link href="/discover" className="hover:text-rose-600 transition-colors">Discover</Link>
            <Link href="#" className="hover:text-rose-600 transition-colors">Stories</Link>
            {session ? (
              <Link href="/profile" className="text-rose-600 font-bold tracking-tight">My Profile</Link>
            ) : (
              <Link href="/auth/login" className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs hover:bg-rose-600 transition-all">Sign In</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-40 lg:pt-48 lg:pb-60">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* Left: Content */}
          <div className="space-y-12 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                #1 Trusted Matrimony Platform
              </div>

              <h1 className="text-5xl lg:text-7xl font-serif text-slate-900 leading-[1.1] tracking-tight">
                {session ? (
                  <>Ready for your <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-400 italic pr-2">next chapter?</span></>
                ) : (
                  <>Stories begin with a simple <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-400 italic pr-2">hello.</span></>
                )}
              </h1>

              <p className="text-lg text-slate-500 max-w-md leading-relaxed mt-6">
                {session
                  ? `Welcome back, ${session.user?.name?.split(' ')[0] || 'User'}. Your perfect match could be just one expression away.`
                  : "Discover meaningful connections with verified profiles. We curate matches based on values, personality, and life goals."
                }
              </p>

              <div className="flex flex-wrap gap-4 mt-12">
                {session ? (
                  <>
                    <Link
                      href="/discover"
                      className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-medium hover:bg-rose-600 transition-all shadow-lg shadow-slate-200 flex items-center gap-2 group"
                    >
                      Explore Matches
                      <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <Link
                      href="/profile"
                      className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl font-medium hover:border-slate-300 transition-all"
                    >
                      My Profile
                    </Link>
                  </>
                ) : (
                  <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                    <div className="flex -space-x-3">
                      {[
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64",
                        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64",
                        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=64&h=64"
                      ].map((url, i) => (
                        <Image key={i} src={url} alt="" width={40} height={40} className="w-10 h-10 rounded-full border-2 border-white object-cover" unoptimized />
                      ))}
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">+2k</div>
                    </div>
                    <span>Happy couples join every month</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Achievement Badges */}
            <div className="flex items-center gap-10 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                  <ShieldCheck size={20} className="text-rose-500" />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">100% Verified</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                  <Users size={20} className="text-orange-500" />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Active Community</div>
              </div>
            </div>
          </div>

          {/* Right: Login Card or Feature Showcase */}
          <div className="relative z-10">
            {!session ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <AuthForm mode="login" />
                <div className="absolute -right-4 -bottom-4 w-full h-full border border-rose-200 rounded-3xl -z-10"></div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 gap-6"
              >
                <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-rose-900/5 space-y-4">
                  <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                    <HeartHandshake size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-serif font-bold text-slate-900">Verified Matches</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-light mt-1">Manual screening for authenticity and peace of mind.</p>
                  </div>
                </div>

                <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-rose-900/5 space-y-4 translate-y-8">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <BadgeCheck size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-serif font-bold text-slate-900">Premium Sanctuary</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-light mt-1">Your privacy is preserved in our secure digital sanctuary.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-20 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
              <HeartHandshake size={18} />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-slate-900">Eternity</span>
          </div>

          <div className="flex gap-10 text-xs font-medium text-slate-400">
            <Link href="/discover" className="hover:text-rose-600 transition-colors">Discover</Link>
            <Link href="/auth/register" className="hover:text-rose-600 transition-colors">Stories</Link>
            <Link href="/family" className="hover:text-rose-600 transition-colors">Safety</Link>
            <Link href="/messages" className="hover:text-rose-600 transition-colors">Privacy</Link>
          </div>

          <p className="text-xs text-slate-300">
            © 2024 Eternity Matrimony. Crafted with love.
          </p>
        </div>
      </footer>
    </div>
  );
}
