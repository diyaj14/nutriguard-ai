import React from 'react';
import { motion } from 'framer-motion';

const stats = [
    { label: 'Accuracy Rate', value: '98%', sub: 'in nutritional matching' },
    { label: 'Products Scanned', value: '10M+', sub: 'and growing daily' },
    { label: 'Instant Results', value: '<2s', sub: 'per scan analysis' },
    { label: 'DNA Markers', value: '50+', sub: 'analyzed per profile' },
];

export function Stats() {
    return (
        <section className="py-24 bg-transparent relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-4 block"
                    >
                        Field-Tested. Science-Backed.
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-heading font-bold text-white tracking-tight"
                    >
                        Numbers That <span className="text-primary">Matter</span>
                    </motion.h2>
                </div>

                <div className="flex overflow-x-auto pb-8 gap-6 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8 snap-x snap-mandatory scroll-smooth no-scrollbar">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card hover:bg-white/5 transition-all p-10 rounded-[2.5rem] flex flex-col items-center justify-center text-center group relative overflow-hidden w-[300px] shrink-0 snap-center"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="text-4xl xs:text-5xl sm:text-7xl font-black text-primary mb-6 tracking-tighter drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] duration-500">
                                {stat.value}
                            </div>
                            <div className="text-xl font-black text-white mb-2 tracking-tight group-hover:text-primary transition-colors">
                                {stat.label}
                            </div>
                            <div className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em] group-hover:text-gray-300 transition-colors">
                                {stat.sub}
                            </div>

                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors"></div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
