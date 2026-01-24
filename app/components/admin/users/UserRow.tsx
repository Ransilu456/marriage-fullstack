'use client';

import { Trash2, Eye, MessageCircle, ShieldCheck, Shield } from 'lucide-react';
import { User } from './types';

export default function UserRow({
  user,
  onDelete,
}: {
  user: User;
  onDelete: (id: string) => void;
}) {
  return (
    <tr className="hover:bg-indigo-50 transition group">
      <td className="px-6 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
          {(user.name || user.email)[0].toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-slate-900">{user.name || 'Unnamed'}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
      </td>

      <td className="px-6 py-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            user.accountStatus === 'ACTIVE'
              ? 'bg-emerald-100 text-emerald-700'
              : user.accountStatus === 'SUSPENDED'
              ? 'bg-red-100 text-red-700'
              : 'bg-amber-100 text-amber-700'
          }`}
        >
          {user.accountStatus || 'PENDING'}
        </span>
      </td>

      <td className="px-6 py-4">
        {user.idVerified ? (
          <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
            <ShieldCheck size={16} /> Verified
          </span>
        ) : (
          <span className="flex items-center gap-1 text-amber-600 text-xs font-semibold">
            <Shield size={16} /> Pending
          </span>
        )}
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600"
              style={{ width: `${user.trustScore || 0}%` }}
            />
          </div>
          <span className="text-xs font-bold">{user.trustScore || 0}%</span>
        </div>
      </td>

      <td className="px-6 py-4 text-xs text-slate-600">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>

      <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition">
        <button className="p-2 hover:bg-indigo-100 rounded-lg">
          <Eye size={16} />
        </button>
        <button className="p-2 hover:bg-blue-100 rounded-lg">
          <MessageCircle size={16} />
        </button>
        <button
          onClick={() => onDelete(user.id)}
          className="p-2 hover:bg-red-100 rounded-lg"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
}
