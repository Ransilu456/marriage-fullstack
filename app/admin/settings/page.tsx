'use client';

import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                    <p className="text-sm text-slate-500">Manage system configurations and preferences.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Settings size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Settings Coming Soon</h3>
                <p className="text-slate-500 max-w-sm mt-2">
                    System settings configuration panel is currently under development.
                </p>
            </div>
        </div>
    );
}
