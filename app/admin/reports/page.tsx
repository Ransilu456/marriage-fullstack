'use client';

import { useEffect, useState } from 'react';
import { FileText, Flag, User, MessageSquare, Trash2, CheckCircle, Clock, AlertCircle, Filter, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface Report {
    id: string;
    reporterId: string;
    reportedUserId: string;
    reason: string;
    description: string;
    status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    createdAt: string;
    updatedAt: string;
}

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([
        {
            id: '1',
            reporterId: 'user123',
            reportedUserId: 'user456',
            reason: 'Inappropriate Content',
            description: 'User posted offensive language in their profile',
            status: 'INVESTIGATING',
            severity: 'HIGH',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
        {
            id: '2',
            reporterId: 'user789',
            reportedUserId: 'user321',
            reason: 'Fake Profile',
            description: 'Photos do not match real appearance',
            status: 'OPEN',
            severity: 'MEDIUM',
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        },
        {
            id: '3',
            reporterId: 'user654',
            reportedUserId: 'user987',
            reason: 'Harassment',
            description: 'User sent harassing messages',
            status: 'OPEN',
            severity: 'CRITICAL',
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        },
        {
            id: '4',
            reporterId: 'user111',
            reportedUserId: 'user222',
            reason: 'Spam',
            description: 'User sends multiple repeated messages',
            status: 'RESOLVED',
            severity: 'LOW',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        },
    ]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterSeverity, setFilterSeverity] = useState('ALL');
    const [stats, setStats] = useState({
        totalReports: 0,
        openReports: 0,
        investigating: 0,
        resolved: 0,
    });

    useEffect(() => {
        calculateStats();
    }, [reports]);

    const calculateStats = () => {
        setStats({
            totalReports: reports.length,
            openReports: reports.filter(r => r.status === 'OPEN').length,
            investigating: reports.filter(r => r.status === 'INVESTIGATING').length,
            resolved: reports.filter(r => r.status === 'RESOLVED').length,
        });
    };

    const filteredReports = reports.filter(report => {
        const matchesSearch = report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'ALL' || report.status === filterStatus;
        const matchesSeverity = filterSeverity === 'ALL' || report.severity === filterSeverity;
        
        return matchesSearch && matchesStatus && matchesSeverity;
    });

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-300';
            case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-300';
            case 'MEDIUM': return 'bg-amber-100 text-amber-700 border-amber-300';
            case 'LOW': return 'bg-blue-100 text-blue-700 border-blue-300';
            default: return 'bg-slate-100 text-slate-700 border-slate-300';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'OPEN': return <Clock className="w-4 h-4" />;
            case 'INVESTIGATING': return <AlertCircle className="w-4 h-4" />;
            case 'RESOLVED': return <CheckCircle className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-blue-50 border-blue-200';
            case 'INVESTIGATING': return 'bg-amber-50 border-amber-200';
            case 'RESOLVED': return 'bg-emerald-50 border-emerald-200';
            case 'DISMISSED': return 'bg-slate-50 border-slate-200';
            default: return 'bg-slate-50 border-slate-200';
        }
    };

    const statCards = [
        {
            label: 'Total Reports',
            value: stats.totalReports,
            icon: FileText,
            color: 'from-blue-600 to-indigo-600',
        },
        {
            label: 'Open',
            value: stats.openReports,
            icon: Clock,
            color: 'from-orange-600 to-red-600',
        },
        {
            label: 'Investigating',
            value: stats.investigating,
            icon: AlertCircle,
            color: 'from-amber-600 to-orange-600',
        },
        {
            label: 'Resolved',
            value: stats.resolved,
            icon: CheckCircle,
            color: 'from-emerald-600 to-green-600',
        },
    ];

    return (
        <div className="p-6 pt-24 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-slate-900">
                        User <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Reports</span>
                    </h1>
                    <p className="text-slate-600 mt-2">Review and manage reported content and user behavior</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={idx}
                            whileHover={{ translateY: -4 }}
                            className={`rounded-2xl bg-gradient-to-br ${stat.color} text-white p-6 shadow-lg hover:shadow-xl transition-all`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-white/80 mb-1">{stat.label}</p>
                                    <p className="text-3xl font-bold">{stat.value}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-white/20 backdrop-blur">
                                    <Icon size={24} />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                <div className="flex-1 relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:border-indigo-500"
                    >
                        <option value="ALL">All Status</option>
                        <option value="OPEN">Open</option>
                        <option value="INVESTIGATING">Investigating</option>
                        <option value="RESOLVED">Resolved</option>
                    </select>
                    <select
                        value={filterSeverity}
                        onChange={(e) => setFilterSeverity(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:border-indigo-500"
                    >
                        <option value="ALL">All Severity</option>
                        <option value="CRITICAL">Critical</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                    </select>
                </div>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
                {filteredReports.length > 0 ? filteredReports.map((report) => (
                    <motion.div
                        key={report.id}
                        whileHover={{ translateX: 4 }}
                        className={`rounded-2xl border ${getStatusColor(report.status)} p-6 shadow-sm hover:shadow-md transition-all`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 rounded-lg bg-white/50">
                                        <Flag size={18} className="text-slate-700" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">{report.reason}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityColor(report.severity)}`}>
                                        {report.severity}
                                    </span>
                                </div>
                                <p className="text-slate-700 mb-3">{report.description}</p>
                                <div className="flex flex-wrap gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <User size={16} />
                                        <span>Reported by: user_{report.reporterId.slice(0, 4)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <User size={16} />
                                        <span>Against: user_{report.reportedUserId.slice(0, 4)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Clock size={16} />
                                        <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                                    report.status === 'OPEN' ? 'bg-blue-100 text-blue-700' :
                                    report.status === 'INVESTIGATING' ? 'bg-amber-100 text-amber-700' :
                                    report.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' :
                                    'bg-slate-100 text-slate-700'
                                }`}>
                                    {getStatusIcon(report.status)}
                                    {report.status}
                                </div>
                                <button className="px-3 py-2 rounded-lg bg-white/50 hover:bg-white text-slate-700 hover:text-indigo-600 text-sm font-medium transition-colors">
                                    Review
                                </button>
                                <button className="px-3 py-2 rounded-lg bg-white/50 hover:bg-red-100 text-slate-700 hover:text-red-600 text-sm font-medium transition-colors">
                                    <Trash2 size={16} className="inline mr-1" /> Delete
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                        <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900">No Reports Found</h3>
                        <p className="text-slate-500 mt-2">There are no reports matching your criteria</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {filteredReports.length > 0 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">
                        Showing <span className="font-bold">{filteredReports.length}</span> of <span className="font-bold">{stats.totalReports}</span> reports
                    </p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium">
                            Previous
                        </button>
                        <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium">
                            1
                        </button>
                        <button className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium">
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
