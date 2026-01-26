'use client';

import { useEffect, useState } from 'react';
import { HeartHandshake, MessageSquare, Trash2, Activity, User, ArrowRight } from 'lucide-react';
import { fetchProposals } from '@/app/services/admin/adminApi';

interface Proposal {
    id: string;
    sender: { name: string | null; email: string | null };
    receiver: { name: string | null; email: string | null };
    status: string;
    message: string | null;
    createdAt: string;
}

export default function ProposalsPage() {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const loadProposals = async () => {
        setLoading(true);
        try {
            const filter = statusFilter === 'all' ? undefined : statusFilter.toUpperCase();
            const data = await fetchProposals(filter);
            setProposals(data.proposals || []);
        } catch (error) {
            console.error('Failed to fetch proposals:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProposals();
    }, [statusFilter]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this proposal?')) return;
        try {
            const res = await fetch('/api/admin/proposals', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ proposalId: id }),
            });
            if (!res.ok) throw new Error();
            loadProposals();
        } catch (error) {
            alert('Failed to delete proposal');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">System Proposals</h1>
                    <p className="text-slate-500 font-medium text-sm">Monitor interactions and matching progress between users.</p>
                </div>
                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200 self-start">
                    {['all', 'pending', 'accepted', 'rejected'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-5 py-2 rounded-xl text-[10px] font-bold transition-all duration-200 ${statusFilter === s ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            {s.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Interaction</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Message Preview</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Timeline</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium"><Activity size={20} className="animate-spin inline mr-2" /> Mapping network...</td></tr>
                            ) : proposals.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-200">
                                                <HeartHandshake size={32} />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900">No proposals found</h3>
                                            <p className="text-slate-500 max-w-xs mt-1">No interactions found matching your current filter.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                proposals.map((proposal) => (
                                    <tr key={proposal.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900">{proposal.sender.name || 'Anonymous'}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">SENDER</span>
                                                </div>
                                                <ArrowRight size={14} className="text-slate-300" />
                                                <div className="flex flex-col text-right md:text-left">
                                                    <span className="font-bold text-slate-900">{proposal.receiver.name || 'Anonymous'}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">RECEIVER</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider
                                                ${proposal.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                    proposal.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                                        'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                                {proposal.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {proposal.message ? (
                                                <div className="flex items-center gap-2 text-slate-600 max-w-[180px]" title={proposal.message}>
                                                    <MessageSquare size={14} className="text-slate-400 flex-shrink-0" />
                                                    <span className="truncate text-xs italic">"{proposal.message}"</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">No message attached</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-medium text-xs">
                                            {new Date(proposal.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(proposal.id)}
                                                className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                title="Delete Record"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
