import React, { useState, useEffect } from 'react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
    LayoutDashboard, Video, BarChart3, Folder, BellDot, Cpu, Settings, 
    UserCircle, Search, Moon, Bell, Camera, Mic, ArrowUpRight, 
    ChevronRight, Sparkles, LogOut, CheckCircle, Smartphone, 
    Database, Activity, Zap, Loader2, AlertTriangle, ShieldCheck,
    Filter, Download, MoreVertical, Plus, User, Info, CheckCircle2,
    Clock, Heart, Shield, Globe, ExternalLink, RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CameraScanner } from './CameraScanner';
import { HealthProfileForm } from './HealthProfileForm';
import { ScoreDisplay } from './ScoreDisplay';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const trendData = [
    { day: 'Mon', active: 20, target: 15, nutrition: 65 },
    { day: 'Tue', active: 15, target: 18, nutrition: 72 },
    { day: 'Wed', active: 25, target: 20, nutrition: 58 },
    { day: 'Thu', active: 22, target: 25, nutrition: 85 },
    { day: 'Fri', active: 38, target: 30, nutrition: 78 },
    { day: 'Sat', active: 32, target: 35, nutrition: 92 },
    { day: 'Sun', active: 55, target: 45, nutrition: 88 }
];

const sparklineData = [
    { value: 10 }, { value: 15 }, { value: 8 }, { value: 20 }, 
    { value: 18 }, { value: 25 }, { value: 22 }
];

const activityLogs = [
    { id: 1, name: 'Nutella Ferrero', time: '13:42:53 AM', type: 'Recent Scan', outcome: 'High Sugar', score: 42, icon: '🍫' },
    { id: 2, name: 'Greek Yogurt', time: '10:42:33 AM', type: 'Comparison', outcome: 'Healthy Match', score: 95, icon: '🥗' },
    { id: 3, name: 'Instant Oats', time: '09:12:05 AM', type: 'Historical', outcome: 'Good Protein', score: 82, icon: '🥣' },
    { id: 4, name: 'Coca-Cola Zero', time: 'Yesterday', type: 'Recent Scan', outcome: 'Additive Alert', score: 65, icon: '🥤' },
];

const newsFeed = [
    { id: 1, title: 'FDA Updates Sodium Guidelines', time: '2h ago', source: 'Health News', impact: 'Medium' },
    { id: 2, title: 'New Multi-Model AI deployed', time: '5h ago', source: 'System Status', impact: 'High' },
    { id: 3, title: 'Your Vitamin D goal reached', time: 'Today', source: 'Personal Insights', impact: 'Positive' },
];

const Gauge = ({ value, label, color = "stroke-emerald-500" }) => {
    return (
        <div className="flex flex-col items-center">
            <div className="relative w-24 h-16">
                <svg className="w-full h-full -rotate-180" viewBox="0 0 100 60">
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50" fill="none" className={color} strokeWidth="8" strokeLinecap="round"
                        strokeDasharray="125.6" strokeDashoffset={125.6 - (value / 100) * 125.6} transition="stroke-dashoffset 0.5s ease"
                    />
                </svg>
                <div className="absolute inset-0 flex items-end justify-center pb-1">
                    <span className="text-xs font-bold text-slate-800">{value}%</span>
                </div>
            </div>
            <span className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-wider">{label}</span>
        </div>
    );
};

