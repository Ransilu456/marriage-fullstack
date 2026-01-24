'use client';

import { Search } from 'lucide-react';

export default function SearchInput({ value, onChange }: any) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search by name or email..."
        className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm"
      />
    </div>
  );
}
