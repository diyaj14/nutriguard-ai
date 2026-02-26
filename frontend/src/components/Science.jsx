import React from 'react';
import { motion } from 'framer-motion';

const points = [
    "Analyzes 50+ genetic markers linked to nutrient metabolism",
    "Cross-references peer-reviewed nutritional studies",
    "Updates recommendations as new research emerges"
];

export function Science() {
    return (
        <section className="py-24 bg-black overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                    >
                        <h2 className="text-5xl md:text-7xl font-heading font-bold text-white mb-10 leading-tight">
                            Most Diets Are <br />
                            <span className="text-primary italic">Generic.</span> <br />
                            Yours Shouldn't Be.
                        </h2>

                        <p className="text-xl md:text-2xl text-gray-400 mb-12 leading-relaxed">
                            Traditional nutrition advice treats everyone the same. But your body processes nutrients differently based on your genetic markers. NutriGuard bridges the gap between nutritional science and personal genomics.
                        </p>

                        <div className="space-y-6">
                            {points.map((point, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    <p className="text-lg md:text-xl text-white font-medium">{point}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-primary/20 blur-[150px] pointer-events-none" />
                        <div className="aspect-square rounded-[3rem] bg-[#0D1117] border border-white/5 overflow-hidden flex flex-col items-center justify-center p-12 relative">
                            {/* AI ENGINE VISUALIZATION */}
                            <div className="relative flex flex-col items-center justify-center">
                                {/* Circular Rings */}
                                <div className="absolute w-[300px] h-[300px] border border-primary/20 rounded-full" />
                                <div className="absolute w-[240px] h-[240px] border border-primary/10 rounded-full" />

                                {/* Central AI Text */}
                                <h3 className="text-[120px] font-black text-primary tracking-tighter leading-none mb-6 relative z-10">AI</h3>

                                {/* Label */}
                                <p className="text-primary/60 font-bold tracking-[0.4em] uppercase text-sm mb-12 relative z-10 text-center">
                                    Nutrigenomics Engine
                                </p>

                                {/* Dots */}
                                <div className="flex gap-4 relative z-10">
                                    {[1, 2, 3, 4, 5].map((dot) => (
                                        <div key={dot} className="w-3 h-3 rounded-full bg-primary/40 shrink-0" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
