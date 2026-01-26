'use client';

import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Trash2, User, Activity } from 'lucide-react';
import { fetchReports } from '@/app/services/admin/adminApi';

interface Report {
    id: string;
    reporter: { name: string; email: string };
    target: { name: string; email: string };
    reason: string;
    status: string;
    createdAt: string;
}

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    const loadReports = async () => {
        setLoading(true);
        try {
            const data = await fetchReports();
            setReports(data.reports || []);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, []);

    const handleUpdateStatus = async (reportId: string, status: string) => {
        try {
            const res = await fetch('/api/admin/reports', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reportId, status }),
            });
            if (!res.ok) throw new Error();
            loadReports();
        } catch (error) {
            alert('Failed to update report status');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">User Reports</h1>
                    <p className="text-slate-500 font-medium text-sm">Review complaints and suspicious activity reports.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
                    <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center text-rose-500">
                        <AlertTriangle size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Reports</p>
                        <p className="text-sm font-bold text-slate-900">{reports.length}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Reporter</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Targeted User</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Reason</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Date</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium"><Activity size={20} className="animate-spin inline mr-2" /> Loading reports...</td></tr>
                            ) : reports.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-200">
                                                <Shield size={32} />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900">All clear!</h3>
                                            <p className="text-slate-500 max-w-xs mt-1">There are no active user reports to review.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900">{report.reporter.name}</div>
                                            <div className="text-[11px] text-slate-500">{report.reporter.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-rose-600">{report.target.name}</div>
                                            <div className="text-[11px] text-slate-500">{report.target.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-[200px] text-slate-600 font-medium line-clamp-2" title={report.reason}>
                                                {report.reason}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider
                                                ${report.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                    report.status === 'DISMISSED' ? 'bg-slate-100 text-slate-500' :
                                                        'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-medium">
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {report.status === 'OPEN' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateStatus(report.id, 'RESOLVED')}
                                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                                                            title="Mark as Resolved"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(report.id, 'DISMISSED')}
                                                            className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
                                                            title="Dismiss Report"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
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
