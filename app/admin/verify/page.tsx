'use client';


import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import VerificationCard from '@/app/components/admin/verify/VerificationiCard';
import GlassCard from '@/app/components/admin/ui/GlassCard';

interface VerificationRequest {
    id: string;
    userId: string;
    type: string;
    fileUrl: string;
    status: string;
    createdAt: string;
    userName?: string;
    userEmail?: string;
}

export default function VerifyPage() {
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/admin/verify');
            const data = await res.json();
            if (data.verifications) setRequests(data.verifications);
            console.log("Admin Req:", data)
        } catch (error) {
            console.error('Failed to fetch verifications', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (documentId: string, action: 'VERIFY' | 'REJECT') => {
        const reason = action === 'REJECT' ? prompt('Enter rejection reason:') : undefined;
        if (action === 'REJECT' && !reason) return;

        try {
            const res = await fetch('/api/admin/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentId, action, reason })
            });

            if (res.ok) {
                setRequests(requests.filter(r => r.id !== documentId));
                alert(`Document ${action === 'VERIFY' ? 'verified' : 'rejected'} successfully`);
            } else {
                alert('Action failed');
            }
        } catch (error) {
            console.error('Action failed', error);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center pt-20">
                <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
      <div className="p-6 pt-24 space-y-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Pending <span className="bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent">Verifications</span></h1>
          <p className="text-slate-500 mt-1">Review identity documents submitted by users.</p>
        </div>

        {requests.length === 0 ? (
          <GlassCard className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">All Caught Up!</h3>
            <p className="text-slate-500 mt-1">There are no pending verification requests at this time.</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((req) => (
              <VerificationCard key={req.id} user={req} onApprove={() => handleAction(req.id, 'VERIFY')} onReject={() => handleAction(req.id, 'REJECT')} />
            ))}
          </div>
        )}
      </div>
    );
}
