'use client';

import { useState } from 'react';
import { Settings, Shield, Bell, Database, Globe, Save, Lock, UserPlus } from 'lucide-react';

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', name: 'General', icon: Settings },
        { id: 'security', name: 'Security', icon: Shield },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'database', name: 'Database', icon: Database },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Console Settings</h1>
                <p className="text-slate-500 font-medium text-sm">Configure platform defaults and administrative preferences.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="lg:w-64 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-100'}`}
                        >
                            <tab.icon size={18} />
                            {tab.name}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                    <div className="p-8">
                        {activeTab === 'general' && (
                            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-6">Platform Configuration</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Platform Name</label>
                                            <input type="text" defaultValue="Eternity Matrimonial" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all font-medium text-slate-700" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Support Email</label>
                                            <input type="email" defaultValue="support@eternity.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all font-medium text-slate-700" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Default Locale</label>
                                            <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all font-medium text-slate-700">
                                                <option>English (US)</option>
                                                <option>Sinhala (LK)</option>
                                                <option>Tamil (LK)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Currency</label>
                                            <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all font-medium text-slate-700">
                                                <option>LKR (Rs.)</option>
                                                <option>USD ($)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-50">
                                    <h3 className="text-lg font-bold text-slate-900 mb-6">User Registration</h3>
                                    <div className="space-y-4">
                                        <label className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 cursor-pointer group hover:bg-white transition-colors">
                                            <input type="checkbox" defaultChecked className="w-5 h-5 rounded-lg border-slate-300 text-rose-500 focus:ring-rose-500" />
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-slate-800">Auto-verify email addresses</p>
                                                <p className="text-xs text-slate-500">Users will be verified immediately upon registration.</p>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 cursor-pointer group hover:bg-white transition-colors">
                                            <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-300 text-rose-500 focus:ring-rose-500" />
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-slate-800">Require admin approval</p>
                                                <p className="text-xs text-slate-500">New accounts must be manually enabled by an administrator.</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab !== 'general' && (
                            <div className="py-20 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
                                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-200">
                                    <Lock size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Module Locked</h3>
                                <p className="text-slate-500 max-w-xs mt-2">Extended configuration modules for {activeTab} are currently being finalized.</p>
                            </div>
                        )}
                    </div>

                    <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-xs text-slate-400 font-medium">Last synced: Today at 05:42 AM</p>
                        <button className="px-6 py-2.5 bg-slate-900 hover:bg-rose-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-200 transition-all flex items-center gap-2 group">
                            <Save size={18} className="transition-transform group-hover:scale-110" /> Save Configuration
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
