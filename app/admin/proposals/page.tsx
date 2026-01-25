'use client';

import { useEffect, useState } from 'react';
import { Trash2, MessageSquare, HeartHandshake } from 'lucide-react';

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

    const fetchProposals = () => {
        setLoading(true);
        // Assuming there might be an endpoint for admin proposals, otherwise we might need to create one
        // For now, using a placeholder fetch or assuming existing endpoint structure
        fetch('/api/admin/proposals?limit=50')
            .then(res => res.json())
            .then(data => {
                setProposals(data.proposals || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchProposals();
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Proposals</h1>
                    <p className="text-slate-500 font-medium">Monitor interest requests and proposals between users.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Sender</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Receiver</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Date</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Message</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">Loading proposals...</td></tr>
                            ) : proposals.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">No proposals found.</td></tr>
                            ) : (
                                proposals.map((proposal) => (
                                    <tr key={proposal.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{proposal.sender.name || 'Unknown'}</div>
                                            <div className="text-xs text-slate-500">{proposal.sender.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{proposal.receiver.name || 'Unknown'}</div>
                                            <div className="text-xs text-slate-500">{proposal.receiver.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                ${proposal.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700' :
                                                    proposal.status === 'REJECTED' ? 'bg-red-50 text-red-700' :
                                                        'bg-amber-50 text-amber-700'}`}>
                                                {proposal.status.toLowerCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(proposal.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {proposal.message ? (
                                                <div className="flex items-center gap-2 text-slate-600 max-w-xs truncate" title={proposal.message}>
                                                    <MessageSquare size={14} className="text-slate-400 flex-shrink-0" />
                                                    <span className="truncate">{proposal.message}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic">No message</span>
                                            )}
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
