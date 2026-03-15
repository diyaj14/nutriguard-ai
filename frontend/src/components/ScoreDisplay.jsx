import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Info, Zap } from 'lucide-react';
import { motion } from 'framer-motion';


export function ScoreDisplay({ result, onReset }) {
    const { suitability_score, reasons, warnings, name, image_url, nutrition } = result;

    // Determine color and icon based on score
    let scoreColor = 'text-danger';
    let badgeColor = 'bg-danger/20 text-danger border-danger/20';
    let label = "POOR MATCH";

    if (suitability_score >= 80) {
        scoreColor = 'text-primary';
        badgeColor = 'bg-primary/20 text-primary border-primary/20';
        label = "EXCELLENT";
    } else if (suitability_score >= 50) {
        scoreColor = 'text-warning';
        badgeColor = 'bg-warning/20 text-warning border-warning/20';
        label = "MODERATE";
    }

    // Calculate Dash Array for Circle Progress
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (suitability_score / 100) * circumference;

    return (
        <div className="w-full flex flex-col gap-6 animate-fade-in-up">

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-start">
                
                {/* LEFT COLUMN: Score & Product Info */}
                <div className="flex flex-col gap-6 w-full">
                    {/* Top Card: Product + Score */}
                    <div className="glass-card rounded-[2.5rem] p-8 flex flex-col items-center text-center relative overflow-hidden h-full shadow-2xl">
                        <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-${suitability_score >= 80 ? 'primary' : suitability_score >= 50 ? 'warning' : 'danger'} to-transparent opacity-50`}></div>
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>

                        <div className="flex flex-col items-center w-full mb-8">
                            {image_url ? (
                                <div className="w-32 h-32 md:w-40 md:h-40 bg-white/5 rounded-3xl p-4 flex items-center justify-center mb-6 border border-[var(--glass-border)] shadow-inner">
                                    <img src={image_url} alt={name} className="w-full h-full object-contain filter drop-shadow-2xl" />
                                </div>
                            ) : (
                                <div className="w-32 h-32 md:w-40 md:h-40 bg-[var(--background)]/10 rounded-3xl flex items-center justify-center text-5xl border border-[var(--glass-border)] mb-6 shadow-inner">📦</div>
                            )}

                            <div className="w-full">
                                <h2 className="text-xl md:text-3xl font-black text-[var(--text-main)] leading-tight mb-2 tracking-tight">{name || "Unknown Product"}</h2>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                                        {nutrition?.energy_kcal_100g ? `${Math.round(nutrition.energy_kcal_100g)} kcal / 100g` : 'Nutrition N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full h-px bg-[var(--glass-border)] opacity-20 mb-8"></div>

                        {/* Score Circle */}
                        <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center mb-2 group">
                            <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 transition-all duration-500 group-hover:opacity-40 ${suitability_score >= 80 ? 'bg-primary' : suitability_score >= 50 ? 'bg-warning' : 'bg-danger'}`}></div>
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="50%" cy="50%" r="45%" fill="transparent" stroke="var(--glass-border)" strokeWidth="8" className="opacity-10" />
                                <circle
                                    cx="50%" cy="50%" r="45%" fill="transparent" stroke="currentColor" strokeWidth="8"
                                    strokeDasharray="283" strokeDashoffset={283 - (suitability_score / 100) * 283} strokeLinecap="round"
                                    className={`transition-all duration-1000 ease-out ${scoreColor} drop-shadow-[0_0_15px_currentColor]`}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <motion.span 
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className={`text-5xl md:text-7xl font-black font-heading ${scoreColor} tracking-tighter`}
                                >
                                    {Math.round(suitability_score)}
                                </motion.span>
                                <span className={`text-[11px] md:text-xs font-black uppercase tracking-widest mt-2 ${scoreColor} opacity-90 bg-white/5 px-2 py-0.5 rounded-md`}>
                                    {label}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations Panel (Moved inside column for desktop) */}
                    {result.recommendations && result.recommendations.length > 0 && (
                        <div className="glass-card rounded-[2rem] p-6 border-primary/20 bg-primary/5 shadow-xl">
                            <h3 className="text-base md:text-lg font-black text-[var(--text-main)] flex items-center mb-6 uppercase tracking-wider">
                                <Zap className="w-5 h-5 mr-3 text-primary animate-pulse" />
                                Smart Alternatives
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                {result.recommendations.map((rec, idx) => (
                                    <div key={idx} className="flex items-center p-4 rounded-2xl bg-[var(--background)]/60 border border-primary/10 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group shadow-sm">
                                        <div className="w-16 h-16 bg-white/5 rounded-xl p-2 flex items-center justify-center border border-[var(--glass-border)] group-hover:scale-105 transition-transform">
                                            {rec.image_url ? (
                                                <img src={rec.image_url} alt={rec.name} className="w-full h-full object-contain" />
                                            ) : (
                                                <span className="text-2xl">🥗</span>
                                            )}
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <h4 className="text-sm font-black text-[var(--text-main)] group-hover:text-primary transition-colors leading-tight mb-1">{rec.name}</h4>
                                            {rec.reason && (
                                                <p className="text-[10px] text-[var(--text-secondary)] italic mb-2 line-clamp-1">{rec.reason}</p>
                                            )}
                                            <div className="flex items-center">
                                                <div className="flex items-center text-primary font-black mr-4">
                                                    <span className="text-xs px-2 py-0.5 rounded-lg bg-primary/20 mr-2 border border-primary/20">{Math.round(rec.suitability_score)}</span>
                                                    <span className="text-[10px] uppercase tracking-widest opacity-60">SCORE</span>
                                                </div>
                                                <span className="text-[10px] md:text-xs text-primary font-bold">+{Math.round(rec.improvement_score)}% Better</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Analysis & Details */}
                <div className="flex flex-col gap-6 w-full">
                    {/* Warnings Panel */}
                    {warnings.length > 0 && (
                        <div className="bg-danger/10 border-l-4 border-danger p-6 rounded-2xl relative overflow-hidden shadow-lg">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-danger/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <h3 className="text-danger font-black flex items-center mb-4 text-sm md:text-base uppercase tracking-widest">
                                <AlertTriangle className="w-5 h-5 mr-3" />
                                Health Alerts
                            </h3>
                            <ul className="space-y-3 relative z-10">
                                {warnings.map((warning, idx) => (
                                    <li key={idx} className="flex items-start text-[var(--text-main)] text-xs md:text-sm font-medium leading-relaxed">
                                        <span className="mr-3 mt-1.5 w-1.5 h-1.5 bg-danger rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                                        {warning}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* AI Reasoning */}
                    <div className="glass-card rounded-[2rem] p-6 md:p-8 flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-base md:text-lg font-black text-[var(--text-main)] flex items-center uppercase tracking-wider">
                                <Zap className="w-5 h-5 mr-3 text-secondary" />
                                AI Insight Report
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {reasons.map((reason, idx) => {
                                const isPositive = reason.includes('✅') || reason.toLowerCase().includes('good') || reason.toLowerCase().includes('excellent');
                                const isNegative = reason.includes('⚠️') || reason.includes('❌') || reason.toLowerCase().includes('high') || reason.toLowerCase().includes('poor');

                                return (
                                    <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-[var(--background)]/40 border border-[var(--glass-border)] hover:bg-[var(--background)]/60 transition-all group">
                                        <div className={`mt-0.5 flex-shrink-0 p-2 rounded-xl border transition-colors ${
                                            isPositive ? 'bg-primary/10 text-primary border-primary/20' : 
                                            isNegative ? 'bg-warning/10 text-warning border-warning/20' : 
                                            'bg-[var(--background)]/20 text-[var(--text-secondary)] border-[var(--glass-border)]'
                                        }`}>
                                            {isPositive ? <CheckCircle2 className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[var(--text-main)] font-semibold text-xs md:text-sm leading-relaxed group-hover:translate-x-1 transition-transform">{reason}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Ingredient Intelligence */}
                    {result.additive_details && result.additive_details.length > 0 && (
                        <div className="glass-card rounded-[2rem] p-6 md:p-8 shadow-2xl">
                            <h3 className="text-base md:text-lg font-black text-[var(--text-main)] flex items-center mb-8 uppercase tracking-wider">
                                <Info className="w-5 h-5 mr-3 text-warning" />
                                Chemical Composition
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                {result.additive_details.map((add, idx) => (
                                    <div key={idx} className="p-5 rounded-2xl bg-[var(--background)]/40 border border-[var(--glass-border)] hover:border-warning/30 transition-all">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs md:text-sm font-black text-[var(--text-main)] tracking-tight">{add.name}</span>
                                            <span className={`text-[9px] md:text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${
                                                add.risk === 'high' ? 'bg-danger/10 text-danger border-danger/30' : 
                                                add.risk === 'moderate' ? 'bg-warning/10 text-warning border-warning/30' : 
                                                'bg-primary/10 text-primary border-primary/30'
                                            }`}>
                                                {add.risk}
                                            </span>
                                        </div>
                                        <p className="text-[11px] md:text-xs text-[var(--text-secondary)] leading-relaxed font-medium opacity-80">{add.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <button
                className="w-full py-4 bg-[var(--card-bg)] hover:bg-primary/10 border border-[var(--glass-border)] rounded-xl text-sm font-bold text-[var(--text-main)] transition-all active:scale-95 mb-8"
                onClick={onReset}
            >
                Scan Another Product
            </button>
        </div>
    );
}
