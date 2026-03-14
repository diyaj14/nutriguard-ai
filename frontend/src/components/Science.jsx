import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Shield, BrainCircuit, Activity } from 'lucide-react';

const stats = [
    { label: "Genetic Markers", value: "50+", icon: Shield },
    { label: "Data Points", value: "1.2M", icon: BrainCircuit },
    { label: "Accuracy", value: "99.8%", icon: Activity }
];

export function Science() {
    const { scrollYProgress } = useScroll();
    const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);

    return (
        <section className="relative py-32 bg-transparent overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row gap-24 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="lg:w-1/2"
                    >
                        <motion.span
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-black tracking-[0.3em] uppercase mb-8"
                        >
                            Nutrigenomics Core
                        </motion.span>

                        <h2 className="text-6xl md:text-8xl font-black text-[var(--text-main)] mb-10 leading-[0.9] tracking-tighter">
                            YOUR <span className="text-primary">DNA</span> IS THE <br />
                            <span className="opacity-50 italic">BLUEPRINT.</span>
                        </h2>

                        <p className="text-xl md:text-2xl text-[var(--text-secondary)] mb-16 leading-relaxed font-medium">
                            NutriGuard's engine doesn't just read labels. It simulates how your specific genetic profile interacts with biochemical compounds in real-time.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                            {stats.map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--glass-border)] backdrop-blur-xl transition-colors duration-300"
                                >
                                    <stat.icon className="w-8 h-8 text-primary mb-4" />
                                    <div className="text-3xl font-black text-[var(--text-main)] mb-1">{stat.value}</div>
                                    <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        className="lg:w-1/2 relative"
                        style={{ scale }}
                    >
                        {/* THE "BRAIN" VISUAL */}
                        <div className="relative aspect-square max-w-[500px] mx-auto group">
                            <div className="absolute inset-0 bg-primary/20 blur-[150px] group-hover:bg-primary/40 transition-colors duration-700" />
                            <div className="relative h-full w-full rounded-[4rem] bg-[var(--background)] border border-[var(--glass-border)] overflow-hidden flex items-center justify-center p-12 transition-colors duration-300">
                                <div className="text-center">
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.05, 1],
                                            opacity: [0.5, 1, 0.5]
                                        }}
                                        transition={{ duration: 4, repeat: Infinity }}
                                        className="text-[12rem] font-black text-primary leading-none tracking-tighter blur-md absolute inset-0 flex items-center justify-center pointer-events-none"
                                    >
                                        AI
                                    </motion.div>
                                    <h3 className="text-9xl font-black text-[var(--text-main)] relative z-10 tracking-tighter">AI</h3>
                                    <p className="text-primary font-black tracking-[0.6em] uppercase text-xs mt-6 relative z-10">
                                        Clinical Inference Engine
                                    </p>
                                    <div className="mt-12 flex justify-center gap-3">
                                        {[1, 2, 3, 4].map(i => (
                                            <motion.div
                                                key={i}
                                                animate={{ y: [0, -10, 0] }}
                                                transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                                                className="w-2 h-2 rounded-full bg-primary"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

