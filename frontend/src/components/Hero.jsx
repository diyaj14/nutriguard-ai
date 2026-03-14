import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float } from '@react-three/drei';
import { motion, useScroll, useTransform } from 'framer-motion';
import { NeuralFood } from './NeuralFood';
import { ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';

export function Hero({ onStart, onLearnMore }) {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);
    const scale = useTransform(scrollY, [0, 500], [1, 0.8]);

    return (
        <section className="relative min-h-[100svh] flex flex-col justify-center items-center overflow-hidden bg-transparent pt-24 md:pt-0">

            {/* Cinematic Background Elements (Overlays) */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,var(--glow-color)_0%,transparent_60%)]"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)] via-transparent to-[var(--background)]"></div>
            </div>

            {/* Content Overlay */}
            <div className="relative z-20 text-center px-6 w-full max-w-7xl mx-auto flex flex-col items-center">
                <motion.div
                    style={{ y: y1, opacity, scale }}
                    className="flex flex-col items-center"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[var(--card-bg)] border border-[var(--glass-border)] backdrop-blur-2xl mb-12 shadow-2xl"
                    >
                        <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                        <span className="text-sm text-[var(--text-main)] font-bold uppercase tracking-[0.2em]">Next-Gen Health Intelligence</span>
                    </motion.div>

                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-[0.95] tracking-tighter text-[var(--text-main)]">
                        EAT <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-emerald-400 to-cyan-400">SMARTER</span>.<br />
                        LIVE <span className="text-[var(--text-main)]">BETTER</span>.
                    </h1>

                    <p className="text-lg md:text-2xl text-[var(--text-secondary)] mb-16 font-medium leading-relaxed max-w-3xl mx-auto">
                        Your DNA is unique. Your diet should be too. <span className="text-[var(--text-main)] font-bold">NutriGuard AI</span> decodes clinical data to guide every bite you take.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
                        <button
                            onClick={onStart}
                            className="group relative px-10 py-6 bg-primary text-black font-black rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(22,224,160,0.3)]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            <span className="relative flex items-center justify-center gap-3 text-xl">
                                BEGIN ASSESSMENT
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                            </span>
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4"
            >
                <span className="text-[10px] font-black tracking-[0.4em] text-[var(--text-secondary)] opacity-30 uppercase"></span>
                <div className="w-[2px] h-12 bg-gradient-to-b from-primary/50 to-transparent rounded-full overflow-hidden">
                    <motion.div
                        animate={{ y: [0, 48, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-full h-1/4 bg-primary"
                    />
                </div>
            </motion.div>

        </section>
    );
}

