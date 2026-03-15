import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { History, TrendingUp, ShieldCheck, ChevronRight, Activity, Zap, Mic } from 'lucide-react';


const mockData = [
    { day: 'Mon', score: 65, sodium: 80 },
    { day: 'Tue', score: 72, sodium: 65 },
    { day: 'Wed', score: 58, sodium: 90 },
    { day: 'Thu', score: 85, sodium: 40 },
    { day: 'Fri', score: 78, sodium: 55 },
    { day: 'Sat', score: 92, sodium: 30 },
    { day: 'Sun', score: 88, sodium: 35 },
];

const scanHistory = [
    { name: 'Oats Biscuits', score: 88, time: '2h ago', level: 'Excellent' },
    { name: 'Instant Noodles', score: 42, time: 'Yesterday', level: 'Poor' },
    { name: 'Greek Yogurt', score: 95, time: 'Yesterday', level: 'Excellent' },
    { name: 'Orange Juice', score: 68, time: '2 days ago', level: 'Moderate' },
];

export function Dashboard() {
    return (
        <div className="w-full max-w-4xl mx-auto p-4 flex flex-col gap-6 animate-fade-in mb-32">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-[var(--text-main)]">Your Health Pulse</h1>
                    <p className="text-[var(--text-secondary)] text-sm">Weekly nutritional insights</p>
                </div>
                <div className="glass-card p-3 rounded-2xl flex items-center gap-2 border-primary/20">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="text-primary font-bold text-sm">Vitality: 78%</span>
                </div>
            </div>

            {/* Voice Assistant Hint */}
            <div className="glass-card p-3 rounded-2xl flex items-center justify-between border-primary/10 bg-primary/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Mic className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-primary uppercase">Voice Companion Active</p>
                        <p className="text-[10px] text-[var(--text-secondary)]">Ask: "How is my health score today?" or "Explain my last scan"</p>
                    </div>
                </div>
                <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-0.5 h-3 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
                    ))}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-4 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-20">
                        <TrendingUp className="w-8 h-8 text-primary" />
                    </div>
                    <span className="text-[var(--text-secondary)] text-[10px] uppercase font-bold tracking-wider">Avg Score</span>
                    <h3 className="text-2xl font-bold text-[var(--text-main)] mt-1">76.4</h3>
                    <div className="flex items-center mt-2">
                        <span className="text-primary text-[10px] font-bold">↑ 12% from last week</span>
                    </div>
                </div>
                <div className="glass-card p-4 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-20">
                        <ShieldCheck className="w-8 h-8 text-secondary" />
                    </div>
                    <span className="text-[var(--text-secondary)] text-[10px] uppercase font-bold tracking-wider">Scans Today</span>
                    <h3 className="text-2xl font-bold text-[var(--text-main)] mt-1">12</h3>
                    <div className="flex items-center mt-2 text-secondary">
                        <span className="text-[10px] font-bold">4 high risk blocked</span>
                    </div>
                </div>
            </div>

            {/* Main Chart */}
            <div className="glass-card p-6 rounded-[2rem]">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                        Nutrition Match Trend
                    </h3>
                </div>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mockData}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#16E0A0" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#16E0A0" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--text-secondary)" strokeOpacity={0.05} vertical={false} />
                            <XAxis dataKey="day" stroke="var(--text-secondary)" opacity={0.5} fontSize={10} axisLine={false} tickLine={false} />
                            <YAxis hide domain={[40, 100]} />
                            <Tooltip
                                contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                                itemStyle={{ color: '#16E0A0', fontSize: '10px' }}
                            />
                            <Area type="monotone" dataKey="score" stroke="#16E0A0" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Scan History */}
            <div className="glass-card rounded-[2rem] p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center">
                        <History className="w-4 h-4 mr-2 text-secondary" />
                        Recent Activity
                    </h3>
                    <button className="text-[10px] text-[var(--text-secondary)] font-bold hover:text-primary transition-colors">SEE ALL</button>
                </div>
                <div className="space-y-4">
                    {scanHistory.map((scan, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-[var(--background)]/40 border border-[var(--glass-border)] hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${scan.score >= 80 ? 'bg-primary/10 text-primary' : scan.score >= 60 ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'
                                    }`}>
                                    {scan.score >= 80 ? '🥗' : scan.score >= 60 ? '🥨' : '🍟'}
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-[var(--text-main)]">{scan.name}</h4>
                                    <p className="text-[10px] text-[var(--text-secondary)]">{scan.time} • {scan.level}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold ${scan.score >= 80 ? 'text-primary' : scan.score >= 60 ? 'text-warning' : 'text-danger'
                                    }`}>{scan.score}</span>
                                <ChevronRight className="w-3 h-3 text-[var(--text-secondary)] opacity-50" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Premium Upsell */}
            <div className="bg-gradient-to-br from-emerald-600/20 to-primary/10 rounded-3xl p-6 border border-primary/20 relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-lg font-bold text-[var(--text-main)] mb-1">Scale Your Health</h3>
                    <p className="text-xs text-[var(--text-secondary)] opacity-80 mb-4 max-w-[200px]">Unlock Family Mode and advanced allergen tracking with Premium.</p>
                    <button className="px-5 py-2.5 bg-secondary text-white rounded-xl text-xs font-extrabold shadow-lg shadow-secondary/20 hover:scale-105 active:scale-95 transition-all">
                        EXPLORE BUSINESS PLANS
                    </button>
                </div>
                <div className="absolute top-1/2 -right-4 -translate-y-1/2 opacity-20 transform rotate-12">
                    <Zap className="w-32 h-32 text-secondary" />
                </div>
            </div>
        </div>
    );
}
