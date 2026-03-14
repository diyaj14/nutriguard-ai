import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Info, Zap } from 'lucide-react';

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

            {/* Top Card: Product + Score */}
            <div className="glass-card rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden">
                <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-${suitability_score >= 80 ? 'primary' : suitability_score >= 50 ? 'warning' : 'danger'} to-transparent opacity-50`}></div>

                <div className="flex items-center w-full justify-between mb-4">
                    {image_url ? (
                        <img src={image_url} alt={name} className="w-20 h-20 object-contain drop-shadow-lg" />
                    ) : (
                        <div className="w-20 h-20 bg-[var(--background)]/5 rounded-2xl flex items-center justify-center text-3xl border border-[var(--glass-border)]">📦</div>
                    )}

                    <div className="text-right flex-1 ml-4">
                        <h2 className="text-lg font-bold text-[var(--text-main)] leading-tight mb-1">{name || "Unknown"}</h2>
                        <span className="text-xs text-[var(--text-secondary)] font-mono bg-[var(--background)]/5 px-2 py-1 rounded-md inline-block">{nutrition?.energy_kcal_100g ? `${Math.round(nutrition.energy_kcal_100g)} kcal` : 'N/A'}</span>
                    </div>
                </div>

                <div className="w-full h-px bg-[var(--glass-border)] opacity-20 mb-6"></div>

                {/* Score Circle */}
                <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                    <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(0,0,0,0.2)]">
                        <circle cx="64" cy="64" r={radius} fill="transparent" stroke="var(--glass-border)" strokeWidth="6" />
                        <circle
                            cx="64" cy="64" r={radius} fill="transparent" stroke="currentColor" strokeWidth="6"
                            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                            className={`transition-all duration-1000 ease-out ${scoreColor} drop-shadow-[0_0_10px_currentColor]`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl font-extrabold font-heading ${scoreColor}`}>{Math.round(suitability_score)}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${scoreColor} opacity-80`}>{label}</span>
                    </div>
                </div>
            </div>

            {/* Warnings Panel */}
            {warnings.length > 0 && (
                <div className="bg-danger/10 border-l-4 border-danger p-4 rounded-r-xl relative overflow-hidden">
                    <h3 className="text-danger font-bold flex items-center mb-2 text-sm">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Health Alerts
                    </h3>
                    <ul className="space-y-2">
                        {warnings.map((warning, idx) => (
                            <li key={idx} className="flex items-start text-[var(--text-main)] text-xs opacity-80">
                                <span className="mr-2 mt-1 w-1 h-1 bg-danger rounded-full flex-shrink-0"></span>
                                {warning}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* AI Reasoning */}
            <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-[var(--text-main)] flex items-center">
                        <Zap className="w-4 h-4 mr-2 text-secondary" />
                        AI Analysis
                    </h3>
                </div>

                <div className="space-y-3">
                    {reasons.map((reason, idx) => {
                        const isPositive = reason.includes('✅') || reason.toLowerCase().includes('good') || reason.toLowerCase().includes('excellent');
                        const isNegative = reason.includes('⚠️') || reason.includes('❌') || reason.toLowerCase().includes('high') || reason.toLowerCase().includes('poor');

                        return (
                            <div key={idx} className="flex items-start p-3 rounded-xl bg-primary/5 border border-primary/10">
                                <div className={`mr-3 mt-0.5 flex-shrink-0 ${isPositive ? 'text-primary' : isNegative ? 'text-warning' : 'text-[var(--text-secondary)]'}`}>
                                    {isPositive ? <CheckCircle2 className="w-4 h-4" /> : isNegative ? <Info className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                                </div>
                                <div>
                                    <p className="text-[var(--text-main)] opacity-90 text-xs leading-relaxed font-medium">{reason}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Recommendations Panel */}
            {result.recommendations && result.recommendations.length > 0 && (
                <div className="glass-card rounded-2xl p-5 border-primary/20 bg-primary/5">
                    <h3 className="text-base font-bold text-[var(--text-main)] flex items-center mb-4">
                        <Zap className="w-4 h-4 mr-2 text-primary" />
                        Smart Alternatives
                    </h3>
                    <div className="space-y-3">
                        {result.recommendations.map((rec, idx) => (
                            <div key={idx} className="flex items-center p-3 rounded-xl bg-[var(--background)]/40 border border-primary/10 hover:border-primary/30 transition-all cursor-pointer group">
                                {rec.image_url ? (
                                    <img src={rec.image_url} alt={rec.name} className="w-12 h-12 object-contain rounded-lg bg-[var(--background)]/5 p-1" />
                                ) : (
                                    <div className="w-12 h-12 bg-[var(--background)]/5 rounded-lg flex items-center justify-center text-xl">🥗</div>
                                )}
                                <div className="ml-3 flex-1">
                                    <h4 className="text-xs font-bold text-[var(--text-main)] group-hover:text-primary transition-colors">{rec.name}</h4>
                                    <div className="flex items-center mt-1">
                                        <div className="flex items-center text-primary font-bold mr-3">
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 mr-1.5">{Math.round(rec.suitability_score)}</span>
                                            <span className="text-[10px] uppercase tracking-wide">Score</span>
                                        </div>
                                        <span className="text-[10px] text-[var(--text-secondary)]">+{Math.round(rec.improvement_score)}% improvement</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Ingredient Intelligence */}
            {result.additive_details && result.additive_details.length > 0 && (
                <div className="glass-card rounded-2xl p-5">
                    <h3 className="text-base font-bold text-[var(--text-main)] flex items-center mb-4">
                        <Info className="w-4 h-4 mr-2 text-warning" />
                        Ingredient Intelligence
                    </h3>
                    <div className="space-y-3">
                        {result.additive_details.map((add, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-[var(--background)]/40 border border-[var(--glass-border)]">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-bold text-[var(--text-main)]">{add.name} ({add.id})</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${add.risk === 'high' ? 'bg-danger/20 text-danger' : add.risk === 'moderate' ? 'bg-warning/20 text-warning' : 'bg-primary/20 text-primary'
                                        }`}>
                                        {add.risk} risk
                                    </span>
                                </div>
                                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed italic">{add.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <button
                className="w-full py-4 bg-[var(--card-bg)] hover:bg-primary/10 border border-[var(--glass-border)] rounded-xl text-sm font-bold text-[var(--text-main)] transition-all active:scale-95 mb-8"
                onClick={onReset}
            >
                Scan Another Product
            </button>
        </div>
    );
}
