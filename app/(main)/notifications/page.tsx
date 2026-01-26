'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    MessageSquare,
    Heart,
    CheckCircle2,
    Trash2,
    ArrowLeft,
    Inbox,
    ShieldCheck,
    Sparkles,
    Clock
} from 'lucide-react';
import Link from 'next/link';
import { useNotificationContext } from '@/app/components/NotificationProvider';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

export default function NotificationsPage() {
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification
    } = useNotificationContext();

    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.read)
        : notifications;

    const getIcon = (type: string) => {
        switch (type.toUpperCase()) {
            case 'MESSAGE':
            case 'CHAT':
                return <MessageSquare className="text-blue-500" size={20} />;
            case 'PROPOSAL':
            case 'INTEREST':
                return <Heart className="text-rose-500" size={20} />;
            case 'MATCH':
                return <Sparkles className="text-amber-500" size={20} />;
            case 'SYSTEM':
            case 'VERIFICATION':
                return <ShieldCheck className="text-emerald-500" size={20} />;
            default:
                return <Bell className="text-slate-400" size={20} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                            <Link href="/dashboard" className="hover:text-rose-600 transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-widest">
                                <ArrowLeft size={14} /> Dashboard
                            </Link>
                        </div>
                        <h1 className="text-4xl font-serif font-bold text-slate-900 flex items-center gap-3">
                            Notifications
                            {unreadCount > 0 && (
                                <span className="bg-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tighter">
                                    {unreadCount} New
                                </span>
                            )}
                        </h1>
                        <p className="text-slate-500 text-sm">Stay updated with your latest activities and match requests.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAllAsRead()}
                                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-rose-600 transition-colors"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-200 flex items-center justify-between gap-2 overflow-x-auto">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-6 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            All Activities
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-6 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${filter === 'unread' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Unread
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {filteredNotifications.length > 0 ? (
                            filteredNotifications.map((notification) => (
                                <motion.div
                                    key={notification.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`group relative bg-white rounded-[2rem] p-6 border transition-all duration-300 ${notification.read ? 'border-slate-100' : 'border-rose-100 shadow-xl shadow-rose-500/5'}`}
                                >
                                    <div className="flex gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${notification.read ? 'bg-slate-50 text-slate-400' : 'bg-rose-50 text-rose-600'}`}>
                                            {getIcon(notification.type)}
                                        </div>

                                        <div className="flex-1 space-y-1 pr-8">
                                            <div className="flex items-center justify-between">
                                                <h3 className={`font-bold text-sm ${notification.read ? 'text-slate-600' : 'text-slate-900'}`}>
                                                    {notification.title}
                                                </h3>
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                    <Clock size={12} />
                                                    <span className="text-[10px] font-medium">
                                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className={`text-sm leading-relaxed ${notification.read ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {notification.message}
                                            </p>

                                            {notification.link && (
                                                <Link
                                                    href={notification.link}
                                                    className="inline-flex items-center gap-1.5 text-[10px] font-bold text-rose-600 hover:text-rose-700 mt-2 uppercase tracking-widest"
                                                >
                                                    View Details <ArrowRight size={12} />
                                                </Link>
                                            )}
                                        </div>

                                        {/* Actions Menu */}
                                        <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!notification.read && (
                                                <button
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="p-2 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(notification.id)}
                                                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {!notification.read && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-rose-500 rounded-r-full" />
                                    )}
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white rounded-[3rem] p-16 text-center border border-slate-100 border-dashed"
                            >
                                <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-slate-300 mb-6">
                                    <Inbox size={40} />
                                </div>
                                <h3 className="text-xl font-serif font-bold text-slate-900 mb-2">All caught up!</h3>
                                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                                    You don't have any {filter === 'unread' ? 'unread ' : ''}notifications at the moment.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function ArrowRight({ size, className }: { size?: number, className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size || 24}
            height={size || 24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}
