interface VerificationCardProps {
  user: {
    id: string;
    userId: string;
    type: string;
    fileUrl: string;
    status: string;
    createdAt: string;
    userName?: string;
    userEmail?: string;
  };
  onApprove: () => void;
  onReject: () => void;
}

import { FileText, User, Check, X } from 'lucide-react';
import Link from 'next/link';

export default function VerificationCard({ user, onApprove, onReject }: VerificationCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      {/* Preview Area */}
      <div className="h-48 bg-slate-100 flex items-center justify-center border-b border-slate-100 relative group cursor-pointer" onClick={() => window.open(user.fileUrl, '_blank')}>
        <FileText size={48} className="text-slate-300 group-hover:scale-110 transition-transform" />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">View Document</span>
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-1">{user.type}</p>
            <Link href={`/admin/users/${user.userId}`} className="font-bold text-slate-900 hover:text-rose-600 transition-colors flex items-center gap-1.5">
              <User size={14} className="text-slate-400" />
              {user.userName || 'Unknown User'}
            </Link>
            <p className="text-xs text-slate-400 mt-0.5">{user.userEmail}</p>
          </div>
          <span className="px-2 py-1 rounded bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-widest border border-amber-100">
            Pending
          </span>
        </div>
        <div className="mt-auto grid grid-cols-2 gap-3 pt-6 border-t border-slate-50">
          <button
            onClick={onReject}
            className="py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all flex items-center justify-center gap-2"
          >
            <X size={16} /> Reject
          </button>
          <button
            onClick={onApprove}
            className="py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold shadow-sm hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
          >
            <Check size={16} /> Verify
          </button>
        </div>
      </div>
    </div>
  );
}
