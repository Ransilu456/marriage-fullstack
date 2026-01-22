'use client';

import { FileText } from 'lucide-react';

export default function ReportsPage() {
    return (
        <div className="p-6 pt-24 space-y-8 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-serif font-bold text-slate-900">User <span className="text-rose-600">Reports</span></h1>
                <p className="text-slate-500 mt-1">Review reported content and user behavior.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <FileText size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No Reports Yet</h3>
                <p className="text-slate-500 mt-1">There are no active reports requiring attention.</p>
                <p className="text-xs text-slate-400 mt-4">(This module is currently a placeholder for future implementation)</p>
            </div>
        </div>
    );
}
