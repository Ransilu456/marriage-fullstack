'use client';

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Send, Paperclip, ChevronLeft, Loader2, MoreHorizontal, Check, Sun, X } from "lucide-react";

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
}

interface RecipientProfile {
    id: string;
    name: string;
    age: number;
    location: string;
    photoUrl: string;
    bio: string;
    jobCategory: string;
    maritalStatus: string;
}

export default function ChatPage() {
    const { data: session } = useSession();
    const { userId } = useParams();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [recipient, setRecipient] = useState<RecipientProfile | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
    const [proposalMessage, setProposalMessage] = useState("");
    const [proposalStatus, setProposalStatus] = useState<'PENDING' | 'YES' | 'NO' | 'NONE'>('NONE');
    const [isSendingProposal, setIsSendingProposal] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (session?.user && userId && userId !== 'undefined') {
            fetchMessages();
            fetchRecipientProfile();
            fetchProposalStatus();

            const interval = setInterval(() => {
                fetchMessages();
            }, 3000);

            return () => {
                clearInterval(interval);
            };
        }
    }, [session, userId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchProposalStatus = async () => {
        try {
            const res = await fetch(`/api/proposals`);
            if (res.ok) {
                const data = await res.json();
                const p = [...(data.received || []), ...(data.sent || [])].find(
                    item => item.proposerId === userId || item.recipientId === userId
                );
                if (p) setProposalStatus(p.answer);
            }
        } catch (error) {
            console.error('Error fetching proposal status:', error);
        }
    };

    const fetchRecipientProfile = async () => {
        try {
            const res = await fetch(`/api/profiles`);
            if (res.ok) {
                const data = await res.json();
                const profile = data.profiles?.find((p: any) => p.userId === userId);
                if (profile) setRecipient(profile);
            }
        } catch (error) {
            console.error('Error fetching recipient profile:', error);
        }
    };

    const fetchMessages = async () => {
        if (!userId || userId === 'undefined') return;
        try {
            const res = await fetch(`/api/chat/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendProposal = async () => {
        if (!userId || isSendingProposal) return;
        setIsSendingProposal(true);
        try {
            const res = await fetch('/api/proposals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientId: userId,
                    message: proposalMessage
                })
            });
            if (res.ok) {
                setProposalStatus('PENDING');
                setIsProposalModalOpen(false);
                setProposalMessage("");
            }
        } catch (error) {
            console.error('Error sending proposal:', error);
        } finally {
            setIsSendingProposal(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !(session?.user as any)?.id) return;

        const optimisticMessage: Message = {
            id: Date.now().toString(),
            content: newMessage,
            senderId: (session?.user as any).id,
            createdAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, optimisticMessage]);
        const msg = newMessage;
        setNewMessage("");

        try {
            await fetch(`/api/chat/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: msg }),
            });
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="bg-slate-50 min-h-screen flex h-screen overflow-hidden pt-20">
            {/* Header / Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-[60] bg-white border-b border-slate-100 h-20">
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 text-slate-400 hover:text-slate-900 transition-all"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 border border-slate-100">
                                <img
                                    src={recipient?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120"}
                                    className="w-full h-full object-cover"
                                    alt="Recipient"
                                />
                            </div>
                            <div className="space-y-0.5">
                                <h2 className="text-base font-bold text-slate-900 leading-none">{recipient?.name || "Chat"}</h2>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Online</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                            <Sun size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Chat Container */}
                <div className="flex-1 flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 scrollbar-hide">
                        <div className="max-w-3xl mx-auto w-full space-y-6">
                            {messages.length === 0 ? (
                                <div className="text-center py-40 space-y-2">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto border border-slate-100 shadow-sm mb-4">
                                        <Sun size={20} className="text-rose-200" />
                                    </div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Start a conversation</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = msg.senderId === (session?.user as any)?.id;
                                    const showTime = idx === 0 ||
                                        new Date(msg.createdAt).getTime() - new Date(messages[idx - 1].createdAt).getTime() > 1000 * 60 * 10;

                                    return (
                                        <div key={msg.id} className="space-y-4">
                                            {showTime && (
                                                <div className="text-center py-4">
                                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            )}
                                            <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] md:max-w-[70%] space-y-1`}>
                                                    <div className={`px-5 py-3.5 shadow-sm ${isMe
                                                        ? 'bg-slate-900 text-white rounded-2xl rounded-tr-sm'
                                                        : 'bg-white text-slate-900 rounded-2xl rounded-tl-sm border border-slate-100'
                                                        }`}>
                                                        <p className="text-sm font-light leading-relaxed">{msg.content}</p>
                                                    </div>
                                                    <div className={`flex items-center gap-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                        {isMe && <Check size={10} className="text-emerald-500" />}
                                                        <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} className="h-4" />
                        </div>
                    </div>

                    {/* Input Field */}
                    <footer className="bg-white border-t border-slate-100 p-6">
                        <div className="max-w-3xl mx-auto">
                            <form
                                onSubmit={handleSend}
                                className="relative flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-2xl focus-within:bg-white focus-within:border-rose-300 transition-all"
                            >
                                <button type="button" className="p-3 text-slate-400 hover:text-rose-500 transition-all">
                                    <Paperclip size={20} />
                                </button>
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="flex-1 bg-transparent px-2 py-3 outline-none text-sm placeholder:text-slate-300"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="w-11 h-11 bg-slate-900 text-white rounded-xl hover:bg-rose-600 transition-all disabled:opacity-20 flex items-center justify-center shadow-md active:scale-95"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </footer>
                </div>

                {/* Profile Sidebar */}
                <AnimatePresence>
                    {isSidebarOpen && (
                        <motion.aside
                            initial={{ x: 380 }}
                            animate={{ x: 0 }}
                            exit={{ x: 380 }}
                            className="absolute right-0 top-0 bottom-0 w-[320px] bg-white border-l border-slate-100 z-50 overflow-y-auto"
                        >
                            <div className="p-8 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Profile Details</h3>
                                    <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-slate-900">
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                                        <img
                                            src={recipient?.photoUrl}
                                            className="w-full h-full object-cover"
                                            alt={recipient?.name}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-2xl font-serif text-slate-900 font-bold">{recipient?.name}, {recipient?.age}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <MapPin size={12} className="text-rose-500" /> {recipient?.location}
                                        </p>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed italic border-l-2 border-rose-100 pl-4 py-1">
                                        "{recipient?.bio || 'No bio available'}"
                                    </p>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Profession</p>
                                            <p className="text-[10px] font-bold text-slate-900 truncate">{recipient?.jobCategory}</p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                            <p className="text-[10px] font-bold text-slate-900 truncate">{recipient?.maritalStatus}</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 space-y-3">
                                        {proposalStatus === 'NONE' ? (
                                            <button
                                                onClick={() => setIsProposalModalOpen(true)}
                                                className="w-full py-4 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100/50"
                                            >
                                                Send Proposal
                                            </button>
                                        ) : (
                                            <div className={`w-full py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-center border ${proposalStatus === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                proposalStatus === 'YES' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    'bg-rose-50 text-rose-600 border-rose-100'
                                                }`}>
                                                Proposal {proposalStatus}
                                            </div>
                                        )}
                                        <button
                                            onClick={() => router.push(`/profile/${userId}`)}
                                            className="w-full py-4 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 transition-all shadow-md"
                                        >
                                            Full Profile
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </div>

            {/* Proposal Modal */}
            <AnimatePresence>
                {isProposalModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsProposalModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl space-y-6"
                        >
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-serif text-slate-900 font-bold">Send Proposal</h3>
                                <p className="text-sm text-slate-400">Introduce yourself to {recipient?.name}.</p>
                            </div>

                            <div className="space-y-4">
                                <textarea
                                    value={proposalMessage}
                                    onChange={(e) => setProposalMessage(e.target.value)}
                                    placeholder="Write a sincere message..."
                                    className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-rose-500 transition-all resize-none shadow-inner"
                                />
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsProposalModalOpen(false)}
                                        className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSendProposal}
                                        disabled={!proposalMessage.trim() || isSendingProposal}
                                        className="flex-[2] py-4 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 disabled:opacity-20 transition-all shadow-lg"
                                    >
                                        {isSendingProposal ? 'Sending...' : 'Send Proposal'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

const MapPin = ({ className, size }: { className?: string, size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);
