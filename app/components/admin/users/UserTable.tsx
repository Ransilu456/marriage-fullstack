'use client';

import UserRow from './UserRow';
import { User } from './types';

export default function UserTable({
  users,
  onDelete,
}: {
  users: User[];
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-600">User</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-600">Status</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-600">Verification</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-600">Trust</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-600">Joined</th>
            <th className="px-6 py-4 text-right text-xs font-bold uppercase text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {users.length ? (
            users.map(u => <UserRow key={u.id} user={u} onDelete={onDelete} />)
          ) : (
            <tr>
              <td colSpan={6} className="text-center py-10 text-slate-500">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
