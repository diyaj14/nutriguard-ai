import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Shield, Zap } from 'lucide-react';

export function VideoShowcase() {
    const videoRef = useRef(null);

    const handleTimeUpdate = () => {
        // Cut the last 5 seconds from 13s total = play only first 8s
        if (videoRef.current && videoRef.current.currentTime >= 8) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
        }
    };

    return (
        <section className="py-24 bg-transparent relative overflow-hidden">
            {/* Background Particles/Nodes */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-primary/20 rounded-full"
                        initial={{ 
                            x: Math.random() * 100 + "%", 
                            y: Math.random() * 100 + "%",
                            opacity: 0.1
                        }}
                        animate={{ 
                            y: [null, "-20%", "120%"],
                            opacity: [0.1, 0.4, 0.1]
                        }}
                        transition={{ 
                            duration: Math.random() * 10 + 10, 
                            repeat: Infinity, 
                            ease: "linear" 
                        }}
                    />
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Video Side - Glassmorphism Frame */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        {/* Outer Glow */}
                        <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-transparent to-emerald-500/20 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="relative glass-card p-3 rounded-[2.5rem] border border-[var(--glass-border)] shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden backdrop-blur-3xl group">
                            <video
                                ref={videoRef}
                                autoPlay
                                loop={false} // Managed by onTimeUpdate to ensure 8s cut
                                muted
                                playsInline
                                onTimeUpdate={handleTimeUpdate}
                                className="w-full rounded-[1.8rem] shadow-2xl scale-[1.01]"
                            >
                                <source src="/showcase.mp4" type="video/mp4" />
                            </video>

                            {/* Futuristic Scanning Overlay */}
                            <div className="absolute inset-0 pointer-events-none opacity-30">
                                <motion.div 
                                    className="w-full h-[2px] bg-primary blur-[2px] shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                                    animate={{ top: ['0%', '100%', '0%'] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                                />
                            </div>
                            
                            {/* Glass Reflections */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--text-main)]/5 to-transparent pointer-events-none"></div>
                        </div>
                        
                        {/* Decorative HUD Elements */}
                        <div className="absolute -top-4 -right-4 w-24 h-24 border-t-2 border-r-2 border-[var(--glass-border)] rounded-tr-3xl"></div>
                        <div className="absolute -bottom-4 -left-4 w-24 h-24 border-b-2 border-l-2 border-[var(--glass-border)] rounded-bl-3xl"></div>
                    </motion.div>

                    {/* Content Side - Micro Explainer */}
                    <div className="space-y-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="glass-card p-8 md:p-0 md:bg-transparent md:border-none md:shadow-none rounded-[2.5rem]"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                                <span className="text-[10px] text-primary font-black uppercase tracking-widest leading-none text-glow">Live Analysis Visualizer</span>
                            </div>
                            
                            <h2 className="text-5xl md:text-7xl font-black text-[var(--text-main)] tracking-tighter leading-[0.95] mb-8">
                                How NutriGuard <br /> 
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-cyan-400">
                                    Thinks.
                                </span>
                            </h2>
                            <p className="text-[var(--text-secondary)] text-lg md:text-xl leading-relaxed max-w-xl font-medium">
                                Our neural engine decomposes every product into its molecular constituents, matching them against your unique clinical markers.
                            </p>
                        </motion.div>

                        {/* <div className="grid gap-6">
                            {[
                                { 
                                    icon: Cpu, 
                                    title: "Scan & Identify", 
                                    desc: "Computer vision localizes products and extracts metadata in real-time.",
                                    color: "text-primary"
                                },
                                { 
                                    icon: Zap, 
                                    title: "Molecular Mapping", 
                                    desc: "Detected nutrients are mapped to 5,000+ clinical studies for risk assessment.",
                                    color: "text-emerald-400"
                                },
                                { 
                                    icon: Shield, 
                                    title: "Precision Outcomes", 
                                    desc: "A final biometric score is calculated, unique only to your DNA profile.",
                                    color: "text-cyan-400"
                                } */}
                            {/* ].map((step, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.15 }}
                                    className="flex items-start gap-6 p-4 rounded-3xl hover:bg-white/5 transition-colors group"
                                >
                                    <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-white/10 transition-all ${step.color}`}>
                                        <step.icon className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">{step.title}</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-400 transition-colors uppercase tracking-wider font-medium">{step.desc}</p>
                                    </div>
                                </motion.div>
                            ))} */}
                        {/* </div> */}
                    </div>
                </div>
            </div>
        </section>
    );
}