export function Dashboard({ 
    onScan, 
    scanLoading, 
    scanResult, 
    scanState, 
    resetScan, 
    scanError, 
    profile, 
    setProfile, 
    onGoHome,
    currentUser 
}) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('Overview');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [manualBarcode, setManualBarcode] = useState('');
    const [showCamera, setShowCamera] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) setIsSidebarCollapsed(true);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const menuItems = [
        { name: 'Overview', icon: LayoutDashboard, subtext: 'Dashboard' },
        { name: 'Live Monitoring', icon: Video, subtext: 'Feed' },
        { name: 'Analytics', icon: BarChart3, subtext: 'Insights' },
        { name: 'Reports', icon: Folder, subtext: 'Logs' },
        { name: 'Alerts', icon: BellDot, subtext: 'Notifications', badge: 1 },
        { name: 'Models', icon: Cpu, subtext: 'Al Modules' },
        { name: 'Settings', icon: Settings, subtext: 'Configuration' },
        { name: 'User / Profile', icon: UserCircle, subtext: 'Management' },
    ];

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualBarcode.trim()) {
            onScan(manualBarcode);
        }
    };

    const handleCameraScan = (scannedBarcode) => {
        setShowCamera(false);
        onScan(scannedBarcode);
    };

    const handleQuickTest = (code) => {
        setManualBarcode(code);
        onScan(code);
    };

    const handleProfileUpdate = (newProfile) => {
        setProfile(newProfile);
        setActiveTab('Overview'); // Go back to overview after update
    };

    // --- RENDER HELPERS ---

    const renderHeader = (title, subtitle) => (
        <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-800">{title}</h2>
            {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
    );

    const renderEmptyState = (title) => (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Info size={40} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-xs text-center">We are processing real-time data for this module. Check back shortly.</p>
        </div>
    );

    const renderOverview = () => (
        <div className="space-y-8">
            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Daily Scans (Today)', value: '263', trendColor: 'text-emerald-500', badge: 'MKP' },
                    { label: 'Avg. NutriScore', value: '7.8/10', trendColor: 'text-emerald-500', badge: 'HCP' },
                    { label: 'AI Accuracy', value: '99.9%', trendColor: 'text-emerald-500', badge: 'KPR' },
                ].map((card, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-500">{card.label}</span>
                            <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-md border border-emerald-500/20">{card.badge}</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="text-3xl font-black text-slate-800">{card.value}</h3>
                                <ArrowUpRight size={20} className={card.trendColor} />
                            </div>
                            <div className="h-10 w-24">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={sparklineData}>
                                        <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.1} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MAIN OPERATIONS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Identify Product Card */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <AnimatePresence mode="wait">
                        {scanState === 'result' && scanResult ? (
                            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-black text-slate-800">Scan Result</h3>
                                    <button onClick={resetScan} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                                        <RefreshCcw size={14} /> New Scan
                                    </button>
                                </div>
                                <ScoreDisplay result={scanResult} onReset={resetScan} />
                            </motion.div>
                        ) : (
                            <motion.div key="scanner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
                                <div className="p-6 md:p-8 border-b border-slate-50">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Core Operations: Product Identification</span>
                                    <h2 className="text-2xl font-black text-slate-800 mt-1">Identify Product</h2>
                                    <p className="text-sm text-slate-500 mt-1">Use camera visualization or enter barcode manually</p>
                                </div>
                                <div className="flex-grow p-6 md:p-8 flex flex-col md:flex-row items-stretch gap-8">
                                    <div className="w-full md:w-1/2">
                                        <button 
                                            onClick={() => setShowCamera(true)}
                                            className="w-full h-full aspect-video bg-emerald-500 text-white rounded-[1.5rem] flex flex-col items-center justify-center gap-4 shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 active:scale-[0.98] transition-all group"
                                        >
                                            <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Camera size={28} />
                                            </div>
                                            <span className="text-base md:text-lg font-bold tracking-tight text-white">Scan with Camera</span>
                                        </button>
                                    </div>
                                    <div className="w-full md:w-1/2 flex flex-col justify-between space-y-4">
                                        <form onSubmit={handleManualSubmit} className="space-y-4">
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    value={manualBarcode}
                                                    onChange={(e) => setManualBarcode(e.target.value)}
                                                    placeholder="Enter Barcode ID" 
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-center font-mono text-base focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all placeholder:text-slate-300"
                                                />
                                            </div>
                                            <button 
                                                type="submit"
                                                disabled={scanLoading || !manualBarcode}
                                                className="w-full py-4 bg-slate-800 text-white font-bold text-sm rounded-2xl hover:bg-slate-900 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {scanLoading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                                                Analyze Barcode
                                            </button>
                                        </form>
                                        <div className="relative flex items-center justify-center">
                                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                                            <span className="relative bg-white px-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">OR</span>
                                        </div>
                                        <div className="flex flex-wrap justify-center gap-2">
                                            {[{ name: 'Nutella', code: '3017624010701' }, { name: 'Coca-Cola', code: '5449000000996' }].map(p => (
                                                <button key={p.code} onClick={() => handleQuickTest(p.code)} className="px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 text-[10px] font-bold rounded-lg border border-slate-100 transition-all">
                                                    🏷️ {p.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* System Health Card */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8 flex flex-col">
                    <h3 className="text-lg font-black text-slate-800 mb-6 md:mb-8">System Health</h3>
                    <div className="flex-grow flex flex-col justify-around gap-6">
                        <div className="grid grid-cols-2 gap-4">
                            <Gauge value={42} label="Scanner" color="stroke-emerald-400" />
                            <Gauge value={68} label="Heuristics" color="stroke-emerald-500" />
                        </div>
                        <div className="flex flex-col items-center">
                             <Gauge value={15} label="AI Load" color="stroke-emerald-600" />
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-50 space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-400">Personalization</span>
                            <span className={profile ? "text-emerald-600" : "text-amber-500"}>{profile ? "Active (V2)" : "Baseline"}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-400">Cloud Sync</span>
                            <span className="text-emerald-600">Encrypted</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trend Analysis */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div><h3 className="text-lg font-black text-slate-800">Nutritional Trend</h3><p className="text-xs text-slate-400">Personal Health Score History</p></div>
                        <div className="px-3 py-1 bg-emerald-50 rounded-lg text-emerald-700 text-[10px] font-bold">Past Week</div>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs><linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/><stop offset="95%" stopColor="#10b981" strokeDasharray="5 5" stopOpacity={0}/></linearGradient></defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                                <Area type="monotone" dataKey="nutrition" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorActive)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8">
                    <h3 className="text-lg font-black text-slate-800 mb-8">Recent Activity</h3>
                    <div className="space-y-6">
                        {activityLogs.map((log) => (
                            <div key={log.id} className="flex gap-4 group cursor-pointer hover:translate-x-1 transition-transform">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-all">{log.icon}</div>
                                <div className="flex-grow min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-sm font-bold text-slate-800 truncate">{log.name}</h4>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${log.score >= 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>Score: {log.score}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{log.type} • {log.outcome}</p>
                                    <span className="text-[10px] text-slate-300 font-medium">{log.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderLiveMonitoring = () => (
        <div className="space-y-6">
            {renderHeader("Live Monitoring", "Real-time feed from active scanning modules")}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { id: 1, title: 'Local Vision Core', status: 'Online', load: '12%', color: 'bg-emerald-500' },
                    { id: 2, title: 'Cloud OCR Engine', status: 'Standby', load: '0%', color: 'bg-slate-300' },
                    { id: 3, title: 'Gemini LLM Pipeline', status: 'Online', load: '24%', color: 'bg-emerald-500' },
                ].map(item => (
                    <div key={item.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                            <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{item.status}</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: item.load }} className={`h-full ${item.color}`}></motion.div>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                                <span>Load Capacity</span>
                                <span>{item.load}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm h-96 relative overflow-hidden">
                 <div className="absolute inset-0 bg-slate-50/50 flex flex-col items-center justify-center">
                      <Activity size={48} className="text-emerald-500 animate-pulse mb-4" />
                      <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Live Data Stream Active</p>
                      <div className="mt-6 flex gap-2">
                          {[1,2,3,4,5].map(i => <div key={i} className="w-2 h-8 bg-emerald-200 rounded-full animate-bounce" style={{ animationDelay: i * 0.1 + 's' }}></div>)}
                      </div>
                 </div>
            </div>
        </div>
    );

    const renderAnalytics = () => (
        <div className="space-y-8">
            {renderHeader("Analytics & Insights", "Deep data visualization of your nutritional habits")}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-8 uppercase tracking-widest">Nutrient Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={[{name: 'Protein', value: 40}, {name: 'Fat', value: 25}, {name: 'Carbs', value: 35}]} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {trendData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                        {['Protein', 'Fat', 'Carbs'].map((label, i) => (
                            <div key={label} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-8 uppercase tracking-widest">Goal Progress</h3>
                    <div className="space-y-8">
                        {[
                            { label: 'Sodium Reduction', progress: 78, color: 'bg-amber-500' },
                            { label: 'Protein Intake', progress: 92, color: 'bg-emerald-500' },
                            { label: 'Calorie Target', progress: 45, color: 'bg-blue-500' },
                        ].map(goal => (
                            <div key={goal.label} className="space-y-2">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-slate-700">{goal.label}</span>
                                    <span className="text-slate-400">{goal.progress}%</span>
                                </div>
                                <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                     <div className={`h-full ${goal.color}`} style={{ width: goal.progress + '%' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderReports = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div><h2 className="text-2xl font-black text-slate-800">Historical Logs</h2><p className="text-sm text-slate-500 mt-1">Full archival data of all product scans</p></div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                    <Download size={14} /> Export CSV
                </button>
            </div>
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {activityLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/30 transition-colors group cursor-pointer">
                                <td className="px-8 py-5 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-lg">{log.icon}</div>
                                    <span className="text-sm font-bold text-slate-700">{log.name}</span>
                                </td>
                                <td className="px-6 py-5 text-xs text-slate-500 font-medium">{log.type}</td>
                                <td className="px-6 py-5">
                                    <span className={`text-sm font-black ${log.score >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>{log.score}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${log.score >= 80 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                        {log.score >= 80 ? 'VERIFIED' : 'ANALYZED'}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right text-xs text-slate-400 font-medium">{log.time}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderAlerts = () => (
        <div className="space-y-6">
            {renderHeader("Notifications & Alerts", "Critical updates from your health core")}
            <div className="space-y-4 max-w-3xl">
                {[
                    { title: 'Critical Sodium Spike', desc: 'Your average consumption this week has exceeded safe limits for Hypertension.', severity: 'high', time: '12m ago' },
                    { title: 'New Scan Match Found', desc: 'A better alternative for "Nutella" was found at your local grocery store.', severity: 'medium', time: '1h ago' },
                    { title: 'Profile Incomplete', desc: 'Your health conditions were updated. Tap to synchronize diagnostics.', severity: 'low', time: '2h ago' },
                ].map((alert, i) => (
                    <div key={i} className={`p-6 rounded-[1.5rem] bg-white border border-slate-100 shadow-sm flex gap-6 items-start relative overflow-hidden group hover:border-slate-200 transition-all`}>
                        <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${
                             alert.severity === 'high' ? 'bg-rose-50 text-rose-500' :
                             alert.severity === 'medium' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'
                        }`}>
                             {alert.severity === 'high' ? <AlertTriangle size={24} /> : <Bell size={24} />}
                        </div>
                        <div className="flex-grow">
                             <div className="flex justify-between items-start mb-1">
                                 <h4 className="text-sm font-black text-slate-800">{alert.title}</h4>
                                 <span className="text-[10px] font-bold text-slate-400 italic">{alert.time}</span>
                             </div>
                             <p className="text-xs text-slate-500 font-medium leading-relaxed">{alert.desc}</p>
                        </div>
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                             alert.severity === 'high' ? 'bg-rose-500' :
                             alert.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                        }`}></div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderModels = () => (
        <div className="space-y-8">
            {renderHeader("AI Modules & Models", "Core neural foundations governing your health analysis")}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {[
                     { name: 'Scan-V3 (Local)', desc: 'Real-time computer vision for product identification.', status: 'Active', latency: '42ms' },
                     { name: 'NutriLLM-1.5', desc: 'Predictive reasoning for ingredient risk assessment.', status: 'Active', latency: '1.2s' },
                     { name: 'Personal-Bio (Core)', desc: 'Custom mapping between profile data and nutri-matrix.', status: 'Syncing', latency: 'N/A' },
                 ].map(model => (
                     <div key={model.name} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col group hover:border-emerald-200 transition-all">
                         <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                <Database size={24} />
                            </div>
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${model.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                {model.status}
                            </span>
                         </div>
                         <h3 className="text-lg font-black text-slate-800 mb-2">{model.name}</h3>
                         <p className="text-xs text-slate-400 leading-relaxed flex-grow mb-6">{model.desc}</p>
                         <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             <span>Inference Latency</span>
                             <span className="text-emerald-600 font-bold">{model.latency}</span>
                         </div>
                     </div>
                 ))}
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="space-y-8">
            {renderHeader("System Configuration", "Preferences and environmental settings")}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm max-w-2xl space-y-8">
                <section>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Experience</h3>
                    <div className="space-y-6">
                        {[
                            { label: 'Haptic Feedback', desc: 'Vibrate on successful scan identification.' },
                            { label: 'Voice Assistant', desc: 'Enable auditory feedback for health insights.' },
                            { label: 'High Precision UI', desc: 'Enable detailed charts and animations.' },
                        ].map((s, i) => (
                            <div key={i} className="flex justify-between items-center group">
                                <div>
                                    <p className="text-sm font-bold text-slate-700">{s.label}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{s.desc}</p>
                                </div>
                                <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-all ${i === 2 ? 'bg-emerald-500' : 'bg-slate-100'}`}>
                                    <div className={`absolute top-1 w-4 h-4 rounded-full shadow-sm transition-all ${i === 2 ? 'right-1 bg-white' : 'left-1 bg-slate-300'}`}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                <section className="pt-8 border-t border-slate-50">
                     <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Synchronization</h3>
                     <button className="w-full py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all uppercase tracking-widest">
                         Re-Sync Diagnostics Data
                     </button>
                </section>
            </div>
        </div>
    );

    const renderUserManagement = () => (
        <div className="space-y-8">
            {renderHeader("User Management", "Personal health diagnostics and account settings")}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                 <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-6 mb-10">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-3xl bg-emerald-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jane" alt="Avatar" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-xl border-2 border-white flex items-center justify-center text-white shadow-lg">
                                <Camera size={14} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800">Jane Smith</h3>
                            <p className="text-xs text-slate-400">jane.smith@nutriguard.ai</p>
                            <div className="mt-2 flex gap-2">
                                <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded border border-emerald-100 tracking-widest">PRO</span>
                                <span className="text-[10px] font-black bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded border border-blue-100 tracking-widest">VERIFIED</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        {[
                            { label: 'Full Name', value: 'Jane Smith' },
                            { label: 'Location', value: 'Bangalore, India' },
                            { label: 'Clinical ID', value: 'NG-88219-X' },
                        ].map(f => (
                            <div key={f.label} className="group">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 group-hover:text-emerald-500 transition-colors">{f.label}</p>
                                <p className="text-sm font-bold text-slate-700">{f.value}</p>
                            </div>
                        ))}
                    </div>
                 </div>

                 {/* HEALTH PROFILE FORM INTEGRATION */}
                 <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                     <h3 className="text-sm font-black text-slate-800 mb-6 uppercase tracking-widest flex items-center gap-2">
                         <ShieldCheck size={18} className="text-emerald-500" />
                         Health Intelligence Mapping
                     </h3>
                     <div className="relative bg-slate-50/50 rounded-[1.5rem] border border-slate-50 p-4">
                        <HealthProfileForm onComplete={handleProfileUpdate} />
                     </div>
                 </div>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#F8FAFB] text-slate-900 font-sans w-full overflow-x-hidden">
            {/* SIDEBAR */}
            <motion.aside 
                initial={false}
                animate={{ width: isSidebarCollapsed ? (isMobile ? 0 : 80) : 260 }}
                className={`fixed left-0 top-0 bottom-0 bg-[#EEFDF8] border-r border-[#D1F7E8] z-50 flex flex-col pt-6 overflow-hidden transition-all duration-300 ${isMobile && isSidebarCollapsed ? '-translate-x-full' : 'translate-x-0'} hidden md:flex`}
            >
                <div className="px-6 mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white"><CheckCircle size={20} /></div>
                        {!isSidebarCollapsed && <span className="text-xl font-bold text-emerald-950 flex items-center gap-1.5 whitespace-nowrap">NutriGuard <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded-full border border-emerald-500/20">AI</span></span>}
                    </div>
                </div>
                <nav className="flex-grow px-3 space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => { setActiveTab(item.name); resetScan(); }}
                            className={`w-full group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all relative ${
                                activeTab === item.name 
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                : 'text-slate-600 hover:bg-emerald-500/10 hover:text-emerald-700'
                            }`}
                        >
                            <item.icon className="shrink-0 w-6 h-6" />
                            {!isSidebarCollapsed && <div className="flex flex-col items-start leading-none text-left"><span className="font-bold text-sm whitespace-nowrap">{item.name}</span><span className={`text-[10px] mt-0.5 ${activeTab === item.name ? 'text-emerald-100' : 'text-slate-400'}`}>{item.subtext}</span></div>}
                        </button>
                    ))}
                </nav>
                {!isMobile && (
                    <div className="p-6">
                        <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="w-full flex items-center justify-center p-3 hover:bg-emerald-500/10 rounded-2xl text-emerald-700 transition-colors">
                             <ChevronRight className={`w-5 h-5 transition-transform ${isSidebarCollapsed ? 'rotate-0' : 'rotate-180'}`} />
                        </button>
                    </div>
                )}
            </motion.aside>

            {/* MAIN CONTENT */}
            <main className={`flex-grow transition-all duration-300 min-h-screen pb-24 ${isSidebarCollapsed ? (isMobile ? 'ml-0' : 'ml-20') : (isMobile ? 'ml-0' : 'ml-[260px]')}`}>
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                         {isMobile && <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-600"><Activity size={20} /></button>}
                        <div className="hidden sm:flex flex-grow max-w-md relative group"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" /><input type="text" placeholder="Search insights..." className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 transition-all font-medium" /></div>
                    </div>
                    <div className="flex items-center gap-1 md:gap-3">
                        <button className="p-2.5 hover:bg-slate-50 rounded-full text-slate-600 transition-colors relative"><Bell size={20} /><span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span></button>
                        <button className="p-2.5 hover:bg-slate-50 rounded-full text-slate-600 transition-colors"><Moon size={20} /></button>
                        <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>
                        <div onClick={() => setActiveTab('User / Profile')} className="flex items-center gap-3 pl-2 group cursor-pointer leading-tight">
                            <div className="hidden sm:flex flex-col items-end"><span className="text-sm font-bold text-slate-800">Jane Smith</span><span className="text-[10px] text-slate-400">Pro Member</span></div>
                            <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-50 overflow-hidden"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jane" alt="Avatar" /></div>
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}>
                            {activeTab === 'Overview' && renderOverview()}
                            {activeTab === 'Live Monitoring' && renderLiveMonitoring()}
                            {activeTab === 'Analytics' && renderAnalytics()}
                            {activeTab === 'Reports' && renderReports()}
                            {activeTab === 'Alerts' && renderAlerts()}
                            {activeTab === 'Models' && renderModels()}
                            {activeTab === 'Settings' && renderSettings()}
                            {activeTab === 'User / Profile' && renderUserManagement()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* ASK AI FLOATING BUTTON */}
            <motion.button 
                whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}
                className="fixed bottom-8 right-8 bg-white border border-slate-100 shadow-2xl p-4 px-6 rounded-full flex items-center gap-3 z-50 text-emerald-600 font-bold text-sm"
            >
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white"><Sparkles size={16} /></div>
                ASK AI 
            </motion.button>

            {/* MOBILE NAVIGATION */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-100 z-50 flex items-center justify-around px-4">
                {[
                    { id: 'Overview', icon: LayoutDashboard },
                    { id: 'Analytics', icon: BarChart3 },
                    { id: 'Reports', icon: Folder },
                    { id: 'User / Profile', icon: User },
                ].map(item => (
                    <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center gap-1 ${activeTab === item.id ? 'text-emerald-500' : 'text-slate-400'}`}>
                        <item.icon size={20} />
                        <span className="text-[9px] font-bold uppercase tracking-wider">{item.id.split(' ')[0]}</span>
                    </button>
                ))}
            </div>

            {showCamera && <CameraScanner onScan={handleCameraScan} onClose={() => setShowCamera(false)} />}
        </div>
    );
}
